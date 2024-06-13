const { logger } = require('../utils/logger');
const Util = require('../utils/Util');
const clientService = require('./client');
const { requestForwarder } = require('../middlewares/request-forwarder');
const UserType = require('../enums/UserType');
const orderCreationType = require('../enums/order-creation-type');

async function validateUserAndCreateBulkOrder(req, res, next, backend) {
  try {
    if (!req.body.user) {
      let userClient = await clientService.getClientByUser(
        req.user.currentUser.id
      );
      if (!userClient) {
        return Util.getBadRequest('cannot find client from userId');
      }
    }
  } catch (error) {
    logger.info(error);
    return next(error);
  }
}

async function validateUserAndCreateOrder(req, res, next) {
  try {
    if (req.user.currentUser.type === UserType.EMPLOY) {
      logger.info('EMPLOY');
      req.body.orderCreationType = orderCreationType.ADMIN;
    } else if (req.user.currentUser.type === UserType.SALLA_USER) {
      logger.info('SALLA CLIENT');
      req.body.orderCreationType = orderCreationType.SALLA;
    } else if (req.user.currentUser.type === UserType.ZID_USER) {
      logger.info('ZID CLIENT');
      req.body.orderCreationType = orderCreationType.ZID;
    } else {
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
      if (!req.body.orderCreationType) {
        req.body.orderCreationType = orderCreationType.CLIENT_ADMIN;
      }
    }
    return await requestForwarder(req, res, next);
  } catch (error) {
    logger.info(error);
    return next(error);
  }
}

module.exports = {
  validateUserAndCreateOrder,
};
