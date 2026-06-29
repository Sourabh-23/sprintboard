const Project = require('../../models/Project');

const normalizeKey = (key) => String(key).trim().toUpperCase();

const createProject = async ({ organization_id, name, key, description, created_by }) => {
  const projectKey = normalizeKey(key);
  const existing = await Project.query().where({ organization_id, key: projectKey }).first();
  if (existing) throw new Error('Project key already exists in this organization');

  return Project.query().insert({
    organization_id,
    name: String(name).trim(),
    key: projectKey,
    description,
    created_by,
  });
};

const getAllProjects = async (organization_id) => {
  return Project.query().where({ organization_id }).orderBy('created_at', 'desc');
};

const getProjectById = async (organization_id, id) => {
  const project = await Project.query().where({ organization_id, id }).first();
  if (!project) throw new Error('Project not found');
  return project;
};

const updateProject = async ({ organization_id, id, updates }) => {
  const project = await getProjectById(organization_id, id);
  const filteredUpdates = {};

  if (updates.name !== undefined) filteredUpdates.name = String(updates.name).trim();
  if (updates.description !== undefined) filteredUpdates.description = updates.description;

  if (updates.key !== undefined) {
    const projectKey = normalizeKey(updates.key);
    const existing = await Project.query()
      .where({ organization_id, key: projectKey })
      .whereNot({ id: project.id })
      .first();
    if (existing) throw new Error('Project key already exists in this organization');
    filteredUpdates.key = projectKey;
  }

  return Project.query().patchAndFetchById(project.id, filteredUpdates);
};

const deleteProject = async (organization_id, id) => {
  const project = await getProjectById(organization_id, id);
  await Project.query().deleteById(project.id);
  return { message: 'Project deleted successfully' };
};

module.exports = { createProject, getAllProjects, getProjectById, updateProject, deleteProject };
