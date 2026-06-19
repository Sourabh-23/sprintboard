const BaseModel = require('./BaseModel');

class Issue extends BaseModel {
  static get tableName() {
    return 'issues';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['organization_id', 'project_id', 'issue_number', 'title', 'created_by'],
      properties: {
        id: { type: 'integer' },
        organization_id: { type: 'integer' },
        project_id: { type: 'integer' },
        issue_number: { type: 'integer' },
        title: { type: 'string', minLength: 1, maxLength: 255 },
        description: { type: ['string', 'null'] },
        type: { type: 'string', enum: ['bug', 'story', 'task'] },
        status: { type: 'string', enum: ['todo', 'in_progress', 'done'] },
        priority: { type: 'string', enum: ['low', 'medium', 'high', 'urgent'] },
        assignee_id: { type: ['integer', 'null'] },
        created_by: { type: 'integer' },
      },
    };
  }

  static get relationMappings() {
    const Project = require('./Project');
    const User = require('./User');

    return {
      project: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Project,
        join: {
          from: 'issues.project_id',
          to: 'projects.id',
        },
      },
      assignee: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'issues.assignee_id',
          to: 'users.id',
        },
      },
      creator: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'issues.created_by',
          to: 'users.id',
        },
      },
    };
  }
}

module.exports = Issue;