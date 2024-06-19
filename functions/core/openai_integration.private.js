const { OpenAI } = require("openai");
const { agent_user_data_instructions, agent_rol_de_guardias_instructions } = require(Runtime.getFunctions()['helpers/ai_instructions']['path']);
const { tech_error } = require(Runtime.getFunctions()['helpers/ai_errors']['path']);
const logger = require(Runtime.getFunctions()['core/logger']['path']);

exports.createNewThread = async(event, openai_api_key, rol_de_guardias) => {

    try {
        const openai = new OpenAI({ api_key: openai_api_key});
        const data = {
            caller_country: event.CallerCountry,
            caller_state: event.CallerState,
            caller_city: event.CallerCity,
            call_id: event.CallSid,
            caller_number: event.Caller,
            date: new Date().toDateString()
        }
        let thread = await openai.beta.threads.create({
            messages: [
                {
                    "role": "assistant",
                    "content": `${JSON.stringify(data)}. ${agent_user_data_instructions}`
                },
                {
                    "role": "assistant",
                    "content": `${JSON.stringify(rol_de_guardias)}. ${agent_rol_de_guardias_instructions}`
                }
            ]
        })
        return {
            data: thread.id
        };
    } catch (er) {
        logger.error(`Couldn't generate openai thread id`);
        throw new Error(tech_error)
    }
    
}

exports.addAssistantInstruction = async(input, openai_api_key, thread_id) => {
    try {

        const openai = new OpenAI({ api_key: openai_api_key});
        const message = await openai.beta.threads.messages.create(
            thread_id,
            {
                role: "assistant",
                content: input
            }
        );

        return {
            data: message
        }

    } catch (er) {

        logger.error(`Couldn't add instruction to assistant`);
        throw new Error(tech_error)

    }
    
}

exports.streamRun = async(input, thread_id, openai_api_key, assistant_id) => {

    try {
        const openai = new OpenAI({ api_key: openai_api_key});
        const run = openai.beta.threads.runs.stream(thread_id, { 
            assistant_id,
            ...(input ? { additional_messages: [{ role: "user", content: input }] } : {}),
        });

        let assistant_text = '';

        for await (const event of run) {
            if(event.event === 'thread.message.completed'){
                assistant_text += event.data.content[0].text.value;
            }
            if(event.event === 'thread.run.completed'){
                return {
                    hangup: false,
                    data: assistant_text
                }
            }
        }
        
    } catch (er) {
        logger.error(`Couldn't stream AI response`);
        throw new Error(tech_error)
    }
    
    // return new Promise((resolve, reject) => {
    //     let textChunks = [];
    //     run.on('textDelta', (textDelta) => {
    //         textChunks.push(textDelta.value);
    //     })
    //     .on('error', (error) => {
    //         reject(error); 
    //     })
    //     .on('end', async () => {
    //         resolve(textChunks.join(''));
    //     })
    // });
}