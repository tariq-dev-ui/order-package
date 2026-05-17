import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { OperationRequest } from '../../models/operation-voucher.model';
import { OperationsMockService } from '../../operations-mock.service';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

type RequestDetailsDialogData = {
  requestId: number | undefined;
  agentId: number | undefined;
};

@Component({
  selector: 'request-details',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="request-panel relative">
      <loading-spinner [isLoading]="isLoading()" [message]="'Loading Request Data...' | translate" />

      <div class="request-panel__header">
        <div>
          <h2>
            <i class="fas fa-user-tie"></i>
            {{ 'Request Details' | translate }}
          </h2>
          <p>{{ 'View request information and related details' | translate }}</p>
        </div>
        <button type="button" class="icon-close" (click)="onClose()" [attr.aria-label]="'Close' | translate">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="request-panel__body">
        @if (requestDetails()) {
          <div class="details-card">
            <div class="details-card__header">
              <h3>{{ requestDetails()?.PackageTitle }}</h3>
              <span>{{ requestDetails()?.StatusTitle }}</span>
            </div>

            <div class="details-grid">
              <div class="detail-item">
                <span>{{ 'Request Code' | translate }}</span>
                <strong>{{ requestDetails()?.RequestCode }}</strong>
              </div>
              <div class="detail-item">
                <span>{{ 'Agent' | translate }}</span>
                <strong>{{ requestDetails()?.AgentName }}</strong>
              </div>
              <div class="detail-item">
                <span>{{ 'Pax' | translate }}</span>
                <strong>{{ requestDetails()?.PaxCount }}</strong>
              </div>
              <div class="detail-item">
                <span>{{ 'Travel Date' | translate }}</span>
                <strong>{{ requestDetails()?.TravelDate | date: 'dd MMM yyyy' }}</strong>
              </div>
              <div class="detail-item">
                <span>{{ 'Return Date' | translate }}</span>
                <strong>{{ requestDetails()?.ReturnDate | date: 'dd MMM yyyy' }}</strong>
              </div>
              <div class="detail-item">
                <span>{{ 'Services' | translate }}</span>
                <strong>{{ requestDetails()?.Services?.join(', ') }}</strong>
              </div>
            </div>

            @if (requestDetails()?.Notes) {
              <div class="notes">
                <span>{{ 'Notes' | translate }}</span>
                <p>{{ requestDetails()?.Notes }}</p>
              </div>
            }
          </div>
        }
      </div>

      <div class="request-panel__footer">
        <button type="button" class="btn" (click)="onClose()">{{ 'Close' | translate }}</button>
      </div>
    </div>
  `,
  styles: [`
    .relative { position: relative; }
    .request-panel { height: 100%; display: flex; flex-direction: column; overflow: hidden; background: #fff; border-radius: 10px; }
    .request-panel__header { flex-shrink: 0; display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; border-bottom: 1px solid #f3f4f6; padding: 20px; }
    h2 { margin: 0; display: flex; align-items: center; gap: 8px; font-size: 24px; font-weight: 600; color: #111827; }
    h2 i { color: #3a472a; }
    p { margin: 4px 0 0; color: #6b7280; font-size: 13px; }
    .icon-close { border: none; background: transparent; color: #9ca3af; cursor: pointer; font-size: 18px; padding: 4px; }
    .request-panel__body { flex: 1; overflow-y: auto; padding: 20px; background: #f4f6f2; }
    .details-card { border: 1px solid #d8decf; border-radius: 8px; overflow: hidden; background: #fff; }
    .details-card__header { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 16px 20px; background: #f9f7f1; border-bottom: 2px solid #d8decf; }
    .details-card__header h3 { margin: 0; color: #242e1a; font-size: 15px; font-weight: 800; }
    .details-card__header span { border-radius: 999px; background: #e4f0e8; color: #3b7d57; padding: 4px 12px; font-size: 12px; font-weight: 700; }
    .details-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .detail-item { display: flex; align-items: center; gap: 10px; min-height: 54px; padding: 12px 20px; border-bottom: 1px solid #d8decf; border-inline-end: 1px solid #d8decf; }
    .detail-item span { color: #7b8574; font-size: 13px; white-space: nowrap; }
    .detail-item strong { color: #242e1a; font-size: 13px; }
    .notes { padding: 18px 20px; }
    .notes span { color: #7b8574; font-size: 12px; font-weight: 700; text-transform: uppercase; }
    .notes p { margin-top: 8px; background: #f4f6f2; border-radius: 8px; padding: 12px; color: #242e1a; }
    .request-panel__footer { flex-shrink: 0; display: flex; justify-content: flex-end; padding: 20px; border-top: 1px solid #e5e7eb; }
    .btn { border: 1px solid #e5e7eb; background: #fff; color: #374151; border-radius: 8px; padding: 12px 20px; font-size: 14px; cursor: pointer; }
    .btn:hover { background: #f9fafb; }
    @media (max-width: 800px) { .details-grid { grid-template-columns: 1fr; } }
  `],
})
export class RequestDetailsDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<RequestDetailsDialogComponent>);
  private readonly data = inject<RequestDetailsDialogData>(MAT_DIALOG_DATA);
  private readonly operationsService = inject(OperationsMockService);

  readonly requestId = this.data?.requestId;
  readonly agentId = this.data?.agentId;
  readonly requestDetails = signal<OperationRequest | null>(null);
  readonly isLoading = signal(false);

  ngOnInit(): void {
    this.loadRequestDetails();
  }

  onClose(): void {
    this.dialogRef.close();
  }

  private loadRequestDetails(): void {
    if (!this.requestId) {
      return;
    }

    this.isLoading.set(true);
    this.operationsService.getSeroRequest({ requestId: this.requestId, agentId: this.agentId }).subscribe((requestDetails) => {
      this.requestDetails.set(requestDetails);
      this.isLoading.set(false);
    });
  }
}
