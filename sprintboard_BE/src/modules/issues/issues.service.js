const Issue = require('../../models/Issue');
const Project = require('../../models/Project');
const Sprint = require('../../models/Sprint');
const User = require('../../models/User');
const logger = require('../../utils/logger');
const { sendIssueAssignedEmail } = require('../../utils/mailer');
const { publishToOrganization } = require('../events/events.service');

const TYPES = ['bug', 'story', 'task'];
const STATUSES = ['todo', 'in_progress', 'done'];
const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

const assertEnum = (value, allowed, field) => {
  if (value !== undefined && !allowed.includes(value)) throw new Error(`Invalid ${field}`);
};

const buildIssueKey = (issue, project) => `${project.key}-${issue.issue_number}`;

const getProject = async (organization_id, project_id) => {
  const project = await Project.query().where({ id: project_id, organization_id }).first();
  if (!project) throw new Error('Project not found');
  return project;
};

const getAssignee = async (organization_id, assignee_id) => {
  if (!assignee_id) return null;
  const user = await User.query().where({ id: assignee_id, organization_id }).first();
  if (!user) throw new Error('Assignee not found');
  return user;
};

const createIssue = async ({ organization_id, project_id, sprint_id, title, description, type, priority, assignee_id, created_by }) => {
  assertEnum(type, TYPES, 'type');
  assertEnum(priority, PRIORITIES, 'priority');

  const project = await getProject(organization_id, project_id);
  const assignee = await getAssignee(organization_id, assignee_id);

  if (sprint_id) {
    const sprint = await Sprint.query().where({ id: sprint_id, project_id }).first();
    if (!sprint) throw new Error('Sprint not found');
  }

  const lastIssue = await Issue.query().where({ project_id }).orderBy('issue_number', 'desc').first();
  const issue = await Issue.query().insert({
    organization_id,
    project_id,
    issue_number: lastIssue ? lastIssue.issue_number + 1 : 1,
    title: String(title).trim(),
    description,
    type: type || 'task',
    priority: priority || 'medium',
    assignee_id: assignee_id || null,
    created_by,
  });

  if (sprint_id) await Sprint.relatedQuery('issues').for(sprint_id).relate(issue.id);
  if (assignee) {
    sendIssueAssignedEmail({
      to: assignee.email,
      assigneeName: assignee.name,
      issueTitle: issue.title,
    }).catch((error) => logger.error('Failed to send issue assignment email', error));
  }

  publishToOrganization(organization_id, 'issue.created', {
    id: issue.id,
    title: issue.title,
    project_id: issue.project_id,
    status: issue.status,
  });

  return { ...issue, issue_key: buildIssueKey(issue, project) };
};

const getAllIssues = async ({ organization_id, project_id, status }) => {
  assertEnum(status, STATUSES, 'status');
  const project = await getProject(organization_id, project_id);

  let query = Issue.query()
    .where({ organization_id, project_id: Number(project_id) })
    .withGraphFetched('[assignee(selectSafeUser), creator(selectSafeUser)]')
    .modifiers({
      selectSafeUser: (builder) => builder.select('id', 'organization_id', 'name', 'email', 'role', 'created_at', 'updated_at'),
    });

  if (status) query = query.where({ status });
  const issues = await query.orderBy('issue_number', 'asc');
  return issues.map((issue) => ({ ...issue, issue_key: buildIssueKey(issue, project) }));
};

const getIssueById = async (organization_id, id) => {
  const issue = await Issue.query()
    .where({ organization_id, id })
    .withGraphFetched('[assignee(selectSafeUser), creator(selectSafeUser)]')
    .modifiers({
      selectSafeUser: (builder) => builder.select('id', 'organization_id', 'name', 'email', 'role', 'created_at', 'updated_at'),
    })
    .first();
  if (!issue) throw new Error('Issue not found');

  const project = await Project.query().findById(issue.project_id);
  return { ...issue, issue_key: buildIssueKey(issue, project) };
};

const updateIssue = async ({ organization_id, id, updates }) => {
  const issue = await Issue.query().where({ organization_id, id }).first();
  if (!issue) throw new Error('Issue not found');

  assertEnum(updates.status, STATUSES, 'status');
  assertEnum(updates.priority, PRIORITIES, 'priority');
  assertEnum(updates.type, TYPES, 'type');
  const assignee = await getAssignee(organization_id, updates.assignee_id);

  const allowedFields = ['title', 'description', 'status', 'priority', 'type', 'assignee_id'];
  const filteredUpdates = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) filteredUpdates[key] = key === 'title' ? String(updates[key]).trim() : updates[key];
  }

  const updated = await Issue.query().patchAndFetchById(id, filteredUpdates);

  if (assignee && updates.assignee_id !== issue.assignee_id) {
    sendIssueAssignedEmail({
      to: assignee.email,
      assigneeName: assignee.name,
      issueTitle: updated.title,
    }).catch((error) => logger.error('Failed to send issue assignment email', error));
  }

  publishToOrganization(organization_id, 'issue.updated', {
    id: updated.id,
    title: updated.title,
    project_id: updated.project_id,
    status: updated.status,
  });

  return updated;
};

const deleteIssue = async (organization_id, id) => {
  const issue = await Issue.query().where({ organization_id, id }).first();
  if (!issue) throw new Error('Issue not found');
  await Issue.query().deleteById(issue.id);
  publishToOrganization(organization_id, 'issue.deleted', {
    id: issue.id,
    project_id: issue.project_id,
  });
  return { message: 'Issue deleted successfully' };
};

module.exports = { createIssue, getAllIssues, getIssueById, updateIssue, deleteIssue };
