import { SeroDropdownOption } from '../../../shared/components/sero-dropdown/sero-dropdown.component';

export interface TransportPricingFilterState {
  startDate: string;
  status: TransportPricingStatusFilter;
  company: string;
  vehicleType: string;
}

export type TransportPricingStatus = 'فعال' | 'غير فعال';
export type TransportPricingStatusFilter = 'all' | TransportPricingStatus;

export interface TransportPricingRow {
  code: string;
  title: string;
  vehicleType: string;
  company: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface TransportPricingTripPrice {
  id: string;
  route: string;
  unitPrice: number;
}

export interface TransportPricingFormValue {
  code: string;
  packageName: string;
  startDate: string;
  endDate: string;
  company: string;
  vehicleType: string;
  isActive: boolean;
  trips: TransportPricingTripPrice[];
}

export const TRANSPORT_PRICING_DEFAULT_FILTERS: TransportPricingFilterState = {
  startDate: '',
  status: 'all',
  company: 'all',
  vehicleType: 'all',
};

export const TRANSPORT_PRICING_STATUS_OPTIONS: SeroDropdownOption<TransportPricingStatusFilter>[] = [
  { value: 'all', label: 'الكل' },
  { value: 'فعال', label: 'فعال' },
  { value: 'غير فعال', label: 'غير فعال' },
];

export const TRANSPORT_PRICING_COMPANY_OPTIONS: SeroDropdownOption<string>[] = [
  { value: 'all', label: 'الكل' },
  { value: 'شركة مسار النخبة', label: 'شركة مسار النخبة' },
  { value: 'شركة طريق الحرمين', label: 'شركة طريق الحرمين' },
  { value: 'شركة رواحل النقل', label: 'شركة رواحل النقل' },
  { value: 'شركة نسمات المدينة', label: 'شركة نسمات المدينة' },
];

export const TRANSPORT_PRICING_VEHICLE_OPTIONS: SeroDropdownOption<string>[] = [
  { value: 'all', label: 'الكل' },
  { value: 'حافلة كبيرة', label: 'حافلة كبيرة' },
  { value: 'حافلة متوسطة', label: 'حافلة متوسطة' },
  { value: 'فان', label: 'فان' },
  { value: 'سيارة سيدان', label: 'سيارة سيدان' },
];

export const TRANSPORT_PRICING_ITEMS_PER_PAGE_OPTIONS = [5, 10, 20];

export const TRANSPORT_PRICING_TRIPS = [
  { id: '01', route: 'JED-MAD' },
  { id: '02', route: 'JED-MAD-MAK-JED' },
  { id: '03', route: 'JED-MAK' },
  { id: '04', route: 'JED-MAK & MAD HTL-MAD APT' },
  { id: '05', route: 'JED-MAK-JED' },
  { id: '06', route: 'JED-MAK-MAD' },
  { id: '07', route: 'JED-MAK-MAD-MAD AIRPORT' },
  { id: '08', route: 'JED-MAK-MAD-MAK' },
  { id: '09', route: 'JED-MAK-MAD-MAK-JED' },
  { id: '10', route: 'MAD AIRPORT-MAD-MAK-JED' },
];

export function createTransportPricingFormValue(): TransportPricingFormValue {
  return {
    code: '',
    packageName: '',
    startDate: '',
    endDate: '',
    company: '',
    vehicleType: '',
    isActive: true,
    trips: TRANSPORT_PRICING_TRIPS.map((trip) => ({ ...trip, unitPrice: 0 })),
  };
}

export const TRANSPORT_PRICING_ROWS: TransportPricingRow[] = [
  {
    code: 'TR-001',
    title: 'نقل مطار جدة - مكة',
    vehicleType: 'حافلة كبيرة',
    company: 'شركة مسار النخبة',
    startDate: '2026-05-01',
    endDate: '2026-05-31',
    isActive: true,
  },
  {
    code: 'TR-002',
    title: 'نقل مكة - المدينة',
    vehicleType: 'حافلة متوسطة',
    company: 'شركة طريق الحرمين',
    startDate: '2026-05-04',
    endDate: '2026-06-04',
    isActive: true,
  },
  {
    code: 'TR-003',
    title: 'نقل داخلي في مكة',
    vehicleType: 'فان',
    company: 'شركة رواحل النقل',
    startDate: '2026-05-10',
    endDate: '2026-06-10',
    isActive: false,
  },
  {
    code: 'TR-004',
    title: 'نقل المدينة - مطار جدة',
    vehicleType: 'حافلة كبيرة',
    company: 'شركة نسمات المدينة',
    startDate: '2026-05-12',
    endDate: '2026-06-15',
    isActive: true,
  },
  {
    code: 'TR-005',
    title: 'خدمة نقل خاصة VIP',
    vehicleType: 'سيارة سيدان',
    company: 'شركة مسار النخبة',
    startDate: '2026-05-15',
    endDate: '2026-07-15',
    isActive: false,
  },
  {
    code: 'TR-006',
    title: 'نقل مطار المدينة - فندق',
    vehicleType: 'فان',
    company: 'شركة طريق الحرمين',
    startDate: '2026-05-16',
    endDate: '2026-06-20',
    isActive: true,
  },
  {
    code: 'TR-007',
    title: 'نقل جولات المشاعر',
    vehicleType: 'حافلة متوسطة',
    company: 'شركة رواحل النقل',
    startDate: '2026-05-18',
    endDate: '2026-07-01',
    isActive: true,
  },
  {
    code: 'TR-008',
    title: 'نقل مخصص للمجموعات',
    vehicleType: 'حافلة كبيرة',
    company: 'شركة نسمات المدينة',
    startDate: '2026-05-20',
    endDate: '2026-07-20',
    isActive: false,
  },
];
