import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, inject } from '@angular/core';
import { SeroDropdownComponent } from '../../../shared/components/sero-dropdown/sero-dropdown.component';
import { TableFilterHeaderComponent } from '../../../shared/components/table-filter-header/table-filter-header.component';
import {
  TRANSPORT_COMPANY_DEFAULT_FILTERS,
  TRANSPORT_COMPANY_ITEMS_PER_PAGE_OPTIONS,
  TRANSPORT_COMPANY_STATUS_OPTIONS,
  TransportCompany,
  TransportCompanyFilterState,
  TransportCompanyFormValue,
  TransportCompanyStatusFilter,
} from './transport-company.mock';
import { TransportCompanyFormComponent, TransportCompanyFormMode } from './transport-company-form.component';
import { TransportCompanyService } from './transport-company.service';

@Component({
  selector: 'app-transport-companies-page',
  standalone: true,
  imports: [
    CommonModule,
    SeroDropdownComponent,
    TableFilterHeaderComponent,
    TransportCompanyFormComponent,
  ],
  template: `
    <section class="transport-companies-page" dir="rtl">
      <header class="page-head">
        <h1>شركات النقل</h1>
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
              <label>الحالة</label>
              <app-sero-dropdown
                [options]="statusOptions"
                [value]="filters.status"
                (valueChange)="onStatusChange($event)">
              </app-sero-dropdown>
            </div>
          </div>
        </app-table-filter-header>

        <div class="actions-bar">
          <div class="filters-actions">
            <button type="button" class="btn btn--primary btn--sm" (click)="search()">بحث</button>
            <button type="button" class="btn btn--secondary btn--sm" (click)="clear()">مسح</button>
          </div>

          <button type="button" class="btn btn--primary btn--sm add-btn" (click)="openCreateForm()">
            <span class="material-icons-round">add</span>
            <span>إضافة شركة جديدة</span>
          </button>
        </div>

        <div class="table-wrap">
          <table class="companies-table">
            <thead>
              <tr>
                <th>الرمز</th>
                <th>اسم الشركة</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              @if (pagedCompanies.length === 0) {
                <tr>
                  <td colspan="4" class="empty-cell">لا توجد بيانات</td>
                </tr>
              } @else {
                @for (company of pagedCompanies; track company.id) {
                  <tr>
                    <td class="code-cell">{{ company.code }}</td>
                    <td class="name-cell">{{ company.englishName }}</td>
                    <td>
                      <span
                        class="status-pill"
                        [class.status-pill--active]="company.isActive"
                        [class.status-pill--inactive]="!company.isActive">
                        <span class="material-icons-round status-pill-icon">{{ company.isActive ? 'check' : 'close' }}</span>
                        <span>{{ company.isActive ? 'فعال' : 'غير فعال' }}</span>
                      </span>
                    </td>
                    <td class="action-cell">
                      <div class="action-menu-wrap" (click)="$event.stopPropagation()">
                        <button
                          type="button"
                          class="table-action-btn"
                          [class.is-open]="openedActionMenuId === company.id"
                          (click)="toggleActionMenu(company.id, $event)"
                          aria-haspopup="menu"
                          [attr.aria-expanded]="openedActionMenuId === company.id"
                          aria-label="إجراءات">
                          <span class="dot"></span>
                          <span class="dot"></span>
                          <span class="dot"></span>
                        </button>

                        @if (openedActionMenuId === company.id) {
                          <div class="row-actions-menu" role="menu">
                            @if (pendingDeleteId === company.id) {
                              <div class="delete-confirm">
                                <p>هل تريد حذف هذه الشركة؟</p>
                                <div class="delete-confirm-actions">
                                  <button type="button" class="confirm-btn confirm-btn--danger" (click)="executeDelete(company.id, $event)">حذف</button>
                                  <button type="button" class="confirm-btn confirm-btn--cancel" (click)="cancelDelete($event)">إلغاء</button>
                                </div>
                              </div>
                            } @else {
                              <button type="button" class="row-action-item" role="menuitem" (click)="viewCompany(company, $event)">
                                <span class="material-icons-round">visibility</span>
                                <span>عرض</span>
                              </button>
                              <button type="button" class="row-action-item" role="menuitem" (click)="editCompany(company, $event)">
                                <span class="material-icons-round">edit</span>
                                <span>تعديل</span>
                              </button>
                              <button type="button" class="row-action-item row-action-item--danger" role="menuitem" (click)="confirmDelete(company.id, $event)">
                                <span class="material-icons-round">delete</span>
                                <span>حذف</span>
                              </button>
                            }
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
              <button type="button" class="pager-btn" (click)="goToPreviousPage()" [disabled]="currentPage === 1">
                <span class="material-icons-round">chevron_right</span>
              </button>
              <button type="button" class="pager-btn" (click)="goToNextPage()" [disabled]="currentPage === totalPages">
                <span class="material-icons-round">chevron_left</span>
              </button>
            </div>
          </div>
        </footer>
      </section>

      @if (showCompanyForm) {
        <app-transport-company-form
          [company]="editingCompany"
          [mode]="formMode"
          (save)="onFormSave($event)"
          (cancel)="onFormCancel()">
        </app-transport-company-form>
      }
    </section>
  `,
  styles: [`
    .transport-companies-page {
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
      font-weight: 700;
    }

    .success-message .material-icons-round { font-size: 18px; flex-shrink: 0; }

    .surface-card {
      background: var(--sero-card-bg);
      border: 1px solid var(--sero-border-light);
      border-radius: 8px;
      box-shadow: var(--shadow-sm);
      overflow: hidden;
    }

    .filters-grid {
      display: grid;
      grid-template-columns: 240px;
      gap: 12px;
      padding: 14px;
      border-bottom: 1px solid var(--sero-border-light);
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .field-group label {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--sero-text-secondary);
    }

    .actions-bar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 10px 14px;
      border-bottom: 1px solid var(--sero-border-light);
    }

    .filters-actions {
      display: flex;
      align-items: center;
      gap: 6px;
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

    .btn--sm .material-icons-round { font-size: 15px; }

    .btn--primary { background: var(--sero-primary); color: var(--sero-card-bg); }
    .btn--primary:hover { background: var(--sero-primary-dark); }

    .btn--secondary {
      background: var(--sero-card-bg);
      color: var(--sero-text-primary);
      border-color: var(--sero-border);
    }

    .btn--secondary:hover { background: var(--sero-surface-2); border-color: var(--sero-border-strong); }

    .table-wrap { overflow-x: auto; }

    .companies-table {
      width: 100%;
      min-width: 520px;
      border-collapse: collapse;
    }

    .companies-table thead tr { background: var(--sero-primary); }

    .companies-table th {
      color: rgba(255, 255, 255, 0.92);
      font-size: 0.72rem;
      font-weight: 700;
      text-align: right;
      padding: 10px 14px;
      white-space: nowrap;
    }

    .companies-table td {
      border-bottom: 1px solid var(--sero-border-light);
      color: var(--sero-text-primary);
      font-size: 0.8rem;
      text-align: right;
      padding: 10px 14px;
      vertical-align: middle;
    }

    .companies-table tbody tr:hover { background: var(--sero-surface-2, #fbfcfa); }
    .companies-table tbody tr:last-child td { border-bottom: none; }

    .code-cell {
      font-weight: 700;
      color: var(--sero-text-secondary);
      width: 70px;
    }

    .name-cell {
      font-weight: 600;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      min-width: 54px;
      min-height: 24px;
      border: 1px solid transparent;
      border-radius: 999px;
      padding: 3px 9px;
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

    .status-pill-icon { font-size: 14px; line-height: 1; }

    .empty-cell {
      text-align: center;
      color: var(--sero-text-secondary);
      font-size: 0.82rem;
      padding: 32px 14px;
    }

    .action-cell { text-align: center; white-space: nowrap; width: 60px; }

    .action-menu-wrap {
      position: relative;
      display: inline-flex;
      justify-content: center;
    }

    .table-action-btn {
      width: 30px;
      height: 30px;
      border: 1px solid var(--sero-border);
      border-radius: 6px;
      background: transparent;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2px;
      transition: background var(--t-fast), border-color var(--t-fast);
    }

    .table-action-btn:hover,
    .table-action-btn.is-open {
      background: var(--sero-surface-2);
      border-color: var(--sero-border-strong);
    }

    .dot {
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: var(--sero-text-secondary);
      flex-shrink: 0;
    }

    .row-actions-menu {
      position: absolute;
      top: calc(100% + 4px);
      left: 0;
      z-index: 100;
      min-width: 140px;
      background: var(--sero-card-bg);
      border: 1px solid var(--sero-border-light);
      border-radius: 8px;
      box-shadow: var(--shadow-xl);
      padding: 4px;
      animation: menuIn 0.14s ease-out;
    }

    @keyframes menuIn {
      from { opacity: 0; transform: translateY(-4px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0)    scale(1);    }
    }

    .row-action-item {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 7px 10px;
      border: none;
      border-radius: 6px;
      background: transparent;
      color: var(--sero-text-primary);
      font-family: var(--sero-font);
      font-size: 0.78rem;
      font-weight: 700;
      cursor: pointer;
      text-align: right;
      transition: background var(--t-fast), color var(--t-fast);
    }

    .row-action-item:hover { background: var(--sero-surface-2); }

    .row-action-item .material-icons-round {
      font-size: 16px;
      color: var(--sero-text-secondary);
      flex-shrink: 0;
    }

    .row-action-item--danger { color: var(--sero-danger); }
    .row-action-item--danger:hover { background: var(--sero-danger-bg); }
    .row-action-item--danger .material-icons-round { color: var(--sero-danger); }

    .delete-confirm { padding: 10px; }

    .delete-confirm p {
      margin: 0 0 10px;
      font-size: 0.76rem;
      font-weight: 700;
      color: var(--sero-text-primary);
      line-height: 1.5;
      white-space: normal;
    }

    .delete-confirm-actions { display: flex; gap: 6px; }

    .confirm-btn {
      flex: 1;
      min-height: 28px;
      border-radius: 6px;
      border: 1px solid transparent;
      font-family: var(--sero-font);
      font-size: 0.72rem;
      font-weight: 800;
      cursor: pointer;
      transition: background var(--t-fast), border-color var(--t-fast);
    }

    .confirm-btn--danger { background: var(--sero-danger); color: #fff; }
    .confirm-btn--danger:hover { filter: brightness(0.9); }

    .confirm-btn--cancel {
      background: var(--sero-card-bg);
      color: var(--sero-text-primary);
      border-color: var(--sero-border);
    }

    .confirm-btn--cancel:hover { background: var(--sero-surface-2); }

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

    @media (max-width: 680px) {
      .filters-grid { grid-template-columns: 1fr; }
      .actions-bar { flex-direction: column; align-items: stretch; }
      .filters-actions { flex-wrap: wrap; }
      .add-btn { justify-content: center; }
    }
  `],
})
export class TransportCompaniesPageComponent implements OnDestroy {
  private readonly service = inject(TransportCompanyService);

  readonly statusOptions = TRANSPORT_COMPANY_STATUS_OPTIONS;
  readonly itemsPerPageOptions = TRANSPORT_COMPANY_ITEMS_PER_PAGE_OPTIONS;
  readonly itemsPerPageDropdownOptions = this.itemsPerPageOptions.map((n) => ({ value: n, label: String(n) }));

  filters: TransportCompanyFilterState = { ...TRANSPORT_COMPANY_DEFAULT_FILTERS };
  filtersExpanded = true;
  openedActionMenuId: string | null = null;
  pendingDeleteId: string | null = null;

  private filteredCompanies: TransportCompany[] = this.service.getAll();

  currentPage = 1;
  itemsPerPage = this.itemsPerPageOptions[0];

  showCompanyForm = false;
  formMode: TransportCompanyFormMode = 'add';
  editingCompany: TransportCompany | null = null;

  successMessage = '';
  private successTimer: ReturnType<typeof setTimeout> | null = null;

  get pagedCompanies(): TransportCompany[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredCompanies.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredCompanies.length / this.itemsPerPage));
  }

  get shownItemsLabel(): string {
    const total = this.filteredCompanies.length;
    if (total === 0) return '0';
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, total);
    return `${start} – ${end} من ${total}`;
  }

  onStatusChange(value: TransportCompanyStatusFilter): void {
    this.filters = { ...this.filters, status: value };
  }

  search(): void {
    let result = this.service.getAll();
    const { status } = this.filters;
    if (status !== 'all') result = result.filter((c) => c.isActive === (status === 'فعال'));
    this.filteredCompanies = result;
    this.currentPage = 1;
    this.openedActionMenuId = null;
  }

  clear(): void {
    this.filters = { ...TRANSPORT_COMPANY_DEFAULT_FILTERS };
    this.filteredCompanies = this.service.getAll();
    this.currentPage = 1;
    this.itemsPerPage = this.itemsPerPageOptions[0];
    this.openedActionMenuId = null;
  }

  toggleActionMenu(id: string, event: Event): void {
    event.stopPropagation();
    this.openedActionMenuId = this.openedActionMenuId === id ? null : id;
    this.pendingDeleteId = null;
  }

  @HostListener('document:click')
  closeMenus(): void {
    this.openedActionMenuId = null;
    this.pendingDeleteId = null;
  }

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    this.openedActionMenuId = null;
    this.pendingDeleteId = null;
  }

  viewCompany(company: TransportCompany, event: Event): void {
    event.stopPropagation();
    this.editingCompany = { ...company };
    this.formMode = 'view';
    this.showCompanyForm = true;
    this.openedActionMenuId = null;
  }

  editCompany(company: TransportCompany, event: Event): void {
    event.stopPropagation();
    this.editingCompany = { ...company };
    this.formMode = 'edit';
    this.showCompanyForm = true;
    this.openedActionMenuId = null;
  }

  confirmDelete(id: string, event: Event): void {
    event.stopPropagation();
    this.pendingDeleteId = id;
  }

  executeDelete(id: string, event: Event): void {
    event.stopPropagation();
    this.service.delete(id);
    this.filteredCompanies = this.filteredCompanies.filter((c) => c.id !== id);
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    this.openedActionMenuId = null;
    this.pendingDeleteId = null;
    this.showSuccessMessage('تم حذف الشركة بنجاح');
  }

  cancelDelete(event: Event): void {
    event.stopPropagation();
    this.pendingDeleteId = null;
  }

  openCreateForm(): void {
    this.editingCompany = null;
    this.formMode = 'add';
    this.showCompanyForm = true;
  }

  onFormSave(value: TransportCompanyFormValue): void {
    if (this.formMode === 'edit' && this.editingCompany) {
      this.service.update(this.editingCompany.id, value);
      this.filteredCompanies = this.filteredCompanies.map((c) =>
        c.id === this.editingCompany!.id ? { ...c, ...value } : c
      );
      this.showSuccessMessage('تم حفظ التعديلات بنجاح');
    } else {
      const added = this.service.add(value);
      this.filteredCompanies = [added, ...this.filteredCompanies];
      this.currentPage = 1;
      this.showSuccessMessage('تمت إضافة الشركة بنجاح');
    }
    this.showCompanyForm = false;
    this.editingCompany = null;
  }

  onFormCancel(): void {
    this.showCompanyForm = false;
    this.editingCompany = null;
  }

  goToPreviousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  goToNextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  onItemsPerPageChange(count: number): void {
    this.itemsPerPage = count;
    this.currentPage = 1;
  }

  private showSuccessMessage(message: string): void {
    if (this.successTimer) clearTimeout(this.successTimer);
    this.successMessage = message;
    this.successTimer = setTimeout(() => {
      this.successMessage = '';
      this.successTimer = null;
    }, 3000);
  }

  ngOnDestroy(): void {
    if (this.successTimer) clearTimeout(this.successTimer);
  }
}
