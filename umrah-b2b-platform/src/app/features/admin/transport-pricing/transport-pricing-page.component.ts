import { CommonModule } from '@angular/common';
import { Component, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SeroDatePickerComponent } from '../../../shared/components/sero-date-picker/sero-date-picker.component';
import { SeroDropdownComponent } from '../../../shared/components/sero-dropdown/sero-dropdown.component';
import {
  TRANSPORT_PRICING_COMPANY_OPTIONS,
  TRANSPORT_PRICING_DEFAULT_FILTERS,
  TRANSPORT_PRICING_ITEMS_PER_PAGE_OPTIONS,
  TRANSPORT_PRICING_STATUS_OPTIONS,
  TRANSPORT_PRICING_VEHICLE_OPTIONS,
  TransportPricingFilterState,
  TransportPricingRow,
  TransportPricingStatusFilter,
} from './transport-pricing.mock';
import { TransportPricingLocalStoreService } from './transport-pricing-local-store.service';

type EditableTransportPricingField = 'title' | 'vehicleType' | 'company' | 'startDate' | 'endDate';

@Component({
  selector: 'app-transport-pricing-page',
  standalone: true,
  imports: [CommonModule, SeroDropdownComponent, SeroDatePickerComponent],
  template: `
    <section class="transport-pricing-page" dir="rtl">
      <header class="page-head">
        <h1>تسعيرات النقل</h1>
      </header>

      <section class="surface-card">
        @if (!filtersHidden) {
          <div class="filters-grid">
            <div class="field-group">
              <label>تاريخ البداية</label>
              <app-sero-date-picker
                [value]="filters.startDate"
                placeholder="mm/dd/yyyy"
                (valueChange)="onStartDateChange($event)">
              </app-sero-date-picker>
            </div>

            <div class="field-group">
              <label>الحالة</label>
              <app-sero-dropdown
                [options]="statusOptions"
                [value]="filters.status"
                (valueChange)="onStatusChange($event)">
              </app-sero-dropdown>
            </div>

            <div class="field-group">
              <label>اسم الشركة</label>
              <app-sero-dropdown
                [options]="companyOptions"
                [value]="filters.company"
                (valueChange)="onCompanyChange($event)">
              </app-sero-dropdown>
            </div>

            <div class="field-group">
              <label>اسم نوع السيارة</label>
              <app-sero-dropdown
                [options]="vehicleOptions"
                [value]="filters.vehicleType"
                (valueChange)="onVehicleTypeChange($event)">
              </app-sero-dropdown>
            </div>
          </div>
        }

        <div class="actions-bar">
          <div class="filters-actions">
            <button type="button" class="btn btn--primary btn--sm" (click)="search()">بحث</button>
            <button type="button" class="btn btn--secondary btn--sm" (click)="clear()">مسح</button>
            <button type="button" class="btn btn--secondary btn--sm" (click)="toggleFilters()">
              {{ filtersHidden ? 'إظهار' : 'إخفاء' }}
            </button>
          </div>

          <button type="button" class="btn btn--primary btn--sm add-btn" (click)="openCreateForm()">
            <span class="material-icons-round">add</span>
            <span>باقة نقل جديد</span>
          </button>
        </div>

        <div class="table-wrap">
          <table class="transport-table">
            <thead>
              <tr>
                <th>الرمز</th>
                <th>العنوان</th>
                <th>نوع السيارة</th>
                <th>اسم الشركة</th>
                <th>تاريخ البداية</th>
                <th>تاريخ النهاية</th>
                <th>فعال</th>
                <th>الإجراء</th>
              </tr>
            </thead>
            <tbody>
              @if (pagedRows.length === 0) {
                <tr>
                  <td colspan="8" class="empty-cell">لا توجد بيانات</td>
                </tr>
              } @else {
                @for (row of pagedRows; track row.code) {
                  <tr [class.is-editing]="isRowEditing(row.code)">
                    <td>{{ row.code }}</td>
                    <td>
                      @if (isRowEditing(row.code)) {
                        <input
                          class="table-edit-input"
                          type="text"
                          [value]="editDraft?.title ?? row.title"
                          (input)="updateEditDraft('title', $any($event.target).value)" />
                      } @else {
                        {{ row.title }}
                      }
                    </td>
                    <td>
                      @if (isRowEditing(row.code)) {
                        <app-sero-dropdown
                          class="table-edit-dropdown"
                          [options]="editableVehicleOptions"
                          [value]="editDraft?.vehicleType ?? row.vehicleType"
                          size="sm"
                          (valueChange)="updateEditDraft('vehicleType', $event)">
                        </app-sero-dropdown>
                      } @else {
                        {{ row.vehicleType }}
                      }
                    </td>
                    <td>
                      @if (isRowEditing(row.code)) {
                        <app-sero-dropdown
                          class="table-edit-dropdown"
                          [options]="editableCompanyOptions"
                          [value]="editDraft?.company ?? row.company"
                          size="sm"
                          (valueChange)="updateEditDraft('company', $event)">
                        </app-sero-dropdown>
                      } @else {
                        {{ row.company }}
                      }
                    </td>
                    <td>
                      @if (isRowEditing(row.code)) {
                        <input
                          class="table-edit-input table-edit-input--date"
                          type="date"
                          [value]="editDraft?.startDate ?? row.startDate"
                          (input)="updateEditDraft('startDate', $any($event.target).value)" />
                      } @else {
                        {{ row.startDate }}
                      }
                    </td>
                    <td>
                      @if (isRowEditing(row.code)) {
                        <input
                          class="table-edit-input table-edit-input--date"
                          type="date"
                          [value]="editDraft?.endDate ?? row.endDate"
                          (input)="updateEditDraft('endDate', $any($event.target).value)" />
                      } @else {
                        {{ row.endDate }}
                      }
                    </td>
                    <td>
                      @if (isRowEditing(row.code)) {
                        <label class="table-switch">
                          <input
                            type="checkbox"
                            [checked]="editDraft?.isActive ?? row.isActive"
                            (change)="setEditDraftActive($any($event.target).checked)" />
                          <span class="table-switch-track" aria-hidden="true"></span>
                        </label>
                      } @else {
                        <span class="status-pill" [class.status-pill--active]="row.isActive" [class.status-pill--inactive]="!row.isActive">
                          {{ row.isActive ? 'نعم' : 'لا' }}
                        </span>
                      }
                    </td>
                    <td class="action-cell">
                      <div class="action-menu-wrap" (click)="$event.stopPropagation()">
                        <button
                          type="button"
                          class="table-action-btn"
                          [class.is-open]="openedActionMenuId === row.code"
                          (click)="toggleActionMenu(row.code, $event)"
                          aria-haspopup="menu"
                          [attr.aria-expanded]="openedActionMenuId === row.code"
                          aria-label="إجراءات">
                          ...
                        </button>

                        @if (openedActionMenuId === row.code) {
                          <div class="row-actions-menu" role="menu">
                            <button type="button" class="row-action-item" role="menuitem" (click)="openDetails(row, $event)">
                              <span class="material-icons-round">visibility</span>
                              <span>عرض</span>
                            </button>
                            <button type="button" class="row-action-item" role="menuitem" (click)="startEdit(row, $event)">
                              <span class="material-icons-round">edit</span>
                              <span>تعديل</span>
                            </button>
                            <button
                              type="button"
                              class="row-action-item"
                              role="menuitem"
                              [disabled]="!isRowEditing(row.code)"
                              (click)="saveEdit(row.code, $event)">
                              <span class="material-icons-round">save</span>
                              <span>حفظ</span>
                            </button>
                          </div>
                        }
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <footer class="pagination-bar">
          <div class="pagination-controls">
            <button type="button" class="pager-btn" (click)="goToPreviousPage()" [disabled]="currentPage === 1">
              <span class="material-icons-round">chevron_right</span>
            </button>
            <button type="button" class="pager-btn" (click)="goToNextPage()" [disabled]="currentPage === totalPages">
              <span class="material-icons-round">chevron_left</span>
            </button>

            <span class="page-counter">{{ shownItemsCount }} of {{ totalItemsCount }}</span>

            <div class="items-per-page">
              <app-sero-dropdown
                [options]="itemsPerPageDropdownOptions"
                [value]="itemsPerPage"
                size="sm"
                (valueChange)="onItemsPerPageChange($event)">
              </app-sero-dropdown>
              <span>items per page</span>
            </div>
          </div>
        </footer>
      </section>

      @if (viewedRow) {
        <div class="details-modal-backdrop" (click)="closeDetails()">
          <section class="details-modal" role="dialog" aria-modal="true" aria-labelledby="transport-details-title" (click)="$event.stopPropagation()">
            <header class="details-modal-head">
              <h2 id="transport-details-title">تفاصيل باقة النقل</h2>
              <button type="button" class="details-close-btn" (click)="closeDetails()" aria-label="إغلاق">
                <span class="material-icons-round">close</span>
              </button>
            </header>

            <div class="details-grid">
              <div class="details-item">
                <span>الرمز</span>
                <strong>{{ viewedRow.code }}</strong>
              </div>
              <div class="details-item">
                <span>العنوان</span>
                <strong>{{ viewedRow.title }}</strong>
              </div>
              <div class="details-item">
                <span>نوع السيارة</span>
                <strong>{{ viewedRow.vehicleType }}</strong>
              </div>
              <div class="details-item">
                <span>اسم الشركة</span>
                <strong>{{ viewedRow.company }}</strong>
              </div>
              <div class="details-item">
                <span>تاريخ البداية</span>
                <strong>{{ viewedRow.startDate }}</strong>
              </div>
              <div class="details-item">
                <span>تاريخ النهاية</span>
                <strong>{{ viewedRow.endDate }}</strong>
              </div>
              <div class="details-item">
                <span>فعال</span>
                <strong>{{ viewedRow.isActive ? 'نعم' : 'لا' }}</strong>
              </div>
            </div>
          </section>
        </div>
      }
    </section>
  `,
  styles: [`
    .transport-pricing-page {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .page-head h1 {
      font-size: 1rem;
      font-weight: 800;
      color: var(--sero-text-primary);
    }

    .surface-card {
      background: #fff;
      border: 1px solid var(--sero-border-light);
      border-radius: 8px;
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 10px 14px;
      padding: 14px;
      border-bottom: 1px solid var(--sero-border-light);
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .field-group label {
      font-size: 0.73rem;
      font-weight: 700;
      color: var(--sero-text-secondary);
    }

    .actions-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 10px;
      padding: 12px 14px;
    }

    .filters-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .add-btn {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .add-btn .material-icons-round {
      font-size: 16px;
    }

    .table-wrap {
      padding: 0 0 8px;
      overflow-x: auto;
    }

    .transport-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 980px;
    }

    .transport-table thead tr {
      background: var(--sero-primary);
    }

    .transport-table th {
      color: rgba(255, 255, 255, 0.92);
      font-size: 0.72rem;
      font-weight: 700;
      text-align: center;
      padding: 10px 12px;
      white-space: nowrap;
    }

    .transport-table td {
      border-bottom: 1px solid var(--sero-border-light);
      color: var(--sero-text-primary);
      font-size: 0.76rem;
      text-align: center;
      padding: 10px 12px;
      white-space: nowrap;
    }

    .transport-table tbody tr:hover {
      background: #fbfcfa;
    }

    .transport-table tbody tr.is-editing {
      background: var(--sero-primary-50);
    }

    .transport-table tbody tr:last-child td {
      border-bottom: none;
    }

    .empty-cell {
      color: var(--sero-text-muted);
      padding: 16px;
      text-align: center;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 44px;
      border-radius: 999px;
      padding: 2px 8px;
      font-size: 0.68rem;
      font-weight: 700;
    }

    .status-pill--active {
      color: var(--sero-success);
      background: var(--sero-success-bg);
    }

    .status-pill--inactive {
      color: var(--sero-danger);
      background: var(--sero-danger-bg);
    }

    .table-action-btn {
      min-width: 32px;
      height: 26px;
      border-radius: 8px;
      border: 1px solid var(--sero-border);
      background: #fff;
      color: var(--sero-text-secondary);
      font-size: 0.84rem;
      font-weight: 700;
      cursor: pointer;
      transition: background var(--t-fast), border-color var(--t-fast), color var(--t-fast), box-shadow var(--t-fast);
    }

    .table-action-btn:hover,
    .table-action-btn.is-open {
      background: var(--sero-primary-50);
      border-color: var(--sero-primary-100);
      color: var(--sero-primary-dark);
    }

    .table-action-btn.is-open {
      box-shadow: 0 0 0 3px rgba(58, 71, 42, 0.08);
    }

    .action-cell {
      position: relative;
      overflow: visible;
    }

    .action-menu-wrap {
      position: relative;
      display: inline-flex;
      justify-content: center;
    }

    .row-actions-menu {
      position: absolute;
      top: calc(100% + 6px);
      inset-inline-end: 0;
      z-index: 50;
      min-width: 132px;
      padding: 6px;
      border: 1px solid var(--sero-border-light);
      border-radius: 10px;
      background: #fff;
      box-shadow: 0 12px 32px rgba(15, 23, 42, 0.12), 0 2px 8px rgba(15, 23, 42, 0.06);
      transform-origin: top right;
      animation: actionMenuIn 0.14s ease-out;
    }

    .transport-table tbody tr:nth-last-child(-n + 2) .row-actions-menu {
      top: auto;
      bottom: calc(100% + 6px);
      transform-origin: bottom right;
    }

    .row-action-item {
      width: 100%;
      min-height: 34px;
      border: 1px solid transparent;
      border-radius: 8px;
      background: transparent;
      color: var(--sero-text-primary);
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 8px;
      padding: 7px 9px;
      font-family: var(--sero-font);
      font-size: 0.76rem;
      font-weight: 700;
      text-align: start;
      cursor: pointer;
      transition: background var(--t-fast), border-color var(--t-fast), color var(--t-fast), transform var(--t-fast);
    }

    .row-action-item .material-icons-round {
      font-size: 17px;
      color: var(--sero-text-muted);
      transition: color var(--t-fast);
    }

    .row-action-item:hover:not(:disabled) {
      background: var(--sero-primary-50);
      border-color: var(--sero-primary-100);
      color: var(--sero-primary-dark);
      transform: translateX(-1px);
    }

    .row-action-item:hover:not(:disabled) .material-icons-round {
      color: var(--sero-primary);
    }

    .row-action-item:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    @keyframes actionMenuIn {
      from {
        opacity: 0;
        transform: translateY(-4px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .table-edit-input {
      width: 150px;
      min-height: 34px;
      border: 1px solid var(--sero-border);
      border-radius: 8px;
      background: #fff;
      color: var(--sero-text-primary);
      font-family: var(--sero-font);
      font-size: 0.76rem;
      font-weight: 700;
      text-align: center;
      outline: none;
      padding: 6px 8px;
      box-sizing: border-box;
      transition: border-color var(--t-fast), box-shadow var(--t-fast);
    }

    .table-edit-input--date {
      width: 138px;
    }

    .table-edit-input:hover {
      border-color: var(--sero-border-strong);
    }

    .table-edit-input:focus {
      border-color: var(--sero-primary);
      box-shadow: 0 0 0 3px rgba(58, 71, 42, 0.1);
    }

    .table-edit-dropdown {
      display: inline-block;
      width: 150px;
      text-align: start;
    }

    .table-switch {
      position: relative;
      display: inline-flex;
      width: 38px;
      height: 22px;
      cursor: pointer;
      vertical-align: middle;
    }

    .table-switch input {
      position: absolute;
      inset: 0;
      opacity: 0;
      cursor: pointer;
      margin: 0;
      z-index: 2;
    }

    .table-switch-track {
      position: absolute;
      inset: 0;
      border-radius: 999px;
      background: var(--sero-border);
      transition: background var(--t-fast);
    }

    .table-switch-track::after {
      content: '';
      position: absolute;
      top: 2px;
      left: 2px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #fff;
      box-shadow: var(--shadow-sm);
      transition: transform var(--t-fast);
    }

    .table-switch input:checked + .table-switch-track {
      background: var(--sero-primary);
    }

    .table-switch input:checked + .table-switch-track::after {
      transform: translateX(16px);
    }

    .details-modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: rgba(15, 23, 42, 0.32);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    .details-modal {
      width: min(620px, 100%);
      background: #fff;
      border: 1px solid var(--sero-border-light);
      border-radius: 10px;
      box-shadow: 0 22px 60px rgba(15, 23, 42, 0.18);
      overflow: hidden;
      animation: detailsModalIn 0.14s ease-out;
    }

    .details-modal-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 14px 16px;
      border-bottom: 1px solid var(--sero-border-light);
    }

    .details-modal-head h2 {
      margin: 0;
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--sero-text-primary);
    }

    .details-close-btn {
      width: 30px;
      height: 30px;
      border: 1px solid var(--sero-border);
      border-radius: 8px;
      background: #fff;
      color: var(--sero-text-secondary);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background var(--t-fast), border-color var(--t-fast), color var(--t-fast);
    }

    .details-close-btn:hover {
      background: var(--sero-primary-50);
      border-color: var(--sero-primary-100);
      color: var(--sero-primary);
    }

    .details-close-btn .material-icons-round {
      font-size: 18px;
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
      padding: 16px;
    }

    .details-item {
      border: 1px solid var(--sero-border-light);
      border-radius: 8px;
      background: var(--sero-surface-2);
      display: flex;
      flex-direction: column;
      gap: 5px;
      padding: 10px 12px;
      min-width: 0;
    }

    .details-item span {
      color: var(--sero-text-muted);
      font-size: 0.7rem;
      font-weight: 700;
    }

    .details-item strong {
      color: var(--sero-text-primary);
      font-size: 0.82rem;
      font-weight: 800;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    @keyframes detailsModalIn {
      from {
        opacity: 0;
        transform: translateY(6px) scale(0.99);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .pagination-bar {
      border-top: 1px solid var(--sero-border-light);
      padding: 10px 14px;
      background: #fff;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      gap: 8px;
      flex-wrap: wrap;
    }

    .pager-btn {
      width: 28px;
      height: 26px;
      border: 1px solid var(--sero-border);
      border-radius: 8px;
      background: #fff;
      color: var(--sero-text-secondary);
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .pager-btn .material-icons-round {
      font-size: 16px;
    }

    .pager-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .page-counter {
      color: var(--sero-text-muted);
      font-size: 0.72rem;
      min-width: 56px;
      text-align: center;
    }

    .items-per-page {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin-inline-start: 6px;
      color: var(--sero-text-muted);
      font-size: 0.7rem;
    }

    .items-per-page app-sero-dropdown {
      width: 90px;
    }

    @media (max-width: 1150px) {
      .filters-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 680px) {
      .filters-grid {
        grid-template-columns: 1fr;
      }

      .actions-bar {
        flex-direction: column;
        align-items: stretch;
      }

      .filters-actions {
        justify-content: flex-start;
      }
    }
  `],
})
export class TransportPricingPageComponent {
  private readonly router = inject(Router);
  private readonly store = inject(TransportPricingLocalStoreService);

  readonly statusOptions = TRANSPORT_PRICING_STATUS_OPTIONS;
  readonly companyOptions = TRANSPORT_PRICING_COMPANY_OPTIONS;
  readonly vehicleOptions = TRANSPORT_PRICING_VEHICLE_OPTIONS;
  readonly editableCompanyOptions = TRANSPORT_PRICING_COMPANY_OPTIONS.filter((option) => option.value !== 'all');
  readonly editableVehicleOptions = TRANSPORT_PRICING_VEHICLE_OPTIONS.filter((option) => option.value !== 'all');
  readonly itemsPerPageOptions = TRANSPORT_PRICING_ITEMS_PER_PAGE_OPTIONS;

  readonly itemsPerPageDropdownOptions = this.itemsPerPageOptions.map((count) => ({
    value: count,
    label: String(count),
  }));

  filters: TransportPricingFilterState = { ...TRANSPORT_PRICING_DEFAULT_FILTERS };
  filtersHidden = false;
  openedActionMenuId: string | null = null;
  editingRowId: string | null = null;
  editDraft: TransportPricingRow | null = null;
  viewedRow: TransportPricingRow | null = null;

  private allRows: TransportPricingRow[] = this.store.getRows();
  private filteredRows: TransportPricingRow[] = [...this.allRows];

  currentPage = 1;
  itemsPerPage = this.itemsPerPageOptions[0];

  get totalItemsCount(): number {
    return this.filteredRows.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItemsCount / this.itemsPerPage));
  }

  get shownItemsCount(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItemsCount);
  }

  get pagedRows(): TransportPricingRow[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRows.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onStartDateChange(value: string): void {
    this.filters = { ...this.filters, startDate: value };
  }

  onStatusChange(value: TransportPricingStatusFilter): void {
    this.filters = { ...this.filters, status: value };
  }

  onCompanyChange(value: string): void {
    this.filters = { ...this.filters, company: value };
  }

  onVehicleTypeChange(value: string): void {
    this.filters = { ...this.filters, vehicleType: value };
  }

  onItemsPerPageChange(count: number): void {
    this.itemsPerPage = count;
    this.currentPage = 1;
  }

  search(): void {
    this.filteredRows = this.getFilteredRows();
    this.currentPage = 1;
    this.openedActionMenuId = null;
  }

  clear(): void {
    this.filters = { ...TRANSPORT_PRICING_DEFAULT_FILTERS };
    this.allRows = this.store.getRows();
    this.filteredRows = [...this.allRows];
    this.currentPage = 1;
    this.itemsPerPage = this.itemsPerPageOptions[0];
    this.openedActionMenuId = null;
  }

  toggleFilters(): void {
    this.filtersHidden = !this.filtersHidden;
  }

  openCreateForm(): void {
    void this.router.navigate(['/admin/pricing/transport/new']);
  }

  toggleActionMenu(rowCode: string, event: Event): void {
    event.stopPropagation();
    this.openedActionMenuId = this.openedActionMenuId === rowCode ? null : rowCode;
  }

  openDetails(row: TransportPricingRow, event: Event): void {
    event.stopPropagation();
    this.viewedRow = { ...row };
    this.openedActionMenuId = null;
  }

  closeDetails(): void {
    this.viewedRow = null;
  }

  startEdit(row: TransportPricingRow, event: Event): void {
    event.stopPropagation();
    this.editingRowId = row.code;
    this.editDraft = { ...row };
    this.openedActionMenuId = null;
  }

  saveEdit(rowCode: string, event: Event): void {
    event.stopPropagation();
    if (!this.editDraft || this.editingRowId !== rowCode) {
      return;
    }

    const savedRow: TransportPricingRow = {
      ...this.editDraft,
      title: this.editDraft.title.trim(),
    };

    this.store.updateRow(savedRow);
    this.allRows = this.store.getRows();
    this.filteredRows = this.getFilteredRows();
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    this.editingRowId = null;
    this.editDraft = null;
    this.openedActionMenuId = null;
  }

  isRowEditing(rowCode: string): boolean {
    return this.editingRowId === rowCode;
  }

  updateEditDraft(field: EditableTransportPricingField, value: string): void {
    if (!this.editDraft) {
      return;
    }
    this.editDraft = { ...this.editDraft, [field]: value };
  }

  setEditDraftActive(isActive: boolean): void {
    if (!this.editDraft) {
      return;
    }
    this.editDraft = { ...this.editDraft, isActive };
  }

  @HostListener('document:click')
  closeOpenActionMenu(): void {
    this.openedActionMenuId = null;
  }

  @HostListener('document:keydown.escape')
  closeActionMenuOnEscape(): void {
    this.openedActionMenuId = null;
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
    }
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage += 1;
    }
  }

  private getFilteredRows(): TransportPricingRow[] {
    return this.allRows.filter((row) => {
      const dateMatch = !this.filters.startDate || row.startDate === this.filters.startDate;
      const statusMatch = this.filters.status === 'all'
        || (this.filters.status === 'فعال' && row.isActive)
        || (this.filters.status === 'غير فعال' && !row.isActive);
      const companyMatch = this.filters.company === 'all' || row.company === this.filters.company;
      const vehicleMatch = this.filters.vehicleType === 'all' || row.vehicleType === this.filters.vehicleType;
      return dateMatch && statusMatch && companyMatch && vehicleMatch;
    });
  }
}
