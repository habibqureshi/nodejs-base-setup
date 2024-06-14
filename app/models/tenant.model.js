const db = require("../database");
const Sequelize = db.Sequelize;
const sequelize = db.sequelize;
const DataTypes = Sequelize.DataTypes;

const Tenant = sequelize.define(
  "tenant",
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
      unique: true,
      min: 2,
      max: 45,
    },
    dataBaseName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      min: 1,
      max: 500,
    },
    url: {
      type: DataTypes.STRING(450),
      allowNull: false,
      min: 2,
      max: 45,
    },
    username: {
      type: DataTypes.STRING(45),
      allowNull: false,
      min: 2,
      max: 45,
    },
    password: {
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
    tenantId: {
      type: DataTypes.STRING(45),
      allowNull: false,
      unique: true,
    },
    settings: {
      type: DataTypes.JSON(),
      allowNull: true,
    },
  },
  {
    underscored: true,
    timestamps: true,
    freezeTableName: true,
    // define the table's name
    tableName: "tenant",
  }
);

module.exports = Tenant;
