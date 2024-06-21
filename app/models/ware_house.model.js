"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class WareHouse extends Model {
    static associate(models) {
      WareHouse.belongsToMany(models.User, {
        through: "warehouse_users",
        foreignKey: "warehouse_id",
        timestamps: false,
      });
    }
  }
  WareHouse.init(
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
      tableName: "ware_house",
      sequelize,
    }
  );
  return WareHouse;
};
