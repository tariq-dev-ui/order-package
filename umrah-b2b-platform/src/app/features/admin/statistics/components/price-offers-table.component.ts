import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { OfferStatus, OfferType, PriceOfferItem } from '../statistics.mock';

@Component({
  selector: 'app-price-offers-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="panel">
      <header class="panel-head">
        <h3>أحدث عروض الأسعار</h3>
        <p>آخر 5 عروض أسعار</p>
      </header>

      <div class="table-wrap">
        <table class="data-table">
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
                <td><span class="type-badge" [class]="typeClass(offer.type)">{{ typeLabel(offer.type) }}</span></td>
                <td>{{ offer.orderNumber }}</td>
                <td>{{ offer.offerCode }}</td>
                <td>{{ offer.date }}</td>
                <td>{{ offer.price | number:'1.0-0' }} ر.س</td>
                <td><span class="status-badge" [class]="statusClass(offer.adminStatus)">{{ offer.adminStatus }}</span></td>
                <td><span class="status-badge" [class]="statusClass(offer.agentStatus)">{{ offer.agentStatus }}</span></td>
                <td>
                  <div class="actions">
                    <button class="btn-action btn-view" type="button"><span class="material-icons-round">visibility</span></button>
                    <button class="btn-action btn-edit" type="button"><span class="material-icons-round">edit</span></button>
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
      margin-top: 14px;
    }
    .panel-head h3 { font-size: 0.95rem; font-weight: 800; color: var(--sero-text-primary); }
    .panel-head p { font-size: 0.75rem; color: var(--sero-text-muted); margin-top: 2px; }
    .table-wrap { margin-top: 12px; overflow-x: auto; }
    .actions { display: flex; align-items: center; gap: 6px; }

    .type-badge, .status-badge {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      font-size: 0.66rem;
      font-weight: 700;
      padding: 2px 8px;
      white-space: nowrap;
    }
    .t-hotel { background: #ecf4ff; color: #1d4ed8; }
    .t-food { background: #fff7ed; color: #c2410c; }
    .t-ticket { background: #f3e8ff; color: #7e22ce; }
    .t-trip { background: #ecfeff; color: #0e7490; }

    .s-approved { background: var(--sero-success-bg); color: var(--sero-success); }
    .s-need { background: var(--sero-warning-bg); color: var(--sero-warning); }
    .s-progress { background: var(--sero-info-bg); color: var(--sero-info); }
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

  statusClass(status: OfferStatus): string {
    if (status === 'Finance Approved') return 's-approved';
    if (status === 'Need Approval') return 's-need';
    return 's-progress';
  }
}
