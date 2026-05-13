import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Package, CateringService } from '../../../../../core/models/package.model';
import { OrderSummaryData } from '../../../../../core/models/package-builder-ui.model';
import { PackageBuilderUiService } from '../../../../../core/services/package-builder-ui.service';
import { OrderSummaryComponent } from '../../components/order-summary/order-summary.component';
import { SeroDropdownComponent, SeroDropdownOption } from '../../../../../shared/components/sero-dropdown/sero-dropdown.component';

@Component({
  selector: 'app-step5-catering',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, OrderSummaryComponent, SeroDropdownComponent],
  template: `
    <div class="step-shell animate-fade-in">
      <div class="step-grid">
        <app-order-summary class="sidebar" [data]="orderSummary"></app-order-summary>
        <div class="step-content">
      <div class="step-header">
        <div class="step-icon-wrap" style="background:#fff7ed;color:#ea580c">
          <span class="material-icons-round" style="font-size:26px">restaurant</span>
        </div>
        <div>
          <h3 class="step-title">{{ 'builder.catering.title' | translate }}</h3>
          <p class="step-desc">{{ 'builder.catering.desc' | translate }}</p>
        </div>
      </div>

      @if (catering.length > 0) {
        <div class="list mb-4">
          @for (c of catering; track c.id; let i = $index) {
            <div class="item-row card card--flat">
              <div class="card-body flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="c-icon">
                    <span class="material-icons-round">restaurant_menu</span>
                  </div>
                  <div>
                    <div class="font-semibold">{{ c.provider }}</div>
                    <div class="text-sm text-secondary">{{ c.mealsPerDay }} meals/day · {{ c.mealTypes.join(', ') }} · {{ c.serviceLocation }}</div>
                  </div>
                </div>
                <button class="btn btn--icon" (click)="remove(i)">
                  <span class="material-icons-round">delete_outline</span>
                </button>
              </div>
            </div>
          }
        </div>
      }

      @if (showForm) {
        <div class="card card--flat form-card animate-scale-in">
          <div class="card-body">
            <h4 class="font-semibold text-md mb-4">{{ 'builder.catering.formTitle' | translate }}</h4>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
              <div class="form-group" style="grid-column:1/-1">
                <label class="form-label">{{ 'builder.catering.provider' | translate }} <span class="required">*</span></label>
                <input class="form-control" [(ngModel)]="newItem.provider" [placeholder]="'builder.catering.providerPlaceholder' | translate" />
              </div>
              <div class="form-group">
                <label class="form-label">{{ 'builder.catering.mealsPerDay' | translate }}</label>
                <app-sero-dropdown
                  [options]="mealsPerDayOptions"
                  [value]="newItem.mealsPerDay || null"
                  (valueChange)="newItem.mealsPerDay = $event">
                </app-sero-dropdown>
              </div>
              <div class="form-group">
                <label class="form-label">{{ 'builder.catering.serviceLocation' | translate }}</label>
                <app-sero-dropdown
                  [options]="serviceLocationOptions"
                  [value]="newItem.serviceLocation || null"
                  (valueChange)="newItem.serviceLocation = $event">
                </app-sero-dropdown>
              </div>
              <div class="form-group" style="grid-column:1/-1">
                <label class="form-label">{{ 'builder.catering.dietary' | translate }}</label>
                <input class="form-control" [ngModel]="newItem.dietaryOptions?.join(', ')" (ngModelChange)="setDietary($event)" [placeholder]="'Halal, Vegetarian, Kids Menu'" />
                <span class="form-hint">{{ 'builder.catering.dietaryHint' | translate }}</span>
              </div>
            </div>
            <div class="flex items-center gap-3 mt-4">
              <button class="btn btn--primary" (click)="add()">
                <span class="material-icons-round">add</span> {{ 'builder.catering.addBtn' | translate }}
              </button>
              <button class="btn btn--secondary" (click)="showForm = false">{{ 'common.buttons.cancel' | translate }}</button>
            </div>
          </div>
        </div>
      }

      @if (!showForm) {
        <button class="btn btn--secondary w-full add-btn" (click)="showForm = true">
          <span class="material-icons-round">add_circle_outline</span> {{ 'builder.catering.addBtn' | translate }}
        </button>
      }

      <div class="step-nav">
        <button class="btn btn--secondary btn--lg" (click)="prev.emit()">
          <span class="material-icons-round">arrow_back</span> {{ 'common.buttons.back' | translate }}
        </button>
        <button class="btn btn--primary btn--lg" (click)="next.emit()">
          {{ 'builder.navigation.nextDetails' | translate }} <span class="material-icons-round">arrow_forward</span>
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
    .c-icon { width: 44px; height: 44px; background: #fff7ed; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; .material-icons-round { color: #ea580c; } }
    .form-card { border: 2px dashed var(--color-border); margin-bottom: var(--space-md); }
    .add-btn { border: 2px dashed var(--color-border); background: transparent; color: var(--color-text-secondary); justify-content: center; padding: 14px; &:hover { border-color: #ea580c; color: #ea580c; background: #fff7ed; } }
    .step-nav { display: flex; align-items: center; justify-content: space-between; margin-top: var(--space-xl); padding-top: var(--space-xl); border-top: 1px solid var(--color-border); }
    .mb-4 { margin-bottom: 16px; }
    .mt-4 { margin-top: 16px; }
    @media (max-width: 1024px) { .step-grid { grid-template-columns: 1fr; } }
  `]
})
export class Step5CateringComponent implements OnInit {
  @Input() packageData!: Partial<Package>;
  @Output() dataChanged = new EventEmitter<Partial<Package>>();
  @Output() next = new EventEmitter<void>();
  @Output() prev = new EventEmitter<void>();

  mealsPerDayOptions: SeroDropdownOption<number>[] = [
    { value: 1, labelKey: 'builder.catering.meals.one' },
    { value: 2, labelKey: 'builder.catering.meals.two' },
    { value: 3, labelKey: 'builder.catering.meals.three' }
  ];
  serviceLocationOptions: SeroDropdownOption<string>[] = [
    { value: 'Hotel Restaurant', labelKey: 'builder.catering.locations.hotelRestaurant' },
    { value: 'Room Service', labelKey: 'builder.catering.locations.roomService' },
    { value: 'Dining Hall', labelKey: 'builder.catering.locations.diningHall' },
    { value: 'Hotel & Room Service', labelKey: 'builder.catering.locations.hotelAndRoom' }
  ];
  catering: CateringService[] = [];
  showForm = false;
  newItem: Partial<CateringService> = { provider: '', mealsPerDay: 3, serviceLocation: 'Hotel Restaurant', mealTypes: ['Breakfast', 'Lunch', 'Dinner'], dietaryOptions: ['Halal'] };
  orderSummary: OrderSummaryData = { title: '', sections: [], supportCards: [] };

  constructor(private readonly builderUi: PackageBuilderUiService) {}

  ngOnInit(): void {
    this.catering = [...(this.packageData.catering || [])];
    this.orderSummary = this.builderUi.getOrderSummaryData();
  }

  setDietary(val: string): void { this.newItem.dietaryOptions = val.split(',').map(s => s.trim()).filter(Boolean); }

  add(): void {
    if (!this.newItem.provider) return;
    this.catering = [...this.catering, { ...this.newItem as CateringService, id: 'cat-' + Date.now() }];
    this.dataChanged.emit({ catering: this.catering });
    this.newItem = { provider: '', mealsPerDay: 3, serviceLocation: 'Hotel Restaurant', mealTypes: ['Breakfast', 'Lunch', 'Dinner'], dietaryOptions: ['Halal'] };
    this.showForm = false;
  }

  remove(i: number): void {
    this.catering = this.catering.filter((_, idx) => idx !== i);
    this.dataChanged.emit({ catering: this.catering });
  }
}
