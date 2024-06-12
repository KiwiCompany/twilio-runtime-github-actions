const { OpenAI } = require("openai");
const { getZohoApiKey } = require("./zoho_integration");
const AGENT_USER_DATA_INSTRUCTIONS = 'You can use this JSON to obtain call information like the date of the call, the ID which will be the call_id, the phone number of the caller which will be the caller_number, and other data like the city and state'
const FIRST_INTERACT = 'Hola, gracias por comunicarte con M&M Desarrollos, mi nombre es Mia. Puedo proporcionar información sobre apartamentos, casas o inversiones. ¿Cómo puedo ayudarte hoy?'
const ERROR_4001 = 'Hola, gracias por comunicarte con M&M Desarrollos, mi nombre es Mia. Actualmente existe un problema tecnico en nuestra plataforma, intente mas tarde. Error 4001'

/*
    Error codes:
        4001: Error connecting with zoho api
*/



exports.handler = async function (context, event, callback) {
    const openai = new OpenAI({ api_key: context.OPENAI_API_KEY});
    const twiml = new Twilio.twiml.VoiceResponse();
    let thread_id = event.thread_id || ''; 
    let ZOHO_API_KEY = event.ZOHO_API_KEY || await getZohoApiKey(context); 
    const callInfo = {
        caller_country: event.CallerCountry,
        caller_state: event.CallerState,
        caller_city: event.CallerCity,
        call_id: event.CallSid,
        caller_number: event.Caller,
        date: new Date().toDateString()
    }

    if(!ZOHO_API_KEY){
        twiml.say({
            voice: 'Polly.Mia-Neural'
        }, ERROR_4001);
        twiml.hangup()
        return callback(null, twiml);
    }

    if(!thread_id) {
        const thread = await openai.beta.threads.create({
            messages: [
                {
                    "role": "assistant",
                    "content": `${JSON.stringify(callInfo)}. ${AGENT_USER_DATA_INSTRUCTIONS}`
                }
            ]
        })
        thread_id = thread.id;
        twiml.say({
            voice: 'Polly.Mia-Neural'
        }, FIRST_INTERACT);
    }
    
    const params = new URLSearchParams({ thread_id: thread_id, ZOHO_API_KEY });

    twiml.gather({
        enhanced: "true",
        speechTimeout: 1,
        language: 'es-MX',
        speechModel: "phone_call",
        input: 'speech',
        action:`/respond?${params}`,
    })

    return callback(null, twiml);
    
};