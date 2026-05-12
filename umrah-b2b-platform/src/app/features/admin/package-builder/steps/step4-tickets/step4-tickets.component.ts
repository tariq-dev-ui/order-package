import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Package, TicketService } from '../../../../../core/models/package.model';
import { OrderSummaryData } from '../../../../../core/models/package-builder-ui.model';
import { PackageBuilderUiService } from '../../../../../core/services/package-builder-ui.service';
import { OrderSummaryComponent } from '../../components/order-summary/order-summary.component';

@Component({
  selector: 'app-step4-tickets',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, OrderSummaryComponent],
  template: `
    <div class="step-shell animate-fade-in">
      <div class="step-grid">
        <app-order-summary class="sidebar" [data]="orderSummary"></app-order-summary>
        <div class="step-content">
      <div class="step-header">
        <div class="step-icon-wrap" style="background:#fdf4ff;color:#9333ea">
          <span class="material-icons-round" style="font-size:26px">flight</span>
        </div>
        <div>
          <h3 class="step-title">{{ 'builder.tickets.title' | translate }}</h3>
          <p class="step-desc">{{ 'builder.tickets.desc' | translate }}</p>
        </div>
      </div>

      @if (tickets.length > 0) {
        <div class="list mb-4">
          @for (t of tickets; track t.id; let i = $index) {
            <div class="item-row card card--flat">
              <div class="card-body flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="t-icon">
                    <span class="material-icons-round">flight_takeoff</span>
                  </div>
                  <div>
                    <div class="font-semibold">{{ t.airline }} · {{ t.flightNumber }}</div>
                    <div class="text-sm text-secondary">
                      {{ t.origin }} → {{ t.destination }} ·
                      {{ t.departureDate | date:'mediumDate' }}
                      @if (t.returnDate) { → {{ t.returnDate | date:'mediumDate' }} }
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <span class="badge" [class]="t.class === 'business' ? 'badge--gold' : t.class === 'first' ? 'badge--danger' : 'badge--neutral'">
                    {{ t.class | titlecase }}
                  </span>
                  <span class="badge badge--info">{{ t.baggageAllowance }}kg</span>
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
            <h4 class="font-semibold text-md mb-4">{{ 'builder.tickets.formTitle' | translate }}</h4>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
              <div class="form-group">
                <label class="form-label">{{ 'builder.tickets.airline' | translate }} <span class="required">*</span></label>
                <input class="form-control" [(ngModel)]="newItem.airline" placeholder="e.g. Saudi Arabian Airlines" />
              </div>
              <div class="form-group">
                <label class="form-label">{{ 'builder.tickets.flightNumber' | translate }}</label>
                <input class="form-control" [(ngModel)]="newItem.flightNumber" placeholder="e.g. SV-301" />
              </div>
              <div class="form-group">
                <label class="form-label">{{ 'builder.tickets.origin' | translate }}</label>
                <input class="form-control" [(ngModel)]="newItem.origin" placeholder="CAI" maxlength="3" style="text-transform:uppercase" />
              </div>
              <div class="form-group">
                <label class="form-label">{{ 'builder.tickets.destination' | translate }}</label>
                <input class="form-control" [(ngModel)]="newItem.destination" placeholder="JED" maxlength="3" style="text-transform:uppercase" />
              </div>
              <div class="form-group">
                <label class="form-label">{{ 'builder.tickets.departureDate' | translate }}</label>
                <input class="form-control" type="date" [(ngModel)]="departureStr" />
              </div>
              <div class="form-group">
                <label class="form-label">{{ 'builder.tickets.returnDate' | translate }}</label>
                <input class="form-control" type="date" [(ngModel)]="returnStr" />
              </div>
              <div class="form-group">
                <label class="form-label">{{ 'builder.tickets.cabinClass' | translate }}</label>
                <select class="form-control" [(ngModel)]="newItem.class">
                  <option value="economy">{{ 'builder.tickets.classes.economy' | translate }}</option>
                  <option value="business">{{ 'builder.tickets.classes.business' | translate }}</option>
                  <option value="first">{{ 'builder.tickets.classes.first' | translate }}</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">{{ 'builder.tickets.baggage' | translate }}</label>
                <input class="form-control" type="number" [(ngModel)]="newItem.baggageAllowance" />
              </div>
            </div>
            <div class="flex items-center gap-3 mt-4">
              <button class="btn btn--primary" (click)="add()">
                <span class="material-icons-round">add</span> {{ 'builder.tickets.addBtn' | translate }}
              </button>
              <button class="btn btn--secondary" (click)="showForm = false">{{ 'common.buttons.cancel' | translate }}</button>
            </div>
          </div>
        </div>
      }

      @if (!showForm) {
        <button class="btn btn--secondary w-full add-btn" (click)="showForm = true">
          <span class="material-icons-round">add_circle_outline</span> {{ 'builder.tickets.addBtn' | translate }}
        </button>
      }

      <div class="step-nav">
        <button class="btn btn--secondary btn--lg" (click)="prev.emit()">
          <span class="material-icons-round">arrow_back</span> {{ 'common.buttons.back' | translate }}
        </button>
        <button class="btn btn--primary btn--lg" (click)="next.emit()">
          {{ 'builder.navigation.nextCatering' | translate }} <span class="material-icons-round">arrow_forward</span>
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
    .step-header { display: flex; align-items: flex-start; gap: var(--space-md); margin-bottom: var(--space-xl); }
    .step-icon-wrap { width: 52px; height: 52px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .step-title { font-size: 1.25rem; font-weight: 700; }
    .step-desc  { font-size: 0.875rem; color: var(--color-text-secondary); margin-top: 4px; }
    .list { display: flex; flex-direction: column; gap: var(--space-sm); }
    .item-row { border: 1px solid var(--color-border); border-radius: var(--radius-lg); }
    .t-icon { width: 44px; height: 44px; background: #fdf4ff; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; .material-icons-round { color: #9333ea; } }
    .form-card { border: 2px dashed var(--color-border); margin-bottom: var(--space-md); }
    .add-btn { border: 2px dashed var(--color-border); background: transparent; color: var(--color-text-secondary); justify-content: center; padding: 14px; &:hover { border-color: #9333ea; color: #9333ea; background: #fdf4ff; } }
    .step-nav { display: flex; align-items: center; justify-content: space-between; margin-top: var(--space-xl); padding-top: var(--space-xl); border-top: 1px solid var(--color-border); }
    .mb-4 { margin-bottom: 16px; }
    .mt-4 { margin-top: 16px; }
    @media (max-width: 1024px) { .step-grid { grid-template-columns: 1fr; } }
  `]
})
export class Step4TicketsComponent implements OnInit {
  @Input() packageData!: Partial<Package>;
  @Output() dataChanged = new EventEmitter<Partial<Package>>();
  @Output() next = new EventEmitter<void>();
  @Output() prev = new EventEmitter<void>();

  tickets: TicketService[] = [];
  showForm = false;
  departureStr = '';
  returnStr = '';
  newItem: Partial<TicketService> = { airline: '', flightNumber: '', origin: '', destination: '', class: 'economy', baggageAllowance: 23 };
  orderSummary: OrderSummaryData = { title: '', sections: [], supportCards: [] };

  constructor(private readonly builderUi: PackageBuilderUiService) {}

  ngOnInit(): void {
    this.tickets = [...(this.packageData.tickets || [])];
    this.orderSummary = this.builderUi.getOrderSummaryData();
  }

  add(): void {
    if (!this.newItem.airline) return;
    this.tickets = [...this.tickets, {
      ...this.newItem as TicketService,
      id: 'tkt-' + Date.now(),
      departureDate: this.departureStr ? new Date(this.departureStr) : new Date(),
      returnDate: this.returnStr ? new Date(this.returnStr) : undefined
    }];
    this.dataChanged.emit({ tickets: this.tickets });
    this.newItem = { airline: '', flightNumber: '', origin: '', destination: '', class: 'economy', baggageAllowance: 23 };
    this.departureStr = '';
    this.returnStr = '';
    this.showForm = false;
  }

  remove(i: number): void {
    this.tickets = this.tickets.filter((_, idx) => idx !== i);
    this.dataChanged.emit({ tickets: this.tickets });
  }
}
