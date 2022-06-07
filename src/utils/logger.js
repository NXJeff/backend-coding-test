const winston = require('winston');
const { combine, timestamp, json } = winston.format;

/**
 * Global Logger for application
 */
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: combine(timestamp(), json()),
    transports: [
        /** write everything >= info to app.log */
        new winston.transports.File({
            filename: 'app.log',
        }),
        /** write error to app-error.log */
        new winston.transports.File({
            filename: 'app-error.log',
            level: 'error',
        }),
    ],
});

module.exports = logger;