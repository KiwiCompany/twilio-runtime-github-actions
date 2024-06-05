const presetPrompt =`The following is a conversation with an AI friend named Joanna. Joanna is friendly, funny, creative, and very talkative.\n\n`;
const { OpenAI } = require("openai");

const assistant_id = 'asst_hOyzWztfT0yX30pUkB3LHCYQ'


exports.handler = async function(context, event, callback) {

    // Initialize TwiMl and OpenAI
    const openai = new OpenAI({ api_key: context.OPENAI_API_KEY});
    const twiml = new Twilio.twiml.VoiceResponse();
    
    // Grab previous conversations and the users voice input from the request
    let convo = event.convo;
    const voiceInput = event.SpeechResult;
    
    //Format input for GPT-3 and voice the response
    const { 
        aiResponse, 
        thread_id
    } = await generateAIResponse(convo);
    
    const say = twiml.say({
        voice: 'Polly.Mia-Neural'
    }, aiResponse);

    //Pass new convo back to /listen
    const params = new URLSearchParams({ thread_id: thread_id });
    twiml.redirect({
        method: 'POST'
    }, `/transcribe?${params}`);

    return callback(null, twiml);

    async function generateAIResponse(convo) {

        let thread_id = null

        if(!thread_id){
            const thread = await openai.beta.threads.create({
                messages: [
                    {
                        role: 'user',
                        content: convo,
                    },
                ],
            });
        
            thread_id = thread.id;
        }

        await openai.beta.threads.messages.create(
            thread_id,
            {  
                role: "user",  // "user" for your message, "assistant" for responses
                content: convo,
            }
        );

        let run = await openai.beta.threads.runs.createAndPoll(
            thread_id,
            { 
                assistant_id
            }
        );

        if (run.status == 'completed') {
            const messages = await openai.beta.threads.messages.list(thread_id);
            return {
                aiResponse: messages.getPaginatedItems()[0]['content'][0]['text']['value'], 
                thread_id
            }
        }
    }
};
