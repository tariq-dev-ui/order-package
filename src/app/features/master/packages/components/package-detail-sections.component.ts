import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  SeroPackageHotelModel, SeroPackageHotelCountModel,
  SeroPackageTripModel, SeroPackageTicketModel,
  SeroPackageCateringModel, TagBasicModel,
} from '../packages.model';

/* ─── Tags ─────────────────────────────────────────────────────── */
@Component({
  selector: 'pkg-tags',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="tags-row">
      @for (tag of Tags; track $index) {
        <span class="tag-chip"
          [style.background-color]="(tag.Color ?? '#3a472a') + '22'"
          [style.color]="tag.Color ?? '#3a472a'">
          {{ tag.Name }}
        </span>
      }
    </div>
  `,
  styles: [`
    .tags-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 12px; }
    .tag-chip { font-size: 11px; padding: 4px 10px; border-radius: 999px; font-weight: 500; }
  `],
})
export class PkgTagsComponent {
  @Input({ required: true }) Tags: TagBasicModel[] | null | undefined;
}

/* ─── Hotels ────────────────────────────────────────────────────── */
@Component({
  selector: 'pkg-hotels',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="section-box">
      @if ((Hotels ?? []).length === 0) {
        <p class="empty-msg"><span class="material-icons-round" style="font-size:14px">info</span> No hotels included in this package.</p>
      } @else {
        @for (city of [1, 2]; track city) {
          @let cityHotels = hotelsForCity(city);
          @let cityCount = countForCity(city);
          @if (cityHotels.length > 0) {
            <div class="city-header">
              <span class="city-name">{{ cityCount?.CityName ?? (city === 1 ? 'Makkah' : 'Madinah') }}</span>
              @if ((cityCount?.NightCount ?? 0) > 0) {
                <span class="city-nights">{{ cityCount?.NightCount }} Nights</span>
              }
            </div>
            @for (hotel of cityHotels; track $index) {
              <div class="hotel-card">
                <div class="hotel-top">
                  <div class="hotel-icon">
                    <span class="material-icons-round" style="font-size:16px">{{ hotel.HotelName ? 'hotel' : 'location_on' }}</span>
                  </div>
                  <div class="hotel-info">
                    <div class="hotel-name">
                      {{ hotel.HotelName ?? 'Neighborhood' }}
                    </div>
                    <div class="hotel-sub">
                      @if (hotel.DistrictName) { <span>{{ hotel.DistrictName }}</span> }
                      @if (hotel.DistanceFromHaram) { <span>{{ hotel.DistanceFromHaram }} km from Haram</span> }
                    </div>
                  </div>
                  <div class="hotel-stars">
                    @for (_ of starsArr(hotel.HotelStar); track $index) {
                      <span class="material-icons-round star-icon">star</span>
                    }
                  </div>
                </div>
                <div class="hotel-tags">
                  @if (hotel.HotelCategoryName) {
                    <span class="htag"><span class="material-icons-round htag-icon">sell</span>{{ hotel.HotelCategoryName }}</span>
                  }
                  @if (hotel.RoomTypeName) {
                    <span class="htag"><span class="material-icons-round htag-icon">bed</span>{{ hotel.RoomTypeName }}</span>
                  }
                  @if ((hotel.RoomCount ?? 0) > 0) {
                    <span class="htag"><span class="material-icons-round htag-icon">meeting_room</span>{{ hotel.RoomCount }} Rooms</span>
                  }
                  @if ((hotel.NightsCount ?? 0) > 0) {
                    <span class="htag"><span class="material-icons-round htag-icon">nights_stay</span>{{ hotel.NightsCount }} Nights</span>
                  }
                </div>
              </div>
            }
          }
        }
      }
    </div>
  `,
  styles: [`
    .section-box { background: #f9fafb; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb; }
    .empty-msg { font-size: 12px; color: #6b7280; display: flex; align-items: center; gap: 4px; }
    .city-header { display: flex; justify-content: space-between; align-items: center; margin: 12px 0 6px; }
    .city-header:first-of-type { margin-top: 0; }
    .city-name { font-size: 12px; font-weight: 600; background: #fff; border: 1px solid #e5e7eb; border-radius: 999px; padding: 3px 10px; }
    .city-nights { font-size: 11px; background: #fff; border: 1px solid #e5e7eb; border-radius: 999px; padding: 3px 10px; }
    .hotel-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px; margin-bottom: 6px; }
    .hotel-top { display: flex; gap: 8px; align-items: flex-start; margin-bottom: 8px; }
    .hotel-icon { width: 30px; height: 30px; border-radius: 50%; background: var(--sero-primary-50,#f2f4ee); color: var(--sero-primary,#3a472a); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .hotel-info { flex: 1; min-width: 0; }
    .hotel-name { font-size: 13px; font-weight: 600; color: #111827; }
    .hotel-sub { font-size: 11px; color: #6b7280; display: flex; gap: 8px; flex-wrap: wrap; margin-top: 2px; }
    .hotel-stars { display: flex; }
    .star-icon { font-size: 12px; color: #f59e0b; }
    .hotel-tags { display: flex; flex-wrap: wrap; gap: 4px; }
    .htag { font-size: 11px; background: var(--sero-primary-50,#f2f4ee); color: var(--sero-primary,#3a472a); padding: 3px 8px; border-radius: 6px; border: 1px solid var(--sero-primary-100,#d9e0cf); display: flex; align-items: center; gap: 3px; }
    .htag-icon { font-size: 12px; }
  `],
})
export class PkgHotelsComponent {
  @Input({ required: true }) Hotels: SeroPackageHotelModel[] | null | undefined;
  @Input({ required: true }) HotelCounts: SeroPackageHotelCountModel[] | null | undefined;

  hotelsForCity(cityId: number): SeroPackageHotelModel[] {
    return (this.Hotels ?? []).filter(h => h.CityId === cityId);
  }

  countForCity(cityId: number): SeroPackageHotelCountModel | undefined {
    return (this.HotelCounts ?? []).find(c => c.CityId === cityId);
  }

  starsArr(n: number | null | undefined): number[] {
    return Array.from({ length: n ?? 0 });
  }
}

/* ─── Trips ─────────────────────────────────────────────────────── */
@Component({
  selector: 'pkg-trips',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="section-box">
      <div class="chips">
        @if ((Trips?.length ?? 0) > 0) {
          @for (t of Trips!; track $index) {
            <span class="chip">
              <span class="material-icons-round chip-icon">directions_bus</span>
              {{ t.TripPath }} ({{ t.VehiclesCount }} {{ t.CarType }})
            </span>
          }
        } @else {
          <span class="empty-chip"><span class="material-icons-round" style="font-size:13px">info</span> No transportation included.</span>
        }
      </div>
    </div>
  `,
  styles: [`
    .section-box { background: #f9fafb; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb; }
    .chips { display: flex; flex-wrap: wrap; gap: 6px; }
    .chip { font-size: 12px; background: #fff; border: 1px solid #e5e7eb; padding: 5px 10px; border-radius: 999px; display: flex; align-items: center; gap: 5px; color: #374151; }
    .chip-icon { font-size: 13px; color: var(--sero-primary,#3a472a); }
    .empty-chip { font-size: 12px; color: #6b7280; display: flex; align-items: center; gap: 4px; }
  `],
})
export class PkgTripsComponent {
  @Input({ required: true }) Trips: SeroPackageTripModel[] | null | undefined;
}

/* ─── Tickets ───────────────────────────────────────────────────── */
@Component({
  selector: 'pkg-tickets',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="section-box">
      <div class="chips">
        @if ((Tickets?.length ?? 0) > 0) {
          @for (t of Tickets!; track $index) {
            <span class="chip">
              <span class="material-icons-round chip-icon">flight</span>
              {{ routeLabel(t) }} ({{ airline(t) || 'Airline not set' }}, {{ t.SeatCount }} seats, {{ t.TripType }}, {{ t.TravelClass }})
            </span>
          }
        } @else {
          <span class="empty-chip"><span class="material-icons-round" style="font-size:13px">info</span> No tickets included.</span>
        }
      </div>
    </div>
  `,
  styles: [`
    .section-box { background: #f9fafb; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb; }
    .chips { display: flex; flex-wrap: wrap; gap: 6px; }
    .chip { font-size: 12px; background: #fff; border: 1px solid #e5e7eb; padding: 5px 10px; border-radius: 999px; display: flex; align-items: center; gap: 5px; color: #374151; }
    .chip-icon { font-size: 13px; color: var(--sero-primary,#3a472a); }
    .empty-chip { font-size: 12px; color: #6b7280; display: flex; align-items: center; gap: 4px; }
  `],
})
export class PkgTicketsComponent {
  @Input({ required: true }) Tickets: SeroPackageTicketModel[] | null | undefined;

  routeLabel(t: SeroPackageTicketModel): string {
    const src = t.SourceCityName ?? 'Source';
    const dst = t.DestinationCityName ?? 'Destination';
    return `${src} ${(t.TripType ?? '').toLowerCase().replace(/\s/g, '') === 'roundtrip' ? '↔' : '→'} ${dst}`;
  }

  airline(t: SeroPackageTicketModel): string {
    return t.AirlineCompanyNameEn ?? t.AirlineCompanyNameAr ?? '';
  }
}

/* ─── Caterings ─────────────────────────────────────────────────── */
@Component({
  selector: 'pkg-caterings',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="section-box">
      <div class="chips">
        @if ((Caterings?.length ?? 0) > 0) {
          @for (c of Caterings!; track $index) {
            <span class="chip">
              <span class="material-icons-round chip-icon">restaurant</span>
              {{ c.FoodType }} ({{ c.Count }} {{ c.CateringType }})
            </span>
          }
        } @else {
          <span class="empty-chip"><span class="material-icons-round" style="font-size:13px">info</span> No meals included.</span>
        }
      </div>
    </div>
  `,
  styles: [`
    .section-box { background: #f9fafb; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb; }
    .chips { display: flex; flex-wrap: wrap; gap: 6px; }
    .chip { font-size: 12px; background: #fff; border: 1px solid #e5e7eb; padding: 5px 10px; border-radius: 999px; display: flex; align-items: center; gap: 5px; color: #374151; }
    .chip-icon { font-size: 13px; color: var(--sero-primary,#3a472a); }
    .empty-chip { font-size: 12px; color: #6b7280; display: flex; align-items: center; gap: 4px; }
  `],
})
export class PkgCateringsComponent {
  @Input({ required: true }) Caterings: SeroPackageCateringModel[] | null | undefined;
}
