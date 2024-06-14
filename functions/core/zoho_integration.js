const { default: axios } = require("axios");

exports.getZohoApiKey = async(context) => {
    try {
        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `https://accounts.zoho.com/oauth/v2/token?grant_type=${context.ZOHO_GRANT_TYPE}&client_id=${context.ZOHO_CLIENT_ID}&client_secret=${context.ZOHO_CLIENT_SECRET}&refresh_token=${context.ZOHO_REFRESH_TOKEN}`,
            headers: { 
                'Cookie': '_zcsr_tmp=5c8cec3f-8ddb-4d81-93c2-74552e9fec83; b266a5bf57=a711b6da0e6cbadb5e254290f114a026; iamcsr=5c8cec3f-8ddb-4d81-93c2-74552e9fec83'
            }
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

exports.getUserFromZoho = async(zoho_api_key, phone_number) => {
    console.log(zoho_api_key);
    console.log(phone_number);
    let config = {
        method: 'get',
        maxBodyLength: Infinity,
        url: `https://www.zohoapis.com/crm/v6/users/search?phone=${phone_number}`,
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

