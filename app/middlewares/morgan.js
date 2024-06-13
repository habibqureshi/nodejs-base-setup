const morgan = require('morgan');
const { logger } = require('../utils/logger');

morgan.token('remote-addr', function (req, res) {
  return (
    req.headers['x-forwarded-for'] ||
    req.headers['x-real-ip'] ||
    req.socket.remoteAddress
  );
});

module.exports = (format, immediate, message) => {
  return morgan(format, {
    immediate,
    stream: { write: (str) => logger.debug(message, str.trim()) },
  });
};
