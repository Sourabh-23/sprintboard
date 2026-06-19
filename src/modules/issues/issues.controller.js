const { createIssue ,  getAllIssues, updateIssue } = require('./issues.service');

const create = async (req, res) => {
  try {
    const { project_id, title, description, type, priority, assignee_id } = req.body;

    if (!project_id || !title) {
      return res.status(400).json({ message: 'project_id and title are required' });
    }

    const issue = await createIssue({
      organization_id: req.user.organization_id,
      project_id,
      title,
      description,
      type,
      priority,
      assignee_id,
      created_by: req.user.id,
    });

    res.status(201).json({ message: 'Issue created successfully', issue });
  } catch (error) {
    if (error.message === 'Project not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};
const getAll = async (req, res) => {
  try {
    const { project_id, status } = req.query;

    if (!project_id) {
      return res.status(400).json({ message: 'project_id is required' });
    }

    const issues = await getAllIssues({
      organization_id: req.user.organization_id,
      project_id,
      status,
    });

    res.status(200).json({ issues });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;

    const updated = await updateIssue({
      organization_id: req.user.organization_id,
      id,
      updates: req.body,
    });

    res.status(200).json({ message: 'Issue updated successfully', issue: updated });
  } catch (error) {
    if (error.message === 'Issue not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { create, getAll, update };