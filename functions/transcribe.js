const { OpenAI } = require("openai");

exports.handler = async function(context, event, callback) {
    const openai = new OpenAI({ api_key: context.OPENAI_API_KEY});
    const twiml = new Twilio.twiml.VoiceResponse();
    const firstInteract = 'Hola, mi nombre es Mia, como puedo ayudarte?'
    console.log('starts file');
    //Here starts, when new call it will set thread as empty, but later it will receive from respond so the convo will continue
    let thread_id = event.thread_id || ''; 
    if(!thread_id) {
        //Create a new thread to talk with the AI
         const thread = await openai.beta.threads.create({
            messages: [
                {
                    "role": "assistant",
                    "content": firstInteract
                }
            ]
        })
        thread_id = thread.id;
        //The assistant will say something to generate a convo
        twiml.say({
            voice: 'Polly.Mia-Neural'
        }, firstInteract);
    }


    twiml.record({
        maxLength: 60,              // Maximum recording duration (1 hour)
        timeout: 1,                   // Silence timeout before ending recording (seconds)
      });
    
      // Play a beep to signal recording start (optional)
;
    return callback(null, twiml);



    // const params = new URLSearchParams({ thread_id: thread_id });

    // twiml.gather({
    //     enhanced: "true",
    //     speechTimeout: 0,
    //     language: 'es-MX',
    //     speechModel: "phone_call",
    //     input: 'speech',
    //     action:`/respond?${params}`,
    // })

    // return callback(null, twiml);
 };
