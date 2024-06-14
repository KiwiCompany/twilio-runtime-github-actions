exports.handler = async function (context, event, callback) {
    const twiml = new Twilio.twiml.VoiceResponse();
    let thread_id = event.thread_id; 
    let zoho_api_key = event.zoho_api_key

    twiml.gather({
        enhanced: "true",
        speechTimeout: 1,
        language: 'es-MX',
        speechModel: "phone_call",
        input: 'speech',
        action:`/respond?${new URLSearchParams({ thread_id, zoho_api_key })}`,
    })

    return callback(null, twiml);
};