import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-add-tax-supplier-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MaterialModule, TranslateModule],
  template: `
    <h2 mat-dialog-title translate>إضافة مورد ضريبي</h2>
    <form [formGroup]="form" (ngSubmit)="save()" mat-dialog-content class="dialog-content">
      <mat-form-field appearance="outline" class="full-width">
        <mat-label translate>اسم الشركة</mat-label>
        <input matInput formControlName="name" />
        <mat-error *ngIf="form.get('name')?.hasError('required')" translate>
          اسم الشركة مطلوب
        </mat-error>
      </mat-form-field>

      <mat-form-field appearance="outline" class="full-width">
        <mat-label translate>الرقم الضريبي</mat-label>
        <input matInput formControlName="taxNumber" />
        <mat-error *ngIf="form.get('taxNumber')?.hasError('required')" translate>
          الرقم الضريبي مطلوب
        </mat-error>
      </mat-form-field>
    </form>
    <mat-dialog-actions align="end">
      <button mat-button (click)="close()" type="button" translate>إلغاء</button>
      <button mat-raised-button color="primary" (click)="save()" [disabled]="form.invalid" type="button" translate>
        حفظ
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-content {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding-top: 8px;
      min-width: 320px;
    }

    .full-width {
      width: 100%;
    }
  `]
})
export class AddTaxSupplierDialogComponent {
  private dialogRef = inject(MatDialogRef<AddTaxSupplierDialogComponent>);
  private fb = inject(FormBuilder);
  data = inject<any>(MAT_DIALOG_DATA, { optional: true });

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    taxNumber: ['', Validators.required]
  });

  close(): void {
    this.dialogRef.close();
  }

  save(): void {
    if (this.form.invalid) return;
    this.dialogRef.close(this.form.value);
  }
}

