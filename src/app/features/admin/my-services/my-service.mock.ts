import { SeroDropdownOption } from '../../../shared/components/sero-dropdown/sero-dropdown.component';
import { formatSeroCurrency } from '../../../shared/currency/currency-format.util';

const wholeRiyal = (value: number): string =>
  formatSeroCurrency(value, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

export type MyServiceStatus = 'active' | 'inactive' | 'pending' | 'draft' | 'fully_booked' | 'expired';
export type MyServiceHealth = 'healthy' | 'warning' | 'issue';
export type MyServicePricingMode = 'starting_from' | 'per_night' | 'package_price' | 'per_guest' | 'per_vehicle';

export interface MyServicePricingSnapshot {
  label: string;
  amount: number;
  mode: MyServicePricingMode;
}

export interface MyServiceLastUpdate {
  relative: string;
  user: string;
}

export interface MyServiceOperationalMeta {
  title: string;
  summaryLines: string[];
  coverage: string;
  capacity: string;
  health: MyServiceHealth;
  notes: string;
  dates: string;
  guests: string;
}

export interface MyService {
  id: string;
  from: string;
  to: string;
  serviceType: string;
  serviceCity: string;
  price: number;
  status: MyServiceStatus;
  createdDate: string;
  description: string;
  images: string[];
  operational: MyServiceOperationalMeta;
  pricing: MyServicePricingSnapshot;
  lastUpdate: MyServiceLastUpdate;
}

export interface MyServiceFilterState {
  searchText: string;
  serviceType: string;
  serviceCity: string;
  status: string;
  pricingRange: string;
  lifecycle: string;
  lastUpdated: string;
}

export interface MyServiceFormValue {
  from: string;
  to: string;
  serviceType: string;
  serviceCity: string;
  description: string;
  price: number | null;
  status: MyServiceStatus;
  images: string[];
}

export const MY_SERVICE_DEFAULT_FILTERS: MyServiceFilterState = {
  searchText: '',
  serviceType: '',
  serviceCity: '',
  status: '',
  pricingRange: '',
  lifecycle: '',
  lastUpdated: '',
};

export const MY_SERVICE_ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50];

export const MY_SERVICE_TYPE_OPTIONS: SeroDropdownOption<string>[] = [
  { value: '', label: 'جميع أنواع الخدمات' },
  { value: 'accommodation', label: 'إقامة' },
  { value: 'transportation', label: 'نقل' },
  { value: 'food', label: 'تغذية' },
  { value: 'tickets', label: 'تذاكر' },
  { value: 'visa', label: 'تأشيرة' },
  { value: 'guide', label: 'دليل سياحي' },
];

export const MY_SERVICE_CITY_OPTIONS: SeroDropdownOption<string>[] = [
  { value: '', label: 'جميع المدن' },
  { value: 'makkah', label: 'مكة المكرمة' },
  { value: 'madinah', label: 'المدينة المنورة' },
  { value: 'jeddah', label: 'جدة' },
  { value: 'riyadh', label: 'الرياض' },
  { value: 'dammam', label: 'الدمام' },
];

export const MY_SERVICE_STATUS_OPTIONS: SeroDropdownOption<string>[] = [
  { value: '', label: 'جميع الحالات' },
  { value: 'active', label: 'Active' },
  { value: 'pending', label: 'Pending' },
  { value: 'draft', label: 'Draft' },
  { value: 'fully_booked', label: 'Fully Booked' },
  { value: 'expired', label: 'Expired' },
  { value: 'inactive', label: 'Inactive' },
];

export const MY_SERVICE_PRICING_RANGE_OPTIONS: SeroDropdownOption<string>[] = [
  { value: '', label: 'كل الأسعار' },
  { value: 'under_250', label: `أقل من ${wholeRiyal(250)}` },
  { value: '250_750', label: `${wholeRiyal(250)} - ${wholeRiyal(750)}` },
  { value: '750_2000', label: `${wholeRiyal(750)} - ${wholeRiyal(2000)}` },
  { value: 'over_2000', label: `أكثر من ${wholeRiyal(2000)}` },
];

export const MY_SERVICE_LIFECYCLE_OPTIONS: SeroDropdownOption<string>[] = [
  { value: '', label: 'كل مراحل التشغيل' },
  { value: 'active', label: 'نشط' },
  { value: 'draft', label: 'مسودة' },
];

export const MY_SERVICE_LAST_UPDATED_OPTIONS: SeroDropdownOption<string>[] = [
  { value: '', label: 'أي تحديث' },
  { value: 'today', label: 'اليوم' },
  { value: 'week', label: 'آخر 7 أيام' },
  { value: 'month', label: 'آخر 30 يوم' },
];

export function createMyServiceFormValue(): MyServiceFormValue {
  return {
    from: '',
    to: '',
    serviceType: '',
    serviceCity: '',
    description: '',
    price: null,
    status: 'active',
    images: [],
  };
}

export function buildOperationalMeta(formValue: MyServiceFormValue): Pick<MyService, 'operational' | 'pricing' | 'lastUpdate'> {
  const serviceLabel = MY_SERVICE_TYPE_OPTIONS.find((option) => option.value === formValue.serviceType)?.label ?? 'خدمة';
  const cityLabel = MY_SERVICE_CITY_OPTIONS.find((option) => option.value === formValue.serviceCity)?.label ?? formValue.serviceCity;
  const amount = formValue.price ?? 0;

  return {
    operational: {
      title: `${serviceLabel} - ${cityLabel}`,
      summaryLines: [
        formValue.description || `${formValue.from} → ${formValue.to}`,
        formValue.serviceType === 'accommodation' ? '4 Rooms · 6 Nights' : `${formValue.from} → ${formValue.to}`,
      ],
      coverage: `${formValue.to || cityLabel} — ${cityLabel}`,
      capacity: formValue.serviceType === 'transportation'
        ? '3 Vehicles'
        : formValue.serviceType === 'food'
          ? '150 Meals'
          : formValue.serviceType === 'accommodation'
            ? '4 Rooms'
            : '12 Guests',
      health: formValue.status === 'active' ? 'healthy' : formValue.status === 'pending' ? 'warning' : 'issue',
      notes: formValue.description || 'New service awaiting operational notes.',
      dates: 'Flexible dates',
      guests: formValue.serviceType === 'food' ? '150 meal capacity' : '12 guests',
    },
    pricing: {
      label: formValue.serviceType === 'accommodation' ? 'Per Night' : 'Starting From',
      amount,
      mode: formValue.serviceType === 'accommodation' ? 'per_night' : 'starting_from',
    },
    lastUpdate: {
      relative: 'Updated now',
      user: 'current-user',
    },
  };
}

export const MY_SERVICES_MOCK_DATA: MyService[] = [
  {
    id: 'SVC-001',
    from: 'Jeddah',
    to: 'Makkah',
    serviceType: 'accommodation',
    serviceCity: 'makkah',
    price: 450,
    status: 'active',
    createdDate: '2026-05-10',
    description: '5 Stars · Al Haram',
    images: [],
    operational: {
      title: 'Makkah Hotel Service',
      summaryLines: ['5 Stars · Al Haram', '4 Rooms · 6 Nights'],
      coverage: 'Al Haram — Makkah',
      capacity: '4 Rooms',
      health: 'healthy',
      notes: 'Visa included, family rooms confirmed, late check-in supported.',
      dates: '12 Jun - 18 Jun',
      guests: '12 Guests',
    },
    pricing: { label: 'Starting From', amount: 450, mode: 'starting_from' },
    lastUpdate: { relative: 'Updated 2h ago', user: 'tariq-sero' },
  },
  {
    id: 'SVC-002',
    from: 'Makkah',
    to: 'Madinah',
    serviceType: 'transportation',
    serviceCity: 'madinah',
    price: 150,
    status: 'active',
    createdDate: '2026-05-09',
    description: 'VIP Bus',
    images: [],
    operational: {
      title: 'Transport Service',
      summaryLines: ['VIP Bus', 'Makkah → Madina'],
      coverage: 'Airport Transfer',
      capacity: '3 Vehicles',
      health: 'healthy',
      notes: 'Two drivers assigned, luggage trailer available on request.',
      dates: 'Daily departures',
      guests: '44 Seats',
    },
    pricing: { label: 'Per Vehicle', amount: 150, mode: 'per_vehicle' },
    lastUpdate: { relative: 'Updated 6h ago', user: 'ops-admin' },
  },
  {
    id: 'SVC-003',
    from: 'Madinah',
    to: 'Jeddah',
    serviceType: 'food',
    serviceCity: 'madinah',
    price: 80,
    status: 'fully_booked',
    createdDate: '2026-05-08',
    description: 'Buffet catering',
    images: [],
    operational: {
      title: 'Catering Service',
      summaryLines: ['Buffet catering', 'Breakfast · Dinner'],
      coverage: 'Quba — Madina',
      capacity: '150 Meals',
      health: 'warning',
      notes: 'Kitchen is at full allocation for Friday dinner.',
      dates: '14 Jun - 20 Jun',
      guests: '150 meals/day',
    },
    pricing: { label: 'Per Guest', amount: 80, mode: 'per_guest' },
    lastUpdate: { relative: 'Updated yesterday', user: 'sara-ops' },
  },
  {
    id: 'SVC-004',
    from: 'Riyadh',
    to: 'Jeddah',
    serviceType: 'visa',
    serviceCity: 'riyadh',
    price: 300,
    status: 'pending',
    createdDate: '2026-05-07',
    description: 'Express visa processing',
    images: [],
    operational: {
      title: 'Visa Service',
      summaryLines: ['Express visa processing', 'Group documents review'],
      coverage: 'North Terminal',
      capacity: '12 Guests',
      health: 'warning',
      notes: 'Awaiting passport scan verification for three guests.',
      dates: 'Processing 48h',
      guests: '12 Applicants',
    },
    pricing: { label: 'Package Price', amount: 2500, mode: 'package_price' },
    lastUpdate: { relative: 'Updated 3d ago', user: 'visa-desk' },
  },
  {
    id: 'SVC-005',
    from: 'Jeddah',
    to: 'Makkah',
    serviceType: 'guide',
    serviceCity: 'makkah',
    price: 200,
    status: 'draft',
    createdDate: '2026-05-06',
    description: 'Licensed guide',
    images: [],
    operational: {
      title: 'Guide Service',
      summaryLines: ['Licensed guide', 'Haram orientation · Ziyarah'],
      coverage: 'Central Area — Makkah',
      capacity: '12 Guests',
      health: 'warning',
      notes: 'Draft needs confirmed meeting point and guide language.',
      dates: 'Pending schedule',
      guests: '12 Guests',
    },
    pricing: { label: 'Starting From', amount: 200, mode: 'starting_from' },
    lastUpdate: { relative: 'Updated 1w ago', user: 'product-team' },
  },
  {
    id: 'SVC-006',
    from: 'Dammam',
    to: 'Riyadh',
    serviceType: 'tickets',
    serviceCity: 'riyadh',
    price: 350,
    status: 'expired',
    createdDate: '2026-05-05',
    description: 'Rail ticket allocation',
    images: [],
    operational: {
      title: 'Tickets Service',
      summaryLines: ['Rail ticket allocation', 'Group fare · Economy'],
      coverage: 'Riyadh Station',
      capacity: '40 Seats',
      health: 'issue',
      notes: 'Fare window expired. Refresh supplier allocation before reuse.',
      dates: 'Expired 10 May',
      guests: '40 Seats',
    },
    pricing: { label: 'Starting From', amount: 350, mode: 'starting_from' },
    lastUpdate: { relative: 'Updated 2w ago', user: 'ticketing' },
  },
];
