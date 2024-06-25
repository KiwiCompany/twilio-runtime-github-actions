exports.handler = async function (context, event, callback) {

    const twiml = new Twilio.twiml.VoiceResponse();

    twiml.gather({
        enhanced: "true",
        speechTimeout: 1.5,
        language: 'es-MX',
        speechModel: "phone_call",
        input: 'speech',
        action:`/respond`,
        actionOnEmptyResult: true
    })

    return callback(null, twiml);

};