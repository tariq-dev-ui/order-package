import { ChangeDetectionStrategy, Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TablerIconComponent } from 'angular-tabler-icons';
import { SeroDropdownComponent, SeroDropdownOption } from '../../shared/components/sero-dropdown/sero-dropdown.component';
import { PaginationComponent } from '../../features/master/packages/components/pagination.component';
import { OrdersService } from './orders.service';
import {
  AGENT_STATUS_META,
  AgentStatus,
  OPERATION_STATUS_META,
  OperationStatus,
  ORDER_TYPE_META,
  OrderRow,
  OrderTypeFilter,
  PAYMENT_STATUS_META,
  PaymentStatus,
} from './orders.model';

type TypeCounts = Record<string, number>;

@Component({
  selector: 'app-orders',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TranslateModule, TablerIconComponent, SeroDropdownComponent, PaginationComponent],
  template: `
    <section class="op-page">
      <div class="page-header">
        <div class="header-content">
          <div class="header-info">
            <div class="page-icon">
              <tabler-icon name="shopping-cart"></tabler-icon>
            </div>
            <div class="header-text">
              <h1 class="page-title">{{ 'orders.title' | translate }}</h1>
              <p class="page-description">{{ 'orders.subtitle' | translate }}</p>
            </div>
          </div>
          <div class="header-actions">
            <button
              type="button"
              class="action-btn new-request-btn"
              (click)="createNewRequest()">
              <tabler-icon name="plus"></tabler-icon>
              <span>طلب جديد</span>
            </button>
          </div>
        </div>
      </div>

      <div class="statistics-section">
        <div class="statistics-grid">
          @for (meta of typeMeta; track meta.type) {
            <button
              type="button"
              class="stat-card"
              [class.active]="activeType() === meta.type"
              (click)="selectType(meta.type)">
              <div class="stat-icon" [ngClass]="'stat-icon--' + meta.type">
                <tabler-icon [name]="tablerIconForType(meta.type)"></tabler-icon>
              </div>
              <div class="stat-content">
                <span class="stat-value">{{ countFor(meta.type) }}</span>
                <span class="stat-label">{{ meta.labelKey | translate }}</span>
              </div>
            </button>
          }
        </div>
      </div>

      <div class="filters-section">
        <div class="filters-container">
          <div class="filters-header-row">
            <div class="filter-button-wrapper">
              <button
                type="button"
                class="filter-main-btn"
                [class.is-open]="showAdvancedFilters()"
                (click)="toggleAdvancedFilters()">
                <tabler-icon name="filter"></tabler-icon>
                <span>{{ 'orders.actions.filter' | translate }}</span>
                @if (activeFilterCount() > 0) {
                  <span class="filter-badge">{{ activeFilterCount() }}</span>
                }
              </button>
            </div>

            <div class="search-field-wrapper">
              <div class="search-icon">
                <tabler-icon name="search"></tabler-icon>
              </div>
              <div class="search-divider"></div>
              <input
                type="text"
                class="search-input"
                [placeholder]="'orders.actions.searchPlaceholder' | translate"
                [value]="searchText()"
                (input)="onSearchInput($event)" />
              @if (searchText()) {
                <button
                  type="button"
                  class="search-clear-btn"
                  [attr.aria-label]="'orders.actions.clearFilters' | translate"
                  (click)="clearSearch()">
                  <tabler-icon name="x"></tabler-icon>
                </button>
              }
            </div>

            <button
              type="button"
              class="export-btn"
              (click)="exportCsv()">
              <tabler-icon name="download"></tabler-icon>
              <span>{{ 'orders.actions.export' | translate }}</span>
            </button>
          </div>

          @if (showAdvancedFilters()) {
            <div class="active-filters-display op-active-filters">
              <div class="active-filter-item">
                <div class="filter-item-header">
                  <tabler-icon name="credit-card"></tabler-icon>
                  <span class="filter-item-label">{{ 'orders.filters.paymentStatus' | translate }}</span>
                </div>
                <div class="filter-item-input">
                  <app-sero-dropdown
                    [options]="paymentOptions"
                    [value]="paymentFilter()"
                    [placeholderKey]="'orders.filters.any'"
                    (valueChange)="onPaymentFilterChange($event)">
                  </app-sero-dropdown>
                </div>
              </div>

              <div class="active-filter-item">
                <div class="filter-item-header">
                  <tabler-icon name="progress-check"></tabler-icon>
                  <span class="filter-item-label">{{ 'orders.filters.operationStatus' | translate }}</span>
                </div>
                <div class="filter-item-input">
                  <app-sero-dropdown
                    [options]="operationOptions"
                    [value]="operationFilter()"
                    [placeholderKey]="'orders.filters.any'"
                    (valueChange)="onOperationFilterChange($event)">
                  </app-sero-dropdown>
                </div>
              </div>

              <div class="active-filter-item">
                <div class="filter-item-header">
                  <tabler-icon name="user-check"></tabler-icon>
                  <span class="filter-item-label">{{ 'orders.filters.agentStatus' | translate }}</span>
                </div>
                <div class="filter-item-input">
                  <app-sero-dropdown
                    [options]="agentStatusOptions"
                    [value]="agentStatusFilter()"
                    [placeholderKey]="'orders.filters.any'"
                    (valueChange)="onAgentStatusFilterChange($event)">
                  </app-sero-dropdown>
                </div>
              </div>

              @if (activeFilterCount() > 0) {
                <button
                  type="button"
                  class="clear-all-filters-btn"
                  (click)="clearAdvancedFilters()">
                  <tabler-icon name="trash"></tabler-icon>
                  <span>{{ 'orders.actions.clearFilters' | translate }}</span>
                </button>
              }
            </div>
          }
        </div>
      </div>

      <div class="table-section">
        <div class="table-card">
          <div class="table-container">
            <table class="orders-table">
              <thead>
                <tr>
                  <th>{{ 'orders.columns.type' | translate }}</th>
                  <th>{{ 'orders.columns.orderNo' | translate }}</th>
                  <th>{{ 'orders.columns.orderDate' | translate }}</th>
                  <th>{{ 'orders.columns.agent' | translate }}</th>
                  <th>{{ 'orders.columns.totalPrice' | translate }}</th>
                  <th>{{ 'orders.columns.paid' | translate }}</th>
                  <th>{{ 'orders.columns.remaining' | translate }}</th>
                  <th>{{ 'orders.columns.paymentStatus' | translate }}</th>
                  <th>{{ 'orders.columns.operationStatus' | translate }}</th>
                  <th>{{ 'orders.columns.agentStatus' | translate }}</th>
                  <th>{{ 'orders.columns.actions' | translate }}</th>
                </tr>
              </thead>

              <tbody>
                @if (isLoading()) {
                  <tr>
                    <td colspan="11" class="op-state-cell">
                      <div class="op-spinner"></div>
                    </td>
                  </tr>
                } @else if (rows().length === 0) {
                  <tr>
                    <td colspan="11" class="op-state-cell">
                      <div class="empty-state">
                        <tabler-icon name="shopping-cart-off"></tabler-icon>
                        <h3>{{ 'orders.empty.title' | translate }}</h3>
                        <p>{{ 'orders.empty.description' | translate }}</p>
                      </div>
                    </td>
                  </tr>
                } @else {
                  @for (row of rows(); track row.id) {
                    <tr class="order-row">
                      <td>
                        <span class="booking-type-badge">
                          <tabler-icon [name]="tablerIconForType(row.type)"></tabler-icon>
                          {{ typeLabelKey(row.type) | translate }}
                        </span>
                      </td>
                      <td>
                        <span class="cell-ref">{{ row.orderNo }}</span>
                      </td>
                      <td>
                        <span class="cell-date">
                          <span>{{ row.orderDate | date:'dd MMM yyyy' }}</span>
                          <span class="cell-time">{{ row.orderDate | date:'HH:mm' }}</span>
                        </span>
                      </td>
                      <td>
                        <span class="cell-name">{{ row.agent }}</span>
                      </td>
                      <td>
                        <span class="amount-currency-wrap">
                          <span class="amount-value">{{ row.totalPrice | number:'1.2-2' }}</span>
                          <span class="sar-symbol sar-sm" aria-hidden="true">R</span>
                        </span>
                      </td>
                      <td>
                        <span class="amount-currency-wrap">
                          <span class="amount-value paid-value">{{ row.paid | number:'1.2-2' }}</span>
                          <span class="sar-symbol sar-sm" aria-hidden="true">R</span>
                        </span>
                      </td>
                      <td>
                        <span class="amount-currency-wrap">
                          <span class="amount-value remaining-value">{{ row.remaining | number:'1.2-2' }}</span>
                          <span class="sar-symbol sar-sm" aria-hidden="true">R</span>
                        </span>
                      </td>
                      <td>
                        <span class="status-badge status-{{ paymentMeta(row.paymentStatus).cls }}">
                          {{ paymentMeta(row.paymentStatus).labelKey | translate }}
                        </span>
                      </td>
                      <td>
                        <span class="status-badge status-{{ operationMeta(row.operationStatus).cls }}">
                          {{ operationMeta(row.operationStatus).labelKey | translate }}
                        </span>
                      </td>
                      <td>
                        <span class="status-badge status-{{ agentStatusMeta(row.agentStatus).cls }}">
                          {{ agentStatusMeta(row.agentStatus).labelKey | translate }}
                        </span>
                      </td>
                      <td>
                        <div class="pms-actions-cell">
                          <button
                            type="button"
                            class="op-icon-btn btn-view"
                            [attr.aria-label]="'orders.actionsMenu.view' | translate"
                            [title]="'orders.actionsMenu.view' | translate"
                            (click)="viewRow(row)">
                            <tabler-icon name="eye"></tabler-icon>
                          </button>
                          <button
                            type="button"
                            class="op-icon-btn btn-edit"
                            [attr.aria-label]="'orders.actionsMenu.edit' | translate"
                            [title]="'orders.actionsMenu.edit' | translate"
                            (click)="editRow(row)">
                            <tabler-icon name="edit"></tabler-icon>
                          </button>
                          <button
                            type="button"
                            class="op-icon-btn btn-print"
                            [attr.aria-label]="'orders.actionsMenu.print' | translate"
                            [title]="'orders.actionsMenu.print' | translate"
                            (click)="printRow(row)">
                            <tabler-icon name="printer"></tabler-icon>
                          </button>
                          <div class="op-more-wrap">
                            <button
                              type="button"
                              class="op-icon-btn btn-more"
                              [attr.aria-label]="'orders.actionsMenu.more' | translate"
                              [title]="'orders.actionsMenu.more' | translate"
                              (click)="toggleMoreMenu(row.id, $event)">
                              <tabler-icon name="dots-vertical"></tabler-icon>
                            </button>
                            @if (openMoreMenuId() === row.id) {
                              <div class="op-more-menu">
                                <button type="button" (click)="duplicateRow(row)">
                                  <tabler-icon name="copy"></tabler-icon>
                                  {{ 'orders.actionsMenu.duplicate' | translate }}
                                </button>
                                <button type="button" (click)="downloadPdf(row)">
                                  <tabler-icon name="file-type-pdf"></tabler-icon>
                                  {{ 'orders.actionsMenu.downloadPdf' | translate }}
                                </button>
                                <button type="button" (click)="viewStatusLog(row)">
                                  <tabler-icon name="history"></tabler-icon>
                                  {{ 'orders.actionsMenu.statusLog' | translate }}
                                </button>
                                <button type="button" class="op-more-menu-danger" (click)="deleteRow(row)">
                                  <tabler-icon name="trash"></tabler-icon>
                                  {{ 'orders.actionsMenu.delete' | translate }}
                                </button>
                              </div>
                            }
                          </div>
                        </div>
                      </td>
                    </tr>
                  }
                }
              </tbody>

              @if (!isLoading() && rows().length > 0) {
                <tfoot>
                  <tr class="op-footer-row">
                    <td class="op-footer-label" colspan="4">{{ 'orders.footer.total' | translate }}</td>
                    <td>
                      <span class="amount-currency-wrap">
                        <span class="amount-value">{{ footerTotal() | number:'1.2-2' }}</span>
                        <span class="sar-symbol sar-sm" aria-hidden="true">R</span>
                      </span>
                    </td>
                    <td>
                      <span class="amount-currency-wrap">
                        <span class="amount-value paid-value">{{ footerPaid() | number:'1.2-2' }}</span>
                        <span class="sar-symbol sar-sm" aria-hidden="true">R</span>
                      </span>
                    </td>
                    <td>
                      <span class="amount-currency-wrap">
                        <span class="amount-value remaining-value">{{ footerRemaining() | number:'1.2-2' }}</span>
                        <span class="sar-symbol sar-sm" aria-hidden="true">R</span>
                      </span>
                    </td>
                    <td>
                      <span class="status-badge status-{{ footerPaymentMeta().cls }}">
                        {{ footerPaymentMeta().labelKey | translate }}
                      </span>
                    </td>
                    <td colspan="3"></td>
                  </tr>
                </tfoot>
              }
            </table>
          </div>
        </div>

        <div class="op-pagination">
          <pkg-pagination
            [currentPage]="page()"
            [totalPages]="totalPages()"
            (pageChange)="setPage($event)" />
        </div>
      </div>
    </section>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100%;
      background: var(--app-bg);
      font-family: var(--sero-font, 'Noto Kufi Arabic', sans-serif);
    }

    .op-page {
      min-height: 100vh;
      background: var(--app-bg);
    }

    .op-page .page-header {
      display: block;
      width: 100%;
      padding: 1.5rem 0;
      margin: 0 0 2rem;
      border-bottom: 1px solid var(--app-border);
      background: var(--app-card-bg);
      transition: background-color 0.3s ease, border-color 0.3s ease;
    }

    .op-page .page-header .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1.5rem;
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 1.5rem;
      flex-wrap: wrap;
    }

    .op-page .page-header .header-info {
      display: flex;
      align-items: center;
      flex: 1;
      gap: 1rem;
      min-width: 240px;
    }

    .op-page .page-header .page-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      flex-shrink: 0;
      border-radius: 0.75rem;
      background: var(--app-heading);
      color: white;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
    }

    .op-page .page-header .page-icon tabler-icon {
      width: 24px;
      height: 24px;
    }

    .op-page .page-header .header-text {
      display: flex;
      flex: 1;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.25rem;
      text-align: start;
    }

    .op-page .page-header .page-title {
      margin: 0;
      color: var(--app-text-primary);
      font-size: 1.75rem;
      font-weight: 700;
      line-height: 1.2;
    }

    .op-page .page-header .page-description {
      margin: 0;
      color: var(--app-text-secondary);
      font-size: 0.875rem;
      line-height: 1.4;
    }

    .op-page .page-header .header-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 0.5rem;
      flex-shrink: 0;
      margin-inline-start: auto;
    }

    .new-request-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
      min-height: 36px;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 0.375rem;
      background: var(--sero-linear-gradient, linear-gradient(135deg, #3a472a, #627b47));
      color: white;
      box-shadow: 0 2px 8px rgba(58, 71, 42, 0.3);
      font-size: 0.875rem;
      font-weight: 500;
      white-space: nowrap;
      transition: all 0.3s ease;
    }

    .new-request-btn:hover {
      background: var(--sero-linear-gradient-hover, linear-gradient(135deg, #2d3821, #556842));
      box-shadow: 0 4px 12px rgba(58, 71, 42, 0.4);
      transform: translateY(-1px);
    }

    .new-request-btn tabler-icon {
      width: 16px;
      height: 16px;
    }

    .statistics-section {
      max-width: 1400px;
      margin: 0 auto 2rem;
      padding: 0 1.5rem;
    }

    .statistics-grid {
      display: grid;
      grid-template-columns: repeat(7, minmax(154px, 1fr));
      gap: 0.75rem;
      overflow-x: auto;
      overflow-y: hidden;
      padding-bottom: 0.125rem;
      scrollbar-width: thin;
      scrollbar-color: color-mix(in srgb, var(--app-heading) 26%, transparent) transparent;
    }

    .statistics-grid::-webkit-scrollbar {
      height: 5px;
    }

    .statistics-grid::-webkit-scrollbar-track {
      background: transparent;
    }

    .statistics-grid::-webkit-scrollbar-thumb {
      border-radius: 999px;
      background: color-mix(in srgb, var(--app-heading) 26%, transparent);
    }

    .stat-card {
      min-height: 58px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      gap: 0.55rem;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--app-border);
      border-radius: 0.5rem;
      background: var(--app-card-bg);
      color: var(--app-text-primary);
      cursor: pointer;
      transition: background 0.3s ease, border-color 0.3s ease, transform 0.3s ease, box-shadow 0.3s ease;
    }

    .stat-card:hover {
      border-color: var(--app-heading);
      background: var(--app-bg);
      box-shadow: 0 2px 8px color-mix(in srgb, var(--app-text-primary) 8%, transparent);
      transform: translateY(-2px);
    }

    .stat-card.active {
      background: var(--app-heading);
      border-color: var(--app-heading);
      color: var(--app-card-bg);
      box-shadow: 0 4px 12px color-mix(in srgb, var(--app-heading) 30%, transparent);
    }

    .stat-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.8rem;
      height: 1.8rem;
      border: 1px solid color-mix(in srgb, var(--app-heading) 14%, transparent);
      border-radius: 0.5rem;
      background: color-mix(in srgb, var(--app-heading) 8%, transparent);
      color: var(--app-heading);
      flex: 0 0 auto;
      transition: background 0.3s ease, border-color 0.3s ease, color 0.3s ease;
    }

    .stat-icon tabler-icon,
    .stat-icon i-tabler {
      width: 0.95rem;
      height: 0.95rem;
    }

    .stat-icon--transportation,
    .stat-icon--ticket {
      border-color: color-mix(in srgb, var(--sero-info) 18%, transparent);
      background: color-mix(in srgb, var(--sero-info) 8%, transparent);
      color: var(--sero-info);
    }

    .stat-icon--visa,
    .stat-icon--custom {
      border-color: color-mix(in srgb, var(--sero-warning) 18%, transparent);
      background: color-mix(in srgb, var(--sero-warning) 8%, transparent);
      color: var(--sero-warning);
    }

    .stat-icon--catering {
      border-color: color-mix(in srgb, var(--sero-success) 18%, transparent);
      background: color-mix(in srgb, var(--sero-success) 8%, transparent);
      color: var(--sero-success);
    }

    .stat-card.active .stat-icon,
    .stat-card.active .stat-label,
    .stat-card.active .stat-value {
      color: var(--app-card-bg);
    }

    .stat-content {
      min-width: 0;
      display: flex;
      flex-direction: row;
      align-items: baseline;
      justify-content: flex-start;
      gap: 0.5rem;
      flex: 1;
      width: auto;
    }

    .stat-value {
      min-width: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      border: none;
      border-radius: 0;
      background: transparent;
      color: var(--app-heading);
      font-size: 1.12rem;
      font-weight: 800;
      line-height: 1.1;
      font-variant-numeric: tabular-nums;
      transition: all 0.3s ease;
    }

    .stat-card.active .stat-value {
      background: transparent;
      border-color: transparent;
    }

    .stat-card.active .stat-icon {
      border-color: color-mix(in srgb, var(--app-card-bg) 30%, transparent);
      background: color-mix(in srgb, var(--app-card-bg) 16%, transparent);
    }

    .stat-label {
      min-width: 0;
      color: var(--app-text-secondary);
      font-size: 0.8rem;
      font-weight: 650;
      line-height: 1.25;
      white-space: nowrap;
      overflow: visible;
      text-align: start;
      overflow-wrap: normal;
      transition: color 0.3s ease;
    }

    .filters-section {
      max-width: 1400px;
      margin: 0 auto 2rem;
      padding: 0 1.5rem;
    }

    .filters-container {
      position: relative;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
      border: 1px solid var(--app-border);
      border-radius: 0.5rem;
      background: var(--app-card-bg);
      transition: all 0.3s ease;
    }

    .filters-header-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-wrap: nowrap;
      width: 100%;
    }

    .filter-button-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      flex-shrink: 0;
      order: 1;
      white-space: nowrap;
    }

    .filter-main-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      min-width: fit-content;
      height: 42px;
      padding: 0.75rem 1.25rem;
      border: none;
      border-radius: 0.5rem;
      background: var(--app-heading);
      color: white;
      box-shadow: 0 2px 4px rgba(58, 71, 42, 0.15);
      font-size: 0.875rem;
      font-weight: 600;
      white-space: nowrap;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .filter-main-btn tabler-icon {
      width: 18px;
      height: 18px;
    }

    .filter-main-btn:hover,
    .filter-main-btn.is-open {
      background: #4a5a2e;
      box-shadow: 0 4px 8px rgba(58, 71, 42, 0.2);
      transform: translateY(-1px);
    }

    .filter-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 20px;
      height: 20px;
      padding: 0 0.375rem;
      margin-inline-start: 0.25rem;
      border-radius: 10px;
      background: white;
      color: var(--app-heading);
      font-size: 0.75rem;
      font-weight: 700;
    }

    .search-field-wrapper {
      position: relative;
      order: 2;
      display: flex;
      align-items: center;
      flex: 1;
      min-width: 200px;
      max-width: 100%;
      gap: 0;
      border: 1.5px solid var(--app-border);
      border-radius: 0.5rem;
      background: var(--app-bg);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .search-field-wrapper:hover {
      border-color: var(--app-heading);
      background: var(--app-card-bg);
      box-shadow: 0 2px 6px rgba(58, 71, 42, 0.08);
    }

    .search-field-wrapper:focus-within {
      border-color: var(--app-heading);
      background: var(--app-card-bg);
      box-shadow: 0 0 0 3px rgba(58, 71, 42, 0.12), 0 2px 8px rgba(58, 71, 42, 0.1);
    }

    .search-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      min-width: 42px;
      height: 42px;
      color: var(--app-text-secondary);
      pointer-events: none;
      transition: all 0.3s ease;
    }

    .search-icon tabler-icon {
      width: 18px;
      height: 18px;
    }

    .search-divider {
      width: 1px;
      height: 24px;
      flex-shrink: 0;
      background: var(--app-border);
      transition: all 0.3s ease;
    }

    .search-field-wrapper:hover .search-icon,
    .search-field-wrapper:focus-within .search-icon {
      color: var(--app-heading);
    }

    .search-field-wrapper:hover .search-divider,
    .search-field-wrapper:focus-within .search-divider {
      background: var(--app-heading);
    }

    .search-input {
      flex: 1;
      width: 100%;
      height: 42px;
      min-width: 0;
      padding: 0.75rem 1rem;
      border: none !important;
      outline: none !important;
      background: transparent !important;
      box-shadow: none !important;
      color: var(--app-text-primary) !important;
      font-family: inherit;
      font-size: 0.875rem;
      font-weight: 400;
    }

    .search-input::placeholder {
      color: var(--app-text-secondary);
      opacity: 0.7;
      font-weight: 400;
    }

    .search-input:focus::placeholder {
      opacity: 0.5;
    }

    .search-clear-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      margin-inline-end: 0.35rem;
      border: none;
      border-radius: 0.375rem;
      background: transparent;
      color: var(--app-text-secondary);
      transition: background 0.2s ease, color 0.2s ease;
    }

    .search-clear-btn:hover {
      background: color-mix(in srgb, var(--app-heading) 8%, transparent);
      color: var(--app-heading);
    }

    .search-clear-btn tabler-icon {
      width: 14px;
      height: 14px;
    }

    .export-btn {
      order: 3;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      flex-shrink: 0;
      min-width: fit-content;
      height: 42px;
      padding: 0.75rem 1.25rem;
      border: 1.5px solid var(--app-border);
      border-radius: 0.5rem;
      background: var(--app-card-bg);
      color: var(--app-text-primary);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
      font-size: 0.875rem;
      font-weight: 600;
      white-space: nowrap;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .export-btn tabler-icon {
      width: 18px;
      height: 18px;
      color: var(--app-heading);
    }

    .export-btn:hover {
      border-color: var(--app-heading);
      background: var(--app-bg);
      box-shadow: 0 2px 6px rgba(58, 71, 42, 0.08);
      transform: translateY(-1px);
    }

    .export-btn:active {
      transform: translateY(0);
    }

    .active-filters-display {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      align-items: stretch;
      gap: 0.5rem;
      padding-top: 0.75rem;
      border-top: 1px solid var(--app-border);
    }

    .active-filter-item {
      display: flex;
      flex: 0 0 auto;
      flex-direction: column;
      gap: 0.5rem;
      min-width: 220px;
      max-width: 280px;
      padding: 0.75rem;
      border: 1px solid var(--app-border);
      border-radius: 0.5rem;
      background: var(--app-bg);
      transition: all 0.3s ease;
    }

    .active-filter-item:hover {
      border-color: var(--app-heading);
    }

    .filter-item-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .filter-item-header tabler-icon {
      width: 16px;
      height: 16px;
      color: var(--app-heading);
      flex-shrink: 0;
    }

    .filter-item-label {
      flex: 1;
      overflow: hidden;
      color: var(--app-text-secondary);
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.3px;
      text-overflow: ellipsis;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .filter-item-input app-sero-dropdown {
      display: block;
      width: 100%;
    }

    .clear-all-filters-btn {
      display: inline-flex;
      align-items: center;
      align-self: flex-start;
      gap: 0.375rem;
      height: fit-content;
      padding: 0.5rem 0.75rem;
      border: 1px solid #f3b8b8;
      border-radius: 0.375rem;
      background: transparent;
      color: #d96565;
      font-size: 0.75rem;
      font-weight: 500;
      transition: all 0.3s ease;
    }

    .clear-all-filters-btn tabler-icon {
      width: 14px;
      height: 14px;
    }

    .clear-all-filters-btn:hover {
      border-color: #d96565;
      background: #fee2e2;
    }

    .table-section {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 1rem 2rem;
    }

    .table-card {
      margin-bottom: 1rem;
      overflow: hidden;
      border: 1px solid var(--app-border);
      border-radius: 0.75rem;
      background: var(--app-card-bg);
      box-shadow: 0 1px 3px color-mix(in srgb, var(--app-text-primary) 6%, transparent);
    }

    .table-container {
      overflow-x: auto;
    }

    .orders-table {
      width: 100%;
      min-width: 1180px;
      border-collapse: collapse;
      background: transparent;
    }

    .orders-table thead tr {
      height: 44px;
      background: var(--app-heading) !important;
    }

    .orders-table th {
      position: sticky;
      top: 0;
      z-index: 2;
      padding: 0 1rem;
      border-bottom: none;
      background: var(--app-heading) !important;
      color: color-mix(in srgb, var(--app-card-bg) 85%, transparent) !important;
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: 0.03em;
      line-height: 44px;
      text-align: center;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .orders-table td {
      height: 52px;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid color-mix(in srgb, var(--app-border) 60%, transparent) !important;
      color: var(--app-text-primary) !important;
      font-size: 0.8125rem;
      line-height: 1.4;
      text-align: center;
      vertical-align: middle;
      white-space: nowrap;
    }

    .orders-table tbody tr {
      transition: background 150ms ease;
    }

    .orders-table tbody tr:hover {
      background: color-mix(in srgb, var(--app-heading) 4%, transparent);
    }

    .orders-table tbody tr:last-child td {
      border-bottom: none;
    }

    .cell-ref {
      color: var(--app-heading);
      font-size: 0.8rem;
      font-weight: 700;
    }

    .cell-name {
      font-weight: 600;
    }

    .cell-date {
      display: inline-flex;
      flex-direction: column;
      gap: 2px;
      direction: ltr;
      unicode-bidi: isolate;
      line-height: 1.25;
    }

    .cell-time {
      color: var(--app-text-secondary);
      font-size: 0.72rem;
    }

    .booking-type-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.15rem 0.5rem;
      border: 1px solid color-mix(in srgb, var(--app-heading) 20%, transparent);
      border-radius: 999px;
      background: color-mix(in srgb, var(--app-heading) 8%, transparent);
      color: var(--app-heading);
      font-size: 0.7rem;
      font-weight: 600;
      white-space: nowrap;
    }

    .booking-type-badge tabler-icon {
      width: 13px;
      height: 13px;
      flex: 0 0 auto;
    }

    .amount-currency-wrap {
      display: inline-flex;
      align-items: baseline;
      gap: 0.3rem;
      direction: ltr;
      font-variant-numeric: tabular-nums;
      unicode-bidi: isolate;
    }

    .amount-value {
      color: var(--app-text-primary);
      font-size: 0.825rem;
      font-weight: 700;
    }

    .paid-value {
      color: var(--sero-success);
    }

    .remaining-value {
      color: var(--sero-danger);
    }

    .status-badge {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      min-height: 22px !important;
      padding: 0.18rem 0.55rem !important;
      border: 1px solid !important;
      border-radius: 999px !important;
      font-size: 0.7rem !important;
      font-weight: 700 !important;
      line-height: 1.2 !important;
      white-space: nowrap !important;
    }

    .status-success {
      background: color-mix(in srgb, var(--sero-success) 10%, transparent) !important;
      color: var(--sero-success) !important;
      border-color: color-mix(in srgb, var(--sero-success) 25%, transparent) !important;
    }

    .status-warning {
      background: color-mix(in srgb, var(--sero-warning) 10%, transparent) !important;
      color: var(--sero-warning) !important;
      border-color: color-mix(in srgb, var(--sero-warning) 25%, transparent) !important;
    }

    .status-danger {
      background: color-mix(in srgb, var(--sero-danger) 10%, transparent) !important;
      color: var(--sero-danger) !important;
      border-color: color-mix(in srgb, var(--sero-danger) 25%, transparent) !important;
    }

    .status-info {
      background: color-mix(in srgb, var(--sero-info) 10%, transparent) !important;
      color: var(--sero-info) !important;
      border-color: color-mix(in srgb, var(--sero-info) 25%, transparent) !important;
    }

    .status-muted {
      background: color-mix(in srgb, var(--app-text-secondary) 10%, transparent) !important;
      color: var(--app-text-secondary) !important;
      border-color: color-mix(in srgb, var(--app-text-secondary) 25%, transparent) !important;
    }

    .pms-actions-cell {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.375rem;
    }

    .op-icon-btn {
      width: 32px;
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0;
      border: 1px solid color-mix(in srgb, var(--app-text-secondary) 20%, var(--app-border));
      border-radius: 0.375rem;
      background: var(--app-card-bg);
      color: var(--app-text-secondary);
      line-height: 1;
      transition: background 140ms ease, border-color 140ms ease, box-shadow 140ms ease, color 140ms ease;
    }

    .op-icon-btn tabler-icon {
      width: 14px;
      height: 14px;
    }

    .op-icon-btn:hover {
      background: color-mix(in srgb, var(--app-heading) 8%, var(--app-card-bg));
      border-color: color-mix(in srgb, var(--app-heading) 40%, transparent);
      color: var(--app-heading);
      box-shadow: 0 2px 6px color-mix(in srgb, var(--app-text-primary) 10%, transparent);
    }

    .btn-print:hover,
    .btn-more:hover {
      background: color-mix(in srgb, var(--app-text-secondary) 8%, var(--app-card-bg));
      border-color: color-mix(in srgb, var(--app-text-secondary) 35%, transparent);
      color: var(--app-text-primary);
    }

    .op-more-wrap {
      position: relative;
      display: inline-flex;
    }

    .op-more-menu {
      position: absolute;
      inset-inline-end: 0;
      top: calc(100% + 6px);
      z-index: 30;
      min-width: 190px;
      display: flex;
      flex-direction: column;
      gap: 2px;
      padding: 0.375rem;
      border: 1px solid var(--app-border);
      border-radius: 0.5rem;
      background: var(--app-card-bg);
      box-shadow: 0 10px 22px color-mix(in srgb, var(--app-text-primary) 16%, transparent);
    }

    .op-more-menu button {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.55rem 0.625rem;
      border: none;
      border-radius: 0.375rem;
      background: transparent;
      color: var(--app-text-primary);
      font-size: 0.78rem;
      font-weight: 600;
      line-height: 1.3;
      text-align: start;
      white-space: nowrap;
      transition: background 0.12s ease, color 0.12s ease;
    }

    .op-more-menu button:hover {
      background: color-mix(in srgb, var(--app-heading) 6%, var(--app-card-bg));
    }

    .op-more-menu button tabler-icon {
      width: 15px;
      height: 15px;
      color: var(--app-text-secondary);
      flex: 0 0 auto;
    }

    .op-more-menu-danger,
    .op-more-menu-danger tabler-icon {
      color: var(--sero-danger) !important;
    }

    .op-more-menu-danger:hover {
      background: color-mix(in srgb, var(--sero-danger) 10%, transparent) !important;
    }

    .op-footer-row td {
      height: 52px;
      border-top: 2px solid var(--app-border);
      border-bottom: none;
      background: color-mix(in srgb, var(--app-heading) 5%, var(--app-card-bg));
      font-weight: 800;
    }

    .op-footer-label {
      color: var(--app-text-secondary);
      text-align: end !important;
    }

    .op-state-cell {
      padding: 3rem 1rem !important;
      border-bottom: none !important;
      white-space: normal !important;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      color: var(--app-text-secondary);
    }

    .empty-state tabler-icon {
      width: 2.5rem;
      height: 2.5rem;
      opacity: 0.3;
    }

    .empty-state h3 {
      margin: 0.5rem 0 0;
      color: var(--app-text-primary);
      font-size: 0.95rem;
      font-weight: 800;
    }

    .empty-state p {
      margin: 0;
      color: var(--app-text-secondary);
      font-size: 0.875rem;
    }

    .op-spinner {
      width: 28px;
      height: 28px;
      margin: 0 auto;
      border: 3px solid color-mix(in srgb, var(--app-border) 70%, transparent);
      border-top-color: var(--app-heading);
      border-radius: 50%;
      animation: op-spin 0.8s linear infinite;
    }

    @keyframes op-spin {
      to { transform: rotate(360deg); }
    }

    .op-pagination {
      display: flex;
      justify-content: center;
      padding: 0.25rem 0 0;
    }

    :host ::ng-deep .op-pagination .pg-btn {
      width: 40px;
      height: 40px;
      border-color: var(--app-border);
      border-radius: 0.5rem;
      background: var(--app-card-bg);
      color: var(--app-text-primary);
      transition: background 150ms ease, border-color 150ms ease, color 150ms ease;
    }

    :host ::ng-deep .op-pagination .pg-btn:hover:not(:disabled):not(.pg-btn--active) {
      background: color-mix(in srgb, var(--app-heading) 8%, var(--app-card-bg));
      border-color: var(--app-heading);
    }

    :host ::ng-deep .op-pagination .pg-btn--active {
      background: var(--app-heading);
      border-color: var(--app-heading);
      color: var(--app-card-bg);
    }

    :host ::ng-deep .op-pagination .pg-ellipsis {
      color: var(--app-text-secondary);
    }

    @media (max-width: 1200px) {
      .statistics-grid {
        grid-template-columns: repeat(7, minmax(150px, 1fr));
      }
    }

    @media (max-width: 768px) {
      .op-page .page-header {
        padding: 1rem 0;
      }

      .op-page .page-header .header-content {
        align-items: flex-start;
        flex-direction: column;
        gap: 1rem;
        padding: 0 1rem;
      }

      .op-page .page-header .header-actions,
      .new-request-btn {
        width: 100%;
      }

      .statistics-section {
        padding: 0 1rem;
      }

      .statistics-grid {
        grid-template-columns: repeat(7, minmax(148px, 1fr));
      }

      .table-section {
        padding: 0 1rem 2rem;
      }

      .table-container {
        max-height: none;
      }
    }

    @media (max-width: 480px) {
      .statistics-grid {
        grid-template-columns: repeat(7, minmax(146px, 1fr));
      }

      .stat-card {
        justify-content: flex-start;
      }

      .stat-content {
        justify-content: flex-start;
      }
    }
  `],
})
export class OrdersComponent implements OnInit {
  private readonly ordersService = inject(OrdersService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);

  readonly typeMeta = ORDER_TYPE_META;
  readonly pageSize = 10;

  private readonly typeIconMap: Record<OrderTypeFilter, string> = {
    all: 'shopping-cart',
    hotel: 'building',
    transportation: 'bus',
    visa: 'id',
    catering: 'tools-kitchen-2',
    ticket: 'ticket',
    custom: 'sparkles',
  };

  readonly paymentOptions: SeroDropdownOption<PaymentStatus>[] = [
    { value: 'paid', labelKey: 'orders.payment.paid' },
    { value: 'partially_paid', labelKey: 'orders.payment.partial' },
    { value: 'unpaid', labelKey: 'orders.payment.unpaid' },
  ];

  readonly operationOptions: SeroDropdownOption<OperationStatus>[] = [
    { value: 'preparing', labelKey: 'orders.operation.preparing' },
    { value: 'account_manager_approved', labelKey: 'orders.operation.amApproved' },
    { value: 'operation_approved', labelKey: 'orders.operation.opApproved' },
    { value: 'rejected', labelKey: 'orders.operation.rejected' },
  ];

  readonly agentStatusOptions: SeroDropdownOption<AgentStatus>[] = [
    { value: 'preparing', labelKey: 'orders.agentStatus.preparing' },
    { value: 'in_progress', labelKey: 'orders.agentStatus.inProgress' },
    { value: 'completed', labelKey: 'orders.agentStatus.completed' },
    { value: 'cancelled', labelKey: 'orders.agentStatus.cancelled' },
  ];

  rows = signal<OrderRow[]>([]);
  isLoading = signal(false);
  page = signal(1);
  totalCount = signal(0);
  typeCounts = signal<TypeCounts>({});

  activeType = signal<OrderTypeFilter>('all');
  searchText = signal('');
  showAdvancedFilters = signal(false);
  paymentFilter = signal<PaymentStatus | null>(null);
  operationFilter = signal<OperationStatus | null>(null);
  agentStatusFilter = signal<AgentStatus | null>(null);
  openMoreMenuId = signal<number | null>(null);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / this.pageSize)));
  readonly activeFilterCount = computed(() => [
    this.paymentFilter(),
    this.operationFilter(),
    this.agentStatusFilter(),
  ].filter(Boolean).length);

  readonly footerTotal = computed(() => this.rows().reduce((sum, r) => sum + r.totalPrice, 0));
  readonly footerPaid = computed(() => this.rows().reduce((sum, r) => sum + r.paid, 0));
  readonly footerRemaining = computed(() => this.rows().reduce((sum, r) => sum + r.remaining, 0));
  readonly footerPaymentMeta = computed(() => {
    const total = this.footerTotal();
    const paid = this.footerPaid();
    if (paid <= 0) return PAYMENT_STATUS_META.unpaid;
    if (paid >= total) return PAYMENT_STATUS_META.paid;
    return PAYMENT_STATUS_META.partially_paid;
  });

  ngOnInit(): void {
    this.loadTypeCounts();
    this.loadRows();
  }

  countFor(type: OrderTypeFilter): number {
    return this.typeCounts()[type] ?? 0;
  }

  tablerIconForType(type: OrderTypeFilter): string {
    return this.typeIconMap[type] ?? 'shopping-cart';
  }

  iconForType(type: OrderRow['type']): string {
    return this.typeMeta.find((m) => m.type === type)?.icon ?? 'shopping_cart';
  }

  typeLabelKey(type: OrderRow['type']): string {
    return this.typeMeta.find((m) => m.type === type)?.labelKey ?? '';
  }

  paymentMeta(status: PaymentStatus) {
    return PAYMENT_STATUS_META[status];
  }

  operationMeta(status: OperationStatus) {
    return OPERATION_STATUS_META[status];
  }

  agentStatusMeta(status: AgentStatus) {
    return AGENT_STATUS_META[status];
  }

  selectType(type: OrderTypeFilter): void {
    if (this.activeType() === type) return;
    this.activeType.set(type);
    this.page.set(1);
    this.loadRows();
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchText.set(value);
    this.page.set(1);
    this.loadRows();
  }

  clearSearch(): void {
    if (!this.searchText()) return;
    this.searchText.set('');
    this.page.set(1);
    this.loadRows();
  }

  createNewRequest(): void {
    this.router.navigate(['/admin/agent-requests/new']);
  }

  toggleAdvancedFilters(): void {
    this.showAdvancedFilters.update((v) => !v);
  }

  onPaymentFilterChange(value: PaymentStatus | null): void {
    this.paymentFilter.set(value);
    this.page.set(1);
    this.loadRows();
  }

  onOperationFilterChange(value: OperationStatus | null): void {
    this.operationFilter.set(value);
    this.page.set(1);
    this.loadRows();
  }

  onAgentStatusFilterChange(value: AgentStatus | null): void {
    this.agentStatusFilter.set(value);
    this.page.set(1);
    this.loadRows();
  }

  clearAdvancedFilters(): void {
    this.paymentFilter.set(null);
    this.operationFilter.set(null);
    this.agentStatusFilter.set(null);
    this.page.set(1);
    this.loadRows();
  }

  setPage(newPage: number): void {
    this.page.set(newPage);
    this.loadRows();
  }

  toggleMoreMenu(rowId: number, event: Event): void {
    event.stopPropagation();
    this.openMoreMenuId.update((current) => (current === rowId ? null : rowId));
  }

  @HostListener('document:click')
  closeMoreMenu(): void {
    this.openMoreMenuId.set(null);
  }

  viewRow(row: OrderRow): void {
    this.notify('orders.feedback.view', row);
  }

  editRow(row: OrderRow): void {
    this.notify('orders.feedback.edit', row);
  }

  printRow(row: OrderRow): void {
    this.notify('orders.feedback.print', row);
  }

  duplicateRow(row: OrderRow): void {
    this.openMoreMenuId.set(null);
    this.notify('orders.feedback.duplicate', row);
  }

  downloadPdf(row: OrderRow): void {
    this.openMoreMenuId.set(null);
    this.notify('orders.feedback.downloadPdf', row);
  }

  viewStatusLog(row: OrderRow): void {
    this.openMoreMenuId.set(null);
    this.notify('orders.feedback.statusLog', row);
  }

  deleteRow(row: OrderRow): void {
    this.openMoreMenuId.set(null);
    this.notify('orders.feedback.delete', row);
  }

  exportCsv(): void {
    this.ordersService.getAllMatching(this.currentFilters()).subscribe((rows) => {
      const header = ['Type', 'Quotation No.', 'Quotation Date', 'Agent', 'Total Price', 'Paid', 'Remaining', 'Payment Status', 'Operation Status', 'Agent Status'];
      const lines = rows.map((r) => [
        r.type, r.orderNo, r.orderDate, r.agent, r.totalPrice, r.paid, r.remaining,
        this.translate.instant(this.paymentMeta(r.paymentStatus).labelKey),
        this.translate.instant(this.operationMeta(r.operationStatus).labelKey),
        this.translate.instant(this.agentStatusMeta(r.agentStatus).labelKey),
      ].join(','));
      const csv = [header.join(','), ...lines].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'quotations.csv';
      link.click();
      URL.revokeObjectURL(url);

      this.snackBar.open(
        this.translate.instant('orders.feedback.exportStarted', { count: rows.length }),
        this.translate.instant('Close'),
        { duration: 2500 },
      );
    });
  }

  private notify(key: string, row: OrderRow): void {
    this.snackBar.open(
      this.translate.instant(key, { no: row.orderNo }),
      this.translate.instant('Close'),
      { duration: 2500 },
    );
  }

  private currentFilters() {
    return {
      typeFilter: this.activeType(),
      search: this.searchText(),
      paymentStatus: this.paymentFilter(),
      operationStatus: this.operationFilter(),
      agentStatus: this.agentStatusFilter(),
    };
  }

  private loadRows(): void {
    this.isLoading.set(true);
    this.ordersService.getOrders({
      ...this.currentFilters(),
      pageIndex: this.page() - 1,
      pageSize: this.pageSize,
    }).subscribe((result) => {
      this.rows.set(result.rows);
      this.totalCount.set(result.total);
      this.isLoading.set(false);
    });
  }

  private loadTypeCounts(): void {
    this.ordersService.getTypeCounts().subscribe((counts) => {
      this.typeCounts.set(counts);
    });
  }
}
