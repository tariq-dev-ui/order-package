import {
  ChangeDetectionStrategy, Component, EventEmitter,
  Input, Output, signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DashboardVoucherDetailsModel, DropdownAction } from '../distributed-dashboard.model';
import { DashActionsDropdownComponent } from './actions-dropdown.component';
import { SeroCurrencyPipe } from 'src/app/shared/pipes/sero-currency.pipe';

@Component({
  selector: 'app-dash-voucher-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, CommonModule, DashActionsDropdownComponent, SeroCurrencyPipe],
  template: `
    <div class="vt-wrap">
      <div class="vt-scroll custom-scroll">
        <table class="vt-table">
          <thead class="vt-head">
            <tr>
              <th class="vt-th">Type</th>
              <th class="vt-th">Req ID</th>
              <th class="vt-th">Quotation No.</th>
              <th class="vt-th">Quotation Date</th>
              <th class="vt-th">Price</th>
              <th class="vt-th">Admin Status</th>
              <th class="vt-th">Agent Status</th>
              <th class="vt-th">Actions</th>
            </tr>
          </thead>
          <tbody class="vt-body">
            @for (voucher of vouchers; track $index) {
              @if (voucher?.Voucher) {
                <tr class="vt-row">
                  <!-- Type -->
                  <td class="vt-td">
                    <div class="type-cell">
                      @switch (voucher.Voucher?.RequestVoucherTypeID ?? 0) {
                        @case (1) {
                          <div class="type-icon type-icon--hotel">
                            <span class="material-icons-round" style="font-size:14px">hotel</span>
                          </div>
                          <span class="type-badge type-badge--hotel">HOTEL</span>
                        }
                        @case (2) {
                          <div class="type-icon type-icon--trip">
                            <span class="material-icons-round" style="font-size:14px">directions_bus</span>
                          </div>
                          <span class="type-badge type-badge--trip">TRIP</span>
                        }
                        @case (3) {
                          <div class="type-icon type-icon--visa">
                            <span class="material-icons-round" style="font-size:14px">description</span>
                          </div>
                          <span class="type-badge type-badge--visa">VISA</span>
                        }
                        @case (4) {
                          <div class="type-icon type-icon--food">
                            <span class="material-icons-round" style="font-size:14px">restaurant</span>
                          </div>
                          <span class="type-badge type-badge--food">FOOD</span>
                        }
                        @case (5) {
                          <div class="type-icon type-icon--ticket">
                            <span class="material-icons-round" style="font-size:14px">confirmation_number</span>
                          </div>
                          <span class="type-badge type-badge--ticket">TICKET</span>
                        }
                      }
                    </div>
                  </td>

                  <!-- Req ID -->
                  <td class="vt-td vt-td--center">
                    <span class="vt-text">{{ voucher.Voucher?.SeroPackageRequestID }}</span>
                  </td>

                  <!-- Quotation No -->
                  <td class="vt-td vt-td--center">
                    <span class="vt-text">{{ voucher.Voucher?.RequestVoucherCode }}</span>
                  </td>

                  <!-- Quotation Date -->
                  <td class="vt-td vt-td--center">
                    <span class="vt-text">{{ voucher.Voucher?.AddedDate | date: 'dd MMM yyyy HH:mm' }}</span>
                  </td>

                  <!-- Price -->
                  <td class="vt-td vt-td--center">
                    @if (((voucher.Voucher?.TotalSellingPrice ?? 0)) === 0) {
                      <span class="vt-text vt-text--bold">N/A</span>
                    } @else {
                      <span class="vt-text vt-text--bold">
                        {{ (voucher.Voucher?.TotalSellingPrice ?? 0) + (voucher.Voucher?.TotalTax ?? 0) | seroCurrency }}
                      </span>
                    }
                  </td>

                  <!-- Admin Status -->
                  <td class="vt-td vt-td--center">
                    <span class="status-badge status-badge--admin">
                      {{ voucher.Voucher?.VoucherStatusForAdminTitle }}
                    </span>
                  </td>

                  <!-- Agent Status -->
                  <td class="vt-td vt-td--center">
                    <span class="status-badge status-badge--agent">
                      {{ voucher.Voucher?.VoucherStatusForAgentTitle }}
                    </span>
                  </td>

                  <!-- Actions -->
                  <td class="vt-td vt-td--center">
                    <app-dash-actions-dropdown
                      [actions]="getActionsForVoucher(voucher)"
                      (actionSelected)="handleAction($event, voucher)">
                    </app-dash-actions-dropdown>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .vt-wrap { position: relative; }

    .vt-scroll {
      overflow-x: auto;
      border-radius: 8px;
      border: 1px solid #f3f4f6;
      box-shadow: 0 1px 3px rgba(0,0,0,.06);
    }

    .vt-table {
      min-width: 700px;
      width: 100%;
      border-collapse: collapse;
      background: #fff;
    }

    .vt-head { background: #f9fafb; }

    .vt-th {
      padding: 8px 12px;
      text-align: center;
      font-size: 11px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 1px solid #e5e7eb;
      white-space: nowrap;
    }

    .vt-body tr { border-bottom: 1px solid #e5e7eb; }
    .vt-body tr:last-child { border-bottom: none; }

    .vt-row { background: #fff; transition: background 0.12s; }
    .vt-row:hover { background: #f9fafb; }

    .vt-td {
      padding: 8px 12px;
      white-space: nowrap;
    }
    .vt-td--center { text-align: center; }

    .vt-text { font-size: 13px; color: #111827; display: block; }
    .vt-text--bold { font-weight: 700; }
    .vt-text--sub { font-size: 11px; color: #6b7280; }

    /* Type icons */
    .type-cell { display: flex; align-items: center; gap: 8px; }

    .type-icon {
      width: 24px; height: 24px;
      border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      flex-shrink: 0;
    }
    .type-icon--hotel  { background: #dcfce7; color: #16a34a; }
    .type-icon--trip   { background: #f3e8ff; color: #9333ea; }
    .type-icon--visa   { background: #dbeafe; color: #2563eb; }
    .type-icon--food   { background: #fee2e2; color: #dc2626; }
    .type-icon--ticket { background: #fef3c7; color: #d97706; }

    .type-badge {
      padding: 2px 6px;
      font-size: 11px;
      font-weight: 600;
      border-radius: 4px;
      border: 1px solid;
    }
    .type-badge--hotel  { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
    .type-badge--trip   { background: #faf5ff; color: #7e22ce; border-color: #e9d5ff; }
    .type-badge--visa   { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
    .type-badge--food   { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
    .type-badge--ticket { background: #fffbeb; color: #b45309; border-color: #fde68a; }

    /* Status badges */
    .status-badge {
      display: inline-block;
      padding: 2px 8px;
      font-size: 11px;
      font-weight: 500;
      border-radius: 999px;
      border: 1px solid;
    }
    .status-badge--admin { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
    .status-badge--agent { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }

    .custom-scroll::-webkit-scrollbar { height: 6px; }
    .custom-scroll::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 3px; }
  `],
})
export class DashVoucherTableComponent {
  @Input({ required: true }) vouchers!: DashboardVoucherDetailsModel[] | null;
  @Input() voucherActionsList: DropdownAction[] = [];
  @Output() refreshVouchers = new EventEmitter<void>();

  getActionsForVoucher(voucher: DashboardVoucherDetailsModel): DropdownAction[] {
    const adminStatus = voucher.Voucher?.VoucherStatusForAdminID;
    const noStatusActions = this.voucherActionsList.filter(a => !('status' in a) || a.status === undefined);
    const statusActions = this.voucherActionsList.filter(a => typeof a.status === 'number');

    const result: DropdownAction[] = [...noStatusActions];
    const needApproval = statusActions.find(a => a.status === 2 && adminStatus === 2);
    if (needApproval) {
      result.push(needApproval);
      const reject = statusActions.find(a => a.status === 10);
      if (reject) result.push(reject);
    }
    return result;
  }

  handleAction(action: DropdownAction, voucher: DashboardVoucherDetailsModel): void {
    console.log('Action selected:', action.value, 'for voucher:', voucher.Voucher?.RequestVoucherID);
  }
}
