/**
 * Edit Fiscal Year Dialog Component
 * مكون نافذة تعديل سنة مالية
 */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { TablerIconComponent } from 'angular-tabler-icons';

export interface EditFiscalYearDialogData {
  fiscalYear: {
    year: number;
    startDate: Date;
    endDate: Date;
    status: 'upcoming' | 'current' | 'closing' | 'closed';
  };
}

@Component({
  selector: 'app-edit-fiscal-year-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    MatDialogModule,
    TranslateModule,
    TablerIconComponent,
  ],
  templateUrl: './edit-fiscal-year-dialog.component.html',
  styleUrl: './edit-fiscal-year-dialog.component.scss',
})
export class EditFiscalYearDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EditFiscalYearDialogComponent>);
  public data = inject<EditFiscalYearDialogData>(MAT_DIALOG_DATA);

  fiscalYearForm!: FormGroup;

  statusOptions = [
    { value: 'upcoming', label: 'سنة قادمة' },
    { value: 'current', label: 'سنة حالية' },
    { value: 'closing', label: 'قيد الإقفال' },
    { value: 'closed', label: 'سنة مقفلة' }
  ];

  constructor() {
    this.initializeForm();
  }

  /**
   * Initialize Form
   */
  initializeForm(): void {
    const fiscalYear = this.data.fiscalYear;

    this.fiscalYearForm = this.fb.group({
      year: [fiscalYear.year, [Validators.required, Validators.min(1900), Validators.max(2100)]],
      startDate: [fiscalYear.startDate, Validators.required],
      endDate: [fiscalYear.endDate, Validators.required],
      status: [fiscalYear.status, Validators.required],
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
      status: formValue.status,
    });
  }

  /**
   * On Cancel
   */
  onCancel(): void {
    this.dialogRef.close();
  }
}

