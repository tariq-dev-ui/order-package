import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PackageCardComponent } from '../../../shared/components/package-card/package-card.component';
import { PackageService } from '../../../core/services/package.service';
import { DistributionService } from '../../../core/services/distribution.service';
import { AgentService } from '../../../core/services/agent.service';
import { AnalyticsService } from '../../../core/services/analytics.service';
import { Package, PackageCardView } from '../../../core/models/package.model';
import { SubagentAllocation } from '../../../core/models/distribution.model';
import { DashboardWidget } from '../../../core/models/analytics.model';
import { Agent } from '../../../core/models/agent.model';
import { DistributionStatus } from '../../../core/models/enums';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-distributed-packages',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule, PackageCardComponent],
  template: `
    <div class="ma-dashboard animate-fade-in">

      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ 'masterAgent.dashboard.title' | translate }}</h1>
          <p class="page-subtitle">{{ 'masterAgent.dashboard.subtitle' | translate }}</p>
        </div>
        <div class="flex items-center gap-3">
          <button class="btn btn--secondary" routerLink="/master/packages/clone">
            <span class="material-icons-round">content_copy</span>
            {{ 'masterAgent.buttons.cloneCustomize' | translate }}
          </button>
          <button class="btn btn--primary">
            <span class="material-icons-round">hub</span>
            {{ 'masterAgent.buttons.manageDistribution' | translate }}
          </button>
        </div>
      </div>

      <!-- Metric Widgets -->
      @if (widgets.length > 0) {
        <div class="widgets-grid">
          @for (w of widgets; track w.id) {
            <div class="metric-widget">
              <div class="mw-header">
                <div class="mw-icon" [ngClass]="'icon-' + w.color">
                  <span class="material-icons-round">{{ w.icon }}</span>
                </div>
                <div class="mw-change" [ngClass]="w.changeType === 'increase' ? 'up' : 'down'">
                  <span class="material-icons-round">{{ w.changeType === 'increase' ? 'trending_up' : 'trending_down' }}</span>
                  {{ w.change > 0 ? '+' : '' }}{{ w.change }}%
                </div>
              </div>
              <div>
                <div class="mw-value">
                  @if (w.prefix) { <span class="mw-prefix">{{ w.prefix }}</span> }
                  {{ w.value }}
                  @if (w.suffix) { <span class="mw-suffix">{{ w.suffix }}</span> }
                </div>
                <div class="mw-label">{{ w.title }}</div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Package Cards -->
      <div class="packages-section">
        <div class="section-header">
          <div>
            <div class="section-title">{{ 'masterAgent.packages.sectionTitle' | translate }}</div>
            @if (isMyPackagesPage) {
              <div class="section-subtitle">الباقات التي تم شراؤها من الإدارة</div>
            } @else {
              <div class="section-subtitle">{{ packages.length }} {{ 'masterAgent.packages.sectionSubtitle' | translate }}</div>
            }
          </div>
          <div class="flex items-center gap-2">
            <input class="form-control form-control--sm" [(ngModel)]="searchQuery" [placeholder]="'masterAgent.packages.searchPlaceholder' | translate" style="width:200px" />
            <select class="form-control form-control--sm" [(ngModel)]="filterStatus" style="width:140px">
              <option value="">{{ 'masterAgent.packages.filterAll' | translate }}</option>
              <option value="active">{{ 'masterAgent.packages.filterActive' | translate }}</option>
              <option value="paused">{{ 'masterAgent.packages.filterPaused' | translate }}</option>
            </select>
          </div>
        </div>

        <div class="packages-grid">
          @for (pkg of displayedPackages; track pkg.id) {
            <app-package-card [pkg]="pkg" [showDistribute]="true" (view)="viewPackage(pkg)" (distribute)="openDistributeModal(pkg)" />
          }
          @empty {
            <div class="empty-state" style="grid-column:1/-1">
              <span class="material-icons-round empty-icon">inventory_2</span>
              <div class="empty-title">{{ 'package.empty.title' | translate }}</div>
              <div class="empty-desc">{{ 'package.empty.desc' | translate }}</div>
            </div>
          }
        </div>
      </div>

      <!-- Allocations Table -->
      <div class="allocations-section card">
        <div class="card-header">
          <div>
            <div class="section-title">{{ 'masterAgent.allocations.title' | translate }}</div>
            <div class="section-subtitle">{{ 'masterAgent.allocations.subtitle' | translate }}</div>
          </div>
          <button class="btn btn--primary btn--sm" (click)="showAllocateModal = true">
            <span class="material-icons-round">add</span>
            {{ 'masterAgent.buttons.newAllocation' | translate }}
          </button>
        </div>

        <div class="card-body" style="padding:0">
          <table class="data-table">
            <thead>
              <tr>
                <th>{{ 'masterAgent.allocations.columns.subagent' | translate }}</th>
                <th>{{ 'masterAgent.allocations.columns.package' | translate }}</th>
                <th>{{ 'masterAgent.allocations.columns.allocated' | translate }}</th>
                <th>{{ 'masterAgent.allocations.columns.sold' | translate }}</th>
                <th>{{ 'masterAgent.allocations.columns.remaining' | translate }}</th>
                <th>{{ 'masterAgent.allocations.columns.sellPrice' | translate }}</th>
                <th>{{ 'masterAgent.allocations.columns.status' | translate }}</th>
                <th>{{ 'masterAgent.allocations.columns.actions' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @for (alloc of allocations; track alloc.id) {
                <tr>
                  <td>
                    <div class="agent-cell">
                      <div class="agent-initials">{{ getInitials(alloc.subagentName) }}</div>
                      <div>
                        <div class="font-medium">{{ alloc.subagentName }}</div>
                        <div class="text-xs text-muted">{{ alloc.subagentCompany }}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="text-sm font-medium">{{ getPackageName(alloc.packageId) }}</span>
                  </td>
                  <td>
                    <span class="font-semibold">{{ alloc.allocatedUnits }}</span>
                  </td>
                  <td>
                    <span class="text-success font-semibold">{{ alloc.soldUnits }}</span>
                  </td>
                  <td>
                    <div class="remaining-cell">
                      <span class="font-semibold">{{ alloc.remainingUnits }}</span>
                      <div class="mini-bar">
                        <div class="mini-bar-fill" [style.width.%]="getSoldPercent(alloc)"></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div class="font-semibold">{{ alloc.sellingPrice | number:'1.0-0' }} {{ 'common.labels.currency' | translate }}</div>
                      @if (alloc.markup > 0) {
                        <div class="text-xs text-success">+{{ alloc.markup | number:'1.0-0' }} {{ 'masterAgent.allocations.markup' | translate }}</div>
                      }
                    </div>
                  </td>
                  <td>
                    <span class="badge" [ngClass]="alloc.status === 'active' ? 'badge--success' : 'badge--warning'">
                      <span class="status-dot" [ngClass]="alloc.status === 'active' ? 'status-dot--active' : 'status-dot--paused'"></span>
                      {{ alloc.status === 'active' ? ('common.status.active' | translate) : ('common.status.paused' | translate) }}
                    </span>
                  </td>
                  <td>
                    <div class="flex items-center gap-1">
                      <button class="btn btn--icon btn--sm" [title]="'common.buttons.edit' | translate" (click)="editAllocation(alloc)">
                        <span class="material-icons-round">edit</span>
                      </button>
                      <button class="btn btn--icon btn--sm" [title]="alloc.status === 'active' ? ('common.buttons.pause' | translate) : ('common.buttons.resume' | translate)" (click)="toggleAllocation(alloc)">
                        <span class="material-icons-round">{{ alloc.status === 'active' ? 'pause' : 'play_arrow' }}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- Allocation Modal -->
    @if (showAllocateModal) {
      <div class="modal-overlay" (click)="showAllocateModal = false">
        <div class="modal-panel animate-scale-in" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ 'masterAgent.modal.newAlloc' | translate }}</h3>
            <button class="btn btn--icon" (click)="showAllocateModal = false">
              <span class="material-icons-round">close</span>
            </button>
          </div>
          <div class="modal-body">
            <div class="base-price-card">
              <div class="base-price-meta">
                <div class="base-price-label">سعر البكج الأساسي</div>
                <div class="base-price-value">
                  {{ getSelectedPackageBasePrice() | number:'1.0-0' }} {{ 'common.labels.currency' | translate }}
                </div>
              </div>
              <div class="base-price-meta base-price-meta--accent">
                <div class="base-price-label">نسبة الهامش الربحي</div>
                <div class="base-price-value">
                  {{ getMarkupPercent() | number:'1.0-2' }}%
                </div>
              </div>
            </div>
            <div class="form-grid">
              <div class="form-group">
                <label class="form-label">{{ 'masterAgent.modal.selectPkg' | translate }}</label>
                <select class="form-control" [(ngModel)]="newAlloc.packageId" (ngModelChange)="onPackageChanged()">
                  <option value="">{{ 'masterAgent.modal.pkgPlaceholder' | translate }}</option>
                  @for (pkg of rawPackages; track pkg.id) {
                    <option [value]="pkg.id">{{ pkg.title }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">{{ 'masterAgent.modal.selectAgent' | translate }}</label>
                <select class="form-control" [(ngModel)]="newAlloc.subagentId">
                  <option value="">{{ 'masterAgent.modal.agentPlaceholder' | translate }}</option>
                  @for (agent of subagents; track agent.id) {
                    <option [value]="agent.id">{{ agent.name }} — {{ agent.companyName }}</option>
                  }
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">{{ 'masterAgent.modal.units' | translate }}</label>
                <input class="form-control" type="number" [(ngModel)]="newAlloc.units" placeholder="10" />
              </div>
              <div class="form-group">
                <label class="form-label">{{ 'masterAgent.modal.sellPrice' | translate }}</label>
                <input class="form-control" type="number" [(ngModel)]="newAlloc.price" placeholder="0" />
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn--secondary" (click)="showAllocateModal = false">{{ 'common.buttons.cancel' | translate }}</button>
            <button class="btn btn--primary" (click)="createAllocation()">
              <span class="material-icons-round">save</span> {{ 'masterAgent.buttons.createAllocation' | translate }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .ma-dashboard { display: flex; flex-direction: column; gap: var(--space-xl); }

    .page-header {
      display: flex; align-items: flex-start; justify-content: space-between;
    }
    .page-title    { font-size: 1.5rem; font-weight: 800; color: var(--sero-text-primary); }
    .page-subtitle { font-size: 0.875rem; color: var(--sero-text-secondary); margin-top: 4px; }

    .widgets-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: var(--space-md);
      @media (max-width: 1400px) { grid-template-columns: repeat(3, 1fr); }
      @media (max-width: 900px)  { grid-template-columns: repeat(2, 1fr); }
    }

    .packages-section { }

    .packages-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: var(--space-lg);
      margin-top: var(--space-md);
    }

    .empty-state {
      text-align: center; padding: var(--space-2xl);
      .empty-icon { font-size: 56px; color: var(--sero-border); display: block; margin-bottom: var(--space-md); }
      .empty-title { font-size: 1.125rem; font-weight: 700; margin-bottom: 8px; color: var(--sero-text-primary); }
      .empty-desc  { font-size: 0.875rem; color: var(--sero-text-secondary); }
    }

    .allocations-section { overflow: hidden; }

    .agent-cell { display: flex; align-items: center; gap: 10px; }
    .agent-initials {
      width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0; display: flex;
      align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: #fff;
      background: linear-gradient(135deg, var(--sero-primary), var(--sero-gold));
    }

    .remaining-cell { display: flex; flex-direction: column; gap: 4px; }
    .mini-bar {
      width: 80px; height: 5px; background: var(--sero-surface-3); border-radius: 3px; overflow: hidden;
      .mini-bar-fill { height: 100%; background: linear-gradient(90deg, var(--sero-primary), var(--sero-primary-light)); border-radius: 3px; transition: width .5s ease; }
    }

    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }

    /* MODAL */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(42,53,36,0.45); backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center; z-index: 1000;
    }
    .modal-panel {
      background: var(--sero-card-bg); border-radius: var(--r-xl, 14px); width: 560px;
      box-shadow: var(--shadow-md), 0 0 0 1px var(--sero-border); overflow: hidden;
    }
    .modal-header {
      display: flex; align-items: center; justify-content: space-between;
      padding: var(--space-lg); border-bottom: 1px solid var(--sero-border);
      h3 { font-size: 1.0625rem; font-weight: 700; color: var(--sero-text-primary); }
    }
    .modal-body   { padding: var(--space-lg); background: var(--sero-card-bg); }
    .modal-footer { padding: var(--space-md) var(--space-lg); border-top: 1px solid var(--sero-border); display: flex; justify-content: flex-end; gap: var(--space-sm); background: var(--sero-surface-2); }
    .base-price-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      border: 1px solid #e4ebdb;
      border-radius: 10px;
      background: #f8fbf4;
      padding: 10px 12px;
      margin-bottom: var(--space-md);
    }
    .base-price-meta {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .base-price-meta--accent {
      border-inline-start: 1px dashed #d5dfc8;
      padding-inline-start: 12px;
    }
    .base-price-label {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--sero-text-secondary);
    }
    .base-price-value {
      font-size: 1rem;
      font-weight: 800;
      color: var(--sero-primary-dark);
    }
  `]
})
export class DistributedPackagesComponent implements OnInit {
  packages: PackageCardView[] = [];
  rawPackages: Package[] = [];
  allocations: SubagentAllocation[] = [];
  widgets: DashboardWidget[] = [];
  subagents: Agent[] = [];
  searchQuery = '';
  filterStatus = '';
  showAllocateModal = false;
  newAlloc = { packageId: '', subagentId: '', units: 10, price: 0 };
  currentMasterId = 'master-001';
  isMyPackagesPage = false;

  constructor(
    private pkgService: PackageService,
    private distService: DistributionService,
    private agentService: AgentService,
    private analyticsService: AnalyticsService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.updatePageMode();
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => this.updatePageMode());

    this.analyticsService.getMasterAgentWidgets(this.currentMasterId).subscribe(w => { this.widgets = w; });

    this.pkgService.getPackagesForMasterAgent(this.currentMasterId).subscribe(pkgs => {
      this.rawPackages = pkgs;
      this.packages = pkgs.map(p => this.pkgService.toCardView(p));
    });

    this.distService.getAllocationsForMasterAgent(this.currentMasterId).subscribe(allocs => {
      this.allocations = allocs;
    });

    this.agentService.getSubagentsForMaster(this.currentMasterId).subscribe(agents => {
      this.subagents = agents;
    });
  }

  get filteredPackages(): PackageCardView[] {
    return this.packages.filter(p => {
      const q = this.searchQuery.toLowerCase();
      const matchSearch = !q || p.title.toLowerCase().includes(q);
      const matchStatus = !this.filterStatus || p.status === this.filterStatus;
      return matchSearch && matchStatus;
    });
  }

  get adminPurchasedPackages(): PackageCardView[] {
    return this.filteredPackages.filter((cardPkg) => {
      const rawPkg = this.rawPackages.find((item) => item.id === cardPkg.id);
      return !!rawPkg?.ownership?.createdByAdminId;
    });
  }

  get displayedPackages(): PackageCardView[] {
    return this.isMyPackagesPage ? this.adminPurchasedPackages : this.filteredPackages;
  }

  viewPackage(pkg: PackageCardView): void { console.log('View:', pkg); }

  openDistributeModal(pkg: PackageCardView): void {
    this.newAlloc.packageId = pkg.id;
    this.onPackageChanged();
    this.showAllocateModal = true;
  }

  onPackageChanged(): void {
    const basePrice = this.getSelectedPackageBasePrice();
    this.newAlloc.price = basePrice;
  }

  getSelectedPackageBasePrice(): number {
    const pkg = this.rawPackages.find((item) => item.id === this.newAlloc.packageId);
    return pkg?.pricingConfig?.finalSellingPrice || 0;
  }

  getMarkupPercent(): number {
    const basePrice = this.getSelectedPackageBasePrice();
    const markup = this.getMarkupAmount();
    if (!basePrice || markup <= 0) {
      return 0;
    }

    return (markup / basePrice) * 100;
  }

  getMarkupAmount(): number {
    const basePrice = this.getSelectedPackageBasePrice();
    const diff = this.newAlloc.price - basePrice;
    return diff > 0 ? diff : 0;
  }

  private updatePageMode(): void {
    this.isMyPackagesPage = this.router.url.startsWith('/master/packages');
  }

  getPackageName(pkgId: string): string {
    const pkg = this.rawPackages.find(p => p.id === pkgId);
    return pkg ? pkg.title.substring(0, 35) + (pkg.title.length > 35 ? '…' : '') : pkgId;
  }

  getSoldPercent(alloc: SubagentAllocation): number {
    return alloc.allocatedUnits > 0 ? Math.round((alloc.soldUnits / alloc.allocatedUnits) * 100) : 0;
  }

  getInitials(name: string): string {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  editAllocation(alloc: SubagentAllocation): void { console.log('Edit:', alloc); }

  toggleAllocation(alloc: SubagentAllocation): void {
    const newStatus = alloc.status === DistributionStatus.ACTIVE ? DistributionStatus.PAUSED : DistributionStatus.ACTIVE;
    this.distService.updateAllocation(alloc.id, { status: newStatus }).subscribe();
  }

  createAllocation(): void {
    const sub = this.subagents.find(a => a.id === this.newAlloc.subagentId);
    if (!sub) return;
    const pkg = this.rawPackages.find(p => p.id === this.newAlloc.packageId);

    this.distService.createAllocation({
      distributionId: 'dist-new',
      packageId: this.newAlloc.packageId,
      subagentId: this.newAlloc.subagentId,
      subagentName: sub.name,
      subagentCompany: sub.companyName,
      allocatedUnits: this.newAlloc.units,
      soldUnits: 0,
      remainingUnits: this.newAlloc.units,
      sellingPrice: this.newAlloc.price,
      markup: this.getMarkupAmount(),
      status: DistributionStatus.ACTIVE,
      assignedAt: new Date()
    }).subscribe(() => {
      this.showAllocateModal = false;
      this.ngOnInit();
    });
  }
}
