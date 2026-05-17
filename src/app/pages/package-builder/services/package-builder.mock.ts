import {
  AirlineCompanyLookupModel,
  CarTypeModel,
  CateringFoodTypeModel,
  CateringTypeModel,
  CityData,
  CityDistData,
  CountryData,
  HotelCategoryModel,
  HotelModel,
  HotelRoomTypeModel,
  TripPathModel,
} from 'src/app/services/admin.api.client';

export const MOCK_DISTRICTS_MAKKAH: CityDistData[] = [
  { CityDistID: 1, DistTitle: 'الحرم المكي', CityID: 1 },
  { CityDistID: 2, DistTitle: 'المسفلة', CityID: 1 },
  { CityDistID: 3, DistTitle: 'العزيزية', CityID: 1 },
  { CityDistID: 4, DistTitle: 'الشيشة', CityID: 1 },
  { CityDistID: 5, DistTitle: 'الزاهر', CityID: 1 },
  { CityDistID: 6, DistTitle: 'أجياد', CityID: 1 },
  { CityDistID: 7, DistTitle: 'النزهة', CityID: 1 },
];

export const MOCK_DISTRICTS_MADINAH: CityDistData[] = [
  { CityDistID: 11, DistTitle: 'المنطقة المركزية', CityID: 2 },
  { CityDistID: 12, DistTitle: 'العنبرية', CityID: 2 },
  { CityDistID: 13, DistTitle: 'القبلتين', CityID: 2 },
  { CityDistID: 14, DistTitle: 'السلام', CityID: 2 },
  { CityDistID: 15, DistTitle: 'قباء', CityID: 2 },
  { CityDistID: 16, DistTitle: 'بني حارثة', CityID: 2 },
];

export const MOCK_TRIP_PATHS: TripPathModel[] = [
  { TripPathID: 1, Title: 'جدة ← مكة المكرمة', TitleEn: 'Jeddah → Makkah' },
  { TripPathID: 2, Title: 'مكة المكرمة ← المدينة المنورة', TitleEn: 'Makkah → Madinah' },
  { TripPathID: 3, Title: 'المدينة المنورة ← جدة', TitleEn: 'Madinah → Jeddah' },
  { TripPathID: 4, Title: 'جدة ← المدينة المنورة', TitleEn: 'Jeddah → Madinah' },
  { TripPathID: 5, Title: 'مكة المكرمة ← جدة', TitleEn: 'Makkah → Jeddah' },
  { TripPathID: 6, Title: 'المدينة المنورة ← مكة المكرمة', TitleEn: 'Madinah → Makkah' },
];

export const MOCK_CAR_TYPES: CarTypeModel[] = [
  { CarTypeID: 1, Title: 'حافلة صغيرة (ميني باص)', TitleEn: 'Mini Bus' },
  { CarTypeID: 2, Title: 'حافلة كبيرة', TitleEn: 'Large Bus' },
  { CarTypeID: 3, Title: 'فان VIP', TitleEn: 'VIP Van' },
  { CarTypeID: 4, Title: 'فان عادي', TitleEn: 'Regular Van' },
  { CarTypeID: 5, Title: 'سيارة خاصة', TitleEn: 'Private Car' },
];

export const MOCK_FOOD_TYPES: CateringFoodTypeModel[] = [
  { Id: 1, TypeName: 'إفطار' },
  { Id: 2, TypeName: 'غداء' },
  { Id: 3, TypeName: 'عشاء' },
  { Id: 4, TypeName: 'إفطار وغداء' },
  { Id: 5, TypeName: 'إفطار وعشاء' },
  { Id: 6, TypeName: 'ثلاث وجبات' },
];

export const MOCK_CATERING_TYPES: CateringTypeModel[] = [
  { CateringTypeID: 1, Title: 'بوفيه مفتوح' },
  { CateringTypeID: 2, Title: 'وجبة معبأة' },
  { CateringTypeID: 3, Title: 'خدمة على الطاولة' },
  { CateringTypeID: 4, Title: 'بوفيه جزئي' },
];

export const MOCK_ROOM_TYPES: HotelRoomTypeModel[] = [
  { RoomTypeID: 1, Title: 'سرير واحد', TitleEn: 'Single' },
  { RoomTypeID: 2, Title: 'سريران', TitleEn: 'Double' },
  { RoomTypeID: 3, Title: 'ثلاثة أسرة', TitleEn: 'Triple' },
  { RoomTypeID: 4, Title: 'أربعة أسرة', TitleEn: 'Quadruple' },
  { RoomTypeID: 5, Title: 'غرفة عائلية', TitleEn: 'Family Room' },
  { RoomTypeID: 6, Title: 'جناح', TitleEn: 'Suite' },
];

export const MOCK_HOTEL_CATEGORIES: HotelCategoryModel[] = [
  { CategoryID: 1, Title: 'اقتصادي' },
  { CategoryID: 2, Title: 'قياسي' },
  { CategoryID: 3, Title: 'مميز' },
  { CategoryID: 4, Title: 'فاخر' },
];

export const MOCK_HOTELS: HotelModel[] = [
  // Makkah hotels (CityId: 1)
  { HotelID: 101, Name: 'فندق هيلتون مكة', NameEn: 'Hilton Makkah Convention Hotel', CityId: 1, CityID: 1, DistID: 1, OfficialRating: 5 },
  { HotelID: 102, Name: 'بولمان زمزم مكة', NameEn: 'Pullman ZamZam Makkah', CityId: 1, CityID: 1, DistID: 1, OfficialRating: 5 },
  { HotelID: 103, Name: 'سويسوتيل المقام', NameEn: 'Swissôtel Al Maqam Makkah', CityId: 1, CityID: 1, DistID: 1, OfficialRating: 5 },
  { HotelID: 104, Name: 'فيرمونت مكة', NameEn: 'Fairmont Makkah Clock Royal Tower', CityId: 1, CityID: 1, DistID: 1, OfficialRating: 5 },
  { HotelID: 105, Name: 'دار التوحيد إنتركونتيننتال', NameEn: 'Dar Al Tawhid Intercontinental Makkah', CityId: 1, CityID: 1, DistID: 1, OfficialRating: 5 },
  { HotelID: 106, Name: 'فندق موفنبيك أبراج البيت', NameEn: 'Mövenpick Hotel & Residences Hajar Tower', CityId: 1, CityID: 1, DistID: 1, OfficialRating: 5 },
  { HotelID: 107, Name: 'فندق الساعة الكبرى', NameEn: 'Clock Tower Hotel Makkah', CityId: 1, CityID: 1, DistID: 1, OfficialRating: 4 },
  { HotelID: 108, Name: 'فندق الأبرار', NameEn: 'Al Abrar Hotel Makkah', CityId: 1, CityID: 1, DistID: 2, OfficialRating: 4 },
  { HotelID: 109, Name: 'فندق العزيزية الماسي', NameEn: 'Al Aziziya Diamond Hotel', CityId: 1, CityID: 1, DistID: 3, OfficialRating: 3 },
  { HotelID: 110, Name: 'فندق الزاهر بلازا', NameEn: 'Al Zaher Plaza Hotel', CityId: 1, CityID: 1, DistID: 5, OfficialRating: 3 },

  // Madinah hotels (CityId: 2)
  { HotelID: 201, Name: 'فندق موفنبيك المدينة', NameEn: 'Mövenpick Hotel Madinah', CityId: 2, CityID: 2, DistID: 11, OfficialRating: 5 },
  { HotelID: 202, Name: 'فندق أنوار المدينة', NameEn: 'Anwar Al Madinah Mövenpick Hotel', CityId: 2, CityID: 2, DistID: 11, OfficialRating: 5 },
  { HotelID: 203, Name: 'فندق أوبيروي المدينة', NameEn: 'The Oberoi Madinah', CityId: 2, CityID: 2, DistID: 11, OfficialRating: 5 },
  { HotelID: 204, Name: 'فندق ميلينيوم المدينة', NameEn: 'Millennium Hotel Madinah', CityId: 2, CityID: 2, DistID: 11, OfficialRating: 5 },
  { HotelID: 205, Name: 'فندق هيلتون المدينة', NameEn: 'Hilton Madinah Hotel', CityId: 2, CityID: 2, DistID: 11, OfficialRating: 5 },
  { HotelID: 206, Name: 'فندق الساعة المدينة', NameEn: 'Al Saa Hotel Madinah', CityId: 2, CityID: 2, DistID: 12, OfficialRating: 4 },
  { HotelID: 207, Name: 'فندق السلام المدينة', NameEn: 'Al Salam Hotel Madinah', CityId: 2, CityID: 2, DistID: 14, OfficialRating: 4 },
  { HotelID: 208, Name: 'فندق قباء', NameEn: 'Quba Hotel Madinah', CityId: 2, CityID: 2, DistID: 15, OfficialRating: 3 },
];

export const MOCK_COUNTRIES: CountryData[] = [
  { CountryID: 1,  Title: 'المملكة العربية السعودية', TitleEnglish: 'Saudi Arabia',  Code: 'SA' },
  { CountryID: 2,  Title: 'مصر',                      TitleEnglish: 'Egypt',           Code: 'EG' },
  { CountryID: 3,  Title: 'الإمارات العربية المتحدة', TitleEnglish: 'United Arab Emirates', Code: 'AE' },
  { CountryID: 4,  Title: 'الأردن',                   TitleEnglish: 'Jordan',          Code: 'JO' },
  { CountryID: 5,  Title: 'تركيا',                    TitleEnglish: 'Turkey',          Code: 'TR' },
  { CountryID: 6,  Title: 'إندونيسيا',                TitleEnglish: 'Indonesia',       Code: 'ID' },
  { CountryID: 7,  Title: 'باكستان',                  TitleEnglish: 'Pakistan',        Code: 'PK' },
  { CountryID: 8,  Title: 'الهند',                    TitleEnglish: 'India',           Code: 'IN' },
  { CountryID: 9,  Title: 'المغرب',                   TitleEnglish: 'Morocco',         Code: 'MA' },
  { CountryID: 10, Title: 'ماليزيا',                  TitleEnglish: 'Malaysia',        Code: 'MY' },
];

export const MOCK_CITIES_BY_COUNTRY: Record<number, CityData[]> = {
  1: [ // Saudi Arabia
    { CityID: 101, Name: 'جدة',               NameEn: 'Jeddah',   CountryID: 1 },
    { CityID: 102, Name: 'مكة المكرمة',       NameEn: 'Makkah',   CountryID: 1 },
    { CityID: 103, Name: 'المدينة المنورة',   NameEn: 'Madinah',  CountryID: 1 },
    { CityID: 104, Name: 'الرياض',             NameEn: 'Riyadh',   CountryID: 1 },
    { CityID: 105, Name: 'الطائف',            NameEn: 'Taif',     CountryID: 1 },
  ],
  2: [ // Egypt
    { CityID: 201, Name: 'القاهرة',   NameEn: 'Cairo',         CountryID: 2 },
    { CityID: 202, Name: 'الإسكندرية', NameEn: 'Alexandria',   CountryID: 2 },
    { CityID: 203, Name: 'الجيزة',    NameEn: 'Giza',          CountryID: 2 },
    { CityID: 204, Name: 'شرم الشيخ', NameEn: 'Sharm El Sheikh', CountryID: 2 },
  ],
  3: [ // UAE
    { CityID: 301, Name: 'دبي',         NameEn: 'Dubai',       CountryID: 3 },
    { CityID: 302, Name: 'أبوظبي',     NameEn: 'Abu Dhabi',   CountryID: 3 },
    { CityID: 303, Name: 'الشارقة',    NameEn: 'Sharjah',     CountryID: 3 },
  ],
  4: [ // Jordan
    { CityID: 401, Name: 'عمّان',   NameEn: 'Amman',   CountryID: 4 },
    { CityID: 402, Name: 'الزرقاء', NameEn: 'Zarqa',   CountryID: 4 },
  ],
  5: [ // Turkey
    { CityID: 501, Name: 'إسطنبول', NameEn: 'Istanbul', CountryID: 5 },
    { CityID: 502, Name: 'أنقرة',   NameEn: 'Ankara',   CountryID: 5 },
  ],
  6: [ // Indonesia
    { CityID: 601, Name: 'جاكرتا',   NameEn: 'Jakarta',    CountryID: 6 },
    { CityID: 602, Name: 'سورابايا', NameEn: 'Surabaya',   CountryID: 6 },
  ],
  7: [ // Pakistan
    { CityID: 701, Name: 'كراتشي',   NameEn: 'Karachi',    CountryID: 7 },
    { CityID: 702, Name: 'لاهور',    NameEn: 'Lahore',     CountryID: 7 },
    { CityID: 703, Name: 'إسلام آباد', NameEn: 'Islamabad', CountryID: 7 },
  ],
  8: [ // India
    { CityID: 801, Name: 'مومباي',   NameEn: 'Mumbai',     CountryID: 8 },
    { CityID: 802, Name: 'دلهي',     NameEn: 'Delhi',      CountryID: 8 },
    { CityID: 803, Name: 'حيدر آباد', NameEn: 'Hyderabad', CountryID: 8 },
  ],
  9: [ // Morocco
    { CityID: 901, Name: 'الدار البيضاء', NameEn: 'Casablanca', CountryID: 9 },
    { CityID: 902, Name: 'الرباط',        NameEn: 'Rabat',      CountryID: 9 },
  ],
  10: [ // Malaysia
    { CityID: 1001, Name: 'كوالالمبور', NameEn: 'Kuala Lumpur', CountryID: 10 },
    { CityID: 1002, Name: 'بينانج',     NameEn: 'Penang',        CountryID: 10 },
  ],
};

export const MOCK_AIRLINES: AirlineCompanyLookupModel[] = [
  { AirlineCompanyID: 1,  NameEn: 'Saudia',                    NameAr: 'الخطوط الجوية السعودية' },
  { AirlineCompanyID: 2,  NameEn: 'Emirates',                  NameAr: 'طيران الإمارات' },
  { AirlineCompanyID: 3,  NameEn: 'Etihad Airways',            NameAr: 'الاتحاد للطيران' },
  { AirlineCompanyID: 4,  NameEn: 'Qatar Airways',             NameAr: 'الخطوط الجوية القطرية' },
  { AirlineCompanyID: 5,  NameEn: 'Turkish Airlines',          NameAr: 'الخطوط الجوية التركية' },
  { AirlineCompanyID: 6,  NameEn: 'Air Arabia',                NameAr: 'العربية للطيران' },
  { AirlineCompanyID: 7,  NameEn: 'EgyptAir',                  NameAr: 'مصر للطيران' },
  { AirlineCompanyID: 8,  NameEn: 'Pakistan International',    NameAr: 'الخطوط الجوية الباكستانية' },
  { AirlineCompanyID: 9,  NameEn: 'IndiGo',                    NameAr: 'إنديغو' },
  { AirlineCompanyID: 10, NameEn: 'Malaysia Airlines',         NameAr: 'الخطوط الجوية الماليزية' },
  { AirlineCompanyID: 11, NameEn: 'Garuda Indonesia',          NameAr: 'غاروودا إندونيسيا' },
  { AirlineCompanyID: 12, NameEn: 'Royal Jordanian',           NameAr: 'الملكية الأردنية' },
  { AirlineCompanyID: 13, NameEn: 'Flynas',                    NameAr: 'طيران ناس' },
  { AirlineCompanyID: 14, NameEn: 'Flyadeal',                  NameAr: 'طيران أديل' },
];
