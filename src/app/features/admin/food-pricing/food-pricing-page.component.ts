import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy } from '@angular/core';
import { SeroDatePickerComponent } from '../../../shared/components/sero-date-picker/sero-date-picker.component';
import { SeroDropdownComponent } from '../../../shared/components/sero-dropdown/sero-dropdown.component';
import { StatusTogglePillComponent } from '../../../shared/components/status-toggle-pill/status-toggle-pill.component';
import { TableFilterHeaderComponent } from '../../../shared/components/table-filter-header/table-filter-header.component';
import { FoodPricingPackageFormComponent, FoodPricingPackageFormMode } from './food-pricing-package-form.component';
import {
  FOOD_PRICING_CATERING_COMPANY_OPTIONS,
  FOOD_PRICING_DEFAULT_FILTERS,
  FOOD_PRICING_FOOD_TYPE_OPTIONS,
  FOOD_PRICING_ITEMS_PER_PAGE_OPTIONS,
  FOOD_PRICING_MEAL_PLAN_OPTIONS,
  FOOD_PRICING_ROWS,
  FOOD_PRICING_STATUS_OPTIONS,
  FoodPricingFilterState,
  FoodPricingPackageModel,
  FoodPricingRow,
  FoodPricingStatusFilter,
} from './food-pricing.mock';

@Component({
  selector: 'app-food-pricing-page',
  standalone: true,
  imports: [
    CommonModule,
    SeroDropdownComponent,
    SeroDatePickerComponent,
    StatusTogglePillComponent,
    TableFilterHeaderComponent,
    FoodPricingPackageFormComponent,
  ],
  template: `
    <section class="food-pricing-page" dir="rtl">
      <header class="page-head">
        <h1>تسعيرات التغذية</h1>
      </header>

      @if (successMessage) {
        <div class="success-message" role="status">
          <span class="material-icons-round">check_circle</span>
          <span>{{ successMessage }}</span>
        </div>
      }

      <section class="surface-card">
        <app-table-filter-header [(expanded)]="filtersExpanded">
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
              <label>شركة التموين</label>
              <app-sero-dropdown
                [options]="cateringCompanyOptions"
                [value]="filters.cateringCompany"
                (valueChange)="onCateringCompanyChange($event)">
              </app-sero-dropdown>
            </div>

            <div class="field-group">
              <label>نوع الطعام</label>
              <app-sero-dropdown
                [options]="foodTypeOptions"
                [value]="filters.foodType"
                (valueChange)="onFoodTypeChange($event)">
              </app-sero-dropdown>
            </div>

            <div class="field-group">
              <label>خطة الوجبات</label>
              <app-sero-dropdown
                [options]="mealPlanOptions"
                [value]="filters.mealPlan"
                (valueChange)="onMealPlanChange($event)">
              </app-sero-dropdown>
            </div>
          </div>
        </app-table-filter-header>

        <div class="actions-bar">
          <div class="filters-actions">
            <button type="button" class="btn btn--primary btn--sm" (click)="search()">بحث</button>
            <button type="button" class="btn btn--secondary btn--sm" (click)="clear()">مسح</button>
          </div>

          <button type="button" class="btn btn--primary btn--sm add-package-btn" (click)="openPackageForm()">
            <span class="material-icons-round">add</span>
            <span>إضافة باقة تموين</span>
          </button>
        </div>

        <div class="table-wrap">
          <table class="food-table">
            <thead>
              <tr>
                <th>رمز الباقة</th>
                <th>عنوان الباقة</th>
                <th>تاريخ البداية</th>
                <th>تاريخ النهاية</th>
                <th>فعال</th>
                <th>الإجراء</th>
              </tr>
            </thead>
            <tbody>
              @if (pagedRows.length === 0) {
                <tr>
                  <td colspan="6" class="empty-cell">لا توجد بيانات</td>
                </tr>
              } @else {
                @for (row of pagedRows; track row.id) {
                  <tr>
                    <td>{{ row.code }}</td>
                    <td>{{ row.title }}</td>
                    <td>{{ row.startDate }}</td>
                    <td>{{ row.endDate }}</td>
                    <td>
                      <app-status-toggle-pill
                        [isActive]="row.isActive"
                        activeLabel="فعال"
                        inactiveLabel="غير فعال"
                        activateMessage="هل تريد تفعيل العنصر؟"
                        deactivateMessage="هل تريد إلغاء التفعيل؟"
                        (statusChange)="toggleRowStatus(row.id, $event)">
                      </app-status-toggle-pill>
                    </td>
                    <td class="action-cell">
                      <div class="action-menu-wrap" (click)="$event.stopPropagation()">
                        <button
                          type="button"
                          class="table-action-btn"
                          [class.is-open]="openedActionMenuId === row.id"
                          (click)="toggleActionMenu(row.id, $event)"
                          aria-haspopup="menu"
                          [attr.aria-expanded]="openedActionMenuId === row.id"
                          aria-label="إجراءات">
                          ...
                        </button>

                        @if (openedActionMenuId === row.id) {
                          <div class="row-actions-menu" role="menu">
                            <button type="button" class="row-action-item" role="menuitem" (click)="viewRow(row, $event)">
                              <span class="material-icons-round">visibility</span>
                              <span>عرض</span>
                            </button>
                            <button type="button" class="row-action-item" role="menuitem" (click)="editRow(row, $event)">
                              <span class="material-icons-round">edit</span>
                              <span>تعديل</span>
                            </button>
                            <button type="button" class="row-action-item row-action-item--danger" role="menuitem" (click)="deleteRow(row.id, $event)">
                              <span class="material-icons-round">delete</span>
                              <span>حذف</span>
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

            <span class="page-counter">{{ rangeStart }} – {{ rangeEnd }} of {{ totalItemsCount }}</span>

            <div class="items-per-page">
              <app-sero-dropdown
                [options]="itemsPerPageDropdownOptions"
                [value]="itemsPerPage"
                size="sm"
                (valueChange)="onItemsPerPageChange($event)">
              </app-sero-dropdown>
              <span>Items per page:</span>
            </div>
          </div>
        </footer>
      </section>

      @if (packageFormOpen) {
        <div class="package-modal-backdrop" (click)="closePackageForm()">
          <app-food-pricing-package-form
            [mode]="packageFormMode"
            [companyOptions]="editableCateringCompanyOptions"
            [initialData]="selectedPackageData"
            (save)="savePackage($event)"
            (close)="closePackageForm()"
            (switchToEdit)="switchPackageFormToEdit()"
            (click)="$event.stopPropagation()">
          </app-food-pricing-package-form>
        </div>
      }
    </section>
  `,
  styles: [`
    .food-pricing-page {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .page-head h1 {
      font-size: 1rem;
      font-weight: 800;
      color: var(--sero-text-primary);
    }

    .success-message {
      border: 1px solid var(--sero-success-border);
      border-radius: 8px;
      background: var(--sero-success-bg);
      color: var(--sero-success);
      display: inline-flex;
      align-items: center;
      align-self: flex-start;
      gap: 8px;
      padding: 10px 12px;
      font-size: 0.78rem;
      font-weight: 800;
      box-shadow: var(--shadow-sm);
      animation: successIn 0.18s ease-out;
    }

    .success-message .material-icons-round {
      font-size: 18px;
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
      grid-template-columns: repeat(5, minmax(0, 1fr));
      gap: 10px 14px;
      padding: 14px;
      border-bottom: 1px solid var(--sero-border-light);
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 0;
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

    .add-package-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    .add-package-btn .material-icons-round {
      font-size: 16px;
    }

    .table-wrap {
      padding: 0 0 8px;
      overflow-x: auto;
    }

    .food-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 820px;
    }

    .food-table thead tr {
      background: var(--sero-primary);
    }

    .food-table th {
      color: rgba(255, 255, 255, 0.92);
      font-size: 0.72rem;
      font-weight: 700;
      text-align: center;
      padding: 10px 12px;
      white-space: nowrap;
    }

    .food-table td {
      border-bottom: 1px solid var(--sero-border-light);
      color: var(--sero-text-primary);
      font-size: 0.76rem;
      text-align: center;
      padding: 10px 12px;
      white-space: nowrap;
    }

    .food-table tbody tr:hover {
      background: #fbfcfa;
    }

    .food-table tbody tr:last-child td {
      border-bottom: none;
    }

    .empty-cell {
      color: var(--sero-text-muted);
      padding: 16px;
      text-align: center;
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

    .food-table tbody tr:nth-last-child(-n + 2) .row-actions-menu {
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

    .row-action-item:hover {
      background: var(--sero-primary-50);
      border-color: var(--sero-primary-100);
      color: var(--sero-primary-dark);
      transform: translateX(-1px);
    }

    .row-action-item:hover .material-icons-round {
      color: var(--sero-primary);
    }

    .row-action-item--danger {
      color: var(--sero-danger);
    }

    .row-action-item--danger .material-icons-round,
    .row-action-item--danger:hover .material-icons-round {
      color: var(--sero-danger);
    }

    .row-action-item--danger:hover {
      background: var(--sero-danger-bg);
      border-color: var(--sero-danger-border);
      color: var(--sero-danger);
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

    .pagination-bar {
      border-top: 1px solid var(--sero-border-light);
      padding: 10px 14px;
    }

    .pagination-controls {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 10px;
      flex-wrap: wrap;
    }

    .pager-btn {
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

    .pager-btn:hover:not(:disabled) {
      background: var(--sero-primary-50);
      border-color: var(--sero-primary-100);
      color: var(--sero-primary);
    }

    .pager-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .pager-btn .material-icons-round {
      font-size: 18px;
    }

    .page-counter {
      color: var(--sero-text-secondary);
      font-size: 0.78rem;
      font-weight: 700;
      min-width: 84px;
      text-align: center;
      direction: ltr;
    }

    .items-per-page {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--sero-text-secondary);
      font-size: 0.76rem;
      font-weight: 700;
    }

    .items-per-page app-sero-dropdown {
      width: 72px;
    }

    .package-modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: color-mix(in srgb, var(--sero-text-primary) 32%, transparent);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    @keyframes successIn {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 1100px) {
      .filters-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }

    @media (max-width: 760px) {
      .filters-grid {
        grid-template-columns: 1fr;
      }

      .actions-bar,
      .pagination-controls {
        justify-content: flex-start;
      }
    }
  `],
})
export class FoodPricingPageComponent implements OnDestroy {
  readonly statusOptions = FOOD_PRICING_STATUS_OPTIONS;
  readonly cateringCompanyOptions = FOOD_PRICING_CATERING_COMPANY_OPTIONS;
  readonly editableCateringCompanyOptions = FOOD_PRICING_CATERING_COMPANY_OPTIONS.filter((option) => option.value !== 'all');
  readonly foodTypeOptions = FOOD_PRICING_FOOD_TYPE_OPTIONS;
  readonly mealPlanOptions = FOOD_PRICING_MEAL_PLAN_OPTIONS;
  readonly itemsPerPageOptions = FOOD_PRICING_ITEMS_PER_PAGE_OPTIONS;

  readonly itemsPerPageDropdownOptions = this.itemsPerPageOptions.map((count) => ({
    value: count,
    label: String(count),
  }));

  filters: FoodPricingFilterState = { ...FOOD_PRICING_DEFAULT_FILTERS };
  filtersExpanded = true;
  openedActionMenuId: string | null = null;
  packageFormOpen = false;
  packageFormMode: FoodPricingPackageFormMode = 'create';
  selectedPackageRow: FoodPricingRow | null = null;
  selectedPackageData: FoodPricingPackageModel | null = null;
  successMessage = '';
  private successMessageTimer: ReturnType<typeof setTimeout> | null = null;

  private allRows: FoodPricingRow[] = [...FOOD_PRICING_ROWS];
  private filteredRows: FoodPricingRow[] = [...this.allRows];

  currentPage = 1;
  itemsPerPage = this.itemsPerPageOptions[0];

  get totalItemsCount(): number {
    return this.filteredRows.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalItemsCount / this.itemsPerPage));
  }

  get rangeStart(): number {
    if (this.totalItemsCount === 0) {
      return 0;
    }

    return ((this.currentPage - 1) * this.itemsPerPage) + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.currentPage * this.itemsPerPage, this.totalItemsCount);
  }

  get pagedRows(): FoodPricingRow[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredRows.slice(startIndex, startIndex + this.itemsPerPage);
  }

  ngOnDestroy(): void {
    if (this.successMessageTimer) {
      clearTimeout(this.successMessageTimer);
    }
  }

  onStartDateChange(value: string): void {
    this.filters = { ...this.filters, startDate: value };
  }

  onStatusChange(value: FoodPricingStatusFilter): void {
    this.filters = { ...this.filters, status: value };
  }

  onCateringCompanyChange(value: string): void {
    this.filters = { ...this.filters, cateringCompany: value };
  }

  onFoodTypeChange(value: string): void {
    this.filters = { ...this.filters, foodType: value };
  }

  onMealPlanChange(value: string): void {
    this.filters = { ...this.filters, mealPlan: value };
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
    this.filters = { ...FOOD_PRICING_DEFAULT_FILTERS };
    this.filteredRows = [...this.allRows];
    this.currentPage = 1;
    this.itemsPerPage = this.itemsPerPageOptions[0];
    this.openedActionMenuId = null;
  }


  toggleActionMenu(rowId: string, event: Event): void {
    event.stopPropagation();
    this.openedActionMenuId = this.openedActionMenuId === rowId ? null : rowId;
  }

  viewRow(row: FoodPricingRow, event: Event): void {
    event.stopPropagation();
    this.openPackageForm('view', row);
    this.openedActionMenuId = null;
  }

  editRow(row: FoodPricingRow, event: Event): void {
    event.stopPropagation();
    this.openPackageForm('edit', row);
    this.openedActionMenuId = null;
  }

  deleteRow(rowId: string, event: Event): void {
    event.stopPropagation();
    this.allRows = this.allRows.filter((row) => row.id !== rowId);
    this.filteredRows = this.getFilteredRows();
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    this.openedActionMenuId = null;
    if (this.selectedPackageRow?.id === rowId) {
      this.closePackageForm();
    }
  }

  toggleRowStatus(rowId: string, isActive: boolean): void {
    // Future backend integration: replace this local update with a status API call.
    this.allRows = this.allRows.map((row) => row.id === rowId ? { ...row, isActive } : row);
    this.filteredRows = this.getFilteredRows();
    this.currentPage = Math.min(this.currentPage, this.totalPages);

    if (this.selectedPackageRow?.id === rowId) {
      this.selectedPackageRow = { ...this.selectedPackageRow, isActive };
      this.selectedPackageData = this.toPackageModel(this.selectedPackageRow);
    }
  }

  openPackageForm(mode: FoodPricingPackageFormMode = 'create', row: FoodPricingRow | null = null): void {
    this.packageFormMode = mode;
    this.selectedPackageRow = row ? { ...row } : null;
    this.selectedPackageData = row ? this.toPackageModel(row) : null;
    this.packageFormOpen = true;
    this.openedActionMenuId = null;
    this.successMessage = '';
  }

  closePackageForm(): void {
    this.packageFormOpen = false;
    this.selectedPackageRow = null;
    this.selectedPackageData = null;
    this.packageFormMode = 'create';
  }

  switchPackageFormToEdit(): void {
    if (!this.selectedPackageRow) {
      return;
    }

    this.packageFormMode = 'edit';
  }

  savePackage(packageValue: FoodPricingPackageModel): void {
    if (this.packageFormMode === 'edit' && this.selectedPackageRow) {
      this.updatePackage(this.selectedPackageRow.id, packageValue);
      this.closePackageForm();
      this.showSuccessMessage('تم حفظ التعديلات بنجاح');
      return;
    }

    const fallbackFoodType = this.foodTypeOptions.find((option) => option.value !== 'all')?.value ?? '';
    const fallbackMealPlan = this.mealPlanOptions.find((option) => option.value !== 'all')?.value ?? '';
    const newRow: FoodPricingRow = {
      id: `food-${Date.now()}`,
      ...packageValue,
      foodType: fallbackFoodType,
      mealPlan: fallbackMealPlan,
    };

    // Future backend integration: replace this local insert with a create-package API call.
    this.allRows = [newRow, ...this.allRows];
    this.filteredRows = this.getFilteredRows();
    this.currentPage = 1;
    this.closePackageForm();
    this.showSuccessMessage('تمت إضافة باقة التموين بنجاح');
  }

  @HostListener('document:click')
  closeOpenActionMenu(): void {
    this.openedActionMenuId = null;
  }

  @HostListener('document:keydown.escape')
  closeOverlayOnEscape(): void {
    this.openedActionMenuId = null;
    this.closePackageForm();
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

  private updatePackage(rowId: string, packageValue: FoodPricingPackageModel): void {
    // Future backend integration: replace this local update with an update-package API call.
    this.allRows = this.allRows.map((row) => row.id === rowId ? { ...row, ...packageValue } : row);
    this.filteredRows = this.getFilteredRows();
    this.currentPage = Math.min(this.currentPage, this.totalPages);
  }

  private toPackageModel(row: FoodPricingRow): FoodPricingPackageModel {
    return {
      code: row.code,
      title: row.title,
      cateringCompany: row.cateringCompany,
      startDate: row.startDate,
      endDate: row.endDate,
      isActive: row.isActive,
    };
  }

  private getFilteredRows(): FoodPricingRow[] {
    return this.allRows.filter((row) => {
      const dateMatch = !this.filters.startDate || row.startDate === this.filters.startDate;
      const statusMatch = this.filters.status === 'all'
        || (this.filters.status === 'فعال' && row.isActive)
        || (this.filters.status === 'غير فعال' && !row.isActive);
      const companyMatch = this.filters.cateringCompany === 'all' || row.cateringCompany === this.filters.cateringCompany;
      const foodTypeMatch = this.filters.foodType === 'all' || row.foodType === this.filters.foodType;
      const mealPlanMatch = this.filters.mealPlan === 'all' || row.mealPlan === this.filters.mealPlan;

      return dateMatch && statusMatch && companyMatch && foodTypeMatch && mealPlanMatch;
    });
  }

  private showSuccessMessage(message: string): void {
    this.successMessage = message;

    if (this.successMessageTimer) {
      clearTimeout(this.successMessageTimer);
    }

    this.successMessageTimer = setTimeout(() => {
      this.successMessage = '';
      this.successMessageTimer = null;
    }, 3200);
  }
}
