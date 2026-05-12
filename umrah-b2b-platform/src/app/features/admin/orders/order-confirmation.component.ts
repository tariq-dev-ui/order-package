import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { PackageOrder } from '../../../core/models/package-order.model';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="confirm-card">
      <div class="confirm-icon">
        <span class="material-icons-round">check_circle</span>
      </div>
      <h2>تم إنشاء الطلب بنجاح</h2>
      @if (order) {
        <p>رقم الطلب: <strong>{{ order.orderNumber }}</strong></p>
      } @else {
        <p>تم حفظ الطلب بنجاح.</p>
      }
      <div class="confirm-actions">
        <a class="btn btn--secondary" routerLink="/admin/packages/builder">إنشاء طلب آخر</a>
        <a class="btn btn--primary" routerLink="/agent/orders">الذهاب إلى طلبات الوكيل</a>
      </div>
    </section>
  `,
  styles: [`
    .confirm-card {
      max-width: 620px;
      margin: 20px auto;
      background: #fff;
      border: 1px solid var(--sero-border-light);
      border-radius: 14px;
      box-shadow: var(--shadow-sm);
      text-align: center;
      padding: 34px 20px;
    }

    .confirm-icon {
      width: 68px;
      height: 68px;
      border-radius: 50%;
      margin: 0 auto 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #eaf7ee;
      color: #2f7b49;
    }

    .confirm-icon .material-icons-round { font-size: 36px; }
    h2 { margin-bottom: 8px; }
    p { color: var(--sero-text-secondary); margin-bottom: 14px; font-size: 0.95rem; }
    .confirm-actions { display: inline-flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
  `]
})
export class OrderConfirmationComponent implements OnInit {
  order: PackageOrder | undefined;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly orderService: OrderService
  ) {}

  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('orderId');
    if (!orderId) {
      return;
    }

    this.orderService.getOrderById(orderId).subscribe((order) => {
      this.order = order;
    });
  }
}
