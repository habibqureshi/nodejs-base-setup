const Request = require('oauth2-server').Request;
const Response = require('oauth2-server').Response;
const { logger } = require('../../utils/logger');
const Utils = require('../../utils/Util');
const { oauth } = require('./oauth2');
module.exports = function tokenHandler(options) {
  return async function (req, res, next) {
    logger.info('generating token');

    const request = new Request(req);
    const response = new Response(res);
    try {
      const token = await oauth.token(request, response, options);
      res.locals.oauth = { token: token };
      logger.info('access token generated successfully');
      next();
    } catch (err) {
      logger.error('error occured while generating token', err.message);
      Utils.getBadRequest(err.message, res);
    }
  };
};
