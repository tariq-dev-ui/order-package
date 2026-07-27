export interface ProviderMock {
  id: string;
  name: string;
}

export interface HotelMock {
  id: string;
  name: string;
  providerId: string;
  totalUnits: number;
}

export const PROVIDERS: ProviderMock[] = [
  { id: 'booking', name: 'Booking.com' },
  { id: 'agoda', name: 'Agoda' },
  { id: 'expedia', name: 'Expedia' },
  { id: 'direct', name: 'Direct' },
  { id: 'hotelscom', name: 'Hotels.com' },
];

const PROVIDER_IDS = PROVIDERS.map((provider) => provider.id);
const CITIES = ['Makkah', 'Madinah', 'Jeddah', 'Riyadh', 'Taif', 'Dammam', 'Abha', 'Yanbu'];
const VARIANTS = ['Towers', 'Plaza', 'Suites'];

export const HOTELS: HotelMock[] = CITIES.flatMap((city, cityIndex) =>
  VARIANTS.map((variant, variantIndex) => {
    const index = cityIndex * VARIANTS.length + variantIndex;
    return {
      id: `hotel-${index + 1}`,
      name: `SERO ${city} ${variant}`,
      providerId: PROVIDER_IDS[index % PROVIDER_IDS.length],
      totalUnits: 10 + ((index * 3) % 15),
    };
  }),
);

export const PROVIDERS_BY_ID = new Map(PROVIDERS.map((provider) => [provider.id, provider]));
export const HOTELS_BY_ID = new Map(HOTELS.map((hotel) => [hotel.id, hotel]));

export const ROOM_TYPE_WEIGHTS: Record<string, number> = {
  standard: 0.45,
  deluxe: 0.28,
  suite: 0.12,
  family: 0.15,
};

export const BOOKING_TYPE_WEIGHTS: Record<string, number> = {
  regular: 0.4,
  qadiMilyan: 0.2,
  subQadiMilyan: 0.1,
  representative: 0.2,
  subRepresentative: 0.1,
};

export const ALL_ROOM_TYPES = Object.keys(ROOM_TYPE_WEIGHTS);
export const ALL_BOOKING_TYPES = Object.keys(BOOKING_TYPE_WEIGHTS);
