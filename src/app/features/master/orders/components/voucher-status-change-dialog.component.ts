import {
  ChangeDetectionStrategy, Component, inject, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { OrdersService } from '../orders.service';

export interface VoucherStatusChangeDialogData {
  voucherId: number;
  agentId: number;
  voucherTypeId: number;
  currentAdminStatus: number;
  currentAgentStatus: number;
  newStatus: number;
}

@Component({
  selector: 'voucher-status-change-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="vscd-wrap">
      <!-- Header -->
      <div class="vscd-header" [class.reject-header]="isReject()">
        <span class="material-icons-round header-icon">{{ isReject() ? 'cancel' : 'check_circle' }}</span>
        <div>
          <div class="header-title">{{ isReject() ? 'Reject Voucher' : 'Approve Voucher' }}</div>
          <div class="header-sub">Voucher #{{ data.voucherId }}</div>
        </div>
      </div>

      <!-- Body -->
      <div class="vscd-body">
        <p class="confirm-msg">
          {{ isReject()
              ? 'Are you sure you want to reject this voucher? Please provide a reason below.'
              : 'Are you sure you want to approve this voucher? You may add notes below.' }}
        </p>

        <div class="field-wrap">
          <label class="field-label">Notes {{ isReject() ? '(required)' : '(optional)' }}</label>
          <textarea
            class="field-textarea"
            [(ngModel)]="notes"
            rows="4"
            [placeholder]="isReject() ? 'Provide rejection reason...' : 'Add approval notes...'">
          </textarea>
        </div>

        @if (error()) {
          <div class="vscd-error">{{ error() }}</div>
        }
      </div>

      <!-- Footer -->
      <div class="vscd-footer">
        <button class="btn-cancel" (click)="cancel()" [disabled]="isSaving()">Cancel</button>
        <button
          class="btn-submit"
          [class.reject-btn]="isReject()"
          (click)="submit()"
          [disabled]="isSaving() || (isReject() && !notes.trim())">
          @if (isSaving()) {
            <span class="btn-spinner"></span>
          } @else {
            <span class="material-icons-round">{{ isReject() ? 'cancel' : 'check_circle' }}</span>
          }
          {{ isSaving() ? 'Processing...' : (isReject() ? 'Reject' : 'Approve') }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .vscd-wrap { min-width: 400px; }

    .vscd-header {
      background: linear-gradient(135deg, #2d5a27, #4a7c59);
      padding: 20px 24px; display: flex; align-items: center; gap: 14px;
    }
    .vscd-header.reject-header { background: linear-gradient(135deg, #991b1b, #dc2626); }
    .header-icon { font-size: 28px; color: rgba(255,255,255,.85); }
    .header-title { font-size: 18px; font-weight: 700; color: #fff; }
    .header-sub   { font-size: 12px; color: rgba(255,255,255,.7); margin-top: 2px; }

    .vscd-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }

    .confirm-msg { font-size: 14px; color: #374151; line-height: 1.5; }

    .field-wrap { display: flex; flex-direction: column; gap: 6px; }
    .field-label { font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; }
    .field-textarea {
      width: 100%; padding: 10px 12px; border: 1px solid #d1d5db;
      border-radius: 8px; font-size: 14px; color: #111827;
      resize: vertical; box-sizing: border-box; font-family: inherit;
      transition: border-color 0.15s;
    }
    .field-textarea:focus { outline: none; border-color: #2d5a27; }

    .vscd-error {
      background: #fef2f2; border: 1px solid #fecaca;
      border-radius: 8px; padding: 10px 14px;
      font-size: 13px; color: #991b1b;
    }

    .vscd-footer {
      display: flex; gap: 10px; justify-content: flex-end;
      padding: 16px 24px; border-top: 1px solid #e5e7eb;
    }
    .btn-cancel {
      background: #f3f4f6; border: 1px solid #e5e7eb; border-radius: 8px;
      padding: 9px 20px; font-size: 14px; font-weight: 600; cursor: pointer; color: #374151;
      transition: background 0.15s;
    }
    .btn-cancel:hover { background: #e5e7eb; }
    .btn-cancel:disabled { opacity: .5; cursor: not-allowed; }

    .btn-submit {
      display: inline-flex; align-items: center; gap: 6px;
      background: #2d5a27; border: none; border-radius: 8px;
      padding: 9px 20px; font-size: 14px; font-weight: 600;
      cursor: pointer; color: #fff; transition: background 0.15s;
    }
    .btn-submit:hover { background: #1e3d1a; }
    .btn-submit.reject-btn { background: #dc2626; }
    .btn-submit.reject-btn:hover { background: #b91c1c; }
    .btn-submit:disabled { opacity: .6; cursor: not-allowed; }
    .btn-submit .material-icons-round { font-size: 16px; }

    .btn-spinner {
      width: 14px; height: 14px; border: 2px solid rgba(255,255,255,.4);
      border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class VoucherStatusChangeDialogComponent {
  readonly data: VoucherStatusChangeDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<VoucherStatusChangeDialogComponent>);
  private readonly ordersService = inject(OrdersService);

  notes = '';
  isSaving = signal(false);
  error = signal('');

  isReject() { return this.data.newStatus === 10; }

  submit() {
    if (this.isReject() && !this.notes.trim()) return;
    this.isSaving.set(true);
    this.error.set('');

    const obs = this.isReject()
      ? this.ordersService.rejectVoucherFromAgent(this.data.voucherId, this.data.agentId, this.notes)
      : this.ordersService.approveVoucherFromAgent(this.data.voucherId, this.data.agentId, this.notes);

    obs.subscribe({
      next: () => this.dialogRef.close(true),
      error: () => {
        this.error.set('An error occurred. Please try again.');
        this.isSaving.set(false);
      },
    });
  }

  cancel() { this.dialogRef.close(false); }
}
