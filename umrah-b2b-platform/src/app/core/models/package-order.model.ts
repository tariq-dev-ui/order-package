export interface PackageStep {
  key: string;
  title: string;
  completed: boolean;
  required: boolean;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  email: string;
  notes?: string;
}

export interface HotelSelection {
  city: 'makkah' | 'madinah';
  name: string;
  district?: string;
  category?: string;
  roomType: string;
  nights: number;
  rooms?: number;
}

export interface TransportSelection {
  type: string;
  route: string;
  provider: string;
  capacity: number;
  airConditioned: boolean;
}

export interface TicketSelection {
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureDate: string;
  returnDate?: string;
  travelClass: string;
  baggageAllowance: number;
}

export interface FoodSelection {
  provider: string;
  mealsPerDay: number;
  mealTypes: string[];
  dietaryOptions: string[];
  location: string;
}

export interface OtherServiceSelection {
  name: string;
  details?: string;
}

export interface PricingSummary {
  currency: string;
  adminCost: number;
  markupAmount: number;
  markupPercentage: number;
  totalPrice: number;
}

export interface DistributionSettings {
  allowReselling: boolean;
  hideOriginalCost: boolean;
  subagentAccessMode: string;
  pricingPermission: string;
  commissionModel: string;
  commissionValue: number;
  allocatedInventory: number;
}

export enum OrderStatus {
  NEW_REQUEST = 'New Request',
  ACCEPTED = 'Accepted',
  REJECTED = 'Rejected',
  REQUEST_CHANGES = 'Request Changes',
  QUOTED = 'Quoted'
}

export interface PackageOrder {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  customerInfo: CustomerInfo;
  packageSummary: string;
  packageTitle?: string;
  visibilityType?: 'shared' | 'private';
  selectedAgent?: {
    id: string;
    name: string;
    companyName: string;
    email: string;
    phone: string;
    agentCode?: string;
  } | null;
  distributionSettings?: DistributionSettings;
  makkahHotel: HotelSelection[];
  madinahHotel: HotelSelection[];
  transport: TransportSelection[];
  tickets: TicketSelection[];
  food: FoodSelection[];
  otherServices: OtherServiceSelection[];
  pricing: PricingSummary;
}
