import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { OrderSummary, HotelSelection } from '../../package-definition.models';

@Component({
  selector: 'app-order-summary-sidebar',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <aside class="summary-panel">
      <h3 class="summary-title">
        <span class="material-icons-round">receipt_long</span>
        تفاصيل الطلب
      </h3>

      <!-- Makkah Hotels -->
      <details class="summary-section" open>
        <summary class="section-header">
          <span class="section-icon material-icons-round">apartment</span>
          <span class="section-label">إقامة مكة</span>
          <span class="section-count">{{ summary.makkahHotels.length }}</span>
          <span class="material-icons-round chevron">expand_more</span>
        </summary>
        <div class="section-body">
          @if (summary.makkahHotels.length === 0) {
            <p class="no-items">{{ 'packageDefinition.summary.noHotels' | translate }}</p>
          } @else {
            @for (hotel of summary.makkahHotels; track hotel.id) {
              <div class="hotel-card">
                <div class="hotel-card-row">
                  <span class="material-icons-round hotel-icon">bed</span>
                  <div class="hotel-info">
                    <span class="hotel-name">
                      {{ hotel.mode === 'specific' ? hotel.hotelName : hotel.category }}
                    </span>
                    <span class="hotel-meta">
                      <span>{{ hotel.roomType }}</span>
                      <span>&bull;</span>
                      <span>{{ hotel.roomCount }} {{ 'packageDefinition.summary.rooms' | translate }}</span>
                      <span>&bull;</span>
                      <span>{{ hotel.nightsCount }} {{ 'packageDefinition.summary.nights' | translate }}</span>
                    </span>
                  </div>
                  <span class="mode-badge" [class.specific]="hotel.mode === 'specific'">
                    {{ (hotel.mode === 'specific'
                        ? 'packageDefinition.summary.specific'
                        : 'packageDefinition.summary.criteria') | translate }}
                  </span>
                </div>
              </div>
            }
          }
        </div>
      </details>

      <!-- Madinah Hotels -->
      <details class="summary-section" open>
        <summary class="section-header">
          <span class="section-icon material-icons-round">apartment</span>
          <span class="section-label">إقامة المدينة</span>
          <span class="section-count">{{ summary.madinahHotels.length }}</span>
          <span class="material-icons-round chevron">expand_more</span>
        </summary>
        <div class="section-body">
          @if (summary.madinahHotels.length === 0) {
            <p class="no-items">{{ 'packageDefinition.summary.noHotels' | translate }}</p>
          } @else {
            @for (hotel of summary.madinahHotels; track hotel.id) {
              <div class="hotel-card">
                <div class="hotel-card-row">
                  <span class="material-icons-round hotel-icon">bed</span>
                  <div class="hotel-info">
                    <span class="hotel-name">
                      {{ hotel.mode === 'specific' ? hotel.hotelName : hotel.category }}
                    </span>
                    <span class="hotel-meta">
                      <span>{{ hotel.roomType }}</span>
                      <span>&bull;</span>
                      <span>{{ hotel.roomCount }} {{ 'packageDefinition.summary.rooms' | translate }}</span>
                      <span>&bull;</span>
                      <span>{{ hotel.nightsCount }} {{ 'packageDefinition.summary.nights' | translate }}</span>
                    </span>
                  </div>
                  <span class="mode-badge" [class.specific]="hotel.mode === 'specific'">
                    {{ (hotel.mode === 'specific'
                        ? 'packageDefinition.summary.specific'
                        : 'packageDefinition.summary.criteria') | translate }}
                  </span>
                </div>
              </div>
            }
          }
        </div>
      </details>

      <!-- Services -->
      <details class="summary-section" open>
        <summary class="section-header">
          <span class="section-icon material-icons-round">miscellaneous_services</span>
          <span class="section-label">الخدمات</span>
          <span class="section-count">{{ activeServicesCount }}/3</span>
          <span class="material-icons-round chevron">expand_more</span>
        </summary>
        <div class="section-body services-list">
          @for (service of services; track service.label) {
            <div class="hotel-card service-card" [class.is-active]="service.active">
              <div class="hotel-card-row">
                <span class="material-icons-round hotel-icon">{{ service.icon }}</span>
                <div class="hotel-info">
                  <span class="hotel-name">{{ service.label }}</span>
                  <span class="hotel-meta">
                    {{ service.active ? service.addedText : service.emptyText }}
                  </span>
                </div>
                <span class="mode-badge" [class.specific]="service.active">
                  {{ service.active ? 'مضاف' : 'غير مضاف' }}
                </span>
              </div>
            </div>
          }
        </div>
      </details>

      <div class="meta-section">
        <div class="meta-row">
          <div class="meta-label-wrap">
            <span class="material-icons-round meta-icon">event</span>
            <span class="meta-label">{{ 'packageDefinition.summary.validDates' | translate }}</span>
          </div>
          <span class="meta-value">{{ 'packageDefinition.summary.notSpecified' | translate }}</span>
        </div>

        <div class="meta-row">
          <div class="meta-label-wrap">
            <span class="material-icons-round meta-icon">verified_user</span>
            <span class="meta-label">{{ 'packageDefinition.summary.visaService' | translate }}</span>
          </div>
          <span class="meta-value">{{ 'packageDefinition.summary.notIncluded' | translate }}</span>
        </div>
      </div>

      <div class="help-card">
        <div class="help-title-row">
          <span class="material-icons-round help-icon">support_agent</span>
          <span class="help-title">{{ 'packageDefinition.summary.needHelp' | translate }}</span>
        </div>
        <p class="help-text">{{ 'packageDefinition.summary.helpText' | translate }}</p>
        <button type="button" class="help-btn">{{ 'packageDefinition.summary.needHelp' | translate }}</button>
      </div>
    </aside>
  `,
  styles: [`
    .summary-panel {
      background: var(--sero-surface);
      border: 1px solid var(--sero-border);
      border-radius: 14px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      position: sticky;
      top: calc(var(--sero-topbar-height, 64px) + 16px);
    }

    .summary-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 1rem;
      font-weight: 700;
      color: var(--sero-text);
      margin: 0 0 12px;
      padding-bottom: 12px;
      border-bottom: 1px solid var(--sero-border);
    }

    .summary-title .material-icons-round { font-size: 20px; color: var(--sero-primary); }

    .summary-section {
      border: 1px solid var(--sero-border);
      border-radius: 10px;
      overflow: hidden;
      background: var(--sero-card-bg);
    }

    .summary-section + .summary-section { margin-top: 8px; }

    .meta-section {
      margin-top: 10px;
      border: 1px solid var(--sero-border);
      border-radius: 10px;
      background: var(--sero-card-bg);
      padding: 10px 12px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .meta-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .meta-label-wrap {
      display: inline-flex;
      align-items: center;
      gap: 7px;
      min-width: 0;
      color: var(--sero-text-secondary);
      font-size: 0.79rem;
      font-weight: 600;
    }

    .meta-icon {
      font-size: 17px;
      color: var(--sero-primary);
      flex-shrink: 0;
    }

    .meta-value {
      font-size: 0.76rem;
      font-weight: 700;
      color: var(--sero-text-primary);
      background: var(--sero-surface-2);
      border: 1px solid var(--sero-border-light);
      border-radius: 999px;
      padding: 2px 9px;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .help-card {
      margin-top: 10px;
      border: 1px solid var(--sero-primary-100);
      border-radius: 10px;
      background: var(--sero-primary-50);
      padding: 11px 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .help-title-row {
      display: inline-flex;
      align-items: center;
      gap: 7px;
    }

    .help-icon {
      font-size: 17px;
      color: var(--sero-primary);
    }

    .help-title {
      font-size: 0.81rem;
      font-weight: 800;
      color: var(--sero-primary-dark);
    }

    .help-text {
      margin: 0;
      font-size: 0.76rem;
      line-height: 1.6;
      color: var(--sero-text-secondary);
    }

    .help-btn {
      align-self: flex-start;
      border: 1px solid var(--sero-primary-100);
      background: #fff;
      color: var(--sero-primary-dark);
      border-radius: 8px;
      font-size: 0.76rem;
      font-weight: 700;
      padding: 6px 10px;
      cursor: pointer;
      transition: background var(--t-fast), border-color var(--t-fast);
    }

    .help-btn:hover {
      background: var(--sero-surface-2);
      border-color: var(--sero-primary);
    }

    .section-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 14px;
      cursor: pointer;
      list-style: none;
      background: color-mix(in srgb, var(--sero-primary) 4%, transparent);
      user-select: none;
      transition: background var(--t-fast);
    }
    .section-header:hover { background: color-mix(in srgb, var(--sero-primary) 8%, transparent); }

    .section-header::-webkit-details-marker { display: none; }

    .section-icon { font-size: 18px; color: var(--sero-primary); }

    .section-label {
      flex: 1;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--sero-text);
    }

    .section-count {
      font-size: 0.75rem;
      font-weight: 700;
      background: var(--sero-primary);
      color: #fff;
      border-radius: 999px;
      padding: 1px 8px;
      min-width: 22px;
      text-align: center;
      flex-shrink: 0;
    }

    .chevron {
      font-size: 18px;
      color: var(--sero-text-secondary);
      transition: transform 0.2s;
    }

    details[open] .chevron { transform: rotate(180deg); }

    .section-body {
      padding: 10px 14px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .no-items {
      font-size: 0.8125rem;
      color: var(--sero-text-secondary);
      text-align: center;
      padding: 8px 0;
      margin: 0;
    }

    .hotel-card {
      background: var(--sero-app-bg);
      border: 1px solid var(--sero-border);
      border-radius: 8px;
      padding: 10px 12px;
    }

    .hotel-card-row {
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }

    .hotel-icon { font-size: 18px; color: var(--sero-text-secondary); margin-top: 1px; }

    .hotel-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .hotel-name {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--sero-text);
    }

    .hotel-meta {
      font-size: 0.75rem;
      color: var(--sero-text-secondary);
      display: inline-flex;
      align-items: center;
      gap: 4px;
      flex-wrap: wrap;
    }

    .mode-badge {
      font-size: 0.6875rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 999px;
      background: color-mix(in srgb, var(--sero-primary) 12%, transparent);
      color: var(--sero-primary);
      white-space: nowrap;
    }

    .mode-badge.specific {
      background: color-mix(in srgb, #8b5cf6 12%, transparent);
      color: #8b5cf6;
    }

    .services-list { gap: 6px; }

    .service-card {
      border-color: var(--sero-border-light);
      background: color-mix(in srgb, var(--sero-app-bg) 88%, #fff);
    }

    .service-card.is-active {
      border-color: color-mix(in srgb, var(--sero-primary) 28%, var(--sero-border));
      background: color-mix(in srgb, var(--sero-primary) 5%, #fff);
    }
  `]
})
export class OrderSummarySidebarComponent {
  @Input() summary: OrderSummary = {
    makkahHotels: [],
    madinahHotels: [],
    hasTransport: false,
    hasMeals: false,
    hasTickets: false,
  };

  get activeServicesCount(): number {
    return this.services.filter((service) => service.active).length;
  }

  get services(): Array<{ label: string; icon: string; active: boolean; emptyText: string; addedText: string }> {
    return [
      { label: 'النقل', icon: 'airport_shuttle', active: this.summary.hasTransport, emptyText: 'لم تتم إضافة نقل', addedText: 'تمت إضافة نقل' },
      { label: 'وجبات', icon: 'restaurant', active: this.summary.hasMeals, emptyText: 'لم تتم إضافة خطط وجبات', addedText: 'تمت إضافة خطط وجبات' },
      { label: 'تذاكر', icon: 'flight', active: this.summary.hasTickets, emptyText: 'لم تتم إضافة تذاكر', addedText: 'تمت إضافة تذاكر' }
    ];
  }
}
