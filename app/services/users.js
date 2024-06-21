const { Roles, Permission, User, WareHouse } = require('../models');
const bcrypt = require('bcrypt');
const dbRepo = require('../models/db_repo');
const context = require('../utils/async-context');
const { getConnection } = require('../middlewares/tenant-manager');
const { logger } = require('../utils/logger');

const fetchUserForLogin = async (username, password, callback) => {
  const user = await getConnection().User.findOne({
    include: [
      // { model: dbRepo[dbKey].Roles, include: [dbRepo[dbKey].Permission] },
      {
        model: getConnection().Roles,
        attributes: ['id'],
        include: [
          {
            model: getConnection().Permission,
            attributes: ['name'],
          },
        ],
      },
      {
        model: getConnection().WareHouse,
        attributes: ['id', 'name'],
      },
    ],

    where: {
      username,
    },
    // raw: true,
    nest: true,
  });
  try {
    if (
      user != null &&
      (await new Promise((resolve, reject) => {
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      }))
    ) {
      // const validPassword = await bcrypt.compare(password, user.password);
      // callback(false, validPassword ? user : null);

      return user;
    } else {
      return null;
      // callback(false, null);
    }
  } catch (error) {
    logger.error(error);
  }
};

const fetchUserWithUsername = async (username) => {
  const { User, Roles, Permission } = getConnection();
  return await User.findOne({
    include: [
      {
        model: Roles,
        attributes: ['id', 'name'],
        include: [
          {
            model: Permission,
            attributes: ['name', 'endpoint'],
          },
        ],
      },
      {
        model: getConnection().WareHouse,
        attributes: ['id', 'name'],
      },
    ],

    where: {
      username,
    },
    // raw: true,
    nest: true,
  });
};

module.exports = {
  fetchUserForLogin,
  fetchUserWithUsername,
};
