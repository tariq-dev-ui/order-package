import { SeroDropdownOption } from '../../../shared/components/sero-dropdown/sero-dropdown.component';

export type HotelPricingStatus = 'فعال' | 'غير فعال';
export type HotelPricingStatusFilter = 'all' | HotelPricingStatus;

export interface HotelPricingPolicy {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  agentsCount: number;
  hotelsCount: number;
  isActive: boolean;
}

export interface HotelPricingFilterState {
  startFrom: string;
  startTo: string;
  endFrom: string;
  endTo: string;
  status: HotelPricingStatusFilter;
}

export interface HotelPricingPolicyFormValue {
  title: string;
  startDate: string;
  endDate: string;
  agentsCount: number;
  hotelsCount: number;
  isActive: boolean;
}

export const HOTEL_PRICING_DEFAULT_FILTERS: HotelPricingFilterState = {
  startFrom: '',
  startTo: '',
  endFrom: '',
  endTo: '',
  status: 'all',
};

export const HOTEL_PRICING_STATUS_OPTIONS: SeroDropdownOption<HotelPricingStatusFilter>[] = [
  { value: 'all', label: 'الكل' },
  { value: 'فعال', label: 'فعال' },
  { value: 'غير فعال', label: 'غير فعال' },
];

export const HOTEL_PRICING_ITEMS_PER_PAGE_OPTIONS = [5, 10, 20];

export const HOTEL_PRICING_POLICIES: HotelPricingPolicy[] = [
  {
    id: 'HP-001',
    title: 'General Pricing 26',
    startDate: '2026-05-01',
    endDate: '2026-12-31',
    agentsCount: 0,
    hotelsCount: 0,
    isActive: true,
  },
  {
    id: 'HP-002',
    title: 'Test 1',
    startDate: '2026-01-20',
    endDate: '2026-08-31',
    agentsCount: 2,
    hotelsCount: 3,
    isActive: true,
  },
  {
    id: 'HP-003',
    title: 'September',
    startDate: '2025-11-24',
    endDate: '2025-11-30',
    agentsCount: 1,
    hotelsCount: 2,
    isActive: true,
  },
  {
    id: 'HP-004',
    title: 'remade',
    startDate: '2025-09-28',
    endDate: '2026-06-30',
    agentsCount: 4,
    hotelsCount: 1,
    isActive: true,
  },
  {
    id: 'HP-005',
    title: 'Safar-Yemeni',
    startDate: '2025-09-17',
    endDate: '2025-09-30',
    agentsCount: 3,
    hotelsCount: 1,
    isActive: true,
  },
  {
    id: 'HP-006',
    title: 'Ramadan Special',
    startDate: '2026-02-15',
    endDate: '2026-03-15',
    agentsCount: 2,
    hotelsCount: 5,
    isActive: false,
  },
  {
    id: 'HP-007',
    title: 'Hajj Package',
    startDate: '2026-05-20',
    endDate: '2026-06-20',
    agentsCount: 6,
    hotelsCount: 4,
    isActive: true,
  },
];
