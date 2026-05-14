import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { SeroDropdownComponent } from '../../../shared/components/sero-dropdown/sero-dropdown.component';
import { HotelCategoryFormComponent, HotelCategoryFormMode } from './hotel-category-form.component';
import { HOTEL_CATEGORIES_ITEMS_PER_PAGE_OPTIONS } from './hotel-categories.mock';
import { HotelCategoryFormValue, HotelCategoryModel } from './hotel-category.model';
import { HotelCategoriesService } from './hotel-categories.service';

@Component({
  selector: 'app-hotel-categories-page',
  standalone: true,
  imports: [CommonModule, SeroDropdownComponent, HotelCategoryFormComponent],
  template: `
    <section class="hotel-categories-page" dir="rtl">
      <header class="page-head">
        <h1>تصنيفات الفنادق</h1>
      </header>

      @if (successMessage) {
        <div class="success-message" role="status">
          <span class="material-icons-round">check_circle</span>
          <span>{{ successMessage }}</span>
        </div>
      }

      <section class="surface-card">
        <div class="actions-bar">
          <button type="button" class="btn btn--primary btn--sm add-btn" (click)="openCreateForm()">
            <span class="material-icons-round">add</span>
            <span>إضافة تصنيف جديد</span>
          </button>
        </div>

        <div class="table-wrap">
          <table class="categories-table">
            <thead>
              <tr>
                <th>العنوان</th>
                <th>الوصف</th>
                <th>الحالة</th>
                <th>Added</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              @if (pagedCategories.length === 0) {
                <tr>
                  <td colspan="5" class="empty-cell">لا توجد بيانات</td>
                </tr>
              } @else {
                @for (category of pagedCategories; track category.id) {
                  <tr>
                    <td class="title-cell">{{ category.title }}</td>
                    <td>{{ category.description || '-' }}</td>
                    <td>
                      <span class="status-pill" [class.status-pill--active]="category.isActive" [class.status-pill--inactive]="!category.isActive">
                        {{ category.isActive ? 'فعال' : 'غير فعال' }}
                      </span>
                    </td>
                    <td class="added-cell">{{ category.added }}</td>
                    <td>
                      <div class="row-actions">
                        <button type="button" class="row-btn" (click)="openViewForm(category)">عرض</button>
                        <button type="button" class="row-btn row-btn--edit" (click)="openEditForm(category)">تعديل</button>
                        <button type="button" class="row-btn row-btn--danger" (click)="deleteCategory(category.id)">حذف</button>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>

        <footer class="pagination-bar">
          <div class="pagination-right">
            <span class="page-counter">{{ rangeLabel }}</span>
            <div class="pagination-controls">
              <button type="button" class="pager-btn" (click)="goToPreviousPage()" [disabled]="currentPage === 1">
                <span class="material-icons-round">chevron_right</span>
              </button>
              <button type="button" class="pager-btn" (click)="goToNextPage()" [disabled]="currentPage === totalPages">
                <span class="material-icons-round">chevron_left</span>
              </button>
            </div>
          </div>

          <div class="pagination-left">
            <span class="page-size-label">Items per page:</span>
            <app-sero-dropdown
              class="page-size-dropdown"
              [options]="itemsPerPageDropdownOptions"
              [value]="itemsPerPage"
              size="sm"
              (valueChange)="onItemsPerPageChange($event)">
            </app-sero-dropdown>
          </div>
        </footer>
      </section>

      @if (formOpen) {
        <div class="modal-backdrop" (click)="closeForm()">
          <app-hotel-category-form
            [mode]="formMode"
            [category]="selectedCategory"
            (save)="saveCategory($event)"
            (cancel)="closeForm()"
            (switchToEdit)="switchToEditMode()"
            (click)="$event.stopPropagation()">
          </app-hotel-category-form>
        </div>
      }
    </section>
  `,
  styles: [`
    .hotel-categories-page {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .page-head h1 {
      margin: 0;
      font-size: 1rem;
      font-weight: 800;
      color: var(--sero-text-primary);
    }

    .success-message {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      align-self: flex-start;
      padding: 10px 12px;
      border: 1px solid var(--sero-success-border);
      border-radius: 8px;
      background: var(--sero-success-bg);
      color: var(--sero-success);
      font-size: 0.78rem;
      font-weight: 800;
      box-shadow: var(--shadow-sm);
    }

    .success-message .material-icons-round {
      font-size: 18px;
      flex-shrink: 0;
    }

    .surface-card {
      background: var(--sero-card-bg);
      border: 1px solid var(--sero-border-light);
      border-radius: 8px;
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }

    .actions-bar {
      padding: 12px 14px;
      border-bottom: 1px solid var(--sero-border-light);
      display: flex;
      align-items: center;
      justify-content: flex-start;
    }

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

    .btn--primary {
      background: var(--sero-primary);
      color: var(--sero-card-bg);
    }

    .btn--primary:hover {
      background: var(--sero-primary-dark);
    }

    .add-btn .material-icons-round {
      font-size: 16px;
    }

    .table-wrap {
      overflow-x: auto;
    }

    .categories-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 760px;
    }

    .categories-table thead tr {
      background: var(--sero-primary);
    }

    .categories-table th {
      color: rgba(255, 255, 255, 0.92);
      font-size: 0.72rem;
      font-weight: 700;
      text-align: right;
      padding: 10px 14px;
      white-space: nowrap;
    }

    .categories-table td {
      border-bottom: 1px solid var(--sero-border-light);
      color: var(--sero-text-primary);
      font-size: 0.79rem;
      text-align: right;
      padding: 10px 14px;
      vertical-align: middle;
      white-space: nowrap;
    }

    .categories-table tbody tr:hover {
      background: var(--sero-surface-2);
    }

    .categories-table tbody tr:last-child td {
      border-bottom: none;
    }

    .title-cell {
      font-weight: 800;
    }

    .added-cell {
      direction: ltr;
      text-align: left;
      color: var(--sero-text-secondary);
      font-weight: 700;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 24px;
      min-width: 56px;
      border-radius: 999px;
      border: 1px solid transparent;
      padding: 3px 10px;
      font-size: 0.68rem;
      font-weight: 800;
    }

    .status-pill--active {
      color: var(--sero-success);
      background: var(--sero-success-bg);
      border-color: var(--sero-success-border);
    }

    .status-pill--inactive {
      color: var(--sero-danger);
      background: var(--sero-danger-bg);
      border-color: var(--sero-danger-border);
    }

    .row-actions {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .row-btn {
      min-height: 28px;
      border-radius: 8px;
      border: 1px solid var(--sero-border);
      background: #fff;
      color: var(--sero-text-primary);
      font-size: 0.72rem;
      font-weight: 700;
      padding: 0 10px;
      cursor: pointer;
      transition: background var(--t-fast), border-color var(--t-fast), color var(--t-fast);
    }

    .row-btn:hover {
      background: var(--sero-surface-2);
      border-color: var(--sero-border-strong);
    }

    .row-btn--edit {
      color: var(--sero-primary-dark);
      border-color: var(--sero-primary-100);
      background: var(--sero-primary-50);
    }

    .row-btn--edit:hover {
      background: color-mix(in srgb, var(--sero-primary-50) 65%, #fff);
      border-color: var(--sero-primary);
    }

    .row-btn--danger {
      color: var(--sero-danger);
      border-color: var(--sero-danger-border);
      background: var(--sero-danger-bg);
    }

    .row-btn--danger:hover {
      background: color-mix(in srgb, var(--sero-danger-bg) 70%, #fff);
      border-color: var(--sero-danger);
    }

    .empty-cell {
      text-align: center;
      color: var(--sero-text-secondary);
      font-size: 0.82rem;
      padding: 30px 14px;
    }

    .pagination-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 10px 14px;
      border-top: 1px solid var(--sero-border-light);
      flex-wrap: wrap;
    }

    .pagination-right,
    .pagination-left {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .page-counter {
      color: var(--sero-text-secondary);
      font-size: 0.76rem;
      font-weight: 700;
      direction: ltr;
      min-width: 90px;
      text-align: center;
    }

    .pagination-controls {
      display: inline-flex;
      align-items: center;
      gap: 4px;
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
      background: var(--sero-surface-2);
      border-color: var(--sero-border-strong);
      color: var(--sero-text-primary);
    }

    .pager-btn:disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .pager-btn .material-icons-round {
      font-size: 18px;
    }

    .page-size-label {
      font-size: 0.76rem;
      font-weight: 700;
      color: var(--sero-text-secondary);
      white-space: nowrap;
    }

    .page-size-dropdown {
      width: 72px;
    }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: color-mix(in srgb, var(--sero-text-primary) 34%, transparent);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }

    @media (max-width: 740px) {
      .pagination-bar {
        flex-direction: column;
        align-items: flex-start;
      }

      .row-actions {
        flex-wrap: wrap;
      }
    }
  `],
})
export class HotelCategoriesPageComponent implements OnDestroy {
  private readonly service = inject(HotelCategoriesService);

  readonly itemsPerPageOptions = HOTEL_CATEGORIES_ITEMS_PER_PAGE_OPTIONS;
  readonly itemsPerPageDropdownOptions = this.itemsPerPageOptions.map((n) => ({ value: n, label: String(n) }));

  private allCategories: HotelCategoryModel[] = this.service.getAll();

  currentPage = 1;
  itemsPerPage = this.itemsPerPageOptions[0];

  formOpen = false;
  formMode: HotelCategoryFormMode = 'create';
  selectedCategory: HotelCategoryModel | null = null;

  successMessage = '';
  private successMessageTimer: ReturnType<typeof setTimeout> | null = null;

  get totalItemsCount(): number {
    return this.allCategories.length;
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

  get rangeLabel(): string {
    return `${this.rangeStart} – ${this.rangeEnd} of ${this.totalItemsCount}`;
  }

  get pagedCategories(): HotelCategoryModel[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.allCategories.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onItemsPerPageChange(count: number): void {
    this.itemsPerPage = count;
    this.currentPage = 1;
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

  openCreateForm(): void {
    this.formMode = 'create';
    this.selectedCategory = null;
    this.formOpen = true;
  }

  openViewForm(category: HotelCategoryModel): void {
    this.formMode = 'view';
    this.selectedCategory = { ...category };
    this.formOpen = true;
  }

  openEditForm(category: HotelCategoryModel): void {
    this.formMode = 'edit';
    this.selectedCategory = { ...category };
    this.formOpen = true;
  }

  switchToEditMode(): void {
    if (!this.selectedCategory) {
      return;
    }
    this.formMode = 'edit';
  }

  closeForm(): void {
    this.formOpen = false;
    this.selectedCategory = null;
    this.formMode = 'create';
  }

  saveCategory(value: HotelCategoryFormValue): void {
    if (this.formMode === 'edit' && this.selectedCategory) {
      this.service.update(this.selectedCategory.id, value);
      this.showSuccessMessage('تم حفظ التعديلات بنجاح');
    } else {
      this.service.add(value);
      this.currentPage = 1;
      this.showSuccessMessage('تمت إضافة التصنيف بنجاح');
    }

    this.refreshCategories();
    this.closeForm();
  }

  deleteCategory(id: string): void {
    this.service.delete(id);
    this.refreshCategories();
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    this.showSuccessMessage('تم حذف التصنيف بنجاح');
  }

  ngOnDestroy(): void {
    if (this.successMessageTimer) {
      clearTimeout(this.successMessageTimer);
    }
  }

  private refreshCategories(): void {
    this.allCategories = this.service.getAll();
  }

  private showSuccessMessage(message: string): void {
    this.successMessage = message;

    if (this.successMessageTimer) {
      clearTimeout(this.successMessageTimer);
    }

    this.successMessageTimer = setTimeout(() => {
      this.successMessage = '';
      this.successMessageTimer = null;
    }, 3000);
  }
}
