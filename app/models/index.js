const db = require('../database');
const Sequelize = db.Sequelize;
const sequelize = db.sequelize;
const User = require('./user.model')(sequelize, Sequelize.DataTypes);
const Permission = require('./permission.model')(
  sequelize,
  Sequelize.DataTypes
);
const Roles = require('./roles.model')(sequelize, Sequelize.DataTypes);
const AccessToken = require('./access_token.model')(
  sequelize,
  Sequelize.DataTypes
);
const OauthClientDetails = require('./oauth_client_details.model')(
  sequelize,
  Sequelize.DataTypes
);
// defining association
User.associate({ Roles, AccessToken });
Roles.associate({ Permission, User });
AccessToken.associate({ User });

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
  Permission,
  Roles,
  AccessToken,
  OauthClientDetails,
};
