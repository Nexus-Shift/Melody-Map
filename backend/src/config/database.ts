import knex from "knex";
import dotenv from "dotenv";

dotenv.config();

const config = {
  client: "pg",
  connection: {
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || "melody_map",
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: "knex_migrations",
    directory: "../migrations",
  },
  seeds: {
    directory: "../seeds",
  },
};

export const db = knex(config);

export default config;
