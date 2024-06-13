const { ClientStore } = require('../models');
const clientService = require('./client');
const Util = require('../utils/Util');
const { logger } = require('../utils/logger');
const { requestForwarder } = require('../middlewares/request-forwarder');
const db = require('../database');
const { QueryTypes } = require('sequelize');
const backend = process.env.API_BACKEND || process.env.BACKEND;
const lastMileBackend = process.env.LATS_MILE_BACKEND;
const fulfilmentBackend = process.env.FULFILLMENT_BACKEND;
const { getConnection } = require('../middlewares/tenant-manager');

async function getClientStoreByClient(clientId) {
  logger.info('finding client store by client_Store_Id: ', clientId);
  try {
    const clientStore = await getConnection().ClientStore.findOne({
      where: { clientId },
      raw: true,
    });
    return clientStore;
  } catch (error) {
    throw new Error('Failed to get client store', error);
  }
}

async function validateAndCreateByClientForStore(req, res, next) {
  try {
    if (req.user.currentUser.type == 'CLIENT') {
      logger.info('CLIENT');
      let userClient = await clientService.getClientByUser(
        req.user.currentUser.id
      );
      if (!userClient) {
        return Util.getBadRequest('cannot find client from userId', res);
      }
      logger.info('client found', userClient);

      let clientStore = await getClientStoreByClient(userClient.id);
      if (!clientStore) {
        logger.info('client store not found');
        return Util.getBadRequest(
          'cannot find client store from clientId',
          res
        );
      }
      logger.info('client store found');
      // let body = req.body;

      if (req.body.orderCreationType == 'SALLA') {
        return await sallaOrderCreationCheck(req, res, next, userClient);
      } else {
        return await createClientOrderForStore(req, res, next, userClient);
      }
    } else {
      //todo
    }
  } catch (error) {
    logger.info(error);
    return next(error);
  }
}

async function createClientOrderForStore(req, res, next, client) {
  logger.info('clientType: ', client.clientType);
  if (client.clientType == 'FULFILMENT') {
    logger.info('fulfilment order');
    req.originalUrl = '/FUL/fulfilment/order';
    return await requestForwarder(req, res, next);
  } else {
    logger.info('last mile order');
    req.originalUrl = '/LM/order';
    delete req.body.orders[0].products;
    return await requestForwarder(req, res, next);
  }
}

async function sallaOrderCreationCheck(req, res, next, client) {
  logger.info('additional order status check for SALLA');
  try {
    if (req.body.orders != null) {
      if (
        req.body.orders[0].sallaStatus == 'canceled' ||
        req.body.orders[0].sallaStatus == '525144736'
      ) {
        // to do platFormService.changeStatusToCancelledOfPLatformsForefully
        logger.info('changing order sub status');

        req.originalUrl = '/order/change/sub/status';

        let result = await db.sequelize.query(
          'SELECT tracking_number FROM orders where reference_number = :referenceNumber and client_id = :client limit 1 ',
          {
            replacements: {
              referenceNumber: req.body.orders[0].referenceNumber,
              client: client.id,
            },
            type: QueryTypes.SELECT,
          }
        );
        if (result == -undefined || result.length == 0) {
          logger.info(
            'cannot find lastMile order from referenceNumber: ',
            req.body.orders[0].referenceNumber
          );
          logger.info('now finding in fulfilment orders');
          result = await db.sequelize.query(
            'SELECT tracking_number FROM fulfilment_order where reference_number = :referenceNumber and client_id = :client limit 1 ',
            {
              replacements: {
                referenceNumber: req.body.orders[0].referenceNumber,
                client: client.id,
              },
              type: QueryTypes.SELECT,
            }
          );
          if (result == -undefined || result.length == 0) {
            logger.info(
              'Incorrect Reference Number ' +
                req.body.orders[0].referenceNumber +
                ' For Client ' +
                client.id +
                ' For CANCELLED Status'
            );
            return Util.getBadRequest(
              'Incorrect Reference Number ' +
                req.body.orders[0].referenceNumber +
                ' For Client ' +
                client.id +
                ' For CANCELLED Status',
              res
            );
          }
          let fulfilment_trackingNumber = result[0].tracking_number.toString();
          result = await db.sequelize.query(
            'SELECT tracking_number FROM orders where reference_number = :referenceNumber and enabled = 1 limit 1 ',
            {
              replacements: {
                referenceNumber: fulfilment_trackingNumber,
              },
              type: QueryTypes.SELECT,
            }
          );
          if (result == -undefined || result.length == 0) {
            logger.info(
              'Incorrect Reference Number ' +
                req.body.orders[0].referenceNumber +
                ' For Client ' +
                client.id +
                ' For CANCELLED Status'
            );
            return Util.getBadRequest(
              'Incorrect Reference Number ' +
                req.body.orders[0].referenceNumber +
                ' For Client ' +
                client.id +
                ' For CANCELLED Status',
              res
            );
          } else {
            req.body = {};
            req.body.client = {
              id: client.id,
            };
            req.body.id = result[0].tracking_number.toString();
            return await requestForwarder(req, res, next, lastMileBackend);
          }
        } else {
          req.body = {};
          req.body.client = {
            id: client.id,
          };
          req.body.id = result[0].tracking_number.toString();
          return await requestForwarder(req, res, next, lastMileBackend);
        }
      }
      if (
        (client.type == 'LAST_MILE' &&
          !(
            req.body.orders[0].sallaStatus == 'completed' ||
            req.body.orders[0].sallaStatus == '1298199463'
          )) ||
        (client.type == 'FULFILMENT' &&
          !(
            req.body.orders[0].sallaStatus == 'in_progress' ||
            req.body.orders[0].sallaStatus == '1939592358'
          ) &&
          !(
            req.body.orders[0].sallaStatus == 'completed' ||
            req.body.orders[0].sallaStatus == '1298199463'
          ))
      ) {
        logger.info('order already created');
        return Util.getBadRequest('order already created');
      }
      req.body.client = {
        id: client.id,
      };
      return await createClientOrderForStore(req, res, next, client);
      // if (
      //   (req.body.orders[0].product === undefined ||
      //     req.body.orders[0].product == null) &&
      //   req.user.currentUser.type == 'FULFILMENT'
      // ) {
      //   logger.info('client product null from salla clientId: ', client.id);
      // }
    }
  } catch (error) {
    logger.info(error);
    return next(error);
  }
}

async function validateAndCreateShopifyStore(req, res, next, backend) {
  logger.info('creating new shopify store');
  if (!req.body.webHook.isArray()) {
    const webHook = [req.body.webHook];
    req.body.webHook = webHook;
  }
  if (req.body.webHook == null || req.body.webHook.length == 0) {
    return Util.getBadRequest('webHook cannot be null');
  }
  let client;
  if (req.user.currentUser.type != 'CLIENT') {
    client = clientService.getClientById(req.body.webHook[0].client.id);
  } else {
    client = clientService.getClientByUser(req.user.currentUser.id);
  }
  if (client == null) {
    return Util.getBadRequest('Not Client');
  }
  req.body.client = {
    id: client.id,
    type: client.type,
  };
  return await requestForwarder(req, res, next, backend);
}

async function getShopifyStore(req, res, next, backend) {
  logger.info('getting client store orders');
  if (req.user.currentUser.type != 'CLIENT') {
    return Util.getBadRequest('Not Client');
  }
  return await requestForwarder(req, res, next, backend);
}

async function deleteShopifyStore(req, res, next, backend) {
  logger.info('deleting client store orders');
  if (req.user.currentUser.type != 'CLIENT') {
    return Util.getBadRequest('Not Client');
  }
  return await requestForwarder(req, res, next, backend);
}

module.exports = {
  getClientStoreByClient,
  validateAndCreateByClientForStore,
  validateAndCreateShopifyStore,
  getShopifyStore,
  deleteShopifyStore,
};
