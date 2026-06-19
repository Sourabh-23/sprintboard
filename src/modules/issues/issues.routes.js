const express = require('express');
const router = express.Router();
const { create, getAll, update } = require('./issues.controller');
const { authenticate } = require('../auth/auth.middleware');

router.post('/', authenticate, create);
router.get('/', authenticate, getAll);
router.patch('/:id', authenticate, update);

module.exports = router;
