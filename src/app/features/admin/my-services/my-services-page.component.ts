import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';
import { SeroDropdownComponent } from '../../../shared/components/sero-dropdown/sero-dropdown.component';
import {
  MY_SERVICE_CITY_OPTIONS,
  MY_SERVICE_DEFAULT_FILTERS,
  MY_SERVICE_ITEMS_PER_PAGE_OPTIONS,
  MY_SERVICE_LAST_UPDATED_OPTIONS,
  MY_SERVICE_LIFECYCLE_OPTIONS,
  MY_SERVICE_PRICING_RANGE_OPTIONS,
  MY_SERVICE_STATUS_OPTIONS,
  MY_SERVICE_TYPE_OPTIONS,
  MyService,
  MyServiceFilterState,
  MyServiceHealth,
  MyServiceStatus,
} from './my-service.mock';
import { MyServicesFormComponent } from './my-services-form/my-services-form.component';
import { MyServicesService } from './my-services.service';
import { SeroCurrencyPipe } from 'src/app/shared/pipes/sero-currency.pipe';

@Component({
  selector: 'app-my-services-page',
  standalone: true,
  imports: [CommonModule, MatDialogModule, SeroDropdownComponent, SeroCurrencyPipe],
  template: `
    <section class="my-services-page" dir="rtl">
      <header class="page-head">
        <div>
          <p class="page-kicker">Service Inventory Board</p>
          <h1>خدماتي</h1>
          <p class="page-subtitle">إدارة تشغيلية للخدمات، السعة، التسعير، والحالة في مكان واحد.</p>
        </div>

        <div class="add-menu-wrap">
          <button
            type="button"
            class="primary-action add-btn"
            aria-haspopup="menu"
            [attr.aria-expanded]="isAddMenuOpen()"
            (click)="toggleAddMenu($event)"
            (keydown)="onAddButtonKeydown($event)">
            <span class="material-icons-round">add</span>
            <span>إضافة خدمة جديدة</span>
            <span class="material-icons-round add-chevron" [class.is-open]="isAddMenuOpen()">expand_more</span>
          </button>

          @if (isAddMenuOpen()) {
            <div class="service-add-menu" role="menu" (click)="$event.stopPropagation()">
              <div
                class="service-menu-group"
                [class.is-open]="isHotelsSubmenuOpen()"
                (mouseenter)="openHotelsSubmenu()"
                (mouseleave)="closeHotelsSubmenu()">
                <button
                  type="button"
                  class="service-menu-item has-submenu"
                  role="menuitem"
                  aria-haspopup="menu"
                  [attr.aria-expanded]="isHotelsSubmenuOpen()"
                  (click)="toggleHotelsSubmenu($event)"
                  (keydown)="onHotelsItemKeydown($event)">
                  <span class="material-icons-round menu-item-icon">hotel</span>
                  <span>فنادق</span>
                  <span class="material-icons-round submenu-chevron">chevron_left</span>
                </button>

                @if (isHotelsSubmenuOpen()) {
                  <div class="hotels-submenu" role="menu">
                    <button type="button" class="service-menu-item" role="menuitem" (click)="navigateToAddService('/master/my-services/makkah/new')">
                      <span class="material-icons-round menu-item-icon">hotel</span>
                      <span>فنادق مكة</span>
                    </button>
                    <button type="button" class="service-menu-item" role="menuitem" (click)="navigateToAddService('/master/my-services/madina/new')">
                      <span class="material-icons-round menu-item-icon">hotel</span>
                      <span>فنادق المدينة</span>
                    </button>
                  </div>
                }
              </div>

              <button type="button" class="service-menu-item" role="menuitem" (click)="navigateToAddService('/master/my-services/transport/new')">
                <span class="material-icons-round menu-item-icon">directions_bus</span>
                <span>مواصلات</span>
              </button>
              <button type="button" class="service-menu-item" role="menuitem" (click)="navigateToAddService('/master/my-services/tickets/new')">
                <span class="material-icons-round menu-item-icon">confirmation_number</span>
                <span>تذاكر</span>
              </button>
              <button type="button" class="service-menu-item" role="menuitem" (click)="navigateToAddService('/master/my-services/food/new')">
                <span class="material-icons-round menu-item-icon">restaurant</span>
                <span>تغذية</span>
              </button>
            </div>
          }
        </div>
      </header>

      @if (successMessage()) {
        <div class="success-message" role="status">
          <span class="material-icons-round">check_circle</span>
          <span>{{ successMessage() }}</span>
        </div>
      }

      <section class="summary-grid" aria-label="Service summary">
        <article class="summary-card">
          <span class="summary-label">Total Services</span>
          <strong>{{ summary().total }}</strong>
          <span class="summary-note">Operational catalog</span>
        </article>
        <article class="summary-card is-active">
          <span class="summary-label">Active Services</span>
          <strong>{{ summary().active }}</strong>
          <span class="summary-note">Ready for booking</span>
        </article>
        <article class="summary-card is-draft">
          <span class="summary-label">Drafts</span>
          <strong>{{ summary().drafts }}</strong>
          <span class="summary-note">Needs completion</span>
        </article>
        <article class="summary-card is-booked">
          <span class="summary-label">Fully Booked</span>
          <strong>{{ summary().fullyBooked }}</strong>
          <span class="summary-note">Capacity locked</span>
        </article>
        <article class="summary-card">
          <span class="summary-label">Average Pricing</span>
          <strong dir="ltr">{{ summary().averagePricing | seroCurrency:'symbol':'':0:0 }}</strong>
          <span class="summary-note">Across visible services</span>
        </article>
      </section>

      <section class="inventory-shell">
        <div class="filter-bar" aria-label="Service filters">
          <div class="search-field">
            <span class="material-icons-round">search</span>
            <input
              type="search"
              placeholder="ابحث عن خدمة، موقع، ملاحظات تشغيلية..."
              [value]="filters().searchText"
              (input)="onSearchInput($event)"
              (keydown.enter)="search()" />
          </div>

          <app-sero-dropdown
            class="filter-control"
            [options]="serviceTypeOptions"
            [value]="filters().serviceType"
            size="sm"
            (valueChange)="setFilter('serviceType', $event)">
          </app-sero-dropdown>

          <app-sero-dropdown
            class="filter-control"
            [options]="serviceCityOptions"
            [value]="filters().serviceCity"
            size="sm"
            (valueChange)="setFilter('serviceCity', $event)">
          </app-sero-dropdown>

          <app-sero-dropdown
            class="filter-control"
            [options]="statusOptions"
            [value]="filters().status"
            size="sm"
            (valueChange)="setFilter('status', $event)">
          </app-sero-dropdown>

          <app-sero-dropdown
            class="filter-control"
            [options]="pricingRangeOptions"
            [value]="filters().pricingRange"
            size="sm"
            (valueChange)="setFilter('pricingRange', $event)">
          </app-sero-dropdown>

          <app-sero-dropdown
            class="filter-control"
            [options]="lifecycleOptions"
            [value]="filters().lifecycle"
            size="sm"
            (valueChange)="setFilter('lifecycle', $event)">
          </app-sero-dropdown>

          <app-sero-dropdown
            class="filter-control"
            [options]="lastUpdatedOptions"
            [value]="filters().lastUpdated"
            size="sm"
            (valueChange)="setFilter('lastUpdated', $event)">
          </app-sero-dropdown>

          <button type="button" class="ghost-action" (click)="clear()">
            <span class="material-icons-round">restart_alt</span>
            <span>مسح</span>
          </button>
        </div>

        <div class="board-wrap">
          @if (isLoading()) {
            <div class="loading-overlay">
              <div class="spinner"></div>
              <span>Loading service inventory...</span>
            </div>
          }

          <div class="board-scroll">
            <div class="board-grid board-head" role="row">
              <span>Service Preview</span>
              <span>Service Type</span>
              <span>Coverage / Location</span>
              <span>Capacity</span>
              <span>Availability / Status</span>
              <span>Pricing Snapshot</span>
              <span>Last Update</span>
              <span>Actions</span>
            </div>

            @if (!isLoading() && pagedServices().length === 0) {
              <div class="empty-state">
                <span class="material-icons-round">design_services</span>
                <h2>لا توجد خدمات مطابقة</h2>
                <p>جرّب تعديل الفلاتر أو إضافة خدمة جديدة إلى المخزون التشغيلي.</p>
              </div>
            }

            <div class="board-rows">
              @for (service of pagedServices(); track service.id) {
                <article class="board-grid inventory-row" [class.row-menu-open]="openedActionMenuId() === service.id">
                  <div class="service-preview-cell">
                    <span class="health-dot" [ngClass]="healthClass(service.operational.health)" [attr.title]="healthLabel(service.operational.health)"></span>
                    <div class="service-icon" [ngClass]="typeClass(service.serviceType)">
                      <span class="material-icons-round">{{ serviceIcon(service.serviceType) }}</span>
                    </div>
                    <div class="service-copy">
                      <h2>{{ service.operational.title }}</h2>
                      @for (line of service.operational.summaryLines; track line) {
                        <span>{{ line }}</span>
                      }
                    </div>

                    <div class="quick-preview">
                      <div>
                        <span class="quick-label">Rooms / Capacity</span>
                        <strong>{{ service.operational.capacity }}</strong>
                      </div>
                      <div>
                        <span class="quick-label">Dates</span>
                        <strong>{{ service.operational.dates }}</strong>
                      </div>
                      <div>
                        <span class="quick-label">Guests</span>
                        <strong>{{ service.operational.guests }}</strong>
                      </div>
                      <p>{{ service.operational.notes }}</p>
                    </div>
                  </div>

                  <div>
                    <span class="service-type-pill" [ngClass]="typeClass(service.serviceType)">
                      <span class="material-icons-round">{{ serviceIcon(service.serviceType) }}</span>
                      <span>{{ getServiceTypeLabel(service.serviceType) }}</span>
                    </span>
                  </div>

                  <div class="coverage-cell">
                    <strong>{{ service.operational.coverage }}</strong>
                    <span>{{ getServiceCityLabel(service.serviceCity) }}</span>
                  </div>

                  <div class="capacity-cell">
                    <strong>{{ service.operational.capacity }}</strong>
                  </div>

                  <div>
                    <span class="status-pill" [ngClass]="statusClass(service.status)">
                      <span class="status-dot"></span>
                      <span>{{ statusLabel(service.status) }}</span>
                    </span>
                  </div>

                  <div class="pricing-cell">
                    <span>{{ service.pricing.label }}</span>
                    <strong dir="ltr">{{ service.pricing.amount | seroCurrency:'symbol':'':0:0 }}</strong>
                  </div>

                  <div class="update-cell">
                    <strong>{{ service.lastUpdate.relative }}</strong>
                    <span>by {{ service.lastUpdate.user }}</span>
                  </div>

                  <div class="action-cell" (click)="$event.stopPropagation()">
                    <button
                      type="button"
                      class="row-action-trigger"
                      aria-haspopup="menu"
                      [attr.aria-expanded]="openedActionMenuId() === service.id"
                      (click)="toggleActionMenu(service.id, $event)">
                      <span class="material-icons-round">more_horiz</span>
                    </button>

                    @if (openedActionMenuId() === service.id) {
                      <div class="row-action-menu" role="menu">
                        <button type="button" role="menuitem" (click)="viewService(service)">
                          <span class="material-icons-round">visibility</span>
                          <span>عرض</span>
                        </button>
                        <button type="button" role="menuitem" (click)="openEditServiceDialog(service)">
                          <span class="material-icons-round">edit</span>
                          <span>تعديل</span>
                        </button>
                        <button type="button" role="menuitem" (click)="duplicateService(service)">
                          <span class="material-icons-round">content_copy</span>
                          <span>نسخ</span>
                        </button>
                        <button type="button" role="menuitem" (click)="archiveService(service)">
                          <span class="material-icons-round">archive</span>
                          <span>أرشفة</span>
                        </button>
                        <button type="button" role="menuitem" class="danger" (click)="deleteService(service)">
                          <span class="material-icons-round">delete</span>
                          <span>حذف</span>
                        </button>
                      </div>
                    }
                  </div>
                </article>
              }
            </div>
          </div>

          @if (allServices().length > 0) {
            <footer class="pagination-bar">
              <div class="page-size">
                <span>عرض</span>
                <app-sero-dropdown
                  [options]="itemsPerPageDropdownOptions"
                  [value]="itemsPerPage()"
                  size="sm"
                  (valueChange)="onItemsPerPageChange($event)">
                </app-sero-dropdown>
                <span>لكل صفحة</span>
              </div>

              <div class="page-controls">
                <span>{{ shownItemsLabel() }}</span>
                <button type="button" class="pager-btn" (click)="previousPage()" [disabled]="currentPage() === 1">
                  <span class="material-icons-round">chevron_right</span>
                </button>
                <button type="button" class="pager-btn" (click)="nextPage()" [disabled]="currentPage() === totalPages()">
                  <span class="material-icons-round">chevron_left</span>
                </button>
              </div>
            </footer>
          }
        </div>
      </section>
    </section>
  `,
  styles: [`
    :host { display: block; }

    .my-services-page {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 24px;
    }

    .page-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
    }

    .page-kicker {
      margin: 0 0 6px;
      color: var(--sero-primary);
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .page-head h1 {
      margin: 0;
      color: var(--sero-text-primary);
      font-size: 1.65rem;
      font-weight: 800;
    }

    .page-subtitle {
      margin: 6px 0 0;
      color: var(--sero-text-secondary);
      font-size: 0.88rem;
    }

    .primary-action,
    .ghost-action {
      min-height: 38px;
      border-radius: 9px;
      border: 1px solid transparent;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 9px 14px;
      font-family: var(--sero-font);
      font-size: 0.85rem;
      font-weight: 800;
      cursor: pointer;
      transition: background var(--t-fast), border-color var(--t-fast), color var(--t-fast), box-shadow var(--t-fast), transform var(--t-fast);
    }

    .primary-action {
      background: var(--sero-primary);
      color: #fff;
      box-shadow: var(--shadow-sm);
    }

    .primary-action:hover {
      background: var(--sero-primary-dark);
      transform: translateY(-1px);
    }

    .ghost-action {
      background: var(--sero-card-bg);
      border-color: var(--sero-border);
      color: var(--sero-text-primary);
      white-space: nowrap;
    }

    .ghost-action:hover {
      background: var(--sero-surface-2);
      border-color: var(--sero-border-strong);
    }

    .primary-action .material-icons-round,
    .ghost-action .material-icons-round {
      font-size: 18px;
    }

    .add-menu-wrap {
      position: relative;
      display: inline-flex;
      align-items: center;
      overflow: visible;
      z-index: 60;
    }

    .add-chevron {
      transition: transform var(--t-fast, 150ms ease);
    }

    .add-chevron.is-open {
      transform: rotate(180deg);
    }

    .service-add-menu,
    .hotels-submenu,
    .row-action-menu {
      border: 1px solid var(--sero-border);
      border-radius: 10px;
      background: var(--sero-card-bg);
      box-shadow: var(--shadow-lg);
      z-index: 1000;
    }

    .service-add-menu,
    .hotels-submenu {
      min-width: 220px;
      padding: 8px;
    }

    .service-add-menu {
      position: absolute;
      top: calc(100% + 8px);
      inset-inline-end: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .service-menu-group {
      position: relative;
    }

    .hotels-submenu {
      position: absolute;
      top: 0;
      inset-inline-end: calc(100% + 8px);
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .service-menu-item {
      width: 100%;
      min-height: 40px;
      border: 1px solid transparent;
      border-radius: 8px;
      background: transparent;
      color: var(--sero-text-primary);
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 10px;
      font-family: var(--sero-font);
      font-size: 0.86rem;
      font-weight: 700;
      text-align: start;
      transition: background var(--t-fast), border-color var(--t-fast), color var(--t-fast);
    }

    .service-menu-item:hover,
    .service-menu-item:focus-visible,
    .service-menu-group.is-open > .service-menu-item {
      outline: none;
      background: var(--sero-bg-selected);
      border-color: var(--sero-border-light);
      color: var(--sero-primary-dark);
    }

    .menu-item-icon {
      width: 20px;
      color: var(--sero-primary);
      font-size: 18px;
      flex-shrink: 0;
      text-align: center;
    }

    .submenu-chevron {
      margin-inline-start: auto;
      color: var(--sero-text-muted);
      font-size: 18px;
      flex-shrink: 0;
    }

    .success-message {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      border: 1px solid var(--sero-success-border, #a3d9a5);
      border-radius: 8px;
      background: var(--sero-success-bg, #f0faf0);
      color: var(--sero-success, #2d7a2d);
      font-size: 0.82rem;
      font-weight: 800;
    }

    .summary-grid {
      display: grid;
      grid-template-columns: repeat(5, minmax(150px, 1fr));
      gap: 12px;
    }

    .summary-card {
      min-height: 106px;
      border: 1px solid var(--sero-border-light);
      border-radius: 10px;
      background: var(--sero-card-bg);
      box-shadow: var(--shadow-sm);
      display: flex;
      flex-direction: column;
      gap: 5px;
      padding: 16px;
    }

    .summary-card strong {
      color: var(--sero-text-primary);
      font-size: 1.55rem;
      font-weight: 850;
      line-height: 1.1;
    }

    .summary-label {
      color: var(--sero-text-secondary);
      font-size: 0.75rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .summary-note {
      color: var(--sero-text-muted);
      font-size: 0.76rem;
      font-weight: 600;
      margin-top: auto;
    }

    .summary-card.is-active { border-color: color-mix(in srgb, var(--sero-primary) 24%, var(--sero-border-light)); }
    .summary-card.is-draft { border-color: #f5d68b; }
    .summary-card.is-booked { border-color: #d6c5ff; }

    .inventory-shell {
      border: 1px solid var(--sero-border-light);
      border-radius: 12px;
      background: var(--sero-card-bg);
      box-shadow: var(--shadow-sm);
      overflow: visible;
    }

    .filter-bar {
      position: sticky;
      top: calc(var(--sero-topbar-height, 64px) + 8px);
      z-index: 30;
      display: grid;
      grid-template-columns: minmax(260px, 1.5fr) repeat(6, minmax(140px, 1fr)) auto;
      gap: 10px;
      align-items: center;
      padding: 14px;
      border-bottom: 1px solid var(--sero-border-light);
      background: color-mix(in srgb, var(--sero-card-bg) 92%, transparent);
      backdrop-filter: blur(10px);
      border-radius: 12px 12px 0 0;
    }

    .search-field {
      min-height: 34px;
      display: flex;
      align-items: center;
      gap: 8px;
      border: 1px solid var(--sero-border);
      border-radius: 9px;
      background: var(--sero-card-bg);
      padding: 0 10px;
    }

    .search-field .material-icons-round {
      color: var(--sero-text-muted);
      font-size: 17px;
      flex-shrink: 0;
    }

    .search-field input {
      width: 100%;
      min-width: 0;
      height: 34px;
      border: 0;
      outline: none;
      background: transparent;
      color: var(--sero-text-primary);
      font-family: var(--sero-font);
      font-size: 0.82rem;
      font-weight: 600;
    }

    .filter-control {
      min-width: 0;
    }

    .board-wrap {
      position: relative;
      padding: 14px;
      overflow: visible;
    }

    .board-scroll {
      overflow-x: auto;
      overflow-y: visible;
      padding-bottom: 4px;
    }

    .board-grid {
      min-width: 1180px;
      display: grid;
      grid-template-columns: minmax(280px, 1.75fr) 140px 170px 120px 150px 140px 150px 78px;
      gap: 14px;
      align-items: center;
    }

    .board-head {
      padding: 0 16px 8px;
      color: var(--sero-text-muted);
      font-size: 0.68rem;
      font-weight: 850;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .board-rows {
      display: flex;
      flex-direction: column;
      gap: 10px;
      min-width: 1180px;
    }

    .inventory-row {
      position: relative;
      min-height: 96px;
      border: 1px solid var(--sero-border-light);
      border-radius: 10px;
      background: var(--sero-card-bg);
      padding: 14px 16px;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
      transition: border-color var(--t-fast), box-shadow var(--t-fast), transform var(--t-fast), background var(--t-fast);
    }

    .inventory-row:hover,
    .inventory-row.row-menu-open {
      border-color: color-mix(in srgb, var(--sero-primary) 24%, var(--sero-border-light));
      box-shadow: 0 12px 28px rgba(15, 23, 42, 0.09);
      transform: translateY(-1px);
      z-index: 12;
    }

    .service-preview-cell {
      position: relative;
      display: grid;
      grid-template-columns: auto 42px 1fr;
      gap: 10px;
      align-items: center;
      min-width: 0;
    }

    .health-dot,
    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: currentColor;
      flex-shrink: 0;
    }

    .health-dot {
      align-self: start;
      margin-top: 6px;
      box-shadow: 0 0 0 3px color-mix(in srgb, currentColor 16%, transparent);
    }

    .health-healthy { color: #15803d; }
    .health-warning { color: #b45309; }
    .health-issue { color: #b91c1c; }

    .service-icon {
      width: 42px;
      height: 42px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--sero-surface-2);
      color: var(--sero-primary);
      flex-shrink: 0;
    }

    .service-icon .material-icons-round {
      font-size: 21px;
    }

    .service-copy {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .service-copy h2 {
      margin: 0;
      color: var(--sero-text-primary);
      font-size: 0.92rem;
      font-weight: 850;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .service-copy span,
    .coverage-cell span,
    .pricing-cell span,
    .update-cell span {
      color: var(--sero-text-secondary);
      font-size: 0.75rem;
      font-weight: 600;
    }

    .quick-preview {
      grid-column: 2 / 4;
      width: 100%;
      max-height: 0;
      border: 1px solid var(--sero-border);
      border-radius: 10px;
      background: var(--sero-card-bg);
      box-shadow: var(--shadow-sm);
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      opacity: 0;
      pointer-events: none;
      overflow: hidden;
      transform: translateY(-2px);
      transition: max-height var(--t-fast), margin-top var(--t-fast), opacity var(--t-fast), padding var(--t-fast), transform var(--t-fast);
      padding: 0 12px;
    }

    .inventory-row:hover .quick-preview {
      max-height: 150px;
      margin-top: 10px;
      opacity: 1;
      padding: 12px;
      pointer-events: auto;
      transform: translateY(0);
    }

    .quick-preview p {
      grid-column: 1 / -1;
      margin: 0;
      color: var(--sero-text-secondary);
      font-size: 0.76rem;
      line-height: 1.45;
    }

    .quick-label {
      display: block;
      color: var(--sero-text-muted);
      font-size: 0.65rem;
      font-weight: 800;
      text-transform: uppercase;
      margin-bottom: 3px;
    }

    .quick-preview strong,
    .coverage-cell strong,
    .capacity-cell strong,
    .update-cell strong {
      color: var(--sero-text-primary);
      font-size: 0.8rem;
      font-weight: 800;
    }

    .service-type-pill,
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: 1px solid transparent;
      border-radius: 999px;
      padding: 5px 10px;
      font-size: 0.74rem;
      font-weight: 850;
      white-space: nowrap;
    }

    .service-type-pill .material-icons-round {
      font-size: 15px;
    }

    .type-accommodation { background: #f0fdf4; color: #166534; }
    .type-transportation { background: #eff6ff; color: #1d4ed8; }
    .type-food { background: #fff7ed; color: #c2410c; }
    .type-tickets { background: #eef2ff; color: #4338ca; }
    .type-visa { background: #fdf2f8; color: #be185d; }
    .type-guide { background: #f5f3ff; color: #6d28d9; }

    .coverage-cell,
    .pricing-cell,
    .update-cell {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }

    .pricing-cell strong {
      color: var(--sero-text-primary);
      font-size: 1rem;
      font-weight: 900;
    }

    .status-active { background: #f0fdf4; color: #166534; border-color: #bbf7d0; }
    .status-pending { background: #fffbeb; color: #92400e; border-color: #fde68a; }
    .status-draft { background: #f8fafc; color: #475569; border-color: #cbd5e1; }
    .status-fully_booked { background: #f5f3ff; color: #6d28d9; border-color: #ddd6fe; }
    .status-expired { background: #fef2f2; color: #991b1b; border-color: #fecaca; }
    .status-inactive { background: #f3f4f6; color: #4b5563; border-color: #d1d5db; }

    .action-cell {
      position: relative;
      display: flex;
      justify-content: center;
      overflow: visible;
    }

    .row-action-trigger,
    .pager-btn {
      width: 34px;
      height: 34px;
      border: 1px solid var(--sero-border);
      border-radius: 9px;
      background: var(--sero-card-bg);
      color: var(--sero-text-secondary);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background var(--t-fast), color var(--t-fast), border-color var(--t-fast);
    }

    .row-action-trigger:hover,
    .row-action-trigger[aria-expanded='true'],
    .pager-btn:hover:not(:disabled) {
      background: var(--sero-bg-selected);
      border-color: color-mix(in srgb, var(--sero-primary) 24%, var(--sero-border));
      color: var(--sero-primary-dark);
    }

    .row-action-menu {
      position: absolute;
      top: calc(100% + 8px);
      inset-inline-end: 0;
      min-width: 172px;
      padding: 6px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .row-action-menu button {
      min-height: 36px;
      border: 0;
      border-radius: 8px;
      background: transparent;
      color: var(--sero-text-primary);
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      text-align: start;
      cursor: pointer;
      font-family: var(--sero-font);
      font-size: 0.8rem;
      font-weight: 700;
    }

    .row-action-menu button:hover {
      background: var(--sero-bg-hover);
    }

    .row-action-menu button.danger {
      color: var(--sero-danger, #b91c1c);
    }

    .row-action-menu .material-icons-round {
      font-size: 16px;
    }

    .loading-overlay {
      position: absolute;
      inset: 0;
      z-index: 20;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 10px;
      min-height: 240px;
      border-radius: 0 0 12px 12px;
      background: color-mix(in srgb, var(--sero-card-bg) 82%, transparent);
      color: var(--sero-text-secondary);
      font-size: 0.82rem;
      font-weight: 700;
    }

    .spinner {
      width: 34px;
      height: 34px;
      border: 3px solid var(--sero-border);
      border-top-color: var(--sero-primary);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin { to { transform: rotate(360deg); } }

    .empty-state {
      min-width: 1180px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      min-height: 240px;
      border: 1px dashed var(--sero-border);
      border-radius: 12px;
      background: var(--sero-surface-2);
      color: var(--sero-text-secondary);
      text-align: center;
    }

    .empty-state .material-icons-round {
      color: var(--sero-text-muted);
      font-size: 42px;
    }

    .empty-state h2 {
      margin: 0;
      color: var(--sero-text-primary);
      font-size: 1rem;
      font-weight: 850;
    }

    .empty-state p {
      margin: 0;
      font-size: 0.84rem;
    }

    .pagination-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding-top: 14px;
      margin-top: 14px;
      border-top: 1px solid var(--sero-border-light);
      color: var(--sero-text-secondary);
      font-size: 0.78rem;
      font-weight: 700;
    }

    .page-size,
    .page-controls {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .page-size app-sero-dropdown {
      width: 86px;
    }

    .pager-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    @media (max-width: 1280px) {
      .summary-grid {
        grid-template-columns: repeat(3, minmax(150px, 1fr));
      }

      .filter-bar {
        grid-template-columns: repeat(3, minmax(160px, 1fr));
      }

      .search-field {
        grid-column: 1 / -1;
      }
    }

    @media (max-width: 768px) {
      .my-services-page {
        padding: 16px;
      }

      .page-head {
        flex-direction: column;
      }

      .add-menu-wrap,
      .add-btn {
        width: 100%;
      }

      .add-btn {
        justify-content: center;
      }

      .service-add-menu {
        inset-inline-start: 0;
        inset-inline-end: auto;
        width: min(320px, calc(100vw - 32px));
      }

      .hotels-submenu {
        position: static;
        min-width: 0;
        margin-top: 4px;
        margin-inline-start: 26px;
        box-shadow: none;
        border-color: var(--sero-border-light);
        background: var(--sero-surface-2);
      }

      .summary-grid,
      .filter-bar {
        grid-template-columns: 1fr;
      }

      .filter-bar {
        position: relative;
        top: auto;
      }

      .pagination-bar {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `],
})
export class MyServicesPageComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly api = inject(MyServicesService);
  private readonly destroy$ = new Subject<void>();

  isLoading = signal(false);
  successMessage = signal('');
  isAddMenuOpen = signal(false);
  isHotelsSubmenuOpen = signal(false);
  openedActionMenuId = signal<string | null>(null);
  filters = signal<MyServiceFilterState>({ ...MY_SERVICE_DEFAULT_FILTERS });
  allServices = signal<MyService[]>([]);
  currentPage = signal(1);
  itemsPerPage = signal(10);

  serviceTypeOptions = MY_SERVICE_TYPE_OPTIONS;
  serviceCityOptions = MY_SERVICE_CITY_OPTIONS;
  statusOptions = MY_SERVICE_STATUS_OPTIONS;
  pricingRangeOptions = MY_SERVICE_PRICING_RANGE_OPTIONS;
  lifecycleOptions = MY_SERVICE_LIFECYCLE_OPTIONS;
  lastUpdatedOptions = MY_SERVICE_LAST_UPDATED_OPTIONS;
  itemsPerPageDropdownOptions = MY_SERVICE_ITEMS_PER_PAGE_OPTIONS.map((value) => ({ value, label: `${value}` }));

  totalPages = computed(() => Math.ceil(this.allServices().length / this.itemsPerPage()) || 1);
  pagedServices = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.allServices().slice(start, start + this.itemsPerPage());
  });
  summary = computed(() => {
    const services = this.allServices();
    const total = services.length;
    const totalPricing = services.reduce((sum, service) => sum + service.pricing.amount, 0);
    return {
      total,
      active: services.filter((service) => service.status === 'active').length,
      drafts: services.filter((service) => service.status === 'draft').length,
      fullyBooked: services.filter((service) => service.status === 'fully_booked').length,
      averagePricing: total ? Math.round(totalPricing / total) : 0,
    };
  });
  shownItemsLabel = computed(() => {
    const total = this.allServices().length;
    if (total === 0) return '0 من 0';
    const start = (this.currentPage() - 1) * this.itemsPerPage() + 1;
    const end = Math.min(start + this.itemsPerPage() - 1, total);
    return `${start}-${end} من ${total}`;
  });

  ngOnInit(): void {
    this.loadServices();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeAddMenu();
    this.openedActionMenuId.set(null);
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closeAddMenu();
    this.openedActionMenuId.set(null);
  }

  loadServices(): void {
    this.isLoading.set(true);
    this.api
      .getServices(this.filters())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (services) => {
          this.allServices.set(services);
          this.currentPage.set(1);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading services:', err);
          this.isLoading.set(false);
        },
      });
  }

  onSearchInput(event: Event): void {
    const searchText = (event.target as HTMLInputElement).value;
    this.filters.update((filters) => ({ ...filters, searchText }));
    this.search();
  }

  setFilter(key: keyof MyServiceFilterState, value: string): void {
    this.filters.update((filters) => ({ ...filters, [key]: value }));
    this.search();
  }

  search(): void {
    this.currentPage.set(1);
    this.loadServices();
  }

  clear(): void {
    this.filters.set({ ...MY_SERVICE_DEFAULT_FILTERS });
    this.currentPage.set(1);
    this.loadServices();
  }

  toggleAddMenu(event: Event): void {
    event.stopPropagation();
    const nextState = !this.isAddMenuOpen();
    this.isAddMenuOpen.set(nextState);
    if (!nextState) {
      this.isHotelsSubmenuOpen.set(false);
    }
    this.openedActionMenuId.set(null);
  }

  closeAddMenu(): void {
    this.isAddMenuOpen.set(false);
    this.isHotelsSubmenuOpen.set(false);
  }

  openHotelsSubmenu(): void {
    this.isHotelsSubmenuOpen.set(true);
  }

  closeHotelsSubmenu(): void {
    this.isHotelsSubmenuOpen.set(false);
  }

  toggleHotelsSubmenu(event: Event): void {
    event.stopPropagation();
    this.isHotelsSubmenuOpen.set(!this.isHotelsSubmenuOpen());
  }

  onAddButtonKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.isAddMenuOpen.set(true);
    }
  }

  onHotelsItemKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.isHotelsSubmenuOpen.set(true);
    }
  }

  navigateToAddService(route: string): void {
    this.closeAddMenu();
    this.router.navigateByUrl(route);
  }

  toggleActionMenu(serviceId: string, event: Event): void {
    event.stopPropagation();
    this.closeAddMenu();
    this.openedActionMenuId.set(this.openedActionMenuId() === serviceId ? null : serviceId);
  }

  viewService(service: MyService): void {
    this.openedActionMenuId.set(null);
    this.successMessage.set(`معاينة ${service.operational.title}`);
    setTimeout(() => this.successMessage.set(''), 2200);
  }

  openEditServiceDialog(service: MyService): void {
    this.openedActionMenuId.set(null);
    const dialogRef = this.dialog.open(MyServicesFormComponent, {
      width: '600px',
      direction: 'rtl',
      data: { mode: 'edit', service },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.successMessage.set('تم تحديث الخدمة بنجاح');
        this.loadServices();
        setTimeout(() => this.successMessage.set(''), 3000);
      }
    });
  }

  duplicateService(service: MyService): void {
    this.openedActionMenuId.set(null);
    const duplicate: MyService = {
      ...service,
      id: `SVC-COPY-${Date.now()}`,
      status: 'draft',
      operational: {
        ...service.operational,
        title: `${service.operational.title} Copy`,
        health: 'warning',
      },
      lastUpdate: {
        relative: 'Updated now',
        user: 'current-user',
      },
    };
    this.allServices.update((services) => [duplicate, ...services]);
    this.successMessage.set('تم نسخ الخدمة كمسودة');
    setTimeout(() => this.successMessage.set(''), 2500);
  }

  archiveService(service: MyService): void {
    this.openedActionMenuId.set(null);
    this.allServices.update((services) => services.map((item) => item.id === service.id ? { ...item, status: 'inactive' } : item));
    this.successMessage.set('تمت أرشفة الخدمة');
    setTimeout(() => this.successMessage.set(''), 2500);
  }

  deleteService(service: MyService): void {
    this.openedActionMenuId.set(null);
    if (confirm('هل تريد حذف هذه الخدمة؟')) {
      this.isLoading.set(true);
      this.api
        .deleteService(service.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (success) => {
            if (success) {
              this.successMessage.set('تم حذف الخدمة بنجاح');
              this.loadServices();
              setTimeout(() => this.successMessage.set(''), 3000);
            }
          },
          error: (err) => {
            console.error('Error deleting service:', err);
            this.isLoading.set(false);
          },
        });
    }
  }

  getServiceTypeLabel(value: string): string {
    return MY_SERVICE_TYPE_OPTIONS.find((option) => option.value === value)?.label || value;
  }

  getServiceCityLabel(value: string): string {
    return MY_SERVICE_CITY_OPTIONS.find((option) => option.value === value)?.label || value;
  }

  statusLabel(value: MyServiceStatus): string {
    return MY_SERVICE_STATUS_OPTIONS.find((option) => option.value === value)?.label || value;
  }

  statusClass(value: MyServiceStatus): string {
    return `status-${value}`;
  }

  typeClass(value: string): string {
    return `type-${value}`;
  }

  healthClass(value: MyServiceHealth): string {
    return `health-${value}`;
  }

  healthLabel(value: MyServiceHealth): string {
    const labels: Record<MyServiceHealth, string> = {
      healthy: 'Healthy',
      warning: 'Warning',
      issue: 'Issue',
    };
    return labels[value];
  }

  serviceIcon(value: string): string {
    const icons: Record<string, string> = {
      accommodation: 'hotel',
      transportation: 'directions_bus',
      food: 'restaurant',
      tickets: 'confirmation_number',
      visa: 'article',
      guide: 'tour',
    };
    return icons[value] ?? 'design_services';
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  onItemsPerPageChange(value: number): void {
    this.itemsPerPage.set(Number(value));
    this.currentPage.set(1);
  }
}
