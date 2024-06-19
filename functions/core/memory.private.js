const NodeCache = require('node-cache');

let cacheInstance; 

class Cache {
    constructor() {
        if (!cacheInstance) {
            cacheInstance = new NodeCache();
        }
        this.cacheInstance = cacheInstance;
    }

    get(key) {
        return this.cacheInstance.get(key);
    }

    set(key, value) {
        this.cacheInstance.set(key, value);
    }

    getStats() {
        return this.cacheInstance.getStats();
    }
}

module.exports = new Cache();