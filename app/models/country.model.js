'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Country extends Model {
    static associate(models) {
      Country.hasMany(models.City);
    }
  }
  Country.init(
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(20),
        allowNull: false,
        min: 2,
        max: 20,
      },
      code: {
        type: DataTypes.STRING(20),
        allowNull: false,
        min: 2,
        max: 15,
      },
      countryCode: {
        type: DataTypes.STRING(20),
        allowNull: false,
        min: 2,
        max: 6,
      },
      numberLenght: {
        type: DataTypes.STRING(20),
        allowNull: false,
        min: 2,
        max: 6,
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
      tableName: 'country',
      sequelize,
    }
  );
  return Country;
};
