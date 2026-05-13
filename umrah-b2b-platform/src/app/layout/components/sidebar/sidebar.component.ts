import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
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
  imports: [CommonModule, RouterModule],
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
              <span class="nav-label">{{ group.label }}</span>
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
                <span class="nav-label">{{ group.label }}</span>
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
                      <span class="child-label">{{ child.label }}</span>
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
      label: 'الإحصائيات',
      icon: 'bar_chart',
      route: '/admin/analytics'
    },
    {
      id: 'orders',
      label: 'إدارة الطلبات',
      icon: 'assignment',
      children: [
        { label: 'تعريف باقة جديدة', route: '/admin/packages/builder', icon: 'add_circle_outline' },
        { label: 'باقات الوكلاء',    route: '/admin/packages',         icon: 'inventory',         exact: true },
        { label: 'طلب جديد',         route: '/admin/orders/new',       icon: 'add_shopping_cart', exact: true },
        { label: 'طلبات الوكلاء',   route: '/agent/orders',            icon: 'list_alt' }
      ]
    },
    {
      id: 'operations',
      label: 'إدارة العمليات',
      icon: 'tune',
      children: [
        { label: 'حجوزات الفنادق',  route: '/admin/operations/hotels',    icon: 'hotel' },
        { label: 'طلبات الفيزا',    route: '/admin/operations/visa',      icon: 'badge' },
        { label: 'طلبات المواصلات', route: '/admin/operations/transport', icon: 'directions_bus' },
        { label: 'طلبات الاعاشة',   route: '/admin/operations/catering',  icon: 'restaurant' },
        { label: 'طلبات الطيران',   route: '/admin/operations/flights',   icon: 'flight' }
      ]
    },
    {
      id: 'pricing',
      label: 'التسعيرات',
      icon: 'price_change',
      children: [
        { label: 'تسعيرات النقل',   route: '/admin/pricing/transport', icon: 'directions_car' },
        { label: 'تسعيرات التغذية', route: '/admin/pricing/food',      icon: 'restaurant_menu' },
        { label: 'تسعيرات الفندق',  route: '/admin/pricing/hotel',    icon: 'business' }
      ]
    },
    {
      id: 'service',
      label: 'مركز الخدمة',
      icon: 'support_agent',
      route: '/admin/service-center'
    },
    {
      id: 'finance',
      label: 'الإدارة المالية',
      icon: 'account_balance',
      children: [
        { label: 'الشجرة المحاسبية', route: '/admin/finance/tree',      icon: 'account_tree' },
        { label: 'السنة المالية',    route: '/admin/finance/year',      icon: 'calendar_month' },
        { label: 'القيود المحاسبية', route: '/admin/finance/entries',   icon: 'receipt_long' },
        { label: 'كشف الحساب',       route: '/admin/finance/statement', icon: 'description' }
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
