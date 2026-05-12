export interface PackageBuilderStep {
  id: number;
  label: string;
  icon: string;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface Hotel {
  id: string;
  name: string;
  district: string;
  category: string;
}

export interface RoomType {
  id: string;
  label: string;
}

export interface OrderSummaryLine {
  label: string;
  value: string;
}

export interface OrderSummarySection {
  id: string;
  title: string;
  icon: string;
  lines: OrderSummaryLine[];
}

export interface SupportCard {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface OrderSummaryData {
  title: string;
  sections: OrderSummarySection[];
  supportCards: SupportCard[];
}

export interface MakkahFormSelection {
  district: string;
  category: string;
  roomType: string;
  rooms: number;
  nights: number;
  notes?: string;
}

export type HotelSelectionMode = 'criteria' | 'specific';

export interface PackageHotelSelection {
  id: string;
  cityType: 'makkah' | 'madinah';
  selectionMode: HotelSelectionMode;
  hotelName: string;
  district?: string;
  category?: string;
  roomType: string;
  roomsCount: number;
  nightsCount: number;
  notes?: string;
}
