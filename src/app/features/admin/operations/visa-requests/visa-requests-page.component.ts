import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DropdownAction } from '../../../../components/actions-dropdown/actions-dropdown.component';
import { GeneralVoucherTableComponent } from '../components/general-voucher-table/general-voucher-table.component';
import { LoadingSpinnerComponent } from '../components/loading-spinner/loading-spinner.component';
import { PaginationComponent } from '../components/pagination/pagination.component';
import { OperationVoucher } from '../models/operation-voucher.model';
import { OperationsMockService } from '../operations-mock.service';

@Component({
  selector: 'app-visa-requests-page',
  standalone: true,
  imports: [GeneralVoucherTableComponent, LoadingSpinnerComponent, PaginationComponent, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="operations-page relative">
      <loading-spinner [isLoading]="isLoading()" [message]="'Loading Quotations...' | translate" />
      <general-voucher-table [typeIds]="typeIds" [vouchers]="vouchers" [voucherActionsList]="voucherActionsList" (refreshVouchers)="refreshVouchersList()" />
      <pagination [currentPage]="page()" [totalPages]="totalPages()" (pageChange)="setPage($event)" />
    </div>
  `,
  styles: [`.operations-page { position: relative; display: flex; flex-direction: column; gap: 24px; }`],
})
export class VisaRequestsPageComponent {
  private readonly voucherService = inject(OperationsMockService);
  private readonly translate = inject(TranslateService);

  readonly typeIds = [3];
  readonly isLoading = signal(false);
  readonly page = signal(1);
  readonly totalPages = signal(1);
  readonly pageSize = 10;
  readonly vouchers = signal<OperationVoucher[]>([]);
  readonly agentId = signal<number | undefined>(undefined);
  readonly voucherActionsList: DropdownAction[] = [
    { label: this.translate.instant('View Quotation Details'), value: 'voucher_details' },
    { label: this.translate.instant('Agent Details'), value: 'agent_details' },
    { label: this.translate.instant('Request Details'), value: 'request_details' },
    { label: this.translate.instant('Admin Log'), value: 'voucher_admin_log' },
    { label: this.translate.instant('Agent Log'), value: 'voucher_agent_log' },
    { label: this.translate.instant('Download Quotation PDF'), value: 'download_voucher_pdf' },
    { label: this.translate.instant('Operation Approval'), value: 'voucher_status_change', status: 5 },
  ];

  ngOnInit(): void {
    this.loadCount();
    this.loadVouchers();
  }

  setPage(newPage: number): void {
    this.page.set(newPage);
    this.loadVouchers();
  }

  refreshVouchersList(): void {
    this.loadCount();
    this.loadVouchers();
  }

  private loadVouchers(): void {
    this.isLoading.set(true);
    this.voucherService.getVouchersForOperationApproval({ pageIndex: this.page() - 1, pageSize: this.pageSize, typeid: this.typeIds[0], agentId: this.agentId() })
      .subscribe((data) => {
        this.vouchers.set(data);
        this.isLoading.set(false);
      });
  }

  private loadCount(): void {
    this.voucherService.getVouchersForOperationApprovalCount({ typeid: this.typeIds[0], agentId: this.agentId() })
      .subscribe((count) => this.totalPages.set(Math.max(1, Math.ceil(count / this.pageSize))));
  }
}
