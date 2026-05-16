import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { VoucherDetailsModel } from '../orders.model';
import { OrdersService } from '../orders.service';

export interface VoucherDetailsDialogData {
  voucherId: number;
  agentId: number;
}

const TYPE_NAMES: Record<number, string> = {
  1: 'Hotel Voucher',
  2: 'Transport Voucher',
  3: 'Visa Voucher',
  4: 'Catering Voucher',
  5: 'Flight Voucher',
};

@Component({
  selector: 'voucher-details-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="vdd-panel">
      <!-- Header -->
      <div class="vdd-header">
        <div class="vdd-header-content">
          <span class="material-icons-round vdd-header-icon">receipt_long</span>
          <div>
            <div class="vdd-header-title">{{ typeName() }}</div>
            <div class="vdd-header-code">{{ details()?.Voucher?.RequestVoucherCode }}</div>
          </div>
        </div>
        <button class="vdd-close" (click)="close()">
          <span class="material-icons-round">close</span>
        </button>
      </div>

      <!-- Body -->
      <div class="vdd-body">
        @if (isLoading()) {
          <div class="vdd-loading">
            <div class="vdd-spinner"></div>
            <span>Loading voucher details...</span>
          </div>
        } @else if (!details()) {
          <div class="vdd-error">
            <span class="material-icons-round">error_outline</span>
            <p>Voucher not found</p>
          </div>
        } @else {
          <!-- Summary cards -->
          <div class="vdd-summary-row">
            <div class="vdd-summary-card">
              <span class="sc-label">Cost</span>
              <span class="sc-val">{{ details()!.Voucher.TotalCostPrice | number:'1.2-2' }} SAR</span>
            </div>
            <div class="vdd-summary-card">
              <span class="sc-label">Original</span>
              <span class="sc-val">{{ details()!.Voucher.TotalOriginalPrice | number:'1.2-2' }} SAR</span>
            </div>
            <div class="vdd-summary-card">
              <span class="sc-label">Selling</span>
              <span class="sc-val">{{ details()!.Voucher.TotalSellingPrice | number:'1.2-2' }} SAR</span>
            </div>
            <div class="vdd-summary-card">
              <span class="sc-label">Tax</span>
              <span class="sc-val">{{ details()!.Voucher.TotalTax | number:'1.2-2' }} SAR</span>
            </div>
            <div class="vdd-summary-card highlight">
              <span class="sc-label">Grand Total</span>
              <span class="sc-val">{{ details()!.Voucher.TotalPriceWithTax | number:'1.2-2' }} SAR</span>
            </div>
          </div>

          <!-- Hotel Vouchers -->
          @if (details()!.HotelVouchers.length > 0) {
            <div class="vdd-section">
              <div class="vdd-section-title">
                <span class="material-icons-round">hotel</span>Hotel Details
              </div>
              <div class="vdd-scroll">
                <table class="vdd-table">
                  <thead>
                    <tr>
                      <th>Hotel</th><th>Room Type</th><th>Check-In</th><th>Check-Out</th>
                      <th>Nights</th><th>Rooms</th><th>Selling</th><th>Tax</th><th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (h of details()!.HotelVouchers; track h.RequestHotelVoucherDetailID) {
                      <tr>
                        <td>{{ h.HotelName }}</td>
                        <td>{{ h.RoomTypeTitle }}</td>
                        <td>{{ h.StartDate | date:'dd MMM yyyy' }}</td>
                        <td>{{ h.EndDate | date:'dd MMM yyyy' }}</td>
                        <td class="center">{{ h.NightsCount }}</td>
                        <td class="center">{{ h.RoomCount }}</td>
                        <td class="right">{{ h.UnitSellingPrice | number:'1.2-2' }}</td>
                        <td class="right">{{ h.UnitTax | number:'1.2-2' }}</td>
                        <td class="right bold">{{ h.TotalPriceWithTax | number:'1.2-2' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

          <!-- Trip Vouchers -->
          @if (details()!.TripVouchers.length > 0) {
            <div class="vdd-section">
              <div class="vdd-section-title">
                <span class="material-icons-round">directions_bus</span>Transport Details
              </div>
              <div class="vdd-scroll">
                <table class="vdd-table">
                  <thead>
                    <tr>
                      <th>Route</th><th>Car Type</th><th>Count</th>
                      <th>Unit Selling</th><th>Tax</th><th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (t of details()!.TripVouchers; track t.RequestTripVoucherDetailID) {
                      <tr>
                        <td>{{ t.TripPathTitle }}</td>
                        <td>{{ t.CarTypeTitle }}</td>
                        <td class="center">{{ t.Count }}</td>
                        <td class="right">{{ t.UnitSellingPrice | number:'1.2-2' }}</td>
                        <td class="right">{{ t.UnitTax | number:'1.2-2' }}</td>
                        <td class="right bold">{{ t.TotalPriceWithTax | number:'1.2-2' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

          <!-- Visa Vouchers -->
          @if (details()!.VisaVouchers.length > 0) {
            <div class="vdd-section">
              <div class="vdd-section-title">
                <span class="material-icons-round">article</span>Visa Details
              </div>
              <div class="vdd-scroll">
                <table class="vdd-table">
                  <thead>
                    <tr>
                      <th>Count</th><th>Unit Cost</th><th>Unit Selling</th><th>Tax</th><th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (vi of details()!.VisaVouchers; track vi.RequestVisaVoucherDetailID) {
                      <tr>
                        <td class="center">{{ vi.Count }}</td>
                        <td class="right">{{ vi.UnitCostPrice | number:'1.2-2' }}</td>
                        <td class="right">{{ vi.UnitSellingPrice | number:'1.2-2' }}</td>
                        <td class="right">{{ vi.UnitTax | number:'1.2-2' }}</td>
                        <td class="right bold">{{ vi.TotalPriceWithTax | number:'1.2-2' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

          <!-- Catering Vouchers -->
          @if (details()!.CateringVouchers.length > 0) {
            <div class="vdd-section">
              <div class="vdd-section-title">
                <span class="material-icons-round">restaurant</span>Catering Details
              </div>
              <div class="vdd-scroll">
                <table class="vdd-table">
                  <thead>
                    <tr>
                      <th>Catering</th><th>Food Type</th><th>Count</th>
                      <th>Unit Selling</th><th>Tax</th><th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (c of details()!.CateringVouchers; track c.RequestCateringVoucherDetailID) {
                      <tr>
                        <td>{{ c.CateringTitle }}</td>
                        <td>{{ c.FoodTypeTitle }}</td>
                        <td class="center">{{ c.Count }}</td>
                        <td class="right">{{ c.UnitSellingPrice | number:'1.2-2' }}</td>
                        <td class="right">{{ c.UnitTax | number:'1.2-2' }}</td>
                        <td class="right bold">{{ c.TotalPriceWithTax | number:'1.2-2' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

          <!-- Ticket Vouchers -->
          @if (details()!.TicketVouchers.length > 0) {
            <div class="vdd-section">
              <div class="vdd-section-title">
                <span class="material-icons-round">flight</span>Flight Details
              </div>
              <div class="vdd-scroll">
                <table class="vdd-table">
                  <thead>
                    <tr>
                      <th>Airline</th><th>Route</th><th>Class</th><th>Trip Type</th>
                      <th>Travel Date</th><th>Count</th><th>Selling</th><th>Tax</th><th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (tk of details()!.TicketVouchers; track tk.RequestTicketVoucherDetailID) {
                      <tr>
                        <td>{{ tk.AirlineName }}</td>
                        <td>{{ tk.SourceCity }} → {{ tk.DestCity }}</td>
                        <td>{{ tk.TicketClass }}</td>
                        <td>{{ tk.TripType }}</td>
                        <td>{{ tk.TravelDate | date:'dd MMM yyyy' }}</td>
                        <td class="center">{{ tk.Count }}</td>
                        <td class="right">{{ tk.UnitSellingPrice | number:'1.2-2' }}</td>
                        <td class="right">{{ tk.UnitTax | number:'1.2-2' }}</td>
                        <td class="right bold">{{ tk.TotalPriceWithTax | number:'1.2-2' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }

          <!-- Status row -->
          <div class="vdd-status-row">
            <div class="status-item">
              <span class="status-label">Admin Status</span>
              <span class="status-pill admin">{{ details()!.Voucher.VoucherStatusForAdminTitle }}</span>
            </div>
            <div class="status-item">
              <span class="status-label">Agent Status</span>
              <span class="status-pill agent">{{ details()!.Voucher.VoucherStatusForAgentTitle }}</span>
            </div>
          </div>
        }
      </div>

      <!-- Footer -->
      <div class="vdd-footer">
        <button class="btn-close-footer" (click)="close()">
          <span class="material-icons-round">close</span> Close
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; height: 100%; }
    .vdd-panel {
      display: flex; flex-direction: column; height: 100%;
      background: #fff; width: 100%;
    }

    .vdd-header {
      background: linear-gradient(135deg, #2d5a27, #4a7c59);
      padding: 20px 24px; display: flex; align-items: center; justify-content: space-between;
      flex-shrink: 0;
    }
    .vdd-header-content { display: flex; align-items: center; gap: 14px; }
    .vdd-header-icon { font-size: 28px; color: rgba(255,255,255,.8); }
    .vdd-header-title { font-size: 18px; font-weight: 700; color: #fff; }
    .vdd-header-code  { font-size: 13px; color: rgba(255,255,255,.7); margin-top: 2px; }
    .vdd-close {
      background: rgba(255,255,255,.15); border: none; border-radius: 8px;
      padding: 6px; cursor: pointer; color: #fff; display: flex; align-items: center;
      transition: background 0.15s;
    }
    .vdd-close:hover { background: rgba(255,255,255,.25); }
    .vdd-close .material-icons-round { font-size: 20px; }

    .vdd-body { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 20px; }

    .vdd-loading, .vdd-error {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 10px; color: #9ca3af; padding: 48px 16px;
    }
    .vdd-spinner {
      width: 28px; height: 28px; border: 3px solid #e5e7eb;
      border-top-color: #2d5a27; border-radius: 50%; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .vdd-summary-row {
      display: flex; gap: 12px; flex-wrap: wrap;
    }
    .vdd-summary-card {
      flex: 1; min-width: 110px;
      background: #f9fafb; border: 1px solid #e5e7eb;
      border-radius: 10px; padding: 12px 16px;
      display: flex; flex-direction: column; gap: 4px;
    }
    .vdd-summary-card.highlight { background: #f0fdf4; border-color: #bbf7d0; }
    .sc-label { font-size: 11px; color: #9ca3af; font-weight: 600; text-transform: uppercase; }
    .sc-val   { font-size: 15px; font-weight: 700; color: #111827; }
    .vdd-summary-card.highlight .sc-val { color: #166534; }

    .vdd-section { }
    .vdd-section-title {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; font-weight: 700; color: #374151;
      text-transform: uppercase; letter-spacing: .5px;
      margin-bottom: 12px;
    }
    .vdd-section-title .material-icons-round { font-size: 16px; color: #2d5a27; }

    .vdd-scroll { overflow-x: auto; }
    .vdd-table {
      width: 100%; border-collapse: collapse; font-size: 13px;
      border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;
    }
    .vdd-table th {
      background: #f9fafb; padding: 10px 12px;
      font-size: 11px; font-weight: 600; color: #6b7280;
      text-transform: uppercase; letter-spacing: .3px;
      text-align: left; white-space: nowrap;
    }
    .vdd-table td {
      padding: 11px 12px; border-top: 1px solid #f3f4f6;
      color: #374151;
    }
    .vdd-table td.center { text-align: center; }
    .vdd-table td.right  { text-align: right; }
    .vdd-table td.bold   { font-weight: 700; color: #111827; }

    .vdd-status-row {
      display: flex; gap: 20px; flex-wrap: wrap;
      border-top: 1px solid #f3f4f6; padding-top: 16px;
    }
    .status-item { display: flex; align-items: center; gap: 8px; }
    .status-label { font-size: 12px; color: #9ca3af; }
    .status-pill { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
    .status-pill.admin { background: #eff6ff; color: #1e40af; }
    .status-pill.agent { background: #f0fdf4; color: #166534; }

    .vdd-footer {
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
export class VoucherDetailsDialogComponent implements OnInit {
  private readonly data: VoucherDetailsDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<VoucherDetailsDialogComponent>);
  private readonly ordersService = inject(OrdersService);

  details = signal<VoucherDetailsModel | null>(null);
  isLoading = signal(true);

  typeName = signal('Voucher Details');

  ngOnInit() {
    this.ordersService.getVoucherById(this.data.voucherId).subscribe({
      next: (d) => {
        this.details.set(d);
        if (d) {
          this.typeName.set(TYPE_NAMES[d.Voucher.RequestVoucherTypeID] ?? 'Voucher Details');
        }
      },
      error: () => this.details.set(null),
      complete: () => this.isLoading.set(false),
    });
  }

  close() { this.dialogRef.close(); }
}
