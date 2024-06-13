const { logger } = require('../utils/logger');

async function requestHandler(req, res, next, handlerFunction) {
  try {
    await handlerFunction(req, res, next);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  requestHandler,
};
