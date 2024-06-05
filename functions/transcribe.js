exports.handler = function(context, event, callback) {
    const twiml = new Twilio.twiml.VoiceResponse();
    let convo = event.convo || '';
    // If no previous conversation is present, start the conversation
    if(!convo) {
        twiml.say({
            voice: 'Polly.Mia-Neural'
        }, 'Hey, mi nombre es Mia, como puedo ayudarte?');
        convo += 'Mia: Hey, mi nombre es Mia, como puedo ayudarte?'
    }
 
    // Listen to user response and pass input to /respond
    const params = new URLSearchParams({ convo: convo });
    twiml.gather({
        enhanced: "true",
        speechTimeout: 'auto',
        speechModel: "phone_call",
        input: 'speech',
        action:`/respond?${params}`,
    })
 
    return callback(null, twiml);
 };
