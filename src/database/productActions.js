import { generateUUID, isValidUUID } from '../utils/uuid.ts';
import { database } from './database';

const productsCollection = () => database.get('products');

export async function createLocalProduct({ name, price, id }) {
  let createdProduct;
  const normalizedId = isValidUUID(id) ? String(id) : generateUUID();

  await database.write(async () => {
    createdProduct = await productsCollection().create((product) => {
      product._raw.id = normalizedId;
      product.name = String(name).trim();
      product.price = Number(price);
      product.updatedAt = Date.now();
      product.deleted = false;
    });
  });

  return createdProduct;
}

export async function updateLocalProduct(product, { name, price }) {
  await database.write(async () => {
    await product.update((record) => {
      record.name = String(name).trim();
      record.price = Number(price);
      record.updatedAt = Date.now();
      record.deleted = false;
    });
  });
}

export async function deleteLocalProduct(product) {
  await database.write(async () => {
    await product.update((record) => {
      record.deleted = true;
      record.updatedAt = Date.now();
    });

    await product.markAsDeleted();
  });
}
