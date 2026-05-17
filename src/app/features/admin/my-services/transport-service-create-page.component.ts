import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

interface TransportItem {
  id: number;
  routeKey: string;
  routeLabel: string;
  typeKey: string;
  typeLabel: string;
  vehicleCount: number;
}

const TRIP_ROUTES = [
  { key: 'ROUTE_OPT_1', value: 'makkah-madinah' },
  { key: 'ROUTE_OPT_2', value: 'madinah-makkah' },
  { key: 'ROUTE_OPT_3', value: 'jeddah-makkah' },
  { key: 'ROUTE_OPT_4', value: 'jeddah-madinah' },
  { key: 'ROUTE_OPT_5', value: 'makkah-jeddah' },
  { key: 'ROUTE_OPT_6', value: 'madinah-jeddah' },
];

const TRANSPORT_TYPES = [
  { key: 'TYPE_BUS',         value: 'bus' },
  { key: 'TYPE_VIP_BUS',     value: 'vip_bus' },
  { key: 'TYPE_PRIVATE_CAR', value: 'private_car' },
  { key: 'TYPE_VAN',         value: 'van' },
  { key: 'TYPE_SUV',         value: 'suv' },
];

const VISA_TYPES = [
  { key: 'VISA_INCLUDE',      value: 'include' },
  { key: 'VISA_WITHOUT',      value: 'without' },
  { key: 'VISA_NOT_REQUIRED', value: 'not_required' },
];

@Component({
  selector: 'app-transport-service-create-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="ts-page">

      <!-- ── Single Card ── -->
      <div class="ts-card">

        <!-- Header -->
        <div class="card-header">
          <button type="button" class="back-btn" (click)="back()">
            <span class="material-icons-round">arrow_back</span>
          </button>
          <span class="header-icon material-icons-round">directions_bus</span>
          <div>
            <h1 class="card-title">{{ 'MY_SERVICES.TRANSPORT.TITLE' | translate }}</h1>
            <p class="card-sub">{{ 'MY_SERVICES.TRANSPORT.SUBTITLE' | translate }}</p>
          </div>
        </div>

        <!-- Toast -->
        @if (toast()) {
          <div class="toast" role="status">
            <span class="material-icons-round">check_circle</span>
            <span>{{ toast() | translate }}</span>
          </div>
        }

        <div class="divider"></div>

        <!-- ── Transport Options Form ── -->
        <div class="section-label">{{ 'MY_SERVICES.TRANSPORT.TRANSPORT_OPTIONS' | translate }}</div>

        <div class="form-row">
          <!-- Trip Route -->
          <div class="field">
            <label class="field-lbl">{{ 'MY_SERVICES.TRANSPORT.TRIP_ROUTE' | translate }}</label>
            <select class="field-ctrl" [ngModel]="selectedRoute()" (ngModelChange)="selectedRoute.set($event)">
              <option value="">{{ 'MY_SERVICES.TRANSPORT.SELECT_ROUTE' | translate }}</option>
              @for (opt of tripRoutes; track opt.value) {
                <option [value]="opt.value">{{ ('MY_SERVICES.TRANSPORT.' + opt.key) | translate }}</option>
              }
            </select>
          </div>

          <!-- Transport Type -->
          <div class="field">
            <label class="field-lbl">{{ 'MY_SERVICES.TRANSPORT.TRANSPORT_TYPE' | translate }}</label>
            <select class="field-ctrl" [ngModel]="selectedType()" (ngModelChange)="selectedType.set($event)">
              <option value="">{{ 'MY_SERVICES.TRANSPORT.SELECT_TYPE' | translate }}</option>
              @for (opt of transportTypes; track opt.value) {
                <option [value]="opt.value">{{ ('MY_SERVICES.TRANSPORT.' + opt.key) | translate }}</option>
              }
            </select>
          </div>

          <!-- Vehicle Counter -->
          <div class="field">
            <label class="field-lbl">{{ 'MY_SERVICES.TRANSPORT.VEHICLES' | translate }}</label>
            <div class="counter">
              <button type="button" class="counter-btn" (click)="updateVehicles(-1)">
                <span class="material-icons-round">remove</span>
              </button>
              <span class="counter-val">{{ vehicleCount() }}</span>
              <span class="counter-unit">
                {{ (vehicleCount() === 1 ? 'MY_SERVICES.TRANSPORT.VEHICLE_LABEL' : 'MY_SERVICES.TRANSPORT.VEHICLES_LABEL') | translate }}
              </span>
              <button type="button" class="counter-btn" (click)="updateVehicles(1)">
                <span class="material-icons-round">add</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Add / Update button -->
        <div class="add-row">
          @if (!isFormReady()) {
            <p class="hint">
              <span class="material-icons-round">info</span>
              {{ 'MY_SERVICES.TRANSPORT.HINT_FILL' | translate }}
            </p>
          }
          <button
            type="button"
            class="btn-primary"
            [disabled]="!isFormReady()"
            (click)="addOrUpdateItem()">
            <span class="material-icons-round">{{ editingId() !== null ? 'check' : 'add' }}</span>
            {{ (editingId() !== null ? 'MY_SERVICES.TRANSPORT.UPDATE' : 'MY_SERVICES.TRANSPORT.ADD_NEW') | translate }}
          </button>
        </div>

        <!-- ── Added Items Table ── -->
        <div class="divider"></div>

        <div class="section-label">{{ 'MY_SERVICES.TRANSPORT.ADDED_ITEMS' | translate }}</div>

        @if (addedItems().length === 0) {
          <div class="empty-row">
            <span class="material-icons-round">directions_bus</span>
            {{ 'MY_SERVICES.TRANSPORT.NO_ITEMS' | translate }}
          </div>
        } @else {
          <div class="table-wrap">
            <table class="tbl">
              <thead>
                <tr>
                  <th>{{ 'MY_SERVICES.TRANSPORT.COL_ROUTE' | translate }}</th>
                  <th>{{ 'MY_SERVICES.TRANSPORT.COL_TYPE' | translate }}</th>
                  <th class="th-center">{{ 'MY_SERVICES.TRANSPORT.COL_VEHICLES' | translate }}</th>
                  <th class="th-center">{{ 'MY_SERVICES.TRANSPORT.COL_ACTIONS' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                @for (item of addedItems(); track item.id) {
                  <tr [class.tr-editing]="editingId() === item.id">
                    <td>{{ ('MY_SERVICES.TRANSPORT.' + item.routeLabel) | translate }}</td>
                    <td>{{ ('MY_SERVICES.TRANSPORT.' + item.typeLabel) | translate }}</td>
                    <td class="td-center">
                      <span class="count-badge">{{ item.vehicleCount }}</span>
                    </td>
                    <td class="td-center">
                      <div class="row-actions">
                        <button type="button" class="act-btn act-edit" (click)="editItem(item)">
                          <span class="material-icons-round">edit</span>
                        </button>
                        <button type="button" class="act-btn act-del" (click)="removeItem(item.id)">
                          <span class="material-icons-round">delete_outline</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }

        <!-- ── Final Details ── -->
        <div class="divider"></div>

        <div class="section-label">{{ 'MY_SERVICES.TRANSPORT.FINAL_DETAILS' | translate }}</div>

        <div class="details-grid">
          <!-- Start Date -->
          <div class="field">
            <label class="field-lbl">{{ 'MY_SERVICES.TRANSPORT.START_DATE' | translate }}</label>
            <input type="date" class="field-ctrl" [ngModel]="startDate()" (ngModelChange)="startDate.set($event)" />
          </div>

          <!-- End Date -->
          <div class="field">
            <label class="field-lbl">{{ 'MY_SERVICES.TRANSPORT.END_DATE' | translate }}</label>
            <input type="date" class="field-ctrl" [ngModel]="endDate()" (ngModelChange)="endDate.set($event)" />
          </div>

          <!-- Guests -->
          <div class="field">
            <label class="field-lbl">{{ 'MY_SERVICES.TRANSPORT.GUESTS' | translate }}</label>
            <div class="counter">
              <button type="button" class="counter-btn" (click)="updateGuests(-1)">
                <span class="material-icons-round">remove</span>
              </button>
              <span class="counter-val">{{ guestCount() }}</span>
              <span class="counter-unit">
                {{ (guestCount() === 1 ? 'MY_SERVICES.TRANSPORT.GUEST_LABEL' : 'MY_SERVICES.TRANSPORT.GUESTS_LABEL') | translate }}
              </span>
              <button type="button" class="counter-btn" (click)="updateGuests(1)">
                <span class="material-icons-round">add</span>
              </button>
            </div>
          </div>

          <!-- Visa Type -->
          <div class="field">
            <label class="field-lbl">{{ 'MY_SERVICES.TRANSPORT.VISA_TYPE' | translate }}</label>
            <select class="field-ctrl" [(ngModel)]="visaType">
              <option value="">{{ 'MY_SERVICES.TRANSPORT.SELECT_VISA' | translate }}</option>
              @for (opt of visaTypes; track opt.value) {
                <option [value]="opt.value">{{ ('MY_SERVICES.TRANSPORT.' + opt.key) | translate }}</option>
              }
            </select>
          </div>

          <!-- Include Visa -->
          <div class="field toggle-field">
            <label class="field-lbl">{{ 'MY_SERVICES.TRANSPORT.INCLUDE_VISA' | translate }}</label>
            <label class="toggle">
              <input type="checkbox" class="toggle-input" [(ngModel)]="includeVisa" />
              <span class="toggle-track"><span class="toggle-thumb"></span></span>
              <span class="toggle-text">{{ includeVisa ? 'Yes' : 'No' }}</span>
            </label>
          </div>

          <!-- Notes -->
          <div class="field notes-field">
            <label class="field-lbl">{{ 'MY_SERVICES.TRANSPORT.NOTES' | translate }}</label>
            <textarea
              class="field-textarea"
              rows="3"
              [placeholder]="'MY_SERVICES.TRANSPORT.NOTES_PLACEHOLDER' | translate"
              [(ngModel)]="notes"></textarea>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="footer">
          <button type="button" class="btn-ghost" (click)="back()">
            <span class="material-icons-round">arrow_back</span>
            {{ 'MY_SERVICES.TRANSPORT.BACK' | translate }}
          </button>

          <div class="footer-right">
            @if (!canSubmit()) {
              <p class="hint">
                <span class="material-icons-round">info</span>
                {{ 'MY_SERVICES.TRANSPORT.HINT_SUBMIT' | translate }}
              </p>
            }
            <button
              type="button"
              class="btn-submit"
              [disabled]="!canSubmit()"
              (click)="submit()">
              <span class="material-icons-round">send</span>
              {{ 'MY_SERVICES.TRANSPORT.SUBMIT' | translate }}
            </button>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    .ts-page {
      min-height: 100%;
      padding: 24px;
      background: var(--app-bg);
    }

    /* ── Card ── */
    .ts-card {
      background: var(--app-card-bg);
      border: 1px solid var(--app-border);
      border-radius: 10px;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    /* ── Card header ── */
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
      font-size: 13px; font-weight: 800; text-transform: uppercase;
      letter-spacing: .04em;
      color: var(--app-heading);
    }

    /* ── 3-column form row ── */
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 16px;
    }

    /* ── 2-column details grid ── */
    .details-grid {
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

    /* ── Add row ── */
    .add-row {
      display: flex; align-items: center; gap: 12px;
    }

    /* ── Hint ── */
    .hint {
      flex: 1; margin: 0;
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; font-weight: 600;
      color: var(--app-text-secondary);
    }
    .hint .material-icons-round { font-size: 15px; flex-shrink: 0; }

    /* ── Buttons ── */
    .btn-primary,
    .btn-submit,
    .btn-ghost {
      display: inline-flex; align-items: center; gap: 7px;
      min-height: 40px; padding: 0 18px;
      border-radius: 8px; border: 1px solid transparent;
      font: inherit; font-size: 13px; font-weight: 800;
      cursor: pointer;
      transition: 150ms ease;
      white-space: nowrap;
    }

    .btn-primary {
      background: var(--app-heading);
      color: var(--app-card-bg);
      margin-inline-start: auto;
    }
    .btn-primary:hover:not(:disabled) { opacity: .88; transform: translateY(-1px); }
    .btn-primary:disabled {
      cursor: not-allowed; opacity: 1;
      background: var(--app-border);
      color: var(--app-text-secondary);
    }

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

    .btn-ghost {
      background: var(--app-card-bg);
      border-color: var(--app-border);
      color: var(--app-text-secondary);
    }
    .btn-ghost:hover { color: var(--app-heading); border-color: var(--app-heading); }

    /* ── Empty state ── */
    .empty-row {
      display: flex; align-items: center; gap: 8px;
      padding: 14px 16px;
      border: 1px dashed var(--app-border);
      border-radius: 8px;
      color: var(--app-text-secondary);
      font-size: 13px; font-weight: 600;
    }
    .empty-row .material-icons-round { font-size: 18px; }

    /* ── Table ── */
    .table-wrap {
      border: 1px solid var(--app-border);
      border-radius: 8px;
      overflow-x: auto;
    }

    .tbl { width: 100%; border-collapse: collapse; font-size: 13px; }

    .tbl thead th {
      padding: 9px 14px; text-align: start;
      font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .04em;
      color: var(--app-text-secondary);
      background: color-mix(in srgb, var(--app-heading) 5%, var(--app-card-bg));
      border-bottom: 1px solid var(--app-border);
    }

    .tbl tbody tr {
      border-bottom: 1px solid var(--app-border);
      transition: background 120ms;
    }
    .tbl tbody tr:last-child { border-bottom: 0; }
    .tbl tbody tr:hover { background: color-mix(in srgb, var(--app-heading) 4%, var(--app-card-bg)); }
    .tbl tbody tr.tr-editing { background: color-mix(in srgb, var(--app-heading) 8%, var(--app-card-bg)); }

    .tbl td {
      padding: 10px 14px;
      color: var(--app-text-primary); font-weight: 600;
    }

    .th-center, .td-center { text-align: center; }

    .count-badge {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 28px; height: 24px; padding: 0 8px;
      border-radius: 999px;
      background: color-mix(in srgb, var(--app-heading) 12%, var(--app-card-bg));
      color: var(--app-heading);
      font-weight: 800; font-size: 12px;
    }

    .row-actions { display: inline-flex; align-items: center; gap: 6px; justify-content: center; }

    .act-btn {
      width: 30px; height: 30px; border-radius: 6px;
      border: 1px solid var(--app-border);
      background: var(--app-card-bg);
      color: var(--app-text-secondary);
      display: inline-flex; align-items: center; justify-content: center;
      cursor: pointer; transition: 150ms ease;
    }
    .act-btn .material-icons-round { font-size: 15px; }

    .act-edit:hover { border-color: var(--app-heading); color: var(--app-heading); background: color-mix(in srgb, var(--app-heading) 8%, var(--app-card-bg)); }
    .act-del:hover { border-color: #f87171; color: #dc2626; background: #fef2f2; }

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

    /* ── Footer ── */
    .footer {
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
      padding-top: 4px;
      border-top: 1px solid var(--app-border);
    }

    .footer-right { display: flex; align-items: center; gap: 12px; }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .ts-page { padding: 16px; }
      .form-row { grid-template-columns: 1fr; }
      .details-grid { grid-template-columns: 1fr; }
      .notes-field { grid-column: 1; }
      .footer { flex-direction: column; align-items: stretch; }
      .footer-right { flex-direction: column; }
      .btn-submit, .btn-ghost { width: 100%; justify-content: center; }
      .card-title { font-size: 16px; }
    }
  `],
})
export class TransportServiceCreatePageComponent {
  private readonly router = inject(Router);

  readonly tripRoutes     = TRIP_ROUTES;
  readonly transportTypes = TRANSPORT_TYPES;
  readonly visaTypes      = VISA_TYPES;

  selectedRoute = signal('');
  selectedType  = signal('');
  vehicleCount  = signal(1);

  startDate  = signal('');
  endDate    = signal('');
  guestCount = signal(1);
  visaType    = '';
  includeVisa = false;
  notes       = '';

  addedItems = signal<TransportItem[]>([]);
  editingId  = signal<number | null>(null);
  toast      = signal('');

  readonly isFormReady = computed(() =>
    !!this.selectedRoute() &&
    !!this.selectedType() &&
    this.vehicleCount() > 0
  );

  readonly canSubmit = computed(() =>
    this.addedItems().length > 0 &&
    !!this.startDate() &&
    !!this.endDate() &&
    this.guestCount() > 0
  );

  updateVehicles(delta: number): void { this.vehicleCount.update(v => Math.max(1, v + delta)); }
  updateGuests(delta: number): void   { this.guestCount.update(v => Math.max(1, v + delta)); }

  addOrUpdateItem(): void {
    if (!this.isFormReady()) return;

    const routeEntry = TRIP_ROUTES.find(r => r.value === this.selectedRoute());
    const typeEntry  = TRANSPORT_TYPES.find(t => t.value === this.selectedType());
    const routeLabel = routeEntry?.key ?? this.selectedRoute();
    const typeLabel  = typeEntry?.key ?? this.selectedType();

    if (this.editingId() !== null) {
      this.addedItems.update(items =>
        items.map(item =>
          item.id === this.editingId()
            ? { ...item, routeKey: routeEntry?.key ?? '', routeLabel, typeKey: typeEntry?.key ?? '', typeLabel, vehicleCount: this.vehicleCount() }
            : item
        )
      );
      this.editingId.set(null);
      this.showToast('MY_SERVICES.TRANSPORT.TOAST_UPDATED');
    } else {
      this.addedItems.update(items => [
        ...items,
        {
          id: Date.now(),
          routeKey: routeEntry?.key ?? '',
          routeLabel,
          typeKey: typeEntry?.key ?? '',
          typeLabel,
          vehicleCount: this.vehicleCount(),
        },
      ]);
      this.showToast('MY_SERVICES.TRANSPORT.TOAST_ADDED');
    }

    this.selectedRoute.set('');
    this.selectedType.set('');
    this.vehicleCount.set(1);
  }

  editItem(item: TransportItem): void {
    this.selectedRoute.set(TRIP_ROUTES.find(r => r.key === item.routeKey)?.value ?? '');
    this.selectedType.set(TRANSPORT_TYPES.find(t => t.key === item.typeKey)?.value ?? '');
    this.vehicleCount.set(item.vehicleCount);
    this.editingId.set(item.id);
  }

  removeItem(id: number): void {
    this.addedItems.update(items => items.filter(i => i.id !== id));
    if (this.editingId() === id) {
      this.editingId.set(null);
      this.selectedRoute.set('');
      this.selectedType.set('');
      this.vehicleCount.set(1);
    }
  }

  submit(): void {
    if (!this.canSubmit()) return;
    this.showToast('MY_SERVICES.TRANSPORT.TOAST_SUBMIT');
    setTimeout(() => this.router.navigate(['/master/my-services']), 1800);
  }

  back(): void { this.router.navigate(['/master/my-services']); }

  private showToast(key: string): void {
    this.toast.set(key);
    setTimeout(() => this.toast.set(''), 3500);
  }
}
