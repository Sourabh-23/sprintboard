const { createProject, getAllProjects, getProjectById } = require('./projects.service');

const create = async (req, res) => {
  try {
    const { name, key, description } = req.body;

    if (!name || !key) {
      return res.status(400).json({ message: 'Name and key are required' });
    }

    const project = await createProject({
      organization_id: req.user.organization_id,
      name,
      key,
      description,
      created_by: req.user.id,
    });

    res.status(201).json({ message: 'Project created successfully', project });
  } catch (error) {
    if (error.message === 'Project key already exists in this organization') {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getAll = async (req, res) => {
  try {
    const projects = await getAllProjects(req.user.organization_id);
    res.status(200).json({ projects });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getOne = async (req, res) => {
  try {
    const project = await getProjectById(req.user.organization_id, req.params.id);
    res.status(200).json({ project });
  } catch (error) {
    if (error.message === 'Project not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { create, getAll, getOne };