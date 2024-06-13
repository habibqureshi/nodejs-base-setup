'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ClientStore extends Model {
    static associate(models) {
      ClientStore.belongsTo(models.Client, { foreignKey: 'client_id' });
    }
  }
  ClientStore.init(
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      store: {
        type: DataTypes.STRING(255),
        allowNull: false,
        min: 2,
        max: 255,
      },
    },
    {
      underscored: true,
      timestamps: true,
      freezeTableName: true,
      tableName: 'client_store',
      sequelize,
    }
  );
  return ClientStore;
};
