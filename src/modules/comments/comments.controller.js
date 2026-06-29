const { createComment, getComments, deleteComment } = require('./comments.service');

const isPositiveInteger = (value) => Number.isInteger(Number(value)) && Number(value) > 0;

const create = async (req, res) => {
  try {
    const { issue_id, content } = req.body;
    if (!issue_id || !content) {
      return res.status(400).json({ message: 'issue_id and content are required' });
    }
    if (!isPositiveInteger(issue_id)) {
      return res.status(400).json({ message: 'issue_id must be a positive integer' });
    }
    const comment = await createComment({
      issue_id: Number(issue_id),
      user_id: req.user.id,
      organization_id: req.user.organization_id,
      content,
    });
    res.status(201).json({ message: 'Comment added successfully', comment });
  } catch (error) {
    if (error.message === 'Issue not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getAll = async (req, res) => {
  try {
    const { issue_id } = req.query;
    if (!issue_id) {
      return res.status(400).json({ message: 'issue_id is required' });
    }
    if (!isPositiveInteger(issue_id)) {
      return res.status(400).json({ message: 'issue_id must be a positive integer' });
    }
    const comments = await getComments({
      issue_id: Number(issue_id),
      organization_id: req.user.organization_id,
    });
    res.status(200).json({ comments });
  } catch (error) {
    if (error.message === 'Issue not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

const remove = async (req, res) => {
  try {
    const result = await deleteComment({
      id: req.params.id,
      user_id: req.user.id,
    });
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Comment not found or unauthorized') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { create, getAll, remove };
