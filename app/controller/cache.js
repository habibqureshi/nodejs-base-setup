const express = require('express');
const { logger } = require('../utils/logger');
const Util = require('./../utils/Util');
const { clearCache } = require('../services').RedisService;
const { requestHandler } = require('../middlewares/request-handler');

const router = express.Router();

router.delete(['', '/'], async (req, res, next) => {
  logger.info('clearing redis cache completely!');
  try {
    await requestHandler(req, res, next, clearCache);
  } catch (error) {
    logger.error(error);
  }
  return Util.getDataOkRequest('Redis Cache Cleared! ', res);
});

module.exports = router;
