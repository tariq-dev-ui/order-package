import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HotelModel } from '../../../services/admin.api.client';
import {
  MOCK_DISTRICTS_MADINAH,
  MOCK_DISTRICTS_MAKKAH,
  MOCK_HOTEL_CATEGORIES,
  MOCK_HOTELS,
  MOCK_ROOM_TYPES,
} from '../../../pages/package-builder/services/package-builder.mock';

type HotelSelectionMode = 'criteria' | 'specific';

interface AddedHotelItem {
  id: number;
  mode: HotelSelectionMode;
  title: string;
  subtitle: string;
  meta: string;
}

@Component({
  selector: 'app-my-services-hotel-create-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="hotel-create-page" dir="ltr">
      <header class="hotel-page-head">
        <button type="button" class="icon-btn" aria-label="Back to My Services" (click)="backToInventory()">
          <span class="material-icons-round">arrow_back</span>
        </button>

        <div class="hero-icon">
          <span class="material-icons-round">hotel</span>
        </div>

        <div class="head-copy">
          <p class="kicker">My Services</p>
          <h1>Choose Your Hotel in {{ cityName() }}</h1>
          <p>Select the hotel that suits your needs</p>
        </div>
      </header>

      @if (notice()) {
        <div class="notice" role="status">
          <span class="material-icons-round">check_circle</span>
          <span>{{ notice() }}</span>
        </div>
      }

      <section class="selected-items" aria-label="Added hotel items">
        @if (addedItems().length === 0) {
          <div class="empty-chip">
            <span class="material-icons-round">info</span>
            <span>No hotel items added yet</span>
          </div>
        }

        @for (item of addedItems(); track item.id) {
          <article class="hotel-chip">
            <span class="material-icons-round">hotel</span>
            <div>
              <strong>{{ item.title }}</strong>
              <small>{{ item.subtitle }} · {{ item.meta }}</small>
            </div>
            <button type="button" aria-label="Remove hotel item" (click)="removeItem(item.id)">
              <span class="material-icons-round">close</span>
            </button>
          </article>
        }
      </section>

      <nav class="hotel-tabs" aria-label="Hotel selection mode">
        <button
          type="button"
          [class.is-active]="activeTab() === 'criteria'"
          (click)="setActiveTab('criteria')">
          <span class="material-icons-round">tune</span>
          <span>Hotel by Criteria</span>
        </button>
        <button
          type="button"
          [class.is-active]="activeTab() === 'specific'"
          (click)="setActiveTab('specific')">
          <span class="material-icons-round">travel_explore</span>
          <span>Select Specific Hotel</span>
        </button>
      </nav>

      @if (activeTab() === 'criteria') {
        <section class="form-panel" aria-label="Hotel by criteria">
          <div class="field-grid">
            <label class="field">
              <span>
                <span class="material-icons-round">place</span>
                District
              </span>
              <select [value]="criteriaDistrictId() ?? ''" (change)="setCriteriaDistrict($event)">
                <option value="">Select District</option>
                @for (district of districts(); track district.CityDistID) {
                  <option [value]="district.CityDistID">{{ districtLabel(district.CityDistID) }}</option>
                }
              </select>
            </label>

            <label class="field">
              <span>
                <span class="material-icons-round">hotel_class</span>
                Category
              </span>
              <select [value]="criteriaCategoryId() ?? ''" (change)="setCriteriaCategory($event)">
                <option value="">Select Category</option>
                @for (category of categories; track category.CategoryID) {
                  <option [value]="category.CategoryID">{{ categoryLabel(category.CategoryID) }}</option>
                }
              </select>
            </label>

            <label class="field">
              <span>
                <span class="material-icons-round">meeting_room</span>
                Room Type
              </span>
              <select [value]="criteriaRoomTypeId() ?? ''" (change)="setCriteriaRoomType($event)">
                <option value="">Select Room Type</option>
                @for (roomType of roomTypes; track roomType.RoomTypeID) {
                  <option [value]="roomType.RoomTypeID">{{ roomTypeLabel(roomType.RoomTypeID) }}</option>
                }
              </select>
            </label>

            <div class="field counter-field">
              <span>
                <span class="material-icons-round">door_front</span>
                Room Count
              </span>
              <div class="counter">
                <button type="button" aria-label="Decrease rooms" (click)="updateCriteriaRooms(-1)">
                  <span class="material-icons-round">remove</span>
                </button>
                <strong>{{ criteriaRoomCount() }}</strong>
                <span>{{ roomLabel(criteriaRoomCount()) }}</span>
                <button type="button" aria-label="Increase rooms" (click)="updateCriteriaRooms(1)">
                  <span class="material-icons-round">add</span>
                </button>
              </div>
            </div>

            <div class="field counter-field">
              <span>
                <span class="material-icons-round">dark_mode</span>
                Number of Nights
              </span>
              <div class="counter">
                <button type="button" aria-label="Decrease nights" (click)="updateCriteriaNights(-1)">
                  <span class="material-icons-round">remove</span>
                </button>
                <strong>{{ criteriaNightCount() }}</strong>
                <span>{{ nightLabel(criteriaNightCount()) }}</span>
                <button type="button" aria-label="Increase nights" (click)="updateCriteriaNights(1)">
                  <span class="material-icons-round">add</span>
                </button>
              </div>
            </div>
          </div>

          @if (!isCriteriaReady()) {
            <p class="validation-note">
              Kindly fill in all required fields above<br>
              to add a new hotel item.
            </p>
          }

          <button type="button" class="primary-btn" [disabled]="!isCriteriaReady()" (click)="addCriteriaItem()">
            <span class="material-icons-round">add</span>
            <span>Add New</span>
          </button>
        </section>
      }

      @if (activeTab() === 'specific') {
        <section class="form-panel" aria-label="Select specific hotel">
          <div class="specific-filters">
            <label class="field">
              <span>
                <span class="material-icons-round">place</span>
                District
              </span>
              <select [value]="hotelDistrictFilterId() ?? ''" (change)="setHotelDistrictFilter($event)">
                <option value="">Any District</option>
                @for (district of districts(); track district.CityDistID) {
                  <option [value]="district.CityDistID">{{ districtLabel(district.CityDistID) }}</option>
                }
              </select>
            </label>

            <label class="field search-field">
              <span>
                <span class="material-icons-round">search</span>
                Select Specific Hotel
              </span>
              <input
                type="search"
                placeholder="Hotel name, location..."
                [value]="hotelSearchText()"
                (input)="setHotelSearchText($event)" />
            </label>
          </div>

          <div class="hotel-list" role="list">
            @if (filteredHotels().length === 0) {
              <div class="no-hotels">
                <span class="material-icons-round">hotel</span>
                <strong>No hotels found matching your criteria</strong>
                <button type="button" (click)="resetHotelFilters()">Reset filters</button>
              </div>
            }

            @for (hotel of filteredHotels(); track hotel.HotelID) {
              <article
                class="hotel-card"
                role="listitem"
                [class.is-selected]="specificHotelId() === hotel.HotelID">
                <button type="button" class="hotel-card-main" (click)="selectHotel(hotel)">
                  <span class="hotel-thumb">
                    <span class="material-icons-round">apartment</span>
                  </span>
                  <span class="hotel-copy">
                    <strong>{{ hotelName(hotel) }}</strong>
                    <small>{{ districtLabel(hotel.DistID) }}</small>
                    <span class="rating" [attr.aria-label]="hotel.OfficialRating + ' star hotel'">
                      @for (star of starRange(hotel); track star) {
                        <span class="material-icons-round">star</span>
                      }
                    </span>
                  </span>
                </button>

                @if (specificHotelId() === hotel.HotelID) {
                  <div class="hotel-expanded">
                    <label class="field">
                      <span>
                        <span class="material-icons-round">meeting_room</span>
                        Room Type
                      </span>
                      <select [value]="specificRoomTypeId() ?? ''" (change)="setSpecificRoomType($event)">
                        <option value="">Select Room Type</option>
                        @for (roomType of roomTypes; track roomType.RoomTypeID) {
                          <option [value]="roomType.RoomTypeID">{{ roomTypeLabel(roomType.RoomTypeID) }}</option>
                        }
                      </select>
                    </label>

                    <div class="field counter-field">
                      <span>
                        <span class="material-icons-round">door_front</span>
                        Number of Rooms
                      </span>
                      <div class="counter">
                        <button type="button" aria-label="Decrease rooms" (click)="updateSpecificRooms(-1)">
                          <span class="material-icons-round">remove</span>
                        </button>
                        <strong>{{ specificRoomCount() }}</strong>
                        <span>{{ roomLabel(specificRoomCount()) }}</span>
                        <button type="button" aria-label="Increase rooms" (click)="updateSpecificRooms(1)">
                          <span class="material-icons-round">add</span>
                        </button>
                      </div>
                    </div>

                    <div class="field counter-field">
                      <span>
                        <span class="material-icons-round">dark_mode</span>
                        Number of Nights
                      </span>
                      <div class="counter">
                        <button type="button" aria-label="Decrease nights" (click)="updateSpecificNights(-1)">
                          <span class="material-icons-round">remove</span>
                        </button>
                        <strong>{{ specificNightCount() }}</strong>
                        <span>{{ nightLabel(specificNightCount()) }}</span>
                        <button type="button" aria-label="Increase nights" (click)="updateSpecificNights(1)">
                          <span class="material-icons-round">add</span>
                        </button>
                      </div>
                    </div>

                    @if (!isSpecificReady()) {
                      <p class="validation-note">
                        Kindly fill in all required fields above<br>
                        to add a new hotel item.
                      </p>
                    }

                    <button type="button" class="primary-btn" [disabled]="!isSpecificReady()" (click)="addSpecificItem()">
                      <span class="material-icons-round">add</span>
                      <span>Add New</span>
                    </button>
                  </div>
                }
              </article>
            }
          </div>
        </section>
      }

      <footer class="form-footer">
        <button type="button" class="secondary-btn" (click)="skip()">
          <span>Skip</span>
        </button>

        <div class="save-wrap">
          @if (addedItems().length === 0) {
            <p>Please complete the required information<br>and save</p>
          }

          <button type="button" class="primary-btn" [disabled]="addedItems().length === 0" (click)="save()">
            <span class="material-icons-round">save</span>
            <span>Save</span>
          </button>
        </div>
      </footer>
    </section>
  `,
  styles: [`
    :host {
      display: block;
    }

    .hotel-create-page {
      min-height: calc(100vh - var(--sero-topbar-height));
      padding: var(--sp-6);
      background: var(--sero-app-bg);
      color: var(--sero-text-primary);
    }

    .hotel-page-head {
      display: flex;
      align-items: center;
      gap: var(--sp-4);
      margin-bottom: var(--sp-5);
    }

    .icon-btn,
    .hotel-chip button,
    .counter button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--sero-border-light);
      background: var(--sero-card-bg);
      color: var(--sero-text-primary);
      cursor: pointer;
      transition: var(--t-base);
    }

    .icon-btn {
      width: 42px;
      height: 42px;
      border-radius: var(--r-md);
      box-shadow: var(--shadow-xs);
    }

    .icon-btn:hover,
    .hotel-chip button:hover,
    .counter button:hover {
      border-color: var(--sero-primary);
      color: var(--sero-primary);
      background: var(--sero-bg-hover);
    }

    .hero-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--r-full);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--sero-text-inverse);
      background: linear-gradient(135deg, var(--sero-primary-light), var(--sero-primary));
      box-shadow: var(--shadow-primary);
    }

    .hero-icon .material-icons-round {
      font-size: 26px;
    }

    .head-copy {
      min-width: 0;
    }

    .kicker {
      margin: 0 0 var(--sp-1);
      color: var(--sero-gold);
      font-size: .78rem;
      font-weight: 800;
      text-transform: uppercase;
    }

    h1 {
      margin: 0;
      color: var(--sero-text-primary);
      font-size: 1.5rem;
      line-height: 1.35;
    }

    .head-copy p:last-child {
      margin: var(--sp-1) 0 0;
      color: var(--sero-text-secondary);
      font-size: .9rem;
    }

    .notice {
      display: flex;
      align-items: center;
      gap: var(--sp-2);
      width: fit-content;
      margin-bottom: var(--sp-4);
      padding: var(--sp-3) var(--sp-4);
      border: 1px solid var(--sero-success-border);
      border-radius: var(--r-md);
      background: var(--sero-success-bg);
      color: var(--sero-success);
      font-weight: 700;
    }

    .selected-items {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-3);
      margin-bottom: var(--sp-5);
    }

    .empty-chip,
    .hotel-chip {
      display: inline-flex;
      align-items: center;
      gap: var(--sp-2);
      min-height: 44px;
      border: 1px solid var(--sero-border-light);
      border-radius: var(--r-full);
      background: var(--sero-card-bg);
      box-shadow: var(--shadow-xs);
    }

    .empty-chip {
      padding: var(--sp-2) var(--sp-4);
      color: var(--sero-text-secondary);
      background: var(--sero-surface-2);
    }

    .hotel-chip {
      padding: var(--sp-2) var(--sp-2) var(--sp-2) var(--sp-4);
    }

    .hotel-chip > .material-icons-round {
      color: var(--sero-primary);
    }

    .hotel-chip strong,
    .hotel-chip small {
      display: block;
      line-height: 1.35;
    }

    .hotel-chip small {
      color: var(--sero-text-secondary);
      font-size: .76rem;
    }

    .hotel-chip button {
      width: 28px;
      height: 28px;
      border-radius: var(--r-full);
    }

    .hotel-chip button .material-icons-round {
      font-size: 17px;
    }

    .hotel-tabs {
      display: flex;
      gap: var(--sp-2);
      margin-bottom: var(--sp-4);
      border-bottom: 1px solid var(--sero-border-light);
    }

    .hotel-tabs button {
      display: inline-flex;
      align-items: center;
      gap: var(--sp-2);
      padding: var(--sp-3) var(--sp-4);
      border: 0;
      border-bottom: 2px solid transparent;
      background: transparent;
      color: var(--sero-text-secondary);
      font: inherit;
      font-weight: 800;
      cursor: pointer;
      transition: var(--t-base);
    }

    .hotel-tabs button:hover,
    .hotel-tabs button.is-active {
      color: var(--sero-primary);
      border-bottom-color: var(--sero-primary);
      background: color-mix(in srgb, var(--sero-primary) 7%, transparent);
    }

    .form-panel {
      padding: var(--sp-5);
      border: 1px solid var(--sero-border-light);
      border-radius: var(--r-lg);
      background: var(--sero-card-bg);
      box-shadow: var(--shadow-sm);
    }

    .field-grid,
    .specific-filters,
    .hotel-expanded {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--sp-4);
    }

    .field {
      display: grid;
      gap: var(--sp-2);
      min-width: 0;
      color: var(--sero-text-primary);
      font-weight: 800;
    }

    .field > span {
      display: inline-flex;
      align-items: center;
      gap: var(--sp-2);
      color: var(--sero-text-secondary);
      font-size: .84rem;
    }

    .field .material-icons-round {
      color: var(--sero-primary);
      font-size: 18px;
    }

    select,
    input {
      width: 100%;
      height: 46px;
      border: 1px solid var(--sero-border-light);
      border-radius: var(--r-md);
      background: var(--sero-card-bg);
      color: var(--sero-text-primary);
      font: inherit;
      font-weight: 700;
      outline: none;
      padding: 0 var(--sp-3);
      transition: var(--t-base);
    }

    select:focus,
    input:focus {
      border-color: var(--sero-primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--sero-primary) 16%, transparent);
    }

    .counter-field {
      align-content: start;
    }

    .counter {
      display: grid;
      grid-template-columns: 42px auto 1fr 42px;
      align-items: center;
      min-height: 46px;
      border: 1px solid var(--sero-border-light);
      border-radius: var(--r-md);
      background: var(--sero-surface-2);
      overflow: hidden;
    }

    .counter button {
      width: 42px;
      height: 46px;
      border-width: 0;
      border-radius: 0;
      background: var(--sero-card-bg);
    }

    .counter strong {
      padding-inline: var(--sp-3);
      color: var(--sero-primary);
      font-size: 1rem;
    }

    .counter > span {
      color: var(--sero-text-secondary);
      font-weight: 700;
    }

    .validation-note {
      margin: var(--sp-4) 0;
      color: var(--sero-warning);
      font-size: .86rem;
      font-weight: 700;
      line-height: 1.7;
    }

    .primary-btn,
    .secondary-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--sp-2);
      min-height: 42px;
      padding: 0 var(--sp-5);
      border-radius: var(--r-md);
      border: 1px solid transparent;
      font: inherit;
      font-weight: 900;
      cursor: pointer;
      transition: var(--t-base);
    }

    .primary-btn {
      background: var(--sero-primary);
      color: var(--sero-text-inverse);
      box-shadow: var(--shadow-primary);
    }

    .primary-btn:hover:not(:disabled) {
      background: var(--sero-primary-dark);
      transform: translateY(-1px);
    }

    .primary-btn:disabled {
      cursor: not-allowed;
      box-shadow: none;
      background: var(--sero-surface-4);
      color: var(--sero-text-muted);
    }

    .secondary-btn {
      background: var(--sero-card-bg);
      border-color: var(--sero-border-light);
      color: var(--sero-text-secondary);
    }

    .secondary-btn:hover {
      color: var(--sero-primary);
      border-color: var(--sero-primary);
      background: var(--sero-bg-hover);
    }

    .specific-filters {
      margin-bottom: var(--sp-4);
    }

    .search-field {
      grid-column: span 1;
    }

    .hotel-list {
      display: grid;
      gap: var(--sp-3);
      max-height: 520px;
      overflow: auto;
      padding: var(--sp-1);
      scrollbar-color: var(--sero-primary) var(--sero-surface-3);
    }

    .hotel-card {
      border: 1px solid var(--sero-border-light);
      border-radius: var(--r-md);
      background: var(--sero-card-bg);
      box-shadow: var(--shadow-xs);
      overflow: hidden;
      transition: var(--t-base);
    }

    .hotel-card:hover,
    .hotel-card.is-selected {
      border-color: var(--sero-primary);
      box-shadow: var(--shadow-card-hover);
    }

    .hotel-card.is-selected {
      background: color-mix(in srgb, var(--sero-primary) 5%, var(--sero-card-bg));
    }

    .hotel-card-main {
      display: flex;
      align-items: flex-start;
      gap: var(--sp-3);
      width: 100%;
      border: 0;
      background: transparent;
      color: inherit;
      text-align: start;
      padding: var(--sp-4);
      cursor: pointer;
    }

    .hotel-thumb {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 64px;
      width: 64px;
      height: 64px;
      border: 1px solid var(--sero-border-light);
      border-radius: var(--r-md);
      background: var(--sero-surface-2);
      color: var(--sero-primary);
    }

    .hotel-thumb .material-icons-round {
      font-size: 30px;
    }

    .hotel-copy {
      display: grid;
      gap: var(--sp-1);
      min-width: 0;
    }

    .hotel-copy strong {
      color: var(--sero-text-primary);
      font-size: .96rem;
      line-height: 1.4;
    }

    .hotel-copy small {
      color: var(--sero-text-secondary);
      font-size: .8rem;
      font-weight: 800;
    }

    .rating {
      display: flex;
      color: var(--sero-gold);
    }

    .rating .material-icons-round {
      font-size: 17px;
    }

    .hotel-expanded {
      padding: 0 var(--sp-4) var(--sp-4);
      border-top: 1px solid var(--sero-border-light);
      background: color-mix(in srgb, var(--sero-primary) 3%, transparent);
    }

    .hotel-expanded .validation-note,
    .hotel-expanded .primary-btn {
      align-self: end;
    }

    .no-hotels {
      display: grid;
      justify-items: center;
      gap: var(--sp-2);
      padding: var(--sp-8);
      color: var(--sero-text-secondary);
      text-align: center;
    }

    .no-hotels .material-icons-round {
      color: var(--sero-text-muted);
      font-size: 42px;
    }

    .no-hotels button {
      border: 0;
      background: transparent;
      color: var(--sero-primary);
      font: inherit;
      font-weight: 900;
      cursor: pointer;
    }

    .form-footer {
      position: sticky;
      bottom: var(--sp-4);
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--sp-3);
      margin-top: var(--sp-5);
      padding: var(--sp-3);
      border: 1px solid var(--sero-border-light);
      border-radius: var(--r-lg);
      background: color-mix(in srgb, var(--sero-card-bg) 92%, transparent);
      box-shadow: var(--shadow-lg);
      backdrop-filter: blur(12px);
      z-index: 2;
    }

    .save-wrap {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
    }

    .save-wrap p {
      margin: 0;
      color: var(--sero-warning);
      font-size: .78rem;
      font-weight: 800;
      line-height: 1.5;
      text-align: end;
    }

    @media (max-width: 900px) {
      .hotel-create-page {
        padding: var(--sp-4);
      }

      .field-grid,
      .specific-filters,
      .hotel-expanded {
        grid-template-columns: 1fr;
      }

      .hotel-tabs {
        overflow-x: auto;
      }

      .hotel-tabs button {
        white-space: nowrap;
      }
    }

    @media (max-width: 640px) {
      .hotel-page-head {
        align-items: flex-start;
      }

      h1 {
        font-size: 1.18rem;
      }

      .form-footer,
      .save-wrap {
        align-items: stretch;
        flex-direction: column;
      }

      .form-footer .primary-btn,
      .form-footer .secondary-btn {
        width: 100%;
      }
    }
  `],
})
export class HotelServiceCreatePageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly categories = MOCK_HOTEL_CATEGORIES;
  readonly roomTypes = MOCK_ROOM_TYPES;

  readonly cityId = signal(this.route.snapshot.data['cityId'] === 2 ? 2 : 1);
  readonly cityName = computed(() => this.cityId() === 2 ? 'Madina' : 'Makkah');
  readonly districts = computed(() => this.cityId() === 2 ? MOCK_DISTRICTS_MADINAH : MOCK_DISTRICTS_MAKKAH);
  readonly activeTab = signal<HotelSelectionMode>('criteria');
  readonly notice = signal('');
  readonly addedItems = signal<AddedHotelItem[]>([]);

  readonly criteriaDistrictId = signal<number | null>(null);
  readonly criteriaCategoryId = signal<number | null>(null);
  readonly criteriaRoomTypeId = signal<number | null>(null);
  readonly criteriaRoomCount = signal(1);
  readonly criteriaNightCount = signal(1);

  readonly hotelDistrictFilterId = signal<number | null>(null);
  readonly hotelSearchText = signal('');
  readonly specificHotelId = signal<number | null>(null);
  readonly specificRoomTypeId = signal<number | null>(null);
  readonly specificRoomCount = signal(1);
  readonly specificNightCount = signal(1);

  readonly filteredHotels = computed(() => {
    const cityId = this.cityId();
    const districtId = this.hotelDistrictFilterId();
    const searchText = this.hotelSearchText().trim().toLowerCase();

    return MOCK_HOTELS.filter(hotel => {
      const hotelCityId = hotel.CityId ?? hotel.CityID;
      const matchesCity = hotelCityId === cityId;
      const matchesDistrict = districtId === null || hotel.DistID === districtId;
      const haystack = `${hotel.Name ?? ''} ${hotel.NameEn ?? ''} ${this.districtLabel(hotel.DistID)}`.toLowerCase();
      const matchesSearch = searchText.length === 0 || haystack.includes(searchText);
      return matchesCity && matchesDistrict && matchesSearch;
    });
  });

  readonly isCriteriaReady = computed(() =>
    this.criteriaDistrictId() !== null &&
    this.criteriaCategoryId() !== null &&
    this.criteriaRoomTypeId() !== null &&
    this.criteriaRoomCount() > 0 &&
    this.criteriaNightCount() > 0
  );

  readonly isSpecificReady = computed(() =>
    this.specificHotelId() !== null &&
    this.specificRoomTypeId() !== null &&
    this.specificRoomCount() > 0 &&
    this.specificNightCount() > 0
  );

  setActiveTab(tab: HotelSelectionMode): void {
    this.activeTab.set(tab);
    this.notice.set('');
  }

  setCriteriaDistrict(event: Event): void {
    this.criteriaDistrictId.set(this.readSelectNumber(event));
  }

  setCriteriaCategory(event: Event): void {
    this.criteriaCategoryId.set(this.readSelectNumber(event));
  }

  setCriteriaRoomType(event: Event): void {
    this.criteriaRoomTypeId.set(this.readSelectNumber(event));
  }

  setHotelDistrictFilter(event: Event): void {
    this.hotelDistrictFilterId.set(this.readSelectNumber(event));
  }

  setSpecificRoomType(event: Event): void {
    this.specificRoomTypeId.set(this.readSelectNumber(event));
  }

  setHotelSearchText(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.hotelSearchText.set(input?.value ?? '');
  }

  selectHotel(hotel: HotelModel): void {
    this.specificHotelId.set(hotel.HotelID ?? null);
    this.specificRoomTypeId.set(null);
    this.notice.set('');
  }

  updateCriteriaRooms(delta: number): void {
    this.criteriaRoomCount.update(value => Math.max(1, value + delta));
  }

  updateCriteriaNights(delta: number): void {
    this.criteriaNightCount.update(value => Math.max(1, value + delta));
  }

  updateSpecificRooms(delta: number): void {
    this.specificRoomCount.update(value => Math.max(1, value + delta));
  }

  updateSpecificNights(delta: number): void {
    this.specificNightCount.update(value => Math.max(1, value + delta));
  }

  addCriteriaItem(): void {
    if (!this.isCriteriaReady()) {
      this.notice.set('Please complete the required information first.');
      return;
    }

    const districtId = this.criteriaDistrictId();
    const categoryId = this.criteriaCategoryId();
    const roomTypeId = this.criteriaRoomTypeId();

    if (districtId === null || categoryId === null || roomTypeId === null) {
      return;
    }

    this.addedItems.update(items => [
      ...items,
      {
        id: Date.now(),
        mode: 'criteria',
        title: `${this.cityName()} Hotel Criteria`,
        subtitle: `${this.categoryLabel(categoryId)} · ${this.districtLabel(districtId)}`,
        meta: `${this.criteriaRoomCount()} ${this.roomLabel(this.criteriaRoomCount())} · ${this.criteriaNightCount()} ${this.nightLabel(this.criteriaNightCount())} · ${this.roomTypeLabel(roomTypeId)}`,
      },
    ]);
    this.notice.set(`${this.cityName()} hotel item was added locally.`);
  }

  addSpecificItem(): void {
    if (!this.isSpecificReady()) {
      this.notice.set('Please complete the required information first.');
      return;
    }

    const hotel = MOCK_HOTELS.find(item => item.HotelID === this.specificHotelId());
    const roomTypeId = this.specificRoomTypeId();

    if (!hotel || roomTypeId === null) {
      return;
    }

    this.addedItems.update(items => [
      ...items,
      {
        id: Date.now(),
        mode: 'specific',
        title: this.hotelName(hotel),
        subtitle: `${this.districtLabel(hotel.DistID)} · ${hotel.OfficialRating ?? 0} Stars`,
        meta: `${this.specificRoomCount()} ${this.roomLabel(this.specificRoomCount())} · ${this.specificNightCount()} ${this.nightLabel(this.specificNightCount())} · ${this.roomTypeLabel(roomTypeId)}`,
      },
    ]);
    this.notice.set(`${this.hotelName(hotel)} was added locally.`);
  }

  removeItem(id: number): void {
    this.addedItems.update(items => items.filter(item => item.id !== id));
  }

  resetHotelFilters(): void {
    this.hotelSearchText.set('');
    this.hotelDistrictFilterId.set(null);
  }

  save(): void {
    if (this.addedItems().length === 0) {
      this.notice.set('Please complete the required information and save.');
      return;
    }

    this.notice.set('Hotel service saved locally for the prototype.');
  }

  skip(): void {
    this.router.navigate(['/master/my-services']);
  }

  backToInventory(): void {
    this.router.navigate(['/master/my-services']);
  }

  districtLabel(id: number | undefined): string {
    if (id === undefined) {
      return 'Unknown District';
    }

    const labels: Record<number, string> = {
      1: 'Al Haram',
      2: 'Al Misfalah',
      3: 'Al Aziziyah',
      4: 'Al Shisha',
      5: 'Al Zaher',
      6: 'Ajyad',
      7: 'Al Nuzhah',
      11: 'Central Area',
      12: 'Al Anbariyah',
      13: 'Al Qiblatain',
      14: 'Al Salam',
      15: 'Quba',
      16: 'Bani Harithah',
    };

    return labels[id] ?? 'Unknown District';
  }

  categoryLabel(id: number | undefined): string {
    if (id === undefined) {
      return 'Category';
    }

    const labels: Record<number, string> = {
      1: 'Economy',
      2: 'Standard',
      3: 'Premium',
      4: 'Luxury',
    };

    return labels[id] ?? 'Category';
  }

  roomTypeLabel(id: number | undefined): string {
    if (id === undefined) {
      return 'Room Type';
    }

    const labels: Record<number, string> = {
      1: 'Single',
      2: 'Double',
      3: 'Triple',
      4: 'Quadruple',
      5: 'Family Room',
      6: 'Suite',
    };

    return labels[id] ?? 'Room Type';
  }

  hotelName(hotel: HotelModel): string {
    return hotel.NameEn || hotel.Name || 'Ram Tye Hotel';
  }

  starRange(hotel: HotelModel): number[] {
    return Array.from({ length: Math.max(0, hotel.OfficialRating ?? 0) }, (_, index) => index + 1);
  }

  roomLabel(value: number): string {
    return value === 1 ? 'Room' : 'Rooms';
  }

  nightLabel(value: number): string {
    return value === 1 ? 'Night' : 'Nights';
  }

  private readSelectNumber(event: Event): number | null {
    const select = event.target as HTMLSelectElement | null;
    const value = Number(select?.value);
    return Number.isFinite(value) && value > 0 ? value : null;
  }
}
