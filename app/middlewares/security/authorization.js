const { logger } = require('../../utils/logger');
const Constant = require('../../utils/Constant');
const Util = require('../../utils/Util');

const authorizeRequest = async (req, res, next) => {
  try {
    if (!req.user) {
      logger.warn('Unauthorized access attempt - No user found in request');
      res.status(400).send({
        status: 400,
        message: '',
      });
      //   Util.getUnauthorizedRequest('Unauthorized. Please log in.', res);
      return;
    }

    const { permissions, currentUser } = req.user;
    logger.debug(permissions);
    const requestedUrl = req.originalUrl;

    logger.info(
      `Checking authorization for user: ${
        currentUser?.username || currentUser?.userName
      }`
    );
    logger.info(`Requested URL: ${requestedUrl}`);

    // Grant access if user has ROOT permission or specific permission for the requested URL
    if (
      permissions.includes(Constant.ROOT_PERMISSION) ||
      permissions.includes(requestedUrl)
    ) {
      logger.info(`Access granted for ${requestedUrl}`);
      return next();
    }

    logger.warn(
      `Access denied for user: ${
        currentUser?.username || currentUser?.userName
      } on URL: ${requestedUrl}`
    );
    return Util.getUnauthorizedRequest('Forbidden!!! Access Denied.', res);
  } catch (error) {
    logger.error('Error in AuthorizationMiddleware:', error);
    return Util.getUnauthorizedRequest('Internal Server Error', res);
  }
};

module.exports = authorizeRequest;
