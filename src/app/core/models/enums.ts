export enum UserRole {
  ADMIN = 'admin',
  MASTER_AGENT = 'master_agent',
  SUB_AGENT = 'sub_agent',
  VIEWER = 'viewer'
}

export enum PackageType {
  SHARED = 'shared',
  PRIVATE_RESELL = 'private_resell'
}

export enum PackageStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  VERIFIED = 'verified',
  ACTIVE = 'active',
  PAUSED = 'paused',
  EXPIRED = 'expired',
  ARCHIVED = 'archived'
}

export enum BookingMode {
  INSTANT = 'instant',
  REQUEST = 'request',
  MANUAL = 'manual',
  INQUIRY = 'inquiry'
}

export enum PricingPermission {
  FIXED_BY_ADMIN = 'fixed_by_admin',
  AGENT_MARKUP = 'agent_markup',
  AGENT_FULL_CONTROL = 'agent_full_control'
}

export enum CommissionModel {
  FIXED_AMOUNT = 'fixed_amount',
  PERCENTAGE = 'percentage'
}

export enum SubagentAccessMode {
  ALL = 'all',
  SELECTED = 'selected'
}

export enum DistributionStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  PENDING = 'pending',
  EXPIRED = 'expired'
}

export enum HotelRating {
  THREE = 3,
  FOUR = 4,
  FIVE = 5
}

export enum VisaStatus {
  INCLUDED = 'included',
  NOT_INCLUDED = 'not_included',
  OPTIONAL = 'optional'
}

export enum TransportType {
  BUS = 'bus',
  VIP_BUS = 'vip_bus',
  PRIVATE_CAR = 'private_car',
  VAN = 'van'
}

export enum MarkupType {
  PERCENTAGE = 'percentage',
  FIXED = 'fixed'
}
