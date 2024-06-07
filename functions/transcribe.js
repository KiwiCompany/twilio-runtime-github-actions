const { OpenAI } = require("openai");

exports.handler = async function (context, event, callback) {
    const openai = new OpenAI({ api_key: context.OPENAI_API_KEY});
    const twiml = new Twilio.twiml.VoiceResponse();
    const firstInteract = 'Hola, mi nombre es Mia, como puedo ayudarte?'

    let thread_id = event.thread_id || ''; 
    if(!thread_id) {
        const thread = await openai.beta.threads.create({
            messages: [
                {
                    "role": "assistant",
                    "content": firstInteract
                }
            ]
        })
        thread_id = thread.id;
        twiml.say({
            voice: 'Polly.Mia-Neural'
        }, firstInteract);
    }

    twiml.record({
        timeout: 2,
        transcribe: true
    });

    return callback(null, twiml);
};