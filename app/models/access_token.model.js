'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AccessToken extends Model {
    static associate(models) {
      AccessToken.belongsTo(models.User, {
        targetKey: 'id',
        foreignKey: 'user_id',
      });
    }
  }
  AccessToken.init(
    {
      id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      accessToken: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      refreshToken: {
        type: DataTypes.STRING(255),
        allowNull: true,
        default: null,
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: true,
        default: Date.now() + 86400,
      },
      refreshTokenExpiresAt: { type: DataTypes.DATE, allowNull: false },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      underscored: true,
      timestamps: false,
      freezeTableName: true,
      sequelize,
      tableName: 'access_tokens',
    }
  );
  return AccessToken;
};
