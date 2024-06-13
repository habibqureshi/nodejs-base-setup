'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class City extends Model {
    static associate(models) {
      City.belongsTo(models.Country, { targetKey: 'id' });
      City.belongsTo(models.Tier, { targetKey: 'id' });
    }
  }
  City.init(
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
      enable: {
        type: DataTypes.BOOLEAN,
      },
      deleted: {
        type: DataTypes.BOOLEAN,
      },
      moovoCities: {
        type: DataTypes.BOOLEAN,
      },
    },
    {
      underscored: true,
      timestamps: true,
      freezeTableName: true,
      // define the table's name
      tableName: 'city',
      sequelize,
    }
  );
  return City;
};
