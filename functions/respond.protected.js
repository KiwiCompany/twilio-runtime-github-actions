const { streamRun } = require(Runtime.getFunctions()['core/openai_integration']['path']);
const { _CALL_KEY, _CONVO_KEY } = require(Runtime.getFunctions()['helpers/constants']['path']);
const cache = require(Runtime.getFunctions()['core/cache']['path']);
const logger = require(Runtime.getFunctions()['core/logger']['path']);

exports.handler = async function(context, event, callback) {

    const twiml = new Twilio.twiml.VoiceResponse();

    try {
       
        if(!cache.isInitialized()) await cache.initialize()

        const call_data = await cache.getJson(_CALL_KEY, event.CallSid)
   
        let input = null
        //In case reply from user isnt expected, IA wont ask again andd willl continue with instructions

        if(event.msg){
            input = event.msg
            //Gather ends without reply, IA will ask again
        } else if (event.SpeechResult){
            input = event.SpeechResult
            //Gather ended and catched a text, IA will process it

            cache.pushList(_CONVO_KEY, event.CallSid, 'Contact: '+event.SpeechResult)
            //Save user input in the cache
        }
      
        let aiResponse = await streamRun(input, call_data.thread_id,  context.OPENAI_API_KEY, context.AI_ASSISTANT_ID);
        let response = JSON.parse(aiResponse)

        cache.pushList(_CONVO_KEY, event.CallSid, 'Melissa: '+response.message)

        switch (response.next_action) {

            case 'transfer':
                twiml.say({
                    voice: context.AI_VOICE
                }, response.message);
                logger.info(`Call ${call_data.call_id}: Attempting transfer to ${response.phone_number}`)
                const transferTo = '+584125295840';
                twiml.dial({
                    action:`/transfer`,
                    ringTone:'es'
                }, transferTo)
                break;

            case 'save_new_contact':
                //Save new context in crm
                //Tell to ia the user was saved
                //If user wansnt saved, tell finish execution or transfer without save?
                //save contact after reply? so if agent doesnt reply it wont be attached to the contact
                console.log(response.new_contact);
                twiml.say({
                    voice: context.AI_VOICE
                }, response.message);
                twiml.redirect({
                    method: 'POST'
                }, `/respond`)
                break;

            case 'hangup':
                //Save in crm
                twiml.say({
                    voice: context.AI_VOICE
                }, response.message);
                twiml.hangup()
                break;

            default:
                twiml.say({
                    voice: context.AI_VOICE
                }, response.message);
                twiml.redirect({
                    method: 'POST'
                }, `/listen`)
                break;
        }


        return callback(null, twiml);
         
    } catch (er) {
        console.log(er);
        twiml.say({voice: context.AI_VOICE}, er.message);
        twiml.hangup()

        return callback(null, twiml);

    }

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

// const { streamRun } = require(Runtime.getFunctions()['core/openai_integration']['path']);
// const { _THREAD_ID, _CALL_DATA } = require(Runtime.getFunctions()['helpers/constants']['path']);
// const MyCache = require(Runtime.getFunctions()['core/memory']['path']);
// const logger = require(Runtime.getFunctions()['core/logger']['path']);

// exports.handler = async function(context, event, callback) {

//     const twiml = new Twilio.twiml.VoiceResponse();

//     try {

//         const thread_id = MyCache.get(_THREAD_ID)
//         const call_data = MyCache.get(_CALL_DATA)
//         let input = null

//         if(event.msg && event.msg === 'Gather End'){
//             console.log('objectsssss');
//             input = event.SpeechResult ? event.SpeechResult : ''
//         }

//         console.log(event);
//         console.log(input);
        
//         let aiResponse = await streamRun(input, thread_id,  context.OPENAI_API_KEY, context.AI_ASSISTANT_ID);
//         let response = JSON.parse(aiResponse)

//         switch (response.next_action) {
//             case 'transfer':
//                 twiml.say({
//                     voice: context.AI_VOICE
//                 }, response.message);

//                 logger.info(`Call ${call_data.call_id}: Attempting transfer to ${response.phone_number}`)
//                 const transferTo = '+584125295840';
            
//                 twiml.dial({
//                     action:`/transfer`,
//                     ringTone:'es'
//                 }, transferTo)
//                 break;

//             case 'save_new_contact':
//                 //Save new context in crm
//                 //Tell to ia the user was saved
//                 //If user wansnt saved, tell finish execution or transfer without save?
//                 //save contact after reply? so if agent doesnt reply it wont be attached to the contact
//                 console.log(response.new_contact);
//                 twiml.say({
//                     voice: context.AI_VOICE
//                 }, response.message);
//                 twiml.redirect({
//                     method: 'POST'
//                 }, `/respond`)
//                 break;
            
//             case 'hangup':
//                 //Save in crm
//                 twiml.say({
//                     voice: context.AI_VOICE
//                 }, response.message);
//                 twiml.hangup()
//                 break;
            
//             default:
//                 twiml.say({
//                     voice: context.AI_VOICE
//                 }, response.message);
//                 twiml.redirect({
//                     method: 'POST'
//                 }, `/listen`)
//                 break;
//         }
    
//         return callback(null, twiml);
         
//     } catch (er) {
//         console.log(er);
//         twiml.say({voice: context.AI_VOICE}, er);
//         twiml.hangup()

//         return callback(null, twiml);

//     }

// };

