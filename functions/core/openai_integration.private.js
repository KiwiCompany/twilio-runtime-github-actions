const { OpenAI } = require("openai");
const os = require('os');
const winston = require('winston');
require('winston-syslog');
const { agent_user_data_instructions, agent_rol_de_guardias_instructions } = require(Runtime.getFunctions()['helpers/ai_instructions']['path']);

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
        return thread.id;
    } catch (er) {
        const papertrail = new winston.transports.Syslog({
            host: 'logs6.papertrailapp.com',
            port: 26779,
            protocol: 'tls4',
            localhost: os.hostname(),
            eol: '\n',
        });
        const logger = winston.createLogger({
            format: winston.format.simple(),
            levels: winston.config.syslog.levels,
            transports: [papertrail],
        });
       

        try {
            logger.info(er.message);
            console.log('object');
            // If no errors are thrown and you see "Test message..." in the console, the logger likely works.
          } catch (error) {
            console.error('Error creating logger:', error);
          }
    }
    
}

exports.addAssistantInstruction = async(input, openai_api_key, thread_id) => {

    const openai = new OpenAI({ api_key: openai_api_key});
    const message = await openai.beta.threads.messages.create(
        thread_id,
        {
            role: "assistant",
            content: input
        }
    );
    return message;
    
}

exports.streamRun = async(input, thread_id, openai_api_key, assistant_id) => {

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