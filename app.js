require('dotenv').config();
const express = require('express');
const morgan = require('./app/middlewares/morgan');
const app = express();
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const cors = require('cors');
const {
  AuthController,
  ApiController,
  LastMileController,
  FulfillmentController,
  ManagementController,
  CacheController,
  DomainController,
  TenantSettingsController,
  InvoiceSettingsController,
} = require('./app/controller');

const apiSpec = YAML.load('./app/docs/openapi.yaml');
const models = require('./app/database');
const requestLimiter = require('./app/middlewares/request-limiter');
// const tenant = require('./app/middlewares/tenant');
// const initTenant = require('./app/middlewares/init-tenant');
const errorHandler = require('./app/middlewares/error-handler');
const { v4: uuid } = require('uuid');
const { logger } = require('./app/utils/logger');
const context = require('./app/utils/async-context');
const MorganFormat = require('./app/enums/morgan-format');
const authorizeAuthenticate = require('./app/middlewares/security/authorize-authenticate');
const Util = require('./app/utils/Util');
const {
  checkTenant,
  initializeTenants,
} = require('./app/middlewares/tenant-manager');
const TenantNotFoundError = require('./app/utils/tenant-not-found-error');
const { requestForwarder } = require('./app/middlewares/request-forwarder');
const { requestHandler } = require('./app/middlewares/request-handler');
const TenantDisableError = require('./app/utils/tenant-disable-error');
const { TenantService } = require('./app/services');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use((req, __, next) => {
  const store = new Map();
  context.run(() => {
    const reqId = uuid().replace(/-/g, '');
    req.reqId = reqId;
    context.set('requestId', reqId);
    next();
  });
});

app.use(morgan(MorganFormat.BEFORE, true, 'request starts'));
app.use(morgan(MorganFormat.AFTER, false, 'request ends'));
app.use('/health', (req, res) => {
  res.status(200).send("{status:'UP'}");
});
// (async () => {
//   await initializeTenants();
// })();
app.use(async (req, res, next) => {
  let host =
    req.query['x-host'] ||
    req.headers['x-host'] ||
    req.headers['Host'] ||
    req.headers['host'];
  try {
    if (!host) {
      logger.info('host header missing');
      throw new TenantNotFoundError('invalid host');
    }
    logger.info('finding tenant with host', host);
    await checkTenant(host);
    next();
  } catch (error) {
    if (error instanceof TenantNotFoundError) {
      logger.info('host not found with id', host);
      return Util.getUnauthorizedRequest(error.message, res);
    } else if (error instanceof TenantDisableError) {
      logger.info('tenant is disabled with id', host);
      return Util.getPaymentNecessaryRequest(error.message, res);
    }
    next(error);
  }
});
app.use('/docs', swaggerUi.serve, async (req, res, next) => {
  const tenant = await TenantService.get(context.get('db'));
  apiSpec.servers = [
    {
      url: `https://${tenant.chinaDomain || context.get('db')}`,
    },
  ];
  logger.info('servers', apiSpec.servers);
  return swaggerUi.setup(apiSpec)(req, res, next);
});

app.use('/platform/woocommerce', async (req, res, next) => {
  try {
    req.originalUrl = '/MAN' + req.originalUrl;
    await requestHandler(req, res, next, requestForwarder);
  } catch (error) {
    next(error);
  }
});

app.use('/tenant', TenantSettingsController);
app.use(authorizeAuthenticate);
app.use('/invoice', InvoiceSettingsController);
app.use('/oauth', AuthController);
app.use(requestLimiter);
app.use('/api', ApiController);
app.use('/FUL', FulfillmentController);
app.use('/LM', LastMileController);
app.use('/MAN', ManagementController);
app.use('/cache', CacheController);
app.use('/domain', DomainController);

app.use('/**', async (req, res, next) => {
  Util.getNotFoundRequest(
    'path not found with [' +
      req.originalUrl +
      '] method [' +
      req.method +
      '].',
    res
  );
});

app.use(errorHandler);

// set the authRoutes for application and & login requests
// Connecting to the DB
// sync Database
models.sequelize
  .authenticate()
  .then(() => {
    logger.info('db connection has been established successfully.');
  })
  .catch((err) => {
    logger.info('Unable to connect to the database:', err);
  });

module.exports = app;
