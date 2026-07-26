import { Component } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [TranslateModule],
  template: `
    <section class="orders-page">
      <h1 class="orders-title">{{ 'sidebar.nav.allOrders' | translate }}</h1>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .orders-page {
      padding: var(--sp-6, 24px);
    }

    .orders-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 800;
      color: var(--sero-text-primary);
      font-family: var(--sero-font);
    }
  `]
})
export class OrdersComponent {}
