import { SeroDropdownOption } from '../../../shared/components/sero-dropdown/sero-dropdown.component';
import { RfqHotelFilterState, RfqHotelModel, RfqHotelSubscriptionType } from './rfq-hotel.model';

export const RFQ_CITY_OPTIONS: SeroDropdownOption<string>[] = [
  { value: 'Madianh', label: 'Madianh' },
  { value: 'Makkah', label: 'Makkah' },
];

export const RFQ_SUBSCRIPTION_OPTIONS: SeroDropdownOption<RfqHotelSubscriptionType>[] = [
  { value: 'RMS Hotel Owner', label: 'RMS Hotel Owner' },
  { value: 'External Hotel Owner', label: 'External Hotel Owner' },
];

export const RFQ_HOTEL_DEFAULT_FILTERS: RfqHotelFilterState = {
  city: '',
  subscriptionType: '',
};

export const RFQ_HOTELS: RfqHotelModel[] = [
  {
    id: 'rfq-hotel-001',
    name: 'Dar al alhekma Hotel',
    type: 'Luxury',
    city: 'Madianh',
    country: 'Saudi Arabia',
    area: 'Al Haram (Madinah)',
    subscriptions: ['External Hotel Owner'],
    rating: 5,
  },
  {
    id: 'rfq-hotel-002',
    name: 'Hotel One',
    type: 'Luxury Hotels',
    city: 'Makkah',
    country: 'Saudi Arabia',
    area: 'Al-Aziziyah',
    subscriptions: ['RMS Hotel Owner'],
    rating: 5,
  },
  {
    id: 'rfq-hotel-003',
    name: 'فندق دار الإيمان',
    type: 'Luxury Hotels',
    city: 'Makkah',
    country: 'Saudi Arabia',
    area: 'Al-Haram',
    subscriptions: ['External Hotel Owner'],
    rating: 5,
  },
  {
    id: 'rfq-hotel-004',
    name: 'Al safwa Hotel',
    type: 'Luxury Hotels',
    city: 'Makkah',
    country: 'Saudi Arabia',
    area: 'Al-Aziziyah',
    subscriptions: ['RMS Hotel Owner'],
    rating: 5,
  },
  {
    id: 'rfq-hotel-005',
    name: 'Barakkah hotel',
    type: 'Luxury Hotels',
    city: 'Makkah',
    country: 'Saudi Arabia',
    area: 'Al-Aziziyah',
    subscriptions: ['RMS Hotel Owner'],
    rating: 5,
  },
  {
    id: 'rfq-hotel-006',
    name: 'فندق التاج الأبيض',
    type: 'Luxury Hotels',
    city: 'Makkah',
    country: 'Saudi Arabia',
    area: 'Al-Aziziyah',
    subscriptions: ['RMS Hotel Owner', 'External Hotel Owner'],
    rating: 4,
  },
  {
    id: 'rfq-hotel-007',
    name: 'فندق مقاصد الشريعة',
    type: 'Luxury Hotels',
    city: 'Makkah',
    country: 'Saudi Arabia',
    area: 'Al-Aziziyah',
    subscriptions: ['External Hotel Owner'],
    rating: 4,
  },
  {
    id: 'rfq-hotel-008',
    name: 'هوليدي إن مكة العزيزية',
    type: 'Luxury Hotels',
    city: 'Makkah',
    country: 'Saudi Arabia',
    area: 'Al-Aziziyah',
    subscriptions: ['External Hotel Owner'],
    rating: 5,
  },
];
