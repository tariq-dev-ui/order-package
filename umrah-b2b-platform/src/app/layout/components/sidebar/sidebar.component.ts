import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { filter, Subject, takeUntil } from 'rxjs';
import { LayoutService } from '../../../core/services/layout.service';

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
  exact?: boolean;
  children?: NavChild[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  template: `
    <aside class="sero-sidebar">

      <!-- ── Logo Header ── -->
      <div class="sidebar-header">
        <img class="sidebar-logo-img" src="/IMG/logo.png" alt="Sero" />
      </div>

      <!-- ── Navigation ── -->
      <nav class="sidebar-nav">
        @for (group of navGroups; track group.id) {

          @if (!group.children) {
            <!-- Direct link -->
            <a class="nav-item"
               [class.active]="isActive(group.route!, group.exact)"
               [routerLink]="group.route">
              <span class="material-icons-round nav-icon">{{ group.icon }}</span>
              <span class="nav-label">{{ group.label | translate }}</span>
            </a>

          } @else {
            <!-- Expandable group -->
            <div class="nav-group">
              <button type="button"
                      class="nav-item has-children"
                      [class.group-active]="isGroupActive(group)"
                      [class.open]="isGroupOpen(group.id)"
                      (click)="toggleGroup(group.id)">
                <span class="material-icons-round nav-icon">{{ group.icon }}</span>
                <span class="nav-label">{{ group.label | translate }}</span>
                <span class="material-icons-round nav-chevron"
                      [class.open]="isGroupOpen(group.id)">expand_more</span>
              </button>

              @if (isGroupOpen(group.id)) {
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
    }

    /* ── Logo Header ── */
    .sidebar-header {
      height: var(--sero-topbar-height);
      padding: 0 20px;
      background: var(--sero-card-bg);
      border-bottom: 1px solid var(--sero-border);
      display: flex;
      align-items: center;
      flex-shrink: 0;
    }

    .sidebar-logo-img {
      height: 36px;
      width: auto;
      object-fit: contain;
      display: block;
    }

    /* ── Navigation Scroll Area ── */
    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
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

  readonly navGroups: NavGroup[] = [
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
        { label: 'sidebar.nav.defineNewPackage', route: '/admin/packages/builder', icon: 'add_circle_outline' },
        { label: 'sidebar.nav.agentPackages',    route: '/admin/packages',         icon: 'inventory',         exact: true },
        { label: 'sidebar.nav.newOrder',         route: '/admin/orders/new',       icon: 'add_shopping_cart', exact: true },
        { label: 'sidebar.nav.agentOrders',      route: '/agent/orders',           icon: 'list_alt' }
      ]
    },
    {
      id: 'operations',
      label: 'sidebar.nav.operationsGroup',
      icon: 'tune',
      children: [
        { label: 'sidebar.nav.hotelBookings',     route: '/admin/operations/hotels',    icon: 'hotel' },
        { label: 'sidebar.nav.visaRequests',      route: '/admin/operations/visa',      icon: 'badge' },
        { label: 'sidebar.nav.transportRequests', route: '/admin/operations/transport', icon: 'directions_bus' },
        { label: 'sidebar.nav.cateringRequests',  route: '/admin/operations/catering',  icon: 'restaurant' },
        { label: 'sidebar.nav.flightRequests',    route: '/admin/operations/flights',   icon: 'flight' }
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
        { label: 'sidebar.nav.cashBox',         route: '/admin/finance/cash',            icon: 'point_of_sale' },
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

  constructor(
    public readonly layout: LayoutService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.currentUrl = this.router.url;
    this.autoExpandActive();

    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe(e => {
      this.currentUrl = e.urlAfterRedirects;
      this.autoExpandActive();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private autoExpandActive(): void {
    for (const group of this.navGroups) {
      if (group.children?.some(c => this.isActive(c.route, c.exact))) {
        this.openGroups.add(group.id);
      }
    }
  }

  toggleGroup(id: string): void {
    if (this.openGroups.has(id)) {
      this.openGroups.delete(id);
    } else {
      this.openGroups.add(id);
    }
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
}
