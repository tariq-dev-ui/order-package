import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, HostListener, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subject, takeUntil } from 'rxjs';
import { SeroDropdownComponent } from '../../../shared/components/sero-dropdown/sero-dropdown.component';
import { TableFilterHeaderComponent } from '../../../shared/components/table-filter-header/table-filter-header.component';
import {
  MY_SERVICE_TYPE_OPTIONS,
  MY_SERVICE_CITY_OPTIONS,
  MY_SERVICE_STATUS_OPTIONS,
  MY_SERVICE_DEFAULT_FILTERS,
  MY_SERVICE_ITEMS_PER_PAGE_OPTIONS,
  MyService,
  MyServiceFilterState,
} from './my-service.mock';
import { MyServicesService } from './my-services.service';
import { MyServicesFormComponent } from './my-services-form/my-services-form.component';

@Component({
  selector: 'app-my-services-page',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    SeroDropdownComponent,
    TableFilterHeaderComponent,
  ],
  template: `
    <section class="my-services-page" dir="rtl">
      <!-- ── Page Header ── -->
      <header class="page-head">
        <div class="page-head-content">
          <div>
            <h1>خدماتي</h1>
            <p class="page-subtitle">إدارة جميع خدماتك</p>
          </div>
          <div class="add-menu-wrap">
            <button
              type="button"
              class="btn btn--primary btn--lg add-btn"
              aria-haspopup="menu"
              [attr.aria-expanded]="isAddMenuOpen()"
              (click)="toggleAddMenu($event)"
              (keydown)="onAddButtonKeydown($event)">
              <span class="material-icons-round">add</span>
              <span>إضافة خدمة جديدة</span>
              <span class="material-icons-round add-chevron" [class.is-open]="isAddMenuOpen()">expand_more</span>
            </button>

            @if (isAddMenuOpen()) {
              <div class="service-add-menu" role="menu" (click)="$event.stopPropagation()">
                <div
                  class="service-menu-group"
                  [class.is-open]="isHotelsSubmenuOpen()"
                  (mouseenter)="openHotelsSubmenu()"
                  (mouseleave)="closeHotelsSubmenu()">
                  <button
                    type="button"
                    class="service-menu-item has-submenu"
                    role="menuitem"
                    aria-haspopup="menu"
                    [attr.aria-expanded]="isHotelsSubmenuOpen()"
                    (click)="toggleHotelsSubmenu($event)"
                    (keydown)="onHotelsItemKeydown($event)">
                    <span class="material-icons-round menu-item-icon">hotel</span>
                    <span>فنادق</span>
                    <span class="material-icons-round submenu-chevron">chevron_left</span>
                  </button>

                  @if (isHotelsSubmenuOpen()) {
                    <div class="hotels-submenu" role="menu">
                      <button type="button" class="service-menu-item" role="menuitem" (click)="navigateToAddService('/master/my-services/makkah/new')">
                        <span class="material-icons-round menu-item-icon">hotel</span>
                        <span>فنادق مكة</span>
                      </button>
                      <button type="button" class="service-menu-item" role="menuitem" (click)="navigateToAddService('/master/my-services/madina/new')">
                        <span class="material-icons-round menu-item-icon">hotel</span>
                        <span>فنادق المدينة</span>
                      </button>
                    </div>
                  }
                </div>

                <button type="button" class="service-menu-item" role="menuitem" (click)="navigateToAddService('/master/my-services/transport/new')">
                  <span class="material-icons-round menu-item-icon">directions_bus</span>
                  <span>مواصلات</span>
                </button>
                <button type="button" class="service-menu-item" role="menuitem" (click)="navigateToAddService('/master/my-services/tickets/new')">
                  <span class="material-icons-round menu-item-icon">confirmation_number</span>
                  <span>تذاكر</span>
                </button>
                <button type="button" class="service-menu-item" role="menuitem" (click)="navigateToAddService('/master/my-services/food/new')">
                  <span class="material-icons-round menu-item-icon">restaurant</span>
                  <span>تغذية</span>
                </button>
              </div>
            }
          </div>
        </div>
      </header>

      <!-- ── Success Message ── -->
      @if (successMessage()) {
        <div class="success-message" role="status">
          <span class="material-icons-round">check_circle</span>
          <span>{{ successMessage() }}</span>
        </div>
      }

      <!-- ── Filter Section ── -->
      <section class="surface-card">
        <app-table-filter-header [(expanded)]="filtersExpanded">
          <div class="filters-grid">
            <div class="field-group">
              <label class="field-label">البحث</label>
              <input
                type="text"
                class="filter-input"
                placeholder="ابحث عن خدمة..."
                [value]="filters().searchText"
                (input)="onSearchInput($event)" />
            </div>

            <div class="field-group">
              <label class="field-label">نوع الخدمة</label>
              <app-sero-dropdown
                [options]="serviceTypeOptions"
                [value]="filters().serviceType"
                placeholder="جميع الأنواع"
                (valueChange)="onFilterChange('serviceType', $event)">
              </app-sero-dropdown>
            </div>

            <div class="field-group">
              <label class="field-label">المدينة</label>
              <app-sero-dropdown
                [options]="serviceCityOptions"
                [value]="filters().serviceCity"
                placeholder="جميع المدن"
                (valueChange)="onFilterChange('serviceCity', $event)">
              </app-sero-dropdown>
            </div>

            <div class="field-group">
              <label class="field-label">الحالة</label>
              <app-sero-dropdown
                [options]="statusOptions"
                [value]="filters().status"
                placeholder="جميع الحالات"
                (valueChange)="onFilterChange('status', $event)">
              </app-sero-dropdown>
            </div>
          </div>
        </app-table-filter-header>

        <div class="actions-bar">
          <div class="filters-actions">
            <button type="button" class="btn btn--primary btn--sm" (click)="search()">بحث</button>
            <button type="button" class="btn btn--secondary btn--sm" (click)="clear()">مسح</button>
          </div>
          <div class="pagination-info">
            عدد النتائج: <strong>{{ allServices().length }}</strong>
          </div>
        </div>

        <!-- ── Services Table ── -->
        <div class="table-wrap">
          @if (isLoading()) {
            <div class="loading-overlay">
              <div class="spinner"></div>
            </div>
          }

          @if (pagedServices().length === 0) {
            <div class="empty-state">
              <span class="material-icons-round">inbox</span>
              <p>لا توجد خدمات</p>
              <button type="button" class="btn btn--primary" (click)="toggleAddMenu($event)">
                <span class="material-icons-round">add</span>
                إضافة خدمة جديدة
              </button>
            </div>
          } @else {
            <table class="services-table">
              <thead>
                <tr>
                  <th class="col-from">من</th>
                  <th class="col-to">إلى</th>
                  <th class="col-type">نوع الخدمة</th>
                  <th class="col-city">المدينة</th>
                  <th class="col-price">السعر</th>
                  <th class="col-status">الحالة</th>
                  <th class="col-date">تاريخ الإنشاء</th>
                  <th class="col-actions text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                @for (service of pagedServices(); track service.id) {
                  <tr>
                    <td class="col-from">{{ service.from }}</td>
                    <td class="col-to">{{ service.to }}</td>
                    <td class="col-type">{{ getServiceTypeLabel(service.serviceType) }}</td>
                    <td class="col-city">{{ getServiceCityLabel(service.serviceCity) }}</td>
                    <td class="col-price" dir="ltr">₪ {{ service.price | number: '1.2-2' }}</td>
                    <td class="col-status">
                      <span [class]="'status-badge status-' + service.status">
                        {{ getStatusLabel(service.status) }}
                      </span>
                    </td>
                    <td class="col-date">{{ service.createdDate | date: 'dd/MM/yyyy' }}</td>
                    <td class="col-actions">
                      <div class="action-buttons">
                        <button type="button" class="btn-icon" title="عرض" (click)="viewService(service)">
                          <span class="material-icons-round">visibility</span>
                        </button>
                        <button type="button" class="btn-icon" title="تعديل" (click)="openEditServiceDialog(service)">
                          <span class="material-icons-round">edit</span>
                        </button>
                        <button type="button" class="btn-icon btn-icon--danger" title="حذف" (click)="deleteService(service)">
                          <span class="material-icons-round">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }

          <!-- ── Pagination ── -->
          @if (allServices().length > 0 && itemsPerPage() < allServices().length) {
            <div class="pagination">
              <div class="pagination-info">
                الصفحة <strong>{{ currentPage() }}</strong> من <strong>{{ totalPages() }}</strong>
              </div>
              <div class="pagination-controls">
                <select class="items-per-page" [value]="itemsPerPage()" (change)="onItemsPerPageChange($event)">
                  @for (option of itemsPerPageOptions; track option) {
                    <option [value]="option">{{ option }} لكل صفحة</option>
                  }
                </select>
                <button
                  type="button"
                  class="btn btn--secondary btn--sm"
                  [disabled]="currentPage() === 1"
                  (click)="previousPage()">
                  السابق
                </button>
                <button
                  type="button"
                  class="btn btn--secondary btn--sm"
                  [disabled]="currentPage() === totalPages()"
                  (click)="nextPage()">
                  التالي
                </button>
              </div>
            </div>
          }
        </div>
      </section>
    </section>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .my-services-page {
        padding: 24px;
      }

      /* ── Page Header ── */
      .page-head {
        margin-bottom: 24px;
      }

      .page-head-content {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 20px;
      }

      .page-head h1 {
        margin: 0;
        font-size: 28px;
        font-weight: 600;
        color: var(--sero-text-primary);
      }

      .page-subtitle {
        margin: 4px 0 0;
        font-size: 14px;
        color: var(--sero-text-secondary);
      }

      .add-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        white-space: nowrap;
      }

      .add-menu-wrap {
        position: relative;
        display: inline-flex;
        align-items: center;
        overflow: visible;
        z-index: 40;
      }

      .add-chevron {
        font-size: 18px;
        transition: transform var(--t-fast, 150ms ease);
      }

      .add-chevron.is-open {
        transform: rotate(180deg);
      }

      .service-add-menu,
      .hotels-submenu {
        min-width: 220px;
        padding: 8px;
        border: 1px solid var(--sero-border);
        border-radius: 10px;
        background: var(--sero-card-bg);
        box-shadow: var(--shadow-lg);
        z-index: 1000;
      }

      .service-add-menu {
        position: absolute;
        top: calc(100% + 8px);
        inset-inline-end: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .service-menu-group {
        position: relative;
      }

      .hotels-submenu {
        position: absolute;
        top: 0;
        inset-inline-end: calc(100% + 8px);
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .service-menu-item {
        width: 100%;
        min-height: 40px;
        border: 1px solid transparent;
        border-radius: 8px;
        background: transparent;
        color: var(--sero-text-primary);
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 9px 10px;
        font-family: var(--sero-font);
        font-size: 0.86rem;
        font-weight: 600;
        text-align: start;
        transition: background var(--t-fast, 150ms ease), border-color var(--t-fast, 150ms ease), color var(--t-fast, 150ms ease);
      }

      .service-menu-item:hover,
      .service-menu-item:focus-visible,
      .service-menu-group.is-open > .service-menu-item {
        outline: none;
        background: var(--sero-bg-selected);
        border-color: var(--sero-border-light);
        color: var(--sero-primary-dark);
      }

      .menu-item-icon {
        width: 20px;
        color: var(--sero-primary);
        font-size: 18px;
        flex-shrink: 0;
        text-align: center;
      }

      .submenu-chevron {
        margin-inline-start: auto;
        color: var(--sero-text-muted);
        font-size: 18px;
        flex-shrink: 0;
      }

      /* ── Success Message ── */
      .success-message {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        margin-bottom: 16px;
        background: #d4edda;
        color: #155724;
        border-radius: 8px;
        animation: slideIn 0.3s ease-out;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      /* ── Surface Card ── */
      .surface-card {
        background: var(--sero-surface);
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      /* ── Filters ── */
      .filters-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 16px;
        margin-bottom: 16px;
      }

      .field-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .field-label {
        font-size: 13px;
        font-weight: 500;
        color: var(--sero-text-primary);
      }

      .filter-input {
        padding: 10px 12px;
        border: 1px solid var(--sero-border);
        border-radius: 6px;
        font-size: 14px;
        font-family: inherit;
        background: var(--sero-input-bg);
        color: var(--sero-text-primary);
        transition: border-color 0.3s ease;
      }

      .filter-input:focus {
        outline: none;
        border-color: var(--sero-primary);
        box-shadow: 0 0 0 3px rgba(58, 71, 42, 0.1);
      }

      /* ── Actions Bar ── */
      .actions-bar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 16px;
        border-bottom: 1px solid var(--sero-border);
      }

      .filters-actions {
        display: flex;
        gap: 8px;
      }

      .pagination-info {
        font-size: 14px;
        color: var(--sero-text-secondary);
      }

      /* ── Table ── */
      .table-wrap {
        position: relative;
        overflow-x: auto;
      }

      .services-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
      }

      .services-table thead {
        background: var(--sero-bg-hover);
        border-bottom: 2px solid var(--sero-border);
      }

      .services-table th {
        padding: 12px 8px;
        text-align: right;
        font-weight: 600;
        color: var(--sero-text-primary);
      }

      .services-table td {
        padding: 12px 8px;
        border-bottom: 1px solid var(--sero-border);
        color: var(--sero-text-primary);
      }

      .services-table tbody tr:hover {
        background: var(--sero-bg-hover);
      }

      .col-from,
      .col-to,
      .col-city {
        max-width: 120px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      /* ── Status Badges ── */
      .status-badge {
        display: inline-block;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 500;
      }

      .status-active {
        background: #d4edda;
        color: #155724;
      }

      .status-inactive {
        background: #f8d7da;
        color: #721c24;
      }

      .status-pending {
        background: #fff3cd;
        color: #856404;
      }

      /* ── Action Buttons ── */
      .action-buttons {
        display: flex;
        gap: 4px;
        justify-content: center;
      }

      .btn-icon {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        padding: 0;
        border: none;
        background: transparent;
        border-radius: 6px;
        cursor: pointer;
        color: var(--sero-primary);
        transition: all 0.3s ease;
      }

      .btn-icon:hover {
        background: var(--sero-bg-hover);
        color: var(--sero-primary-dark);
      }

      .btn-icon--danger {
        color: #dc3545;
      }

      .btn-icon--danger:hover {
        background: rgba(220, 53, 69, 0.1);
        color: #c82333;
      }

      /* ── Empty State ── */
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        text-align: center;
        color: var(--sero-text-secondary);
      }

      .empty-state .material-icons-round {
        font-size: 64px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      .empty-state p {
        margin: 0 0 20px;
        font-size: 16px;
      }

      /* ── Loading Overlay ── */
      .loading-overlay {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        z-index: 10;
      }

      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid var(--sero-border);
        border-top-color: var(--sero-primary);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      /* ── Pagination ── */
      .pagination {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 20px;
        padding-top: 16px;
        border-top: 1px solid var(--sero-border);
      }

      .pagination-controls {
        display: flex;
        gap: 12px;
        align-items: center;
      }

      .items-per-page {
        padding: 6px 12px;
        border: 1px solid var(--sero-border);
        border-radius: 6px;
        font-size: 14px;
        background: var(--sero-input-bg);
        color: var(--sero-text-primary);
        cursor: pointer;
      }

      /* ── Buttons ── */
      .btn {
        padding: 10px 16px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.3s ease;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .btn--primary {
        background: var(--sero-primary);
        color: white;
      }

      .btn--primary:hover:not(:disabled) {
        background: var(--sero-primary-dark);
      }

      .btn--secondary {
        background: var(--sero-bg-hover);
        color: var(--sero-text-primary);
      }

      .btn--secondary:hover:not(:disabled) {
        background: var(--sero-border);
      }

      .btn--sm {
        padding: 8px 12px;
        font-size: 13px;
      }

      .btn--lg {
        padding: 12px 20px;
        font-size: 15px;
      }

      .btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .text-center {
        text-align: center;
      }

      /* ── Responsive ── */
      @media (max-width: 768px) {
        .my-services-page {
          padding: 16px;
        }

        .page-head-content {
          flex-direction: column;
        }

        .add-menu-wrap,
        .add-btn {
          width: 100%;
        }

        .add-btn {
          justify-content: center;
        }

        .service-add-menu {
          inset-inline-start: 0;
          inset-inline-end: auto;
          width: min(320px, calc(100vw - 32px));
        }

        .hotels-submenu {
          position: static;
          min-width: 0;
          margin-top: 4px;
          margin-inline-start: 26px;
          box-shadow: none;
          border-color: var(--sero-border-light);
          background: var(--sero-surface-2);
        }

        .filters-grid {
          grid-template-columns: 1fr;
        }

        .actions-bar {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }

        .pagination {
          flex-direction: column;
          gap: 16px;
          align-items: flex-start;
        }

        .services-table {
          font-size: 12px;
        }

        .services-table th,
        .services-table td {
          padding: 8px 4px;
        }
      }
    `,
  ],
})
export class MyServicesPageComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private api = inject(MyServicesService);
  private destroy$ = new Subject<void>();

  // Signals
  isLoading = signal(false);
  successMessage = signal('');
  isAddMenuOpen = signal(false);
  isHotelsSubmenuOpen = signal(false);
  filtersExpanded = false;
  filters = signal<MyServiceFilterState>({ ...MY_SERVICE_DEFAULT_FILTERS });
  allServices = signal<MyService[]>([]);
  currentPage = signal(1);
  itemsPerPage = signal(10);

  // Options
  serviceTypeOptions = MY_SERVICE_TYPE_OPTIONS;
  serviceCityOptions = MY_SERVICE_CITY_OPTIONS;
  statusOptions = MY_SERVICE_STATUS_OPTIONS;
  itemsPerPageOptions = MY_SERVICE_ITEMS_PER_PAGE_OPTIONS;

  // Computed
  totalPages = computed(() => Math.ceil(this.allServices().length / this.itemsPerPage()) || 1);
  pagedServices = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage();
    return this.allServices().slice(start, start + this.itemsPerPage());
  });

  ngOnInit(): void {
    this.loadServices();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeAddMenu();
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closeAddMenu();
  }

  loadServices(): void {
    this.isLoading.set(true);
    this.api
      .getServices(this.filters())
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (services) => {
          this.allServices.set(services);
          this.currentPage.set(1);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading services:', err);
          this.isLoading.set(false);
        },
      });
  }

  onSearchInput(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.filters.set({ ...this.filters(), searchText: input });
  }

  onFilterChange(key: string, value: string): void {
    this.filters.set({ ...this.filters(), [key]: value });
  }

  search(): void {
    this.currentPage.set(1);
    this.loadServices();
  }

  clear(): void {
    this.filters.set({ ...MY_SERVICE_DEFAULT_FILTERS });
    this.currentPage.set(1);
    this.loadServices();
  }

  toggleAddMenu(event: Event): void {
    event.stopPropagation();
    const nextState = !this.isAddMenuOpen();
    this.isAddMenuOpen.set(nextState);
    if (!nextState) {
      this.isHotelsSubmenuOpen.set(false);
    }
  }

  closeAddMenu(): void {
    this.isAddMenuOpen.set(false);
    this.isHotelsSubmenuOpen.set(false);
  }

  openHotelsSubmenu(): void {
    this.isHotelsSubmenuOpen.set(true);
  }

  closeHotelsSubmenu(): void {
    this.isHotelsSubmenuOpen.set(false);
  }

  toggleHotelsSubmenu(event: Event): void {
    event.stopPropagation();
    this.isHotelsSubmenuOpen.set(!this.isHotelsSubmenuOpen());
  }

  onAddButtonKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.isAddMenuOpen.set(true);
    }
  }

  onHotelsItemKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.isHotelsSubmenuOpen.set(true);
    }
  }

  navigateToAddService(route: string): void {
    this.closeAddMenu();
    this.router.navigateByUrl(route);
  }

  openAddServiceDialog(): void {
    const dialogRef = this.dialog.open(MyServicesFormComponent, {
      width: '600px',
      direction: 'rtl',
      data: { mode: 'add' },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.successMessage.set('تم إضافة الخدمة بنجاح');
        this.loadServices();
        setTimeout(() => this.successMessage.set(''), 3000);
      }
    });
  }

  openEditServiceDialog(service: MyService): void {
    const dialogRef = this.dialog.open(MyServicesFormComponent, {
      width: '600px',
      direction: 'rtl',
      data: { mode: 'edit', service },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.successMessage.set('تم تحديث الخدمة بنجاح');
        this.loadServices();
        setTimeout(() => this.successMessage.set(''), 3000);
      }
    });
  }

  viewService(service: MyService): void {
    // Could open a detail view or modal
    console.log('View service:', service);
  }

  deleteService(service: MyService): void {
    if (confirm('هل تريد حذف هذه الخدمة؟')) {
      this.isLoading.set(true);
      this.api
        .deleteService(service.id)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (success) => {
            if (success) {
              this.successMessage.set('تم حذف الخدمة بنجاح');
              this.loadServices();
              setTimeout(() => this.successMessage.set(''), 3000);
            }
          },
          error: (err) => {
            console.error('Error deleting service:', err);
            this.isLoading.set(false);
          },
        });
    }
  }

  getServiceTypeLabel(value: string): string {
    return MY_SERVICE_TYPE_OPTIONS.find((o) => o.value === value)?.label || value;
  }

  getServiceCityLabel(value: string): string {
    return MY_SERVICE_CITY_OPTIONS.find((o) => o.value === value)?.label || value;
  }

  getStatusLabel(value: string): string {
    return MY_SERVICE_STATUS_OPTIONS.find((o) => o.value === value)?.label || value;
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.set(this.currentPage() + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.set(this.currentPage() - 1);
    }
  }

  onItemsPerPageChange(event: Event): void {
    const value = parseInt((event.target as HTMLSelectElement).value, 10);
    this.itemsPerPage.set(value);
    this.currentPage.set(1);
  }
}
