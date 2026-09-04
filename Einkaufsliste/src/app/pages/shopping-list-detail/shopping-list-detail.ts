import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatChip } from '@angular/material/chips';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { forkJoin } from 'rxjs';

import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog';
import { ItemDialog } from '../../components/item-dialog/item-dialog';
import { Category } from '../../data/category';
import { Item } from '../../data/item';
import { ShoppingList } from '../../data/shopping-list';
import { CategoryService } from '../../service/category.service';
import { ItemService } from '../../service/item.service';
import { ShoppingListService } from '../../service/shopping-list.service';

@Component({
  selector: 'app-shopping-list-detail',
  templateUrl: './shopping-list-detail.html',
  styleUrl: './shopping-list-detail.css',
  imports: [MatTableModule, MatCheckbox, MatChip, MatIcon, MatButton, MatIconButton],
})
export class ShoppingListDetail implements OnInit {
  public shoppingList: ShoppingList = new ShoppingList();
  public categories: Category[] = [];
  public itemsDataSource = new MatTableDataSource<Item>();
  public columns = ['done', 'name', 'quantity', 'note', 'category', 'actions'];

  private listId = 0;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private shoppingListService = inject(ShoppingListService);
  private itemService = inject(ItemService);
  private categoryService = inject(CategoryService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.listId = Number.parseInt(this.route.snapshot.paramMap.get('id') as string, 10);
    this.categoryService.getList().subscribe(categories => {
      this.categories = categories;
    });
    this.reloadData();
  }

  public reloadData(): void {
    forkJoin([this.shoppingListService.getOne(this.listId), this.itemService.getList(this.listId)]).subscribe(
      ([list, items]) => {
        this.shoppingList = list;
        this.itemsDataSource.data = items;
      }
    );
  }

  async back(): Promise<void> {
    await this.router.navigate(['shoppinglists']);
  }

  public toggleDone(item: Item): void {
    this.itemService.toggleDone(this.listId, item.id).subscribe(() => this.reloadData());
  }

  public addItem(): void {
    this.openItemDialog(new Item());
  }

  public editItem(item: Item): void {
    this.openItemDialog({ ...item });
  }

  private openItemDialog(item: Item): void {
    const dialogRef = this.dialog.open(ItemDialog, {
      width: '400px',
      data: { item, categories: this.categories },
    });

    dialogRef.afterClosed().subscribe((result: Item | undefined) => {
      if (!result) {
        return;
      }
      if (result.id) {
        this.itemService.update(this.listId, result).subscribe(() => this.reloadData());
      } else {
        this.itemService.save(this.listId, result).subscribe(() => this.reloadData());
      }
    });
  }

  public deleteItem(item: Item): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      maxWidth: '400px',
      data: {
        title: 'Artikel löschen',
        message: `Soll der Artikel "${item.name}" wirklich gelöscht werden?`,
      },
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.itemService.delete(this.listId, item.id).subscribe({
          next: response => {
            if (response.status === 200) {
              this.snackBar.open('Der Artikel wurde gelöscht.', '', { duration: 4000 });
              this.reloadData();
            } else {
              this.snackBar.open('Es ist ein Fehler aufgetreten.', '', { duration: 4000 });
            }
          },
          error: () => this.snackBar.open('Es ist ein Fehler aufgetreten.', '', { duration: 4000 }),
        });
      }
    });
  }
}
