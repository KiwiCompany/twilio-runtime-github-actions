const { addAssistantInstruction } = require(Runtime.getFunctions()['core/openai_integration']['path']);
const { busy_instruction, no_answer_instruction, failed_instruction } = require(Runtime.getFunctions()['helpers/ai_instructions']['path']);
const { _THREAD_ID } = require(Runtime.getFunctions()['helpers/constants']['path']);
const MyCache = require(Runtime.getFunctions()['core/memory']['path']);

exports.handler = async function (context, event, callback) {

    const twiml = new Twilio.twiml.VoiceResponse();
    const thread_id = MyCache.get(_THREAD_ID)

    switch (event.DialCallStatus) {
        case 'busy':
            await addAssistantInstruction(busy_instruction, context.OPENAI_API_KEY, thread_id)
            twiml.redirect({
                method: 'POST'
            }, `/respond`)
            break;

        case 'no-answer':
            await addAssistantInstruction(no_answer_instruction, context.OPENAI_API_KEY, thread_id)
            twiml.redirect({
                method: 'POST'
            }, `/respond`)
            break;

        case 'failed':
            await addAssistantInstruction(failed_instruction, context.OPENAI_API_KEY, thread_id)
            twiml.redirect({
                method: 'POST'
            }, `/respond`)
            break;
    
        default:
            twiml.hangup()
            break;
    }

    return callback(null, twiml);

};