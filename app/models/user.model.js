const bcrypt = require('bcrypt');
('use strict');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.belongsToMany(models.Roles, {
        through: 'user_roles',
        foreignKey: 'user_id',
        timestamps: false,
      });
      User.hasMany(models.AccessToken, {
        foreignKey: 'user_id',
      });
    }
  }
  User.init(
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
      username: {
        type: DataTypes.STRING(45),
        allowNull: false,
        unique: true,
        min: 2,
        max: 45,
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false,
        isEmail: true,
      },
      enable: {
        type: DataTypes.BOOLEAN,
        default: true,
      },
      deleted: {
        type: DataTypes.BOOLEAN,
        default: false,
      },
    },
    {
      hooks: {
        beforeCreate: hashPassword,
        beforeUpdate: hashPassword,
      },
      underscored: true,
      timestamps: true,
      freezeTableName: true,
      // define the table's name
      tableName: 'user',
      sequelize,
    }
  );
  return User;
};

async function hashPassword(user, options) {
  if (!user.changed('plainPassword')) return 0;
  user.password = user !== '' ? bcrypt.hashSync(user.password, 12) : '';
}
