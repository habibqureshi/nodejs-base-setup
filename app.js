require('dotenv').config();
const express = require('express');
const morgan = require('./app/middlewares/morgan');
const app = express();
const cors = require('cors');
const { AuthController, CacheController } = require('./app/controller');
const Authorization = require('./app/middlewares/security/authorization');
const models = require('./app/database');
const requestLimiter = require('./app/middlewares/request-limiter');
const errorHandler = require('./app/middlewares/error-handler');
const { v4: uuid } = require('uuid');
const { logger } = require('./app/utils/logger');
const context = require('./app/utils/async-context');
const MorganFormat = require('./app/enums/morgan-format');
const Authenticate = require('./app/middlewares/security/authentication');
const Util = require('./app/utils/Util');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use((req, __, next) => {
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

app.use(Authenticate);
app.use(Authorization);
app.use(requestLimiter);
app.use('/auth', AuthController);
app.use('/cache', CacheController);
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
