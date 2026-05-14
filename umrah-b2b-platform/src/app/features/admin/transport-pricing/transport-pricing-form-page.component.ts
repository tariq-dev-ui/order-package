import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SeroDatePickerComponent } from '../../../shared/components/sero-date-picker/sero-date-picker.component';
import { SeroDropdownComponent } from '../../../shared/components/sero-dropdown/sero-dropdown.component';
import {
  TRANSPORT_PRICING_COMPANY_OPTIONS,
  TRANSPORT_PRICING_VEHICLE_OPTIONS,
  TransportPricingFormValue,
  createTransportPricingFormValue,
} from './transport-pricing.mock';
import { TransportPricingLocalStoreService } from './transport-pricing-local-store.service';

type RequiredTransportPricingField = 'code' | 'packageName' | 'startDate' | 'endDate' | 'company' | 'vehicleType';

@Component({
  selector: 'app-transport-pricing-form-page',
  standalone: true,
  imports: [CommonModule, SeroDropdownComponent, SeroDatePickerComponent],
  template: `
    <section class="transport-form-page" dir="rtl">
      <header class="page-head">
        <h1>{{ pageTitle }}</h1>
      </header>

      <form [class.view-mode]="isViewMode" class="surface-card" (submit)="onSave($event)" novalidate>
        <div class="form-grid">
          <div class="field-group">
            <label class="field-label" for="package-code">رمز الباقة <span class="required-mark">*</span></label>
            <input
              id="package-code"
              class="form-control"
              [class.is-invalid]="isFieldInvalid('code')"
              [disabled]="isViewMode || isEditMode"
              type="text"
              autocomplete="off"
              [value]="form.code"
              (input)="setTextField('code', $any($event.target).value)" />
            @if (isFieldInvalid('code')) {
              <span class="field-error">هذا الحقل مطلوب</span>
            }
          </div>

          <div class="field-group">
            <label class="field-label" for="package-name">اسم الباقة <span class="required-mark">*</span></label>
            <input
              id="package-name"
              class="form-control"
              [class.is-invalid]="isFieldInvalid('packageName')"
              [disabled]="isViewMode"
              type="text"
              autocomplete="off"
              [value]="form.packageName"
              (input)="setTextField('packageName', $any($event.target).value)" />
            @if (isFieldInvalid('packageName')) {
              <span class="field-error">هذا الحقل مطلوب</span>
            }
          </div>

          <div class="field-group">
            <label class="field-label">تاريخ البداية <span class="required-mark">*</span></label>
            <div class="field-control" [class.is-invalid]="isFieldInvalid('startDate')">
              <app-sero-date-picker
                [value]="form.startDate"
                [disabled]="isViewMode"
                placeholder="اختر تاريخ البداية"
                (valueChange)="setTextField('startDate', $event)">
              </app-sero-date-picker>
            </div>
            @if (isFieldInvalid('startDate')) {
              <span class="field-error">هذا الحقل مطلوب</span>
            }
          </div>

          <div class="field-group">
            <label class="field-label">تاريخ الانتهاء <span class="required-mark">*</span></label>
            <div class="field-control" [class.is-invalid]="isFieldInvalid('endDate')">
              <app-sero-date-picker
                [value]="form.endDate"
                [disabled]="isViewMode"
                placeholder="اختر تاريخ الانتهاء"
                (valueChange)="setTextField('endDate', $event)">
              </app-sero-date-picker>
            </div>
            @if (isFieldInvalid('endDate')) {
              <span class="field-error">هذا الحقل مطلوب</span>
            }
          </div>

          <div class="field-group">
            <label class="field-label">اسم الشركة <span class="required-mark">*</span></label>
            <div class="field-control" [class.is-invalid]="isFieldInvalid('company')">
              <app-sero-dropdown
                [options]="companyOptions"
                [value]="form.company"
                [disabled]="isViewMode"
                placeholder="اختر اسم الشركة"
                (valueChange)="setTextField('company', $event)">
              </app-sero-dropdown>
            </div>
            @if (isFieldInvalid('company')) {
              <span class="field-error">هذا الحقل مطلوب</span>
            }
          </div>

          <div class="field-group">
            <label class="field-label">اسم نوع السيارة <span class="required-mark">*</span></label>
            <div class="field-control" [class.is-invalid]="isFieldInvalid('vehicleType')">
              <app-sero-dropdown
                [options]="vehicleOptions"
                [value]="form.vehicleType"
                [disabled]="isViewMode"
                placeholder="اختر اسم نوع السيارة"
                (valueChange)="setTextField('vehicleType', $event)">
              </app-sero-dropdown>
            </div>
            @if (isFieldInvalid('vehicleType')) {
              <span class="field-error">هذا الحقل مطلوب</span>
            }
          </div>

          <div class="field-group active-field">
            <label class="field-label">فعال</label>
            <label [class.disabled]="isViewMode" class="active-toggle">
              <span class="active-state">{{ form.isActive ? 'نعم' : 'لا' }}</span>
              <span class="switch-control">
                <input
                  type="checkbox"
                  [disabled]="isViewMode"
                  [checked]="form.isActive"
                  (change)="setActive($any($event.target).checked)" />
                <span class="switch-track" aria-hidden="true"></span>
              </span>
            </label>
          </div>
        </div>

        <section class="trips-section">
          <div class="section-head">
            <h2>تسعير الرحلات</h2>
          </div>

          <div class="table-wrap">
            <table class="trips-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>الرحلة</th>
                  <th>سعر الوحدة</th>
                </tr>
              </thead>
              <tbody>
                @for (trip of form.trips; track trip.id) {
                  <tr>
                    <td>{{ trip.id }}</td>
                    <td><span class="trip-route" dir="ltr">{{ trip.route }}</span></td>
                    <td>
                      <input
                        [disabled]="isViewMode"
                        class="price-input"
                        type="number"
                        min="0"
                        inputmode="decimal"
                        [value]="trip.unitPrice"
                        (input)="setTripPrice(trip.id, $any($event.target).value)" />
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </section>

        @if (showRequiredWarning) {
          <div class="validation-banner">
            يرجى تعبئة الحقول المطلوبة قبل الحفظ
          </div>
        }

        @if (saveSuccess) {
          <div class="success-banner">
            تم حفظ التعديلات بنجاح
          </div>
        }

        @if (isViewMode) {
          <footer class="form-actions">
            <button type="button" class="btn btn--secondary" (click)="cancel()">
              <span class="material-icons-round">arrow_back</span>
              <span>العودة</span>
            </button>
          </footer>
        } @else {
          <footer class="form-actions">
            <button type="submit" class="btn btn--primary" [disabled]="saveSuccess">
              <span class="material-icons-round">save</span>
              <span>{{ isEditMode ? 'حفظ التعديلات' : 'حفظ' }}</span>
            </button>
            <button type="button" class="btn btn--secondary" (click)="cancel()" [disabled]="saveSuccess">
              <span class="material-icons-round">close</span>
              <span>إلغاء</span>
            </button>
          </footer>
        }
      </form>
    </section>
  `,
  styles: [`
    .transport-form-page {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .page-head h1 {
      font-size: 1rem;
      font-weight: 800;
      color: var(--sero-text-primary);
    }

    .surface-card {
      background: #fff;
      border: 1px solid var(--sero-border-light);
      border-radius: 8px;
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 14px;
      padding: 14px;
      border-bottom: 1px solid var(--sero-border-light);
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 0;
    }

    .field-label {
      font-size: 0.73rem;
      font-weight: 700;
      color: var(--sero-text-secondary);
    }

    .required-mark {
      color: var(--sero-danger);
    }

    .form-control {
      min-height: 42px;
      box-sizing: border-box;
    }

    .form-control.is-invalid,
    .field-control.is-invalid {
      border-radius: 10px;
      outline: 1px solid var(--sero-danger);
      outline-offset: 1px;
    }

    .field-error {
      color: var(--sero-danger);
      font-size: 0.7rem;
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
      gap: 10px;
      padding: 9px 12px;
      cursor: pointer;
      box-sizing: border-box;
    }

    .active-toggle:hover {
      border-color: var(--sero-border-strong);
      background: var(--sero-surface-2);
    }

    .active-toggle.disabled {
      cursor: not-allowed;
      background: var(--sero-bg-subtle);
      border-color: var(--sero-border);
    }

    .active-toggle.disabled:hover {
      border-color: var(--sero-border);
      background: var(--sero-bg-subtle);
    }

    .active-state {
      color: var(--sero-text-primary);
      font-size: 0.84rem;
      font-weight: 700;
    }

    .switch-control {
      position: relative;
      width: 38px;
      height: 22px;
      flex: 0 0 auto;
    }

    .switch-control input {
      position: absolute;
      inset: 0;
      opacity: 0;
      cursor: pointer;
      margin: 0;
      z-index: 2;
    }

    .switch-control input:disabled {
      cursor: not-allowed;
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
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #fff;
      box-shadow: var(--shadow-sm);
      transition: transform var(--t-fast);
    }

    .switch-control input:checked + .switch-track {
      background: var(--sero-primary);
    }

    .switch-control input:checked + .switch-track::after {
      transform: translateX(16px);
    }

    .form-control:disabled {
      background: var(--sero-bg-subtle);
      border-color: var(--sero-border);
      color: var(--sero-text-secondary);
      cursor: not-allowed;
    }

    .price-input:disabled {
      background: var(--sero-bg-subtle);
      border-color: var(--sero-border);
      color: var(--sero-text-secondary);
      cursor: not-allowed;
    }

    .trips-section {
      padding: 14px;
      border-bottom: 1px solid var(--sero-border-light);
    }

    .section-head {
      margin-bottom: 10px;
    }

    .section-head h2 {
      margin: 0;
      font-size: 0.9rem;
      font-weight: 800;
      color: var(--sero-text-primary);
    }

    .table-wrap {
      overflow-x: auto;
    }

    .trips-table {
      width: 100%;
      min-width: 680px;
      border-collapse: collapse;
    }

    .trips-table thead tr {
      background: var(--sero-primary);
    }

    .trips-table th {
      color: rgba(255, 255, 255, 0.92);
      font-size: 0.72rem;
      font-weight: 700;
      text-align: center;
      padding: 10px 12px;
      white-space: nowrap;
    }

    .trips-table td {
      border-bottom: 1px solid var(--sero-border-light);
      color: var(--sero-text-primary);
      font-size: 0.76rem;
      text-align: center;
      padding: 8px 12px;
      white-space: nowrap;
    }

    .trips-table tbody tr:hover {
      background: #fbfcfa;
    }

    .trips-table tbody tr:last-child td {
      border-bottom: none;
    }

    .trip-route {
      display: inline-block;
      font-weight: 700;
      letter-spacing: 0;
    }

    .price-input {
      width: 120px;
      min-height: 34px;
      border: 1px solid var(--sero-border);
      border-radius: 8px;
      background: var(--sero-card-bg);
      color: var(--sero-text-primary);
      font-family: var(--sero-font);
      font-size: 0.8rem;
      font-weight: 700;
      text-align: center;
      outline: none;
      padding: 6px 8px;
      box-sizing: border-box;
      transition: border-color var(--t-fast), box-shadow var(--t-fast);
    }

    .price-input:hover {
      border-color: var(--sero-border-strong);
    }

    .price-input:focus {
      border-color: var(--sero-primary);
      box-shadow: 0 0 0 3px rgba(58, 71, 42, 0.1);
    }

    .validation-banner {
      margin: 12px 14px 0;
      border: 1px solid var(--sero-danger-border);
      border-radius: 8px;
      background: var(--sero-danger-bg);
      color: var(--sero-danger);
      font-size: 0.78rem;
      font-weight: 700;
      padding: 10px 12px;
    }

    .success-banner {
      margin: 12px 14px 0;
      border: 1px solid var(--sero-success-border, #a3d9a5);
      border-radius: 8px;
      background: var(--sero-success-bg, #f0faf0);
      color: var(--sero-success, #2d7a2d);
      font-size: 0.78rem;
      font-weight: 700;
      padding: 10px 12px;
    }

    .form-actions {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      flex-wrap: wrap;
      gap: 8px;
      padding: 14px;
    }

    @media (max-width: 1150px) {
      .form-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 680px) {
      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
        align-items: stretch;
      }
    }
  `],
})
export class TransportPricingFormPageComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly store = inject(TransportPricingLocalStoreService);

  readonly companyOptions = TRANSPORT_PRICING_COMPANY_OPTIONS.filter((option) => option.value !== 'all');
  readonly vehicleOptions = TRANSPORT_PRICING_VEHICLE_OPTIONS.filter((option) => option.value !== 'all');

  readonly requiredFields: RequiredTransportPricingField[] = [
    'code',
    'packageName',
    'startDate',
    'endDate',
    'company',
    'vehicleType',
  ];

  form: TransportPricingFormValue = createTransportPricingFormValue();
  saveAttempted = false;
  saveSuccess = false;

  readonly mode: 'create' | 'view' | 'edit';

  get isViewMode(): boolean { return this.mode === 'view'; }
  get isEditMode(): boolean { return this.mode === 'edit'; }

  get pageTitle(): string {
    if (this.mode === 'view') return 'عرض باقة النقل';
    if (this.mode === 'edit') return 'تعديل تسعير النقل';
    return 'إضافة باقة نقل جديد';
  }

  constructor() {
    const segment = this.route.snapshot.url[2]?.path;
    this.mode = segment === 'edit' ? 'edit' : segment === 'view' ? 'view' : 'create';

    this.route.paramMap.subscribe((params) => {
      const rowCode = params.get('id');
      if (rowCode) {
        this.loadViewData(rowCode);
      }
    });
  }

  private loadViewData(id: string): void {
    const row = this.store.getRow(id);

    if (!row) {
      void this.router.navigate(['/admin/pricing/transport']);
      return;
    }

    this.form = {
      code: row.code,
      packageName: row.title,
      startDate: row.startDate,
      endDate: row.endDate,
      company: row.company,
      vehicleType: row.vehicleType,
      isActive: row.isActive,
      trips: this.form.trips,
    };
  }

  get showRequiredWarning(): boolean {
    return this.saveAttempted && !this.isFormValid();
  }

  setTextField(field: RequiredTransportPricingField, value: string): void {
    if (this.isViewMode) return;
    this.form = { ...this.form, [field]: value };
  }

  setActive(isActive: boolean): void {
    if (this.isViewMode) return;
    this.form = { ...this.form, isActive };
  }

  setTripPrice(id: string, value: string): void {
    if (this.isViewMode) return;
    const unitPrice = Math.max(Number(value) || 0, 0);
    this.form = {
      ...this.form,
      trips: this.form.trips.map((trip) => trip.id === id ? { ...trip, unitPrice } : trip),
    };
  }

  isFieldInvalid(field: RequiredTransportPricingField): boolean {
    return this.saveAttempted && !this.hasRequiredValue(field);
  }

  onSave(event: Event): void {
    event.preventDefault();
    if (this.isViewMode || this.saveSuccess) return;

    this.saveAttempted = true;

    if (!this.isFormValid()) {
      return;
    }

    if (this.isEditMode) {
      this.store.updatePackage(this.form);
      this.saveSuccess = true;
      setTimeout(() => void this.router.navigate(['/admin/pricing/transport']), 1200);
    } else {
      this.store.savePackage(this.form);
      void this.router.navigate(['/admin/pricing/transport']);
    }
  }

  cancel(): void {
    void this.router.navigate(['/admin/pricing/transport']);
  }

  private isFormValid(): boolean {
    return this.requiredFields.every((field) => this.hasRequiredValue(field));
  }

  private hasRequiredValue(field: RequiredTransportPricingField): boolean {
    return this.form[field].trim().length > 0;
  }
}
