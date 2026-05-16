import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { VoucherStatusLog } from '../../models/operation-voucher.model';
import { OperationsMockService } from '../../operations-mock.service';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

type VoucherLogsDialogData = {
  voucherId: number | null | undefined;
  agentId: number | null | undefined;
  logType: 'admin-log' | 'agent-log' | null | undefined;
};

@Component({
  selector: 'voucher-logs',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="operation-modal relative">
      <loading-spinner [isLoading]="isLoading()" [message]="'Loading logs...' | translate" />

      <div class="operation-modal__header">
        <div class="operation-modal__title-row">
          <h2>
            <i class="fas fa-file-alt"></i>
            {{ 'Quotation' | translate }} {{ logType === 'agent-log' ? ('Agent' | translate) : ('Admin' | translate) }} {{ 'Logs' | translate }}
          </h2>
          <button type="button" class="icon-close" (click)="close()" [attr.aria-label]="'Close' | translate">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <p>{{ 'Recent status changes for this quotation' | translate }}</p>
      </div>

      <div class="operation-modal__body">
        <div class="section-label">
          <i class="fas fa-history"></i>
          <span>{{ 'Status Change History' | translate }}</span>
        </div>

        <div class="table-shell">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>{{ 'Status' | translate }}</th>
                <th>{{ 'Notes' | translate }}</th>
                <th>{{ 'By' | translate }}</th>
                <th>{{ 'Date' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (item of log(); track $index) {
                <tr>
                  <td>{{ $index + 1 }}</td>
                  <td>{{ item.StatusTitle }}</td>
                  <td>{{ item.Notes || ('-' | translate) }}</td>
                  <td>{{ item.CreatedBy || ('System' | translate) }}</td>
                  <td>{{ item.CreatedAt | date: 'medium' }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="empty-cell">
                    <i class="fas fa-inbox"></i>
                    <div>{{ 'No logs found' | translate }}</div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

      <div class="operation-modal__footer">
        <button type="button" class="btn btn--secondary" (click)="close()">{{ 'Close' | translate }}</button>
      </div>
    </div>
  `,
  styles: [`
    .relative { position: relative; }
    .operation-modal { background: #fff; overflow: hidden; border-radius: 10px; }
    .operation-modal__header { border-bottom: 1px solid #f3f4f6; padding: 20px; }
    .operation-modal__title-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    h2 { margin: 0; font-size: 24px; font-weight: 600; color: #111827; display: flex; align-items: center; gap: 8px; }
    h2 i, .section-label i { color: #3a472a; }
    p { margin: 4px 0 0; color: #6b7280; font-size: 13px; }
    .icon-close { border: none; background: transparent; color: #9ca3af; cursor: pointer; font-size: 18px; padding: 4px; }
    .operation-modal__body { max-height: 60vh; overflow-y: auto; padding: 20px; }
    .section-label { display: flex; align-items: center; gap: 10px; color: #374151; font-size: 14px; font-weight: 600; margin-bottom: 16px; }
    .table-shell { background: #fff; border: 1px solid #f3f4f6; border-radius: 8px; overflow-x: auto; }
    table { width: 100%; min-width: 680px; border-collapse: collapse; }
    th { background: #f9fafb; color: #6b7280; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; text-align: start; padding: 12px 24px; }
    td { color: #111827; font-size: 14px; padding: 16px 24px; border-top: 1px solid #e5e7eb; }
    tr:hover td { background: #f9fafb; }
    .empty-cell { text-align: center; color: #6b7280; padding: 32px; }
    .empty-cell i { display: block; color: #d1d5db; font-size: 28px; margin-bottom: 8px; }
    .operation-modal__footer { border-top: 1px solid #e5e7eb; padding: 20px; display: flex; justify-content: flex-end; }
    .btn { border-radius: 8px; padding: 12px 20px; font-size: 14px; font-weight: 500; cursor: pointer; border: 1px solid #e5e7eb; background: #fff; color: #374151; }
    .btn:hover { background: #f9fafb; }
  `],
})
export class VoucherLogsDialogComponent implements OnInit {
  private readonly voucherService = inject(OperationsMockService);
  private readonly dialogRef = inject(MatDialogRef<VoucherLogsDialogComponent>);
  private readonly data = inject<VoucherLogsDialogData>(MAT_DIALOG_DATA);

  readonly voucherId = this.data?.voucherId;
  readonly agentId = this.data?.agentId;
  readonly logType = this.data?.logType;
  readonly log = signal<VoucherStatusLog[]>([]);
  readonly isLoading = signal(false);

  ngOnInit(): void {
    this.loadLogs();
  }

  close(result?: boolean): void {
    this.dialogRef.close(result);
  }

  loadLogs(): void {
    if (!this.voucherId || !this.agentId || !this.logType) {
      this.close();
      return;
    }

    this.isLoading.set(true);
    const source = this.logType === 'admin-log'
      ? this.voucherService.getVoucherStatusLogForAdmin({ voucherID: this.voucherId, agentId: this.agentId })
      : this.voucherService.getVoucherStatusLogForAgent({ voucherID: this.voucherId, agentId: this.agentId });

    source.subscribe((logs) => {
      this.log.set(logs);
      this.isLoading.set(false);
    });
  }
}
