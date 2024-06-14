const { streamRun } = require("./core/openai_integration");

exports.handler = async function(context, event, callback) {
   
    const twiml = new Twilio.twiml.VoiceResponse();
    const thread_id = event.thread_id
    const zoho_api_key = event.zoho_api_key

    let zoho_user_data = { 
        user_firstname: null,
        user_lastname: null,
        user_business: null,
        user_email: null
    }

    let aiResponse = await streamRun(event.SpeechResult, thread_id,  context.OPENAI_API_KEY);

    const params = new URLSearchParams({ thread_id: thread_id, zoho_api_key });
    
    if(aiResponse.includes('zoho_user_data')){
        let data_from_text = str.substring(
            str.indexOf("{") + 1, 
            str.lastIndexOf("}")
        );
        zoho_user_data = Object.assign(zoho_user_data, JSON.parse(`{${data_from_text}}`))
        aiResponse = aiResponse.split('{')[0]
    }

    if(aiResponse.includes('code_100')){
        twiml.say({
            voice: 'Polly.Mia-Neural'
        }, aiResponse.replace('code_100', ''));
        const transferTo = '+584125295840';
        twiml.dial({
            action:`/transfer?${new URLSearchParams({})}`
        }, transferTo)
    } else if(aiResponse.includes('code_101')){
        twiml.say({
            voice: 'Polly.Mia-Neural'
        }, aiResponse.replace('code_101', ''));
        twiml.hangup()
    } else {
        twiml.say({
            voice: 'Polly.Mia-Neural'
        }, aiResponse);
        twiml.redirect({
            method: 'POST'
        }, `/listen?${params}`)
    }

    return callback(null, twiml);

};
