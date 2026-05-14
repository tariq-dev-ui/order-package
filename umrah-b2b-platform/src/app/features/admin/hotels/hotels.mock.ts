import { SeroDropdownOption } from '../../../shared/components/sero-dropdown/sero-dropdown.component';
import { HotelModel, HotelsFilterState, HotelStatusFilter } from './hotel.model';

export const HOTEL_CITY_OPTIONS: SeroDropdownOption<string>[] = [
  { value: 'makkah', label: 'مكة' },
  { value: 'madinah', label: 'المدينة' },
];

export const HOTEL_DISTRICTS_BY_CITY: Record<string, SeroDropdownOption<string>[]> = {
  makkah: [
    { value: 'central-makkah', label: 'المنطقة المركزية' },
    { value: 'aziziyah', label: 'العزيزية' },
    { value: 'ajyad', label: 'أجياد' },
  ],
  madinah: [
    { value: 'central-madinah', label: 'المنطقة المركزية' },
    { value: 'qurban', label: 'قربان' },
    { value: 'uhud', label: 'أحد' },
  ],
};

export const HOTEL_RATING_OPTIONS: SeroDropdownOption<string>[] = [
  { value: 'Saudi Arabia - Makkah', label: 'Saudi Arabia - Makkah' },
  { value: 'Saudi Arabia - Madianh', label: 'Saudi Arabia - Madianh' },
  { value: '5 Stars', label: '5 Stars' },
  { value: '4 Stars', label: '4 Stars' },
];

export const HOTEL_STATUS_OPTIONS: SeroDropdownOption<HotelStatusFilter>[] = [
  { value: 'all', label: 'الكل' },
  { value: 'active', label: 'فعال' },
  { value: 'inactive', label: 'غير فعال' },
];

export const HOTEL_ITEMS_PER_PAGE_OPTIONS = [5, 10, 25];

export const HOTELS_DEFAULT_FILTERS: HotelsFilterState = {
  city: '',
  district: '',
  maxDistanceFromHaram: '',
  rating: '',
  status: 'all',
};

const firstHotels: HotelModel[] = [
  {
    id: 'hotel-001',
    logoLabel: 'Hotel logo',
    name: 'Dar al alhekma Hotel',
    address: 'Luxury',
    rating: 'Saudi Arabia - Madianh',
    city: 'madinah',
    district: 'central-madinah',
    maxDistanceFromHaram: '450 م',
    createdAt: '24/02/2025',
    isActive: true,
  },
  {
    id: 'hotel-002',
    logoLabel: 'Hotel logo',
    name: 'Hotel One',
    address: 'Luxury Hotels',
    rating: 'Saudi Arabia - Makkah',
    city: 'makkah',
    district: 'central-makkah',
    maxDistanceFromHaram: '350 م',
    createdAt: '08/03/2025',
    isActive: true,
  },
  {
    id: 'hotel-003',
    logoLabel: 'Hotel logo',
    name: 'Dar Aliman Hotel',
    address: 'Luxury Hotels',
    rating: 'Saudi Arabia - Makkah',
    city: 'makkah',
    district: 'ajyad',
    maxDistanceFromHaram: '600 م',
    createdAt: '08/03/2025',
    isActive: true,
  },
  {
    id: 'hotel-004',
    logoLabel: 'Hotel logo',
    name: 'Al safwa Hotel',
    address: 'Luxury Hotels',
    rating: 'Saudi Arabia - Makkah',
    city: 'makkah',
    district: 'central-makkah',
    maxDistanceFromHaram: '250 م',
    createdAt: '08/03/2025',
    isActive: true,
  },
  {
    id: 'hotel-005',
    logoLabel: 'Hotel logo',
    name: 'Barakkah hotel',
    address: 'Luxury Hotels',
    rating: 'Saudi Arabia - Makkah',
    city: 'makkah',
    district: 'aziziyah',
    maxDistanceFromHaram: '900 م',
    createdAt: '10/03/2025',
    isActive: true,
  },
];

const generatedHotels: HotelModel[] = Array.from({ length: 115 }, (_, index) => {
  const sequence = index + 6;
  const isMakkah = sequence % 3 !== 0;
  const city = isMakkah ? 'makkah' : 'madinah';
  const districtOptions = HOTEL_DISTRICTS_BY_CITY[city];
  return {
    id: `hotel-${String(sequence).padStart(3, '0')}`,
    logoLabel: 'Hotel logo',
    name: `Sample Hotel ${sequence}`,
    address: sequence % 2 === 0 ? 'Luxury Hotels' : 'Business Hotels',
    rating: isMakkah ? 'Saudi Arabia - Makkah' : 'Saudi Arabia - Madianh',
    city,
    district: districtOptions[index % districtOptions.length].value,
    maxDistanceFromHaram: `${300 + ((index * 75) % 1500)} م`,
    createdAt: `${String((index % 20) + 1).padStart(2, '0')}/03/2025`,
    isActive: sequence % 11 !== 0,
  };
});

export const HOTELS_ROWS: HotelModel[] = [...firstHotels, ...generatedHotels];
