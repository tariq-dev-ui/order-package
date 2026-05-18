import { Component, OnInit, OnDestroy, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { filter, Subject, takeUntil } from 'rxjs';
import { LayoutService } from '../../../core/services/layout.service';
import { ViewMode, ViewModeService } from '../../../core/services/view-mode.service';

interface NavChild {
  label: string;
  route: string;
  icon: string;
  exact?: boolean;
}

interface NavGroup {
  id: string;
  label: string;
  icon: string;
  route?: string;
  badge?: string;
  exact?: boolean;
  children?: NavChild[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <aside class="sero-sidebar" [class.collapsed]="layout.sidebarCollapsed()">

      <!-- ── Logo Header ── -->
      <div class="sidebar-header">
        @if (layout.sidebarCollapsed()) {
          <img class="sidebar-mini-logo" src="/IMG/logo.png" alt="Sero" />
        } @else {
          <img class="sidebar-logo-img" src="/IMG/logo.png" alt="Sero" />
        }
      </div>

      <!-- ── Navigation ── -->
      <nav class="sidebar-nav">
        @for (group of navGroups; track group.id) {

          @if (!group.children) {
            <!-- Direct link -->
            <a class="nav-item"
               [class.active]="isActive(group.route!, group.exact)"
               [routerLink]="group.route"
               [attr.title]="layout.sidebarCollapsed() ? (group.label | translate) : null">
              <span class="material-icons-round nav-icon">{{ group.icon }}</span>
              @if (!layout.sidebarCollapsed()) {
                <span class="nav-label">{{ group.label | translate }}</span>
                @if (group.badge) {
                  <span class="nav-badge">{{ group.badge }}</span>
                }
              }
            </a>

          } @else {
            <!-- Expandable group -->
            <div class="nav-group">
              <button type="button"
                      class="nav-item has-children"
                      [class.group-active]="isGroupActive(group)"
                      [class.open]="isGroupOpen(group.id)"
                      [attr.title]="layout.sidebarCollapsed() ? (group.label | translate) : null"
                      (click)="toggleGroup(group.id, $event)">
                <span class="material-icons-round nav-icon">{{ group.icon }}</span>
                @if (!layout.sidebarCollapsed()) {
                  <span class="nav-label">{{ group.label | translate }}</span>
                  <span class="material-icons-round nav-chevron"
                        [class.open]="isGroupOpen(group.id)">expand_more</span>
                }
              </button>

              @if (isGroupOpen(group.id) && !layout.sidebarCollapsed()) {
                <div class="nav-children">
                  @for (child of group.children; track child.route) {
                    <a class="nav-child"
                       [class.active]="isActive(child.route, child.exact)"
                       [routerLink]="child.route">
                      <span class="material-icons-round child-icon">{{ child.icon }}</span>
                      <span class="child-label">{{ child.label | translate }}</span>
                    </a>
                  }
                </div>
              }

              @if (layout.sidebarCollapsed() && popupGroupId === group.id) {
                <div class="nav-popup"
                     [style.top.px]="popupTop"
                     [style.left.px]="popupLeft"
                     [style.right.px]="popupRight">
                  <div class="nav-popup-title">{{ group.label | translate }}</div>
                  <div class="nav-popup-list">
                    @for (child of group.children; track child.route) {
                      <a class="nav-popup-child"
                         [class.active]="isActive(child.route, child.exact)"
                         [routerLink]="child.route"
                         (click)="closePopup()">
                        <span class="material-icons-round child-icon">{{ child.icon }}</span>
                        <span class="child-label">{{ child.label | translate }}</span>
                      </a>
                    }
                  </div>
                </div>
              }
            </div>
          }

        }
      </nav>
    </aside>
  `,
  styles: [`
    :host {
      display: block;
    }

    /* ════ SIDEBAR ════════════════════════════════════════════════ */
    .sero-sidebar {
      width: var(--sero-sidebar-width);
      height: 100vh;
      background: var(--sero-surface-2);
      border-inline-end: 0.1px solid var(--sero-border);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      position: fixed;
      top: 0;
      inset-inline-start: 0;
      z-index: 100;
      transition: width var(--t-slow);
      overflow: visible;
    }

    .sero-sidebar.collapsed {
      width: var(--sero-sidebar-collapsed);
    }

    /* ── Logo Header ── */
    .sidebar-header {
      height: 106px;
      padding: 6px 10px;
      background: var(--sero-card-bg);
      border-bottom: 1px solid var(--sero-border);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .sidebar-logo-img {
      width: 100%;
      height: 100%;
      max-height: 94px;
      object-fit: contain;
      display: block;
    }

    .sidebar-mini-logo {
      width: 54px;
      height: 54px;
      object-fit: contain;
      display: block;
      border-radius: 8px;
    }

    /* ── Navigation Scroll Area ── */
    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      overflow-x: visible;
      padding: 10px 0 24px;
      scrollbar-width: thin;
      scrollbar-color: color-mix(in srgb, var(--sero-primary) 22%, transparent) transparent;

      &::-webkit-scrollbar { width: 4px; }
      &::-webkit-scrollbar-track { background: transparent; }
      &::-webkit-scrollbar-thumb {
        background: color-mix(in srgb, var(--sero-primary) 22%, transparent);
        border-radius: 4px;
      }
    }

    /* ── Nav Item (shared — both <a> leaf and <button> group header) ── */
    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      margin: 2px 8px;
      padding: 10px 12px;
      border-radius: 8px;
      cursor: pointer;
      position: relative;
      text-decoration: none;
      color: var(--sero-text-secondary);
      font-family: var(--sero-font);
      font-size: 0.8125rem;
      font-weight: 500;
      line-height: 1.3;
      transition: background 150ms ease, color 150ms ease;
      border: none;
      background: transparent;
      width: calc(100% - 16px);
      text-align: start;

      &:hover:not(.active):not(.group-active) {
        background: var(--sero-bg-hover);
        color: var(--sero-text-primary);

        .nav-icon { color: var(--sero-primary); }
      }

      /* Active leaf — direct links only, not group headers */
      &.active:not(.has-children) {
        background: var(--sero-bg-selected);
        color: var(--sero-primary-dark);
        font-weight: 600;

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

      /* Group header — a child is active */
      &.group-active {
        color: var(--sero-primary-dark);
        font-weight: 600;
        .nav-icon { color: var(--sero-primary); }
      }
    }

    .sero-sidebar.collapsed .nav-item {
      justify-content: center;
      width: calc(100% - 12px);
      margin: 2px 6px;
      padding: 10px 8px;
      border-radius: 10px;
    }

    .sero-sidebar.collapsed .nav-item.has-children .nav-chevron,
    .sero-sidebar.collapsed .nav-label,
    .sero-sidebar.collapsed .nav-children {
      display: none;
    }

    .sero-sidebar.collapsed .nav-item .nav-icon {
      font-size: 20px;
    }

    .nav-group {
      position: relative;
    }

    .nav-popup {
      position: fixed;
      min-width: 200px;
      max-width: 220px;
      background: var(--sero-card-bg);
      border: 1px solid var(--sero-border);
      border-radius: 10px;
      box-shadow: var(--shadow-lg);
      padding: 8px;
      z-index: 300;
    }

    .nav-popup-title {
      font-size: 0.75rem;
      font-weight: 800;
      color: var(--sero-text-primary);
      padding: 4px 8px 8px;
      border-bottom: 1px solid var(--sero-border-light);
      margin-bottom: 6px;
    }

    .nav-popup-list {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .nav-popup-child {
      display: flex;
      align-items: center;
      gap: 8px;
      border-radius: 8px;
      padding: 7px 8px;
      text-decoration: none;
      color: var(--sero-text-secondary);
      font-size: 0.76rem;
      transition: background var(--t-fast), color var(--t-fast);
    }

    .nav-popup-child:hover {
      background: var(--sero-bg-hover);
      color: var(--sero-text-primary);
    }

    .nav-popup-child.active {
      background: var(--sero-bg-selected);
      color: var(--sero-primary-dark);
      font-weight: 700;
    }

    .nav-icon {
      font-size: 18px;
      flex-shrink: 0;
      color: var(--sero-text-muted);
      transition: color 150ms ease;
    }

    .nav-label {
      flex: 1;
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .nav-chevron {
      font-size: 16px;
      color: var(--sero-text-muted);
      flex-shrink: 0;
      transition: transform 220ms cubic-bezier(0.4, 0, 0.2, 1);

      &.open { transform: rotate(180deg); }
    }

    .nav-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 24px;
      height: 20px;
      padding: 0 7px;
      border-radius: 999px;
      background: var(--sero-primary);
      color: #fff;
      font-size: 0.68rem;
      font-weight: 700;
      line-height: 1;
      margin-inline-start: auto;
      flex-shrink: 0;
    }

    /* ── Children Container (connector rail) ── */
    .nav-children {
      margin-inline-start: 22px;
      padding-inline-start: 12px;
      border-inline-start: 1.5px solid var(--sero-border);
      margin-top: 2px;
      margin-bottom: 4px;
    }

    /* ── Child Link ── */
    .nav-child {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px 8px 14px;
      margin: 1px 8px 1px 0;
      border-radius: 7px;
      cursor: pointer;
      position: relative;
      text-decoration: none;
      color: var(--sero-text-secondary);
      font-size: 0.8rem;
      font-weight: 400;
      line-height: 1.3;
      transition: background 150ms ease, color 150ms ease;

      &:hover:not(.active) {
        background: var(--sero-bg-hover);
        color: var(--sero-text-primary);
        .child-icon { color: var(--sero-primary); }
        &::before { background: color-mix(in srgb, var(--sero-primary) 55%, transparent); }
      }

      &.active {
        background: var(--sero-bg-selected);
        color: var(--sero-primary-dark);
        font-weight: 600;
        .child-icon { color: var(--sero-primary); }
        &::before { background: var(--sero-primary); }
      }

      &::before {
        content: '';
        position: absolute;
        inset-inline-start: 0;
        top: 50%;
        transform: translateY(-50%);
        width: 2px;
        height: 56%;
        border-radius: 2px;
        background: transparent;
        transition: background 150ms ease;
      }
    }

    .child-icon {
      font-size: 16px;
      flex-shrink: 0;
      color: var(--sero-text-muted);
      transition: color 150ms ease;
    }

    .child-label {
      flex: 1;
      min-width: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* ── RTL ── */
    :host-context([dir="rtl"]) .sero-sidebar {
      border-inline-end: none;
      border-inline-start: 0.1px solid var(--sero-border);
    }

    :host-context([dir="rtl"]) .nav-item.active:not(.has-children)::after {
      border-radius: 0 2px 2px 0;
    }

    :host-context([dir="rtl"]) .nav-child {
      margin: 1px 0 1px 8px;
      padding: 8px 14px 8px 10px;
    }

  `]
})
export class SidebarComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  currentUrl = '';
  openGroups = new Set<string>();
  popupGroupId: string | null = null;
  popupTop = 0;
  popupLeft: number | null = null;
  popupRight: number | null = null;

  navGroups: NavGroup[] = [];

  private readonly adminNavGroups: NavGroup[] = [
    {
      id: 'analytics',
      label: 'sidebar.nav.statisticsGroup',
      icon: 'bar_chart',
      route: '/admin/analytics'
    },
    {
      id: 'orders',
      label: 'sidebar.nav.ordersGroup',
      icon: 'assignment',
      children: [
        { label: 'sidebar.nav.defineNewPackage', route: '/admin/agent-packages/new', icon: 'add_circle_outline' },
        { label: 'sidebar.nav.agentPackages',    route: '/admin/agent-packages',     icon: 'inventory',         exact: true },
        { label: 'طلب جديد',                     route: '/admin/agent-requests/new', icon: 'add_shopping_cart', exact: true },
        { label: 'طلبات الوكلاء',                route: '/admin/agent-requests',     icon: 'list_alt' }
      ]
    },
    {
      id: 'operations',
      label: 'sidebar.nav.operationsGroup',
      icon: 'tune',
      children: [
        { label: 'sidebar.nav.hotelBookings',     route: '/admin/operations/hotel-bookings',     icon: 'hotel' },
        { label: 'sidebar.nav.visaRequests',      route: '/admin/operations/visa-requests',      icon: 'badge' },
        { label: 'sidebar.nav.transportRequests', route: '/admin/operations/transport-requests', icon: 'directions_bus' },
        { label: 'sidebar.nav.cateringRequests',  route: '/admin/operations/catering-requests',  icon: 'restaurant' },
        { label: 'sidebar.nav.flightRequests',    route: '/admin/operations/flight-requests',    icon: 'flight' }
      ]
    },
    {
      id: 'pricing',
      label: 'sidebar.nav.pricingGroup',
      icon: 'price_change',
      children: [
        { label: 'sidebar.nav.transportPricing', route: '/admin/pricing/transport', icon: 'directions_car' },
        { label: 'sidebar.nav.foodPricing',      route: '/admin/pricing/food',      icon: 'restaurant_menu' },
        { label: 'sidebar.nav.hotelPricing',     route: '/admin/pricing/hotel',     icon: 'business' }
      ]
    },
    {
      id: 'service',
      label: 'sidebar.nav.serviceCenterGroup',
      icon: 'support_agent',
      children: [
        { label: 'sidebar.nav.newRfq',          route: '/admin/service-center/rfq/new',     icon: 'request_quote', exact: true },
        { label: 'sidebar.nav.currentRequests', route: '/admin/service-center/rfq/current', icon: 'pending_actions' },
        { label: 'sidebar.nav.closedRequests',  route: '/admin/service-center/rfq/closed',  icon: 'check_circle_outline' },
        { label: 'sidebar.nav.customers',       route: '/admin/service-center/customers',   icon: 'people_outline' }
      ]
    },
    {
      id: 'finance',
      label: 'sidebar.nav.financeGroup',
      icon: 'account_balance',
      children: [
        { label: 'sidebar.nav.accountingTree',  route: '/admin/finance/tree',            icon: 'account_tree' },
        { label: 'sidebar.nav.financialYear',   route: '/admin/finance/year',            icon: 'calendar_month' },
        { label: 'sidebar.nav.journalEntries',  route: '/admin/finance/entries',         icon: 'receipt_long' },
        { label: 'sidebar.nav.accountStatement',route: '/admin/finance/statement',       icon: 'description' },
        { label: 'sidebar.nav.trialBalance',    route: '/admin/finance/trial-balance',   icon: 'balance' },
        { label: 'sidebar.nav.openingBalance',  route: '/admin/finance/opening-balance', icon: 'account_balance_wallet' },
        { label: 'sidebar.nav.financeWallets',  route: '/admin/finance/cash',            icon: 'account_balance_wallet' },
        { label: 'sidebar.nav.expensesManagement', route: '/admin/finance/expenses-management', icon: 'payments' },
        { label: 'sidebar.nav.costCenters',     route: '/admin/finance/cost-centers',    icon: 'hub' },
        { label: 'sidebar.nav.financialReports',route: '/admin/finance/reports',         icon: 'summarize' },
        { label: 'sidebar.nav.accountRouting',  route: '/admin/finance/account-routing', icon: 'alt_route' },
        { label: 'sidebar.nav.incomeStatement', route: '/admin/finance/income-statement',icon: 'trending_up' }
      ]
    },
    {
      id: 'financials',
      label: 'sidebar.nav.financialsGroup',
      icon: 'payments',
      children: [
        { label: 'sidebar.nav.ownersList',       route: '/admin/financials/owners',    icon: 'format_list_bulleted' },
        { label: 'sidebar.nav.approvalRequests', route: '/admin/financials/approvals', icon: 'approval' }
      ]
    },
    {
      id: 'services',
      label: 'sidebar.nav.servicesGroup',
      icon: 'category',
      children: [
        { label: 'sidebar.nav.hotelsService',      route: '/admin/services/hotels',              icon: 'hotel' },
        { label: 'sidebar.nav.transportCompanies', route: '/admin/services/transport-companies', icon: 'local_shipping' },
        { label: 'sidebar.nav.hotelCategories',    route: '/admin/services/hotel-categories',    icon: 'star_rate' }
      ]
    },
    {
      id: 'agentManagement',
      label: 'sidebar.nav.agentManagementGroup',
      icon: 'manage_accounts',
      children: [
        { label: 'sidebar.nav.agentsList',      route: '/admin/agents/list',             icon: 'groups' },
        { label: 'sidebar.nav.accountManagers', route: '/admin/agents/account-managers', icon: 'supervisor_account' }
      ]
    },
    {
      id: 'users',
      label: 'sidebar.nav.usersGroup',
      icon: 'people',
      children: [
        { label: 'sidebar.nav.userGroups',   route: '/admin/users/groups',         icon: 'workspaces' },
        { label: 'sidebar.nav.systemAdmins', route: '/admin/users/system-admins',  icon: 'admin_panel_settings' },
        { label: 'sidebar.nav.providerUsers',route: '/admin/users/provider-users', icon: 'corporate_fare' },
        { label: 'sidebar.nav.agentUsers',   route: '/admin/users/agent-users',    icon: 'badge' }
      ]
    },
    {
      id: 'hotelProviders',
      label: 'sidebar.nav.hotelProvidersGroup',
      icon: 'domain',
      children: [
        { label: 'sidebar.nav.providersList',  route: '/admin/hotel-providers/list',          icon: 'list_alt' },
        { label: 'sidebar.nav.subscriptions',  route: '/admin/hotel-providers/subscriptions', icon: 'card_membership' }
      ]
    }
  ];

  private readonly masterNavGroups: NavGroup[] = [
    { id: 'master-dashboard',   label: 'Dashboard',   icon: 'pie_chart',           route: '/master/distributed', exact: true },
    { id: 'master-packages',    label: 'Packages',    icon: 'inventory_2',         route: '/master/packages',    exact: true },
    { id: 'master-my-packages', label: 'My Packages', icon: 'inventory',           route: '/master/my-packages', exact: true },
    {
      id: 'master-my-services-mgmt',
      label: 'sidebar.nav.myServicesManagement',
      icon: 'miscellaneous_services',
      route: '/master/my-services',
      exact: true
    },
    {
      id: 'master-my-services-group',
      label: 'My Services',
      icon: 'layers',
      children: [
        { label: 'Makkah',    route: '/master/my-services/makkah',    icon: 'mosque' },
        { label: 'Madina',    route: '/master/my-services/madina',    icon: 'mosque' },
        { label: 'Transport', route: '/master/my-services/transport', icon: 'directions_bus' },
        { label: 'Tickets',   route: '/master/my-services/tickets',   icon: 'confirmation_number' },
        { label: 'Food',      route: '/master/my-services/food',      icon: 'restaurant' }
      ]
    },
    { id: 'master-orders',      label: 'Orders',      icon: 'luggage',             route: '/master/orders',      badge: '34', exact: true },
    { id: 'master-quotations',  label: 'Quotations',  icon: 'confirmation_number', route: '/master/quotations',  exact: true },
    { id: 'master-subagents',   label: 'Subagents',   icon: 'group',               route: '/master/subagents',   exact: true },
    {
      id: 'master-finance',
      label: 'Finance',
      icon: 'account_balance',
      children: [
        { label: 'Chart of Accounts', route: '/master/finance/chart-of-accounts', icon: 'account_tree' },
        { label: 'Fiscal Year',       route: '/master/finance/fiscal-year',        icon: 'calendar_month' },
        { label: 'Journal Entries',   route: '/master/finance/journal-entries',    icon: 'receipt_long' },
        { label: 'Account Statement', route: '/master/finance/account-statement',  icon: 'description' },
        { label: 'Trial Balance',     route: '/master/finance/trial-balance',      icon: 'balance' },
        { label: 'Opening Balance',   route: '/master/finance/opening-balance',    icon: 'account_balance_wallet' },
        { label: 'Account Routing',   route: '/master/finance/account-routing',    icon: 'alt_route' },
        { label: 'Income Statement',  route: '/master/finance/income-statement',   icon: 'trending_up' },
        { label: 'Cashier Session',   route: '/master/finance/cashier-session',    icon: 'point_of_sale' }
      ]
    },
    { id: 'master-settings', label: 'Settings', icon: 'settings', route: '/master/settings', exact: true }
  ];

  private readonly subAgentNavGroups: NavGroup[] = [
    { id: 'agent-marketplace', label: 'Marketplace', icon: 'storefront', route: '/agent/marketplace', exact: true },
    { id: 'agent-orders', label: 'Orders', icon: 'shopping_bag', route: '/agent/orders' }
  ];

  constructor(
    public readonly layout: LayoutService,
    private readonly router: Router,
    private readonly hostElement: ElementRef<HTMLElement>,
    private readonly viewModeService: ViewModeService
  ) {}

  ngOnInit(): void {
    this.applyNavForMode(this.viewModeService.getCurrentMode());
    this.currentUrl = this.router.url;
    this.autoExpandActive();

    this.viewModeService.selectedView$
      .pipe(takeUntil(this.destroy$))
      .subscribe((mode) => {
        this.applyNavForMode(mode);
      });

    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(e => {
      this.currentUrl = e.urlAfterRedirects;
      this.autoExpandActive();
      this.closePopup();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private autoExpandActive(): void {
    this.openGroups.clear();
    for (const group of this.navGroups) {
      if (group.children?.some(c => this.isActive(c.route, c.exact))) {
        this.openGroups.add(group.id);
      }
    }
  }

  toggleGroup(id: string, event?: Event): void {
    event?.stopPropagation();

    if (this.layout.sidebarCollapsed()) {
      const isSamePopup = this.popupGroupId === id;
      this.popupGroupId = isSamePopup ? null : id;

      if (!isSamePopup && event?.currentTarget instanceof HTMLElement) {
        const group = this.navGroups.find(item => item.id === id);
        const itemCount = group?.children?.length ?? 0;
        const popupHeight = Math.min(window.innerHeight - 24, 56 + (itemCount * 38));
        const popupWidth = 220;
        const margin = 12;
        const buttonRect = event.currentTarget.getBoundingClientRect();
        this.popupTop = Math.max(margin, Math.min(buttonRect.top, window.innerHeight - popupHeight - margin));

        if (this.isRtl()) {
          this.popupLeft = null;
          this.popupRight = Math.max(margin, window.innerWidth - buttonRect.left + 8);
        } else {
          this.popupRight = null;
          this.popupLeft = Math.max(margin, Math.min(buttonRect.right + 8, window.innerWidth - popupWidth - margin));
        }
      }
      return;
    }

    if (this.openGroups.has(id)) {
      this.openGroups.delete(id);
    } else {
      this.openGroups.add(id);
    }
  }

  closePopup(): void {
    this.popupGroupId = null;
    this.popupLeft = null;
    this.popupRight = null;
  }

  isGroupOpen(id: string): boolean {
    return this.openGroups.has(id);
  }

  isActive(route: string, exact?: boolean): boolean {
    const url = this.currentUrl.split('?')[0];
    if (exact) return url === route;
    return url === route || url.startsWith(route + '/');
  }

  isGroupActive(group: NavGroup): boolean {
    if (group.route) return this.isActive(group.route, group.exact);
    return group.children?.some(c => this.isActive(c.route, c.exact)) ?? false;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.popupGroupId !== null && this.layout.sidebarCollapsed() && !this.hostElement.nativeElement.contains(event.target as Node)) {
      this.closePopup();
    }
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    this.closePopup();
  }

  private isRtl(): boolean {
    return document.documentElement.dir === 'rtl'
      || this.hostElement.nativeElement.closest('[dir="rtl"]') !== null;
  }

  private applyNavForMode(mode: ViewMode): void {
    if (mode === 'master') {
      this.navGroups = this.masterNavGroups;
    } else if (mode === 'subAgent') {
      this.navGroups = this.subAgentNavGroups;
    } else {
      this.navGroups = this.adminNavGroups;
    }

    this.closePopup();
    this.autoExpandActive();
  }
}
