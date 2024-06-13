const express = require('express');
const router = express.Router();
const tokenGenerator = require('../middlewares/security/token-generator')({});

// Get the service
const AuthService = require('../services').AuthService;

/* GET the users listing function */
router.post('/token', tokenGenerator, AuthService.login);

module.exports = router;
