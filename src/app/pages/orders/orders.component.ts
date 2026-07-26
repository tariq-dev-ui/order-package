import { ChangeDetectionStrategy, Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TablerIconComponent } from 'angular-tabler-icons';
import { SeroDropdownComponent, SeroDropdownOption } from '../../shared/components/sero-dropdown/sero-dropdown.component';
import { PaginationComponent } from '../../features/master/packages/components/pagination.component';
import { OrdersService } from './orders.service';
import {
  AGENT_STATUS_META,
  AgentStatus,
  OPERATION_STATUS_META,
  OperationStatus,
  ORDER_TYPE_META,
  OrderRow,
  OrderTypeFilter,
  PAYMENT_STATUS_META,
  PaymentStatus,
} from './orders.model';

type TypeCounts = Record<string, number>;

@Component({
  selector: 'app-orders',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TranslateModule, TablerIconComponent, SeroDropdownComponent, PaginationComponent],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
})
export class OrdersComponent implements OnInit {
  private readonly ordersService = inject(OrdersService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);

  readonly typeMeta = ORDER_TYPE_META;
  readonly pageSize = 10;

  private readonly typeIconMap: Record<OrderTypeFilter, string> = {
    all: 'shopping-cart',
    hotel: 'building',
    transportation: 'bus',
    visa: 'id',
    catering: 'tools-kitchen-2',
    ticket: 'ticket',
    custom: 'sparkles',
  };

  readonly paymentOptions: SeroDropdownOption<PaymentStatus>[] = [
    { value: 'paid', labelKey: 'orders.payment.paid' },
    { value: 'partially_paid', labelKey: 'orders.payment.partial' },
    { value: 'unpaid', labelKey: 'orders.payment.unpaid' },
  ];

  readonly operationOptions: SeroDropdownOption<OperationStatus>[] = [
    { value: 'preparing', labelKey: 'orders.operation.preparing' },
    { value: 'account_manager_approved', labelKey: 'orders.operation.amApproved' },
    { value: 'operation_approved', labelKey: 'orders.operation.opApproved' },
    { value: 'rejected', labelKey: 'orders.operation.rejected' },
  ];

  readonly agentStatusOptions: SeroDropdownOption<AgentStatus>[] = [
    { value: 'preparing', labelKey: 'orders.agentStatus.preparing' },
    { value: 'in_progress', labelKey: 'orders.agentStatus.inProgress' },
    { value: 'completed', labelKey: 'orders.agentStatus.completed' },
    { value: 'cancelled', labelKey: 'orders.agentStatus.cancelled' },
  ];

  rows = signal<OrderRow[]>([]);
  isLoading = signal(false);
  page = signal(1);
  totalCount = signal(0);
  typeCounts = signal<TypeCounts>({});

  activeType = signal<OrderTypeFilter>('all');
  searchText = signal('');
  showAdvancedFilters = signal(false);
  paymentFilter = signal<PaymentStatus | null>(null);
  operationFilter = signal<OperationStatus | null>(null);
  agentStatusFilter = signal<AgentStatus | null>(null);
  openMoreMenuId = signal<number | null>(null);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / this.pageSize)));
  readonly activeFilterCount = computed(() => [
    this.paymentFilter(),
    this.operationFilter(),
    this.agentStatusFilter(),
  ].filter(Boolean).length);

  readonly footerTotal = computed(() => this.rows().reduce((sum, r) => sum + r.totalPrice, 0));
  readonly footerPaid = computed(() => this.rows().reduce((sum, r) => sum + r.paid, 0));
  readonly footerRemaining = computed(() => this.rows().reduce((sum, r) => sum + r.remaining, 0));
  readonly footerPaymentMeta = computed(() => {
    const total = this.footerTotal();
    const paid = this.footerPaid();
    if (paid <= 0) return PAYMENT_STATUS_META.unpaid;
    if (paid >= total) return PAYMENT_STATUS_META.paid;
    return PAYMENT_STATUS_META.partially_paid;
  });

  ngOnInit(): void {
    this.loadTypeCounts();
    this.loadRows();
  }

  countFor(type: OrderTypeFilter): number {
    return this.typeCounts()[type] ?? 0;
  }

  tablerIconForType(type: OrderTypeFilter): string {
    return this.typeIconMap[type] ?? 'shopping-cart';
  }

  iconForType(type: OrderRow['type']): string {
    return this.typeMeta.find((m) => m.type === type)?.icon ?? 'shopping_cart';
  }

  typeLabelKey(type: OrderRow['type']): string {
    return this.typeMeta.find((m) => m.type === type)?.labelKey ?? '';
  }

  paymentMeta(status: PaymentStatus) {
    return PAYMENT_STATUS_META[status];
  }

  operationMeta(status: OperationStatus) {
    return OPERATION_STATUS_META[status];
  }

  agentStatusMeta(status: AgentStatus) {
    return AGENT_STATUS_META[status];
  }

  selectType(type: OrderTypeFilter): void {
    if (this.activeType() === type) return;
    this.activeType.set(type);
    this.page.set(1);
    this.loadRows();
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchText.set(value);
    this.page.set(1);
    this.loadRows();
  }

  clearSearch(): void {
    if (!this.searchText()) return;
    this.searchText.set('');
    this.page.set(1);
    this.loadRows();
  }

  createNewRequest(): void {
    this.router.navigate(['/admin/agent-requests/new']);
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters.update((v) => !v);
  }

  onPaymentFilterChange(value: PaymentStatus | null): void {
    this.paymentFilter.set(value);
    this.page.set(1);
    this.loadRows();
  }

  onOperationFilterChange(value: OperationStatus | null): void {
    this.operationFilter.set(value);
    this.page.set(1);
    this.loadRows();
  }

  onAgentStatusFilterChange(value: AgentStatus | null): void {
    this.agentStatusFilter.set(value);
    this.page.set(1);
    this.loadRows();
  }

  clearAdvancedFilters(): void {
    this.paymentFilter.set(null);
    this.operationFilter.set(null);
    this.agentStatusFilter.set(null);
    this.page.set(1);
    this.loadRows();
  }

  setPage(newPage: number): void {
    this.page.set(newPage);
    this.loadRows();
  }

  toggleMoreMenu(rowId: number, event: Event): void {
    event.stopPropagation();
    this.openMoreMenuId.update((current) => (current === rowId ? null : rowId));
  }

  @HostListener('document:click')
  closeMoreMenu(): void {
    this.openMoreMenuId.set(null);
  }

  viewRow(row: OrderRow): void {
    this.notify('orders.feedback.view', row);
  }

  printRow(row: OrderRow): void {
    this.notify('orders.feedback.print', row);
  }

  duplicateRow(row: OrderRow): void {
    this.openMoreMenuId.set(null);
    this.notify('orders.feedback.duplicate', row);
  }

  downloadPdf(row: OrderRow): void {
    this.openMoreMenuId.set(null);
    this.notify('orders.feedback.downloadPdf', row);
  }

  viewStatusLog(row: OrderRow): void {
    this.openMoreMenuId.set(null);
    this.notify('orders.feedback.statusLog', row);
  }

  deleteRow(row: OrderRow): void {
    this.openMoreMenuId.set(null);
    this.notify('orders.feedback.delete', row);
  }

  exportCsv(): void {
    this.ordersService.getAllMatching(this.currentFilters()).subscribe((rows) => {
      const header = ['Type', 'Quotation No.', 'Quotation Date', 'Agent', 'Total Price', 'Paid', 'Remaining', 'Payment Status', 'Operation Status', 'Agent Status'];
      const lines = rows.map((r) => [
        r.type, r.orderNo, r.orderDate, r.agent, r.totalPrice, r.paid, r.remaining,
        this.translate.instant(this.paymentMeta(r.paymentStatus).labelKey),
        this.translate.instant(this.operationMeta(r.operationStatus).labelKey),
        this.translate.instant(this.agentStatusMeta(r.agentStatus).labelKey),
      ].join(','));
      const csv = [header.join(','), ...lines].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'quotations.csv';
      link.click();
      URL.revokeObjectURL(url);

      this.snackBar.open(
        this.translate.instant('orders.feedback.exportStarted', { count: rows.length }),
        this.translate.instant('Close'),
        { duration: 2500 },
      );
    });
  }

  private notify(key: string, row: OrderRow): void {
    this.snackBar.open(
      this.translate.instant(key, { no: row.orderNo }),
      this.translate.instant('Close'),
      { duration: 2500 },
    );
  }

  private currentFilters() {
    return {
      typeFilter: this.activeType(),
      search: this.searchText(),
      paymentStatus: this.paymentFilter(),
      operationStatus: this.operationFilter(),
      agentStatus: this.agentStatusFilter(),
    };
  }

  private loadRows(): void {
    this.isLoading.set(true);
    this.ordersService.getOrders({
      ...this.currentFilters(),
      pageIndex: this.page() - 1,
      pageSize: this.pageSize,
    }).subscribe((result) => {
      this.rows.set(result.rows);
      this.totalCount.set(result.total);
      this.isLoading.set(false);
    });
  }

  private loadTypeCounts(): void {
    this.ordersService.getTypeCounts().subscribe((counts) => {
      this.typeCounts.set(counts);
    });
  }
}
