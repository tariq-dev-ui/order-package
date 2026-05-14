import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { SeroDropdownComponent } from '../../../shared/components/sero-dropdown/sero-dropdown.component';
import { RfqHotelFilterState, RfqHotelModel, RfqHotelSubscriptionType } from './rfq-hotel.model';
import { RFQ_CITY_OPTIONS, RFQ_HOTEL_DEFAULT_FILTERS, RFQ_SUBSCRIPTION_OPTIONS } from './rfq-hotels.mock';
import { RfqHotelsService } from './rfq-hotels.service';

@Component({
  selector: 'app-new-rfq-page',
  standalone: true,
  imports: [CommonModule, SeroDropdownComponent],
  template: `
    <section class="new-rfq-page" dir="rtl">
      <header class="page-head">
        <div>
          <h1>New RFQ</h1>
          <p>اختر الفندق المناسب لإنشاء طلب عرض سعر جديد.</p>
        </div>
      </header>

      <section class="surface-card filters-card" aria-label="RFQ filters">
        <div class="filters-row">
          <div class="filter-field">
            <label>City</label>
            <app-sero-dropdown
              [options]="cityOptions"
              [value]="filters.city"
              placeholder="كل المدن"
              (valueChange)="onCityChange($event)">
            </app-sero-dropdown>
          </div>

          <div class="filter-field">
            <label>Subscription type</label>
            <app-sero-dropdown
              [options]="subscriptionOptions"
              [value]="filters.subscriptionType"
              placeholder="كل أنواع الاشتراك"
              (valueChange)="onSubscriptionChange($event)">
            </app-sero-dropdown>
          </div>

          <div class="filter-actions">
            <button type="button" class="btn btn--primary" (click)="search()">بحث</button>
            <button type="button" class="btn btn--secondary" (click)="clear()">مسح</button>
          </div>
        </div>
      </section>

      <section class="surface-card table-card">
        <div class="table-wrap">
          <table class="rfq-hotels-table">
            <thead>
              <tr>
                <th>الفندق</th>
                <th>المدينة</th>
                <th>نوع الاشتراك</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              @if (filteredHotels.length === 0) {
                <tr>
                  <td colspan="4" class="empty-cell">لا توجد فنادق مطابقة لمعايير البحث</td>
                </tr>
              } @else {
                @for (hotel of filteredHotels; track hotel.id) {
                  <tr>
                    <td>
                      <div class="hotel-cell">
                        <div class="hotel-avatar" aria-hidden="true">
                          <span class="material-icons-round">hotel</span>
                        </div>
                        <div class="hotel-main">
                          <strong>{{ hotel.name }}</strong>
                          <span>{{ hotel.type }} - {{ hotel.city }} - {{ hotel.area }}</span>
                          <span class="stars" [attr.aria-label]="hotel.rating + ' stars'">{{ starsFor(hotel.rating) }}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div class="city-cell">
                        <strong>{{ hotel.city }}</strong>
                        <span>{{ hotel.country }}</span>
                        <small>{{ hotel.area }}</small>
                      </div>
                    </td>

                    <td>
                      <div class="subscription-badges">
                        @for (subscription of hotel.subscriptions; track subscription) {
                          <span
                            class="subscription-badge"
                            [class.subscription-badge--rms]="subscription === 'RMS Hotel Owner'">
                            {{ subscription }}
                          </span>
                        }
                      </div>
                    </td>

                    <td class="action-cell">
                      <button type="button" class="create-rfq-btn" (click)="openRfqPlaceholder(hotel)">
                        <span>Create RFQ</span>
                        <span class="material-icons-round">add</span>
                      </button>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </section>

      @if (selectedHotel) {
        <div class="rfq-modal-backdrop" (click)="closeRfqPlaceholder()">
          <section class="rfq-modal" role="dialog" aria-modal="true" aria-labelledby="rfq-modal-title" (click)="$event.stopPropagation()">
            <header class="rfq-modal-head">
              <div>
                <h2 id="rfq-modal-title">Create RFQ for {{ selectedHotel.name }}</h2>
                <p>{{ selectedHotel.type }} - {{ selectedHotel.city }} - {{ selectedHotel.area }}</p>
              </div>
              <button type="button" class="modal-close-btn" (click)="closeRfqPlaceholder()" aria-label="Close">
                <span class="material-icons-round">close</span>
              </button>
            </header>

            <div class="rfq-placeholder-body">
              <span class="placeholder-icon material-icons-round">request_quote</span>
              <strong>Create RFQ for {{ selectedHotel.name }}</strong>
              <p>واجهة إنشاء طلب عرض السعر ستُستكمل هنا لاحقاً. البيانات الحالية محلية فقط لغرض النموذج الأولي.</p>
            </div>

            <footer class="rfq-modal-actions">
              <button type="button" class="btn btn--primary" (click)="closeRfqPlaceholder()">إغلاق</button>
            </footer>
          </section>
        </div>
      }
    </section>
  `,
  styles: [`
    .new-rfq-page {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .page-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .page-head h1 {
      margin: 0;
      color: var(--sero-text-primary);
      font-size: 1.15rem;
      font-weight: 900;
      letter-spacing: 0;
    }

    .page-head p {
      margin: 3px 0 0;
      color: var(--sero-text-secondary);
      font-size: 0.76rem;
      font-weight: 700;
    }

    .surface-card {
      background: var(--sero-card-bg);
      border: 1px solid var(--sero-border-light);
      border-radius: 8px;
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }

    .filters-row {
      display: grid;
      grid-template-columns: minmax(220px, 1fr) minmax(240px, 1fr) auto;
      gap: 12px;
      align-items: end;
      padding: 14px;
    }

    .filter-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 0;
    }

    .filter-field label {
      color: var(--sero-text-secondary);
      font-size: 0.72rem;
      font-weight: 800;
    }

    .filter-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      justify-content: flex-start;
    }

    .btn {
      min-height: 36px;
      border: 1px solid transparent;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 0 14px;
      font-family: var(--sero-font);
      font-size: 0.78rem;
      font-weight: 900;
      cursor: pointer;
      transition: background var(--t-fast), border-color var(--t-fast), color var(--t-fast);
    }

    .btn--primary {
      background: var(--sero-primary);
      color: var(--sero-card-bg);
    }

    .btn--primary:hover {
      background: var(--sero-primary-dark);
    }

    .btn--secondary {
      background: var(--sero-card-bg);
      color: var(--sero-text-primary);
      border-color: var(--sero-border);
    }

    .btn--secondary:hover {
      background: var(--sero-surface-2);
      border-color: var(--sero-border-strong);
    }

    .table-wrap {
      overflow-x: auto;
    }

    .rfq-hotels-table {
      width: 100%;
      min-width: 920px;
      border-collapse: collapse;
    }

    .rfq-hotels-table thead tr {
      background: var(--sero-primary);
    }

    .rfq-hotels-table th {
      color: rgba(255, 255, 255, 0.94);
      font-size: 0.74rem;
      font-weight: 900;
      padding: 11px 14px;
      text-align: right;
      white-space: nowrap;
    }

    .rfq-hotels-table td {
      border-bottom: 1px solid var(--sero-border-light);
      color: var(--sero-text-primary);
      font-size: 0.8rem;
      padding: 13px 14px;
      vertical-align: middle;
    }

    .rfq-hotels-table tbody tr:hover {
      background: color-mix(in srgb, var(--sero-surface-2) 68%, var(--sero-card-bg));
    }

    .rfq-hotels-table tbody tr:last-child td {
      border-bottom: none;
    }

    .hotel-cell {
      display: grid;
      grid-template-columns: 42px minmax(0, 1fr);
      gap: 10px;
      align-items: center;
      min-width: 0;
    }

    .hotel-avatar {
      width: 42px;
      height: 42px;
      border: 1px solid var(--sero-primary-100);
      border-radius: 8px;
      background: var(--sero-primary-50);
      color: var(--sero-primary);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .hotel-avatar .material-icons-round {
      font-size: 21px;
    }

    .hotel-main,
    .city-cell {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .hotel-main strong,
    .city-cell strong {
      color: var(--sero-text-primary);
      font-size: 0.86rem;
      font-weight: 900;
      line-height: 1.35;
    }

    .hotel-main span,
    .city-cell span,
    .city-cell small {
      color: var(--sero-text-secondary);
      font-size: 0.72rem;
      font-weight: 700;
      line-height: 1.55;
    }

    .stars {
      color: var(--sero-gold);
      font-size: 0.78rem;
      letter-spacing: 0;
      line-height: 1.25;
      margin-top: 2px;
    }

    .subscription-badges {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .subscription-badge {
      display: inline-flex;
      align-items: center;
      min-height: 24px;
      border: 1px solid var(--sero-info-border);
      border-radius: 999px;
      background: var(--sero-info-bg);
      color: var(--sero-info);
      padding: 2px 9px;
      font-size: 0.68rem;
      font-weight: 900;
      white-space: nowrap;
    }

    .subscription-badge--rms {
      border-color: var(--sero-success-border);
      background: var(--sero-success-bg);
      color: var(--sero-success);
    }

    .action-cell {
      width: 150px;
      text-align: center;
      white-space: nowrap;
    }

    .create-rfq-btn {
      min-height: 34px;
      border: 1px solid var(--sero-primary);
      border-radius: 8px;
      background: var(--sero-primary);
      color: var(--sero-card-bg);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 0 12px;
      font-family: var(--sero-font);
      font-size: 0.76rem;
      font-weight: 900;
      cursor: pointer;
      transition: background var(--t-fast), border-color var(--t-fast), transform var(--t-fast), box-shadow var(--t-fast);
    }

    .create-rfq-btn:hover {
      background: var(--sero-primary-dark);
      border-color: var(--sero-primary-dark);
      box-shadow: var(--shadow-sm);
      transform: translateY(-1px);
    }

    .create-rfq-btn .material-icons-round {
      font-size: 16px;
    }

    .empty-cell {
      color: var(--sero-text-muted);
      font-weight: 800;
      padding: 26px 14px;
      text-align: center;
    }

    .rfq-modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: color-mix(in srgb, var(--sero-text-primary) 34%, transparent);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .rfq-modal {
      width: min(620px, 100%);
      border: 1px solid var(--sero-border-light);
      border-radius: 10px;
      background: var(--sero-card-bg);
      box-shadow: 0 24px 70px rgba(15, 23, 42, 0.2);
      overflow: hidden;
      animation: rfqModalIn 0.16s ease-out;
    }

    .rfq-modal-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      padding: 16px 18px;
      border-bottom: 1px solid var(--sero-border-light);
      background: color-mix(in srgb, var(--sero-surface-2) 62%, var(--sero-card-bg));
    }

    .rfq-modal-head h2 {
      margin: 0;
      color: var(--sero-text-primary);
      font-size: 0.98rem;
      font-weight: 900;
    }

    .rfq-modal-head p {
      margin: 4px 0 0;
      color: var(--sero-text-secondary);
      font-size: 0.74rem;
      font-weight: 700;
    }

    .modal-close-btn {
      width: 32px;
      height: 32px;
      border: 1px solid var(--sero-border);
      border-radius: 8px;
      background: var(--sero-card-bg);
      color: var(--sero-text-secondary);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
      transition: background var(--t-fast), border-color var(--t-fast), color var(--t-fast);
    }

    .modal-close-btn:hover {
      background: var(--sero-primary-50);
      border-color: var(--sero-primary-100);
      color: var(--sero-primary);
    }

    .modal-close-btn .material-icons-round {
      font-size: 18px;
    }

    .rfq-placeholder-body {
      padding: 28px 22px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      text-align: center;
    }

    .placeholder-icon {
      width: 46px;
      height: 46px;
      border-radius: 12px;
      background: var(--sero-primary-50);
      color: var(--sero-primary);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }

    .rfq-placeholder-body strong {
      color: var(--sero-text-primary);
      font-size: 0.92rem;
      font-weight: 900;
    }

    .rfq-placeholder-body p {
      max-width: 460px;
      margin: 0;
      color: var(--sero-text-secondary);
      font-size: 0.78rem;
      font-weight: 700;
      line-height: 1.75;
    }

    .rfq-modal-actions {
      display: flex;
      justify-content: flex-end;
      padding: 14px 18px;
      border-top: 1px solid var(--sero-border-light);
    }

    @keyframes rfqModalIn {
      from {
        opacity: 0;
        transform: translateY(8px) scale(0.985);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @media (max-width: 820px) {
      .filters-row {
        grid-template-columns: 1fr;
      }

      .filter-actions {
        flex-wrap: wrap;
      }

      .filter-actions .btn {
        flex: 1;
      }
    }
  `],
})
export class NewRfqPageComponent {
  private readonly hotelsService = inject(RfqHotelsService);

  readonly cityOptions = RFQ_CITY_OPTIONS;
  readonly subscriptionOptions = RFQ_SUBSCRIPTION_OPTIONS;

  filters: RfqHotelFilterState = { ...RFQ_HOTEL_DEFAULT_FILTERS };
  filteredHotels: RfqHotelModel[] = this.hotelsService.getAll();
  selectedHotel: RfqHotelModel | null = null;

  onCityChange(value: string): void {
    this.filters = { ...this.filters, city: value };
  }

  onSubscriptionChange(value: RfqHotelSubscriptionType | ''): void {
    this.filters = { ...this.filters, subscriptionType: value };
  }

  search(): void {
    this.filteredHotels = this.hotelsService.search(this.filters);
  }

  clear(): void {
    this.filters = { ...RFQ_HOTEL_DEFAULT_FILTERS };
    this.filteredHotels = this.hotelsService.getAll();
  }

  starsFor(rating: number): string {
    return '★'.repeat(Math.max(0, Math.min(5, rating)));
  }

  openRfqPlaceholder(hotel: RfqHotelModel): void {
    this.selectedHotel = { ...hotel, subscriptions: [...hotel.subscriptions] };
  }

  closeRfqPlaceholder(): void {
    this.selectedHotel = null;
  }

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    this.closeRfqPlaceholder();
  }
}
