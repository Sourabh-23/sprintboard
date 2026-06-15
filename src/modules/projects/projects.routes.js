const express = require('express');
const router = express.Router();
const { create, getAll, getOne } = require('./projects.controller');
const { authenticate, authorize } = require('../auth/auth.middleware');

router.post('/', authenticate, authorize('owner', 'admin'), create);
router.get('/', authenticate, getAll);
router.get('/:id', authenticate, getOne);

module.exports = router;