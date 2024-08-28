const { logger } = require('../utils/logger');
const Util = require('../utils/Util');
const { requestForwarder } = require('../middlewares/request-forwarder');
const clientService = require('./client');
const UserType = require('../enums/UserType');

async function createWebhook(req, res, next) {
  try {
    logger.info('creating new webhook');

    if (req.user.currentUser.type === UserType.CLIENT) {
      logger.info('CLIENT');
      let userClient = await clientService.getClientByUser(
        req.user.currentUser.id
      );
      if (userClient.clientType === 'FULFILMENT') {
        logger.info('fulfilmentClient');
        req.originalUrl = '/MAN/webhook/client/' + userClient.id;
        req.body.client = {
          id: userClient.id,
          name: userClient.name,
        };
        return await requestForwarder(req, res, next);
      } else {
        return Util.getBadRequest(
          'Client not authorized for product creation',
          res
        );
      }
    } else {
      return Util.getBadRequest('user not a client');
    }
  } catch (err) {
    logger.error(err);
    next(err);
  }
}

module.exports = {
  createWebhook,
};
