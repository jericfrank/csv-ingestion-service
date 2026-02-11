import knex, { Knex } from 'knex';
import { TableRecord, TableName } from './types';
import { config } from './config';

interface Tables {
  [TableName]: TableRecord;
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

const db = knex(knexConfig) as Knex<Tables, any>;

export default db;