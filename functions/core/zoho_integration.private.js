const { default: axios } = require("axios");

exports.getZohoApiKey = async(context) => {
    try {
        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `https://accounts.zoho.com/oauth/v2/token?grant_type=${context.ZOHO_GRANT_TYPE}&client_id=${context.ZOHO_CLIENT_ID}&client_secret=${context.ZOHO_CLIENT_SECRET}&refresh_token=${context.ZOHO_REFRESH_TOKEN}`,
        };
        let response = await axios.request(config)
        return response.data.access_token;
    } catch (er) {
        console.log(er);
        return null
    }
}

exports.getZohoAvailableAgents = async(zoho_api_key) => {

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: 'https://www.zohoapis.com/crm/v5/users?type=ActiveUsers',
        headers: { 
            'Authorization': 'Zoho-oauthtoken '+zoho_api_key
        }
    };

    try {
        let response = await axios.request(config)
        return response.data.users
    } catch (er) {
        console.log(er);
        return null
    }
    
}

exports.getUserFromZoho = async(zoho_api_key, id) => {
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://www.zohoapis.com/crm/v6/users/${id}`,
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
        console.log(er);
        return null
    }
    
}

exports.getContactFromZoho = async(zoho_api_key, phone_number) => {

    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://www.zohoapis.com/crm/v6/Contacts/search?phone=${phone_number}&fields=Email,Owner,Mobile,Full_Name,Thread_Id`,
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
    const contacts = [new_contact];

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `https://www.zohoapis.com/crm/v6/Contacts`,
        headers: { 
          'Authorization': 'Zoho-oauthtoken '+zoho_api_key
        },
        data: {
            contacts,
        }
    };

    try {
        let response = await axios.request(config)
        return response
    } catch (er) {
        console.log(er);
        return null
    }
    
}


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
        console.log(er);
        return null
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