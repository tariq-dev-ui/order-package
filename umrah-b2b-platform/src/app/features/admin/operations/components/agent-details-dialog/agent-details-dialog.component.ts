import { CommonModule, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { OperationAgent, OperationAgentRepresentative } from '../../models/operation-voucher.model';
import { OperationsMockService } from '../../operations-mock.service';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-agent-details',
  standalone: true,
  imports: [CommonModule, DatePipe, LoadingSpinnerComponent, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="side-backdrop" (click)="onClose()">
      <div class="side-panel" (click)="$event.stopPropagation()">
        <loading-spinner [isLoading]="isLoadingAgentDetails() || isLoadingAgentRepresenters()" [message]="'Loading Agent Data...' | translate" />

        <div class="side-panel__header">
          <div class="title-wrap">
            <h2>{{ 'Agent Details' | translate }}</h2>
            @if (agentDetails()) {
              <span class="divider"></span>
              <span class="code">{{ agentDetails()?.AgentCode }}</span>
            }
          </div>
          <button type="button" class="panel-close" (click)="onClose()" [attr.aria-label]="'Close' | translate">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="side-panel__body">
          @if (agentDetails()) {
            <div class="info-card">
              <div class="info-card__header">
                <h3>
                  <i class="fas fa-info-circle"></i>
                  {{ 'Agent Information' | translate }}
                </h3>
              </div>
              <div class="info-grid">
                <div class="info-item">
                  <span>{{ 'Code' | translate }}</span>
                  <strong>{{ agentDetails()?.AgentCode || ('N/A' | translate) }}</strong>
                </div>
                <div class="info-item">
                  <span>{{ 'Name' | translate }}</span>
                  <strong>{{ agentDetails()?.AgentName || ('N/A' | translate) }}</strong>
                </div>
                <div class="info-item">
                  <span>{{ 'Email' | translate }}</span>
                  <strong>{{ agentDetails()?.AgentEmail || ('N/A' | translate) }}</strong>
                </div>
                <div class="info-item">
                  <span>{{ 'CR Number' | translate }}</span>
                  <strong>{{ agentDetails()?.CR_NO || ('N/A' | translate) }}</strong>
                </div>
                <div class="info-item">
                  <span>{{ 'Country' | translate }}</span>
                  <strong>{{ agentDetails()?.CountryName || ('N/A' | translate) }}</strong>
                </div>
                <div class="info-item">
                  <span>{{ 'City' | translate }}</span>
                  <strong>{{ agentDetails()?.CityName || ('N/A' | translate) }}</strong>
                </div>
                <div class="info-item">
                  <span>{{ 'Status' | translate }}</span>
                  <strong>
                    <span class="status-pill" [class.status-pill--inactive]="!agentDetails()?.IsActive">
                      <i class="fas fa-circle"></i>
                      {{ agentDetails()?.IsActive ? ('Active' | translate) : ('Inactive' | translate) }}
                    </span>
                  </strong>
                </div>
                <div class="info-item">
                  <span>{{ 'Added Date' | translate }}</span>
                  <strong>{{ agentDetails()?.AddedDate | date: 'dd MMM yyyy' }}</strong>
                </div>
                <div class="info-item">
                  <span>{{ 'Main Agent' | translate }}</span>
                  <strong>{{ agentDetails()?.MasterAgentName || ('N/A' | translate) }}</strong>
                </div>
              </div>

              @if (agentDetails()?.Address) {
                <div class="long-field">
                  <span>{{ 'Address' | translate }}</span>
                  <p>{{ agentDetails()?.Address }}</p>
                </div>
              }
              @if (agentDetails()?.Description) {
                <div class="long-field">
                  <span>{{ 'Description' | translate }}</span>
                  <p>{{ agentDetails()?.Description }}</p>
                </div>
              }
            </div>
          }

          <div class="info-card representatives-card">
            <div class="info-card__header info-card__header--between">
              <h3>
                <i class="fas fa-users"></i>
                {{ 'Representatives' | translate }}
              </h3>
              <span class="count-pill">{{ agentRepresenters().length || 0 }} {{ 'Total' | translate }}</span>
            </div>

            @if (agentRepresenters().length > 0) {
              <div class="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>{{ 'Name' | translate }}</th>
                      <th>{{ 'Email' | translate }}</th>
                      <th>{{ 'Mobile' | translate }}</th>
                      <th>{{ 'Status' | translate }}</th>
                      <th>{{ 'Added Date' | translate }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (rep of agentRepresenters(); track $index) {
                      <tr>
                        <td>
                          <div class="rep-name">
                            <span class="rep-avatar"><i class="fas fa-user"></i></span>
                            <strong>{{ rep.Name || ('Unnamed' | translate) }}</strong>
                          </div>
                        </td>
                        <td>{{ rep.Email || ('N/A' | translate) }}</td>
                        <td>{{ rep.Mobile || ('N/A' | translate) }}</td>
                        <td>
                          <span class="status-pill" [class.status-pill--inactive]="!rep.IsActive">
                            <i class="fas fa-circle"></i>
                            {{ rep.IsActive ? ('Active' | translate) : ('Inactive' | translate) }}
                          </span>
                        </td>
                        <td>{{ rep.AddedDate | date: 'dd MMM yyyy' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            } @else {
              <div class="empty-state">
                <i class="fas fa-user-slash"></i>
                <div>{{ 'No representatives found for this agent' | translate }}</div>
              </div>
            }
          </div>
        </div>

        <div class="side-panel__footer">
          @if (agentDetails()) {
            <div class="agent-summary">
              <strong>{{ 'Agent Summary' | translate }}</strong>
              <span>{{ 'Total Representatives:' | translate }} {{ agentRepresenters().length || 0 }}</span>
              <span>{{ 'Created:' | translate }} {{ agentDetails()?.AddedDate | date: 'dd MMM yyyy' }}</span>
            </div>
          }
          <button type="button" class="primary-close" (click)="onClose()">{{ 'Close' | translate }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .side-backdrop { position: fixed; inset: 0; z-index: 50; display: flex; align-items: flex-end; justify-content: flex-end; background: rgba(58, 71, 42, 0.15); }
    .side-panel { width: 100%; max-width: 960px; height: 100%; overflow: hidden; display: flex; flex-direction: column; position: relative; background: #f9f7f1; box-shadow: 0 25px 60px rgba(0, 0, 0, .22); animation: slide-in-right .3s ease-out; }
    .side-panel__header { flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; background: linear-gradient(135deg, #3a472a 0%, #4a5a38 50%, #3a472a 100%); }
    .title-wrap { display: flex; align-items: center; gap: 12px; min-width: 0; }
    h2 { margin: 0; color: #fff; font-size: 20px; font-weight: 800; }
    .divider { width: 1px; height: 20px; background: rgba(255,255,255,.25); }
    .code { color: rgba(255,255,255,.7); font-size: 13px; }
    .panel-close { color: #fff; background: rgba(255,255,255,.1); border: none; border-radius: 8px; padding: 8px; cursor: pointer; }
    .panel-close:hover { background: rgba(255,255,255,.2); }
    .side-panel__body { flex: 1; overflow-y: auto; background: #f4f6f2; padding: 24px; }
    .info-card { border: 1px solid #d8decf; border-radius: 8px; overflow: hidden; background: #fff; }
    .representatives-card { margin-top: 24px; }
    .info-card__header { padding: 16px 24px; background: #f4f6f2; border-bottom: 2px solid #d8decf; }
    .info-card__header--between { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    h3 { margin: 0; color: #242e1a; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; display: flex; align-items: center; gap: 8px; }
    .info-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); }
    .info-item { display: flex; align-items: center; gap: 10px; min-height: 52px; padding: 12px 24px; border-bottom: 1px solid #d8decf; border-inline-end: 1px solid #d8decf; }
    .info-item span:first-child, .long-field span { color: #7b8574; font-size: 13px; font-weight: 500; white-space: nowrap; }
    .info-item strong { color: #242e1a; font-size: 13px; min-width: 0; }
    .long-field { margin: 0 24px; padding: 20px 0; border-top: 1px solid #d8decf; }
    .long-field p { margin: 8px 0 0; padding: 12px; border-radius: 8px; background: #f4f6f2; color: #242e1a; font-size: 14px; }
    .status-pill, .count-pill { display: inline-flex; align-items: center; gap: 6px; border-radius: 999px; padding: 4px 12px; background: #e4f0e8; color: #3b7d57; font-size: 12px; font-weight: 700; }
    .status-pill i { font-size: 8px; }
    .status-pill--inactive { background: #fee2e2; color: #dc2626; }
    .table-scroll { overflow-x: auto; }
    table { width: 100%; min-width: 760px; border-collapse: collapse; }
    th { background: #f4f6f2; color: #242e1a; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .04em; padding: 12px 16px; text-align: start; border: 1px solid #d8decf; }
    td { color: #242e1a; font-size: 14px; padding: 16px; border: 1px solid #d8decf; }
    .rep-name { display: flex; align-items: center; gap: 12px; }
    .rep-avatar { width: 40px; height: 40px; border-radius: 999px; display: inline-flex; align-items: center; justify-content: center; background: #e4f0e8; color: #3b7d57; }
    .empty-state { padding: 32px; text-align: center; color: #7b8574; }
    .empty-state i { display: block; color: #d8decf; font-size: 36px; margin-bottom: 12px; }
    .side-panel__footer { flex-shrink: 0; border-top: 1px solid #d8decf; background: #fff; padding: 18px 24px; display: flex; align-items: center; justify-content: space-between; gap: 16px; }
    .agent-summary { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; color: #7b8574; font-size: 12px; }
    .agent-summary strong { color: #242e1a; text-transform: uppercase; }
    .primary-close { border: none; border-radius: 8px; padding: 10px 24px; color: #fff; background: #242e1a; cursor: pointer; font-weight: 600; }
    .primary-close:hover { background: #3a472a; }
    @keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
    @media (max-width: 840px) { .info-grid { grid-template-columns: 1fr; } .side-panel__footer { align-items: flex-start; flex-direction: column; } }
  `],
})
export class AgentDetailsDialogComponent implements OnInit {
  private readonly operationsService = inject(OperationsMockService);
  private readonly dialogRef = inject(MatDialogRef<AgentDetailsDialogComponent>);
  private readonly data = inject<{ agentId?: number }>(MAT_DIALOG_DATA);

  readonly agentId = this.data?.agentId;
  readonly agentDetails = signal<OperationAgent | null>(null);
  readonly isLoadingAgentDetails = signal(false);
  readonly agentRepresenters = signal<OperationAgentRepresentative[]>([]);
  readonly isLoadingAgentRepresenters = signal(false);

  ngOnInit(): void {
    if (this.agentId === undefined) {
      return;
    }
    this.loadAgentDetails();
    this.loadAgentRepresenters();
  }

  loadAgentDetails(): void {
    this.isLoadingAgentDetails.set(true);
    this.operationsService.getAgent({ agentID: this.agentId }).subscribe((agent) => {
      this.agentDetails.set(agent);
      this.isLoadingAgentDetails.set(false);
    });
  }

  loadAgentRepresenters(): void {
    this.isLoadingAgentRepresenters.set(true);
    this.operationsService.getRepresentersByAgentId({ agentId: this.agentId }).subscribe((representers) => {
      this.agentRepresenters.set(representers);
      this.isLoadingAgentRepresenters.set(false);
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
