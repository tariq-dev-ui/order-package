import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { TablerIconComponent } from 'angular-tabler-icons';
import { SeroDropdownComponent, SeroDropdownOption } from '../../shared/components/sero-dropdown/sero-dropdown.component';
import { SeroMultiSelectComponent, SeroMultiSelectOption } from '../../shared/components/sero-multi-select/sero-multi-select.component';
import { SeroDatePickerComponent } from '../../shared/components/sero-date-picker/sero-date-picker.component';
import { PaginationComponent } from '../../shared/components/pkg-pagination/pagination.component';

type PeriodPreset = 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'currentYear' | 'lastYear' | 'custom';

interface AvailabilityRow {
  period: string;
  totalUnits: number;
  checkedIn: number;
  waitingCheckIn: number;
  overbooked: number;
  totalAvailable: number;
  availablePercent: number;
  occupancyPercent: number;
}

@Component({
  selector: 'app-availability-report',
  standalone: true,
  imports: [TranslateModule, TablerIconComponent, SeroDropdownComponent, SeroMultiSelectComponent, SeroDatePickerComponent, PaginationComponent],
  templateUrl: './availability-report.component.html',
  styleUrl: './availability-report.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvailabilityReportComponent {
  readonly periodPresets: { value: PeriodPreset; labelKey: string }[] = [
    { value: 'today', labelKey: 'availabilityReport.filters.presets.today' },
    { value: 'yesterday', labelKey: 'availabilityReport.filters.presets.yesterday' },
    { value: 'thisWeek', labelKey: 'availabilityReport.filters.presets.thisWeek' },
    { value: 'lastWeek', labelKey: 'availabilityReport.filters.presets.lastWeek' },
    { value: 'thisMonth', labelKey: 'availabilityReport.filters.presets.thisMonth' },
    { value: 'lastMonth', labelKey: 'availabilityReport.filters.presets.lastMonth' },
    { value: 'currentYear', labelKey: 'availabilityReport.filters.presets.currentYear' },
    { value: 'lastYear', labelKey: 'availabilityReport.filters.presets.lastYear' },
    { value: 'custom', labelKey: 'availabilityReport.filters.presets.custom' },
  ];

  readonly roomTypeOptions: SeroDropdownOption<string>[] = [
    { value: 'all', labelKey: 'availabilityReport.filters.allRoomTypes' },
    { value: 'standard', labelKey: 'availabilityReport.filters.roomTypes.standard' },
    { value: 'deluxe', labelKey: 'availabilityReport.filters.roomTypes.deluxe' },
    { value: 'suite', labelKey: 'availabilityReport.filters.roomTypes.suite' },
    { value: 'family', labelKey: 'availabilityReport.filters.roomTypes.family' },
  ];

  readonly bookingTypeOptions: SeroMultiSelectOption<string>[] = [
    { value: 'regular', labelKey: 'availabilityReport.filters.bookingTypes.regular' },
    { value: 'qadiMilyan', labelKey: 'availabilityReport.filters.bookingTypes.qadiMilyan' },
    { value: 'subQadiMilyan', labelKey: 'availabilityReport.filters.bookingTypes.subQadiMilyan' },
    { value: 'representative', labelKey: 'availabilityReport.filters.bookingTypes.representative' },
    { value: 'subRepresentative', labelKey: 'availabilityReport.filters.bookingTypes.subRepresentative' },
  ];

  readonly itemsPerPageOptions = [10, 25, 50, 100];
  readonly itemsPerPageDropdownOptions: SeroDropdownOption<number>[] = this.itemsPerPageOptions.map((count) => ({
    value: count,
    label: String(count),
  }));

  readonly periodPreset = signal<PeriodPreset>('today');
  readonly customFrom = signal<string>('');
  readonly customTo = signal<string>('');
  readonly roomType = signal<string>('all');
  readonly bookingType = signal<string[]>([]);

  readonly isLoading = signal(false);
  readonly hasSearched = signal(false);
  readonly page = signal(1);
  readonly itemsPerPage = signal(this.itemsPerPageOptions[0]);
  readonly allRows = signal<AvailabilityRow[]>([]);

  readonly totalCount = computed(() => this.allRows().length);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / this.itemsPerPage())));
  readonly rangeStart = computed(() => (this.totalCount() === 0 ? 0 : (this.page() - 1) * this.itemsPerPage() + 1));
  readonly rangeEnd = computed(() => Math.min(this.page() * this.itemsPerPage(), this.totalCount()));
  readonly rows = computed(() => {
    const start = (this.page() - 1) * this.itemsPerPage();
    return this.allRows().slice(start, start + this.itemsPerPage());
  });

  constructor() {
    this.showResults();
  }

  selectPreset(preset: PeriodPreset): void {
    this.periodPreset.set(preset);
  }

  onRoomTypeChange(value: string): void {
    this.roomType.set(value);
  }

  onBookingTypeChange(value: string[]): void {
    this.bookingType.set(value);
  }

  onCustomFromChange(value: string): void {
    this.customFrom.set(value);
  }

  onCustomToChange(value: string): void {
    this.customTo.set(value);
  }

  onItemsPerPageChange(count: number): void {
    this.itemsPerPage.set(count);
    this.page.set(1);
  }

  setPage(page: number): void {
    this.page.set(page);
  }

  showResults(): void {
    this.isLoading.set(true);
    this.hasSearched.set(true);
    const { from, to } = this.resolveRange();

    setTimeout(() => {
      this.allRows.set(this.buildRows(from, to));
      this.page.set(1);
      this.isLoading.set(false);
    }, 250);
  }

  exportPdf(): void {
    // TODO: wire up to the real export endpoint once the Availability Report API is available.
  }

  private resolveRange(): { from: Date; to: Date } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (this.periodPreset()) {
      case 'today':
        return { from: today, to: today };
      case 'yesterday': {
        const d = this.addDays(today, -1);
        return { from: d, to: d };
      }
      case 'thisWeek': {
        const start = this.addDays(today, -today.getDay());
        return { from: start, to: today };
      }
      case 'lastWeek': {
        const thisWeekStart = this.addDays(today, -today.getDay());
        return { from: this.addDays(thisWeekStart, -7), to: this.addDays(thisWeekStart, -1) };
      }
      case 'thisMonth':
        return { from: new Date(today.getFullYear(), today.getMonth(), 1), to: today };
      case 'lastMonth':
        return {
          from: new Date(today.getFullYear(), today.getMonth() - 1, 1),
          to: new Date(today.getFullYear(), today.getMonth(), 0),
        };
      case 'currentYear':
        return { from: new Date(today.getFullYear(), 0, 1), to: today };
      case 'lastYear':
        return {
          from: new Date(today.getFullYear() - 1, 0, 1),
          to: new Date(today.getFullYear() - 1, 11, 31),
        };
      case 'custom': {
        const from = this.parseDate(this.customFrom()) ?? today;
        const to = this.parseDate(this.customTo()) ?? today;
        return from <= to ? { from, to } : { from: to, to: from };
      }
    }
  }

  private addDays(date: Date, days: number): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  }

  private parseDate(value: string): Date | null {
    if (!value) return null;
    const [y, m, d] = value.split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }

  private buildRows(from: Date, to: Date): AvailabilityRow[] {
    const rows: AvailabilityRow[] = [];
    const cursor = new Date(from);
    const baseUnits = Math.round(336 * this.roomTypeUnitFactor(this.roomType()));
    const bookingFactor = this.bookingTypeOccupancyFactor(this.bookingType());

    while (cursor <= to) {
      const seed = this.dateSeed(cursor);
      const occupancyRatio = this.clampRatio(0.35 + this.seededRandom(seed) * 0.4 * bookingFactor);
      const checkedIn = Math.round(baseUnits * occupancyRatio);
      const waitingCheckIn = Math.round(this.seededRandom(seed + 1) * baseUnits * 0.03);
      const overbooked = this.seededRandom(seed + 2) > 0.85 ? Math.round(1 + this.seededRandom(seed + 3) * 3) : 0;
      const totalAvailable = Math.max(0, baseUnits - checkedIn - waitingCheckIn);
      const availablePercent = baseUnits === 0 ? 0 : Math.round((totalAvailable / baseUnits) * 100);
      const occupancyPercent = baseUnits === 0 ? 0 : Math.round((checkedIn / baseUnits) * 100);

      rows.push({
        period: this.formatDate(cursor),
        totalUnits: baseUnits,
        checkedIn,
        waitingCheckIn,
        overbooked,
        totalAvailable,
        availablePercent,
        occupancyPercent,
      });

      cursor.setDate(cursor.getDate() + 1);
    }

    return rows;
  }

  private roomTypeUnitFactor(roomType: string): number {
    switch (roomType) {
      case 'standard': return 0.5;
      case 'deluxe': return 0.3;
      case 'suite': return 0.12;
      case 'family': return 0.2;
      default: return 1;
    }
  }

  private bookingTypeOccupancyFactor(bookingTypes: string[]): number {
    if (bookingTypes.length === 0) return 1;
    const factors: Record<string, number> = {
      regular: 1,
      qadiMilyan: 1.15,
      subQadiMilyan: 1.05,
      representative: 0.9,
      subRepresentative: 0.85,
    };
    const sum = bookingTypes.reduce((total, type) => total + (factors[type] ?? 1), 0);
    return sum / bookingTypes.length;
  }

  private dateSeed(date: Date): number {
    return date.getFullYear() * 372 + date.getMonth() * 31 + date.getDate();
  }

  private seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  private clampRatio(value: number): number {
    return Math.min(0.98, Math.max(0.05, value));
  }

  private formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
}
