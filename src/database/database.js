import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import Sale from './models/Sale';
import { mySchema } from './schema';

// Create adapter
const adapter = new SQLiteAdapter({
  schema: mySchema,
});

// Create database instance
export const database = new Database({
  adapter,
  modelClasses: [Sale],
});