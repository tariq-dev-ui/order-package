import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, Output, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActionsDropdownComponent, DropdownAction } from 'src/app/components/actions-dropdown/actions-dropdown.component';
import { LoadingSpinnerComponent } from 'src/app/components/loading-spinner/loading-spinner';
import { AdminAPIClient, RequestVoucherModel, VoucherDetailsModel, VoucherStatusLogModel } from 'src/app/services/admin.api.client';

@Component({
  selector: 'voucher-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, ActionsDropdownComponent, CommonModule, LoadingSpinnerComponent, TranslateModule],
  template: `
    <div class="relative">
      <loading-spinner [isLoading]="isLoading()" [message]="'Downloading PDF...' | translate" />
      <div class="max-w-7xl mx-auto p-2 sm:p-3">
        <div class="bg-white rounded-lg shadow-sm border border-gray-100 overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'Type' | translate }}</th>
                <th class="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'Quotation No.' | translate }}</th>
                <th class="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'Quotation Date' | translate }}</th>
                <th class="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'Price' | translate }}</th>
                <th class="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'Admin Status' | translate }}</th>
                <th class="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'Agent Status' | translate }}</th>
                <th class="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{{ 'Actions' | translate }}</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              @for (voucher of vouchers; track voucher.Voucher?.RequestVoucherID) {
                @if (voucher?.Voucher) {
                  <tr class="hover:bg-gray-50">
                    <td class="px-3 py-2 whitespace-nowrap">
                      <div class="flex items-center">
                        <div class="w-6 h-6 rounded-full flex items-center justify-center" [class]="typeIconBg(voucher.Voucher?.RequestVoucherTypeID)">
                          <i class="fas text-xs" [class]="typeIcon(voucher.Voucher?.RequestVoucherTypeID)"></i>
                        </div>
                        <span class="ms-2 px-2 py-0.5 text-xs font-medium rounded border" [class]="typeBadge(voucher.Voucher?.RequestVoucherTypeID)">
                          {{ typeLabel(voucher.Voucher?.RequestVoucherTypeID) | translate }}
                        </span>
                      </div>
                    </td>
                    <td class="px-3 py-2 text-center whitespace-nowrap">
                      <div class="text-xs sm:text-sm text-gray-900">{{ voucher.Voucher?.RequestVoucherCode }}</div>
                    </td>
                    <td class="px-3 py-2 text-center whitespace-nowrap">
                      <div class="text-xs sm:text-sm text-gray-900">{{ voucher.Voucher?.AddedDate | date: 'dd MMM yyyy HH:mm' }}</div>
                    </td>
                    <td class="px-3 py-2 text-center whitespace-nowrap">
                      @if ((voucher.Voucher?.TotalPriceWithTax ?? 0) === 0) {
                        <div class="text-xs sm:text-sm font-bold text-gray-900">{{ 'N/A' | translate }}</div>
                      } @else {
                        <div class="text-xs sm:text-sm font-bold text-gray-900">{{ voucher.Voucher?.TotalPriceWithTax | number }}</div>
                        <div class="text-xs text-gray-500 sar-symbol">R</div>
                      }
                    </td>
                    <td class="px-3 py-2 text-center whitespace-nowrap">
                      <span class="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                        {{ voucher.Voucher?.VoucherStatusForAdminTitle }}
                      </span>
                    </td>
                    <td class="px-3 py-2 text-center whitespace-nowrap">
                      <span class="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                        {{ voucher.Voucher?.VoucherStatusForAgentTitle }}
                      </span>
                    </td>
                    <td class="px-3 py-2 text-center whitespace-nowrap">
                      <app-actions-dropdown
                        [actions]="getActionsForVoucherType(voucher)"
                        (actionSelected)="handleActionSelection($event, voucher)">
                      </app-actions-dropdown>
                    </td>
                  </tr>
                }
              } @empty {
                <tr>
                  <td colspan="7" class="px-6 py-8 text-center text-sm text-gray-500">
                    <i class="fas fa-inbox text-3xl mb-2 text-gray-300"></i>
                    <div>{{ 'No quotations found' | translate }}</div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class VoucherTableComponent {
  @Input({ required: true }) vouchers!: VoucherDetailsModel[] | null;
  @Input() voucherActionsList: DropdownAction[] = [];
  @Output() refreshVouchers = new EventEmitter<void>();

  private readonly adminAPIClient = inject(AdminAPIClient);
  private readonly dialog = inject(MatDialog);

  isLoading = signal(false);

  typeLabel(typeId?: number | null): string {
    return ({
      1: 'Voucher Type Hotel',
      2: 'Voucher Type Trip',
      3: 'Voucher Type Visa',
      4: 'Voucher Type Food',
      5: 'Voucher Type Ticket',
    } as Record<number, string>)[typeId ?? 0] ?? 'Quotation';
  }

  typeIcon(typeId?: number | null): string {
    return ({
      1: 'fa-hotel text-green-600',
      2: 'fa-map-marked-alt text-purple-600',
      3: 'fa-file-alt text-blue-600',
      4: 'fa-utensils text-red-600',
      5: 'fa-ticket-alt text-amber-600',
    } as Record<number, string>)[typeId ?? 0] ?? 'fa-ticket-alt text-primary-600';
  }

  typeIconBg(typeId?: number | null): string {
    return ({
      1: 'bg-green-100',
      2: 'bg-purple-100',
      3: 'bg-blue-100',
      4: 'bg-red-100',
      5: 'bg-amber-100',
    } as Record<number, string>)[typeId ?? 0] ?? 'bg-primary-100';
  }

  typeBadge(typeId?: number | null): string {
    return ({
      1: 'bg-green-50 text-green-700 border-green-200',
      2: 'bg-purple-50 text-purple-700 border-purple-200',
      3: 'bg-blue-50 text-blue-700 border-blue-200',
      4: 'bg-red-50 text-red-700 border-red-200',
      5: 'bg-amber-50 text-amber-700 border-amber-200',
    } as Record<number, string>)[typeId ?? 0] ?? 'bg-primary-50 text-primary-700 border-primary-200';
  }

  getVoucherType(typeId: number | undefined | null): 'hotel' | 'transport' | 'visa' | 'catering' | 'ticket' | null {
    if (!typeId) return null;
    return ({ 1: 'hotel', 2: 'transport', 3: 'visa', 4: 'catering', 5: 'ticket' } as const)[typeId as 1 | 2 | 3 | 4 | 5] || null;
  }

  getVoucherActionsList(status: number): DropdownAction[] {
    if (status === 2) {
      return this.voucherActionsList.filter(action => action.status === undefined || action.status < 2);
    }
    return this.voucherActionsList;
  }

  getActionsForVoucherType(voucher: VoucherDetailsModel): DropdownAction[] {
    const actions = this.getVoucherActionsList(voucher.Voucher?.VoucherStatusForAdminID ?? 0);
    const noStatusActions = actions.filter(action => !('status' in action));
    const statusActions = actions
      .filter(action => typeof action.status === 'number')
      .sort((a, b) => (a.status! - b.status!));
    const nextAction = statusActions.find(action => (action.status ?? 0) > (voucher.Voucher?.VoucherStatusForAdminID ?? 0));
    return nextAction ? [...noStatusActions, nextAction] : noStatusActions;
  }

  handleActionSelection(action: DropdownAction, voucher: VoucherDetailsModel): void {
    if (action.value === 'voucher_status_change' && typeof action.status === 'number') {
      const ref = this.dialog.open(VoucherStatusChangeDialogComponent, {
        width: '700px',
        maxWidth: '95vw',
        panelClass: 'custom-dialog-container',
        disableClose: true,
        data: { voucher, newStatus: action.status },
      });
      ref.afterClosed().subscribe(result => {
        if (result) this.refreshVouchers.emit();
      });
      return;
    }

    if (action.value === 'voucher_details') {
      this.openVoucherDetailsDialog(voucher);
      return;
    }

    if (action.value === 'voucher_admin_log' || action.value === 'voucher_agent_log') {
      this.dialog.open(VoucherLogsDialogComponent, {
        width: '800px',
        maxWidth: '90vw',
        panelClass: 'custom-dialog-container',
        data: {
          voucherId: voucher.Voucher?.RequestVoucherID ?? null,
          agentId: voucher.Voucher?.AgentID ?? null,
          logType: action.value === 'voucher_admin_log' ? 'admin-log' : 'agent-log',
        },
      });
      return;
    }

    if (action.value === 'agent_details') {
      this.dialog.open(InfoDialogComponent, {
        width: '620px',
        maxWidth: '90vw',
        panelClass: 'custom-dialog-container',
        data: {
          title: 'Agent Details',
          icon: 'fa-user',
          fields: [
            ['Agent ID', voucher.Voucher?.AgentID],
            ['Request ID', voucher.Voucher?.SeroPackageRequestID],
          ],
        },
      });
      return;
    }

    if (action.value === 'request_details') {
      this.dialog.open(InfoDialogComponent, {
        width: '620px',
        maxWidth: '90vw',
        panelClass: 'custom-dialog-container',
        data: {
          title: 'Request Details',
          icon: 'fa-clipboard-list',
          fields: [
            ['Request ID', voucher.Voucher?.SeroPackageRequestID],
            ['Quotation Code', voucher.Voucher?.RequestVoucherCode],
            ['Total Price', voucher.Voucher?.TotalPriceWithTax],
            ['Type', this.typeLabel(voucher.Voucher?.RequestVoucherTypeID)],
          ],
        },
      });
      return;
    }

    if (action.value === 'download_voucher_pdf') {
      const voucherId = voucher.Voucher?.RequestVoucherID ?? 0;
      const agentId = voucher.Voucher?.AgentID ?? 0;
      this.isLoading.set(true);
      this.adminAPIClient.getVoucherPdf({ voucherId, agentId }).subscribe({
        next: response => {
          this.isLoading.set(false);
          if (!response?.Content) return;
          const byteCharacters = atob(response.Content);
          const byteArray = new Uint8Array(Array.from(byteCharacters, char => char.charCodeAt(0)));
          const blob = new Blob([byteArray], { type: response.ContentType || 'application/pdf' });
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = response.FileName || `voucher-${voucherId}.txt`;
          link.click();
          window.URL.revokeObjectURL(link.href);
        },
        error: () => this.isLoading.set(false),
      });
    }
  }

  public openVoucherDetailsDialog(voucher: VoucherDetailsModel): void {
    if (!voucher?.Voucher) return;
    const ref = this.dialog.open(VoucherDetailsDialogComponent, {
      width: '1100px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-container',
      data: { voucherId: voucher.Voucher.RequestVoucherID, agentId: voucher.Voucher.AgentID },
    });
    ref.afterClosed().subscribe(result => {
      if (result) this.refreshVouchers.emit();
    });
  }
}

@Component({
  selector: 'voucher-status-change-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, MatDialogModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative overflow-hidden">
      <loading-spinner [isLoading]="isSubmittingData()" [message]="'Submitting status change...' | translate" />
      <div class="border-b border-gray-100 p-5">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-semibold text-gray-900">
            <i class="fas fa-user text-primary-500 me-2"></i>
            {{ 'Change Quotation Status' | translate }}
          </h2>
          <button type="button" (click)="close()" class="text-gray-400 hover:text-gray-500 transition-colors">
            <span class="material-icons-round">close</span>
          </button>
        </div>
        <p class="mt-1 text-sm text-gray-500">{{ 'Fill in the details below to change the quotation status' | translate }}</p>
      </div>
      <form [formGroup]="form" (ngSubmit)="submit()" class="space-y-2">
        <div class="max-h-[60vh] overflow-y-auto p-5 custom-scroll">
          <label for="notes" class="block text-sm font-medium text-gray-700">
            <i class="fas fa-sticky-note text-primary-500 me-2"></i>
            {{ 'Notes' | translate }}
          </label>
          <textarea id="notes" formControlName="notes" rows="4"
            class="block p-3 w-full border border-gray-300 placeholder:text-gray-400 rounded-md shadow-sm focus:border-primary-500 focus:ring focus:ring-primary-500 focus:ring-opacity-50"
            [placeholder]="'Add your notes here...' | translate"></textarea>
        </div>
        <hr class="border-gray-200">
        <div class="flex justify-end items-center gap-3 p-5">
          <button type="button" (click)="close()" class="px-5 py-3 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">{{ 'Cancel' | translate }}</button>
          <button type="submit" class="px-5 py-3 text-sm font-medium rounded-lg bg-primary-500 text-white hover:bg-primary-600 shadow-sm hover:shadow-md">
            <i class="fas fa-check me-2"></i>
            {{ 'Change Status' | translate }}
          </button>
        </div>
      </form>
    </div>
  `,
})
export class VoucherStatusChangeDialogComponent {
  private readonly api = inject(AdminAPIClient);
  private readonly dialogRef = inject(MatDialogRef<VoucherStatusChangeDialogComponent>);
  readonly data = inject<{ voucher: VoucherDetailsModel; newStatus: number }>(MAT_DIALOG_DATA);

  isSubmittingData = signal(false);
  form = new FormGroup({ notes: new FormControl<string | null>(null) });

  submit(): void {
    const voucherId = this.data.voucher.Voucher?.RequestVoucherID;
    const agentId = this.data.voucher.Voucher?.AgentID;
    if (!voucherId || !agentId) return;

    const notes = this.form.value.notes ?? '';
    const params = { voucherID: voucherId, agentId, notes };
    const action = this.data.newStatus === 2
      ? this.api.sendVoucherToAgent(params)
      : this.api.approveVoucherFromManager(params);

    this.isSubmittingData.set(true);
    action.subscribe({
      next: () => this.dialogRef.close(true),
      error: () => this.isSubmittingData.set(false),
      complete: () => this.isSubmittingData.set(false),
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }
}

@Component({
  selector: 'voucher-details-dialog',
  standalone: true,
  imports: [CommonModule, DatePipe, LoadingSpinnerComponent, MatDialogModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative overflow-hidden">
      <loading-spinner [isLoading]="isLoading()" [message]="'Loading data...' | translate" />
      <div class="border-b border-gray-100 p-5 flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-semibold text-gray-900">
            <i class="fas fa-ticket-alt text-primary-500 me-2"></i>
            {{ 'Quotation Details' | translate }}
          </h2>
          <p class="mt-1 text-sm text-gray-500">{{ voucher()?.Voucher?.RequestVoucherCode }}</p>
        </div>
        <button type="button" (click)="close()" class="text-gray-400 hover:text-gray-500 transition-colors">
          <span class="material-icons-round">close</span>
        </button>
      </div>
      @if (voucher(); as item) {
        <div class="p-5 max-h-[70vh] overflow-y-auto custom-scroll">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
            <div class="rounded-lg border border-gray-100 p-3">
              <div class="text-xs text-gray-500">{{ 'Quotation No.' | translate }}</div>
              <div class="font-semibold">{{ item.Voucher?.RequestVoucherCode }}</div>
            </div>
            <div class="rounded-lg border border-gray-100 p-3">
              <div class="text-xs text-gray-500">{{ 'Date' | translate }}</div>
              <div class="font-semibold">{{ item.Voucher?.AddedDate | date:'medium' }}</div>
            </div>
            <div class="rounded-lg border border-gray-100 p-3">
              <div class="text-xs text-gray-500">{{ 'Total' | translate }}</div>
              <div class="font-semibold">{{ item.Voucher?.TotalPriceWithTax | number }} <span class="text-gray-500 sar-symbol">R</span></div>
            </div>
          </div>
          <div class="bg-white rounded-lg border border-gray-100 overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-2 text-left text-xs text-gray-500 uppercase">{{ 'Section' | translate }}</th>
                  <th class="px-4 py-2 text-left text-xs text-gray-500 uppercase">{{ 'Count' | translate }}</th>
                  <th class="px-4 py-2 text-left text-xs text-gray-500 uppercase">{{ 'Selling Price' | translate }}</th>
                  <th class="px-4 py-2 text-left text-xs text-gray-500 uppercase">{{ 'Total' | translate }}</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (detail of detailRows(item); track detail.id) {
                  <tr>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ detail.label | translate }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ detail.count }}</td>
                    <td class="px-4 py-3 text-sm text-gray-900">{{ detail.price | number }}</td>
                    <td class="px-4 py-3 text-sm font-semibold text-gray-900">{{ detail.total | number }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      }
      <div class="flex justify-end gap-3 p-5 border-t border-gray-100">
        <button type="button" (click)="close()" class="px-5 py-3 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
          {{ 'Close' | translate }}
        </button>
      </div>
    </div>
  `,
})
export class VoucherDetailsDialogComponent {
  private readonly api = inject(AdminAPIClient);
  private readonly dialogRef = inject(MatDialogRef<VoucherDetailsDialogComponent>);
  readonly data = inject<{ voucherId: number; agentId: number }>(MAT_DIALOG_DATA);

  voucher = signal<VoucherDetailsModel | null>(null);
  isLoading = signal(true);

  constructor() {
    this.api.getVoucherById({ voucherId: this.data.voucherId, agentId: this.data.agentId }).subscribe({
      next: value => this.voucher.set(value),
      error: () => this.voucher.set(null),
      complete: () => this.isLoading.set(false),
    });
  }

  detailRows(voucher: VoucherDetailsModel): Array<{ id: number; label: string; count: number; price: number; total: number }> {
    const rows: Array<{ id: number; label: string; count: number; price: number; total: number }> = [];
    voucher.HotelVouchers?.forEach(item => rows.push({ id: item.RequestHotelVoucherID ?? 0, label: 'Hotel', count: item.NightsCount ?? 0, price: item.SellingUnitPrice ?? 0, total: item.TotalPriceWithTax ?? 0 }));
    voucher.TripVouchers?.forEach(item => rows.push({ id: item.RequestTripVoucherID ?? 0, label: 'Transport', count: item.Count ?? 0, price: item.SellingUnitPrice ?? 0, total: item.TotalPriceWithTax ?? 0 }));
    voucher.VisaVouchers?.forEach(item => rows.push({ id: item.RequestVisaVoucherID ?? 0, label: 'Visa', count: item.Count ?? 0, price: item.SellingUnitPrice ?? 0, total: item.TotalPriceWithTax ?? 0 }));
    voucher.CateringVouchers?.forEach(item => rows.push({ id: item.RequestCateringVoucherID ?? 0, label: 'Catering', count: item.Count ?? 0, price: item.SellingUnitPrice ?? 0, total: item.TotalPriceWithTax ?? 0 }));
    voucher.TicketVouchers?.forEach(item => rows.push({ id: item.RequestTicketVoucherID ?? 0, label: 'Ticket', count: item.Count ?? 0, price: item.SellingUnitPrice ?? 0, total: item.TotalPriceWithTax ?? 0 }));
    return rows;
  }

  close(): void {
    this.dialogRef.close(false);
  }
}

@Component({
  selector: 'voucher-logs-dialog',
  standalone: true,
  imports: [CommonModule, DatePipe, LoadingSpinnerComponent, MatDialogModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative overflow-hidden">
      <loading-spinner [isLoading]="isLoading()" [message]="'Loading logs...' | translate" />
      <div class="border-b border-gray-100 p-5 flex items-center justify-between">
        <div>
          <h2 class="text-2xl font-semibold text-gray-900">
            <i class="fas fa-file-alt text-primary-500 me-2"></i>
            {{ 'Quotation Logs' | translate }}
          </h2>
          <p class="mt-1 text-sm text-gray-500">{{ 'Recent status changes for this quotation' | translate }}</p>
        </div>
        <button type="button" (click)="close()" class="text-gray-400 hover:text-gray-500 transition-colors">
          <span class="material-icons-round">close</span>
        </button>
      </div>
      <div class="max-h-[60vh] overflow-y-auto p-5 custom-scroll">
        <table class="min-w-full divide-y divide-gray-200 border border-gray-100 rounded-lg overflow-hidden">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left text-xs text-gray-500 uppercase">#</th>
              <th class="px-4 py-2 text-left text-xs text-gray-500 uppercase">{{ 'Status' | translate }}</th>
              <th class="px-4 py-2 text-left text-xs text-gray-500 uppercase">{{ 'Notes' | translate }}</th>
              <th class="px-4 py-2 text-left text-xs text-gray-500 uppercase">{{ 'By' | translate }}</th>
              <th class="px-4 py-2 text-left text-xs text-gray-500 uppercase">{{ 'Date' | translate }}</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            @for (item of log(); track $index) {
              <tr>
                <td class="px-4 py-3 text-sm text-gray-900">{{ $index + 1 }}</td>
                <td class="px-4 py-3 text-sm text-gray-900">{{ item.StatusTitle }}</td>
                <td class="px-4 py-3 text-sm text-gray-900">{{ item.Notes || ('-' | translate) }}</td>
                <td class="px-4 py-3 text-sm text-gray-900">{{ item.CreatedBy || ('System' | translate) }}</td>
                <td class="px-4 py-3 text-sm text-gray-900">{{ item.CreatedAt | date:'medium' }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5" class="px-6 py-8 text-center text-sm text-gray-500">{{ 'No logs found' | translate }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <div class="flex justify-end gap-3 p-5 border-t border-gray-100">
        <button type="button" (click)="close()" class="px-5 py-3 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
          {{ 'Close' | translate }}
        </button>
      </div>
    </div>
  `,
})
export class VoucherLogsDialogComponent {
  private readonly api = inject(AdminAPIClient);
  private readonly dialogRef = inject(MatDialogRef<VoucherLogsDialogComponent>);
  readonly data = inject<{ voucherId: number | null; agentId: number | null; logType: 'admin-log' | 'agent-log' }>(MAT_DIALOG_DATA);

  log = signal<VoucherStatusLogModel[]>([]);
  isLoading = signal(true);

  constructor() {
    const props = { voucherID: this.data.voucherId ?? 0, agentId: this.data.agentId ?? 0 };
    const source = this.data.logType === 'admin-log'
      ? this.api.getVoucherStatusLogForAdmin(props)
      : this.api.getVoucherStatusLogForAgent(props);
    source.subscribe({
      next: value => this.log.set(value),
      error: () => this.log.set([]),
      complete: () => this.isLoading.set(false),
    });
  }

  close(): void {
    this.dialogRef.close(false);
  }
}

@Component({
  selector: 'info-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="overflow-hidden">
      <div class="border-b border-gray-100 p-5 flex items-center justify-between">
        <h2 class="text-2xl font-semibold text-gray-900">
          <i class="fas text-primary-500 me-2" [class]="data.icon"></i>
          {{ data.title | translate }}
        </h2>
        <button type="button" (click)="close()" class="text-gray-400 hover:text-gray-500 transition-colors">
          <span class="material-icons-round">close</span>
        </button>
      </div>
      <div class="p-5 space-y-3">
        @for (field of data.fields; track field[0]) {
          <div class="rounded-lg border border-gray-100 p-3 flex items-center justify-between gap-4">
            <span class="text-sm text-gray-500">{{ field[0] | translate }}</span>
            <span class="text-sm font-semibold text-gray-900">{{ field[1] ?? '-' }}</span>
          </div>
        }
      </div>
      <div class="flex justify-end p-5 border-t border-gray-100">
        <button type="button" (click)="close()" class="px-5 py-3 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50">
          {{ 'Close' | translate }}
        </button>
      </div>
    </div>
  `,
})
export class InfoDialogComponent {
  readonly data = inject<{ title: string; icon: string; fields: Array<[string, unknown]> }>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<InfoDialogComponent>);

  close(): void {
    this.dialogRef.close(false);
  }
}
