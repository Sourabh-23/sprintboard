exports.up = function(knex) {
  return knex.schema.createTable('issues', function(table) {
    table.increments('id').primary();
    table.integer('organization_id').unsigned().notNullable();
    table.foreign('organization_id').references('id').inTable('organizations').onDelete('CASCADE');
    table.integer('project_id').unsigned().notNullable();
    table.foreign('project_id').references('id').inTable('projects').onDelete('CASCADE');
    table.integer('issue_number').notNullable(); // SB-1, SB-2 ke liye
    table.string('title').notNullable();
    table.text('description');
    table.enum('type', ['bug', 'story', 'task']).defaultTo('task');
    table.enum('status', ['todo', 'in_progress', 'done']).defaultTo('todo');
    table.enum('priority', ['low', 'medium', 'high', 'urgent']).defaultTo('medium');
    table.integer('assignee_id').unsigned();
    table.foreign('assignee_id').references('id').inTable('users');
    table.integer('created_by').unsigned().notNullable();
    table.foreign('created_by').references('id').inTable('users');
    table.timestamps(true, true);

    table.unique(['project_id', 'issue_number']); 
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('issues');
};