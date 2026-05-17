import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SeroDropdownComponent, SeroDropdownOption } from '../../../shared/components/sero-dropdown/sero-dropdown.component';
import { HotelFormMode, HotelFormValue, HotelModel } from './hotel.model';
import { HOTEL_CITY_OPTIONS, HOTEL_DISTRICTS_BY_CITY, HOTEL_RATING_OPTIONS } from './hotels.mock';

type HotelFormControls = {
  logoLabel: FormControl<string>;
  name: FormControl<string>;
  city: FormControl<string>;
  district: FormControl<string>;
  address: FormControl<string>;
  rating: FormControl<string>;
  maxDistanceFromHaram: FormControl<string>;
  isActive: FormControl<boolean>;
};

type HotelTextControl = Exclude<keyof HotelFormControls, 'isActive'>;

@Component({
  selector: 'app-hotel-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SeroDropdownComponent],
  template: `
    <form class="hotel-form" [class.is-view-mode]="isViewMode" [formGroup]="form" (ngSubmit)="submit()" novalidate>
      <header class="hotel-form-head">
        <div>
          <h2>{{ formTitle }}</h2>
          <p>{{ formSubtitle }}</p>
        </div>
        <button type="button" class="icon-close-btn" (click)="close.emit()" aria-label="إغلاق">
          <span class="material-icons-round">close</span>
        </button>
      </header>

      <div class="hotel-form-grid">
        <div class="form-field">
          <label class="field-label" for="hotel-name">اسم الفندق @if (!isViewMode) { <span class="required-mark">*</span> }</label>
          @if (isViewMode) {
            <div class="readonly-control">{{ form.controls.name.value || '-' }}</div>
          } @else {
            <input
              id="hotel-name"
              class="form-control"
              [class.is-invalid]="isInvalid('name')"
              type="text"
              autocomplete="off"
              placeholder="أدخل اسم الفندق"
              formControlName="name" />
            @if (isInvalid('name')) {
              <span class="field-error">هذا الحقل مطلوب</span>
            }
          }
        </div>

        <div class="form-field">
          <label class="field-label">المدينة @if (!isViewMode) { <span class="required-mark">*</span> }</label>
          @if (isViewMode) {
            <div class="readonly-control">{{ labelFor(cityOptions, form.controls.city.value) }}</div>
          } @else {
            <div class="field-control" [class.is-invalid]="isInvalid('city')">
              <app-sero-dropdown
                [options]="cityOptions"
                [value]="form.controls.city.value"
                placeholder="اختر المدينة"
                (valueChange)="setCity($event)">
              </app-sero-dropdown>
            </div>
            @if (isInvalid('city')) {
              <span class="field-error">هذا الحقل مطلوب</span>
            }
          }
        </div>

        <div class="form-field">
          <label class="field-label">الحي @if (!isViewMode) { <span class="required-mark">*</span> }</label>
          @if (isViewMode) {
            <div class="readonly-control">{{ labelFor(districtOptions, form.controls.district.value) }}</div>
          } @else {
            <div class="field-control" [class.is-invalid]="isInvalid('district')">
              <app-sero-dropdown
                [options]="districtOptions"
                [value]="form.controls.district.value"
                [placeholder]="form.controls.city.value ? 'اختر الحي' : 'اختر المدينة أولاً'"
                (valueChange)="setControlValue('district', $event)">
              </app-sero-dropdown>
            </div>
            @if (isInvalid('district')) {
              <span class="field-error">هذا الحقل مطلوب</span>
            }
          }
        </div>

        <div class="form-field">
          <label class="field-label" for="hotel-address">العنوان @if (!isViewMode) { <span class="required-mark">*</span> }</label>
          @if (isViewMode) {
            <div class="readonly-control">{{ form.controls.address.value || '-' }}</div>
          } @else {
            <input
              id="hotel-address"
              class="form-control"
              [class.is-invalid]="isInvalid('address')"
              type="text"
              autocomplete="off"
              placeholder="أدخل العنوان"
              formControlName="address" />
            @if (isInvalid('address')) {
              <span class="field-error">هذا الحقل مطلوب</span>
            }
          }
        </div>

        <div class="form-field">
          <label class="field-label">التصنيف / التقييم @if (!isViewMode) { <span class="required-mark">*</span> }</label>
          @if (isViewMode) {
            <div class="readonly-control">{{ form.controls.rating.value || '-' }}</div>
          } @else {
            <div class="field-control" [class.is-invalid]="isInvalid('rating')">
              <app-sero-dropdown
                [options]="ratingOptions"
                [value]="form.controls.rating.value"
                placeholder="Select Rating"
                (valueChange)="setControlValue('rating', $event)">
              </app-sero-dropdown>
            </div>
            @if (isInvalid('rating')) {
              <span class="field-error">هذا الحقل مطلوب</span>
            }
          }
        </div>

        <div class="form-field">
          <label class="field-label" for="hotel-distance">أقصى بعد عن الحرم @if (!isViewMode) { <span class="required-mark">*</span> }</label>
          @if (isViewMode) {
            <div class="readonly-control">{{ form.controls.maxDistanceFromHaram.value || '-' }}</div>
          } @else {
            <input
              id="hotel-distance"
              class="form-control"
              [class.is-invalid]="isInvalid('maxDistanceFromHaram')"
              type="text"
              autocomplete="off"
              placeholder="أقصى بعد عن الحرم"
              formControlName="maxDistanceFromHaram" />
            @if (isInvalid('maxDistanceFromHaram')) {
              <span class="field-error">هذا الحقل مطلوب</span>
            }
          }
        </div>

        <div class="form-field">
          <label class="field-label" for="hotel-logo">الشعار / صورة الفندق</label>
          @if (isViewMode) {
            <div class="readonly-control">{{ form.controls.logoLabel.value || 'Hotel logo' }}</div>
          } @else {
            <input
              id="hotel-logo"
              class="form-control"
              type="text"
              autocomplete="off"
              placeholder="Hotel logo"
              formControlName="logoLabel" />
          }
        </div>

        <div class="form-field active-form-field">
          <label class="field-label">الحالة / فعال</label>
          <label class="active-toggle" [class.is-readonly]="isViewMode">
            <span class="active-state">{{ form.controls.isActive.value ? 'فعال' : 'غير فعال' }}</span>
            <span class="switch-control">
              <input
                type="checkbox"
                [disabled]="isViewMode"
                [checked]="form.controls.isActive.value"
                (change)="setActive($any($event.target).checked)" />
              <span class="switch-track" aria-hidden="true"></span>
            </span>
          </label>
        </div>
      </div>

      <footer class="hotel-form-actions">
        @if (isViewMode) {
          <button type="button" class="btn btn--primary" (click)="switchToEdit.emit()">
            <span class="material-icons-round">edit</span>
            <span>تعديل</span>
          </button>
          <button type="button" class="btn btn--secondary" (click)="close.emit()">
            <span class="material-icons-round">close</span>
            <span>إغلاق</span>
          </button>
        } @else {
          <button type="submit" class="btn btn--primary">
            <span class="material-icons-round">save</span>
            <span>{{ mode === 'edit' ? 'حفظ التعديلات' : 'حفظ الفندق' }}</span>
          </button>
          <button type="button" class="btn btn--secondary" (click)="close.emit()">
            <span class="material-icons-round">close</span>
            <span>إلغاء</span>
          </button>
        }
      </footer>
    </form>
  `,
  styles: [`
    .hotel-form {
      width: min(900px, 100%);
      max-height: calc(100vh - 48px);
      background: var(--sero-card-bg);
      border: 1px solid var(--sero-border-light);
      border-radius: 10px;
      box-shadow: 0 24px 70px rgba(15, 23, 42, 0.2);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      animation: hotelFormIn 0.16s ease-out;
    }

    .hotel-form-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      padding: 16px 18px 14px;
      border-bottom: 1px solid var(--sero-border-light);
      background: color-mix(in srgb, var(--sero-surface-2) 62%, var(--sero-card-bg));
    }

    .hotel-form-head h2 {
      margin: 0;
      color: var(--sero-text-primary);
      font-size: 1rem;
      font-weight: 900;
    }

    .hotel-form-head p {
      margin: 4px 0 0;
      color: var(--sero-text-secondary);
      font-size: 0.74rem;
      font-weight: 700;
    }

    .icon-close-btn {
      width: 32px;
      height: 32px;
      border: 1px solid var(--sero-border);
      border-radius: 8px;
      background: var(--sero-card-bg);
      color: var(--sero-text-secondary);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background var(--t-fast), border-color var(--t-fast), color var(--t-fast);
      flex-shrink: 0;
    }

    .icon-close-btn:hover {
      background: var(--sero-primary-50);
      border-color: var(--sero-primary-100);
      color: var(--sero-primary);
    }

    .icon-close-btn .material-icons-round {
      font-size: 18px;
    }

    .hotel-form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
      padding: 18px;
      overflow-y: auto;
    }

    .form-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 0;
    }

    .field-label {
      color: var(--sero-text-secondary);
      font-size: 0.72rem;
      font-weight: 800;
    }

    .required-mark {
      color: var(--sero-danger);
    }

    .form-control,
    .readonly-control {
      width: 100%;
      min-height: 42px;
      border: 1px solid var(--sero-border);
      border-radius: 10px;
      background: var(--sero-card-bg);
      color: var(--sero-text-primary);
      font-family: var(--sero-font);
      font-size: 0.86rem;
      font-weight: 700;
      padding: 9px 12px;
      outline: none;
      box-sizing: border-box;
    }

    .form-control:hover {
      border-color: var(--sero-border-strong);
    }

    .form-control:focus {
      border-color: var(--sero-primary);
      box-shadow: 0 0 0 3px rgba(58, 71, 42, 0.1);
    }

    .form-control.is-invalid,
    .field-control.is-invalid {
      border-color: var(--sero-danger);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--sero-danger) 10%, transparent);
      border-radius: 10px;
    }

    .readonly-control {
      background: color-mix(in srgb, var(--sero-surface-2) 54%, var(--sero-card-bg));
      border-color: var(--sero-border-light);
      display: flex;
      align-items: center;
    }

    .field-error {
      color: var(--sero-danger);
      font-size: 0.68rem;
      font-weight: 800;
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
      transition: background var(--t-fast), border-color var(--t-fast);
    }

    .active-toggle:hover {
      border-color: var(--sero-border-strong);
      background: var(--sero-surface-2);
    }

    .active-toggle.is-readonly {
      cursor: default;
      border-color: var(--sero-border-light);
      background: color-mix(in srgb, var(--sero-surface-2) 54%, var(--sero-card-bg));
    }

    .active-state {
      color: var(--sero-text-primary);
      font-size: 0.84rem;
      font-weight: 900;
    }

    .switch-control {
      position: relative;
      width: 42px;
      height: 24px;
      flex-shrink: 0;
    }

    .switch-control input {
      position: absolute;
      inset: 0;
      opacity: 0;
      cursor: pointer;
      z-index: 2;
    }

    .switch-control input:disabled {
      cursor: default;
    }

    .switch-track {
      position: absolute;
      inset: 0;
      border-radius: 999px;
      background: var(--sero-border-strong);
      transition: background var(--t-fast);
    }

    .switch-track::after {
      content: '';
      position: absolute;
      width: 18px;
      height: 18px;
      top: 3px;
      inset-inline-start: 3px;
      border-radius: 50%;
      background: #fff;
      box-shadow: var(--shadow-sm);
      transition: transform var(--t-fast);
    }

    .switch-control input:checked + .switch-track {
      background: var(--sero-primary);
    }

    .switch-control input:checked + .switch-track::after {
      transform: translateX(-18px);
    }

    :host-context([dir='ltr']) .switch-control input:checked + .switch-track::after {
      transform: translateX(18px);
    }

    .hotel-form-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      padding: 14px 18px;
      border-top: 1px solid var(--sero-border-light);
      background: var(--sero-card-bg);
    }

    .btn {
      min-height: 36px;
      border: 1px solid transparent;
      border-radius: 9px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 0 14px;
      font-family: var(--sero-font);
      font-size: 0.78rem;
      font-weight: 900;
      cursor: pointer;
      transition: background var(--t-fast), border-color var(--t-fast), color var(--t-fast);
    }

    .btn .material-icons-round {
      font-size: 16px;
    }

    .btn--primary {
      background: var(--sero-primary);
      color: #fff;
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

    @keyframes hotelFormIn {
      from {
        opacity: 0;
        transform: translateY(8px) scale(0.985);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @media (max-width: 720px) {
      .hotel-form {
        max-height: calc(100vh - 24px);
      }

      .hotel-form-grid {
        grid-template-columns: 1fr;
        padding: 14px;
      }

      .hotel-form-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }
    }
  `],
})
export class HotelFormComponent {
  @Input() mode: HotelFormMode = 'create';
  @Input() set hotel(value: HotelModel | null | undefined) {
    this.form.reset({
      logoLabel: value?.logoLabel ?? 'Hotel logo',
      name: value?.name ?? '',
      city: value?.city ?? '',
      district: value?.district ?? '',
      address: value?.address ?? '',
      rating: value?.rating ?? '',
      maxDistanceFromHaram: value?.maxDistanceFromHaram ?? '',
      isActive: value?.isActive ?? true,
    });
    this.submitted = false;
  }

  @Output() save = new EventEmitter<HotelFormValue>();
  @Output() close = new EventEmitter<void>();
  @Output() switchToEdit = new EventEmitter<void>();

  readonly cityOptions = HOTEL_CITY_OPTIONS;
  readonly ratingOptions = HOTEL_RATING_OPTIONS;
  submitted = false;

  readonly form = new FormGroup<HotelFormControls>({
    logoLabel: new FormControl('Hotel logo', { nonNullable: true }),
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    city: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    district: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    address: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    rating: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    maxDistanceFromHaram: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    isActive: new FormControl(true, { nonNullable: true }),
  });

  get isViewMode(): boolean {
    return this.mode === 'view';
  }

  get districtOptions(): SeroDropdownOption<string>[] {
    return HOTEL_DISTRICTS_BY_CITY[this.form.controls.city.value] ?? [];
  }

  get formTitle(): string {
    if (this.mode === 'view') {
      return 'عرض الفندق';
    }

    if (this.mode === 'edit') {
      return 'تعديل الفندق';
    }

    return 'إضافة فندق';
  }

  get formSubtitle(): string {
    if (this.mode === 'view') {
      return 'استعرض بيانات الفندق بدون تعديل';
    }

    if (this.mode === 'edit') {
      return 'حدّث بيانات الفندق أدناه';
    }

    return 'أدخل بيانات الفندق أدناه';
  }

  setControlValue(controlName: HotelTextControl, value: string): void {
    if (this.isViewMode) {
      return;
    }

    const control = this.form.controls[controlName];
    control.setValue(value);
    control.markAsDirty();
    control.markAsTouched();
  }

  setCity(value: string): void {
    if (this.isViewMode) {
      return;
    }

    this.setControlValue('city', value);
    if (!this.districtOptions.some((option) => option.value === this.form.controls.district.value)) {
      this.form.controls.district.setValue('');
      this.form.controls.district.markAsDirty();
      this.form.controls.district.markAsTouched();
    }
  }

  setActive(isActive: boolean): void {
    if (this.isViewMode) {
      return;
    }

    this.form.controls.isActive.setValue(isActive);
    this.form.controls.isActive.markAsDirty();
  }

  isInvalid(controlName: keyof HotelFormControls): boolean {
    const control = this.form.controls[controlName];
    return control.invalid && (this.submitted || control.touched);
  }

  labelFor(options: SeroDropdownOption<string>[], value: string): string {
    return options.find((option) => option.value === value)?.label ?? value ?? '-';
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
      logoLabel: value.logoLabel.trim() || 'Hotel logo',
      name: value.name.trim(),
      city: value.city,
      district: value.district,
      address: value.address.trim(),
      rating: value.rating,
      maxDistanceFromHaram: value.maxDistanceFromHaram.trim(),
      isActive: value.isActive,
    });
  }
}
