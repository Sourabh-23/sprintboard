const BaseModel = require('./BaseModel');

class User extends BaseModel {
  static get tableName() {
    return 'users';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['organization_id', 'name', 'email', 'password'],
      properties: {
        id: { type: 'integer' },
        organization_id: { type: 'integer' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        email: { type: 'string', minLength: 1, maxLength: 255 },
        password: { type: 'string', minLength: 1 },
        role: { type: 'string', enum: ['owner', 'admin', 'member', 'viewer'] },
      },
    };
  }

  static get relationMappings() {
    const Organization = require('./Organization');

    return {
      organization: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: Organization,
        join: {
          from: 'users.organization_id',
          to: 'organizations.id',
        },
      },
    };
  }
}

module.exports = User;