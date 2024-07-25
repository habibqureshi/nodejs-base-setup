const UserService = require('../services').UsersService;
const AuthService = require('../services').AuthService;
const InvalidGrantError = require('oauth2-server/lib/errors/invalid-grant-error');
const Util = require('../utils/Util');
const { logger } = require('../utils/logger');
const context = require('../utils/async-context');
const { getConnection } = require('../middlewares/tenant-manager');

module.exports = {
  // We support returning promises.
  getAccessToken: async function (bearerToken) {
    // try and get the userID from the db using the bearerToken
    logger.info('getting access token with', bearerToken);
    const token = await AuthService.getUserIDFromBearerToken(bearerToken);
    if (!token) {
      logger.info('access token not found with', bearerToken);
      return;
    }
    // console.log(token);
    await context.set('user', token.User.username);
    logger.info('user found');
    const permissionsArray = Util.makePermissionsArrayForAuthorizationFilter(
      token.User.Roles
    );

    //An array of warehouses objects Passed in the User object for the BE to store in the session against the key named userWarehouses
    const wareHouseArray = Util.makeWarehousesArray(token.User.WareHouses);
    //An array of client Ids Passed in the User object for the BE to store in the session against the key named userClients
    const clientIds = token.User.Clients
      ? token.User.Clients.map((client) => client.id)
      : [];

    try {
      const {
        id,
        name,
        username,
        password,
        createdAt,
        updatedAt,
        enable,
        Roles,
        type,
        email,
      } = token.User;
      return {
        accessToken: bearerToken,
        accessTokenExpiresAt: token.expiresAt,
        scope: null,
        client: {}, // with 'id' property
        user: {
          id,
          name,
          userName: username,
          password,
          createdAt,
          updatedAt,
          enable,
          userRoles: Roles,
          type,
          email,
          userWarehouses: wareHouseArray,
          userClients: clientIds,
        },
        permissions: permissionsArray,
      };
    } catch (error) {
      logger.error(error);
    }
  },

  getClient: function (clientID, clientSecret, callback) {
    logger.info('getting client');
    const client = {
      id: clientID,
      clientID,
      clientSecret,
      grants: ['password', 'refresh_token'],
      redirectUris: null,
    };

    callback(false, client);
  },

  grantTypeAllowed: function (clientID, grantType, callback) {
    logger.info(
      'grantTypeAllowed called and clientID is: ',
      clientID,
      ' and grantType is: ',
      grantType
    );

    callback(false, true);
  },

  // Or, async/wait (using Babel).
  getUser: async function (username, password, callback) {
    logger.info('getting user!');
    // console.log('dbKey: ', dbKey);
    const user = await UserService.fetchUserForLogin(
      username,
      password,
      callback
    );
    // console.log(user.roles);
    if (!user) {
      logger.info('user not found!');
      callback(new InvalidGrantError('bad credentials'), false);
    } else {
      context.set('user', user.username);
      callback(false, user);
    }
  },

  getRefreshToken: async function (refreshToken, callback) {
    logger.info('refreshing token with refresh_token', refreshToken);
    try {
      const token = await AuthService.getRefreshToken(refreshToken);
      if (!token) {
        logger.info('refresh token not found');
        callback('Refresh token not found', null);
      }
      context.set('user', token.user.username);
      logger.info('token refreshed for user', token.user.username);
      const returningToken = {
        ...token,
        client: { ...token.client, id: token.client.clientId },
      };
      callback(false, returningToken);
    } catch (error) {
      callback(error, null);
    }
  },

  revokeToken: function (token, cb) {
    logger.info('revoking token');
    cb(false, token);
  },

  saveToken: async function (token, client, user) {
    logger.info('saving access token', token.accessToken);
    const [accessToken] = await AuthService.saveAccessToken(
      token,
      user.id,
      'abc'
    );
    const permissionsArray = Util.makePermissionsArrayForAuthentication(
      user.Roles
    );
    const warehousesArray = Util.makeWarehousesArray(user.WareHouses);

    return {
      accessToken: accessToken.accessToken,
      tokenType: 'bearer',
      refreshToken: accessToken.refreshToken,
      expiresAt: accessToken.expiresAt,
      permissions: permissionsArray,
      email: user.email,
      type: user.type,
      username: user.username,
      name: user.name,
      user: {},
      client: {},
      id: user.id,
      warehouses: warehousesArray,
    };
  },
};
