import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { TablerIconComponent } from 'angular-tabler-icons';
import { SeroDropdownComponent, SeroDropdownOption } from '../../shared/components/sero-dropdown/sero-dropdown.component';
import { SeroMultiSelectComponent, SeroMultiSelectOption } from '../../shared/components/sero-multi-select/sero-multi-select.component';
import { SeroSearchableSelectComponent, SeroSearchableSelectOption } from '../../shared/components/sero-searchable-select/sero-searchable-select.component';
import { SeroDatePickerComponent } from '../../shared/components/sero-date-picker/sero-date-picker.component';
import { PaginationComponent } from '../../shared/components/pkg-pagination/pagination.component';
import {
  BOOKING_TYPE_WEIGHTS,
  HOTELS,
  HOTELS_BY_ID,
  HotelMock,
  PROVIDERS_BY_ID,
  ROOM_TYPE_WEIGHTS,
} from './availability-report.mock-data';

type PeriodPreset = 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'currentYear' | 'lastYear' | 'custom';

interface AtomicRecord {
  date: string;
  hotelId: string;
  totalUnits: number;
  checkedIn: number;
  waitingCheckIn: number;
  overbooked: number;
  totalAvailable: number;
}

interface Sums {
  totalUnits: number;
  checkedIn: number;
  waitingCheckIn: number;
  overbooked: number;
  totalAvailable: number;
}

interface ReportRow {
  key: string;
  label: string;
  totalUnits: number;
  checkedIn: number;
  waitingCheckIn: number;
  overbooked: number;
  totalAvailable: number;
  availablePercent: number;
  occupancyPercent: number;
}

interface Kpis {
  totalHotels: number;
  totalUnits: number;
  occupied: number;
  available: number;
  waiting: number;
  overbooked: number;
  occupiedPercent: number;
  availablePercent: number;
  avgOccupancyPercent: number;
  avgAvailabilityPercent: number;
  occupancyTrend: number;
  availabilityTrend: number;
}

@Component({
  selector: 'app-availability-report',
  standalone: true,
  imports: [
    TranslateModule,
    DatePipe,
    TablerIconComponent,
    SeroDropdownComponent,
    SeroMultiSelectComponent,
    SeroSearchableSelectComponent,
    SeroDatePickerComponent,
    PaginationComponent,
  ],
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

  // Hotel is the primary selector — always the full hotel list, independent of provider.
  readonly hotelOptions: SeroSearchableSelectOption<string>[] = [
    { value: 'all', labelKey: 'availabilityReport.filters.allHotels' },
    ...HOTELS.map((hotel) => ({ value: hotel.id, label: hotel.name })),
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
  readonly hotelId = signal<string>('all');
  readonly providerId = signal<string>('all');
  readonly isLoadingProviders = signal(false);

  readonly isLoading = signal(false);
  readonly hasSearched = signal(false);
  readonly page = signal(1);
  readonly itemsPerPage = signal(this.itemsPerPageOptions[0]);

  readonly atomicRows = signal<AtomicRecord[]>([]);
  readonly previousAtomicRows = signal<AtomicRecord[]>([]);
  readonly appliedRoomType = signal<string>('all');
  readonly appliedBookingTypes = signal<string[]>([]);
  readonly appliedHotels = signal<HotelMock[]>([]);
  readonly appliedFrom = signal<Date | null>(null);
  readonly appliedTo = signal<Date | null>(null);

  // Provider is entirely dependent on the selected hotel — disabled until a specific hotel is chosen.
  readonly isProviderDisabled = computed(() => this.hotelId() === 'all');

  readonly providerOptions = computed<SeroSearchableSelectOption<string>[]>(() => {
    const hotelId = this.hotelId();
    if (hotelId === 'all') return [];
    const hotel = HOTELS_BY_ID.get(hotelId);
    const provider = hotel ? PROVIDERS_BY_ID.get(hotel.providerId) : undefined;
    return [
      { value: 'all', labelKey: 'availabilityReport.filters.allProviders' },
      ...(provider ? [{ value: provider.id, label: provider.name }] : []),
    ];
  });

  readonly activePeriodLabelKey = computed(
    () => this.periodPresets.find((p) => p.value === this.periodPreset())?.labelKey ?? '',
  );

  readonly groupedRows = computed<ReportRow[]>(() => {
    const records = this.atomicRows();
    const roomType = this.appliedRoomType();
    const bookingTypes = this.appliedBookingTypes();
    return this.groupByDate(records, roomType, bookingTypes);
  });

  readonly totalCount = computed(() => this.groupedRows().length);
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.totalCount() / this.itemsPerPage())));
  readonly rangeStart = computed(() => (this.totalCount() === 0 ? 0 : (this.page() - 1) * this.itemsPerPage() + 1));
  readonly rangeEnd = computed(() => Math.min(this.page() * this.itemsPerPage(), this.totalCount()));
  readonly rows = computed(() => {
    const start = (this.page() - 1) * this.itemsPerPage();
    return this.groupedRows().slice(start, start + this.itemsPerPage());
  });

  readonly kpis = computed<Kpis | null>(() => {
    const records = this.atomicRows();
    const to = this.appliedTo();
    if (!to || records.length === 0) return null;

    const roomType = this.appliedRoomType();
    const bookingTypes = this.appliedBookingTypes();
    const hotels = this.appliedHotels();
    const lastDateKey = this.formatDate(to);

    const snapshot = this.sumEffective(records.filter((r) => r.date === lastDateKey), roomType, bookingTypes);
    const avgCurrent = this.averageDailyRatios(records, roomType, bookingTypes);
    const avgPrevious = this.averageDailyRatios(this.previousAtomicRows(), roomType, bookingTypes);

    return {
      totalHotels: hotels.length,
      totalUnits: Math.round(snapshot.totalUnits),
      occupied: Math.round(snapshot.checkedIn),
      available: Math.round(snapshot.totalAvailable),
      waiting: Math.round(snapshot.waitingCheckIn),
      overbooked: Math.round(snapshot.overbooked),
      occupiedPercent: snapshot.totalUnits === 0 ? 0 : Math.round((snapshot.checkedIn / snapshot.totalUnits) * 100),
      availablePercent: snapshot.totalUnits === 0 ? 0 : Math.round((snapshot.totalAvailable / snapshot.totalUnits) * 100),
      avgOccupancyPercent: Math.round(avgCurrent.occupancy * 100),
      avgAvailabilityPercent: Math.round(avgCurrent.availability * 100),
      occupancyTrend: Math.round((avgCurrent.occupancy - avgPrevious.occupancy) * 100),
      availabilityTrend: Math.round((avgCurrent.availability - avgPrevious.availability) * 100),
    };
  });

  constructor() {
    this.showResults();
  }

  selectPreset(preset: PeriodPreset): void {
    this.periodPreset.set(preset);
    if (preset !== 'custom') {
      this.showResults();
    }
  }

  onRoomTypeChange(value: string): void {
    this.roomType.set(value);
  }

  onBookingTypeChange(value: string[]): void {
    this.bookingType.set(value);
  }

  onHotelChange(value: string): void {
    this.hotelId.set(value);
    this.providerId.set('all');
    this.isLoadingProviders.set(true);
    setTimeout(() => this.isLoadingProviders.set(false), 200);
    this.showResults();
  }

  onProviderChange(value: string): void {
    if (this.isProviderDisabled()) return;
    this.providerId.set(value);
    this.showResults();
  }

  onCustomFromChange(value: string): void {
    this.customFrom.set(value);
    this.maybeRefreshCustomRange();
  }

  onCustomToChange(value: string): void {
    this.customTo.set(value);
    this.maybeRefreshCustomRange();
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
    const hotels = this.resolveHotelsInScope();

    setTimeout(() => {
      this.appliedFrom.set(from);
      this.appliedTo.set(to);
      this.appliedHotels.set(hotels);
      this.appliedRoomType.set(this.roomType());
      this.appliedBookingTypes.set(this.bookingType());
      this.atomicRows.set(this.buildAtomicRows(from, to, hotels));

      const spanDays = this.daysBetween(from, to) + 1;
      const prevTo = this.addDays(from, -1);
      const prevFrom = this.addDays(prevTo, -(spanDays - 1));
      this.previousAtomicRows.set(this.buildAtomicRows(prevFrom, prevTo, hotels));

      this.page.set(1);
      this.isLoading.set(false);
    }, 250);
  }

  exportPdf(): void {
    // TODO: wire up to the real export endpoint once the Availability Report API is available.
  }

  exportExcel(): void {
    // TODO: wire up to the real export endpoint once the Availability Report API is available.
  }

  private maybeRefreshCustomRange(): void {
    if (this.periodPreset() === 'custom' && this.customFrom() && this.customTo()) {
      this.showResults();
    }
  }

  private resolveHotelsInScope(): HotelMock[] {
    const hotelId = this.hotelId();
    if (hotelId !== 'all') {
      const hotel = HOTELS_BY_ID.get(hotelId);
      return hotel ? [hotel] : [];
    }
    return HOTELS;
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

  private daysBetween(from: Date, to: Date): number {
    return Math.round((to.getTime() - from.getTime()) / 86400000);
  }

  private parseDate(value: string): Date | null {
    if (!value) return null;
    const [y, m, d] = value.split('-').map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  }

  private formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private buildAtomicRows(from: Date, to: Date, hotels: HotelMock[]): AtomicRecord[] {
    const records: AtomicRecord[] = [];
    const cursor = new Date(from);

    while (cursor <= to) {
      const dateKey = this.formatDate(cursor);
      const baseDateSeed = this.dateSeed(cursor);

      for (const hotel of hotels) {
        const seed = baseDateSeed + this.hotelSeedOffset(hotel.id);
        const occupancyRatio = this.clampRatio(0.35 + this.seededRandom(seed) * 0.45);
        const checkedIn = Math.round(hotel.totalUnits * occupancyRatio);
        const waitingCheckIn = Math.round(this.seededRandom(seed + 1) * hotel.totalUnits * 0.05);
        const overbooked = this.seededRandom(seed + 2) > 0.85 ? Math.round(1 + this.seededRandom(seed + 3) * 3) : 0;
        const totalAvailable = Math.max(0, hotel.totalUnits - checkedIn - waitingCheckIn);

        records.push({
          date: dateKey,
          hotelId: hotel.id,
          totalUnits: hotel.totalUnits,
          checkedIn,
          waitingCheckIn,
          overbooked,
          totalAvailable,
        });
      }

      cursor.setDate(cursor.getDate() + 1);
    }

    return records;
  }

  private dateSeed(date: Date): number {
    return date.getFullYear() * 372 + date.getMonth() * 31 + date.getDate();
  }

  private hotelSeedOffset(hotelId: string): number {
    let hash = 0;
    for (let i = 0; i < hotelId.length; i++) {
      hash = (hash * 31 + hotelId.charCodeAt(i)) % 100000;
    }
    return hash;
  }

  private seededRandom(seed: number): number {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  }

  private clampRatio(value: number): number {
    return Math.min(0.98, Math.max(0.05, value));
  }

  private roomWeight(roomType: string): number {
    return roomType === 'all' ? 1 : (ROOM_TYPE_WEIGHTS[roomType] ?? 0);
  }

  private bookingWeight(bookingTypes: string[]): number {
    if (bookingTypes.length === 0) return 1;
    return bookingTypes.reduce((sum, type) => sum + (BOOKING_TYPE_WEIGHTS[type] ?? 0), 0);
  }

  private effectiveTotals(record: AtomicRecord, roomType: string, bookingTypes: string[]): Sums {
    const factor = this.roomWeight(roomType) * this.bookingWeight(bookingTypes);
    if (factor === 1) {
      return {
        totalUnits: record.totalUnits,
        checkedIn: record.checkedIn,
        waitingCheckIn: record.waitingCheckIn,
        overbooked: record.overbooked,
        totalAvailable: record.totalAvailable,
      };
    }
    const totalUnits = record.totalUnits * factor;
    const checkedIn = record.checkedIn * factor;
    const waitingCheckIn = record.waitingCheckIn * factor;
    const overbooked = record.overbooked * factor;
    return {
      totalUnits,
      checkedIn,
      waitingCheckIn,
      overbooked,
      totalAvailable: Math.max(0, totalUnits - checkedIn - waitingCheckIn),
    };
  }

  private sumEffective(records: AtomicRecord[], roomType: string, bookingTypes: string[]): Sums {
    const sum: Sums = { totalUnits: 0, checkedIn: 0, waitingCheckIn: 0, overbooked: 0, totalAvailable: 0 };
    for (const record of records) {
      const eff = this.effectiveTotals(record, roomType, bookingTypes);
      sum.totalUnits += eff.totalUnits;
      sum.checkedIn += eff.checkedIn;
      sum.waitingCheckIn += eff.waitingCheckIn;
      sum.overbooked += eff.overbooked;
      sum.totalAvailable += eff.totalAvailable;
    }
    return sum;
  }

  private groupSum(records: AtomicRecord[], keyFn: (record: AtomicRecord) => string, roomType: string, bookingTypes: string[]): Map<string, Sums> {
    const map = new Map<string, Sums>();
    for (const record of records) {
      const key = keyFn(record);
      const eff = this.effectiveTotals(record, roomType, bookingTypes);
      const acc = map.get(key) ?? { totalUnits: 0, checkedIn: 0, waitingCheckIn: 0, overbooked: 0, totalAvailable: 0 };
      acc.totalUnits += eff.totalUnits;
      acc.checkedIn += eff.checkedIn;
      acc.waitingCheckIn += eff.waitingCheckIn;
      acc.overbooked += eff.overbooked;
      acc.totalAvailable += eff.totalAvailable;
      map.set(key, acc);
    }
    return map;
  }

  private toRow(key: string, sum: Sums, label: string): ReportRow {
    const totalUnits = Math.round(sum.totalUnits);
    const checkedIn = Math.round(sum.checkedIn);
    const waitingCheckIn = Math.round(sum.waitingCheckIn);
    const overbooked = Math.round(sum.overbooked);
    const totalAvailable = Math.max(0, totalUnits - checkedIn - waitingCheckIn);
    const availablePercent = totalUnits === 0 ? 0 : Math.round((totalAvailable / totalUnits) * 100);
    const occupancyPercent = totalUnits === 0 ? 0 : Math.round((checkedIn / totalUnits) * 100);

    return {
      key,
      label,
      totalUnits,
      checkedIn,
      waitingCheckIn,
      overbooked,
      totalAvailable,
      availablePercent,
      occupancyPercent,
    };
  }

  // Hotel/Provider are now header-level context filters, so each table row represents
  // one day in the selected period rather than one hotel.
  private groupByDate(records: AtomicRecord[], roomType: string, bookingTypes: string[]): ReportRow[] {
    const sums = this.groupSum(records, (r) => r.date, roomType, bookingTypes);
    return Array.from(sums.entries())
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([dateKey, sum]) => this.toRow(`date:${dateKey}`, sum, this.formatDisplayDate(dateKey)));
  }

  private formatDisplayDate(dateKey: string): string {
    const [y, m, d] = dateKey.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  private averageDailyRatios(records: AtomicRecord[], roomType: string, bookingTypes: string[]): { occupancy: number; availability: number } {
    if (records.length === 0) return { occupancy: 0, availability: 0 };
    const byDate = this.groupSum(records, (r) => r.date, roomType, bookingTypes);
    let occupancySum = 0;
    let availabilitySum = 0;
    for (const sum of byDate.values()) {
      occupancySum += sum.totalUnits === 0 ? 0 : sum.checkedIn / sum.totalUnits;
      availabilitySum += sum.totalUnits === 0 ? 0 : sum.totalAvailable / sum.totalUnits;
    }
    return { occupancy: occupancySum / byDate.size, availability: availabilitySum / byDate.size };
  }
}
