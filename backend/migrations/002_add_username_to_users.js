exports.up = function(knex) {
  return knex.schema.alterTable('users', table => {
    table.string('username').unique();
  });
};

exports.down = function(knex) {
  return knex.schema.alterTable('users', table => {
    table.dropColumn('username');
  });
};
