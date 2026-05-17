/**
 * Add Fiscal Year Dialog Component
 * مكون نافذة إضافة سنة مالية
 */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-add-fiscal-year-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    MatDialogModule,
    TranslateModule,
  ],
  templateUrl: './add-fiscal-year-dialog.component.html',
  styleUrl: './add-fiscal-year-dialog.component.scss',
})
export class AddFiscalYearDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<AddFiscalYearDialogComponent>);

  fiscalYearForm!: FormGroup;

  constructor() {
    this.initializeForm();
  }

  /**
   * Initialize Form
   */
  initializeForm(): void {
    this.fiscalYearForm = this.fb.group({
      year: ['', [Validators.required, Validators.min(1900), Validators.max(2100)]],
      startDate: [null, Validators.required],
      endDate: [null, Validators.required],
    }, {
      validators: this.dateRangeValidator.bind(this)
    });
  }

  /**
   * Date Range Validator
   */
  dateRangeValidator(form: FormGroup): { [key: string]: any } | null {
    const startDate = form.get('startDate')?.value;
    const endDate = form.get('endDate')?.value;

    if (startDate && endDate && startDate > endDate) {
      return { dateRangeInvalid: true };
    }

    return null;
  }

  /**
   * On Save
   */
  onSave(): void {
    if (this.fiscalYearForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.fiscalYearForm.controls).forEach(key => {
        this.fiscalYearForm.get(key)?.markAsTouched();
      });
      return;
    }

    const formValue = this.fiscalYearForm.value;
    
    // Return form data
    this.dialogRef.close({
      year: formValue.year,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
    });
  }

  /**
   * On Cancel
   */
  onCancel(): void {
    this.dialogRef.close();
  }
}

