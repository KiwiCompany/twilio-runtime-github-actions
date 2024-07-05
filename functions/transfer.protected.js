const { addAssistantInstruction } = require(Runtime.getFunctions()['core/openai_integration']['path']);
const { busy_instruction, no_answer_instruction, failed_instruction } = require(Runtime.getFunctions()['helpers/ai_instructions']['path']);
const cache = require(Runtime.getFunctions()['core/cache']['path']);
const logger = require(Runtime.getFunctions()['core/logger']['path']);
const { _CALL_KEY, _CONVO_KEY } = require(Runtime.getFunctions()['helpers/constants']['path']);

exports.handler = async function (context, event, callback) {

    const twiml = new Twilio.twiml.VoiceResponse();

    try {

        if(!await cache.isInitialized()) await cache.initialize()

        const call_data = await cache.getJson(_CALL_KEY, event.CallSid)
      
        switch (event.DialCallStatus) {
            
            case 'completed':
                logger.info(`Call ${call_data.call_id}: completed transfer to ${call_data.caller_number}`)
                twiml.hangup()
                break;

            case 'busy':
                await addAssistantInstruction(busy_instruction, context.OPENAI_API_KEY, call_data.thread_id)
                logger.error(`Call ${call_data.call_id}: failed transfer to ${call_data.caller_number} because target was busy`)
                twiml.redirect({
                    method: 'POST'
                }, `/respond`)
                break;

            case 'no-answer':
                await addAssistantInstruction(no_answer_instruction, context.OPENAI_API_KEY, call_data.thread_id)
                logger.error(`Call ${call_data.call_id}: failed transfer to ${call_data.caller_number} because called party did not pick up`)
                twiml.redirect({
                    method: 'POST'
                }, `/respond`)
                break;

            case 'failed':
                await addAssistantInstruction(failed_instruction, context.OPENAI_API_KEY, call_data.thread_id)
                logger.error(`Call ${call_data.call_id}: failed transfer to ${call_data.caller_number} because probably non-existent phone number`)
                twiml.redirect({
                    method: 'POST'
                }, `/respond`)
                break;
         
            case 'canceled':
                await addAssistantInstruction(failed_instruction, context.OPENAI_API_KEY, call_data.thread_id)
                logger.error(`Call ${call_data.call_id}: failed transfer to ${call_data.caller_number} because called party cancelled call.`)
                twiml.redirect({
                    method: 'POST'
                }, `/respond`)
                break;
    
            default:
                await addAssistantInstruction(failed_instruction, context.OPENAI_API_KEY, call_data.thread_id)
                logger.error(`Call ${call_data.call_id}: failed transfer to ${call_data.caller_number} due to unknown reason`)
                twiml.redirect({
                    method: 'POST'
                }, `/respond`)
                break;
             
        }

        return callback(null, twiml);

    } catch (er) {
        console.log(er);
        twiml.say({voice: context.AI_VOICE}, er.message);
        twiml.hangup()

        return callback(null, twiml);
    
    }

}