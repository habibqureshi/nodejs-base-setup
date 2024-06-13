const router = require('express').Router();
const { create, get, attach, verify } = require('../services').DomainService;

router.post('', async (req, res, next) => await create(req, res, next));
router.get('', async (req, res, next) => await get(req, res, next));
router.post('/attach', async (req, res, next) => await attach(req, res, next));
router.post('/verify', async (req, res, next) => await verify(req, res, next));

module.exports = router;
