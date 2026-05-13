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
        <div>
          <h3>أحدث الطلبات</h3>
          <p>آخر 5 طلبات باقات</p>
        </div>
        <a href="javascript:void(0)" class="show-all-link">عرض الكل</a>
      </header>

      <div class="orders-list">
        @for (order of orders; track order.id) {
          <article class="order-item">
            <div class="order-id-box">
              <span class="order-id">{{ order.id }}</span>
              <span class="material-icons-round order-mini-icon">apartment</span>
            </div>

            <div class="order-content">
              <div class="order-row-head">
                <div class="order-name">{{ order.title }}</div>
                <span class="order-tag" [class]="tagClass(order.tag)">{{ order.tag }}</span>
              </div>
              <div class="order-sub">{{ order.subValue }}</div>
              <div class="order-meta">
                <span>{{ order.timeAgo }}</span>
                <span class="dot"></span>
                <span>{{ order.travelers }}</span>
              </div>
            </div>
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
      height: 100%;
    }

    .panel-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
    }
    .panel-head h3 { font-size: 0.95rem; font-weight: 800; color: var(--sero-text-primary); }
    .panel-head p { font-size: 0.75rem; color: var(--sero-text-muted); margin-top: 2px; }
    .show-all-link {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--sero-text-secondary);
      text-decoration: none;
    }
    .show-all-link:hover { color: var(--sero-primary-dark); }
    .orders-list { display: flex; flex-direction: column; gap: 9px; margin-top: 12px; }

    .order-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      border: 1px solid var(--sero-border-light);
      border-radius: 8px;
      padding: 8px;
      background: #fff;
      transition: background var(--t-fast), border-color var(--t-fast);
    }

    .order-item:hover { background: var(--sero-surface-2); border-color: var(--sero-border); }

    .order-id-box {
      min-width: 38px;
      padding: 5px 4px;
      border-radius: 6px;
      background: var(--sero-primary-50);
      color: var(--sero-primary-dark);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      line-height: 1;
    }
    .order-content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .order-row-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .order-id { font-size: 0.78rem; font-weight: 800; color: var(--sero-primary-dark); }
    .order-mini-icon { font-size: 12px; color: var(--sero-primary); }
    .order-name { font-size: 0.8rem; font-weight: 700; color: var(--sero-text-primary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .order-sub { font-size: 0.75rem; font-weight: 600; color: var(--sero-text-secondary); }
    .order-meta {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.68rem;
      color: var(--sero-text-muted);
    }
    .dot {
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: var(--sero-border-strong);
      display: inline-block;
    }
    .order-tag {
      display: inline-flex;
      align-items: center;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 0.62rem;
      font-weight: 800;
      letter-spacing: 0.02em;
      flex-shrink: 0;
    }
    .tag-new { background: #ecf4ff; color: #2563eb; }
    .tag-progress { background: #fff4e5; color: #d97706; }
  `]
})
export class LatestOrdersComponent {
  @Input({ required: true }) orders: LatestOrderItem[] = [];

  tagClass(tag: LatestOrderItem['tag']): string {
    return tag === 'New' ? 'tag-new' : 'tag-progress';
  }
}
