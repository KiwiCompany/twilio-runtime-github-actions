const { getZohoApiKey, getRolDeGuardias, getActiveUsers } = require(Runtime.getFunctions()['core/zoho_integration']['path']);
const { createNewThread } = require(Runtime.getFunctions()['core/openai_integration']['path']);
const { error_4000, error_4001, error_4002 } = require(Runtime.getFunctions()['helpers/ai_errors']['path']);
const logger = require(Runtime.getFunctions()['core/logger']['path']);
const { _ZOHO_API_KEY, _THREAD_ID } = require(Runtime.getFunctions()['helpers/constants']['path']);
const MyCache = require(Runtime.getFunctions()['core/memory']['path']);


exports.handler = async function (context, event, callback) {

    logger.info('hello papertrailss');
    
    const twiml = new Twilio.twiml.VoiceResponse();

    const zoho_api_key = await getZohoApiKey(context)
   
    const [ rol_de_guardias, active_users ] = await Promise.all([ getRolDeGuardias(zoho_api_key), getActiveUsers(zoho_api_key) ])

    let agents = active_users.map(x => {
        let data_from_rol_de_guardia = rol_de_guardias.find(y => x.id === y.Owner.id)
        let newData = {
            name: `${x.first_name} ${x.last_name}`,
            phone: x.mobile,
            ...(data_from_rol_de_guardia ? {development: data_from_rol_de_guardia.Desarrollos} : {}),
            role: x.role
        }
        return newData
    })

    const thread_id = await createNewThread(event, context.OPENAI_API_KEY, agents); 
    
    MyCache.set(_THREAD_ID, thread_id)
    MyCache.set(_ZOHO_API_KEY, zoho_api_key)

    if(!zoho_api_key){
        twiml.say({
            voice: context.AI_VOICE
        }, error_4001);
        twiml.hangup()
        return callback(null, twiml);
    }

    twiml.redirect({
        method: 'POST'
    }, `/respond`)

    return callback(null, twiml);
    
};







    // FOR FUTURE SPRINTS

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
