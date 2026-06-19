const { createSprint, startSprint, completeSprint, addIssueToSprint, getSprintBoard } = require('./sprints.service');

const create = async (req, res) => {
  try {
    const { project_id, name, goal, start_date, end_date } = req.body;
    if (!project_id || !name) {
      return res.status(400).json({ message: 'project_id and name are required' });
    }
    const sprint = await createSprint({
      project_id,
      organization_id: req.user.organization_id,
      name,
      goal,
      start_date,
      end_date,
    });
    res.status(201).json({ message: 'Sprint created successfully', sprint });
  } catch (error) {
    if (error.message === 'Project not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

const start = async (req, res) => {
  try {
    const sprint = await startSprint({
      project_id: req.body.project_id,
      organization_id: req.user.organization_id,
      sprint_id: req.params.id,
    });
    res.status(200).json({ message: 'Sprint started successfully', sprint });
  } catch (error) {
    if (error.message === 'A sprint is already active in this project' ||
        error.message === 'Only planned sprints can be started' ||
        error.message === 'Sprint not found') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

const complete = async (req, res) => {
  try {
    const sprint = await completeSprint({
      project_id: req.body.project_id,
      sprint_id: req.params.id,
    });
    res.status(200).json({ message: 'Sprint completed successfully', sprint });
  } catch (error) {
    if (error.message === 'Only active sprints can be completed' ||
        error.message === 'Sprint not found') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

const addIssue = async (req, res) => {
  try {
    const { issue_id } = req.body;
    if (!issue_id) {
      return res.status(400).json({ message: 'issue_id is required' });
    }
    const result = await addIssueToSprint({
      sprint_id: req.params.id,
      issue_id,
      organization_id: req.user.organization_id,
    });
    res.status(200).json(result);
  } catch (error) {
    if (error.message === 'Sprint not found' || error.message === 'Issue not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getBoard = async (req, res) => {
  try {
    const { project_id } = req.query;
    if (!project_id) {
      return res.status(400).json({ message: 'project_id is required' });
    }
    const data = await getSprintBoard({
      sprint_id: req.params.id,
      project_id,
    });
    res.status(200).json(data);
  } catch (error) {
    if (error.message === 'Sprint not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { create, start, complete, addIssue, getBoard };