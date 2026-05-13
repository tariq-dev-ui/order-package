import { Component, ElementRef, HostListener, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AgentService } from '../../../core/services/agent.service';
import { Agent } from '../../../core/models/agent.model';
import { LanguageSwitcherComponent } from '../../../shared/components/language-switcher/language-switcher.component';
import { ViewMode, ViewModeService } from '../../../core/services/view-mode.service';

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
        <div class="role-switcher sero-dropdown" [attr.data-mode]="selectedMode">
          <button type="button" class="rs-trigger" (click)="toggleRoleMenu($event)" [attr.aria-expanded]="isRoleMenuOpen">
            <span class="material-icons-round sero-dropdown-icon">swap_horiz</span>
            <span class="rs-value">{{ getSelectedModeLabel() | translate }}</span>
            <span class="material-icons-round rs-chevron" [class.open]="isRoleMenuOpen">expand_more</span>
          </button>

          @if (isRoleMenuOpen) {
            <div class="rs-menu">
              <button type="button" class="rs-option" [class.active]="selectedMode === 'admin'" (click)="selectRole('admin', $event)">
                {{ 'topbar.roleView.admin' | translate }}
              </button>
              <button type="button" class="rs-option" [class.active]="selectedMode === 'master'" (click)="selectRole('master', $event)">
                {{ 'topbar.roleView.masterAgent' | translate }}
              </button>
              <button type="button" class="rs-option" [class.active]="selectedMode === 'subAgent'" (click)="selectRole('subAgent', $event)">
                {{ 'topbar.roleView.subAgent' | translate }}
              </button>
            </div>
          }
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
      position: relative;
      width: 183px;
      min-height: 31px;
    }

    .role-switcher[data-mode='admin'] {
      border-color: #b95c5c;
      background: #fff4f4;
    }

    .role-switcher[data-mode='master'] {
      border-color: #8c7b3d;
      background: #fbf8ee;
    }

    .role-switcher[data-mode='subAgent'] {
      border-color: #4f769b;
      background: #f2f7fd;
    }

    .rs-trigger {
      width: 100%;
      min-height: 31px;
      border: none;
      background: transparent;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0;
      font-family: var(--sero-font);
      cursor: pointer;
      color: var(--sero-text-primary);
    }

    .rs-value {
      flex: 1;
      min-width: 0;
      text-align: start;
      font-size: 0.8rem;
      font-weight: 600;
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .rs-chevron {
      font-size: 18px;
      color: var(--sero-text-muted);
      transition: transform var(--t-fast);
      &.open { transform: rotate(180deg); }
    }

    .rs-menu {
      position: absolute;
      top: calc(100% + 6px);
      inset-inline-start: 0;
      width: 100%;
      background: var(--sero-card-bg);
      border: 1px solid var(--sero-border);
      border-radius: 10px;
      box-shadow: var(--shadow-lg);
      padding: 6px;
      display: flex;
      flex-direction: column;
      gap: 4px;
      z-index: 200;
      animation: fadeIn .14s ease;
    }

    .rs-option {
      border: 1px solid transparent;
      background: transparent;
      border-radius: 8px;
      min-height: 34px;
      text-align: start;
      padding: 6px 10px;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--sero-text-primary);
      cursor: pointer;
      transition: all var(--t-fast);

      &:hover {
        background: var(--sero-surface-2);
        border-color: var(--sero-border-light);
      }

      &.active {
        background: var(--sero-primary-50);
        color: var(--sero-primary-dark);
        border-color: var(--sero-primary-100);
      }
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
  selectedMode: ViewMode = 'master';
  isRoleMenuOpen = false;

  constructor(
    private readonly agentService: AgentService,
    private readonly viewModeService: ViewModeService,
    private readonly hostElement: ElementRef<HTMLElement>
  ) {}

  ngOnInit(): void {
    this.agentService.getCurrentAgent().subscribe(a => (this.currentAgent = a));
    this.selectedMode = this.viewModeService.getCurrentMode();
    this.viewModeService.selectedView$.subscribe((mode) => {
      this.selectedMode = mode;
    });
  }

  toggleRoleMenu(event: Event): void {
    event.stopPropagation();
    this.isRoleMenuOpen = !this.isRoleMenuOpen;
  }

  selectRole(mode: ViewMode, event: Event): void {
    event.stopPropagation();
    this.viewModeService.setMode(mode);
    this.isRoleMenuOpen = false;
  }

  getSelectedModeLabel(): string {
    const labels: Record<ViewMode, string> = {
      admin: 'topbar.roleView.admin',
      master: 'topbar.roleView.masterAgent',
      subAgent: 'topbar.roleView.subAgent'
    };
    return labels[this.selectedMode];
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.hostElement.nativeElement.contains(event.target as Node)) {
      this.isRoleMenuOpen = false;
    }
  }

  getInitials(name: string): string {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }
}
