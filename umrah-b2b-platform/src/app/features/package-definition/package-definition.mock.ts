import { PackageStep } from './package-definition.models';

export const PACKAGE_STEPS: PackageStep[] = [
  { id: 1, label: 'packageDefinition.steps.makkahHotels', icon: 'apartment' },
  { id: 2, label: 'packageDefinition.steps.madinahHotels', icon: 'apartment' },
  { id: 3, label: 'packageDefinition.steps.transport',     icon: 'directions_bus' },
  { id: 4, label: 'packageDefinition.steps.meals',         icon: 'restaurant' },
  { id: 5, label: 'packageDefinition.steps.tickets',       icon: 'flight' },
  { id: 6, label: 'packageDefinition.steps.review',        icon: 'checklist' },
  { id: 7, label: 'packageDefinition.steps.confirmation',  icon: 'check_circle' },
];

export const MAKKAH_NEIGHBORHOODS = [
  'العزيزية', 'المسفلة', 'أجياد', 'الحجون', 'البيبان', 'النوارية', 'شيشة',
];

export const MADINAH_NEIGHBORHOODS = [
  'قباء', 'العوالي', 'المطار', 'السلام', 'المناخة', 'العيون',
];

export const HOTEL_CATEGORIES = ['ECONOMY', 'luxury', 'normal'];

export const ROOM_TYPES = [
  'غرفة مفردة', 'غرفة مزدوجة', 'غرفة ثلاثية', 'جناح', 'غرفة رباعية',
];

export const SPECIFIC_HOTELS_MAKKAH = [
  'فندق مكة كونكورد',
  'برج البيت',
  'هيلتون مكة',
  'ماريوت مكة',
  'موفنبيك برج حفصة',
  'شيراتون مكة',
  'هيات ريجنسي مكة',
];

export const SPECIFIC_HOTELS_MADINAH = [
  'موفنبيك المدينة',
  'هيلتون المدينة',
  'أنوار المدينة',
  'كراون بلازا المدينة',
  'رافلز المدينة',
];
