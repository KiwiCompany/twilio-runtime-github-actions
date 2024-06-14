const agent_user_data_instructions = 'You can use this JSON to obtain call information like the date of the call, the ID which will be the call_id, the phone number of the caller which will be the caller_number, and other data like the city and state'
const { OpenAI } = require("openai");
const assistant_id = 'asst_hOyzWztfT0yX30pUkB3LHCYQ'

exports.createNewThread = async(event, openai_api_key) => {

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
            }
        ]
    })
    return thread.id;
    
}


exports.streamRun = async(input, thread_id, openai_api_key) => {

    const openai = new OpenAI({ api_key: openai_api_key});
    const run = openai.beta.threads.runs.stream(thread_id, { 
        assistant_id,
        additional_messages:[
            {
                role: "user",
                content: input
            }
        ]
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