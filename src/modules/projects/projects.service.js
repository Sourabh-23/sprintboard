const Project = require('../../models/Project');

const createProject = async ({ organization_id, name, key, description, created_by }) => {
  // Same org mein key already exist karta hai?
  const existing = await Project.query().where({ organization_id, key }).first();
  if (existing) {
    throw new Error('Project key already exists in this organization');
  }

  const project = await Project.query().insert({
    organization_id,
    name,
    key: key.toUpperCase(),
    description,
    created_by,
  });

  return project;
};

const getAllProjects = async (organization_id) => {
  const projects = await Project.query()
    .where({ organization_id })
    .orderBy('created_at', 'desc');

  return projects;
};

const getProjectById = async (organization_id, id) => {
  const project = await Project.query()
    .where({ organization_id, id })
    .first();

  if (!project) {
    throw new Error('Project not found');
  }

  return project;
};

module.exports = { createProject, getAllProjects, getProjectById };