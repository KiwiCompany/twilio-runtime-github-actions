const { getZohoApiKey, getUserFromZoho } = require("./core/zoho_integration");
const { createNewThread } = require("./core/openai_integration");
const first_interact = 'Hola, gracias por comunicarte con M&M Desarrollos, mi nombre es Mia. Puedo proporcionar información sobre apartamentos, casas o inversiones. ¿Cómo puedo ayudarte hoy?'
const error_4000 = 'Hola, gracias por comunicarte con M&M Desarrollos. Actualmente existe un problema tecnico en nuestra plataforma, intente mas tarde.'
const error_4001 = `${error_4000} Error 4001`
const error_4002 = `${error_4000} Error 4002`

/*
    Error codes:
        4001: Error connecting with zoho api
        4002: Error connecting with openai api
*/

exports.handler = async function (context, event, callback) {

    const twiml = new Twilio.twiml.VoiceResponse();
    const zoho_api_key = await getZohoApiKey(context)

    if(!zoho_api_key){
        twiml.say({
            voice: 'Polly.Mia-Neural'
        }, error_4001);
        twiml.hangup()
        return callback(null, twiml);
    }

    let userData = await getUserFromZoho(zoho_api_key, event.Caller)
    let thread_id = null

    if(!userData){
        thread_id = await createNewThread(event, context.OPENAI_API_KEY)
        if(!thread_id) {
            twiml.say({
                voice: 'Polly.Mia-Neural'
            }, error_4002);
            twiml.hangup()
            return callback(null, twiml);
        }
    } else {
        //get thread id from somewhere
    }

    twiml.say({
        voice: 'Polly.Mia-Neural'
    }, first_interact);
    
    twiml.redirect({
        method: 'POST'
    }, `/respond?${new URLSearchParams({ thread_id, zoho_api_key })}`)
    
    return callback(null, twiml);
    
};