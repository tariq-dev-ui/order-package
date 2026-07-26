import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VoucherStatusLogModel } from '../orders.model';
import { OrdersService } from '../orders.service';

export interface VoucherLogsDialogData {
  voucherId: number;
  agentId: number;
}

@Component({
  selector: 'voucher-logs-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="vld-panel">
      <!-- Header -->
      <div class="vld-header">
        <div class="vld-header-content">
          <span class="material-icons-round">history</span>
          <div>
            <div class="vld-header-title">Voucher Activity Log</div>
            <div class="vld-header-sub">Voucher #{{ data.voucherId }}</div>
          </div>
        </div>
        <button class="vld-close" (click)="close()">
          <span class="material-icons-round">close</span>
        </button>
      </div>

      <!-- Body -->
      <div class="vld-body">
        @if (isLoading()) {
          <div class="vld-loading">
            <div class="vld-spinner"></div>
            <span>Loading activity log...</span>
          </div>
        } @else if (logs().length === 0) {
          <div class="vld-empty">
            <span class="material-icons-round">history_toggle_off</span>
            <p>No activity logs found</p>
          </div>
        } @else {
          <div class="vld-scroll">
            <table class="vld-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th>By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                @for (log of logs(); track log.RequestVoucherStatusLogID; let i = $index) {
                  <tr>
                    <td class="center">{{ i + 1 }}</td>
                    <td>
                      <span class="log-status-pill" [ngClass]="statusPillClass(log.StatusTitle)">
                        {{ log.StatusTitle }}
                      </span>
                    </td>
                    <td class="log-notes">{{ log.Notes || '—' }}</td>
                    <td>{{ log.CreatedBy }}</td>
                    <td class="log-date">{{ log.CreatedAt | date:'MMM d, y • h:mm a' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>

      <!-- Footer -->
      <div class="vld-footer">
        <button class="btn-close-footer" (click)="close()">
          <span class="material-icons-round">close</span> Close
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .vld-panel {
      display: flex; flex-direction: column; height: 100%;
      background: #fff; width: 100%;
    }

    .vld-header {
      background: linear-gradient(135deg, #2d5a27, #4a7c59);
      padding: 20px 24px; display: flex; align-items: center; justify-content: space-between;
      flex-shrink: 0;
    }
    .vld-header-content { display: flex; align-items: center; gap: 14px; }
    .vld-header-content .material-icons-round { font-size: 28px; color: rgba(255,255,255,.8); }
    .vld-header-title { font-size: 18px; font-weight: 700; color: #fff; }
    .vld-header-sub   { font-size: 12px; color: rgba(255,255,255,.7); margin-top: 2px; }
    .vld-close {
      background: rgba(255,255,255,.15); border: none; border-radius: 8px;
      padding: 6px; cursor: pointer; color: #fff; display: flex; align-items: center;
      transition: background 0.15s;
    }
    .vld-close:hover { background: rgba(255,255,255,.25); }
    .vld-close .material-icons-round { font-size: 20px; }

    .vld-body { flex: 1; overflow: hidden; display: flex; flex-direction: column; }

    .vld-loading, .vld-empty {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 10px; color: #9ca3af; padding: 48px 16px; flex: 1;
    }
    .vld-loading .material-icons-round, .vld-empty .material-icons-round { font-size: 36px; }
    .vld-spinner {
      width: 24px; height: 24px; border: 3px solid #e5e7eb;
      border-top-color: #2d5a27; border-radius: 50%; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .vld-scroll { flex: 1; overflow-y: auto; padding: 20px 24px; }
    .vld-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .vld-table thead tr { border-bottom: 2px solid #e5e7eb; }
    .vld-table th {
      padding: 10px 12px; text-align: left;
      font-size: 11px; font-weight: 700; color: #9ca3af;
      text-transform: uppercase; letter-spacing: .5px;
    }
    .vld-table td {
      padding: 12px; border-bottom: 1px solid #f3f4f6;
      vertical-align: middle; color: #374151;
    }
    .vld-table tbody tr:last-child td { border-bottom: none; }
    .vld-table tbody tr:hover td { background: #fafafa; }
    td.center { text-align: center; }
    .log-notes { max-width: 200px; color: #6b7280; font-size: 12px; }
    .log-date  { font-size: 12px; color: #9ca3af; white-space: nowrap; }

    .log-status-pill {
      padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;
      white-space: nowrap;
    }
    .pill-success { background: #f0fdf4; color: #166534; }
    .pill-warning { background: #fffbeb; color: #92400e; }
    .pill-danger  { background: #fef2f2; color: #991b1b; }
    .pill-neutral { background: #f9fafb; color: #374151; border: 1px solid #e5e7eb; }

    .vld-footer {
      border-top: 1px solid #e5e7eb; padding: 14px 24px;
      display: flex; justify-content: flex-end; flex-shrink: 0;
    }
    .btn-close-footer {
      display: inline-flex; align-items: center; gap: 6px;
      background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px;
      padding: 8px 18px; font-size: 13px; font-weight: 600; cursor: pointer; color: #374151;
      transition: all 0.15s;
    }
    .btn-close-footer:hover { background: #e5e7eb; }
    .btn-close-footer .material-icons-round { font-size: 16px; }
  `],
})
export class VoucherLogsDialogComponent implements OnInit {
  readonly data: VoucherLogsDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<VoucherLogsDialogComponent>);
  private readonly ordersService = inject(OrdersService);

  logs = signal<VoucherStatusLogModel[]>([]);
  isLoading = signal(true);

  ngOnInit() {
    this.ordersService.getVoucherLogs(this.data.voucherId, this.data.agentId).subscribe({
      next: (data) => this.logs.set(data),
      error: () => this.logs.set([]),
      complete: () => this.isLoading.set(false),
    });
  }

  statusPillClass(title: string): string {
    const t = (title ?? '').toLowerCase();
    if (t.includes('approv') || t.includes('confirm') || t.includes('success'))  return 'pill-success';
    if (t.includes('reject') || t.includes('cancel') || t.includes('fail'))      return 'pill-danger';
    if (t.includes('pending') || t.includes('review'))                            return 'pill-warning';
    return 'pill-neutral';
  }

  close() { this.dialogRef.close(); }
}
