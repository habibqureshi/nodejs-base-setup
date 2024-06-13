const User = require('./user.model');
const Tier = require('./tier.model');
const City = require('./city.model');
const Country = require('./country.model');
const Permission = require('./permission.model');
const Roles = require('./roles.model');
const AccessToken = require('./access_token.model');
const OauthClientDetails = require('./oauth_client_details.model');
const ClientStore = require('./client_store.model');
const Client = require('./client.model');
const Tenant = require('./tenant.model');

// AccessToken.belongsTo(User, { targetKey: 'id' });
// AccessToken.belongsTo(OauthClientDetails, {
//   targetKey: 'clientId',
//   foreignKey: 'oauth_client_details_id',
//   as: 'client',
// });

// User.belongsTo(City, {
//   foreignKey: {
//     /* use this like `sequelize.define(...)` */
//     allowNull: false,
//     defaultValue: 1,
//   },
// });
// User.belongsToMany(Roles, {
//   through: 'user_roles',
//   foreignKey: 'user_id',
//   timestamps: false,
// });
// Roles.belongsToMany(User, {
//   through: 'user_roles',
//   foreignKey: 'role_id',
//   timestamps: false,
// });

// City.belongsTo(Country, { targetKey: 'id' });
// City.belongsTo(Tier, { targetKey: 'id' });
// Country.hasMany(City);

// ClientStore.belongsTo(Client, { foreignKey: 'client_id' });
// Client.belongsTo(User, { foreignKey: 'user_id' });

// Roles.belongsToMany(Permission, {
//   through: 'role_permission',
//   foreignKey: 'role_id',
//   timestamps: false,
// });

module.exports = {
  User,
  Tier,
  City,
  Country,
  Permission,
  Roles,
  Client,
  ClientStore,
  AccessToken,
  OauthClientDetails,
  Tenant,
};
