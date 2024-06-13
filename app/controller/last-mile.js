const express = require('express');
const { requestForwarder } = require('../middlewares/request-forwarder');
const { logger } = require('../utils/logger');
const router = express.Router();
const { createOrder, lastMileBulk: bulkCreate } =
  require('../services').LastMileService;
const { requestHandler } = require('../middlewares/request-handler');

router.post('/order', async (req, res, next) => {
  return await requestHandler(req, res, next, createOrder);
});

router.post('/order/bulk', async (req, res, next) => {
  req.originalUrl = req.originalUrl.replace('/bulk', '/create/bulk/by/admin');
  return await requestHandler(req, res, next, bulkCreate);
});

router.use('/**', async (req, res, next) => {
  try {
    logger.info('lastMile');
    await requestHandler(req, res, next, requestForwarder);
  } catch (error) {
    next(error);
  }
});
module.exports = router;
