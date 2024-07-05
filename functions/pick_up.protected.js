const { 
    getZohoApiKey, 
    getAvailableAgents, 
    getContactByPhoneNumber, 
    getUserFromZoho 
} = require(Runtime.getFunctions()['core/zoho_integration']['path']);
const { 
    createNewThread, 
    addAssistantInstruction 
} = require(Runtime.getFunctions()['core/openai_integration']['path']);
const { _CALL_KEY } = require(Runtime.getFunctions()['helpers/constants']['path']);
const cache = require(Runtime.getFunctions()['core/cache']['path']);
const logger = require(Runtime.getFunctions()['core/logger']['path']);

exports.handler = async function (context, event, callback) {

    const twiml = new Twilio.twiml.VoiceResponse();

    try {

        const call_data = {
            caller_country: event.CallerCountry,
            caller_state: event.CallerState,
            caller_city: event.CallerCity,
            call_id: event.CallSid,
            caller_number: event.Caller,
            date: new Date().toDateString()
        }
        
        await cache.initialize()
        let thread_id = null
        const zoho_api_key = await getZohoApiKey(context)
        const contact = await getContactByPhoneNumber(zoho_api_key, '+525590354545')

        if(contact){
            const agent = await getUserFromZoho(zoho_api_key, contact.Owner.id)
            thread_id = contact.IA_Thread_ID
            let instruction = `You just received a new call, this is not the first call from this customer, the name of the customer is ${contact.Full_Name}, the name of the real estate advisor assigned is ${agent.full_name} and the phone number of the real estate advisor assigned is ${agent.mobile}.`
            await addAssistantInstruction(instruction, context.OPENAI_API_KEY, thread_id)
        } else {
            const agents = await getAvailableAgents(zoho_api_key)
            thread_id = await createNewThread(call_data, context.OPENAI_API_KEY, agents); 
        }
       
        cache.setJson(_CALL_KEY, event.CallSid, {
            ...call_data,
            zoho_api_key,
            thread_id
        })
        logger.info('Call information: ', call_data);
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