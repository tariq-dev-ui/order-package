export type HotelMode = 'criteria' | 'specific';

export interface PackageStep {
  id: number;
  label: string;
  icon: string;
}

export interface HotelSelection {
  id: string;
  mode: HotelMode;
  neighborhood: string;
  category: string;
  roomType: string;
  roomCount: number;
  nightsCount: number;
  hotelName: string;
}

export interface OrderSummary {
  makkahHotels: HotelSelection[];
  madinahHotels: HotelSelection[];
  hasTransport: boolean;
  hasMeals: boolean;
  hasTickets: boolean;
}

export interface PackageDefinitionState {
  currentStep: number;
  applyNightsToAll: boolean;
  globalNights: number;
  orderSummary: OrderSummary;
}

export interface HotelFormValues {
  mode: HotelMode;
  neighborhood: string;
  category: string;
  roomType: string;
  roomCount: number;
  nightsCount: number;
  hotelName: string;
}
