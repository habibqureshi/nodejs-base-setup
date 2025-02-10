const { logger } = require('../../utils/logger');
const Util = require('../../utils/Util');
const Headers = require('../../enums/headers');
const { OauthClientDetails } = require('../../models');
const bcrypt = require('bcrypt');
const { UsersService } = require('../../services');
const context = require('../../utils/async-context');
const { oauth } = require('./oauth2');
const DataResponse = require('../../utils/Response');
const Constant = require('../../utils/Constant');
const { StatusCodes } = require('http-status-codes');
const { Request, Response } = require('oauth2-server');

const AUTH_SCHEMES = {
  BASIC: 'Basic',
  BEARER: 'Bearer',
};

/**
 * Checks if the Authorization header contains Basic authentication.
 */
const isBasicAuth = (authHeader) => {
  return authHeader.toLowerCase().startsWith(AUTH_SCHEMES.BASIC.toLowerCase());
};

/**
 * Checks if the Authorization header contains a Bearer token.
 */
const isBearerAuth = (authHeader) => {
  return authHeader.toLowerCase().startsWith(AUTH_SCHEMES.BEARER.toLowerCase());
};

const authenticateRequest = async (req, res, next) => {
  const authHeader = req.headers[Headers.AUTHORIZATION];

  if (!authHeader) {
    return Util.getUnauthorizedRequest('Authorization header missing', res);
  }

  if (isBasicAuth(authHeader)) {
    return handleBasicAuth(req, res, next, authHeader);
  }

  if (isBearerAuth(authHeader)) {
    return handleBearerAuth(req, res, next);
  }

  logger.info('Invalid authorization header format', { authHeader });
  return Util.getUnauthorizedRequest('Full authentication required', res);
};

/**
 * Handles Basic Authentication.
 */
const handleBasicAuth = async (req, res, next, authHeader) => {
  logger.info('Processing Basic Authentication');
  /**
   * User APIs will start from /api/*, these api will be protected by basic auth
   * auth will be same as their login creds
   * Basic base64(username:password)   example
   */
  if (req.originalUrl.startsWith('/api')) {
    return await authenticateClient(req, res, next, authHeader);
  }

  if (req.originalUrl.startsWith('/auth')) {
    return await authenticateOAuth(req, res, next, authHeader);
  }

  return Util.getUnauthorizedRequest('Full authentication required', res);
};
const authenticateClient = async (req, res, next, authHeader) => {
  let response = new DataResponse();
  logger.info('Authenticating client with Basic Auth');
  response = await basicAuthenticationForClient(req, res, next, authHeader);
  logger.debug(response.status);
  if (response.status != Constant.FAIL) {
    logger.info('Client authenticated successfully');
    next();
    return;
  } else res.status(response.statusCode).send(response);
};

/**
 * Authenticates OAuth using Basic Auth.
 */
const authenticateOAuth = async (req, res, next, authHeader) => {
  let response = new DataResponse();
  logger.info('Authenticating OAuth with Basic Auth');
  response = await basicAuthenticationForOAuth(req, res, authHeader);

  if (response.status != Constant.FAIL) {
    logger.info('OAuth authenticated successfully');
    next();
    return;
  } else res.status(response.statusCode).send(response);
};

async function handleBearerAuth(req, res, next, options) {
  logger.info('authenticating user');

  try {
    const request = new Request(req);
    const response = new Response(res);
    let token = await oauth.authenticate(request, response, options);
    logger.info('user authenticated');
    res.locals.oauth = { token: token };
    req.user = {
      currentUser: token.user,
      permissions: token.permissions,
    };
    const roles = token.user.userRoles.map((r) => ({
      name: r.dataValues.name,
    }));
    token.user.userRoles = roles;
  } catch (ex) {
    logger.error('error while validating token', ex.message);
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .send({ status: Constant.FAIL, error: ex.message });
  }
  next();
}

/**
 * Authenticates an OAuth client using Basic Auth.
 * @param {string} authHeader - Authorization header.
 * @returns {Object} Authentication response.
 */
const basicAuthenticationForOAuth = async (req, res, authHeader) => {
  try {
    const { username, password } = extractCredentials(authHeader);

    const oauthClientDetails = await OauthClientDetails.findOne({
      where: { clientId: username },
    });
    logger.debug(oauthClientDetails);
    if (!oauthClientDetails) {
      logger.error('Invalid authentication credentials');
      return new DataResponse(
        Constant.FAIL,
        StatusCodes.UNAUTHORIZED,
        'Invalid authentication credentials'
      );
    }

    logger.info('Client secrets found');

    if (!(await verifyPassword(password, oauthClientDetails.clientSecret))) {
      return new DataResponse(
        Constant.FAIL,
        StatusCodes.UNAUTHORIZED,
        'Invalid authentication credentials'
      );
    }
    req.user = {
      currentUser: {
        username,
      },
      permissions: [Constant.AUTH_TOKEN_PERMISSION],
    };

    logger.info('Client secrets valid');

    return new DataResponse(Constant.SUCCESS, StatusCodes.OK, 'SUCCESS');
  } catch (error) {
    logger.error('Error while authenticating OAuth client', error);
    return new DataResponse(
      Constant.FAIL,
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

async function basicAuthenticationForClientv1(req, authHeader) {
  const authResponse = new DataResponse();
  try {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString(
      'ascii'
    );
    const [username, password] = credentials.split(':');
    const user = await UsersService.fetchUserWithUsername(username);
    if (!user) {
      authResponse.setMessage('bad credentials');
      authResponse.setStatus(Constant.FAIL);
      return { response: authResponse, errorFn: Util.getUnauthorizedRequest };
    }
    context.set('user', username);
    logger.info('user secrets found');
    const validSecret = await new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
    if (!validSecret) {
      logger.info('bad credentials');
      authResponse.setMessage('bad credentials');
      authResponse.setStatus(Constant.FAIL);
      return {
        response: authResponse,
        errorFn: Util.getUnauthorizedRequest,
      };
    }
    logger.info('user secrets valid');
    const permissionsArray = Util.makePermissionsArrayForAuthorizationFilter(
      user.Roles
    );

    delete user.dataValues.Roles;

    req.user = {
      currentUser: user,
      permissions: permissionsArray,
    };

    authResponse.setStatus(Constant.SUCCESS);
    return { response: authResponse };
  } catch (ex) {
    logger.info('error while authenticating client secrets', ex);
    authResponse.setMessage(ex.message);
    authResponse.setStatus(Constant.FAIL);
    return { response: authResponse, errorFn: Util.getBadRequest };
  }
}

/**
 * Authenticates a client using Basic Auth.
 * @param {Object} req - Express request object.
 * @param {string} authHeader - Authorization header.
 * @returns {Object} Authentication response.
 */
const basicAuthenticationForClient = async (req, res, next, authHeader) => {
  try {
    const { username, password } = extractCredentials(authHeader);
    if (!username || !password) {
      return new DataResponse(
        Constant.FAIL,
        StatusCodes.UNAUTHORIZED,
        'bad credentials'
      );
    }

    const user = await UsersService.fetchUserWithUsername(username);
    if (!user) {
      return new DataResponse(
        Constant.FAIL,
        StatusCodes.UNAUTHORIZED,
        'bad credentials'
      );
    }

    context.set('user', username);
    logger.info('User secrets found');

    if (!(await verifyPassword(password, user.password))) {
      return new DataResponse(
        Constant.FAIL,
        StatusCodes.UNAUTHORIZED,
        'bad credentials'
      );
    }

    logger.info('User secrets valid');

    req.user = {
      currentUser: { ...user.dataValues, Roles: undefined }, // Removing Roles from user object
      permissions: Util.makePermissionsArrayForAuthorizationFilter(user.Roles),
    };
    return new DataResponse(Constant.SUCCESS, StatusCodes.OK, 'SUCCESS');
  } catch (error) {
    logger.error('Error while authenticating client', error);
    return new DataResponse(
      Constant.FAIL,
      StatusCodes.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

/**
 * Extracts credentials from the Authorization header.
 * @param {string} authHeader - Authorization header.
 * @returns {Object} { username, password }.
 */
const extractCredentials = (authHeader) => {
  try {
    const base64Credentials = authHeader.split(' ')[1];
    const decodedCredentials = Buffer.from(
      base64Credentials,
      'base64'
    ).toString('ascii');
    const [username, password] = decodedCredentials.split(':');
    return { username, password };
  } catch (error) {
    logger.error('Error parsing authorization header', error);
    return {};
  }
};

/**
 * Verifies the password using bcrypt.
 * @param {string} inputPassword - Plain text password.
 * @param {string} hashedPassword - Hashed password from DB.
 * @returns {boolean} Whether the password matches.
 */
const verifyPassword = async (inputPassword, hashedPassword) => {
  try {
    return await bcrypt.compare(inputPassword, hashedPassword);
  } catch (error) {
    logger.error('Error verifying password', error);
    return false;
  }
};

module.exports = authenticateRequest;
