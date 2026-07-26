import { ChangeDetectionStrategy, Component, computed, HostListener, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SeroDropdownComponent, SeroDropdownOption } from '../../../shared/components/sero-dropdown/sero-dropdown.component';
import { PaginationComponent } from '../packages/components/pagination.component';
import { QuotationsService } from './quotations.service';
import {
  AGENT_STATUS_META,
  AgentStatus,
  OPERATION_STATUS_META,
  OperationStatus,
  PAYMENT_STATUS_META,
  PaymentStatus,
  QUOTATION_TYPE_META,
  QuotationRow,
  QuotationTypeFilter,
} from './quotations.model';
import { SeroCurrencyPipe } from 'src/app/shared/pipes/sero-currency.pipe';

type TypeCounts = Record<string, number>;

@Component({
  selector: 'quotations-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, TranslateModule, SeroDropdownComponent, SeroCurrencyPipe, PaginationComponent],
  template: `
    <section class="qp-page">

      <!-- ── Header ── -->
      <header class="qp-header">
        <div class="qp-header-titles">
          <h1 class="qp-title">{{ 'quotations.title' | translate }}</h1>
          <p class="qp-subtitle">{{ 'quotations.subtitle' | translate }}</p>
        </div>
        <span class="qp-header-icon">
          <span class="material-icons-round">receipt_long</span>
        </span>
      </header>

      <!-- ── Status filter cards ── -->
      <div class="qp-stat-cards">
        @for (meta of typeMeta; track meta.type) {
          <button type="button"
            class="qp-stat-card"
            [class.qp-stat-card--active]="activeType() === meta.type"
            (click)="selectType(meta.type)">
            <span class="qp-stat-count">{{ countFor(meta.type) }}</span>
            <span class="qp-stat-label">{{ meta.labelKey | translate }}</span>
            <span class="qp-stat-icon">
              <span class="material-icons-round">{{ meta.icon }}</span>
            </span>
          </button>
        }
      </div>

      <!-- ── Action bar ── -->
      <div class="qp-action-bar">
        <button type="button" class="qp-btn qp-btn--outline" (click)="exportCsv()">
          <span class="material-icons-round">file_download</span>
          <span>{{ 'quotations.actions.export' | translate }}</span>
        </button>

        <div class="qp-search">
          <span class="material-icons-round qp-search-icon">search</span>
          <input type="text" class="qp-search-input"
            [placeholder]="'quotations.actions.searchPlaceholder' | translate"
            [value]="searchText()"
            (input)="onSearchInput($event)" />
        </div>

        <button type="button" class="qp-btn qp-btn--outline"
          [class.qp-btn--active]="showAdvancedFilters()"
          (click)="toggleAdvancedFilters()">
          <span class="material-icons-round">tune</span>
          <span>{{ 'quotations.actions.advancedFilters' | translate }}</span>
        </button>

        <button type="button" class="qp-btn qp-btn--primary" (click)="toggleAdvancedFilters()">
          <span class="material-icons-round">filter_list</span>
          <span>{{ 'quotations.actions.filter' | translate }}</span>
        </button>
      </div>

      @if (showAdvancedFilters()) {
        <div class="qp-adv-filters">
          <div class="qp-field">
            <label>{{ 'quotations.filters.paymentStatus' | translate }}</label>
            <app-sero-dropdown
              [options]="paymentOptions"
              [value]="paymentFilter()"
              [placeholderKey]="'quotations.filters.any'"
              (valueChange)="onPaymentFilterChange($event)">
            </app-sero-dropdown>
          </div>
          <div class="qp-field">
            <label>{{ 'quotations.filters.operationStatus' | translate }}</label>
            <app-sero-dropdown
              [options]="operationOptions"
              [value]="operationFilter()"
              [placeholderKey]="'quotations.filters.any'"
              (valueChange)="onOperationFilterChange($event)">
            </app-sero-dropdown>
          </div>
          <div class="qp-field">
            <label>{{ 'quotations.filters.agentStatus' | translate }}</label>
            <app-sero-dropdown
              [options]="agentStatusOptions"
              [value]="agentStatusFilter()"
              [placeholderKey]="'quotations.filters.any'"
              (valueChange)="onAgentStatusFilterChange($event)">
            </app-sero-dropdown>
          </div>
          <button type="button" class="qp-btn qp-btn--ghost qp-clear-filters" (click)="clearAdvancedFilters()">
            <span class="material-icons-round">close</span>
            <span>{{ 'quotations.actions.clearFilters' | translate }}</span>
          </button>
        </div>
      }

      <!-- ── Table ── -->
      <div class="qp-table-card">
        <div class="qp-table-wrap">
          <table class="qp-table">
            <thead>
              <tr>
                <th>{{ 'quotations.columns.type' | translate }}</th>
                <th>{{ 'quotations.columns.quotationNo' | translate }}</th>
                <th>{{ 'quotations.columns.quotationDate' | translate }}</th>
                <th>{{ 'quotations.columns.agent' | translate }}</th>
                <th>{{ 'quotations.columns.totalPrice' | translate }}</th>
                <th>{{ 'quotations.columns.paid' | translate }}</th>
                <th>{{ 'quotations.columns.remaining' | translate }}</th>
                <th>{{ 'quotations.columns.paymentStatus' | translate }}</th>
                <th>{{ 'quotations.columns.operationStatus' | translate }}</th>
                <th>{{ 'quotations.columns.agentStatus' | translate }}</th>
                <th>{{ 'quotations.columns.actions' | translate }}</th>
              </tr>
            </thead>
            <tbody>
              @if (isLoading()) {
                <tr>
                  <td colspan="11" class="qp-state-cell">
                    <div class="qp-spinner"></div>
                  </td>
                </tr>
              } @else if (rows().length === 0) {
                <tr>
                  <td colspan="11" class="qp-state-cell">
                    <span class="material-icons-round">receipt_long</span>
                    <h3>{{ 'quotations.empty.title' | translate }}</h3>
                    <p>{{ 'quotations.empty.description' | translate }}</p>
                  </td>
                </tr>
              } @else {
                @for (row of rows(); track row.id) {
                  <tr>
                    <td>
                      <span class="qp-type-chip">
                        <span class="material-icons-round">{{ iconForType(row.type) }}</span>
                        {{ typeLabelKey(row.type) | translate }}
                      </span>
                    </td>
                    <td class="qp-strong">{{ row.quotationNo }}</td>
                    <td class="qp-date-cell">
                      <span>{{ row.quotationDate | date:'dd MMM yyyy' }}</span>
                      <span class="qp-date-time">{{ row.quotationDate | date:'HH:mm' }}</span>
                    </td>
                    <td>{{ row.agent }}</td>
                    <td class="qp-amount">{{ row.totalPrice | seroCurrency }}</td>
                    <td class="qp-amount">{{ row.paid | seroCurrency }}</td>
                    <td class="qp-amount">{{ row.remaining | seroCurrency }}</td>
                    <td>
                      <span class="qp-badge qp-badge--{{ paymentMeta(row.paymentStatus).cls }}">
                        {{ paymentMeta(row.paymentStatus).labelKey | translate }}
                      </span>
                    </td>
                    <td>
                      <span class="qp-badge qp-badge--{{ operationMeta(row.operationStatus).cls }}">
                        {{ operationMeta(row.operationStatus).labelKey | translate }}
                      </span>
                    </td>
                    <td>
                      <span class="qp-badge qp-badge--{{ agentStatusMeta(row.agentStatus).cls }}">
                        {{ agentStatusMeta(row.agentStatus).labelKey | translate }}
                      </span>
                    </td>
                    <td>
                      <div class="qp-row-actions">
                        <button type="button" class="qp-icon-btn" [attr.aria-label]="'quotations.actionsMenu.view' | translate" (click)="viewRow(row)">
                          <span class="material-icons-round">visibility</span>
                        </button>
                        <button type="button" class="qp-icon-btn" [attr.aria-label]="'quotations.actionsMenu.edit' | translate" (click)="editRow(row)">
                          <span class="material-icons-round">edit</span>
                        </button>
                        <button type="button" class="qp-icon-btn" [attr.aria-label]="'quotations.actionsMenu.print' | translate" (click)="printRow(row)">
                          <span class="material-icons-round">print</span>
                        </button>
                        <div class="qp-more-wrap">
                          <button type="button" class="qp-icon-btn" [attr.aria-label]="'quotations.actionsMenu.more' | translate" (click)="toggleMoreMenu(row.id, $event)">
                            <span class="material-icons-round">more_vert</span>
                          </button>
                          @if (openMoreMenuId() === row.id) {
                            <div class="qp-more-menu">
                              <button type="button" (click)="duplicateRow(row)">
                                <span class="material-icons-round">content_copy</span>
                                {{ 'quotations.actionsMenu.duplicate' | translate }}
                              </button>
                              <button type="button" (click)="downloadPdf(row)">
                                <span class="material-icons-round">picture_as_pdf</span>
                                {{ 'quotations.actionsMenu.downloadPdf' | translate }}
                              </button>
                              <button type="button" (click)="viewStatusLog(row)">
                                <span class="material-icons-round">history</span>
                                {{ 'quotations.actionsMenu.statusLog' | translate }}
                              </button>
                              <button type="button" class="qp-more-menu-danger" (click)="deleteRow(row)">
                                <span class="material-icons-round">delete</span>
                                {{ 'quotations.actionsMenu.delete' | translate }}
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
                <tr class="qp-footer-row">
                  <td class="qp-footer-label" colspan="4">{{ 'quotations.footer.total' | translate }}</td>
                  <td class="qp-amount qp-strong">{{ footerTotal() | seroCurrency }}</td>
                  <td class="qp-amount qp-strong">{{ footerPaid() | seroCurrency }}</td>
                  <td class="qp-amount qp-strong">{{ footerRemaining() | seroCurrency }}</td>
                  <td>
                    <span class="qp-badge qp-badge--{{ footerPaymentMeta().cls }}">
                      {{ footerPaymentMeta().labelKey | translate }}
                    </span>
                  </td>
                  <td colspan="3"></td>
                </tr>
              </tfoot>
            }
          </table>
        </div>

        <div class="qp-pagination">
          <pkg-pagination
            [currentPage]="page()"
            [totalPages]="totalPages()"
            (pageChange)="setPage($event)" />
        </div>
      </div>

    </section>
  `,
  styles: [`
    .qp-page {
      display: flex;
      flex-direction: column;
      gap: var(--sp-5);
    }

    /* ── Header ── */
    .qp-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--sp-4);
      padding-bottom: var(--sp-4);
      border-bottom: 1px solid var(--sero-border-light);
    }

    .qp-header-titles {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .qp-title {
      margin: 0;
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--sero-text-primary);
      font-family: var(--sero-font-heading);
    }

    .qp-subtitle {
      margin: 0;
      font-size: 0.82rem;
      color: var(--sero-text-secondary);
    }

    .qp-header-icon {
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

    .qp-header-icon .material-icons-round {
      font-size: 24px;
    }

    /* ── Status filter cards ── */
    .qp-stat-cards {
      display: flex;
      flex-wrap: wrap;
      gap: var(--sp-3);
    }

    .qp-stat-card {
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

    .qp-stat-card:hover {
      border-color: var(--sero-border-strong);
      background: var(--sero-surface-2);
      transform: translateY(-1px);
    }

    .qp-stat-count {
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

    .qp-stat-label {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--sero-text-primary);
      white-space: nowrap;
    }

    .qp-stat-icon {
      width: 32px;
      height: 32px;
      border-radius: var(--r-full);
      background: var(--sero-surface-3);
      color: var(--sero-text-secondary);
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .qp-stat-icon .material-icons-round {
      font-size: 17px;
    }

    .qp-stat-card--active {
      background: var(--sero-primary);
      border-color: var(--sero-primary);
    }

    .qp-stat-card--active .qp-stat-label {
      color: #fff;
    }

    .qp-stat-card--active .qp-stat-count {
      background: #fff;
      color: var(--sero-primary-dark);
    }

    .qp-stat-card--active .qp-stat-icon {
      background: rgba(255, 255, 255, 0.18);
      color: #fff;
    }

    /* ── Action bar ── */
    .qp-action-bar {
      display: flex;
      align-items: center;
      gap: var(--sp-3);
      flex-wrap: wrap;
      padding: var(--sp-3);
      border: 1px solid var(--sero-border-light);
      border-radius: var(--r-xl);
      background: var(--sero-card-bg);
    }

    .qp-search {
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

    .qp-search-icon {
      font-size: 18px;
      color: var(--sero-text-muted);
      flex-shrink: 0;
    }

    .qp-search-input {
      flex: 1;
      min-width: 0;
      border: none;
      outline: none;
      background: transparent;
      font-family: var(--sero-font);
      font-size: 0.85rem;
      color: var(--sero-text-primary);
    }

    .qp-search-input::placeholder {
      color: var(--sero-text-muted);
    }

    .qp-btn {
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

    .qp-btn .material-icons-round {
      font-size: 18px;
    }

    .qp-btn--primary {
      background: var(--sero-primary);
      color: #fff;
    }

    .qp-btn--primary:hover {
      background: var(--sero-primary-dark);
    }

    .qp-btn--outline {
      background: var(--sero-card-bg);
      color: var(--sero-text-primary);
      border-color: var(--sero-border);
    }

    .qp-btn--outline:hover,
    .qp-btn--outline.qp-btn--active {
      background: var(--sero-surface-2);
      border-color: var(--sero-border-strong);
    }

    .qp-btn--ghost {
      background: transparent;
      color: var(--sero-text-secondary);
    }

    .qp-btn--ghost:hover {
      background: var(--sero-surface-2);
      color: var(--sero-text-primary);
    }

    /* ── Advanced filters ── */
    .qp-adv-filters {
      display: flex;
      align-items: flex-end;
      gap: var(--sp-4);
      flex-wrap: wrap;
      padding: var(--sp-3) var(--sp-4);
      border: 1px solid var(--sero-border-light);
      border-radius: var(--r-xl);
      background: var(--sero-surface-2);
    }

    .qp-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 180px;
    }

    .qp-field label {
      font-size: 0.72rem;
      font-weight: 800;
      color: var(--sero-text-secondary);
    }

    .qp-clear-filters {
      height: 42px;
    }

    /* ── Table card ── */
    .qp-table-card {
      background: var(--sero-card-bg);
      border: 1px solid var(--sero-border-light);
      border-radius: var(--r-xl);
      overflow: hidden;
    }

    .qp-table-wrap {
      overflow-x: auto;
    }

    .qp-table {
      width: 100%;
      min-width: 1180px;
      border-collapse: collapse;
    }

    .qp-table thead tr {
      background: var(--sero-primary);
    }

    .qp-table th {
      color: rgba(255, 255, 255, 0.92);
      font-size: 0.72rem;
      font-weight: 800;
      text-align: center;
      padding: var(--sp-3) var(--sp-3);
      white-space: nowrap;
    }

    .qp-table td {
      border-bottom: 1px solid var(--sero-border-light);
      color: var(--sero-text-primary);
      font-size: 0.8rem;
      text-align: center;
      padding: var(--sp-3);
      white-space: nowrap;
      vertical-align: middle;
    }

    .qp-table tbody tr:hover {
      background: color-mix(in srgb, var(--sero-surface-2) 70%, var(--sero-card-bg));
    }

    .qp-table tbody tr:last-child td {
      border-bottom: none;
    }

    .qp-strong {
      font-weight: 800;
    }

    .qp-amount {
      font-weight: 700;
      white-space: nowrap;
    }

    .qp-date-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
      line-height: 1.3;
    }

    .qp-date-time {
      font-size: 0.72rem;
      color: var(--sero-text-secondary);
    }

    .qp-type-chip {
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

    .qp-type-chip .material-icons-round {
      font-size: 15px;
      color: var(--sero-text-secondary);
    }

    /* ── Status badges ── */
    .qp-badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 12px;
      border-radius: var(--r-full);
      font-size: 0.72rem;
      font-weight: 800;
      border: 1px solid transparent;
      white-space: nowrap;
    }

    .qp-badge--success  { background: var(--sero-success-bg);  color: var(--sero-success);  border-color: var(--sero-success-border); }
    .qp-badge--warning  { background: var(--sero-warning-bg);  color: var(--sero-warning);  border-color: var(--sero-warning-border); }
    .qp-badge--danger   { background: var(--sero-danger-bg);   color: var(--sero-danger);   border-color: var(--sero-danger-border); }
    .qp-badge--info     { background: var(--sero-info-bg);     color: var(--sero-info);     border-color: var(--sero-info-border); }
    .qp-badge--muted    { background: var(--sero-surface-3);   color: var(--sero-text-secondary); border-color: var(--sero-border); }

    /* ── Row actions ── */
    .qp-row-actions {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .qp-icon-btn {
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

    .qp-icon-btn .material-icons-round {
      font-size: 16px;
    }

    .qp-icon-btn:hover {
      background: var(--sero-primary-50);
      border-color: var(--sero-primary-100);
      color: var(--sero-primary-dark);
    }

    .qp-more-wrap {
      position: relative;
      display: inline-flex;
    }

    .qp-more-menu {
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

    .qp-more-menu button {
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

    .qp-more-menu button:hover {
      background: var(--sero-surface-2);
    }

    .qp-more-menu button .material-icons-round {
      font-size: 16px;
      color: var(--sero-text-secondary);
    }

    .qp-more-menu-danger {
      color: var(--sero-danger) !important;
    }

    .qp-more-menu-danger .material-icons-round {
      color: var(--sero-danger) !important;
    }

    .qp-more-menu-danger:hover {
      background: var(--sero-danger-bg) !important;
    }

    /* ── Footer summary row ── */
    .qp-footer-row td {
      background: var(--sero-surface-2);
      font-weight: 800;
      border-top: 2px solid var(--sero-border);
      border-bottom: none;
    }

    .qp-footer-label {
      text-align: end;
      color: var(--sero-text-secondary);
    }

    /* ── Empty / loading state ── */
    .qp-state-cell {
      padding: 48px 16px !important;
      white-space: normal !important;
    }

    .qp-state-cell .material-icons-round {
      font-size: 40px;
      color: var(--sero-border-strong);
    }

    .qp-state-cell h3 {
      margin: 10px 0 4px;
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--sero-text-primary);
    }

    .qp-state-cell p {
      margin: 0;
      font-size: 0.8rem;
      color: var(--sero-text-secondary);
    }

    .qp-spinner {
      width: 26px;
      height: 26px;
      margin: 0 auto;
      border: 3px solid var(--sero-border-light);
      border-top-color: var(--sero-primary);
      border-radius: 50%;
      animation: qp-spin 0.8s linear infinite;
    }

    @keyframes qp-spin {
      to { transform: rotate(360deg); }
    }

    .qp-pagination {
      display: flex;
      justify-content: center;
      padding: var(--sp-4);
      border-top: 1px solid var(--sero-border-light);
    }

    @media (max-width: 900px) {
      .qp-header {
        flex-direction: column-reverse;
        align-items: flex-start;
      }
    }
  `],
})
export class QuotationsPageComponent implements OnInit {
  private readonly quotationsService = inject(QuotationsService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  readonly typeMeta = QUOTATION_TYPE_META;
  readonly pageSize = 10;

  readonly paymentOptions: SeroDropdownOption<PaymentStatus>[] = [
    { value: 'paid', labelKey: 'quotations.payment.paid' },
    { value: 'partially_paid', labelKey: 'quotations.payment.partial' },
    { value: 'unpaid', labelKey: 'quotations.payment.unpaid' },
  ];

  readonly operationOptions: SeroDropdownOption<OperationStatus>[] = [
    { value: 'preparing', labelKey: 'quotations.operation.preparing' },
    { value: 'account_manager_approved', labelKey: 'quotations.operation.amApproved' },
    { value: 'operation_approved', labelKey: 'quotations.operation.opApproved' },
    { value: 'rejected', labelKey: 'quotations.operation.rejected' },
  ];

  readonly agentStatusOptions: SeroDropdownOption<AgentStatus>[] = [
    { value: 'preparing', labelKey: 'quotations.agentStatus.preparing' },
    { value: 'in_progress', labelKey: 'quotations.agentStatus.inProgress' },
    { value: 'completed', labelKey: 'quotations.agentStatus.completed' },
    { value: 'cancelled', labelKey: 'quotations.agentStatus.cancelled' },
  ];

  rows = signal<QuotationRow[]>([]);
  isLoading = signal(false);
  page = signal(1);
  totalCount = signal(0);
  typeCounts = signal<TypeCounts>({});

  activeType = signal<QuotationTypeFilter>('all');
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

  countFor(type: QuotationTypeFilter): number {
    return this.typeCounts()[type] ?? 0;
  }

  iconForType(type: QuotationRow['type']): string {
    return this.typeMeta.find((m) => m.type === type)?.icon ?? 'receipt_long';
  }

  typeLabelKey(type: QuotationRow['type']): string {
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

  selectType(type: QuotationTypeFilter): void {
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

  viewRow(row: QuotationRow): void {
    this.notify('quotations.feedback.view', row);
  }

  editRow(row: QuotationRow): void {
    this.notify('quotations.feedback.edit', row);
  }

  printRow(row: QuotationRow): void {
    this.notify('quotations.feedback.print', row);
  }

  duplicateRow(row: QuotationRow): void {
    this.openMoreMenuId.set(null);
    this.notify('quotations.feedback.duplicate', row);
  }

  downloadPdf(row: QuotationRow): void {
    this.openMoreMenuId.set(null);
    this.notify('quotations.feedback.downloadPdf', row);
  }

  viewStatusLog(row: QuotationRow): void {
    this.openMoreMenuId.set(null);
    this.notify('quotations.feedback.statusLog', row);
  }

  deleteRow(row: QuotationRow): void {
    this.openMoreMenuId.set(null);
    this.notify('quotations.feedback.delete', row);
  }

  exportCsv(): void {
    this.quotationsService.getAllMatching(this.currentFilters()).subscribe((rows) => {
      const header = ['Type', 'Quotation No.', 'Quotation Date', 'Agent', 'Total Price', 'Paid', 'Remaining', 'Payment Status', 'Operation Status', 'Agent Status'];
      const lines = rows.map((r) => [
        r.type, r.quotationNo, r.quotationDate, r.agent, r.totalPrice, r.paid, r.remaining,
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
        this.translate.instant('quotations.feedback.exportStarted', { count: rows.length }),
        this.translate.instant('Close'),
        { duration: 2500 },
      );
    });
  }

  private notify(key: string, row: QuotationRow): void {
    this.snackBar.open(
      this.translate.instant(key, { no: row.quotationNo }),
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
    this.quotationsService.getQuotations({
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
    this.quotationsService.getTypeCounts().subscribe((counts) => {
      this.typeCounts.set(counts);
    });
  }
}
