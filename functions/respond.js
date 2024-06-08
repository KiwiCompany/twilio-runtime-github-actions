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
    
    var base64encodedData = Buffer.from(context.TWILIO_ACCOUNT_SID + ':' + context.TWILIO_AUTH_TOKEN).toString('base64');

    let voiceInput = await getTranscription(event.RecordingUrl,base64encodedData)

    const { 
        aiResponse
    } = await generateAIResponse(voiceInput);

    const say = twiml.say({
        voice: 'Polly.Mia-Neural'
    }, aiResponse);

    const params = new URLSearchParams({ thread_id: thread_id });

    twiml.redirect({
        method: 'POST'
    }, `/transcribe?${params}`);

    return callback(null, twiml);

    async function generateAIResponse(voiceInput) {
        //Send the transcribed message to OPENAI and insert in the generated thread ID
        await openai.beta.threads.messages.create(
            thread_id,
            {  
                role: "user",  
                content: voiceInput,
            }
        );
        //Set the assistant to work with and process the last message in order to get an AI response
        let run = await openai.beta.threads.runs.createAndPoll(
            thread_id,
            { 
                assistant_id
            }
        );
        //Get the latest messages, get the last one and return in order to make Twilio sppeech it to user
        if (run.status == 'completed') {
            const messages = await openai.beta.threads.messages.list(thread_id);
            return {
                aiResponse: messages.getPaginatedItems()[0]['content'][0]['text']['value'], 
                thread_id
            }
        }
    }


    async function getTranscription(RecordingUrl, base64encodedData, filename = 'recording.mp3') {

        try {
            // Download the audio file
            const response = await axios.get(RecordingUrl + '.mp3', {
                responseType: 'stream',
                headers: {
                    'Authorization': `Basic ${base64encodedData}`
                }
            });
          
            if (response.status !== 200) {
                throw new Error(`Failed to download file: ${response.statusText}`);
            }

            const audioBuffer = [];

            response.data.on('data', (chunk) => audioBuffer.push(chunk));

            // Await the entire stream to finish downloading
            await new Promise((resolve, reject) => {
              response.data.on('end', resolve);
              response.data.on('error', reject);
            });

            // Combine the buffer chunks into a single buffer
            const audioData = Buffer.concat(audioBuffer);
            const convertedFile = await toFile(Readable.from(audioData), 'asd.mp3');
            const transcription = await openai.audio.transcriptions.create({
                file: convertedFile,
                model: "whisper-1",
                language: "es",
            });
            return transcription.text || 'Disculpame, podrias repetir tu solicitud?'
            
        } catch (error) {
            return 'Disculpame, podrias repetir tu solicitud?'
        }
    }
      
};
