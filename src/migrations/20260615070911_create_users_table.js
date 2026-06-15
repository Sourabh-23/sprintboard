exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments('id').primary();
    table.integer('organization_id').unsigned().notNullable();
    table.foreign('organization_id').references('id').inTable('organizations').onDelete('CASCADE');
    table.string('name').notNullable();
    table.string('email').unique().notNullable();
    table.string('password').notNullable();
    table.enum('role', ['owner', 'admin', 'member', 'viewer']).defaultTo('member');
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};

// organization_id → Foreign key — har user ek org ka member hai
// role → owner, admin, member, viewer (RBAC)