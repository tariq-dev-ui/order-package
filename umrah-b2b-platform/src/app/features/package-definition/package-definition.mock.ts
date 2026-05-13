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

export const TRANSPORT_TYPES = [
  'باص',
  'فان',
  'سيارة خاصة',
  'ليموزين',
  'ميني باص',
];

export const TRIP_ROUTES = [
  'JED-MAD',
  'JED-MAD-MAK-JED',
  'JED-MAK',
  'JED-MAK & MAD HTL-MAD APT',
  'JED-MAK-JED',
  'JED-MAK-MAD',
  'JED-MAK-MAD-MAD AIRPORT',
  'JED-MAK-MAD-MAK',
  'JED-MAK-MAD-MAK-JED',
  'MAD AIRPORT-MAD-MAK-JED',
];

export const SPECIFIC_HOTELS_MADINAH = [
  'Dar al alhekma Hotel',
  'New Hotel',
  'Sherton Hotel',
  'Dar Al rahma hotel',
  'Al noor Hotel',
  'TESSST HOTEL',
];

export const FLIGHT_COUNTRIES = [
  'المملكة العربية السعودية',
  'باكستان',
  'ماليزيا',
];

export const FLIGHT_DEFAULT_ARRIVAL_COUNTRY = 'المملكة العربية السعودية';

export const FLIGHT_DEPARTURE_CITIES_BY_COUNTRY: Record<string, string[]> = {
  'المملكة العربية السعودية': ['جدة', 'الرياض', 'الدمام', 'المدينة'],
  'باكستان': ['إسلام آباد', 'كراتشي', 'لاهور'],
  'ماليزيا': ['كوالالمبور', 'بينانغ', 'جوهور بهرو'],
};

export const FLIGHT_ARRIVAL_CITIES_BY_COUNTRY: Record<string, string[]> = {
  'المملكة العربية السعودية': ['جدة', 'الرياض', 'الدمام', 'المدينة', 'مكة'],
  'باكستان': ['إسلام آباد', 'كراتشي', 'لاهور'],
  'ماليزيا': ['كوالالمبور', 'بينانغ', 'جوهور بهرو'],
};

export const FLIGHT_TRIP_TYPES = [
  'ذهاب فقط',
  'ذهاب وعودة',
];

export const FLIGHT_TRAVEL_CLASSES = [
  'اقتصادية',
  'الأعمال',
  'الأولى',
];

export const FLIGHT_AIRLINES = [
  'الخطوط السعودية',
  'طيران ناس',
  'طيران أديل',
  'نسما للطيران',
  'السعودية الخليجية',
];

export const FOOD_TYPES = [
  'بوفيه',
  'وجبات فردية',
  'وجبات معلبة',
  'ضيافة خفيفة',
];

export const MEAL_PLANS = [
  'إفطار فقط',
  'نصف إقامة',
  'إقامة كاملة',
  'حسب الطلب',
];

export const PACKAGE_TAGS = [
  'اقتصادية',
  'عائلية',
  'VIP',
  'موسم رمضان',
  'عروض خاصة',
];

export const PACKAGE_AGENTS = [
  'وكيل الرياض',
  'وكيل جدة',
  'وكيل الدمام',
  'وكيل المدينة',
];
