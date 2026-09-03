import { Component, inject, OnInit } from '@angular/core';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { AppRoles } from '../../app.roles';
import { IsInRolesDirective } from '../../directives/app-is-in-roles.dir';
import { CategoryDialog } from '../../components/category-dialog/category-dialog';
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog';
import { Category } from '../../data/category';
import { CategoryService } from '../../service/category.service';

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.html',
  styleUrl: './category-list.css',
  imports: [IsInRolesDirective, MatTableModule, MatIcon, MatButton, MatIconButton],
})
export class CategoryList implements OnInit {
  public categoriesDataSource = new MatTableDataSource<Category>();
  public columns = ['color', 'name', 'description', 'actions'];

  public get roles() {
    return AppRoles;
  }

  private service = inject(CategoryService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.reloadData();
  }

  private reloadData(): void {
    this.service.getList().subscribe(categories => {
      this.categoriesDataSource.data = categories;
    });
  }

  add(): void {
    const dialogRef = this.dialog.open(CategoryDialog, {
      width: '400px',
      data: new Category(),
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.service.save(result).subscribe(() => this.reloadData());
      }
    });
  }

  edit(category: Category): void {
    const dialogRef = this.dialog.open(CategoryDialog, {
      width: '400px',
      data: { ...category },
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.service.update(result).subscribe(() => this.reloadData());
      }
    });
  }

  delete(category: Category): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      maxWidth: '400px',
      data: {
        title: 'Kategorie löschen',
        message: `Soll die Kategorie "${category.name}" wirklich gelöscht werden?`,
      },
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.service.delete(category.id).subscribe({
          next: response => {
            if (response.status === 200) {
              this.snackBar.open('Die Kategorie wurde gelöscht.', '', { duration: 4000 });
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
