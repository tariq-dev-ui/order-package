import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Package } from '../../../../../core/models/package.model';
import { DistributionConfig } from '../../../../../core/models/distribution.model';
import { Agent } from '../../../../../core/models/agent.model';
import {
  PackageType, BookingMode, VisaStatus, PricingPermission,
  CommissionModel, SubagentAccessMode, DistributionStatus
} from '../../../../../core/models/enums';
import { AgentService } from '../../../../../core/services/agent.service';

@Component({
  selector: 'app-step6-details',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="step-content animate-fade-in">

      <!-- Section: Basic Details -->
      <div class="detail-section">
        <div class="section-header">
          <div>
            <div class="section-title">{{ 'builder.details.packageInfo' | translate }}</div>
            <div class="section-subtitle">{{ 'builder.details.packageInfoDesc' | translate }}</div>
          </div>
        </div>

        <div class="form-grid">
          <div class="form-group col-span-2">
            <label class="form-label">{{ 'builder.details.packageTitle' | translate }} <span class="required">*</span></label>
            <input class="form-control form-control--lg" [(ngModel)]="title" (ngModelChange)="emit()" [placeholder]="'builder.details.packageTitlePlaceholder' | translate" />
          </div>
          <div class="form-group col-span-2">
            <label class="form-label">{{ 'builder.details.description' | translate }}</label>
            <textarea class="form-control" [(ngModel)]="description" (ngModelChange)="emit()" rows="3" [placeholder]="'builder.details.descriptionPlaceholder' | translate"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">{{ 'builder.details.totalCapacity' | translate }}</label>
            <input class="form-control" type="number" [(ngModel)]="totalCapacity" (ngModelChange)="emit()" placeholder="50" />
          </div>
          <div class="form-group">
            <label class="form-label">{{ 'builder.details.departureDate' | translate }}</label>
            <input class="form-control" type="date" [(ngModel)]="departureDateStr" (ngModelChange)="emit()" />
          </div>
          <div class="form-group">
            <label class="form-label">{{ 'builder.details.validFrom' | translate }}</label>
            <input class="form-control" type="date" [(ngModel)]="validFromStr" (ngModelChange)="emit()" />
          </div>
          <div class="form-group">
            <label class="form-label">{{ 'builder.details.validTo' | translate }}</label>
            <input class="form-control" type="date" [(ngModel)]="validToStr" (ngModelChange)="emit()" />
          </div>
          <div class="form-group">
            <label class="form-label">{{ 'builder.details.numberOfNights' | translate }}</label>
            <input class="form-control" type="number" [(ngModel)]="nights" (ngModelChange)="emit()" />
          </div>
          <div class="form-group">
            <label class="form-label">{{ 'builder.details.visaStatus' | translate }}</label>
            <select class="form-control" [(ngModel)]="visaStatus" (ngModelChange)="emit()">
              <option [value]="VisaStatus.INCLUDED">{{ 'builder.details.visaStatuses.included' | translate }}</option>
              <option [value]="VisaStatus.NOT_INCLUDED">{{ 'builder.details.visaStatuses.notIncluded' | translate }}</option>
              <option [value]="VisaStatus.OPTIONAL">{{ 'builder.details.visaStatuses.optional' | translate }}</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Section: Booking Mode -->
      <div class="detail-section">
        <div class="section-header">
          <div>
            <div class="section-title">{{ 'builder.details.bookingConfig' | translate }}</div>
            <div class="section-subtitle">{{ 'builder.details.bookingConfigDesc' | translate }}</div>
          </div>
        </div>

        <div class="booking-modes">
          @for (mode of bookingModes; track mode.value) {
            <div class="bm-card" [class.selected]="bookingMode === mode.value" (click)="selectBookingMode(mode.value)">
              <div class="bm-icon">
                <span class="material-icons-round">{{ mode.icon }}</span>
              </div>
              <div class="bm-label">{{ mode.labelKey | translate }}</div>
              <div class="bm-desc">{{ mode.descKey | translate }}</div>
              <div class="bm-check">
                <span class="material-icons-round">check</span>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Section: Package Visibility & Distribution -->
      <div class="detail-section distribution-section">
        <div class="dist-section-header">
          <div class="dist-section-icon">
            <span class="material-icons-round">hub</span>
          </div>
          <div>
            <div class="section-title">{{ 'distribution.section.title' | translate }}</div>
            <div class="section-subtitle">{{ 'distribution.section.subtitle' | translate }}</div>
          </div>
        </div>

        <!-- Package Type Selector -->
        <div class="selection-card-group" style="margin-bottom: var(--space-lg);">
          <div class="selection-card" [class.selected]="packageType === PackageType.SHARED" (click)="selectPackageType(PackageType.SHARED)">
            <div class="sc-check"><span class="material-icons-round">check</span></div>
            <div class="sc-icon-wrap">
              <span class="material-icons-round">groups</span>
            </div>
            <div class="sc-title">{{ 'package.types.shared' | translate }}</div>
            <div class="sc-desc">{{ 'package.types.sharedDesc' | translate }}</div>
          </div>

          <div class="selection-card" [class.selected]="packageType === PackageType.PRIVATE_RESELL" (click)="selectPackageType(PackageType.PRIVATE_RESELL)">
            <div class="sc-check"><span class="material-icons-round">check</span></div>
            <div class="sc-icon-wrap">
              <span class="material-icons-round">verified_user</span>
            </div>
            <div class="sc-title">{{ 'package.types.privateResell' | translate }}</div>
            <div class="sc-desc">{{ 'package.types.resellDesc' | translate }}</div>
          </div>
        </div>

        <!-- Private Resell Configuration -->
        @if (packageType === PackageType.PRIVATE_RESELL) {
          <div class="resell-config animate-fade-in">
            <div class="resell-config-header">
              <span class="material-icons-round">settings</span>
              {{ 'distribution.advancedSettings' | translate }}
            </div>

            <div class="config-grid">
              <!-- Package Owner / Master Agent -->
              <div class="config-block col-span-2">
                <div class="config-block-title">
                  <span class="material-icons-round">manage_accounts</span>
                  {{ 'distribution.owner.title' | translate }}
                </div>
                <div class="form-group">
                  <label class="form-label">{{ 'distribution.owner.select' | translate }} <span class="required">*</span></label>
                  <select class="form-control" [(ngModel)]="dist.masterAgentId" (ngModelChange)="onMasterAgentChange($event)">
                    <option value="">{{ 'distribution.owner.placeholder' | translate }}</option>
                    @for (agent of masterAgents; track agent.id) {
                      <option [value]="agent.id">{{ agent.name }} — {{ agent.companyName }}</option>
                    }
                  </select>
                </div>
              </div>

              <!-- Reselling Toggle -->
              <div class="config-block">
                <div class="config-block-title">
                  <span class="material-icons-round">loop</span>
                  {{ 'distribution.reselling.title' | translate }}
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" [(ngModel)]="dist.allowReselling">
                  <div class="toggle-track"></div>
                  <span class="toggle-label">{{ 'distribution.reselling.toggle' | translate }}</span>
                </label>
                <p class="form-hint mt-2">{{ 'distribution.reselling.hint' | translate }}</p>
              </div>

              <!-- Hide Original Cost -->
              <div class="config-block">
                <div class="config-block-title">
                  <span class="material-icons-round">visibility_off</span>
                  {{ 'distribution.costVisibility.title' | translate }}
                </div>
                <label class="toggle-switch">
                  <input type="checkbox" [(ngModel)]="dist.hideOriginalCost">
                  <div class="toggle-track"></div>
                  <span class="toggle-label">{{ 'distribution.costVisibility.toggle' | translate }}</span>
                </label>
                <p class="form-hint mt-2">{{ 'distribution.costVisibility.hint' | translate }}</p>
              </div>

              <!-- Subagent Access Mode -->
              <div class="config-block">
                <div class="config-block-title">
                  <span class="material-icons-round">supervisor_account</span>
                  {{ 'distribution.subagentAccess.title' | translate }}
                </div>
                <div class="radio-group">
                  <label class="radio-option" [class.selected]="dist.subagentAccessMode === SubagentAccessMode.ALL"
                         (click)="dist.subagentAccessMode = SubagentAccessMode.ALL">
                    <div class="radio-dot"></div>
                    <div>
                      <div class="radio-label">{{ 'distribution.subagentAccess.all' | translate }}</div>
                      <div class="radio-desc">{{ 'distribution.subagentAccess.allDesc' | translate }}</div>
                    </div>
                  </label>
                  <label class="radio-option" [class.selected]="dist.subagentAccessMode === SubagentAccessMode.SELECTED"
                         (click)="dist.subagentAccessMode = SubagentAccessMode.SELECTED">
                    <div class="radio-dot"></div>
                    <div>
                      <div class="radio-label">{{ 'distribution.subagentAccess.selected' | translate }}</div>
                      <div class="radio-desc">{{ 'distribution.subagentAccess.selectedDesc' | translate }}</div>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Pricing Permission -->
              <div class="config-block">
                <div class="config-block-title">
                  <span class="material-icons-round">payments</span>
                  {{ 'distribution.pricing.title' | translate }}
                </div>
                <div class="radio-group">
                  <label class="radio-option" [class.selected]="dist.pricingPermission === PricingPermission.FIXED_BY_ADMIN"
                         (click)="dist.pricingPermission = PricingPermission.FIXED_BY_ADMIN">
                    <div class="radio-dot"></div>
                    <div>
                      <div class="radio-label">{{ 'distribution.pricing.fixed' | translate }}</div>
                      <div class="radio-desc">{{ 'distribution.pricing.fixedDesc' | translate }}</div>
                    </div>
                  </label>
                  <label class="radio-option" [class.selected]="dist.pricingPermission === PricingPermission.AGENT_MARKUP"
                         (click)="dist.pricingPermission = PricingPermission.AGENT_MARKUP">
                    <div class="radio-dot"></div>
                    <div>
                      <div class="radio-label">{{ 'distribution.pricing.markup' | translate }}</div>
                      <div class="radio-desc">{{ 'distribution.pricing.markupDesc' | translate }}</div>
                    </div>
                  </label>
                  <label class="radio-option" [class.selected]="dist.pricingPermission === PricingPermission.AGENT_FULL_CONTROL"
                         (click)="dist.pricingPermission = PricingPermission.AGENT_FULL_CONTROL">
                    <div class="radio-dot"></div>
                    <div>
                      <div class="radio-label">{{ 'distribution.pricing.fullControl' | translate }}</div>
                      <div class="radio-desc">{{ 'distribution.pricing.fullControlDesc' | translate }}</div>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Commission Model -->
              <div class="config-block">
                <div class="config-block-title">
                  <span class="material-icons-round">percent</span>
                  {{ 'distribution.commission.title' | translate }}
                </div>
                <div class="commission-row">
                  <div class="radio-group" style="flex-direction:row;gap:var(--space-sm)">
                    <label class="radio-option radio-option--sm" [class.selected]="dist.commissionModel === CommissionModel.PERCENTAGE"
                           (click)="dist.commissionModel = CommissionModel.PERCENTAGE">
                      <div class="radio-dot"></div>
                      <div class="radio-label">{{ 'distribution.commission.percentage' | translate }}</div>
                    </label>
                    <label class="radio-option radio-option--sm" [class.selected]="dist.commissionModel === CommissionModel.FIXED_AMOUNT"
                           (click)="dist.commissionModel = CommissionModel.FIXED_AMOUNT">
                      <div class="radio-dot"></div>
                      <div class="radio-label">{{ 'distribution.commission.fixed' | translate }}</div>
                    </label>
                  </div>
                  <div class="commission-value-row">
                    <div class="form-group">
                      <label class="form-label">{{ 'distribution.commission.value' | translate }}</label>
                      <div class="input-with-suffix">
                        <input class="form-control" type="number" [(ngModel)]="dist.commissionValue" />
                        <span class="input-suffix">{{ dist.commissionModel === CommissionModel.PERCENTAGE ? '%' : 'SAR' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Inventory Allocation -->
              <div class="config-block col-span-2">
                <div class="config-block-title">
                  <span class="material-icons-round">warehouse</span>
                  {{ 'distribution.inventory.title' | translate }}
                </div>
                <div class="inventory-allocation-widget">
                  <div class="ia-info">
                    <div class="ia-total-label">{{ 'distribution.inventory.totalCapacity' | translate }}</div>
                    <div class="ia-total-value">{{ totalCapacity || 0 }} {{ 'common.labels.units' | translate }}</div>
                  </div>
                  <div class="ia-arrow">
                    <span class="material-icons-round">east</span>
                  </div>
                  <div class="ia-alloc">
                    <div class="form-group">
                      <label class="form-label">{{ 'distribution.inventory.allocate' | translate }}</label>
                      <input class="form-control form-control--lg" type="number" [(ngModel)]="dist.allocatedInventory"
                             [max]="totalCapacity" placeholder="{{ totalCapacity }}" />
                    </div>
                    <div class="ia-remaining">
                      <span class="material-icons-round">inventory_2</span>
                      {{ 'distribution.inventory.remaining' | translate }}
                      <strong>{{ (totalCapacity || 0) - (dist.allocatedInventory || 0) }} {{ 'common.labels.units' | translate }}</strong>
                    </div>
                  </div>
                </div>
                <div class="inventory-bar mt-3" style="height:12px">
                  <div class="bar-fill fill-primary" [style.width.%]="getAllocPercent()"></div>
                </div>
                <div class="ia-bar-labels">
                  <span>{{ 'distribution.inventory.allocated' | translate }} {{ dist.allocatedInventory || 0 }}</span>
                  <span>{{ 'distribution.inventory.total' | translate }} {{ totalCapacity || 0 }}</span>
                </div>
              </div>
            </div>
          </div>
        }
      </div>

      <!-- Navigation -->
      <div class="step-nav">
        <button class="btn btn--secondary btn--lg" (click)="prev.emit()">
          <span class="material-icons-round">arrow_back</span> {{ 'common.buttons.back' | translate }}
        </button>
        <button class="btn btn--primary btn--lg" (click)="next.emit()">
          {{ 'builder.navigation.nextPricing' | translate }} <span class="material-icons-round">arrow_forward</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .step-content { padding: var(--space-xl); max-width: 920px; margin: 0 auto; }

    .detail-section {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-xl);
      margin-bottom: var(--space-lg);
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: var(--space-md);

      .col-span-2 { grid-column: 1 / -1; }
    }

    .booking-modes {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: var(--space-sm);

      @media (max-width: 900px) { grid-template-columns: repeat(2, 1fr); }
    }

    .bm-card {
      border: 2px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-md);
      cursor: pointer;
      transition: all var(--transition-base);
      position: relative;
      text-align: center;

      &:hover { border-color: var(--color-primary-100); }

      &.selected {
        border-color: var(--color-primary);
        background: var(--color-primary-50);
        .bm-icon { background: var(--color-primary); color: #fff; }
        .bm-label { color: var(--color-primary); }
        .bm-check { opacity: 1; }
      }

      .bm-icon {
        width: 40px; height: 40px; border-radius: var(--radius-md);
        background: var(--color-surface-3); display: flex; align-items: center;
        justify-content: center; margin: 0 auto var(--space-sm);
        transition: all var(--transition-base);
        .material-icons-round { font-size: 20px; color: var(--color-text-secondary); }
      }
      .bm-label { font-size: 0.8125rem; font-weight: 700; margin-bottom: 4px; }
      .bm-desc  { font-size: 0.75rem; color: var(--color-text-muted); line-height: 1.4; }
      .bm-check {
        position: absolute; top: 8px; right: 8px; width: 18px; height: 18px;
        background: var(--color-primary); border-radius: 50%; display: flex;
        align-items: center; justify-content: center; opacity: 0; transition: opacity var(--transition-fast);
        .material-icons-round { font-size: 11px; color: #fff; }
      }
    }

    .distribution-section { background: var(--color-surface-2); }

    .dist-section-header {
      display: flex;
      align-items: center;
      gap: var(--space-md);
      margin-bottom: var(--space-xl);
    }

    .dist-section-icon {
      width: 48px; height: 48px;
      background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
      border-radius: var(--radius-md);
      display: flex; align-items: center; justify-content: center;
      .material-icons-round { font-size: 24px; color: #fff; }
    }

    .resell-config {
      background: var(--color-surface);
      border: 1px solid var(--color-primary-100);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .resell-config-header {
      display: flex;
      align-items: center;
      gap: var(--space-sm);
      padding: 14px var(--space-lg);
      background: var(--color-primary-50);
      border-bottom: 1px solid var(--color-primary-100);
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--color-primary);
      .material-icons-round { font-size: 18px; }
    }

    .config-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1px;
      background: var(--color-border);
    }

    .config-block {
      background: var(--color-surface);
      padding: var(--space-lg);
      &.col-span-2 { grid-column: 1 / -1; }
    }

    .config-block-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 0.875rem;
      font-weight: 700;
      color: var(--color-text-primary);
      margin-bottom: var(--space-md);
      .material-icons-round { font-size: 17px; color: var(--color-primary); }
    }

    .radio-group {
      display: flex;
      flex-direction: column;
      gap: var(--space-sm);
    }

    .radio-option {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 10px 12px;
      border: 1.5px solid var(--color-border);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: all var(--transition-fast);

      &:hover { border-color: var(--color-primary-100); background: var(--color-primary-50); }

      &.selected {
        border-color: var(--color-primary);
        background: var(--color-primary-50);
        .radio-dot { background: var(--color-primary); border-color: var(--color-primary); box-shadow: inset 0 0 0 3px white; }
        .radio-label { color: var(--color-primary); }
      }

      &--sm { padding: 8px 12px; flex: 1; }
    }

    .radio-dot {
      width: 16px; height: 16px; border-radius: 50%; border: 2px solid var(--color-border);
      flex-shrink: 0; margin-top: 2px; transition: all var(--transition-fast); background: transparent;
    }

    .radio-label { font-size: 0.8125rem; font-weight: 600; color: var(--color-text-primary); }
    .radio-desc  { font-size: 0.75rem; color: var(--color-text-muted); margin-top: 2px; }

    .commission-row { display: flex; flex-direction: column; gap: var(--space-md); }
    .commission-value-row { }

    .input-with-suffix {
      display: flex;
      .form-control { border-radius: var(--radius-md) 0 0 var(--radius-md); }
      .input-suffix {
        display: flex; align-items: center; padding: 0 14px; background: var(--color-surface-3);
        border: 1px solid var(--color-border); border-left: none; border-radius: 0 var(--radius-md) var(--radius-md) 0;
        font-size: 0.875rem; font-weight: 600; color: var(--color-text-secondary);
      }
    }

    .inventory-allocation-widget {
      display: flex;
      align-items: center;
      gap: var(--space-xl);
      padding: var(--space-lg);
      background: var(--color-surface-2);
      border-radius: var(--radius-lg);
      border: 1px solid var(--color-border);
    }

    .ia-total-label { font-size: 0.75rem; color: var(--color-text-muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .ia-total-value { font-size: 1.5rem; font-weight: 800; color: var(--color-text-primary); }
    .ia-arrow .material-icons-round { font-size: 28px; color: var(--color-primary); }
    .ia-alloc { flex: 1; }

    .ia-remaining {
      display: flex; align-items: center; gap: 6px; font-size: 0.8125rem;
      color: var(--color-text-secondary); margin-top: 8px;
      .material-icons-round { font-size: 15px; color: var(--color-primary); }
      strong { color: var(--color-text-primary); }
    }

    .ia-bar-labels {
      display: flex; justify-content: space-between;
      font-size: 0.75rem; color: var(--color-text-muted); margin-top: 4px;
    }

    .step-nav {
      display: flex; align-items: center; justify-content: space-between;
      margin-top: var(--space-xl); padding-top: var(--space-xl); border-top: 1px solid var(--color-border);
    }

    .mt-2 { margin-top: 8px; }
    .mt-3 { margin-top: 12px; }
  `]
})
export class Step6DetailsComponent implements OnInit {
  @Input() packageData!: Partial<Package>;
  @Output() dataChanged = new EventEmitter<Partial<Package>>();
  @Output() next = new EventEmitter<void>();
  @Output() prev = new EventEmitter<void>();

  PackageType = PackageType;
  BookingMode = BookingMode;
  VisaStatus = VisaStatus;
  PricingPermission = PricingPermission;
  CommissionModel = CommissionModel;
  SubagentAccessMode = SubagentAccessMode;

  title = '';
  description = '';
  totalCapacity = 50;
  nights = 14;
  visaStatus = VisaStatus.INCLUDED;
  bookingMode = BookingMode.INSTANT;
  packageType = PackageType.SHARED;
  departureDateStr = '';
  validFromStr = '';
  validToStr = '';

  masterAgents: Agent[] = [];

  dist: Partial<DistributionConfig> = {
    allowReselling: true,
    subagentAccessMode: SubagentAccessMode.ALL,
    pricingPermission: PricingPermission.AGENT_MARKUP,
    hideOriginalCost: true,
    commissionModel: CommissionModel.PERCENTAGE,
    commissionValue: 8,
    allocatedInventory: 50,
    status: DistributionStatus.ACTIVE
  };

  bookingModes = [
    { value: BookingMode.INSTANT,  labelKey: 'builder.details.bookingModes.instant',  icon: 'bolt',         descKey: 'builder.details.bookingModes.instantDesc' },
    { value: BookingMode.REQUEST,  labelKey: 'builder.details.bookingModes.request',  icon: 'pending',      descKey: 'builder.details.bookingModes.requestDesc' },
    { value: BookingMode.MANUAL,   labelKey: 'builder.details.bookingModes.manual',   icon: 'handshake',    descKey: 'builder.details.bookingModes.manualDesc' },
    { value: BookingMode.INQUIRY,  labelKey: 'builder.details.bookingModes.inquiry',  icon: 'contact_mail', descKey: 'builder.details.bookingModes.inquiryDesc' }
  ];

  constructor(private agentService: AgentService) {}

  ngOnInit(): void {
    this.title = this.packageData.title || '';
    this.description = this.packageData.description || '';
    this.totalCapacity = this.packageData.totalCapacity || 50;
    this.nights = this.packageData.nights || 14;
    this.visaStatus = this.packageData.visaStatus || VisaStatus.INCLUDED;
    this.bookingMode = this.packageData.bookingMode || BookingMode.INSTANT;
    this.packageType = this.packageData.type || PackageType.SHARED;

    this.agentService.getMasterAgents().subscribe(agents => {
      this.masterAgents = agents;
    });
  }

  selectPackageType(type: PackageType): void {
    this.packageType = type;
    this.emit();
  }

  selectBookingMode(mode: BookingMode): void {
    this.bookingMode = mode;
    this.emit();
  }

  onMasterAgentChange(agentId: string): void {
    const agent = this.masterAgents.find(a => a.id === agentId);
    if (agent) {
      this.dist.masterAgentName = agent.companyName;
    }
    this.emit();
  }

  getAllocPercent(): number {
    if (!this.totalCapacity || !this.dist.allocatedInventory) return 0;
    return Math.min(100, (this.dist.allocatedInventory / this.totalCapacity) * 100);
  }

  emit(): void {
    const update: Partial<Package> = {
      title: this.title,
      description: this.description,
      totalCapacity: this.totalCapacity,
      nights: this.nights,
      visaStatus: this.visaStatus,
      bookingMode: this.bookingMode,
      isInstantBooking: this.bookingMode === BookingMode.INSTANT,
      type: this.packageType,
      departureDate: this.departureDateStr ? new Date(this.departureDateStr) : undefined,
      validFrom: this.validFromStr ? new Date(this.validFromStr) : undefined,
      validTo: this.validToStr ? new Date(this.validToStr) : undefined
    };
    if (this.packageType === PackageType.PRIVATE_RESELL) {
      update.distributionConfig = this.dist as DistributionConfig;
    }
    this.dataChanged.emit(update);
  }
}
