const { logger } = require('../utils/logger');
const { validateUserAndCreateOrder } = require('./create-order');
const { multerService } = require('../services/multer');
const clientService = require('./client');
const Headers = require('../enums/headers');
const MimeType = require('../enums/mime-type');
const { requestForwarder } = require('../middlewares/request-forwarder');
const UserType = require('../enums/UserType');
const orderType = require('../enums/order-type');
const orderCreationType = require('../enums/order-creation-type');

async function createOrder(req, res, next) {
  logger.info('LastMile order creation');
  req.body.orderType = orderType.DROP_SHIP;
  req.body.orderStatus = 'CREATED';
  return await validateUserAndCreateOrder(req, res, next);
}

async function lastMileBulk(req, res, next) {
  logger.info('LastMile bulk order creation');
  if (req.headers[Headers.CONTENT_TYPE]?.includes(MimeType.FORM_DATA)) {
    try {
      await multerService(req, res, next);
    } catch (error) {
      next(error);
    }

    req.body.fileBucket = req.body;
    req.isMulterServiceExecuted = true;

    if (req.user.currentUser.type === UserType.CLIENT) {
      logger.info('CLIENT');
      let userClient = await clientService.getClientByUser(
        req.user.currentUser.id
      );
      if (!userClient) {
        return Util.getBadRequest('cannot find client from userId');
      }
      // req.body.client = {
      //   id: userClient.id,
      //   name: userClient.name,
      // };
      req.body.append('orderCreationType', orderCreationType.CLIENT_ADMIN);
    } else {
      req.body.append('orderCreationType', orderCreationType.ADMIN);
    }

    req.body.append('orderType', orderType.DROP_SHIP);
    req.body.append('orderStatus', 'CREATED');

    return await requestForwarder(req, res, next);
  }
}

async function cancelOrder(req, res, next, backend) {
  try {
    req.originalUrl = '/LM/order/cancel';
    if (req.user.currentUser.type === UserType.CLIENT) {
      logger.info('CLIENT');
      let userClient = await clientService.getClientByUser(
        req.user.currentUser.id
      );
      if (!userClient) {
        return Util.getBadRequest('cannot find client from userId');
      }
      req.body.client = {
        id: userClient.id,
        name: userClient.name,
      };
    }
    return await requestForwarder(req, res, next);
  } catch (error) {
    logger.info(error);
    return next(error);
  }
}

async function getAwb(req, res, next) {
  try {
    req.originalUrl = '/LM/order/get/awb/for/client';
    if (req.user.currentUser.type === UserType.CLIENT) {
      logger.info('CLIENT');
      let userClient = await clientService.getClientByUser(
        req.user.currentUser.id
      );
      if (!userClient) {
        return Util.getBadRequest('cannot find client from userId');
      }
      req.body.client = {
        id: userClient.id,
        name: userClient.name,
      };
    }
    return await requestForwarder(req, res, next);
  } catch (error) {
    logger.info(error);
    return next(error);
  }
}

module.exports = {
  createOrder,
  lastMileBulk,
  cancelOrder,
  getAwb,
};
