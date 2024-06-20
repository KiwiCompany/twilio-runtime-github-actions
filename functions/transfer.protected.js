const { addAssistantInstruction } = require(Runtime.getFunctions()['core/openai_integration']['path']);
const { busy_instruction, no_answer_instruction, failed_instruction } = require(Runtime.getFunctions()['helpers/ai_instructions']['path']);
const MyCache = require(Runtime.getFunctions()['core/memory']['path']);
const logger = require(Runtime.getFunctions()['core/logger']['path']);
const { _THREAD_ID, _CALL_DATA } = require(Runtime.getFunctions()['helpers/constants']['path']);

exports.handler = async function (context, event, callback) {

    const twiml = new Twilio.twiml.VoiceResponse();

    try {

        const thread_id = MyCache.get(_THREAD_ID)
        const call_data = MyCache.get(_CALL_DATA)

        switch (event.DialCallStatus) {
            case 'busy':
                await addAssistantInstruction(busy_instruction, context.OPENAI_API_KEY, thread_id)
                logger.error(`Call ${call_data.call_id}: failed transfer because target was busy`)
                twiml.redirect({
                    method: 'POST'
                }, `/respond`)
                break;

            case 'no-answer':
                await addAssistantInstruction(no_answer_instruction, context.OPENAI_API_KEY, thread_id)
                logger.error(`Call ${call_data.call_id}: failed transfer because called party did not pick up`)
                twiml.redirect({
                    method: 'POST'
                }, `/respond`)
                break;

            case 'failed':
                await addAssistantInstruction(failed_instruction, context.OPENAI_API_KEY, thread_id)
                logger.error(`Call ${call_data.call_id}: failed transfer because probably non-existent phone number`)
                twiml.redirect({
                    method: 'POST'
                }, `/respond`)
                break;
    
            default:
                logger.error(`Call ${call_data.call_id}: completed transfer`)
                twiml.hangup()
                break;
                
        }

        return callback(null, twiml);

    } catch (er) {
    
        twiml.say({voice: context.AI_VOICE}, er);
        twiml.hangup()

        return callback(null, twiml);
    
    }

}