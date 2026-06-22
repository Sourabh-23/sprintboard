const express = require('express');
const router = express.Router();
const { create, getAll, getOne, update, remove } = require('./projects.controller');
const { authenticate, authorize } = require('../auth/auth.middleware');

router.post('/', authenticate, authorize('owner', 'admin'), create);
router.get('/', authenticate, getAll);
router.get('/:id', authenticate, getOne);
router.patch('/:id', authenticate, authorize('owner', 'admin'), update);
router.delete('/:id', authenticate, authorize('owner', 'admin'), remove);

module.exports = router;
