import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Package, HotelService } from '../../../../../core/models/package.model';
import { HotelRating } from '../../../../../core/models/enums';

@Component({
  selector: 'app-step2-madinah',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="step-content animate-fade-in">
      <div class="step-header">
        <div class="step-icon-wrap step-icon-wrap--gold">
          <span class="material-icons-round">hotel</span>
        </div>
        <div>
          <h3 class="step-title">{{ 'builder.hotels.madinahTitle' | translate }}</h3>
          <p class="step-desc">{{ 'builder.hotels.madinahDesc' | translate }}</p>
        </div>
      </div>

      @if (hotels.length > 0) {
        <div class="hotels-list">
          @for (hotel of hotels; track hotel.id; let i = $index) {
            <div class="hotel-item card card--flat">
              <div class="card-body flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="hotel-thumb hotel-thumb--gold">
                    <span class="material-icons-round">hotel</span>
                  </div>
                  <div>
                    <div class="font-semibold">{{ hotel.name }}</div>
                    <div class="flex items-center gap-2 text-sm text-secondary">
                      <span class="star-rating">
                        @for (s of getStars(hotel.rating); track s) {
                          <span class="material-icons-round star">star</span>
                        }
                      </span>
                      <span>· {{ hotel.distanceToHaram }} km · {{ hotel.nights }} {{ 'common.labels.nights' | translate }} · {{ hotel.roomType }}</span>
                    </div>
                  </div>
                </div>
                <button class="btn btn--icon" (click)="removeHotel(i)">
                  <span class="material-icons-round">delete_outline</span>
                </button>
              </div>
            </div>
          }
        </div>
      }

      @if (showForm) {
        <div class="card card--flat hotel-form animate-scale-in">
          <div class="card-body">
            <h4 class="font-semibold text-md mb-4">{{ 'builder.hotels.addMadinah' | translate }}</h4>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
              <div class="form-group" style="grid-column:1/-1">
                <label class="form-label">{{ 'builder.hotels.name' | translate }} <span class="required">*</span></label>
                <input class="form-control" [(ngModel)]="newHotel.name" [placeholder]="'builder.hotels.namePlaceholder' | translate" />
              </div>
              <div class="form-group">
                <label class="form-label">{{ 'builder.hotels.rating' | translate }}</label>
                <select class="form-control" [(ngModel)]="newHotel.rating">
                  <option [value]="3">{{ 'builder.hotels.stars3' | translate }}</option>
                  <option [value]="4">{{ 'builder.hotels.stars4' | translate }}</option>
                  <option [value]="5">{{ 'builder.hotels.stars5' | translate }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">{{ 'builder.hotels.distanceNabawi' | translate }}</label>
                <input class="form-control" type="number" [(ngModel)]="newHotel.distanceToHaram" step="0.01" />
              </div>
              <div class="form-group">
                <label class="form-label">{{ 'builder.hotels.nights' | translate }}</label>
                <input class="form-control" type="number" [(ngModel)]="newHotel.nights" />
              </div>
              <div class="form-group">
                <label class="form-label">{{ 'builder.hotels.roomType' | translate }}</label>
                <select class="form-control" [(ngModel)]="newHotel.roomType">
                  <option>{{ 'builder.hotels.roomTypes.standard' | translate }}</option>
                  <option>{{ 'builder.hotels.roomTypes.superior' | translate }}</option>
                  <option>{{ 'builder.hotels.roomTypes.deluxe' | translate }}</option>
                  <option>{{ 'builder.hotels.roomTypes.suite' | translate }}</option>
                  <option>{{ 'builder.hotels.roomTypes.family' | translate }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">{{ 'builder.hotels.mealPlan' | translate }}</label>
                <select class="form-control" [(ngModel)]="newHotel.mealPlan">
                  <option>{{ 'builder.hotels.mealPlans.roomOnly' | translate }}</option>
                  <option>{{ 'builder.hotels.mealPlans.breakfast' | translate }}</option>
                  <option>{{ 'builder.hotels.mealPlans.halfBoard' | translate }}</option>
                  <option>{{ 'builder.hotels.mealPlans.fullBoard' | translate }}</option>
                </select>
              </div>
            </div>
            <div class="flex items-center gap-3 mt-4">
              <button class="btn btn--primary" (click)="addHotel()">
                <span class="material-icons-round">add</span> {{ 'builder.hotels.addMadinah' | translate }}
              </button>
              <button class="btn btn--secondary" (click)="showForm = false">{{ 'common.buttons.cancel' | translate }}</button>
            </div>
          </div>
        </div>
      }

      @if (!showForm) {
        <button class="btn btn--secondary w-full add-btn" (click)="showForm = true">
          <span class="material-icons-round">add_circle_outline</span> {{ 'builder.hotels.addMadinah' | translate }}
        </button>
      }

      <div class="step-nav">
        <button class="btn btn--secondary btn--lg" (click)="prev.emit()">
          <span class="material-icons-round">arrow_back</span> {{ 'common.buttons.back' | translate }}
        </button>
        <button class="btn btn--primary btn--lg" (click)="next.emit()">
          {{ 'builder.navigation.nextTransport' | translate }} <span class="material-icons-round">arrow_forward</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .step-content { padding: var(--space-xl); max-width: 860px; margin: 0 auto; }
    .step-header { display: flex; align-items: flex-start; gap: var(--space-md); margin-bottom: var(--space-xl); }
    .step-icon-wrap { width: 52px; height: 52px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      &--gold { background: var(--color-gold-50); color: var(--color-gold); .material-icons-round { font-size: 26px; } }
    }
    .step-title { font-size: 1.25rem; font-weight: 700; }
    .step-desc  { font-size: 0.875rem; color: var(--color-text-secondary); margin-top: 4px; }
    .hotels-list { display: flex; flex-direction: column; gap: var(--space-sm); margin-bottom: var(--space-md); }
    .hotel-item { border: 1px solid var(--color-border); border-radius: var(--radius-lg); }
    .hotel-thumb { width: 44px; height: 44px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center;
      &--gold { background: var(--color-gold-50); .material-icons-round { color: var(--color-gold); } }
    }
    .star-rating { display: flex; gap: 1px; }
    .star { font-size: 13px; color: var(--color-gold); }
    .hotel-form { border: 2px dashed var(--color-border); margin-bottom: var(--space-md); }
    .add-btn { border: 2px dashed var(--color-border); background: transparent; color: var(--color-text-secondary); justify-content: center; padding: 14px; &:hover { border-color: var(--color-gold); color: var(--color-gold); background: var(--color-gold-50); } }
    .step-nav { display: flex; align-items: center; justify-content: space-between; margin-top: var(--space-xl); padding-top: var(--space-xl); border-top: 1px solid var(--color-border); }
    .mb-4 { margin-bottom: 16px; }
    .mt-4 { margin-top: 16px; }
  `]
})
export class Step2MadinahComponent implements OnInit {
  @Input() packageData!: Partial<Package>;
  @Output() dataChanged = new EventEmitter<Partial<Package>>();
  @Output() next = new EventEmitter<void>();
  @Output() prev = new EventEmitter<void>();

  hotels: HotelService[] = [];
  showForm = false;
  newHotel: Partial<HotelService> = { name: '', rating: HotelRating.FIVE, distanceToHaram: 0.1, nights: 7, roomType: 'Deluxe Room', mealPlan: 'Breakfast', city: 'madinah' };

  ngOnInit(): void { this.hotels = [...(this.packageData.madinahHotels || [])]; }

  addHotel(): void {
    if (!this.newHotel.name) return;
    this.hotels = [...this.hotels, { ...this.newHotel as HotelService, id: 'hotel-d-' + Date.now(), checkIn: new Date(), checkOut: new Date() }];
    this.dataChanged.emit({ madinahHotels: this.hotels });
    this.newHotel = { name: '', rating: HotelRating.FIVE, distanceToHaram: 0.1, nights: 7, roomType: 'Deluxe Room', mealPlan: 'Breakfast', city: 'madinah' };
    this.showForm = false;
  }

  removeHotel(i: number): void {
    this.hotels = this.hotels.filter((_, idx) => idx !== i);
    this.dataChanged.emit({ madinahHotels: this.hotels });
  }

  getStars(r: number): number[] { return Array(r).fill(0); }
}
