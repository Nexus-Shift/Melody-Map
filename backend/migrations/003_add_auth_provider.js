exports.up = function (knex) {
  return knex.schema.alterTable("users", (table) => {
    // Make password nullable for Google OAuth users
    table.string("password").nullable().alter();

    // Add auth_provider column with default value 'local'
    table.string("auth_provider").notNullable().defaultTo("local");

    // Add google_id column for linking Google accounts
    table.string("google_id").unique();
  });
};

exports.down = function (knex) {
  return knex.schema.alterTable("users", (table) => {
    // Revert password to non-nullable
    table.string("password").notNullable().alter();

    // Drop new columns
    table.dropColumn("auth_provider");
    table.dropColumn("google_id");
  });
};
