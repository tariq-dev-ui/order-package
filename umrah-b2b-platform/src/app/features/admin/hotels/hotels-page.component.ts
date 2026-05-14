import { CommonModule } from '@angular/common';
import { Component, HostListener, OnDestroy, inject } from '@angular/core';
import { SeroDropdownComponent, SeroDropdownOption } from '../../../shared/components/sero-dropdown/sero-dropdown.component';
import { StatusTogglePillComponent } from '../../../shared/components/status-toggle-pill/status-toggle-pill.component';
import { TableFilterHeaderComponent } from '../../../shared/components/table-filter-header/table-filter-header.component';
import { HotelFormComponent } from './hotel-form.component';
import { HotelFormMode, HotelFormValue, HotelModel, HotelsFilterState, HotelStatusFilter } from './hotel.model';
import {
  HOTEL_CITY_OPTIONS,
  HOTEL_DISTRICTS_BY_CITY,
  HOTEL_ITEMS_PER_PAGE_OPTIONS,
  HOTEL_RATING_OPTIONS,
  HOTEL_STATUS_OPTIONS,
  HOTELS_DEFAULT_FILTERS,
} from './hotels.mock';
import { HotelsService } from './hotels.service';

@Component({
  selector: 'app-hotels-page',
  standalone: true,
  imports: [
    CommonModule,
    SeroDropdownComponent,
    StatusTogglePillComponent,
    TableFilterHeaderComponent,
    HotelFormComponent,
  ],
  template: `
    <section class="hotels-page" dir="rtl">
      <header class="page-head">
        <h1>الفنادق</h1>
      </header>

      @if (successMessage) {
        <div class="success-message" role="status">
          <span class="material-icons-round">check_circle</span>
          <span>{{ successMessage }}</span>
        </div>
      }

      <section class="surface-card">
        <app-table-filter-header
          title="معايير البحث"
          subtitle="ابحث عن الفنادق حسب المدينة والحي والمسافة والتقييم والحالة"
          [showToggleLabel]="true"
          [(expanded)]="filtersExpanded">
          <div class="filters-grid">
            <div class="field-group">
              <label>المدينة</label>
              <app-sero-dropdown
                [options]="cityOptions"
                [value]="filters.city"
                placeholder="اختر المدينة"
                (valueChange)="onCityChange($event)">
              </app-sero-dropdown>
            </div>

            <div class="field-group">
              <label>الحي</label>
              <app-sero-dropdown
                [options]="districtOptions"
                [value]="filters.district"
                [placeholder]="filters.city ? 'اختر الحي' : 'اختر المدينة أولاً'"
                (valueChange)="onDistrictChange($event)">
              </app-sero-dropdown>
            </div>

            <div class="field-group">
              <label>أقصى بعد عن الحرم</label>
              <input
                class="filter-input"
                type="text"
                [value]="filters.maxDistanceFromHaram"
                placeholder="أقصى بعد عن الحرم"
                (input)="onDistanceChange($any($event.target).value)" />
            </div>

            <div class="field-group">
              <label>التقييم</label>
              <app-sero-dropdown
                [options]="ratingOptions"
                [value]="filters.rating"
                placeholder="Select Rating"
                (valueChange)="onRatingChange($event)">
              </app-sero-dropdown>
            </div>

            <div class="field-group">
              <label>فعال</label>
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

          <button type="button" class="btn btn--primary btn--sm add-hotel-btn" (click)="openCreateForm()">
            <span class="material-icons-round">add</span>
            <span>إضافة فندق</span>
          </button>
        </div>

        <div class="table-wrap">
          <table class="hotels-table">
            <thead>
              <tr>
                <th>الشعار</th>
                <th>الاسم</th>
                <th>العنوان</th>
                <th>التقييم</th>
                <th>تاريخ الإضافة</th>
                <th>الحالة</th>
                <th>الإجراء</th>
              </tr>
            </thead>
            <tbody>
              @if (pagedHotels.length === 0) {
                <tr>
                  <td colspan="7" class="empty-cell">لا توجد بيانات</td>
                </tr>
              } @else {
                @for (hotel of pagedHotels; track hotel.id) {
                  <tr>
                    <td>
                      <div class="logo-cell">
                        <span class="logo-mark">
                          <span class="material-icons-round">hotel</span>
                        </span>
                        <span>{{ hotel.logoLabel }}</span>
                      </div>
                    </td>
                    <td class="name-cell">{{ hotel.name }}</td>
                    <td>{{ hotel.address }}</td>
                    <td>{{ hotel.rating }}</td>
                    <td dir="ltr">{{ hotel.createdAt }}</td>
                    <td>
                      <app-status-toggle-pill
                        [isActive]="hotel.isActive"
                        activeLabel="فعال"
                        inactiveLabel="غير فعال"
                        activateMessage="هل تريد تفعيل هذا الفندق؟"
                        deactivateMessage="هل تريد إلغاء تفعيل هذا الفندق؟"
                        (statusChange)="toggleHotelStatus(hotel.id, $event)">
                      </app-status-toggle-pill>
                    </td>
                    <td class="action-cell">
                      <div class="row-actions">
                        <button type="button" class="row-action-btn" (click)="viewHotel(hotel, $event)">
                          <span class="material-icons-round">visibility</span>
                          <span>عرض</span>
                        </button>
                        <button type="button" class="row-action-btn" (click)="editHotel(hotel, $event)">
                          <span class="material-icons-round">edit</span>
                          <span>تعديل</span>
                        </button>
                        <button type="button" class="row-action-btn row-action-btn--danger" (click)="deleteHotel(hotel.id, $event)">
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

      @if (formOpen) {
        <div class="hotel-modal-backdrop" (click)="closeHotelForm()">
          <app-hotel-form
            [mode]="formMode"
            [hotel]="selectedHotel"
            (save)="saveHotel($event)"
            (close)="closeHotelForm()"
            (switchToEdit)="switchHotelFormToEdit()"
            (click)="$event.stopPropagation()">
          </app-hotel-form>
        </div>
      }
    </section>
  `,
  styles: [`
    .hotels-page {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .page-head h1 {
      margin: 0;
      font-size: 1rem;
      font-weight: 900;
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
      font-weight: 900;
      box-shadow: var(--shadow-sm);
      animation: successIn 0.18s ease-out;
    }

    .success-message .material-icons-round {
      font-size: 18px;
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
      font-weight: 800;
      color: var(--sero-text-secondary);
    }

    .filter-input {
      width: 100%;
      min-height: 42px;
      border: 1px solid var(--sero-border);
      border-radius: 10px;
      background: var(--sero-card-bg);
      color: var(--sero-text-primary);
      font-family: var(--sero-font);
      font-size: 0.86rem;
      padding: 9px 12px;
      outline: none;
      transition: border-color var(--t-fast), box-shadow var(--t-fast);
    }

    .filter-input:hover {
      border-color: var(--sero-border-strong);
    }

    .filter-input:focus {
      border-color: var(--sero-primary);
      box-shadow: 0 0 0 3px rgba(58, 71, 42, 0.1);
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

    .btn {
      border: 1px solid transparent;
      border-radius: 8px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      font-family: var(--sero-font);
      font-weight: 900;
      cursor: pointer;
      transition: background var(--t-fast), border-color var(--t-fast), color var(--t-fast);
    }

    .btn--sm {
      min-height: 32px;
      padding: 0 12px;
      font-size: 0.76rem;
    }

    .btn .material-icons-round {
      font-size: 16px;
    }

    .btn--primary {
      background: var(--sero-primary);
      color: #fff;
    }

    .btn--primary:hover {
      background: var(--sero-primary-dark);
    }

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
      padding-bottom: 8px;
    }

    .hotels-table {
      width: 100%;
      min-width: 980px;
      border-collapse: collapse;
    }

    .hotels-table thead tr {
      background: var(--sero-primary);
    }

    .hotels-table th {
      color: rgba(255, 255, 255, 0.92);
      font-size: 0.72rem;
      font-weight: 800;
      text-align: center;
      padding: 10px 12px;
      white-space: nowrap;
    }

    .hotels-table td {
      border-bottom: 1px solid var(--sero-border-light);
      color: var(--sero-text-primary);
      font-size: 0.76rem;
      text-align: center;
      padding: 10px 12px;
      white-space: nowrap;
      vertical-align: middle;
    }

    .hotels-table tbody tr:hover {
      background: color-mix(in srgb, var(--sero-surface-2) 70%, var(--sero-card-bg));
    }

    .hotels-table tbody tr:last-child td {
      border-bottom: none;
    }

    .logo-cell {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--sero-text-secondary);
      font-size: 0.72rem;
      font-weight: 800;
    }

    .logo-mark {
      width: 30px;
      height: 30px;
      border-radius: 8px;
      border: 1px solid var(--sero-primary-100);
      background: var(--sero-primary-50);
      color: var(--sero-primary);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .logo-mark .material-icons-round {
      font-size: 17px;
    }

    .name-cell {
      color: var(--sero-text-primary);
      font-weight: 900;
    }

    .empty-cell {
      color: var(--sero-text-muted);
      padding: 18px;
      text-align: center;
    }

    .row-actions {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
    }

    .row-action-btn {
      min-height: 30px;
      border: 1px solid var(--sero-border);
      border-radius: 8px;
      background: var(--sero-card-bg);
      color: var(--sero-text-primary);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 0 8px;
      font-family: var(--sero-font);
      font-size: 0.72rem;
      font-weight: 900;
      cursor: pointer;
      transition: background var(--t-fast), border-color var(--t-fast), color var(--t-fast);
    }

    .row-action-btn .material-icons-round {
      font-size: 15px;
      color: var(--sero-text-secondary);
    }

    .row-action-btn:hover {
      background: var(--sero-primary-50);
      border-color: var(--sero-primary-100);
      color: var(--sero-primary-dark);
    }

    .row-action-btn:hover .material-icons-round {
      color: var(--sero-primary);
    }

    .row-action-btn--danger {
      color: var(--sero-danger);
    }

    .row-action-btn--danger .material-icons-round,
    .row-action-btn--danger:hover .material-icons-round {
      color: var(--sero-danger);
    }

    .row-action-btn--danger:hover {
      background: var(--sero-danger-bg);
      border-color: var(--sero-danger-border);
      color: var(--sero-danger);
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
      background: var(--sero-card-bg);
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
      direction: ltr;
      font-size: 0.78rem;
      font-weight: 900;
      min-width: 100px;
      text-align: center;
    }

    .items-per-page {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      color: var(--sero-text-secondary);
      font-size: 0.76rem;
      font-weight: 800;
    }

    .items-per-page app-sero-dropdown {
      width: 72px;
    }

    .hotel-modal-backdrop {
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

    @media (max-width: 1180px) {
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

      .add-hotel-btn {
        width: 100%;
      }
    }
  `],
})
export class HotelsPageComponent implements OnDestroy {
  private readonly hotelsService = inject(HotelsService);

  readonly cityOptions = HOTEL_CITY_OPTIONS;
  readonly ratingOptions = HOTEL_RATING_OPTIONS;
  readonly statusOptions = HOTEL_STATUS_OPTIONS;
  readonly itemsPerPageOptions = HOTEL_ITEMS_PER_PAGE_OPTIONS;
  readonly itemsPerPageDropdownOptions = this.itemsPerPageOptions.map((count) => ({
    value: count,
    label: String(count),
  }));

  filters: HotelsFilterState = { ...HOTELS_DEFAULT_FILTERS };
  filtersExpanded = true;

  private allHotels: HotelModel[] = this.hotelsService.getAll();
  private filteredHotels: HotelModel[] = [...this.allHotels];

  currentPage = 1;
  itemsPerPage = this.itemsPerPageOptions[0];

  formOpen = false;
  formMode: HotelFormMode = 'create';
  selectedHotel: HotelModel | null = null;

  successMessage = '';
  private successMessageTimer: ReturnType<typeof setTimeout> | null = null;

  get districtOptions(): SeroDropdownOption<string>[] {
    return this.filters.city ? HOTEL_DISTRICTS_BY_CITY[this.filters.city] ?? [] : [];
  }

  get totalItemsCount(): number {
    return this.filteredHotels.length;
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

  get pagedHotels(): HotelModel[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredHotels.slice(startIndex, startIndex + this.itemsPerPage);
  }

  onCityChange(value: string): void {
    this.filters = { ...this.filters, city: value, district: '' };
  }

  onDistrictChange(value: string): void {
    this.filters = { ...this.filters, district: value };
  }

  onDistanceChange(value: string): void {
    this.filters = { ...this.filters, maxDistanceFromHaram: value };
  }

  onRatingChange(value: string): void {
    this.filters = { ...this.filters, rating: value };
  }

  onStatusChange(value: HotelStatusFilter): void {
    this.filters = { ...this.filters, status: value };
  }

  onItemsPerPageChange(count: number): void {
    this.itemsPerPage = count;
    this.currentPage = 1;
  }

  search(): void {
    this.filteredHotels = this.getFilteredHotels();
    this.currentPage = 1;
  }

  clear(): void {
    this.filters = { ...HOTELS_DEFAULT_FILTERS };
    this.allHotels = this.hotelsService.getAll();
    this.filteredHotels = [...this.allHotels];
    this.currentPage = 1;
    this.itemsPerPage = this.itemsPerPageOptions[0];
  }

  openCreateForm(): void {
    this.formMode = 'create';
    this.selectedHotel = null;
    this.formOpen = true;
    this.successMessage = '';
  }

  viewHotel(hotel: HotelModel, event: Event): void {
    event.stopPropagation();
    this.formMode = 'view';
    this.selectedHotel = { ...hotel };
    this.formOpen = true;
  }

  editHotel(hotel: HotelModel, event: Event): void {
    event.stopPropagation();
    this.formMode = 'edit';
    this.selectedHotel = { ...hotel };
    this.formOpen = true;
  }

  switchHotelFormToEdit(): void {
    if (this.selectedHotel) {
      this.formMode = 'edit';
    }
  }

  closeHotelForm(): void {
    this.formOpen = false;
    this.selectedHotel = null;
    this.formMode = 'create';
  }

  saveHotel(value: HotelFormValue): void {
    if (this.formMode === 'edit' && this.selectedHotel) {
      this.hotelsService.update(this.selectedHotel.id, value);
      this.refreshFromStore();
      this.closeHotelForm();
      this.showSuccessMessage('تم حفظ التعديلات بنجاح');
      return;
    }

    this.hotelsService.add(value);
    this.refreshFromStore();
    this.currentPage = 1;
    this.closeHotelForm();
    this.showSuccessMessage('تمت إضافة الفندق بنجاح');
  }

  deleteHotel(id: string, event: Event): void {
    event.stopPropagation();
    this.hotelsService.delete(id);
    this.refreshFromStore();
    this.currentPage = Math.min(this.currentPage, this.totalPages);
    this.showSuccessMessage('تم حذف الفندق بنجاح');
  }

  toggleHotelStatus(id: string, isActive: boolean): void {
    this.hotelsService.toggleStatus(id, isActive);
    this.refreshFromStore();
    this.currentPage = Math.min(this.currentPage, this.totalPages);
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

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    if (this.formOpen) {
      this.closeHotelForm();
    }
  }

  ngOnDestroy(): void {
    if (this.successMessageTimer) {
      clearTimeout(this.successMessageTimer);
    }
  }

  private refreshFromStore(): void {
    this.allHotels = this.hotelsService.getAll();
    this.filteredHotels = this.getFilteredHotels();
  }

  private getFilteredHotels(): HotelModel[] {
    const maxDistance = this.filters.maxDistanceFromHaram.trim()
      ? this.parseDistance(this.filters.maxDistanceFromHaram)
      : null;

    return this.allHotels.filter((hotel) => {
      const cityMatch = !this.filters.city || hotel.city === this.filters.city;
      const districtMatch = !this.filters.district || hotel.district === this.filters.district;
      const ratingMatch = !this.filters.rating || hotel.rating === this.filters.rating;
      const statusMatch = this.filters.status === 'all'
        || (this.filters.status === 'active' && hotel.isActive)
        || (this.filters.status === 'inactive' && !hotel.isActive);
      const distanceMatch = maxDistance === null || this.parseDistance(hotel.maxDistanceFromHaram) <= maxDistance;

      return cityMatch && districtMatch && ratingMatch && statusMatch && distanceMatch;
    });
  }

  private parseDistance(value: string): number {
    const parsed = Number((value || '').replace(/[^\d.]/g, ''));
    return Number.isFinite(parsed) ? parsed : 0;
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
