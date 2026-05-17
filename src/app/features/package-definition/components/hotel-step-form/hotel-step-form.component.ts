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

interface SpecificHotelCard {
  id: string;
  name: string;
  neighborhood: string;
  stars: number;
  imageUrl: string;
}

interface AccordionForm {
  roomType: string;
  roomCount: number;
  nightsCount: number;
}

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

          <!-- Specific mode toolbar — filter fields only, never reflect selection -->
          <div class="specific-toolbar">
            <div class="field-row">
              <div class="field-group">
                <label class="field-label">
                  {{ 'packageDefinition.fields.neighborhood' | translate }}
                </label>
                <app-sero-dropdown
                  [options]="neighborhoodOptions"
                  [value]="selectedDistrictFilter()"
                  [placeholderKey]="'packageDefinition.fields.neighborhood'"
                  (valueChange)="onDistrictFilterChange($event)" />
              </div>

              <div class="field-group">
                <label class="field-label">
                  {{ 'packageDefinition.fields.hotelName' | translate }}
                </label>
                <div class="hotel-search-wrap">
                  <span class="material-icons-round hotel-search-icon">search</span>
                  <input
                    class="hotel-search-input"
                    type="text"
                    [value]="hotelSearchQuery()"
                    [attr.placeholder]="'ابحث عن اسم الفندق'"
                    (input)="hotelSearchQuery.set($any($event.target).value)" />
                </div>
              </div>
            </div>
          </div>

          <!-- Hotel cards list -->
          <div class="specific-results">
            @if (filteredHotelCards.length === 0) {
              <div class="specific-empty">
                لا توجد فنادق مطابقة لهذا الحي أو البحث.
              </div>
            } @else {
              @for (hotel of filteredHotelCards; track hotel.id) {
                <div class="specific-card" [class.open]="openedHotelId === hotel.id">
                  <button type="button" class="specific-card-head" (click)="toggleHotelCard(hotel)">
                    <div class="specific-info">
                      <h3 class="specific-hotel-name">{{ hotel.name }}</h3>
                      <div class="specific-meta">
                        <span class="material-icons-round">place</span>
                        <span>{{ hotel.neighborhood }}</span>
                      </div>
                      <div class="specific-rating">
                        @for (starIndex of starIndexes(hotel.stars); track starIndex) {
                          <span class="material-icons-round">star</span>
                        }
                      </div>
                    </div>
                    <div class="specific-thumb" [style.background-image]="'url(' + hotel.imageUrl + ')'" aria-hidden="true"></div>
                    <span class="material-icons-round specific-chevron" [class.open]="openedHotelId === hotel.id">expand_more</span>
                  </button>

                  @if (openedHotelId === hotel.id) {
                    <div class="specific-controls">
                      <div class="field-group">
                        <label class="field-label">
                          {{ 'packageDefinition.fields.roomType' | translate }}
                        </label>
                        <app-sero-dropdown
                          [options]="roomTypeOptions"
                          [value]="getHotelForm(hotel.id).roomType"
                          [placeholderKey]="'packageDefinition.fields.roomType'"
                          (valueChange)="patchAccordion(hotel.id, { roomType: $event })" />
                      </div>

                      <div class="counter-row-grid">
                        <div class="counter-group">
                          <label class="field-label">
                            {{ 'packageDefinition.fields.roomCount' | translate }}
                          </label>
                          <app-counter-input
                            [value]="getHotelForm(hotel.id).roomCount"
                            [min]="0"
                            [max]="50"
                            (valueChange)="patchAccordion(hotel.id, { roomCount: $event })" />
                        </div>

                        <div class="counter-group">
                          <label class="field-label">
                            {{ 'packageDefinition.fields.nightsCount' | translate }}
                          </label>
                          <app-counter-input
                            [value]="getHotelForm(hotel.id).nightsCount"
                            [min]="0"
                            [max]="60"
                            (valueChange)="patchAccordion(hotel.id, { nightsCount: $event })" />
                        </div>
                      </div>

                      <div class="specific-inline-actions">
                        <button
                          class="btn-inline-add"
                          type="button"
                          [disabled]="!canAddHotel(hotel)"
                          [attr.title]="!canAddHotel(hotel) ? 'يرجى اختيار نوع الغرفة وعدد الغرف وعدد الليالي' : null"
                          (click)="submitSpecific(hotel)">
                          <span class="material-symbols-outlined">add_circle</span>
                          إضافة
                        </button>
                      </div>
                      @if (!canAddHotel(hotel)) {
                        <p class="specific-helper-text">يرجى اختيار نوع الغرفة وعدد الغرف وعدد الليالي</p>
                      }
                    </div>
                  }
                </div>
              }
            }
          </div>
        }

      </div>

      <!-- Action buttons -->
      <div class="form-actions">
        @if (form().mode === 'criteria') {
          <button class="btn-add-hotel btn-primary" type="button" (click)="submitCriteria()">
            <span class="material-symbols-outlined">add_circle</span>
            {{ addLabel | translate }}
          </button>
        }
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
      border: 1px solid var(--sero-border);
      border-radius: 12px;
      background: var(--sero-surface);
      overflow: hidden;
      transition: border-color var(--t-fast);
    }

    .specific-card.open {
      border-color: color-mix(in srgb, var(--sero-primary) 40%, var(--sero-border));
    }

    .specific-results {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .specific-empty {
      font-size: 0.82rem;
      color: var(--sero-text-secondary);
      border: 1px dashed var(--sero-border);
      border-radius: 10px;
      background: var(--sero-surface-2);
      padding: 12px;
    }

    .specific-card-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      width: 100%;
      border: none;
      background: transparent;
      text-align: start;
      padding: 12px;
      cursor: pointer;
    }

    .specific-card.open .specific-card-head {
      background: color-mix(in srgb, var(--sero-primary) 4%, transparent);
    }

    .specific-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
      flex: 1;
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
      width: 80px;
      height: 66px;
      border-radius: 10px;
      border: 1px solid var(--sero-border);
      background:
        linear-gradient(140deg, rgba(58, 71, 42, 0.18), rgba(58, 71, 42, 0.05));
      background-size: cover;
      background-position: center;
      flex-shrink: 0;
    }

    .specific-chevron {
      color: var(--sero-text-muted);
      transition: transform var(--t-fast);
      flex-shrink: 0;
    }

    .specific-chevron.open {
      transform: rotate(180deg);
      color: var(--sero-primary);
    }

    .specific-controls {
      display: flex;
      flex-direction: column;
      gap: 12px;
      border-top: 1px solid var(--sero-border-light);
      padding: 14px 12px;
      background: color-mix(in srgb, var(--sero-primary) 2%, var(--sero-card-bg));
    }

    .specific-inline-actions {
      display: flex;
      justify-content: flex-end;
    }

    .btn-inline-add {
      min-height: 38px;
      border-radius: 8px;
      border: 1px solid var(--sero-primary);
      background: var(--sero-primary);
      color: #fff;
      font-family: var(--sero-font);
      font-size: 0.82rem;
      font-weight: 700;
      padding: 0 14px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      transition: opacity var(--t-fast), transform var(--t-fast);
    }

    .btn-inline-add:hover {
      opacity: 0.9;
      transform: translateY(-1px);
    }

    .btn-inline-add:disabled {
      background: #d8dde6;
      border-color: #d8dde6;
      color: #ffffff;
      cursor: not-allowed;
      opacity: 1;
      transform: none;
    }

    .btn-inline-add .material-symbols-outlined {
      font-size: 16px;
    }

    .specific-helper-text {
      margin: -4px 0 0;
      font-size: 0.76rem;
      color: var(--sero-text-secondary);
    }

    .counter-row-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .hotel-search-wrap {
      width: 100%;
      min-height: 42px;
      border: 1px solid var(--sero-border);
      border-radius: 10px;
      background: var(--sero-card-bg);
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 12px;
      transition: border-color var(--t-fast), box-shadow var(--t-fast), background var(--t-fast);
    }

    .hotel-search-wrap:hover {
      border-color: var(--sero-border-strong);
      background: var(--sero-surface-2);
    }

    .hotel-search-wrap:focus-within {
      border-color: var(--sero-primary);
      box-shadow: 0 0 0 3px rgba(58, 71, 42, 0.1);
      background: var(--sero-card-bg);
    }

    .hotel-search-icon {
      font-size: 18px;
      color: var(--sero-text-muted);
      flex-shrink: 0;
    }

    .hotel-search-input {
      width: 100%;
      border: none;
      background: transparent;
      outline: none;
      font-family: var(--sero-font);
      font-size: 0.84rem;
      color: var(--sero-text-primary);
    }

    .hotel-search-input::placeholder {
      color: var(--sero-text-muted);
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

  readonly categoryOptions: SeroDropdownOption<string>[] =
    HOTEL_CATEGORIES.map((value) => ({ value, label: value }));
  readonly roomTypeOptions: SeroDropdownOption<string>[] =
    ROOM_TYPES.map((value) => ({ value, label: value }));

  neighborhoods: string[] = MAKKAH_NEIGHBORHOODS;
  addLabel = 'packageDefinition.actions.addMakkahHotel';
  specificHotelCards: SpecificHotelCard[] = [];

  // Criteria mode form — only used when mode === 'criteria'
  form = signal<HotelFormValues>({
    mode: 'criteria',
    neighborhood: '',
    category: '',
    roomType: '',
    roomCount: 1,
    nightsCount: 3,
    hotelName: '',
  });

  // Specific mode: filter state — drives toolbar inputs, never reflects a selection
  selectedDistrictFilter = signal<string>('');
  hotelSearchQuery = signal<string>('');

  // Specific mode: which accordion card is open (null = none)
  openedHotelId: string | null = null;

  // Specific mode: room details inside the open accordion, independent from filter state
  private hotelCardForms = signal<Record<string, AccordionForm>>({});

  ngOnChanges(): void {
    this.neighborhoods = this.city === 'makkah' ? MAKKAH_NEIGHBORHOODS : MADINAH_NEIGHBORHOODS;
    this.addLabel = this.city === 'makkah'
      ? 'packageDefinition.actions.addMakkahHotel'
      : 'packageDefinition.actions.addMadinahHotel';
    this.specificHotelCards = this.buildSpecificHotelCards();
    this.openedHotelId = null;
    this.selectedDistrictFilter.set('');
    this.hotelSearchQuery.set('');
    this.hotelCardForms.set(this.buildInitialHotelCardForms());
  }

  get neighborhoodOptions(): SeroDropdownOption<string>[] {
    return this.neighborhoods.map((value) => ({ value, label: value }));
  }

  get filteredHotelCards(): SpecificHotelCard[] {
    const districtFilter = this.selectedDistrictFilter().trim();
    const searchFilter = this.hotelSearchQuery().trim().toLowerCase();

    return this.specificHotelCards.filter((hotel) => {
      const districtMatches = !districtFilter || hotel.neighborhood === districtFilter;
      const searchMatches = !searchFilter || hotel.name.toLowerCase().includes(searchFilter);
      return districtMatches && searchMatches;
    });
  }

  onDistrictFilterChange(value: string): void {
    this.selectedDistrictFilter.set(value);
    // Close accordion if the opened hotel is no longer in the filtered results
    if (this.openedHotelId !== null) {
      const stillVisible = this.filteredHotelCards.some((h) => h.id === this.openedHotelId);
      if (!stillVisible) {
        this.openedHotelId = null;
      }
    }
  }

  toggleHotelCard(hotel: SpecificHotelCard): void {
    if (this.openedHotelId === hotel.id) {
      this.openedHotelId = null;
    } else {
      this.openedHotelId = hotel.id;
      // Selecting a hotel should not keep the toolbar in filtered mode.
      this.selectedDistrictFilter.set('');
      this.hotelSearchQuery.set('');
    }
  }

  patchAccordion(hotelId: string, partial: Partial<AccordionForm>): void {
    this.hotelCardForms.update((forms) => ({
      ...forms,
      [hotelId]: { ...this.getHotelForm(hotelId), ...partial },
    }));
  }

  starIndexes(count: number): number[] {
    return Array.from({ length: count }, (_, index) => index);
  }

  setMode(mode: HotelMode): void {
    this.form.update((f) => ({ ...f, mode, neighborhood: '', category: '', hotelName: '' }));
    this.openedHotelId = null;
    this.selectedDistrictFilter.set('');
    this.hotelSearchQuery.set('');
    this.hotelCardForms.set(this.buildInitialHotelCardForms());
  }

  patch(partial: Partial<HotelFormValues>): void {
    this.form.update((f) => ({ ...f, ...partial }));
  }

  submitSpecific(hotel: SpecificHotelCard): void {
    if (!this.canAddHotel(hotel)) {
      return;
    }

    const af = this.getHotelForm(hotel.id);
    const selection: HotelSelection = {
      id: `${this.city}-${Date.now()}`,
      mode: 'specific',
      neighborhood: hotel.neighborhood,
      category: '',
      roomType: af.roomType,
      roomCount: af.roomCount,
      nightsCount: af.nightsCount,
      hotelName: hotel.name,
    };
    this.hotelAdded.emit(selection);
    this.patchAccordion(hotel.id, { roomType: '', roomCount: 0, nightsCount: 0 });
    this.openedHotelId = null;
  }

  submitCriteria(): void {
    const f = this.form();
    const selection: HotelSelection = {
      id: `${this.city}-${Date.now()}`,
      mode: 'criteria',
      neighborhood: f.neighborhood,
      category: f.category,
      roomType: f.roomType,
      roomCount: f.roomCount,
      nightsCount: f.nightsCount,
      hotelName: '',
    };
    this.hotelAdded.emit(selection);
  }

  private buildSpecificHotelCards(): SpecificHotelCard[] {
    const hotels = this.city === 'makkah' ? SPECIFIC_HOTELS_MAKKAH : SPECIFIC_HOTELS_MADINAH;
    const fallbackNeighborhood = this.neighborhoods[0] || '-';
    const images = [
      '/IMG/logo.png',
      '/IMG/logo.png',
      '/IMG/logo.png',
      '/IMG/logo.png',
    ];

    return hotels.map((name, index) => ({
      id: `${this.city}-specific-${index}`,
      name,
      neighborhood: this.neighborhoods[index % this.neighborhoods.length] || fallbackNeighborhood,
      stars: 4 + (index % 2),
      imageUrl: images[index % images.length],
    }));
  }

  getHotelForm(hotelId: string): AccordionForm {
    return this.hotelCardForms()[hotelId] ?? { roomType: '', roomCount: 0, nightsCount: 0 };
  }

  canAddHotel(hotel: SpecificHotelCard): boolean {
    if (!hotel || this.openedHotelId !== hotel.id) {
      return false;
    }

    const form = this.getHotelForm(hotel.id);
    return !!form.roomType && form.roomCount > 0 && form.nightsCount > 0;
  }

  private buildInitialHotelCardForms(): Record<string, AccordionForm> {
    return this.specificHotelCards.reduce<Record<string, AccordionForm>>((acc, hotel) => {
      acc[hotel.id] = { roomType: '', roomCount: 0, nightsCount: 0 };
      return acc;
    }, {});
  }
}
