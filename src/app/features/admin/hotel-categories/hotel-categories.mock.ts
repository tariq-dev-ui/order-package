import { HotelCategoryModel } from './hotel-category.model';

export const HOTEL_CATEGORIES_ITEMS_PER_PAGE_OPTIONS = [5, 10, 20];

export const HOTEL_CATEGORIES_MOCK: HotelCategoryModel[] = [
  {
    id: 'HC-001',
    title: 'Economy',
    description: 'Economy',
    isActive: true,
    added: '23-09-2025',
  },
  {
    id: 'HC-002',
    title: 'Luxury',
    description: 'Luxury',
    isActive: true,
    added: '23-09-2025',
  },
  {
    id: 'HC-003',
    title: 'normal',
    description: 'غير متوفر',
    isActive: true,
    added: '19-11-2025',
  },
];
