import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
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
        <button class="collapse-btn" (click)="toggleSidebar($event)" [attr.aria-label]="layout.sidebarCollapsed() ? 'Expand' : 'Collapse'">
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
                     [attr.title]="layout.sidebarCollapsed() ? (item.labelKey | translate) : null"
                     (click)="onNavItemClick(item, $event)">
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

    /* ════ SIDEBAR CONTAINER ════════════════════════════════════════ */
    .sero-sidebar {
      width: var(--sero-sidebar-width);
      height: 100vh;
      background: var(--sero-surface-2);
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 100;
      transition: width 400ms cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
      border-right: 1px solid var(--sero-border);

      &.collapsed {
        width: var(--sero-sidebar-collapsed);

        .sidebar-header {
          justify-content: center;
          padding: 0.625rem 0.5rem;
        }
      }
    }

    /* ════ HEADER ════════════════════════════════════════════════════ */
    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.625rem 0.75rem;
      border-bottom: 1px solid var(--sero-border);
      background: var(--sero-card-bg);
      min-height: 56px;
      flex-shrink: 0;
      gap: 0.5rem;
      transition: padding 200ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .sero-logo {
      display: flex;
      align-items: center;
      gap: 9px;
      overflow: hidden;
      flex: 1;
      min-width: 0;
    }

    .logo-mark {
      width: 34px;
      height: 34px;
      background: linear-gradient(135deg, var(--sero-primary) 0%, var(--sero-primary-dark) 100%);
      border-radius: 9px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(58, 71, 42, 0.20);

      .material-icons-round { font-size: 20px; color: #fff; }
    }

    .logo-wordmark {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .logo-sero {
      font-size: 1rem;
      font-weight: 800;
      color: var(--sero-text-primary);
      letter-spacing: 0.1em;
      line-height: 1;
    }

    .logo-tagline {
      font-size: 0.62rem;
      color: var(--sero-text-muted);
      letter-spacing: 0.06em;
      text-transform: uppercase;
      margin-top: 3px;
    }

    /* Toggle button — matches RMS exactly */
    .collapse-btn {
      flex-shrink: 0;
      width: 32px;
      height: 32px;
      border-radius: 8px;
      border: 1px solid var(--sero-border);
      background: var(--sero-card-bg);
      color: var(--sero-text-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 0;
      transition: background 150ms ease, color 150ms ease, border-color 150ms ease, box-shadow 150ms ease;

      .material-icons-round { font-size: 18px; }

      &:hover {
        background: color-mix(in srgb, var(--sero-primary) 8%, var(--sero-card-bg));
        border-color: color-mix(in srgb, var(--sero-primary) 35%, transparent);
        color: var(--sero-primary);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.10);
      }
    }

    /* ════ AGENT IDENTITY ════════════════════════════════════════════ */
    .agent-identity {
      display: flex;
      align-items: flex-start;
      gap: 10px;
      padding: 12px;
      border-bottom: 1px solid var(--sero-border-light);
      flex-shrink: 0;
      background: var(--sero-card-bg);
    }

    .agent-avatar-ring {
      padding: 2px;
      background: linear-gradient(135deg, var(--sero-gold) 0%, var(--sero-primary-light) 100%);
      border-radius: 50%;
      flex-shrink: 0;
    }

    .agent-avatar {
      width: 34px;
      height: 34px;
      background: var(--sero-primary-dark);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 700;
      color: #fff;
      border: 1.5px solid #fff;
    }

    .agent-identity-mini {
      display: flex;
      justify-content: center;
      padding: 10px 12px;
      border-bottom: 1px solid var(--sero-border-light);
      flex-shrink: 0;
    }

    .agent-avatar-sm {
      width: 34px;
      height: 34px;
      background: linear-gradient(135deg, var(--sero-primary) 0%, var(--sero-primary-dark) 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 700;
      color: #fff;
      border: 2px solid rgba(58, 71, 42, 0.12);
    }

    .agent-meta { flex: 1; min-width: 0; }

    .agent-name {
      font-size: 0.8125rem;
      font-weight: 700;
      color: var(--sero-text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .agent-company {
      font-size: 0.72rem;
      color: var(--sero-text-muted);
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

      &.pill--admin   { background: #fdeced; color: #b74848; border: 1px solid #f6cbcd; }
      &.pill--master  { background: #f8f3e4; color: #8a6f21; border: 1px solid #eadba9; }
      &.pill--agent   { background: #edf4fb; color: #39698f; border: 1px solid #cde0f1; }
      &.pill--viewer  { background: #f3f4f6; color: #717985; border: 1px solid #e2e4e8; }
    }

    /* ════ NAV SCROLL AREA ══════════════════════════════════════════ */
    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 0.5rem 0;
      -webkit-overflow-scrolling: touch;
      scrollbar-width: thin;
      scrollbar-color: color-mix(in srgb, var(--sero-primary) 30%, transparent) transparent;

      &::-webkit-scrollbar { width: 6px; }
      &::-webkit-scrollbar-track { background: transparent; }
      &::-webkit-scrollbar-thumb {
        background: color-mix(in srgb, var(--sero-primary) 30%, transparent);
        border-radius: 3px;
        &:hover { background: color-mix(in srgb, var(--sero-primary) 50%, transparent); }
      }
    }

    /* Section captions — RMS style */
    .nav-section-label {
      padding: 0.875rem 1rem 0.25rem;
      font-size: 0.6875rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--sero-text-muted);
      white-space: nowrap;
      overflow: hidden;
      transition: padding 320ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .nav-section-divider {
      height: 1px;
      background: var(--sero-border-light);
      margin: 0.875rem 0.5rem 0.25rem;
    }

    .nav-item-wrap { position: relative; }

    /* ════ NAV ITEM — exact RMS design ═════════════════════════════ */
    .nav-item {
      position: relative;
      display: flex;
      align-items: center;
      margin: 2px 8px;
      padding: 9px 12px;
      border-radius: 8px;
      cursor: pointer;
      outline: none;
      user-select: none;
      color: var(--sero-text-secondary);
      background: transparent;
      transition: background 160ms ease, color 160ms ease;
      text-decoration: none;
      gap: 10px;
      white-space: nowrap;
      border: none;
      overflow: hidden;

      .nav-icon-wrap {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .nav-icon {
        font-size: 18px;
        color: var(--sero-text-secondary);
        transition: color 160ms ease, transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .nav-label {
        flex: 1;
        font-size: 0.8125rem;
        font-weight: 400;
        line-height: 1.4;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .nav-chevron {
        flex-shrink: 0;
        font-size: 14px;
        color: var(--sero-text-muted);
        transition: transform 220ms cubic-bezier(0.4, 0, 0.2, 1), color 160ms ease;
      }

      .nav-badge {
        flex-shrink: 0;
        padding: 0.15rem 0.45rem;
        border-radius: 999px;
        font-size: 0.6875rem;
        font-weight: 600;
        background: rgba(140, 123, 61, 0.15);
        color: var(--sero-gold);
        border: 1px solid rgba(140, 123, 61, 0.30);
      }

      &:hover:not(.disabled) {
        background: var(--sero-bg-hover);
        color: var(--sero-text-primary);
        .nav-icon { color: var(--sero-primary); transform: scale(1.08); }
        .nav-chevron { color: var(--sero-text-secondary); }
      }

      /* Leaf items: selected bg + right-side active bar */
      &.active:not(.has-children) {
        background: var(--sero-bg-selected);
        color: var(--sero-text-primary);
        .nav-label { font-weight: 500; }
        .nav-icon { color: var(--sero-primary); }

        &::after {
          content: '';
          position: absolute;
          inset-inline-end: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 55%;
          background: var(--sero-primary);
          border-radius: 2px 0 0 2px;
        }
      }

      /* Expandable parent when open */
      &.has-children.active {
        background: var(--sero-bg-hover);
        color: var(--sero-text-primary);
        .nav-icon { color: var(--sero-primary); }
        .nav-chevron { color: var(--sero-primary); }
      }

      &--danger {
        color: #ad4a4a;
        &:hover { background: #fdeced; color: #8f3838; }
      }

      /* Mini / icon-only mode */
      &.icon-only {
        margin: 2px 6px;
        padding: 10px;
        justify-content: center;
        gap: 0;

        .nav-icon { font-size: 20px; }

        &:hover:not(.disabled) {
          background: color-mix(in srgb, var(--sero-primary) 10%, transparent);
          .nav-icon { color: var(--sero-primary); transform: scale(1.12); }
        }

        &.active {
          background: color-mix(in srgb, var(--sero-primary) 14%, transparent);
          &::after { display: none; }
        }
      }
    }

    /* ════ SUBMENU ══════════════════════════════════════════════════ */
    .nav-children {
      border-inline-start: 1px solid var(--sero-border);
      margin-inline-start: 20px;
      padding: 2px 0;
    }

    .nav-child {
      position: relative;
      display: flex;
      align-items: center;
      margin: 2px 8px 2px 0;
      padding: 6px 10px;
      border-radius: 8px;
      font-size: 0.75rem;
      font-weight: 400;
      color: var(--sero-text-secondary);
      cursor: pointer;
      transition: background 160ms ease, color 160ms ease;
      text-decoration: none;
      white-space: nowrap;
      gap: 8px;

      .child-dot {
        font-size: 15px;
        color: var(--sero-text-muted);
        flex-shrink: 0;
        transition: color 160ms ease;
      }

      &::before {
        content: '';
        position: absolute;
        inset-inline-start: 0;
        top: 0;
        bottom: 0;
        width: 1px;
        background: var(--sero-border-light);
      }

      &:hover { background: var(--sero-bg-hover); color: var(--sero-text-primary); }

      &.active {
        color: var(--sero-primary-dark);
        font-weight: 600;
        .child-dot { color: var(--sero-primary); }
        &::before { background: var(--sero-primary); }
      }
    }

    /* ════ FOOTER ════════════════════════════════════════════════════ */
    .sidebar-footer {
      padding: 0.5rem;
      border-top: 1px solid var(--sero-border-light);
      display: flex;
      flex-direction: column;
      gap: 2px;
      flex-shrink: 0;
      background: var(--sero-card-bg);
    }

    /* ════ RESPONSIVE ════════════════════════════════════════════════ */
    @media (max-width: 1023px) {
      .sero-sidebar {
        box-shadow: rgba(58, 71, 42, 0.12) 0px 4px 8px, rgba(58, 71, 42, 0.08) 0px 16px 32px -8px;
      }

      .nav-item {
        margin: 4px 8px;
        border-radius: 10px;
        padding: 10px 14px;
        .nav-icon { font-size: 20px; }
        .nav-label { font-size: 0.875rem; }
      }

      .nav-child {
        padding: 8px 12px;
        .child-dot { font-size: 16px; }
      }
    }

    /* ════ RTL ═══════════════════════════════════════════════════════ */
    :host-context([dir="rtl"]) .sero-sidebar {
      left: auto;
      right: 0;
      border-right: none;
      border-left: 1px solid var(--sero-border);
      box-shadow: -4px 0 24px rgba(0, 0, 0, 0.06);
    }

    :host-context([dir="rtl"]) .sidebar-header { flex-direction: row-reverse; }
    :host-context([dir="rtl"]) .sero-logo { flex-direction: row-reverse; }
    :host-context([dir="rtl"]) .agent-identity { flex-direction: row-reverse; }
    :host-context([dir="rtl"]) .agent-meta { text-align: right; }
    :host-context([dir="rtl"]) .role-pill { flex-direction: row-reverse; }
    :host-context([dir="rtl"]) .nav-section-label { text-align: right; }

    :host-context([dir="rtl"]) .nav-item {
      flex-direction: row-reverse;
      &.icon-only { flex-direction: row; }
      &.active:not(.has-children)::after { border-radius: 0 2px 2px 0; }
    }

    :host-context([dir="rtl"]) .nav-children {
      margin-inline-start: 0;
      margin-inline-end: 20px;
    }

    :host-context([dir="rtl"]) .nav-child {
      flex-direction: row-reverse;
      margin: 2px 0 2px 8px;
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
        { labelKey: 'sidebar.nav.myPackages', icon: 'inventory_2', route: '/master/packages', roles: [UserRole.MASTER_AGENT] }
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
  toggleSidebar(event?: Event): void {
    event?.stopPropagation();
    this.layout.toggle();
  }

  toggleExpand(item: NavItem): void {
    // Fix: one click should reveal menu data even in collapsed mode.
    if (this.layout.sidebarCollapsed()) {
      this.layout.sidebarCollapsed.set(false);
      item.expanded = true;
      return;
    }

    item.expanded = !item.expanded;
  }

  onNavItemClick(item: NavItem, event: Event): void {
    if (!this.layout.sidebarCollapsed()) {
      return;
    }

    // Keep first click effective even in collapsed mode.
    event.preventDefault();
    event.stopPropagation();
    this.layout.sidebarCollapsed.set(false);

    if (item.route) {
      this.router.navigateByUrl(item.route);
    }
  }

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
