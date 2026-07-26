import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { SeroCurrencyPipe } from 'src/app/shared/pipes/sero-currency.pipe';
import { OfferStatus, OfferType, PriceOfferItem } from '../statistics.mock';

@Component({
  selector: 'app-price-offers-table',
  standalone: true,
  imports: [CommonModule, SeroCurrencyPipe],
  template: `
    <section class="panel">
      <header class="panel-head">
        <div>
          <h3>أحدث عروض الأسعار</h3>
          <p>آخر 5 عروض أسعار</p>
        </div>
      </header>

      <div class="table-wrap">
        <table class="offers-table">
          <thead>
            <tr>
              <th>النوع</th>
              <th>رقم الطلب</th>
              <th>رمز العرض</th>
              <th>التاريخ</th>
              <th>السعر</th>
              <th>حالة الإدارة</th>
              <th>حالة الوكيل</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            @for (offer of offers; track offer.offerCode) {
              <tr>
                <td>
                  <div class="type-wrap">
                    <span class="type-icon" [class]="typeClass(offer.type)">
                      <span class="material-icons-round">{{ typeIcon(offer.type) }}</span>
                    </span>
                    <span class="type-badge" [class]="typeClass(offer.type)">{{ typeLabel(offer.type) }}</span>
                  </div>
                </td>
                <td>{{ offer.orderNumber }}</td>
                <td>{{ offer.offerCode }}</td>
                <td>{{ offer.date }}</td>
                <td class="price-col">{{ offer.price | seroCurrency:'symbol':'':0:0 }}</td>
                <td><span class="status-badge" [class]="statusClass(offer.adminStatus)">{{ offer.adminStatus }}</span></td>
                <td><span class="status-badge" [class]="statusClass(offer.agentStatus)">{{ offer.agentStatus }}</span></td>
                <td>
                  <div class="actions">
                    <button class="action-menu-btn" type="button">
                      <span>الإجراءات</span>
                      <span class="material-icons-round">expand_more</span>
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </section>
  `,
  styles: [`
    .panel {
      background: var(--sero-card-bg);
      border: 1px solid var(--sero-border-light);
      border-radius: 12px;
      box-shadow: var(--shadow-sm);
      padding: 14px;
      margin-top: 0;
      height: 100%;
    }
    .panel-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;
    }
    .panel-head h3 { font-size: 0.95rem; font-weight: 800; color: var(--sero-text-primary); }
    .panel-head p { font-size: 0.75rem; color: var(--sero-text-muted); margin-top: 2px; }
    .table-wrap { margin-top: 12px; overflow-x: auto; }
    .actions { display: flex; align-items: center; gap: 6px; }

    .offers-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 760px;
    }

    .offers-table thead tr {
      border-bottom: 1px solid var(--sero-border-light);
      background: #fff;
    }

    .offers-table th {
      font-size: 0.66rem;
      color: var(--sero-text-muted);
      font-weight: 700;
      text-align: center;
      padding: 0 10px 10px;
      white-space: nowrap;
    }

    .offers-table td {
      font-size: 0.72rem;
      color: var(--sero-text-primary);
      text-align: center;
      padding: 12px 10px;
      border-bottom: 1px solid var(--sero-border-light);
      white-space: nowrap;
    }

    .offers-table tbody tr:last-child td {
      border-bottom: none;
    }

    .type-badge, .status-badge {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      font-size: 0.62rem;
      font-weight: 700;
      padding: 2px 7px;
      white-space: nowrap;
    }
    .t-hotel { background: #eaf3ff; color: #1d4ed8; }
    .t-food { background: #fff5e9; color: #ea580c; }
    .t-ticket { background: #f3e8ff; color: #7e22ce; }
    .t-trip { background: #edfdfa; color: #0f766e; }

    .s-approved { background: var(--sero-success-bg); color: var(--sero-success); }
    .s-need { background: var(--sero-warning-bg); color: var(--sero-warning); }
    .s-progress { background: var(--sero-info-bg); color: var(--sero-info); }

    .type-wrap {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .type-icon {
      width: 20px;
      height: 20px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    .type-icon .material-icons-round { font-size: 12px; }
    .type-icon.t-hotel { background: #eaf3ff; color: #1d4ed8; }
    .type-icon.t-food { background: #fff5e9; color: #ea580c; }
    .type-icon.t-ticket { background: #f3e8ff; color: #7e22ce; }
    .type-icon.t-trip { background: #edfdfa; color: #0f766e; }

    .price-col { font-weight: 700; color: var(--sero-text-primary); }
    .price-col span { font-weight: 600; color: var(--sero-text-muted); font-size: 0.68rem; }

    .action-menu-btn {
      border: 1px solid var(--sero-border);
      background: #fff;
      border-radius: 8px;
      min-height: 26px;
      padding: 0 8px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.66rem;
      font-weight: 700;
      color: var(--sero-text-secondary);
      cursor: pointer;
      transition: all var(--t-fast);
    }
    .action-menu-btn .material-icons-round { font-size: 14px; }
    .action-menu-btn:hover { border-color: var(--sero-border-strong); color: var(--sero-primary-dark); }
  `]
})
export class PriceOffersTableComponent {
  @Input({ required: true }) offers: PriceOfferItem[] = [];

  typeLabel(type: OfferType): string {
    if (type === 'hotel') return 'فندق';
    if (type === 'food') return 'طعام';
    if (type === 'ticket') return 'تذكرة';
    return 'رحلة';
  }

  typeClass(type: OfferType): string {
    return `t-${type}`;
  }

  typeIcon(type: OfferType): string {
    if (type === 'hotel') return 'apartment';
    if (type === 'food') return 'restaurant';
    if (type === 'ticket') return 'confirmation_number';
    return 'travel_explore';
  }

  statusClass(status: OfferStatus): string {
    if (status === 'Finance Approved') return 's-approved';
    if (status === 'Need Approval') return 's-need';
    return 's-progress';
  }
}
