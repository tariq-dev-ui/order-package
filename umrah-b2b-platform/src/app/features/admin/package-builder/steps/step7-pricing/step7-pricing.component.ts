import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Package } from '../../../../../core/models/package.model';
import { PricingConfig, CostBreakdown, PricingSimulationResult } from '../../../../../core/models/pricing.model';
import { MarkupType } from '../../../../../core/models/enums';
import { PricingService } from '../../../../../core/services/pricing.service';

@Component({
  selector: 'app-step7-pricing',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="step-content animate-fade-in">
      <div class="pricing-layout">

        <!-- LEFT: Input Panels -->
        <div class="pricing-inputs">

          <!-- Cost Breakdown -->
          <div class="pricing-panel">
            <div class="panel-header">
              <span class="material-icons-round panel-icon" style="color:#3b82f6">receipt_long</span>
              <div>
                <div class="panel-title">{{ 'pricing.costBreakdown.title' | translate }}</div>
                <div class="panel-subtitle">{{ 'pricing.costBreakdown.subtitle' | translate }}</div>
              </div>
            </div>

            <div class="cost-items">
              <div class="cost-item">
                <div class="cost-item-label">
                  <span class="material-icons-round">hotel</span>
                  {{ 'pricing.costBreakdown.makkahHotels' | translate }}
                </div>
                <div class="cost-item-input">
                  <input class="form-control form-control--sm" type="number" [(ngModel)]="cost.hotelMakkah" (ngModelChange)="recalculate()" placeholder="0" />
                  <span class="input-currency">{{ 'common.labels.currency' | translate }}</span>
                </div>
              </div>
              <div class="cost-item">
                <div class="cost-item-label">
                  <span class="material-icons-round">hotel</span>
                  {{ 'pricing.costBreakdown.madinahHotels' | translate }}
                </div>
                <div class="cost-item-input">
                  <input class="form-control form-control--sm" type="number" [(ngModel)]="cost.hotelMadinah" (ngModelChange)="recalculate()" placeholder="0" />
                  <span class="input-currency">{{ 'common.labels.currency' | translate }}</span>
                </div>
              </div>
              <div class="cost-item">
                <div class="cost-item-label">
                  <span class="material-icons-round">directions_bus</span>
                  {{ 'pricing.costBreakdown.transportation' | translate }}
                </div>
                <div class="cost-item-input">
                  <input class="form-control form-control--sm" type="number" [(ngModel)]="cost.transportation" (ngModelChange)="recalculate()" placeholder="0" />
                  <span class="input-currency">{{ 'common.labels.currency' | translate }}</span>
                </div>
              </div>
              <div class="cost-item">
                <div class="cost-item-label">
                  <span class="material-icons-round">flight</span>
                  {{ 'pricing.costBreakdown.tickets' | translate }}
                </div>
                <div class="cost-item-input">
                  <input class="form-control form-control--sm" type="number" [(ngModel)]="cost.tickets" (ngModelChange)="recalculate()" placeholder="0" />
                  <span class="input-currency">{{ 'common.labels.currency' | translate }}</span>
                </div>
              </div>
              <div class="cost-item">
                <div class="cost-item-label">
                  <span class="material-icons-round">restaurant</span>
                  {{ 'pricing.costBreakdown.catering' | translate }}
                </div>
                <div class="cost-item-input">
                  <input class="form-control form-control--sm" type="number" [(ngModel)]="cost.catering" (ngModelChange)="recalculate()" placeholder="0" />
                  <span class="input-currency">{{ 'common.labels.currency' | translate }}</span>
                </div>
              </div>
              <div class="cost-item">
                <div class="cost-item-label">
                  <span class="material-icons-round">badge</span>
                  {{ 'pricing.costBreakdown.visa' | translate }}
                </div>
                <div class="cost-item-input">
                  <input class="form-control form-control--sm" type="number" [(ngModel)]="cost.visa" (ngModelChange)="recalculate()" placeholder="0" />
                  <span class="input-currency">{{ 'common.labels.currency' | translate }}</span>
                </div>
              </div>
              <div class="cost-item">
                <div class="cost-item-label">
                  <span class="material-icons-round">add_circle_outline</span>
                  {{ 'pricing.costBreakdown.other' | translate }}
                </div>
                <div class="cost-item-input">
                  <input class="form-control form-control--sm" type="number" [(ngModel)]="cost.other" (ngModelChange)="recalculate()" placeholder="0" />
                  <span class="input-currency">{{ 'common.labels.currency' | translate }}</span>
                </div>
              </div>

              <div class="cost-total">
                <span>{{ 'pricing.costBreakdown.total' | translate }}</span>
                <span class="cost-total-value">{{ cost.total | number:'1.0-0' }} {{ 'common.labels.currency' | translate }}</span>
              </div>
            </div>
          </div>

          <!-- Agent Margin -->
          <div class="pricing-panel">
            <div class="panel-header">
              <span class="material-icons-round panel-icon" style="color:#16a34a">trending_up</span>
              <div>
                <div class="panel-title">{{ 'pricing.margin.title' | translate }}</div>
                <div class="panel-subtitle">{{ 'pricing.margin.subtitle' | translate }}</div>
              </div>
            </div>

            <div class="margin-row">
              <div class="margin-type-btns">
                <button class="margin-type-btn" [class.active]="markupType === MarkupType.PERCENTAGE" (click)="markupType = MarkupType.PERCENTAGE; recalculate()">
                  <span class="material-icons-round">percent</span>
                  {{ 'pricing.margin.percentage' | translate }}
                </button>
                <button class="margin-type-btn" [class.active]="markupType === MarkupType.FIXED" (click)="markupType = MarkupType.FIXED; recalculate()">
                  <span class="material-icons-round">attach_money</span>
                  {{ 'pricing.margin.fixed' | translate }}
                </button>
              </div>

              <div class="form-group">
                <label class="form-label">{{ 'pricing.margin.markupValue' | translate }}</label>
                <div class="input-with-suffix">
                  <input class="form-control" type="number" [(ngModel)]="markupValue" (ngModelChange)="recalculate()" [placeholder]="markupType === MarkupType.PERCENTAGE ? '15' : '2000'" />
                  <span class="input-suffix">{{ markupType === MarkupType.PERCENTAGE ? '%' : 'SAR' }}</span>
                </div>
              </div>

              @if (simulation) {
                <div class="margin-result">
                  <div class="mr-row">
                    <span>{{ 'pricing.margin.markupAmount' | translate }}</span>
                    <span class="mr-value">+ {{ simulation.markupAmount | number:'1.0-0' }} {{ 'common.labels.currency' | translate }}</span>
                  </div>
                  <div class="mr-row highlight">
                    <span>{{ 'pricing.margin.profitMargin' | translate }}</span>
                    <span class="mr-value highlight">{{ simulation.profitPercentage }}%</span>
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Visibility & Options -->
          <div class="pricing-panel">
            <div class="panel-header">
              <span class="material-icons-round panel-icon" style="color:#7c3aed">tune</span>
              <div>
                <div class="panel-title">{{ 'pricing.displayOptions.title' | translate }}</div>
                <div class="panel-subtitle">{{ 'pricing.displayOptions.subtitle' | translate }}</div>
              </div>
            </div>

            <div class="options-list">
              <div class="option-row">
                <div class="option-info">
                  <div class="option-label">{{ 'pricing.displayOptions.hideBreakdown' | translate }}</div>
                  <div class="option-desc">{{ 'pricing.displayOptions.hideBreakdownDesc' | translate }}</div>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" [(ngModel)]="hideServiceBreakdown">
                  <div class="toggle-track"></div>
                </label>
              </div>
              <div class="option-row">
                <div class="option-info">
                  <div class="option-label">{{ 'pricing.displayOptions.hideCost' | translate }}</div>
                  <div class="option-desc">{{ 'pricing.displayOptions.hideCostDesc' | translate }}</div>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" [(ngModel)]="hideCostFromSubagents">
                  <div class="toggle-track"></div>
                </label>
              </div>
              <div class="option-row">
                <div class="option-info">
                  <div class="option-label">{{ 'pricing.displayOptions.blended' | translate }}</div>
                  <div class="option-desc">{{ 'pricing.displayOptions.blendedDesc' | translate }}</div>
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" [(ngModel)]="isBlendedPrice">
                  <div class="toggle-track"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT: Live Simulator -->
        <div class="pricing-sidebar">
          <div class="simulator-sticky">
            <!-- Price Preview Card -->
            <div class="pricing-simulator">
              <div class="ps-sim-header">
                <span class="material-icons-round">calculate</span>
                {{ 'pricing.simulator.title' | translate }}
              </div>

              <div class="ps-row">
                <span class="ps-label">{{ 'pricing.simulator.adminCost' | translate }}</span>
                <span class="ps-value">{{ cost.total | number:'1.0-0' }} {{ 'common.labels.currency' | translate }}</span>
              </div>
              @if (simulation) {
                <div class="ps-row">
                  <span class="ps-label">{{ markupType === MarkupType.PERCENTAGE ? ('pricing.margin.percentage' | translate) + ' ' + markupValue + '%' : ('pricing.margin.fixed' | translate) }}</span>
                  <span class="ps-value">+ {{ simulation.markupAmount | number:'1.0-0' }} {{ 'common.labels.currency' | translate }}</span>
                </div>
              }
              <div class="ps-total-row">
                <div>
                  <div style="font-size:.75rem;opacity:.6;margin-bottom:4px">{{ 'pricing.simulator.sellingPrice' | translate }}</div>
                  <div class="ps-value highlight">{{ simulation?.sellingPrice || cost.total | number:'1.0-0' }} {{ 'common.labels.currency' | translate }}</div>
                </div>
                @if (simulation) {
                  <div class="profit-pill">
                    <span class="material-icons-round">trending_up</span>
                    {{ simulation.profitPercentage }}% {{ 'pricing.simulator.margin' | translate }}
                  </div>
                }
              </div>
            </div>

            <!-- Profit Simulation Panel -->
            @if (simulation && simulation.totalProfit > 0) {
              <div class="profit-panel animate-scale-in">
                <div class="pp-header">
                  <span class="material-icons-round">account_balance_wallet</span>
                  {{ 'pricing.simulator.profitSimTitle' | translate }}
                </div>
                <div class="pp-stat">
                  <span class="pp-label">{{ 'pricing.simulator.profitPerPax' | translate }}</span>
                  <span class="pp-value">{{ simulation.profitPerPax | number:'1.0-0' }} {{ 'common.labels.currency' | translate }}</span>
                </div>
                <div class="pp-stat">
                  <span class="pp-label">{{ 'pricing.simulator.ifPaxSold' | translate:{count: paxCount} }}</span>
                  <span class="pp-value profit">{{ simulation.profitPerPax * paxCount | number:'1.0-0' }} {{ 'common.labels.currency' | translate }}</span>
                </div>
                <div class="pp-pax-input">
                  <label class="form-label">{{ 'pricing.simulator.simulatePax' | translate }}</label>
                  <input class="form-control form-control--sm" type="number" [(ngModel)]="paxCount" (ngModelChange)="recalculate()" min="1" />
                </div>
              </div>
            }

            <!-- Price Summary Card -->
            <div class="price-card">
              <div class="pc-label">{{ 'pricing.priceCard.perPerson' | translate }}</div>
              <div class="pc-value">{{ simulation?.sellingPrice || cost.total | number:'1.0-0' }} <span class="pc-currency">{{ 'common.labels.currency' | translate }}</span></div>
              @if (simulation) {
                <div class="pc-badges">
                  <span class="badge badge--success">
                    <span class="material-icons-round">check_circle</span>
                    {{ simulation.profitPercentage }}% {{ 'pricing.simulator.margin' | translate }}
                  </span>
                  <span class="badge badge--info">
                    <span class="material-icons-round">payments</span>
                    {{ markupType === MarkupType.PERCENTAGE ? ('pricing.simulator.percentageMarkup' | translate) : ('pricing.simulator.fixedMarkup' | translate) }}
                  </span>
                </div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="step-nav">
        <button class="btn btn--secondary btn--lg" (click)="prev.emit()">
          <span class="material-icons-round">arrow_back</span> {{ 'builder.navigation.backToDetails' | translate }}
        </button>
        <div class="flex items-center gap-3">
          <div class="final-price-summary">
            <span class="fps-label">{{ 'pricing.priceCard.sellingPrice' | translate }}:</span>
            <span class="fps-value">{{ simulation?.sellingPrice || cost.total | number:'1.0-0' }} {{ 'common.labels.currency' | translate }}</span>
            <span class="fps-profit">{{ simulation ? '+' + (simulation.profitPercentage) + '% ' + ('pricing.simulator.margin' | translate) : '' }}</span>
          </div>
          <button class="btn btn--primary btn--lg" (click)="publish.emit()">
            <span class="material-icons-round">rocket_launch</span>
            {{ 'builder.navigation.publishPackage' | translate }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .step-content { padding: var(--space-xl); max-width: 1200px; margin: 0 auto; }

    .pricing-layout {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: var(--space-xl);
      align-items: start;
    }

    .pricing-inputs { display: flex; flex-direction: column; gap: var(--space-md); }

    .pricing-panel {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .panel-header {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      padding: var(--space-md) var(--space-lg);
      border-bottom: 1px solid var(--color-border);
      background: var(--color-surface-2);
    }

    .panel-icon { font-size: 22px; }
    .panel-title    { font-size: 0.9375rem; font-weight: 700; }
    .panel-subtitle { font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px; }

    .cost-items {
      padding: var(--space-md) var(--space-lg);
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }

    .cost-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-md);
      padding: 8px 0;
      border-bottom: 1px solid var(--color-border-light);
      &:last-of-type { border-bottom: none; }
    }

    .cost-item-label {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
      color: var(--color-text-secondary);
      font-weight: 500;
      flex: 1;
      .material-icons-round { font-size: 17px; color: var(--color-text-muted); }
    }

    .cost-item-input {
      display: flex;
      align-items: center;
      gap: 4px;
      width: 160px;
      .form-control { width: 120px; text-align: right; }
      .input-currency { font-size: 0.75rem; color: var(--color-text-muted); font-weight: 600; }
    }

    .cost-total {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 0 0;
      font-weight: 700;
      font-size: 0.9375rem;
    }

    .cost-total-value {
      color: var(--color-primary);
      font-size: 1.125rem;
    }

    .margin-row { padding: var(--space-lg); display: flex; flex-direction: column; gap: var(--space-md); }

    .margin-type-btns {
      display: flex;
      gap: var(--space-sm);
    }

    .margin-type-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 9px 16px;
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-md);
      background: transparent;
      font-size: 0.8125rem;
      font-weight: 600;
      cursor: pointer;
      transition: all var(--transition-fast);
      color: var(--color-text-secondary);
      .material-icons-round { font-size: 16px; }

      &:hover  { border-color: var(--color-primary); color: var(--color-primary); }
      &.active { border-color: var(--color-primary); background: var(--color-primary-50); color: var(--color-primary); }
    }

    .margin-result {
      background: var(--color-surface-2);
      border-radius: var(--radius-md);
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .mr-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.8125rem;
      &.highlight { color: var(--color-success); font-weight: 700; }
    }

    .mr-value { font-weight: 700; }
    .mr-value.highlight { color: var(--color-success); font-size: 1rem; }

    .options-list { padding: var(--space-lg); display: flex; flex-direction: column; gap: var(--space-md); }

    .option-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-md);
      padding: 10px 0;
      border-bottom: 1px solid var(--color-border-light);
      &:last-child { border-bottom: none; }
    }

    .option-label { font-size: 0.875rem; font-weight: 600; }
    .option-desc  { font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px; }

    /* RIGHT SIDEBAR */
    .pricing-sidebar { }
    .simulator-sticky { position: sticky; top: calc(var(--topbar-height) + 24px); display: flex; flex-direction: column; gap: var(--space-md); }

    .ps-sim-header {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.8125rem;
      font-weight: 700;
      opacity: 0.7;
      margin-bottom: var(--space-md);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      .material-icons-round { font-size: 16px; }
    }

    .profit-pill {
      display: flex;
      align-items: center;
      gap: 4px;
      background: rgba(74, 222, 128, 0.15);
      color: #4ade80;
      padding: 6px 12px;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 700;
      .material-icons-round { font-size: 14px; }
    }

    .profit-panel {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .pp-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px var(--space-md);
      background: var(--color-success-bg);
      border-bottom: 1px solid var(--color-border);
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--color-success);
      .material-icons-round { font-size: 17px; }
    }

    .pp-stat {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px var(--space-md);
      border-bottom: 1px solid var(--color-border-light);
    }
    .pp-label { font-size: 0.8125rem; color: var(--color-text-secondary); }
    .pp-value { font-size: 0.9375rem; font-weight: 700; &.profit { color: var(--color-success); } }
    .pp-pax-input { padding: var(--space-md); }

    .price-card {
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
      border-radius: var(--radius-lg);
      padding: var(--space-lg);
      color: #fff;
      text-align: center;
    }

    .pc-label    { font-size: 0.75rem; opacity: .7; text-transform: uppercase; letter-spacing: .05em; margin-bottom: 8px; }
    .pc-value    { font-size: 2.5rem; font-weight: 800; letter-spacing: -.04em; line-height: 1; }
    .pc-currency { font-size: 1rem; font-weight: 500; opacity: .8; }
    .pc-badges   { display: flex; gap: 6px; justify-content: center; flex-wrap: wrap; margin-top: 12px; }

    .input-with-suffix {
      display: flex;
      .form-control { border-radius: var(--radius-md) 0 0 var(--radius-md); }
      .input-suffix { display: flex; align-items: center; padding: 0 12px; background: var(--color-surface-3); border: 1px solid var(--color-border); border-left: none; border-radius: 0 var(--radius-md) var(--radius-md) 0; font-size: .875rem; font-weight: 600; color: var(--color-text-secondary); }
    }

    .step-nav {
      display: flex; align-items: center; justify-content: space-between;
      margin-top: var(--space-xl); padding-top: var(--space-xl); border-top: 1px solid var(--color-border);
    }

    .final-price-summary {
      display: flex; align-items: center; gap: 8px;
      background: var(--color-surface-2); border: 1px solid var(--color-border);
      border-radius: var(--radius-md); padding: 10px 16px;
    }
    .fps-label  { font-size: .8125rem; color: var(--color-text-muted); }
    .fps-value  { font-size: 1rem; font-weight: 800; color: var(--color-text-primary); }
    .fps-profit { font-size: .75rem; color: var(--color-success); font-weight: 600; }
  `]
})
export class Step7PricingComponent implements OnInit {
  @Input() packageData!: Partial<Package>;
  @Output() dataChanged = new EventEmitter<Partial<Package>>();
  @Output() prev = new EventEmitter<void>();
  @Output() publish = new EventEmitter<void>();

  MarkupType = MarkupType;

  cost: CostBreakdown = { hotelMakkah: 0, hotelMadinah: 0, transportation: 0, tickets: 0, catering: 0, visa: 0, other: 0, total: 0 };
  markupType = MarkupType.PERCENTAGE;
  markupValue = 15;
  paxCount = 10;
  hideServiceBreakdown = true;
  hideCostFromSubagents = true;
  isBlendedPrice = false;
  simulation: PricingSimulationResult | null = null;

  constructor(private pricingService: PricingService) {}

  ngOnInit(): void {
    if (this.packageData.pricingConfig) {
      this.cost = { ...this.packageData.pricingConfig.costBreakdown };
      this.markupType = this.packageData.pricingConfig.agentMargin?.type || MarkupType.PERCENTAGE;
      this.markupValue = this.packageData.pricingConfig.agentMargin?.value || 15;
    }
    this.recalculate();
  }

  recalculate(): void {
    this.cost.total = this.cost.hotelMakkah + this.cost.hotelMadinah + this.cost.transportation + this.cost.tickets + this.cost.catering + this.cost.visa + this.cost.other;

    if (this.cost.total > 0) {
      this.simulation = this.pricingService.simulate({
        baseAdminCost: this.cost.total,
        markupType: this.markupType,
        markupValue: this.markupValue,
        paxCount: this.paxCount,
        includeVisa: false,
        visaCost: 0,
        groupDiscount: 0
      });
    }

    const pricing: Partial<PricingConfig> = {
      currency: 'SAR',
      costBreakdown: { ...this.cost },
      adminCostTotal: this.cost.total,
      agentMargin: { type: this.markupType, value: this.markupValue, calculatedAmount: this.simulation?.markupAmount || 0 },
      finalSellingPrice: this.simulation?.sellingPrice || this.cost.total,
      profitMargin: this.simulation?.markupAmount || 0,
      profitPercentage: this.simulation?.profitPercentage || 0,
      hideServiceBreakdown: this.hideServiceBreakdown,
      hideCostFromSubagents: this.hideCostFromSubagents,
      isBlendedPrice: this.isBlendedPrice,
      perPersonPrice: this.simulation?.sellingPrice || this.cost.total
    };

    this.dataChanged.emit({ pricingConfig: pricing as PricingConfig });
  }
}
