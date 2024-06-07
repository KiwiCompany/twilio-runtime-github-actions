const { OpenAI } = require("openai");

const assistant_id = 'asst_hOyzWztfT0yX30pUkB3LHCYQ'


exports.handler = async function(context, event, callback) {
    const openai = new OpenAI({ api_key: context.OPENAI_API_KEY});
    const twiml = new Twilio.twiml.VoiceResponse();
    console.log(callback);
    console.log(event);
    //Receive the thread ID from transcribe
    let thread_id = event.thread_id
    // if(!thread_id){
    //     let _thread = await openai.beta.threads.create();
    //     thread_id = _thread.thread_id
    // }
    //Receive the transcribed request from the user
    let voiceInput = event.SpeechResult;
    //Call the function to interact with AI and get the response from assistant
    const { 
        aiResponse
    } = await generateAIResponse(voiceInput);
    //Make user listen the response
    const say = twiml.say({
        voice: 'Polly.Mia-Neural'
    }, aiResponse);
    //Put the thread ID in params to send to transcribe
    const params = new URLSearchParams({ thread_id: thread_id });
    //Now transcribe will listen to user to get the next user request
    twiml.redirect({
        method: 'POST'
    }, `/transcribe?${params}`);

    return callback(null, twiml);

    async function generateAIResponse(voiceInput) {
        //Send the transcribed message to OPENAI and insert in the generated thread ID
        await openai.beta.threads.messages.create(
            thread_id,
            {  
                role: "user",  
                content: voiceInput,
            }
        );
        //Set the assistant to work with and process the last message in order to get an AI response
        let run = await openai.beta.threads.runs.createAndPoll(
            thread_id,
            { 
                assistant_id
            }
        );
        //Get the latest messages, get the last one and return in order to make Twilio sppeech it to user
        if (run.status == 'completed') {
            const messages = await openai.beta.threads.messages.list(thread_id);
            return {
                aiResponse: messages.getPaginatedItems()[0]['content'][0]['text']['value'], 
                thread_id
            }
        }

    }
};
