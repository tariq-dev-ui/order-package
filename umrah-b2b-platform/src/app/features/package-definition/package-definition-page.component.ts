import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PackageDefinitionState, HotelSelection, OrderSummary } from './package-definition.models';
import { PACKAGE_STEPS } from './package-definition.mock';
import { PackageStepperComponent } from './components/package-stepper/package-stepper.component';
import { OrderSummarySidebarComponent } from './components/order-summary-sidebar/order-summary-sidebar.component';
import { HotelStepFormComponent } from './components/hotel-step-form/hotel-step-form.component';

const INITIAL_SUMMARY: OrderSummary = {
  makkahHotels: [],
  madinahHotels: [],
  hasTransport: false,
  hasMeals: false,
  hasTickets: false,
};

@Component({
  selector: 'app-package-definition-page',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    PackageStepperComponent,
    OrderSummarySidebarComponent,
    HotelStepFormComponent,
  ],
  template: `
    <div class="pkg-page">
      <!-- Stepper -->
      <div class="pkg-stepper-wrap">
        <app-package-stepper
          [steps]="steps"
          [currentStep]="state().currentStep"
          (stepClicked)="goToStep($event)" />
      </div>

      <!-- 2-column layout: form (right in RTL) + summary (left in RTL) -->
      <div class="pkg-layout">

        <!-- Main form area -->
        <div class="pkg-main">
          @switch (state().currentStep) {
            @case (1) {
              <div class="step-section-header">
                <span class="material-symbols-outlined step-section-icon">apartment</span>
                <div class="step-section-content">
                  <div class="step-section-line">
                    <h2 class="step-section-title">{{ 'packageDefinition.steps.makkahHotels' | translate }}</h2>
                    <span class="step-section-separator" aria-hidden="true">|</span>
                    <p class="step-section-sub">{{ 'packageDefinition.stepHint.makkah' | translate }}</p>
                  </div>
                  <label class="apply-nights-toggle" [class.is-active]="state().applyNightsToAll">
                    <span class="apply-nights-meta">
                      <span class="material-symbols-outlined nights-icon">nights_stay</span>
                      <span>تفعيل عدد الليالي للجميع</span>
                    </span>
                    <span class="apply-nights-switch">
                      <input
                        type="checkbox"
                        [checked]="state().applyNightsToAll"
                        (change)="setApplyNights($any($event.target).checked)" />
                      <span class="switch-track" aria-hidden="true"></span>
                    </span>
                  </label>
                </div>
              </div>
              <app-hotel-step-form
                city="makkah"
                [applyNightsToAll]="state().applyNightsToAll"
                (hotelAdded)="addMakkahHotel($event)"
                (applyNightsToAllChange)="setApplyNights($event)"
                (next)="goToStep(2)" />
            }
            @case (2) {
              <div class="step-section-header">
                <span class="material-symbols-outlined step-section-icon">apartment</span>
                <div class="step-section-content">
                  <div class="step-section-line">
                    <h2 class="step-section-title">{{ 'packageDefinition.steps.madinahHotels' | translate }}</h2>
                    <span class="step-section-separator" aria-hidden="true">|</span>
                    <p class="step-section-sub">{{ 'packageDefinition.stepHint.madinah' | translate }}</p>
                  </div>
                  <label class="apply-nights-toggle" [class.is-active]="state().applyNightsToAll">
                    <span class="apply-nights-meta">
                      <span class="material-symbols-outlined nights-icon">nights_stay</span>
                      <span>تفعيل عدد الليالي للجميع</span>
                    </span>
                    <span class="apply-nights-switch">
                      <input
                        type="checkbox"
                        [checked]="state().applyNightsToAll"
                        (change)="setApplyNights($any($event.target).checked)" />
                      <span class="switch-track" aria-hidden="true"></span>
                    </span>
                  </label>
                </div>
              </div>
              <app-hotel-step-form
                city="madinah"
                [applyNightsToAll]="state().applyNightsToAll"
                (hotelAdded)="addMadinahHotel($event)"
                (applyNightsToAllChange)="setApplyNights($event)"
                (next)="goToStep(3)" />
            }
            @case (3) {
              <div class="step-section-header">
                <span class="material-symbols-outlined step-section-icon">directions_bus</span>
                <div class="step-section-content">
                  <div class="step-section-line">
                    <h2 class="step-section-title">خيارات النقل</h2>
                    <span class="step-section-separator" aria-hidden="true">|</span>
                    <p class="step-section-sub">اختر وسيلة النقل المفضلة لديك</p>
                  </div>
                </div>
              </div>

              <section class="step-form-panel">
                <div class="field-row">
                  <div class="field-group">
                    <label class="field-label">مسار الرحلة</label>
                    <input class="step-input" type="text" />
                  </div>
                  <div class="field-group">
                    <label class="field-label">نوع النقل</label>
                    <select class="step-select">
                      <option>اختر نوع النقل</option>
                      <option>باص</option>
                      <option>فان</option>
                      <option>سيارة خاصة</option>
                    </select>
                  </div>
                </div>
                <div class="field-group field-sm">
                  <label class="field-label">Guests Count</label>
                  <input class="step-input" type="number" value="1" min="1" />
                  <p class="field-hint">1 Guest</p>
                </div>
                <p class="step-warning">يرجى تعبئة جميع الحقول المطلوبة أعلاه لإضافة عنصر جديد.</p>
                <div class="step-actions-row">
                  <button class="btn-secondary" type="button">إضافة جديد</button>
                  <div class="step-actions-spacer"></div>
                  <button class="btn-secondary" type="button" (click)="goToStep(2)">السابق</button>
                  <button class="btn-ghost" type="button" (click)="goToStep(4)">تخطي</button>
                  <button class="btn-primary" type="button" (click)="goToStep(4)">التالي</button>
                </div>
              </section>
            }
            @case (4) {
              <div class="step-section-header">
                <span class="material-symbols-outlined step-section-icon">flight</span>
                <div class="step-section-content">
                  <div class="step-section-line">
                    <h2 class="step-section-title">تذاكر</h2>
                    <span class="step-section-separator" aria-hidden="true">|</span>
                    <p class="step-section-sub">أضف تفاصيل تذاكر الطيران</p>
                  </div>
                </div>
              </div>

              <section class="step-form-panel">
                <div class="field-grid-4">
                  <div class="field-group"><label class="field-label">بلد المغادرة</label><input class="step-input" type="text" /></div>
                  <div class="field-group"><label class="field-label">مدينة المغادرة</label><input class="step-input" type="text" /></div>
                  <div class="field-group"><label class="field-label">بلد الوصول</label><input class="step-input" type="text" /></div>
                  <div class="field-group"><label class="field-label">مدينة الوصول</label><input class="step-input" type="text" /></div>
                </div>
                <div class="field-grid-4">
                  <div class="field-group"><label class="field-label">نوع الرحلة</label><input class="step-input" type="text" /></div>
                  <div class="field-group"><label class="field-label">درجة السفر</label><input class="step-input" type="text" /></div>
                  <div class="field-group"><label class="field-label">شركة الطيران</label><input class="step-input" type="text" /></div>
                  <div class="field-group"><label class="field-label">مقاعد</label><input class="step-input" type="number" value="1" min="1" /></div>
                </div>
                <p class="field-hint">1 مقعد</p>
                <div class="step-actions-row">
                  <button class="btn-secondary" type="button">إضافة جديد</button>
                  <div class="step-actions-spacer"></div>
                  <button class="btn-secondary" type="button" (click)="goToStep(3)">السابق</button>
                  <button class="btn-ghost" type="button" (click)="goToStep(5)">تخطي</button>
                  <button class="btn-primary" type="button" (click)="goToStep(5)">التالي</button>
                </div>
              </section>
            }
            @case (5) {
              <div class="step-section-header">
                <span class="material-symbols-outlined step-section-icon">restaurant</span>
                <div class="step-section-content">
                  <div class="step-section-line">
                    <h2 class="step-section-title">خدمات الطعام</h2>
                    <span class="step-section-separator" aria-hidden="true">|</span>
                    <p class="step-section-sub">حدد تفضيلات الإقامة الخاصة بك</p>
                  </div>
                </div>
              </div>

              <section class="step-form-panel">
                <div class="field-row">
                  <div class="field-group">
                    <label class="field-label">نوع الطعام</label>
                    <select class="step-select">
                      <option>اختر نوع الطعام</option>
                      <option>بوفيه</option>
                      <option>وجبات فردية</option>
                    </select>
                  </div>
                  <div class="field-group">
                    <label class="field-label">خطة الوجبات</label>
                    <select class="step-select">
                      <option>اختر خطة الوجبات</option>
                      <option>إفطار</option>
                      <option>نصف إقامة</option>
                      <option>إقامة كاملة</option>
                    </select>
                  </div>
                </div>
                <div class="field-group field-sm">
                  <label class="field-label">Guests Count</label>
                  <input class="step-input" type="number" value="1" min="1" />
                  <p class="field-hint">1 Guest</p>
                </div>
                <p class="step-warning">يرجى تعبئة جميع الحقول المطلوبة أعلاه لإضافة عنصر جديد.</p>
                <div class="step-actions-row">
                  <button class="btn-secondary" type="button">إضافة جديد</button>
                  <div class="step-actions-spacer"></div>
                  <button class="btn-secondary" type="button" (click)="goToStep(4)">السابق</button>
                  <button class="btn-ghost" type="button" (click)="goToStep(6)">تخطي</button>
                  <button class="btn-primary" type="button" (click)="goToStep(6)">التالي</button>
                </div>
              </section>
            }
            @case (6) {
              <div class="step-section-header">
                <span class="material-symbols-outlined step-section-icon">checklist</span>
                <div class="step-section-content">
                  <div class="step-section-line">
                    <h2 class="step-section-title">التفاصيل النهائية</h2>
                    <span class="step-section-separator" aria-hidden="true">|</span>
                    <p class="step-section-sub">أكمل معلومات الباقة</p>
                  </div>
                </div>
              </div>

              <section class="step-form-panel">
                <div class="field-row">
                  <div class="field-group"><label class="field-label">عنوان الباقة</label><input class="step-input" type="text" /></div>
                  <div class="field-group"><label class="field-label">Guest Count</label><input class="step-input" type="number" placeholder="Enter guest count" /></div>
                </div>
                <div class="field-row">
                  <div class="field-group"><label class="field-label">الكمية</label><input class="step-input" type="number" placeholder="Enter quantity" /></div>
                  <div class="field-group"><label class="field-label">تفعيل الباقة</label><label class="step-toggle"><input type="checkbox" checked /><span>تنشيط الباقة</span></label></div>
                </div>
                <div class="field-row">
                  <div class="field-group"><label class="field-label">رمز الباقة</label><input class="step-input" type="text" placeholder="أدخل رمز الباقة" /></div>
                  <div class="field-group"><label class="field-label">تضمين التأشيرة</label><label class="step-toggle"><input type="checkbox" /><span>تضمين التأشيرة</span></label></div>
                </div>
                <div class="field-row">
                  <div class="field-group"><label class="field-label">تاريخ البداية</label><input class="step-input" type="date" /></div>
                  <div class="field-group"><label class="field-label">تاريخ النهاية</label><input class="step-input" type="date" /></div>
                </div>
                <div class="field-group"><label class="field-label">إضافة وسوم</label><input class="step-input" type="text" value="جارٍ تحميل الوسوم..." readonly /></div>
                <div class="field-group"><label class="field-label">اختر الوكلاء</label><input class="step-input" type="text" value="جاري تحميل الوكلاء..." readonly /></div>
                <div class="step-actions-row">
                  <div class="step-actions-spacer"></div>
                  <button class="btn-secondary" type="button" (click)="goToStep(5)">السابق</button>
                  <button class="btn-primary" type="button" (click)="goToStep(7)">التالي</button>
                </div>
              </section>
            }
            @case (7) {
              <div class="step-section-header">
                <span class="material-symbols-outlined step-section-icon">payments</span>
                <div class="step-section-content">
                  <div class="step-section-line">
                    <h2 class="step-section-title">Pricing</h2>
                    <span class="step-section-separator" aria-hidden="true">|</span>
                    <p class="step-section-sub">Set the selling price for each service</p>
                  </div>
                </div>
              </div>

              <section class="step-form-panel">
                <div class="pricing-grid">
                  <div class="pricing-item"><span>Sum of services</span><strong>0.00 R</strong></div>
                  <div class="pricing-item"><span>Adjust Price</span><strong>Markup</strong></div>
                  <div class="pricing-item"><span>الخصم</span><strong>0%</strong></div>
                </div>
                <button class="btn-secondary" type="button">تطبيق</button>
                <div class="pricing-final">
                  <p>Final Package Price (blended)</p>
                  <div class="price-value">0.00 <span>R</span></div>
                </div>
                <label class="step-toggle">
                  <input type="checkbox" />
                  <span>Hide service breakdown from agent (show blended price only)</span>
                </label>
                <div class="pricing-verify">
                  <div class="verify-option"><strong>Verified — locked</strong><p>Prices are final and cannot change.</p></div>
                  <div class="verify-option"><strong>Approximate — confirmed on request</strong><p>Final amount is confirmed when requested.</p></div>
                </div>
                <div class="step-actions-row">
                  <div class="step-actions-spacer"></div>
                  <button class="btn-secondary" type="button" (click)="goToStep(6)">السابق</button>
                  <button class="btn-primary" type="button">إنشاء الباقة</button>
                </div>
              </section>
            }
          }
        </div>

        <!-- Summary sidebar -->
        <div class="pkg-sidebar">
          <app-order-summary-sidebar [summary]="state().orderSummary" />
        </div>

      </div>
    </div>
  `,
  styles: [`
    .pkg-page {
      display: flex;
      flex-direction: column;
      gap: 0;
      max-width: 1200px;
      margin: 0 auto;
    }

    /* Stepper wrapper */
    .pkg-stepper-wrap {
      background: var(--sero-surface);
      border: 1px solid var(--sero-border);
      border-radius: 14px;
      padding: 0 20px;
      margin-bottom: 20px;
    }

    /* Layout */
    .pkg-layout {
      display: flex;
      gap: 20px;
      align-items: flex-start;
    }

    .pkg-main {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .pkg-sidebar {
      width: 300px;
      flex-shrink: 0;
    }

    /* Step section header */
    .step-section-header {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px 20px;
      background: var(--sero-surface);
      border: 1px solid var(--sero-border);
      border-radius: 12px;
    }

    .step-section-content {
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-width: 0;
      width: 100%;
      align-items: flex-start;
    }

    .step-section-icon {
      font-size: 24px;
      color: var(--sero-primary);
      margin-top: 2px;
    }

    .step-section-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--sero-text);
      margin: 0;
    }

    .step-section-line {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: nowrap;
      min-width: 0;
    }

    .step-section-separator {
      color: var(--sero-text-muted);
      font-weight: 500;
      line-height: 1;
    }

    .step-section-sub {
      font-size: 0.8125rem;
      color: var(--sero-text-secondary);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .apply-nights-toggle {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      width: 225px;
      max-width: 100%;
      min-height: 40px;
      padding: 8px 10px;
      border: 1px solid var(--sero-border-light);
      border-radius: 10px;
      background: var(--sero-card-bg);
      transition: border-color var(--t-fast), background var(--t-fast), box-shadow var(--t-fast);
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--sero-text-secondary);
      cursor: pointer;
      user-select: none;
    }

    .apply-nights-toggle:hover {
      border-color: var(--sero-border-strong);
      background: var(--sero-surface-2);
    }

    .apply-nights-toggle.is-active {
      border-color: color-mix(in srgb, var(--sero-primary) 45%, var(--sero-border));
      background: color-mix(in srgb, var(--sero-primary) 6%, var(--sero-card-bg));
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--sero-primary) 12%, transparent);
    }

    .apply-nights-meta {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-width: 0;
      white-space: nowrap;
    }

    .nights-icon {
      font-size: 16px;
      color: var(--sero-primary);
    }

    .apply-nights-switch {
      position: relative;
      width: 38px;
      height: 22px;
      flex-shrink: 0;
    }

    .apply-nights-switch input {
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

    .apply-nights-switch input:checked + .switch-track {
      background: var(--sero-primary);
    }

    .apply-nights-switch input:checked + .switch-track::after {
      transform: translateX(16px);
    }

    .step-form-panel {
      background: var(--sero-surface);
      border: 1px solid var(--sero-border);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .field-grid-4 {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
    }

    .step-input,
    .step-select {
      width: 100%;
      min-height: 40px;
      border: 1px solid var(--sero-border);
      border-radius: 8px;
      background: var(--sero-card-bg);
      color: var(--sero-text-primary);
      font-family: var(--sero-font);
      font-size: 0.82rem;
      padding: 8px 10px;
      outline: none;
    }

    .step-input:focus,
    .step-select:focus {
      border-color: var(--sero-primary);
      box-shadow: 0 0 0 2px color-mix(in srgb, var(--sero-primary) 15%, transparent);
    }

    .field-sm { max-width: 220px; }

    .field-hint {
      margin: 0;
      font-size: 0.76rem;
      color: var(--sero-text-muted);
    }

    .step-warning {
      margin: 0;
      font-size: 0.8rem;
      color: var(--sero-warning);
    }

    .step-actions-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 2px;
    }

    .step-actions-spacer { flex: 1; }

    .btn-primary,
    .btn-secondary,
    .btn-ghost {
      min-height: 38px;
      border-radius: 8px;
      border: 1px solid var(--sero-border);
      padding: 0 14px;
      font-family: var(--sero-font);
      font-size: 0.82rem;
      font-weight: 700;
      cursor: pointer;
    }

    .btn-primary {
      background: var(--sero-primary);
      border-color: var(--sero-primary);
      color: #fff;
    }

    .btn-secondary {
      background: #fff;
      color: var(--sero-text-primary);
    }

    .btn-ghost {
      background: var(--sero-surface-2);
      color: var(--sero-text-secondary);
    }

    .step-toggle {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8rem;
      color: var(--sero-text-secondary);
      cursor: pointer;
      width: fit-content;
    }

    .step-toggle input {
      width: 15px;
      height: 15px;
      accent-color: var(--sero-primary);
    }

    .pricing-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 10px;
    }

    .pricing-item {
      border: 1px solid var(--sero-border-light);
      border-radius: 10px;
      background: var(--sero-card-bg);
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 5px;
      font-size: 0.78rem;
      color: var(--sero-text-secondary);
    }

    .pricing-item strong {
      font-size: 0.92rem;
      color: var(--sero-text-primary);
    }

    .pricing-final {
      border: 1px solid var(--sero-border);
      border-radius: 10px;
      background: color-mix(in srgb, var(--sero-primary) 4%, #fff);
      padding: 12px;
    }

    .pricing-final p {
      margin: 0;
      font-size: 0.78rem;
      color: var(--sero-text-secondary);
    }

    .price-value {
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--sero-primary-dark);
      margin-top: 4px;
    }

    .price-value span {
      font-size: 0.9rem;
      font-weight: 600;
    }

    .pricing-verify {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }

    .verify-option {
      border: 1px solid var(--sero-border-light);
      border-radius: 10px;
      padding: 10px;
      background: #fff;
    }

    .verify-option strong {
      font-size: 0.78rem;
      color: var(--sero-text-primary);
    }

    .verify-option p {
      margin: 4px 0 0;
      font-size: 0.73rem;
      color: var(--sero-text-secondary);
      line-height: 1.5;
    }

    /* Placeholder steps (3-7) */
    .placeholder-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 12px;
      padding: 60px 24px;
      background: var(--sero-surface);
      border: 1px solid var(--sero-border);
      border-radius: 14px;
      text-align: center;
    }

    .placeholder-icon {
      font-size: 48px;
      color: color-mix(in srgb, var(--sero-primary) 40%, transparent);
    }

    .placeholder-step.success .placeholder-icon { color: #22c55e; }

    .placeholder-step h2 {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--sero-text);
      margin: 0;
    }

    .placeholder-step p {
      font-size: 0.875rem;
      color: var(--sero-text-secondary);
      margin: 0;
    }

    .btn-back {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px 16px;
      border: 1px solid var(--sero-border);
      border-radius: 8px;
      background: transparent;
      color: var(--sero-text);
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      margin-top: 8px;
      transition: border-color 0.15s, color 0.15s;
    }

    .btn-back:hover {
      border-color: var(--sero-primary);
      color: var(--sero-primary);
    }

    .btn-back .material-symbols-outlined { font-size: 18px; }

    @media (max-width: 860px) {
      .pkg-layout {
        flex-direction: column;
      }
      .pkg-sidebar {
        width: 100%;
      }

      .field-row,
      .field-grid-4,
      .pricing-grid,
      .pricing-verify {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PackageDefinitionPageComponent {
  readonly steps = PACKAGE_STEPS;

  private readonly _state = signal<PackageDefinitionState>({
    currentStep: 1,
    applyNightsToAll: false,
    globalNights: 3,
    orderSummary: { ...INITIAL_SUMMARY, makkahHotels: [], madinahHotels: [] },
  });

  readonly state = this._state.asReadonly();

  goToStep(step: number): void {
    if (step >= 1 && step <= this.steps.length) {
      this._state.update(s => ({ ...s, currentStep: step }));
    }
  }

  addMakkahHotel(hotel: HotelSelection): void {
    this._state.update(s => ({
      ...s,
      orderSummary: {
        ...s.orderSummary,
        makkahHotels: [...s.orderSummary.makkahHotels, hotel],
      },
    }));
  }

  addMadinahHotel(hotel: HotelSelection): void {
    this._state.update(s => ({
      ...s,
      orderSummary: {
        ...s.orderSummary,
        madinahHotels: [...s.orderSummary.madinahHotels, hotel],
      },
    }));
  }

  setApplyNights(value: boolean): void {
    this._state.update(s => ({ ...s, applyNightsToAll: value }));
  }
}
