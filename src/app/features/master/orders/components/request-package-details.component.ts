import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestModel } from '../orders.model';
import { SeroCurrencyPipe } from 'src/app/shared/pipes/sero-currency.pipe';

@Component({
  selector: 'request-package-details',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, SeroCurrencyPipe],
  template: `
    <div class="rpd-wrap">
      <div class="rpd-grid">
        <!-- Request info -->
        <div class="rpd-section">
          <div class="rpd-section-title">
            <span class="material-icons-round">receipt_long</span>
            Request Details
          </div>
          <div class="rpd-rows">
            <div class="rpd-row">
              <span class="rpd-label">Request ID</span>
              <span class="rpd-value">#{{ rqst().Id }}</span>
            </div>
            <div class="rpd-row">
              <span class="rpd-label">Agent</span>
              <span class="rpd-value">{{ rqst().AgentName }} ({{ rqst().AgentCode }})</span>
            </div>
            <div class="rpd-row">
              <span class="rpd-label">Submitted</span>
              <span class="rpd-value">{{ rqst().AddedDate | date:'dd MMM yyyy, h:mm a' }}</span>
            </div>
            <div class="rpd-row">
              <span class="rpd-label">Dates</span>
              <span class="rpd-value">{{ rqst().StartDate | date:'dd MMM yyyy' }} → {{ rqst().EndDate | date:'dd MMM yyyy' }}</span>
            </div>
            <div class="rpd-row">
              <span class="rpd-label">Passengers</span>
              <span class="rpd-value">{{ rqst().PassengerCount }}</span>
            </div>
            <div class="rpd-row">
              <span class="rpd-label">Quantity</span>
              <span class="rpd-value">{{ rqst().RequestedQuantity }} package(s)</span>
            </div>
            @if (rqst().Notes) {
              <div class="rpd-row">
                <span class="rpd-label">Notes</span>
                <span class="rpd-value note">{{ rqst().Notes }}</span>
              </div>
            }
          </div>
        </div>

        <!-- Package info -->
        <div class="rpd-section">
          <div class="rpd-section-title">
            <span class="material-icons-round">inventory_2</span>
            Package Details
          </div>
          <div class="rpd-rows">
            <div class="rpd-row">
              <span class="rpd-label">Package</span>
              <span class="rpd-value">{{ rqst().Title }}</span>
            </div>
            <div class="rpd-row">
              <span class="rpd-label">Code</span>
              <span class="rpd-value mono">{{ rqst().PackageCode }}</span>
            </div>
            <div class="rpd-row">
              <span class="rpd-label">Price</span>
              <span class="rpd-value price">{{ rqst().Price | seroCurrency }}</span>
            </div>
            @if (rqst().PackageModel; as pm) {
              <div class="rpd-row">
                <span class="rpd-label">Visa</span>
                <span class="rpd-value">
                  @if (pm.VisaIncluded) {
                    <span class="visa-yes">Included</span>
                  } @else {
                    <span class="visa-no">Not Included</span>
                  }
                </span>
              </div>
              <div class="rpd-row">
                <span class="rpd-label">Services</span>
                <div class="svc-chips">
                  @if (pm.HotelCount > 0) {
                    <span class="svc-chip hotel">
                      <span class="material-icons-round">hotel</span>{{ pm.HotelCount }} Hotel(s)
                    </span>
                  }
                  @if (pm.TransportCount > 0) {
                    <span class="svc-chip transport">
                      <span class="material-icons-round">directions_bus</span>{{ pm.TransportCount }} Transport
                    </span>
                  }
                  @if (pm.TicketCount > 0) {
                    <span class="svc-chip ticket">
                      <span class="material-icons-round">flight</span>{{ pm.TicketCount }} Flight(s)
                    </span>
                  }
                  @if (pm.CateringCount > 0) {
                    <span class="svc-chip catering">
                      <span class="material-icons-round">restaurant</span>{{ pm.CateringCount }} Catering
                    </span>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .rpd-wrap { padding: 20px 24px; }
    .rpd-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    @media (max-width: 640px) { .rpd-grid { grid-template-columns: 1fr; } }

    .rpd-section { background: #f9fafb; border-radius: 10px; padding: 16px; }
    .rpd-section-title {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; font-weight: 700; color: #374151;
      margin-bottom: 14px; text-transform: uppercase; letter-spacing: .5px;
    }
    .rpd-section-title .material-icons-round { font-size: 16px; color: var(--sero-primary, #3a472a); }

    .rpd-rows { display: flex; flex-direction: column; gap: 10px; }
    .rpd-row { display: flex; align-items: flex-start; gap: 8px; }
    .rpd-label { font-size: 12px; color: #9ca3af; min-width: 90px; flex-shrink: 0; padding-top: 1px; }
    .rpd-value { font-size: 13px; color: #111827; font-weight: 500; }
    .rpd-value.note { color: #6b7280; font-style: italic; font-weight: 400; }
    .rpd-value.mono { font-family: monospace; }
    .rpd-value.price { color: var(--sero-primary, #3a472a); font-weight: 700; }

    .visa-yes { background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
    .visa-no  { background: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }

    .svc-chips { display: flex; flex-wrap: wrap; gap: 4px; }
    .svc-chip {
      display: inline-flex; align-items: center; gap: 3px;
      padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 500;
    }
    .svc-chip .material-icons-round { font-size: 12px; }
    .svc-chip.hotel    { background: #f0fdf4; color: #166534; }
    .svc-chip.transport{ background: #eff6ff; color: #1e40af; }
    .svc-chip.ticket   { background: #f5f3ff; color: #6d28d9; }
    .svc-chip.catering { background: #fff7ed; color: #9a3412; }
  `],
})
export class RequestPackageDetailsComponent {
  rqst = input.required<RequestModel>();
}
