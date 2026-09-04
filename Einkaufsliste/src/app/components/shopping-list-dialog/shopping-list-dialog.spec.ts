import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ShoppingListDialog } from './shopping-list-dialog';
import { ShoppingList } from '../../data/shopping-list';

describe('ShoppingListDialog', () => {
  let component: ShoppingListDialog;
  let fixture: ComponentFixture<ShoppingListDialog>;
  let dialogRef: { close: ReturnType<typeof vi.fn> };

  const data: ShoppingList = { id: 1, name: 'Wocheneinkauf', description: 'Für die Woche', items: [] };

  beforeEach(async () => {
    dialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ShoppingListDialog],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
      teardown: { destroyAfterEach: true },
    }).compileComponents();

    fixture = TestBed.createComponent(ShoppingListDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should patch the form with the given data', () => {
    expect(component.form.value).toEqual({ name: 'Wocheneinkauf', description: 'Für die Woche' });
  });

  it('onSave should close the dialog with the merged data when the form is valid', () => {
    component.form.patchValue({ name: 'Fest' });

    component.onSave();

    expect(dialogRef.close).toHaveBeenCalledWith({ ...data, name: 'Fest', description: 'Für die Woche' });
  });

  it('onSave should not close the dialog when the form is invalid', () => {
    component.form.patchValue({ name: '' });

    component.onSave();

    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('onCancel should close the dialog without a result', () => {
    component.onCancel();

    expect(dialogRef.close).toHaveBeenCalledWith();
  });
});
