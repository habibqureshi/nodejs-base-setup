const express = require('express');
const { requestForwarder } = require('../middlewares/request-forwarder');
const {
  createOrder: createLastMileOrder,
  cancelOrder,
  getAwb,
} = require('../services').LastMileService;
const { createOrder: createFulfilmentOrder, fulGetAwb } =
  require('./../services').FulfilmentService;
const { getCities, getCountries, orderStatuses } =
  require('../services').ApiService;
const { validateUserAndCreateProduct, getProductList, updateProduct } =
  require('../services').ProductService;
const {
  validateAndCreateByClientForStore,
  validateAndCreateShopifyStore,
  getShopifyStore,
  deleteShopifyStore,
} = require('../services').ClientStoreService;
const { createOrder: createIntraTenantOrder } =
  require('../services').IntraTenantService;
const { createWebhook } = require('../services/webhook');
const { urls } = require('../utils/url-redirect');
const orderCreationType = require('../enums/order-creation-type');
const orderType = require('../enums/order-type');
const { getClientByUser } = require('../services/client');
const { requestHandler } = require('../middlewares/request-handler');
const { logger } = require('../utils/logger');
const router = express.Router();

router.get('/check', async (req, res, next) => {
  const client = await getClientByUser(req.user.currentUser.id);
  if (!client) {
    logger.info('client not found with user id', req.user.currentUser.id);
    return Util.getBadRequest('cannot find client from userId');
  }
  return res.status(200).json({ message: 'OK', type: client.clientType });
});

router.post('/order/check/statuses', orderStatuses);
router.post('/get/all/countries', getCountries);
router.post('/get/all/cities', getCities);

//LM
router.post(['/create/order', '/create/order/'], async (req, res, next) => {
  req.body.orderCreationType = orderCreationType.API;
  return await requestHandler(req, res, next, createLastMileOrder);
});

router.post(['/webhook', '/webhook/'], async (req, res, next) => {
  return await requestHandler(req, res, next, createWebhook);
});

//FUL
router.post('/fulfilment/order', async (req, res, next) => {
  req.body.orderCreationType = orderCreationType.API;
  return await requestHandler(req, res, next, createFulfilmentOrder);
});

//LM
router.post('/create/reverse/order', async (req, res, next) => {
  req.body.orderCreationType = orderCreationType.API;
  req.body.OrderType = orderType.REVERSE;
  req.body.OrderStatus = 'REVERSE_CREATED';
  return await requestHandler(req, res, next, createLastMileOrder);
});

//FUL
router.post('/product', async (req, res, next) => {
  return await requestHandler(req, res, next, validateUserAndCreateProduct);
});

//FUL
router.get('/product', async (req, res, next) => {
  return await requestHandler(req, res, next, getProductList);
});

//FUL
router.post('/product/update', async (req, res, next) => {
  return await requestHandler(req, res, next, updateProduct);
});

//LM
router.post(['/get/status', '/get/sub/status'], async (req, res, next) => {
  try {
    return await requestHandler(req, res, next, requestForwarder);
  } catch (error) {
    next(error);
  }
});

//MAN
router.post('/contact/us', async (req, res, next) => {
  try {
    return await requestHandler(req, res, next, requestForwarder);
  } catch (error) {
    next(error);
  }
});

//MAN
router.post('/request/quote', async (req, res, next) => {
  try {
    return await requestHandler(req, res, next, requestForwarder);
  } catch (error) {
    next(error);
  }
});

//MAN
router.post('/careers', async (req, res, next) => {
  try {
    return await requestHandler(req, res, next, requestForwarder);
  } catch (error) {
    next(error);
  }
});

//MAN
router.post('/transit/fetch', async (req, res, next) => {
  try {
    return await requestHandler(req, res, next, requestForwarder);
  } catch (error) {
    next(error);
  }
});

//LM
router.post(['/order/cancel', '/order/cancel/'], async (req, res, next) => {
  return await requestHandler(req, res, next, cancelOrder);
});

//MAN
router.post(
  ['/get/all/city/list', '/get/all/city/list/'],
  async (req, res, next) => {
    try {
      return await requestHandler(req, res, next, requestForwarder);
    } catch (error) {
      next(error);
    }
  }
);

//MAN
router.post(['/user/signup'], async (req, res, next) => {
  try {
    return await requestHandler(req, res, next, requestForwarder);
  } catch (error) {
    next(error);
  }
});

//MAN
router.post(['/c2c/signup'], async (req, res, next) => {
  try {
    return await requestHandler(req, res, next, requestForwarder);
  } catch (error) {
    next(error);
  }
});

//MAN
router.post(['/send/otp'], async (req, res, next) => {
  try {
    return await requestHandler(req, res, next, requestForwarder);
  } catch (error) {
    next(error);
  }
});

//MAN
router.post(['/verify/otp'], async (req, res, next) => {
  try {
    return await requestHandler(req, res, next, requestForwarder);
  } catch (error) {
    next(error);
  }
});

//MAN
router.post(['/platform/oauth/zid'], async (req, res, next) => {
  try {
    return await requestHandler(req, res, next, requestForwarder);
  } catch (error) {
    next(error);
  }
});

//MAN
router.post(['/platform/zid/auto/dispatching'], async (req, res, next) => {
  try {
    return await requestHandler(req, res, next, requestForwarder);
  } catch (error) {
    next(error);
  }
});

//MAN
router.post(['/platform/oauth/salla'], async (req, res, next) => {
  try {
    return await requestHandler(req, res, next, requestForwarder);
  } catch (error) {
    next(error);
  }
});

//MAN
router.post(['/platform/salla/token'], async (req, res, next) => {
  try {
    return await requestHandler(req, res, next, requestForwarder);
  } catch (error) {
    next(error);
  }
});

router.post(
  ['/platform/salla/validate/and/integrate'],
  async (req, res, next) => {
    try {
      return await requestHandler(req, res, next, requestForwarder);
    } catch (error) {
      next(error);
    }
  }
);

//LM
router.post('/get/awb', async (req, res, next) => {
  try {
    return await requestHandler(req, res, next, getAwb);
  } catch (error) {
    next(error);
  }
});

//FUL
router.post('/fulfillment/order/get/awb', async (req, res, next) => {
  try {
    return await requestHandler(req, res, next, fulGetAwb);
  } catch (error) {
    next(error);
  }
});

//LM
router.post(['/order/track', '/order/track/'], async (req, res, next) => {
  try {
    logger.info('tracking order');
    return await requestHandler(req, res, next, requestForwarder);
  } catch (error) {
    next(error);
  }
});

//LM
router.post(
  ['/order/schedule/pre/check', '/order/schedule/pre/check/'],
  async (req, res, next) => {
    try {
      logger.info('schedule pre check by customer');
      return await requestHandler(req, res, next, requestForwarder);
    } catch (error) {
      next(error);
    }
  }
);

//LM
router.post(['/order/schedule', '/order/schedule/'], async (req, res, next) => {
  try {
    return await requestHandler(req, res, next, requestForwarder);
  } catch (error) {
    next(error);
  }
});

router.post('/create/fulfilment/order/for/magento', async (req, res, next) => {
  req.body.orderCreationType = 'MAGENTO';
  return await requestHandler(
    req,
    res,
    next,
    validateAndCreateByClientForStore
  );
});

router.post('/create/order/for/zid', async (req, res, next) => {
  return await requestHandler(req, res, next, createFulfilmentOrder);
});

router.post('/create/order/for/salla', async (req, res, next) => {
  return await requestHandler(req, res, next, createFulfilmentOrder);
});

router.post('/create/order/for/woocommerce', async (req, res, next) => {
  req.body.orderCreationType = 'WOOCOMMERCE';
  return await requestHandler(
    req,
    res,
    next,
    validateAndCreateByClientForStore
  );
});

router.post('/create/shopify/order', async (req, res, next) => {
  req.body.orderCreationType = 'SHOPIFY';
  return await requestHandler(req, res, next, createLastMileOrder);
});

router.post('/shopify/fulfilment/order', async (req, res, next) => {
  req.body.orderCreationType = 'SHOPIFY';
  return await requestHandler(req, res, next, createFulfilmentOrder);
});

router.post(
  ['/create/store', 'create/shopify/store'],
  async (req, res, next) => {
    return await requestHandler(req, res, next, validateAndCreateShopifyStore);
  }
);

router.get('/get/store', async (req, res, next) => {
  return await requestHandler(req, res, next, getShopifyStore);
});

router.delete('delete/store', async (req, res, next) => {
  return await requestHandler(req, res, next, deleteShopifyStore);
});

router.post(
  ['/get/payment/method', '/get/payment/method/'],
  async (req, res, next) => {
    return await requestHandler(req, res, next, requestForwarder);
  }
);

router.post('/create/order/for/tenant', async (req, res, next) => {
  req.body.orderCreationType = orderCreationType.API;
  return await requestHandler(req, res, next, createIntraTenantOrder);
});

router.use('/**', async (req, res, next) => {
  try {
    await requestHandler(req, res, next, requestForwarder);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
