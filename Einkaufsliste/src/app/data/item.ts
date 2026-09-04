import { Category } from './category';

export class Item {
  public id!: number;
  public name = '';
  public note = '';
  public quantity = 1;
  public done = false;
  public category: Category | null = null;
}
