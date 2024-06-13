'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Permission extends Model {
    static associate(models) {}
  }
  Permission.init(
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(40),
        allowNull: false,
        min: 2,
        max: 40,
      },
      endpoint: {
        type: DataTypes.STRING(100),
        allowNull: false,
        min: 2,
        max: 100,
      },
      enable: {
        type: DataTypes.BOOLEAN,
      },
      deleted: {
        type: DataTypes.BOOLEAN,
      },
    },
    {
      underscored: true,
      timestamps: true,
      freezeTableName: true,
      // define the table's name
      tableName: 'permission',
      sequelize,
    }
  );
  return Permission;
};
