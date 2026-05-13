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
              <div class="placeholder-step">
                <span class="material-symbols-outlined placeholder-icon">directions_bus</span>
                <h2>{{ 'packageDefinition.steps.transport' | translate }}</h2>
                <p>{{ 'packageDefinition.comingSoon' | translate }}</p>
                <button class="btn-back" type="button" (click)="goToStep(2)">
                  <span class="material-symbols-outlined">chevron_right</span>
                  {{ 'packageDefinition.actions.back' | translate }}
                </button>
              </div>
            }
            @case (4) {
              <div class="placeholder-step">
                <span class="material-symbols-outlined placeholder-icon">restaurant</span>
                <h2>{{ 'packageDefinition.steps.meals' | translate }}</h2>
                <p>{{ 'packageDefinition.comingSoon' | translate }}</p>
                <button class="btn-back" type="button" (click)="goToStep(3)">
                  <span class="material-symbols-outlined">chevron_right</span>
                  {{ 'packageDefinition.actions.back' | translate }}
                </button>
              </div>
            }
            @case (5) {
              <div class="placeholder-step">
                <span class="material-symbols-outlined placeholder-icon">flight</span>
                <h2>{{ 'packageDefinition.steps.tickets' | translate }}</h2>
                <p>{{ 'packageDefinition.comingSoon' | translate }}</p>
                <button class="btn-back" type="button" (click)="goToStep(4)">
                  <span class="material-symbols-outlined">chevron_right</span>
                  {{ 'packageDefinition.actions.back' | translate }}
                </button>
              </div>
            }
            @case (6) {
              <div class="placeholder-step">
                <span class="material-symbols-outlined placeholder-icon">checklist</span>
                <h2>{{ 'packageDefinition.steps.review' | translate }}</h2>
                <p>{{ 'packageDefinition.comingSoon' | translate }}</p>
                <button class="btn-back" type="button" (click)="goToStep(5)">
                  <span class="material-symbols-outlined">chevron_right</span>
                  {{ 'packageDefinition.actions.back' | translate }}
                </button>
              </div>
            }
            @case (7) {
              <div class="placeholder-step success">
                <span class="material-symbols-outlined placeholder-icon">check_circle</span>
                <h2>{{ 'packageDefinition.steps.confirmation' | translate }}</h2>
                <p>{{ 'packageDefinition.comingSoon' | translate }}</p>
              </div>
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
