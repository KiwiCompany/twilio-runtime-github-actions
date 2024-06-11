const { OpenAI } = require("openai");
const axios = require("axios");
const assistant_id = 'asst_hOyzWztfT0yX30pUkB3LHCYQ'
const { toFile } = require("openai/uploads");
const { Readable } = require("stream");

exports.handler = async function(context, event, callback) {
    const openai = new OpenAI({ api_key: context.OPENAI_API_KEY});
    const twiml = new Twilio.twiml.VoiceResponse();
    const thread_id = event.thread_id
    let aiResponse = await generateAIResponses(event.SpeechResult, openai);
    const params = new URLSearchParams({ thread_id: thread_id });
    

    if(aiResponse.includes('code_100')){
        twiml.say({
            voice: 'Polly.Mia-Neural'
        }, aiResponse.replace('code_100', ''));
        const transferTo = '+584125295840';
        twiml.dial(transferTo)
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
        }, `/transcribe?${params}`)
    }

    return callback(null, twiml);

    async function generateAIResponses(voiceInput, openai) {

        const run = openai.beta.threads.runs.stream(thread_id, { 
            assistant_id,
            additional_messages:[
                {
                    role: "user",
                    content: voiceInput
                }
            ]
        });

        let assistantText = '';

        for await (const event of run) {
            if(event.event === 'thread.message.completed'){
                assistantText += event.data.content[0].text.value;
            }
            if(event.event === 'thread.run.completed'){
                return assistantText
            }
        }
        
        // return new Promise((resolve, reject) => {
        //     let textChunks = [];
        //     run.on('textDelta', (textDelta) => {
        //         textChunks.push(textDelta.value);
        //     })
        //     .on('error', (error) => {
        //         reject(error); 
        //     })
        //     .on('end', async () => {
        //         resolve(textChunks.join(''));
        //     })
        // });
    }
};
