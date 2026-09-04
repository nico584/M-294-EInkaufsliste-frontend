import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { CategoryDialog } from './category-dialog';
import { Category } from '../../data/category';

describe('CategoryDialog', () => {
  let component: CategoryDialog;
  let fixture: ComponentFixture<CategoryDialog>;
  let dialogRef: { close: ReturnType<typeof vi.fn> };

  const data: Category = { id: 1, name: 'Obst', description: 'Frisches Obst', color: '#4a90d9' };

  beforeEach(async () => {
    dialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [CategoryDialog],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
      teardown: { destroyAfterEach: true },
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should patch the form with the given data', () => {
    expect(component.form.value).toEqual({ name: 'Obst', description: 'Frisches Obst', color: '#4a90d9' });
  });

  it('onSave should close the dialog with the merged data when the form is valid', () => {
    component.form.patchValue({ name: 'Gemüse' });

    component.onSave();

    expect(dialogRef.close).toHaveBeenCalledWith({ ...data, name: 'Gemüse', description: 'Frisches Obst', color: '#4a90d9' });
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
