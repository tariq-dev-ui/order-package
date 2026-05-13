import { Component, EventEmitter, Input, OnChanges, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { HotelFormValues, HotelMode, HotelSelection } from '../../package-definition.models';
import { CounterInputComponent } from '../counter-input/counter-input.component';
import { SeroDropdownComponent, SeroDropdownOption } from '../../../../shared/components/sero-dropdown/sero-dropdown.component';
import {
  MAKKAH_NEIGHBORHOODS,
  MADINAH_NEIGHBORHOODS,
  HOTEL_CATEGORIES,
  ROOM_TYPES,
  SPECIFIC_HOTELS_MAKKAH,
  SPECIFIC_HOTELS_MADINAH,
} from '../../package-definition.mock';

@Component({
  selector: 'app-hotel-step-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, CounterInputComponent, SeroDropdownComponent],
  template: `
    <div class="hotel-form-card">

      <!-- Mode tabs -->
      <div class="mode-tabs" role="tablist">
        <button class="mode-tab" type="button" role="tab"
                [class.active]="form().mode === 'criteria'"
                (click)="setMode('criteria')">
          <span class="material-symbols-outlined tab-icon">tune</span>
          {{ 'packageDefinition.modes.criteria' | translate }}
        </button>
        <button class="mode-tab" type="button" role="tab"
                [class.active]="form().mode === 'specific'"
                (click)="setMode('specific')">
          <span class="material-symbols-outlined tab-icon">hotel</span>
          {{ 'packageDefinition.modes.specific' | translate }}
        </button>
      </div>

      <div class="form-body">

        @if (form().mode === 'criteria') {
          <!-- Criteria mode fields -->
          <div class="field-row">
            <div class="field-group">
              <label class="field-label">
                {{ 'packageDefinition.fields.neighborhood' | translate }}
              </label>
              <app-sero-dropdown
                [options]="neighborhoodOptions"
                [value]="form().neighborhood"
                [placeholderKey]="'packageDefinition.fields.neighborhood'"
                (valueChange)="patch({ neighborhood: $event })" />
            </div>

            <div class="field-group">
              <label class="field-label">
                {{ 'packageDefinition.fields.category' | translate }}
              </label>
              <app-sero-dropdown
                [options]="categoryOptions"
                [value]="form().category"
                [placeholderKey]="'packageDefinition.fields.category'"
                (valueChange)="patch({ category: $event })" />
            </div>
          </div>

          <div class="field-group">
            <label class="field-label">
              {{ 'packageDefinition.fields.roomType' | translate }}
            </label>
            <app-sero-dropdown
              [options]="roomTypeOptions"
              [value]="form().roomType"
              [placeholderKey]="'packageDefinition.fields.roomType'"
              (valueChange)="patch({ roomType: $event })" />
          </div>

          <div class="counters-row">
            <div class="counter-group">
              <label class="field-label">
                {{ 'packageDefinition.fields.roomCount' | translate }}
              </label>
              <app-counter-input
                [value]="form().roomCount"
                [min]="1"
                [max]="50"
                (valueChange)="patch({ roomCount: $event })" />
            </div>

            <div class="counter-group">
              <label class="field-label">
                {{ 'packageDefinition.fields.nightsCount' | translate }}
              </label>
              <app-counter-input
                [value]="form().nightsCount"
                [min]="1"
                [max]="60"
                (valueChange)="patch({ nightsCount: $event })" />
            </div>
          </div>
        } @else {
          <div class="specific-toolbar">
            <div class="field-row">
              <div class="field-group">
                <label class="field-label">
                  {{ 'packageDefinition.fields.hotelName' | translate }}
                </label>
                <app-sero-dropdown
                  [options]="hotelOptions"
                  [value]="form().hotelName"
                  [placeholderKey]="'packageDefinition.fields.hotelName'"
                  (valueChange)="patch({ hotelName: $event })" />
              </div>

              <div class="field-group">
                <label class="field-label">
                  {{ 'packageDefinition.fields.neighborhood' | translate }}
                </label>
                <app-sero-dropdown
                  [options]="neighborhoodOptions"
                  [value]="form().neighborhood"
                  [placeholderKey]="'packageDefinition.fields.neighborhood'"
                  (valueChange)="patch({ neighborhood: $event })" />
              </div>
            </div>
          </div>

          <div class="specific-card">
            <div class="specific-card-head">
              <div class="specific-info">
                <h3 class="specific-hotel-name">{{ selectedHotelName }}</h3>
                <div class="specific-meta">
                  <span class="material-icons-round">place</span>
                  <span>{{ selectedNeighborhood }}</span>
                </div>
                <div class="specific-rating">
                  <span class="material-icons-round">star</span>
                  <span class="material-icons-round">star</span>
                  <span class="material-icons-round">star</span>
                  <span class="material-icons-round">star</span>
                </div>
              </div>
              <div class="specific-thumb" aria-hidden="true"></div>
            </div>

            <div class="specific-controls">
              <div class="field-group">
                <label class="field-label">
                  {{ 'packageDefinition.fields.roomType' | translate }}
                </label>
                <app-sero-dropdown
                  [options]="roomTypeOptions"
                  [value]="form().roomType"
                  [placeholderKey]="'packageDefinition.fields.roomType'"
                  (valueChange)="patch({ roomType: $event })" />
              </div>

              <div class="counter-row-grid">
                <div class="counter-group">
                  <label class="field-label">
                    {{ 'packageDefinition.fields.roomCount' | translate }}
                  </label>
                  <app-counter-input
                    [value]="form().roomCount"
                    [min]="1"
                    [max]="50"
                    (valueChange)="patch({ roomCount: $event })" />
                </div>

                <div class="counter-group">
                  <label class="field-label">
                    {{ 'packageDefinition.fields.nightsCount' | translate }}
                  </label>
                  <app-counter-input
                    [value]="form().nightsCount"
                    [min]="1"
                    [max]="60"
                    (valueChange)="patch({ nightsCount: $event })" />
                </div>
              </div>
            </div>
          </div>
        }

      </div>

      <!-- Action buttons -->
      <div class="form-actions">
        <button class="btn-add-hotel btn-primary" type="button" (click)="submit()">
          <span class="material-symbols-outlined">add_circle</span>
          {{ addLabel | translate }}
        </button>
        <button class="btn-next btn-ghost" type="button" (click)="next.emit()">
          {{ 'packageDefinition.actions.next' | translate }}
          <span class="material-symbols-outlined">chevron_left</span>
        </button>
      </div>

    </div>
  `,
  styles: [`
    .hotel-form-card {
      background: var(--sero-surface);
      border: 1px solid var(--sero-border);
      border-radius: 14px;
      overflow: hidden;
    }

    /* Mode tabs */
    .mode-tabs {
      display: flex;
      border-bottom: 1px solid var(--sero-border);
    }

    .mode-tab {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 14px 16px;
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--sero-text-secondary);
      background: transparent;
      border: none;
      cursor: pointer;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      transition: color 0.15s, border-color 0.15s;
    }

    .mode-tab .tab-icon { font-size: 18px; }

    .mode-tab.active {
      color: var(--sero-primary);
      border-bottom-color: var(--sero-primary);
      background: color-mix(in srgb, var(--sero-primary) 4%, transparent);
    }

    /* Form body */
    .form-body {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 18px;
    }

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

    /* Counters */
    .counters-row {
      display: flex;
      gap: 32px;
    }

    .counter-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .specific-toolbar {
      padding-bottom: 2px;
    }

    .specific-card {
      border: 1px solid color-mix(in srgb, var(--sero-primary) 32%, var(--sero-border));
      border-radius: 12px;
      background: #fff;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .specific-card-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }

    .specific-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }

    .specific-hotel-name {
      margin: 0;
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--sero-text);
    }

    .specific-meta {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      color: var(--sero-text-secondary);
      font-size: 0.82rem;
      font-weight: 600;
    }

    .specific-meta .material-icons-round {
      font-size: 16px;
    }

    .specific-rating {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      color: #eab308;
    }

    .specific-rating .material-icons-round {
      font-size: 16px;
    }

    .specific-thumb {
      width: 94px;
      height: 76px;
      border-radius: 10px;
      border: 1px solid var(--sero-border);
      background:
        linear-gradient(140deg, rgba(58, 71, 42, 0.18), rgba(58, 71, 42, 0.05)),
        url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=320&q=80');
      background-size: cover;
      background-position: center;
      flex-shrink: 0;
    }

    .specific-controls {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .counter-row-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    /* Actions */
    .form-actions {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      border-top: 1px solid var(--sero-border);
      background: color-mix(in srgb, var(--sero-primary) 3%, transparent);
    }

    .btn-add-hotel {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0 20px;
      height: 40px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      border: none;
      background: var(--sero-primary);
      color: #fff;
      transition: opacity 0.15s;
    }

    .btn-add-hotel:hover { opacity: 0.88; }
    .btn-add-hotel .material-symbols-outlined { font-size: 18px; }

    .btn-next {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 0 16px;
      height: 40px;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      border: 1px solid var(--sero-border);
      background: transparent;
      color: var(--sero-text);
      margin-inline-start: auto;
      transition: border-color 0.15s, color 0.15s;
    }

    .btn-next:hover {
      border-color: var(--sero-primary);
      color: var(--sero-primary);
    }

    .btn-next .material-symbols-outlined { font-size: 18px; }

    @media (max-width: 860px) {
      .field-row,
      .counter-row-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HotelStepFormComponent implements OnChanges {
  @Input() city: 'makkah' | 'madinah' = 'makkah';
  @Input() applyNightsToAll = false;
  @Output() hotelAdded = new EventEmitter<HotelSelection>();
  @Output() applyNightsToAllChange = new EventEmitter<boolean>();
  @Output() next = new EventEmitter<void>();

  readonly categories = HOTEL_CATEGORIES;
  readonly roomTypes = ROOM_TYPES;

  neighborhoods: string[] = MAKKAH_NEIGHBORHOODS;
  hotels: string[] = SPECIFIC_HOTELS_MAKKAH;
  addLabel = 'packageDefinition.actions.addMakkahHotel';

  readonly categoryOptions: SeroDropdownOption<string>[] =
    HOTEL_CATEGORIES.map((value) => ({ value, label: value }));
  readonly roomTypeOptions: SeroDropdownOption<string>[] =
    ROOM_TYPES.map((value) => ({ value, label: value }));

  form = signal<HotelFormValues>({
    mode: 'criteria',
    neighborhood: '',
    category: '',
    roomType: '',
    roomCount: 1,
    nightsCount: 3,
    hotelName: '',
  });

  ngOnChanges(): void {
    this.neighborhoods = this.city === 'makkah' ? MAKKAH_NEIGHBORHOODS : MADINAH_NEIGHBORHOODS;
    this.hotels = this.city === 'makkah' ? SPECIFIC_HOTELS_MAKKAH : SPECIFIC_HOTELS_MADINAH;
    this.addLabel = this.city === 'makkah'
      ? 'packageDefinition.actions.addMakkahHotel'
      : 'packageDefinition.actions.addMadinahHotel';
  }

  get neighborhoodOptions(): SeroDropdownOption<string>[] {
    return this.neighborhoods.map((value) => ({ value, label: value }));
  }

  get hotelOptions(): SeroDropdownOption<string>[] {
    return this.hotels.map((value) => ({ value, label: value }));
  }

  get selectedHotelName(): string {
    return this.form().hotelName || this.hotels[0] || '-';
  }

  get selectedNeighborhood(): string {
    return this.form().neighborhood || this.neighborhoods[0] || '-';
  }

  setMode(mode: HotelMode): void {
    this.form.update(f => ({ ...f, mode, neighborhood: '', category: '', hotelName: '' }));
  }

  patch(partial: Partial<HotelFormValues>): void {
    this.form.update(f => ({ ...f, ...partial }));
  }

  submit(): void {
    const f = this.form();
    const selection: HotelSelection = {
      id: `${this.city}-${Date.now()}`,
      mode: f.mode,
      neighborhood: f.mode === 'criteria' ? f.neighborhood : '',
      category: f.mode === 'criteria' ? f.category : '',
      roomType: f.roomType,
      roomCount: f.roomCount,
      nightsCount: f.nightsCount,
      hotelName: f.mode === 'specific' ? f.hotelName : '',
    };
    this.hotelAdded.emit(selection);
  }
}
