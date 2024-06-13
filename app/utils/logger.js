const log4js = require('log4js');
const context = require('./async-context');
let customLogger;
const setupLogger = () => {
  log4js.configure({
    appenders: {
      console: {
        type: 'stdout',
        layout: {
          type: 'pattern',
          pattern:
            '%d{yy-MM-dd hh:mm:ss.SSS} %-5p %z %x{requestId} %x{user} --- %35.35f{2} : %m',
          tokens: {
            user: () => context.get('user') || ' ',
            requestId: () => context.get('requestId') || ' ',
          },
        },
      },
    },
    categories: {
      default: {
        appenders: ['console'],
        level: 'all',
        enableCallStack: true,
      },
    },
  });
  customLogger = log4js.getLogger();
  customLogger.level = 'debug';
  return customLogger;
};

const logger = customLogger || setupLogger();

module.exports = { logger };
