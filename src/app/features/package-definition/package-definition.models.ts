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

export interface FlightSelection {
  departureCountry: string;
  departureCity: string;
  arrivalCountry: string;
  arrivalCity: string;
  tripType: string;
  travelClass: string;
  airline: string;
  seats: number;
}

export interface FlightFormValues {
  departureCountry: string;
  departureCity: string;
  arrivalCountry: string;
  arrivalCity: string;
  tripType: string;
  travelClass: string;
  airline: string;
  seats: number;
}

export interface MealSelection {
  foodType: string;
  mealPlan: string;
  guests: number;
}

export interface MealFormValues {
  foodType: string;
  mealPlan: string;
  guests: number;
}

export interface PackageDetailsFormValues {
  packageTitle: string;
  packageType: 'public' | 'private';
  assignedAgentId?: string;
  assignedAgentName?: string;
  guestCount: number;
  quantity: number;
  packageCode: string;
  startDate: string;
  endDate: string;
  isPackageActive: boolean;
  includeVisa: boolean;
  tags: string;
}

export interface PricingFormValues {
  adjustPriceMode: string;
  markupPercent: number;
  discountPercent: number;
  costPrice: number | null;
  salePrice: number | null;
  finalSalePrice: number | null;
  hideServiceBreakdown: boolean;
  verifiedLocked: boolean;
}

export interface PackageDefinitionState {
  currentStep: number;
  applyNightsToAll: boolean;
  globalNights: number;
  tripRoute: string;
  transportType: string;
  flightForm: FlightFormValues;
  flights: FlightSelection[];
  mealForm: MealFormValues;
  meals: MealSelection[];
  packageDetailsForm: PackageDetailsFormValues;
  pricingForm: PricingFormValues;
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
