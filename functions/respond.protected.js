const { streamRun } = require(Runtime.getFunctions()['core/openai_integration']['path']);
const { _CALL_KEY, _CONVO_KEY } = require(Runtime.getFunctions()['helpers/constants']['path']);
const cache = require(Runtime.getFunctions()['core/cache']['path']);
const logger = require(Runtime.getFunctions()['core/logger']['path']);

exports.handler = async function(context, event, callback) {

    const twiml = new Twilio.twiml.VoiceResponse();

    try {
       
        if(!cache.isInitialized()) await cache.initialize()

        const call_data = await cache.getJson(_CALL_KEY, event.CallSid)
   
        let input = null
        //In case reply from user isnt expected, IA wont ask again andd willl continue with instructions

        if(event.msg){
            input = event.msg
            //Gather ends without reply, IA will ask again
        } else if (event.SpeechResult){
            input = event.SpeechResult
            //Gather ended and catched a text, IA will process it

            cache.pushList(_CONVO_KEY, event.CallSid, 'Contact: '+event.SpeechResult)
            //Save user input in the cache
        }
      
        let aiResponse = await streamRun(input, call_data.thread_id,  context.OPENAI_API_KEY, context.AI_ASSISTANT_ID);
        let response = JSON.parse(aiResponse)

        cache.pushList(_CONVO_KEY, event.CallSid, 'Melissa: '+response.message)

        switch (response.next_action) {

            case 'transfer':
                twiml.say({
                    voice: context.AI_VOICE
                }, response.message);
                logger.info(`Call ${call_data.call_id}: Attempting transfer to ${response.phone_number}`)
                const transferTo = '+584125295840';
                
                cache.setJson(_CALL_KEY, event.CallSid, {
                    ...call_data,
                    ...(response.user_name && {user_name: response.user_name}),
                    ...(response.user_lastname && {user_lastname: response.user_lastname}),
                    ...(response.development_name && {development_name: response.development_name}),
                    ...(response.real_state_advisor_name && {real_state_advisor_name: response.real_state_advisor_name}),
                    ...(response.real_state_advisor_id && {real_state_advisor_id: response.real_state_advisor_id}),
                })
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
        console.log(er);
        twiml.say({voice: context.AI_VOICE}, er.message);
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

