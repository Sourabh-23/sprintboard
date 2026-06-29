const {
  createSprint,
  getAllSprints,
  getSprintById,
  updateSprint,
  deleteSprint,
  startSprint,
  completeSprint,
  addIssueToSprint,
  removeIssueFromSprint,
  getSprintBoard,
} = require('./sprints.service');

const handleSprintError = (res, error) => {
  if (['Project not found', 'Sprint not found', 'Issue not found'].includes(error.message)) {
    return res.status(404).json({ message: error.message });
  }
  if ([
    'A sprint is already active in this project',
    'Only planned sprints can be started',
    'Only active sprints can be completed',
    'Issue already added to sprint',
    'Issue does not belong to this sprint',
  ].includes(error.message) || error.message.startsWith('Invalid')) {
    return res.status(400).json({ message: error.message });
  }
  return res.status(500).json({ message: 'Internal server error' });
};

const create = async (req, res) => {
  try {
    const { project_id, name, goal, start_date, end_date } = req.body;
    if (!project_id || !name) return res.status(400).json({ message: 'project_id and name are required' });
    const sprint = await createSprint({ project_id, organization_id: req.user.organization_id, name, goal, start_date, end_date });
    res.status(201).json({ message: 'Sprint created successfully', sprint });
  } catch (error) {
    return handleSprintError(res, error);
  }
};

const getAll = async (req, res) => {
  try {
    const { project_id } = req.query;
    if (!project_id) return res.status(400).json({ message: 'project_id is required' });
    const sprints = await getAllSprints({ project_id, organization_id: req.user.organization_id });
    res.status(200).json({ sprints });
  } catch (error) {
    return handleSprintError(res, error);
  }
};

const getOne = async (req, res) => {
  try {
    const sprint = await getSprintById({ sprint_id: req.params.id, organization_id: req.user.organization_id });
    res.status(200).json({ sprint });
  } catch (error) {
    return handleSprintError(res, error);
  }
};

const update = async (req, res) => {
  try {
    const sprint = await updateSprint({ sprint_id: req.params.id, organization_id: req.user.organization_id, updates: req.body });
    res.status(200).json({ message: 'Sprint updated successfully', sprint });
  } catch (error) {
    return handleSprintError(res, error);
  }
};

const remove = async (req, res) => {
  try {
    const result = await deleteSprint({ sprint_id: req.params.id, organization_id: req.user.organization_id });
    res.status(200).json(result);
  } catch (error) {
    return handleSprintError(res, error);
  }
};

const start = async (req, res) => {
  try {
    const sprint = await startSprint({ organization_id: req.user.organization_id, sprint_id: req.params.id });
    res.status(200).json({ message: 'Sprint started successfully', sprint });
  } catch (error) {
    return handleSprintError(res, error);
  }
};

const complete = async (req, res) => {
  try {
    const sprint = await completeSprint({ organization_id: req.user.organization_id, sprint_id: req.params.id });
    res.status(200).json({ message: 'Sprint completed successfully', sprint });
  } catch (error) {
    return handleSprintError(res, error);
  }
};

const addIssue = async (req, res) => {
  try {
    const { issue_id } = req.body;
    if (!issue_id) return res.status(400).json({ message: 'issue_id is required' });
    const result = await addIssueToSprint({ sprint_id: req.params.id, issue_id, organization_id: req.user.organization_id });
    res.status(200).json(result);
  } catch (error) {
    return handleSprintError(res, error);
  }
};

const removeIssue = async (req, res) => {
  try {
    const result = await removeIssueFromSprint({ sprint_id: req.params.id, issue_id: req.params.issue_id, organization_id: req.user.organization_id });
    res.status(200).json(result);
  } catch (error) {
    return handleSprintError(res, error);
  }
};

const getBoard = async (req, res) => {
  try {
    const data = await getSprintBoard({ sprint_id: req.params.id, organization_id: req.user.organization_id });
    res.status(200).json(data);
  } catch (error) {
    return handleSprintError(res, error);
  }
};

module.exports = { create, getAll, getOne, update, remove, start, complete, addIssue, removeIssue, getBoard };
