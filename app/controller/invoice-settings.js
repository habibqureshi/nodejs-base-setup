const express = require('express');
const { logger: log } = require('../utils/logger');
const context = require('../utils/async-context');
const { get } = require('../services').TenantService;
const authorizeAuthenticate = require('../middlewares/security/authorize-authenticate');
const Util = require('../utils/Util');
const router = express.Router();
const { updateByName } = require('../services').TenantService;

router.get('/settings', authorizeAuthenticate, async (req, res, next) => {
  try {
    log.info('getting invoice settings');
    const tenant = await get(context.get('db'));
    const companyInfo = {
      enCompanyName: tenant.dataValues.enCompanyName,
      arCompanyName: tenant.dataValues.arCompanyName,
      enCompanyAddress: tenant.dataValues.enCompanyAddress,
      arCompanyAddress: tenant.dataValues.arCompanyAddress,
      accountName: tenant.dataValues.accountName,
      bankName: tenant.dataValues.bankName,
      ibanNumber: tenant.dataValues.ibanNumber,
      swiftCode: tenant.dataValues.swiftCode,
      vatNumber: tenant.dataValues.vatNumber,
    };

    return Util.getOkRequest(companyInfo, 'invoice settings found', res);
  } catch (error) {
    next(error);
  }
});

router.put('/settings', authorizeAuthenticate, async (req, res, next) => {
  try {
    log.info('Updating invoice settings');

    const tenant = await get(context.get('db'));
    const tenantName = tenant.getDataValue('name');

    await updateByName(req.body, tenantName);

    log.info(`Updated all tenants with name = ${tenantName}`);

    return Util.getOkRequest(
      null,
      'Invoice settings updated for all matching tenants',
      res
    );
  } catch (error) {
    next(error);
  }
});

module.exports = router;
