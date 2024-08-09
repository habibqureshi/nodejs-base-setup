const { logger } = require('../utils/logger');
const clientService = require('./client');

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
      return await requestForwarder(req, res, next);
    } else {
      logger.info('last mile order');
      req.originalUrl = '/LM/order';
      return await requestForwarder(req, res, next);
    }
  } catch (error) {
    logger.error(error);
    next(error);
  }
}

module.exports = { createOrder };
