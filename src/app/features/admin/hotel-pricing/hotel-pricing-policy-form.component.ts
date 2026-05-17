import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SeroDatePickerComponent } from '../../../shared/components/sero-date-picker/sero-date-picker.component';
import { HotelPricingPolicy, HotelPricingPolicyFormValue } from './hotel-pricing-policy.mock';

export type HotelPricingPolicyFormMode = 'add' | 'edit' | 'view';

@Component({
  selector: 'app-hotel-pricing-policy-form',
  standalone: true,
  imports: [CommonModule, SeroDatePickerComponent],
  template: `
    <div class="modal-backdrop" (click)="onCancel()">
      <div class="modal-card" (click)="$event.stopPropagation()" dir="rtl">

        <header class="modal-head">
          <h2 class="modal-title">{{ formTitle }}</h2>
          <button type="button" class="modal-close-btn" (click)="onCancel()" aria-label="إغلاق">
            <span class="material-icons-round">close</span>
          </button>
        </header>

        <div class="modal-body">
          <div class="form-grid">

            <div class="field-group field-group--full">
              <label class="field-label">
                عنوان السياسة
                @if (!isViewMode) { <span class="required-mark">*</span> }
              </label>
              <input
                class="form-control"
                [class.is-invalid]="saveAttempted && !form.title.trim()"
                type="text"
                autocomplete="off"
                placeholder="أدخل عنوان السياسة"
                [disabled]="isViewMode"
                [value]="form.title"
                (input)="form = { ...form, title: $any($event.target).value }" />
              @if (saveAttempted && !form.title.trim()) {
                <span class="field-error">هذا الحقل مطلوب</span>
              }
            </div>

            <div class="field-group">
              <label class="field-label">
                تاريخ البداية
                @if (!isViewMode) { <span class="required-mark">*</span> }
              </label>
              <div class="field-control" [class.is-invalid]="saveAttempted && !form.startDate">
                <app-sero-date-picker
                  [value]="form.startDate"
                  [disabled]="isViewMode"
                  placeholder="mm/dd/yyyy"
                  (valueChange)="form = { ...form, startDate: $event }">
                </app-sero-date-picker>
              </div>
              @if (saveAttempted && !form.startDate) {
                <span class="field-error">هذا الحقل مطلوب</span>
              }
            </div>

            <div class="field-group">
              <label class="field-label">
                تاريخ النهاية
                @if (!isViewMode) { <span class="required-mark">*</span> }
              </label>
              <div class="field-control" [class.is-invalid]="saveAttempted && !form.endDate">
                <app-sero-date-picker
                  [value]="form.endDate"
                  [disabled]="isViewMode"
                  placeholder="mm/dd/yyyy"
                  (valueChange)="form = { ...form, endDate: $event }">
                </app-sero-date-picker>
              </div>
              @if (saveAttempted && !form.endDate) {
                <span class="field-error">هذا الحقل مطلوب</span>
              }
            </div>

            <div class="field-group">
              <label class="field-label">Agents</label>
              <input
                class="form-control"
                type="number"
                min="0"
                [disabled]="isViewMode"
                [value]="form.agentsCount"
                (input)="form = { ...form, agentsCount: clamp(+$any($event.target).value) }" />
            </div>

            <div class="field-group">
              <label class="field-label">الفنادق</label>
              <input
                class="form-control"
                type="number"
                min="0"
                [disabled]="isViewMode"
                [value]="form.hotelsCount"
                (input)="form = { ...form, hotelsCount: clamp(+$any($event.target).value) }" />
            </div>

            <div class="field-group field-group--full">
              <label class="field-label">فعال</label>
              <label [class.disabled]="isViewMode" class="active-toggle">
                <span class="active-state">{{ form.isActive ? 'نعم' : 'لا' }}</span>
                <span class="switch-control">
                  <input
                    type="checkbox"
                    [disabled]="isViewMode"
                    [checked]="form.isActive"
                    (change)="form = { ...form, isActive: $any($event.target).checked }" />
                  <span class="switch-track" aria-hidden="true"></span>
                </span>
              </label>
            </div>

          </div>

          @if (saveAttempted && !isFormValid) {
            <div class="validation-banner">
              يرجى تعبئة الحقول المطلوبة قبل الحفظ
            </div>
          }
        </div>

        <footer class="modal-foot">
          @if (!isViewMode) {
            <button type="button" class="btn btn--primary" (click)="onSave()">
              <span class="material-icons-round">save</span>
              <span>{{ isEditMode ? 'حفظ التعديلات' : 'حفظ' }}</span>
            </button>
          }
          <button type="button" class="btn btn--secondary" (click)="onCancel()">
            <span class="material-icons-round">{{ isViewMode ? 'arrow_back' : 'close' }}</span>
            <span>{{ isViewMode ? 'العودة' : 'إلغاء' }}</span>
          </button>
        </footer>

      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.35);
      z-index: 200;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      animation: backdropIn 0.18s ease-out;
    }

    @keyframes backdropIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .modal-card {
      width: 100%;
      max-width: 560px;
      background: var(--sero-card-bg);
      border: 1px solid var(--sero-border-light);
      border-radius: 12px;
      box-shadow: var(--shadow-xl);
      display: flex;
      flex-direction: column;
      max-height: calc(100vh - 32px);
      animation: cardIn 0.2s ease-out;
    }

    @keyframes cardIn {
      from { opacity: 0; transform: scale(0.96) translateY(-8px); }
      to { opacity: 1; transform: scale(1) translateY(0); }
    }

    .modal-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      border-bottom: 1px solid var(--sero-border-light);
      flex-shrink: 0;
    }

    .modal-title {
      font-size: 0.92rem;
      font-weight: 800;
      color: var(--sero-text-primary);
      margin: 0;
    }

    .modal-close-btn {
      width: 30px;
      height: 30px;
      border: 1px solid var(--sero-border);
      border-radius: 6px;
      background: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--sero-text-secondary);
      transition: background var(--t-fast), color var(--t-fast);
    }

    .modal-close-btn:hover {
      background: var(--sero-surface-2);
      color: var(--sero-text-primary);
    }

    .modal-close-btn .material-icons-round {
      font-size: 18px;
    }

    .modal-body {
      padding: 16px;
      overflow-y: auto;
      flex: 1;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 14px;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .field-group--full {
      grid-column: 1 / -1;
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
      width: 100%;
      box-sizing: border-box;
      border: 1px solid var(--sero-border);
      border-radius: 10px;
      background: var(--sero-card-bg);
      color: var(--sero-text-primary);
      font-family: var(--sero-font);
      font-size: 0.84rem;
      padding: 0 12px;
      outline: none;
      transition: border-color var(--t-fast), box-shadow var(--t-fast);
    }

    .form-control:hover:not(:disabled) {
      border-color: var(--sero-border-strong);
    }

    .form-control:focus:not(:disabled) {
      border-color: var(--sero-primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--sero-primary) 12%, transparent);
    }

    .form-control:disabled {
      background: var(--sero-bg-subtle);
      color: var(--sero-text-secondary);
      cursor: not-allowed;
    }

    .form-control.is-invalid {
      border-color: var(--sero-danger);
    }

    .field-control {
      display: block;
    }

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
      transition: border-color var(--t-fast), background var(--t-fast);
    }

    .active-toggle:hover:not(.disabled) {
      border-color: var(--sero-border-strong);
      background: var(--sero-surface-2);
    }

    .active-toggle.disabled {
      cursor: not-allowed;
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

    .switch-control input:disabled { cursor: not-allowed; }

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

    .switch-control input:checked + .switch-track { background: var(--sero-primary); }
    .switch-control input:checked + .switch-track::after { transform: translateX(16px); }

    .validation-banner {
      margin-top: 12px;
      border: 1px solid var(--sero-danger-border);
      border-radius: 8px;
      background: var(--sero-danger-bg);
      color: var(--sero-danger);
      font-size: 0.78rem;
      font-weight: 700;
      padding: 10px 12px;
    }

    .modal-foot {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid var(--sero-border-light);
      flex-shrink: 0;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      min-height: 36px;
      border-radius: 8px;
      border: 1px solid transparent;
      padding: 0 14px;
      font-family: var(--sero-font);
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      transition: background var(--t-fast), border-color var(--t-fast), color var(--t-fast);
    }

    .btn .material-icons-round { font-size: 16px; }

    .btn--primary {
      background: var(--sero-primary);
      color: var(--sero-card-bg);
    }

    .btn--primary:hover { background: var(--sero-primary-dark); }

    .btn--secondary {
      background: var(--sero-card-bg);
      color: var(--sero-text-primary);
      border-color: var(--sero-border);
    }

    .btn--secondary:hover {
      background: var(--sero-surface-2);
      border-color: var(--sero-border-strong);
    }

    @media (max-width: 560px) {
      .form-grid { grid-template-columns: 1fr; }
      .field-group--full { grid-column: 1; }
    }
  `],
})
export class HotelPricingPolicyFormComponent implements OnInit {
  @Input() policy: HotelPricingPolicy | null = null;
  @Input() mode: HotelPricingPolicyFormMode = 'add';
  @Output() save = new EventEmitter<HotelPricingPolicyFormValue>();
  @Output() cancel = new EventEmitter<void>();

  form: HotelPricingPolicyFormValue = {
    title: '',
    startDate: '',
    endDate: '',
    agentsCount: 0,
    hotelsCount: 0,
    isActive: true,
  };
  saveAttempted = false;

  get isViewMode(): boolean { return this.mode === 'view'; }
  get isEditMode(): boolean { return this.mode === 'edit'; }

  get formTitle(): string {
    if (this.mode === 'view') return 'عرض السياسة';
    if (this.mode === 'edit') return 'تعديل السياسة';
    return 'إضافة سياسة جديدة';
  }

  get isFormValid(): boolean {
    return this.form.title.trim().length > 0 &&
           this.form.startDate.length > 0 &&
           this.form.endDate.length > 0;
  }

  ngOnInit(): void {
    if (this.policy) {
      this.form = {
        title: this.policy.title,
        startDate: this.policy.startDate,
        endDate: this.policy.endDate,
        agentsCount: this.policy.agentsCount,
        hotelsCount: this.policy.hotelsCount,
        isActive: this.policy.isActive,
      };
    }
  }

  clamp(value: number): number {
    return Math.max(0, isNaN(value) ? 0 : value);
  }

  onSave(): void {
    this.saveAttempted = true;
    if (!this.isFormValid) return;
    this.save.emit({ ...this.form });
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
