const { streamRun } = require(Runtime.getFunctions()['core/openai_integration']['path']);
const { _THREAD_ID } = require(Runtime.getFunctions()['helpers/constants']['path']);
const { c_100, c_101 } = require(Runtime.getFunctions()['helpers/ai_actions']['path']);
const MyCache = require(Runtime.getFunctions()['core/memory']['path']);

exports.handler = async function(context, event, callback) {
   
    const twiml = new Twilio.twiml.VoiceResponse();
    const thread_id = MyCache.get(_THREAD_ID)

    let aiResponse = await streamRun(event.SpeechResult, thread_id,  context.OPENAI_API_KEY, context.AI_ASSISTANT_ID);

    if(aiResponse.includes(c_100)){
        twiml.say({
            voice: context.AI_VOICE
        }, aiResponse.split(c_100)[0]);
        console.log("Transfer to: "+aiResponse.split(c_100)[1].trim());
        const transferTo = '+584125295840';
        twiml.dial({
            action:`/transfer`,
            ringTone:'es'
        }, transferTo)
    } else if(aiResponse.includes(c_101)){
        twiml.say({
            voice: context.AI_VOICE
        }, aiResponse.replace(c_101, ''));
        twiml.hangup()
    } else {
        twiml.say({
            voice: context.AI_VOICE
        }, aiResponse);
        twiml.redirect({
            method: 'POST'
        }, `/listen`)
    }

    return callback(null, twiml);

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