import knex, { Knex } from 'knex';
import { TableRecord } from './types';
import { config } from './config';

declare module 'knex/types/tables' {
  interface Tables {
    records: TableRecord;
  }
}

const knexConfig: Knex.Config = {
  client: 'pg',
  connection: {
    host: config.db.host,
    user: config.db.user,
    password: config.db.password,
    database: config.db.database,
  },
  pool: { min: 2, max: 10 },
};

const db = knex(knexConfig);

export default db;