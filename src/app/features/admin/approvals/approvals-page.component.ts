// Currently using local mock data for frontend prototype. Later this can be replaced with backend API.

import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActionsDropdownComponent, DropdownAction } from 'src/app/components/actions-dropdown/actions-dropdown.component';
import { LoadingSpinnerComponent } from 'src/app/components/loading-spinner/loading-spinner';

// ── Voucher Model ──────────────────────────────────────────────────────────────

export interface VoucherModel {
  RequestVoucherID?: number;
  RequestVoucherCode?: string;
  AddedDate?: Date;
  TotalPriceWithTax?: number;
  VoucherStatusForAdminID?: number;
  VoucherStatusForAdminTitle?: string;
  VoucherStatusForAgentID?: number;
  VoucherStatusForAgentTitle?: string;
  RequestVoucherTypeID?: number;   // 1=Hotel, 2=Trip, 3=Visa, 4=Catering, 5=Ticket
  AgentID?: number;
  AgentName?: string;
  SeroPackageRequestID?: number;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

let mockVouchers: VoucherModel[] = [
  {
    RequestVoucherID: 1001, RequestVoucherCode: 'VCH-2026-001',
    AddedDate: new Date('2026-05-02T09:30:00'), TotalPriceWithTax: 7420,
    VoucherStatusForAdminID: 5, VoucherStatusForAdminTitle: 'Pending Finance',
    VoucherStatusForAgentID: 3, VoucherStatusForAgentTitle: 'Confirmed',
    RequestVoucherTypeID: 1, AgentID: 301, AgentName: 'Al Safa Travel', SeroPackageRequestID: 2001
  },
  {
    RequestVoucherID: 1002, RequestVoucherCode: 'VCH-2026-002',
    AddedDate: new Date('2026-05-03T11:15:00'), TotalPriceWithTax: 3980,
    VoucherStatusForAdminID: 5, VoucherStatusForAdminTitle: 'Pending Finance',
    VoucherStatusForAgentID: 2, VoucherStatusForAgentTitle: 'Sent to Agent',
    RequestVoucherTypeID: 3, AgentID: 302, AgentName: 'Nour Tours', SeroPackageRequestID: 2002
  },
  {
    RequestVoucherID: 1003, RequestVoucherCode: 'VCH-2026-003',
    AddedDate: new Date('2026-05-04T14:00:00'), TotalPriceWithTax: 0,
    VoucherStatusForAdminID: 5, VoucherStatusForAdminTitle: 'Pending Finance',
    VoucherStatusForAgentID: 2, VoucherStatusForAgentTitle: 'Sent to Agent',
    RequestVoucherTypeID: 2, AgentID: 303, AgentName: 'Umrah Gate', SeroPackageRequestID: 2003
  },
  {
    RequestVoucherID: 1004, RequestVoucherCode: 'VCH-2026-004',
    AddedDate: new Date('2026-05-05T08:45:00'), TotalPriceWithTax: 1250,
    VoucherStatusForAdminID: 5, VoucherStatusForAdminTitle: 'Pending Finance',
    VoucherStatusForAgentID: 3, VoucherStatusForAgentTitle: 'Confirmed',
    RequestVoucherTypeID: 4, AgentID: 301, AgentName: 'Al Safa Travel', SeroPackageRequestID: 2004
  },
  {
    RequestVoucherID: 1005, RequestVoucherCode: 'VCH-2026-005',
    AddedDate: new Date('2026-05-06T10:00:00'), TotalPriceWithTax: 52200,
    VoucherStatusForAdminID: 5, VoucherStatusForAdminTitle: 'Pending Finance',
    VoucherStatusForAgentID: 3, VoucherStatusForAgentTitle: 'Confirmed',
    RequestVoucherTypeID: 5, AgentID: 302, AgentName: 'Nour Tours', SeroPackageRequestID: 2005
  },
  {
    RequestVoucherID: 1006, RequestVoucherCode: 'VCH-2026-006',
    AddedDate: new Date('2026-05-07T09:00:00'), TotalPriceWithTax: 6150,
    VoucherStatusForAdminID: 5, VoucherStatusForAdminTitle: 'Pending Finance',
    VoucherStatusForAgentID: 2, VoucherStatusForAgentTitle: 'Sent to Agent',
    RequestVoucherTypeID: 1, AgentID: 303, AgentName: 'Umrah Gate', SeroPackageRequestID: 2006
  },
  {
    RequestVoucherID: 1007, RequestVoucherCode: 'VCH-2026-007',
    AddedDate: new Date('2026-05-08T13:30:00'), TotalPriceWithTax: 2800,
    VoucherStatusForAdminID: 5, VoucherStatusForAdminTitle: 'Pending Finance',
    VoucherStatusForAgentID: 3, VoucherStatusForAgentTitle: 'Confirmed',
    RequestVoucherTypeID: 3, AgentID: 301, AgentName: 'Al Safa Travel', SeroPackageRequestID: 2007
  },
  {
    RequestVoucherID: 1008, RequestVoucherCode: 'VCH-2026-008',
    AddedDate: new Date('2026-05-09T16:00:00'), TotalPriceWithTax: 980,
    VoucherStatusForAdminID: 5, VoucherStatusForAdminTitle: 'Pending Finance',
    VoucherStatusForAgentID: 2, VoucherStatusForAgentTitle: 'Sent to Agent',
    RequestVoucherTypeID: 4, AgentID: 302, AgentName: 'Nour Tours', SeroPackageRequestID: 2008
  },
];

// ── Finance Approval Dialog ────────────────────────────────────────────────────

@Component({
  selector: 'app-finance-approval-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatProgressSpinnerModule, TranslateModule],
  template: `
    <h2 mat-dialog-title>{{ data.title | translate }}</h2>
    <div mat-dialog-content>
      <p>{{ data.message | translate }}</p>
      @if (isLoading()) {
        <div style="display:flex;justify-content:center;margin-top:16px">
          <mat-spinner diameter="36" />
        </div>
      }
    </div>
    <mat-dialog-actions align="end">
      <button mat-button [disabled]="isLoading()" (click)="dialogRef.close(false)">{{ 'Cancel' | translate }}</button>
      <button mat-flat-button color="primary" [disabled]="isLoading()" (click)="confirm()">{{ 'Confirm' | translate }}</button>
    </mat-dialog-actions>
  `
})
export class FinanceApprovalDialogComponent {
  dialogRef = inject(MatDialogRef<FinanceApprovalDialogComponent>);
  data = inject<{ title: string; message: string; onConfirm: () => void }>(MAT_DIALOG_DATA);
  isLoading = signal(false);

  confirm() {
    this.isLoading.set(true);
    setTimeout(() => {
      this.data.onConfirm();
      this.isLoading.set(false);
      this.dialogRef.close(true);
    }, 600);
  }
}

// ── Voucher Details Dialog ─────────────────────────────────────────────────────

@Component({
  selector: 'app-voucher-detail-dialog',
  standalone: true,
  imports: [CommonModule, DatePipe, MatDialogModule, MatButtonModule, TranslateModule],
  template: `
    <h2 mat-dialog-title>{{ 'Quotation Details' | translate }}: {{ voucher.RequestVoucherCode }}</h2>
    <div mat-dialog-content style="min-width:400px;">
      <table class="vd-table">
        <tr><td class="vd-label">{{ 'Type' | translate }}</td><td>{{ getTypeName(voucher.RequestVoucherTypeID) }}</td></tr>
        <tr><td class="vd-label">{{ 'Quotation No.' | translate }}</td><td>{{ voucher.RequestVoucherCode }}</td></tr>
        <tr><td class="vd-label">{{ 'Date' | translate }}</td><td>{{ voucher.AddedDate | date:'dd MMM yyyy HH:mm' }}</td></tr>
        <tr><td class="vd-label">{{ 'Price' | translate }}</td><td>{{ voucher.TotalPriceWithTax | number:'1.2-2' }} SAR</td></tr>
        <tr><td class="vd-label">{{ 'Admin Status' | translate }}</td><td>{{ voucher.VoucherStatusForAdminTitle }}</td></tr>
        <tr><td class="vd-label">{{ 'Agent Status' | translate }}</td><td>{{ voucher.VoucherStatusForAgentTitle }}</td></tr>
        <tr><td class="vd-label">{{ 'Agent' | translate }}</td><td>{{ voucher.AgentName }}</td></tr>
      </table>
    </div>
    <mat-dialog-actions align="end">
      <button mat-flat-button color="primary" (click)="dialogRef.close()">{{ 'Close' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .vd-table { width: 100%; border-collapse: collapse; }
    .vd-table tr { border-bottom: 1px solid #eee; }
    .vd-table td { padding: 10px 8px; }
    .vd-label { font-weight: 600; width: 45%; color: #555; }
  `]
})
export class VoucherDetailDialogComponent {
  dialogRef = inject(MatDialogRef<VoucherDetailDialogComponent>);
  voucher = inject<VoucherModel>(MAT_DIALOG_DATA);

  getTypeName(typeId?: number): string {
    const map: Record<number, string> = { 1: 'Hotel', 2: 'Trip', 3: 'Visa', 4: 'Catering', 5: 'Ticket' };
    return typeId ? (map[typeId] ?? 'Unknown') : 'Unknown';
  }
}

// ── Approvals Page ─────────────────────────────────────────────────────────────

@Component({
  selector: 'app-approvals-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, DatePipe,
    MatButtonModule, MatIconModule, MatProgressSpinnerModule, MatPaginatorModule,
    MatTooltipModule, TranslateModule,
    ActionsDropdownComponent, LoadingSpinnerComponent
  ],
  template: `
    <div class="ap-page">
      <loading-spinner [isLoading]="isLoading()" [message]="'Loading...' | translate" />

      <!-- Header -->
      <div class="ap-header">
        <h2 class="ap-title">{{ 'Finance Approval Requests' | translate }}</h2>
        <span class="ap-count">{{ 'Total' | translate }}: {{ totalCount() }}</span>
      </div>

      <!-- Voucher Table (matches SalamApp GeneralVoucherTable design) -->
      <div class="voucher-table-container">
        <div class="table-wrapper">
          <div class="table-content">
            <table class="voucher-table">
              <thead>
                <tr>
                  <th class="table-header">{{ 'Type' | translate }}</th>
                  <th class="table-header">{{ 'Quotation No.' | translate }}</th>
                  <th class="table-header">{{ 'Quotation Date' | translate }}</th>
                  <th class="table-header">{{ 'Price' | translate }}</th>
                  <th class="table-header">{{ 'Admin Status' | translate }}</th>
                  <th class="table-header">{{ 'Agent Status' | translate }}</th>
                  <th class="table-header">{{ 'Actions' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                @for (typeId of typeIds; track typeId) {
                  @for (voucher of pagedVouchers(); track voucher.RequestVoucherID) {
                    @if (voucher.RequestVoucherTypeID === typeId) {
                      <tr class="table-row">

                        <!-- Type -->
                        <td class="table-cell type-cell">
                          <div class="type-wrapper">
                            @switch (voucher.RequestVoucherTypeID) {
                              @case (1) {
                                <div class="type-icon-wrapper" style="background-color:#E4F0E8">
                                  <i class="fas fa-hotel" style="color:#10B981"></i>
                                </div>
                                <span class="type-badge" style="background-color:#E4F0E8;color:#3B7D57;border-color:#D1FAE5">{{ 'HOTEL' | translate }}</span>
                              }
                              @case (2) {
                                <div class="type-icon-wrapper" style="background-color:#F3E8FF">
                                  <i class="fas fa-map-marked-alt" style="color:#8B5CF6"></i>
                                </div>
                                <span class="type-badge" style="background-color:#F3E8FF;color:#7C3AED;border-color:#E9D5FF">{{ 'TRIP' | translate }}</span>
                              }
                              @case (3) {
                                <div class="type-icon-wrapper" style="background-color:#DBEAFE">
                                  <i class="fas fa-file-alt" style="color:#3B82F6"></i>
                                </div>
                                <span class="type-badge" style="background-color:#DBEAFE;color:#2563EB;border-color:#BFDBFE">{{ 'VISA' | translate }}</span>
                              }
                              @case (4) {
                                <div class="type-icon-wrapper" style="background-color:#FEE2E2">
                                  <i class="fas fa-utensils" style="color:#EF4444"></i>
                                </div>
                                <span class="type-badge" style="background-color:#FEE2E2;color:#DC2626;border-color:#FECACA">{{ 'FOOD' | translate }}</span>
                              }
                              @case (5) {
                                <div class="type-icon-wrapper" style="background-color:#FEF3C7">
                                  <i class="fas fa-ticket-alt" style="color:#D97706"></i>
                                </div>
                                <span class="type-badge" style="background-color:#FEF3C7;color:#B45309;border-color:#FDE68A">{{ 'TICKET' | translate }}</span>
                              }
                            }
                          </div>
                        </td>

                        <!-- Quotation Number -->
                        <td class="table-cell">
                          <div class="code-value">{{ voucher.RequestVoucherCode }}</div>
                        </td>

                        <!-- Date -->
                        <td class="table-cell">
                          <div class="date-value">{{ voucher.AddedDate | date:'dd MMM yyyy' }}</div>
                          <div class="time-value">{{ voucher.AddedDate | date:'HH:mm' }}</div>
                        </td>

                        <!-- Price -->
                        <td class="table-cell price-cell">
                          @if ((voucher.TotalPriceWithTax ?? 0) === 0) {
                            <div class="price-na">{{ 'N/A' | translate }}</div>
                          } @else {
                            <div class="price-amount">
                              {{ voucher.TotalPriceWithTax ?? 0 | number:'1.2-2' }}
                              <span class="currency-symbol sar-symbol">R</span>
                            </div>
                          }
                        </td>

                        <!-- Admin Status -->
                        <td class="table-cell">
                          <span class="status-badge admin-status">{{ voucher.VoucherStatusForAdminTitle }}</span>
                        </td>

                        <!-- Agent Status -->
                        <td class="table-cell">
                          <span class="status-badge agent-status">{{ voucher.VoucherStatusForAgentTitle }}</span>
                        </td>

                        <!-- Actions -->
                        <td class="table-cell actions-cell">
                          <app-actions-dropdown
                            [actions]="voucherActionsList"
                            (actionSelected)="handleAction($event, voucher)" />
                        </td>

                      </tr>
                    }
                  }
                }
                @if (pagedVouchers().length === 0 && !isLoading()) {
                  <tr>
                    <td colspan="7" class="table-cell" style="text-align:center;padding:32px;color:#999">
                      {{ 'No vouchers found' | translate }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="ap-paginator">
        <mat-paginator
          [length]="totalCount()"
          [pageSize]="pageSize"
          [pageSizeOptions]="[5, 10, 20, 50]"
          showFirstLastButtons
          (page)="onPageChange($event)" />
      </div>
    </div>
  `,
  styles: [`
    /* ── Page ── */
    .ap-page { padding: 0; }

    .ap-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 16px;
    }

    .ap-title {
      font-size: 1.125rem;
      font-weight: 700;
      color: var(--sero-text-primary, #242E1A);
      margin: 0;
    }

    .ap-count {
      font-size: 0.875rem;
      color: #7B8574;
    }

    .ap-paginator {
      margin-top: 8px;
      display: flex;
      justify-content: flex-end;
    }

    /* ── Voucher Table (mirrors SalamApp general-voucher-table) ── */
    .voucher-table-container {
      width: 100%;
      padding: 16px;
      background-color: #F4F6F2;
      border-radius: 8px;
    }

    .table-wrapper {
      background-color: #F9F7F1;
      border-radius: 8px;
      border: 1px solid #D8DECF;
      overflow: hidden;
    }

    .table-content { overflow-x: auto; }

    .voucher-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 1000px;
    }

    .table-header {
      padding: 14px 12px;
      text-align: center;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      color: #242E1A;
      background-color: #F4F6F2;
      border-right: 1px solid #D8DECF;
      border-bottom: 1px solid #D8DECF;
      &:last-child { border-right: none; }
    }

    .table-row {
      background-color: #FFFFFF;
      border-bottom: 1px solid #D8DECF;
      transition: background 0.15s ease;
      &:hover { background-color: #F4F6F2; }
      &:last-child { border-bottom: none; }
      &:nth-child(even) {
        background-color: #F9F7F1;
        &:hover { background-color: #F4F6F2; }
      }
    }

    .table-cell {
      padding: 18px 12px;
      text-align: center;
      vertical-align: middle;
      border-right: 1px solid #D8DECF;
      &:last-child { border-right: none; }
    }

    .type-cell .type-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }

    .type-icon-wrapper {
      width: 32px; height: 32px;
      border-radius: 8px;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
      i { font-size: 14px; }
    }

    .type-badge {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border: 1px solid;
      white-space: nowrap;
    }

    .code-value {
      font-size: 12px;
      font-weight: 500;
      color: #242E1A;
      font-family: 'Courier New', monospace;
    }

    .date-value { font-size: 12px; font-weight: 500; color: #242E1A; margin-bottom: 3px; }
    .time-value { font-size: 11px; color: #7B8574; font-weight: 400; }

    .price-na { font-size: 12px; color: #7B8574; font-weight: 400; }

    .price-amount {
      font-size: 13px; font-weight: 600; color: #242E1A;
      display: inline-flex; align-items: center; gap: 4px;
      .currency-symbol { font-size: 12px; color: #7B8574; }
    }

    .status-badge {
      display: inline-flex; align-items: center; justify-content: center;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 10px; font-weight: 500;
      text-transform: uppercase; letter-spacing: 0.2px;
      border: 1px solid;
      white-space: nowrap;

      &.admin-status {
        background-color: #DBEAFE; color: #2563EB; border-color: #BFDBFE;
      }

      &.agent-status {
        background-color: #E4F0E8; color: #3B7D57; border-color: #D1FAE5;
      }
    }

    .actions-cell { padding: 8px 12px; }
  `]
})
export class ApprovalsPageComponent implements OnInit {
  private readonly dialog  = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  readonly typeIds = [1, 2, 3, 4, 5];
  readonly pageSize = 10;

  isLoading   = signal(false);
  totalCount  = signal(mockVouchers.length);
  pageIndex   = signal(0);
  pagedVouchers = signal<VoucherModel[]>([]);

  readonly voucherActionsList: DropdownAction[] = [
    { label: 'View Quotation Details', value: 'voucher_details' },
    { label: 'Download Quotation PDF', value: 'download_pdf' },
    { label: 'Finance Approval',       value: 'finance_approval', status: 6 },
  ];

  ngOnInit() {
    this.loadPage();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.loadPage();
  }

  private loadPage() {
    this.isLoading.set(true);
    const start = this.pageIndex() * this.pageSize;
    this.totalCount.set(mockVouchers.length);
    this.pagedVouchers.set(mockVouchers.slice(start, start + this.pageSize));
    this.isLoading.set(false);
  }

  handleAction(action: DropdownAction, voucher: VoucherModel): void {
    if (action.value === 'voucher_details') {
      this.openVoucherDetails(voucher);
      return;
    }

    if (action.value === 'download_pdf') {
      this.snackBar.open(
        this.translate.instant('PDF download is not available in prototype mode'),
        this.translate.instant('Close'),
        { duration: 3000 }
      );
      return;
    }

    if (action.value === 'finance_approval') {
      this.openApprovalConfirm(voucher);
      return;
    }
  }

  private openVoucherDetails(voucher: VoucherModel) {
    this.dialog.open(VoucherDetailDialogComponent, {
      width: '560px',
      maxWidth: '95vw',
      data: voucher
    });
  }

  private openApprovalConfirm(voucher: VoucherModel) {
    this.dialog.open(FinanceApprovalDialogComponent, {
      width: '420px',
      data: {
        title: 'Finance Approval',
        message: `Approve voucher ${voucher.RequestVoucherCode}?`,
        onConfirm: () => {
          mockVouchers = mockVouchers.filter(v => v.RequestVoucherID !== voucher.RequestVoucherID);
          this.loadPage();
          this.snackBar.open(
            this.translate.instant('Voucher approved successfully'),
            this.translate.instant('Close'),
            { duration: 3000 }
          );
        }
      }
    });
  }
}
