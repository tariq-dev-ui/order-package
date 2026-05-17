import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { OperationsMockService } from '../../operations-mock.service';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'voucher-status-change',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="operation-modal relative">
      <loading-spinner [isLoading]="isSubmittingData()" [message]="'Submitting status change...' | translate" />

      <div class="operation-modal__header">
        <div class="operation-modal__title-row">
          <h2>
            <i class="fas fa-user"></i>
            {{ 'Change Quotation Status' | translate }}
          </h2>
          <button type="button" class="icon-close" (click)="close()" [attr.aria-label]="'Close' | translate">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <p>{{ 'Fill in the details below to change the quotation status' | translate }}</p>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="operation-modal__body">
          <label for="notes">
            <i class="fas fa-sticky-note"></i>
            {{ 'Notes' | translate }}
          </label>
          <textarea
            id="notes"
            formControlName="notes"
            rows="4"
            [placeholder]="'Add your notes here...' | translate"></textarea>
        </div>

        <div class="operation-modal__footer">
          <button type="button" class="btn btn--secondary" (click)="close()">{{ 'Cancel' | translate }}</button>
          <button type="submit" class="btn btn--primary">
            <i class="fas fa-check"></i>
            {{ 'Change Status' | translate }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .relative { position: relative; }
    .operation-modal { background: #fff; overflow: hidden; border-radius: 10px; }
    .operation-modal__header { border-bottom: 1px solid #f3f4f6; padding: 20px; }
    .operation-modal__title-row { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    h2 { margin: 0; font-size: 24px; font-weight: 600; color: #111827; display: flex; align-items: center; gap: 8px; }
    h2 i, label i { color: #3a472a; }
    p { margin: 4px 0 0; color: #6b7280; font-size: 13px; }
    .icon-close { border: none; background: transparent; color: #9ca3af; cursor: pointer; font-size: 18px; padding: 4px; }
    .icon-close:hover { color: #6b7280; }
    .operation-modal__body { max-height: 60vh; overflow-y: auto; padding: 20px; }
    label { display: flex; align-items: center; gap: 8px; color: #374151; font-weight: 500; font-size: 14px; margin-bottom: 8px; }
    textarea { width: 100%; min-height: 110px; resize: vertical; border: 1px solid #d1d5db; border-radius: 6px; padding: 12px; font: inherit; color: #111827; outline: none; }
    textarea:focus { border-color: #3a472a; box-shadow: 0 0 0 3px rgba(58, 71, 42, 0.12); }
    .operation-modal__footer { border-top: 1px solid #e5e7eb; padding: 20px; display: flex; justify-content: flex-end; align-items: center; gap: 12px; }
    .btn { border-radius: 8px; padding: 12px 20px; font-size: 14px; font-weight: 500; cursor: pointer; border: 1px solid transparent; display: inline-flex; align-items: center; gap: 8px; }
    .btn--secondary { background: #fff; color: #374151; border-color: #e5e7eb; }
    .btn--secondary:hover { background: #f9fafb; }
    .btn--primary { background: #3a472a; color: #fff; }
    .btn--primary:hover { background: #303b23; }
  `],
})
export class VoucherStatusChangeDialogComponent {
  private readonly voucherService = inject(OperationsMockService);
  private readonly dialogRef = inject(MatDialogRef<VoucherStatusChangeDialogComponent>, { optional: true });

  @Input() voucherId: number | null = null;
  @Input() agentId: number | null = null;
  @Input() voucherType: string | null = null;
  @Input() currentAdminStatus: number | null = null;
  @Input() currentAgentStatus: number | null = null;
  @Input() newStatus: number | null | undefined;

  @Output() submitted = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();

  readonly isSubmittingData = signal(false);

  readonly form = new FormGroup({
    notes: new FormControl<string | null>(null),
  });

  submit(): void {
    if (!this.voucherId || !this.agentId) {
      return;
    }

    this.isSubmittingData.set(true);
    const notes = this.form.value.notes ?? '';

    this.voucherService.approveVoucherFromOperation({
      voucherID: this.voucherId,
      agentId: this.agentId,
      notes,
    }).subscribe(() => {
      this.isSubmittingData.set(false);
      this.submitted.emit();
    });
  }

  close(): void {
    this.closed.emit();
    this.dialogRef?.close(false);
  }
}
