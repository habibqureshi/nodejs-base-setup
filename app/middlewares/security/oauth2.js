const OAuth2Server = require('oauth2-server');
const oAuthModel = require('../../security/oauth-token-model');
const twelveHours = 60 * 60 * 12;
let oauth;
oauth =
  oauth ||
  new OAuth2Server({
    model: oAuthModel,
    grants: ['password', 'refresh_token'],
    accessTokenLifetime: twelveHours,
    allowExtendedTokenAttributes: true,
  });

const oAuthServer = oauth;
module.exports = { oauth: oAuthServer };
