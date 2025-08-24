exports.up = function(knex) {
  return knex.schema
    .createTable('users', table => {
      table.uuid('id').primary();
      table.string('email').unique().notNullable();
      table.string('password').notNullable();
      table.timestamps(true, true);
    })
    .createTable('profiles', table => {
      table.uuid('id').primary();
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('display_name');
      table.string('avatar_url');
      table.timestamps(true, true);
    })
    .createTable('platform_connections', table => {
      table.uuid('id').primary();
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.string('platform').notNullable(); // 'spotify', 'apple_music', 'deezer'
      table.string('external_id');
      table.text('access_token');
      table.text('refresh_token');
      table.timestamp('token_expires_at');
      table.boolean('is_active').defaultTo(true);
      table.timestamps(true, true);
      table.unique(['user_id', 'platform']);
    })
    .createTable('artists', table => {
      table.uuid('id').primary();
      table.string('name').notNullable();
      table.string('spotify_id');
      table.string('apple_music_id');
      table.string('deezer_id');
      table.text('image_url');
      table.jsonb('genres');
      table.timestamps(true, true);
    })
    .createTable('tracks', table => {
      table.uuid('id').primary();
      table.string('title').notNullable();
      table.uuid('artist_id').references('id').inTable('artists');
      table.string('album');
      table.integer('duration_ms');
      table.string('spotify_id');
      table.string('apple_music_id');
      table.string('deezer_id');
      table.text('image_url');
      table.jsonb('audio_features'); // tempo, energy, danceability, etc.
      table.timestamps(true, true);
    })
    .createTable('listening_history', table => {
      table.uuid('id').primary();
      table.uuid('user_id').references('id').inTable('users').onDelete('CASCADE');
      table.uuid('track_id').references('id').inTable('tracks');
      table.string('platform').notNullable();
      table.timestamp('played_at').notNullable();
      table.integer('duration_played_ms');
      table.boolean('skipped').defaultTo(false);
      table.timestamps(true, true);
      table.index(['user_id', 'played_at']);
    });
};

exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('listening_history')
    .dropTableIfExists('tracks')
    .dropTableIfExists('artists')
    .dropTableIfExists('platform_connections')
    .dropTableIfExists('profiles')
    .dropTableIfExists('users');
};
