const { OpenAI } = require("openai");

exports.handler = async function (context, event, callback) {
    const openai = new OpenAI({ api_key: context.OPENAI_API_KEY});
    const twiml = new Twilio.twiml.VoiceResponse();
    const firstInteract = 'Hola, gracias por comunicarte con M&M Desarrollos, mi nombre es Mia, puedo proveer informacion acerca de apartamentos, casas o inversiones, como puedo ayudarte hoy?'

    let thread_id = event.thread_id || ''; 

    const callInfo = {
        caller_country: event.CallerCountry,
        caller_state: event.CallerState,
        caller_city: event.CallerCity,
        call_id: event.CallSid,
        caller_number: event.Caller,
        date: new Date().toDateString()
    }
    console.log(callInfo);
    if(!thread_id) {
        const thread = await openai.beta.threads.create({
            messages: [
                {
                    "role": "assistant",
                    "content": JSON.stringify(callInfo)+". You can use this JSON to obtain call information like the date of the call, the ID which will be the call_id, the phone number of the caller which will be the caller_number, and other data like the city and state"
                },
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
    const params = new URLSearchParams({ thread_id: thread_id });

    twiml.gather({
        enhanced: "true",
        speechTimeout: 0.5,
        language: 'es-MX',
        speechModel: "phone_call",
        input: 'speech',
        action:`/respond?${params}`,
    })

    return callback(null, twiml);
};