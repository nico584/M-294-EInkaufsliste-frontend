import { Item } from './item';

export class ShoppingList {
  public id!: number;
  public name = '';
  public description = '';
  public items: Item[] = [];
}
