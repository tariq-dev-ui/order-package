import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AgentOrdersService } from '../../../core/services/agent-orders.service';
import { OrderStatus, PackageOrder } from '../../../core/models/package-order.model';

@Component({
  selector: 'app-agent-order-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    @if (order) {
      <section class="details-page animate-fade-in">
        <div class="page-header">
          <div>
            <h2>Order {{ order.orderNumber }}</h2>
            <p>{{ order.customerInfo.name }} - {{ order.createdAt | date:'medium' }}</p>
          </div>
          <span class="badge badge--olive badge--lg">{{ order.status }}</span>
        </div>

        <div class="card">
          <div class="card-body details-grid">
            <div><strong>Customer:</strong> {{ order.customerInfo.name }}</div>
            <div><strong>Phone:</strong> {{ order.customerInfo.phone }}</div>
            <div><strong>Email:</strong> {{ order.customerInfo.email }}</div>
            <div><strong>Package Summary:</strong> {{ order.packageSummary }}</div>
            <div><strong>Visibility:</strong> {{ formatVisibility(order) }}</div>
            <div><strong>Makkah hotel:</strong> {{ listLabel(order.makkahHotel.map(h => h.name)) }}</div>
            <div><strong>Madinah hotel:</strong> {{ listLabel(order.madinahHotel.map(h => h.name)) }}</div>
            <div><strong>Transport:</strong> {{ listLabel(order.transport.map(t => t.route)) }}</div>
            <div><strong>Tickets:</strong> {{ listLabel(order.tickets.map(t => t.flightNumber || t.airline)) }}</div>
            <div><strong>Food:</strong> {{ listLabel(order.food.map(f => f.provider)) }}</div>
            <div><strong>Other services:</strong> {{ listLabel(order.otherServices.map(s => s.name)) }}</div>
            <div><strong>Total price:</strong> {{ order.pricing.totalPrice | number:'1.0-0' }} {{ order.pricing.currency }}</div>
          </div>
        </div>

        <div class="card">
          <div class="card-body status-actions">
            <button class="btn btn--primary" (click)="changeStatus(statuses.ACCEPTED)">Accept</button>
            <button class="btn btn--danger" (click)="changeStatus(statuses.REJECTED)">Reject</button>
            <button class="btn btn--secondary" (click)="changeStatus(statuses.REQUEST_CHANGES)">Request Changes</button>
            <button class="btn btn--gold" (click)="changeStatus(statuses.QUOTED)">Mark as Quoted</button>
          </div>
        </div>
      </section>
    } @else {
      <div class="card"><div class="card-body">Order not found.</div></div>
    }
  `,
  styles: [`
    .details-page { display: flex; flex-direction: column; gap: 12px; }
    .page-header { display: flex; justify-content: space-between; align-items: center; }
    .details-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px 16px; }
    .status-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    @media (max-width: 768px) { .details-grid { grid-template-columns: 1fr; } }
  `]
})
export class AgentOrderDetailsComponent implements OnInit {
  order: PackageOrder | undefined;
  statuses = OrderStatus;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly service: AgentOrdersService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      return;
    }

    this.service.getOrderById(id).subscribe((order) => {
      this.order = order;
    });
  }

  changeStatus(status: OrderStatus): void {
    if (!this.order) {
      return;
    }

    this.service.updateOrderStatus(this.order.id, status).subscribe((updated) => {
      this.order = updated;
    });
  }

  listLabel(values: string[]): string {
    return values.length ? values.join(', ') : '-';
  }

  formatVisibility(order: PackageOrder): string {
    if (order.visibilityType === 'private') {
      return `Private (${order.selectedAgents?.length || 0} agents)`;
    }
    return 'Shared';
  }
}
