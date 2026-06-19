const BaseModel = require('./BaseModel');

class Sprint extends BaseModel {
  static get tableName() {
    return 'sprints';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['project_id', 'name'],
      properties: {
        id: { type: 'integer' },
        project_id: { type: 'integer' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        goal: { type: ['string', 'null'] },
        status: { type: 'string', enum: ['planned', 'active', 'completed'] },
        start_date: { type: ['string', 'null'] },
        end_date: { type: ['string', 'null'] },
      },
    };
  }

  static get relationMappings() {
    const Project = require('./Project');
    const Issue = require('./Issue');

    return {
      project: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Project,
        join: {
          from: 'sprints.project_id',
          to: 'projects.id',
        },
      },
      issues: {
        relation: BaseModel.ManyToManyRelation,
        modelClass: Issue,
        join: {
          from: 'sprints.id',
          through: {
            from: 'sprint_issues.sprint_id',
            to: 'sprint_issues.issue_id',
          },
          to: 'issues.id',
        },
      },
    };
  }
}

module.exports = Sprint;