const os = require('os');
const winston = require('winston');
require('winston-syslog');

const papertrail = new winston.transports.Syslog({
    host: "logs6.papertrailapp.com",
    port: 26779,
    protocol: 'tls4',
    localhost: os.hostname(),
    eol: '\n',
});

const logger = winston.createLogger({
    format: winston.format.simple(),
    levels: winston.config.syslog.levels,
    transports: [papertrail],
});

module.exports=logger