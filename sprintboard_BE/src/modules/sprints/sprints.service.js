const Sprint = require('../../models/Sprint');
const Project = require('../../models/Project');
const Issue = require('../../models/Issue');

const STATUSES = ['planned', 'active', 'completed'];

const assertDateRange = (start_date, end_date) => {
  if (start_date && end_date && new Date(end_date) < new Date(start_date)) throw new Error('Invalid sprint date range');
};

const getProject = async (organization_id, project_id) => {
  const project = await Project.query().where({ id: project_id, organization_id }).first();
  if (!project) throw new Error('Project not found');
  return project;
};

const getScopedSprint = async ({ organization_id, sprint_id }) => {
  const sprint = await Sprint.query()
    .alias('s')
    .join('projects as p', 's.project_id', 'p.id')
    .where('s.id', sprint_id)
    .where('p.organization_id', organization_id)
    .select('s.*')
    .first();
  if (!sprint) throw new Error('Sprint not found');
  return sprint;
};

const createSprint = async ({ project_id, organization_id, name, goal, start_date, end_date }) => {
  await getProject(organization_id, project_id);
  assertDateRange(start_date, end_date);
  return Sprint.query().insert({ project_id, name: String(name).trim(), goal, start_date, end_date });
};

const getAllSprints = async ({ project_id, organization_id }) => {
  await getProject(organization_id, project_id);
  return Sprint.query().where({ project_id }).orderBy('created_at', 'desc');
};

const getSprintById = async ({ organization_id, sprint_id }) => {
  const sprint = await getScopedSprint({ organization_id, sprint_id });
  return Sprint.query().findById(sprint.id).withGraphFetched('issues').first();
};

const updateSprint = async ({ sprint_id, organization_id, updates }) => {
  const sprint = await getScopedSprint({ organization_id, sprint_id });
  if (updates.status !== undefined && !STATUSES.includes(updates.status)) throw new Error('Invalid sprint status');
  assertDateRange(updates.start_date !== undefined ? updates.start_date : sprint.start_date, updates.end_date !== undefined ? updates.end_date : sprint.end_date);

  const allowedFields = ['name', 'goal', 'status', 'start_date', 'end_date'];
  const filteredUpdates = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) filteredUpdates[key] = key === 'name' ? String(updates[key]).trim() : updates[key];
  }
  return Sprint.query().patchAndFetchById(sprint.id, filteredUpdates);
};

const deleteSprint = async ({ sprint_id, organization_id }) => {
  const sprint = await getScopedSprint({ organization_id, sprint_id });
  await Sprint.query().deleteById(sprint.id);
  return { message: 'Sprint deleted successfully' };
};

const startSprint = async ({ organization_id, sprint_id }) => {
  const sprint = await getScopedSprint({ organization_id, sprint_id });
  const activeSprint = await Sprint.query().where({ project_id: sprint.project_id, status: 'active' }).whereNot({ id: sprint.id }).first();
  if (activeSprint) throw new Error('A sprint is already active in this project');
  if (sprint.status !== 'planned') throw new Error('Only planned sprints can be started');
  return Sprint.query().patchAndFetchById(sprint.id, { status: 'active' });
};

const completeSprint = async ({ organization_id, sprint_id }) => {
  const sprint = await getScopedSprint({ organization_id, sprint_id });
  if (sprint.status !== 'active') throw new Error('Only active sprints can be completed');
  return Sprint.query().patchAndFetchById(sprint.id, { status: 'completed' });
};

const addIssueToSprint = async ({ sprint_id, issue_id, organization_id }) => {
  const sprint = await getScopedSprint({ organization_id, sprint_id });
  const issue = await Issue.query().where({ id: issue_id, organization_id, project_id: sprint.project_id }).first();
  if (!issue) throw new Error('Issue not found');

  const alreadyAdded = await Sprint.relatedQuery('issues').for(sprint.id).where('issues.id', issue.id).first();
  if (alreadyAdded) throw new Error('Issue already added to sprint');
  await Sprint.relatedQuery('issues').for(sprint.id).relate(issue.id);
  return { message: 'Issue added to sprint successfully' };
};

const removeIssueFromSprint = async ({ sprint_id, issue_id, organization_id }) => {
  const sprint = await getScopedSprint({ organization_id, sprint_id });
  const issue = await Issue.query().where({ id: issue_id, organization_id, project_id: sprint.project_id }).first();
  if (!issue) throw new Error('Issue not found');
  const removed = await Sprint.relatedQuery('issues').for(sprint.id).unrelate().where('issues.id', issue.id);
  if (!removed) throw new Error('Issue does not belong to this sprint');
  return { message: 'Issue removed from sprint successfully' };
};

const getSprintBoard = async ({ sprint_id, organization_id }) => {
  const sprint = await getScopedSprint({ organization_id, sprint_id });
  const sprintWithIssues = await Sprint.query().findById(sprint.id).withGraphFetched('issues').first();
  const board = {
    todo: sprintWithIssues.issues.filter((issue) => issue.status === 'todo'),
    in_progress: sprintWithIssues.issues.filter((issue) => issue.status === 'in_progress'),
    done: sprintWithIssues.issues.filter((issue) => issue.status === 'done'),
  };
  return { sprint: sprintWithIssues, board };
};

module.exports = { createSprint, getAllSprints, getSprintById, updateSprint, deleteSprint, startSprint, completeSprint, addIssueToSprint, removeIssueFromSprint, getSprintBoard };
