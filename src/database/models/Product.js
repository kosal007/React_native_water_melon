import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class Product extends Model {
  static table = 'products';

  @field('name') name;
  @field('price') price;
  @field('updated_at') updatedAt;
  @field('deleted') deleted;
}
