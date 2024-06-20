const { OpenAI } = require("openai");
const { agent_user_data_instructions, agent_rol_de_guardias_instructions } = require(Runtime.getFunctions()['helpers/ai_instructions']['path']);
const logger = require(Runtime.getFunctions()['core/logger']['path']);
const { tech_error } = require(Runtime.getFunctions()['helpers/ai_errors']['path']);


exports.createNewThread = async(call_data, openai_api_key, rol_de_guardias) => {

    try {
        const openai = new OpenAI({ api_key: openai_api_key});
        let thread = await openai.beta.threads.create({
            messages: [
                {
                    "role": "assistant",
                    "content": `${JSON.stringify(call_data)}. ${agent_user_data_instructions}`
                },
                {
                    "role": "assistant",
                    "content": `${JSON.stringify(rol_de_guardias)}. ${agent_rol_de_guardias_instructions}`
                }
            ]
        })
        return thread.id;
    } catch (er) {
        logger.error(`Couldn't generate openai thread`);
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
        return message;

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
                return assistant_text
            }
        }

    } catch (er) {
        logger.error(`Couldn't stream AI response`);
        throw new Error(tech_error)
    }

}