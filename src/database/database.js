import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import Product from './models/Product';
import Sale from './models/Sale';
import { myMigrations, mySchema } from './schema';

// Create adapter
const adapter = new SQLiteAdapter({
  schema: mySchema,
  migrations: myMigrations,
});

// Create database instance
export const database = new Database({
  adapter,
  modelClasses: [Sale, Product],
});