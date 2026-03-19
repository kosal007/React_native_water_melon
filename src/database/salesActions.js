import { database } from './database';

const salesCollection = () => database.get('sales');

/**
 * Insert a new Sale record into the local SQLite database via WatermelonDB.
 * All writes MUST happen inside database.write() to guarantee atomicity.
 *
 * @param {string} productName
 * @param {string|number} quantity
 * @param {string|number} price
 */
export async function addSale(productName, quantity, price) {
  await database.write(async () => {
    await salesCollection().create((sale) => {
      sale.productName = String(productName).trim();
      sale.quantity    = Number(quantity);
      sale.price       = Number(price);
      sale.synced      = false; // offline-first: not synced yet
    });
  });
}

/**
 * Permanently delete a Sale record from the local database.
 *
 * @param {Sale} sale  - WatermelonDB model instance
 */
export async function deleteSale(sale) {
  await database.write(async () => {
    await sale.destroyPermanently();
  });
}

/**
 * Mark a sale as synced (called after a successful server push).
 *
 * @param {Sale} sale
 */
export async function markSaleSynced(sale) {
  await database.write(async () => {
    await sale.update((s) => {
      s.synced = true;
    });
  });
}
