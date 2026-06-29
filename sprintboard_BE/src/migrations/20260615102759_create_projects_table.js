exports.up = function(knex) {
  return knex.schema.createTable('projects', function(table) {
    table.increments('id').primary();
    table.integer('organization_id').unsigned().notNullable();
    table.foreign('organization_id').references('id').inTable('organizations').onDelete('CASCADE');
    table.string('name').notNullable();
    table.string('key', 10).notNullable();
    table.text('description');
    table.integer('created_by').unsigned().notNullable();
    table.foreign('created_by').references('id').inTable('users');
    table.timestamps(true, true);

      // same org mein key unique honi chahiye
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('projects');
};
