import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AgentService } from '../../../core/services/agent.service';
import { LanguageService } from '../../../core/services/language.service';
import { LayoutService } from '../../../core/services/layout.service';
import { Agent } from '../../../core/models/agent.model';
import { UserRole } from '../../../core/models/enums';

interface NavItem {
  labelKey: string;
  icon: string;
  route?: string;
  children?: NavItem[];
  badgeKey?: string;
  badgeColor?: string;
  roles: UserRole[];
  expanded?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <aside class="sero-sidebar" [class.collapsed]="layout.sidebarCollapsed()">

      <!-- ── Logo ───────────────────────────────────────────── -->
      <div class="sidebar-header">
        <div class="sero-logo">
          <div class="logo-mark">
            <span class="material-icons-round">mosque</span>
          </div>
          @if (!layout.sidebarCollapsed()) {
            <div class="logo-wordmark">
              <span class="logo-sero">SERO</span>
              <span class="logo-tagline">{{ 'sidebar.brandSub' | translate }}</span>
            </div>
          }
        </div>
        <button class="collapse-btn" (click)="layout.toggle()" [attr.aria-label]="layout.sidebarCollapsed() ? 'Expand' : 'Collapse'">
          <span class="material-icons-round">{{ getCollapseIcon() }}</span>
        </button>
      </div>

      <!-- ── Agent identity ────────────────────────────────── -->
      @if (currentAgent && !layout.sidebarCollapsed()) {
        <div class="agent-identity">
          <div class="agent-avatar-ring">
            <div class="agent-avatar">{{ getInitials(currentAgent.name) }}</div>
          </div>
          <div class="agent-meta">
            <div class="agent-name">{{ currentAgent.name }}</div>
            <div class="agent-company">{{ currentAgent.companyName }}</div>
            <span class="role-pill" [ngClass]="getRolePill(currentAgent.role)">
              <span class="material-icons-round">{{ getRoleIcon(currentAgent.role) }}</span>
              {{ getRoleKey(currentAgent.role) | translate }}
            </span>
          </div>
        </div>
      }

      @if (currentAgent && layout.sidebarCollapsed()) {
        <div class="agent-identity-mini">
          <div class="agent-avatar-sm" [attr.title]="currentAgent.name">
            {{ getInitials(currentAgent.name) }}
          </div>
        </div>
      }

      <!-- ── Navigation ────────────────────────────────────── -->
      <nav class="sidebar-nav">
        @for (section of navSections; track section.labelKey) {
          @if (!layout.sidebarCollapsed()) {
            <div class="nav-section-label">{{ section.labelKey | translate }}</div>
          } @else {
            <div class="nav-section-divider"></div>
          }

          @for (item of section.items; track item.labelKey) {
            @if (canSee(item)) {
              <div class="nav-item-wrap">
                @if (item.children) {
                  <div class="nav-item"
                       [class.has-children]="true"
                       [class.active]="item.expanded"
                       [class.icon-only]="layout.sidebarCollapsed()"
                       [attr.title]="layout.sidebarCollapsed() ? (item.labelKey | translate) : null"
                       (click)="toggleExpand(item)">
                    <div class="nav-icon-wrap">
                      <span class="nav-icon material-icons-round">{{ item.icon }}</span>
                    </div>
                    @if (!layout.sidebarCollapsed()) {
                      <span class="nav-label">{{ item.labelKey | translate }}</span>
                      <span class="nav-chevron material-icons-round">
                        {{ item.expanded ? 'expand_less' : 'expand_more' }}
                      </span>
                    }
                  </div>
                  @if (item.expanded && !layout.sidebarCollapsed()) {
                    <div class="nav-children">
                      @for (child of item.children; track child.labelKey) {
                        <a class="nav-child" [routerLink]="child.route" routerLinkActive="active">
                          <span class="material-icons-round child-dot">{{ child.icon }}</span>
                          {{ child.labelKey | translate }}
                        </a>
                      }
                    </div>
                  }
                } @else {
                  <a class="nav-item"
                     [class.icon-only]="layout.sidebarCollapsed()"
                     [routerLink]="item.route"
                     routerLinkActive="active"
                     [routerLinkActiveOptions]="{exact: item.route === '/admin' || item.route === '/master'}"
                     [attr.title]="layout.sidebarCollapsed() ? (item.labelKey | translate) : null">
                    <div class="nav-icon-wrap">
                      <span class="nav-icon material-icons-round">{{ item.icon }}</span>
                    </div>
                    @if (!layout.sidebarCollapsed()) {
                      <span class="nav-label">{{ item.labelKey | translate }}</span>
                      @if (item.badgeKey) {
                        <span class="nav-badge">{{ item.badgeKey | translate }}</span>
                      }
                    }
                  </a>
                }
              </div>
            }
          }
        }
      </nav>

      <!-- ── Footer ────────────────────────────────────────── -->
      <div class="sidebar-footer">
        <a class="nav-item"
           [class.icon-only]="layout.sidebarCollapsed()"
           routerLink="/settings"
           [attr.title]="layout.sidebarCollapsed() ? ('sidebar.nav.settings' | translate) : null">
          <div class="nav-icon-wrap">
            <span class="nav-icon material-icons-round">settings</span>
          </div>
          @if (!layout.sidebarCollapsed()) {
            <span class="nav-label">{{ 'sidebar.nav.settings' | translate }}</span>
          }
        </a>
        <a class="nav-item nav-item--danger"
           [class.icon-only]="layout.sidebarCollapsed()"
           routerLink="/logout"
           [attr.title]="layout.sidebarCollapsed() ? ('sidebar.nav.logout' | translate) : null">
          <div class="nav-icon-wrap">
            <span class="nav-icon material-icons-round">logout</span>
          </div>
          @if (!layout.sidebarCollapsed()) {
            <span class="nav-label">{{ 'sidebar.nav.logout' | translate }}</span>
          }
        </a>
      </div>
    </aside>
  `,
  styles: [`
    // ── SERO Sidebar shell ──────────────────────────────────────
    .sero-sidebar {
      width: var(--sero-sidebar-width);
      height: 100vh;
      background: var(--sero-sidebar-bg);
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 100;
      transition: width var(--t-slow);
      overflow: hidden;
      border-right: 1px solid var(--sero-sidebar-border);

      // Subtle gradient depth
      &::after {
        content: '';
        position: absolute;
        top: 0; right: 0;
        width: 1px;
        height: 100%;
        background: linear-gradient(
          180deg,
          rgba(255,255,255,.06) 0%,
          rgba(140,123,61,.15) 40%,
          rgba(255,255,255,.03) 100%
        );
        pointer-events: none;
      }
    }

    .sero-sidebar.collapsed {
      width: var(--sero-sidebar-collapsed);
    }

    // ── Header ─────────────────────────────────────────────────
    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 18px 16px;
      border-bottom: 1px solid var(--sero-sidebar-border);
      min-height: 70px;
      flex-shrink: 0;
    }

    .sero-logo {
      display: flex;
      align-items: center;
      gap: 11px;
      overflow: hidden;
    }

    .logo-mark {
      width: 38px;
      height: 38px;
      background: linear-gradient(135deg, var(--sero-primary) 0%, var(--sero-primary-light) 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(58,71,42,.4);
      border: 1px solid rgba(255,255,255,.12);

      .material-icons-round { font-size: 20px; color: #fff; }
    }

    .logo-wordmark {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .logo-sero {
      font-size: 1.1rem;
      font-weight: 800;
      color: #fff;
      letter-spacing: 0.18em;
      line-height: 1;
    }

    .logo-tagline {
      font-size: 0.62rem;
      color: rgba(255,255,255,.4);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-top: 3px;
    }

    .collapse-btn {
      background: transparent;
      border: none;
      color: rgba(255,255,255,.35);
      padding: 4px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      transition: all var(--t-fast);
      flex-shrink: 0;
      cursor: pointer;

      .material-icons-round { font-size: 18px; }
      &:hover { color: rgba(255,255,255,.8); background: rgba(255,255,255,.07); }
    }

    // ── Agent identity ─────────────────────────────────────────
    .agent-identity {
      display: flex;
      align-items: flex-start;
      gap: 11px;
      padding: 16px;
      border-bottom: 1px solid var(--sero-sidebar-border);
      flex-shrink: 0;
    }

    .agent-avatar-ring {
      padding: 2px;
      background: linear-gradient(135deg, var(--sero-gold) 0%, var(--sero-gold-light) 100%);
      border-radius: 50%;
      flex-shrink: 0;
    }

    .agent-avatar {
      width: 36px;
      height: 36px;
      background: var(--sero-sidebar-bg-2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 700;
      color: #fff;
      border: 1.5px solid var(--sero-sidebar-bg);
    }

    .agent-identity-mini {
      display: flex;
      justify-content: center;
      padding: 12px 16px;
      border-bottom: 1px solid var(--sero-sidebar-border);
      flex-shrink: 0;
    }

    .agent-avatar-sm {
      width: 38px;
      height: 38px;
      background: linear-gradient(135deg, var(--sero-primary) 0%, var(--sero-primary-light) 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 700;
      color: #fff;
      border: 2px solid rgba(140,123,61,.4);
    }

    .agent-meta {
      flex: 1;
      min-width: 0;
    }

    .agent-name {
      font-size: 0.8125rem;
      font-weight: 700;
      color: rgba(255,255,255,.92);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .agent-company {
      font-size: 0.72rem;
      color: rgba(255,255,255,.38);
      margin-top: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .role-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 20px;
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      margin-top: 6px;

      .material-icons-round { font-size: 10px; }

      &.pill--admin   { background: rgba(180,60,60,.25); color: #f5a0a0; border: 1px solid rgba(180,60,60,.3); }
      &.pill--master  { background: rgba(140,123,61,.3); color: #e0c870; border: 1px solid rgba(140,123,61,.4); }
      &.pill--agent   { background: rgba(45,107,160,.25); color: #90c0e8; border: 1px solid rgba(45,107,160,.35); }
      &.pill--viewer  { background: rgba(255,255,255,.07); color: rgba(255,255,255,.5); border: 1px solid rgba(255,255,255,.12); }
    }

    // ── Navigation ─────────────────────────────────────────────
    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 10px 8px;
      display: flex;
      flex-direction: column;
      gap: 1px;

      &::-webkit-scrollbar { width: 0; }
    }

    .nav-section-label {
      font-size: 0.6rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: rgba(255,255,255,.22);
      padding: 14px 10px 6px;
    }

    .nav-section-divider {
      height: 1px;
      background: var(--sero-sidebar-border);
      margin: 10px 10px 4px;
    }

    .nav-item-wrap { position: relative; }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      border-radius: 8px;
      color: var(--sero-sidebar-text);
      cursor: pointer;
      transition: all var(--t-fast);
      text-decoration: none;
      font-size: 0.8125rem;
      font-weight: 500;
      position: relative;
      white-space: nowrap;

      &:hover {
        background: rgba(255,255,255,.055);
        color: var(--sero-sidebar-text-hover);

        .nav-icon-wrap .nav-icon { color: rgba(255,255,255,.7); }
      }

      &.active {
        background: rgba(58,71,42,.55);
        color: var(--sero-sidebar-text-active);
        font-weight: 600;

        &::before {
          content: '';
          position: absolute;
          left: 0; top: 6px; bottom: 6px;
          width: 3px;
          background: var(--sero-gold);
          border-radius: 0 2px 2px 0;
        }

        .nav-icon-wrap .nav-icon { color: var(--sero-gold-light); }
      }

      &--danger {
        color: rgba(240,120,120,.65);
        &:hover { background: rgba(180,60,60,.15); color: #f5a0a0; }
      }

      // Collapsed icon-only mode
      &.icon-only {
        justify-content: center;
        padding: 10px 0;

        .nav-icon-wrap {
          width: 36px;
          height: 36px;
          border-radius: 9px;
          background: rgba(255,255,255,.04);
          transition: background var(--t-fast);
        }

        &:hover .nav-icon-wrap { background: rgba(255,255,255,.1); }
        &.active .nav-icon-wrap { background: rgba(58,71,42,.7); }

        // Gold dot for active in collapsed
        &.active::after {
          content: '';
          position: absolute;
          bottom: 6px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          background: var(--sero-gold);
          border-radius: 50%;
        }
      }
    }

    .nav-icon-wrap {
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      border-radius: 7px;
      transition: background var(--t-fast);
    }

    .nav-icon {
      font-size: 18px;
      color: var(--sero-sidebar-text);
      transition: color var(--t-fast);
    }

    .nav-label { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; }

    .nav-chevron { font-size: 15px; color: rgba(255,255,255,.25); }

    .nav-badge {
      font-size: 0.6rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      padding: 2px 7px;
      border-radius: 10px;
      background: rgba(140,123,61,.3);
      color: #e0c870;
      border: 1px solid rgba(140,123,61,.4);
    }

    // ── Children ───────────────────────────────────────────────
    .nav-children {
      padding-left: 40px;
      display: flex;
      flex-direction: column;
      gap: 1px;
      margin-top: 2px;
      padding-bottom: 4px;
    }

    .nav-child {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      border-radius: 7px;
      font-size: 0.78rem;
      font-weight: 500;
      color: rgba(255,255,255,.45);
      cursor: pointer;
      transition: all var(--t-fast);
      text-decoration: none;
      white-space: nowrap;

      .child-dot { font-size: 14px; }

      &:hover { background: rgba(255,255,255,.05); color: rgba(255,255,255,.8); }
      &.active { color: var(--sero-gold-light); font-weight: 600; }
    }

    // ── Footer ─────────────────────────────────────────────────
    .sidebar-footer {
      padding: 8px;
      border-top: 1px solid var(--sero-sidebar-border);
      display: flex;
      flex-direction: column;
      gap: 1px;
      flex-shrink: 0;
      background: rgba(0,0,0,.15);
    }

    // ── RTL overrides ──────────────────────────────────────────
    :host-context([dir="rtl"]) .sero-sidebar {
      left: auto;
      right: 0;
      border-right: none;
      border-left: 1px solid var(--sero-sidebar-border);
    }

    :host-context([dir="rtl"]) .sero-sidebar::after {
      right: auto;
      left: 0;
    }

    :host-context([dir="rtl"]) .sidebar-header {
      flex-direction: row-reverse;
    }

    :host-context([dir="rtl"]) .sero-logo {
      flex-direction: row-reverse;
    }

    :host-context([dir="rtl"]) .agent-identity {
      flex-direction: row-reverse;
      text-align: right;
    }

    :host-context([dir="rtl"]) .agent-meta {
      text-align: right;
    }

    :host-context([dir="rtl"]) .nav-item {
      flex-direction: row-reverse;
      text-align: right;
    }

    :host-context([dir="rtl"]) .nav-item.active::before {
      left: auto;
      right: 0;
      border-radius: 2px 0 0 2px;
    }

    :host-context([dir="rtl"]) .nav-badge {
      margin-right: 0;
      margin-left: auto;
    }

    :host-context([dir="rtl"]) .nav-chevron {
      transform: scaleX(-1);
    }

    :host-context([dir="rtl"]) .nav-children {
      padding-left: 0;
      padding-right: 40px;
    }

    :host-context([dir="rtl"]) .nav-child {
      flex-direction: row-reverse;
      text-align: right;
    }

    :host-context([dir="rtl"]) .nav-section-label {
      text-align: right;
    }

    :host-context([dir="rtl"]) .role-pill {
      flex-direction: row-reverse;
    }
  `]
})
export class SidebarComponent implements OnInit {
  currentAgent: Agent | null = null;

  navSections = [
    {
      labelKey: 'sidebar.sections.overview',
      items: [
        { labelKey: 'sidebar.nav.dashboard', icon: 'space_dashboard', route: '/admin', roles: [UserRole.ADMIN] },
        { labelKey: 'sidebar.nav.dashboard', icon: 'space_dashboard', route: '/master', roles: [UserRole.MASTER_AGENT] },
        { labelKey: 'sidebar.nav.myPackages', icon: 'inventory_2', route: '/agent', roles: [UserRole.SUB_AGENT] }
      ] as NavItem[]
    },
    {
      labelKey: 'sidebar.sections.packages',
      items: [
        { labelKey: 'sidebar.nav.allPackages', icon: 'view_list', route: '/admin/packages', roles: [UserRole.ADMIN] },
        { labelKey: 'sidebar.nav.createPackage', icon: 'add_circle_outline', route: '/admin/packages/builder', roles: [UserRole.ADMIN], badgeKey: 'sidebar.badges.new', badgeColor: 'gold' },
        { labelKey: 'sidebar.nav.myPackages', icon: 'inventory_2', route: '/master/packages', roles: [UserRole.MASTER_AGENT] },
        { labelKey: 'sidebar.nav.cloneResell', icon: 'content_copy', route: '/master/packages/clone', roles: [UserRole.MASTER_AGENT] }
      ] as NavItem[]
    },
    {
      labelKey: 'sidebar.sections.distribution',
      items: [
        { labelKey: 'sidebar.nav.distributionNetwork', icon: 'account_tree', route: '/admin/distribution', roles: [UserRole.ADMIN] },
        { labelKey: 'sidebar.nav.distributedPackages', icon: 'share', route: '/master/distributed', roles: [UserRole.MASTER_AGENT] },
        { labelKey: 'sidebar.nav.subagents', icon: 'supervisor_account', route: '/master/subagents', roles: [UserRole.MASTER_AGENT] },
        { labelKey: 'sidebar.nav.marketplace', icon: 'storefront', route: '/agent/marketplace', roles: [UserRole.SUB_AGENT] },
        { labelKey: 'Agent Orders', icon: 'assignment', route: '/agent/orders', roles: [UserRole.SUB_AGENT] }
      ] as NavItem[]
    },
    {
      labelKey: 'sidebar.sections.analytics',
      items: [
        { labelKey: 'sidebar.nav.analytics', icon: 'bar_chart', route: '/admin/analytics', roles: [UserRole.ADMIN] },
        { labelKey: 'sidebar.nav.performance', icon: 'trending_up', route: '/master/analytics', roles: [UserRole.MASTER_AGENT] }
      ] as NavItem[]
    }
  ];

  constructor(
    private agentService: AgentService,
    private router: Router,
    public langService: LanguageService,
    public layout: LayoutService
  ) {}

  ngOnInit(): void {
    this.agentService.getCurrentAgent().subscribe(agent => {
      this.currentAgent = agent;
    });
  }

  getCollapseIcon(): string {
    const rtl = this.langService.isRtl();
    if (this.layout.sidebarCollapsed()) return rtl ? 'chevron_left' : 'chevron_right';
    return rtl ? 'chevron_right' : 'chevron_left';
  }
  toggleExpand(item: NavItem): void { item.expanded = !item.expanded; }

  canSee(item: NavItem): boolean {
    if (!this.currentAgent) return false;
    return item.roles.includes(this.currentAgent.role);
  }

  getInitials(name: string): string {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }

  getRolePill(role: UserRole): string {
    const map: Record<UserRole, string> = {
      [UserRole.ADMIN]: 'pill--admin',
      [UserRole.MASTER_AGENT]: 'pill--master',
      [UserRole.SUB_AGENT]: 'pill--agent',
      [UserRole.VIEWER]: 'pill--viewer'
    };
    return map[role];
  }

  getRoleIcon(role: UserRole): string {
    const map: Record<UserRole, string> = {
      [UserRole.ADMIN]: 'admin_panel_settings',
      [UserRole.MASTER_AGENT]: 'manage_accounts',
      [UserRole.SUB_AGENT]: 'person',
      [UserRole.VIEWER]: 'visibility'
    };
    return map[role];
  }

  getRoleKey(role: UserRole): string {
    const map: Record<UserRole, string> = {
      [UserRole.ADMIN]: 'common.roles.admin',
      [UserRole.MASTER_AGENT]: 'common.roles.masterAgent',
      [UserRole.SUB_AGENT]: 'common.roles.subAgent',
      [UserRole.VIEWER]: 'common.roles.viewer'
    };
    return map[role];
  }
}
