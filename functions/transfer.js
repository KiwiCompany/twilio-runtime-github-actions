const { addAssistantInstruction } = require(Runtime.getFunctions()['core/openai_integration']['path']);
const busy_instruction = 'The call failed because the phone was busy, inform to user in your next interaction, and offer options like, try to call again, try to call the sales manager, or try again later'
const no_answer_instruction = 'The call failed because the phone was not answered, inform to user in your next interaction, and offer options like, try to call again, try to call the sales manager, or try again later'
const failed_instruction = 'The call failed because there was a technical issue, inform to user in your next interaction, if the call recipient was not the sales manager offer to transfer to sales manager, otherwise tell to user to try later'

exports.handler = async function (context, event, callback) {
    const twiml = new Twilio.twiml.VoiceResponse();
    const thread_id = event.thread_id
    const zoho_api_key = event.zoho_api_key
    const params = new URLSearchParams({ thread_id: thread_id, zoho_api_key });
    switch (event.DialCallStatus) {
        case 'busy':
            await addAssistantInstruction(busy_instruction, context.OPENAI_API_KEY, thread_id)
            twiml.redirect({
                method: 'POST'
            }, `/respond?${params}`)
            break;

        case 'no-answer':
            await addAssistantInstruction(no_answer_instruction, context.OPENAI_API_KEY, thread_id)
            twiml.redirect({
                method: 'POST'
            }, `/respond?${params}`)
            break;

        case 'failed':
            await addAssistantInstruction(failed_instruction, context.OPENAI_API_KEY, thread_id)
            twiml.redirect({
                method: 'POST'
            }, `/respond?${params}`)
            break;
    
        default:
            twiml.hangup()
            break;
    }

    return callback(null, twiml);

};