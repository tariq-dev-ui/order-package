import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AnalyticsService } from '../../../core/services/analytics.service';
import {
  DistributionAnalytics, DashboardWidget, AgentPerformance, PackagePerformanceMetric
} from '../../../core/models/analytics.model';
import { SeroDropdownComponent, SeroDropdownOption } from '../../../shared/components/sero-dropdown/sero-dropdown.component';

@Component({
  selector: 'app-admin-analytics',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, SeroDropdownComponent],
  template: `
    <div class="analytics-dashboard animate-fade-in">

      <!-- Page Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ 'analytics.adminTitle' | translate }}</h1>
          <p class="page-subtitle">{{ 'analytics.adminSubtitle' | translate }}</p>
        </div>
        <div class="flex items-center gap-2">
          <div style="width: 170px;">
            <app-sero-dropdown
              size="sm"
              [options]="periodOptions"
              [value]="selectedPeriod"
              (valueChange)="selectedPeriod = $event">
            </app-sero-dropdown>
          </div>
          <button class="btn btn--secondary btn--sm">
            <span class="material-icons-round">download</span>
            {{ 'common.buttons.export' | translate }}
          </button>
        </div>
      </div>

      <!-- KPI Widgets -->
      @if (widgets.length > 0) {
        <div class="kpi-grid">
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

      @if (analytics) {
        <div class="analytics-body">

          <!-- Inventory Overview -->
          <div class="card analytics-card">
            <div class="card-header">
              <div class="section-title">{{ 'analytics.inventory.title' | translate }}</div>
            </div>
            <div class="card-body">
              <div class="inventory-overview">
                <div class="io-stat">
                  <div class="io-value" style="color:var(--color-primary)">{{ analytics.totalInventory }}</div>
                  <div class="io-label">{{ 'analytics.inventory.total' | translate }}</div>
                </div>
                <div class="io-stat">
                  <div class="io-value" style="color:var(--color-success)">{{ analytics.soldInventory }}</div>
                  <div class="io-label">{{ 'analytics.inventory.sold' | translate }}</div>
                </div>
                <div class="io-stat">
                  <div class="io-value" style="color:var(--color-warning)">{{ analytics.remainingInventory }}</div>
                  <div class="io-label">{{ 'analytics.inventory.remaining' | translate }}</div>
                </div>
                <div class="io-stat">
                  <div class="io-value" style="color:var(--color-info)">{{ analytics.conversionRate }}%</div>
                  <div class="io-label">{{ 'analytics.inventory.conversion' | translate }}</div>
                </div>
              </div>

              <!-- Big Stacked Bar -->
              <div class="stacked-bar-wrap">
                <div class="stacked-bar">
                  <div class="sb-segment sb-sold"
                       [style.width.%]="(analytics.soldInventory / analytics.totalInventory) * 100">
                    <span>{{ 'analytics.inventory.sold' | translate }} {{ analytics.soldInventory }}</span>
                  </div>
                  <div class="sb-segment sb-remaining"
                       [style.width.%]="(analytics.remainingInventory / analytics.totalInventory) * 100">
                    <span>{{ 'analytics.inventory.remaining' | translate }} {{ analytics.remainingInventory }}</span>
                  </div>
                </div>
                <div class="sb-legend">
                  <span class="sb-dot sb-dot-sold"></span>{{ 'analytics.inventory.sold' | translate }} &nbsp;
                  <span class="sb-dot sb-dot-remaining"></span>{{ 'analytics.inventory.remaining' | translate }}
                </div>
              </div>
            </div>
          </div>

          <!-- Revenue Chart (Monthly) -->
          <div class="card analytics-card analytics-card--wide">
            <div class="card-header">
              <div class="section-title">{{ 'analytics.revenue.title' | translate }}</div>
            </div>
            <div class="card-body">
              <div class="bar-chart">
                @for (m of analytics.revenueByMonth; track m.month) {
                  <div class="bc-col">
                    <div class="bc-bar-wrap">
                      <div class="bc-bar"
                           [style.height.%]="getRevenueBarHeight(m.revenue)"
                           [class.bc-bar--empty]="m.revenue === 0"
                           [title]="m.revenue | number">
                        @if (m.revenue > 0) {
                          <span class="bc-value">{{ (m.revenue / 1000) | number:'1.0-0' }}K</span>
                        }
                      </div>
                    </div>
                    <div class="bc-label">{{ m.month }}</div>
                  </div>
                }
              </div>
            </div>
          </div>

          <!-- Top Performing Agents -->
          <div class="card analytics-card">
            <div class="card-header">
              <div class="section-title">{{ 'analytics.topAgents.title' | translate }}</div>
              <span class="badge badge--primary">{{ 'analytics.topAgents.thisMonth' | translate }}</span>
            </div>
            <div class="card-body" style="padding:0">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>{{ 'analytics.topAgents.columns.rank' | translate }}</th>
                    <th>{{ 'analytics.topAgents.columns.agent' | translate }}</th>
                    <th>{{ 'analytics.topAgents.columns.sold' | translate }}</th>
                    <th>{{ 'analytics.topAgents.columns.revenue' | translate }}</th>
                    <th>{{ 'analytics.topAgents.columns.conversion' | translate }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (agent of analytics.topSellingAgents; track agent.agentId) {
                    <tr>
                      <td>
                        <div class="rank-badge" [ngClass]="'rank-' + agent.rank">
                          @if (agent.rank <= 3) {
                            <span class="material-icons-round">{{ agent.rank === 1 ? 'emoji_events' : agent.rank === 2 ? 'military_tech' : 'workspace_premium' }}</span>
                          } @else {
                            {{ agent.rank }}
                          }
                        </div>
                      </td>
                      <td>
                        <div class="agent-cell">
                          <div class="agent-av">{{ getInitials(agent.agentName) }}</div>
                          <div>
                            <div class="font-semibold text-sm">{{ agent.agentName }}</div>
                            <div class="text-xs text-muted">{{ agent.companyName }}</div>
                          </div>
                        </div>
                      </td>
                      <td><span class="font-bold text-primary">{{ agent.packagesSold }}</span></td>
                      <td><span class="font-semibold">{{ agent.revenue | number:'1.0-0' }} {{ 'common.labels.currency' | translate }}</span></td>
                      <td>
                        <div class="conv-cell">
                          <span class="font-semibold">{{ agent.conversionRate }}%</span>
                          <div class="mini-bar" style="width:60px">
                            <div class="mini-bar-fill" [style.width.%]="agent.conversionRate"></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

          <!-- Package Performance -->
          <div class="card analytics-card analytics-card--wide">
            <div class="card-header">
              <div class="section-title">{{ 'analytics.packagePerf.title' | translate }}</div>
            </div>
            <div class="card-body" style="padding:0">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>{{ 'analytics.packagePerf.columns.package' | translate }}</th>
                    <th>{{ 'analytics.packagePerf.columns.allocated' | translate }}</th>
                    <th>{{ 'analytics.packagePerf.columns.sold' | translate }}</th>
                    <th>{{ 'analytics.packagePerf.columns.remaining' | translate }}</th>
                    <th>{{ 'analytics.packagePerf.columns.revenue' | translate }}</th>
                    <th>{{ 'analytics.packagePerf.columns.convRate' | translate }}</th>
                    <th>{{ 'analytics.packagePerf.columns.fill' | translate }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (pkg of analytics.packagePerformance; track pkg.packageId) {
                    <tr>
                      <td>
                        <span class="font-semibold text-sm">{{ pkg.packageTitle }}</span>
                      </td>
                      <td>{{ pkg.allocated }}</td>
                      <td><span class="text-success font-bold">{{ pkg.sold }}</span></td>
                      <td>{{ pkg.remaining }}</td>
                      <td><span class="font-semibold">{{ pkg.revenue | number:'1.0-0' }} {{ 'common.labels.currency' | translate }}</span></td>
                      <td>{{ pkg.conversionRate }}%</td>
                      <td>
                        <div class="fill-bar-cell">
                          <div class="inventory-bar" style="width:100px;display:inline-block">
                            <div class="bar-fill" [ngClass]="getFillClass(pkg)" [style.width.%]="getFillPct(pkg)"></div>
                          </div>
                          <span class="text-xs font-semibold ml-2">{{ getFillPct(pkg) | number:'1.0-0' }}%</span>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>

        </div>
      }
    </div>
  `,
  styles: [`
    .analytics-dashboard { display: flex; flex-direction: column; gap: var(--space-xl); }

    .page-header { display: flex; align-items: flex-start; justify-content: space-between; }
    .page-title    { font-size: 1.5rem; font-weight: 800; color: var(--sero-text-primary); }
    .page-subtitle { font-size: 0.875rem; color: var(--sero-text-secondary); margin-top: 4px; }

    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: var(--space-md);
      @media (max-width: 1400px) { grid-template-columns: repeat(3, 1fr); }
      @media (max-width: 900px)  { grid-template-columns: repeat(2, 1fr); }
    }

    .analytics-body {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-lg);
      .analytics-card--wide { grid-column: 1 / -1; }
    }

    .analytics-card { overflow: hidden; }

    .inventory-overview {
      display: flex;
      gap: var(--space-xl);
      margin-bottom: var(--space-lg);
      flex-wrap: wrap;
    }

    .io-stat { text-align: center; }
    .io-value { font-size: 2rem; font-weight: 800; letter-spacing: -0.03em; }
    .io-label { font-size: 0.75rem; color: var(--sero-text-muted); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.05em; }

    .stacked-bar-wrap { }

    .stacked-bar {
      height: 36px;
      border-radius: var(--r-md, 10px);
      overflow: hidden;
      display: flex;
      margin-bottom: 8px;
    }

    .sb-segment {
      display: flex;
      align-items: center;
      padding: 0 10px;
      font-size: 0.75rem;
      font-weight: 700;
      color: #fff;
      white-space: nowrap;
      overflow: hidden;
      transition: width .6s ease;
    }
    .sb-sold      { background: linear-gradient(90deg, var(--sero-success), #4d8f66); }
    .sb-remaining { background: linear-gradient(90deg, var(--sero-warning), #c98a3a); }

    .sb-legend {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 0.75rem;
      color: var(--sero-text-secondary);
    }

    .sb-dot { width: 10px; height: 10px; border-radius: 2px; display: inline-block; margin-right: 4px; vertical-align: middle; }
    .sb-dot-sold      { background: var(--sero-success); }
    .sb-dot-remaining { background: var(--sero-warning); }

    /* BAR CHART */
    .bar-chart {
      display: flex;
      align-items: flex-end;
      gap: var(--space-sm);
      height: 200px;
      padding-bottom: 28px;
    }

    .bc-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      height: 100%;
    }

    .bc-bar-wrap {
      flex: 1;
      width: 100%;
      display: flex;
      align-items: flex-end;
    }

    .bc-bar {
      width: 100%;
      background: linear-gradient(0deg, var(--sero-primary), var(--sero-primary-light));
      border-radius: 5px 5px 0 0;
      min-height: 4px;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: 5px;
      transition: height .5s ease;
      position: relative;

      &--empty { background: var(--sero-surface-3); }
    }

    .bc-value {
      font-size: 0.7rem;
      font-weight: 700;
      color: #fff;
      white-space: nowrap;
    }

    .bc-label {
      font-size: 0.75rem;
      color: var(--sero-text-muted);
      margin-top: 6px;
      font-weight: 600;
    }

    /* RANK */
    .rank-badge {
      width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
      font-size: 0.8125rem; font-weight: 700; background: var(--sero-surface-3); color: var(--sero-text-muted);
      .material-icons-round { font-size: 17px; }
      &.rank-1 { background: var(--sero-gold-50); color: var(--sero-gold); }
      &.rank-2 { background: var(--sero-surface-3); color: var(--sero-text-tertiary); }
      &.rank-3 { background: var(--sero-warning-bg); color: var(--sero-warning); }
    }

    .agent-cell  { display: flex; align-items: center; gap: 10px; }
    .agent-av    { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg, var(--sero-primary), var(--sero-gold)); display: flex; align-items: center; justify-content: center; font-size: .75rem; font-weight: 700; color: #fff; flex-shrink: 0; }

    .conv-cell { display: flex; align-items: center; gap: 8px; }
    .mini-bar  { height: 5px; background: var(--sero-surface-3); border-radius: 3px; overflow: hidden; .mini-bar-fill { height: 100%; background: var(--sero-primary); border-radius: 3px; } }

    .fill-bar-cell { display: flex; align-items: center; gap: 6px; }
    .ml-2 { margin-left: 8px; }
  `]
})
export class AdminAnalyticsComponent implements OnInit {
  analytics: DistributionAnalytics | null = null;
  widgets: DashboardWidget[] = [];
  maxRevenue = 0;
  selectedPeriod = 'last30';
  periodOptions: SeroDropdownOption<string>[] = [
    { value: 'last30', labelKey: 'analytics.periodSelect.last30' },
    { value: 'last90', labelKey: 'analytics.periodSelect.last90' },
    { value: 'thisYear', labelKey: 'analytics.periodSelect.thisYear' }
  ];

  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.analyticsService.getAdminDashboardWidgets().subscribe(w => { this.widgets = w; });
    this.analyticsService.getAdminAnalytics().subscribe(a => {
      this.analytics = a;
      this.maxRevenue = Math.max(...a.revenueByMonth.map(m => m.revenue));
    });
  }

  getRevenueBarHeight(revenue: number): number {
    if (!this.maxRevenue || revenue === 0) return 5;
    return Math.max(5, (revenue / this.maxRevenue) * 100);
  }

  getFillPct(pkg: PackagePerformanceMetric): number {
    return pkg.allocated > 0 ? (pkg.sold / pkg.allocated) * 100 : 0;
  }

  getFillClass(pkg: PackagePerformanceMetric): string {
    const p = this.getFillPct(pkg);
    if (p > 60) return 'fill-success';
    if (p > 30) return 'fill-warning';
    return 'fill-danger';
  }

  getInitials(name: string): string {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }
}
