import {
  appSchema,
  tableSchema,
} from '@nozbe/watermelondb';
import {
  createTable,
  schemaMigrations,
} from '@nozbe/watermelondb/Schema/migrations';

export const mySchema = appSchema({
  version: 2,
  tables: [
    tableSchema({
      name: 'sales',
      columns: [
        { name: 'product_name', type: 'string' },
        { name: 'quantity', type: 'number' },
        { name: 'price', type: 'number' },
        { name: 'synced', type: 'boolean', isOptional: true },
      ],
    }),
    tableSchema({
      name: 'products',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'price', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'deleted', type: 'boolean' },
      ],
    }),
  ],
});

export const myMigrations = schemaMigrations({
  migrations: [
    {
      toVersion: 2,
      steps: [createTable({
        name: 'products',
        columns: [
          { name: 'name', type: 'string' },
          { name: 'price', type: 'number' },
          { name: 'updated_at', type: 'number' },
          { name: 'deleted', type: 'boolean' },
        ],
      })],
    },
  ],
});