const orderType = require('../enums/order-type');
const { logger } = require('../utils/logger');
const { validateUserAndCreateOrder } = require('./create-order');
const Headers = require('../enums/headers');
const MimeType = require('../enums/mime-type');
const { multerService } = require('../services/multer');
const clientService = require('./client');
const UserType = require('../enums/UserType');
const orderCreationType = require('../enums/order-creation-type');
const { requestForwarder } = require('../middlewares/request-forwarder');

async function createOrder(req, res, next) {
  logger.info('Fulfilment');
  req.body.orderType = orderType.FULFILMENT;
  req.body.orderStatus = 'CREATED';
  return await validateUserAndCreateOrder(req, res, next);
}

async function fulfillmentBulk(req, res, next) {
  logger.info('Fulfilment bulk order creation');
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
      req.body.append('orderCreationType', orderCreationType.CLIENT_ADMIN);
      req.body.append('user', userClient.id);
    } else {
      req.body.append('orderCreationType', orderCreationType.ADMIN);
    }
    req.body.append('orderStatus', 'CREATED');

    return await requestForwarder(req, res, next);
  }
}

module.exports = {
  createOrder,
  fulfillmentBulk,
};
