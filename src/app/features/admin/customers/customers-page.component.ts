import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, inject } from '@angular/core';
import {
  CUSTOMER_STATUS_LABELS,
  CustomerFormValue,
  CustomerModel,
  CustomerStatus,
} from './customer.model';
import { CUSTOMER_ITEMS_PER_PAGE } from './customers.mock';
import { CustomersService } from './customers.service';

type CustomerModalMode = 'view' | 'edit' | 'delete';
type CustomerTextField = 'name' | 'phoneNumber' | 'country' | 'city' | 'district';

@Component({
  selector: 'app-customers-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="customers-page" dir="rtl">
      <header class="page-head">
        <h1>العملاء</h1>
      </header>

      @if (successMessage) {
        <div class="success-message" role="status">
          <span class="material-icons-round">check_circle</span>
          <span>{{ successMessage }}</span>
        </div>
      }

      <section class="surface-card">
        <div class="table-toolbar">
          <div class="table-summary">
            <span class="material-icons-round">people_outline</span>
            <span>{{ totalItemsCount }} عميل</span>
          </div>
        </div>

        <div class="table-wrap">
          <table class="customers-table">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>رقم الهاتف</th>
                <th>الدولة</th>
                <th>المدينة</th>
                <th>الحي</th>
                <th class="status-heading">الحالة</th>
                <th class="actions-heading">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              @if (pagedCustomers.length === 0) {
                <tr>
                  <td colspan="7" class="empty-cell">لا توجد بيانات</td>
                </tr>
              } @else {
                @for (customer of pagedCustomers; track customer.id) {
                  <tr>
                    <td class="name-cell">
                      <div class="customer-name">
                        <span class="name-avatar">{{ getCustomerInitials(customer.name) }}</span>
                        <span class="name-text">{{ customer.name }}</span>
                      </div>
                    </td>
                    <td class="phone-cell" dir="ltr">{{ customer.phoneNumber }}</td>
                    <td>{{ customer.country }}</td>
                    <td>{{ customer.city }}</td>
                    <td>{{ customer.district }}</td>
                    <td class="status-cell">
                      <span
                        class="status-pill"
                        [class.status-pill--active]="customer.status === 'active'"
                        [class.status-pill--inactive]="customer.status === 'inactive'">
                        <span class="material-icons-round status-pill-icon">
                          {{ customer.status === 'active' ? 'check' : 'close' }}
                        </span>
                        <span>{{ statusLabels[customer.status] }}</span>
                      </span>
                    </td>
                    <td class="action-cell">
                      <div class="row-actions">
                        <button type="button" class="row-action-btn" (click)="viewCustomer(customer)">
                          <span class="material-icons-round">visibility</span>
                          <span>عرض</span>
                        </button>
                        <button type="button" class="row-action-btn row-action-btn--edit" (click)="editCustomer(customer)">
                          <span class="material-icons-round">edit</span>
                          <span>تعديل</span>
                        </button>
                        <button type="button" class="row-action-btn row-action-btn--danger" (click)="confirmDeleteCustomer(customer)">
                          <span class="material-icons-round">delete</span>
                          <span>حذف</span>
                        </button>
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
            <span class="page-size-label">Items per page:</span>
            <span class="page-size-value">{{ itemsPerPage }}</span>
          </div>

          <div class="pagination-right">
            <span class="page-info">{{ rangeLabel }}</span>
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
    </section>

    @if (selectedCustomer && modalMode) {
      <div class="modal-backdrop" (click)="closeModal()">
        <div class="modal-card" (click)="$event.stopPropagation()" dir="rtl">
          <header class="modal-head">
            <h2>
              @if (modalMode === 'view') {
                عرض العميل
              } @else if (modalMode === 'edit') {
                تعديل العميل
              } @else {
                حذف العميل
              }
            </h2>
            <button type="button" class="modal-close-btn" aria-label="إغلاق" (click)="closeModal()">
              <span class="material-icons-round">close</span>
            </button>
          </header>

          @if (modalMode === 'view') {
            <div class="modal-body">
              <div class="details-grid">
                <div class="detail-row">
                  <span class="detail-label">الاسم</span>
                  <span class="detail-value">{{ selectedCustomer.name }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">رقم الهاتف</span>
                  <span class="detail-value detail-value--ltr" dir="ltr">{{ selectedCustomer.phoneNumber }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">الدولة</span>
                  <span class="detail-value">{{ selectedCustomer.country }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">المدينة</span>
                  <span class="detail-value">{{ selectedCustomer.city }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">الحي</span>
                  <span class="detail-value">{{ selectedCustomer.district }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">الحالة</span>
                  <span
                    class="status-pill"
                    [class.status-pill--active]="selectedCustomer.status === 'active'"
                    [class.status-pill--inactive]="selectedCustomer.status === 'inactive'">
                    <span class="material-icons-round status-pill-icon">
                      {{ selectedCustomer.status === 'active' ? 'check' : 'close' }}
                    </span>
                    <span>{{ statusLabels[selectedCustomer.status] }}</span>
                  </span>
                </div>
              </div>
            </div>

            <footer class="modal-actions">
              <button type="button" class="btn btn--secondary" (click)="closeModal()">إغلاق</button>
              <button type="button" class="btn btn--primary" (click)="switchToEdit()">تعديل</button>
            </footer>
          } @else if (modalMode === 'edit') {
            @if (editDraft; as draft) {
              <form class="modal-body customer-form" (submit)="saveEdit($event)">
                <div class="form-grid">
                  <label class="field-group">
                    <span>الاسم</span>
                    <input
                      type="text"
                      [value]="draft.name"
                      required
                      (input)="updateDraftField('name', $any($event.target).value)" />
                  </label>

                  <label class="field-group">
                    <span>رقم الهاتف</span>
                    <input
                      type="text"
                      dir="ltr"
                      [value]="draft.phoneNumber"
                      required
                      (input)="updateDraftField('phoneNumber', $any($event.target).value)" />
                  </label>

                  <label class="field-group">
                    <span>الدولة</span>
                    <input
                      type="text"
                      [value]="draft.country"
                      required
                      (input)="updateDraftField('country', $any($event.target).value)" />
                  </label>

                  <label class="field-group">
                    <span>المدينة</span>
                    <input
                      type="text"
                      [value]="draft.city"
                      required
                      (input)="updateDraftField('city', $any($event.target).value)" />
                  </label>

                  <label class="field-group">
                    <span>الحي</span>
                    <input
                      type="text"
                      [value]="draft.district"
                      required
                      (input)="updateDraftField('district', $any($event.target).value)" />
                  </label>

                  <label class="field-group">
                    <span>الحالة</span>
                    <select [value]="draft.status" (change)="updateDraftStatus($any($event.target).value)">
                      <option value="active">فعال</option>
                      <option value="inactive">غير فعال</option>
                    </select>
                  </label>
                </div>

                <footer class="modal-actions modal-actions--inside">
                  <button type="button" class="btn btn--secondary" (click)="closeModal()">إلغاء</button>
                  <button type="submit" class="btn btn--primary">حفظ</button>
                </footer>
              </form>
            }
          } @else {
            <div class="modal-body">
              <div class="delete-message">
                <span class="material-icons-round">warning</span>
                <div>
                  <p>هل تريد حذف هذا العميل؟</p>
                  <strong>{{ selectedCustomer.name }}</strong>
                </div>
              </div>
            </div>

            <footer class="modal-actions">
              <button type="button" class="btn btn--secondary" (click)="closeModal()">إلغاء</button>
              <button type="button" class="btn btn--danger" (click)="deleteSelectedCustomer()">حذف</button>
            </footer>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .customers-page {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .page-head h1 {
      margin: 0;
      color: var(--sero-text-primary);
      font-size: 1rem;
      font-weight: 800;
    }

    .success-message {
      display: inline-flex;
      align-items: center;
      align-self: flex-start;
      gap: 8px;
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
      overflow: hidden;
      border: 1px solid var(--sero-border-light);
      border-radius: 8px;
      background: var(--sero-card-bg);
      box-shadow: var(--shadow-sm);
    }

    .table-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      padding: 12px 14px;
      border-bottom: 1px solid var(--sero-border-light);
    }

    .table-summary {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--sero-text-secondary);
      font-size: 0.78rem;
      font-weight: 800;
    }

    .table-summary .material-icons-round {
      color: var(--sero-primary);
      font-size: 18px;
    }

    .table-wrap {
      overflow-x: auto;
    }

    .customers-table {
      width: 100%;
      min-width: 900px;
      border-collapse: collapse;
    }

    .customers-table thead tr {
      background: var(--sero-primary);
    }

    .customers-table th {
      padding: 10px 14px;
      color: var(--sero-text-inverse);
      font-size: 0.72rem;
      font-weight: 800;
      text-align: right;
      white-space: nowrap;
    }

    .customers-table td {
      padding: 11px 14px;
      border-bottom: 1px solid var(--sero-border-light);
      color: var(--sero-text-primary);
      font-size: 0.8rem;
      text-align: right;
      vertical-align: middle;
      white-space: nowrap;
    }

    .customers-table tbody tr:hover {
      background: var(--sero-surface-2);
    }

    .customers-table tbody tr:last-child td {
      border-bottom: none;
    }

    .name-cell {
      min-width: 210px;
      font-weight: 800;
    }

    .customer-name {
      display: inline-flex;
      align-items: center;
      gap: 10px;
    }

    .name-avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: 1px solid var(--sero-primary-100);
      border-radius: 8px;
      background: var(--sero-primary-50);
      color: var(--sero-primary-dark);
      font-size: 0.68rem;
      font-weight: 900;
      direction: ltr;
      flex-shrink: 0;
    }

    .name-text {
      color: var(--sero-text-primary);
    }

    .phone-cell {
      color: var(--sero-text-secondary);
      font-weight: 800;
      text-align: left;
    }

    .status-heading,
    .status-cell,
    .actions-heading,
    .action-cell {
      text-align: center;
    }

    .status-cell {
      width: 112px;
    }

    .status-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      min-width: 76px;
      min-height: 24px;
      padding: 3px 10px;
      border: 1px solid transparent;
      border-radius: 999px;
      font-size: 0.68rem;
      font-weight: 800;
      white-space: nowrap;
    }

    .status-pill--active {
      border-color: var(--sero-success-border);
      background: var(--sero-success-bg);
      color: var(--sero-success);
    }

    .status-pill--inactive {
      border-color: var(--sero-danger-border);
      background: var(--sero-danger-bg);
      color: var(--sero-danger);
    }

    .status-pill-icon {
      font-size: 14px;
      line-height: 1;
    }

    .action-cell {
      width: 230px;
    }

    .row-actions {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .row-action-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      min-height: 30px;
      padding: 0 8px;
      border: 1px solid var(--sero-border);
      border-radius: 8px;
      background: var(--sero-card-bg);
      color: var(--sero-text-primary);
      font-family: var(--sero-font);
      font-size: 0.72rem;
      font-weight: 800;
      cursor: pointer;
      transition: background var(--t-fast), border-color var(--t-fast), color var(--t-fast);
    }

    .row-action-btn .material-icons-round {
      color: var(--sero-text-secondary);
      font-size: 15px;
    }

    .row-action-btn:hover {
      border-color: var(--sero-primary-100);
      background: var(--sero-primary-50);
      color: var(--sero-primary-dark);
    }

    .row-action-btn:hover .material-icons-round,
    .row-action-btn--edit .material-icons-round {
      color: var(--sero-primary);
    }

    .row-action-btn--edit {
      border-color: var(--sero-primary-100);
      background: var(--sero-primary-50);
      color: var(--sero-primary-dark);
    }

    .row-action-btn--danger {
      border-color: var(--sero-danger-border);
      background: var(--sero-danger-bg);
      color: var(--sero-danger);
    }

    .row-action-btn--danger .material-icons-round,
    .row-action-btn--danger:hover .material-icons-round {
      color: var(--sero-danger);
    }

    .row-action-btn--danger:hover {
      border-color: var(--sero-danger);
      background: var(--sero-danger-bg);
      color: var(--sero-danger);
    }

    .empty-cell {
      padding: 30px 14px;
      color: var(--sero-text-secondary);
      font-size: 0.82rem;
      text-align: center;
    }

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
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .page-size-label,
    .page-info {
      color: var(--sero-text-secondary);
      font-size: 0.76rem;
      font-weight: 800;
      white-space: nowrap;
    }

    .page-size-value {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 34px;
      min-height: 30px;
      padding: 0 10px;
      border: 1px solid var(--sero-border);
      border-radius: 8px;
      background: var(--sero-card-bg);
      color: var(--sero-text-primary);
      font-size: 0.78rem;
      font-weight: 800;
    }

    .page-info {
      direction: ltr;
    }

    .pagination-controls {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .pager-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border: 1px solid var(--sero-border);
      border-radius: 8px;
      background: var(--sero-card-bg);
      color: var(--sero-text-secondary);
      cursor: pointer;
      transition: background var(--t-fast), border-color var(--t-fast), color var(--t-fast);
    }

    .pager-btn:hover:not(:disabled) {
      border-color: var(--sero-border-strong);
      background: var(--sero-surface-2);
      color: var(--sero-text-primary);
    }

    .pager-btn:disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }

    .pager-btn .material-icons-round {
      font-size: 18px;
    }

    .modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 18px;
      background: color-mix(in srgb, var(--sero-text-primary) 36%, transparent);
    }

    .modal-card {
      width: min(100%, 620px);
      max-height: calc(100vh - 36px);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      border: 1px solid var(--sero-border-light);
      border-radius: 12px;
      background: var(--sero-card-bg);
      box-shadow: var(--shadow-xl);
    }

    .modal-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      padding: 14px 16px;
      border-bottom: 1px solid var(--sero-border-light);
      flex-shrink: 0;
    }

    .modal-head h2 {
      margin: 0;
      color: var(--sero-text-primary);
      font-size: 0.94rem;
      font-weight: 800;
    }

    .modal-close-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border: 1px solid var(--sero-border);
      border-radius: 8px;
      background: var(--sero-card-bg);
      color: var(--sero-text-secondary);
      cursor: pointer;
      transition: background var(--t-fast), border-color var(--t-fast), color var(--t-fast);
    }

    .modal-close-btn:hover {
      border-color: var(--sero-border-strong);
      background: var(--sero-surface-2);
      color: var(--sero-text-primary);
    }

    .modal-close-btn .material-icons-round {
      font-size: 18px;
    }

    .modal-body {
      overflow-y: auto;
      padding: 16px;
      flex: 1;
    }

    .details-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 10px;
    }

    .detail-row {
      display: flex;
      flex-direction: column;
      gap: 5px;
      padding: 10px 12px;
      border: 1px solid var(--sero-border-light);
      border-radius: 8px;
      background: var(--sero-surface-2);
    }

    .detail-label {
      color: var(--sero-text-secondary);
      font-size: 0.72rem;
      font-weight: 800;
    }

    .detail-value {
      color: var(--sero-text-primary);
      font-size: 0.82rem;
      font-weight: 800;
    }

    .detail-value--ltr {
      text-align: right;
    }

    .customer-form {
      display: flex;
      flex-direction: column;
      gap: 14px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 0;
    }

    .field-group span {
      color: var(--sero-text-secondary);
      font-size: 0.72rem;
      font-weight: 800;
    }

    .field-group input,
    .field-group select {
      width: 100%;
      min-height: 40px;
      padding: 8px 11px;
      border: 1px solid var(--sero-border);
      border-radius: 8px;
      outline: none;
      background: var(--sero-card-bg);
      color: var(--sero-text-primary);
      font-family: var(--sero-font);
      font-size: 0.82rem;
      font-weight: 700;
      transition: border-color var(--t-fast), box-shadow var(--t-fast);
    }

    .field-group input:hover,
    .field-group select:hover {
      border-color: var(--sero-border-strong);
    }

    .field-group input:focus,
    .field-group select:focus {
      border-color: var(--sero-primary);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--sero-primary) 10%, transparent);
    }

    .delete-message {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 14px;
      border: 1px solid var(--sero-danger-border);
      border-radius: 8px;
      background: var(--sero-danger-bg);
      color: var(--sero-danger);
    }

    .delete-message .material-icons-round {
      font-size: 22px;
      flex-shrink: 0;
    }

    .delete-message p {
      margin: 0 0 4px;
      color: var(--sero-text-primary);
      font-size: 0.82rem;
      font-weight: 800;
    }

    .delete-message strong {
      color: var(--sero-danger);
      font-size: 0.8rem;
      font-weight: 900;
    }

    .modal-actions {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid var(--sero-border-light);
      flex-shrink: 0;
    }

    .modal-actions--inside {
      margin: 0 -16px -16px;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 34px;
      padding: 0 14px;
      border: 1px solid transparent;
      border-radius: 8px;
      font-family: var(--sero-font);
      font-size: 0.78rem;
      font-weight: 800;
      cursor: pointer;
      transition: background var(--t-fast), border-color var(--t-fast), color var(--t-fast);
    }

    .btn--primary {
      background: var(--sero-primary);
      color: var(--sero-text-inverse);
    }

    .btn--primary:hover {
      background: var(--sero-primary-dark);
    }

    .btn--secondary {
      border-color: var(--sero-border);
      background: var(--sero-card-bg);
      color: var(--sero-text-primary);
    }

    .btn--secondary:hover {
      border-color: var(--sero-border-strong);
      background: var(--sero-surface-2);
    }

    .btn--danger {
      background: var(--sero-danger);
      color: var(--sero-text-inverse);
    }

    .btn--danger:hover {
      background: color-mix(in srgb, var(--sero-danger) 88%, var(--sero-text-primary));
    }

    @media (max-width: 720px) {
      .pagination-bar,
      .table-toolbar {
        align-items: flex-start;
        flex-direction: column;
      }

      .row-actions {
        flex-wrap: wrap;
        justify-content: flex-start;
      }

      .details-grid,
      .form-grid {
        grid-template-columns: 1fr;
      }

      .modal-card {
        width: 100%;
      }
    }
  `],
})
export class CustomersPageComponent implements OnDestroy {
  private readonly customersService = inject(CustomersService);

  readonly statusLabels = CUSTOMER_STATUS_LABELS;
  readonly itemsPerPage = CUSTOMER_ITEMS_PER_PAGE;

  private customers: CustomerModel[] = this.customersService.getAll();
  currentPage = 1;

  selectedCustomer: CustomerModel | null = null;
  modalMode: CustomerModalMode | null = null;
  editDraft: CustomerFormValue | null = null;

  successMessage = '';
  private successTimer: ReturnType<typeof setTimeout> | null = null;

  get pagedCustomers(): CustomerModel[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.customers.slice(start, start + this.itemsPerPage);
  }

  get totalItemsCount(): number {
    return this.customers.length;
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

  getCustomerInitials(name: string): string {
    const initials = name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();

    return initials || 'C';
  }

  viewCustomer(customer: CustomerModel): void {
    this.selectedCustomer = { ...customer };
    this.modalMode = 'view';
    this.editDraft = null;
  }

  editCustomer(customer: CustomerModel): void {
    this.selectedCustomer = { ...customer };
    this.editDraft = this.toFormValue(customer);
    this.modalMode = 'edit';
  }

  switchToEdit(): void {
    if (!this.selectedCustomer) {
      return;
    }

    this.editDraft = this.toFormValue(this.selectedCustomer);
    this.modalMode = 'edit';
  }

  confirmDeleteCustomer(customer: CustomerModel): void {
    this.selectedCustomer = { ...customer };
    this.modalMode = 'delete';
    this.editDraft = null;
  }

  updateDraftField(field: CustomerTextField, value: string): void {
    if (!this.editDraft) {
      return;
    }

    this.editDraft = { ...this.editDraft, [field]: value };
  }

  updateDraftStatus(value: string): void {
    if (!this.editDraft || !this.isCustomerStatus(value)) {
      return;
    }

    this.editDraft = { ...this.editDraft, status: value };
  }

  saveEdit(event: Event): void {
    event.preventDefault();

    if (!this.selectedCustomer || !this.editDraft) {
      return;
    }

    const updated = this.customersService.update(this.selectedCustomer.id, this.trimFormValue(this.editDraft));
    if (!updated) {
      return;
    }

    this.refreshCustomers();
    this.closeModal();
    this.showSuccessMessage('تم حفظ تعديلات العميل بنجاح');
  }

  deleteSelectedCustomer(): void {
    if (!this.selectedCustomer) {
      return;
    }

    this.customersService.delete(this.selectedCustomer.id);
    this.refreshCustomers();
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    this.closeModal();
    this.showSuccessMessage('تم حذف العميل بنجاح');
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

  closeModal(): void {
    this.selectedCustomer = null;
    this.modalMode = null;
    this.editDraft = null;
  }

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    if (this.modalMode) {
      this.closeModal();
    }
  }

  ngOnDestroy(): void {
    if (this.successTimer) {
      clearTimeout(this.successTimer);
    }
  }

  private refreshCustomers(): void {
    this.customers = this.customersService.getAll();
  }

  private toFormValue(customer: CustomerModel): CustomerFormValue {
    return {
      name: customer.name,
      phoneNumber: customer.phoneNumber,
      country: customer.country,
      city: customer.city,
      district: customer.district,
      status: customer.status,
    };
  }

  private trimFormValue(value: CustomerFormValue): CustomerFormValue {
    return {
      name: value.name.trim(),
      phoneNumber: value.phoneNumber.trim(),
      country: value.country.trim(),
      city: value.city.trim(),
      district: value.district.trim(),
      status: value.status,
    };
  }

  private isCustomerStatus(value: string): value is CustomerStatus {
    return value === 'active' || value === 'inactive';
  }

  private showSuccessMessage(message: string): void {
    if (this.successTimer) {
      clearTimeout(this.successTimer);
    }

    this.successMessage = message;
    this.successTimer = setTimeout(() => {
      this.successMessage = '';
      this.successTimer = null;
    }, 3000);
  }
}
