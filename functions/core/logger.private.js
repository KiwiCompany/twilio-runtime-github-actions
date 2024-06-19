
const bunyan = require('bunyan');
const syslog = require('bunyan-syslog');

const logger = bunyan.createLogger({
    name: 'mym-phone-assistant', // Replace with your application name
    level: 'info', // Set the logging level (info, debug, etc.)
    stream: syslog.createBunyanStream({
        host: "logs6.papertrailapp.com",
        port: 26779,
        protocol: 'tls4',
        appname: 'mym-phone-assistant', // Replace with your application name
    }),
});

module.exports = logger;