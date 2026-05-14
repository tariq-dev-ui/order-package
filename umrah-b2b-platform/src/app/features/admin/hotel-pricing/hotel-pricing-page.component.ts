import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, inject } from '@angular/core';
import { SeroDatePickerComponent } from '../../../shared/components/sero-date-picker/sero-date-picker.component';
import { SeroDropdownComponent } from '../../../shared/components/sero-dropdown/sero-dropdown.component';
import { StatusTogglePillComponent } from '../../../shared/components/status-toggle-pill/status-toggle-pill.component';
import { TableFilterHeaderComponent } from '../../../shared/components/table-filter-header/table-filter-header.component';
import {
  HOTEL_PRICING_DEFAULT_FILTERS,
  HOTEL_PRICING_ITEMS_PER_PAGE_OPTIONS,
  HOTEL_PRICING_STATUS_OPTIONS,
  HotelPricingFilterState,
  HotelPricingPolicy,
  HotelPricingPolicyFormValue,
  HotelPricingStatusFilter,
} from './hotel-pricing-policy.mock';
import { HotelPricingPolicyFormComponent, HotelPricingPolicyFormMode } from './hotel-pricing-policy-form.component';
import { HotelPricingPolicyService } from './hotel-pricing-policy.service';

@Component({
  selector: 'app-hotel-pricing-page',
  standalone: true,
  imports: [
    CommonModule,
    SeroDropdownComponent,
    SeroDatePickerComponent,
    StatusTogglePillComponent,
    TableFilterHeaderComponent,
    HotelPricingPolicyFormComponent,
  ],
  template: `
    <section class="hotel-pricing-page" dir="rtl">
      <header class="page-head">
        <h1>تسعيرات الفنادق</h1>
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
              <label>يبدأ من</label>
              <app-sero-date-picker
                [value]="filters.startFrom"
                placeholder="mm/dd/yyyy"
                (valueChange)="filters = { ...filters, startFrom: $event }">
              </app-sero-date-picker>
            </div>

            <div class="field-group">
              <label>يبدأ إلى</label>
              <app-sero-date-picker
                [value]="filters.startTo"
                placeholder="mm/dd/yyyy"
                (valueChange)="filters = { ...filters, startTo: $event }">
              </app-sero-date-picker>
            </div>

            <div class="field-group">
              <label>ينتهي من</label>
              <app-sero-date-picker
                [value]="filters.endFrom"
                placeholder="mm/dd/yyyy"
                (valueChange)="filters = { ...filters, endFrom: $event }">
              </app-sero-date-picker>
            </div>

            <div class="field-group">
              <label>ينتهي إلى</label>
              <app-sero-date-picker
                [value]="filters.endTo"
                placeholder="mm/dd/yyyy"
                (valueChange)="filters = { ...filters, endTo: $event }">
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
          </div>
        </app-table-filter-header>

        <div class="actions-bar">
          <div class="filters-actions">
            <button type="button" class="btn btn--primary btn--sm" (click)="search()">بحث</button>
            <button type="button" class="btn btn--secondary btn--sm" (click)="clear()">مسح</button>
          </div>

          <button type="button" class="btn btn--primary btn--sm add-btn" (click)="openCreateForm()">
            <span class="material-icons-round">add</span>
            <span>إضافة سياسة جديدة</span>
          </button>
        </div>

        <div class="table-wrap">
          <table class="hotel-table">
            <thead>
              <tr>
                <th>العنوان</th>
                <th>الفترة</th>
                <th>Agents</th>
                <th>الفنادق</th>
                <th>فعال</th>
                <th>الإجراء</th>
              </tr>
            </thead>
            <tbody>
              @if (pagedPolicies.length === 0) {
                <tr>
                  <td colspan="6" class="empty-cell">لا توجد بيانات</td>
                </tr>
              } @else {
                @for (policy of pagedPolicies; track policy.id) {
                  <tr>
                    <td class="title-cell">{{ policy.title }}</td>
                    <td>
                      <span class="period" dir="ltr">{{ policy.startDate }} – {{ policy.endDate }}</span>
                    </td>
                    <td class="count-cell">{{ policy.agentsCount }}</td>
                    <td class="count-cell">{{ policy.hotelsCount }}</td>
                    <td>
                      <app-status-toggle-pill
                        [isActive]="policy.isActive"
                        activeLabel="فعال"
                        inactiveLabel="غير فعال"
                        activateMessage="هل تريد تفعيل هذه السياسة؟"
                        deactivateMessage="هل تريد إلغاء تفعيل هذه السياسة؟"
                        (statusChange)="toggleStatus(policy, $event)">
                      </app-status-toggle-pill>
                    </td>
                    <td class="action-cell">
                      <div class="action-menu-wrap" (click)="$event.stopPropagation()">
                        <button
                          type="button"
                          class="table-action-btn"
                          [class.is-open]="openedActionMenuId === policy.id"
                          (click)="toggleActionMenu(policy.id, $event)"
                          aria-haspopup="menu"
                          [attr.aria-expanded]="openedActionMenuId === policy.id"
                          aria-label="إجراءات">
                          <span class="dot"></span>
                          <span class="dot"></span>
                          <span class="dot"></span>
                        </button>

                        @if (openedActionMenuId === policy.id) {
                          <div class="row-actions-menu" role="menu">
                            @if (pendingDeleteId === policy.id) {
                              <div class="delete-confirm">
                                <p>هل تريد حذف هذه السياسة؟</p>
                                <div class="delete-confirm-actions">
                                  <button type="button" class="confirm-btn confirm-btn--danger" (click)="executeDelete(policy.id, $event)">حذف</button>
                                  <button type="button" class="confirm-btn confirm-btn--cancel" (click)="cancelDelete($event)">إلغاء</button>
                                </div>
                              </div>
                            } @else {
                              <button type="button" class="row-action-item" role="menuitem" (click)="viewPolicy(policy, $event)">
                                <span class="material-icons-round">visibility</span>
                                <span>عرض</span>
                              </button>
                              <button type="button" class="row-action-item" role="menuitem" (click)="editPolicy(policy, $event)">
                                <span class="material-icons-round">edit</span>
                                <span>تعديل</span>
                              </button>
                              <button type="button" class="row-action-item" role="menuitem" (click)="toggleStatusFromMenu(policy, $event)">
                                <span class="material-icons-round">{{ policy.isActive ? 'toggle_off' : 'toggle_on' }}</span>
                                <span>{{ policy.isActive ? 'إلغاء التفعيل' : 'تفعيل' }}</span>
                              </button>
                              <button type="button" class="row-action-item row-action-item--danger" role="menuitem" (click)="confirmDelete(policy.id, $event)">
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

      @if (showPolicyForm) {
        <app-hotel-pricing-policy-form
          [policy]="editingPolicy"
          [mode]="formMode"
          (save)="onFormSave($event)"
          (cancel)="onFormCancel()">
        </app-hotel-pricing-policy-form>
      }
    </section>
  `,
  styles: [`
    .hotel-pricing-page {
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

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(5, minmax(0, 1fr));
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

    .btn--primary {
      background: var(--sero-primary);
      color: var(--sero-card-bg);
    }

    .btn--primary:hover { background: var(--sero-primary-dark); }

    .btn--secondary {
      background: var(--sero-card-bg);
      color: var(--sero-text-primary);
      border-color: var(--sero-border);
    }

    .btn--secondary:hover {
      background: var(--sero-surface-2);
      border-color: var(--sero-border-strong);
    }

    .table-wrap {
      overflow-x: auto;
    }

    .hotel-table {
      width: 100%;
      min-width: 700px;
      border-collapse: collapse;
    }

    .hotel-table thead tr {
      background: var(--sero-primary);
    }

    .hotel-table th {
      color: rgba(255, 255, 255, 0.92);
      font-size: 0.72rem;
      font-weight: 700;
      text-align: right;
      padding: 10px 14px;
      white-space: nowrap;
    }

    .hotel-table td {
      border-bottom: 1px solid var(--sero-border-light);
      color: var(--sero-text-primary);
      font-size: 0.8rem;
      text-align: right;
      padding: 10px 14px;
      vertical-align: middle;
    }

    .hotel-table tbody tr:hover {
      background: var(--sero-surface-2, #fbfcfa);
    }

    .hotel-table tbody tr:last-child td {
      border-bottom: none;
    }

    .title-cell {
      font-weight: 600;
      max-width: 220px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .period {
      font-size: 0.76rem;
      color: var(--sero-text-secondary);
      font-weight: 600;
      white-space: nowrap;
    }

    .count-cell {
      text-align: center;
      font-weight: 700;
    }

    .empty-cell {
      text-align: center;
      color: var(--sero-text-secondary);
      font-size: 0.82rem;
      padding: 32px 14px;
    }

    .action-cell {
      text-align: center;
      white-space: nowrap;
    }

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
      min-width: 150px;
      background: var(--sero-card-bg);
      border: 1px solid var(--sero-border-light);
      border-radius: 8px;
      box-shadow: var(--shadow-xl);
      padding: 4px;
      animation: menuIn 0.14s ease-out;
    }

    @keyframes menuIn {
      from { opacity: 0; transform: translateY(-4px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
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

    .delete-confirm {
      padding: 10px;
    }

    .delete-confirm p {
      margin: 0 0 10px;
      font-size: 0.76rem;
      font-weight: 700;
      color: var(--sero-text-primary);
      line-height: 1.5;
      white-space: normal;
    }

    .delete-confirm-actions {
      display: flex;
      gap: 6px;
    }

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

    .confirm-btn--danger {
      background: var(--sero-danger);
      color: #fff;
    }

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
    .pagination-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .page-size-label {
      font-size: 0.76rem;
      font-weight: 600;
      color: var(--sero-text-secondary);
      white-space: nowrap;
    }

    .page-size-dropdown {
      width: 70px;
    }

    .page-info {
      font-size: 0.76rem;
      font-weight: 700;
      color: var(--sero-text-secondary);
      white-space: nowrap;
    }

    .pagination-controls {
      display: flex;
      gap: 4px;
    }

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

    .pager-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .pager-btn .material-icons-round { font-size: 18px; }

    @media (max-width: 1200px) {
      .filters-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }

    @media (max-width: 680px) {
      .filters-grid { grid-template-columns: 1fr; }
      .actions-bar { flex-direction: column; align-items: stretch; }
      .filters-actions { flex-wrap: wrap; }
      .add-btn { justify-content: center; }
    }
  `],
})
export class HotelPricingPageComponent implements OnDestroy {
  private readonly service = inject(HotelPricingPolicyService);

  readonly statusOptions = HOTEL_PRICING_STATUS_OPTIONS;
  readonly itemsPerPageOptions = HOTEL_PRICING_ITEMS_PER_PAGE_OPTIONS;
  readonly itemsPerPageDropdownOptions = this.itemsPerPageOptions.map((n) => ({ value: n, label: String(n) }));

  filters: HotelPricingFilterState = { ...HOTEL_PRICING_DEFAULT_FILTERS };
  filtersExpanded = true;
  openedActionMenuId: string | null = null;
  pendingDeleteId: string | null = null;

  private allPolicies: HotelPricingPolicy[] = this.service.getAll();
  private filteredPolicies: HotelPricingPolicy[] = [...this.allPolicies];

  currentPage = 1;
  itemsPerPage = this.itemsPerPageOptions[0];

  showPolicyForm = false;
  formMode: HotelPricingPolicyFormMode = 'add';
  editingPolicy: HotelPricingPolicy | null = null;

  successMessage = '';
  private successTimer: ReturnType<typeof setTimeout> | null = null;

  get pagedPolicies(): HotelPricingPolicy[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredPolicies.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredPolicies.length / this.itemsPerPage));
  }

  get shownItemsLabel(): string {
    const total = this.filteredPolicies.length;
    if (total === 0) return '0';
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, total);
    return `${start} – ${end} من ${total}`;
  }

  onStatusChange(value: HotelPricingStatusFilter): void {
    this.filters = { ...this.filters, status: value };
  }

  search(): void {
    const { startFrom, startTo, endFrom, endTo, status } = this.filters;
    let result = this.service.getAll();
    if (startFrom) result = result.filter((p) => p.startDate >= startFrom);
    if (startTo)   result = result.filter((p) => p.startDate <= startTo);
    if (endFrom)   result = result.filter((p) => p.endDate >= endFrom);
    if (endTo)     result = result.filter((p) => p.endDate <= endTo);
    if (status !== 'all') result = result.filter((p) => p.isActive === (status === 'فعال'));
    this.filteredPolicies = result;
    this.currentPage = 1;
    this.openedActionMenuId = null;
  }

  clear(): void {
    this.filters = { ...HOTEL_PRICING_DEFAULT_FILTERS };
    this.allPolicies = this.service.getAll();
    this.filteredPolicies = [...this.allPolicies];
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

  viewPolicy(policy: HotelPricingPolicy, event: Event): void {
    event.stopPropagation();
    this.editingPolicy = { ...policy };
    this.formMode = 'view';
    this.showPolicyForm = true;
    this.openedActionMenuId = null;
  }

  editPolicy(policy: HotelPricingPolicy, event: Event): void {
    event.stopPropagation();
    this.editingPolicy = { ...policy };
    this.formMode = 'edit';
    this.showPolicyForm = true;
    this.openedActionMenuId = null;
  }

  confirmDelete(id: string, event: Event): void {
    event.stopPropagation();
    this.pendingDeleteId = id;
  }

  executeDelete(id: string, event: Event): void {
    event.stopPropagation();
    this.service.delete(id);
    this.filteredPolicies = this.filteredPolicies.filter((p) => p.id !== id);
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    this.openedActionMenuId = null;
    this.pendingDeleteId = null;
    this.showSuccessMessage('تم حذف السياسة بنجاح');
  }

  cancelDelete(event: Event): void {
    event.stopPropagation();
    this.pendingDeleteId = null;
  }

  toggleStatus(policy: HotelPricingPolicy, isActive: boolean): void {
    this.service.toggleStatus(policy.id, isActive);
    this.filteredPolicies = this.filteredPolicies.map((p) =>
      p.id === policy.id ? { ...p, isActive } : p
    );
  }

  toggleStatusFromMenu(policy: HotelPricingPolicy, event: Event): void {
    event.stopPropagation();
    const isActive = !policy.isActive;
    this.service.toggleStatus(policy.id, isActive);
    this.filteredPolicies = this.filteredPolicies.map((p) =>
      p.id === policy.id ? { ...p, isActive } : p
    );
    this.openedActionMenuId = null;
    this.showSuccessMessage(isActive ? 'تم تفعيل السياسة' : 'تم إلغاء تفعيل السياسة');
  }

  openCreateForm(): void {
    this.editingPolicy = null;
    this.formMode = 'add';
    this.showPolicyForm = true;
  }

  onFormSave(value: HotelPricingPolicyFormValue): void {
    if (this.formMode === 'edit' && this.editingPolicy) {
      this.service.update(this.editingPolicy.id, value);
      this.filteredPolicies = this.filteredPolicies.map((p) =>
        p.id === this.editingPolicy!.id ? { ...p, ...value } : p
      );
      this.showSuccessMessage('تم حفظ التعديلات بنجاح');
    } else {
      const added = this.service.add(value);
      this.filteredPolicies = [added, ...this.filteredPolicies];
      this.currentPage = 1;
      this.showSuccessMessage('تمت إضافة السياسة بنجاح');
    }
    this.showPolicyForm = false;
    this.editingPolicy = null;
  }

  onFormCancel(): void {
    this.showPolicyForm = false;
    this.editingPolicy = null;
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
