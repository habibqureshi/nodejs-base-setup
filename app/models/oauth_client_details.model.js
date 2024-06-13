'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class OauthClientDetails extends Model {
    static associate(models) {}
  }
  OauthClientDetails.init(
    {
      clientId: {
        type: DataTypes.STRING(256),
        allowNull: false,
        primaryKey: true,
      },
      resourceIds: {
        type: DataTypes.STRING(256),
        allowNull: true,
        default: null,
      },
      clientSecret: {
        type: DataTypes.STRING(256),
        allowNull: true,
        default: null,
      },
      scope: {
        type: DataTypes.STRING(256),
        allowNull: true,
        default: null,
      },
      authorizedGrantTypes: {
        type: DataTypes.STRING(256),
        allowNull: true,
        default: null,
      },
      webServerRedirectUri: {
        type: DataTypes.STRING(256),
        allowNull: true,
        default: null,
      },
      authorities: {
        type: DataTypes.STRING(256),
        allowNull: true,
        default: null,
      },
      accessTokenValidity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        default: null,
      },
      refreshTokenValidity: {
        type: DataTypes.STRING(256),
        allowNull: true,
        default: null,
      },
      additionalInformation: {
        type: DataTypes.STRING(4096),
        allowNull: true,
        default: null,
      },
      autoapprove: {
        type: DataTypes.STRING(256),
        allowNull: true,
        default: null,
      },
    },
    {
      underscored: true,
      timestamps: false,
      freezeTableName: true,
      // define the table's name
      tableName: 'oauth_client_details',
      sequelize,
    }
  );
  return OauthClientDetails;
};
