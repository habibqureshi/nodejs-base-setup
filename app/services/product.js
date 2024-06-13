const { logger } = require('../utils/logger');
const Util = require('../utils/Util');
const { requestForwarder } = require('../middlewares/request-forwarder');
const clientService = require('./client');
const UserType = require('../enums/UserType');
const orderCreationType = require('../enums/order-creation-type');
const Headers = require('../enums/headers');
const MimeType = require('../enums/mime-type');
const { multerService } = require('./multer');

async function validateUserAndCreateProduct(req, res, next) {
  logger.info('creating new product');
  try {
    if (req.user.currentUser.type === UserType.EMPLOY) {
      logger.info('EMPLOY');
      req.body.creationType = 'ADMIN';
    } else if (req.user.currentUser.type === UserType.CLIENT) {
      logger.info('CLIENT');
      let userClient = await clientService.getClientByUser(
        req.user.currentUser.id
      );
      if (userClient.clientType === 'FULFILMENT') {
        logger.info('fulfilmentClient');
        if (!req.body.orderCreationType) {
          req.body.creationType = orderCreationType.CLIENT_ADMIN;
        }
        req.body.client = {
          id: userClient.id,
          name: userClient.name,
        };
      } else {
        return Util.getBadRequest(
          'Client not authorized for product creation',
          res
        );
      }
    }
    if (req.headers[Headers.CONTENT_TYPE]?.includes(MimeType.FORM_DATA)) {
      try {
        await multerService(req, res, next);
      } catch (error) {
        next(error);
      }
      req.body.fileBucket = req.body;
      req.isMulterServiceExecuted = true;
    }

    return await requestForwarder(req, res, next);
  } catch (error) {
    logger.info(error);
    return next(error);
  }
}

async function getProductList(req, res, next) {
  logger.info('getting all products');
  try {
    if (req.user.currentUser.type === UserType.CLIENT) {
      logger.info('CLIENT');
      let userClient = await clientService.getClientByUser(
        req.user.currentUser.id
      );
      req.query.client = userClient.id;
      // req.originalUrl = req.originalUrl + '&client=' + userClient.id;
    }
    return await requestForwarder(req, res, next);
  } catch (error) {
    logger.info(error);
    return next(error);
  }
}

async function updateProduct(req, res, next) {
  logger.info('updating product');
  try {
    if (req.user.currentUser.type === UserType.CLIENT) {
      logger.info('CLIENT');
      let userClient = await clientService.getClientByUser(
        req.user.currentUser.id
      );
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
  validateUserAndCreateProduct,
  getProductList,
  updateProduct,
};
