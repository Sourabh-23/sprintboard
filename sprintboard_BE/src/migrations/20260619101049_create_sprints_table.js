exports.up = function(knex) {
  return knex.schema
    .createTable('sprints', function(table) {
      table.increments('id').primary();
      table.integer('project_id').unsigned().notNullable();
      table.foreign('project_id').references('id').inTable('projects').onDelete('CASCADE');
      table.string('name').notNullable();
      table.text('goal');
      table.enum('status', ['planned', 'active', 'completed']).defaultTo('planned');
      table.date('start_date');
      table.date('end_date');
      table.timestamps(true, true);
    })
    .createTable('sprint_issues', function(table) {
      table.integer('sprint_id').unsigned().notNullable();
      table.foreign('sprint_id').references('id').inTable('sprints').onDelete('CASCADE');
      table.integer('issue_id').unsigned().notNullable();
      table.foreign('issue_id').references('id').inTable('issues').onDelete('CASCADE');
      table.primary(['sprint_id', 'issue_id']); // composite primary key
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTable('sprint_issues')
    .dropTable('sprints');
};