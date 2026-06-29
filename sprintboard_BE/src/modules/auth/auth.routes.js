const express = require('express');
const router = express.Router();
const { register, login, refresh } = require('./auth.controller');
const { authLimiter } = require('../../middleware/rateLimiters');

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/refresh', authLimiter, refresh);
module.exports = router;
