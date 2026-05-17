export interface BookingModel {
  id?: number;
  [key: string]: unknown;
}

/**
 * Booking modes in the unified B2B interface.
 * (A) Direct = confirmed reservation; (B) Draft Stock = room pool; (C) Sub-Booking = from pool.
 */
export type BookingMode = 'direct' | 'draft_stock' | 'sub_from_stock';

/** Form value for booking type dropdown (maps to API BookingType) */
export const BookingModeFormValue: Record<BookingMode, string> = {
  direct: 'normal',
  draft_stock: 'empty_full',
  sub_from_stock: 'sub_from_empty_full',
};

/**
 * Stock booking: extends BookingModel with unit counts.
 * Used for Draft Stock (primary) and for displaying available stock.
 */
export interface StockBookingFields {
  TotalUnits: number;
  UsedUnits: number;
  RemainingUnits: number;
}

export type BookingModelWithStock = BookingModel & Partial<StockBookingFields>;

/** Result of validating a sub-booking request */
export interface ValidateRequestResult {
  valid: boolean;
  error?: string;
}

/** Request to create a primary (draft) stock booking */
export interface CreatePrimaryStockRequest {
  totalUnits: number;
  bookingReference?: string;
  checkInDate?: Date;
  checkOutDate?: Date;
  totalNights?: number;
  notes?: string;
  hotelID?: number;
}

/** Request to create a sub-reservation from stock */
export interface CreateSubReservationRequest {
  parentBookingId: number;
  requestedUnits: number;
  bookingReference?: string;
  checkInDate?: Date;
  checkOutDate?: Date;
  totalNights?: number;
  entityName?: string;
  notes?: string;
  roomTypes?: Array<{ roomTypeId: number; roomTypeName: string; quantity: number; actualSellingPrice?: number }>;
}
