exports.up = function(knex) {
  return knex.schema.createTable('comments', function(table) {
    table.increments('id').primary();
    table.integer('issue_id').unsigned().notNullable();
    table.foreign('issue_id').references('id').inTable('issues').onDelete('CASCADE');
    table.integer('user_id').unsigned().notNullable();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    table.text('content').notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('comments');
};