const BaseModel = require('./BaseModel');

class Project extends BaseModel {
  static get tableName() {
    return 'projects';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['organization_id', 'name', 'key', 'created_by'],
      properties: {
        id: { type: 'integer' },
        organization_id: { type: 'integer' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        key: { type: 'string', minLength: 1, maxLength: 10 },
        description: { type: ['string', 'null'] },
        created_by: { type: 'integer' },
      },
    };
  }

  static get relationMappings() {
    const Organization = require('./Organization');
    const User = require('./User');

    return {
      organization: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Organization,
        join: {
          from: 'projects.organization_id',
          to: 'organizations.id',
        },
      },
      creator: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: User,
        join: {
          from: 'projects.created_by',
          to: 'users.id',
        },
      },
    };
  }
}

module.exports = Project;