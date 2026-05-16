import { SeroDropdownOption } from '../../../shared/components/sero-dropdown/sero-dropdown.component';

export type RfqStatus = 'pending' | 'closed' | 'completed';

export interface RfqOrder {
  id: number;
  hotelName: string;
  hotelType: string;
  city: string;
  roomTypes: string[];
  guestsCount: number;
  providersCount: number;
  checkIn: string;
  checkOut: string;
  requestedDate: string;
  clientName: string;
  clientCountry: string;
  status: RfqStatus;
}

export interface RfqFilterState {
  hotel: string;
  agent: string;
}

export const RFQ_DEFAULT_FILTERS: RfqFilterState = {
  hotel: '',
  agent: '',
};

export const RFQ_HOTEL_OPTIONS: SeroDropdownOption<string>[] = [
  { value: '', label: 'كل الفنادق' },
  { value: 'Hotel One', label: 'Hotel One' },
  { value: 'فندق التاج الأبيض', label: 'فندق التاج الأبيض' },
  { value: 'فندق دار الايمان', label: 'فندق دار الايمان' },
];

export const RFQ_AGENT_OPTIONS: SeroDropdownOption<string>[] = [
  { value: '', label: 'كل الوكلاء' },
  { value: 'Mahmood Yar', label: 'Mahmood Yar' },
  { value: 'Mohammed alqmase', label: 'Mohammed alqmase' },
  { value: 'ABCD', label: 'ABCD' },
];

export const CURRENT_RFQ_STATS = {
  currentCount: 9,
  closedCount: 83,
};

export const CURRENT_RFQ_ORDERS: RfqOrder[] = [
  {
    id: 93, hotelName: 'Hotel One', hotelType: 'Luxury Hotels', city: 'Makkah',
    roomTypes: ['Double Bed'], guestsCount: 4, providersCount: 1,
    checkIn: '2026-05-13', checkOut: '2026-05-19', requestedDate: '2026-05-13',
    clientName: 'Mahmood Yar', clientCountry: 'Pakistan', status: 'pending',
  },
  {
    id: 92, hotelName: 'فندق التاج الأبيض', hotelType: 'Luxury Hotels', city: 'Makkah',
    roomTypes: ['Double Bed', 'Family Room'], guestsCount: 4, providersCount: 1,
    checkIn: '2026-01-30', checkOut: '2026-01-31', requestedDate: '2026-01-27',
    clientName: 'Mohammed alqmase', clientCountry: 'Pakistan', status: 'pending',
  },
  {
    id: 37, hotelName: 'فندق دار الايمان', hotelType: 'Luxury Hotels', city: 'Makkah',
    roomTypes: ['Double Bed'], guestsCount: 3, providersCount: 2,
    checkIn: '2025-11-29', checkOut: '2025-11-30', requestedDate: '2025-11-29',
    clientName: 'ABCD', clientCountry: 'Saudi Arabia', status: 'pending',
  },
  {
    id: 36, hotelName: 'فندق دار الايمان', hotelType: 'Luxury Hotels', city: 'Makkah',
    roomTypes: ['Double Bed'], guestsCount: 4, providersCount: 2,
    checkIn: '2025-11-29', checkOut: '2025-11-30', requestedDate: '2025-11-29',
    clientName: 'ABCD', clientCountry: 'Saudi Arabia', status: 'pending',
  },
  {
    id: 26, hotelName: 'فندق دار الايمان', hotelType: 'Luxury Hotels', city: 'Makkah',
    roomTypes: ['Double Bed'], guestsCount: 7, providersCount: 2,
    checkIn: '2025-11-30', checkOut: '2025-12-17', requestedDate: '2025-11-29',
    clientName: 'Mahmood Yar', clientCountry: 'Pakistan', status: 'pending',
  },
  {
    id: 25, hotelName: 'فندق دار الايمان', hotelType: 'Luxury Hotels', city: 'Makkah',
    roomTypes: ['Double Bed'], guestsCount: 4, providersCount: 1,
    checkIn: '2025-11-28', checkOut: '2025-11-30', requestedDate: '2025-11-27',
    clientName: 'ABCD', clientCountry: 'Pakistan', status: 'pending',
  },
  {
    id: 23, hotelName: 'فندق دار الايمان', hotelType: 'Luxury Hotels', city: 'Makkah',
    roomTypes: ['Double Bed'], guestsCount: 3, providersCount: 1,
    checkIn: '2025-11-28', checkOut: '2025-11-30', requestedDate: '2025-11-27',
    clientName: 'ABCD', clientCountry: 'Saudi Arabia', status: 'pending',
  },
  {
    id: 22, hotelName: 'فندق دار الايمان', hotelType: 'Luxury Hotels', city: 'Makkah',
    roomTypes: ['Double Bed'], guestsCount: 4, providersCount: 2,
    checkIn: '2025-11-27', checkOut: '2025-11-30', requestedDate: '2025-11-26',
    clientName: 'ABCD', clientCountry: 'Saudi Arabia', status: 'pending',
  },
  {
    id: 16, hotelName: 'فندق دار الايمان', hotelType: 'Luxury Hotels', city: 'Makkah',
    roomTypes: ['Double Bed'], guestsCount: 4, providersCount: 1,
    checkIn: '2025-11-15', checkOut: '2025-11-23', requestedDate: '2025-11-15',
    clientName: 'ABCD', clientCountry: 'Saudi Arabia', status: 'pending',
  },
];

export const CLOSED_RFQ_ORDERS: RfqOrder[] = [
  {
    id: 91, hotelName: 'Hotel One', hotelType: 'Luxury Hotels', city: 'Makkah',
    roomTypes: ['Double Bed', 'Single Room'], guestsCount: 6, providersCount: 2,
    checkIn: '2026-04-10', checkOut: '2026-04-17', requestedDate: '2026-04-08',
    clientName: 'Mahmood Yar', clientCountry: 'Pakistan', status: 'completed',
  },
  {
    id: 88, hotelName: 'فندق التاج الأبيض', hotelType: 'Luxury Hotels', city: 'Makkah',
    roomTypes: ['Family Room'], guestsCount: 8, providersCount: 3,
    checkIn: '2026-03-15', checkOut: '2026-03-22', requestedDate: '2026-03-10',
    clientName: 'Mohammed alqmase', clientCountry: 'Saudi Arabia', status: 'closed',
  },
  {
    id: 85, hotelName: 'فندق دار الايمان', hotelType: 'Luxury Hotels', city: 'Makkah',
    roomTypes: ['Double Bed'], guestsCount: 4, providersCount: 1,
    checkIn: '2026-02-20', checkOut: '2026-02-25', requestedDate: '2026-02-18',
    clientName: 'ABCD', clientCountry: 'Saudi Arabia', status: 'completed',
  },
  {
    id: 80, hotelName: 'Hotel One', hotelType: 'Luxury Hotels', city: 'Makkah',
    roomTypes: ['Double Bed', 'Triple Room'], guestsCount: 10, providersCount: 2,
    checkIn: '2026-02-01', checkOut: '2026-02-10', requestedDate: '2026-01-28',
    clientName: 'Mahmood Yar', clientCountry: 'Pakistan', status: 'closed',
  },
  {
    id: 75, hotelName: 'فندق التاج الأبيض', hotelType: 'Luxury Hotels', city: 'Makkah',
    roomTypes: ['Suite', 'Double Bed'], guestsCount: 5, providersCount: 2,
    checkIn: '2026-01-10', checkOut: '2026-01-15', requestedDate: '2026-01-08',
    clientName: 'Mohammed alqmase', clientCountry: 'Pakistan', status: 'completed',
  },
  {
    id: 70, hotelName: 'فندق دار الايمان', hotelType: 'Luxury Hotels', city: 'Makkah',
    roomTypes: ['Double Bed'], guestsCount: 3, providersCount: 1,
    checkIn: '2025-12-20', checkOut: '2025-12-27', requestedDate: '2025-12-18',
    clientName: 'ABCD', clientCountry: 'Saudi Arabia', status: 'closed',
  },
  {
    id: 65, hotelName: 'Hotel One', hotelType: 'Luxury Hotels', city: 'Makkah',
    roomTypes: ['Family Room', 'Double Bed'], guestsCount: 12, providersCount: 4,
    checkIn: '2025-12-10', checkOut: '2025-12-20', requestedDate: '2025-12-05',
    clientName: 'Mahmood Yar', clientCountry: 'Pakistan', status: 'completed',
  },
  {
    id: 58, hotelName: 'فندق التاج الأبيض', hotelType: 'Luxury Hotels', city: 'Makkah',
    roomTypes: ['Single Room'], guestsCount: 2, providersCount: 1,
    checkIn: '2025-11-20', checkOut: '2025-11-22', requestedDate: '2025-11-18',
    clientName: 'Mohammed alqmase', clientCountry: 'Saudi Arabia', status: 'closed',
  },
  {
    id: 50, hotelName: 'فندق دار الايمان', hotelType: 'Luxury Hotels', city: 'Makkah',
    roomTypes: ['Double Bed', 'Family Room'], guestsCount: 7, providersCount: 2,
    checkIn: '2025-10-15', checkOut: '2025-10-22', requestedDate: '2025-10-10',
    clientName: 'ABCD', clientCountry: 'Saudi Arabia', status: 'completed',
  },
  {
    id: 42, hotelName: 'Hotel One', hotelType: 'Luxury Hotels', city: 'Makkah',
    roomTypes: ['Double Bed'], guestsCount: 4, providersCount: 1,
    checkIn: '2025-09-05', checkOut: '2025-09-10', requestedDate: '2025-09-01',
    clientName: 'Mahmood Yar', clientCountry: 'Pakistan', status: 'closed',
  },
];
