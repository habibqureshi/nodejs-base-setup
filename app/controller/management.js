const express = require('express');
const { requestForwarder } = require('../middlewares/request-forwarder');
const { logger } = require('../utils/logger');
const Util = require('./../utils/Util');
const { requestHandler } = require('../middlewares/request-handler');
const router = express.Router();

router.use('/**', async (req, res, next) => {
  try {
    await requestHandler(req, res, next, requestForwarder);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
