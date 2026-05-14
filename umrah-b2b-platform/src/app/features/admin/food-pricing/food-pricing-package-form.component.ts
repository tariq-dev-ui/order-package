import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SeroDatePickerComponent } from '../../../shared/components/sero-date-picker/sero-date-picker.component';
import { SeroDropdownComponent, SeroDropdownOption } from '../../../shared/components/sero-dropdown/sero-dropdown.component';
import { FoodPricingPackageModel } from './food-pricing.mock';

type FoodPricingPackageFormControls = {
  code: FormControl<string>;
  title: FormControl<string>;
  cateringCompany: FormControl<string>;
  startDate: FormControl<string>;
  endDate: FormControl<string>;
  isActive: FormControl<boolean>;
};

type FoodPricingPackageTextControl = Exclude<keyof FoodPricingPackageFormControls, 'isActive'>;

@Component({
  selector: 'app-food-pricing-package-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SeroDropdownComponent, SeroDatePickerComponent],
  template: `
    <form class="package-form" [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <header class="package-form-head">
        <div>
          <h2>إضافة باقة تموين جديدة</h2>
          <p>أدخل تفاصيل باقة التموين أدناه</p>
        </div>
      </header>

      <div class="package-form-grid">
        <div class="form-field">
          <label class="field-label" for="food-package-code">رمز الباقة <span class="required-mark">*</span></label>
          <input
            id="food-package-code"
            class="form-control"
            [class.is-invalid]="isInvalid('code')"
            type="text"
            autocomplete="off"
            placeholder="أدخل رمز الباقة"
            formControlName="code" />
          @if (isInvalid('code')) {
            <span class="field-error">هذا الحقل مطلوب</span>
          }
        </div>

        <div class="form-field">
          <label class="field-label" for="food-package-title">عنوان الباقة <span class="required-mark">*</span></label>
          <input
            id="food-package-title"
            class="form-control"
            [class.is-invalid]="isInvalid('title')"
            type="text"
            autocomplete="off"
            placeholder="أدخل عنوان الباقة"
            formControlName="title" />
          @if (isInvalid('title')) {
            <span class="field-error">هذا الحقل مطلوب</span>
          }
        </div>

        <div class="form-field">
          <label class="field-label">شركة التموين <span class="required-mark">*</span></label>
          <div class="field-control" [class.is-invalid]="isInvalid('cateringCompany')">
            <app-sero-dropdown
              [options]="companyOptions"
              [value]="form.controls.cateringCompany.value"
              placeholder="اختر شركة التموين"
              (valueChange)="setControlValue('cateringCompany', $event)">
            </app-sero-dropdown>
          </div>
          @if (isInvalid('cateringCompany')) {
            <span class="field-error">هذا الحقل مطلوب</span>
          }
        </div>

        <div class="form-field">
          <label class="field-label">تاريخ البداية <span class="required-mark">*</span></label>
          <div class="field-control" [class.is-invalid]="isInvalid('startDate')">
            <app-sero-date-picker
              [value]="form.controls.startDate.value"
              placeholder="mm/dd/yyyy"
              (valueChange)="setControlValue('startDate', $event)">
            </app-sero-date-picker>
          </div>
          @if (isInvalid('startDate')) {
            <span class="field-error">هذا الحقل مطلوب</span>
          }
        </div>

        <div class="form-field">
          <label class="field-label">تاريخ النهاية</label>
          <app-sero-date-picker
            [value]="form.controls.endDate.value"
            placeholder="mm/dd/yyyy"
            (valueChange)="setControlValue('endDate', $event)">
          </app-sero-date-picker>
        </div>

        <div class="form-field active-form-field">
          <label class="field-label">فعال</label>
          <label class="active-toggle">
            <span class="active-state">{{ form.controls.isActive.value ? 'فعال' : 'غير فعال' }}</span>
            <span class="switch-control">
              <input
                type="checkbox"
                [checked]="form.controls.isActive.value"
                (change)="setActive($any($event.target).checked)" />
              <span class="switch-track" aria-hidden="true"></span>
            </span>
          </label>
        </div>
      </div>

      <footer class="package-form-actions">
        <button type="submit" class="btn btn--primary">
          <span class="material-icons-round">save</span>
          <span>حفظ الباقة</span>
        </button>
        <button type="button" class="btn btn--secondary" (click)="cancelled.emit()">
          <span class="material-icons-round">close</span>
          <span>إلغاء</span>
        </button>
      </footer>
    </form>
  `,
  styles: [`
    :host {
      display: block;
      width: min(760px, 100%);
    }

    .package-form {
      background: var(--sero-card-bg);
      border: 1px solid var(--sero-border-light);
      border-radius: 10px;
      box-shadow: var(--shadow-xl);
      overflow: hidden;
      animation: formIn 0.16s ease-out;
    }

    .package-form-head {
      padding: 16px 18px;
      border-bottom: 1px solid var(--sero-border-light);
      background: var(--sero-surface-2);
    }

    .package-form-head h2 {
      margin: 0;
      color: var(--sero-text-primary);
      font-size: 1rem;
      font-weight: 800;
    }

    .package-form-head p {
      margin: 4px 0 0;
      color: var(--sero-text-muted);
      font-size: 0.76rem;
      font-weight: 600;
      line-height: 1.6;
    }

    .package-form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
      padding: 16px 18px;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 0;
    }

    .field-label {
      color: var(--sero-text-secondary);
      font-size: 0.73rem;
      font-weight: 700;
    }

    .required-mark {
      color: var(--sero-danger);
    }

    .form-control {
      min-height: 42px;
      border: 1px solid var(--sero-border);
      border-radius: 10px;
      background: var(--sero-card-bg);
      color: var(--sero-text-primary);
      font-family: var(--sero-font);
      font-size: 0.86rem;
      outline: none;
      padding: 9px 12px;
      box-sizing: border-box;
      transition: border-color var(--t-fast), box-shadow var(--t-fast), background var(--t-fast);
    }

    .form-control:hover {
      border-color: var(--sero-border-strong);
      background: var(--sero-surface-2);
    }

    .form-control:focus {
      border-color: var(--sero-primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--sero-primary) 12%, transparent);
      background: var(--sero-card-bg);
    }

    .form-control.is-invalid,
    .field-control.is-invalid {
      border-radius: 10px;
      outline: 1px solid var(--sero-danger);
      outline-offset: 1px;
    }

    .field-error {
      color: var(--sero-danger);
      font-size: 0.68rem;
      font-weight: 700;
    }

    .active-form-field {
      justify-content: flex-end;
    }

    .active-toggle {
      min-height: 42px;
      border: 1px solid var(--sero-border);
      border-radius: 10px;
      background: var(--sero-card-bg);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 8px 12px;
      cursor: pointer;
      transition: border-color var(--t-fast), background var(--t-fast);
    }

    .active-toggle:hover {
      border-color: var(--sero-border-strong);
      background: var(--sero-surface-2);
    }

    .active-state {
      color: var(--sero-text-primary);
      font-size: 0.84rem;
      font-weight: 800;
    }

    .switch-control {
      position: relative;
      display: inline-flex;
      width: 42px;
      height: 24px;
      flex-shrink: 0;
    }

    .switch-control input {
      position: absolute;
      inset: 0;
      opacity: 0;
      cursor: pointer;
      margin: 0;
      z-index: 2;
    }

    .switch-track {
      position: absolute;
      inset: 0;
      border-radius: 999px;
      background: var(--sero-border);
      transition: background var(--t-fast);
    }

    .switch-track::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--sero-card-bg);
      box-shadow: var(--shadow-sm);
      transition: transform var(--t-fast);
    }

    .switch-control input:checked + .switch-track {
      background: var(--sero-primary);
    }

    .switch-control input:checked + .switch-track::after {
      transform: translateX(18px);
    }

    .package-form-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      padding: 14px 18px;
      border-top: 1px solid var(--sero-border-light);
      background: var(--sero-surface-2);
    }

    .package-form-actions .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .package-form-actions .material-icons-round {
      font-size: 17px;
    }

    @keyframes formIn {
      from {
        opacity: 0;
        transform: translateY(8px) scale(0.99);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @media (max-width: 720px) {
      .package-form-grid {
        grid-template-columns: 1fr;
      }

      .package-form-actions {
        align-items: stretch;
        flex-direction: column;
      }

      .package-form-actions .btn {
        justify-content: center;
      }
    }
  `],
})
export class FoodPricingPackageFormComponent {
  @Input() companyOptions: SeroDropdownOption<string>[] = [];
  @Input() set packageValue(value: FoodPricingPackageModel | null) {
    this.form.reset({
      code: value?.code ?? '',
      title: value?.title ?? '',
      cateringCompany: value?.cateringCompany ?? '',
      startDate: value?.startDate ?? '',
      endDate: value?.endDate ?? '',
      isActive: value?.isActive ?? true,
    });
    this.submitted = false;
  }

  @Output() saved = new EventEmitter<FoodPricingPackageModel>();
  @Output() cancelled = new EventEmitter<void>();

  submitted = false;

  readonly form = new FormGroup<FoodPricingPackageFormControls>({
    code: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    cateringCompany: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    startDate: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    endDate: new FormControl('', { nonNullable: true }),
    isActive: new FormControl(true, { nonNullable: true }),
  });

  setControlValue(controlName: FoodPricingPackageTextControl, value: string): void {
    const control = this.form.controls[controlName];
    control.setValue(value);
    control.markAsDirty();
    control.markAsTouched();
  }

  setActive(isActive: boolean): void {
    this.form.controls.isActive.setValue(isActive);
    this.form.controls.isActive.markAsDirty();
  }

  isInvalid(controlName: keyof FoodPricingPackageFormControls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (this.submitted || control.touched);
  }

  submit(): void {
    this.submitted = true;
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();
    this.saved.emit({
      code: value.code.trim(),
      title: value.title.trim(),
      cateringCompany: value.cateringCompany,
      startDate: value.startDate,
      endDate: value.endDate,
      isActive: value.isActive,
    });
  }
}
