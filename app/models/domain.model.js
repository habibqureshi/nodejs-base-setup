'use strict';
const { Model, DataTypes } = require('sequelize');
module.exports = (sequelize) => {
  class Domain extends Model {
    static associate(models) {}
  }
  Domain.init(
    {
      id: {
        type: DataTypes.INTEGER(11),
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      tenant: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        min: 2,
        max: 100,
      },
      record: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        min: 2,
        max: 100,
      },
      content: { type: DataTypes.STRING(100), allowNull: false },
      verificationStatus: {
        type: DataTypes.ENUM(['PENDING', 'VERFIED', 'ATTACHED']),
        defaultValue: 'PENDING',
        allowNull: false,
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
      tableName: 'domain',
      sequelize,
    }
  );
  return Domain;
};
