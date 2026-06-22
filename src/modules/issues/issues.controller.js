const {
  createIssue,
  getAllIssues,
  getIssueById,
  updateIssue,
  deleteIssue,
} = require('./issues.service');

const isPositiveInteger = (value) => Number.isInteger(Number(value)) && Number(value) > 0;

const create = async (req, res) => {
  try {
    const { project_id, sprint_id, title, description, type, priority, assignee_id } = req.body;

    if (!project_id || !title) return res.status(400).json({ message: 'project_id and title are required' });
    if (!isPositiveInteger(project_id)) return res.status(400).json({ message: 'project_id must be a valid number' });
    if (sprint_id && !isPositiveInteger(sprint_id)) return res.status(400).json({ message: 'sprint_id must be a valid number' });
    if (assignee_id && !isPositiveInteger(assignee_id)) return res.status(400).json({ message: 'assignee_id must be a valid number' });

    const issue = await createIssue({
      organization_id: req.user.organization_id,
      project_id: Number(project_id),
      sprint_id: sprint_id ? Number(sprint_id) : null,
      title,
      description,
      type,
      priority,
      assignee_id: assignee_id ? Number(assignee_id) : null,
      created_by: req.user.id,
    });

    res.status(201).json({ message: 'Issue created successfully', issue });
  } catch (error) {
    if (['Project not found', 'Sprint not found', 'Assignee not found'].includes(error.message)) {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.startsWith('Invalid')) return res.status(400).json({ message: error.message });
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getAll = async (req, res) => {
  try {
    const { project_id, status } = req.query;
    if (!project_id) return res.status(400).json({ message: 'project_id is required' });
    if (!isPositiveInteger(project_id)) return res.status(400).json({ message: 'project_id must be a valid number' });

    const issues = await getAllIssues({
      organization_id: req.user.organization_id,
      project_id: Number(project_id),
      status,
    });

    res.status(200).json({ issues });
  } catch (error) {
    if (error.message === 'Project not found') return res.status(404).json({ message: error.message });
    if (error.message.startsWith('Invalid')) return res.status(400).json({ message: error.message });
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getOne = async (req, res) => {
  try {
    const issue = await getIssueById(req.user.organization_id, req.params.id);
    res.status(200).json({ issue });
  } catch (error) {
    if (error.message === 'Issue not found') return res.status(404).json({ message: error.message });
    res.status(500).json({ message: 'Internal server error' });
  }
};

const update = async (req, res) => {
  try {
    const updated = await updateIssue({
      organization_id: req.user.organization_id,
      id: req.params.id,
      updates: req.body,
    });
    res.status(200).json({ message: 'Issue updated successfully', issue: updated });
  } catch (error) {
    if (['Issue not found', 'Assignee not found'].includes(error.message)) return res.status(404).json({ message: error.message });
    if (error.message.startsWith('Invalid')) return res.status(400).json({ message: error.message });
    res.status(500).json({ message: 'Internal server error' });
  }
};

const remove = async (req, res) => {
  try {
    const result = await deleteIssue(req.user.organization_id, req.params.id);
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Issue not found') return res.status(404).json({ message: error.message });
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { create, getAll, getOne, update, remove };
