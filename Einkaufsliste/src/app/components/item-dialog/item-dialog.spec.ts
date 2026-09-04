import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { ItemDialog, ItemDialogData } from './item-dialog';
import { Category } from '../../data/category';
import { Item } from '../../data/item';

describe('ItemDialog', () => {
  let component: ItemDialog;
  let fixture: ComponentFixture<ItemDialog>;
  let dialogRef: { close: ReturnType<typeof vi.fn> };

  const categories: Category[] = [
    { id: 1, name: 'Obst', description: '', color: '#4a90d9' },
    { id: 2, name: 'Gemüse', description: '', color: '#4a90d9' },
  ];
  const item: Item = { id: 1, name: 'Milch', note: '', quantity: 2, done: false, category: categories[0] };
  const data: ItemDialogData = { item, categories };

  beforeEach(async () => {
    dialogRef = { close: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [ItemDialog, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
      teardown: { destroyAfterEach: true },
    }).compileComponents();

    fixture = TestBed.createComponent(ItemDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the categories from the given data', () => {
    expect(component.categories).toEqual(categories);
  });

  it('should patch the form with the given item', () => {
    expect(component.form.value).toEqual({ name: 'Milch', note: '', quantity: 2, category: categories[0] });
  });

  it('compareCategories should compare categories by id', () => {
    expect(component.compareCategories(categories[0], { ...categories[0] })).toBe(true);
    expect(component.compareCategories(categories[0], categories[1])).toBe(false);
    expect(component.compareCategories(null, null)).toBe(true);
    expect(component.compareCategories(categories[0], null)).toBe(false);
  });

  it('onSave should close the dialog with the merged data when the form is valid', () => {
    component.form.patchValue({ name: 'Butter' });

    component.onSave();

    expect(dialogRef.close).toHaveBeenCalledWith({
      ...item,
      name: 'Butter',
      note: '',
      quantity: 2,
      category: categories[0],
    });
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
