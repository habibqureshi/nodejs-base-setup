const { logger } = require('../../utils/logger');
const Util = require('../../utils/Util');
const Headers = require('../../enums/headers');
const { OauthClientDetails } = require('../../models');
const bcrypt = require('bcrypt');
const { UsersService } = require('../../services');
const context = require('../../utils/async-context');
const { oauth } = require('./oauth2');
const { Request, Response } = require('oauth2-server');
const DataResponse = require('../../utils/Response');
const Constant = require('../../utils/Constant');
const { getConnection } = require('../tenant-manager');

module.exports = async (req, res, next) => {
  const authHeader = req.headers[Headers.AUTHORIZATION];
  if (!authHeader)
    return Util.getUnauthorizedRequest('authorization header missing', res);
  if (authHeader.indexOf('basic') != -1 || authHeader.indexOf('Basic') != -1) {
    logger.info('Basic Auth');

    if (req.originalUrl.startsWith('/api')) {
      logger.info('client basic auth');
      let authResponse = await basicAuthenticationForClient(req, authHeader);
      if (authResponse.response.getStatus() === Constant.FAIL) {
        logger.info('credentials not verified');
        return authResponse.errorFn(authResponse.response.getMessage(), res);
      }
      authResponse = await AuthorizationFilter(req, res, next);
      if (authResponse.response.getStatus() === Constant.FAIL) {
        logger.info('accessing denied resource');
        return authResponse.errorFn(authResponse.response.getMessage(), res);
      }
      logger.info('verified client');
    } else if (req.originalUrl.startsWith('/oauth')) {
      logger.info('oauth verification');
      let oauthResponse = await basicAuthenticationForOAuth(authHeader);
      if (oauthResponse.response.getStatus() === Constant.FAIL) {
        logger.info('oauth verification failed');
        return oauthResponse.errorFn(oauthResponse.response.getMessage(), res);
      }
      logger.info('verified oauth');
    } else {
      return Util.getUnauthorizedRequest('full authentication needed', res);
    }
  } else if (
    authHeader.indexOf('bearer') != -1 ||
    authHeader.indexOf('Bearer') != -1
  ) {
    logger.info('Bearer Token');
    let tokenAuth = await BearerAuthentication(req, res);
    if (tokenAuth.status === Constant.FAIL) {
      logger.info('user not authenticated');
      return Util.getUnauthorizedRequest('user not authenticated', res);
    }
    tokenAuth = await AuthorizationFilter(req, res, next);
    if (tokenAuth.response.getStatus() === Constant.FAIL) {
      logger.info('accessing denied resource');
      return tokenAuth.errorFn(tokenAuth.response.getMessage(), res);
    }
    logger.info('verified user');
  } else {
    logger.info(
      'authorization not provided',
      req.headers[Headers.AUTHORIZATION]
    );
    return Util.getUnauthorizedRequest('full authentication needed', res);
  }
  next();
};

async function AuthorizationFilter(req, res, next) {
  const requestedUrl =
    req.params !== null || req.query != null
      ? req.originalUrl
          .split('?')
          .shift()
          .replace('/' + req.params.id, '')
      : req.originalUrl;
  const excluded = requestedUrl.replace(/^\/LM|^\/FUL|^\/MAN/, '');

  logger.info('checking if user is authorize to access this resource');
  logger.info('requested url is', requestedUrl, excluded);

  const currentUser = req.user;
  if (
    currentUser.permissions.includes(Constant.ROOT_PERMISSION) ||
    currentUser.permissions.includes(requestedUrl) ||
    currentUser.permissions.includes(requestedUrl + '/') ||
    currentUser.permissions.includes(excluded) ||
    currentUser.permissions.includes(excluded + '/')
  ) {
    logger.info('user is authorized for api', requestedUrl);
    return { response: new DataResponse(Constant.SUCCESS) };
  }
  logger.info(
    `user ${
      currentUser.currentUser?.username || currentUser.currentUser?.userName
    } is not authorize for requested url = ${req.originalUrl}`
  );
  return {
    response: new DataResponse(
      Constant.FAIL,
      null,
      'Forbidden!!! Access Denied.'
    ),
    errorFn: Util.getForbiddenRequest,
  };
}

async function BearerAuthentication(req, res, options) {
  logger.info('authenticating user');
  const request = new Request(req);
  const response = new Response(res);
  const tokenResponse = new DataResponse();
  try {
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
    // token.user && token.user.userRoles && delete token.user.userRoles;
    tokenResponse.setData(token);
    tokenResponse.setStatus(Constant.SUCCESS);
  } catch (ex) {
    logger.info('HERE', ex.message);
    tokenResponse.setMessage(ex.message);
    tokenResponse.setStatus(Constant.FAIL);
  }
  return tokenResponse;
}

async function basicAuthenticationForOAuth(authHeader) {
  const authRes = new DataResponse();
  try {
    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString(
      'ascii'
    );
    const [username, password] = credentials.split(':');
    const oauthClientDetails = await getConnection().OauthClientDetails.findOne(
      {
        where: {
          clientId: username,
        },
      }
    );
    if (!oauthClientDetails) {
      authRes.setStatus(Constant.FAIL);
      authRes.setMessage('invalid authentication credential');
      return { response: authRes, errorFn: Util.getUnauthorizedRequest };
    }
    logger.info('client Secrets found');
    const validSecret = await new Promise((resolve, reject) => {
      bcrypt.compare(
        password,
        oauthClientDetails.clientSecret,
        (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        }
      );
    });
    if (!validSecret) {
      logger.info('invalid credentials');
      authRes.setStatus(Constant.FAIL);
      authRes.setMessage('invalid authentication credentials');

      return { response: authRes, errorFn: Util.getBadRequest };
    }
    logger.info('client secrets valid');
    authRes.setStatus(Constant.SUCCESS);
    return { response: authRes };
  } catch (ex) {
    logger.info('error while authenticating client secrets', ex);
    authRes.setStatus(Constant.FAIL);
    authRes.setMessage(ex.message);
    return { response: authRes, errorFn: Util.getBadRequest };
  }
}

async function basicAuthenticationForClient(req, authHeader) {
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
