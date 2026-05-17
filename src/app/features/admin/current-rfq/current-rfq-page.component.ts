import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { SeroDropdownComponent } from '../../../shared/components/sero-dropdown/sero-dropdown.component';
import { TableFilterHeaderComponent } from '../../../shared/components/table-filter-header/table-filter-header.component';
import {
  CURRENT_RFQ_STATS,
  RFQ_AGENT_OPTIONS,
  RFQ_DEFAULT_FILTERS,
  RFQ_HOTEL_OPTIONS,
  RfqFilterState,
  RfqOrder,
  RfqStatus,
} from './rfq-order.mock';
import { RfqOrdersService } from './rfq-orders.service';

const ITEMS_PER_PAGE_OPTIONS = [10, 20, 50];
type RfqTab = 'current' | 'closed';

@Component({
  selector: 'app-current-rfq-page',
  standalone: true,
  imports: [CommonModule, SeroDropdownComponent, TableFilterHeaderComponent],
  template: `
    <section class="current-rfq-page" dir="rtl">

      <header class="page-head">
        <h1>طلبات العروض</h1>
      </header>

      <!-- Tab Toggle -->
      <div class="rfq-tabs">
        <button
          type="button"
          class="rfq-tab"
          [class.rfq-tab--active]="activeTab === 'current'"
          (click)="switchTab('current')">
          <span class="material-icons-round rfq-tab-icon">list_alt</span>
          <div class="rfq-tab-body">
            <span class="rfq-tab-label">طلبات العروض الحالية</span>
            <span class="rfq-tab-count">{{ stats.currentCount }}</span>
          </div>
        </button>
        <button
          type="button"
          class="rfq-tab"
          [class.rfq-tab--active]="activeTab === 'closed'"
          (click)="switchTab('closed')">
          <span class="material-icons-round rfq-tab-icon">inventory</span>
          <div class="rfq-tab-body">
            <span class="rfq-tab-label">طلبات العروض المغلقة</span>
            <span class="rfq-tab-count">{{ stats.closedCount }}</span>
          </div>
        </button>
      </div>

      <!-- Main Table Card -->
      <section class="surface-card">
        <app-table-filter-header [(expanded)]="filtersExpanded">
          <div class="filters-grid">
            <div class="field-group">
              <label class="field-label">الفنادق</label>
              <app-sero-dropdown
                [options]="hotelOptions"
                [value]="filters.hotel"
                placeholder="كل الفنادق"
                (valueChange)="filters = { ...filters, hotel: $event }">
              </app-sero-dropdown>
            </div>
            <div class="field-group">
              <label class="field-label">الوكلاء</label>
              <app-sero-dropdown
                [options]="agentOptions"
                [value]="filters.agent"
                placeholder="كل الوكلاء"
                (valueChange)="filters = { ...filters, agent: $event }">
              </app-sero-dropdown>
            </div>
          </div>
        </app-table-filter-header>

        <div class="actions-bar">
          <div class="filters-actions">
            <button type="button" class="btn btn--primary btn--sm" (click)="search()">بحث</button>
            <button type="button" class="btn btn--secondary btn--sm" (click)="clear()">مسح</button>
          </div>
        </div>

        <div class="table-wrap" [class.is-transitioning]="isTableTransitioning">
          <table class="rfq-table">
            <thead>
              <tr>
                <th class="th-id">المعرّف</th>
                <th class="th-hotel">الفندق والعميل</th>
                <th class="th-guests">الضيوف</th>
                <th class="th-dates">التواريخ والليالي</th>
                <th class="th-status">الحالة</th>
                <th class="th-action">Details</th>
              </tr>
            </thead>
            <tbody>
              @if (pagedOrders.length === 0) {
                <tr>
                  <td colspan="6" class="empty-cell">لا توجد طلبات</td>
                </tr>
              } @else {
                @for (order of pagedOrders; track order.id) {
                  <tr>

                    <!-- المعرّف -->
                    <td class="id-cell">
                      <span class="rfq-id">#{{ order.id }}</span>
                    </td>

                    <!-- الفندق والعميل -->
                    <td class="hotel-cell">
                      <div class="hotel-client-wrap">
                        <div class="hotel-part">
                          <div class="hotel-avatar">
                            <span class="material-icons-round">apartment</span>
                          </div>
                          <div class="hotel-info">
                            <span class="hotel-name">{{ order.hotelName }}</span>
                            <span class="hotel-meta">{{ order.hotelType }} · {{ order.city }}</span>
                            <div class="room-pills">
                              @for (room of order.roomTypes; track room) {
                                <span class="room-pill">{{ room }}</span>
                              }
                            </div>
                          </div>
                        </div>
                        <div class="client-part">
                          <span class="client-name">{{ order.clientName }}</span>
                          <span class="client-country">
                            <span class="material-icons-round">public</span>
                            {{ order.clientCountry }}
                          </span>
                        </div>
                      </div>
                    </td>

                    <!-- الضيوف -->
                    <td class="guests-cell">
                      <div class="guests-block">
                        <span class="guest-row">
                          <span class="material-icons-round">person</span>
                          <span>{{ order.guestsCount }} ضيف</span>
                        </span>
                        <span class="provider-row">
                          <span class="material-icons-round">store</span>
                          <span>{{ order.providersCount }} مزود</span>
                        </span>
                      </div>
                    </td>

                    <!-- التواريخ والليالي -->
                    <td class="dates-cell">
                      <div class="dates-block">
                        <div class="date-range">
                          <span class="material-icons-round date-icon">calendar_today</span>
                          <span class="date-text">{{ order.checkIn | date:'d MMM y' }}</span>
                          <span class="date-sep">—</span>
                          <span class="date-text">{{ order.checkOut | date:'d MMM y' }}</span>
                        </div>
                        <span class="nights-badge">
                          <span class="material-icons-round">nights_stay</span>
                          {{ getNights(order.checkIn, order.checkOut) }} ليلة
                        </span>
                        <span class="requested-on">
                          طُلب في {{ order.requestedDate | date:'d MMM y' }}
                        </span>
                      </div>
                    </td>

                    <!-- الحالة -->
                    <td class="status-cell">
                      <span class="status-pill"
                        [class.status-pill--pending]="order.status === 'pending'"
                        [class.status-pill--closed]="order.status === 'closed'"
                        [class.status-pill--completed]="order.status === 'completed'">
                        {{ statusLabel(order.status) }}
                      </span>
                    </td>

                    <!-- Details -->
                    <td class="action-cell">
                      <button
                        type="button"
                        class="btn btn--details"
                        (click)="openDetails(order)">
                        <span class="material-icons-round">open_in_new</span>
                        <span>عرض التفاصيل</span>
                      </button>
                    </td>

                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <footer class="pagination-bar">
          <div class="pagination-left">
            <span class="page-size-label">عرض</span>
            <app-sero-dropdown
              class="page-size-dropdown"
              [options]="itemsPerPageDropdownOptions"
              [value]="itemsPerPage"
              size="sm"
              (valueChange)="onItemsPerPageChange($event)">
            </app-sero-dropdown>
            <span class="page-size-label">لكل صفحة</span>
          </div>
          <div class="pagination-right">
            <span class="page-info">{{ shownItemsLabel }}</span>
            <div class="pagination-controls">
              <button type="button" class="pager-btn" (click)="prevPage()" [disabled]="currentPage === 1">
                <span class="material-icons-round">chevron_right</span>
              </button>
              <button type="button" class="pager-btn" (click)="nextPage()" [disabled]="currentPage === totalPages">
                <span class="material-icons-round">chevron_left</span>
              </button>
            </div>
          </div>
        </footer>
      </section>

    </section>

    <!-- Details Modal -->
    @if (selectedOrder) {
      <div class="modal-backdrop" (click)="closeDetails()">
        <div class="modal-card" (click)="$event.stopPropagation()" dir="rtl">

          <header class="modal-head">
            <h2 class="modal-title">تفاصيل طلب العرض رقم #{{ selectedOrder.id }}</h2>
            <button type="button" class="modal-close-btn" (click)="closeDetails()" aria-label="إغلاق">
              <span class="material-icons-round">close</span>
            </button>
          </header>

          <div class="modal-body">
            <div class="detail-section">
              <h3 class="detail-section-title">معلومات الفندق</h3>
              <div class="detail-grid">
                <div class="detail-row">
                  <span class="detail-label">الفندق</span>
                  <span class="detail-value">{{ selectedOrder.hotelName }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">النوع</span>
                  <span class="detail-value">{{ selectedOrder.hotelType }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">المدينة</span>
                  <span class="detail-value">{{ selectedOrder.city }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">أنواع الغرف</span>
                  <span class="detail-value">{{ selectedOrder.roomTypes.join('، ') }}</span>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h3 class="detail-section-title">معلومات العميل</h3>
              <div class="detail-grid">
                <div class="detail-row">
                  <span class="detail-label">العميل</span>
                  <span class="detail-value">{{ selectedOrder.clientName }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">الدولة</span>
                  <span class="detail-value">{{ selectedOrder.clientCountry }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">عدد الضيوف</span>
                  <span class="detail-value">{{ selectedOrder.guestsCount }} ضيف</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">المزودون</span>
                  <span class="detail-value">{{ selectedOrder.providersCount }} مزود</span>
                </div>
              </div>
            </div>

            <div class="detail-section">
              <h3 class="detail-section-title">التواريخ</h3>
              <div class="detail-grid">
                <div class="detail-row">
                  <span class="detail-label">تاريخ الوصول</span>
                  <span class="detail-value">{{ selectedOrder.checkIn | date:'d MMM y' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">تاريخ المغادرة</span>
                  <span class="detail-value">{{ selectedOrder.checkOut | date:'d MMM y' }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">عدد الليالي</span>
                  <span class="detail-value">{{ getNights(selectedOrder.checkIn, selectedOrder.checkOut) }} ليلة</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">تاريخ الطلب</span>
                  <span class="detail-value">{{ selectedOrder.requestedDate | date:'d MMM y' }}</span>
                </div>
              </div>
            </div>

            <div class="detail-section detail-section--last">
              <div class="detail-row">
                <span class="detail-label">الحالة</span>
                <span class="status-pill"
                  [class.status-pill--pending]="selectedOrder.status === 'pending'"
                  [class.status-pill--closed]="selectedOrder.status === 'closed'"
                  [class.status-pill--completed]="selectedOrder.status === 'completed'">
                  {{ statusLabel(selectedOrder.status) }}
                </span>
              </div>
            </div>
          </div>

          <footer class="modal-foot">
            <button type="button" class="btn btn--secondary" (click)="closeDetails()">
              <span class="material-icons-round">arrow_back</span>
              <span>العودة</span>
            </button>
          </footer>

        </div>
      </div>
    }
  `,
  styles: [`
    .current-rfq-page {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .page-head h1 {
      font-size: 1rem;
      font-weight: 800;
      color: var(--sero-text-primary);
      margin: 0;
    }

    /* ── Tab Toggle ─────────────────────────── */
    .rfq-tabs {
      display: inline-flex;
      background: var(--sero-card-bg);
      border: 1px solid var(--sero-border-light);
      border-radius: 12px;
      box-shadow: var(--shadow-sm);
      padding: 5px;
      gap: 4px;
      align-self: flex-start;
    }

    .rfq-tab {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 20px;
      border: 1px solid transparent;
      border-radius: 9px;
      background: transparent;
      cursor: pointer;
      font-family: var(--sero-font);
      min-width: 220px;
      transition: background 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease;
    }

    .rfq-tab:hover:not(.rfq-tab--active) {
      background: var(--sero-surface-2);
      border-color: var(--sero-border);
    }

    .rfq-tab--active {
      background: var(--sero-primary);
      border-color: transparent;
      box-shadow: 0 2px 10px color-mix(in srgb, var(--sero-primary) 28%, transparent);
    }

    .rfq-tab-icon {
      font-size: 24px;
      flex-shrink: 0;
      transition: color 0.22s ease;
    }

    .rfq-tab:not(.rfq-tab--active) .rfq-tab-icon { color: var(--sero-text-secondary); }
    .rfq-tab--active .rfq-tab-icon { color: rgba(255, 255, 255, 0.85); }

    .rfq-tab-body {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
    }

    .rfq-tab-label {
      font-size: 0.72rem;
      font-weight: 700;
      white-space: nowrap;
      transition: color 0.22s ease;
    }

    .rfq-tab:not(.rfq-tab--active) .rfq-tab-label { color: var(--sero-text-secondary); }
    .rfq-tab--active .rfq-tab-label { color: rgba(255, 255, 255, 0.8); }

    .rfq-tab-count {
      font-size: 1.7rem;
      font-weight: 800;
      line-height: 1;
      transition: color 0.22s ease;
    }

    .rfq-tab:not(.rfq-tab--active) .rfq-tab-count { color: var(--sero-text-primary); }
    .rfq-tab--active .rfq-tab-count { color: #fff; }

    /* ── Surface Card ──────────────────────── */
    .surface-card {
      background: var(--sero-card-bg);
      border: 1px solid var(--sero-border-light);
      border-radius: 8px;
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 240px));
      gap: 12px;
      padding: 14px;
      border-bottom: 1px solid var(--sero-border-light);
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .field-label {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--sero-text-secondary);
    }

    .actions-bar {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      border-bottom: 1px solid var(--sero-border-light);
    }

    .filters-actions { display: flex; gap: 6px; }

    /* ── Buttons ───────────────────────────── */
    .btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border-radius: 8px;
      border: 1px solid transparent;
      font-family: var(--sero-font);
      font-weight: 700;
      cursor: pointer;
      transition: background var(--t-fast), border-color var(--t-fast), color var(--t-fast);
    }

    .btn--sm {
      min-height: 32px;
      padding: 0 12px;
      font-size: 0.76rem;
    }

    .btn--sm .material-icons-round { font-size: 15px; }

    .btn--primary { background: var(--sero-primary); color: var(--sero-card-bg); }
    .btn--primary:hover { background: var(--sero-primary-dark); }

    .btn--secondary {
      background: var(--sero-card-bg);
      color: var(--sero-text-primary);
      border-color: var(--sero-border);
    }

    .btn--secondary:hover { background: var(--sero-surface-2); border-color: var(--sero-border-strong); }

    .btn--details {
      min-height: 30px;
      padding: 0 10px;
      font-size: 0.72rem;
      background: color-mix(in srgb, var(--sero-primary) 8%, transparent);
      color: var(--sero-primary);
      border: 1px solid color-mix(in srgb, var(--sero-primary) 25%, transparent);
      border-radius: 6px;
      white-space: nowrap;
    }

    .btn--details .material-icons-round { font-size: 14px; }
    .btn--details:hover { background: color-mix(in srgb, var(--sero-primary) 14%, transparent); }

    /* ── Table ─────────────────────────────── */
    .table-wrap {
      overflow-x: auto;
      transition: opacity 0.18s ease;
    }

    .table-wrap.is-transitioning {
      opacity: 0;
      pointer-events: none;
    }

    .rfq-table {
      width: 100%;
      min-width: 940px;
      border-collapse: collapse;
    }

    .rfq-table thead tr { background: var(--sero-primary); }

    .rfq-table th {
      color: rgba(255, 255, 255, 0.92);
      font-size: 0.72rem;
      font-weight: 700;
      text-align: right;
      padding: 10px 14px;
      white-space: nowrap;
    }

    .rfq-table td {
      border-bottom: 1px solid var(--sero-border-light);
      color: var(--sero-text-primary);
      font-size: 0.8rem;
      text-align: right;
      padding: 12px 14px;
      vertical-align: middle;
    }

    .rfq-table tbody tr:hover { background: var(--sero-surface-2, #fbfcfa); }
    .rfq-table tbody tr:last-child td { border-bottom: none; }

    .th-id     { width: 60px; }
    .th-guests { width: 100px; }
    .th-dates  { width: 230px; }
    .th-status { width: 110px; text-align: center; }
    .th-action { width: 130px; text-align: center; }

    /* ── ID Cell ───────────────────────────── */
    .id-cell { width: 60px; }

    .rfq-id {
      font-weight: 800;
      font-size: 0.88rem;
      color: var(--sero-primary);
    }

    /* ── Hotel & Client Cell ───────────────── */
    .hotel-cell { min-width: 320px; }

    .hotel-client-wrap {
      display: flex;
      align-items: flex-start;
      gap: 0;
    }

    .hotel-part {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      flex: 1;
      min-width: 0;
      padding-left: 14px;
      border-left: 1px solid var(--sero-border-light);
    }

    .hotel-avatar {
      width: 38px;
      height: 38px;
      border-radius: 8px;
      background: var(--sero-bg-subtle);
      border: 1px solid var(--sero-border-light);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--sero-text-secondary);
      flex-shrink: 0;
    }

    .hotel-avatar .material-icons-round { font-size: 20px; }

    .hotel-info {
      display: flex;
      flex-direction: column;
      gap: 3px;
      min-width: 0;
    }

    .hotel-name {
      font-weight: 700;
      font-size: 0.82rem;
      color: var(--sero-text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .hotel-meta {
      font-size: 0.7rem;
      color: var(--sero-text-secondary);
      font-weight: 500;
    }

    .room-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-top: 2px;
    }

    .room-pill {
      display: inline-flex;
      align-items: center;
      padding: 2px 7px;
      border-radius: 999px;
      font-size: 0.65rem;
      font-weight: 700;
      background: color-mix(in srgb, var(--sero-primary) 8%, transparent);
      color: var(--sero-primary);
      border: 1px solid color-mix(in srgb, var(--sero-primary) 20%, transparent);
      white-space: nowrap;
    }

    .client-part {
      display: flex;
      flex-direction: column;
      gap: 4px;
      padding-right: 14px;
      min-width: 120px;
      flex-shrink: 0;
    }

    .client-name {
      font-weight: 700;
      font-size: 0.8rem;
      color: var(--sero-text-primary);
      white-space: nowrap;
    }

    .client-country {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 0.7rem;
      color: var(--sero-text-secondary);
      font-weight: 500;
    }

    .client-country .material-icons-round { font-size: 13px; }

    /* ── Guests Cell ───────────────────────── */
    .guests-cell { width: 100px; }

    .guests-block {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .guest-row,
    .provider-row {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--sero-text-primary);
      white-space: nowrap;
    }

    .guest-row .material-icons-round,
    .provider-row .material-icons-round {
      font-size: 15px;
      color: var(--sero-text-secondary);
    }

    /* ── Dates Cell ────────────────────────── */
    .dates-cell { width: 230px; }

    .dates-block {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .date-range {
      display: flex;
      align-items: center;
      gap: 5px;
      flex-wrap: wrap;
    }

    .date-icon {
      font-size: 14px;
      color: var(--sero-text-secondary);
    }

    .date-text {
      font-size: 0.76rem;
      font-weight: 700;
      color: var(--sero-text-primary);
      white-space: nowrap;
    }

    .date-sep {
      color: var(--sero-text-secondary);
      font-size: 0.76rem;
    }

    .nights-badge {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--sero-text-secondary);
    }

    .nights-badge .material-icons-round { font-size: 13px; }

    .requested-on {
      font-size: 0.68rem;
      color: var(--sero-text-secondary);
      font-weight: 500;
    }

    /* ── Status ────────────────────────────── */
    .status-cell { text-align: center; width: 110px; }
    .action-cell { text-align: center; width: 130px; }

    .status-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 0.68rem;
      font-weight: 800;
      border: 1px solid transparent;
      white-space: nowrap;
    }

    .status-pill--pending {
      background: var(--sero-warning-bg, #fffbeb);
      color: var(--sero-warning, #92400e);
      border-color: var(--sero-warning-border, #fcd34d);
    }

    .status-pill--closed {
      background: var(--sero-bg-subtle);
      color: var(--sero-text-secondary);
      border-color: var(--sero-border);
    }

    .status-pill--completed {
      background: var(--sero-success-bg, #f0faf0);
      color: var(--sero-success, #2d7a2d);
      border-color: var(--sero-success-border, #a3d9a5);
    }

    .empty-cell {
      text-align: center;
      color: var(--sero-text-secondary);
      font-size: 0.82rem;
      padding: 40px 14px;
    }

    /* ── Pagination ────────────────────────── */
    .pagination-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 10px 14px;
      border-top: 1px solid var(--sero-border-light);
      flex-wrap: wrap;
    }

    .pagination-left,
    .pagination-right { display: flex; align-items: center; gap: 8px; }

    .page-size-label {
      font-size: 0.76rem;
      font-weight: 600;
      color: var(--sero-text-secondary);
      white-space: nowrap;
    }

    .page-size-dropdown { width: 70px; }

    .page-info {
      font-size: 0.76rem;
      font-weight: 700;
      color: var(--sero-text-secondary);
      white-space: nowrap;
    }

    .pagination-controls { display: flex; gap: 4px; }

    .pager-btn {
      width: 30px;
      height: 30px;
      border: 1px solid var(--sero-border);
      border-radius: 6px;
      background: var(--sero-card-bg);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--sero-text-secondary);
      transition: background var(--t-fast), border-color var(--t-fast), color var(--t-fast);
    }

    .pager-btn:hover:not(:disabled) {
      background: var(--sero-surface-2);
      border-color: var(--sero-border-strong);
      color: var(--sero-text-primary);
    }

    .pager-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .pager-btn .material-icons-round { font-size: 18px; }

    /* ── Details Modal ─────────────────────── */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.35);
      z-index: 200;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      animation: backdropIn 0.18s ease-out;
    }

    @keyframes backdropIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }

    .modal-card {
      width: 100%;
      max-width: 560px;
      background: var(--sero-card-bg);
      border: 1px solid var(--sero-border-light);
      border-radius: 12px;
      box-shadow: var(--shadow-xl);
      display: flex;
      flex-direction: column;
      max-height: calc(100vh - 32px);
      animation: cardIn 0.2s ease-out;
    }

    @keyframes cardIn {
      from { opacity: 0; transform: scale(0.96) translateY(-8px); }
      to   { opacity: 1; transform: scale(1)    translateY(0);     }
    }

    .modal-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 14px 16px;
      border-bottom: 1px solid var(--sero-border-light);
      flex-shrink: 0;
    }

    .modal-title {
      font-size: 0.92rem;
      font-weight: 800;
      color: var(--sero-text-primary);
      margin: 0;
    }

    .modal-close-btn {
      width: 30px;
      height: 30px;
      border: 1px solid var(--sero-border);
      border-radius: 6px;
      background: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--sero-text-secondary);
      transition: background var(--t-fast), color var(--t-fast);
    }

    .modal-close-btn:hover { background: var(--sero-surface-2); color: var(--sero-text-primary); }
    .modal-close-btn .material-icons-round { font-size: 18px; }

    .modal-body {
      padding: 16px;
      overflow-y: auto;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .detail-section {
      border: 1px solid var(--sero-border-light);
      border-radius: 8px;
      overflow: hidden;
    }

    .detail-section--last { border: none; }

    .detail-section-title {
      font-size: 0.72rem;
      font-weight: 800;
      color: var(--sero-text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin: 0;
      padding: 8px 12px;
      background: var(--sero-bg-subtle);
      border-bottom: 1px solid var(--sero-border-light);
    }

    .detail-grid {
      display: flex;
      flex-direction: column;
    }

    .detail-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 9px 12px;
      border-bottom: 1px solid var(--sero-border-light);
    }

    .detail-row:last-child { border-bottom: none; }

    .detail-section--last .detail-row {
      border: 1px solid var(--sero-border-light);
      border-radius: 8px;
      padding: 10px 12px;
    }

    .detail-label {
      font-size: 0.74rem;
      font-weight: 700;
      color: var(--sero-text-secondary);
      flex-shrink: 0;
    }

    .detail-value {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--sero-text-primary);
      text-align: left;
    }

    .modal-foot {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid var(--sero-border-light);
      flex-shrink: 0;
    }

    .btn .material-icons-round { font-size: 16px; }

    /* ── Responsive ────────────────────────── */
    @media (max-width: 600px) {
      .rfq-tabs { align-self: stretch; }
      .rfq-tab { min-width: 0; flex: 1; padding: 10px 12px; }
      .rfq-tab-count { font-size: 1.3rem; }
      .filters-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class CurrentRfqPageComponent implements OnDestroy {
  private readonly service = inject(RfqOrdersService);

  readonly stats = CURRENT_RFQ_STATS;
  readonly hotelOptions = RFQ_HOTEL_OPTIONS;
  readonly agentOptions = RFQ_AGENT_OPTIONS;
  readonly itemsPerPageDropdownOptions = ITEMS_PER_PAGE_OPTIONS.map((n) => ({ value: n, label: String(n) }));

  filters: RfqFilterState = { ...RFQ_DEFAULT_FILTERS };
  filtersExpanded = true;

  activeTab: RfqTab = 'current';
  isTableTransitioning = false;
  private tabTimer: ReturnType<typeof setTimeout> | null = null;

  private allOrders: RfqOrder[] = this.service.getAllCurrent();
  currentPage = 1;
  itemsPerPage = ITEMS_PER_PAGE_OPTIONS[0];

  selectedOrder: RfqOrder | null = null;

  get pagedOrders(): RfqOrder[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.allOrders.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.allOrders.length / this.itemsPerPage));
  }

  get shownItemsLabel(): string {
    const total = this.allOrders.length;
    if (total === 0) return '0';
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, total);
    return `${start} – ${end} من ${total}`;
  }

  getNights(checkIn: string, checkOut: string): number {
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
  }

  statusLabel(status: RfqStatus): string {
    if (status === 'pending') return 'قيد الانتظار';
    if (status === 'completed') return 'مكتمل';
    return 'مغلق';
  }

  switchTab(tab: RfqTab): void {
    if (tab === this.activeTab) return;
    this.isTableTransitioning = true;
    this.tabTimer = setTimeout(() => {
      this.activeTab = tab;
      this.allOrders = tab === 'current'
        ? this.service.getAllCurrent()
        : this.service.getAllClosed();
      this.filters = { ...RFQ_DEFAULT_FILTERS };
      this.currentPage = 1;
      this.isTableTransitioning = false;
      this.tabTimer = null;
    }, 160);
  }

  search(): void {
    this.allOrders = this.activeTab === 'current'
      ? this.service.filterCurrent(this.filters)
      : this.service.filterClosed(this.filters);
    this.currentPage = 1;
  }

  clear(): void {
    this.filters = { ...RFQ_DEFAULT_FILTERS };
    this.allOrders = this.activeTab === 'current'
      ? this.service.getAllCurrent()
      : this.service.getAllClosed();
    this.currentPage = 1;
    this.itemsPerPage = ITEMS_PER_PAGE_OPTIONS[0];
  }

  openDetails(order: RfqOrder): void {
    this.selectedOrder = { ...order };
  }

  closeDetails(): void {
    this.selectedOrder = null;
  }

  prevPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  onItemsPerPageChange(count: number): void {
    this.itemsPerPage = count;
    this.currentPage = 1;
  }

  ngOnDestroy(): void {
    if (this.tabTimer) clearTimeout(this.tabTimer);
  }
}
