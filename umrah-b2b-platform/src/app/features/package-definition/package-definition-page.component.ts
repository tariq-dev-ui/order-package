import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PackageDefinitionState, HotelSelection, OrderSummary, FlightFormValues, MealFormValues, PackageDetailsFormValues, PricingFormValues } from './package-definition.models';
import {
  PACKAGE_STEPS,
  TRANSPORT_TYPES,
  TRIP_ROUTES,
  FLIGHT_COUNTRIES,
  FLIGHT_DEFAULT_ARRIVAL_COUNTRY,
  FLIGHT_DEPARTURE_CITIES_BY_COUNTRY,
  FLIGHT_ARRIVAL_CITIES_BY_COUNTRY,
  FLIGHT_TRIP_TYPES,
  FLIGHT_TRAVEL_CLASSES,
  FLIGHT_AIRLINES,
  FOOD_TYPES,
  MEAL_PLANS,
  PACKAGE_TAGS,
  PACKAGE_AGENTS
} from './package-definition.mock';
import { SeroDropdownComponent, SeroDropdownOption } from '../../shared/components/sero-dropdown/sero-dropdown.component';
import { PackageStepperComponent } from './components/package-stepper/package-stepper.component';
import { OrderSummarySidebarComponent } from './components/order-summary-sidebar/order-summary-sidebar.component';
import { HotelStepFormComponent } from './components/hotel-step-form/hotel-step-form.component';
import { CounterInputComponent } from './components/counter-input/counter-input.component';

const INITIAL_SUMMARY: OrderSummary = {
  makkahHotels: [],
  madinahHotels: [],
  hasTransport: false,
  hasMeals: false,
  hasTickets: false,
};

const INITIAL_FLIGHT_FORM: FlightFormValues = {
  departureCountry: '',
  departureCity: '',
  arrivalCountry: FLIGHT_DEFAULT_ARRIVAL_COUNTRY,
  arrivalCity: '',
  tripType: '',
  travelClass: '',
  airline: '',
  seats: 1,
};

const INITIAL_MEAL_FORM: MealFormValues = {
  foodType: '',
  mealPlan: '',
  guests: 1,
};

const INITIAL_PACKAGE_DETAILS_FORM: PackageDetailsFormValues = {
  packageTitle: '',
  guestCount: 1,
  quantity: 1,
  packageCode: '',
  startDate: '',
  endDate: '',
  isPackageActive: true,
  includeVisa: false,
  tags: '',
  agents: '',
};

const INITIAL_PRICING_FORM: PricingFormValues = {
  adjustPriceMode: 'markup',
  markupPercent: 0,
  discountPercent: 0,
  hideServiceBreakdown: false,
  verifiedLocked: true,
  isApplied: false,
  finalPrice: 0,
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
    SeroDropdownComponent,
    CounterInputComponent,
  ],
  template: `
    <div class="pkg-page">
      <!-- Stepper -->
      <div class="pkg-stepper-wrap">
        <app-package-stepper
          [steps]="steps"
          [currentStep]="state().currentStep"
          [stepStatuses]="stepStatuses()"
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
                    <app-sero-dropdown
                      [options]="tripRouteOptions"
                      [value]="state().tripRoute"
                      placeholder="اختر مسار رحلتك"
                      (valueChange)="setTripRoute($event)" />
                  </div>
                  <div class="field-group">
                    <label class="field-label">نوع النقل</label>
                    <app-sero-dropdown
                      [options]="transportTypeOptions"
                      [value]="state().transportType"
                      placeholder="اختر نوع النقل"
                      (valueChange)="setTransportType($event)" />
                  </div>
                </div>
                <div class="field-group field-sm">
                  <label class="field-label">عدد المسافرين</label>
                  <input
                    class="step-input"
                    type="number"
                    [value]="transportGuestsCount()"
                    min="1"
                    (input)="setTransportGuestsCount($any($event.target).value)" />
                  <p class="field-hint">يُحتسب السعر لكل مسافر</p>
                </div>

                @if (showTransportValidation()) {
                  <div class="step-warning">
                    <span class="material-icons-round step-warn-icon">info</span>
                    يرجى تعبئة جميع الحقول المطلوبة أعلاه لإضافة عنصر جديد.
                  </div>
                }

                <div class="step-form-footer">
                  <div class="footer-right">
                    <button class="btn-secondary" type="button" (click)="addTransportItem()">إضافة جديد</button>
                  </div>
                  <div class="footer-left">
                    <button class="btn-outline" type="button" (click)="goToStep(2)">السابق</button>
                    <button class="btn-ghost" type="button" (click)="goToStep(4)">تخطي</button>
                    <button class="btn-primary" type="button" (click)="goToStep(4)">التالي</button>
                  </div>
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
                <div class="field-row">
                  <div class="field-group">
                    <label class="field-label">بلد المغادرة</label>
                    <app-sero-dropdown
                      [options]="flightCountryOptions"
                      [value]="state().flightForm.departureCountry"
                      placeholder="اختر بلد المغادرة"
                      (valueChange)="setFlightDepartureCountry($event)" />
                  </div>
                  <div class="field-group">
                    <label class="field-label">مدينة المغادرة</label>
                    <app-sero-dropdown
                      [options]="departureCityOptions"
                      [value]="state().flightForm.departureCity"
                      placeholder="اختر مدينة المغادرة"
                      (valueChange)="setFlightDepartureCity($event)" />
                  </div>
                </div>
                <div class="field-row">
                  <div class="field-group">
                    <label class="field-label">بلد الوصول</label>
                    <app-sero-dropdown
                      [options]="flightCountryOptions"
                      [value]="state().flightForm.arrivalCountry"
                      placeholder="اختر بلد الوصول"
                      (valueChange)="setFlightArrivalCountry($event)" />
                  </div>
                  <div class="field-group">
                    <label class="field-label">مدينة الوصول</label>
                    <app-sero-dropdown
                      [options]="arrivalCityOptions"
                      [value]="state().flightForm.arrivalCity"
                      placeholder="اختر مدينة الوصول"
                      (valueChange)="setFlightArrivalCity($event)" />
                  </div>
                </div>
                <div class="field-row">
                  <div class="field-group">
                    <label class="field-label">نوع الرحلة</label>
                    <app-sero-dropdown
                      [options]="flightTripTypeOptions"
                      [value]="state().flightForm.tripType"
                      placeholder="اختر نوع الرحلة"
                      (valueChange)="setFlightTripType($event)" />
                  </div>
                  <div class="field-group">
                    <label class="field-label">درجة السفر</label>
                    <app-sero-dropdown
                      [options]="flightTravelClassOptions"
                      [value]="state().flightForm.travelClass"
                      placeholder="اختر درجة السفر"
                      (valueChange)="setFlightTravelClass($event)" />
                  </div>
                </div>
                <div class="field-row">
                  <div class="field-group">
                    <label class="field-label">شركة الطيران</label>
                    <app-sero-dropdown
                      [options]="flightAirlineOptions"
                      [value]="state().flightForm.airline"
                      placeholder="اختر شركة الطيران"
                      (valueChange)="setFlightAirline($event)" />
                  </div>
                  <div class="field-group field-counter">
                    <label class="field-label">مقاعد</label>
                    <app-counter-input
                      [value]="state().flightForm.seats"
                      [min]="1"
                      [max]="99"
                      (valueChange)="setFlightSeats($event)" />
                    <p class="field-hint">{{ state().flightForm.seats }} مقعد</p>
                  </div>
                </div>

                @if (showFlightValidation()) {
                  <div class="step-warning">
                    <span class="material-icons-round step-warn-icon">info</span>
                    يرجى تعبئة جميع حقول الرحلة المطلوبة قبل الإضافة.
                  </div>
                }

                <div class="step-form-footer">
                  <div class="footer-right">
                    <button class="btn-secondary" type="button" [disabled]="!flightFormComplete()" (click)="addFlightItem()">إضافة جديد</button>
                  </div>
                  <div class="footer-left">
                    <button class="btn-outline" type="button" (click)="goToStep(3)">السابق</button>
                    <button class="btn-ghost" type="button" (click)="goToStep(5)">تخطي</button>
                    <button class="btn-primary" type="button" (click)="goToStep(5)">التالي</button>
                  </div>
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
                    <app-sero-dropdown
                      [options]="foodTypeOptions"
                      [value]="state().mealForm.foodType"
                      placeholder="اختر نوع الطعام"
                      (valueChange)="setMealFoodType($event)" />
                  </div>
                  <div class="field-group">
                    <label class="field-label">خطة الوجبات</label>
                    <app-sero-dropdown
                      [options]="mealPlanOptions"
                      [value]="state().mealForm.mealPlan"
                      placeholder="اختر خطة الوجبات"
                      (valueChange)="setMealPlan($event)" />
                  </div>
                </div>
                <div class="field-row">
                  <div class="field-group field-counter">
                    <label class="field-label">عدد الضيوف</label>
                    <app-counter-input
                      [value]="state().mealForm.guests"
                      [min]="1"
                      [max]="99"
                      (valueChange)="setMealGuests($event)" />
                    <p class="field-hint">{{ state().mealForm.guests }} ضيف</p>
                  </div>
                  <div class="field-group"></div>
                </div>

                @if (showMealValidation()) {
                  <div class="step-warning">
                    <span class="material-icons-round step-warn-icon">info</span>
                    يرجى تعبئة جميع الحقول المطلوبة أعلاه لإضافة عنصر جديد.
                  </div>
                }

                <div class="step-form-footer">
                  <div class="footer-right">
                    <button class="btn-secondary" type="button" [disabled]="!mealFormComplete()" (click)="addMealItem()">إضافة جديد</button>
                  </div>
                  <div class="footer-left">
                    <button class="btn-outline" type="button" (click)="goToStep(4)">السابق</button>
                    <button class="btn-ghost" type="button" (click)="goToStep(6)">تخطي</button>
                    <button class="btn-primary" type="button" (click)="goToStep(6)">التالي</button>
                  </div>
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
                  <div class="field-group">
                    <label class="field-label">عنوان الباقة</label>
                    <input
                      class="step-input"
                      type="text"
                      [value]="state().packageDetailsForm.packageTitle"
                      placeholder="أدخل عنوان الباقة"
                      (input)="setPackageTitle($any($event.target).value)" />
                  </div>
                  <div class="field-group field-counter">
                    <label class="field-label">عدد الضيوف</label>
                    <app-counter-input
                      [value]="state().packageDetailsForm.guestCount"
                      [min]="1"
                      [max]="999"
                      (valueChange)="setPackageGuestCount($event)" />
                    <p class="field-hint">{{ state().packageDetailsForm.guestCount }} ضيف</p>
                  </div>
                </div>
                <div class="field-row">
                  <div class="field-group field-counter">
                    <label class="field-label">الكمية</label>
                    <app-counter-input
                      [value]="state().packageDetailsForm.quantity"
                      [min]="1"
                      [max]="999"
                      (valueChange)="setPackageQuantity($event)" />
                  </div>
                  <div class="field-group">
                    <label class="field-label">تفعيل الباقة</label>
                    <label class="step-switch">
                      <span class="step-switch-label">تنشيط الباقة</span>
                      <span class="apply-nights-switch">
                        <input
                          type="checkbox"
                          [checked]="state().packageDetailsForm.isPackageActive"
                          (change)="setPackageActive($any($event.target).checked)" />
                        <span class="switch-track" aria-hidden="true"></span>
                      </span>
                    </label>
                  </div>
                </div>
                <div class="field-row">
                  <div class="field-group">
                    <label class="field-label">رمز الباقة</label>
                    <input
                      class="step-input"
                      type="text"
                      [value]="state().packageDetailsForm.packageCode"
                      placeholder="أدخل رمز الباقة"
                      (input)="setPackageCode($any($event.target).value)" />
                  </div>
                  <div class="field-group">
                    <label class="field-label">تضمين التأشيرة</label>
                    <label class="step-switch">
                      <span class="step-switch-label">تضمين التأشيرة</span>
                      <span class="apply-nights-switch">
                        <input
                          type="checkbox"
                          [checked]="state().packageDetailsForm.includeVisa"
                          (change)="setPackageIncludeVisa($any($event.target).checked)" />
                        <span class="switch-track" aria-hidden="true"></span>
                      </span>
                    </label>
                  </div>
                </div>
                <div class="field-row">
                  <div class="field-group">
                    <label class="field-label">تاريخ البداية</label>
                    <input
                      class="step-input"
                      type="date"
                      [value]="state().packageDetailsForm.startDate"
                      (input)="setPackageStartDate($any($event.target).value)" />
                  </div>
                  <div class="field-group">
                    <label class="field-label">تاريخ النهاية</label>
                    <input
                      class="step-input"
                      type="date"
                      [value]="state().packageDetailsForm.endDate"
                      (input)="setPackageEndDate($any($event.target).value)" />
                  </div>
                </div>
                <div class="field-row">
                  <div class="field-group">
                    <label class="field-label">إضافة وسوم</label>
                    <app-sero-dropdown
                      [options]="packageTagOptions"
                      [value]="state().packageDetailsForm.tags"
                      placeholder="اختر وسمًا"
                      (valueChange)="setPackageTags($event)" />
                  </div>
                  <div class="field-group">
                    <label class="field-label">اختر الوكلاء</label>
                    <app-sero-dropdown
                      [options]="packageAgentOptions"
                      [value]="state().packageDetailsForm.agents"
                      placeholder="اختر وكيلًا"
                      (valueChange)="setPackageAgents($event)" />
                  </div>
                </div>

                @if (showPackageDetailsValidation()) {
                  <div class="step-warning">
                    <span class="material-icons-round step-warn-icon">info</span>
                    يرجى تعبئة جميع الحقول المطلوبة أعلاه لإكمال الخطوة.
                  </div>
                }

                <div class="step-form-footer">
                  <div class="footer-right"></div>
                  <div class="footer-left">
                    <button class="btn-outline" type="button" (click)="goToStep(5)">السابق</button>
                    <button class="btn-primary" type="button" [disabled]="!packageDetailsFormComplete()" (click)="goToStep(7)">التالي</button>
                  </div>
                </div>
              </section>
            }
            @case (7) {
              <div class="step-section-header">
                <span class="material-symbols-outlined step-section-icon">payments</span>
                <div class="step-section-content">
                  <div class="step-section-line">
                    <h2 class="step-section-title">{{ 'packageDefinition.pricingStep.title' | translate }}</h2>
                    <span class="step-section-separator" aria-hidden="true">|</span>
                    <p class="step-section-sub">{{ 'packageDefinition.pricingStep.subtitle' | translate }}</p>
                  </div>
                </div>
              </div>

              <section class="step-form-panel">
                <div class="field-row">
                  <div class="field-group">
                    <label class="field-label">{{ 'packageDefinition.pricingStep.totalServices' | translate }}</label>
                    <input class="step-input" type="text" [value]="servicesBasePrice + ' ' + ('common.labels.currency' | translate)" readonly />
                  </div>
                  <div class="field-group">
                    <label class="field-label">{{ 'packageDefinition.pricingStep.adjustPrice' | translate }}</label>
                    <app-sero-dropdown
                      [options]="pricingAdjustModeOptions"
                      [value]="state().pricingForm.adjustPriceMode"
                      [placeholder]="'packageDefinition.pricingStep.selectAdjustment' | translate"
                      (valueChange)="setPricingAdjustMode($event)" />
                  </div>
                </div>
                <div class="field-row">
                  <div class="field-group">
                    <label class="field-label">{{ 'packageDefinition.pricingStep.markup' | translate }}</label>
                    <input
                      class="step-input"
                      type="number"
                      min="0"
                      [value]="state().pricingForm.markupPercent"
                      (input)="setPricingMarkupPercent($any($event.target).value)" />
                  </div>
                  <div class="field-group">
                    <label class="field-label">{{ 'packageDefinition.pricingStep.discount' | translate }}</label>
                    <input
                      class="step-input"
                      type="number"
                      min="0"
                      [value]="state().pricingForm.discountPercent"
                      (input)="setPricingDiscountPercent($any($event.target).value)" />
                  </div>
                </div>
                <div class="step-form-footer">
                  <div class="footer-right">
                    <button class="btn-secondary" type="button" (click)="applyPricing()">
                      {{ 'packageDefinition.pricingStep.apply' | translate }}
                    </button>
                  </div>
                  <div class="footer-left">
                    <button class="btn-outline" type="button" (click)="goToStep(6)">{{ 'common.buttons.back' | translate }}</button>
                    <button class="btn-primary" type="button">{{ 'packageDefinition.actions.createPackage' | translate }}</button>
                  </div>
                </div>
                <div class="pricing-final">
                  <p>{{ 'packageDefinition.pricingStep.finalPackagePrice' | translate }}</p>
                  <div class="price-value">
                    {{ state().pricingForm.isApplied ? state().pricingForm.finalPrice : servicesBasePrice }}
                    <span>{{ 'common.labels.currency' | translate }}</span>
                  </div>
                </div>
                <div class="field-row">
                  <div class="field-group">
                    <label class="step-switch">
                      <span class="step-switch-label">{{ 'packageDefinition.pricingStep.hideBreakdown' | translate }}</span>
                      <span class="apply-nights-switch">
                        <input
                          type="checkbox"
                          [checked]="state().pricingForm.hideServiceBreakdown"
                          (change)="setPricingHideBreakdown($any($event.target).checked)" />
                        <span class="switch-track" aria-hidden="true"></span>
                      </span>
                    </label>
                  </div>
                  <div class="field-group">
                    <label class="step-switch">
                      <span class="step-switch-label">{{ 'packageDefinition.pricingStep.verificationStatus' | translate }}</span>
                      <span class="apply-nights-switch">
                        <input
                          type="checkbox"
                          [checked]="state().pricingForm.verifiedLocked"
                          (change)="setPricingVerifiedLocked($any($event.target).checked)" />
                        <span class="switch-track" aria-hidden="true"></span>
                      </span>
                    </label>
                  </div>
                </div>
                <div class="pricing-verify">
                  <div class="verify-option">
                    <strong>{{ 'packageDefinition.pricingStep.verifiedLocked' | translate }}</strong>
                    <p>{{ 'packageDefinition.pricingStep.verifiedLockedDesc' | translate }}</p>
                  </div>
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
      border-radius: 14px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

    /* Field layout classes — used in steps 3-7 (not scoped in child components) */
    .field-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .field-label {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--sero-text-secondary);
    }

    .field-grid-4 {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 14px;
    }

    .field-sm { max-width: 220px; }

    .field-counter app-counter-input {
      width: fit-content;
    }

    .field-hint {
      margin: 2px 0 0;
      font-size: 0.75rem;
      color: var(--sero-text-muted);
    }

    .step-input {
      width: 100%;
      min-height: 42px;
      border: 1px solid var(--sero-border);
      border-radius: 10px;
      background: var(--sero-card-bg);
      color: var(--sero-text-primary);
      font-family: var(--sero-font);
      font-size: 0.86rem;
      padding: 9px 12px;
      outline: none;
      transition: border-color var(--t-fast), box-shadow var(--t-fast);
    }

    .step-input:hover { border-color: var(--sero-border-strong); }

    .step-input:focus {
      border-color: var(--sero-primary);
      box-shadow: 0 0 0 3px rgba(58, 71, 42, 0.1);
    }

    /* Warning banner */
    .step-warning {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 10px 14px;
      font-size: 0.8125rem;
      line-height: 1.6;
      color: color-mix(in srgb, var(--sero-warning, #d97706) 90%, #000);
      background: color-mix(in srgb, var(--sero-warning, #f59e0b) 8%, transparent);
      border: 1px solid color-mix(in srgb, var(--sero-warning, #f59e0b) 28%, transparent);
      border-radius: 10px;
    }

    .step-warn-icon {
      font-size: 17px;
      flex-shrink: 0;
      margin-top: 1px;
      color: color-mix(in srgb, var(--sero-warning, #d97706) 80%, #000);
    }

    /* Action buttons row */
    .step-actions-row {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      padding-top: 16px;
      border-top: 1px solid var(--sero-border-light);
    }

    .step-actions-spacer { flex: 1; }

    .step-form-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      flex-wrap: wrap;
      padding-top: 16px;
      border-top: 1px solid var(--sero-border-light);
    }

    .footer-right,
    .footer-left {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .btn-primary,
    .btn-secondary,
    .btn-outline,
    .btn-ghost {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      min-height: 40px;
      border-radius: 8px;
      border: 1px solid var(--sero-border);
      padding: 0 18px;
      font-family: var(--sero-font);
      font-size: 0.85rem;
      font-weight: 700;
      cursor: pointer;
      white-space: nowrap;
      transition: opacity 0.15s, background 0.15s, border-color 0.15s, color 0.15s;
    }

    .btn-primary {
      background: var(--sero-primary);
      border-color: var(--sero-primary);
      color: #fff;
    }
    .btn-primary:hover { opacity: 0.88; }

    .btn-secondary {
      background: var(--sero-card-bg);
      color: var(--sero-text-primary);
    }
    .btn-secondary:hover {
      border-color: var(--sero-border-strong);
      background: var(--sero-surface-2);
    }

    .btn-primary:disabled,
    .btn-secondary:disabled,
    .btn-outline:disabled,
    .btn-ghost:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      pointer-events: none;
    }

    .btn-outline {
      background: transparent;
      border-color: var(--sero-border);
      color: var(--sero-text);
    }
    .btn-outline:hover {
      border-color: var(--sero-primary);
      color: var(--sero-primary);
    }

    .btn-ghost {
      background: transparent;
      border-color: transparent;
      color: var(--sero-text-secondary);
    }
    .btn-ghost:hover {
      background: var(--sero-surface-2);
      border-color: var(--sero-border-light);
      color: var(--sero-text-primary);
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

    .step-switch {
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      min-height: 42px;
      border: 1px solid var(--sero-border);
      border-radius: 10px;
      background: var(--sero-card-bg);
      padding: 8px 10px;
      gap: 12px;
      cursor: pointer;
    }

    .step-switch-label {
      font-size: 0.82rem;
      color: var(--sero-text-secondary);
      font-weight: 600;
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

      .field-sm { max-width: 100%; }

      .step-actions-row { gap: 8px; }

      .step-form-footer {
        flex-direction: column;
        align-items: stretch;
      }

      .footer-right,
      .footer-left {
        width: 100%;
      }

      .btn-primary,
      .btn-secondary,
      .btn-outline,
      .btn-ghost { flex: 1; min-width: 0; }
    }
  `]
})
export class PackageDefinitionPageComponent {
  private readonly translate = inject(TranslateService);

  readonly steps = PACKAGE_STEPS;

  readonly tripRouteOptions: SeroDropdownOption<string>[] =
    TRIP_ROUTES.map((value) => ({ value, label: value }));

  readonly transportTypeOptions: SeroDropdownOption<string>[] =
    TRANSPORT_TYPES.map((value) => ({ value, label: value }));

  readonly flightCountryOptions: SeroDropdownOption<string>[] =
    FLIGHT_COUNTRIES.map((value) => ({ value, label: value }));

  readonly flightTripTypeOptions: SeroDropdownOption<string>[] =
    FLIGHT_TRIP_TYPES.map((value) => ({ value, label: value }));

  readonly flightTravelClassOptions: SeroDropdownOption<string>[] =
    FLIGHT_TRAVEL_CLASSES.map((value) => ({ value, label: value }));

  readonly flightAirlineOptions: SeroDropdownOption<string>[] =
    FLIGHT_AIRLINES.map((value) => ({ value, label: value }));

  readonly foodTypeOptions: SeroDropdownOption<string>[] =
    FOOD_TYPES.map((value) => ({ value, label: value }));

  readonly mealPlanOptions: SeroDropdownOption<string>[] =
    MEAL_PLANS.map((value) => ({ value, label: value }));

  readonly packageTagOptions: SeroDropdownOption<string>[] =
    PACKAGE_TAGS.map((value) => ({ value, label: value }));

  readonly packageAgentOptions: SeroDropdownOption<string>[] =
    PACKAGE_AGENTS.map((value) => ({ value, label: value }));

  readonly transportGuestsCount = signal(1);
  private readonly transportAttempted = signal(false);
  private readonly flightAttempted = signal(false);
  private readonly mealAttempted = signal(false);

  private readonly _state = signal<PackageDefinitionState>({
    currentStep: 1,
    applyNightsToAll: false,
    globalNights: 3,
    tripRoute: '',
    transportType: '',
    flightForm: { ...INITIAL_FLIGHT_FORM },
    flights: [],
    mealForm: { ...INITIAL_MEAL_FORM },
    meals: [],
    packageDetailsForm: { ...INITIAL_PACKAGE_DETAILS_FORM },
    pricingForm: { ...INITIAL_PRICING_FORM },
    orderSummary: { ...INITIAL_SUMMARY, makkahHotels: [], madinahHotels: [] },
  });

  readonly state = this._state.asReadonly();

  readonly stepStatuses = computed<Record<number, 'completed' | 'incomplete'>>(() => {
    const s = this.state();
    return {
      1: s.orderSummary.makkahHotels.length > 0 ? 'completed' : 'incomplete',
      2: s.orderSummary.madinahHotels.length > 0 ? 'completed' : 'incomplete',
      3: s.orderSummary.hasTransport ? 'completed' : 'incomplete',
      4: (s.flights.length > 0 || s.orderSummary.hasTickets) ? 'completed' : 'incomplete',
      5: (s.meals.length > 0 || s.orderSummary.hasMeals) ? 'completed' : 'incomplete',
      6: this.packageDetailsFormComplete() ? 'completed' : 'incomplete',
      7: (s.pricingForm.isApplied && s.pricingForm.finalPrice > 0) ? 'completed' : 'incomplete',
    };
  });

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

  setTripRoute(value: string): void {
    this._state.update(s => ({ ...s, tripRoute: value }));
  }

  setTransportType(value: string): void {
    this._state.update(s => ({ ...s, transportType: value }));
  }

  get departureCityOptions(): SeroDropdownOption<string>[] {
    const country = this.state().flightForm.departureCountry;
    return (FLIGHT_DEPARTURE_CITIES_BY_COUNTRY[country] ?? []).map((value) => ({ value, label: value }));
  }

  get arrivalCityOptions(): SeroDropdownOption<string>[] {
    const country = this.state().flightForm.arrivalCountry;
    return (FLIGHT_ARRIVAL_CITIES_BY_COUNTRY[country] ?? []).map((value) => ({ value, label: value }));
  }

  setFlightDepartureCountry(value: string): void {
    this._state.update((s) => ({
      ...s,
      flightForm: {
        ...s.flightForm,
        departureCountry: value,
        departureCity: '',
      }
    }));
  }

  setFlightDepartureCity(value: string): void {
    this._state.update((s) => ({ ...s, flightForm: { ...s.flightForm, departureCity: value } }));
  }

  setFlightArrivalCountry(value: string): void {
    this._state.update((s) => ({
      ...s,
      flightForm: {
        ...s.flightForm,
        arrivalCountry: value,
        arrivalCity: '',
      }
    }));
  }

  setFlightArrivalCity(value: string): void {
    this._state.update((s) => ({ ...s, flightForm: { ...s.flightForm, arrivalCity: value } }));
  }

  setFlightTripType(value: string): void {
    this._state.update((s) => ({ ...s, flightForm: { ...s.flightForm, tripType: value } }));
  }

  setFlightTravelClass(value: string): void {
    this._state.update((s) => ({ ...s, flightForm: { ...s.flightForm, travelClass: value } }));
  }

  setFlightAirline(value: string): void {
    this._state.update((s) => ({ ...s, flightForm: { ...s.flightForm, airline: value } }));
  }

  setFlightSeats(value: number): void {
    const parsed = Number(value);
    const normalized = Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 1;
    this._state.update((s) => ({ ...s, flightForm: { ...s.flightForm, seats: normalized } }));
  }

  setMealFoodType(value: string): void {
    this._state.update((s) => ({ ...s, mealForm: { ...s.mealForm, foodType: value } }));
  }

  setMealPlan(value: string): void {
    this._state.update((s) => ({ ...s, mealForm: { ...s.mealForm, mealPlan: value } }));
  }

  setMealGuests(value: number): void {
    const parsed = Number(value);
    const normalized = Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 1;
    this._state.update((s) => ({ ...s, mealForm: { ...s.mealForm, guests: normalized } }));
  }

  mealFormComplete(): boolean {
    const form = this.state().mealForm;
    return !!form.foodType && !!form.mealPlan && form.guests > 0;
  }

  showMealValidation(): boolean {
    return this.mealAttempted() && !this.mealFormComplete();
  }

  addMealItem(): void {
    this.mealAttempted.set(true);
    if (!this.mealFormComplete()) {
      return;
    }

    this._state.update((s) => ({
      ...s,
      meals: [...s.meals, { ...s.mealForm }],
      mealForm: { ...INITIAL_MEAL_FORM },
      orderSummary: {
        ...s.orderSummary,
        hasMeals: true
      }
    }));
    this.mealAttempted.set(false);
  }

  setPackageTitle(value: string): void {
    this._state.update((s) => ({ ...s, packageDetailsForm: { ...s.packageDetailsForm, packageTitle: value } }));
  }

  setPackageGuestCount(value: number): void {
    const normalized = Number.isFinite(Number(value)) && Number(value) >= 1 ? Math.floor(Number(value)) : 1;
    this._state.update((s) => ({ ...s, packageDetailsForm: { ...s.packageDetailsForm, guestCount: normalized } }));
  }

  setPackageQuantity(value: number): void {
    const normalized = Number.isFinite(Number(value)) && Number(value) >= 1 ? Math.floor(Number(value)) : 1;
    this._state.update((s) => ({ ...s, packageDetailsForm: { ...s.packageDetailsForm, quantity: normalized } }));
  }

  setPackageCode(value: string): void {
    this._state.update((s) => ({ ...s, packageDetailsForm: { ...s.packageDetailsForm, packageCode: value } }));
  }

  setPackageStartDate(value: string): void {
    this._state.update((s) => ({ ...s, packageDetailsForm: { ...s.packageDetailsForm, startDate: value } }));
  }

  setPackageEndDate(value: string): void {
    this._state.update((s) => ({ ...s, packageDetailsForm: { ...s.packageDetailsForm, endDate: value } }));
  }

  setPackageActive(value: boolean): void {
    this._state.update((s) => ({ ...s, packageDetailsForm: { ...s.packageDetailsForm, isPackageActive: value } }));
  }

  setPackageIncludeVisa(value: boolean): void {
    this._state.update((s) => ({ ...s, packageDetailsForm: { ...s.packageDetailsForm, includeVisa: value } }));
  }

  setPackageTags(value: string): void {
    this._state.update((s) => ({ ...s, packageDetailsForm: { ...s.packageDetailsForm, tags: value } }));
  }

  setPackageAgents(value: string): void {
    this._state.update((s) => ({ ...s, packageDetailsForm: { ...s.packageDetailsForm, agents: value } }));
  }

  get pricingAdjustModeOptions(): SeroDropdownOption<string>[] {
    return [
      {
        value: 'markup',
        label: this.translate.instant('packageDefinition.pricingStep.adjustments.markup'),
      },
      {
        value: 'discount',
        label: this.translate.instant('packageDefinition.pricingStep.adjustments.discount'),
      }
    ];
  }

  get servicesBasePrice(): number {
    const s = this.state();
    const makkah = s.orderSummary.makkahHotels.length * 450;
    const madinah = s.orderSummary.madinahHotels.length * 420;
    const transport = s.orderSummary.hasTransport ? 220 : 0;
    const tickets = Math.max(s.flights.length, s.orderSummary.hasTickets ? 1 : 0) * 350;
    const meals = Math.max(s.meals.length, s.orderSummary.hasMeals ? 1 : 0) * 120;
    return makkah + madinah + transport + tickets + meals;
  }

  setPricingAdjustMode(value: string): void {
    this._state.update((s) => ({ ...s, pricingForm: { ...s.pricingForm, adjustPriceMode: value } }));
  }

  setPricingMarkupPercent(value: string): void {
    const parsed = Number(value);
    const normalized = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
    this._state.update((s) => ({ ...s, pricingForm: { ...s.pricingForm, markupPercent: normalized } }));
  }

  setPricingDiscountPercent(value: string): void {
    const parsed = Number(value);
    const normalized = Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
    this._state.update((s) => ({ ...s, pricingForm: { ...s.pricingForm, discountPercent: normalized } }));
  }

  setPricingHideBreakdown(value: boolean): void {
    this._state.update((s) => ({ ...s, pricingForm: { ...s.pricingForm, hideServiceBreakdown: value } }));
  }

  setPricingVerifiedLocked(value: boolean): void {
    this._state.update((s) => ({ ...s, pricingForm: { ...s.pricingForm, verifiedLocked: value } }));
  }

  applyPricing(): void {
    const base = this.servicesBasePrice;
    const pricing = this.state().pricingForm;
    const markup = (base * pricing.markupPercent) / 100;
    const subtotal = base + markup;
    const discountAmount = (subtotal * pricing.discountPercent) / 100;
    const finalPrice = Math.max(subtotal - discountAmount, 0);

    this._state.update((s) => ({
      ...s,
      pricingForm: {
        ...s.pricingForm,
        isApplied: true,
        finalPrice: Number(finalPrice.toFixed(2)),
      }
    }));
  }

  packageDetailsFormComplete(): boolean {
    const form = this.state().packageDetailsForm;
    return !!form.packageTitle.trim()
      && form.guestCount > 0
      && form.quantity > 0
      && !!form.packageCode.trim()
      && !!form.startDate
      && !!form.endDate;
  }

  showPackageDetailsValidation(): boolean {
    const form = this.state().packageDetailsForm;
    const hasStarted = !!form.packageTitle.trim()
      || !!form.packageCode.trim()
      || !!form.startDate
      || !!form.endDate
      || form.guestCount > 1
      || form.quantity > 1;
    return hasStarted && !this.packageDetailsFormComplete();
  }

  flightFormComplete(): boolean {
    const form = this.state().flightForm;
    return !!form.departureCountry
      && !!form.departureCity
      && !!form.arrivalCountry
      && !!form.arrivalCity
      && !!form.tripType
      && !!form.travelClass
      && !!form.airline
      && form.seats > 0;
  }

  showFlightValidation(): boolean {
    return this.flightAttempted() && !this.flightFormComplete();
  }

  addFlightItem(): void {
    this.flightAttempted.set(true);
    if (!this.flightFormComplete()) {
      return;
    }

    this._state.update((s) => ({
      ...s,
      flights: [...s.flights, { ...s.flightForm }],
      flightForm: { ...INITIAL_FLIGHT_FORM },
      orderSummary: {
        ...s.orderSummary,
        hasTickets: true
      }
    }));
    this.flightAttempted.set(false);
  }

  setTransportGuestsCount(value: string): void {
    const parsed = Number(value);
    const normalized = Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1;
    this.transportGuestsCount.set(normalized);
  }

  transportFormComplete(): boolean {
    const state = this.state();
    return !!state.tripRoute && !!state.transportType && this.transportGuestsCount() > 0;
  }

  showTransportValidation(): boolean {
    return this.transportAttempted() && !this.transportFormComplete();
  }

  addTransportItem(): void {
    this.transportAttempted.set(true);
    if (!this.transportFormComplete()) {
      return;
    }

    this._state.update((s) => ({
      ...s,
      orderSummary: {
        ...s.orderSummary,
        hasTransport: true
      }
    }));
    this.transportAttempted.set(false);
  }
}
