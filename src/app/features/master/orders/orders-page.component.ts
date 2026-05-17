import {
  ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RequestModel } from './orders.model';
import { OrdersService } from './orders.service';
import { OrderAccordionComponent } from './components/order-accordion.component';
import { OrderAccordionItemComponent } from './components/order-accordion-item.component';
import { VoucherSectionComponent } from './components/voucher-section.component';
import { RequestPackageDetailsComponent } from './components/request-package-details.component';
import { ChatDialogComponent } from './components/chat-dialog.component';

const AGENT_ID = 10;

@Component({
  selector: 'orders-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule, MatDialogModule,
    OrderAccordionComponent, OrderAccordionItemComponent,
    VoucherSectionComponent, RequestPackageDetailsComponent,
  ],
  template: `
    <div class="op-wrap">
      <!-- Page title -->
      <div class="op-top">
        <div class="op-title-row">
          <h1 class="op-title">My Orders</h1>
          <span class="op-count">{{ orders().length }} order(s)</span>
        </div>
        <p class="op-subtitle">Track your package requests and their associated vouchers</p>
      </div>

      <!-- Filters -->
      <div class="op-filters">
        <div class="search-wrap">
          <span class="material-icons-round search-icon">search</span>
          <input
            class="search-input"
            type="number"
            min="1"
            placeholder="Search by Request ID..."
            [value]="searchId()"
            (input)="onSearchChange($event)" />
          @if (searchId()) {
            <button class="search-clear" (click)="clearSearch()">
              <span class="material-icons-round">close</span>
            </button>
          }
        </div>
        <button class="btn-refresh" (click)="loadOrders()" [disabled]="isLoading()">
          <span class="material-icons-round" [class.spinning]="isLoading()">refresh</span>
          Refresh
        </button>
      </div>

      <!-- Loading -->
      @if (isLoading()) {
        <div class="op-loading">
          <div class="op-spinner"></div>
          <span>Loading orders...</span>
        </div>
      }

      <!-- Empty state -->
      @else if (orders().length === 0) {
        <div class="op-empty">
          <span class="material-icons-round">inbox</span>
          <h2>No Orders Found</h2>
          <p>{{ searchId() ? 'No order found with ID #' + searchId() : 'You have no orders yet.' }}</p>
        </div>
      }

      <!-- Orders list -->
      @else {
        <order-accordion>
          @for (order of orders(); track order.Id) {
            <order-accordion-item
              [request]="order"
              [unreadMessages]="0"
              (opened)="onOrderOpened($event)"
              (chatRequested)="openChat($event)">

              <!-- Package details shown when open -->
              <request-package-details [rqst]="order" />

              <!-- Voucher section only loads when accordion was opened -->
              @if (openedOrderIds().has(order.Id!)) {
                <voucher-section
                  [requestId]="order.Id!"
                  [agentId]="agentId" />
              }
            </order-accordion-item>
          }
        </order-accordion>
      }
    </div>
  `,
  styles: [`
    .op-wrap { padding: 0; display: flex; flex-direction: column; gap: 24px; }

    .op-top { }
    .op-title-row { display: flex; align-items: center; gap: 12px; margin-bottom: 4px; }
    .op-title { font-size: 22px; font-weight: 700; color: #111827; margin: 0; }
    .op-count {
      background: #f3f4f6; border: 1px solid #e5e7eb;
      border-radius: 20px; padding: 2px 10px;
      font-size: 12px; font-weight: 600; color: #6b7280;
    }
    .op-subtitle { font-size: 13px; color: #9ca3af; margin: 0; }

    .op-filters {
      display: flex; gap: 12px; align-items: center; flex-wrap: wrap;
    }
    .search-wrap {
      position: relative; display: flex; align-items: center; flex: 1; min-width: 220px; max-width: 360px;
    }
    .search-icon {
      position: absolute; left: 10px; font-size: 18px; color: #9ca3af; pointer-events: none;
    }
    .search-input {
      width: 100%; padding: 9px 36px 9px 36px; border: 1px solid #d1d5db;
      border-radius: 8px; font-size: 14px; color: #111827; box-sizing: border-box;
      transition: border-color 0.15s;
    }
    .search-input:focus { outline: none; border-color: #2d5a27; }
    /* hide browser number arrows */
    .search-input::-webkit-inner-spin-button,
    .search-input::-webkit-outer-spin-button { -webkit-appearance: none; }
    .search-input[type=number] { -moz-appearance: textfield; }

    .search-clear {
      position: absolute; right: 8px;
      background: none; border: none; cursor: pointer;
      color: #9ca3af; display: flex; align-items: center; padding: 2px;
      transition: color 0.15s;
    }
    .search-clear:hover { color: #374151; }
    .search-clear .material-icons-round { font-size: 16px; }

    .btn-refresh {
      display: inline-flex; align-items: center; gap: 6px;
      background: #fff; border: 1px solid #d1d5db; border-radius: 8px;
      padding: 9px 16px; font-size: 13px; font-weight: 600; cursor: pointer; color: #374151;
      transition: all 0.15s;
    }
    .btn-refresh:hover { background: #f9fafb; }
    .btn-refresh:disabled { opacity: .5; cursor: not-allowed; }
    .btn-refresh .material-icons-round { font-size: 16px; }
    .spinning { animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .op-loading {
      display: flex; align-items: center; justify-content: center;
      gap: 12px; padding: 60px 16px; color: #9ca3af; font-size: 14px;
    }
    .op-spinner {
      width: 28px; height: 28px; border: 3px solid #e5e7eb;
      border-top-color: #2d5a27; border-radius: 50%; animation: spin 0.8s linear infinite;
    }

    .op-empty {
      display: flex; flex-direction: column; align-items: center;
      gap: 8px; padding: 60px 16px; color: #9ca3af; text-align: center;
    }
    .op-empty .material-icons-round { font-size: 48px; color: #e5e7eb; }
    .op-empty h2 { font-size: 18px; font-weight: 600; color: #374151; margin: 0; }
    .op-empty p  { font-size: 14px; margin: 0; }
  `],
})
export class OrdersPageComponent implements OnInit, OnDestroy {
  private readonly ordersService = inject(OrdersService);
  private readonly dialog = inject(MatDialog);

  readonly agentId = AGENT_ID;

  orders = signal<RequestModel[]>([]);
  isLoading = signal(false);
  searchId = signal<number | null>(null);
  openedOrderIds = signal<Set<number>>(new Set());

  private searchTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit() { this.loadOrders(); }

  ngOnDestroy() {
    if (this.searchTimer) clearTimeout(this.searchTimer);
  }

  loadOrders() {
    this.isLoading.set(true);
    this.ordersService.getPackageRequests(this.agentId, this.searchId() ?? undefined).subscribe({
      next: (data) => this.orders.set(data),
      error: () => this.orders.set([]),
      complete: () => this.isLoading.set(false),
    });
  }

  onOrderOpened(requestId: number) {
    this.openedOrderIds.update(set => {
      const next = new Set(set);
      next.add(requestId);
      return next;
    });
  }

  onSearchChange(event: Event) {
    const val = (event.target as HTMLInputElement).value;
    const parsed = val ? parseInt(val, 10) : null;
    this.searchId.set(parsed && parsed > 0 ? parsed : null);
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.loadOrders(), 500);
  }

  clearSearch() {
    this.searchId.set(null);
    this.loadOrders();
  }

  openChat(request: RequestModel) {
    this.dialog.open(ChatDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      height: '92vh',
      maxHeight: '92vh',
      data: { request, agentId: this.agentId },
    });
  }
}
