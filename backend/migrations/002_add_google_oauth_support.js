exports.up = function(knex) {
  return knex.schema.alterTable('users', table => {
    table.string('username').nullable();
    table.string('google_id').nullable().unique();
    table.string('auth_provider').defaultTo('local'); // 'local' or 'google'
    table.string('password').nullable().alter(); // Make password nullable for Google users
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('users', table => {
    table.dropColumn('username');
    table.dropColumn('google_id');
    table.dropColumn('auth_provider');
    table.string('password').notNullable().alter(); // Revert password to not nullable
  });
};
