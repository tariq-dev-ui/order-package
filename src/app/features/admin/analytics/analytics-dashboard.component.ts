import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DropdownAction } from '../../../components/actions-dropdown/actions-dropdown.component';
import { LoadingSpinnerComponent } from '../operations/components/loading-spinner/loading-spinner.component';
import { OperationVoucher } from '../operations/models/operation-voucher.model';
import { AnalyticsRequest } from './analytics.model';
import { AnalyticsService } from './analytics.service';
import { DashboardVouchersComponent } from './components/dashboard-vouchers.component';
import { SeroCurrencyPipe } from 'src/app/shared/pipes/sero-currency.pipe';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [RouterLink, CommonModule, LoadingSpinnerComponent, DashboardVouchersComponent, TranslateModule, SeroCurrencyPipe],
  templateUrl: './analytics-dashboard.component.html',
  styleUrl: './analytics-dashboard.component.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AnalyticsDashboardComponent implements OnInit {
  private readonly analyticsService = inject(AnalyticsService);
  private readonly translate = inject(TranslateService);

  readonly currentRequestsCount = signal<number | null>(null);
  readonly totalRequestsCount = signal<number | null>(null);
  readonly currentAgentsCount = signal<number | null>(null);
  readonly totalAgentCountryCount = signal<number | null>(null);
  readonly closedVouchersCount = signal<number | null>(null);
  readonly currentVouchersCount = signal<number | null>(null);
  readonly activePackagesCount = signal<number | null>(null);
  readonly totalPackagesCount = signal<number | null>(null);

  readonly packageRequests = signal<AnalyticsRequest[]>([]);
  readonly isLoading = signal(false);

  readonly typeIds = [1, 2, 3, 4];
  readonly voucherActionsList: DropdownAction[] = [
    { label: this.translate.instant('View Quotation Details'), value: 'voucher_details' },
    { label: this.translate.instant('Agent Details'), value: 'agent_details' },
    { label: this.translate.instant('Request Details'), value: 'request_details' },
    { label: this.translate.instant('Admin Log'), value: 'voucher_admin_log' },
    { label: this.translate.instant('Agent Log'), value: 'voucher_agent_log' },
    { label: this.translate.instant('Download Quotation PDF'), value: 'download_voucher_pdf' },
  ];

  readonly vouchers = signal<OperationVoucher[]>([]);
  readonly isLoadingVouchers = signal(false);

  ngOnInit(): void {
    this.loadVouchers();

    this.analyticsService.getAgentListCount().subscribe((count) => this.currentAgentsCount.set(count));
    this.analyticsService.getSeroRequestsCount({ isClosed: false }).subscribe((count) => this.currentRequestsCount.set(count));
    this.analyticsService.getSeroRequestsCount().subscribe((count) => this.totalRequestsCount.set(count));
    this.analyticsService.getPackagesCount({ includeInactive: false }).subscribe((count) => this.activePackagesCount.set(count));
    this.analyticsService.getPackagesCount({ includeInactive: true }).subscribe((count) => this.totalPackagesCount.set(count));
    this.analyticsService.getVoucherCount().subscribe((count) => this.currentVouchersCount.set(count));
    this.analyticsService.getAgentCountryCount().subscribe((count) => this.totalAgentCountryCount.set(count));
    this.analyticsService.getVoucherClosedCount().subscribe((count) => this.closedVouchersCount.set(count));

    this.isLoading.set(true);
    this.analyticsService.getSeroRequests({ pageIndex: 0, pageSize: 5 }).subscribe((requests) => {
      this.packageRequests.set(requests);
      this.isLoading.set(false);
    });
  }

  getNumberOfDaysAndHours(date: Date | string | undefined): { days: number; hours: number } {
    const now = new Date();
    const dateValue = date ? new Date(date) : now;
    const diff = Math.max(0, now.getTime() - dateValue.getTime());
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days, hours };
  }

  getStatusClass(status: string | undefined | null): string {
    if (status === undefined || status === null) {
      return 'hover:bg-gray-50';
    }

    const statusClasses: Record<string, string> = {
      New: 'hover:bg-blue-50',
      Confirmed: 'hover:bg-primary-50',
      Pending: 'hover:bg-yellow-50',
      Completed: 'hover:bg-green-50',
      'In Progress': 'hover:bg-blue-50',
      Cancelled: 'hover:bg-red-50',
    };
    return statusClasses[status] || 'hover:bg-gray-50';
  }

  getStatusBadgeClass(status: string | undefined | null): string {
    if (status === undefined || status === null) {
      return 'bg-gray-100 text-gray-800';
    }

    const statusBadgeClasses: Record<string, string> = {
      New: 'bg-blue-100 text-blue-800',
      Confirmed: 'bg-primary-100 text-primary-800',
      Pending: 'bg-yellow-100 text-yellow-800',
      Completed: 'bg-green-100 text-green-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      Cancelled: 'bg-red-100 text-red-800',
    };
    return statusBadgeClasses[status] || 'bg-gray-100 text-gray-800';
  }

  getProgressPercentage(_pkg: AnalyticsRequest): string {
    return '75%';
  }

  refreshVouchersList(): void {
    this.loadVouchers();
  }

  private loadVouchers(): void {
    this.isLoadingVouchers.set(true);
    this.analyticsService.getVouchers({ pageIndex: 0, pageSize: 5 }).subscribe((data) => {
      this.vouchers.set(data);
      this.isLoadingVouchers.set(false);
    });
  }
}
