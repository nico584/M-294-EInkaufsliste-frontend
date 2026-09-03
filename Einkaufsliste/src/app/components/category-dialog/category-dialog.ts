import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatHint, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';

import { Category } from '../../data/category';

@Component({
  selector: 'app-category-dialog',
  templateUrl: './category-dialog.html',
  styleUrl: './category-dialog.css',
  imports: [ReactiveFormsModule, MatDialogModule, MatFormField, MatLabel, MatInput, MatHint, MatButton],
})
export class CategoryDialog {
  public form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(255)]),
    description: new FormControl('', [Validators.maxLength(500)]),
    color: new FormControl('#4a90d9', [Validators.maxLength(7)]),
  });

  public dialogRef = inject<MatDialogRef<CategoryDialog>>(MatDialogRef);
  public data = inject<Category>(MAT_DIALOG_DATA);

  constructor() {
    this.form.patchValue(this.data);
  }

  onSave(): void {
    if (this.form.valid) {
      this.dialogRef.close({ ...this.data, ...this.form.value });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
