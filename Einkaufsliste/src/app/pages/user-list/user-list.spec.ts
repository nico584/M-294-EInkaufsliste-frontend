import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';

import { UserList } from './user-list';
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog';
import { User } from '../../data/user';
import { UserService } from '../../service/user.service';

describe('UserList', () => {
  let component: UserList;
  let fixture: ComponentFixture<UserList>;
  let serviceStub: { getList: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  let dialog: MatDialog;
  let snackBar: MatSnackBar;

  const users: User[] = [{ id: 1, username: 'nseiler', firstName: 'Nico', lastName: 'Seiler' }];

  beforeEach(async () => {
    serviceStub = {
      getList: vi.fn().mockReturnValue(of(users)),
      delete: vi.fn().mockReturnValue(of({ status: 200 })),
    };

    await TestBed.configureTestingModule({
      imports: [UserList],
      providers: [{ provide: UserService, useValue: serviceStub }],
      teardown: { destroyAfterEach: true },
    }).compileComponents();

    fixture = TestBed.createComponent(UserList);
    component = fixture.componentInstance;
    fixture.detectChanges();

    dialog = TestBed.inject(MatDialog);
    snackBar = TestBed.inject(MatSnackBar);
  });

  it('should create and load the users', () => {
    expect(component).toBeTruthy();
    expect(serviceStub.getList).toHaveBeenCalled();
    expect(component.usersDataSource.data).toEqual(users);
  });

  it('delete should open the confirm dialog and delete on confirmation', () => {
    vi.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(true) } as never);
    const snackSpy = vi.spyOn(snackBar, 'open');

    component.delete(users[0]);

    expect(dialog.open).toHaveBeenCalledWith(ConfirmDialog, expect.any(Object));
    expect(serviceStub.delete).toHaveBeenCalledWith(users[0].id);
    expect(snackSpy).toHaveBeenCalled();
  });

  it('delete should not call the service when dismissed', () => {
    vi.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(false) } as never);

    component.delete(users[0]);

    expect(serviceStub.delete).not.toHaveBeenCalled();
  });

  it('delete should show an error message when the service reports a non-200 status', () => {
    serviceStub.delete.mockReturnValue(of({ status: 500 }));
    vi.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(true) } as never);
    const snackSpy = vi.spyOn(snackBar, 'open');

    component.delete(users[0]);

    expect(snackSpy).toHaveBeenCalledWith('Es ist ein Fehler aufgetreten.', '', { duration: 4000 });
  });

  it('delete should show an error message when the service errors', () => {
    serviceStub.delete.mockReturnValue({
      subscribe: (observer: { error: (err: unknown) => void }) => observer.error(new Error('fail')),
    });
    vi.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(true) } as never);
    const snackSpy = vi.spyOn(snackBar, 'open');

    component.delete(users[0]);

    expect(snackSpy).toHaveBeenCalledWith('Es ist ein Fehler aufgetreten.', '', { duration: 4000 });
  });
});
