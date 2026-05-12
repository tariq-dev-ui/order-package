import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { PackageCardComponent } from '../../../shared/components/package-card/package-card.component';
import { PackageService } from '../../../core/services/package.service';
import { AgentService } from '../../../core/services/agent.service';
import { DistributionService } from '../../../core/services/distribution.service';
import { Package, PackageCardView } from '../../../core/models/package.model';
import { Agent } from '../../../core/models/agent.model';
import { PackageType } from '../../../core/models/enums';

@Component({
  selector: 'app-admin-distribution',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslateModule, PackageCardComponent],
  template: `
    <div class="dist-page animate-fade-in">

      <div class="page-header">
        <div>
          <h1 class="page-title">{{ 'distribution.pageTitle' | translate }}</h1>
          <p class="page-subtitle">{{ 'distribution.pageSubtitle' | translate }}</p>
        </div>
        <button class="btn btn--primary" routerLink="/admin/packages/builder">
          <span class="material-icons-round">add_circle</span>
          {{ 'distribution.newResellBtn' | translate }}
        </button>
      </div>

      <!-- Distribution Flow Diagram -->
      <div class="card flow-diagram">
        <div class="card-body">
          <div class="flow-title">{{ 'distribution.hierarchy' | translate }}</div>
          <div class="flow-row">
            <div class="flow-node flow-node--admin">
              <div class="fn-icon"><span class="material-icons-round">admin_panel_settings</span></div>
              <div class="fn-label">{{ 'common.roles.admin' | translate }}</div>
              <div class="fn-count">1 Platform</div>
            </div>

            <div class="flow-arrow-group">
              <div class="flow-arrow-line"></div>
              <div class="flow-arrow-label">{{ 'distribution.distributes' | translate }}</div>
            </div>

            <div class="flow-nodes-col">
              @for (agent of masterAgents; track agent.id) {
                <div class="flow-node flow-node--master">
                  <div class="fn-avatar">{{ getInitials(agent.name) }}</div>
                  <div>
                    <div class="fn-label">{{ agent.companyName }}</div>
                    <div class="fn-count">{{ agent.totalSales }} sales</div>
                  </div>
                </div>
              }
            </div>

            <div class="flow-arrow-group">
              <div class="flow-arrow-line"></div>
              <div class="flow-arrow-label">{{ 'distribution.resellsTo' | translate }}</div>
            </div>

            <div class="flow-nodes-col">
              @for (agent of subagents.slice(0, 4); track agent.id) {
                <div class="flow-node flow-node--sub">
                  <div class="fn-avatar fn-avatar--sm">{{ getInitials(agent.name) }}</div>
                  <div>
                    <div class="fn-label fn-label--sm">{{ agent.name }}</div>
                    <div class="fn-count">{{ agent.companyName }}</div>
                  </div>
                </div>
              }
              @if (subagents.length > 4) {
                <div class="fn-more">+{{ subagents.length - 4 }} {{ 'common.roles.subAgent' | translate }}</div>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Private Resell Packages -->
      <div class="section-header">
        <div>
          <div class="section-title">{{ 'distribution.privateResell.title' | translate }}</div>
          <div class="section-subtitle">{{ resellPackages.length }} {{ 'distribution.privateResell.subtitle' | translate }}</div>
        </div>
        <span class="badge badge--primary badge--lg">
          <span class="material-icons-round">verified_user</span>
          {{ 'package.types.privateResell' | translate }}
        </span>
      </div>

      <div class="packages-grid">
        @for (pkg of resellCards; track pkg.id) {
          <app-package-card [pkg]="pkg" [showDistribute]="true" (view)="viewPackage(pkg)" />
        }
        @empty {
          <div class="empty-state" style="grid-column:1/-1">
            <span class="material-icons-round" style="font-size:48px;color:var(--color-border)">verified_user</span>
            <div style="font-size:1rem;font-weight:700;margin-top:var(--space-md)">{{ 'package.empty.title' | translate }}</div>
            <p style="color:var(--color-text-secondary);margin-top:8px">{{ 'package.empty.desc' | translate }}</p>
            <a routerLink="/admin/packages/builder" class="btn btn--primary" style="margin-top:var(--space-md)">
              <span class="material-icons-round">add</span> {{ 'package.empty.action' | translate }}
            </a>
          </div>
        }
      </div>

      <!-- Shared Packages -->
      <div class="section-header">
        <div>
          <div class="section-title">{{ 'distribution.shared.title' | translate }}</div>
          <div class="section-subtitle">{{ sharedPackages.length }} {{ 'distribution.shared.subtitle' | translate }}</div>
        </div>
        <span class="badge badge--neutral badge--lg">
          <span class="material-icons-round">groups</span>
          {{ 'package.types.shared' | translate }}
        </span>
      </div>

      <div class="packages-grid">
        @for (pkg of sharedCards; track pkg.id) {
          <app-package-card [pkg]="pkg" (view)="viewPackage(pkg)" />
        }
      </div>

    </div>
  `,
  styles: [`
    .dist-page { display: flex; flex-direction: column; gap: var(--space-xl); }
    .page-header { display: flex; align-items: flex-start; justify-content: space-between; }
    .page-title    { font-size: 1.5rem; font-weight: 800; color: var(--sero-text-primary); }
    .page-subtitle { font-size: 0.875rem; color: var(--sero-text-secondary); margin-top: 4px; }

    .flow-diagram { }

    .flow-title {
      font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;
      color: var(--sero-text-muted); margin-bottom: var(--space-lg);
    }

    .flow-row { display: flex; align-items: center; gap: var(--space-xl); overflow-x: auto; padding-bottom: 4px; }

    .flow-node {
      display: flex; align-items: center; gap: 10px;
      padding: 12px var(--space-md); border-radius: var(--r-lg, 12px);
      border: 1.5px solid var(--sero-border); white-space: nowrap;

      &--admin  { border-color: var(--sero-primary-100); background: var(--sero-primary-50); flex-direction: column; align-items: center; padding: var(--space-md); min-width: 120px; }
      &--master { background: var(--sero-gold-50); border-color: var(--sero-gold-100); }
      &--sub    { background: var(--sero-surface-2); border-color: var(--sero-border-light); }
    }

    .fn-icon { width: 40px; height: 40px; background: var(--sero-primary); border-radius: var(--r-md, 10px); display: flex; align-items: center; justify-content: center; .material-icons-round { color: #fff; font-size: 22px; } }
    .fn-label { font-size: 0.875rem; font-weight: 700; color: var(--sero-text-primary); }
    .fn-label--sm { font-size: 0.8125rem; font-weight: 600; color: var(--sero-text-primary); }
    .fn-count { font-size: 0.72rem; color: var(--sero-text-muted); margin-top: 2px; }
    .fn-avatar { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(135deg, var(--sero-primary), var(--sero-gold)); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: #fff; flex-shrink: 0;
      &--sm { width: 30px; height: 30px; background: linear-gradient(135deg, var(--sero-primary-light), var(--sero-gold-light)); font-size: .7rem; } }

    .flow-arrow-group {
      display: flex; flex-direction: column; align-items: center; gap: 4px;
      .flow-arrow-line { width: 40px; height: 2px; background: var(--sero-border); position: relative; &::after { content: ''; position: absolute; right: -4px; top: -4px; border-left: 8px solid var(--sero-border); border-top: 5px solid transparent; border-bottom: 5px solid transparent; } }
      .flow-arrow-label { font-size: 0.68rem; color: var(--sero-text-muted); font-weight: 600; }
    }

    .flow-nodes-col { display: flex; flex-direction: column; gap: var(--space-sm); }
    .fn-more { font-size: 0.75rem; color: var(--sero-primary); font-weight: 600; padding: 8px; }

    .packages-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: var(--space-lg); }
    .empty-state { text-align: center; padding: var(--space-2xl); background: var(--sero-card-bg); border-radius: var(--r-lg, 12px); border: 2px dashed var(--sero-border); }
  `]
})
export class AdminDistributionComponent implements OnInit {
  resellPackages: Package[] = [];
  sharedPackages: Package[] = [];
  resellCards: PackageCardView[] = [];
  sharedCards: PackageCardView[] = [];
  masterAgents: Agent[] = [];
  subagents: Agent[] = [];

  constructor(
    private pkgService: PackageService,
    private agentService: AgentService
  ) {}

  ngOnInit(): void {
    this.pkgService.getByType(PackageType.PRIVATE_RESELL).subscribe(pkgs => {
      this.resellPackages = pkgs;
      this.resellCards = pkgs.map(p => this.pkgService.toCardView(p));
    });
    this.pkgService.getByType(PackageType.SHARED).subscribe(pkgs => {
      this.sharedPackages = pkgs;
      this.sharedCards = pkgs.map(p => this.pkgService.toCardView(p));
    });
    this.agentService.getMasterAgents().subscribe(a => { this.masterAgents = a; });
    this.agentService.getSubagents().subscribe(a => { this.subagents = a; });
  }

  viewPackage(pkg: PackageCardView): void { console.log('View:', pkg); }

  getInitials(name: string): string {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }
}
