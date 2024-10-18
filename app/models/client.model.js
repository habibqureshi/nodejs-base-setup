'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Client extends Model {
    static associate(models) {
      Client.belongsTo(models.User, { foreignKey: 'user_id' });
    }
  }
  Client.init(
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(45),
        allowNull: false,
        min: 2,
        max: 45,
      },
      clientType: {
        type: DataTypes.STRING(45),
        allowNull: false,
        min: 2,
        max: 45,
      },
      tenantClient: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
    },
    {
      underscored: true,
      timestamps: true,
      freezeTableName: true,
      tableName: 'client',
      sequelize,
    }
  );
  return Client;
};
