const { logger } = require('../utils/logger');
const clientService = require('./client');
const { requestForwarder } = require('../middlewares/request-forwarder');
const orderCreationType = require('../enums/order-creation-type');
const orderType = require('../enums/order-type');

async function createOrder(req, res, next) {
  try {
    const client = await clientService.getClientByUser(req.user.currentUser.id);
    if (!client) {
      logger.info('client not found with user id', req.user.currentUser.id);
      return Util.getBadRequest('cannot find client from userId');
    }
    req.body.client = {
      id: client.id,
      name: client.name,
      clientType: client.clientType,
    };

    logger.info('clientType: ', client.clientType);
    if (client.clientType == 'FULFILMENT') {
      logger.info('fulfilment order');
      req.originalUrl = '/FUL/fulfilment/order';
      req.body.orderCreationType = orderCreationType.API;
      req.body.orderType = orderType.FULFILMENT;
      return await requestForwarder(req, res, next);
    } else {
      logger.info('last mile order');
      req.originalUrl = '/LM/order';
      req.body.orderCreationType = orderCreationType.API;
      req.body.orderType = orderType.DROP_SHIP;
      return await requestForwarder(req, res, next);
    }
  } catch (error) {
    logger.error(error);
    next(error);
  }
}

module.exports = { createOrder };
