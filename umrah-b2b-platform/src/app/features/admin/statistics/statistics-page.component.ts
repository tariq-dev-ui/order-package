import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LatestOrdersComponent } from './components/latest-orders.component';
import { PriceOffersTableComponent } from './components/price-offers-table.component';
import { QuickActionCardComponent } from './components/quick-action-card.component';
import { StatCardComponent } from './components/stat-card.component';
import { LATEST_ORDERS, LATEST_PRICE_OFFERS, QUICK_ACTIONS, SUMMARY_ITEMS } from './statistics.mock';

@Component({
  selector: 'app-statistics-page',
  standalone: true,
  imports: [
    CommonModule,
    StatCardComponent,
    QuickActionCardComponent,
    LatestOrdersComponent,
    PriceOffersTableComponent
  ],
  template: `
    <section class="stats-page" dir="rtl">
      <div class="stats-grid">
        @for (item of summaryItems; track item.title) {
          <app-stat-card [item]="item"></app-stat-card>
        }
      </div>

      <section class="panel quick-actions">
        <header class="panel-head">
          <h3>إجراءات سريعة</h3>
        </header>
        <div class="actions-grid">
          @for (action of quickActions; track action.title) {
            <app-quick-action-card [item]="action"></app-quick-action-card>
          }
        </div>
      </section>

      <app-latest-orders [orders]="latestOrders"></app-latest-orders>
      <app-price-offers-table [offers]="latestPriceOffers"></app-price-offers-table>
    </section>
  `,
  styles: [`
    .stats-page {
      display: flex;
      flex-direction: column;
      gap: 14px;
      background: #fff;
      min-height: calc(100vh - var(--sero-topbar-height) - 32px);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 12px;
    }

    .panel {
      background: var(--sero-card-bg);
      border: 1px solid var(--sero-border-light);
      border-radius: 12px;
      box-shadow: var(--shadow-sm);
      padding: 14px;
    }

    .panel-head h3 {
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--sero-text-primary);
    }

    .actions-grid {
      margin-top: 10px;
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px;
    }

    @media (max-width: 1100px) {
      .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .actions-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    @media (max-width: 650px) {
      .stats-grid,
      .actions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class StatisticsPageComponent {
  readonly summaryItems = SUMMARY_ITEMS;
  readonly quickActions = QUICK_ACTIONS;
  readonly latestOrders = LATEST_ORDERS;
  readonly latestPriceOffers = LATEST_PRICE_OFFERS;
}
