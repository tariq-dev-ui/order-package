import { PackageStep } from './package-definition.models';

export const PACKAGE_STEPS: PackageStep[] = [
  { id: 1, label: 'packageDefinition.steps.makkahHotels', icon: 'apartment' },
  { id: 2, label: 'packageDefinition.steps.madinahHotels', icon: 'apartment' },
  { id: 3, label: 'packageDefinition.steps.transport',     icon: 'directions_bus' },
  { id: 4, label: 'packageDefinition.steps.tickets',       icon: 'flight' },
  { id: 5, label: 'packageDefinition.steps.food',          icon: 'restaurant' },
  { id: 6, label: 'packageDefinition.steps.other',         icon: 'checklist' },
  { id: 7, label: 'packageDefinition.steps.pricing',       icon: 'payments' },
];

export const MAKKAH_NEIGHBORHOODS = [
  'العزيزية', 'الحرم', 'الرصيفة', 'Not Mention',
];

export const MADINAH_NEIGHBORHOODS = [
  'الحرم', 'Not Mention',
];

export const HOTEL_CATEGORIES = ['ECONOMY', 'luxury', 'normal'];

export const ROOM_TYPES = [
  'غرفة مفردة', 'غرفة مزدوجة', 'غرفة ثلاثية', 'جناح', 'غرفة رباعية',
];

export const SPECIFIC_HOTELS_MAKKAH = [
  'Hotel One',
  'فندق دار الايمان',
  'Al safwa Hotel',
  'Barakkah hotel',
  'فندق التاج الأبيض',
  'hotel 5',
  'فندق مقاصد الشريعة',
  'هوليداي إن مكة العزيزية',
  'A',
  'مسار علي',
  'فندق جديد',
  'فندق سيرو',
  'Sero',
  'SERO HOTEL 1',
  'Dar Al Mowhdeen',
  'فندق روحة المقام',
  'أجياد الاصيل',
  'فندق ميسان المقام',
  'فندق مناسك الفضيلة',
  'فندق الشهداء',
];

export const SPECIFIC_HOTELS_MADINAH = [
  'Dar al alhekma Hotel',
  'New Hotel',
  'Sherton Hotel',
  'Dar Al rahma hotel',
  'Al noor Hotel',
  'TESSST HOTEL',
];
