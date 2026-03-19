import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';

export default class Sale extends Model {
  static table = 'sales';

  @field('product_name') productName;
  @field('quantity') quantity;
  @field('price') price;
  @field('synced') synced;
}