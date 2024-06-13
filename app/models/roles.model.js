'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Roles extends Model {
    static associate(models) {
      Roles.belongsToMany(models.User, {
        through: 'user_roles',
        foreignKey: 'role_id',
        timestamps: false,
      });
      Roles.belongsToMany(models.Permission, {
        through: 'role_permission',
        foreignKey: 'role_id',
        timestamps: false,
      });
    }
  }
  Roles.init(
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
      tableName: 'roles',
      sequelize,
    }
  );
  return Roles;
};
