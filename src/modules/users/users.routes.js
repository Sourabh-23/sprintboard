const express = require('express');
const router = express.Router();
const { getAll, create, updateRole } = require('./users.controller');
const { authenticate, authorize } = require('../auth/auth.middleware');

router.get('/', authenticate, getAll);
router.post('/', authenticate, authorize('owner', 'admin'), create);
router.patch('/:id/role', authenticate, authorize('owner', 'admin'), updateRole);

module.exports = router;



