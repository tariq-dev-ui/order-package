/** خيار منشأة/فندق يظهر في نافذة الاختيار بعد تسجيل الدخول — يُطابق معرفات ActiveEstablishmentService (est-1 …). */
export interface SelectableHotelOption {
  id: string;
  name: string;
  nameEn?: string;
  city: string;
  logoUrl?: string | null;
  isActive: boolean;
  description?: string;
}

export interface HotelSelectorDialogData {
  hotels: SelectableHotelOption[];
}
