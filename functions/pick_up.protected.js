const { getZohoApiKey, getAvailableAgents } = require(Runtime.getFunctions()['core/zoho_integration']['path']);
const { createNewThread } = require(Runtime.getFunctions()['core/openai_integration']['path']);
const logger = require(Runtime.getFunctions()['core/logger']['path']);
const { _ZOHO_API_KEY, _THREAD_ID } = require(Runtime.getFunctions()['helpers/constants']['path']);
const MyCache = require(Runtime.getFunctions()['core/memory']['path']);


exports.handler = async function (context, event, callback) {
    
    const twiml = new Twilio.twiml.VoiceResponse();

    try {

        const zoho_api_key = await getZohoApiKey(context)
        const agents = await getAvailableAgents(zoho_api_key)
        const thread_id = await createNewThread(event, context.OPENAI_API_KEY, agents); 

        MyCache.set(_THREAD_ID, thread_id)
        MyCache.set(_ZOHO_API_KEY, zoho_api_key)

        twiml.redirect({
            method: 'POST'
        }, `/respond`)

        return callback(null, twiml);

    } catch (er) {

        twiml.say({ voice: context.AI_VOICE }, er.message);
        twiml.hangup();

        return callback(null, twiml);

    }
    
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
