const { getZohoApiKey, getUserFromZoho, getContactFromZoho, getRolDeGuardias } = require(Runtime.getFunctions()['core/zoho_integration']['path']);
const { createNewThread } = require(Runtime.getFunctions()['core/openai_integration']['path']);
const MyCache = require(Runtime.getFunctions()['core/memory']['path']);
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
    const rol_de_guardias = await getRolDeGuardias(zoho_api_key)


    if(!zoho_api_key){
        twiml.say({
            voice: 'Polly.Mia-Neural'
        }, error_4001);
        twiml.hangup()
        return callback(null, twiml);
    }

    // let user_data = await getContactFromZoho(zoho_api_key, '5525033513')
    // let thread_id = null

    // if(!user_data){
    //     thread_id = await createNewThread(event, context.OPENAI_API_KEY)
    //     if(!thread_id) {
    //         twiml.say({
    //             voice: 'Polly.Mia-Neural'
    //         }, error_4002);
    //         twiml.hangup()
    //         return callback(null, twiml);
    //     }
    // } else {
    //     let owner = await getUserFromZoho(zoho_api_key, user_data.Owner.id)
    //     thread_id = user_data.Thread_Id
    // }

    let thread_id = event.thread_id || await createNewThread(event, context.OPENAI_API_KEY, rol_de_guardias); 

    twiml.redirect({
        method: 'POST'
    }, `/respond?${new URLSearchParams({ thread_id, zoho_api_key })}`)

    return callback(null, twiml);
    
};