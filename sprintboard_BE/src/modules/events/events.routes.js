const express = require('express');
const router = express.Router();
const { stream } = require('./events.controller');
const { authenticate } = require('../auth/auth.middleware');

router.get('/', authenticate, stream);

module.exports = router;
