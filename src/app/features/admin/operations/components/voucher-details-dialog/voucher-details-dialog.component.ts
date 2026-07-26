import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  CateringVoucherLine,
  FlightVoucherLine,
  HotelVoucherLine,
  OperationVoucherDetails,
  TransportVoucherLine,
  VisaVoucherLine,
} from '../../models/operation-voucher.model';
import { OperationsMockService } from '../../operations-mock.service';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';
import { SeroCurrencyPipe } from 'src/app/shared/pipes/sero-currency.pipe';
import { formatSeroCurrency } from 'src/app/shared/currency/currency-format.util';

type VoucherDetailsDialogData = {
  voucherId: number;
  agentId?: number;
};

@Component({
  selector: 'voucher-details',
  standalone: true,
  imports: [CommonModule, LoadingSpinnerComponent, TranslateModule, SeroCurrencyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="side-backdrop" (click)="close()">
      <div class="side-panel" [attr.dir]="panelDirection" (click)="$event.stopPropagation()">
        <loading-spinner [isLoading]="isLoadingVoucher()" [message]="'Loading data...' | translate" />

        <div class="side-panel__header">
          <div class="title-wrap">
            <h2>
              {{ 'Quotation' | translate }} - {{ voucherTypeLabel() }}
            </h2>
            @if (voucher()) {
              <span class="divider"></span>
              <span class="code">{{ voucher()?.RequestVoucherCode }}</span>
            }
          </div>
          <button type="button" class="panel-close" (click)="close()" [attr.aria-label]="'Close' | translate">
            <i class="fas fa-times"></i>
          </button>
        </div>

        @if (hasRovs()) {
          <div class="tabs-bar">
            <button
              type="button"
              [class.active]="activeTab() === 'details'"
              (click)="activeTab.set('details')">
              {{ 'Quotation Details' | translate }}
            </button>
            <button
              type="button"
              [class.active]="activeTab() === 'rovs'"
              (click)="activeTab.set('rovs')">
              {{ 'Related ROQs' | translate }}
            </button>
          </div>
        }

        <div class="side-panel__body">
          @if (activeTab() === 'rovs' && hasRovs()) {
            <div class="details-table-card roq-card">
              <div class="section-header">
                <h3>{{ 'Related ROQs' | translate }}</h3>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>{{ 'ROQ No.' | translate }}</th>
                    <th>{{ 'Hotel' | translate }}</th>
                    <th>{{ 'Room Type' | translate }}</th>
                    <th>{{ 'Nights' | translate }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (row of hotelRowsWithRov(); track row.RequestHotelVoucherID) {
                    <tr>
                      <td>ROQ-{{ row.RequestROVID }}</td>
                      <td>{{ row.HotelName }}</td>
                      <td>{{ row.RoomTypeTitle }}</td>
                      <td>{{ row.NightsCount }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          <div [class.hidden]="activeTab() !== 'details' && hasRovs()">
            <div class="details-table-card">
              <div class="table-scroll">
                <table>
                  <thead>
                    <tr>
                      @if (voucherTypeId() === 1) {
                        <th rowspan="2">{{ label('Check-In', 'تاريخ الوصول') }}</th>
                        <th rowspan="2">{{ label('Check-Out', 'تاريخ المغادرة') }}</th>
                      }
                      <th rowspan="2" class="info-col">{{ detailInfoLabel() }}</th>
                      <th colspan="5">{{ label('Unit Prices', 'أسعار الوحدة') }}</th>
                      <th rowspan="2">{{ label('Qty', 'الكمية') }}</th>
                      <th rowspan="2">{{ 'Total' | translate }}</th>
                    </tr>
                    <tr>
                      <th>{{ 'Cost Price' | translate }}</th>
                      <th>{{ label('Original Price', 'السعر الأصلي') }}</th>
                      <th>{{ 'Selling Price' | translate }}</th>
                      <th>{{ 'Tax' | translate }}</th>
                      <th>{{ label('Total Unit Price', 'إجمالي سعر الوحدة') }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of hotelRows(); track row.RequestHotelVoucherID) {
                      <tr>
                        <td>{{ row.StartDate | date:'dd MMM yyyy' }}</td>
                        <td>{{ row.EndDate | date:'dd MMM yyyy' }}</td>
                        <td class="info-col">
                          <strong>{{ row.HotelName }}</strong>
                          <span>{{ row.RoomTypeTitle }} | {{ row.NightsCount }} {{ label('nights', 'ليالي') }} @if (row.RequestROVID) { | <b>RoQ</b> }</span>
                        </td>
                        <ng-container *ngTemplateOutlet="priceCells; context: { row: row }"></ng-container>
                        <td><strong>{{ row.RoomCount }}</strong><small>{{ label('Rooms', 'غرف') }}</small></td>
                        <td class="total-cell">{{ row.TotalPriceWithTax | seroCurrency }}</td>
                      </tr>
                    }

                    @for (row of transportRows(); track row.RequestTripVoucherID) {
                      <tr>
                        <td class="info-col"><strong>{{ row.TripPathTitle }}</strong><span>{{ row.CarTypeTitle }}</span></td>
                        <ng-container *ngTemplateOutlet="priceCells; context: { row: row }"></ng-container>
                        <td><strong>{{ row.Count }}</strong><small>{{ 'Vehicles' | translate }}</small></td>
                        <td class="total-cell">{{ row.TotalPriceWithTax | seroCurrency }}</td>
                      </tr>
                    }

                    @for (row of visaRows(); track row.RequestVisaVoucherID) {
                      <tr>
                        <td class="info-col"><strong>{{ row.VisaTypeTitle }}</strong><span>{{ 'Visa request batch' | translate }}</span></td>
                        <ng-container *ngTemplateOutlet="priceCells; context: { row: row }"></ng-container>
                        <td><strong>{{ row.Count }}</strong><small>{{ 'Visas' | translate }}</small></td>
                        <td class="total-cell">{{ row.TotalPriceWithTax | seroCurrency }}</td>
                      </tr>
                    }

                    @for (row of cateringRows(); track row.RequestCateringVoucherID) {
                      <tr>
                        <td class="info-col"><strong>{{ row.CateringTitle }}</strong><span>{{ row.FoodTypeTitle }}</span></td>
                        <ng-container *ngTemplateOutlet="priceCells; context: { row: row }"></ng-container>
                        <td><strong>{{ row.Count }}</strong><small>{{ 'Meals' | translate }}</small></td>
                        <td class="total-cell">{{ row.TotalPriceWithTax | seroCurrency }}</td>
                      </tr>
                    }

                    @for (row of ticketRows(); track row.RequestTicketVoucherID) {
                      <tr>
                        <td class="info-col">
                          <strong>{{ getTicketRouteLabel(row) }}</strong>
                          <span>{{ row.SourceCountryName }} | {{ row.DestinationCountryName }} | {{ row.AirlineCompanyName }} | {{ row.TripType }} | {{ row.TicketClass }} | {{ row.TravelDate | date:'dd MMM yyyy' }}</span>
                        </td>
                        <ng-container *ngTemplateOutlet="priceCells; context: { row: row }"></ng-container>
                        <td><strong>{{ row.Count }}</strong><small>{{ 'Tickets' | translate }}</small></td>
                        <td class="total-cell">{{ row.TotalPriceWithTax | seroCurrency }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="side-panel__footer">
          @if (voucher()) {
            <div class="price-summary">
              <strong>{{ label('Price Summary', 'ملخص الأسعار') }}</strong>
              <span>{{ label('Cost Price:', 'سعر التكلفة:') }} {{ voucher()?.TotalCostPrice | seroCurrency }}</span>
              <span>{{ label('Original Price:', 'السعر الأصلي:') }} {{ voucher()?.TotalOriginalPrice | seroCurrency }}</span>
              <span>{{ label('Selling Price:', 'سعر البيع:') }} {{ voucher()?.TotalSellingPrice | seroCurrency }}</span>
              <span>{{ label('Tax:', 'الضريبة:') }} {{ voucher()?.TotalTax | seroCurrency }}</span>
              <span class="grand-total">{{ label('Grand Total:', 'الإجمالي الكلي:') }} {{ voucher()?.TotalPriceWithTax | seroCurrency }}</span>
            </div>

            <div class="status-summary">
              <span>{{ label('Created:', 'أُنشئ:') }} {{ voucher()?.AddedDate | date:'dd MMM yyyy' }}</span>
              <span>{{ label('By:', 'بواسطة:') }} {{ voucher()?.AddedBy || '-' }}</span>
              <span class="status-pill">{{ voucher()?.VoucherStatusForAdminTitle }}</span>
              <span class="status-pill">{{ voucher()?.VoucherStatusForAgentTitle }}</span>
            </div>
          }

          <button type="button" class="primary-close" (click)="close()">{{ 'Close' | translate }}</button>
        </div>
      </div>
    </div>

    <ng-template #priceCells let-row="row">
      <td>{{ asMoney(row.CostUnitPrice) }}</td>
      <td>{{ asMoney(row.OriginalUnitPrice) }}</td>
      <td><strong>{{ asMoney(row.SellingUnitPrice) }}</strong></td>
      <td>{{ asMoney(row.Tax) }}</td>
      <td>{{ asMoney(row.SellingUnitPrice + row.Tax) }}</td>
    </ng-template>
  `,
  styles: [`
    .side-backdrop { position: fixed; inset: 0; z-index: 50; display: flex; align-items: flex-end; justify-content: flex-end; background: rgba(58, 71, 42, .15); }
    .side-panel { width: 100%; max-width: 1152px; height: 100%; overflow: hidden; display: flex; flex-direction: column; position: relative; background: #f9f7f1; box-shadow: 0 25px 60px rgba(0,0,0,.24); animation: slide-in-right .3s ease-out; }
    .side-panel__header { flex-shrink: 0; display: flex; align-items: center; justify-content: space-between; padding: 20px 24px; background: linear-gradient(135deg, #3a472a 0%, #4a5a38 50%, #3a472a 100%); }
    .title-wrap { display: flex; align-items: center; gap: 12px; min-width: 0; }
    h2 { margin: 0; color: #fff; font-size: 20px; font-weight: 800; }
    .divider { width: 1px; height: 20px; background: rgba(255,255,255,.25); }
    .code { color: rgba(255,255,255,.72); font-size: 13px; }
    .panel-close { color: #fff; background: rgba(255,255,255,.1); border: none; border-radius: 8px; padding: 8px; cursor: pointer; }
    .panel-close:hover { background: rgba(255,255,255,.2); }
    .tabs-bar { flex-shrink: 0; background: #fff; border-bottom: 1px solid #e5e7eb; padding: 0 24px; display: flex; gap: 28px; }
    .tabs-bar button { border: none; background: transparent; border-bottom: 2px solid transparent; padding: 16px 4px; color: #6b7280; cursor: pointer; font-weight: 600; }
    .tabs-bar button.active { color: #3a472a; border-bottom-color: #3a472a; }
    .side-panel__body { flex: 1; overflow-y: auto; background: #f4f6f2; padding: 24px; }
    .hidden { display: none; }
    .details-table-card { background: #fff; border: 1px solid #d8decf; border-radius: 8px; overflow: hidden; }
    .table-scroll { overflow-x: auto; }
    table { width: 100%; min-width: 980px; border-collapse: collapse; }
    th { color: #242e1a; background: #f4f6f2; border: 1px solid #d8decf; border-bottom: 2px solid #d8decf; padding: 12px 14px; font-size: 12px; font-weight: 800; text-align: center; text-transform: uppercase; letter-spacing: .04em; }
    td { color: #242e1a; border: 1px solid #d8decf; padding: 14px; font-size: 13px; text-align: center; vertical-align: middle; }
    .info-col { min-width: 300px; text-align: start; }
    .info-col strong { display: block; color: #242e1a; font-size: 14px; }
    .info-col span { display: block; color: #7b8574; font-size: 12px; margin-top: 3px; }
    .info-col b { color: #f54a00; font-weight: 700; }
    td small { display: block; color: #7b8574; margin-top: 3px; }
    .total-cell { color: #8c7b3d; font-weight: 800; }
    .section-header { padding: 16px 20px; background: #f4f6f2; border-bottom: 2px solid #d8decf; }
    .section-header h3 { margin: 0; color: #242e1a; font-size: 14px; font-weight: 800; }
    .roq-card table { min-width: 680px; }
    .side-panel__footer { flex-shrink: 0; border-top: 1px solid #d8decf; background: #fff; padding: 18px 24px; display: flex; flex-direction: column; gap: 14px; }
    .price-summary, .status-summary { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; color: #7b8574; font-size: 12px; }
    .price-summary strong { color: #242e1a; text-transform: uppercase; }
    .grand-total { color: #8c7b3d; font-weight: 800; }
    .status-pill { display: inline-flex; align-items: center; border-radius: 999px; background: #e4f0e8; color: #3b7d57; padding: 3px 10px; }
    .primary-close { align-self: flex-end; border: none; border-radius: 8px; padding: 10px 24px; background: #242e1a; color: #fff; cursor: pointer; font-weight: 600; }
    .primary-close:hover { background: #3a472a; }
    @keyframes slide-in-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
    @media (max-width: 780px) { .side-panel__body { padding: 14px; } .side-panel__footer { padding: 14px; } }
  `],
})
export class VoucherDetailsDialogComponent implements OnInit {
  private readonly dialogRef = inject(MatDialogRef<VoucherDetailsDialogComponent>, { optional: true });
  private readonly data = inject<VoucherDetailsDialogData>(MAT_DIALOG_DATA, { optional: true });
  private readonly operationsService = inject(OperationsMockService);
  private readonly translate = inject(TranslateService);

  readonly isLoadingVoucher = signal(false);
  readonly voucherDetails = signal<OperationVoucherDetails | null>(null);
  readonly activeTab = signal<'details' | 'rovs'>('details');

  readonly voucher = computed(() => this.voucherDetails()?.Voucher ?? null);
  readonly voucherTypeId = computed(() => this.voucher()?.RequestVoucherTypeID ?? null);
  readonly hotelRows = computed<HotelVoucherLine[]>(() => this.voucherDetails()?.HotelVouchers ?? []);
  readonly transportRows = computed<TransportVoucherLine[]>(() => this.voucherDetails()?.TripVouchers ?? []);
  readonly visaRows = computed<VisaVoucherLine[]>(() => this.voucherDetails()?.VisaVouchers ?? []);
  readonly cateringRows = computed<CateringVoucherLine[]>(() => this.voucherDetails()?.CateringVouchers ?? []);
  readonly ticketRows = computed<FlightVoucherLine[]>(() => this.voucherDetails()?.TicketVouchers ?? []);
  readonly hotelRowsWithRov = computed(() => this.hotelRows().filter((row) => !!row.RequestROVID));
  readonly hasRovs = computed(() => this.hotelRowsWithRov().length > 0);

  ngOnInit(): void {
    this.loadVoucher();
  }

  get panelDirection(): 'rtl' | 'ltr' {
    return this.isArabicLanguage() ? 'rtl' : 'ltr';
  }

  label(english: string, arabic: string): string {
    return this.isArabicLanguage() ? arabic : english;
  }

  voucherTypeLabel(): string {
    const labels: Record<number, string> = {
      1: this.translate.instant('Hotel'),
      2: this.translate.instant('Transport'),
      3: this.translate.instant('Visa'),
      4: this.translate.instant('Catering'),
      5: this.translate.instant('Ticket'),
    };

    return labels[this.voucherTypeId() ?? 0] ?? this.translate.instant('Details');
  }

  detailInfoLabel(): string {
    const labels: Record<number, string> = {
      1: this.label('Hotel Info', 'معلومات الفندق'),
      2: this.label('Transport Info', 'معلومات النقل'),
      3: this.label('Visa Info', 'معلومات التأشيرة'),
      4: this.label('Catering Info', 'معلومات التموين'),
      5: this.label('Ticket Info', 'معلومات التذكرة'),
    };

    return labels[this.voucherTypeId() ?? 0] ?? this.translate.instant('Details');
  }

  asMoney(value: number | undefined): string {
    return formatSeroCurrency(value ?? 0);
  }

  getTicketRouteLabel(ticketVoucher: FlightVoucherLine): string {
    const arrow = ticketVoucher.TripType.toLowerCase() === 'roundtrip'
      ? '<->'
      : (this.isArabicLanguage() ? '<-' : '->');
    return `${ticketVoucher.SourceCityName} ${arrow} ${ticketVoucher.DestinationCityName}`;
  }

  close(result?: boolean): void {
    this.dialogRef?.close(result ?? false);
  }

  private loadVoucher(): void {
    const voucherId = this.data?.voucherId;
    const agentId = this.data?.agentId;

    if (!voucherId) {
      return;
    }

    this.isLoadingVoucher.set(true);
    this.operationsService.getVoucherById({ voucherId, agentId }).subscribe((details) => {
      this.voucherDetails.set(details);
      this.isLoadingVoucher.set(false);
    });
  }

  private isArabicLanguage(): boolean {
    const currentLang = this.translate.currentLang || this.translate.getDefaultLang() || 'en';
    return currentLang.startsWith('ar');
  }
}
