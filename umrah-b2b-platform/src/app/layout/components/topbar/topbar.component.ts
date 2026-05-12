import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AgentService } from '../../../core/services/agent.service';
import { Agent } from '../../../core/models/agent.model';
import { LanguageSwitcherComponent } from '../../../shared/components/language-switcher/language-switcher.component';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, LanguageSwitcherComponent],
  template: `
    <header class="sero-topbar">
      <div class="topbar-left">
        <!-- Page identity -->
        <div class="page-identity">
          <h1 class="topbar-title">{{ pageTitle }}</h1>
          @if (breadcrumbs.length) {
            <nav class="breadcrumb-trail">
              @for (crumb of breadcrumbs; track crumb.label; let last = $last) {
                @if (!last) {
                  <a [routerLink]="crumb.route" class="crumb-link">{{ crumb.label }}</a>
                  <span class="material-icons-round crumb-sep">chevron_right</span>
                } @else {
                  <span class="crumb-current">{{ crumb.label }}</span>
                }
              }
            </nav>
          }
        </div>
      </div>

      <div class="topbar-right">
        <!-- Language switcher -->
        <app-language-switcher />

        <!-- Role switcher (demo) -->
        <div class="role-switcher">
          <span class="material-icons-round rs-icon">swap_horiz</span>
          <select class="rs-select" (change)="switchRole($event)">
            <option value="admin-001">{{ 'topbar.roleView.admin' | translate }}</option>
            <option value="master-001" selected>{{ 'topbar.roleView.masterAgent' | translate }}</option>
            <option value="agent-001">{{ 'topbar.roleView.subAgent' | translate }}</option>
          </select>
        </div>

        <!-- Divider -->
        <div class="topbar-divider"></div>

        <!-- Notifications -->
        <button class="topbar-icon-btn" [attr.aria-label]="'topbar.notifications' | translate">
          <span class="material-icons-round">notifications_none</span>
          <span class="notif-dot"></span>
        </button>

        <!-- Help -->
        <button class="topbar-icon-btn" [attr.aria-label]="'topbar.help' | translate">
          <span class="material-icons-round">help_outline</span>
        </button>

        <!-- User chip -->
        @if (currentAgent) {
          <div class="user-chip">
            <div class="uc-avatar">{{ getInitials(currentAgent.name) }}</div>
            <div class="uc-info">
              <div class="uc-name">{{ currentAgent.name }}</div>
              <div class="uc-company">{{ currentAgent.companyName }}</div>
            </div>
            <span class="material-icons-round uc-caret">expand_more</span>
          </div>
        }
      </div>
    </header>
  `,
  styles: [`
    .sero-topbar {
      height: var(--sero-topbar-height);
      background: var(--sero-topbar-bg);
      border-bottom: 1px solid var(--sero-topbar-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 28px;
      position: sticky;
      top: 0;
      z-index: 90;
      box-shadow: 0 1px 0 var(--sero-border), var(--shadow-xs);
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .topbar-title {
      font-size: 1.0625rem;
      font-weight: 800;
      color: var(--sero-text-primary);
      letter-spacing: -0.02em;
      line-height: 1;
    }

    .breadcrumb-trail {
      display: flex;
      align-items: center;
      gap: 2px;
      margin-top: 4px;
    }

    .crumb-link {
      font-size: 0.72rem;
      color: var(--sero-text-muted);
      text-decoration: none;
      transition: color var(--t-fast);
      &:hover { color: var(--sero-primary); }
    }

    .crumb-current {
      font-size: 0.72rem;
      color: var(--sero-text-tertiary);
      font-weight: 500;
    }

    .crumb-sep {
      font-size: 12px;
      color: var(--sero-border-strong);
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .topbar-divider {
      width: 1px;
      height: 24px;
      background: var(--sero-border);
      margin: 0 4px;
    }

    // ── Role Switcher ───────────────────────────────────────────
    .role-switcher {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      border: 1px solid var(--sero-border);
      border-radius: 8px;
      background: var(--sero-surface-2);
      transition: all var(--t-fast);

      &:hover { border-color: var(--sero-border-strong); background: var(--sero-surface-3); }
    }

    .rs-icon {
      font-size: 16px;
      color: var(--sero-text-muted);
    }

    .rs-select {
      border: none;
      background: transparent;
      font-family: var(--sero-font);
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--sero-text-primary);
      cursor: pointer;
      outline: none;
      min-width: 140px;
    }

    // ── Icon buttons ────────────────────────────────────────────
    .topbar-icon-btn {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: 1px solid var(--sero-border);
      background: var(--sero-card-bg);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      transition: all var(--t-fast);
      color: var(--sero-text-secondary);

      .material-icons-round { font-size: 18px; }
      &:hover {
        background: var(--sero-surface-2);
        border-color: var(--sero-border-strong);
        color: var(--sero-text-primary);
      }
    }

    .notif-dot {
      position: absolute;
      width: 7px;
      height: 7px;
      background: var(--sero-danger);
      border-radius: 50%;
      top: 7px;
      right: 7px;
      border: 1.5px solid var(--sero-card-bg);
    }

    // ── User Chip ───────────────────────────────────────────────
    .user-chip {
      display: flex;
      align-items: center;
      gap: 9px;
      padding: 6px 10px 6px 6px;
      border: 1px solid var(--sero-border);
      border-radius: 10px;
      cursor: pointer;
      transition: all var(--t-fast);
      background: var(--sero-card-bg);

      &:hover {
        background: var(--sero-surface-2);
        border-color: var(--sero-border-strong);
        box-shadow: var(--shadow-sm);
      }
    }

    .uc-avatar {
      width: 30px;
      height: 30px;
      background: linear-gradient(135deg, var(--sero-primary) 0%, var(--sero-primary-light) 100%);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.72rem;
      font-weight: 800;
      color: #fff;
      flex-shrink: 0;
      letter-spacing: 0.02em;
    }

    .uc-info {
      .uc-name    { font-size: 0.8rem; font-weight: 700; color: var(--sero-text-primary); line-height: 1.2; }
      .uc-company { font-size: 0.68rem; color: var(--sero-text-muted); }
    }

    .uc-caret { font-size: 16px; color: var(--sero-text-muted); }
  `]
})
export class TopbarComponent implements OnInit {
  @Input() pageTitle = 'Dashboard';
  @Input() breadcrumbs: { label: string; route?: string }[] = [];

  currentAgent: Agent | null = null;

  constructor(private agentService: AgentService) {}

  ngOnInit(): void {
    this.agentService.getCurrentAgent().subscribe(a => (this.currentAgent = a));
  }

  switchRole(event: Event): void {
    const agentId = (event.target as HTMLSelectElement).value;
    this.agentService.setCurrentAgent(agentId);
  }

  getInitials(name: string): string {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }
}
