import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AgentOrdersService } from '../../../core/services/agent-orders.service';
import { PackageOrder } from '../../../core/models/package-order.model';

@Component({
  selector: 'app-agent-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="orders-page animate-fade-in">
      <div class="page-header">
        <div>
          <h2>طلبات العملاء</h2>
          <p>عرض كل الطلبات المنشأة من تدفق إنشاء الباقة</p>
        </div>
      </div>

      <div class="card">
        <div class="card-body table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Package Summary</th>
                <th>Visibility</th>
                <th>Makkah</th>
                <th>Madinah</th>
                <th>Transport</th>
                <th>Tickets</th>
                <th>Food</th>
                <th>Other</th>
                <th>Total</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              @for (order of orders; track order.id) {
                <tr>
                  <td>{{ order.orderNumber }}</td>
                  <td>{{ order.customerInfo.name }}</td>
                  <td>{{ order.packageSummary }}</td>
                  <td>{{ formatVisibility(order) }}</td>
                  <td>{{ summarize(order.makkahHotel.map(h => h.name)) }}</td>
                  <td>{{ summarize(order.madinahHotel.map(h => h.name)) }}</td>
                  <td>{{ summarize(order.transport.map(t => t.route)) }}</td>
                  <td>{{ summarize(order.tickets.map(t => t.flightNumber || t.airline)) }}</td>
                  <td>{{ summarize(order.food.map(f => f.provider)) }}</td>
                  <td>{{ summarize(order.otherServices.map(s => s.name)) }}</td>
                  <td>{{ order.pricing.totalPrice | number:'1.0-0' }} {{ order.pricing.currency }}</td>
                  <td><span class="badge badge--olive">{{ order.status }}</span></td>
                  <td>{{ order.createdAt | date:'medium' }}</td>
                  <td>
                    <a class="btn btn--secondary btn--sm" [routerLink]="['/agent/orders', order.id]">View</a>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="14" class="empty-cell">لا توجد طلبات حتى الآن</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .orders-page { display: flex; flex-direction: column; gap: 14px; }
    .page-header h2 { font-size: 1.35rem; margin-bottom: 4px; }
    .page-header p { color: var(--sero-text-secondary); }
    .table-wrap { overflow-x: auto; }
    .empty-cell { text-align: center; color: var(--sero-text-muted); padding: 20px; }
  `]
})
export class AgentOrdersComponent implements OnInit {
  orders: PackageOrder[] = [];

  constructor(private readonly service: AgentOrdersService) {}

  ngOnInit(): void {
    this.service.getOrders().subscribe((orders) => {
      this.orders = orders;
    });
  }

  summarize(items: string[]): string {
    if (!items.length) {
      return '-';
    }

    const sliced = items.slice(0, 2).join(', ');
    return items.length > 2 ? `${sliced}...` : sliced;
  }

  formatVisibility(order: PackageOrder): string {
    if (order.visibilityType === 'private') {
      return order.selectedAgent?.name
        ? `Private (${order.selectedAgent.name})`
        : 'Private (No agent)';
    }
    return 'Shared';
  }
}
