const { default: axios } = require("axios");
const logger = require(Runtime.getFunctions()['core/logger']['path']);
const { tech_error } = require(Runtime.getFunctions()['helpers/ai_errors']['path']);

exports.getZohoApiKey = async(context) => {
    try {
        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `https://accounts.zoho.com/oauth/v2/token?grant_type=${context.ZOHO_GRANT_TYPE}&client_id=${context.ZOHO_CLIENT_ID}&client_secret=${context.ZOHO_CLIENT_SECRET}&refresh_token=${context.ZOHO_REFRESH_TOKEN}`,
        };
        let response = await axios.request(config)
        if(response.data.error){
            throw new Error(response.data.error)
        }
        return response.data.access_token
    } catch (er) {
        logger.error(`Couldn't generate zoho API key`, er);
        throw new Error(tech_error)
    }
}

// exports.getZohoAvailableAgents = async(zoho_api_key) => {

//     let config = {
//         method: 'get',
//         maxBodyLength: Infinity,
//         url: 'https://www.zohoapis.com/crm/v5/users?type=ActiveUsers',
//         headers: { 
//             'Authorization': 'Zoho-oauthtoken '+zoho_api_key
//         }
//     };

//     try {
//         let response = await axios.request(config)
//         return response.data.users
//     } catch (er) {
//         console.log(er);
//         return null
//     }
    
// }

exports.getUserFromZoho = async(zoho_api_key, id) => {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://www.zohoapis.com/crm/v6/users/${id}?fields=mobile,full_name`,
        headers: { 
          'Authorization': 'Zoho-oauthtoken '+zoho_api_key
        }
      };
    try {
        let response = await axios.request(config)
        return response.data.users[0]
    } catch (er) {
        console.log(er);
        return null
    }
 
}

exports.getActiveUsers = async(zoho_api_key, id) => {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://www.zohoapis.com/crm/v6/users?type=ActiveUsers`,
        headers: { 
          'Authorization': 'Zoho-oauthtoken '+zoho_api_key
        }
      };

    try {
        let response = await axios.request(config)
        return response.data.users
    } catch (er) {
        logger.error(`Couldn't get active users`, er);
        throw new Error(tech_error)
    }
    
}

exports.getContactByPhoneNumber = async(zoho_api_key, phone_number) => {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://www.zohoapis.com/crm/v6/Contacts/search?phone=${phone_number}&fields=Owner,Full_Name,IA_Thread_ID`,
        headers: { 
            'Authorization': `Zoho-oauthtoken ${zoho_api_key}`, 
        }
    };
    try {
        let response = await axios.request(config)
        return response.data.data[0]
    } catch (er) {
        console.log(er);
        return null
    }
}

exports.createContactInZoho = async(zoho_api_key, new_contact) => {
    let data = {
        "data": [new_contact]
    }
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://www.zohoapis.com/crm/v6/Contacts',
        headers: { 
          'Authorization': 'Zoho-oauthtoken '+zoho_api_key
        },
        data: data
    };
    try {
       
        let response = await axios.request(config)
        if(response.data && response.data.data && response.data.data[0] && response.data.data[0].code === "SUCCESS"){
            return response.data.data[0].details
        } else {
            throw new Error("Couldn't save new contact")
        }
        
    } catch (er) {
        logger.error(`Couldn't save new contact`, er);
        throw new Error(tech_error)
    }
 
}

exports.saveConvoInDeal = async(zoho_api_key, deal_id, convo) => {
    let data = {
        "data": [
            {
                "Oportunidad": deal_id,
                "Convo": convo
            }
        ]
    }
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://www.zohoapis.com/crm/v6/Conversaciones_IA',
        headers: { 
          'Authorization': 'Zoho-oauthtoken '+zoho_api_key
        },
        data: data
    };
    try {
       
        let response = await axios.request(config)
        if(response.data && response.data.data && response.data.data[0] && response.data.data[0].code === "SUCCESS"){
            return true
        } else {
            throw new Error("Couldn't save new contact")
        }
        
    } catch (er) {
        logger.error(`Couldn't save ia conversation`, er);
        throw new Error(tech_error)
    }
}

exports.getDealsOfContact = async(zoho_api_key, contact_id, retryCount = 0) => {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://www.zohoapis.com/crm/v6/Contacts/${contact_id}/Deals?fields=id`,
        headers: { 
          'Authorization': 'Zoho-oauthtoken '+zoho_api_key
        }
    };
    try {
        let response = await axios.request(config)

        if (response.status === 204) {
            if (retryCount >= 10) {
                throw new Error("Couldn't retrieve deal info")
            } else {
              return exports.getDealsOfContact(zoho_api_key, contact_id, retryCount + 1);
            }
        } else if(response.data && response.data.data && response.data.data[0]){
            return response.data.data[0]
        } else {
            throw new Error("Couldn't retrieve deal info")
        }
        
    } catch (er) {
        console.log(er);
        logger.error(`Couldn't retrieve deal info`, er);
        throw new Error(tech_error)
    }
}


// exports.updateContactInZoho = async(zoho_api_key, data, id) => {
//     let data = {
//         "data": [data]
//     }
//     let config = {
//         method: 'put',
//         maxBodyLength: Infinity,
//         url: 'https://www.zohoapis.com/crm/v6/Contacts/'+id,
//         headers: { 
//           'Authorization': 'Zoho-oauthtoken '+zoho_api_key
//         },
//         data: data
//     };
//     try {
//         let response = await axios.request(config)
//         return response.data.data
//     } catch (er) {
//         logger.error(`Couldn't save new contact`, er);
//         throw new Error(tech_error)
//     }
// }


exports.getRolDeGuardias = async(zoho_api_key) => {
    const axios = require('axios');
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://www.zohoapis.com/crm/v6/Calendario/search?criteria=(Fecha:equals:${getMXDate()})`,
        headers: { 
            'Authorization': `Zoho-oauthtoken ${zoho_api_key}`, 
        }
    };

    try {
        let response = await axios.request(config)
        return response.data.data
    } catch (er) {
        
        logger.error(`Couldn't get rol de guardias`, er);
        throw new Error(tech_error)

    }
}

exports.getAvailableAgents = async(zoho_api_key) => {
    try {
        
        const [ rol_de_guardias, active_users ] = await Promise.all([ this.getRolDeGuardias(zoho_api_key), this.getActiveUsers(zoho_api_key) ])
        const list_developments = `- Available developments: ${rol_de_guardias.filter(x => x.Desarrollos).map(x => x.Desarrollos.name+'...').join(' ')}`
        const developments_info = `- ${rol_de_guardias.filter(x => x.Desarrollos).map(x => x.Desarrollos.name+' ID is '+x.Desarrollos.id+', ').join(' ')}`
        let all_users_text = `- The staff is made up by: ${active_users.map(x => `${x.full_name}, role: ${x.role.name}, phone number: ${x.mobile}, id: ${x.id}, email: ${x.email}`).join('. ')}`
        return active_users.map(x => {
            let data_from_rol_de_guardia = rol_de_guardias.find(y => x.id === y.Owner.id)
            return data_from_rol_de_guardia 
                ? `- ${x.first_name} ${x.last_name} is responsible for development ${data_from_rol_de_guardia.Desarrollos.name} and the phone number is ${x.mobile}.`
                : null
            }).concat(list_developments).filter(e => e).concat(all_users_text).concat(developments_info).join('\n\n')

    } catch (er){
        console.log(er);
        logger.error(`Couldn't generate list of agents`, er);
        throw new Error(tech_error)

    }
} 

function addZero(str) {
    if(str.length === 1) {
        return '0'+str
    } else {
        return str
    }
}

function getMXDate() {
    const dateObj = new Date().toLocaleString('es-MX', { timeZone: 'America/Mexico_City' });
    const unformattedDate = dateObj.split(',')[0]; 
    const formattedDate = `${addZero(unformattedDate.split('/')[2])}-${addZero(unformattedDate.split('/')[1])}-${addZero(unformattedDate.split('/')[0])}`;
    return formattedDate;
}