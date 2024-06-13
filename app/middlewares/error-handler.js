const RedisService = require('../services').RedisService;
const { logger } = require('../utils/logger');
const Util = require('../utils/Util');

module.exports = async (err, req, res, next) => {
  logger.error(err.stack);
  req.id && RedisService.deleteKey(req.id);
  if (err instanceof SyntaxError) {
    return Util.getBadRequest('invalid request body/headers', res);
  }
  Util.getISERequest('Something broke!', res);
};
