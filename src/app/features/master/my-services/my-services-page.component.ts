import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeroDropdownComponent, SeroDropdownOption } from '../../../shared/components/sero-dropdown/sero-dropdown.component';
import { TableFilterHeaderComponent } from '../../../shared/components/table-filter-header/table-filter-header.component';

type ServiceStatus = 'active' | 'pending' | 'inactive';

interface MasterService {
  id: string;
  from: string;
  to: string;
  serviceType: string;
  serviceCity: string;
  status: ServiceStatus;
}

interface ServiceFilterState {
  search: string;
  serviceType: string;
  city: string;
  status: string;
}

const DEFAULT_FILTERS: ServiceFilterState = {
  search: '',
  serviceType: '',
  city: '',
  status: '',
};

const SERVICE_TYPE_OPTIONS: SeroDropdownOption<string>[] = [
  { value: '', label: 'All service types' },
  { value: 'Accommodation', label: 'Accommodation' },
  { value: 'Transport', label: 'Transport' },
  { value: 'Catering', label: 'Catering' },
  { value: 'Visa', label: 'Visa' },
  { value: 'Flight', label: 'Flight' },
];

const CITY_OPTIONS: SeroDropdownOption<string>[] = [
  { value: '', label: 'All cities' },
  { value: 'Makkah', label: 'Makkah' },
  { value: 'Madinah', label: 'Madinah' },
  { value: 'Jeddah', label: 'Jeddah' },
  { value: 'Riyadh', label: 'Riyadh' },
];

const STATUS_OPTIONS: SeroDropdownOption<string>[] = [
  { value: '', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'inactive', label: 'Inactive' },
];

const MASTER_SERVICES: MasterService[] = [
  {
    id: 'MS-1001',
    from: 'Jeddah',
    to: 'Makkah',
    serviceType: 'Transport',
    serviceCity: 'Makkah',
    status: 'active',
  },
  {
    id: 'MS-1002',
    from: 'Makkah',
    to: 'Madinah',
    serviceType: 'Accommodation',
    serviceCity: 'Madinah',
    status: 'pending',
  },
  {
    id: 'MS-1003',
    from: 'Madinah',
    to: 'Jeddah',
    serviceType: 'Catering',
    serviceCity: 'Madinah',
    status: 'active',
  },
  {
    id: 'MS-1004',
    from: 'Riyadh',
    to: 'Jeddah',
    serviceType: 'Flight',
    serviceCity: 'Jeddah',
    status: 'inactive',
  },
  {
    id: 'MS-1005',
    from: 'Jeddah',
    to: 'Riyadh',
    serviceType: 'Visa',
    serviceCity: 'Riyadh',
    status: 'active',
  },
];

@Component({
  selector: 'master-my-services-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, SeroDropdownComponent, TableFilterHeaderComponent],
  template: `
    <section class="ms-page">
      <div class="ms-header-card">
        <div class="ms-header-inner">
          <div class="ms-header-left">
            <div class="ms-icon-box">
              <span class="material-icons-round">design_services</span>
            </div>
            <div>
              <h1 class="ms-title">My Services</h1>
              <p class="ms-subtitle">Manage the services available to your network</p>
            </div>
          </div>
          <div class="ms-header-right">
            <span class="ms-count-badge">{{ filteredServices().length }} total</span>
            <button type="button" class="ms-new-btn">
              <span class="material-icons-round">add</span>
              <span>New Service</span>
            </button>
          </div>
        </div>
      </div>

      <div class="ms-filter-card">
        <app-table-filter-header
          [(expanded)]="filtersExpanded"
          title="Filters"
          subtitle="Search and refine services">
          <form class="ms-filter-grid" (submit)="$event.preventDefault()">
            <div class="ms-filter-field ms-search-field">
              <label class="ms-filter-label" for="service-search">Search</label>
              <div class="ms-input-wrap">
                <span class="material-icons-round ms-input-icon">search</span>
                <input
                  id="service-search"
                  class="ms-search-input"
                  type="search"
                  placeholder="Search from, to, type, or city"
                  [value]="filters().search"
                  (input)="onSearchChange($event)" />
              </div>
            </div>

            <div class="ms-filter-field">
              <label class="ms-filter-label">Service Type</label>
              <app-sero-dropdown
                [options]="serviceTypeOptions"
                [value]="filters().serviceType"
                (valueChange)="onFilterChange('serviceType', $event)">
              </app-sero-dropdown>
            </div>

            <div class="ms-filter-field">
              <label class="ms-filter-label">City</label>
              <app-sero-dropdown
                [options]="cityOptions"
                [value]="filters().city"
                (valueChange)="onFilterChange('city', $event)">
              </app-sero-dropdown>
            </div>

            <div class="ms-filter-field">
              <label class="ms-filter-label">Status</label>
              <app-sero-dropdown
                [options]="statusOptions"
                [value]="filters().status"
                (valueChange)="onFilterChange('status', $event)">
              </app-sero-dropdown>
            </div>
          </form>
        </app-table-filter-header>

        <div class="ms-filter-actions">
          <button type="button" class="ms-clear-btn" (click)="clearFilters()">
            <span class="material-icons-round">restart_alt</span>
            <span>Clear</span>
          </button>
        </div>
      </div>

      <div class="ms-table-card">
        <div class="ms-table-scroll">
          <table class="ms-table">
            <thead>
              <tr>
                <th>From</th>
                <th>To</th>
                <th>Service Type</th>
                <th>Service City</th>
                <th>Status</th>
                <th class="ms-actions-head">Actions</th>
              </tr>
            </thead>
            <tbody>
              @if (filteredServices().length === 0) {
                <tr>
                  <td colspan="6">
                    <div class="ms-empty">
                      <span class="material-icons-round">design_services</span>
                      <h2>No services found</h2>
                      <p>Try changing the search or filters.</p>
                    </div>
                  </td>
                </tr>
              } @else {
                @for (service of filteredServices(); track service.id) {
                  <tr>
                    <td>
                      <div class="ms-route-cell">
                        <span class="material-icons-round">trip_origin</span>
                        <span>{{ service.from }}</span>
                      </div>
                    </td>
                    <td>
                      <div class="ms-route-cell">
                        <span class="material-icons-round">place</span>
                        <span>{{ service.to }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="ms-type-pill">
                        <span class="material-icons-round">{{ serviceTypeIcon(service.serviceType) }}</span>
                        <span>{{ service.serviceType }}</span>
                      </span>
                    </td>
                    <td>{{ service.serviceCity }}</td>
                    <td>
                      <span class="ms-status-pill" [ngClass]="statusClass(service.status)">
                        <span class="ms-status-dot"></span>
                        <span>{{ statusLabel(service.status) }}</span>
                      </span>
                    </td>
                    <td>
                      <div class="ms-action-buttons">
                        <button type="button" class="ms-action-btn" title="View service" aria-label="View service">
                          <span class="material-icons-round">visibility</span>
                        </button>
                        <button type="button" class="ms-action-btn" title="Edit service" aria-label="Edit service">
                          <span class="material-icons-round">edit</span>
                        </button>
                        <button
                          type="button"
                          class="ms-action-btn ms-action-btn--danger"
                          title="Delete service"
                          aria-label="Delete service"
                          (click)="removeService(service.id)">
                          <span class="material-icons-round">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                }
              }
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .ms-page {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .ms-header-card,
    .ms-filter-card,
    .ms-table-card {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, .06);
    }

    .ms-header-card {
      padding: 20px 24px;
    }

    .ms-header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      flex-wrap: wrap;
    }

    .ms-header-left,
    .ms-header-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .ms-icon-box {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f0fdf4;
      color: var(--sero-primary, #3a472a);
      flex-shrink: 0;
    }

    .ms-icon-box .material-icons-round {
      font-size: 22px;
    }

    .ms-title {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: #111827;
    }

    .ms-subtitle {
      margin: 4px 0 0;
      font-size: 13px;
      color: #9ca3af;
    }

    .ms-count-badge {
      padding: 3px 12px;
      border: 1px solid #bbf7d0;
      border-radius: 20px;
      background: #f0fdf4;
      color: var(--sero-primary, #3a472a);
      font-size: 13px;
      font-weight: 600;
      white-space: nowrap;
    }

    .ms-new-btn {
      min-height: 38px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 9px 18px;
      border: none;
      border-radius: 8px;
      background: var(--sero-primary, #3a472a);
      color: #fff;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      box-shadow: 0 1px 3px rgba(0, 0, 0, .1);
      transition: background 0.15s, transform 0.15s;
    }

    .ms-new-btn:hover {
      background: #4d6038;
      transform: translateY(-1px);
    }

    .ms-new-btn .material-icons-round {
      font-size: 16px;
    }

    .ms-filter-card {
      overflow: hidden;
    }

    .ms-filter-grid {
      display: grid;
      grid-template-columns: minmax(260px, 1.25fr) repeat(3, minmax(160px, 1fr));
      gap: 14px;
      padding: 16px 14px 14px;
    }

    .ms-filter-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
      min-width: 0;
    }

    .ms-filter-label {
      font-size: 11px;
      font-weight: 700;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: .04em;
    }

    .ms-input-wrap {
      position: relative;
      display: flex;
      align-items: center;
    }

    .ms-input-icon {
      position: absolute;
      left: 12px;
      color: #9ca3af;
      font-size: 17px;
      pointer-events: none;
    }

    .ms-search-input {
      width: 100%;
      min-height: 42px;
      border: 1px solid var(--sero-border, #d1d5db);
      border-radius: 10px;
      background: #fff;
      padding: 9px 12px 9px 38px;
      color: #374151;
      font: inherit;
      font-size: 13px;
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
    }

    .ms-search-input:focus {
      border-color: var(--sero-primary, #3a472a);
      box-shadow: 0 0 0 3px rgba(58, 71, 42, 0.1);
    }

    .ms-filter-actions {
      display: flex;
      justify-content: flex-end;
      padding: 0 14px 14px;
    }

    .ms-clear-btn {
      min-height: 34px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      background: #fff;
      color: #374151;
      padding: 7px 12px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.15s, border-color 0.15s;
    }

    .ms-clear-btn:hover {
      background: #f9fafb;
      border-color: #9ca3af;
    }

    .ms-clear-btn .material-icons-round {
      font-size: 16px;
    }

    .ms-table-card {
      overflow: hidden;
    }

    .ms-table-scroll {
      overflow-x: auto;
    }

    .ms-table {
      width: 100%;
      min-width: 820px;
      border-collapse: collapse;
      font-size: 13px;
    }

    .ms-table thead tr {
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }

    .ms-table th {
      padding: 12px 16px;
      color: #6b7280;
      font-size: 11px;
      font-weight: 700;
      text-align: left;
      text-transform: uppercase;
      letter-spacing: .05em;
      white-space: nowrap;
    }

    .ms-table td {
      padding: 13px 16px;
      color: #374151;
      border-bottom: 1px solid #f3f4f6;
      vertical-align: middle;
    }

    .ms-table tbody tr:last-child td {
      border-bottom: none;
    }

    .ms-table tbody tr:hover td {
      background: #fafafa;
    }

    .ms-actions-head {
      width: 130px;
      text-align: center;
    }

    .ms-route-cell {
      display: flex;
      align-items: center;
      gap: 7px;
      min-width: 0;
      font-weight: 600;
      color: #111827;
    }

    .ms-route-cell .material-icons-round {
      color: #d1d5db;
      font-size: 15px;
      flex-shrink: 0;
    }

    .ms-type-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 20px;
      background: #eff6ff;
      color: #1e40af;
      font-size: 11px;
      font-weight: 700;
      white-space: nowrap;
    }

    .ms-type-pill .material-icons-round {
      font-size: 14px;
    }

    .ms-status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border: 1px solid;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
      white-space: nowrap;
    }

    .ms-status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: currentColor;
    }

    .status-active {
      background: #f0fdf4;
      color: #166534;
      border-color: #bbf7d0;
    }

    .status-pending {
      background: #fffbeb;
      color: #92400e;
      border-color: #fde68a;
    }

    .status-inactive {
      background: #fef2f2;
      color: #991b1b;
      border-color: #fecaca;
    }

    .ms-action-buttons {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2px;
    }

    .ms-action-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: #9ca3af;
      cursor: pointer;
      transition: color 0.15s, background 0.15s;
    }

    .ms-action-btn:hover {
      background: #f0fdf4;
      color: var(--sero-primary, #3a472a);
    }

    .ms-action-btn--danger:hover {
      background: #fef2f2;
      color: #991b1b;
    }

    .ms-action-btn .material-icons-round {
      font-size: 16px;
    }

    .ms-empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 48px 16px;
      text-align: center;
      color: #9ca3af;
    }

    .ms-empty .material-icons-round {
      font-size: 36px;
      color: #d1d5db;
    }

    .ms-empty h2 {
      margin: 0;
      color: #374151;
      font-size: 15px;
      font-weight: 700;
    }

    .ms-empty p {
      margin: 0;
      font-size: 13px;
    }

    @media (max-width: 900px) {
      .ms-filter-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      .ms-search-field {
        grid-column: 1 / -1;
      }
    }

    @media (max-width: 640px) {
      .ms-header-card {
        padding: 18px;
      }

      .ms-header-left,
      .ms-header-right {
        width: 100%;
      }

      .ms-header-right {
        justify-content: space-between;
      }

      .ms-filter-grid {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class MasterMyServicesPageComponent {
  filtersExpanded = true;
  readonly serviceTypeOptions = SERVICE_TYPE_OPTIONS;
  readonly cityOptions = CITY_OPTIONS;
  readonly statusOptions = STATUS_OPTIONS;

  readonly filters = signal<ServiceFilterState>({ ...DEFAULT_FILTERS });
  readonly services = signal<MasterService[]>(MASTER_SERVICES);

  readonly filteredServices = computed(() => {
    const filters = this.filters();
    const search = filters.search.trim().toLowerCase();

    return this.services().filter((service) => {
      const matchesSearch = !search || [
        service.from,
        service.to,
        service.serviceType,
        service.serviceCity,
        service.status,
      ].some((value) => value.toLowerCase().includes(search));
      const matchesType = !filters.serviceType || service.serviceType === filters.serviceType;
      const matchesCity = !filters.city || service.serviceCity === filters.city;
      const matchesStatus = !filters.status || service.status === filters.status;

      return matchesSearch && matchesType && matchesCity && matchesStatus;
    });
  });

  onSearchChange(event: Event): void {
    const search = (event.target as HTMLInputElement).value;
    this.filters.update((filters) => ({ ...filters, search }));
  }

  onFilterChange(key: keyof ServiceFilterState, value: string): void {
    this.filters.update((filters) => ({ ...filters, [key]: value }));
  }

  clearFilters(): void {
    this.filters.set({ ...DEFAULT_FILTERS });
  }

  removeService(id: string): void {
    this.services.update((services) => services.filter((service) => service.id !== id));
  }

  statusClass(status: ServiceStatus): string {
    return `status-${status}`;
  }

  statusLabel(status: ServiceStatus): string {
    const option = STATUS_OPTIONS.find((item) => item.value === status);
    return option?.label ?? status;
  }

  serviceTypeIcon(serviceType: string): string {
    const icons: Record<string, string> = {
      Accommodation: 'hotel',
      Transport: 'directions_bus',
      Catering: 'restaurant',
      Visa: 'article',
      Flight: 'flight',
    };
    return icons[serviceType] ?? 'design_services';
  }
}
