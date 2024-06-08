const { OpenAI } = require("openai");
const axios = require("axios");
const assistant_id = 'asst_hOyzWztfT0yX30pUkB3LHCYQ'
const { toFile } = require("openai/uploads");
const { Readable } = require("stream");

exports.handler = async function(context, event, callback) {
    const openai = new OpenAI({ api_key: context.OPENAI_API_KEY});
    const twiml = new Twilio.twiml.VoiceResponse();

    let thread_id = event.thread_id

    if(!thread_id){
        let _thread = await openai.beta.threads.create();
        thread_id = _thread.thread_id
    }
    
    // const base64encodedData = Buffer.from(context.TWILIO_ACCOUNT_SID + ':' + context.TWILIO_AUTH_TOKEN).toString('base64');
    // const voiceInput = await getTranscription(event.RecordingUrl, base64encodedData)

    let voiceInput = event.SpeechResult;

    const aiResponse = await generateAIResponses(voiceInput);

    twiml.say({
        voice: 'Polly.Mia-Neural'
    }, aiResponse);

    const params = new URLSearchParams({ thread_id: thread_id });

    twiml.redirect({
        method: 'POST'
    }, `/transcribe?${params}`);

    return callback(null, twiml);

    // async function getTranscription(RecordingUrl, base64encodedData, filename = 'recording.mp3') {

    //     try {

    //         const response = await axios.get(RecordingUrl + '.mp3', {
    //             responseType: 'stream',
    //             headers: {
    //                 'Authorization': `Basic ${base64encodedData}`
    //             }
    //         });
          
    //         if (response.status !== 200) {
    //             throw new Error(`Failed to download file: ${response.statusText}`);
    //         }

    //         const audioBuffer = [];

    //         response.data.on('data', (chunk) => audioBuffer.push(chunk));

    //         await new Promise((resolve, reject) => {
    //           response.data.on('end', resolve);
    //           response.data.on('error', reject);
    //         });

    //         const audioData = Buffer.concat(audioBuffer);
    //         const convertedFile = await toFile(Readable.from(audioData), filename);
    //         const transcription = await openai.audio.transcriptions.create({
    //             file: convertedFile,
    //             model: "whisper-1",
    //             language: "es",
    //         });
    //         return transcription.text || 'Disculpame, podrias repetir tu solicitud?'
            
    //     } catch (error) {
    //         return 'Disculpame, podrias repetir tu solicitud?'
    //     }
    // }

    async function generateAIResponses(voiceInput) {
        await openai.beta.threads.messages.create(thread_id, {
            role: "user",
            content: voiceInput
        });
        
        return new Promise((resolve, reject) => {
            const run = openai.beta.threads.runs.stream(thread_id, {
                assistant_id
            });
        
            let finalText = "";
        
            run.on('textDelta', (textDelta) => {
                finalText += textDelta.value;
            })
            .on('error', (error) => {
                reject(error); 
            })
            .on('end', () => {
                resolve(finalText);
            });
        });
    }

};
