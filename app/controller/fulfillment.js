const express = require('express');
const { requestForwarder } = require('../middlewares/request-forwarder');
const router = express.Router();
const { createOrder, fulfillmentBulk } =
  require('./../services').FulfilmentService;
const { logger } = require('../utils/logger');
const { validateUserAndCreateProduct, getProductList, updateProduct } =
  require('../services').ProductService;
const { requestHandler } = require('../middlewares/request-handler');
const orderType = require('../enums/order-type');

router.post('/fulfilment/order', async (req, res, next) => {
  return await requestHandler(req, res, next, createOrder);
});

router.post('/fulfilment/order/bulk', async (req, res, next) => {
  req.originalUrl = req.originalUrl.replace('/bulk', '/create/bulk/by/admin');
  return await requestHandler(req, res, next, fulfillmentBulk);
});

router.post('/product', async (req, res, next) => {
  return await requestHandler(req, res, next, validateUserAndCreateProduct);
});

router.post('/product/bulk', async (req, res, next) => {
  return await requestHandler(req, res, next, validateUserAndCreateProduct);
});

router.get('/product', async (req, res, next) => {
  return await requestHandler(req, res, next, getProductList);
});

router.put('/product', async (req, res, next) => {
  return await requestHandler(req, res, next, updateProduct);
});

router.use('/**', async (req, res, next) => {
  try {
    logger.info('fulfilment');
    return await requestHandler(req, res, next, requestForwarder);
  } catch (error) {
    next(error);
  }
});
module.exports = router;
