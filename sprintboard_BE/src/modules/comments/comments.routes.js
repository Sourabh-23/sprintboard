const express = require('express');
const router = express.Router();
const { create, getAll, remove } = require('./comments.controller');
const { authenticate } = require('../auth/auth.middleware');

router.post('/', authenticate, create);
router.get('/', authenticate, getAll);
router.delete('/:id', authenticate, remove);

module.exports = router;