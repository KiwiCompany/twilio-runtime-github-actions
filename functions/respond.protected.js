const { streamRun } = require(Runtime.getFunctions()['core/openai_integration']['path']);
const { _THREAD_ID } = require(Runtime.getFunctions()['helpers/constants']['path']);
const MyCache = require(Runtime.getFunctions()['core/memory']['path']);
const logger = require(Runtime.getFunctions()['core/logger']['path']);

exports.handler = async function(context, event, callback) {

    const twiml = new Twilio.twiml.VoiceResponse();

    try {

        const thread_id = MyCache.get(_THREAD_ID)
        const call_data = MyCache.get(_CALL_DATA)
        
        let aiResponse = await streamRun(event.SpeechResult, thread_id,  context.OPENAI_API_KEY, context.AI_ASSISTANT_ID);
        let response = JSON.parse(aiResponse)
    
        switch (response.next_action) {
            case 'transfer':
                twiml.say({
                    voice: context.AI_VOICE
                }, response.message);

                logger.info(`Call ${call_data.CallSid}: Attempting transfer to ${response.phone_number}`)
                const transferTo = '+584125295840';
            
                twiml.dial({
                    action:`/transfer`,
                    ringTone:'es'
                }, transferTo)
                break;
            
            case 'hangup':
                twiml.say({
                    voice: context.AI_VOICE
                }, response.message);
                twiml.hangup()
                break;
            
            default:
                twiml.say({
                    voice: context.AI_VOICE
                }, response.message);
                twiml.redirect({
                    method: 'POST'
                }, `/listen`)
                break;
        }
    
        return callback(null, twiml);
         
    } catch (er) {

        twiml.say({voice: context.AI_VOICE}, er);
        twiml.hangup()

        return callback(null, twiml);

    }

};




    // FOR FUTURE SPRINTS

    // let zoho_user_data = { 
    //     user_firstname: null,
    //     user_business: null,
    //     user_email: null
    // }

    // if(aiResponse.includes('zoho_user_data')){
    //     let data_from_text = str.substring(
    //         str.indexOf("{") + 1, 
    //         str.lastIndexOf("}")
    //     );
    //     zoho_user_data = Object.assign(zoho_user_data, JSON.parse(`{${data_from_text}}`))
    //     aiResponse = aiResponse.split('{')[0]
    // }