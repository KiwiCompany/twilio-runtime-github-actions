const { tech_error } = require(Runtime.getFunctions()['helpers/ai_errors']['path']);
const logger = require(Runtime.getFunctions()['core/logger']['path']);
const { createClient } = require("redis");
const ttl = 24 * 60 * 60

let client;

async function initialize() {
   
    client = createClient({
        password: 'aAP6yaL9j2m0ocMVX5AUMdO4RI5pdzG4',
        socket: {
            host: 'redis-11419.c323.us-east-1-2.ec2.redns.redis-cloud.com',
            port: 11419
        }
    })

    try {
        await client.connect();
    } catch (e) {
        logger.error('Could not connect to redis: ', e);
        throw new Error(tech_error)
    }
    
}

async function setJson(folder, key, value) {
    try {
        await client.json.set(`${folder}:${key}`, '$', value, ttl);
    } catch (e) {
        logger.error('Could not set data to redis: ', e);
        throw new Error(tech_error)
    }
}

async function getJson(folder, key) {
    try {
        const response = await client.json.get(`${folder}:${key}`, '$', ttl);
        return response
    } catch (e) {
        logger.error('Could not get data from redis: ', e);
        throw new Error(tech_error)
    }
}

async function pushList(folder, key, value) {
    try {
        const response = await client.rPush(`${folder}:${key}`, value, ttl);
        return response
    } catch (e) {
        logger.error('Could not get data from redis: ', e);
        throw new Error(tech_error)
    }
}

async function getList(folder, key) {
    try {
        const response = await client.lRange(`${folder}:${key}`, 0, -1, ttl);
        return response
    } catch (e) {
        logger.error('Could not get data from redis: ', e);
        throw new Error(tech_error)
    }
}

function isInitialized() {
    return client !== undefined && client !== null;
}

module.exports = {
    initialize,
    setJson,
    getJson,
    isInitialized,
    pushList,
    getList
}


// const asyncRedis = require("async-redis");

// let cacheInstance; 

// class MyCache {
//     constructor() {
//         if (!cacheInstance) {
//             let client = asyncRedis.createClient({
//                 password: 'aAP6yaL9j2m0ocMVX5AUMdO4RI5pdzG4',
//                 socket: {
//                     host: 'redis-11419.c323.us-east-1-2.ec2.redns.redis-cloud.com',
//                     port: 11419
//                 }
//             });
//             await client.connect();
//         }
//         this.cacheInstance = cacheInstance;
//     }

//     async get(key) {
//         await this.cacheInstance.get(key);
//     }

//     async set(folder, key, value) {
//         await this.cacheInstance.set(`${folder}:${key}`, value);
//     }

// }

