import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, Signal, computed, inject, signal } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActionsDropdownComponent, DropdownAction } from '../../../../../components/actions-dropdown/actions-dropdown.component';
import { OperationVoucher } from '../../models/operation-voucher.model';
import { OperationsMockService } from '../../operations-mock.service';
import { AgentDetailsDialogComponent } from '../agent-details-dialog/agent-details-dialog.component';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { RequestDetailsDialogComponent } from '../request-details-dialog/request-details-dialog.component';
import { VoucherDetailsDialogComponent } from '../voucher-details-dialog/voucher-details-dialog.component';
import { VoucherLogsDialogComponent } from '../voucher-logs-dialog/voucher-logs-dialog.component';
import { VoucherStatusChangeDialogComponent } from '../voucher-status-change-dialog/voucher-status-change-dialog.component';
import { DocumentationStatusSwitcherComponent } from '../documentation-status-switcher/documentation-status-switcher.component';
import { DocumentationStatus } from '../../models/documentation-status.model';
import { DocumentationStatusFilterService } from '../../services/documentation-status-filter.service';
import { SeroCurrencyPipe } from 'src/app/shared/pipes/sero-currency.pipe';

@Component({
  selector: 'general-voucher-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, ActionsDropdownComponent, CommonModule, LoadingSpinnerComponent, MatDialogModule, TranslateModule, DocumentationStatusSwitcherComponent, SeroCurrencyPipe],
  templateUrl: './general-voucher-table.component.html',
  styleUrl: './general-voucher-table.component.scss',
})
export class GeneralVoucherTableComponent {
  @Input({ required: true }) vouchers!: Signal<OperationVoucher[]>;
  @Input() typeIds: number[] = [];
  @Input() voucherActionsList: DropdownAction[] = [];
  @Output() refreshVouchers = new EventEmitter<void>();

  protected readonly voucherService = inject(OperationsMockService);
  private readonly translate = inject(TranslateService);
  private readonly dialog = inject(MatDialog);
  private readonly documentationStatusFilter = inject(DocumentationStatusFilterService);

  readonly isLoading = signal(false);
  readonly loadingMessage = signal(this.translate.instant('Loading...'));
  private readonly selectedVoucher = signal<OperationVoucher | null>(null);
  readonly selectedVoucherComputed = computed(() => this.selectedVoucher());
  readonly selectedDocumentationStatus = signal<DocumentationStatus>('pending');

  private readonly visibleVoucherPool = computed(() =>
    (this.vouchers?.() ?? []).filter((voucher) => !this.typeIds.length || this.typeIds.includes(voucher.RequestVoucherTypeID))
  );

  readonly pendingCount = computed(() =>
    this.documentationStatusFilter.countByStatus(this.visibleVoucherPool(), 'pending')
  );

  readonly documentedCount = computed(() =>
    this.documentationStatusFilter.countByStatus(this.visibleVoucherPool(), 'documented')
  );

  readonly filteredVouchers = computed(() =>
    this.documentationStatusFilter.filterByStatus(this.visibleVoucherPool(), this.selectedDocumentationStatus())
  );

  statusSubmitted(): void {
    this.refreshVouchers.emit();
  }

  getVoucherType(typeId: number | undefined | null): 'hotel' | 'transport' | 'visa' | 'catering' | 'ticket' | null {
    if (!typeId) {
      return null;
    }
    return ({ 1: 'hotel', 2: 'transport', 3: 'visa', 4: 'catering', 5: 'ticket' } as const)[typeId as 1 | 2 | 3 | 4 | 5] || null;
  }

  getVoucherActionsList(status: number): DropdownAction[] {
    if (status === 2) {
      return this.voucherActionsList.filter((action) => action.status === undefined || action.status < 2);
    }

    return this.voucherActionsList;
  }

  getActionsForVoucherType(voucher: OperationVoucher): DropdownAction[] {
    const adminStatus = voucher.VoucherStatusForAdminID;
    const actions = this.getVoucherActionsList(adminStatus ?? 0);
    const noStatusActions = actions.filter((action) => !('status' in action));
    const statusActions = actions
      .filter((action) => typeof action.status === 'number')
      .sort((a, b) => (a.status! - b.status!));
    const nextAction = statusActions.find((action) => (action.status ?? 0) > (adminStatus ?? 0));
    const result: DropdownAction[] = [...noStatusActions];

    if (nextAction) {
      result.push(nextAction);
    }

    return result;
  }

  handleActionSelection(action: DropdownAction, voucher: OperationVoucher): void {
    if (action.value === 'voucher_status_change' && typeof action.status === 'number') {
      const dialogRef = this.dialog.open(VoucherStatusChangeDialogComponent, {
        width: '95vw',
        maxWidth: '700px',
        maxHeight: '90vh',
        autoFocus: false,
        disableClose: true,
        panelClass: 'custom-dialog-container',
      });

      dialogRef.componentInstance.voucherId = voucher.RequestVoucherID ?? null;
      dialogRef.componentInstance.agentId = voucher.AgentID ?? null;
      dialogRef.componentInstance.currentAdminStatus = voucher.VoucherStatusForAdminID ?? null;
      dialogRef.componentInstance.currentAgentStatus = voucher.VoucherStatusForAgentID ?? null;
      dialogRef.componentInstance.voucherType = this.getVoucherType(voucher.RequestVoucherTypeID);
      dialogRef.componentInstance.newStatus = action.status;

      dialogRef.componentInstance.submitted.subscribe(() => {
        this.statusSubmitted();
        dialogRef.close();
      });

      dialogRef.componentInstance.closed.subscribe(() => dialogRef.close());
      return;
    }

    if (action.value === 'voucher_details') {
      this.openVoucherDetailsDialog(voucher);
      return;
    }

    if (action.value === 'voucher_admin_log' || action.value === 'voucher_agent_log') {
      const logType = action.value === 'voucher_admin_log' ? 'admin-log' : 'agent-log';
      this.openVoucherLogsDialog(voucher, logType);
      return;
    }

    if (action.value === 'agent_details') {
      this.openAgentDetailsDialog(voucher);
      return;
    }

    if (action.value === 'request_details') {
      this.openRequestDetailsDialog(voucher);
      return;
    }

    if (action.value === 'download_voucher_pdf') {
      this.downloadVoucherPdf(voucher);
    }
  }

  private downloadVoucherPdf(voucher: OperationVoucher): void {
    this.loadingMessage.set(this.translate.instant('Downloading PDF...'));
    this.isLoading.set(true);

    this.voucherService.getVoucherPdf({ voucherId: voucher.RequestVoucherID, agentId: voucher.AgentID }).subscribe((response) => {
      this.isLoading.set(false);
      const byteCharacters = atob(response.Content);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i += 1) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: response.ContentType || 'application/pdf' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = response.FileName;
      link.click();
      window.URL.revokeObjectURL(link.href);
    });
  }

  private openVoucherDetailsDialog(voucher: OperationVoucher): void {
    this.dialog.open(VoucherDetailsDialogComponent, {
      width: '1200px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      disableClose: true,
      panelClass: 'custom-dialog-container',
      data: {
        voucherId: voucher.RequestVoucherID,
        agentId: voucher.AgentID,
      },
    }).afterClosed().subscribe((result) => {
      if (result) {
        this.refreshVouchers.emit();
      }
    });
  }

  private openVoucherLogsDialog(voucher: OperationVoucher, logType: 'admin-log' | 'agent-log'): void {
    this.dialog.open(VoucherLogsDialogComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: {
        voucherId: voucher.RequestVoucherID,
        agentId: voucher.AgentID,
        logType,
      },
      panelClass: 'custom-dialog-container',
    });
  }

  private openAgentDetailsDialog(voucher: OperationVoucher): void {
    this.dialog.open(AgentDetailsDialogComponent, {
      width: '1200px',
      maxWidth: '90vw',
      data: { agentId: voucher.AgentID },
      panelClass: 'custom-dialog-container',
    });
  }

  private openRequestDetailsDialog(voucher: OperationVoucher): void {
    this.dialog.open(RequestDetailsDialogComponent, {
      width: '1100px',
      maxWidth: '95vw',
      height: '85vh',
      maxHeight: '95vh',
      data: {
        requestId: voucher.SeroPackageRequestID,
        agentId: voucher.AgentID,
      },
      panelClass: 'custom-dialog-container',
    });
  }
}
