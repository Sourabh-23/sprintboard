const Comment = require('../../models/Comment');
const Issue = require('../../models/Issue');
const { publishToOrganization } = require('../events/events.service');

const createComment = async ({ issue_id, user_id, organization_id, content }) => {
  // Issue exist karta hai is org mein?
  const issue = await Issue.query().where({ id: issue_id, organization_id }).first();
  if (!issue) throw new Error('Issue not found');

  const comment = await Comment.query()
    .insert({ issue_id, user_id, content })
    .returning('*');

  publishToOrganization(organization_id, 'comment.created', {
    id: comment.id,
    issue_id: comment.issue_id,
    user_id: comment.user_id,
  });

  return comment;
};

const getComments = async ({ issue_id, organization_id }) => {
  // Issue exist karta hai?
  const issue = await Issue.query().where({ id: issue_id, organization_id }).first();
  if (!issue) throw new Error('Issue not found');

  const comments = await Comment.query()
    .where({ issue_id })
    .withGraphFetched('author')
    .modifiers({
      author: (builder) => builder.select('id', 'name', 'email', 'role'),
    })
    .orderBy('created_at', 'asc');

  return comments;
};

const deleteComment = async ({ id, user_id }) => {
  const comment = await Comment.query().where({ id, user_id }).first();
  if (!comment) throw new Error('Comment not found or unauthorized');

  await Comment.query().deleteById(id);
  return { message: 'Comment deleted successfully' };
};

module.exports = { createComment, getComments, deleteComment };
