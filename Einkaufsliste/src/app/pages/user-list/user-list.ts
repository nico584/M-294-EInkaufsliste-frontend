import { Component, inject, OnInit } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';

import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog';
import { User } from '../../data/user';
import { UserService } from '../../service/user.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.html',
  styleUrl: './user-list.css',
  imports: [MatTableModule, MatIcon, MatIconButton],
})
export class UserList implements OnInit {
  public usersDataSource = new MatTableDataSource<User>();
  public columns = ['username', 'firstName', 'lastName', 'actions'];

  private service = inject(UserService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  ngOnInit(): void {
    this.reloadData();
  }

  private reloadData(): void {
    this.service.getList().subscribe(users => {
      this.usersDataSource.data = users;
    });
  }

  delete(user: User): void {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      maxWidth: '400px',
      data: {
        title: 'Benutzer löschen',
        message: `Soll der Benutzer "${user.username}" wirklich gelöscht werden?`,
      },
    });

    dialogRef.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.service.delete(user.id).subscribe({
          next: response => {
            if (response.status === 200) {
              this.snackBar.open('Der Benutzer wurde gelöscht.', '', { duration: 4000 });
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
