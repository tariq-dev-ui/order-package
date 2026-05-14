import { SeroDropdownOption } from '../../../shared/components/sero-dropdown/sero-dropdown.component';

export type FoodPricingStatus = 'فعال' | 'غير فعال';
export type FoodPricingStatusFilter = 'all' | FoodPricingStatus;

export interface FoodPricingFilterState {
  startDate: string;
  status: FoodPricingStatusFilter;
  cateringCompany: string;
  foodType: string;
  mealPlan: string;
}

export interface FoodPricingRow {
  id: string;
  code: string;
  title: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  cateringCompany: string;
  foodType: string;
  mealPlan: string;
}

export const FOOD_PRICING_DEFAULT_FILTERS: FoodPricingFilterState = {
  startDate: '',
  status: 'all',
  cateringCompany: 'all',
  foodType: 'all',
  mealPlan: 'all',
};

export const FOOD_PRICING_STATUS_OPTIONS: SeroDropdownOption<FoodPricingStatusFilter>[] = [
  { value: 'all', label: 'الكل' },
  { value: 'فعال', label: 'فعال' },
  { value: 'غير فعال', label: 'غير فعال' },
];

export const FOOD_PRICING_CATERING_COMPANY_OPTIONS: SeroDropdownOption<string>[] = [
  { value: 'all', label: 'الكل' },
  { value: 'شركة الضيافة المميزة', label: 'شركة الضيافة المميزة' },
  { value: 'شركة تموين الحرمين', label: 'شركة تموين الحرمين' },
  { value: 'شركة سفراء الإعاشة', label: 'شركة سفراء الإعاشة' },
];

export const FOOD_PRICING_FOOD_TYPE_OPTIONS: SeroDropdownOption<string>[] = [
  { value: 'all', label: 'الكل' },
  { value: 'بوفيه', label: 'بوفيه' },
  { value: 'وجبات فردية', label: 'وجبات فردية' },
  { value: 'وجبات جاهزة', label: 'وجبات جاهزة' },
];

export const FOOD_PRICING_MEAL_PLAN_OPTIONS: SeroDropdownOption<string>[] = [
  { value: 'all', label: 'الكل' },
  { value: 'فطور', label: 'فطور' },
  { value: 'غداء', label: 'غداء' },
  { value: 'عشاء', label: 'عشاء' },
  { value: 'ثلاث وجبات', label: 'ثلاث وجبات' },
];

export const FOOD_PRICING_ITEMS_PER_PAGE_OPTIONS = [5, 10, 20];

export const FOOD_PRICING_ROWS: FoodPricingRow[] = [
  {
    id: 'food-01',
    code: '01',
    title: 'Title1',
    startDate: '2025-07-16',
    endDate: '2026-12-19',
    isActive: true,
    cateringCompany: 'شركة الضيافة المميزة',
    foodType: 'بوفيه',
    mealPlan: 'ثلاث وجبات',
  },
  {
    id: 'food-02',
    code: '02',
    title: 'Title',
    startDate: '2024-07-20',
    endDate: '2026-09-20',
    isActive: true,
    cateringCompany: 'شركة تموين الحرمين',
    foodType: 'وجبات فردية',
    mealPlan: 'غداء',
  },
  {
    id: 'food-03',
    code: 'Test 001',
    title: 'Test 001',
    startDate: '2025-09-18',
    endDate: '2025-09-30',
    isActive: true,
    cateringCompany: 'شركة سفراء الإعاشة',
    foodType: 'وجبات جاهزة',
    mealPlan: 'فطور',
  },
  {
    id: 'food-04',
    code: 'Test 001',
    title: 'Test 001',
    startDate: '2025-09-24',
    endDate: '2025-09-30',
    isActive: true,
    cateringCompany: 'شركة الضيافة المميزة',
    foodType: 'بوفيه',
    mealPlan: 'عشاء',
  },
  {
    id: 'food-05',
    code: '654',
    title: '321',
    startDate: '2025-11-23',
    endDate: '2025-11-23',
    isActive: true,
    cateringCompany: 'شركة تموين الحرمين',
    foodType: 'وجبات فردية',
    mealPlan: 'فطور',
  },
  {
    id: 'food-06',
    code: '545',
    title: '4545',
    startDate: '2025-11-23',
    endDate: '2025-11-30',
    isActive: true,
    cateringCompany: 'شركة سفراء الإعاشة',
    foodType: 'وجبات جاهزة',
    mealPlan: 'ثلاث وجبات',
  },
  {
    id: 'food-07',
    code: '001',
    title: 'SeroTest',
    startDate: '2024-01-01',
    endDate: '2026-12-31',
    isActive: true,
    cateringCompany: 'شركة الضيافة المميزة',
    foodType: 'بوفيه',
    mealPlan: 'غداء',
  },
  {
    id: 'food-08',
    code: '002',
    title: 'SeroTest2',
    startDate: '2024-01-08',
    endDate: '2026-12-31',
    isActive: true,
    cateringCompany: 'شركة تموين الحرمين',
    foodType: 'وجبات فردية',
    mealPlan: 'عشاء',
  },
  {
    id: 'food-09',
    code: '002',
    title: 'SeroTest3',
    startDate: '2024-01-08',
    endDate: '2026-12-31',
    isActive: true,
    cateringCompany: 'شركة سفراء الإعاشة',
    foodType: 'وجبات جاهزة',
    mealPlan: 'ثلاث وجبات',
  },
];
