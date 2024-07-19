const dbRepo = require('../models/db_repo');
const context = require('../utils/async-context');
const Tenant = require('../models/tenant.model');
const DBConnector = require('../utils/dbconnector');
const { logger } = require('../utils/logger');
const TenantNotFoundError = require('../utils/tenant-not-found-error');
const TenantDisableError = require('../utils/tenant-disable-error');

function getConnection() {
  if (dbRepo && context.get('db')) {
    return dbRepo[context.get('db')];
  }
  throw new Error('tenant not found');
}

async function checkTenant(tenant) {
  if (!dbRepo[tenant]) {
    logger.info('tenant not in app');
    let tenantFromDB = await Tenant.findOne({
      where: {
        tenantId: tenant,
        // enable: true,
        // deleted: false,
      },
    });
    if (!tenantFromDB) throw new TenantNotFoundError('invalid host');

    if (!tenantFromDB.enable) {
      throw new TenantDisableError(
        'Please contact support@techshipsa.com or +966553800916 to access your account'
      );
    }

    DBConnector.addSequelizeConnectionToRepo(
      dbRepo,
      tenantFromDB.tenantId,
      tenantFromDB.username,
      tenantFromDB.password,
      tenantFromDB.dataBaseName
    );
  }

  context.set('db', tenant);
}

async function initializeTenants() {
  try {
    let tenants = await Tenant.findAll({
      where: {
        enable: true,
        deleted: false,
      },
      raw: true,
    });
    tenants.forEach((tenant) =>
      DBConnector.addSequelizeConnectionToRepo(
        dbRepo,
        tenant.tenantId,
        tenant.username,
        tenant.password,
        tenant.dataBaseName
      )
    );
  } catch (err) {
    console.log(err);
  }
}

function removeTenant(tenantId) {
  if (dbRepo[tenantId]) delete dbRepo[tenantId];
}

// module.exports = async function tenantMiddleWare(req, res, next) {
//   try {
//     if (!req.headers['X-Tenant-ID'] && !req.headers['x-tenant-id']) {
//       return res
//         .status(401)
//         .json({ message: 'Tenant Id Not Found in Headers' });
//     }
//     let dbKey = req.headers['X-Tenant-ID'] || req.headers['x-tenant-id'];
//     if (!dbRepo[dbKey]) {
//       console.log('tenant not found in db repo');
//       let tenant = await Tenant.findOne({
//         where: {
//           tenantId: dbKey,
//         },
//       });
//       if (tenant) {
//         DBConnector.addSequelizeConnectionToRepo(dbRepo, dbKey);
//       } else {
//         res.status(401).json({ message: 'Tenant Not Found' });
//       }
//     }
//     console.log('current tenant: ', dbKey);
//     // console.log(dbRepo[dbKey]);
//     context.set('db', dbKey);

//     next();
//   } catch (error) {
//     next(error);
//   }
// };

module.exports = {
  getConnection,
  checkTenant,
  initializeTenants,
  removeTenant,
};
