import {
  ChangeDetectionStrategy, Component, inject, input, output, signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SeroPackageModel } from '../packages.model';
import {
  PkgTagsComponent,
  PkgHotelsComponent,
  PkgTripsComponent,
  PkgTicketsComponent,
  PkgCateringsComponent,
} from './package-detail-sections.component';

@Component({
  selector: 'pkg-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, DatePipe, MatDialogModule,
    PkgTagsComponent, PkgHotelsComponent, PkgTripsComponent,
    PkgTicketsComponent, PkgCateringsComponent,
  ],
  template: `
    <div class="pkg-card">
      <!-- Image -->
      <div class="pkg-img-wrap">
        <img [src]="pkg()?.ImageUrl || defaultImg" [alt]="pkg()?.Title || 'Package'" class="pkg-img" />

        @if (pkg()?.PackageCode) {
          <div class="pkg-code-badge">
            <span class="material-icons-round" style="font-size:11px;margin-right:3px">sell</span>
            {{ pkg()?.PackageCode }}
          </div>
        }

        <div class="pkg-visa-badge-wrap">
          @if (pkg()?.IsVisaIncluded) {
            <div class="visa-badge visa-yes">
              <span class="visa-dot visa-dot-yes"><span class="material-icons-round" style="font-size:11px">check</span></span>
              VISA INCLUDED
            </div>
          } @else {
            <div class="visa-badge visa-no">
              <span class="visa-dot visa-dot-no"><span class="material-icons-round" style="font-size:11px">close</span></span>
              NO VISA
            </div>
          }
        </div>
      </div>

      <!-- Body -->
      <div class="pkg-body">
        <div class="pkg-title-row">
          <h2 class="pkg-title">{{ pkg()?.Title }}</h2>
          <div class="pkg-price-col">
            <span class="pkg-price">
              <span class="pkg-sar">R </span>
              @if ((pkg()?.Price ?? 0) > 0) { {{ pkg()?.Price }} } @else { N/A }
            </span>
            <div class="pkg-price-badge-wrap">
              @if (pkg()?.VerifiedPrice) {
                <div class="price-badge-group">
                  <span class="price-badge price-badge-verified">
                    <span class="material-icons-round" style="font-size:11px">check_circle</span>
                    Verified Price
                  </span>
                  <div class="price-tooltip">This price is exact and verified. You can confidently quote it to customers.</div>
                </div>
              } @else {
                <div class="price-badge-group">
                  <span class="price-badge price-badge-approx">
                    <span style="font-weight:700;margin-right:2px">~</span>Approximate
                  </span>
                  <div class="price-tooltip">This price is approximate and may vary. Please confirm before quoting to customers.</div>
                </div>
              }
            </div>
          </div>
        </div>

        <div class="pkg-meta-row">
          <span class="material-icons-round" style="font-size:14px;margin-right:4px">calendar_today</span>
          <span>{{ pkg()?.StartDate | date:'MMM d, y' }} - {{ pkg()?.EndDate | date:'MMM d, y' }}</span>
        </div>

        <div class="pkg-counts-row">
          @if ((pkg()?.Quantity ?? 0) > 0) {
            <div class="pkg-count-item">
              <span class="material-icons-round pkg-count-icon">inventory_2</span>
              <span><strong>{{ pkg()?.Quantity }}</strong> Available Packages</span>
            </div>
          }
          @if ((pkg()?.GuestCount ?? 0) > 0) {
            <div class="pkg-count-item">
              <span class="material-icons-round pkg-count-icon">group</span>
              <span><strong>{{ pkg()?.GuestCount }}</strong> Guests</span>
            </div>
          }
        </div>

        <pkg-tags [Tags]="pkg()?.Tags" />

        <!-- Hotels -->
        <div class="section-row">
          <button class="collapse-toggle" type="button"
            (click)="toggleSection(pkg()!.PackageID!, 'hotel')">
            <span class="collapse-label">
              <span class="material-icons-round collapse-label-icon">hotel</span>
              Hotels ({{ pkg()?.Hotels?.length || 0 }})
            </span>
            <span class="material-icons-round collapse-chevron"
              [class.open]="isSectionOpen(pkg()!.PackageID!, 'hotel')">expand_more</span>
          </button>
          <div class="collapse-content custom-scroll"
            [class.open]="isSectionOpen(pkg()!.PackageID!, 'hotel')">
            <pkg-hotels [Hotels]="pkg()?.Hotels" [HotelCounts]="pkg()?.HotelCounts" />
          </div>
        </div>

        <!-- Transport -->
        <div class="section-row">
          <button class="collapse-toggle" type="button"
            (click)="toggleSection(pkg()!.PackageID!, 'transport')">
            <span class="collapse-label">
              <span class="material-icons-round collapse-label-icon">directions_bus</span>
              Transportation ({{ pkg()?.Trips?.length || 0 }})
            </span>
            <span class="material-icons-round collapse-chevron"
              [class.open]="isSectionOpen(pkg()!.PackageID!, 'transport')">expand_more</span>
          </button>
          <div class="collapse-content custom-scroll"
            [class.open]="isSectionOpen(pkg()!.PackageID!, 'transport')">
            <pkg-trips [Trips]="pkg()?.Trips" />
          </div>
        </div>

        <!-- Tickets -->
        <div class="section-row">
          <button class="collapse-toggle" type="button"
            (click)="toggleSection(pkg()?.PackageID!, 'tickets')">
            <span class="collapse-label">
              <span class="material-icons-round collapse-label-icon">flight</span>
              Tickets ({{ pkg()?.Tickets?.length || 0 }})
            </span>
            <span class="material-icons-round collapse-chevron"
              [class.open]="isSectionOpen(pkg()?.PackageID!, 'tickets')">expand_more</span>
          </button>
          <div class="collapse-content custom-scroll"
            [class.open]="isSectionOpen(pkg()?.PackageID!, 'tickets')">
            <pkg-tickets [Tickets]="pkg()?.Tickets" />
          </div>
        </div>

        <!-- Catering -->
        <div class="section-row">
          <button class="collapse-toggle" type="button"
            (click)="toggleSection(pkg()!.PackageID!, 'food')">
            <span class="collapse-label">
              <span class="material-icons-round collapse-label-icon">restaurant</span>
              Catering ({{ pkg()?.Caterings?.length || 0 }})
            </span>
            <span class="material-icons-round collapse-chevron"
              [class.open]="isSectionOpen(pkg()!.PackageID!, 'food')">expand_more</span>
          </button>
          <div class="collapse-content custom-scroll"
            [class.open]="isSectionOpen(pkg()!.PackageID!, 'food')">
            <pkg-caterings [Caterings]="pkg()?.Caterings" />
          </div>
        </div>
      </div>

      <!-- Footer -->
      <footer class="pkg-footer">
        <div class="pkg-footer-inner">
          <div class="pkg-valid-until">
            <span class="material-icons-round" style="font-size:16px;color:#9ca3af;flex-shrink:0">calendar_month</span>
            <div class="pkg-valid-text">
              <span class="pkg-valid-label">Valid until</span>
              <span class="pkg-valid-date">{{ pkg()?.EndDate | date: 'yyyy-MM-dd' }}</span>
            </div>
          </div>
          <button class="pkg-book-btn" type="button" (click)="book.emit(pkg()!)">
            BOOK
            <span class="material-icons-round" style="font-size:16px">shopping_cart</span>
          </button>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .pkg-card {
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #f3f4f6;
      box-shadow: 0 2px 8px rgba(0,0,0,.08);
      display: flex;
      flex-direction: column;
      height: 100%;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }
    .pkg-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,.12); }

    /* Image */
    .pkg-img-wrap { position: relative; }
    .pkg-img { width: 100%; height: 220px; object-fit: cover; display: block; }
    .pkg-code-badge {
      position: absolute; top: 10px; left: 10px;
      background: rgba(0,0,0,.75); color: #fff;
      padding: 5px 12px; border-radius: 999px; font-size: 11px; font-weight: 600;
      display: flex; align-items: center; backdrop-filter: blur(4px);
    }
    .pkg-visa-badge-wrap { position: absolute; top: 10px; right: 10px; display: flex; flex-direction: column; gap: 6px; align-items: flex-end; }
    .visa-badge {
      font-size: 11px; font-weight: 600; padding: 5px 10px; border-radius: 999px;
      display: flex; align-items: center; gap: 5px; backdrop-filter: blur(6px);
      border: 1px solid rgba(255,255,255,.2); color: #fff;
    }
    .visa-yes { background: rgba(22,163,74,.6); }
    .visa-no  { background: rgba(220,38,38,.6); }
    .visa-dot { border-radius: 50%; padding: 2px; display: flex; align-items: center; justify-content: center; }
    .visa-dot-yes { background: #16a34a; }
    .visa-dot-no  { background: #dc2626; }

    /* Body */
    .pkg-body { padding: 16px; flex-grow: 1; }
    .pkg-title-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; gap: 8px; }
    .pkg-title { font-size: 16px; font-weight: 700; color: #111827; flex: 1; }
    .pkg-price-col { display: flex; flex-direction: column; align-items: flex-end; }
    .pkg-price { font-size: 16px; font-weight: 700; color: var(--sero-primary, #3a472a); white-space: nowrap; }
    .pkg-sar { font-size: 12px; color: #9ca3af; }
    .pkg-price-badge-wrap { margin-top: 4px; position: relative; }
    .price-badge-group { position: relative; display: inline-block; cursor: default; }
    .price-badge {
      font-size: 11px; padding: 2px 8px; border-radius: 999px; font-weight: 500;
      white-space: nowrap; display: inline-flex; align-items: center; gap: 3px;
    }
    .price-badge-verified { background: #dcfce7; color: #15803d; }
    .price-badge-approx  { background: #f3f4f6; color: #6b7280; }
    .price-tooltip {
      display: none; position: absolute; right: 0; top: calc(100% + 6px);
      width: 220px; background: #1f2937; color: #fff; font-size: 11px;
      border-radius: 8px; padding: 10px 12px; z-index: 20; line-height: 1.5;
      pointer-events: none; box-shadow: 0 8px 24px rgba(0,0,0,.2);
    }
    .price-badge-group:hover .price-tooltip { display: block; }

    .pkg-meta-row { display: flex; align-items: center; font-size: 13px; color: #6b7280; margin-bottom: 8px; }
    .pkg-counts-row { display: flex; align-items: center; gap: 16px; font-size: 13px; color: #6b7280; margin-bottom: 14px; }
    .pkg-count-item { display: flex; align-items: center; gap: 4px; }
    .pkg-count-icon { font-size: 13px; color: var(--sero-primary-300, #7a8c6a); }
    .pkg-count-item strong { color: #374151; font-weight: 600; }

    /* Collapsible sections */
    .section-row { margin-bottom: 4px; }
    .collapse-toggle {
      width: 100%; display: flex; justify-content: space-between; align-items: center;
      text-align: left; font-size: 13px; font-weight: 500; color: #374151;
      background: none; border: none; cursor: pointer;
      padding: 8px 0; border-top: 1px solid #f3f4f6;
      transition: color 0.15s;
    }
    .collapse-toggle:hover { color: var(--sero-primary, #3a472a); }
    .collapse-label { display: flex; align-items: center; gap: 6px; }
    .collapse-label-icon { font-size: 15px; color: var(--sero-primary-400, #5a6e48); }
    .collapse-chevron { font-size: 18px; color: #9ca3af; transition: transform 0.3s; }
    .collapse-chevron.open { transform: rotate(180deg); }
    .collapse-content { max-height: 0; overflow: hidden; transition: max-height 0.3s ease-out; }
    .collapse-content.open { max-height: 60vh; overflow-y: auto; }

    /* Footer */
    .pkg-footer { padding: 14px 16px; border-top: 1px solid #f3f4f6; background: #fff; flex-shrink: 0; }
    .pkg-footer-inner { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
    .pkg-valid-until { display: flex; align-items: center; gap: 6px; }
    .pkg-valid-text { display: flex; flex-direction: column; line-height: 1.3; }
    .pkg-valid-label { font-size: 11px; color: #9ca3af; font-weight: 500; }
    .pkg-valid-date  { font-size: 13px; color: #6b7280; font-weight: 600; }
    .pkg-book-btn {
      flex: 1; background: var(--sero-primary, #3a472a); color: #fff;
      border: none; border-radius: 8px; padding: 10px 16px;
      font-size: 13px; font-weight: 600; cursor: pointer;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: background 0.15s, box-shadow 0.15s;
      box-shadow: 0 2px 8px rgba(58,71,42,.3);
    }
    .pkg-book-btn:hover { background: var(--sero-primary-600, #2d3820); box-shadow: 0 4px 16px rgba(58,71,42,.4); }
    .pkg-book-btn:active { background: var(--sero-primary-700, #222a18); }

    .custom-scroll::-webkit-scrollbar { width: 4px; }
    .custom-scroll::-webkit-scrollbar-track { background: transparent; }
    .custom-scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 999px; }
  `],
})
export class PkgCardComponent {
  pkg = input<SeroPackageModel>();
  book = output<SeroPackageModel>();

  readonly defaultImg = 'assets/images/package-placeholder.svg';
  readonly openSections = signal<Map<number, string>>(new Map());

  toggleSection(packageId: number, section: string): void {
    const map = new Map(this.openSections());
    if (map.get(packageId) === section) {
      map.delete(packageId);
    } else {
      map.set(packageId, section);
    }
    this.openSections.set(map);
  }

  isSectionOpen(packageId: number | null | undefined, section: string): boolean {
    return !!packageId && this.openSections().get(packageId) === section;
  }
}
