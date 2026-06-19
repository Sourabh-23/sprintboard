const Issue = require('../../models/Issue');
const Project = require('../../models/Project');

const createIssue = async ({ organization_id, project_id, title, description, type, priority, assignee_id, created_by }) => {
  // Step 1: Project exist karta hai is org mein?
  const project = await Project.query().where({ id: project_id, organization_id }).first();
  if (!project) {
    throw new Error('Project not found');
  }

  // Step 2: Next issue_number nikalo
  const lastIssue = await Issue.query()
    .where({ project_id })
    .orderBy('issue_number', 'desc')
    .first();

  const nextIssueNumber = lastIssue ? lastIssue.issue_number + 1 : 1;

  // Step 3: Issue create karo
  const issue = await Issue.query().insert({
    organization_id,
    project_id,
    issue_number: nextIssueNumber,
    title,
    description,
    type: type || 'task',
    priority: priority || 'medium',
    assignee_id,
    created_by,
  });

  return {
    ...issue,
    issue_key: `${project.key}-${issue.issue_number}`, // SB-1
  };
};

const getAllIssues = async ({ organization_id, project_id, status }) => {
  let query = Issue.query()
    .where({ organization_id, project_id: Number(project_id) })
    .withGraphFetched('[assignee(selectSafeUser), creator(selectSafeUser)]')
    .modifiers({
      selectSafeUser: (builder) => builder.select('id', 'organization_id', 'name', 'email', 'role', 'created_at', 'updated_at'),
    });

  if (status) {
    query = query.where({ status });
  }

  const issues = await query.orderBy('issue_number', 'asc');
  const project = await Project.query().findById(project_id);

  return issues.map(issue => ({
    ...issue,
    issue_key: `${project.key}-${issue.issue_number}`,
  }));
};
const updateIssue = async ({ organization_id, id, updates }) => {
  const issue = await Issue.query().where({ organization_id, id }).first();
  if (!issue) {
    throw new Error('Issue not found');
  }

  const allowedFields = ['title', 'description', 'status', 'priority', 'type', 'assignee_id'];
  const filteredUpdates = {};
  for (const key of allowedFields) {
    if (updates[key] !== undefined) {
      filteredUpdates[key] = updates[key];
    }
  }

  const updated = await Issue.query().patchAndFetchById(id, filteredUpdates);
  return updated;
};

module.exports = { createIssue, getAllIssues, updateIssue };

