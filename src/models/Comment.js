const BaseModel = require('./BaseModel');

class Comment extends BaseModel {
  static get tableName() {
    return 'comments';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['issue_id', 'user_id', 'content'],
      properties: {
        id: { type: 'integer' },
        issue_id: { type: 'integer' },
        user_id: { type: 'integer' },
        content: { type: 'string', minLength: 1 },
      },
    };
  }

  static get relationMappings() {
    const Issue = require('./Issue');
    const User = require('./User');

    return {
      issue: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Issue,
        join: {
          from: 'comments.issue_id',
          to: 'issues.id',
        },
      },
      author: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'comments.user_id',
          to: 'users.id',
        },
      },
    };
  }
}

module.exports = Comment;