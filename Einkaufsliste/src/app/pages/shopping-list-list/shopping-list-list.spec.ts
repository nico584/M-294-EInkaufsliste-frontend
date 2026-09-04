import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';

import { ShoppingListList } from './shopping-list-list';
import { ConfirmDialog } from '../../components/confirm-dialog/confirm-dialog';
import { ShoppingListDialog } from '../../components/shopping-list-dialog/shopping-list-dialog';
import { ShoppingList } from '../../data/shopping-list';
import { ShoppingListService } from '../../service/shopping-list.service';
import { routes } from '../../app.routes';

describe('ShoppingListList', () => {
  let component: ShoppingListList;
  let fixture: ComponentFixture<ShoppingListList>;
  let serviceStub: {
    getList: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
    update: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
  };
  let dialog: MatDialog;
  let snackBar: MatSnackBar;

  const lists: ShoppingList[] = [{ id: 1, name: 'Wocheneinkauf', description: '', items: [] }];

  beforeEach(async () => {
    serviceStub = {
      getList: vi.fn().mockReturnValue(of(lists)),
      save: vi.fn().mockReturnValue(of(lists[0])),
      update: vi.fn().mockReturnValue(of(lists[0])),
      delete: vi.fn().mockReturnValue(of({ status: 200 })),
    };

    await TestBed.configureTestingModule({
      imports: [ShoppingListList],
      providers: [{ provide: ShoppingListService, useValue: serviceStub }, provideRouter(routes)],
      teardown: { destroyAfterEach: true },
    }).compileComponents();

    fixture = TestBed.createComponent(ShoppingListList);
    component = fixture.componentInstance;
    fixture.detectChanges();

    dialog = TestBed.inject(MatDialog);
    snackBar = TestBed.inject(MatSnackBar);
  });

  it('should create and load the shopping lists', () => {
    expect(component).toBeTruthy();
    expect(serviceStub.getList).toHaveBeenCalled();
    expect(component.lists).toEqual(lists);
  });

  it('open should navigate to the shopping list detail page', async () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    await component.open(lists[0]);

    expect(navigateSpy).toHaveBeenCalledWith(['shoppinglists', lists[0].id]);
  });

  it('add should open the shopping list dialog and save on confirmation', () => {
    vi.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(lists[0]) } as never);

    component.add();

    expect(dialog.open).toHaveBeenCalledWith(ShoppingListDialog, expect.objectContaining({ data: new ShoppingList() }));
    expect(serviceStub.save).toHaveBeenCalledWith(lists[0]);
  });

  it('add should do nothing when the dialog is dismissed', () => {
    vi.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(undefined) } as never);

    component.add();

    expect(serviceStub.save).not.toHaveBeenCalled();
  });

  it('edit should stop propagation, open the dialog and update on confirmation', () => {
    vi.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(lists[0]) } as never);
    const event = { stopPropagation: vi.fn() } as unknown as Event;

    component.edit(lists[0], event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(dialog.open).toHaveBeenCalledWith(ShoppingListDialog, expect.objectContaining({ data: { ...lists[0] } }));
    expect(serviceStub.update).toHaveBeenCalledWith(lists[0]);
  });

  it('delete should stop propagation, open the confirm dialog and delete on confirmation', () => {
    vi.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(true) } as never);
    const snackSpy = vi.spyOn(snackBar, 'open');
    const event = { stopPropagation: vi.fn() } as unknown as Event;

    component.delete(lists[0], event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(dialog.open).toHaveBeenCalledWith(ConfirmDialog, expect.any(Object));
    expect(serviceStub.delete).toHaveBeenCalledWith(lists[0].id);
    expect(snackSpy).toHaveBeenCalled();
  });

  it('delete should not call the service when dismissed', () => {
    vi.spyOn(dialog, 'open').mockReturnValue({ afterClosed: () => of(false) } as never);
    const event = { stopPropagation: vi.fn() } as unknown as Event;

    component.delete(lists[0], event);

    expect(serviceStub.delete).not.toHaveBeenCalled();
  });
});
