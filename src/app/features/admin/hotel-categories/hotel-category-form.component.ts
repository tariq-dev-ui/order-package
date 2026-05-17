import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HotelCategoryFormValue, HotelCategoryModel } from './hotel-category.model';

type HotelCategoryFormControls = {
  title: FormControl<string>;
  description: FormControl<string>;
  isActive: FormControl<boolean>;
};

export type HotelCategoryFormMode = 'create' | 'edit' | 'view';

@Component({
  selector: 'app-hotel-category-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form class="category-form" [class.is-view-mode]="isViewMode" [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <header class="category-form-head">
        <h2>{{ formTitle }}</h2>
      </header>

      <div class="category-form-grid">
        <div class="form-field">
          <label class="field-label" for="category-title">
            العنوان
            @if (!isViewMode) { <span class="required-mark">*</span> }
          </label>

          @if (isViewMode) {
            <div class="readonly-control">{{ form.controls.title.value || '-' }}</div>
          } @else {
            <input
              id="category-title"
              type="text"
              class="form-control"
              placeholder="أدخل العنوان"
              formControlName="title"
              [class.is-invalid]="isInvalid('title')" />
            @if (isInvalid('title')) {
              <span class="field-error">هذا الحقل مطلوب</span>
            }
          }
        </div>

        <div class="form-field">
          <label class="field-label" for="category-description">الوصف</label>

          @if (isViewMode) {
            <div class="readonly-control">{{ form.controls.description.value || '-' }}</div>
          } @else {
            <textarea
              id="category-description"
              class="form-control textarea-control"
              placeholder="أدخل الوصف"
              formControlName="description">
            </textarea>
          }
        </div>

        <div class="form-field">
          <label class="field-label">الحالة / فعال</label>
          <label class="active-toggle" [class.is-readonly]="isViewMode">
            <span class="active-state">{{ form.controls.isActive.value ? 'فعال' : 'غير فعال' }}</span>
            <span class="switch-control">
              <input
                type="checkbox"
                [checked]="form.controls.isActive.value"
                [disabled]="isViewMode"
                (change)="setActive($any($event.target).checked)" />
              <span class="switch-track" aria-hidden="true"></span>
            </span>
          </label>
        </div>
      </div>

      <footer class="category-form-actions">
        @if (isViewMode) {
          <button type="button" class="btn btn--primary" (click)="switchToEdit.emit()">
            <span class="material-icons-round">edit</span>
            <span>تعديل</span>
          </button>
          <button type="button" class="btn btn--secondary" (click)="cancel.emit()">إغلاق</button>
        } @else {
          <button type="submit" class="btn btn--primary">
            {{ mode === 'edit' ? 'حفظ التعديلات' : 'حفظ' }}
          </button>
          <button type="button" class="btn btn--secondary" (click)="cancel.emit()">إلغاء</button>
        }
      </footer>
    </form>
  `,
  styles: [`
    :host {
      display: block;
      width: min(620px, 100%);
    }

    .category-form {
      background: var(--sero-card-bg);
      border: 1px solid var(--sero-border-light);
      border-radius: 10px;
      box-shadow: var(--shadow-xl);
      overflow: hidden;
    }

    .category-form-head {
      padding: 14px 18px;
      border-bottom: 1px solid var(--sero-border-light);
      background: var(--sero-surface-2);
    }

    .category-form-head h2 {
      margin: 0;
      font-size: 0.96rem;
      font-weight: 800;
      color: var(--sero-text-primary);
    }

    .category-form-grid {
      display: grid;
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
      font-size: 0.75rem;
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
      font-size: 0.84rem;
      padding: 9px 12px;
      outline: none;
      transition: border-color var(--t-fast), box-shadow var(--t-fast), background var(--t-fast);
    }

    .form-control:hover {
      border-color: var(--sero-border-strong);
      background: var(--sero-surface-2);
    }

    .form-control:focus {
      border-color: var(--sero-primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--sero-primary) 11%, transparent);
      background: var(--sero-card-bg);
    }

    .textarea-control {
      min-height: 96px;
      resize: vertical;
    }

    .readonly-control {
      min-height: 42px;
      border: 1px solid var(--sero-border-light);
      border-radius: 10px;
      background: color-mix(in srgb, var(--sero-surface-2) 58%, var(--sero-card-bg));
      color: var(--sero-text-primary);
      font-size: 0.84rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      padding: 9px 12px;
    }

    .form-control.is-invalid {
      border-color: var(--sero-danger-border);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--sero-danger) 12%, transparent);
    }

    .field-error {
      color: var(--sero-danger);
      font-size: 0.68rem;
      font-weight: 700;
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
    }

    .active-toggle.is-readonly {
      cursor: default;
      border-color: var(--sero-border-light);
      background: color-mix(in srgb, var(--sero-surface-2) 58%, var(--sero-card-bg));
    }

    .active-state {
      color: var(--sero-text-primary);
      font-size: 0.82rem;
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
      margin: 0;
    }

    .switch-track {
      position: absolute;
      inset: 0;
      border-radius: 999px;
      background: var(--sero-border);
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

    .category-form-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      padding: 14px 18px;
      border-top: 1px solid var(--sero-border-light);
      background: var(--sero-surface-2);
    }

    .btn {
      min-height: 34px;
      padding: 0 12px;
      border-radius: 8px;
      border: 1px solid transparent;
      font-size: 0.76rem;
      font-weight: 800;
      font-family: var(--sero-font);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .btn--primary {
      background: var(--sero-primary);
      color: var(--sero-card-bg);
    }

    .btn--primary:hover {
      background: var(--sero-primary-dark);
    }

    .btn--secondary {
      background: var(--sero-card-bg);
      color: var(--sero-text-primary);
      border-color: var(--sero-border);
    }

    .btn--secondary:hover {
      background: var(--sero-surface-2);
      border-color: var(--sero-border-strong);
    }

    .material-icons-round {
      font-size: 16px;
    }

    @media (max-width: 640px) {
      .category-form-actions {
        flex-direction: column;
        align-items: stretch;
      }

      .btn {
        justify-content: center;
      }
    }
  `],
})
export class HotelCategoryFormComponent {
  @Input() mode: HotelCategoryFormMode = 'create';

  @Input() set category(value: HotelCategoryModel | null) {
    this.form.reset({
      title: value?.title ?? '',
      description: value?.description ?? '',
      isActive: value?.isActive ?? true,
    });
    this.submitted = false;
  }

  @Output() save = new EventEmitter<HotelCategoryFormValue>();
  @Output() cancel = new EventEmitter<void>();
  @Output() switchToEdit = new EventEmitter<void>();

  submitted = false;

  readonly form = new FormGroup<HotelCategoryFormControls>({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl('', { nonNullable: true }),
    isActive: new FormControl(true, { nonNullable: true }),
  });

  get isViewMode(): boolean {
    return this.mode === 'view';
  }

  get formTitle(): string {
    if (this.mode === 'view') {
      return 'عرض تصنيف الفندق';
    }

    if (this.mode === 'edit') {
      return 'تعديل تصنيف الفندق';
    }

    return 'إضافة تصنيف جديد';
  }

  setActive(isActive: boolean): void {
    if (this.isViewMode) {
      return;
    }

    this.form.controls.isActive.setValue(isActive);
    this.form.controls.isActive.markAsDirty();
  }

  isInvalid(controlName: keyof HotelCategoryFormControls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (this.submitted || control.touched);
  }

  submit(): void {
    if (this.isViewMode) {
      return;
    }

    this.submitted = true;
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();
    this.save.emit({
      title: value.title.trim(),
      description: value.description.trim(),
      isActive: value.isActive,
    });
  }
}
