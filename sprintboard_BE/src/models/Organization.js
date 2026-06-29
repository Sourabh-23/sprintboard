const BaseModel = require('./BaseModel');

class Organization extends BaseModel {
  static get tableName() {
    return 'organizations';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'slug'],
      properties: {
        id: { type: 'integer' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        slug: { type: 'string', minLength: 1, maxLength: 255 },
      },
    };
  }

  static get relationMappings() {
    const User = require('./User');

    return {
      users: {
        relation: BaseModel.HasManyRelation,
        modelClass: User,
        join: {
          from: 'organizations.id',
          to: 'users.organization_id',
        },
      },
    };
  }
}

module.exports = Organization;