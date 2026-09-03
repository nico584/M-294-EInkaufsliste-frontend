import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatOption, MatSelect } from '@angular/material/select';

import { Category } from '../../data/category';
import { Item } from '../../data/item';

export interface ItemDialogData {
  item: Item;
  categories: Category[];
}

@Component({
  selector: 'app-item-dialog',
  templateUrl: './item-dialog.html',
  styleUrl: './item-dialog.css',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatHint,
    MatSelect,
    MatOption,
    MatButton,
  ],
})
export class ItemDialog {
  public categories: Category[];

  public form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(255)]),
    note: new FormControl('', [Validators.maxLength(500)]),
    quantity: new FormControl(1, [Validators.required, Validators.min(1)]),
    category: new FormControl<Category | null>(null),
  });

  public dialogRef = inject<MatDialogRef<ItemDialog>>(MatDialogRef);
  public data = inject<ItemDialogData>(MAT_DIALOG_DATA);

  constructor() {
    this.categories = this.data.categories;
    this.form.patchValue(this.data.item);
  }

  public compareCategories(o1: Category | null, o2: Category | null): boolean {
    return o1 && o2 ? o1.id === o2.id : o1 === o2;
  }

  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close({ ...this.data.item, ...this.form.value });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
