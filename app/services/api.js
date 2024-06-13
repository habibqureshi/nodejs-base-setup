const { checkKey, setKey, getKey, setData } = require('./redis');
const { requestForwarder } = require('../middlewares/request-forwarder');
const Constant = require('../utils/Constant');
const { logger } = require('../utils/logger');
const Util = require('../utils/Util');
const backend = process.env.API_BACKEND || process.env.BACKEND;

const getCountries = async (req, res, next) => {
  try {
    logger.info('getting all countries');

    let responseData = {};
    const key = Constant.COUNTRIES;
    const exists = null;

    if (!exists) {
      logger.info('countries data not found in Redis, making BE call');
      const response = await requestForwarder(
        req,
        res,
        next,
        async (responseData) => {
          try {
            logger.info('response fron backend: ', responseData);
            if (responseData.data != null) {
              await setData(key, JSON.stringify(responseData));
              logger.info('cities data store in Redis');
            }
          } catch (error) {
            logger.error(
              'error while putting data in redis',
              JSON.stringify(error)
            );
          }
        }
      );
    } else {
      logger.info('countries data found in Redis');
      const data = await getKey(key);
      return Util.getDataOkRequest(JSON.parse(data), res);
    }
  } catch (error) {
    logger.info('error while handling request', error);
    return Util.getISERequest('An error occurred', res);
  }
};

const orderStatuses = async (req, res, next) => {
  try {
    logger.info('check order status service: ');

    let keys = [];
    let notFound = false;
    let responseData = [];

    if (req.body.id) {
      keys = req.body.id.split(',');

      let response;
      try {
        response = await Promise.allSettled(
          keys.map(async (key) => {
            key = key.replace(/[^1-9]/g, '');
            logger.info(key);
            const exists = null;

            if (!exists) {
              logger.info('data not found in Redis for key: ', key);
              notFound = true;
              // throw new Error('not found');
            } else {
              logger.info('data found in Redis for key: ', key);
              const data = await getKey(key);
              let obj = JSON.parse(data);
              responseData.push(obj);
            }
          })
        );
      } catch (error) {
        logger.info('error while checking cache', error.message);
      }

      if (notFound) {
        req.originalUrl = req.originalUrl.replace('/api', '/LM');
        responseData = [];
        const response = await requestForwarder(
          req,
          res,
          next,
          async (responseData) => {
            logger.info('response: ', responseData);
            if (responseData.data) {
              try {
                await Promise.allSettled(
                  response.data.orders.map(async (orderData) => {
                    const add = await setKey(
                      orderData.id.replace(/[^1-9]/g, ''),
                      orderData
                    );
                    logger.info(
                      'Data stored in Redis with key: ',
                      orderData.id.replace(/[^1-9]/g, '')
                    );
                  })
                );
              } catch (error) {
                logger.info(
                  'error while storing in cache',
                  JSON.stringify(error)
                );
              }
            }
          }
        );
      } else {
        logger.info('response: ', responseData);
        return Util.getDataOkRequest(res.json(responseData), res);
      }
    } else {
      logger.info('no order Id in body, making request to BE');
      await requestForwarder(req, res, next);
    }
  } catch (error) {
    logger.info('error while handling ', JSON.stringify(error));
    return Util.getISERequest('An error occurred', res);
  }
};

const getCities = async (req, res, next) => {
  try {
    if (req.body.id != null) {
      logger.info('getting all city for countryId: ', req.body.id);

      let responseData = {};
      let countryId = req.body.id;
      const key = Constant.CITY + countryId;
      logger.info(key);

      const exists = null;
      if (!exists) {
        logger.info('cities data not found in Redis, making BE call');
        let response = await requestForwarder(
          req,
          res,
          next,
          async (responseData) => {
            try {
              logger.info('response: ', responseData);
              if (responseData.data != null) {
                const add = await setData(key, JSON.stringify(responseData));
                logger.info('cities data store in Redis');
              }
            } catch (error) {
              logger.error(
                'error while storing in cache ',
                JSON.stringify(error)
              );
            }
          }
        );
      } else {
        logger.info('cities data found in Redis');
        const data = await getKey(key);
        return Util.getDataOkRequest(JSON.parse(data), res);
      }
    }
  } catch (error) {
    console.error(error);
    return Util.getISERequest('An error occurred', res);
  }
};

module.exports = {
  getCities,
  getCountries,
  orderStatuses,
};
