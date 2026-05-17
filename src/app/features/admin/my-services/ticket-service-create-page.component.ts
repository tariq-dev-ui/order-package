// Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, startWith } from 'rxjs';

const SOURCE_COUNTRIES  = ['Saudi Arabia', 'Egypt', 'Pakistan', 'Indonesia', 'Turkey'];
const SOURCE_CITIES     = ['Jeddah', 'Riyadh', 'Makkah', 'Madinah', 'Cairo', 'Istanbul'];
const DEST_COUNTRIES    = ['Saudi Arabia', 'Egypt', 'UAE', 'Turkey', 'Indonesia'];
const DEST_CITIES       = ['Jeddah', 'Riyadh', 'Madinah', 'Dubai', 'Cairo', 'Istanbul'];
const AIRLINES          = ['Saudia', 'Flynas', 'Emirates', 'Qatar Airways', 'Turkish Airlines'];

const TRIP_TYPES = [
  { key: 'ONE_WAY',     value: 'one-way' },
  { key: 'ROUND_TRIP',  value: 'round-trip' },
];

const TRAVEL_CLASSES = [
  { key: 'ECONOMY',     value: 'economy' },
  { key: 'BUSINESS',    value: 'business' },
  { key: 'FIRST_CLASS', value: 'first-class' },
];

const VISA_TYPES = [
  { key: 'VISA_INCLUDE',      value: 'include' },
  { key: 'VISA_WITHOUT',      value: 'without' },
  { key: 'VISA_NOT_REQUIRED', value: 'not-required' },
];

@Component({
  selector: 'app-ticket-service-create-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="tk-page" [dir]="langDir()">
      <div class="tk-card">

        <!-- ── Header ── -->
        <div class="card-header">
          <button type="button" class="back-btn" (click)="back()">
            <span class="material-icons-round">arrow_back</span>
          </button>
          <span class="header-icon material-icons-round">confirmation_number</span>
          <div>
            <h1 class="card-title">{{ 'MY_SERVICES.TICKETS.TITLE' | translate }}</h1>
            <p class="card-sub">{{ 'MY_SERVICES.TICKETS.SUBTITLE' | translate }}</p>
          </div>
        </div>

        <!-- ── Toast ── -->
        @if (toast()) {
          <div class="toast" role="status">
            <span class="material-icons-round">check_circle</span>
            <span>{{ toast() | translate }}</span>
          </div>
        }

        <div class="divider"></div>

        <!-- ── Section 1: Ticket Details ── -->
        <p class="section-label">{{ 'MY_SERVICES.TICKETS.TICKET_DETAILS' | translate }}</p>

        <div class="form-grid">

          <!-- Source Country -->
          <div class="field">
            <label class="field-lbl">{{ 'MY_SERVICES.TICKETS.SOURCE_COUNTRY' | translate }}</label>
            <select class="field-ctrl" [ngModel]="sourceCountry()" (ngModelChange)="sourceCountry.set($event)">
              <option value="">{{ 'MY_SERVICES.TICKETS.SELECT_SOURCE_COUNTRY' | translate }}</option>
              @for (c of sourceCountries; track c) {
                <option [value]="c">{{ c }}</option>
              }
            </select>
          </div>

          <!-- Source City -->
          <div class="field">
            <label class="field-lbl">{{ 'MY_SERVICES.TICKETS.SOURCE_CITY' | translate }}</label>
            <select class="field-ctrl" [ngModel]="sourceCity()" (ngModelChange)="sourceCity.set($event)">
              <option value="">{{ 'MY_SERVICES.TICKETS.SELECT_SOURCE_CITY' | translate }}</option>
              @for (c of sourceCities; track c) {
                <option [value]="c">{{ c }}</option>
              }
            </select>
          </div>

          <!-- Destination Country -->
          <div class="field">
            <label class="field-lbl">{{ 'MY_SERVICES.TICKETS.DEST_COUNTRY' | translate }}</label>
            <select class="field-ctrl" [ngModel]="destCountry()" (ngModelChange)="destCountry.set($event)">
              <option value="">{{ 'MY_SERVICES.TICKETS.SELECT_DEST_COUNTRY' | translate }}</option>
              @for (c of destCountries; track c) {
                <option [value]="c">{{ c }}</option>
              }
            </select>
          </div>

          <!-- Destination City -->
          <div class="field">
            <label class="field-lbl">{{ 'MY_SERVICES.TICKETS.DEST_CITY' | translate }}</label>
            <select class="field-ctrl" [ngModel]="destCity()" (ngModelChange)="destCity.set($event)">
              <option value="">{{ 'MY_SERVICES.TICKETS.SELECT_DEST_CITY' | translate }}</option>
              @for (c of destCities; track c) {
                <option [value]="c">{{ c }}</option>
              }
            </select>
          </div>

          <!-- Airline -->
          <div class="field">
            <label class="field-lbl">{{ 'MY_SERVICES.TICKETS.AIRLINE' | translate }}</label>
            <select class="field-ctrl" [ngModel]="airline()" (ngModelChange)="airline.set($event)">
              <option value="">{{ 'MY_SERVICES.TICKETS.SELECT_AIRLINE' | translate }}</option>
              @for (a of airlines; track a) {
                <option [value]="a">{{ a }}</option>
              }
            </select>
          </div>

          <!-- Trip Type -->
          <div class="field">
            <label class="field-lbl">{{ 'MY_SERVICES.TICKETS.TRIP_TYPE' | translate }}</label>
            <select class="field-ctrl" [ngModel]="tripType()" (ngModelChange)="tripType.set($event)">
              <option value="">{{ 'MY_SERVICES.TICKETS.SELECT_TRIP_TYPE' | translate }}</option>
              @for (t of tripTypes; track t.value) {
                <option [value]="t.value">{{ ('MY_SERVICES.TICKETS.' + t.key) | translate }}</option>
              }
            </select>
          </div>

          <!-- Travel Class -->
          <div class="field">
            <label class="field-lbl">{{ 'MY_SERVICES.TICKETS.TRAVEL_CLASS' | translate }}</label>
            <select class="field-ctrl" [ngModel]="travelClass()" (ngModelChange)="travelClass.set($event)">
              <option value="">{{ 'MY_SERVICES.TICKETS.SELECT_CLASS' | translate }}</option>
              @for (c of travelClasses; track c.value) {
                <option [value]="c.value">{{ ('MY_SERVICES.TICKETS.' + c.key) | translate }}</option>
              }
            </select>
          </div>

          <!-- Seats -->
          <div class="field">
            <label class="field-lbl">{{ 'MY_SERVICES.TICKETS.SEATS' | translate }}</label>
            <div class="counter">
              <button type="button" class="counter-btn" (click)="updateSeats(-1)">
                <span class="material-icons-round">remove</span>
              </button>
              <span class="counter-val">{{ seatCount() }}</span>
              <span class="counter-unit">
                {{ (seatCount() === 1 ? 'MY_SERVICES.TICKETS.SEAT_LABEL' : 'MY_SERVICES.TICKETS.SEATS_LABEL') | translate }}
              </span>
              <button type="button" class="counter-btn" (click)="updateSeats(1)">
                <span class="material-icons-round">add</span>
              </button>
            </div>
          </div>

        </div>

        <div class="divider"></div>

        <!-- ── Section 2: Final Details ── -->
        <div class="final-header">
          <p class="section-label">{{ 'MY_SERVICES.TICKETS.FINAL_DETAILS' | translate }}</p>
          <p class="section-sub">{{ 'MY_SERVICES.TICKETS.FINAL_SUBTITLE' | translate }}</p>
        </div>

        <div class="form-grid">

          <!-- Start Date -->
          <div class="field">
            <label class="field-lbl">{{ 'MY_SERVICES.TICKETS.START_DATE' | translate }}</label>
            <input type="date" class="field-ctrl" [ngModel]="startDate()" (ngModelChange)="startDate.set($event)" />
          </div>

          <!-- End Date -->
          <div class="field">
            <label class="field-lbl">{{ 'MY_SERVICES.TICKETS.END_DATE' | translate }}</label>
            <input type="date" class="field-ctrl" [ngModel]="endDate()" (ngModelChange)="endDate.set($event)" />
          </div>

          <!-- Guests -->
          <div class="field">
            <label class="field-lbl">{{ 'MY_SERVICES.TICKETS.GUESTS' | translate }}</label>
            <div class="counter">
              <button type="button" class="counter-btn" (click)="updateGuests(-1)">
                <span class="material-icons-round">remove</span>
              </button>
              <span class="counter-val">{{ guestCount() }}</span>
              <span class="counter-unit">
                {{ (guestCount() === 1 ? 'MY_SERVICES.TICKETS.GUEST_LABEL' : 'MY_SERVICES.TICKETS.GUESTS_LABEL') | translate }}
              </span>
              <button type="button" class="counter-btn" (click)="updateGuests(1)">
                <span class="material-icons-round">add</span>
              </button>
            </div>
          </div>

          <!-- Visa Type -->
          <div class="field">
            <label class="field-lbl">{{ 'MY_SERVICES.TICKETS.VISA_TYPE' | translate }}</label>
            <select class="field-ctrl" [(ngModel)]="visaType">
              <option value="">{{ 'MY_SERVICES.TICKETS.SELECT_VISA' | translate }}</option>
              @for (v of visaTypes; track v.value) {
                <option [value]="v.value">{{ ('MY_SERVICES.TICKETS.' + v.key) | translate }}</option>
              }
            </select>
          </div>

          <!-- Include Visa -->
          <div class="field toggle-field">
            <label class="field-lbl">{{ 'MY_SERVICES.TICKETS.INCLUDE_VISA' | translate }}</label>
            <label class="toggle">
              <input type="checkbox" class="toggle-input" [(ngModel)]="includeVisa" />
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
              <span class="toggle-text">{{ includeVisa ? 'Yes' : 'No' }}</span>
            </label>
          </div>

          <!-- Notes (full width) -->
          <div class="field notes-field">
            <label class="field-lbl">{{ 'MY_SERVICES.TICKETS.NOTES' | translate }}</label>
            <textarea
              class="field-textarea"
              rows="3"
              [placeholder]="'MY_SERVICES.TICKETS.NOTES_PLACEHOLDER' | translate"
              [(ngModel)]="notes"></textarea>
          </div>

        </div>

        <!-- ── Footer ── -->
        <div class="footer">
          <button type="button" class="btn-ghost" (click)="back()">
            <span class="material-icons-round">arrow_back</span>
            {{ 'MY_SERVICES.TICKETS.BACK' | translate }}
          </button>

          <div class="footer-end">
            @if (!canSubmit()) {
              <p class="hint">
                <span class="material-icons-round">info</span>
                {{ 'MY_SERVICES.TICKETS.HINT_SUBMIT' | translate }}
              </p>
            }
            <button
              type="button"
              class="btn-submit"
              [disabled]="!canSubmit()"
              (click)="submit()">
              <span class="material-icons-round">send</span>
              {{ 'MY_SERVICES.TICKETS.SUBMIT' | translate }}
            </button>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .tk-page {
      min-height: 100%;
      padding: 24px;
      background: var(--app-bg);
    }

    /* ── Card ── */
    .tk-card {
      background: var(--app-card-bg);
      border: 1px solid var(--app-border);
      border-radius: 10px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* ── Header ── */
    .card-header {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .back-btn {
      width: 38px; height: 38px; flex-shrink: 0;
      border: 1px solid var(--app-border);
      border-radius: 8px;
      background: var(--app-card-bg);
      color: var(--app-heading);
      display: inline-flex; align-items: center; justify-content: center;
      cursor: pointer;
      transition: 150ms ease;
    }
    .back-btn:hover { background: color-mix(in srgb, var(--app-heading) 8%, var(--app-card-bg)); }

    .header-icon {
      font-size: 26px;
      width: 46px; height: 46px; flex-shrink: 0;
      border-radius: 8px;
      background: var(--app-heading);
      color: var(--app-card-bg);
      display: inline-flex; align-items: center; justify-content: center;
    }

    .card-title {
      margin: 0;
      font-size: 18px; font-weight: 800;
      color: var(--app-heading);
      line-height: 1.3;
    }

    .card-sub {
      margin: 3px 0 0;
      font-size: 13px;
      color: var(--app-text-secondary);
    }

    /* ── Toast ── */
    .toast {
      display: flex; align-items: center; gap: 8px;
      padding: 10px 14px;
      border: 1px solid var(--app-border);
      border-radius: 8px;
      background: color-mix(in srgb, var(--app-heading) 6%, var(--app-card-bg));
      color: var(--app-heading);
      font-size: 13px; font-weight: 700;
      width: fit-content;
    }
    .toast .material-icons-round { font-size: 18px; }

    /* ── Divider ── */
    .divider { height: 1px; background: var(--app-border); }

    /* ── Section label ── */
    .section-label {
      margin: 0;
      font-size: 13px; font-weight: 800; text-transform: uppercase;
      letter-spacing: .04em;
      color: var(--app-heading);
    }

    .final-header { display: flex; flex-direction: column; gap: 3px; }

    .section-sub {
      margin: 0;
      font-size: 12px;
      color: var(--app-text-secondary);
    }

    /* ── 2-column grid ── */
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    /* ── Field ── */
    .field { display: flex; flex-direction: column; gap: 6px; min-width: 0; }

    .field-lbl {
      font-size: 12px; font-weight: 700;
      color: var(--app-text-secondary);
    }

    .field-ctrl {
      width: 100%; height: 42px;
      border: 1px solid var(--app-border);
      border-radius: 8px;
      background: var(--app-card-bg);
      color: var(--app-text-primary);
      font: inherit; font-size: 13px; font-weight: 600;
      padding: 0 10px; outline: none;
      transition: border-color 150ms, box-shadow 150ms;
      appearance: auto;
    }
    .field-ctrl:focus {
      border-color: var(--app-heading);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--app-heading) 14%, transparent);
    }

    .field-textarea {
      width: 100%;
      border: 1px solid var(--app-border);
      border-radius: 8px;
      background: var(--app-card-bg);
      color: var(--app-text-primary);
      font: inherit; font-size: 13px; font-weight: 600;
      padding: 8px 10px; outline: none;
      resize: vertical; min-height: 76px;
      transition: border-color 150ms, box-shadow 150ms;
    }
    .field-textarea:focus {
      border-color: var(--app-heading);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--app-heading) 14%, transparent);
    }

    .notes-field { grid-column: 1 / -1; }

    /* ── Counter ── */
    .counter {
      display: grid;
      grid-template-columns: 42px auto 1fr 42px;
      align-items: center;
      height: 42px;
      border: 1px solid var(--app-border);
      border-radius: 8px;
      background: color-mix(in srgb, var(--app-heading) 5%, var(--app-card-bg));
      overflow: hidden;
    }
    .counter-btn {
      width: 42px; height: 42px; border: 0;
      background: var(--app-heading);
      color: var(--app-card-bg);
      display: inline-flex; align-items: center; justify-content: center;
      cursor: pointer; font-size: 16px;
      transition: opacity 150ms;
    }
    .counter-btn:hover { opacity: .85; }
    .counter-val {
      padding-inline: 10px;
      font-size: 15px; font-weight: 800;
      color: var(--app-heading);
    }
    .counter-unit {
      color: var(--app-text-secondary);
      font-size: 12px; font-weight: 600;
    }

    /* ── Toggle ── */
    .toggle-field { justify-content: flex-start; }

    .toggle {
      display: inline-flex; align-items: center; gap: 8px; cursor: pointer;
    }
    .toggle-input { display: none; }

    .toggle-track {
      position: relative; width: 40px; height: 22px;
      border-radius: 999px; background: var(--app-border);
      transition: background 200ms;
    }
    .toggle-input:checked + .toggle-track { background: var(--app-heading); }

    .toggle-thumb {
      position: absolute; top: 3px; left: 3px;
      width: 16px; height: 16px; border-radius: 50%;
      background: #fff; box-shadow: 0 1px 2px rgba(0,0,0,.2);
      transition: left 200ms;
    }
    .toggle-input:checked + .toggle-track .toggle-thumb { left: 21px; }

    .toggle-text { font-size: 13px; font-weight: 700; color: var(--app-text-primary); }

    /* ── Buttons ── */
    .btn-ghost,
    .btn-submit {
      display: inline-flex; align-items: center; gap: 7px;
      min-height: 40px; padding: 0 18px;
      border-radius: 8px; border: 1px solid transparent;
      font: inherit; font-size: 13px; font-weight: 800;
      cursor: pointer;
      transition: 150ms ease;
      white-space: nowrap;
    }

    .btn-ghost {
      background: var(--app-card-bg);
      border-color: var(--app-border);
      color: var(--app-text-secondary);
    }
    .btn-ghost:hover { color: var(--app-heading); border-color: var(--app-heading); }

    .btn-submit {
      background: var(--app-heading);
      color: var(--app-card-bg);
      padding: 0 24px;
    }
    .btn-submit:hover:not(:disabled) { opacity: .88; transform: translateY(-1px); }
    .btn-submit:disabled {
      cursor: not-allowed; opacity: 1;
      background: var(--app-border);
      color: var(--app-text-secondary);
    }

    /* ── Hint ── */
    .hint {
      margin: 0;
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; font-weight: 600;
      color: var(--app-text-secondary);
    }
    .hint .material-icons-round { font-size: 15px; flex-shrink: 0; }

    /* ── Footer ── */
    .footer {
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      padding-top: 4px;
      border-top: 1px solid var(--app-border);
    }

    .footer-end { display: flex; align-items: center; gap: 12px; }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .tk-page { padding: 16px; }
      .form-grid { grid-template-columns: 1fr; }
      .notes-field { grid-column: 1; }
      .footer { flex-direction: column; align-items: stretch; }
      .footer-end { flex-direction: column; }
      .btn-submit, .btn-ghost { width: 100%; justify-content: center; }
      .card-title { font-size: 16px; }
    }
  `],
})
export class TicketServiceCreatePageComponent {
  private readonly router    = inject(Router);
  private readonly translate = inject(TranslateService);

  readonly langDir = toSignal(
    this.translate.onLangChange.pipe(
      startWith({ lang: this.translate.currentLang ?? 'en' }),
      map(e => e.lang === 'ar' ? 'rtl' : 'ltr'),
    ),
    { initialValue: this.translate.currentLang === 'ar' ? 'rtl' : 'ltr' },
  );

  readonly sourceCountries = SOURCE_COUNTRIES;
  readonly sourceCities    = SOURCE_CITIES;
  readonly destCountries   = DEST_COUNTRIES;
  readonly destCities      = DEST_CITIES;
  readonly airlines        = AIRLINES;
  readonly tripTypes       = TRIP_TYPES;
  readonly travelClasses   = TRAVEL_CLASSES;
  readonly visaTypes       = VISA_TYPES;

  /* ── Reactive form fields ── */
  sourceCountry = signal('');
  sourceCity    = signal('');
  destCountry   = signal('');
  destCity      = signal('');
  airline       = signal('');
  tripType      = signal('');
  travelClass   = signal('');
  seatCount     = signal(1);

  startDate  = signal('');
  endDate    = signal('');
  guestCount = signal(1);
  visaType    = '';
  includeVisa = false;
  notes       = '';

  toast = signal('');

  readonly canSubmit = computed(() =>
    !!this.sourceCountry() &&
    !!this.sourceCity() &&
    !!this.destCountry() &&
    !!this.destCity() &&
    !!this.airline() &&
    !!this.tripType() &&
    !!this.travelClass() &&
    this.seatCount() > 0 &&
    !!this.startDate() &&
    !!this.endDate() &&
    this.guestCount() > 0
  );

  updateSeats(delta: number): void  { this.seatCount.update(v => Math.max(1, v + delta)); }
  updateGuests(delta: number): void { this.guestCount.update(v => Math.max(1, v + delta)); }

  submit(): void {
    if (!this.canSubmit()) return;
    this.toast.set('MY_SERVICES.TICKETS.SUCCESS');
    setTimeout(() => this.toast.set(''), 3500);
    setTimeout(() => this.router.navigate(['/master/my-services']), 1800);
  }

  back(): void { this.router.navigate(['/master/my-services']); }
}
