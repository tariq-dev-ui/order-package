// Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface TripRouteOption {
  value: string;
  label: string;
}

interface TransportTypeOption {
  value: string;
  label: string;
  icon: string;
}

interface AddedTransportItem {
  id: number;
  route: string;
  type: string;
  vehicleCount: number;
  summary: string;
}

const TRIP_ROUTES: TripRouteOption[] = [
  { value: 'makkah-madinah',       label: 'Makkah → Madinah' },
  { value: 'madinah-makkah',       label: 'Madinah → Makkah' },
  { value: 'jeddah-makkah',        label: 'Jeddah Airport → Makkah' },
  { value: 'jeddah-madinah',       label: 'Jeddah Airport → Madinah' },
  { value: 'makkah-jeddah',        label: 'Makkah → Jeddah Airport' },
  { value: 'madinah-jeddah',       label: 'Madinah → Jeddah Airport' },
];

const TRANSPORT_TYPES: TransportTypeOption[] = [
  { value: 'bus',         label: 'Bus',         icon: 'directions_bus' },
  { value: 'vip_bus',     label: 'VIP Bus',     icon: 'airport_shuttle' },
  { value: 'private_car', label: 'Private Car', icon: 'directions_car' },
  { value: 'van',         label: 'Van',         icon: 'local_shipping' },
  { value: 'suv',         label: 'SUV',         icon: 'drive_eta' },
];

const VISA_TYPES: string[] = [
  'Include Visa',
  'Without Visa',
  'Visa Not Required',
];

@Component({
  selector: 'app-transport-service-create-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="ts-page" dir="ltr">

      <!-- Page header -->
      <header class="ts-head">
        <button type="button" class="icon-btn" aria-label="Back to My Services" (click)="back()">
          <span class="material-icons-round">arrow_back</span>
        </button>

        <div class="hero-icon">
          <span class="material-icons-round">directions_bus</span>
        </div>

        <div class="head-copy">
          <p class="kicker">My Services</p>
          <h1>Transport Options</h1>
          <p>Select your preferred transportation</p>
        </div>
      </header>

      <!-- Success toast -->
      @if (toast()) {
        <div class="toast" role="status">
          <span class="material-icons-round">check_circle</span>
          <span>{{ toast() }}</span>
        </div>
      }

      <!-- ─────────────── SECTION 1: Transport Options ─────────────── -->
      <section class="ts-card" aria-label="Transport Options">
        <div class="section-header">
          <div class="section-icon">
            <span class="material-icons-round">directions_bus</span>
          </div>
          <div>
            <h2 class="section-title">Transport Options</h2>
            <p class="section-sub">Select your preferred transportation</p>
          </div>
        </div>

        <!-- Added items chips -->
        <div class="added-items" aria-label="Added transport items">
          @if (addedItems().length === 0) {
            <div class="empty-chip">
              <span class="material-icons-round">info</span>
              <span>No transport items added yet</span>
            </div>
          }

          @for (item of addedItems(); track item.id) {
            <article class="item-chip">
              <span class="material-icons-round chip-icon">directions_bus</span>
              <div class="chip-copy">
                <strong>{{ item.route }}</strong>
                <small>{{ item.summary }}</small>
              </div>
              <button type="button" class="chip-remove" aria-label="Remove item" (click)="removeItem(item.id)">
                <span class="material-icons-round">close</span>
              </button>
            </article>
          }
        </div>

        <div class="divider"></div>

        <!-- Form fields -->
        <div class="field-grid">

          <!-- Trip Route -->
          <label class="field">
            <span class="field-label">
              <span class="material-icons-round">route</span>
              Trip Route
            </span>
            <select class="field-input" [(ngModel)]="selectedRoute">
              <option value="">Select Trip Route</option>
              @for (opt of tripRoutes; track opt.value) {
                <option [value]="opt.value">{{ opt.label }}</option>
              }
            </select>
          </label>

          <!-- Transport Type -->
          <label class="field">
            <span class="field-label">
              <span class="material-icons-round">airport_shuttle</span>
              Transport Type
            </span>
            <select class="field-input" [(ngModel)]="selectedType">
              <option value="">Select Transport Type</option>
              @for (opt of transportTypes; track opt.value) {
                <option [value]="opt.value">{{ opt.label }}</option>
              }
            </select>
          </label>

          <!-- Vehicle Count -->
          <div class="field counter-field">
            <span class="field-label">
              <span class="material-icons-round">directions_car</span>
              Number of Vehicles
            </span>
            <div class="counter">
              <button type="button" class="counter-btn" aria-label="Decrease vehicles" (click)="updateVehicles(-1)">
                <span class="material-icons-round">remove</span>
              </button>
              <strong class="counter-val">{{ vehicleCount() }}</strong>
              <span class="counter-label">{{ vehicleCount() === 1 ? 'Vehicle' : 'Vehicles' }}</span>
              <button type="button" class="counter-btn" aria-label="Increase vehicles" (click)="updateVehicles(1)">
                <span class="material-icons-round">add</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Validation hint -->
        @if (!isTransportReady()) {
          <p class="validation-note">
            <span class="material-icons-round">info</span>
            Kindly fill in all required fields above to add a new item.
          </p>
        }

        <div class="action-row">
          <button
            type="button"
            class="primary-btn"
            [disabled]="!isTransportReady()"
            (click)="addItem()">
            <span class="material-icons-round">add</span>
            <span>Add New</span>
          </button>
        </div>

        <div class="nav-row">
          <button type="button" class="secondary-btn" (click)="back()">
            <span class="material-icons-round">arrow_back</span>
            <span>Previous</span>
          </button>
        </div>
      </section>

      <!-- ─────────────── SECTION 2: Final Details ─────────────── -->
      <section class="ts-card" aria-label="Final Details">
        <div class="section-header">
          <div class="section-icon section-icon--teal">
            <span class="material-icons-round">assignment</span>
          </div>
          <div>
            <h2 class="section-title">Final Details</h2>
            <p class="section-sub">Complete your package information</p>
          </div>
        </div>

        <div class="field-grid">

          <!-- Start Date -->
          <label class="field">
            <span class="field-label">
              <span class="material-icons-round">event</span>
              Start Date
            </span>
            <input
              type="date"
              class="field-input"
              [(ngModel)]="startDate"
              placeholder="mm/dd/yyyy" />
          </label>

          <!-- End Date -->
          <label class="field">
            <span class="field-label">
              <span class="material-icons-round">event_available</span>
              End Date
            </span>
            <input
              type="date"
              class="field-input"
              [(ngModel)]="endDate"
              placeholder="mm/dd/yyyy" />
          </label>

          <!-- Guest Count -->
          <div class="field counter-field">
            <span class="field-label">
              <span class="material-icons-round">group</span>
              Number of Guests
            </span>
            <div class="counter">
              <button type="button" class="counter-btn" aria-label="Decrease guests" (click)="updateGuests(-1)">
                <span class="material-icons-round">remove</span>
              </button>
              <strong class="counter-val">{{ guestCount() }}</strong>
              <span class="counter-label">{{ guestCount() === 1 ? 'Guest' : 'Guests' }}</span>
              <button type="button" class="counter-btn" aria-label="Increase guests" (click)="updateGuests(1)">
                <span class="material-icons-round">add</span>
              </button>
            </div>
          </div>

          <!-- Visa Type -->
          <label class="field">
            <span class="field-label">
              <span class="material-icons-round">article</span>
              Visa Type
            </span>
            <select class="field-input" [(ngModel)]="visaType">
              <option value="">Select Visa Type</option>
              @for (opt of visaTypes; track opt) {
                <option [value]="opt">{{ opt }}</option>
              }
            </select>
          </label>

          <!-- Include Visa toggle -->
          <div class="field visa-toggle-field">
            <span class="field-label">
              <span class="material-icons-round">verified</span>
              Include Visa
            </span>
            <label class="toggle-wrap">
              <input type="checkbox" class="toggle-input" [(ngModel)]="includeVisa" />
              <span class="toggle-track">
                <span class="toggle-thumb"></span>
              </span>
              <span class="toggle-text">{{ includeVisa ? 'Yes' : 'No' }}</span>
            </label>
          </div>

          <!-- Notes -->
          <label class="field notes-field">
            <span class="field-label">
              <span class="material-icons-round">notes</span>
              Additional Notes
            </span>
            <textarea
              class="field-textarea"
              rows="3"
              placeholder="Any special requests?"
              [(ngModel)]="notes"></textarea>
          </label>
        </div>

        <!-- Submit validation -->
        @if (!canSubmit()) {
          <p class="validation-note">
            <span class="material-icons-round">info</span>
            {{ submitHint() }}
          </p>
        }

        <div class="submit-row">
          <button
            type="button"
            class="submit-btn"
            [disabled]="!canSubmit()"
            (click)="submit()">
            <span class="material-icons-round">send</span>
            <span>Submit Request</span>
          </button>
        </div>
      </section>

    </section>
  `,
  styles: [`
    :host { display: block; }

    .ts-page {
      min-height: calc(100vh - var(--sero-topbar-height, 64px));
      padding: var(--sp-6, 24px);
      background: var(--sero-app-bg, #f4f5f7);
      color: var(--sero-text-primary, #111827);
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* ── Header ── */
    .ts-head {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .icon-btn {
      width: 42px;
      height: 42px;
      flex-shrink: 0;
      border: 1px solid var(--sero-border-light, #e5e7eb);
      border-radius: 10px;
      background: var(--sero-card-bg, #fff);
      color: var(--sero-text-primary, #111827);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      box-shadow: 0 1px 2px rgba(0,0,0,.05);
      transition: border-color .15s, color .15s, background .15s;
    }

    .icon-btn:hover {
      border-color: var(--sero-primary, #3a472a);
      color: var(--sero-primary, #3a472a);
      background: color-mix(in srgb, var(--sero-primary, #3a472a) 6%, #fff);
    }

    .hero-icon {
      width: 48px;
      height: 48px;
      flex-shrink: 0;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #fff;
      background: linear-gradient(135deg, var(--sero-primary-light, #6d7f5c), var(--sero-primary, #3a472a));
      box-shadow: 0 2px 8px rgba(58,71,42,.3);
    }

    .hero-icon .material-icons-round { font-size: 26px; }

    .kicker {
      margin: 0 0 4px;
      color: var(--sero-primary, #3a472a);
      font-size: .76rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: .04em;
    }

    h1 {
      margin: 0;
      color: var(--sero-text-primary, #111827);
      font-size: 1.45rem;
      font-weight: 800;
      line-height: 1.3;
    }

    .head-copy p:last-child {
      margin: 4px 0 0;
      color: var(--sero-text-secondary, #6b7280);
      font-size: .88rem;
    }

    /* ── Toast ── */
    .toast {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 11px 16px;
      border: 1px solid var(--sero-success-border, #a3d9a5);
      border-radius: 10px;
      background: var(--sero-success-bg, #f0fdf4);
      color: var(--sero-success, #166534);
      font-size: .84rem;
      font-weight: 700;
    }

    .toast .material-icons-round { font-size: 20px; }

    /* ── Card shell ── */
    .ts-card {
      padding: 24px;
      border: 1px solid var(--sero-border-light, #e5e7eb);
      border-radius: 14px;
      background: var(--sero-card-bg, #fff);
      box-shadow: 0 1px 3px rgba(0,0,0,.06);
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* ── Section header ── */
    .section-header {
      display: flex;
      align-items: center;
      gap: 14px;
    }

    .section-icon {
      width: 44px;
      height: 44px;
      flex-shrink: 0;
      border-radius: 12px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: color-mix(in srgb, var(--sero-primary, #3a472a) 10%, #fff);
      color: var(--sero-primary, #3a472a);
    }

    .section-icon--teal {
      background: #eff6ff;
      color: #1d4ed8;
    }

    .section-icon .material-icons-round { font-size: 22px; }

    .section-title {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--sero-text-primary, #111827);
    }

    .section-sub {
      margin: 3px 0 0;
      font-size: .82rem;
      color: var(--sero-text-secondary, #6b7280);
    }

    /* ── Divider ── */
    .divider {
      height: 1px;
      background: var(--sero-border-light, #e5e7eb);
    }

    /* ── Added items ── */
    .added-items {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .empty-chip {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 8px 14px;
      border: 1px dashed var(--sero-border, #d1d5db);
      border-radius: 999px;
      background: var(--sero-surface-2, #f9fafb);
      color: var(--sero-text-secondary, #6b7280);
      font-size: .82rem;
      font-weight: 600;
    }

    .empty-chip .material-icons-round { font-size: 16px; }

    .item-chip {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px 8px 14px;
      border: 1px solid var(--sero-border-light, #e5e7eb);
      border-radius: 999px;
      background: var(--sero-card-bg, #fff);
      box-shadow: 0 1px 2px rgba(0,0,0,.04);
    }

    .chip-icon {
      color: var(--sero-primary, #3a472a);
      font-size: 18px;
    }

    .chip-copy strong {
      display: block;
      font-size: .84rem;
      color: var(--sero-text-primary, #111827);
      line-height: 1.35;
    }

    .chip-copy small {
      display: block;
      font-size: .74rem;
      color: var(--sero-text-secondary, #6b7280);
      line-height: 1.35;
    }

    .chip-remove {
      width: 28px;
      height: 28px;
      flex-shrink: 0;
      border: 1px solid var(--sero-border-light, #e5e7eb);
      border-radius: 50%;
      background: var(--sero-card-bg, #fff);
      color: var(--sero-text-secondary, #6b7280);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: border-color .15s, color .15s;
    }

    .chip-remove:hover {
      border-color: #fecaca;
      color: #b91c1c;
      background: #fef2f2;
    }

    .chip-remove .material-icons-round { font-size: 16px; }

    /* ── Field grid ── */
    .field-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 0;
    }

    .field-label {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: .82rem;
      font-weight: 700;
      color: var(--sero-text-secondary, #6b7280);
    }

    .field-label .material-icons-round {
      font-size: 17px;
      color: var(--sero-primary, #3a472a);
    }

    .field-input {
      width: 100%;
      height: 46px;
      border: 1px solid var(--sero-border-light, #e5e7eb);
      border-radius: 10px;
      background: var(--sero-card-bg, #fff);
      color: var(--sero-text-primary, #111827);
      font: inherit;
      font-weight: 600;
      font-size: .88rem;
      outline: none;
      padding: 0 12px;
      transition: border-color .15s, box-shadow .15s;
      appearance: auto;
    }

    .field-input:focus {
      border-color: var(--sero-primary, #3a472a);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--sero-primary, #3a472a) 16%, transparent);
    }

    .field-textarea {
      width: 100%;
      border: 1px solid var(--sero-border-light, #e5e7eb);
      border-radius: 10px;
      background: var(--sero-card-bg, #fff);
      color: var(--sero-text-primary, #111827);
      font: inherit;
      font-size: .88rem;
      font-weight: 600;
      outline: none;
      padding: 10px 12px;
      resize: vertical;
      min-height: 80px;
      transition: border-color .15s, box-shadow .15s;
    }

    .field-textarea:focus {
      border-color: var(--sero-primary, #3a472a);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--sero-primary, #3a472a) 16%, transparent);
    }

    /* ── Counter ── */
    .counter-field { align-content: start; }

    .counter {
      display: grid;
      grid-template-columns: 46px auto 1fr 46px;
      align-items: center;
      height: 46px;
      border: 1px solid var(--sero-border-light, #e5e7eb);
      border-radius: 10px;
      background: var(--sero-surface-2, #f9fafb);
      overflow: hidden;
    }

    .counter-btn {
      width: 46px;
      height: 46px;
      border: 0;
      border-radius: 0;
      background: var(--sero-card-bg, #fff);
      color: var(--sero-text-secondary, #6b7280);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      font-size: 18px;
      transition: color .15s, background .15s;
    }

    .counter-btn:hover {
      color: var(--sero-primary, #3a472a);
      background: color-mix(in srgb, var(--sero-primary, #3a472a) 8%, #fff);
    }

    .counter-val {
      padding-inline: 10px;
      color: var(--sero-primary, #3a472a);
      font-size: 1rem;
      font-weight: 800;
    }

    .counter-label {
      color: var(--sero-text-secondary, #6b7280);
      font-size: .82rem;
      font-weight: 600;
    }

    /* ── Visa toggle ── */
    .visa-toggle-field { justify-content: flex-start; }

    .toggle-wrap {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      cursor: pointer;
    }

    .toggle-input { display: none; }

    .toggle-track {
      position: relative;
      width: 44px;
      height: 24px;
      border-radius: 999px;
      background: #d1d5db;
      transition: background .2s;
    }

    .toggle-input:checked + .toggle-track {
      background: var(--sero-primary, #3a472a);
    }

    .toggle-thumb {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #fff;
      box-shadow: 0 1px 3px rgba(0,0,0,.2);
      transition: left .2s;
    }

    .toggle-input:checked + .toggle-track .toggle-thumb {
      left: 23px;
    }

    .toggle-text {
      font-size: .84rem;
      font-weight: 700;
      color: var(--sero-text-primary, #111827);
    }

    /* ── Notes field ── */
    .notes-field {
      grid-column: 1 / -1;
    }

    /* ── Validation note ── */
    .validation-note {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      margin: 0;
      color: var(--sero-warning, #b45309);
      font-size: .82rem;
      font-weight: 700;
      line-height: 1.55;
    }

    .validation-note .material-icons-round {
      font-size: 17px;
      flex-shrink: 0;
      margin-top: 1px;
    }

    /* ── Buttons ── */
    .action-row { display: flex; }

    .nav-row {
      display: flex;
      border-top: 1px solid var(--sero-border-light, #e5e7eb);
      padding-top: 16px;
    }

    .submit-row {
      display: flex;
      justify-content: flex-end;
    }

    .primary-btn,
    .secondary-btn,
    .submit-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 7px;
      min-height: 42px;
      padding: 0 22px;
      border-radius: 10px;
      border: 1px solid transparent;
      font: inherit;
      font-size: .88rem;
      font-weight: 800;
      cursor: pointer;
      transition: background .15s, border-color .15s, color .15s, transform .15s, box-shadow .15s;
    }

    .primary-btn {
      background: var(--sero-primary, #3a472a);
      color: #fff;
      box-shadow: 0 2px 6px rgba(58,71,42,.3);
    }

    .primary-btn:hover:not(:disabled) {
      background: #4d6038;
      transform: translateY(-1px);
    }

    .primary-btn:disabled {
      cursor: not-allowed;
      background: var(--sero-surface-4, #e5e7eb);
      color: var(--sero-text-muted, #9ca3af);
      box-shadow: none;
    }

    .secondary-btn {
      background: var(--sero-card-bg, #fff);
      border-color: var(--sero-border-light, #e5e7eb);
      color: var(--sero-text-secondary, #6b7280);
    }

    .secondary-btn:hover {
      color: var(--sero-primary, #3a472a);
      border-color: var(--sero-primary, #3a472a);
      background: color-mix(in srgb, var(--sero-primary, #3a472a) 6%, #fff);
    }

    .submit-btn {
      background: var(--sero-primary, #3a472a);
      color: #fff;
      padding: 0 28px;
      min-height: 46px;
      font-size: .92rem;
      box-shadow: 0 2px 8px rgba(58,71,42,.3);
    }

    .submit-btn:hover:not(:disabled) {
      background: #4d6038;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(58,71,42,.35);
    }

    .submit-btn:disabled {
      cursor: not-allowed;
      background: var(--sero-surface-4, #e5e7eb);
      color: var(--sero-text-muted, #9ca3af);
      box-shadow: none;
    }

    /* ── Responsive ── */
    @media (max-width: 900px) {
      .field-grid {
        grid-template-columns: 1fr;
      }

      .notes-field { grid-column: 1; }
    }

    @media (max-width: 640px) {
      .ts-page { padding: 16px; gap: 14px; }
      .ts-head { align-items: flex-start; }
      h1 { font-size: 1.18rem; }
      .submit-row { justify-content: stretch; }
      .submit-btn { width: 100%; }
    }
  `],
})
export class TransportServiceCreatePageComponent {
  private readonly router = inject(Router);

  readonly tripRoutes = TRIP_ROUTES;
  readonly transportTypes = TRANSPORT_TYPES;
  readonly visaTypes = VISA_TYPES;

  selectedRoute = '';
  selectedType = '';
  vehicleCount = signal(1);

  startDate = '';
  endDate = '';
  guestCount = signal(1);
  visaType = '';
  includeVisa = false;
  notes = '';

  addedItems = signal<AddedTransportItem[]>([]);
  toast = signal('');

  readonly isTransportReady = computed(() =>
    !!this.selectedRoute &&
    !!this.selectedType &&
    this.vehicleCount() > 0
  );

  readonly canSubmit = computed(() =>
    this.addedItems().length > 0 &&
    !!this.startDate &&
    !!this.endDate &&
    this.guestCount() > 0
  );

  readonly submitHint = computed((): string => {
    if (this.addedItems().length === 0) return 'Add at least one transport item above.';
    if (!this.startDate || !this.endDate) return 'Please fill in the travel dates.';
    if (this.guestCount() < 1) return 'Number of guests must be at least 1.';
    return '';
  });

  updateVehicles(delta: number): void {
    this.vehicleCount.update(v => Math.max(1, v + delta));
  }

  updateGuests(delta: number): void {
    this.guestCount.update(v => Math.max(1, v + delta));
  }

  addItem(): void {
    if (!this.isTransportReady()) return;

    const routeLabel = TRIP_ROUTES.find(r => r.value === this.selectedRoute)?.label ?? this.selectedRoute;
    const typeLabel  = TRANSPORT_TYPES.find(t => t.value === this.selectedType)?.label ?? this.selectedType;
    const count      = this.vehicleCount();

    this.addedItems.update(items => [
      ...items,
      {
        id:           Date.now(),
        route:        routeLabel,
        type:         typeLabel,
        vehicleCount: count,
        summary:      `${typeLabel} · ${count} ${count === 1 ? 'Vehicle' : 'Vehicles'}`,
      },
    ]);

    this.selectedRoute = '';
    this.selectedType  = '';
    this.vehicleCount.set(1);
  }

  removeItem(id: number): void {
    this.addedItems.update(items => items.filter(item => item.id !== id));
  }

  submit(): void {
    if (!this.canSubmit()) return;

    this.showToast('تم إنشاء خدمة المواصلات بنجاح');

    setTimeout(() => {
      this.router.navigate(['/master/my-services']);
    }, 1800);
  }

  back(): void {
    this.router.navigate(['/master/my-services']);
  }

  private showToast(message: string): void {
    this.toast.set(message);
    setTimeout(() => this.toast.set(''), 3500);
  }
}
