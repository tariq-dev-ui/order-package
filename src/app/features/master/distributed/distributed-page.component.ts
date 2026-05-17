import {
  Component, ChangeDetectionStrategy, inject, signal,
  OnInit, OnDestroy, computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardRequestModel, DashboardVoucherDetailsModel, DropdownAction } from './distributed-dashboard.model';
import { DistributedDashboardService } from './distributed-dashboard.service';
import { DashVoucherTableComponent } from './components/voucher-table.component';

@Component({
  selector: 'app-distributed-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, DashVoucherTableComponent],
  template: `
    <!-- Quick Actions -->
    <div class="dash-card mb-8">
      <h2 class="dash-section-title">Quick Actions</h2>
      <div class="quick-actions-grid">
        <a href="/agent/marketplace"
          class="quick-action-card quick-action-card--yellow">
          <div class="quick-action-icon quick-action-icon--yellow">
            <span class="material-icons-round">star</span>
          </div>
          <p class="quick-action-label">Packages For You</p>
        </a>
        <a href="/agent/marketplace"
          class="quick-action-card quick-action-card--primary">
          <div class="quick-action-icon quick-action-icon--primary">
            <span class="material-icons-round">add</span>
          </div>
          <p class="quick-action-label">Create Your Own Package</p>
        </a>
        <a href="/agent/orders"
          class="quick-action-card quick-action-card--purple">
          <div class="quick-action-icon quick-action-icon--purple">
            <span class="material-icons-round">hotel</span>
          </div>
          <p class="quick-action-label">Your Orders</p>
        </a>
        <a href="#"
          class="quick-action-card quick-action-card--green">
          <div class="quick-action-icon quick-action-icon--green">
            <span class="material-icons-round">chat</span>
          </div>
          <p class="quick-action-label">Contact Your Account Manager</p>
        </a>
      </div>
    </div>

    <!-- Recent Quotations -->
    <div class="dash-card mb-8" style="position: relative;">
      <div class="dash-card-header">
        <div>
          <h2 class="dash-section-title">Recent Quotations</h2>
          <p class="dash-section-sub">Your Recent 5 Quotations of Orders</p>
        </div>
        <a routerLink="/agent/orders" class="view-all-link">
          View All
          <span class="material-icons-round" style="font-size:14px;margin-left:4px">arrow_forward</span>
        </a>
      </div>

      @if (isLoadingVoucher()) {
        <div class="loading-overlay">
          <div class="spinner"></div>
          <p class="loading-msg">Loading recent quotations...</p>
        </div>
      }

      <app-dash-voucher-table
        [vouchers]="voucherDetails()"
        [voucherActionsList]="voucherActionsList"
        (refreshVouchers)="onRefreshVouchers()">
      </app-dash-voucher-table>
    </div>

    <!-- Recent Orders -->
    <div class="dash-card" style="position: relative;">
      <div class="dash-card-header">
        <div>
          <h2 class="dash-section-title">Recent Orders</h2>
          <p class="dash-section-sub">Your last 5 package requests</p>
        </div>
        <a routerLink="/agent/orders" class="view-all-link">
          View All
          <span class="material-icons-round" style="font-size:14px;margin-left:4px">arrow_forward</span>
        </a>
      </div>

      @if (isLoading()) {
        <div class="loading-overlay">
          <div class="spinner"></div>
          <p class="loading-msg">Loading recent orders...</p>
        </div>
      }

      <div class="orders-list">
        @for (pkg of packageRequests(); track $index) {
          <div class="order-card" [class]="getStatusHoverClass(pkg.StatusName)">
            <div class="order-id-badge">
              <span>{{ pkg.Id }}</span>
              <span class="material-icons-round" style="font-size:14px">luggage</span>
            </div>

            <div class="order-body">
              <div class="order-row-top">
                <p class="order-title">{{ pkg.Title | titlecase }}</p>
                <span class="order-price">
                  @if ((pkg.Price ?? 0) !== 0) {
                    {{ pkg.Price }}
                    <span class="sar-symbol">R</span>
                  } @else {
                    <span class="order-estimating">Estimating</span>
                  }
                </span>
              </div>

              <div class="order-meta">
                <span>
                  @if (getTimeAgo(pkg.AddedDate).days === 0) {
                    @if (getTimeAgo(pkg.AddedDate).hours === 0) {
                      1 Hours Ago
                    } @else {
                      {{ getTimeAgo(pkg.AddedDate).hours }} Hours Ago
                    }
                  } @else {
                    {{ getTimeAgo(pkg.AddedDate).days }} Days Ago
                  }
                </span>
                <span>{{ pkg.PassengerCount }} Guests</span>
                <span>{{ pkg.StatusName }}</span>
              </div>

              @if (pkg.StatusName === 'In Progress') {
                <div class="order-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width]="getProgressPercentage(pkg)"></div>
                  </div>
                  <p class="progress-label">{{ getProgressPercentage(pkg) }} Complete</p>
                </div>
              }
            </div>
          </div>
        }

        @if (packageRequests().length === 0) {
          <div class="orders-empty">
            <div class="empty-icon">
              <span class="material-icons-round" style="font-size:32px;color:#9ca3af">luggage</span>
            </div>
            <p class="empty-text">No recent orders found</p>
            <a href="/agent/marketplace" class="empty-link">
              Browse packages
              <span class="material-icons-round" style="font-size:12px;margin-left:4px">arrow_forward</span>
            </a>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }

    /* ── Cards ─────────────────────────────────────────── */
    .dash-card {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 24px;
    }
    .mb-8 { margin-bottom: 32px; }

    .dash-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
    }

    .dash-section-title {
      font-size: 18px;
      font-weight: 700;
      color: #111827;
      margin: 0 0 4px;
    }
    .dash-section-sub {
      font-size: 13px;
      color: #6b7280;
      margin: 4px 0 0;
    }

    .view-all-link {
      display: inline-flex;
      align-items: center;
      font-size: 13px;
      font-weight: 500;
      color: var(--sero-primary, #3a472a);
      text-decoration: none;
      white-space: nowrap;
      transition: color 0.15s;
    }
    .view-all-link:hover { color: var(--sero-primary-light, #4d6038); }

    /* ── Quick Actions ─────────────────────────────────── */
    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-top: 24px;
    }
    @media (max-width: 900px) {
      .quick-actions-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 480px) {
      .quick-actions-grid { grid-template-columns: 1fr; }
    }

    .quick-action-card {
      display: block;
      padding: 16px;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      text-align: center;
      text-decoration: none;
      transition: border-color 0.15s, background 0.15s;
    }
    .quick-action-card--yellow:hover { border-color: #eab308; background: #fefce8; }
    .quick-action-card--primary:hover { border-color: var(--sero-primary, #3a472a); background: var(--sero-primary-50, #f2f4ee); }
    .quick-action-card--purple:hover { border-color: #a855f7; background: #faf5ff; }
    .quick-action-card--green:hover  { border-color: #22c55e; background: #f0fdf4; }

    .quick-action-icon {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 12px;
    }
    .quick-action-icon .material-icons-round { font-size: 20px; }
    .quick-action-icon--yellow { background: #fefce8; color: #ca8a04; }
    .quick-action-icon--primary { background: var(--sero-primary-50, #f2f4ee); color: var(--sero-primary, #3a472a); }
    .quick-action-icon--purple  { background: #faf5ff; color: #9333ea; }
    .quick-action-icon--green   { background: #f0fdf4; color: #16a34a; }

    .quick-action-label {
      font-weight: 500;
      font-size: 13px;
      color: #111827;
      margin: 0;
    }

    /* ── Loading overlay ───────────────────────────────── */
    .loading-overlay {
      position: absolute;
      inset: 0;
      background: rgba(255,255,255,.8);
      backdrop-filter: blur(2px);
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
    }
    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #f0fdf4;
      border-top-color: var(--sero-primary, #3a472a);
      border-radius: 50%;
      animation: spin 0.9s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading-msg {
      margin-top: 12px;
      font-size: 13px;
      color: var(--sero-primary, #3a472a);
      font-weight: 500;
    }

    /* ── Orders list ───────────────────────────────────── */
    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    .order-card {
      display: flex;
      gap: 8px;
      border-radius: 8px;
      padding: 6px;
      transition: background 0.12s;
      cursor: pointer;
    }
    .order-card:hover { background: #f9fafb; }
    .order-card--blue    { background: transparent; }
    .order-card--blue:hover { background: #eff6ff; }
    .order-card--primary { background: transparent; }
    .order-card--primary:hover { background: var(--sero-primary-50, #f2f4ee); }
    .order-card--yellow  { background: transparent; }
    .order-card--yellow:hover { background: #fefce8; }
    .order-card--green   { background: transparent; }
    .order-card--green:hover { background: #f0fdf4; }
    .order-card--red     { background: transparent; }
    .order-card--red:hover { background: #fef2f2; }

    .order-id-badge {
      flex-shrink: 0;
      margin-top: 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 8px 16px;
      border-radius: 4px;
      background: var(--sero-primary-50, #f2f4ee);
      color: var(--sero-primary, #3a472a);
      font-size: 13px;
      font-weight: 500;
      gap: 2px;
    }

    .order-body { flex: 1; min-width: 0; }

    .order-row-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
    }

    .order-title {
      font-weight: 500;
      color: #111827;
      margin: 0;
      font-size: 14px;
    }

    .order-price {
      font-size: 12px;
      font-weight: 700;
      color: var(--sero-primary, #3a472a);
      white-space: nowrap;
    }
    .order-estimating { color: #9ca3af; font-style: italic; font-weight: 400; }

    .order-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 8px;
      font-size: 12px;
      color: #6b7280;
    }

    .order-progress { margin-top: 8px; }
    .progress-bar {
      width: 100%;
      height: 6px;
      background: #e5e7eb;
      border-radius: 999px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: #3b82f6;
      border-radius: 999px;
      transition: width 0.3s;
    }
    .progress-label {
      font-size: 11px;
      color: #6b7280;
      margin-top: 4px;
      text-align: right;
    }

    /* Empty state */
    .orders-empty {
      text-align: center;
      padding: 32px 0;
    }
    .empty-icon {
      width: 64px;
      height: 64px;
      background: #f3f4f6;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 16px;
    }
    .empty-text { color: #6b7280; margin: 0 0 8px; font-size: 14px; }
    .empty-link {
      display: inline-flex;
      align-items: center;
      font-size: 13px;
      font-weight: 500;
      color: var(--sero-primary, #3a472a);
      text-decoration: none;
    }
    .empty-link:hover { color: var(--sero-primary-light, #4d6038); }
  `],
})
export class DistributedPageComponent implements OnInit, OnDestroy {
  private readonly service = inject(DistributedDashboardService);

  isLoading = signal(false);
  isLoadingVoucher = signal(false);

  packageRequests = signal<DashboardRequestModel[]>([]);
  vouchers = signal<DashboardVoucherDetailsModel[]>([]);

  readonly voucherDetails = computed<DashboardVoucherDetailsModel[]>(() => this.vouchers());

  readonly voucherActionsList: DropdownAction[] = [
    { label: 'View Details', value: 'voucher_details' },
    { label: 'Request Details', value: 'request_details' },
    { label: 'Agent Log', value: 'voucher_agent_log' },
    { label: 'Download Quotation PDF', value: 'download_voucher_pdf' },
    { label: 'Need Approval', value: 'voucher_status_change_approve', status: 2 },
    { label: 'Reject', value: 'voucher_status_change_reject', status: 10 },
  ];

  private loadSub: any;
  private voucherSub: any;

  ngOnInit(): void {
    this.loadPackageRequests();
    this.loadVoucherDetails();
  }

  ngOnDestroy(): void {
    this.loadSub?.unsubscribe();
    this.voucherSub?.unsubscribe();
  }

  private loadPackageRequests(): void {
    this.isLoading.set(true);
    this.loadSub = this.service.getPackageRequests().subscribe({
      next: (data) => this.packageRequests.set(data),
      complete: () => this.isLoading.set(false),
    });
  }

  loadVoucherDetails(): void {
    this.isLoadingVoucher.set(true);
    this.voucherSub = this.service.getVouchers().subscribe({
      next: (data) => this.vouchers.set(data),
      complete: () => this.isLoadingVoucher.set(false),
    });
  }

  onRefreshVouchers(): void {
    this.loadVoucherDetails();
  }

  getTimeAgo(date: Date | undefined): { days: number; hours: number } {
    const now = new Date();
    const diff = now.getTime() - new Date(date ?? now).getTime();
    return {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    };
  }

  getStatusHoverClass(status: string | undefined | null): string {
    const map: Record<string, string> = {
      'New': 'order-card--blue',
      'Confirmed': 'order-card--primary',
      'Pending': 'order-card--yellow',
      'Completed': 'order-card--green',
      'In Progress': 'order-card--blue',
      'Cancelled': 'order-card--red',
    };
    return map[status ?? ''] ?? '';
  }

  getProgressPercentage(_pkg: DashboardRequestModel): string {
    return '75%';
  }
}
