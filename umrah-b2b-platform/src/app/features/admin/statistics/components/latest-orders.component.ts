import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { LatestOrderItem } from '../statistics.mock';

@Component({
  selector: 'app-latest-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="panel">
      <header class="panel-head">
        <h3>أحدث الطلبات</h3>
        <p>آخر 5 طلبات باقات</p>
      </header>

      <div class="orders-list">
        @for (order of orders; track order.orderNumber) {
          <article class="order-card">
            <div class="order-main">
              <div class="order-name">{{ order.packageName }}</div>
              <div class="order-number">{{ order.orderNumber }}</div>
            </div>
            <div class="order-meta">
              <span class="order-status" [class]="statusClass(order.status)">{{ order.status }}</span>
              <span class="order-price">{{ order.price | number:'1.0-0' }} ر.س</span>
            </div>
            <div class="order-details">{{ order.details }}</div>
          </article>
        }
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
    }

    .panel-head h3 { font-size: 0.95rem; font-weight: 800; color: var(--sero-text-primary); }
    .panel-head p { font-size: 0.75rem; color: var(--sero-text-muted); margin-top: 2px; }
    .orders-list { display: flex; flex-direction: column; gap: 10px; margin-top: 12px; }

    .order-card {
      border: 1px solid var(--sero-border-light);
      border-radius: 10px;
      padding: 11px 12px;
      background: #fff;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .order-main, .order-meta { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .order-name { font-size: 0.84rem; font-weight: 700; color: var(--sero-text-primary); }
    .order-number { font-size: 0.73rem; color: var(--sero-text-muted); }
    .order-details { font-size: 0.73rem; color: var(--sero-text-secondary); }
    .order-price { font-size: 0.8rem; font-weight: 700; color: var(--sero-primary-dark); }

    .order-status {
      display: inline-flex;
      padding: 2px 9px;
      border-radius: 999px;
      font-size: 0.68rem;
      font-weight: 700;
    }
    .st-confirmed { background: var(--sero-success-bg); color: var(--sero-success); }
    .st-review { background: var(--sero-warning-bg); color: var(--sero-warning); }
    .st-new { background: var(--sero-info-bg); color: var(--sero-info); }
  `]
})
export class LatestOrdersComponent {
  @Input({ required: true }) orders: LatestOrderItem[] = [];

  statusClass(status: string): string {
    if (status === 'مؤكد') return 'st-confirmed';
    if (status === 'قيد المراجعة') return 'st-review';
    return 'st-new';
  }
}
