import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Package, TransportService } from '../../../../../core/models/package.model';
import { TransportType } from '../../../../../core/models/enums';
import { OrderSummaryData } from '../../../../../core/models/package-builder-ui.model';
import { PackageBuilderUiService } from '../../../../../core/services/package-builder-ui.service';
import { OrderSummaryComponent } from '../../components/order-summary/order-summary.component';
import { SeroDropdownComponent, SeroDropdownOption } from '../../../../../shared/components/sero-dropdown/sero-dropdown.component';

@Component({
  selector: 'app-step3-transport',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, OrderSummaryComponent, SeroDropdownComponent],
  template: `
    <div class="step-shell animate-fade-in">
      <div class="step-grid">
        <app-order-summary class="sidebar" [data]="orderSummary"></app-order-summary>
        <div class="step-content">
      <div class="step-header">
        <div class="step-icon-wrap" style="background:#eff6ff;color:#3b82f6">
          <span class="material-icons-round" style="font-size:26px">directions_bus</span>
        </div>
        <div>
          <h3 class="step-title">{{ 'builder.transport.title' | translate }}</h3>
          <p class="step-desc">{{ 'builder.transport.desc' | translate }}</p>
        </div>
      </div>

      @if (transport.length > 0) {
        <div class="list mb-4">
          @for (t of transport; track t.id; let i = $index) {
            <div class="item-row card card--flat">
              <div class="card-body flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="t-icon">
                    <span class="material-icons-round">{{ getTransportIcon(t.type) }}</span>
                  </div>
                  <div>
                    <div class="font-semibold">{{ t.route }}</div>
                    <div class="text-sm text-secondary">{{ getTransportLabelKey(t.type) | translate }} · {{ t.capacity }} · {{ t.provider }}</div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="badge badge--success">{{ t.isAirConditioned ? ('builder.transport.airConYes' | translate) : ('common.labels.no' | translate) }}</span>
                  <button class="btn btn--icon" (click)="remove(i)">
                    <span class="material-icons-round">delete_outline</span>
                  </button>
                </div>
              </div>
            </div>
          }
        </div>
      }

      @if (showForm) {
        <div class="card card--flat form-card animate-scale-in">
          <div class="card-body">
            <h4 class="font-semibold text-md mb-4">{{ 'builder.transport.formTitle' | translate }}</h4>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
              <div class="form-group" style="grid-column:1/-1">
                <label class="form-label">{{ 'builder.transport.route' | translate }} <span class="required">*</span></label>
                <input class="form-control" [(ngModel)]="newItem.route" [placeholder]="'builder.transport.routePlaceholder' | translate" />
              </div>
              <div class="form-group">
                <label class="form-label">{{ 'builder.transport.type' | translate }}</label>
                <app-sero-dropdown
                  [options]="transportTypeOptions"
                  [value]="newItem.type || null"
                  (valueChange)="newItem.type = $event">
                </app-sero-dropdown>
              </div>
              <div class="form-group">
                <label class="form-label">{{ 'builder.transport.provider' | translate }}</label>
                <input class="form-control" [(ngModel)]="newItem.provider" placeholder="e.g. Al Mowasalat" />
              </div>
              <div class="form-group">
                <label class="form-label">{{ 'builder.transport.capacity' | translate }}</label>
                <input class="form-control" type="number" [(ngModel)]="newItem.capacity" />
              </div>
              <div class="form-group">
                <label class="form-label">{{ 'builder.transport.airCon' | translate }}</label>
                <label class="toggle-switch">
                  <input type="checkbox" [(ngModel)]="newItem.isAirConditioned">
                  <div class="toggle-track"></div>
                  <span class="toggle-label">{{ 'builder.transport.airConYes' | translate }}</span>
                </label>
              </div>
            </div>
            <div class="flex items-center gap-3 mt-4">
              <button class="btn btn--primary" (click)="add()">
                <span class="material-icons-round">add</span> {{ 'builder.transport.addBtn' | translate }}
              </button>
              <button class="btn btn--secondary" (click)="showForm = false">{{ 'common.buttons.cancel' | translate }}</button>
            </div>
          </div>
        </div>
      }

      @if (!showForm) {
        <button class="btn btn--secondary w-full add-btn" (click)="showForm = true">
          <span class="material-icons-round">add_circle_outline</span> {{ 'builder.transport.addBtn' | translate }}
        </button>
      }

      <div class="step-nav">
        <button class="btn btn--secondary btn--lg" (click)="prev.emit()">
          <span class="material-icons-round">arrow_back</span> {{ 'common.buttons.back' | translate }}
        </button>
        <button class="btn btn--primary btn--lg" (click)="next.emit()">
          {{ 'builder.navigation.nextTickets' | translate }} <span class="material-icons-round">arrow_forward</span>
        </button>
      </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .step-shell { padding: 14px 0 0; }
    .step-grid { display: grid; grid-template-columns: 290px minmax(0, 1fr); gap: 16px; align-items: start; }
    .step-content { padding: var(--space-xl); min-width: 0; }
    .step-header  { display: flex; align-items: flex-start; gap: var(--space-md); margin-bottom: var(--space-xl); }
    .step-icon-wrap { width: 52px; height: 52px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .step-title { font-size: 1.25rem; font-weight: 700; }
    .step-desc  { font-size: 0.875rem; color: var(--color-text-secondary); margin-top: 4px; }
    .list { display: flex; flex-direction: column; gap: var(--space-sm); }
    .item-row { border: 1px solid var(--color-border); border-radius: var(--radius-lg); }
    .t-icon { width: 44px; height: 44px; background: var(--color-info-bg); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; .material-icons-round { color: var(--color-info); } }
    .form-card { border: 2px dashed var(--color-border); margin-bottom: var(--space-md); }
    .add-btn { border: 2px dashed var(--color-border); background: transparent; color: var(--color-text-secondary); justify-content: center; padding: 14px; &:hover { border-color: var(--color-info); color: var(--color-info); background: var(--color-info-bg); } }
    .step-nav { display: flex; align-items: center; justify-content: space-between; margin-top: var(--space-xl); padding-top: var(--space-xl); border-top: 1px solid var(--color-border); }
    .mb-4 { margin-bottom: 16px; }
    .mt-4 { margin-top: 16px; }
    @media (max-width: 1024px) { .step-grid { grid-template-columns: 1fr; } }
  `]
})
export class Step3TransportComponent implements OnInit {
  @Input() packageData!: Partial<Package>;
  @Output() dataChanged = new EventEmitter<Partial<Package>>();
  @Output() next = new EventEmitter<void>();
  @Output() prev = new EventEmitter<void>();

  TransportType = TransportType;
  transportTypeOptions: SeroDropdownOption<TransportType>[] = [
    { value: TransportType.BUS, labelKey: 'builder.transport.types.bus' },
    { value: TransportType.VIP_BUS, labelKey: 'builder.transport.types.vipBus' },
    { value: TransportType.VAN, labelKey: 'builder.transport.types.van' },
    { value: TransportType.PRIVATE_CAR, labelKey: 'builder.transport.types.privateCar' }
  ];
  transport: TransportService[] = [];
  showForm = false;
  newItem: Partial<TransportService> = { type: TransportType.BUS, route: '', capacity: 40, isAirConditioned: true, provider: '' };
  orderSummary: OrderSummaryData = { title: '', sections: [], supportCards: [] };

  constructor(private readonly builderUi: PackageBuilderUiService) {}

  ngOnInit(): void {
    this.transport = [...(this.packageData.transportation || [])];
    this.orderSummary = this.builderUi.getOrderSummaryData();
  }

  add(): void {
    if (!this.newItem.route) return;
    this.transport = [...this.transport, { ...this.newItem as TransportService, id: 'trans-' + Date.now() }];
    this.dataChanged.emit({ transportation: this.transport });
    this.newItem = { type: TransportType.BUS, route: '', capacity: 40, isAirConditioned: true, provider: '' };
    this.showForm = false;
  }

  remove(i: number): void {
    this.transport = this.transport.filter((_, idx) => idx !== i);
    this.dataChanged.emit({ transportation: this.transport });
  }

  getTransportIcon(type: TransportType): string {
    const m: Record<TransportType, string> = {
      [TransportType.BUS]: 'directions_bus', [TransportType.VIP_BUS]: 'airline_seat_recline_extra',
      [TransportType.VAN]: 'airport_shuttle', [TransportType.PRIVATE_CAR]: 'directions_car'
    };
    return m[type];
  }

  getTransportLabelKey(type: TransportType): string {
    const m: Record<TransportType, string> = {
      [TransportType.BUS]: 'builder.transport.types.bus',
      [TransportType.VIP_BUS]: 'builder.transport.types.vipBus',
      [TransportType.VAN]: 'builder.transport.types.van',
      [TransportType.PRIVATE_CAR]: 'builder.transport.types.privateCar'
    };
    return m[type];
  }
}
