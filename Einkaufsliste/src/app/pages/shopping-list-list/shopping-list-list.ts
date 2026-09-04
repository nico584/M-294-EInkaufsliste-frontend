import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog';
import { ShoppingListDialog } from '../../components/shopping-list-dialog/shopping-list-dialog';
import { ShoppingList } from '../../data/shopping-list';
import { ShoppingListService } from '../../service/shopping-list.service';

@Component({
  selector: 'app-shopping-list-list',
  templateUrl: './shopping-list-list.html',
  styleUrl: './shopping-list-list.css',
  imports: [MatCardModule, MatIcon, MatButton, MatIconButton],
})
export class ShoppingListList implements OnInit {
  public lists: ShoppingList[] = [];

  private service = inject(ShoppingListService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.reloadData();
  }

  private reloadData(): void {
    this.service.getList().subscribe(lists => {
      this.lists = lists;
    });
  }

  async open(list: ShoppingList): Promise<void> {
    await this.router.navigate(['shoppinglists', list.id]);
  }

  add(): void {
    const dialogRef = this.dialog.open(ShoppingListDialog, {
      width: '400px',
      data: new ShoppingList(),
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.service.save(result).subscribe(() => this.reloadData());
      }
    });
  }

  edit(list: ShoppingList, event: Event): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(ShoppingListDialog, {
      width: '400px',
      data: { ...list },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.service.update(result).subscribe(() => this.reloadData());
      }
    });
  }

  delete(list: ShoppingList, event: Event): void {
    event.stopPropagation();
    const dialogRef = this.dialog.open(ConfirmDialog, {
      maxWidth: '400px',
      data: {
        title: 'Liste löschen',
        message: `Soll die Liste "${list.name}" wirklich gelöscht werden?`,
      },
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.service.delete(list.id).subscribe({
          next: response => {
            if (response.status === 200) {
              this.snackBar.open('Die Liste wurde gelöscht.', '', { duration: 4000 });
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
