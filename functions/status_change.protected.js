const { _CALL_KEY, _CONVO_KEY } = require(Runtime.getFunctions()['helpers/constants']['path']);
const { createContactInZoho, getDealsOfContact, saveConvoInDeal } = require(Runtime.getFunctions()['core/zoho_integration']['path']);
const { addAssistantInstruction } = require(Runtime.getFunctions()['core/openai_integration']['path']);
const cache = require(Runtime.getFunctions()['core/cache']['path']);
const logger = require(Runtime.getFunctions()['core/logger']['path']);

exports.handler = async function(context, event, callback) {
	if(event.CallStatus === 'completed'){
    	const twiml = new Twilio.twiml.VoiceResponse();
    	try {
    	    if(!cache.isInitialized()) await cache.initialize()
    	    const call_data = await cache.getJson(_CALL_KEY, event.CallSid)
			if(!call_data) throw new Error('Call data not found in cache')

			await addAssistantInstruction('The call finished, in the next call, start a conversation from zero.', context.OPENAI_API_KEY, call_data.thread_id)

			if(call_data.save_in_crm){
				const convo = await cache.getList(_CONVO_KEY, event.CallSid)
				const convoText = convo.join('\n\n')
				let deal = await getDealsOfContact(call_data.zoho_api_key, call_data.contact_id)
				await saveConvoInDeal(call_data.zoho_api_key, deal.id, convoText) 
				return callback(null, { message: 'Successfully processed!' }); 
			} else {
				return callback(null, { message: 'Nothing to save!' });
			}
				
    	} catch (er) {
    	    logger.error(`Couldn't save info into the CRM`, er);
    	    twiml.say({voice: context.AI_VOICE}, er.message);
    	    twiml.hangup()

    	    return callback(null, twiml);
    	}
	}
};