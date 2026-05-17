import { CommonModule } from '@angular/common';
import { Component, Inject, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import {
  MY_SERVICE_TYPE_OPTIONS,
  MY_SERVICE_CITY_OPTIONS,
  MyServiceFormValue,
  createMyServiceFormValue,
  MyService,
} from '../my-service.mock';
import { MyServicesService } from '../my-services.service';
import { SeroDropdownComponent } from '../../../../shared/components/sero-dropdown/sero-dropdown.component';

@Component({
  selector: 'app-my-services-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    SeroDropdownComponent,
  ],
  template: `
    <div class="form-dialog" dir="rtl">
      <h2 class="dialog-title">
        {{ data.mode === 'add' ? 'إضافة خدمة جديدة' : 'تعديل الخدمة' }}
      </h2>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="service-form">
        <!-- ── From/To Row ── -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">من</label>
            <input
              type="text"
              class="form-control"
              formControlName="from"
              placeholder="نقطة الانطلاق"
              required />
            @if (form.get('from')?.invalid && form.get('from')?.touched) {
              <span class="error-message">هذا الحقل مطلوب</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label">إلى</label>
            <input
              type="text"
              class="form-control"
              formControlName="to"
              placeholder="نقطة الوصول"
              required />
            @if (form.get('to')?.invalid && form.get('to')?.touched) {
              <span class="error-message">هذا الحقل مطلوب</span>
            }
          </div>
        </div>

        <!-- ── Service Type & City Row ── -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">نوع الخدمة</label>
            <app-sero-dropdown
              [options]="serviceTypeOptions"
              [value]="form.get('serviceType')?.value || ''"
              placeholder="اختر نوع الخدمة"
              (valueChange)="form.get('serviceType')?.setValue($event)">
            </app-sero-dropdown>
            @if (form.get('serviceType')?.invalid && form.get('serviceType')?.touched) {
              <span class="error-message">هذا الحقل مطلوب</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label">المدينة</label>
            <app-sero-dropdown
              [options]="serviceCityOptions"
              [value]="form.get('serviceCity')?.value || ''"
              placeholder="اختر المدينة"
              (valueChange)="form.get('serviceCity')?.setValue($event)">
            </app-sero-dropdown>
            @if (form.get('serviceCity')?.invalid && form.get('serviceCity')?.touched) {
              <span class="error-message">هذا الحقل مطلوب</span>
            }
          </div>
        </div>

        <!-- ── Description ── -->
        <div class="form-group">
          <label class="form-label">الوصف</label>
          <textarea
            class="form-control form-control--textarea"
            formControlName="description"
            placeholder="اكتب وصف الخدمة"
            rows="3"></textarea>
        </div>

        <!-- ── Price & Status Row ── -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">السعر</label>
            <input
              type="number"
              class="form-control"
              formControlName="price"
              placeholder="0.00"
              min="0"
              step="0.01"
              required />
            @if (form.get('price')?.invalid && form.get('price')?.touched) {
              <span class="error-message">هذا الحقل مطلوب</span>
            }
          </div>

          <div class="form-group">
            <label class="form-label">الحالة</label>
            <select class="form-control" formControlName="status" required>
              <option value="">اختر الحالة</option>
              <option value="active">نشط</option>
              <option value="inactive">غير نشط</option>
              <option value="pending">قيد الانتظار</option>
            </select>
            @if (form.get('status')?.invalid && form.get('status')?.touched) {
              <span class="error-message">هذا الحقل مطلوب</span>
            }
          </div>
        </div>

        <!-- ── Images Upload (Placeholder) ── -->
        <div class="form-group">
          <label class="form-label">الصور</label>
          <div class="image-upload-placeholder">
            <span class="material-icons-round">image</span>
            <p>اسحب الصور هنا أو اضغط للاختيار</p>
            <input type="file" hidden multiple accept="image/*" (change)="onImagesSelected($event)" />
          </div>
          <div class="images-list">
            @if (uploadedImages().length > 0) {
              <div class="images-header">
                <p>الصور المرفوعة:</p>
              </div>
              @for (img of uploadedImages(); track img) {
                <div class="image-item">
                  <span>{{ img.name }}</span>
                  <button type="button" class="btn-remove" (click)="removeImage(img.name)">
                    <span class="material-icons-round">close</span>
                  </button>
                </div>
              }
            }
          </div>
        </div>

        <!-- ── Form Actions ── -->
        <div class="form-actions">
          <button type="button" class="btn btn--secondary" (click)="onCancel()">إلغاء</button>
          <button type="submit" class="btn btn--primary" [disabled]="form.invalid || isSubmitting()">
            @if (isSubmitting()) {
              <span class="material-icons-round spinner">hourglass_top</span>
            } @else {
              <span class="material-icons-round">{{ data.mode === 'add' ? 'add' : 'save' }}</span>
            }
            {{ data.mode === 'add' ? 'إضافة' : 'حفظ' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .form-dialog {
        padding: 24px;
      }

      .dialog-title {
        margin: 0 0 24px;
        font-size: 20px;
        font-weight: 600;
        color: var(--sero-text-primary);
      }

      .service-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .form-label {
        font-size: 13px;
        font-weight: 500;
        color: var(--sero-text-primary);
      }

      .form-control {
        padding: 10px 12px;
        border: 1px solid var(--sero-border);
        border-radius: 6px;
        font-size: 14px;
        font-family: inherit;
        background: var(--sero-input-bg);
        color: var(--sero-text-primary);
        transition: border-color 0.3s ease;
      }

      .form-control:focus {
        outline: none;
        border-color: var(--sero-primary);
        box-shadow: 0 0 0 3px rgba(58, 71, 42, 0.1);
      }

      .form-control--textarea {
        resize: vertical;
        min-height: 80px;
      }

      .error-message {
        font-size: 12px;
        color: #dc3545;
        margin-top: 4px;
      }

      .image-upload-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 40px 20px;
        border: 2px dashed var(--sero-border);
        border-radius: 8px;
        background: var(--sero-bg-hover);
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .image-upload-placeholder:hover {
        border-color: var(--sero-primary);
        background: rgba(58, 71, 42, 0.05);
      }

      .image-upload-placeholder .material-icons-round {
        font-size: 48px;
        color: var(--sero-text-secondary);
        margin-bottom: 8px;
      }

      .image-upload-placeholder p {
        margin: 0;
        font-size: 14px;
        color: var(--sero-text-secondary);
      }

      .images-list {
        margin-top: 12px;
      }

      .images-header {
        margin-bottom: 8px;
      }

      .images-header p {
        margin: 0;
        font-size: 13px;
        font-weight: 500;
        color: var(--sero-text-primary);
      }

      .image-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 8px 12px;
        background: var(--sero-bg-hover);
        border-radius: 6px;
        margin-bottom: 6px;
        font-size: 13px;
      }

      .btn-remove {
        background: none;
        border: none;
        color: #dc3545;
        cursor: pointer;
        padding: 0;
        display: inline-flex;
        align-items: center;
      }

      .btn-remove .material-icons-round {
        font-size: 18px;
      }

      .form-actions {
        display: flex;
        gap: 12px;
        margin-top: 24px;
        justify-content: flex-end;
      }

      .btn {
        padding: 10px 20px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .btn--primary {
        background: var(--sero-primary);
        color: white;
      }

      .btn--primary:hover:not(:disabled) {
        background: var(--sero-primary-dark);
      }

      .btn--secondary {
        background: var(--sero-bg-hover);
        color: var(--sero-text-primary);
      }

      .btn--secondary:hover {
        background: var(--sero-border);
      }

      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .spinner {
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      @media (max-width: 600px) {
        .form-row {
          grid-template-columns: 1fr;
        }

        .form-dialog {
          padding: 16px;
        }
      }
    `,
  ],
})
export class MyServicesFormComponent {
  form: FormGroup;
  isSubmitting = signal(false);
  uploadedImages = signal<{ name: string }[]>([]);

  serviceTypeOptions = MY_SERVICE_TYPE_OPTIONS.filter((o) => o.value !== '');
  serviceCityOptions = MY_SERVICE_CITY_OPTIONS.filter((o) => o.value !== '');

  private fb = inject(FormBuilder);
  private api = inject(MyServicesService);

  constructor(
    public dialogRef: MatDialogRef<MyServicesFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'add' | 'edit'; service?: MyService }
  ) {
    this.form = this.fb.group({
      from: ['', Validators.required],
      to: ['', Validators.required],
      serviceType: ['', Validators.required],
      serviceCity: ['', Validators.required],
      description: [''],
      price: [null, [Validators.required, Validators.min(0)]],
      status: ['active', Validators.required],
    });

    if (data.mode === 'edit' && data.service) {
      this.form.patchValue({
        from: data.service.from,
        to: data.service.to,
        serviceType: data.service.serviceType,
        serviceCity: data.service.serviceCity,
        description: data.service.description,
        price: data.service.price,
        status: data.service.status,
      });
      this.uploadedImages.set(data.service.images.map((img) => ({ name: img })));
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }

    this.isSubmitting.set(true);
    const formValue: MyServiceFormValue = {
      ...this.form.value,
      images: this.uploadedImages().map((img) => img.name),
    };

    if (this.data.mode === 'add') {
      this.api.createService(formValue).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Error creating service:', err);
          this.isSubmitting.set(false);
        },
      });
    } else {
      this.api.updateService(this.data.service!.id, formValue).subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Error updating service:', err);
          this.isSubmitting.set(false);
        },
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onImagesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const newImages = Array.from(input.files).map((file) => ({ name: file.name }));
      this.uploadedImages.set([...this.uploadedImages(), ...newImages]);
    }
  }

  removeImage(name: string): void {
    this.uploadedImages.set(this.uploadedImages().filter((img) => img.name !== name));
  }
}
