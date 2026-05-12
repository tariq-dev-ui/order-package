import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { PackageCardView } from '../../../core/models/package.model';
import { PackageType, BookingMode, VisaStatus } from '../../../core/models/enums';

@Component({
  selector: 'app-package-card',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <div class="pkg-card" [class.pkg-card--resell]="pkg.type === PackageType.PRIVATE_RESELL">

      <!-- Thumbnail -->
      <div class="pkg-thumb">
        <img [src]="pkg.thumbnailUrl" [alt]="pkg.title" loading="lazy"
             (error)="onImgError($event)" />

        <!-- Top-left badges -->
        <div class="thumb-tl">
          @if (pkg.type === PackageType.PRIVATE_RESELL) {
            <span class="pkg-type-badge resell">
              <span class="material-icons-round">verified_user</span>
              {{ 'package.types.privateResell' | translate }}
            </span>
          } @else {
            <span class="pkg-type-badge shared">
              <span class="material-icons-round">groups</span>
              {{ 'package.types.shared' | translate }}
            </span>
          }
        </div>

        <!-- Top-right badges -->
        <div class="thumb-tr">
          @if (pkg.isVerified) {
            <span class="verify-badge">
              <span class="material-icons-round">verified</span>
              {{ 'package.card.verified' | translate }}
            </span>
          }
          @if (pkg.isInstantBooking) {
            <span class="instant-badge">
              <span class="material-icons-round">bolt</span>
              {{ 'package.card.instantBooking' | translate }}
            </span>
          }
        </div>

        <!-- Status bar -->
        <div class="thumb-status" [ngClass]="'status-' + pkg.status">
          <span class="status-dot" [ngClass]="getStatusDotClass()"></span>
          {{ getStatusKey() | translate }}
        </div>
      </div>

      <!-- Body -->
      <div class="pkg-body">
        <!-- Ownership chain -->
        <div class="ownership-chain pkg-chain">
          @for (node of pkg.ownership.ownershipChain; track node.id; let last = $last) {
            <span class="chain-node" [ngClass]="'node-' + node.role.toLowerCase().replace(' ', '-')">
              <span class="material-icons-round" style="font-size:10px">
                {{ node.level === 0 ? 'admin_panel_settings' : 'manage_accounts' }}
              </span>
              {{ node.name }}
            </span>
            @if (!last) {
              <span class="chain-arrow"><span class="material-icons-round">chevron_right</span></span>
            }
          }
        </div>

        <!-- Title -->
        <h3 class="pkg-title">{{ pkg.title }}</h3>

        <!-- Validity -->
        <div class="pkg-validity">
          <span class="material-icons-round">calendar_today</span>
          {{ pkg.validFrom | date:'MMM d' }} – {{ pkg.validTo | date:'MMM d, y' }}
          <span class="validity-sep">·</span>
          <span class="nights-badge">{{ pkg.nights }} {{ 'package.card.nights' | translate }}</span>
        </div>

        <!-- Services -->
        <div class="pkg-services">
          <div class="svc-chip" [class.svc-chip--empty]="pkg.makkahHotelCount === 0">
            <span class="material-icons-round">hotel</span>
            {{ pkg.makkahHotelCount + pkg.madinahHotelCount }} {{ 'package.card.hotelsCount' | translate }}
          </div>
          <div class="svc-chip" [class.svc-chip--empty]="pkg.transportCount === 0">
            <span class="material-icons-round">directions_bus</span>
            {{ pkg.transportCount }} {{ 'package.card.transportCount' | translate }}
          </div>
          <div class="svc-chip" [class.svc-chip--empty]="pkg.ticketCount === 0">
            <span class="material-icons-round">flight</span>
            {{ pkg.ticketCount }} {{ 'package.card.flightsCount' | translate }}
          </div>
          @if (pkg.cateringCount > 0) {
            <div class="svc-chip">
              <span class="material-icons-round">restaurant</span>
              {{ 'package.card.catering' | translate }}
            </div>
          }
          <div class="svc-chip" [ngClass]="getVisaChipClass()">
            <span class="material-icons-round">badge</span>
            {{ getVisaKey() | translate }}
          </div>
        </div>

        <!-- Inventory -->
        <div class="pkg-inventory">
          <div class="inv-header">
            <span class="inv-label">{{ 'package.card.inventory' | translate }}</span>
            <span class="inv-count">
              <strong>{{ pkg.remainingInventory }}</strong> / {{ pkg.totalCapacity }} {{ 'package.card.remaining' | translate }}
            </span>
          </div>
          <div class="inventory-bar">
            <div class="bar-fill" [ngClass]="getInventoryBarClass()" [style.width.%]="getInventoryPercent()"></div>
          </div>
        </div>

        <!-- Price row -->
        <div class="pkg-price-row">
          <div class="price-block">
            @if (pkg.hasMarkup && pkg.markupAmount && pkg.markupAmount > 0) {
              <div class="markup-indicator">
                <span class="material-icons-round">trending_up</span>
                +{{ pkg.markupAmount | number:'1.0-0' }} {{ pkg.currency }} {{ 'package.card.markup' | translate }}
              </div>
            }
            <div class="price-main">
              <span class="price-currency">{{ pkg.currency }}</span>
              <span class="price-amount">{{ pkg.sellingPrice | number:'1.0-0' }}</span>
            </div>
            <div class="price-per">{{ 'package.card.perPerson' | translate }}</div>
          </div>

          <div class="booking-mode-badge" [ngClass]="'bm-' + pkg.bookingMode">
            <span class="material-icons-round">{{ getBookingIcon() }}</span>
            {{ getBookingKey() | translate }}
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="pkg-footer">
        <div class="pkg-tags">
          @for (tag of pkg.tags.slice(0, 3); track tag) {
            <span class="tag-chip">{{ tag }}</span>
          }
          @if (pkg.tags.length > 3) {
            <span class="tag-chip tag-more">+{{ pkg.tags.length - 3 }}</span>
          }
        </div>

        <div class="pkg-actions">
          <button class="btn btn--icon" [attr.title]="'package.card.viewDetails' | translate" (click)="view.emit(pkg)">
            <span class="material-icons-round">open_in_new</span>
          </button>
          @if (showDistribute) {
            <button class="btn btn--primary btn--sm" (click)="distribute.emit(pkg)">
              <span class="material-icons-round">share</span>
              {{ 'package.card.distribute' | translate }}
            </button>
          }
          @if (showBook) {
            <button class="btn btn--primary btn--sm" (click)="book.emit(pkg)">
              <span class="material-icons-round">{{ pkg.isInstantBooking ? 'bolt' : 'pending_actions' }}</span>
              {{ (pkg.isInstantBooking ? 'package.card.bookNow' : 'package.card.sendRequest') | translate }}
            </button>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    // ── Card shell ─────────────────────────────────────────────
    .pkg-card {
      background: var(--sero-card-bg);
      border: 1px solid var(--sero-border);
      border-radius: var(--r-xl);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: box-shadow var(--t-base), border-color var(--t-base), transform var(--t-base);
      box-shadow: var(--shadow-card);

      &:hover {
        transform: translateY(-3px);
        box-shadow: var(--shadow-xl);
        border-color: var(--sero-border-strong);
      }

      &--resell {
        border-color: var(--sero-gold-100);
        border-top: 2px solid var(--sero-gold);
        &:hover { border-color: var(--sero-gold); }
      }
    }

    // ── Thumbnail ──────────────────────────────────────────────
    .pkg-thumb {
      position: relative;
      height: 184px;
      overflow: hidden;
      background: linear-gradient(135deg, var(--sero-surface-3), var(--sero-surface-4));

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.5s ease;
      }
      &:hover img { transform: scale(1.05); }
    }

    .thumb-tl, .thumb-tr {
      position: absolute;
      top: 10px;
      display: flex;
      gap: 5px;
    }
    .thumb-tl { left: 10px; }
    .thumb-tr { right: 10px; flex-direction: column; align-items: flex-end; }

    .pkg-type-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 10px;
      border-radius: var(--r-full);
      font-size: 0.68rem;
      font-weight: 700;
      backdrop-filter: blur(10px);
      letter-spacing: 0.02em;
      .material-icons-round { font-size: 10px; }

      &.resell {
        background: rgba(140,123,61,.88);
        color: #fff;
        border: 1px solid rgba(255,255,255,.2);
      }
      &.shared {
        background: rgba(58,71,42,.88);
        color: #fff;
        border: 1px solid rgba(255,255,255,.2);
      }
    }

    .verify-badge, .instant-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 3px 9px;
      border-radius: var(--r-full);
      font-size: 0.65rem;
      font-weight: 700;
      backdrop-filter: blur(10px);
      .material-icons-round { font-size: 10px; }
    }
    .verify-badge  {
      background: rgba(61,122,82,.85);
      color: #fff;
    }
    .instant-badge {
      background: rgba(181,117,42,.9);
      color: #fff;
    }

    .thumb-status {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      font-size: 0.68rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      backdrop-filter: blur(10px);

      &.status-active  { background: rgba(237,245,240,.92); color: var(--sero-success); }
      &.status-draft   { background: rgba(247,248,244,.92); color: var(--sero-text-tertiary); }
      &.status-paused  { background: rgba(253,243,230,.92); color: var(--sero-warning); }
      &.status-expired { background: rgba(253,240,240,.92); color: var(--sero-danger); }
    }

    // ── Body ───────────────────────────────────────────────────
    .pkg-body {
      padding: 14px 16px;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .pkg-title {
      font-size: 0.9375rem;
      font-weight: 700;
      color: var(--sero-text-primary);
      line-height: 1.35;
      letter-spacing: -0.01em;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .pkg-validity {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.78rem;
      color: var(--sero-text-tertiary);
      .material-icons-round { font-size: 13px; }
    }
    .validity-sep { color: var(--sero-border-strong); }
    .nights-badge {
      background: var(--sero-primary-50);
      color: var(--sero-primary);
      padding: 2px 8px;
      border-radius: var(--r-full);
      font-size: 0.7rem;
      font-weight: 700;
      border: 1px solid var(--sero-primary-100);
    }

    // ── Services ───────────────────────────────────────────────
    .pkg-services { display: flex; gap: 4px; flex-wrap: wrap; }

    .svc-chip {
      display: flex;
      align-items: center;
      gap: 3px;
      padding: 3px 8px;
      background: var(--sero-surface-3);
      border: 1px solid var(--sero-border-light);
      border-radius: var(--r-full);
      font-size: 0.68rem;
      font-weight: 600;
      color: var(--sero-text-secondary);
      .material-icons-round { font-size: 11px; }

      &--empty { opacity: 0.4; }
      &.visa-included     { background: var(--sero-success-bg); color: var(--sero-success); border-color: var(--sero-success-border); }
      &.visa-not-included { background: var(--sero-danger-bg);  color: var(--sero-danger);  border-color: var(--sero-danger-border); }
      &.visa-optional     { background: var(--sero-warning-bg); color: var(--sero-warning); border-color: var(--sero-warning-border); }
    }

    // ── Inventory ──────────────────────────────────────────────
    .pkg-inventory { display: flex; flex-direction: column; gap: 6px; }

    .inv-header { display: flex; justify-content: space-between; align-items: center; }

    .inv-label {
      font-size: 0.68rem;
      font-weight: 700;
      color: var(--sero-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }
    .inv-count {
      font-size: 0.75rem;
      color: var(--sero-text-tertiary);
      strong { color: var(--sero-text-primary); font-weight: 700; }
    }

    // ── Price row ──────────────────────────────────────────────
    .pkg-price-row {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-top: 2px;
    }

    .markup-indicator {
      display: flex;
      align-items: center;
      gap: 3px;
      font-size: 0.68rem;
      color: var(--sero-success);
      font-weight: 600;
      .material-icons-round { font-size: 12px; }
    }

    .price-main { display: flex; align-items: baseline; gap: 3px; }

    .price-currency { font-size: 0.78rem; font-weight: 600; color: var(--sero-text-tertiary); }
    .price-amount   { font-size: 1.75rem; font-weight: 800; color: var(--sero-text-primary); letter-spacing: -0.04em; }
    .price-per      { font-size: 0.7rem; color: var(--sero-text-muted); }

    .booking-mode-badge {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 5px 10px;
      border-radius: var(--r-full);
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.03em;
      .material-icons-round { font-size: 11px; }

      &.bm-instant  { background: var(--sero-warning-bg); color: var(--sero-warning); border: 1px solid var(--sero-warning-border); }
      &.bm-request  { background: var(--sero-info-bg);    color: var(--sero-info);    border: 1px solid var(--sero-info-border); }
      &.bm-manual   { background: var(--sero-surface-3);  color: var(--sero-text-secondary); border: 1px solid var(--sero-border); }
      &.bm-inquiry  { background: var(--sero-gold-50);    color: var(--sero-gold-dark); border: 1px solid var(--sero-gold-100); }
    }

    // ── Footer ─────────────────────────────────────────────────
    .pkg-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      border-top: 1px solid var(--sero-border-light);
      background: var(--sero-surface-2);
    }

    .pkg-tags { display: flex; gap: 4px; flex-wrap: wrap; }

    .tag-chip {
      padding: 2px 8px;
      background: var(--sero-surface-3);
      border: 1px solid var(--sero-border-light);
      border-radius: var(--r-full);
      font-size: 0.65rem;
      font-weight: 500;
      color: var(--sero-text-muted);
    }
    .tag-more {
      background: var(--sero-primary-50);
      color: var(--sero-primary);
      border-color: var(--sero-primary-100);
      font-weight: 700;
    }

    .pkg-actions { display: flex; align-items: center; gap: 6px; }
  `]
})
export class PackageCardComponent {
  @Input() pkg!: PackageCardView;
  @Input() showDistribute = false;
  @Input() showBook = false;

  @Output() view = new EventEmitter<PackageCardView>();
  @Output() distribute = new EventEmitter<PackageCardView>();
  @Output() book = new EventEmitter<PackageCardView>();

  PackageType = PackageType;

  getStatusDotClass(): string {
    const map: Record<string, string> = {
      active: 'status-dot--active', draft: 'status-dot--draft',
      paused: 'status-dot--paused', expired: 'status-dot--expired',
      pending_review: 'status-dot--pending', verified: 'status-dot--active'
    };
    return map[this.pkg.status] || 'status-dot--draft';
  }

  getStatusKey(): string {
    const map: Record<string, string> = {
      active: 'package.status.active', draft: 'package.status.draft',
      paused: 'package.status.paused', expired: 'package.status.expired',
      pending_review: 'package.status.underReview', verified: 'package.status.verified'
    };
    return map[this.pkg.status] || 'package.status.draft';
  }

  getVisaKey(): string {
    const map: Record<VisaStatus, string> = {
      [VisaStatus.INCLUDED]: 'package.visa.included',
      [VisaStatus.NOT_INCLUDED]: 'package.visa.notIncluded',
      [VisaStatus.OPTIONAL]: 'package.visa.optional'
    };
    return map[this.pkg.visaStatus];
  }

  getVisaChipClass(): string {
    const map: Record<VisaStatus, string> = {
      [VisaStatus.INCLUDED]: 'visa-included',
      [VisaStatus.NOT_INCLUDED]: 'visa-not-included',
      [VisaStatus.OPTIONAL]: 'visa-optional'
    };
    return map[this.pkg.visaStatus];
  }

  getInventoryPercent(): number {
    if (!this.pkg.totalCapacity) return 0;
    return Math.round((this.pkg.remainingInventory / this.pkg.totalCapacity) * 100);
  }

  getInventoryBarClass(): string {
    const pct = this.getInventoryPercent();
    if (pct > 50) return 'fill-success';
    if (pct > 20) return 'fill-warning';
    return 'fill-danger';
  }

  getBookingIcon(): string {
    const map: Record<BookingMode, string> = {
      [BookingMode.INSTANT]: 'bolt', [BookingMode.REQUEST]: 'pending',
      [BookingMode.MANUAL]: 'handshake', [BookingMode.INQUIRY]: 'contact_mail'
    };
    return map[this.pkg.bookingMode];
  }

  getBookingKey(): string {
    const map: Record<BookingMode, string> = {
      [BookingMode.INSTANT]: 'package.booking.instant',
      [BookingMode.REQUEST]: 'package.booking.request',
      [BookingMode.MANUAL]: 'package.booking.manual',
      [BookingMode.INQUIRY]: 'package.booking.inquiry'
    };
    return map[this.pkg.bookingMode];
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDQwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmMGYyZWIiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZmlsbD0iIzliYWU4ZCIgZm9udC1zaXplPSIxNSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';
  }
}
