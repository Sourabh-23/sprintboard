const express = require('express');
const router = express.Router();
const {
  create,
  getAll,
  getOne,
  update,
  remove,
  start,
  complete,
  addIssue,
  removeIssue,
  getBoard,
} = require('./sprints.controller');
const { authenticate, authorize } = require('../auth/auth.middleware');

router.post('/', authenticate, authorize('owner', 'admin'), create);
router.get('/', authenticate, getAll);
router.get('/:id', authenticate, getOne);
router.patch('/:id', authenticate, authorize('owner', 'admin'), update);
router.delete('/:id', authenticate, authorize('owner', 'admin'), remove);
router.patch('/:id/start', authenticate, authorize('owner', 'admin'), start);
router.patch('/:id/complete', authenticate, authorize('owner', 'admin'), complete);
router.post('/:id/issues', authenticate, addIssue);
router.delete('/:id/issues/:issue_id', authenticate, removeIssue);
router.get('/:id/board', authenticate, getBoard);

module.exports = router;
