import { Component, ElementRef, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { filter, Subject, takeUntil } from 'rxjs';
import { AgentService } from '../../../core/services/agent.service';
import { Agent } from '../../../core/models/agent.model';
import { LanguageSwitcherComponent } from '../../../shared/components/language-switcher/language-switcher.component';
import { ViewMode, ViewModeService } from '../../../core/services/view-mode.service';
import { LayoutService } from '../../../core/services/layout.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, LanguageSwitcherComponent],
  template: `
    <header class="sero-topbar">

      <!-- ══ Col 1 — Hamburger (inline-start → right in RTL) ══ -->
      <div class="topbar-nav">
        <button class="hamburger-btn"
                type="button"
                (click)="layout.toggle()"
                [attr.aria-label]="'topbar.toggleSidebar' | translate">
          <span class="material-icons-round">
            {{ layout.sidebarCollapsed() ? 'menu_open' : 'menu' }}
          </span>
        </button>
      </div>

      <!-- ══ Col 2 — Page title (center) ══ -->
      <div class="topbar-center">
        <h1 class="topbar-title">{{ currentTitleKey | translate }}</h1>
      </div>

      <!-- ══ Col 3 — Actions (inline-end → left in RTL) ══ -->
      <div class="topbar-actions">

        <!-- Role switcher -->
        <div class="role-switcher" [attr.data-mode]="selectedMode">
          <button type="button" class="rs-trigger"
                  (click)="toggleRoleMenu($event)"
                  [attr.aria-expanded]="isRoleMenuOpen">
            <span class="material-icons-round rs-icon">swap_horiz</span>
            <span class="rs-value">{{ getSelectedModeLabel() | translate }}</span>
            <span class="material-icons-round rs-chevron" [class.open]="isRoleMenuOpen">expand_more</span>
          </button>

          @if (isRoleMenuOpen) {
            <div class="rs-menu">
              <button type="button" class="rs-option"
                      [class.active]="selectedMode === 'admin'"
                      (click)="selectRole('admin', $event)">
                {{ 'topbar.roleView.admin' | translate }}
              </button>
              <button type="button" class="rs-option"
                      [class.active]="selectedMode === 'master'"
                      (click)="selectRole('master', $event)">
                {{ 'topbar.roleView.masterAgent' | translate }}
              </button>
              <button type="button" class="rs-option"
                      [class.active]="selectedMode === 'subAgent'"
                      (click)="selectRole('subAgent', $event)">
                {{ 'topbar.roleView.subAgent' | translate }}
              </button>
            </div>
          }
        </div>

        <div class="topbar-divider"></div>

        <!-- Notifications -->
        <button class="topbar-icon-btn" type="button"
                [attr.aria-label]="'topbar.notifications' | translate">
          <span class="material-icons-round">notifications_none</span>
          <span class="notif-dot"></span>
        </button>

        <!-- User avatar -->
        @if (currentAgent) {
          <button class="user-avatar-btn" type="button"
                  [attr.aria-label]="'topbar.profile' | translate"
                  [attr.title]="currentAgent.name">
            <div class="uc-avatar">{{ getInitials(currentAgent.name) }}</div>
          </button>
        } @else {
          <button class="topbar-icon-btn" type="button"
                  [attr.aria-label]="'topbar.profile' | translate">
            <span class="material-icons-round">account_circle</span>
          </button>
        }

        <!-- Language switcher -->
        <app-language-switcher />

        <!-- Dark mode — TODO: implement theme toggle -->
        <button class="topbar-icon-btn" type="button"
                [attr.aria-label]="'topbar.darkMode' | translate">
          <span class="material-icons-round">dark_mode</span>
        </button>

      </div>
    </header>
  `,
  styles: [`
    :host {
      display: block;
      height: var(--sero-topbar-height);
      flex-shrink: 0;
    }

    /* ════ TOPBAR ════════════════════════════════════════════════ */
    .sero-topbar {
      height: var(--sero-topbar-height);
      background: var(--sero-card-bg);
      border-bottom: 1px solid var(--sero-border);
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 16px;
      padding: 0 20px;
      position: fixed;
      top: 0;
      left: var(--layout-sidebar-offset, var(--sero-sidebar-width));
      right: 0;
      z-index: 90;
    }

    /* ── Hamburger column ── */
    .topbar-nav {
      display: flex;
      align-items: center;
    }

    .hamburger-btn {
      width: 38px;
      height: 38px;
      border-radius: 9px;
      border: 1px solid var(--sero-border);
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      color: var(--sero-text-secondary);
      padding: 0;
      transition: background 150ms ease, border-color 150ms ease, color 150ms ease;

      .material-icons-round { font-size: 22px; }

      &:hover {
        background: color-mix(in srgb, var(--sero-primary) 8%, transparent);
        border-color: color-mix(in srgb, var(--sero-primary) 35%, transparent);
        color: var(--sero-primary);
      }
    }

    /* ── Title column ── */
    .topbar-center {
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .topbar-title {
      font-size: 1rem;
      font-weight: 700;
      color: var(--sero-text-primary);
      letter-spacing: -0.015em;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ── Actions column ── */
    .topbar-actions {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .topbar-divider {
      width: 1px;
      height: 24px;
      background: var(--sero-border);
      flex-shrink: 0;
    }

    /* ── Icon buttons ── */
    .topbar-icon-btn {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: 1px solid var(--sero-border);
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      color: var(--sero-text-secondary);
      padding: 0;
      transition: background 150ms ease, border-color 150ms ease, color 150ms ease, box-shadow 150ms ease;

      .material-icons-round { font-size: 20px; }

      &:hover {
        background: color-mix(in srgb, var(--sero-primary) 8%, transparent);
        border-color: color-mix(in srgb, var(--sero-primary) 35%, transparent);
        color: var(--sero-primary);
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
      }
    }

    .notif-dot {
      position: absolute;
      width: 7px;
      height: 7px;
      background: var(--sero-danger);
      border-radius: 50%;
      top: 7px;
      inset-inline-end: 7px;
      border: 1.5px solid var(--sero-card-bg);
      pointer-events: none;
    }

    /* ── User avatar button ── */
    .user-avatar-btn {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: 1px solid var(--sero-border);
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      padding: 0;
      transition: border-color 150ms ease, box-shadow 150ms ease;

      &:hover {
        border-color: var(--sero-border-strong);
        box-shadow: var(--shadow-sm);
      }
    }

    .uc-avatar {
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, var(--sero-primary) 0%, var(--sero-primary-light) 100%);
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.65rem;
      font-weight: 800;
      color: #fff;
      letter-spacing: 0.02em;
      flex-shrink: 0;
    }

    /* ── Role Switcher ── */
    .role-switcher {
      position: relative;
      display: inline-flex;
      align-items: center;
      min-height: 36px;
      min-width: 170px;
      padding: 4px 10px;
      border: 1px solid var(--sero-border);
      border-radius: 8px;
      background: var(--sero-surface-2);
      transition: border-color var(--t-fast), background var(--t-fast);
      gap: 6px;

      &:hover { border-color: var(--sero-border-strong); }
      &[data-mode='admin']    { border-color: #d8aaaa; background: #fff4f4; }
      &[data-mode='master']   { border-color: #d8c98c; background: #fbf8ee; }
      &[data-mode='subAgent'] { border-color: #9ab5d0; background: #f2f7fd; }
    }

    .rs-trigger {
      width: 100%;
      border: none;
      background: transparent;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 0;
      font-family: var(--sero-font);
      cursor: pointer;
      color: var(--sero-text-primary);
      min-height: 28px;
    }

    .rs-icon { font-size: 16px; color: var(--sero-text-muted); flex-shrink: 0; }

    .rs-value {
      flex: 1;
      min-width: 0;
      text-align: start;
      font-size: 0.8125rem;
      font-weight: 600;
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .rs-chevron {
      font-size: 16px;
      color: var(--sero-text-muted);
      transition: transform var(--t-fast);
      flex-shrink: 0;
      &.open { transform: rotate(180deg); }
    }

    .rs-menu {
      position: absolute;
      top: calc(100% + 6px);
      inset-inline-start: 0;
      min-width: 100%;
      background: var(--sero-card-bg);
      border: 1px solid var(--sero-border);
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(15, 23, 42, 0.09), 0 2px 10px rgba(15, 23, 42, 0.04);
      padding: 6px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      z-index: 200;
      animation: rsIn .14s ease;
    }

    .rs-option {
      border: 1px solid transparent;
      background: transparent;
      border-radius: 8px;
      min-height: 38px;
      text-align: start;
      padding: 8px 12px;
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--sero-text-primary);
      cursor: pointer;
      transition: all var(--t-fast);
      font-family: var(--sero-font);
      white-space: nowrap;

      &:hover { background: var(--sero-bg-hover); border-color: var(--sero-border-light); }
      &.active { background: var(--sero-bg-selected); color: var(--sero-primary-dark); font-weight: 600; }
    }

    @keyframes rsIn {
      from { opacity: 0; transform: translateY(-4px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    /* ── RTL ── */
    :host-context([dir="rtl"]) .sero-topbar {
      left: 0;
      right: var(--layout-sidebar-offset, var(--sero-sidebar-width));
    }

    /* ── Mobile: sidebar hidden, topbar full width ── */
    @media (max-width: 1023px) {
      .sero-topbar {
        left: 0 !important;
        right: 0 !important;
        padding: 0 12px;
        gap: 8px;
      }

      .role-switcher { min-width: 130px; }
    }
  `]
})
export class TopbarComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  currentAgent: Agent | null = null;
  selectedMode: ViewMode = 'master';
  isRoleMenuOpen = false;
  currentTitleKey = 'sidebar.nav.statisticsGroup';

  // Ordered most-specific first so first match wins
  private readonly routeTitleMap: { prefix: string; key: string }[] = [
    { prefix: '/my-services/makkah',                key: 'Makkah' },
    { prefix: '/my-services/madina',                key: 'Madina' },
    { prefix: '/my-services/transport',             key: 'Transport' },
    { prefix: '/my-services/tickets',               key: 'Tickets' },
    { prefix: '/my-services/food',                  key: 'Food' },
    { prefix: '/my-services',                       key: 'My Services' },
    { prefix: '/admin/agent-packages/new',         key: 'sidebar.nav.defineNewPackage' },
    { prefix: '/admin/agent-packages',             key: 'sidebar.nav.agentPackages' },
    { prefix: '/admin/packages/builder',             key: 'sidebar.nav.defineNewPackage' },
    { prefix: '/admin/packages',                     key: 'sidebar.nav.agentPackages' },
    { prefix: '/admin/orders/new',                   key: 'sidebar.nav.newOrder' },
    { prefix: '/admin/orders',                       key: 'sidebar.nav.ordersGroup' },
    { prefix: '/admin/analytics',                    key: 'sidebar.nav.statisticsGroup' },
    { prefix: '/admin/operations/hotel-bookings',    key: 'sidebar.nav.hotelBookings' },
    { prefix: '/admin/operations/visa-requests',     key: 'sidebar.nav.visaRequests' },
    { prefix: '/admin/operations/transport-requests',key: 'sidebar.nav.transportRequests' },
    { prefix: '/admin/operations/catering-requests', key: 'sidebar.nav.cateringRequests' },
    { prefix: '/admin/operations/flight-requests',   key: 'sidebar.nav.flightRequests' },
    { prefix: '/admin/operations/hotels',            key: 'sidebar.nav.hotelBookings' },
    { prefix: '/admin/operations/visa',              key: 'sidebar.nav.visaRequests' },
    { prefix: '/admin/operations/transport',         key: 'sidebar.nav.transportRequests' },
    { prefix: '/admin/operations/catering',          key: 'sidebar.nav.cateringRequests' },
    { prefix: '/admin/operations/flights',           key: 'sidebar.nav.flightRequests' },
    { prefix: '/admin/operations',                   key: 'sidebar.nav.operationsGroup' },
    { prefix: '/admin/pricing/transport',            key: 'sidebar.nav.transportPricing' },
    { prefix: '/admin/pricing/food',                 key: 'sidebar.nav.foodPricing' },
    { prefix: '/admin/pricing/hotel',                key: 'sidebar.nav.hotelPricing' },
    { prefix: '/admin/pricing',                      key: 'sidebar.nav.pricingGroup' },
    { prefix: '/admin/service-center/rfq/new',       key: 'sidebar.nav.newRfq' },
    { prefix: '/admin/service-center/rfq/current',   key: 'sidebar.nav.currentRequests' },
    { prefix: '/admin/service-center/rfq/closed',    key: 'sidebar.nav.closedRequests' },
    { prefix: '/admin/service-center/customers',     key: 'sidebar.nav.customers' },
    { prefix: '/admin/service-center',               key: 'sidebar.nav.serviceCenterGroup' },
    { prefix: '/admin/finance/chart-of-accounts',    key: 'sidebar.nav.accountingTree' },
    { prefix: '/admin/finance/tree',                 key: 'sidebar.nav.accountingTree' },
    { prefix: '/admin/finance/fiscal-year',          key: 'sidebar.nav.financialYear' },
    { prefix: '/admin/finance/year',                 key: 'sidebar.nav.financialYear' },
    { prefix: '/admin/finance/journal-entries/create', key: 'sidebar.nav.journalEntries' },
    { prefix: '/admin/finance/journal-entries-pending', key: 'sidebar.nav.journalEntries' },
    { prefix: '/admin/finance/journal-entries-unapproved', key: 'sidebar.nav.journalEntries' },
    { prefix: '/admin/finance/journal-entries-import', key: 'sidebar.nav.journalEntries' },
    { prefix: '/admin/finance/journal-entries-tax-expense', key: 'sidebar.nav.journalEntries' },
    { prefix: '/admin/finance/journal-entries',      key: 'sidebar.nav.journalEntries' },
    { prefix: '/admin/finance/entries',              key: 'sidebar.nav.journalEntries' },
    { prefix: '/admin/finance/account-statement',    key: 'sidebar.nav.accountStatement' },
    { prefix: '/admin/finance/statement',            key: 'sidebar.nav.accountStatement' },
    { prefix: '/admin/finance/trial-balance',        key: 'sidebar.nav.trialBalance' },
    { prefix: '/admin/finance/opening-balance',      key: 'sidebar.nav.openingBalance' },
    { prefix: '/admin/finance/banks-management',     key: 'sidebar.nav.financeWallets' },
    { prefix: '/admin/finance/cash',                 key: 'sidebar.nav.financeWallets' },
    { prefix: '/admin/finance/expenses-management',  key: 'sidebar.nav.expensesManagement' },
    { prefix: '/admin/finance/cost-centers',         key: 'sidebar.nav.costCenters' },
    { prefix: '/admin/finance/financial-reports',    key: 'sidebar.nav.financialReports' },
    { prefix: '/admin/finance/reports',              key: 'sidebar.nav.financialReports' },
    { prefix: '/admin/finance/account-routing',      key: 'sidebar.nav.accountRouting' },
    { prefix: '/admin/finance/income-statement',     key: 'sidebar.nav.incomeStatement' },
    { prefix: '/admin/finance',                      key: 'sidebar.nav.financeGroup' },
    { prefix: '/admin/financials/owners',            key: 'sidebar.nav.ownersList' },
    { prefix: '/admin/financials/approvals',         key: 'sidebar.nav.approvalRequests' },
    { prefix: '/admin/financials',                   key: 'sidebar.nav.financialsGroup' },
    { prefix: '/admin/services/hotels',              key: 'sidebar.nav.hotelsService' },
    { prefix: '/admin/services/transport-companies', key: 'sidebar.nav.transportCompanies' },
    { prefix: '/admin/services/hotel-categories',    key: 'sidebar.nav.hotelCategories' },
    { prefix: '/admin/services',                     key: 'sidebar.nav.servicesGroup' },
    { prefix: '/admin/agents/list',                  key: 'sidebar.nav.agentsList' },
    { prefix: '/admin/agents/account-managers',      key: 'sidebar.nav.accountManagers' },
    { prefix: '/admin/agents',                       key: 'sidebar.nav.agentManagementGroup' },
    { prefix: '/admin/users/groups',                 key: 'sidebar.nav.userGroups' },
    { prefix: '/admin/users/system-admins',          key: 'sidebar.nav.systemAdmins' },
    { prefix: '/admin/users/provider-users',         key: 'sidebar.nav.providerUsers' },
    { prefix: '/admin/users/agent-users',            key: 'sidebar.nav.agentUsers' },
    { prefix: '/admin/users',                        key: 'sidebar.nav.usersGroup' },
    { prefix: '/admin/hotel-providers/list',         key: 'sidebar.nav.providersList' },
    { prefix: '/admin/hotel-providers/subscriptions',key: 'sidebar.nav.subscriptions' },
    { prefix: '/admin/hotel-providers',              key: 'sidebar.nav.hotelProvidersGroup' },
    { prefix: '/agent/orders',                       key: 'sidebar.nav.agentOrders' },
    { prefix: '/agent/marketplace',                  key: 'sidebar.nav.marketplace' },
    { prefix: '/master',                             key: 'sidebar.nav.distributedPackages' },
  ];

  constructor(
    private readonly agentService: AgentService,
    private readonly viewModeService: ViewModeService,
    private readonly hostElement: ElementRef<HTMLElement>,
    private readonly router: Router,
    public readonly layout: LayoutService
  ) {}

  ngOnInit(): void {
    this.agentService.getCurrentAgent().subscribe(a => (this.currentAgent = a));
    this.selectedMode = this.viewModeService.getCurrentMode();
    this.viewModeService.selectedView$.subscribe(mode => (this.selectedMode = mode));

    this.currentTitleKey = this.resolveTitle(this.router.url);
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(e => {
      this.currentTitleKey = this.resolveTitle(e.urlAfterRedirects);
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private resolveTitle(url: string): string {
    const path = url.split('?')[0];
    for (const entry of this.routeTitleMap) {
      if (path === entry.prefix || path.startsWith(entry.prefix + '/')) {
        return entry.key;
      }
    }
    return 'sidebar.nav.statisticsGroup';
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
      admin:    'topbar.roleView.admin',
      master:   'topbar.roleView.masterAgent',
      subAgent: 'topbar.roleView.subAgent'
    };
    return labels[this.selectedMode];
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.isRoleMenuOpen && !this.hostElement.nativeElement.contains(event.target as Node)) {
      this.isRoleMenuOpen = false;
    }
  }

  getInitials(name: string): string {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase();
  }
}
