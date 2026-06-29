const express = require('express');
const router = express.Router();
const { create, getAll, getOne, update, remove } = require('./issues.controller');
const { authenticate } = require('../auth/auth.middleware');

router.post('/', authenticate, create);
router.get('/', authenticate, getAll);
router.get('/:id', authenticate, getOne);
router.patch('/:id', authenticate, update);
router.delete('/:id', authenticate, remove);

module.exports = router;
