import {
  ChangeDetectionStrategy, Component, inject, input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { RequestVoucherModel } from '../orders.model';
import { ActionsDropdownComponent, DropdownAction } from '../../../../components/actions-dropdown/actions-dropdown.component';
import { VoucherDetailsDialogComponent } from './voucher-details-dialog.component';
import { VoucherStatusChangeDialogComponent } from './voucher-status-change-dialog.component';
import { VoucherLogsDialogComponent } from './voucher-logs-dialog.component';

const TYPE_LABELS: Record<number, { label: string; icon: string; colorClass: string }> = {
  1: { label: 'Hotel',     icon: 'hotel',         colorClass: 'type-hotel' },
  2: { label: 'Transport', icon: 'directions_bus', colorClass: 'type-transport' },
  3: { label: 'Visa',      icon: 'article',       colorClass: 'type-visa' },
  4: { label: 'Catering',  icon: 'restaurant',    colorClass: 'type-catering' },
  5: { label: 'Flight',    icon: 'flight',        colorClass: 'type-flight' },
};

@Component({
  selector: 'voucher-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ActionsDropdownComponent],
  template: `
    <div class="vt-wrap">
      @if (vouchers().length === 0) {
        <div class="vt-empty">
          <span class="material-icons-round">receipt_long</span>
          <p>No vouchers found for this order</p>
        </div>
      } @else {
        <div class="vt-scroll">
          <table class="vt-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Req ID</th>
                <th>Voucher Code</th>
                <th>Date</th>
                <th>Price</th>
                <th>Admin Status</th>
                <th>Agent Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              @for (v of vouchers(); track v.RequestVoucherID) {
                <tr>
                  <td>
                    @if (typeInfo(v); as t) {
                      <div class="type-cell">
                        <span class="type-icon-wrap" [ngClass]="t.colorClass">
                          <span class="material-icons-round">{{ t.icon }}</span>
                        </span>
                        <span class="type-badge" [ngClass]="t.colorClass">{{ t.label }}</span>
                      </div>
                    }
                  </td>
                  <td class="center mono">{{ v.SeroPackageRequestID }}</td>
                  <td class="center mono">{{ v.RequestVoucherCode }}</td>
                  <td class="center">{{ v.AddedDate | date:'dd MMM yyyy' }}</td>
                  <td class="center">
                    @if (v.TotalPriceWithTax === 0) {
                      <span class="price-na">N/A</span>
                    } @else {
                      <span class="price-val">{{ v.TotalPriceWithTax | number:'1.2-2' }}</span>
                      <span class="price-cur">SAR</span>
                    }
                  </td>
                  <td class="center">
                    <span class="status-pill admin">{{ v.VoucherStatusForAdminTitle }}</span>
                  </td>
                  <td class="center">
                    <span class="status-pill agent">{{ v.VoucherStatusForAgentTitle }}</span>
                  </td>
                  <td class="center">
                    <app-actions-dropdown
                      [actions]="getActions(v)"
                      (actionSelected)="handleAction($event, v)">
                    </app-actions-dropdown>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </div>
  `,
  styles: [`
    .vt-wrap { padding: 16px 24px 24px; }

    .vt-empty {
      text-align: center; padding: 40px 16px; color: #9ca3af;
      display: flex; flex-direction: column; align-items: center; gap: 8px;
    }
    .vt-empty .material-icons-round { font-size: 36px; }
    .vt-empty p { font-size: 13px; }

    .vt-scroll { overflow-x: auto; }

    .vt-table {
      width: 100%; border-collapse: collapse; font-size: 13px;
    }
    .vt-table thead tr {
      border-bottom: 1px solid #e5e7eb;
    }
    .vt-table th {
      padding: 10px 12px; text-align: left;
      font-size: 11px; font-weight: 600; color: #9ca3af;
      text-transform: uppercase; letter-spacing: .5px; white-space: nowrap;
    }
    .vt-table td {
      padding: 12px; border-bottom: 1px solid #f3f4f6;
      vertical-align: middle;
    }
    .vt-table tbody tr:last-child td { border-bottom: none; }
    .vt-table tbody tr:hover td { background: #fafafa; }

    td.center { text-align: center; }
    td.mono { font-family: monospace; font-size: 12px; }

    .type-cell { display: flex; align-items: center; gap: 6px; }
    .type-icon-wrap {
      width: 26px; height: 26px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .type-icon-wrap .material-icons-round { font-size: 13px; }
    .type-badge {
      padding: 2px 8px; border-radius: 12px;
      font-size: 11px; font-weight: 600;
    }
    .type-hotel    { background: #f0fdf4; color: #166534; }
    .type-transport{ background: #eff6ff; color: #1e40af; }
    .type-visa     { background: #eff6ff; color: #1d4ed8; }
    .type-catering { background: #fef2f2; color: #991b1b; }
    .type-flight   { background: #fffbeb; color: #92400e; }

    .price-val { font-weight: 700; color: #111827; display: block; }
    .price-cur { font-size: 11px; color: #9ca3af; }
    .price-na  { color: #9ca3af; font-size: 12px; }

    .status-pill {
      padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;
      white-space: nowrap;
    }
    .status-pill.admin { background: #eff6ff; color: #1e40af; }
    .status-pill.agent { background: #f0fdf4; color: #166534; }
  `],
})
export class VoucherTableComponent {
  vouchers = input.required<RequestVoucherModel[]>();
  agentId = input<number>(0);

  private readonly dialog = inject(MatDialog);

  typeInfo(v: RequestVoucherModel) {
    return TYPE_LABELS[v.RequestVoucherTypeID];
  }

  getActions(v: RequestVoucherModel): DropdownAction[] {
    const actions: DropdownAction[] = [
      { label: 'View Details',     value: 'view_details',      translate: false },
      { label: 'Request Details',  value: 'request_details',   translate: false },
      { label: 'Agent Log',        value: 'agent_log',         translate: false },
      { label: 'Download PDF',     value: 'download_pdf',      translate: false },
    ];
    if (v.VoucherStatusForAdminID === 2) {
      actions.push({ label: 'Approve',   value: 'approve', status: 2,  translate: false });
      actions.push({ label: 'Reject',    value: 'reject',  status: 10, translate: false });
    }
    return actions;
  }

  handleAction(action: DropdownAction, v: RequestVoucherModel) {
    switch (action.value) {
      case 'view_details':
        this.dialog.open(VoucherDetailsDialogComponent, {
          width: '900px', maxWidth: '97vw',
          position: { right: '0', top: '0' },
          height: '100vh', maxHeight: '100vh',
          panelClass: 'slide-panel',
          data: { voucherId: v.RequestVoucherID, agentId: this.agentId() },
        });
        break;
      case 'agent_log':
        this.dialog.open(VoucherLogsDialogComponent, {
          width: '700px', maxWidth: '97vw',
          position: { right: '0', top: '0' },
          height: '100vh', maxHeight: '100vh',
          panelClass: 'slide-panel',
          data: { voucherId: v.RequestVoucherID, agentId: this.agentId() },
        });
        break;
      case 'approve':
        this.dialog.open(VoucherStatusChangeDialogComponent, {
          width: '480px', maxWidth: '95vw',
          data: {
            voucherId: v.RequestVoucherID,
            agentId: this.agentId(),
            voucherTypeId: v.RequestVoucherTypeID,
            currentAdminStatus: v.VoucherStatusForAdminID,
            currentAgentStatus: v.VoucherStatusForAgentID,
            newStatus: 2,
          },
        });
        break;
      case 'reject':
        this.dialog.open(VoucherStatusChangeDialogComponent, {
          width: '480px', maxWidth: '95vw',
          data: {
            voucherId: v.RequestVoucherID,
            agentId: this.agentId(),
            voucherTypeId: v.RequestVoucherTypeID,
            currentAdminStatus: v.VoucherStatusForAdminID,
            currentAgentStatus: v.VoucherStatusForAgentID,
            newStatus: 10,
          },
        });
        break;
      case 'download_pdf':
        alert('PDF download: coming soon');
        break;
      case 'request_details':
        break;
    }
  }
}
