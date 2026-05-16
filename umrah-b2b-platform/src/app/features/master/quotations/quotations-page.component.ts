import {
  ChangeDetectionStrategy, Component, computed, inject, OnInit, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { RequestVoucherModel } from '../orders/orders.model';
import { QuotationsService } from './quotations.service';
import { VoucherTableComponent } from '../orders/components/voucher-table.component';
import { PaginationComponent } from '../packages/components/pagination.component';

@Component({
  selector: 'quotations-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatDialogModule, VoucherTableComponent, PaginationComponent],
  template: `
    <div class="qp-wrap">

      <!-- Header -->
      <div class="qp-header-card">
        <div class="qp-header-inner">
          <div class="qp-header-left">
            <div class="qp-icon-box">
              <span class="material-icons-round">receipt_long</span>
            </div>
            <div>
              <h1 class="qp-title">Quotations</h1>
              <p class="qp-subtitle">All your voucher quotations in one place</p>
            </div>
          </div>
          <div class="qp-header-right">
            @if (totalCount() > 0) {
              <span class="qp-count-badge">{{ totalCount() }} total</span>
            }
            <button class="qp-refresh-btn" (click)="refresh()" [disabled]="isLoading()">
              <span class="material-icons-round" [class.spinning]="isLoading()">refresh</span>
              Refresh
            </button>
          </div>
        </div>
      </div>

      <!-- Voucher Table -->
      <div class="qp-table-card">

        @if (isLoading()) {
          <div class="qp-loading">
            <div class="qp-spinner"></div>
            <span>Loading quotations...</span>
          </div>
        }

        @if (!isLoading() && vouchers().length === 0) {
          <div class="qp-empty">
            <span class="material-icons-round">receipt_long</span>
            <h3>No quotations found</h3>
            <p>Your quotation vouchers will appear here once orders are placed.</p>
          </div>
        }

        @if (vouchers().length > 0) {
          <voucher-table [vouchers]="vouchers()" [agentId]="agentId" />
        }

        @if (showPagination()) {
          <div class="qp-pagination">
            <pkg-pagination
              [currentPage]="page()"
              [totalPages]="totalPages()"
              (pageChange)="setPage($event)" />
          </div>
        }
      </div>

    </div>
  `,
  styles: [`
    .qp-wrap { display: flex; flex-direction: column; gap: 20px; }

    .qp-header-card {
      background: #fff; border: 1px solid #e5e7eb;
      border-radius: 12px; padding: 20px 24px; box-shadow: 0 1px 3px rgba(0,0,0,.06);
    }
    .qp-header-inner { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
    .qp-header-left  { display: flex; align-items: center; gap: 16px; }
    .qp-header-right { display: flex; align-items: center; gap: 10px; }

    .qp-icon-box {
      width: 48px; height: 48px; background: #f0fdf4; color: var(--sero-primary, #3a472a);
      border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .qp-icon-box .material-icons-round { font-size: 22px; }

    .qp-title    { font-size: 20px; font-weight: 700; color: #111827; margin: 0; }
    .qp-subtitle { font-size: 13px; color: #9ca3af; margin: 4px 0 0; }

    .qp-count-badge {
      background: #f0fdf4; color: var(--sero-primary, #3a472a); border: 1px solid #bbf7d0;
      border-radius: 20px; padding: 3px 12px; font-size: 13px; font-weight: 600;
    }
    .qp-refresh-btn {
      display: inline-flex; align-items: center; gap: 6px;
      background: #fff; border: 1px solid #d1d5db; border-radius: 8px;
      padding: 8px 16px; font-size: 13px; font-weight: 600; cursor: pointer; color: #374151;
      transition: background 0.15s;
    }
    .qp-refresh-btn:hover { background: #f9fafb; }
    .qp-refresh-btn:disabled { opacity: .5; cursor: not-allowed; }
    .qp-refresh-btn .material-icons-round { font-size: 16px; }

    .spinning { animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    .qp-table-card {
      background: #fff; border: 1px solid #e5e7eb; border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,.06); overflow: hidden;
    }

    .qp-loading {
      display: flex; align-items: center; justify-content: center; gap: 12px;
      padding: 60px 16px; color: #9ca3af; font-size: 14px;
    }
    .qp-spinner {
      width: 24px; height: 24px; border: 3px solid #e5e7eb;
      border-top-color: var(--sero-primary, #3a472a); border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    .qp-empty {
      display: flex; flex-direction: column; align-items: center;
      gap: 10px; padding: 60px 16px; color: #9ca3af; text-align: center;
    }
    .qp-empty .material-icons-round { font-size: 48px; color: #e5e7eb; }
    .qp-empty h3 { font-size: 16px; font-weight: 600; color: #374151; margin: 0; }
    .qp-empty p  { font-size: 13px; margin: 0; }

    .qp-pagination {
      display: flex; justify-content: center; padding: 16px;
      border-top: 1px solid #f3f4f6;
    }
  `],
})
export class QuotationsPageComponent implements OnInit {
  private readonly quotationsService = inject(QuotationsService);

  readonly agentId = 10;
  readonly pageSize = 10;

  vouchers = signal<RequestVoucherModel[]>([]);
  isLoading = signal(false);
  page = signal(1);
  totalPages = signal(0);
  totalCount = signal(0);

  readonly showPagination = computed(() => this.totalPages() > 1);

  ngOnInit() {
    this.loadCount();
    this.loadVouchers();
  }

  setPage(newPage: number) {
    this.page.set(newPage);
    this.loadVouchers();
  }

  refresh() {
    this.loadCount();
    this.loadVouchers();
  }

  private loadVouchers() {
    this.isLoading.set(true);
    this.quotationsService.getVouchers(this.page() - 1, this.pageSize).subscribe({
      next: (data) => this.vouchers.set(data),
      error: () => this.vouchers.set([]),
      complete: () => this.isLoading.set(false),
    });
  }

  private loadCount() {
    this.quotationsService.getVouchersCount().subscribe({
      next: (count) => {
        this.totalCount.set(count ?? 0);
        const pages = Math.ceil((count ?? 0) / this.pageSize);
        this.totalPages.set(pages);
        if (pages > 0 && this.page() > pages) {
          this.page.set(pages);
          this.loadVouchers();
        }
      },
      error: () => this.totalPages.set(0),
    });
  }
}
