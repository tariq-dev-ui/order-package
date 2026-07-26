import { ChangeDetectionStrategy, Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
  imports: [CommonModule, TranslateModule, SeroDropdownComponent, PaginationComponent],
  template: `
    <section class="op-page">

      <!-- ── Header ── -->
      <header class="op-header">
        <div class="op-header-titles">
          <h1 class="op-title">{{ 'orders.title' | translate }}</h1>
          <p class="op-subtitle">{{ 'orders.subtitle' | translate }}</p>
        </div>
        <span class="op-header-icon">
          <span class="material-icons-round">shopping_cart</span>
        </span>
      </header>

      <!-- ── Status filter cards ── -->
      <div class="op-stat-cards">
        @for (meta of typeMeta; track meta.type) {
          <button type="button"
            class="op-stat-card"
            [class.op-stat-card--active]="activeType() === meta.type"
            (click)="selectType(meta.type)">
            <span class="op-stat-count">{{ countFor(meta.type) }}</span>
            <span class="op-stat-label">{{ meta.labelKey | translate }}</span>
            <span class="op-stat-icon">
              <span class="material-icons-round">{{ meta.icon }}</span>
            </span>
          </button>
        }
      </div>

      <!-- ── Action bar ── -->
      <div class="op-action-bar">
        <button type="button" class="op-btn op-btn--outline" (click)="exportCsv()">
          <span class="material-icons-round">file_download</span>
          <span>{{ 'orders.actions.export' | translate }}</span>
        </button>

        <div class="op-search">
          <span class="material-icons-round op-search-icon">search</span>
          <input type="text" class="op-search-input"
            [placeholder]="'orders.actions.searchPlaceholder' | translate"
            [value]="searchText()"
            (input)="onSearchInput($event)" />
        </div>

        <button type="button" class="op-btn op-btn--outline"
          [class.op-btn--active]="showAdvancedFilters()"
          (click)="toggleAdvancedFilters()">
          <span class="material-icons-round">tune</span>
          <span>{{ 'orders.actions.advancedFilters' | translate }}</span>
        </button>

        <button type="button" class="op-btn op-btn--primary" (click)="toggleAdvancedFilters()">
          <span class="material-icons-round">filter_list</span>
          <span>{{ 'orders.actions.filter' | translate }}</span>
        </button>
      </div>

      @if (showAdvancedFilters()) {
        <div class="op-adv-filters">
          <div class="op-field">
            <label>{{ 'orders.filters.paymentStatus' | translate }}</label>
            <app-sero-dropdown
              [options]="paymentOptions"
              [value]="paymentFilter()"
              [placeholderKey]="'orders.filters.any'"
              (valueChange)="onPaymentFilterChange($event)">
            </app-sero-dropdown>
          </div>
          <div class="op-field">
            <label>{{ 'orders.filters.operationStatus' | translate }}</label>
            <app-sero-dropdown
              [options]="operationOptions"
              [value]="operationFilter()"
              [placeholderKey]="'orders.filters.any'"
              (valueChange)="onOperationFilterChange($event)">
            </app-sero-dropdown>
          </div>
          <div class="op-field">
            <label>{{ 'orders.filters.agentStatus' | translate }}</label>
            <app-sero-dropdown
              [options]="agentStatusOptions"
              [value]="agentStatusFilter()"
              [placeholderKey]="'orders.filters.any'"
              (valueChange)="onAgentStatusFilterChange($event)">
            </app-sero-dropdown>
          </div>
          <button type="button" class="op-btn op-btn--ghost op-clear-filters" (click)="clearAdvancedFilters()">
            <span class="material-icons-round">close</span>
            <span>{{ 'orders.actions.clearFilters' | translate }}</span>
          </button>
        </div>
      }

      <!-- ── Table ── -->
      <div class="op-table-card">
        <div class="op-table-wrap">
          <table class="op-table">
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
                    <span class="material-icons-round">shopping_cart</span>
                    <h3>{{ 'orders.empty.title' | translate }}</h3>
                    <p>{{ 'orders.empty.description' | translate }}</p>
                  </td>
                </tr>
              } @else {
                @for (row of rows(); track row.id) {
                  <tr>
                    <td>
                      <span class="op-type-chip">
                        <span class="material-icons-round">{{ iconForType(row.type) }}</span>
                        {{ typeLabelKey(row.type) | translate }}
                      </span>
                    </td>
                    <td class="op-strong">{{ row.orderNo }}</td>
                    <td class="op-date-cell">
                      <span>{{ row.orderDate | date:'dd MMM yyyy' }}</span>
                      <span class="op-date-time">{{ row.orderDate | date:'HH:mm' }}</span>
                    </td>
                    <td>{{ row.agent }}</td>
                    <td class="op-amount">{{ row.totalPrice | number:'1.2-2' }} <span class="sar-symbol">R</span></td>
                    <td class="op-amount">{{ row.paid | number:'1.2-2' }} <span class="sar-symbol">R</span></td>
                    <td class="op-amount">{{ row.remaining | number:'1.2-2' }} <span class="sar-symbol">R</span></td>
                    <td>
                      <span class="op-badge op-badge--{{ paymentMeta(row.paymentStatus).cls }}">
                        {{ paymentMeta(row.paymentStatus).labelKey | translate }}
                      </span>
                    </td>
                    <td>
                      <span class="op-badge op-badge--{{ operationMeta(row.operationStatus).cls }}">
                        {{ operationMeta(row.operationStatus).labelKey | translate }}
                      </span>
                    </td>
                    <td>
                      <span class="op-badge op-badge--{{ agentStatusMeta(row.agentStatus).cls }}">
                        {{ agentStatusMeta(row.agentStatus).labelKey | translate }}
                      </span>
                    </td>
                    <td>
                      <div class="op-row-actions">
                        <button type="button" class="op-icon-btn" [attr.aria-label]="'orders.actionsMenu.view' | translate" (click)="viewRow(row)">
                          <span class="material-icons-round">visibility</span>
                        </button>
                        <button type="button" class="op-icon-btn" [attr.aria-label]="'orders.actionsMenu.edit' | translate" (click)="editRow(row)">
                          <span class="material-icons-round">edit</span>
                        </button>
                        <button type="button" class="op-icon-btn" [attr.aria-label]="'orders.actionsMenu.print' | translate" (click)="printRow(row)">
                          <span class="material-icons-round">print</span>
                        </button>
                        <div class="op-more-wrap">
                          <button type="button" class="op-icon-btn" [attr.aria-label]="'orders.actionsMenu.more' | translate" (click)="toggleMoreMenu(row.id, $event)">
                            <span class="material-icons-round">more_vert</span>
                          </button>
                          @if (openMoreMenuId() === row.id) {
                            <div class="op-more-menu">
                              <button type="button" (click)="duplicateRow(row)">
                                <span class="material-icons-round">content_copy</span>
                                {{ 'orders.actionsMenu.duplicate' | translate }}
                              </button>
                              <button type="button" (click)="downloadPdf(row)">
                                <span class="material-icons-round">picture_as_pdf</span>
                                {{ 'orders.actionsMenu.downloadPdf' | translate }}
                              </button>
                              <button type="button" (click)="viewStatusLog(row)">
                                <span class="material-icons-round">history</span>
                                {{ 'orders.actionsMenu.statusLog' | translate }}
                              </button>
                              <button type="button" class="op-more-menu-danger" (click)="deleteRow(row)">
                                <span class="material-icons-round">delete</span>
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
                  <td class="op-amount op-strong">{{ footerTotal() | number:'1.2-2' }} <span class="sar-symbol">R</span></td>
                  <td class="op-amount op-strong">{{ footerPaid() | number:'1.2-2' }} <span class="sar-symbol">R</span></td>
                  <td class="op-amount op-strong">{{ footerRemaining() | number:'1.2-2' }} <span class="sar-symbol">R</span></td>
                  <td>
                    <span class="op-badge op-badge--{{ footerPaymentMeta().cls }}">
                      {{ footerPaymentMeta().labelKey | translate }}
                    </span>
                  </td>
                  <td colspan="3"></td>
                </tr>
              </tfoot>
            }
          </table>
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
    .op-page {
      display: flex;
      flex-direction: column;
      gap: var(--sp-5);
    }

    /* ── Header ── */
    .op-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--sp-4);
      padding-bottom: var(--sp-4);
      border-bottom: 1px solid var(--sero-border-light);
    }

    .op-header-titles {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .op-title {
      margin: 0;
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--sero-text-primary);
      font-family: var(--sero-font-heading);
    }

    .op-subtitle {
      margin: 0;
      font-size: 0.82rem;
      color: var(--sero-text-secondary);
    }

    .op-header-icon {
      width: 48px;
      height: 48px;
      border-radius: var(--r-lg);
      background: var(--sero-primary);
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .op-header-icon .material-icons-round {
      font-size: 24px;
    }

    /* ── Status filter cards ── */
    .op-stat-cards {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-3);
    }

    .op-stat-card {
      display: inline-flex;
      align-items: center;
      gap: var(--sp-3);
      padding: var(--sp-2) var(--sp-2) var(--sp-2) var(--sp-4);
      border-radius: var(--r-full);
      border: 1px solid var(--sero-border);
      background: var(--sero-card-bg);
      cursor: pointer;
      font-family: var(--sero-font);
      transition: background var(--t-fast), border-color var(--t-fast), transform var(--t-fast);
    }

    .op-stat-card:hover {
      border-color: var(--sero-border-strong);
      background: var(--sero-surface-2);
      transform: translateY(-1px);
    }

    .op-stat-count {
      min-width: 30px;
      height: 30px;
      padding: 0 8px;
      border-radius: var(--r-full);
      background: var(--sero-surface-3);
      color: var(--sero-text-primary);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
      font-size: 0.85rem;
    }

    .op-stat-label {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--sero-text-primary);
      white-space: nowrap;
    }

    .op-stat-icon {
      width: 32px;
      height: 32px;
      border-radius: var(--r-full);
      background: var(--sero-surface-3);
      color: var(--sero-text-secondary);
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .op-stat-icon .material-icons-round {
      font-size: 17px;
    }

    .op-stat-card--active {
      background: var(--sero-primary);
      border-color: var(--sero-primary);
    }

    .op-stat-card--active .op-stat-label {
      color: #fff;
    }

    .op-stat-card--active .op-stat-count {
      background: #fff;
      color: var(--sero-primary-dark);
    }

    .op-stat-card--active .op-stat-icon {
      background: rgba(255, 255, 255, 0.18);
      color: #fff;
    }

    /* ── Action bar ── */
    .op-action-bar {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      flex-wrap: wrap;
      padding: var(--sp-3);
      border: 1px solid var(--sero-border-light);
      border-radius: var(--r-xl);
      background: var(--sero-card-bg);
    }

    .op-search {
      flex: 1;
      min-width: 220px;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 var(--sp-3);
      height: 42px;
      border: 1px solid var(--sero-border);
      border-radius: var(--r-lg);
      background: var(--sero-app-bg);
    }

    .op-search-icon {
      font-size: 18px;
      color: var(--sero-text-muted);
      flex-shrink: 0;
    }

    .op-search-input {
      flex: 1;
      min-width: 0;
      border: none;
      outline: none;
      background: transparent;
      font-family: var(--sero-font);
      font-size: 0.85rem;
      color: var(--sero-text-primary);
    }

    .op-search-input::placeholder {
      color: var(--sero-text-muted);
    }

    .op-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      height: 42px;
      padding: 0 var(--sp-4);
      border-radius: var(--r-lg);
      border: 1px solid transparent;
      font-family: var(--sero-font);
      font-weight: 700;
      font-size: 0.82rem;
      cursor: pointer;
      white-space: nowrap;
      transition: background var(--t-fast), border-color var(--t-fast), color var(--t-fast);
    }

    .op-btn .material-icons-round {
      font-size: 18px;
    }

    .op-btn--primary {
      background: var(--sero-primary);
      color: #fff;
    }

    .op-btn--primary:hover {
      background: var(--sero-primary-dark);
    }

    .op-btn--outline {
      background: var(--sero-card-bg);
      color: var(--sero-text-primary);
      border-color: var(--sero-border);
    }

    .op-btn--outline:hover,
    .op-btn--outline.op-btn--active {
      background: var(--sero-surface-2);
      border-color: var(--sero-border-strong);
    }

    .op-btn--ghost {
      background: transparent;
      color: var(--sero-text-secondary);
    }

    .op-btn--ghost:hover {
      background: var(--sero-surface-2);
      color: var(--sero-text-primary);
    }

    /* ── Advanced filters ── */
    .op-adv-filters {
      display: flex;
      align-items: flex-end;
      gap: var(--sp-4);
      flex-wrap: wrap;
      padding: var(--sp-3) var(--sp-4);
      border: 1px solid var(--sero-border-light);
      border-radius: var(--r-xl);
      background: var(--sero-surface-2);
    }

    .op-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 180px;
    }

    .op-field label {
      font-size: 0.72rem;
      font-weight: 800;
      color: var(--sero-text-secondary);
    }

    .op-clear-filters {
      height: 42px;
    }

    /* ── Table card ── */
    .op-table-card {
      background: var(--sero-card-bg);
      border: 1px solid var(--sero-border-light);
      border-radius: var(--r-xl);
      overflow: hidden;
    }

    .op-table-wrap {
      overflow-x: auto;
    }

    .op-table {
      width: 100%;
      min-width: 1180px;
      border-collapse: collapse;
    }

    .op-table thead tr {
      background: var(--sero-primary);
    }

    .op-table th {
      color: rgba(255, 255, 255, 0.92);
      font-size: 0.72rem;
      font-weight: 800;
      text-align: center;
      padding: var(--sp-3) var(--sp-3);
      white-space: nowrap;
    }

    .op-table td {
      border-bottom: 1px solid var(--sero-border-light);
      color: var(--sero-text-primary);
      font-size: 0.8rem;
      text-align: center;
      padding: var(--sp-3);
      white-space: nowrap;
      vertical-align: middle;
    }

    .op-table tbody tr:hover {
      background: color-mix(in srgb, var(--sero-surface-2) 70%, var(--sero-card-bg));
    }

    .op-table tbody tr:last-child td {
      border-bottom: none;
    }

    .op-strong {
      font-weight: 800;
    }

    .op-amount {
      font-weight: 700;
      white-space: nowrap;
    }

    .op-date-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
      line-height: 1.3;
    }

    .op-date-time {
      font-size: 0.72rem;
      color: var(--sero-text-secondary);
    }

    .op-type-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: var(--r-full);
      border: 1px solid var(--sero-border);
      background: var(--sero-surface-2);
      color: var(--sero-text-primary);
      font-size: 0.74rem;
      font-weight: 700;
      white-space: nowrap;
    }

    .op-type-chip .material-icons-round {
      font-size: 15px;
      color: var(--sero-text-secondary);
    }

    /* ── Status badges ── */
    .op-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: var(--r-full);
      font-size: 0.72rem;
      font-weight: 800;
      border: 1px solid transparent;
      white-space: nowrap;
    }

    .op-badge--success  { background: var(--sero-success-bg);  color: var(--sero-success);  border-color: var(--sero-success-border); }
    .op-badge--warning  { background: var(--sero-warning-bg);  color: var(--sero-warning);  border-color: var(--sero-warning-border); }
    .op-badge--danger   { background: var(--sero-danger-bg);   color: var(--sero-danger);   border-color: var(--sero-danger-border); }
    .op-badge--info     { background: var(--sero-info-bg);     color: var(--sero-info);     border-color: var(--sero-info-border); }
    .op-badge--muted    { background: var(--sero-surface-3);   color: var(--sero-text-secondary); border-color: var(--sero-border); }

    /* ── Row actions ── */
    .op-row-actions {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .op-icon-btn {
      width: 30px;
      height: 30px;
      border: 1px solid var(--sero-border);
      border-radius: var(--r-md);
      background: var(--sero-card-bg);
      color: var(--sero-text-secondary);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background var(--t-fast), border-color var(--t-fast), color var(--t-fast);
    }

    .op-icon-btn .material-icons-round {
      font-size: 16px;
    }

    .op-icon-btn:hover {
      background: var(--sero-primary-50);
      border-color: var(--sero-primary-100);
      color: var(--sero-primary-dark);
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
      min-width: 180px;
      background: var(--sero-card-bg);
      border: 1px solid var(--sero-border-light);
      border-radius: var(--r-lg);
      box-shadow: var(--shadow-lg);
      padding: 6px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .op-more-menu button {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 10px;
      border: none;
      border-radius: var(--r-md);
      background: transparent;
      color: var(--sero-text-primary);
      font-family: var(--sero-font);
      font-size: 0.78rem;
      font-weight: 700;
      text-align: start;
      cursor: pointer;
      white-space: nowrap;
    }

    .op-more-menu button:hover {
      background: var(--sero-surface-2);
    }

    .op-more-menu button .material-icons-round {
      font-size: 16px;
      color: var(--sero-text-secondary);
    }

    .op-more-menu-danger {
      color: var(--sero-danger) !important;
    }

    .op-more-menu-danger .material-icons-round {
      color: var(--sero-danger) !important;
    }

    .op-more-menu-danger:hover {
      background: var(--sero-danger-bg) !important;
    }

    /* ── Footer summary row ── */
    .op-footer-row td {
      background: var(--sero-surface-2);
      font-weight: 800;
      border-top: 2px solid var(--sero-border);
      border-bottom: none;
    }

    .op-footer-label {
      text-align: end;
      color: var(--sero-text-secondary);
    }

    /* ── Empty / loading state ── */
    .op-state-cell {
      padding: 48px 16px !important;
      white-space: normal !important;
    }

    .op-state-cell .material-icons-round {
      font-size: 40px;
      color: var(--sero-border-strong);
    }

    .op-state-cell h3 {
      margin: 10px 0 4px;
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--sero-text-primary);
    }

    .op-state-cell p {
      margin: 0;
      font-size: 0.8rem;
      color: var(--sero-text-secondary);
    }

    .op-spinner {
      width: 26px;
      height: 26px;
      margin: 0 auto;
      border: 3px solid var(--sero-border-light);
      border-top-color: var(--sero-primary);
      border-radius: 50%;
      animation: op-spin 0.8s linear infinite;
    }

    @keyframes op-spin {
      to { transform: rotate(360deg); }
    }

    .op-pagination {
      display: flex;
      justify-content: center;
      padding: var(--sp-4);
      border-top: 1px solid var(--sero-border-light);
    }

    @media (max-width: 900px) {
      .op-header {
        flex-direction: column-reverse;
        align-items: flex-start;
      }
    }
  `],
})
export class OrdersComponent implements OnInit {
  private readonly ordersService = inject(OrdersService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  readonly typeMeta = ORDER_TYPE_META;
  readonly pageSize = 10;

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
      const header = ['Type', 'Order No.', 'Order Date', 'Agent', 'Total Price', 'Paid', 'Remaining', 'Payment Status', 'Operation Status', 'Agent Status'];
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
      link.download = 'orders.csv';
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
