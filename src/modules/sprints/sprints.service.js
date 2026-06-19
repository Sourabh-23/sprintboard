const Sprint = require('../../models/Sprint');
const Project = require('../../models/Project');
const Issue = require('../../models/Issue');

const createSprint = async ({ project_id, organization_id, name, goal, start_date, end_date }) => {
  // Project exist karta hai is org mein?
  const project = await Project.query().where({ id: project_id, organization_id }).first();
  if (!project) throw new Error('Project not found');

  const sprint = await Sprint.query().insert({
    project_id,
    name,
    goal,
    start_date,
    end_date,
  });

  return sprint;
};

const startSprint = async ({ project_id, organization_id, sprint_id }) => {
  // Already active sprint hai?
  const activeSprint = await Sprint.query()
    .where({ project_id, status: 'active' })
    .first();

  if (activeSprint) throw new Error('A sprint is already active in this project');

  const sprint = await Sprint.query()
    .where({ id: sprint_id, project_id })
    .first();

  if (!sprint) throw new Error('Sprint not found');
  if (sprint.status !== 'planned') throw new Error('Only planned sprints can be started');

  const updated = await Sprint.query().patchAndFetchById(sprint_id, { status: 'active' });
  return updated;
};

const completeSprint = async ({ project_id, sprint_id }) => {
  const sprint = await Sprint.query().where({ id: sprint_id, project_id }).first();
  if (!sprint) throw new Error('Sprint not found');
  if (sprint.status !== 'active') throw new Error('Only active sprints can be completed');

  const updated = await Sprint.query().patchAndFetchById(sprint_id, { status: 'completed' });
  return updated;
};

const addIssueToSprint = async ({ sprint_id, issue_id, organization_id }) => {
  const sprint = await Sprint.query().findById(sprint_id);
  if (!sprint) throw new Error('Sprint not found');

  const issue = await Issue.query().where({ id: issue_id, organization_id }).first();
  if (!issue) throw new Error('Issue not found');

  await Sprint.relatedQuery('issues').for(sprint_id).relate(issue_id);

  return { message: 'Issue added to sprint successfully' };
};

const getSprintBoard = async ({ sprint_id, project_id }) => {
  const sprint = await Sprint.query()
    .where({ id: sprint_id, project_id })
    .withGraphFetched('issues')
    .first();

  if (!sprint) throw new Error('Sprint not found');

  // Kanban board — status ke hisaab se group karo
  const board = {
    todo: sprint.issues.filter(i => i.status === 'todo'),
    in_progress: sprint.issues.filter(i => i.status === 'in_progress'),
    done: sprint.issues.filter(i => i.status === 'done'),
  };

  return { sprint, board };
};

module.exports = { createSprint, startSprint, completeSprint, addIssueToSprint, getSprintBoard };