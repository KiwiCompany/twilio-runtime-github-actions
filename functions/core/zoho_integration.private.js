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
        logger.error(`Couldn't generate zoho API key`);
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

// exports.getUserFromZoho = async(zoho_api_key, id) => {
//     let config = {
//         method: 'get',
//         maxBodyLength: Infinity,
//         url: `https://www.zohoapis.com/crm/v6/users/${id}`,
//         headers: { 
//           'Authorization': 'Zoho-oauthtoken '+zoho_api_key
//         }
//       };

//     try {
//         let response = await axios.request(config)
//         return response.data.users[0]
//     } catch (er) {
//         console.log(er);
//         return null
//     }
    
// }

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
        logger.error(`Couldn't get active users`);
        throw new Error(tech_error)
    }
    
}

// exports.getContactFromZoho = async(zoho_api_key, phone_number) => {

//     let config = {
//         method: 'get',
//         maxBodyLength: Infinity,
//         url: `https://www.zohoapis.com/crm/v6/Contacts/search?phone=${phone_number}&fields=Email,Owner,Mobile,Full_Name,Thread_Id`,
//         headers: { 
//             'Authorization': `Zoho-oauthtoken ${zoho_api_key}`, 
//         }
//     };

//     try {
//         let response = await axios.request(config)
//         return response.data.data[0]
//     } catch (er) {
//         console.log(er);
//         return null
//     }
    
// }


// exports.createContactInZoho = async(zoho_api_key, new_contact) => {
//     const contacts = [new_contact];

//     let config = {
//         method: 'post',
//         maxBodyLength: Infinity,
//         url: `https://www.zohoapis.com/crm/v6/Contacts`,
//         headers: { 
//           'Authorization': 'Zoho-oauthtoken '+zoho_api_key
//         },
//         data: {
//             contacts,
//         }
//     };

//     try {
//         let response = await axios.request(config)
//         return response
//     } catch (er) {
//         console.log(er);
//         return null
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
        
        logger.error(`Couldn't get rol de guardias`);
        throw new Error(tech_error)
    }
}

exports.getAvailableAgents = async(zoho_api_key) => {
    try {
        
        const [ rol_de_guardias, active_users ] = await Promise.all([ this.getRolDeGuardias(zoho_api_key), this.getActiveUsers(zoho_api_key) ])
    
        return active_users.map(x => {
            let data_from_rol_de_guardia = rol_de_guardias.find(y => x.id === y.Owner.id)
            let newData = {
                name: `${x.first_name} ${x.last_name}`,
                phone: x.mobile,
                ...(data_from_rol_de_guardia ? {development: data_from_rol_de_guardia.Desarrollos} : {}),
                role: x.role
            }
            return newData
        })

    } catch (er){

        logger.error(`Couldn't generate list of agents`);
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