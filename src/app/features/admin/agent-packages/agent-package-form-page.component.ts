import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SeroDatePickerComponent } from '../../../shared/components/sero-date-picker/sero-date-picker.component';
import { SeroDropdownComponent } from '../../../shared/components/sero-dropdown/sero-dropdown.component';
import {
  AGENT_PACKAGE_AGENT_OPTIONS,
  AGENT_PACKAGE_CITY_OPTIONS,
  AGENT_PACKAGE_COUNTRY_OPTIONS,
  AGENT_PACKAGE_REGION_OPTIONS,
  AgentPackageFormValue,
  createAgentPackageFormValue,
} from './agent-package.mock';
import { AgentPackagesService } from './agent-packages.service';
import { SeroCurrencyPipe } from 'src/app/shared/pipes/sero-currency.pipe';
import { SAUDI_RIYAL_SYMBOL } from 'src/app/shared/currency/currency-format.util';

type AgentPackageFormMode = 'create' | 'edit' | 'view';
type RequiredField = 'name' | 'price' | 'startDate' | 'endDate';

@Component({
  selector: 'app-agent-package-form-page',
  standalone: true,
  imports: [CommonModule, SeroDropdownComponent, SeroDatePickerComponent, SeroCurrencyPipe],
  template: `
    <section class="pkg-form-page" dir="rtl">
      <header class="page-head">
        <h1>{{ pageTitle }}</h1>
      </header>

      <form [class.view-mode]="isViewMode" class="surface-card" (submit)="onSave($event)" novalidate>
        <div class="form-grid">

          <div class="field-group field-group--full">
            <label class="field-label" for="pkg-name">
              اسم الباقة
              @if (!isViewMode) { <span class="required-mark">*</span> }
            </label>
            @if (isViewMode) {
              <div class="readonly-value">{{ form.name || '—' }}</div>
            } @else {
              <input
                id="pkg-name"
                class="form-control"
                [class.is-invalid]="isFieldInvalid('name')"
                type="text"
                autocomplete="off"
                placeholder="أدخل اسم الباقة"
                [value]="form.name"
                (input)="form = { ...form, name: $any($event.target).value }" />
              @if (isFieldInvalid('name')) {
                <span class="field-error">هذا الحقل مطلوب</span>
              }
            }
          </div>

          <div class="field-group field-group--full">
            <label class="field-label" for="pkg-desc">وصف الباقة</label>
            @if (isViewMode) {
              <div class="readonly-value readonly-value--textarea">{{ form.description || '—' }}</div>
            } @else {
              <textarea
                id="pkg-desc"
                class="form-control form-textarea"
                rows="3"
                placeholder="أدخل وصف الباقة"
                [value]="form.description"
                (input)="form = { ...form, description: $any($event.target).value }">
              </textarea>
            }
          </div>

          <div class="field-group">
            <label class="field-label" for="pkg-price">
              السعر
              @if (!isViewMode) { <span class="required-mark">*</span> }
            </label>
            @if (isViewMode) {
              <div class="readonly-value" dir="ltr">
                {{ form.price !== null ? ((form.price | seroCurrency)) : '—' }}
              </div>
            } @else {
              <div class="price-wrap">
                <span class="price-prefix">{{ riyalSymbol }}</span>
                <input
                  id="pkg-price"
                  class="form-control price-input"
                  [class.is-invalid]="isFieldInvalid('price')"
                  type="number"
                  min="0"
                  step="0.01"
                  inputmode="decimal"
                  placeholder="0.00"
                  [value]="form.price ?? ''"
                  (input)="form = { ...form, price: $any($event.target).value ? +$any($event.target).value : null }" />
              </div>
              @if (isFieldInvalid('price')) {
                <span class="field-error">هذا الحقل مطلوب</span>
              }
            }
          </div>

          <div class="field-group">
            <label class="field-label">الدولة</label>
            @if (isViewMode) {
              <div class="readonly-value">{{ countryLabel(form.country) }}</div>
            } @else {
              <app-sero-dropdown
                [options]="countryOptions"
                [value]="form.country"
                placeholder="اختر الدولة"
                (valueChange)="form = { ...form, country: $event }">
              </app-sero-dropdown>
            }
          </div>

          <div class="field-group">
            <label class="field-label">المنطقة</label>
            @if (isViewMode) {
              <div class="readonly-value">{{ regionLabel(form.region) }}</div>
            } @else {
              <app-sero-dropdown
                [options]="regionOptions"
                [value]="form.region"
                placeholder="اختر المنطقة"
                (valueChange)="form = { ...form, region: $event }">
              </app-sero-dropdown>
            }
          </div>

          <div class="field-group">
            <label class="field-label">المدينة</label>
            @if (isViewMode) {
              <div class="readonly-value">{{ cityLabel(form.city) }}</div>
            } @else {
              <app-sero-dropdown
                [options]="cityOptions"
                [value]="form.city"
                placeholder="اختر المدينة"
                (valueChange)="form = { ...form, city: $event }">
              </app-sero-dropdown>
            }
          </div>

          <div class="field-group">
            <label class="field-label">الوكيل</label>
            @if (isViewMode) {
              <div class="readonly-value">{{ agentLabel(form.agent) }}</div>
            } @else {
              <app-sero-dropdown
                [options]="agentOptions"
                [value]="form.agent"
                placeholder="اختر الوكيل"
                (valueChange)="form = { ...form, agent: $event }">
              </app-sero-dropdown>
            }
          </div>

          <div class="field-group">
            <label class="field-label">
              تاريخ البداية
              @if (!isViewMode) { <span class="required-mark">*</span> }
            </label>
            @if (isViewMode) {
              <div class="readonly-value">{{ form.startDate ? (form.startDate | date:'d/M/yyyy') : '—' }}</div>
            } @else {
              <div class="field-control" [class.is-invalid]="isFieldInvalid('startDate')">
                <app-sero-date-picker
                  [value]="form.startDate"
                  placeholder="اختر تاريخ البداية"
                  (valueChange)="form = { ...form, startDate: $event }">
                </app-sero-date-picker>
              </div>
              @if (isFieldInvalid('startDate')) {
                <span class="field-error">هذا الحقل مطلوب</span>
              }
            }
          </div>

          <div class="field-group">
            <label class="field-label">
              تاريخ النهاية
              @if (!isViewMode) { <span class="required-mark">*</span> }
            </label>
            @if (isViewMode) {
              <div class="readonly-value">{{ form.endDate ? (form.endDate | date:'d/M/yyyy') : '—' }}</div>
            } @else {
              <div class="field-control" [class.is-invalid]="isFieldInvalid('endDate')">
                <app-sero-date-picker
                  [value]="form.endDate"
                  placeholder="اختر تاريخ النهاية"
                  (valueChange)="form = { ...form, endDate: $event }">
                </app-sero-date-picker>
              </div>
              @if (isFieldInvalid('endDate')) {
                <span class="field-error">هذا الحقل مطلوب</span>
              }
            }
          </div>

          <div class="field-group">
            <label class="field-label">التأشيرة مشمولة</label>
            @if (isViewMode) {
              <div class="readonly-value">{{ form.visaIncluded ? 'نعم' : 'لا' }}</div>
            } @else {
              <label class="active-toggle">
                <span class="active-state">{{ form.visaIncluded ? 'نعم' : 'لا' }}</span>
                <span class="switch-control">
                  <input
                    type="checkbox"
                    [checked]="form.visaIncluded"
                    (change)="form = { ...form, visaIncluded: $any($event.target).checked }" />
                  <span class="switch-track" aria-hidden="true"></span>
                </span>
              </label>
            }
          </div>

          <div class="field-group">
            <label class="field-label">فعال</label>
            @if (isViewMode) {
              <div class="readonly-value">{{ form.isActive ? 'نعم' : 'لا' }}</div>
            } @else {
              <label class="active-toggle">
                <span class="active-state">{{ form.isActive ? 'نعم' : 'لا' }}</span>
                <span class="switch-control">
                  <input
                    type="checkbox"
                    [checked]="form.isActive"
                    (change)="form = { ...form, isActive: $any($event.target).checked }" />
                  <span class="switch-track" aria-hidden="true"></span>
                </span>
              </label>
            }
          </div>

          <div class="field-group field-group--full">
            <label class="field-label">صورة الباقة</label>
            <div class="image-upload-area">
              <div class="image-preview-box">
                <span class="material-icons-round img-icon">inventory_2</span>
                <span class="img-label">صورة الباقة الافتراضية</span>
              </div>
              @if (!isViewMode) {
                <button type="button" class="btn btn--secondary btn--sm">
                  <span class="material-icons-round">upload</span>
                  <span>رفع صورة</span>
                </button>
              }
            </div>
          </div>

        </div>

        @if (saveAttempted && !isFormValid) {
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
              <span>{{ isEditMode ? 'حفظ التعديلات' : 'حفظ الباقة' }}</span>
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
    .pkg-form-page {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .page-head h1 {
      font-size: 1rem;
      font-weight: 800;
      color: var(--sero-text-primary);
      margin: 0;
    }

    .surface-card {
      background: var(--sero-card-bg);
      border: 1px solid var(--sero-border-light);
      border-radius: 8px;
      box-shadow: var(--shadow-sm);
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .field-group--full { grid-column: 1 / -1; }

    .field-label {
      font-size: 0.73rem;
      font-weight: 700;
      color: var(--sero-text-secondary);
    }

    .required-mark { color: var(--sero-danger); }

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

    .form-control:hover { border-color: var(--sero-border-strong); }

    .form-control:focus {
      border-color: var(--sero-primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--sero-primary) 12%, transparent);
    }

    .form-control.is-invalid { border-color: var(--sero-danger); }

    .form-textarea {
      min-height: auto;
      padding: 10px 12px;
      resize: vertical;
      line-height: 1.5;
    }

    .readonly-value {
      min-height: 42px;
      display: flex;
      align-items: center;
      padding: 0 12px;
      background: var(--sero-bg-subtle);
      border: 1px solid var(--sero-border);
      border-radius: 10px;
      color: var(--sero-text-primary);
      font-size: 0.84rem;
      font-weight: 600;
      box-sizing: border-box;
    }

    .readonly-value--textarea {
      min-height: 80px;
      align-items: flex-start;
      padding: 10px 12px;
      white-space: pre-wrap;
    }

    .price-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    .price-prefix {
      position: absolute;
      right: 12px;
      font-size: 0.84rem;
      font-weight: 700;
      color: var(--sero-text-secondary);
      pointer-events: none;
      z-index: 1;
    }

    .price-input { padding-right: 28px; }

    .field-control { display: block; }

    .field-control.is-invalid :host ::ng-deep .sero-date-field {
      border: 1px solid var(--sero-danger);
      border-radius: 10px;
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

    .active-toggle:hover { border-color: var(--sero-border-strong); background: var(--sero-surface-2); }

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

    .image-upload-area {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px;
      border: 1px dashed var(--sero-border);
      border-radius: 10px;
      background: var(--sero-bg-subtle);
    }

    .image-preview-box {
      width: 72px;
      height: 72px;
      border-radius: 10px;
      background: var(--sero-card-bg);
      border: 1px solid var(--sero-border-light);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 4px;
      flex-shrink: 0;
    }

    .img-icon {
      font-size: 28px;
      color: var(--sero-text-secondary);
    }

    .img-label {
      font-size: 0.62rem;
      color: var(--sero-text-secondary);
      font-weight: 600;
      text-align: center;
      line-height: 1.3;
    }

    .validation-banner {
      border: 1px solid var(--sero-danger-border);
      border-radius: 8px;
      background: var(--sero-danger-bg);
      color: var(--sero-danger);
      font-size: 0.78rem;
      font-weight: 700;
      padding: 10px 12px;
    }

    .success-banner {
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
      gap: 8px;
      padding-top: 4px;
      border-top: 1px solid var(--sero-border-light);
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

    .btn--sm {
      min-height: 32px;
      padding: 0 12px;
      font-size: 0.76rem;
    }

    .btn .material-icons-round { font-size: 16px; }
    .btn--sm .material-icons-round { font-size: 15px; }

    .btn--primary { background: var(--sero-primary); color: var(--sero-card-bg); }
    .btn--primary:hover:not(:disabled) { background: var(--sero-primary-dark); }
    .btn--primary:disabled { opacity: 0.6; cursor: not-allowed; }

    .btn--secondary {
      background: var(--sero-card-bg);
      color: var(--sero-text-primary);
      border-color: var(--sero-border);
    }

    .btn--secondary:hover:not(:disabled) { background: var(--sero-surface-2); border-color: var(--sero-border-strong); }
    .btn--secondary:disabled { opacity: 0.6; cursor: not-allowed; }

    .view-mode .form-control:disabled {
      background: var(--sero-bg-subtle);
      color: var(--sero-text-secondary);
      cursor: default;
    }

    @media (max-width: 560px) {
      .form-grid { grid-template-columns: 1fr; }
      .field-group--full { grid-column: 1; }
    }
  `],
})
export class AgentPackageFormPageComponent implements OnInit {
  private readonly service = inject(AgentPackagesService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly riyalSymbol = SAUDI_RIYAL_SYMBOL;

  readonly countryOptions = AGENT_PACKAGE_COUNTRY_OPTIONS;
  readonly regionOptions = AGENT_PACKAGE_REGION_OPTIONS;
  readonly cityOptions = AGENT_PACKAGE_CITY_OPTIONS;
  readonly agentOptions = AGENT_PACKAGE_AGENT_OPTIONS;

  readonly mode: AgentPackageFormMode;

  private currentId: string | null = null;
  form: AgentPackageFormValue = createAgentPackageFormValue();
  saveAttempted = false;
  saveSuccess = false;

  constructor() {
    const segment = this.route.snapshot.url[1]?.path;
    this.mode = segment === 'edit' ? 'edit' : segment === 'view' ? 'view' : 'create';
  }

  get isViewMode(): boolean { return this.mode === 'view'; }
  get isEditMode(): boolean { return this.mode === 'edit'; }

  get pageTitle(): string {
    if (this.mode === 'view') return 'عرض الباقة';
    if (this.mode === 'edit') return 'تعديل الباقة';
    return 'تعريف باقة جديدة';
  }

  get isFormValid(): boolean {
    return this.form.name.trim().length > 0 &&
           this.form.price !== null && this.form.price > 0 &&
           this.form.startDate.trim().length > 0 &&
           this.form.endDate.trim().length > 0;
  }

  isFieldInvalid(field: RequiredField): boolean {
    if (!this.saveAttempted) return false;
    if (field === 'name') return !this.form.name.trim();
    if (field === 'price') return this.form.price === null || this.form.price <= 0;
    if (field === 'startDate') return !this.form.startDate.trim();
    if (field === 'endDate') return !this.form.endDate.trim();
    return false;
  }

  ngOnInit(): void {
    if (this.mode !== 'create') {
      this.route.paramMap.subscribe((params) => {
        const id = params.get('id');
        if (id) {
          this.currentId = id;
          const pkg = this.service.getById(id);
          if (pkg) {
            this.form = {
              name: pkg.name,
              description: pkg.description,
              price: pkg.price,
              startDate: pkg.startDate,
              endDate: pkg.endDate,
              visaIncluded: pkg.visaIncluded,
              imageUrl: pkg.imageUrl,
              country: pkg.country,
              region: pkg.region,
              city: pkg.city,
              agent: pkg.agent,
              isActive: pkg.isActive,
            };
          }
        }
      });
    }
  }

  onSave(event: Event): void {
    event.preventDefault();
    this.saveAttempted = true;
    if (!this.isFormValid) return;

    if (this.isEditMode && this.currentId) {
      this.service.update(this.currentId, this.form);
      this.saveSuccess = true;
      setTimeout(() => void this.router.navigate(['/admin/packages']), 1200);
    } else {
      this.service.add(this.form);
      void this.router.navigate(['/admin/packages']);
    }
  }

  cancel(): void {
    void this.router.navigate(['/admin/packages']);
  }

  countryLabel(value: string): string {
    return AGENT_PACKAGE_COUNTRY_OPTIONS.find((o) => o.value === value)?.label ?? (value || '—');
  }

  regionLabel(value: string): string {
    return AGENT_PACKAGE_REGION_OPTIONS.find((o) => o.value === value)?.label ?? (value || '—');
  }

  cityLabel(value: string): string {
    return AGENT_PACKAGE_CITY_OPTIONS.find((o) => o.value === value)?.label ?? (value || '—');
  }

  agentLabel(value: string): string {
    return AGENT_PACKAGE_AGENT_OPTIONS.find((o) => o.value === value)?.label ?? (value || '—');
  }
}
