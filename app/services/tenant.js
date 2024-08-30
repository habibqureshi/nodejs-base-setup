const { Tenant } = require('../models');
const { logger: log } = require('../utils/logger');

const get = async (tenantId) => {
  log.info('getting tenant by host', tenantId);
  return await Tenant.findOne({ where: { tenantId } });
};

const create = async (tenant, transaction) => {
  log.info('creating tenant for host', tenant.tenantId);
  const opt = { returning: true };
  if (transaction) {
    opt.transaction = transaction;
  }
  const [tenantCreated, update] = await Tenant.upsert(tenant, opt);
  return tenantCreated;
};

const updateByName = async (tenantData, tenantName, transaction) => {
  log.info('Updating tenants with name', tenantName);
  const opt = {};
  if (transaction) opt.transaction = transaction;

  return await Tenant.update(tenantData, {
    where: { name: tenantName },
    ...opt,
  });
};

const update = async (tenant, tenantId, transaction) => {
  log.info('updating tenant to', tenant, 'by tenantId', tenantId);
  const opt = {};
  if (transaction) opt.transaction = transaction;
  return await Tenant.update(
    { tenantId: tenant },
    { where: { tenantId }, ...opt }
  );
};
module.exports = { get, create, update, updateByName };
