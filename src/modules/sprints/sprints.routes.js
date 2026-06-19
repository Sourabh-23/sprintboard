const express = require('express');
const router = express.Router();
const { create, start, complete, addIssue, getBoard } = require('./sprints.controller');
const { authenticate, authorize } = require('../auth/auth.middleware');

router.post('/', authenticate, authorize('owner', 'admin'), create);
router.patch('/:id/start', authenticate, authorize('owner', 'admin'), start);
router.patch('/:id/complete', authenticate, authorize('owner', 'admin'), complete);
router.post('/:id/issues', authenticate, addIssue);
router.get('/:id/board', authenticate, getBoard);

module.exports = router;