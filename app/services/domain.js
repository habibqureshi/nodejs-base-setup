const { KubeConfig, NetworkingV1Api } = require('@kubernetes/client-node');
const {
  getConnection,
  removeTenant,
} = require('../middlewares/tenant-manager');
const { logger: log } = require('../utils/logger');
const TenantService = require('./tenant');
const context = require('../utils/async-context');
const Util = require('../utils/Util');
const { sequelize } = require('../database');
const { Tenant } = require('../models');
const Joi = require('joi');
const dns = require('dns/promises');

const kubeConfig = new KubeConfig();
kubeConfig.loadFromCluster();
const k8sApi = kubeConfig.makeApiClient(NetworkingV1Api);
const namespace = process.env.POD_NAMESPACE,
  ingressName = 'external';

const AddSchema = Joi.object({
  host: Joi.string().domain().required(),
}).required();

const AttachSchema = Joi.object({
  id: Joi.number().required(),
}).required();

const attach = async (req, res, next) => {
  const { error } = AttachSchema.validate(req.body);
  if (error) {
    log.info('invalid body');
    return Util.getBadRequest(error.details[0].message, res);
  }
  log.info('valid body');
  let transaction;
  let common;
  try {
    const { Domain, sequelize: tenantSequelize } = getConnection();
    transaction = await tenantSequelize.transaction();
    common = await sequelize.transaction();
    const { id } = req.body;
    const domain = await Domain.findOne({ where: { id }, transaction });
    if (!domain) {
      log.info('domain not found', id);
      return Util.getBadRequest('no domain added', res);
    }
    if (domain.verificationStatus !== 'VERIFIED') {
      log.info('domain not verified yet!', domain.record);
      return Util.getBadRequest(
        'domain not verified yet! check dns records',
        res
      );
    }
    if (domain.verificationStatus === 'ATTACHED') {
      log.info('domain already attached!', domain.record);
      return Util.getBadRequest('domain already attached', res);
    }
    // try {
    //   log.info('validating dns record');
    //   const txtRecord = await dns.resolveTxt(domain.record);
    //   validateDnsRecord(domain.content, txtRecord);
    // } catch (error) {
    //   log.error('error while validating domain', error);
    //   return Util.getBadRequest('Please verify dns record', res);
    // }
    log.info('valid dns record');

    let tenant = await TenantService.get(context.get('db'));
    if (!tenant) {
      log.info('host not found with');
      return Util.getBadRequest('Host not found ' + context.get('db'), res);
    }
    log.info('host found');
    const { name, dataBaseName, url, username, password } = tenant;
    await TenantService.create(
      { name, dataBaseName, url, username, password, tenantId: domain.record },
      common
    );
    domain.set({ verificationStatus: 'ATTACHED' });
    await domain.save({ transaction });

    log.info('reading ingress');
    const ingress = await k8sApi.readNamespacedIngress(ingressName, namespace);
    if (
      ingress.body.spec.rules.reduce(
        (val, e) => val || e.host === domain.record,
        false
      )
    ) {
      await transaction.rollback();
      await common.rollback();
      return Util.getBadRequest(
        'Domain already attached! Kindly use another domain',
        res
      );
    }
    ingress.body.spec.rules.push({
      host: domain.record,
      http: {
        paths: [
          {
            path: '/api',
            pathType: 'Prefix',
            backend: { service: { name: 'rbas', port: { number: 80 } } },
          },
          {
            path: '/docs',
            pathType: 'Prefix',
            backend: { service: { name: 'rbas', port: { number: 80 } } },
          },
          {
            path: '/',
            pathType: 'Prefix',
            backend: { service: { name: 'frontend', port: { number: 80 } } },
          },
        ],
      },
    });
    log.info('updating ingress');
    await k8sApi.replaceNamespacedIngress(ingressName, namespace, ingress.body);
    removeTenant(context.get('db'));
    await transaction.commit();
    await common.commit();
    return Util.getSimpleOkRequest('Domain added successfully', res);
  } catch (err) {
    if (transaction) await transaction.rollback();
    if (common) await common.rollback();
    log.error('error while adding domain', err);
    next(err);
  }
};

const get = async (req, res, next) => {
  const { Domain } = await getConnection();
  const data = await Domain.findAll();
  return Util.getOkRequest(data, 'domain fetched', res);
};

const create = async (req, res, next) => {
  const { error } = AddSchema.validate(req.body);
  if (error) {
    log.info('invalid body');
    return Util.getBadRequest(error.details[0].message, res);
  }
  log.info('valid body', JSON.stringify(req.body));
  const { Domain } = await getConnection();
  const data = {
    tenant: context.get('db'),
    record: req.body.host,
    content: Util.createSiteVerificationToken(),
    verificationStatus: 'PENDING',
  };
  const [create, update] = await Domain.upsert(data, { returning: true });
  return Util.getOkRequest(create.toJSON(), 'domain added', res);
};

const validateDnsRecord = (content, textRecords) => {
  const tokens = textRecords.map((record) => record.join(''));
  const valid = tokens.some((token) => token === content);
  if (!valid) {
    log.info('token not matched from', textRecords);
    throw new Error('token not validated');
  }
};

const verify = async (req, res, next) => {
  const { error } = AttachSchema.validate(req.body);
  if (error) {
    log.info('invalid body');
    return Util.getBadRequest(error.details[0].message, res);
  }
  log.info('valid body');
  const { Domain } = getConnection();
  const { id } = req.body;
  const domain = await Domain.findOne({ where: { id } });
  if (!domain) {
    log.info('domain not found', id);
    return Util.getBadRequest('no domain added', res);
  }
  if (domain.verificationStatus !== 'PENDING') {
    log.info('already verified!', domain.record);
    return Util.getBadRequest('domain already verified', res);
  }
  try {
    log.info('validating dns record');
    const txtRecord = await dns.resolveTxt(domain.record);
    validateDnsRecord(domain.content, txtRecord);
  } catch (error) {
    log.error('error while validating domain', error);
    return Util.getBadRequest('Please verify dns record', res);
  }
  log.info('valid dns');
  domain.set({ verificationStatus: 'VERIFIED' });
  await domain.save();
  log.info('domain verfied successfully');
  return Util.getOkRequest(domain, 'domain verified successfully', res);
};

module.exports = { create, get, attach, verify };
