// const tenant = require('../middlewares/tenant');
const { getConnection } = require('../middlewares/tenant-manager');
const { AccessToken, Permission, User, Roles } = require('../models');
const context = require('../utils/async-context');

const { OauthClientDetails } = require('../models').OauthClientDetails;
const { logger } = require('../utils/logger');

const login = (req, res) => {
  logger.info('token generated');
  res.status(200).send(res.locals.oauth.token);
};

const saveAccessToken = async (token, userId, clientId) => {
  logger.info(
    `token is ${JSON.stringify(
      token
    )} user id is ${userId} client id is ${clientId}`
  );
  logger.info('expire time', token.accessTokenExpiresAt.getTime());
  return await getConnection().AccessToken.upsert(
    {
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      expiresAt: token.accessTokenExpiresAt,
      userId,
      refreshTokenExpiresAt: token.refreshTokenExpiresAt,
      oauth_client_details_id: clientId,
    },
    {
      where: { userId },
    }
  );
};

const getUserIDFromBearerToken = async (bearerToken) => {
  const token = await getConnection().AccessToken.findOne({
    where: {
      accessToken: bearerToken,
    },
    include: [
      {
        model: getConnection().User,
        include: [
          {
            model: getConnection().Roles,
            include: [{ model: getConnection().Permission }],
          },
          {
            model: getConnection().WareHouse,
          },
          {
            model: getConnection().Client,
            attributes: ['id'],
          },
        ],
      },
    ],
  });
  return token !== null ? token : null;
};

const getRefreshToken = async (refreshToken) => {
  const { AccessToken, User, OauthClientDetails, Roles, Permission } =
    getConnection();
  return AccessToken.findOne({
    where: { refreshToken },
    include: [
      {
        model: User,
        include: [{ model: Roles, include: [{ model: Permission }] }],
      },
      {
        model: OauthClientDetails,
        as: 'client',
      },
    ],
  });
};

module.exports = {
  login,
  saveAccessToken,
  getUserIDFromBearerToken,
  getRefreshToken,
};
