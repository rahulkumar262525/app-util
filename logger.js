const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();

const logLevel = process.env.LOGLEVEL || 'info';
const logMaxFiles = process.env.LOGMAXFILES || '5d';
const logMaxSize = process.env.LOGMAXSIZE || '2m';
const logDatePattern = process.env.LOGDATEPATTERN || 'DD-MM-YYYY';
const logZippedArchive = process.env.LOGZIPPEDARCHIVE || false;

// Create the log directories if they don't exist
const logDirectory = path.join('./', 'logs');

// timestamp in milliseconds
const serviceStartTime = Date.now();

if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

// Create a new logger instance
const logger = winston.createLogger({
  level: logLevel,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'DD-MM-YYYY HH:mm:ss.SSS' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new DailyRotateFile({
      dirname: logDirectory,
      filename: logLevel + '-' + serviceStartTime + '-%DATE%.log',
      datePattern: logDatePattern,
      maxFiles: logMaxFiles,
      maxSize: logMaxSize,
      level: logLevel,
      zippedArchive: logZippedArchive,
    })
  ]
});

module.exports = logger;