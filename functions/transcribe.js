const { OpenAI } = require("openai");

exports.handler = async function(context, event, callback) {
    const openai = new OpenAI({ api_key: context.OPENAI_API_KEY});
    const twiml = new Twilio.twiml.VoiceResponse();
    const firstInteract = 'Hola, mi nombre es Mia, como puedo ayudarte?'

    //Here starts, when new call it will set thread as empty, but later it will receive from respond so the convo will continue
    let thread_id = event.thread_id || ''; 
    if(!thread_id) {
        //Create a new thread to talk with the AI
         const thread = await openai.beta.threads.create({
            messages: [
                {
                    "role": "assistant",
                    "content": firstInteract
                }
            ]
        })
        thread_id = thread.id;
        console.log(thread_id);
        //The assistant will say something to generate a convo
        twiml.say({
            voice: 'Polly.Mia-Neural'
        }, firstInteract);

    }
    //Set the thread id as param to send in the url later
    const params = new URLSearchParams({ thread_id: thread_id });
    //Listen what person says and transcribe
    twiml.gather({
        enhanced: "true",
        speechTimeout: 'auto',
        speechModel: "phone_call",
        input: 'speech',
        action:`/respond?${params}`,
    })
    //Send the transcription with thread ID to the other function
    return callback(null, twiml);
 };
