import {
  PackageType, PackageStatus, BookingMode, VisaStatus,
  HotelRating, TransportType
} from './enums';
import { DistributionConfig } from './distribution.model';
import { PricingConfig } from './pricing.model';
import { Agent } from './agent.model';

export type PackageVisibilityType = 'shared' | 'private' | 'group';

export interface HotelService {
  id: string;
  name: string;
  city: 'makkah' | 'madinah';
  rating: HotelRating;
  distanceToHaram: number;
  nights: number;
  roomType: string;
  mealPlan: string;
  checkIn: Date;
  checkOut: Date;
  thumbnailUrl?: string;
}

export interface TransportService {
  id: string;
  type: TransportType;
  route: string;
  capacity: number;
  isAirConditioned: boolean;
  provider: string;
  departureDateTime?: Date;
}

export interface TicketService {
  id: string;
  airline: string;
  flightNumber: string;
  origin: string;
  destination: string;
  departureDate: Date;
  returnDate?: Date;
  class: 'economy' | 'business' | 'first';
  baggageAllowance: number;
}

export interface CateringService {
  id: string;
  provider: string;
  mealsPerDay: number;
  mealTypes: string[];
  dietaryOptions: string[];
  serviceLocation: string;
}

export interface PackageOwnership {
  createdByAdminId: string;
  createdByAdminName: string;
  distributedByAgentId?: string;
  distributedByAgentName?: string;
  parentPackageId?: string;
  ownershipChain: OwnershipNode[];
}

export interface OwnershipNode {
  id: string;
  name: string;
  role: string;
  level: number;
  timestamp: Date;
}

export interface Package {
  id: string;
  title: string;
  description: string;
  thumbnailUrl?: string;
  type: PackageType;
  status: PackageStatus;
  bookingMode: BookingMode;
  isInstantBooking: boolean;
  isVerified: boolean;

  // Services
  makkahHotels: HotelService[];
  madinahHotels: HotelService[];
  transportation: TransportService[];
  tickets: TicketService[];
  catering: CateringService[];

  // Visa
  visaStatus: VisaStatus;
  visaCost?: number;

  // Validity
  validFrom: Date;
  validTo: Date;
  departureDate: Date;

  // Capacity
  totalCapacity: number;
  soldCount: number;
  reservedCount: number;

  // Distribution
  distributionConfig?: DistributionConfig;
  visibilityType?: PackageVisibilityType;
  selectedAgent?: Agent | null;
  selectedGroups?: string[];

  // Pricing
  pricingConfig: PricingConfig;

  // Ownership
  ownership: PackageOwnership;

  // Tags & Meta
  tags: string[];
  nights: number;
  paxCount: number;

  createdAt: Date;
  updatedAt: Date;
}

export interface PackageCardView {
  id: string;
  title: string;
  thumbnailUrl: string;
  type: PackageType;
  status: PackageStatus;
  bookingMode: BookingMode;
  isInstantBooking: boolean;
  isVerified: boolean;
  visaStatus: VisaStatus;
  validFrom: Date;
  validTo: Date;
  nights: number;
  remainingInventory: number;
  totalCapacity: number;
  sellingPrice: number;
  currency: string;
  hasMarkup: boolean;
  markupAmount?: number;
  makkahHotelCount: number;
  madinahHotelCount: number;
  transportCount: number;
  ticketCount: number;
  cateringCount: number;
  ownership: PackageOwnership;
  tags: string[];
}
