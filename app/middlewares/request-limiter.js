const RedisService = require('../services').RedisService;
const { logger } = require('../utils/logger');
const Util = require('../utils/Util');
module.exports = async (req, res, next) => {
  try {
    const reqId = Util.createRequestId(
      req.headers['authorization']?.split(' ')[1],
      req.method,
      req.originalUrl,
      req.body
    );
    const key = await RedisService.checkKey(reqId);
    if (!key) {
      // logger.info('setting reqId');
      RedisService.setKey(reqId);
    } else {
      logger.info('request already running');
      return Util.getForbiddenRequest(
        'Already request running wait for 1 minute',
        res
      );
    }
    req.id = reqId;
    res.on('finish', () => {
      RedisService.deleteKey(req.id);
    });
    res.on('end', () => {
      RedisService.deleteKey(req.id);
    });
    res.on('error', () => {
      RedisService.deleteKey(req.id);
    });
    next();
  } catch (err) {
    logger.info('error occurred', err);
    return Util.getISERequest(err.message, res);
  }
};
