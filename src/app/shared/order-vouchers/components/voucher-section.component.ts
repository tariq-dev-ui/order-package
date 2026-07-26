import {
  ChangeDetectionStrategy, Component, inject, input, OnInit, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestVoucherModel } from '../orders.model';
import { OrdersService } from '../orders.service';
import { VoucherTableComponent } from './voucher-table.component';

@Component({
  selector: 'voucher-section',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, VoucherTableComponent],
  template: `
    <div class="vs-wrap">
      @if (isLoading()) {
        <div class="vs-loading">
          <div class="vs-spinner"></div>
          <span>Loading vouchers...</span>
        </div>
      } @else {
        <voucher-table [vouchers]="vouchers()" [agentId]="agentId()" />
      }
    </div>
  `,
  styles: [`
    .vs-wrap { min-height: 80px; }
    .vs-loading {
      display: flex; align-items: center; justify-content: center;
      gap: 10px; padding: 32px; color: #9ca3af; font-size: 13px;
    }
    .vs-spinner {
      width: 20px; height: 20px; border: 2px solid #e5e7eb;
      border-top-color: var(--sero-primary, #3a472a);
      border-radius: 50%; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class VoucherSectionComponent implements OnInit {
  requestId = input.required<number>();
  agentId = input<number>(0);

  private readonly ordersService = inject(OrdersService);

  vouchers = signal<RequestVoucherModel[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.ordersService.getRequestVouchers(this.requestId()).subscribe({
      next: (data) => this.vouchers.set(data),
      error: () => this.vouchers.set([]),
      complete: () => this.isLoading.set(false),
    });
  }
}
