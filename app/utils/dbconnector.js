const fs = require('fs');
const path = require('path');
const { Sequelize } = require('sequelize');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];
const modelsDir = path.resolve('app/models');
const oauthModelDir = path.resolve('app/security');
const context = require('../utils/async-context');
const Tenant = require('../models/tenant.model');
const { logger } = require('./logger');

let DBConnector = {
  addSequelizeConnectionToRepo: (dbRepo, dbKey, username, password, name) => {
    logger.info('initializing the database pool for :', dbKey);
    const db = {};

    let sequelize;

    sequelize = new Sequelize(name, username, password, config);

    fs.readdirSync(modelsDir)
      .filter((file) => {
        return (
          file.indexOf('.') !== 0 &&
          file !== 'index.js' &&
          file !== 'tenant.model.js' &&
          file !== 'db_repo.js' &&
          file.slice(-3) === '.js'
        );
      })
      .forEach((file) => {
        // console.log(path.join(modelsDir, file));
        // console.log(file);
        const model = require(path.join(modelsDir, file))(
          sequelize,
          Sequelize.DataTypes
        );
        // console.log(model.name);
        db[model.name] = model;
      });

    Object.keys(db).forEach((modelName) => {
      if (db[modelName].associate) {
        db[modelName].associate(db);
      }
    });

    db.sequelize = sequelize;
    db.Sequelize = Sequelize;

    dbRepo[dbKey] = db;

    return dbRepo;
  },
};

module.exports = DBConnector;
