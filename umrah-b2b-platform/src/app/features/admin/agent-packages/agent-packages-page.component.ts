import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SeroDropdownComponent } from '../../../shared/components/sero-dropdown/sero-dropdown.component';
import { TableFilterHeaderComponent } from '../../../shared/components/table-filter-header/table-filter-header.component';
import {
  AGENT_PACKAGE_AGENT_OPTIONS,
  AGENT_PACKAGE_CITY_OPTIONS,
  AGENT_PACKAGE_COUNTRY_OPTIONS,
  AGENT_PACKAGE_DEFAULT_FILTERS,
  AGENT_PACKAGE_ITEMS_PER_PAGE_OPTIONS,
  AGENT_PACKAGE_REGION_OPTIONS,
  AgentPackage,
  AgentPackageFilterState,
} from './agent-package.mock';
import { AgentPackagesService } from './agent-packages.service';

@Component({
  selector: 'app-agent-packages-page',
  standalone: true,
  imports: [CommonModule, SeroDropdownComponent, TableFilterHeaderComponent],
  template: `
    <section class="agent-packages-page" dir="rtl">
      <header class="page-head">
        <h1>باقات الوكلاء</h1>
        <button type="button" class="btn btn--primary btn--sm add-btn" (click)="navigateToAdd()">
          <span class="material-icons-round">add</span>
          <span>إضافة باقة</span>
        </button>
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
              <label class="field-label">الدولة</label>
              <app-sero-dropdown
                [options]="countryOptions"
                [value]="filters.country"
                placeholder="كل الدول"
                (valueChange)="filters = { ...filters, country: $event }">
              </app-sero-dropdown>
            </div>

            <div class="field-group">
              <label class="field-label">المنطقة</label>
              <app-sero-dropdown
                [options]="regionOptions"
                [value]="filters.region"
                placeholder="كل المناطق"
                (valueChange)="filters = { ...filters, region: $event }">
              </app-sero-dropdown>
            </div>

            <div class="field-group">
              <label class="field-label">المدينة</label>
              <app-sero-dropdown
                [options]="cityOptions"
                [value]="filters.city"
                placeholder="كل المدن"
                (valueChange)="filters = { ...filters, city: $event }">
              </app-sero-dropdown>
            </div>

            <div class="field-group">
              <label class="field-label">اختر الوكيل</label>
              <app-sero-dropdown
                [options]="agentOptions"
                [value]="filters.agent"
                placeholder="كل الوكلاء"
                (valueChange)="filters = { ...filters, agent: $event }">
              </app-sero-dropdown>
            </div>

            <div class="field-group field-group--check">
              <label class="field-label">&nbsp;</label>
              <label class="inactive-check">
                <input
                  type="checkbox"
                  [checked]="filters.includeInactive"
                  (change)="filters = { ...filters, includeInactive: $any($event.target).checked }" />
                <span>إشمال غير النشط</span>
              </label>
            </div>
          </div>
        </app-table-filter-header>

        <div class="actions-bar">
          <div class="filters-actions">
            <button type="button" class="btn btn--primary btn--sm" (click)="search()">بحث</button>
            <button type="button" class="btn btn--secondary btn--sm" (click)="clear()">مسح</button>
          </div>
        </div>

        <div class="table-wrap">
          <table class="packages-table">
            <thead>
              <tr>
                <th class="th-img">صورة</th>
                <th>الباقة</th>
                <th>السعر</th>
                <th>تاريخ البداية</th>
                <th>تاريخ النهاية</th>
                <th class="th-center">التأشيرة مشمولة</th>
                <th class="th-center">الإجراء</th>
              </tr>
            </thead>
            <tbody>
              @if (pagedPackages.length === 0) {
                <tr>
                  <td colspan="7" class="empty-cell">لا توجد بيانات</td>
                </tr>
              } @else {
                @for (pkg of pagedPackages; track pkg.id) {
                  <tr>
                    <td class="img-cell">
                      <div class="pkg-img-placeholder">
                        <span class="material-icons-round">inventory_2</span>
                      </div>
                    </td>

                    <td class="pkg-cell">
                      <span class="pkg-name">{{ pkg.name }}</span>
                      @if (pkg.description) {
                        <span class="pkg-desc">{{ pkg.description }}</span>
                      }
                    </td>

                    <td class="price-cell" dir="ltr">R {{ pkg.price | number:'1.2-2' }}</td>

                    <td class="date-cell">{{ pkg.startDate | date:'d/M/yyyy' }}</td>

                    <td class="date-cell">{{ pkg.endDate | date:'d/M/yyyy' }}</td>

                    <td class="visa-cell">
                      @if (pkg.visaIncluded) {
                        <span class="material-icons-round visa-yes">check_circle</span>
                      } @else {
                        <span class="visa-no">—</span>
                      }
                    </td>

                    <td class="action-cell">
                      <div class="action-menu-wrap" (click)="$event.stopPropagation()">
                        <button
                          type="button"
                          class="table-action-btn"
                          [class.is-open]="openedActionMenuId === pkg.id"
                          (click)="toggleActionMenu(pkg.id, $event)"
                          aria-haspopup="menu"
                          [attr.aria-expanded]="openedActionMenuId === pkg.id"
                          aria-label="إجراءات">
                          <span class="dot"></span>
                          <span class="dot"></span>
                          <span class="dot"></span>
                        </button>

                        @if (openedActionMenuId === pkg.id) {
                          <div class="row-actions-menu" role="menu">
                            @if (pendingDeleteId === pkg.id) {
                              <div class="delete-confirm">
                                <p>هل تريد حذف هذه الباقة؟</p>
                                <div class="delete-confirm-actions">
                                  <button type="button" class="confirm-btn confirm-btn--danger" (click)="executeDelete(pkg.id, $event)">حذف</button>
                                  <button type="button" class="confirm-btn confirm-btn--cancel" (click)="cancelDelete($event)">إلغاء</button>
                                </div>
                              </div>
                            } @else {
                              <button type="button" class="row-action-item" role="menuitem" (click)="viewPackage(pkg.id, $event)">
                                <span class="material-icons-round">visibility</span>
                                <span>عرض</span>
                              </button>
                              <button type="button" class="row-action-item" role="menuitem" (click)="editPackage(pkg.id, $event)">
                                <span class="material-icons-round">edit</span>
                                <span>تعديل</span>
                              </button>
                              <button type="button" class="row-action-item row-action-item--danger" role="menuitem" (click)="confirmDelete(pkg.id, $event)">
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
    </section>
  `,
  styles: [`
    .agent-packages-page {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .page-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
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

    .field-label {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--sero-text-secondary);
    }

    .inactive-check {
      min-height: 36px;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--sero-text-primary);
    }

    .inactive-check input {
      accent-color: var(--sero-primary);
      width: 16px;
      height: 16px;
      cursor: pointer;
      flex-shrink: 0;
    }

    .actions-bar {
      display: flex;
      align-items: center;
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

    .add-btn .material-icons-round { font-size: 15px; }

    .table-wrap { overflow-x: auto; }

    .packages-table {
      width: 100%;
      min-width: 760px;
      border-collapse: collapse;
    }

    .packages-table thead tr { background: var(--sero-primary); }

    .packages-table th {
      color: rgba(255, 255, 255, 0.92);
      font-size: 0.72rem;
      font-weight: 700;
      text-align: right;
      padding: 10px 14px;
      white-space: nowrap;
    }

    .th-img { width: 64px; text-align: center; }
    .th-center { text-align: center; }

    .packages-table td {
      border-bottom: 1px solid var(--sero-border-light);
      color: var(--sero-text-primary);
      font-size: 0.8rem;
      text-align: right;
      padding: 10px 14px;
      vertical-align: middle;
    }

    .packages-table tbody tr:hover { background: var(--sero-surface-2, #fbfcfa); }
    .packages-table tbody tr:last-child td { border-bottom: none; }

    .img-cell { text-align: center; width: 64px; }

    .pkg-img-placeholder {
      width: 44px;
      height: 44px;
      border-radius: 8px;
      background: var(--sero-bg-subtle);
      border: 1px solid var(--sero-border-light);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--sero-text-secondary);
    }

    .pkg-img-placeholder .material-icons-round { font-size: 22px; }

    .pkg-cell {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .pkg-name {
      font-weight: 700;
      color: var(--sero-text-primary);
    }

    .pkg-desc {
      font-size: 0.72rem;
      color: var(--sero-text-secondary);
      font-weight: 500;
    }

    .price-cell {
      font-weight: 700;
      white-space: nowrap;
    }

    .date-cell {
      white-space: nowrap;
      color: var(--sero-text-secondary);
      font-weight: 600;
    }

    .visa-cell { text-align: center; }

    .visa-yes {
      font-size: 18px;
      color: var(--sero-success, #2d7a2d);
    }

    .visa-no {
      color: var(--sero-text-secondary);
      font-size: 1rem;
    }

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

    @media (max-width: 860px) {
      .filters-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
    }

    @media (max-width: 600px) {
      .filters-grid { grid-template-columns: 1fr 1fr; }
      .page-head { flex-wrap: wrap; }
      .add-btn { width: 100%; justify-content: center; }
    }

    @media (max-width: 400px) {
      .filters-grid { grid-template-columns: 1fr; }
    }
  `],
})
export class AgentPackagesPageComponent implements OnDestroy {
  private readonly service = inject(AgentPackagesService);
  private readonly router = inject(Router);

  readonly countryOptions = AGENT_PACKAGE_COUNTRY_OPTIONS;
  readonly regionOptions = AGENT_PACKAGE_REGION_OPTIONS;
  readonly cityOptions = AGENT_PACKAGE_CITY_OPTIONS;
  readonly agentOptions = AGENT_PACKAGE_AGENT_OPTIONS;
  readonly itemsPerPageOptions = AGENT_PACKAGE_ITEMS_PER_PAGE_OPTIONS;
  readonly itemsPerPageDropdownOptions = this.itemsPerPageOptions.map((n) => ({ value: n, label: String(n) }));

  filters: AgentPackageFilterState = { ...AGENT_PACKAGE_DEFAULT_FILTERS };
  filtersExpanded = true;
  openedActionMenuId: string | null = null;
  pendingDeleteId: string | null = null;

  private filteredPackages: AgentPackage[] = this.service.getAll().filter((p) => p.isActive);

  currentPage = 1;
  itemsPerPage = this.itemsPerPageOptions[0];

  successMessage = '';
  private successTimer: ReturnType<typeof setTimeout> | null = null;

  get pagedPackages(): AgentPackage[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredPackages.slice(start, start + this.itemsPerPage);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredPackages.length / this.itemsPerPage));
  }

  get shownItemsLabel(): string {
    const total = this.filteredPackages.length;
    if (total === 0) return '0';
    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(this.currentPage * this.itemsPerPage, total);
    return `${start} – ${end} من ${total}`;
  }

  search(): void {
    let result = this.service.getAll();
    const { country, region, city, agent, includeInactive } = this.filters;
    if (!includeInactive) result = result.filter((p) => p.isActive);
    if (country) result = result.filter((p) => p.country === country);
    if (region) result = result.filter((p) => p.region === region);
    if (city) result = result.filter((p) => p.city === city);
    if (agent) result = result.filter((p) => p.agent === agent);
    this.filteredPackages = result;
    this.currentPage = 1;
    this.openedActionMenuId = null;
  }

  clear(): void {
    this.filters = { ...AGENT_PACKAGE_DEFAULT_FILTERS };
    this.filteredPackages = this.service.getAll().filter((p) => p.isActive);
    this.currentPage = 1;
    this.itemsPerPage = this.itemsPerPageOptions[0];
    this.openedActionMenuId = null;
  }

  navigateToAdd(): void {
    void this.router.navigate(['/admin/packages/new']);
  }

  viewPackage(id: string, event: Event): void {
    event.stopPropagation();
    this.openedActionMenuId = null;
    void this.router.navigate(['/admin/packages/view', id]);
  }

  editPackage(id: string, event: Event): void {
    event.stopPropagation();
    this.openedActionMenuId = null;
    void this.router.navigate(['/admin/packages/edit', id]);
  }

  toggleActionMenu(id: string, event: Event): void {
    event.stopPropagation();
    this.openedActionMenuId = this.openedActionMenuId === id ? null : id;
    this.pendingDeleteId = null;
  }

  confirmDelete(id: string, event: Event): void {
    event.stopPropagation();
    this.pendingDeleteId = id;
  }

  executeDelete(id: string, event: Event): void {
    event.stopPropagation();
    this.service.delete(id);
    this.filteredPackages = this.filteredPackages.filter((p) => p.id !== id);
    if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    this.openedActionMenuId = null;
    this.pendingDeleteId = null;
    this.showSuccessMessage('تم حذف الباقة بنجاح');
  }

  cancelDelete(event: Event): void {
    event.stopPropagation();
    this.pendingDeleteId = null;
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
