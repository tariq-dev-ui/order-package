import { SeroDropdownOption } from '../../../shared/components/sero-dropdown/sero-dropdown.component';

export interface MyService {
  id: string;
  from: string;
  to: string;
  serviceType: string;
  serviceCity: string;
  price: number;
  status: 'active' | 'inactive' | 'pending';
  createdDate: string;
  description: string;
  images: string[];
}

export interface MyServiceFilterState {
  searchText: string;
  serviceType: string;
  serviceCity: string;
  status: string;
}

export interface MyServiceFormValue {
  from: string;
  to: string;
  serviceType: string;
  serviceCity: string;
  description: string;
  price: number | null;
  status: 'active' | 'inactive' | 'pending';
  images: string[];
}

export const MY_SERVICE_DEFAULT_FILTERS: MyServiceFilterState = {
  searchText: '',
  serviceType: '',
  serviceCity: '',
  status: '',
};

export const MY_SERVICE_ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50];

export const MY_SERVICE_TYPE_OPTIONS: SeroDropdownOption<string>[] = [
  { value: '', label: 'جميع أنواع الخدمات' },
  { value: 'accommodation', label: 'الإقامة' },
  { value: 'transportation', label: 'النقل' },
  { value: 'food', label: 'الطعام' },
  { value: 'visa', label: 'التأشيرة' },
  { value: 'guide', label: 'الدليل السياحي' },
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
  { value: 'active', label: 'نشط' },
  { value: 'inactive', label: 'غير نشط' },
  { value: 'pending', label: 'قيد الانتظار' },
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

export const MY_SERVICES_MOCK_DATA: MyService[] = [
  {
    id: 'SVC-001',
    from: 'جدة',
    to: 'مكة المكرمة',
    serviceType: 'accommodation',
    serviceCity: 'makkah',
    price: 450,
    status: 'active',
    createdDate: '2026-05-10',
    description: 'خدمة الإقامة المميزة بالقرب من الحرم',
    images: [],
  },
  {
    id: 'SVC-002',
    from: 'مكة المكرمة',
    to: 'المدينة المنورة',
    serviceType: 'transportation',
    serviceCity: 'madinah',
    price: 150,
    status: 'active',
    createdDate: '2026-05-09',
    description: 'خدمة النقل المريحة والآمنة',
    images: [],
  },
  {
    id: 'SVC-003',
    from: 'المدينة المنورة',
    to: 'جدة',
    serviceType: 'food',
    serviceCity: 'madinah',
    price: 80,
    status: 'active',
    createdDate: '2026-05-08',
    description: 'خدمة الطعام الموثوقة والصحية',
    images: [],
  },
  {
    id: 'SVC-004',
    from: 'الرياض',
    to: 'جدة',
    serviceType: 'visa',
    serviceCity: 'riyadh',
    price: 300,
    status: 'pending',
    createdDate: '2026-05-07',
    description: 'خدمة التأشيرات السريعة',
    images: [],
  },
  {
    id: 'SVC-005',
    from: 'جدة',
    to: 'مكة المكرمة',
    serviceType: 'guide',
    serviceCity: 'makkah',
    price: 200,
    status: 'inactive',
    createdDate: '2026-05-06',
    description: 'خدمة الدليل السياحي المتخصص',
    images: [],
  },
  {
    id: 'SVC-006',
    from: 'الدمام',
    to: 'الرياض',
    serviceType: 'accommodation',
    serviceCity: 'riyadh',
    price: 350,
    status: 'active',
    createdDate: '2026-05-05',
    description: 'إقامة فاخرة في مدينة الرياض',
    images: [],
  },
];
