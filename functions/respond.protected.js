const { default: axios } = require("axios");
const { streamRun } = require(Runtime.getFunctions()['core/openai_integration']['path']);
const { _CALL_KEY, _CONVO_KEY } = require(Runtime.getFunctions()['helpers/constants']['path']);
const { createContactInZoho } = require(Runtime.getFunctions()['core/zoho_integration']['path']);
const cache = require(Runtime.getFunctions()['core/cache']['path']);
const logger = require(Runtime.getFunctions()['core/logger']['path']);

exports.handler = async function(context, event, callback) {

    const twiml = new Twilio.twiml.VoiceResponse();

    try {
       
        if(!cache.isInitialized()) await cache.initialize()

        const call_data = await cache.getJson(_CALL_KEY, event.CallSid)
   
        let input = null

        if(event.msg){
            input = event.msg
        } else if (event.SpeechResult){
            input = event.SpeechResult
            cache.pushList(_CONVO_KEY, event.CallSid, 'Contact: '+event.SpeechResult)
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
                if(response.save_in_crm){
                    let contact = await createContactInZoho(call_data.zoho_api_key, {
                        "Mobile": call_data.caller_number,
                        ...(response.user_name || response.user_lastname && {First_Name: `${response.user_name} ${response.user_lastname}`}),
                        "Last_Name": `CONMUTADOR (${response.development_name}) - ${response.real_state_advisor_name}.`,
                        "IA_Thread_ID": call_data.thread_id,
                        "Owner": response.real_state_advisor_id,
                        "Desarrollo": response.development_id,
                        "Tipo_de_Contacto": "Prospecto"
                    })
                    cache.setJson(_CALL_KEY, event.CallSid, {
                        ...call_data,
                        ...(response.save_in_crm && {save_in_crm: response.save_in_crm}),
                        contact_id: contact.id
                    })
                }
                twiml.dial({
                    action:`/transfer`,
                    ringTone:'es'
                }, transferTo)
                break;

            case 'hangup':
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

