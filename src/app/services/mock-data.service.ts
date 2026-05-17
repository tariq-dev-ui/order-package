import { Injectable, inject } from '@angular/core';
import { ActiveEstablishmentService } from '../core/establishment/active-establishment.service';
import { Observable, of, delay, throwError } from 'rxjs';
import { CreatePrimaryStockRequest, CreateSubReservationRequest } from '../models/booking-stock.model';
import {
  HotelModel,
  RoomModel,
  BookingModel,
  BookingModelPagedResult,
  BookingModelSystemResponse,
  HotelRoomTypeModel,
  RoomPricingModel,
  CustomerModel,
  OwnerModel,
  CreateBookingRequest,
  AssignRoomsRequest
} from './rms.api.client';
import { GlobalSearchHit } from '../models/global-search.model';
import { SIDEBAR_CONFIG } from '../layouts/full/vertical/sidebar/sidebar.config';
import { NavItem } from '../layouts/full/vertical/sidebar/nav-item/nav-item';
import type { SelectableHotelOption } from '../core/hotel-selector/hotel-selector.models';

/** حجز مع حقول المخزون (إجمالي/مستخدم/متبقي) */
type BookingWithStock = BookingModel & { TotalUnits?: number; UsedUnits?: number; RemainingUnits?: number };

export interface FloorModel {
  FloorID: number;
  FloorNumber: number;
  FloorName: string;
  FloorNameAr?: string;
  FloorNameEn?: string;
  Description?: string;
  TotalRooms?: number;
  AvailableRooms?: number;
  OccupiedRooms?: number;
  IsActive: boolean;
  CreatedAt?: Date;
  UpdatedAt?: Date;
}

export interface B2BEntityModel {
  EntityID?: number;
  EntityName?: string;
  EntityType?: string; // 'company' | 'travel_agency' | 'government' | 'corporate'
  ContactPerson?: string;
  Email?: string;
  Phone?: string;
  Address?: string;
  TaxNumber?: string;
  ContractStartDate?: Date;
  ContractEndDate?: Date;
  DiscountPercentage?: number;
  CreditLimit?: number;
  PaymentTerms?: string; // 'prepaid' | 'postpaid' | 'credit'
  /** الحساب الآجل المرتبط بالجهة (للاستخدام في القيود والفواتير) */
  DeferredAccountId?: string;
  IsActive?: boolean;
  CreatedAt?: Date;
  UpdatedAt?: Date;
}

export interface B2BBookingModel {
  BookingID?: number;
  EntityID?: number;
  EntityName?: string;
  BookingReference?: string;
  CheckInDate?: Date;
  CheckOutDate?: Date;
  CheckInTime?: string;
  CheckOutTime?: string;
  RoomTypeSelections?: B2BRoomTypeSelection[];
  TotalRooms?: number;
  TotalNights?: number;
  TotalAmount?: number;
  DiscountAmount?: number;
  FinalAmount?: number;
  Status?: string; // 'pending_assignment' | 'partially_assigned' | 'fully_assigned' | 'checked_in' | 'checked_out' | 'cancelled'
  Notes?: string;
  AssignedRooms?: AssignedRoom[];
  CreatedAt?: Date;
  UpdatedAt?: Date;
}

export interface B2BRoomTypeSelection {
  RoomTypeID?: number;
  RoomTypeName?: string;
  Quantity?: number;
  PricePerNight?: number;
  TotalPrice?: number;
}

export interface AssignedRoom {
  RoomID?: number;
  RoomNumber?: string;
  RoomTypeID?: number;
  GuestName?: string;
  GuestPhone?: string;
  AssignedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private readonly activeEstablishment = inject(ActiveEstablishmentService);

  /** بيانات الفندق المرجعية (est-1 / افتراضي) — يُشتق منها snapshot حسب المنشأة النشطة */
  private mockHotel: HotelModel = {
    HotelID: 1,
    HotelCode: 'HTL001',
    Name: 'فندق السلام',
    NameEn: 'Salam Hotel',
    CityID: 1,
    CountryID: 1,
    Address: 'شارع الملك فهد، الرياض',
    AddressEn: 'King Fahd Street, Riyadh',
    CityName: 'الرياض',
    CountryName: 'السعودية',
    LogoImageLocation: '/images/logos/logo.png',
    MainImageLocation: '/images/logos/logo5.png',
    IsActive: true,
    TotalRooms: 150,
    OccupancyRate: 75
  };

  // Mock Floors Data
  private mockFloors: FloorModel[] = [
    {
      FloorID: 1,
      FloorNumber: 1,
      FloorName: 'الطابق الأول',
      Description: 'طابق الأرضي يحتوي على الاستقبال والكافيه',
      TotalRooms: 25,
      AvailableRooms: 15,
      OccupiedRooms: 10,
      IsActive: true,
      CreatedAt: new Date('2024-01-01')
    },
    {
      FloorID: 2,
      FloorNumber: 2,
      FloorName: 'الطابق الثاني',
      Description: 'طابق الغرف القياسية',
      TotalRooms: 30,
      AvailableRooms: 20,
      OccupiedRooms: 10,
      IsActive: true,
      CreatedAt: new Date('2024-01-01')
    },
    {
      FloorID: 3,
      FloorNumber: 3,
      FloorName: 'الطابق الثالث',
      Description: 'طابق الغرف الفاخرة والأجنحة',
      TotalRooms: 20,
      AvailableRooms: 12,
      OccupiedRooms: 8,
      IsActive: true,
      CreatedAt: new Date('2024-01-01')
    },
    {
      FloorID: 4,
      FloorNumber: 4,
      FloorName: 'الطابق الرابع',
      Description: 'طابق الأجنحة الملكية',
      TotalRooms: 10,
      AvailableRooms: 5,
      OccupiedRooms: 5,
      IsActive: true,
      CreatedAt: new Date('2024-01-01')
    },
    {
      FloorID: 5,
      FloorNumber: 5,
      FloorName: 'الطابق الخامس',
      Description: 'طابق غرف عائلية',
      TotalRooms: 15,
      AvailableRooms: 10,
      OccupiedRooms: 5,
      IsActive: true,
      CreatedAt: new Date('2024-01-01')
    },
    {
      FloorID: 6,
      FloorNumber: 6,
      FloorName: 'الطابق السادس',
      Description: 'طابق غرف تنفيذية',
      TotalRooms: 12,
      AvailableRooms: 8,
      OccupiedRooms: 4,
      IsActive: true,
      CreatedAt: new Date('2024-01-01')
    }
  ];

  // Mock Rooms Data
  private mockRooms: RoomModel[] = [
    {
      RoomId: 1,
      HotelID: 1,
      FloorNumber: 1,
      RoomNumber: '101',
      RoomTypeId: 1,
      RoomTypeName: 'غرفة مفردة',
      PricePerNight: 500,
      MaxOccupancy: 2,
      IsActive: true,
      CreatedAt: new Date('2024-01-01'),
      AddedBy: 'admin'
    },
    {
      RoomId: 2,
      HotelID: 1,
      FloorNumber: 1,
      RoomNumber: '102',
      RoomTypeId: 1,
      RoomTypeName: 'غرفة مفردة',
      PricePerNight: 500,
      MaxOccupancy: 2,
      IsActive: true,
      CreatedAt: new Date('2024-01-01'),
      AddedBy: 'admin'
    },
    {
      RoomId: 3,
      HotelID: 1,
      FloorNumber: 2,
      RoomNumber: '201',
      RoomTypeId: 2,
      RoomTypeName: 'غرفة مزدوجة',
      PricePerNight: 800,
      MaxOccupancy: 4,
      IsActive: true,
      CreatedAt: new Date('2024-01-01'),
      AddedBy: 'admin'
    },
    {
      RoomId: 4,
      HotelID: 1,
      FloorNumber: 2,
      RoomNumber: '202',
      RoomTypeId: 2,
      RoomTypeName: 'غرفة مزدوجة',
      PricePerNight: 800,
      MaxOccupancy: 4,
      IsActive: true,
      CreatedAt: new Date('2024-01-01'),
      AddedBy: 'admin'
    },
    {
      RoomId: 5,
      HotelID: 1,
      FloorNumber: 3,
      RoomNumber: '301',
      RoomTypeId: 3,
      RoomTypeName: 'جناح',
      PricePerNight: 1500,
      MaxOccupancy: 6,
      IsActive: true,
      CreatedAt: new Date('2024-01-01'),
      AddedBy: 'admin'
    },
    { RoomId: 6, HotelID: 1, FloorNumber: 3, RoomNumber: '302', RoomTypeId: 3, RoomTypeName: 'جناح', PricePerNight: 1500, MaxOccupancy: 6, IsActive: true, CreatedAt: new Date('2024-01-01'), AddedBy: 'admin' },
    { RoomId: 7, HotelID: 1, FloorNumber: 4, RoomNumber: '401', RoomTypeId: 3, RoomTypeName: 'جناح', PricePerNight: 2000, MaxOccupancy: 6, IsActive: true, CreatedAt: new Date('2024-01-01'), AddedBy: 'admin' },
    { RoomId: 8, HotelID: 1, FloorNumber: 4, RoomNumber: '402', RoomTypeId: 3, RoomTypeName: 'جناح', PricePerNight: 2000, MaxOccupancy: 6, IsActive: true, CreatedAt: new Date('2024-01-01'), AddedBy: 'admin' },
    { RoomId: 9, HotelID: 1, FloorNumber: 4, RoomNumber: '403', RoomTypeId: 3, RoomTypeName: 'جناح', PricePerNight: 2000, MaxOccupancy: 6, IsActive: true, CreatedAt: new Date('2024-01-01'), AddedBy: 'admin' },
    { RoomId: 10, HotelID: 1, FloorNumber: 5, RoomNumber: '501', RoomTypeId: 2, RoomTypeName: 'غرفة مزدوجة', PricePerNight: 850, MaxOccupancy: 4, IsActive: true, CreatedAt: new Date('2024-01-01'), AddedBy: 'admin' },
    { RoomId: 11, HotelID: 1, FloorNumber: 5, RoomNumber: '502', RoomTypeId: 2, RoomTypeName: 'غرفة مزدوجة', PricePerNight: 850, MaxOccupancy: 4, IsActive: true, CreatedAt: new Date('2024-01-01'), AddedBy: 'admin' },
    { RoomId: 12, HotelID: 1, FloorNumber: 5, RoomNumber: '503', RoomTypeId: 2, RoomTypeName: 'غرفة مزدوجة', PricePerNight: 850, MaxOccupancy: 4, IsActive: true, CreatedAt: new Date('2024-01-01'), AddedBy: 'admin' },
    { RoomId: 13, HotelID: 1, FloorNumber: 5, RoomNumber: '504', RoomTypeId: 1, RoomTypeName: 'غرفة مفردة', PricePerNight: 520, MaxOccupancy: 2, IsActive: true, CreatedAt: new Date('2024-01-01'), AddedBy: 'admin' },
    { RoomId: 14, HotelID: 1, FloorNumber: 5, RoomNumber: '505', RoomTypeId: 1, RoomTypeName: 'غرفة مفردة', PricePerNight: 520, MaxOccupancy: 2, IsActive: true, CreatedAt: new Date('2024-01-01'), AddedBy: 'admin' },
    { RoomId: 15, HotelID: 1, FloorNumber: 6, RoomNumber: '601', RoomTypeId: 3, RoomTypeName: 'جناح', PricePerNight: 1800, MaxOccupancy: 6, IsActive: true, CreatedAt: new Date('2024-01-01'), AddedBy: 'admin' },
    { RoomId: 16, HotelID: 1, FloorNumber: 6, RoomNumber: '602', RoomTypeId: 3, RoomTypeName: 'جناح', PricePerNight: 1800, MaxOccupancy: 6, IsActive: true, CreatedAt: new Date('2024-01-01'), AddedBy: 'admin' },
    { RoomId: 17, HotelID: 1, FloorNumber: 6, RoomNumber: '603', RoomTypeId: 2, RoomTypeName: 'غرفة مزدوجة', PricePerNight: 900, MaxOccupancy: 4, IsActive: true, CreatedAt: new Date('2024-01-01'), AddedBy: 'admin' },
    { RoomId: 18, HotelID: 1, FloorNumber: 6, RoomNumber: '604', RoomTypeId: 2, RoomTypeName: 'غرفة مزدوجة', PricePerNight: 900, MaxOccupancy: 4, IsActive: true, CreatedAt: new Date('2024-01-01'), AddedBy: 'admin' },
    { RoomId: 19, HotelID: 1, FloorNumber: 1, RoomNumber: '103', RoomTypeId: 1, RoomTypeName: 'غرفة مفردة', PricePerNight: 500, MaxOccupancy: 2, IsActive: true, CreatedAt: new Date('2024-01-01'), AddedBy: 'admin' },
    { RoomId: 20, HotelID: 1, FloorNumber: 1, RoomNumber: '104', RoomTypeId: 2, RoomTypeName: 'غرفة مزدوجة', PricePerNight: 750, MaxOccupancy: 4, IsActive: true, CreatedAt: new Date('2024-01-01'), AddedBy: 'admin' }
  ];

  // Mock Room Types Data
  private mockRoomTypes: HotelRoomTypeModel[] = [
    {
      RoomTypeID: 1,
      RoomTypeCode: 'SGL',
      Title: 'غرفة مفردة',
      TitleEn: 'Single Room',
      Description: 'غرفة مفردة مع سرير واحد',
      DescriptionEn: 'Single room with one bed',
      ImageLocation: '/images/rooms/single.jpg',
      IsSharing: false,
      NoOfBeds: 1,
      IsActive: true
    },
    {
      RoomTypeID: 2,
      RoomTypeCode: 'DBL',
      Title: 'غرفة مزدوجة',
      TitleEn: 'Double Room',
      Description: 'غرفة مزدوجة مع سريرين',
      DescriptionEn: 'Double room with two beds',
      ImageLocation: '/images/rooms/double.jpg',
      IsSharing: false,
      NoOfBeds: 2,
      IsActive: true
    },
    {
      RoomTypeID: 3,
      RoomTypeCode: 'SUITE',
      Title: 'جناح',
      TitleEn: 'Suite',
      Description: 'جناح فاخر مع غرفة معيشة',
      DescriptionEn: 'Luxury suite with living room',
      ImageLocation: '/images/rooms/suite.jpg',
      IsSharing: false,
      NoOfBeds: 2,
      IsActive: true
    }
  ];

  // Mock Bookings Data
  private mockBookings: BookingModel[] = [
    {
      BookingID: 1,
      CustomerID: 1,
      HotelID: 1,
      BookingReference: 'BK001',
      CheckInDate: new Date(),
      CheckOutDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      TotalGuests: 2,
      Adults: 2,
      Children: 0,
      TotalAmount: 1000,
      PaidAmount: 500,
      StatusID: 1,
      StatusName: 'Confirmed',
      IsEmptyFullBooking: true,
      IsActive: true,
      CustomerName: 'أحمد محمد',
      CustomerEmail: 'ahmed@example.com',
      CustomerPhone: '+966501234567',
      TotalNights: 2,
      PendingAmount: 500,
      BookingDetails: [
        {
          BookingDetailID: 1,
          BookingID: 1,
          RoomTypeID: 1,
          Quantity: 1,
          Nights: 2,
          UnitSellingPrice: 500,
          Total: 1000,
          RoomTypeName: 'غرفة مفردة'
        }
      ],
      BookingRooms: [
        { BookingRoomID: 1, BookingID: 1, RoomID: 1, RoomNumber: '101', FloorNumber: 1 },
        { BookingRoomID: 2, BookingID: 1, RoomID: 2, RoomNumber: '102', FloorNumber: 1 },
        { BookingRoomID: 3, BookingID: 1, RoomID: 3, RoomNumber: '103', FloorNumber: 1 },
        { BookingRoomID: 4, BookingID: 1, RoomID: 4, RoomNumber: '201', FloorNumber: 2 },
        { BookingRoomID: 5, BookingID: 1, RoomID: 5, RoomNumber: '202', FloorNumber: 2 },
        { BookingRoomID: 6, BookingID: 1, RoomID: 6, RoomNumber: '301', FloorNumber: 3 }
      ],
      SubBookings: [
        {
          BookingID: 101,
          ParentBookingID: 1,
          BookingReference: 'SUB-BK001-1',
          CustomerName: 'محمد حسن عامر',
          CustomerPhone: '+966502345678',
          CheckInDate: new Date(),
          CheckOutDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          TotalNights: 1,
          TotalAmount: 450,
          DiscountAmount: 45,
          StatusID: 1,
          StatusName: 'Confirmed',
          IsEmptyFullBooking: false,
          BookingSource: 'مباشر',
          BookingTypeName: 'فردي',
        },
        {
          BookingID: 102,
          ParentBookingID: 1,
          BookingReference: 'SUB-BK001-2',
          CustomerName: 'فاطمة أحمد حسن',
          CustomerPhone: '+966504567890',
          CheckInDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
          CheckOutDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          TotalNights: 1,
          TotalAmount: 500,
          DiscountAmount: 0,
          StatusID: 2,
          StatusName: 'Checked In',
          IsEmptyFullBooking: false,
          BookingSource: 'وكالة سفر',
          BookingTypeName: 'عائلي',
        },
      ]
    },
    {
      BookingID: 2,
      CustomerID: 2,
      HotelID: 1,
      BookingReference: 'BK002',
      CheckInDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      CheckOutDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      TotalGuests: 4,
      Adults: 2,
      Children: 2,
      TotalAmount: 2400,
      PaidAmount: 2400,
      StatusID: 2,
      StatusName: 'Checked In',
      IsEmptyFullBooking: true,
      IsActive: true,
      CustomerName: 'فاطمة علي',
      CustomerEmail: 'fatima@example.com',
      CustomerPhone: '+966507654321',
      TotalNights: 2,
      PendingAmount: 0,
      BookingDetails: [
        {
          BookingDetailID: 2,
          BookingID: 2,
          RoomTypeID: 2,
          Quantity: 1,
          Nights: 2,
          UnitSellingPrice: 800,
          Total: 2400,
          RoomTypeName: 'غرفة مزدوجة'
        }
      ],
      BookingRooms: [
        { BookingRoomID: 2, BookingID: 2, RoomID: 3, RoomNumber: '201', FloorNumber: 2 },
        { BookingRoomID: 7, BookingID: 2, RoomID: 7, RoomNumber: '202', FloorNumber: 2 },
        { BookingRoomID: 8, BookingID: 2, RoomID: 8, RoomNumber: '102', FloorNumber: 1 }
      ],
      SubBookings: []
    },
    {
      BookingID: 3,
      CustomerID: 3,
      HotelID: 1,
      BookingReference: 'BK003',
      CheckInDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      CheckOutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      TotalGuests: 6,
      Adults: 4,
      Children: 2,
      TotalAmount: 3000,
      PaidAmount: 0,
      StatusID: 3,
      StatusName: 'Pending',
      IsEmptyFullBooking: true,
      IsDelegateBooking: true,
      IsActive: true,
      CustomerName: 'خالد إبراهيم',
      CustomerEmail: 'khalid@example.com',
      CustomerPhone: '+966509876543',
      TotalNights: 2,
      PendingAmount: 3000,
      BookingDetails: [
        {
          BookingDetailID: 3,
          BookingID: 3,
          RoomTypeID: 3,
          Quantity: 1,
          Nights: 2,
          UnitSellingPrice: 1500,
          Total: 3000,
          RoomTypeName: 'جناح'
        }
      ],
      BookingRooms: [
        { BookingRoomID: 9, BookingID: 3, RoomID: 9, RoomNumber: '301', FloorNumber: 3 },
        { BookingRoomID: 10, BookingID: 3, RoomID: 10, RoomNumber: '302', FloorNumber: 3 },
        { BookingRoomID: 11, BookingID: 3, RoomID: 11, RoomNumber: '401', FloorNumber: 4 }
      ],
      SubBookings: []
    },
    {
      BookingID: 4,
      CustomerID: 1,
      HotelID: 1,
      BookingReference: 'BK004',
      CheckInDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      CheckOutDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      TotalGuests: 2,
      Adults: 2,
      Children: 0,
      TotalAmount: 1000,
      PaidAmount: 1000,
      StatusID: 1,
      StatusName: 'Confirmed',
      IsEmptyFullBooking: true,
      IsActive: true,
      CustomerName: 'أحمد محمد',
      CustomerEmail: 'ahmed@example.com',
      CustomerPhone: '+966501234567',
      TotalNights: 2,
      PendingAmount: 0,
      BookingDetails: [
        {
          BookingDetailID: 4,
          BookingID: 4,
          RoomTypeID: 1,
          Quantity: 1,
          Nights: 2,
          UnitSellingPrice: 500,
          Total: 1000,
          RoomTypeName: 'غرفة مفردة'
        }
      ],
      BookingRooms: [
        { BookingRoomID: 4, BookingID: 4, RoomID: 2, RoomNumber: '102', FloorNumber: 1 },
        { BookingRoomID: 12, BookingID: 4, RoomID: 12, RoomNumber: '103', FloorNumber: 1 },
        { BookingRoomID: 13, BookingID: 4, RoomID: 13, RoomNumber: '203', FloorNumber: 2 }
      ],
      SubBookings: []
    },
    {
      BookingID: 5,
      CustomerID: 2,
      HotelID: 1,
      BookingReference: 'BK005',
      CheckInDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      CheckOutDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      TotalGuests: 4,
      Adults: 2,
      Children: 2,
      TotalAmount: 2400,
      PaidAmount: 1200,
      StatusID: 2,
      StatusName: 'Checked In',
      IsActive: true,
      CustomerName: 'فاطمة علي',
      CustomerEmail: 'fatima@example.com',
      CustomerPhone: '+966507654321',
      TotalNights: 4,
      PendingAmount: 1200,
      BookingDetails: [
        {
          BookingDetailID: 5,
          BookingID: 5,
          RoomTypeID: 2,
          Quantity: 1,
          Nights: 4,
          UnitSellingPrice: 800,
          Total: 2400,
          RoomTypeName: 'غرفة مزدوجة'
        }
      ],
      BookingRooms: [
        { BookingRoomID: 5, BookingID: 5, RoomID: 4, RoomNumber: '202', FloorNumber: 2 },
        { BookingRoomID: 14, BookingID: 5, RoomID: 14, RoomNumber: '203', FloorNumber: 2 },
        { BookingRoomID: 15, BookingID: 5, RoomID: 15, RoomNumber: '101', FloorNumber: 1 }
      ]
    },
    {
      BookingID: 6,
      CustomerID: 3,
      HotelID: 1,
      BookingReference: 'BK006',
      CheckInDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      CheckOutDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      TotalGuests: 2,
      Adults: 2,
      Children: 0,
      TotalAmount: 1000,
      PaidAmount: 1000,
      StatusID: 4,
      StatusName: 'Checked Out',
      CustomerName: 'خالد إبراهيم',
      CustomerEmail: 'khalid@example.com',
      CustomerPhone: '+966509876543',
      TotalNights: 2,
      PendingAmount: 0,
      IsActive: false,
      BookingDetails: [
        {
          BookingDetailID: 6,
          BookingID: 6,
          RoomTypeID: 1,
          Quantity: 1,
          Nights: 2,
          UnitSellingPrice: 500,
          Total: 1000,
          RoomTypeName: 'غرفة مفردة'
        }
      ],
      BookingRooms: [
        {
          BookingRoomID: 6,
          BookingID: 6,
          RoomID: 1,
          RoomNumber: '101',
          FloorNumber: 1
        }
      ]
    },
    {
      BookingID: 7,
      CustomerID: 1,
      HotelID: 1,
      BookingReference: 'BK007',
      CheckInDate: new Date(),
      CheckOutDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      TotalGuests: 2,
      Adults: 2,
      Children: 0,
      TotalAmount: 800,
      PaidAmount: 400,
      StatusID: 1,
      StatusName: 'Confirmed',
      IsEmptyFullBooking: false,
      IsActive: true,
      CustomerName: 'أحمد محمد',
      CustomerEmail: 'ahmed@example.com',
      CustomerPhone: '+966501234567',
      TotalNights: 1,
      PendingAmount: 400,
      BookingDetails: [{ BookingDetailID: 7, BookingID: 7, RoomTypeID: 1, Quantity: 1, Nights: 1, UnitSellingPrice: 800, Total: 800, RoomTypeName: 'غرفة مفردة' }],
      BookingRooms: [{ BookingRoomID: 16, BookingID: 7, RoomID: 5, RoomNumber: '103', FloorNumber: 1 }],
      SubBookings: []
    },
    {
      BookingID: 8,
      CustomerID: 2,
      HotelID: 1,
      BookingReference: 'BK008',
      CheckInDate: new Date(),
      CheckOutDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      TotalGuests: 2,
      Adults: 2,
      Children: 0,
      TotalAmount: 1200,
      PaidAmount: 1200,
      StatusID: 2,
      StatusName: 'Checked In',
      IsEmptyFullBooking: false,
      IsActive: true,
      CustomerName: 'فاطمة علي',
      CustomerEmail: 'fatima@example.com',
      CustomerPhone: '+966507654321',
      TotalNights: 2,
      PendingAmount: 0,
      BookingDetails: [{ BookingDetailID: 8, BookingID: 8, RoomTypeID: 2, Quantity: 1, Nights: 2, UnitSellingPrice: 600, Total: 1200, RoomTypeName: 'غرفة مزدوجة' }],
      BookingRooms: [{ BookingRoomID: 17, BookingID: 8, RoomID: 6, RoomNumber: '104', FloorNumber: 1 }],
      SubBookings: []
    },
    {
      BookingID: 9,
      CustomerID: 3,
      HotelID: 1,
      BookingReference: 'BK009',
      CheckInDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      CheckOutDate: new Date(),
      TotalGuests: 3,
      Adults: 2,
      Children: 1,
      TotalAmount: 900,
      PaidAmount: 900,
      StatusID: 2,
      StatusName: 'Checked In',
      IsEmptyFullBooking: false,
      IsActive: true,
      CustomerName: 'خالد إبراهيم',
      CustomerEmail: 'khalid@example.com',
      CustomerPhone: '+966509876543',
      TotalNights: 1,
      PendingAmount: 0,
      BookingDetails: [{ BookingDetailID: 9, BookingID: 9, RoomTypeID: 1, Quantity: 1, Nights: 1, UnitSellingPrice: 900, Total: 900, RoomTypeName: 'غرفة مفردة' }],
      BookingRooms: [{ BookingRoomID: 18, BookingID: 9, RoomID: 7, RoomNumber: '105', FloorNumber: 1 }],
      SubBookings: []
    },
    {
      BookingID: 10,
      CustomerID: 1,
      HotelID: 1,
      BookingReference: 'BK010',
      CheckInDate: new Date(),
      CheckOutDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      TotalGuests: 4,
      Adults: 2,
      Children: 2,
      TotalAmount: 1800,
      PaidAmount: 0,
      StatusID: 1,
      StatusName: 'Confirmed',
      IsEmptyFullBooking: false,
      IsActive: true,
      CustomerName: 'أحمد محمد',
      CustomerEmail: 'ahmed@example.com',
      CustomerPhone: '+966501234567',
      TotalNights: 3,
      PendingAmount: 1800,
      BookingDetails: [{ BookingDetailID: 10, BookingID: 10, RoomTypeID: 2, Quantity: 1, Nights: 3, UnitSellingPrice: 600, Total: 1800, RoomTypeName: 'غرفة مزدوجة' }],
      BookingRooms: [{ BookingRoomID: 19, BookingID: 10, RoomID: 8, RoomNumber: '204', FloorNumber: 2 }],
      SubBookings: []
    },
    {
      BookingID: 11,
      CustomerID: 2,
      HotelID: 1,
      BookingReference: 'BK011',
      CheckInDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      CheckOutDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      TotalGuests: 2,
      Adults: 2,
      Children: 0,
      TotalAmount: 1500,
      PaidAmount: 1500,
      StatusID: 2,
      StatusName: 'Checked In',
      IsEmptyFullBooking: false,
      IsActive: true,
      CustomerName: 'فاطمة علي',
      CustomerEmail: 'fatima@example.com',
      CustomerPhone: '+966507654321',
      TotalNights: 3,
      PendingAmount: 0,
      BookingDetails: [{ BookingDetailID: 11, BookingID: 11, RoomTypeID: 1, Quantity: 1, Nights: 3, UnitSellingPrice: 500, Total: 1500, RoomTypeName: 'غرفة مفردة' }],
      BookingRooms: [{ BookingRoomID: 20, BookingID: 11, RoomID: 9, RoomNumber: '205', FloorNumber: 2 }],
      SubBookings: []
    }
  ];

  // Mock Customers Data
  private mockCustomers: CustomerModel[] = [
    {
      CustomerID: 1,
      HotelID: 1,
      Name: 'أحمد محمد',
      Email: 'ahmed@example.com',
      Phone: '+966501234567',
      Address: 'الرياض، المملكة العربية السعودية',
      CountryID: 1,
      CityID: 1,
      IsActive: true,
      CreatedAt: new Date('2024-01-01')
    },
    {
      CustomerID: 2,
      HotelID: 1,
      Name: 'فاطمة علي',
      Email: 'fatima@example.com',
      Phone: '+966507654321',
      Address: 'جدة، المملكة العربية السعودية',
      CountryID: 1,
      CityID: 2,
      IsActive: true,
      CreatedAt: new Date('2024-01-02')
    },
    {
      CustomerID: 3,
      HotelID: 1,
      Name: 'خالد إبراهيم',
      Email: 'khalid@example.com',
      Phone: '+966509876543',
      Address: 'الدمام، المملكة العربية السعودية',
      CountryID: 1,
      CityID: 3,
      IsActive: true,
      CreatedAt: new Date('2024-01-03')
    }
  ];

  // Mock Owners Data
  private mockOwners: OwnerModel[] = [
    {
      OwnerID: 1,
      HotelID: 1,
      Name: 'شركة الفنادق الوطنية',
      Email: 'info@nationalhotels.com',
      Phone: '+966112345678',
      Address: 'الرياض، المملكة العربية السعودية',
      CountryID: 1,
      CityID: 1,
      IsActive: true,
      CreatedAt: new Date('2024-01-01')
    }
  ];

  // Mock B2B Entities Data
  private mockB2BEntities: B2BEntityModel[] = [
    {
      EntityID: 1,
      EntityName: 'شركة الرياض للسياحة',
      EntityType: 'travel_agency',
      ContactPerson: 'محمد العتيبي',
      Email: 'info@riyadhtourism.com',
      Phone: '+966112223344',
      Address: 'الرياض، حي العليا، شارع التحلية',
      TaxNumber: '300123456789012',
      ContractStartDate: new Date('2024-01-01'),
      ContractEndDate: new Date('2025-12-31'),
      DiscountPercentage: 15,
      CreditLimit: 100000,
      PaymentTerms: 'credit',
      IsActive: true,
      CreatedAt: new Date('2024-01-01')
    },
    {
      EntityID: 2,
      EntityName: 'مجموعة الفهد التجارية',
      EntityType: 'corporate',
      ContactPerson: 'عبدالله الفهد',
      Email: 'corporate@alfahad.com',
      Phone: '+966113334455',
      Address: 'جدة، حي الروضة',
      TaxNumber: '300987654321098',
      ContractStartDate: new Date('2024-03-01'),
      ContractEndDate: new Date('2025-02-28'),
      DiscountPercentage: 10,
      CreditLimit: 50000,
      PaymentTerms: 'postpaid',
      IsActive: true,
      CreatedAt: new Date('2024-03-01')
    },
    {
      EntityID: 3,
      EntityName: 'وزارة الصحة',
      EntityType: 'government',
      ContactPerson: 'سعود الدوسري',
      Email: 'booking@moh.gov.sa',
      Phone: '+966114445566',
      Address: 'الرياض، حي الملز',
      TaxNumber: '300111222333444',
      ContractStartDate: new Date('2024-01-01'),
      ContractEndDate: new Date('2024-12-31'),
      DiscountPercentage: 20,
      CreditLimit: 200000,
      PaymentTerms: 'postpaid',
      IsActive: true,
      CreatedAt: new Date('2024-01-01')
    },
    {
      EntityID: 4,
      EntityName: 'شركة أرامكو السعودية',
      EntityType: 'company',
      ContactPerson: 'خالد السبيعي',
      Email: 'travel@aramco.com',
      Phone: '+966115556677',
      Address: 'الظهران، المنطقة الشرقية',
      TaxNumber: '300555666777888',
      ContractStartDate: new Date('2024-06-01'),
      ContractEndDate: new Date('2025-05-31'),
      DiscountPercentage: 12,
      CreditLimit: 500000,
      PaymentTerms: 'credit',
      IsActive: true,
      CreatedAt: new Date('2024-06-01')
    },
    {
      EntityID: 5,
      EntityName: 'وكالة المسافر للسفر والسياحة',
      EntityType: 'travel_agency',
      ContactPerson: 'فهد الحربي',
      Email: 'reservations@almosafer.sa',
      Phone: '+966116667788',
      Address: 'الدمام، حي الفيصلية',
      TaxNumber: '300666777888999',
      ContractStartDate: new Date('2024-02-01'),
      ContractEndDate: new Date('2025-01-31'),
      DiscountPercentage: 18,
      CreditLimit: 75000,
      PaymentTerms: 'prepaid',
      IsActive: true,
      CreatedAt: new Date('2024-02-01')
    }
  ];

  // Mock B2B Bookings Data
  private mockB2BBookings: B2BBookingModel[] = [
    {
      BookingID: 101,
      EntityID: 1,
      EntityName: 'شركة الرياض للسياحة',
      BookingReference: 'B2B001234001',
      CheckInDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      CheckOutDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      CheckInTime: '14:00',
      CheckOutTime: '12:00',
      RoomTypeSelections: [
        { RoomTypeID: 1, RoomTypeName: 'غرفة مفردة', Quantity: 5, PricePerNight: 425, TotalPrice: 6375 },
        { RoomTypeID: 2, RoomTypeName: 'غرفة مزدوجة', Quantity: 3, PricePerNight: 680, TotalPrice: 6120 }
      ],
      TotalRooms: 8,
      TotalNights: 3,
      TotalAmount: 12495,
      DiscountAmount: 1874.25,
      FinalAmount: 10620.75,
      Status: 'pending_assignment',
      Notes: 'مجموعة سياحية من الخليج',
      AssignedRooms: [],
      CreatedAt: new Date()
    },
    {
      BookingID: 102,
      EntityID: 3,
      EntityName: 'وزارة الصحة',
      BookingReference: 'B2B001234002',
      CheckInDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      CheckOutDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
      CheckInTime: '14:00',
      CheckOutTime: '12:00',
      RoomTypeSelections: [
        { RoomTypeID: 2, RoomTypeName: 'غرفة مزدوجة', Quantity: 10, PricePerNight: 640, TotalPrice: 19200 }
      ],
      TotalRooms: 10,
      TotalNights: 3,
      TotalAmount: 19200,
      DiscountAmount: 3840,
      FinalAmount: 15360,
      Status: 'partially_assigned',
      Notes: 'فريق طبي لمؤتمر',
      AssignedRooms: [
        { RoomID: 3, RoomNumber: '201', RoomTypeID: 2, GuestName: 'د. أحمد محمود', GuestPhone: '+966501112233', AssignedAt: new Date() },
        { RoomID: 4, RoomNumber: '202', RoomTypeID: 2, GuestName: 'د. سارة العمري', GuestPhone: '+966502223344', AssignedAt: new Date() }
      ],
      CreatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      BookingID: 103,
      EntityID: 4,
      EntityName: 'شركة أرامكو السعودية',
      BookingReference: 'B2B001234003',
      CheckInDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      CheckOutDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      CheckInTime: '14:00',
      CheckOutTime: '12:00',
      RoomTypeSelections: [
        { RoomTypeID: 3, RoomTypeName: 'جناح', Quantity: 2, PricePerNight: 1200, TotalPrice: 7200 }
      ],
      TotalRooms: 2,
      TotalNights: 3,
      TotalAmount: 7200,
      DiscountAmount: 864,
      FinalAmount: 6336,
      Status: 'checked_out',
      Notes: 'زيارة وفد هندسي',
      AssignedRooms: [
        { RoomID: 5, RoomNumber: '301', RoomTypeID: 3, GuestName: 'م. خالد السبيعي', GuestPhone: '+966505556677', AssignedAt: new Date() },
        { RoomID: 6, RoomNumber: '302', RoomTypeID: 3, GuestName: 'م. فهد السعد', GuestPhone: '+966505556688', AssignedAt: new Date() }
      ],
      CreatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    },
    {
      BookingID: 104,
      EntityID: 5,
      EntityName: 'وكالة المسافر للسفر والسياحة',
      BookingReference: 'B2B001234004',
      CheckInDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      CheckOutDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
      CheckInTime: '14:00',
      CheckOutTime: '12:00',
      RoomTypeSelections: [
        { RoomTypeID: 1, RoomTypeName: 'غرفة مفردة', Quantity: 10, PricePerNight: 400, TotalPrice: 20000 }
      ],
      TotalRooms: 10,
      TotalNights: 5,
      TotalAmount: 20000,
      DiscountAmount: 3600,
      FinalAmount: 16400,
      Status: 'fully_assigned',
      Notes: 'حجز مؤتمر تقني',
      AssignedRooms: Array.from({ length: 10 }, (_, i) => ({
        RoomID: 10 + i,
        RoomNumber: (110 + i).toString(),
        RoomTypeID: 1,
        GuestName: `ضيف ${i + 1}`,
        AssignedAt: new Date()
      })),
      CreatedAt: new Date()
    }
  ];

  // Mock Pricing Data
  private mockPricings: RoomPricingModel[] = [
    {
      PricingId: 1,
      HotelID: 1,
      RoomTypeID: 1,
      CostPrice: 300,
      SellingPrice: 500,
      StartDate: new Date('2024-01-01'),
      EndDate: new Date('2024-12-31'),
      IsActive: true,
      CreatedAt: new Date('2024-01-01')
    },
    {
      PricingId: 2,
      HotelID: 1,
      RoomTypeID: 2,
      CostPrice: 500,
      SellingPrice: 800,
      StartDate: new Date('2024-01-01'),
      EndDate: new Date('2024-12-31'),
      IsActive: true,
      CreatedAt: new Date('2024-01-01')
    },
    {
      PricingId: 3,
      HotelID: 1,
      RoomTypeID: 3,
      CostPrice: 1000,
      SellingPrice: 1500,
      StartDate: new Date('2024-01-01'),
      EndDate: new Date('2024-12-31'),
      IsActive: true,
      CreatedAt: new Date('2024-01-01')
    }
  ];

  // ========== RMS API Methods ==========

  /**
   * معلومات الفندق للعرض في الشريط والداشبورد وغيرهما — حسب المنشأة النشطة (mock).
   */
  getHotelInfo(): Observable<HotelModel> {
    return of(this.hotelSnapshotForActiveEstablishment()).pipe(delay(300));
  }

  /**
   * فنادق/منشآت يمكن للمستخدم العمل عليها بعد تسجيل الدخول (وهمي — استبدل بـ API).
   * - اسم المستخدم يحتوي `nohotel` أو `zero`: لا منشآت.
   * - يحتوي `single`: منشأة واحدة فقط (تُختار تلقائياً).
   * - غير ذلك: عدة منشآت (نافذة اختيار إلزامية).
   */
  getAccessibleHotelsForUser(username: string): Observable<SelectableHotelOption[]> {
    const u = (username || '').toLowerCase();
    let list: SelectableHotelOption[];
    if (u.includes('nohotel') || u.includes('zero')) {
      list = [];
    } else if (u.includes('single')) {
      list = [
        {
          id: 'est-1',
          name: 'فندق السلام',
          nameEn: 'Salam Hotel',
          city: 'الرياض',
          logoUrl: '/images/logos/logo.png',
          isActive: true,
        },
      ];
    } else {
      list = [
        {
          id: 'est-1',
          name: 'فندق السلام',
          nameEn: 'Salam Hotel',
          city: 'الرياض',
          logoUrl: '/images/logos/logo.png',
          isActive: true,
        },
        {
          id: 'est-2',
          name: 'فندق الواحة',
          nameEn: 'Oasis Hotel',
          city: 'جدة',
          logoUrl: '/images/logos/logo5.png',
          isActive: true,
        },
        {
          id: 'est-3',
          name: 'فندق الأندلس',
          nameEn: 'Andalus Hotel',
          city: 'مكة المكرمة',
          logoUrl: null,
          isActive: false,
        },
      ];
    }
    return of(list).pipe(delay(520));
  }

  /** نسخة HotelModel متوافقة مع `ActiveEstablishmentService.selectedId` وقائمة الملف الشخصي */
  hotelSnapshotForActiveEstablishment(): HotelModel {
    const id = this.activeEstablishment.selectedId();
    const b = this.mockHotel;
    switch (id) {
      case 'est-2':
        return {
          ...b,
          HotelID: 2,
          HotelCode: 'HTL002',
          Name: 'فندق الواحة',
          NameEn: 'Oasis Hotel',
          CityName: 'جدة',
          Address: 'طريق الكورنيش، جدة',
          AddressEn: 'Corniche Road, Jeddah',
          TotalRooms: 220,
          OccupancyRate: 68,
        };
      case 'est-3':
        return {
          ...b,
          HotelID: 3,
          HotelCode: 'HTL003',
          Name: 'فندق الأندلس',
          NameEn: 'Andalus Hotel',
          CityName: 'مكة المكرمة',
          Address: 'حي العزيزية، مكة المكرمة',
          AddressEn: 'Al Aziziyah, Makkah',
          TotalRooms: 180,
          OccupancyRate: 82,
        };
      default:
        return { ...b };
    }
  }

  getRooms(props?: { ownerID?: number; isActive?: boolean; roomTypeID?: number; floorNumber?: number }): Observable<RoomModel[]> {
    let filteredRooms = [...this.mockRooms];

    if (props?.isActive !== undefined) {
      filteredRooms = filteredRooms.filter(r => r.IsActive === props.isActive);
    }
    if (props?.roomTypeID !== undefined) {
      filteredRooms = filteredRooms.filter(r => r.RoomTypeId === props.roomTypeID);
    }
    if (props?.floorNumber !== undefined) {
      filteredRooms = filteredRooms.filter(r => r.FloorNumber === props.floorNumber);
    }
    if (props?.ownerID !== undefined) {
      filteredRooms = filteredRooms.filter(r => r.OwnerID === props.ownerID);
    }

    return of(filteredRooms).pipe(delay(300));
  }

  getRoomTypes(): Observable<HotelRoomTypeModel[]> {
    return of(this.mockRoomTypes).pipe(delay(300));
  }

  /** نزلاء النظام (لاختيار نزيل موجود عند إضافة حجز فرعي أو غيره) */
  getSystemGuests(): Observable<{ id: string; name: string; idNumber?: string; phone?: string; nationality?: string }[]> {
    const list = this.mockSystemGuests.map(g => ({
      id: String(g.id),
      name: g.name,
      idNumber: g.idNumber,
      phone: g.phone,
      nationality: g.nationality,
    }));
    return of(list).pipe(delay(200));
  }

  private readonly mockSystemGuests: { id: number; name: string; idNumber: string; phone: string; nationality: string }[] = [
    { id: 101, name: 'أحمد محمود علي', idNumber: '1234567890', phone: '0501234567', nationality: 'السعودية' },
    { id: 102, name: 'محمد حسن عامر', idNumber: '2345678901', phone: '0502345678', nationality: 'مصر' },
    { id: 103, name: 'عبدالله خالد سعد', idNumber: '3456789012', phone: '0503456789', nationality: 'السعودية' },
    { id: 104, name: 'فاطمة أحمد حسن', idNumber: '4567890123', phone: '0504567890', nationality: 'السعودية' },
    { id: 105, name: 'سارة محمود علي', idNumber: '5678901234', phone: '0505678901', nationality: 'مصر' },
    { id: 106, name: 'ياسر محمد فهد', idNumber: '6789012345', phone: '0506789012', nationality: 'السعودية' },
    { id: 107, name: 'ليلى إبراهيم الخالدي', idNumber: '7890123456', phone: '0507890123', nationality: 'السعودية' },
    { id: 108, name: 'خالد يوسف الصبحي', idNumber: '8901234567', phone: '0508901234', nationality: 'السعودية' },
    { id: 109, name: 'نورة عادل القحطاني', idNumber: '9012345678', phone: '0509012345', nationality: 'السعودية' },
    { id: 110, name: 'عمر ياسين الجمال', idNumber: '0123456789', phone: '0510123456', nationality: 'الأردن' },
    { id: 111, name: 'هند ناصر الزهراني', idNumber: '1122334455', phone: '0511223344', nationality: 'السعودية' },
    { id: 112, name: 'باسم كمال الحسيني', idNumber: '2233445566', phone: '0522334455', nationality: 'مصر' },
    { id: 113, name: 'ريم فيصل العصيمي', idNumber: '3344556677', phone: '0533445566', nationality: 'السعودية' },
    { id: 114, name: 'سعيد مروان البكري', idNumber: '4455667788', phone: '0544556677', nationality: 'الكويت' },
    { id: 115, name: 'أمل كامل الشريف', idNumber: '5566778899', phone: '0555667788', nationality: 'السعودية' },
    { id: 116, name: 'منال فهد الحربي', idNumber: '6677889900', phone: '0566778899', nationality: 'السعودية' },
    { id: 117, name: 'زياد جابر اليافعي', idNumber: '7788990011', phone: '0577889900', nationality: 'اليمن' },
    { id: 118, name: 'مريم حامد الهذلي', idNumber: '8899001122', phone: '0588990011', nationality: 'السعودية' },
    { id: 119, name: 'سلطان رائد العتيبي', idNumber: '9900112233', phone: '0599001122', nationality: 'السعودية' },
    { id: 120, name: 'حنان ماجد الرشيدي', idNumber: '1011121314', phone: '0501121314', nationality: 'السعودية' },
    { id: 121, name: 'طارق عزيز المصري', idNumber: '1516171819', phone: '0515161718', nationality: 'مصر' },
    { id: 122, name: 'نجلاء سليمان الجهني', idNumber: '2021222324', phone: '0520212223', nationality: 'السعودية' },
    { id: 123, name: 'فيصل نواف الشمري', idNumber: '2526272829', phone: '0525262728', nationality: 'السعودية' },
    { id: 124, name: 'لمياء خالد العبدلي', idNumber: '3031323334', phone: '0530313233', nationality: 'السعودية' },
    { id: 125, name: 'سامي منصور العمري', idNumber: '3536373839', phone: '0535363738', nationality: 'السعودية' },
  ];

  getBookings(props?: {
    checkInFrom?: Date;
    checkInTo?: Date;
    isActive?: boolean;
    statusID?: number;
    customerID?: number;
    ownerID?: number;
    pageIndex?: number;
    pageSize?: number;
  }): Observable<BookingModelPagedResult> {
    let filteredBookings = [...this.mockBookings];

    if (props?.checkInFrom) {
      filteredBookings = filteredBookings.filter(b =>
        b.CheckInDate && new Date(b.CheckInDate) >= props.checkInFrom!
      );
    }
    if (props?.checkInTo) {
      filteredBookings = filteredBookings.filter(b =>
        b.CheckInDate && new Date(b.CheckInDate) <= props.checkInTo!
      );
    }
    if (props?.isActive !== undefined) {
      filteredBookings = filteredBookings.filter(b => b.IsActive === props.isActive);
    }
    if (props?.statusID !== undefined) {
      filteredBookings = filteredBookings.filter(b => b.StatusID === props.statusID);
    }
    if (props?.customerID !== undefined) {
      filteredBookings = filteredBookings.filter(b => b.CustomerID === props.customerID);
    }
    if (props?.ownerID !== undefined) {
      filteredBookings = filteredBookings.filter(b => b.OwnerID === props.ownerID);
    }

    // Pagination
    const pageIndex = props?.pageIndex ?? 0;
    const pageSize = props?.pageSize ?? 10;
    const totalCount = filteredBookings.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    const pagedBookings = filteredBookings.slice(startIndex, endIndex);

    return of({
      Data: pagedBookings,
      IsSuccess: true,
      Message: null,
      Paging: {
        CurrentPage: pageIndex + 1,
        PageSize: pageSize,
        TotalCount: totalCount,
        TotalPages: totalPages,
        HasPrevious: pageIndex > 0,
        HasNext: pageIndex < totalPages - 1
      }
    }).pipe(delay(300));
  }

  createBooking(props?: { body?: CreateBookingRequest }): Observable<BookingModelSystemResponse> {
    const body = props?.body;
    if (!body) {
      return of({
        IsSuccess: false,
        Message: 'بيانات الحجز مطلوبة',
        ReturnedValue: undefined
      }).pipe(delay(500));
    }

    const newBooking: BookingModel = {
      BookingID: this.mockBookings.length + 1,
      CustomerID: body.CustomerID,
      HotelID: body.HotelID || 1,
      BookingReference: `BK${String(this.mockBookings.length + 1).padStart(3, '0')}`,
      CheckInDate: body.CheckInDate,
      CheckOutDate: body.CheckOutDate,
      TotalGuests: (body.Adults || 0) + (body.Children || 0),
      Adults: body.Adults,
      Children: body.Children,
      TotalAmount: 0,
      PaidAmount: 0,
      StatusID: 3,
      StatusName: 'Pending',
      Notes: body.Notes,
      SpecialRequests: body.SpecialRequests,
      IsActive: true,
      CreatedAt: new Date(),
      AddedBy: body.AddedBy || 'admin'
    };

    this.mockBookings.push(newBooking);

    return of({
      IsSuccess: true,
      Message: 'تم إنشاء الحجز بنجاح',
      ReturnedValue: newBooking
    }).pipe(delay(500));
  }

  /** إنشاء حجز فاضي مليان: يُخزّن كل البيانات المختارة وقت الحجز لظهورها في القائمة والتفاصيل */
  createEmptyFullBooking(props?: { body?: Partial<BookingModel> }): Observable<BookingModelSystemResponse> {
    const body = props?.body;
    if (!body) {
      return of({
        IsSuccess: false,
        Message: 'بيانات الحجز مطلوبة',
        ReturnedValue: undefined
      }).pipe(delay(500));
    }

    const nextId = this.mockBookings.length + 1;
    const newBooking: BookingModel = {
      BookingID: nextId,
      HotelID: body.HotelID ?? 1,
      BookingReference: body.BookingReference ?? `EF${String(nextId).padStart(6, '0')}`,
      CheckInDate: body.CheckInDate,
      CheckOutDate: body.CheckOutDate,
      CustomerName: body.CustomerName ?? undefined,
      CustomerEmail: body.CustomerEmail ?? undefined,
      CustomerPhone: body.CustomerPhone ?? undefined,
      TotalNights: body.TotalNights ?? 0,
      TotalAmount: body.TotalAmount ?? 0,
      PaidAmount: body.PaidAmount ?? 0,
      PendingAmount: (body.TotalAmount ?? 0) - (body.PaidAmount ?? 0),
      StatusID: body.StatusID ?? 0,
      StatusName: body.StatusName ?? 'قيد الانتظار',
      Notes: body.Notes ?? undefined,
      BookingSource: body.BookingSource ?? undefined,
      IsEmptyFullBooking: true,
      ParentBookingID: body.ParentBookingID ?? null,
      SubBookings: body.SubBookings ?? [],
      BookingRooms: body.BookingRooms ?? [],
      BookingDetails: body.BookingDetails ?? [],
      TotalGuests: body.TotalGuests ?? 0,
      Adults: body.Adults ?? 0,
      Children: body.Children ?? 0,
      IsActive: body.IsActive ?? true,
      CreatedAt: body.CreatedAt ?? new Date(),
      AddedBy: body.AddedBy ?? 'admin'
    };

    this.mockBookings.push(newBooking);

    return of({
      IsSuccess: true,
      Message: 'تم إنشاء حجز فاضي مليان بنجاح',
      ReturnedValue: newBooking
    }).pipe(delay(500));
  }

  /**
   * إنشاء حجز B2B (عادي / فاضي مليان / مندوب / فرعي من فاضي مليان / فرعي من مندوب) وإضافته للقائمة.
   * الفرعي (sub_booking) يحمل ParentBookingID ولا يُعلَّم كفاضي مليان ولا كمندوب أساسي.
   */
  createB2BBookingAsBooking(props?: {
    bookingReference?: string;
    checkInDate?: Date;
    checkOutDate?: Date;
    totalNights?: number;
    totalAmount?: number;
    notes?: string;
    bookingType?: string;
    bookingTypeName?: string;
    parentBookingId?: number | null;
    entityName?: string;
    /** حجز أساسي مندوب (fadhi_malyan + IsDelegateBooking) */
    isDelegateBooking?: boolean;
    roomTypes?: Array<{ roomTypeId: number; roomTypeName: string; quantity: number; actualSellingPrice?: number }>;
  }): Observable<BookingModelSystemResponse> {
    const p = props ?? {};
    const nextId = this.mockBookings.length + 1;
    const ref = p.bookingReference ?? `B2B${String(nextId).padStart(6, '0')}`;
    const roomTypes = p.roomTypes ?? [];
    const bookingDetails = roomTypes
      .filter(rt => rt.quantity > 0)
      .map((rt, i) => ({
        BookingDetailID: nextId * 10 + i,
        BookingID: nextId,
        RoomTypeID: rt.roomTypeId,
        RoomTypeName: rt.roomTypeName,
        Quantity: rt.quantity,
        UnitSellingPrice: rt.actualSellingPrice ?? 0,
        Total: (rt.quantity ?? 0) * (rt.actualSellingPrice ?? 0) * (p.totalNights ?? 1),
        Nights: p.totalNights ?? 1
      }));

    const isSubBooking = p.bookingType === 'sub_booking' || (p.parentBookingId != null && p.parentBookingId !== 0);
    const newBooking: BookingWithStock = {
      BookingID: nextId,
      HotelID: 1,
      BookingReference: ref,
      CheckInDate: p.checkInDate,
      CheckOutDate: p.checkOutDate,
      TotalNights: p.totalNights ?? 0,
      TotalAmount: p.totalAmount ?? 0,
      PaidAmount: 0,
      PendingAmount: p.totalAmount ?? 0,
      StatusID: 0,
      StatusName: 'المعلقة',
      CustomerName: p.entityName ?? undefined,
      Notes: p.notes ?? undefined,
      IsActive: true,
      CreatedAt: new Date(),
      BookingDetails: bookingDetails.length ? bookingDetails : undefined,
      BookingRooms: [],
      IsEmptyFullBooking: !isSubBooking && p.bookingType === 'fadhi_malyan',
      IsDelegateBooking: !isSubBooking && p.isDelegateBooking === true,
      ParentBookingID: p.parentBookingId ?? null,
      BookingTypeName: p.bookingTypeName ?? (p.parentBookingId != null ? 'Sub-Booking' : p.bookingType === 'fadhi_malyan' ? 'Fadhi Malyan' : 'Main'),
    };

    // حجز فاضي مليان: إجمالي الوحدات = مجموع كميات الغرف، مستخدم = 0، متبقي = الإجمالي
    if (p.bookingType === 'fadhi_malyan') {
      const totalUnits = roomTypes.reduce((sum, rt) => sum + (rt.quantity ?? 0), 0);
      newBooking.TotalUnits = totalUnits;
      newBooking.UsedUnits = 0;
      newBooking.RemainingUnits = totalUnits;
    }

    this.mockBookings.push(newBooking);

    return of({
      IsSuccess: true,
      Message: 'تم إنشاء الحجز بنجاح',
      ReturnedValue: newBooking
    }).pipe(delay(400));
  }

  assignRooms(props?: { body?: AssignRoomsRequest }): Observable<void> {
    const body = props?.body;
    if (!body) {
      return of(void 0).pipe(delay(500));
    }

    const booking = this.mockBookings.find(b => b.BookingID === body.BookingID);
    if (booking && body.RoomIDs) {
      booking.BookingRooms = body.RoomIDs.map((roomId, index) => {
        const room = this.mockRooms.find(r => r.RoomId === roomId);
        return {
          BookingRoomID: (booking.BookingRooms?.length || 0) + index + 1,
          BookingID: booking.BookingID,
          RoomID: roomId,
          RoomNumber: room?.RoomNumber || '',
          FloorNumber: room?.FloorNumber || 0,
          IsActive: true,
          CreatedAt: new Date(),
          AddedBy: body.AssignedBy || 'admin'
        };
      });
    }

    return of(void 0).pipe(delay(500));
  }

  getPricings(props?: { roomTypeID?: number; isActive?: boolean }): Observable<RoomPricingModel[]> {
    let filteredPricings = [...this.mockPricings];

    if (props?.roomTypeID !== undefined) {
      filteredPricings = filteredPricings.filter(p => p.RoomTypeID === props.roomTypeID);
    }
    if (props?.isActive !== undefined) {
      filteredPricings = filteredPricings.filter(p => p.IsActive === props.isActive);
    }

    return of(filteredPricings).pipe(delay(300));
  }

  /** إنشاء تسعير. periodName يُخزَّن مع السجل لعرضه كاسم الفترة في الواجهة. */
  createPricing(props?: { body?: RoomPricingModel; periodName?: string }): Observable<RoomPricingModel> {
    const newPricing: RoomPricingModel & { PeriodName?: string } = {
      ...props?.body,
      PricingId: this.mockPricings.length + 1,
      IsActive: props?.body?.IsActive ?? true,
      CreatedAt: new Date(),
      AddedBy: 'admin'
    };
    if (props?.periodName != null && props.periodName !== '') {
      newPricing.PeriodName = props.periodName;
    }

    this.mockPricings.push(newPricing);
    return of(newPricing).pipe(delay(500));
  }

  createRoom(props?: { body?: RoomModel }): Observable<RoomModel> {
    const maxId = this.mockRooms.length > 0 ? Math.max(...this.mockRooms.map(r => r.RoomId || 0)) : 0;
    const newRoom: RoomModel = {
      ...props?.body,
      RoomId: maxId + 1,
      IsActive: props?.body?.IsActive ?? true,
      CreatedAt: new Date(),
      AddedBy: 'admin'
    };

    this.mockRooms.push(newRoom);
    return of(newRoom).pipe(delay(500));
  }

  getCustomers(): Observable<CustomerModel[]> {
    return of(this.mockCustomers).pipe(delay(300));
  }

  getOwners(): Observable<OwnerModel[]> {
    return of(this.mockOwners).pipe(delay(300));
  }

  // Get Floors - Aggregate from rooms data
  getFloors(): Observable<FloorModel[]> {
    // Calculate floor statistics from rooms
    const floorMap = new Map<number, { rooms: RoomModel[], available: RoomModel[], occupied: RoomModel[] }>();

    this.mockRooms.forEach(room => {
      const floorNum = room.FloorNumber || 1;
      if (!floorMap.has(floorNum)) {
        floorMap.set(floorNum, { rooms: [], available: [], occupied: [] });
      }
      const floor = floorMap.get(floorNum)!;
      floor.rooms.push(room);
      if (room.IsActive) {
        // TODO: Check if room is actually occupied from bookings
        floor.available.push(room);
      }
    });

    // Create floor models from mock data and merge with calculated stats
    const floors = this.mockFloors.map(floor => {
      const floorData = floorMap.get(floor.FloorNumber);
      return {
        ...floor,
        TotalRooms: floorData?.rooms.length || floor.TotalRooms || 0,
        AvailableRooms: floorData?.available.length || floor.AvailableRooms || 0,
        OccupiedRooms: (floorData?.rooms.length || 0) - (floorData?.available.length || 0)
      };
    });

    return of(floors).pipe(delay(300));
  }

  // Floor CRUD operations
  createFloor(props?: { body?: FloorModel }): Observable<FloorModel> {
    const maxId = this.mockFloors.length > 0 ? Math.max(...this.mockFloors.map(f => f.FloorID)) : 0;
    const newFloor: FloorModel = {
      FloorID: maxId + 1,
      FloorNumber: props?.body?.FloorNumber ?? 1,
      FloorName: props?.body?.FloorName ?? '',
      FloorNameAr: props?.body?.FloorNameAr,
      FloorNameEn: props?.body?.FloorNameEn,
      Description: props?.body?.Description,
      TotalRooms: props?.body?.TotalRooms,
      AvailableRooms: props?.body?.AvailableRooms,
      OccupiedRooms: props?.body?.OccupiedRooms,
      IsActive: props?.body?.IsActive ?? true,
      CreatedAt: new Date()
    };

    this.mockFloors.push(newFloor);
    return of(newFloor).pipe(delay(500));
  }

  updateFloor(id: number, props?: { body?: FloorModel }): Observable<FloorModel> {
    const index = this.mockFloors.findIndex(f => f.FloorID === id);
    if (index === -1) {
      return throwError(() => new Error('Floor not found'));
    }

    const updatedFloor: FloorModel = {
      ...this.mockFloors[index],
      ...props?.body,
      FloorID: id,
      UpdatedAt: new Date()
    };

    this.mockFloors[index] = updatedFloor;
    return of(updatedFloor).pipe(delay(500));
  }

  deleteFloor(id: number): Observable<void> {
    const index = this.mockFloors.findIndex(f => f.FloorID === id);
    if (index === -1) {
      return throwError(() => new Error('Floor not found'));
    }

    // Get floor number before deleting
    const floorNumber = this.mockFloors[index]?.FloorNumber;

    // Remove floor
    this.mockFloors.splice(index, 1);

    // Also remove rooms in this floor
    if (floorNumber !== undefined) {
      this.mockRooms = this.mockRooms.filter(r => r.FloorNumber !== floorNumber);
    }

    return of(void 0).pipe(delay(500));
  }

  // Room CRUD operations
  updateRoom(id: number, props?: { body?: RoomModel }): Observable<RoomModel> {
    const index = this.mockRooms.findIndex(r => r.RoomId === id);
    if (index === -1) {
      return throwError(() => new Error('Room not found'));
    }

    const updatedRoom: RoomModel = {
      ...this.mockRooms[index],
      ...props?.body,
      RoomId: id
    };

    this.mockRooms[index] = updatedRoom;
    return of(updatedRoom).pipe(delay(500));
  }

  deleteRoom(id: number): Observable<void> {
    const index = this.mockRooms.findIndex(r => r.RoomId === id);
    if (index === -1) {
      return throwError(() => new Error('Room not found'));
    }

    this.mockRooms.splice(index, 1);
    return of(void 0).pipe(delay(500));
  }

  // Room Type CRUD operations
  createRoomType(props?: { body?: HotelRoomTypeModel }): Observable<HotelRoomTypeModel> {
    const newRoomType: HotelRoomTypeModel = {
      ...props?.body,
      RoomTypeID: Math.max(...this.mockRoomTypes.map(rt => rt.RoomTypeID || 0), 0) + 1,
      IsActive: props?.body?.IsActive ?? true
    };

    this.mockRoomTypes.push(newRoomType);
    return of(newRoomType).pipe(delay(500));
  }

  updateRoomType(id: number, props?: { body?: HotelRoomTypeModel }): Observable<HotelRoomTypeModel> {
    const index = this.mockRoomTypes.findIndex(rt => rt.RoomTypeID === id);
    if (index === -1) {
      return throwError(() => new Error('Room type not found'));
    }

    const updatedRoomType: HotelRoomTypeModel = {
      ...this.mockRoomTypes[index],
      ...props?.body,
      RoomTypeID: id
    };

    this.mockRoomTypes[index] = updatedRoomType;
    return of(updatedRoomType).pipe(delay(500));
  }

  deleteRoomType(id: number): Observable<void> {
    const index = this.mockRoomTypes.findIndex(rt => rt.RoomTypeID === id);
    if (index === -1) {
      return throwError(() => new Error('Room type not found'));
    }

    this.mockRoomTypes.splice(index, 1);
    return of(void 0).pipe(delay(500));
  }

  // ========== Admin API Methods ==========

  getUserAuthorizedPages(props?: { systemID?: number; culture?: string }): Observable<any[]> {
    // Mock navigation pages - جميع الصفحات المتاحة في المشروع
    const mockPages = [
      // لوحة التحكم
      {
        PageID: 1,
        Description: 'لوحة التحكم',
        DisplayTitle: 'Dashboard',
        Icon: 'dashboard',
        DisplayOrderNumber: 1,
        Parent: null,
        PageName: 'Dashboard',
        FunctionList: [{ FunctionID: 1 }]
      },
      // الاستقبال - قسم رئيسي
      {
        PageID: 40,
        Description: 'الاستقبال',
        DisplayTitle: 'Reception',
        Icon: 'device-desktop',
        DisplayOrderNumber: 2,
        Parent: null,
        PageName: null,
        FunctionList: [{ FunctionID: 1 }]
      },
      // الجدوزات اول قسم فرعي تحت الاستقبال
      {
        PageID: 101,
        Description: 'الحجوزات',
        DisplayTitle: 'Bookings',
        Icon: 'list',
        DisplayOrderNumber: 1,
        Parent: 40,
        PageName: 'bookings',
        FunctionList: [{ FunctionID: 1 }]
      },
      // الوصول - تابعة للاستقبال
      {
        PageID: 103,
        Description: 'الوصول',
        DisplayTitle: 'Arrival',
        Icon: 'login',
        DisplayOrderNumber: 2,
        Parent: 40,
        PageName: 'reception-arrivals',
        FunctionList: [{ FunctionID: 1 }]
      },
      // المغادرة - تابعة للاستقبال
      {
        PageID: 104,
        Description: 'المغادرة',
        DisplayTitle: 'Departure',
        Icon: 'logout',
        DisplayOrderNumber: 3,
        Parent: 40,
        PageName: 'reception-departures',
        FunctionList: [{ FunctionID: 1 }]
      },
      // حجز مندوب — لوحة التقارير (مسار delegate-booking)
      {
        PageID: 105,
        Description: 'حجز مندوب',
        DisplayTitle: 'Delegate Booking',
        Icon: 'user-shield',
        DisplayOrderNumber: 4,
        Parent: 40,
        PageName: 'delegate-booking',
        FunctionList: [{ FunctionID: 1 }]
      },
      // حجز فاضي مليان - مباشرة تحت الاستقبال
      {
        PageID: 102,
        Description: 'حجز فاضي مليان',
        DisplayTitle: 'Empty-Full Booking',
        Icon: 'container',
        DisplayOrderNumber: 5,
        Parent: 40,
        PageName: 'empty-full-booking',
        FunctionList: [{ FunctionID: 1 }]
      },
      // الحجوزات المغلقة - مباشرة تحت الاستقبال
      {
        PageID: 11,
        Description: 'الحجوزات المغلقة',
        DisplayTitle: 'Closed Bookings',
        Icon: 'archive',
        DisplayOrderNumber: 6,
        Parent: 40,
        PageName: 'packaged-bookings',
        FunctionList: [{ FunctionID: 1 }]
      },
      // المصادر (مصادر الحجز) - تابعة للاستقبال
      {
        PageID: 22,
        Description: 'المصادر',
        DisplayTitle: 'Sources',
        Icon: 'broadcast',
        DisplayOrderNumber: 8,
        Parent: 40,
        PageName: 'channels',
        FunctionList: [{ FunctionID: 1 }, { FunctionID: 2 }, { FunctionID: 3 }, { FunctionID: 4 }]
      },
      // الغرف والطوابق - تابعة للاستقبال
      {
        PageID: 41,
        Description: 'الغرف والطوابق',
        DisplayTitle: 'Rooms & Floors',
        Icon: 'layout-grid',
        DisplayOrderNumber: 9,
        Parent: 40,
        PageName: 'rooms-floors',
        FunctionList: [{ FunctionID: 1 }]
      },
      // تقرير حالة الغرف - تابعة للاستقبال
      {
        PageID: 106,
        Description: 'تقرير حالة الغرف',
        DisplayTitle: 'Room Status Report',
        Icon: 'calendar-week',
        DisplayOrderNumber: 10,
        Parent: 40,
        PageName: 'room-status-report',
        FunctionList: [{ FunctionID: 1 }]
      },
      // النزلاء / الجهات - قسم رئيسي
      {
        PageID: 50,
        Description: 'النزلاء / الجهات',
        DisplayTitle: 'Guests / Companies',
        Icon: 'users-group',
        DisplayOrderNumber: 3,
        Parent: null,
        PageName: null,
        FunctionList: [{ FunctionID: 1 }]
      },
      // إدارة الجهات - تابعة للنزلاء
      {
        PageID: 23,
        Description: 'إدارة الجهات',
        DisplayTitle: 'Agents Management',
        Icon: 'user-shield',
        DisplayOrderNumber: 1,
        Parent: 50,
        PageName: 'agents',
        FunctionList: [{ FunctionID: 1 }, { FunctionID: 2 }, { FunctionID: 3 }, { FunctionID: 4 }]
      },
      // إدارة النزلاء - تابعة للنزلاء
      {
        PageID: 6,
        Description: 'إدارة النزلاء',
        DisplayTitle: 'Guests Management',
        Icon: 'users',
        DisplayOrderNumber: 2,
        Parent: 50,
        PageName: 'customers',
        FunctionList: [{ FunctionID: 1 }, { FunctionID: 2 }, { FunctionID: 3 }, { FunctionID: 4 }]
      },
      // المالية - قسم رئيسي
      {
        PageID: 60,
        Description: 'المالية',
        DisplayTitle: 'Finance',
        Icon: 'currency-dollar',
        DisplayOrderNumber: 4,
        Parent: null,
        PageName: null,
        FunctionList: [{ FunctionID: 1 }]
      },
      // كشف الحساب - تابعة للمالية
      {
        PageID: 71,
        Description: 'كشف الحساب',
        DisplayTitle: 'Account Statement',
        Icon: 'file-text',
        DisplayOrderNumber: 1,
        Parent: 60,
        PageName: 'account-statement',
        FunctionList: [{ FunctionID: 1 }, { FunctionID: 2 }, { FunctionID: 3 }, { FunctionID: 4 }]
      },
      // ميزان المراجعة - تابعة للمالية
      {
        PageID: 72,
        Description: 'ميزان المراجعة',
        DisplayTitle: 'Trial Balance',
        Icon: 'scale',
        DisplayOrderNumber: 2,
        Parent: 60,
        PageName: 'trial-balance',
        FunctionList: [{ FunctionID: 1 }, { FunctionID: 2 }, { FunctionID: 3 }, { FunctionID: 4 }]
      },
      // مراكز التكلفة - تابعة للمالية
      {
        PageID: 73,
        Description: 'مراكز التكلفة',
        DisplayTitle: 'Cost Centers',
        Icon: 'building-store',
        DisplayOrderNumber: 3,
        Parent: 60,
        PageName: 'cost-centers',
        FunctionList: [{ FunctionID: 1 }, { FunctionID: 2 }, { FunctionID: 3 }, { FunctionID: 4 }]
      },
      // الشجرة المحاسبية - تابعة للمالية
      {
        PageID: 66,
        Description: 'الشجرة المحاسبية',
        DisplayTitle: 'Chart of Accounts',
        Icon: 'hierarchy',
        DisplayOrderNumber: 4,
        Parent: 60,
        PageName: 'chart-of-accounts',
        FunctionList: [{ FunctionID: 1 }, { FunctionID: 2 }, { FunctionID: 3 }, { FunctionID: 4 }]
      },
      // قائمة الدخل - تابعة للمالية
      {
        PageID: 74,
        Description: 'قائمة الدخل',
        DisplayTitle: 'Income Statement',
        Icon: 'chart-line',
        DisplayOrderNumber: 5,
        Parent: 60,
        PageName: 'income-statement',
        FunctionList: [{ FunctionID: 1 }, { FunctionID: 2 }, { FunctionID: 3 }, { FunctionID: 4 }]
      },
      // الرصيد الافتتاحي - تابعة للمالية
      {
        PageID: 68,
        Description: 'الرصيد الافتتاحي',
        DisplayTitle: 'Opening Balance',
        Icon: 'coin',
        DisplayOrderNumber: 6,
        Parent: 60,
        PageName: 'opening-balance',
        FunctionList: [{ FunctionID: 1 }, { FunctionID: 2 }, { FunctionID: 3 }, { FunctionID: 4 }]
      },
      // القيود (إدخالات اليومية) - تابعة للمالية
      {
        PageID: 67,
        Description: 'القيود',
        DisplayTitle: 'Journal Entries',
        Icon: 'file-invoice',
        DisplayOrderNumber: 7,
        Parent: 60,
        PageName: 'journal-entries',
        FunctionList: [{ FunctionID: 1 }, { FunctionID: 2 }, { FunctionID: 3 }, { FunctionID: 4 }]
      },
      // السنة المالية - تابعة للمالية
      {
        PageID: 75,
        Description: 'السنة المالية',
        DisplayTitle: 'Fiscal Year',
        Icon: 'calendar-time',
        DisplayOrderNumber: 8,
        Parent: 60,
        PageName: 'fiscal-year',
        FunctionList: [{ FunctionID: 1 }, { FunctionID: 2 }, { FunctionID: 3 }, { FunctionID: 4 }]
      },
      // التقارير المالية - تابعة للمالية
      {
        PageID: 69,
        Description: 'التقارير المالية',
        DisplayTitle: 'Financial Reports',
        Icon: 'report-analytics',
        DisplayOrderNumber: 9,
        Parent: 60,
        PageName: 'financial-reports',
        FunctionList: [{ FunctionID: 1 }, { FunctionID: 2 }, { FunctionID: 3 }, { FunctionID: 4 }]
      },
      // توجيه الحسابات - تابعة للمالية
      {
        PageID: 76,
        Description: 'توجيه الحسابات',
        DisplayTitle: 'Account Routing',
        Icon: 'route',
        DisplayOrderNumber: 10,
        Parent: 60,
        PageName: 'account-routing',
        FunctionList: [{ FunctionID: 1 }, { FunctionID: 2 }, { FunctionID: 3 }, { FunctionID: 4 }]
      },
      // التقارير
      {
        PageID: 70,
        Description: 'التقارير',
        DisplayTitle: 'Reports',
        Icon: 'file-text',
        DisplayOrderNumber: 5,
        Parent: null,
        PageName: 'reports',
        FunctionList: [{ FunctionID: 1 }]
      },
      // الإعدادات - قسم رئيسي
      {
        PageID: 80,
        Description: 'الإعدادات',
        DisplayTitle: 'Settings',
        Icon: 'settings',
        DisplayOrderNumber: 6,
        Parent: null,
        PageName: null,
        FunctionList: [{ FunctionID: 1 }]
      },
      // إدارة الأسعار - تابعة للإعدادات
      {
        PageID: 85,
        Description: 'إدارة الأسعار',
        DisplayTitle: 'Pricing Management',
        Icon: 'currency-dollar',
        DisplayOrderNumber: 3,
        Parent: 80,
        PageName: 'pricing',
        FunctionList: [{ FunctionID: 1 }, { FunctionID: 2 }, { FunctionID: 3 }, { FunctionID: 4 }]
      },
      // إدارة أوقات الذروة - تابعة للإعدادات
      {
        PageID: 86,
        Description: 'إدارة أوقات الذروة',
        DisplayTitle: 'Peak Times Management',
        Icon: 'clock',
        DisplayOrderNumber: 4,
        Parent: 80,
        PageName: 'reports?category=peak-times',
        FunctionList: [{ FunctionID: 1 }, { FunctionID: 2 }, { FunctionID: 3 }, { FunctionID: 4 }]
      },
      // الضرائب والرسوم - تابعة للإعدادات
      {
        PageID: 87,
        Description: 'الضرائب والرسوم',
        DisplayTitle: 'Taxes & Fees',
        Icon: 'receipt',
        DisplayOrderNumber: 5,
        Parent: 80,
        PageName: 'taxes-fees',
        FunctionList: [{ FunctionID: 1 }, { FunctionID: 2 }, { FunctionID: 3 }, { FunctionID: 4 }]
      },
      // إدارة الأصناف والخدمات - تابعة للإعدادات
      {
        PageID: 88,
        Description: 'إدارة الأصناف والخدمات',
        DisplayTitle: 'Items & Services Management',
        Icon: 'package',
        DisplayOrderNumber: 6,
        Parent: 80,
        PageName: 'items-services',
        FunctionList: [{ FunctionID: 1 }, { FunctionID: 2 }, { FunctionID: 3 }, { FunctionID: 4 }]
      },
      // إدارة البنوك - تابعة للإعدادات
      {
        PageID: 89,
        Description: 'إدارة البنوك',
        DisplayTitle: 'Banks Management',
        Icon: 'building-bank',
        DisplayOrderNumber: 7,
        Parent: 80,
        PageName: 'banks-management',
        FunctionList: [{ FunctionID: 1 }, { FunctionID: 2 }, { FunctionID: 3 }, { FunctionID: 4 }]
      },
      // إدارة المصروفات - تابعة للإعدادات
      {
        PageID: 90,
        Description: 'إدارة المصروفات',
        DisplayTitle: 'Expenses Management',
        Icon: 'wallet',
        DisplayOrderNumber: 8,
        Parent: 80,
        PageName: 'expenses-management',
        FunctionList: [{ FunctionID: 1 }, { FunctionID: 2 }, { FunctionID: 3 }, { FunctionID: 4 }]
      },
      // إدارة الرسائل - تابعة للإعدادات
      {
        PageID: 93,
        Description: 'إدارة الرسائل',
        DisplayTitle: 'Messages Management',
        Icon: 'message',
        DisplayOrderNumber: 9,
        Parent: 80,
        PageName: 'messages-management',
        FunctionList: [{ FunctionID: 1 }, { FunctionID: 2 }, { FunctionID: 3 }, { FunctionID: 4 }]
      },
      // إدارة الشركات والموردين - تابعة للإعدادات
      {
        PageID: 94,
        Description: 'إدارة الشركات والموردين',
        DisplayTitle: 'Companies & Suppliers Management',
        Icon: 'building-store',
        DisplayOrderNumber: 10,
        Parent: 80,
        PageName: 'companies-suppliers',
        FunctionList: [{ FunctionID: 1 }, { FunctionID: 2 }, { FunctionID: 3 }, { FunctionID: 4 }]
      },
      // الربط والتكامل - تابعة للإعدادات
      {
        PageID: 91,
        Description: 'الربط والتكامل',
        DisplayTitle: 'Integration & Connectivity',
        Icon: 'plug',
        DisplayOrderNumber: 11,
        Parent: 80,
        PageName: 'integration',
        FunctionList: [{ FunctionID: 1 }, { FunctionID: 2 }, { FunctionID: 3 }, { FunctionID: 4 }]
      },
      // الفندق - قسم رئيسي مستقل
      {
        PageID: 95,
        Description: 'الفندق',
        DisplayTitle: 'Hotel',
        Icon: 'building',
        DisplayOrderNumber: 12,
        Parent: null,
        PageName: null,
        FunctionList: [{ FunctionID: 1 }]
      },
      // معلومات الفندق - تابعة للفندق
      {
        PageID: 96,
        Description: 'معلومات الفندق',
        DisplayTitle: 'Hotel Information',
        Icon: 'info-circle',
        DisplayOrderNumber: 1,
        Parent: 95,
        PageName: 'hotelInfo',
        FunctionList: [{ FunctionID: 1 }, { FunctionID: 2 }, { FunctionID: 3 }, { FunctionID: 4 }]
      },
      // المستخدمين والصلاحيات - تابعة للفندق
      {
        PageID: 97,
        Description: 'المستخدمين والصلاحيات',
        DisplayTitle: 'Users & Permissions',
        Icon: 'users',
        DisplayOrderNumber: 2,
        Parent: 95,
        PageName: 'users-permissions',
        FunctionList: [{ FunctionID: 1 }, { FunctionID: 2 }, { FunctionID: 3 }, { FunctionID: 4 }]
      },
    ];

    return of(mockPages).pipe(delay(300));
  }

  getAgentListCount(props?: { agentManagerId?: number; countryID?: number; filterText?: string }): Observable<number> {
    return of(10).pipe(delay(300));
  }

  // Additional methods for other components
  getBooking(props?: { bookingID?: number }): Observable<BookingModel> {
    const booking = this.mockBookings.find(b => b.BookingID === props?.bookingID);
    if (booking) {
      return of(booking).pipe(delay(300));
    }
    return of(this.mockBookings[0]).pipe(delay(300));
  }

  /**
   * Rooms associated with a given booking (for Sub-Booking from Fadhi Malyan).
   * Returns full RoomModel[] for each RoomID in the booking's BookingRooms.
   */
  getRoomsByBookingId(bookingID: number): Observable<RoomModel[]> {
    const booking = this.mockBookings.find(b => b.BookingID === bookingID);
    if (!booking?.BookingRooms?.length) {
      return of([]).pipe(delay(200));
    }
    const roomIds = booking.BookingRooms.map(br => br.RoomID).filter((id): id is number => id != null);
    const rooms = this.mockRooms.filter(r => roomIds.includes(r.RoomId ?? 0));
    return of(rooms).pipe(delay(200));
  }

  /**
   * Floors linked to a given booking (for Sub-Booking from Fadhi Malyan).
   * Derived from the booking's rooms' floor numbers.
   */
  getFloorsByBookingId(bookingID: number): Observable<FloorModel[]> {
    const booking = this.mockBookings.find(b => b.BookingID === bookingID);
    if (!booking?.BookingRooms?.length) {
      return of([]).pipe(delay(200));
    }
    const floorNumbers = new Set(
      booking.BookingRooms
        .map(br => {
          const room = this.mockRooms.find(r => r.RoomId === br.RoomID);
          return room?.FloorNumber;
        })
        .filter((n): n is number => n != null)
    );
    const floors = this.mockFloors.filter(f => floorNumbers.has(f.FloorNumber ?? 0));
    return of(floors).pipe(delay(200));
  }

  getAvailableRooms(props?: {
    roomTypeID?: number;
    checkInDate?: Date;
    checkOutDate?: Date;
    hotelID?: number;
  }): Observable<RoomModel[]> {
    // Filter rooms by type and availability
    let filteredRooms = this.mockRooms.filter(r => r.IsActive);

    if (props?.roomTypeID !== undefined) {
      filteredRooms = filteredRooms.filter(r => r.RoomTypeId === props.roomTypeID);
    }

    // Simple availability check - exclude rooms that are booked during the date range
    if (props?.checkInDate && props?.checkOutDate) {
      const bookedRoomIds = this.mockBookings
        .filter(b => {
          const bookingCheckIn = b.CheckInDate ? new Date(b.CheckInDate) : null;
          const bookingCheckOut = b.CheckOutDate ? new Date(b.CheckOutDate) : null;
          if (!bookingCheckIn || !bookingCheckOut) return false;

          // Check if booking overlaps with requested dates
          return bookingCheckIn < props.checkOutDate! && bookingCheckOut > props.checkInDate!;
        })
        .flatMap(b => b.BookingRooms?.map(br => br.RoomID) || []);

      filteredRooms = filteredRooms.filter(r => !bookedRoomIds.includes(r.RoomId));
    }

    return of(filteredRooms).pipe(delay(300));
  }

  confirmBooking(props?: { bookingID?: number }): Observable<BookingModelSystemResponse> {
    const booking = this.mockBookings.find(b => b.BookingID === props?.bookingID);
    if (booking) {
      booking.StatusID = 1;
      booking.StatusName = 'Confirmed';
      booking.UpdatedAt = new Date();
    }

    return of({
      IsSuccess: true,
      Message: 'تم تأكيد الحجز بنجاح',
      ReturnedValue: booking
    }).pipe(delay(500));
  }

  cancelBooking(props?: { bookingID?: number }): Observable<void> {
    const booking = this.mockBookings.find(b => b.BookingID === props?.bookingID);
    if (booking) {
      booking.StatusID = 4;
      booking.StatusName = 'Cancelled';
      booking.IsActive = false;
      booking.UpdatedAt = new Date();
    }

    return of(void 0).pipe(delay(500));
  }

  checkIn(props?: { bookingID?: number }): Observable<BookingModel> {
    const booking = this.mockBookings.find(b => b.BookingID === props?.bookingID);
    if (booking) {
      booking.StatusID = 2;
      booking.StatusName = 'Checked In';
      booking.UpdatedAt = new Date();
    }

    return of(booking!).pipe(delay(500));
  }

  checkOut(props?: { bookingID?: number }): Observable<void> {
    const booking = this.mockBookings.find(b => b.BookingID === props?.bookingID);
    if (booking) {
      booking.StatusID = 4;
      booking.StatusName = 'Checked Out';
      booking.IsActive = false;
      booking.UpdatedAt = new Date();
    }

    return of(void 0).pipe(delay(500));
  }

  // Admin API methods
  getAdminUsersList(props?: { pageIndex?: number; pageSize?: number }): Observable<any> {
    return of({
      Data: [
        {
          UserID: 1,
          UserName: 'admin',
          Email: 'admin@example.com',
          FullName: 'مدير النظام',
          IsActive: true
        },
        {
          UserID: 2,
          UserName: 'manager',
          Email: 'manager@example.com',
          FullName: 'مدير الفندق',
          IsActive: true
        }
      ],
      TotalCount: 2
    }).pipe(delay(300));
  }

  getAdminUsersCount(): Observable<number> {
    return of(2).pipe(delay(300));
  }

  getSystemGroups(props?: { systemID?: number; culture?: string }): Observable<any[]> {
    return of([
      {
        GroupID: 1,
        GroupName: 'Administrators',
        Description: 'مديرو النظام',
        IsActive: true
      },
      {
        GroupID: 2,
        GroupName: 'Managers',
        Description: 'المديرون',
        IsActive: true
      }
    ]).pipe(delay(300));
  }

  getUserInfo(props?: { userId?: number; culture?: string }): Observable<any> {
    return of({
      UserID: props?.userId || 1,
      UserName: 'user',
      Email: 'user@example.com',
      FullName: 'مستخدم',
      IsActive: true
    }).pipe(delay(300));
  }

  getUserGroupsList(props?: { userId?: number; culture?: string }): Observable<any[]> {
    return of([
      {
        GroupID: 1,
        GroupName: 'Administrators',
        Description: 'مديرو النظام'
      }
    ]).pipe(delay(300));
  }

  createUser(props?: { body?: any; culture?: string }): Observable<any> {
    return of({
      UserID: this.mockCustomers.length + 1,
      ...props?.body,
      IsSuccess: true,
      Message: 'تم إنشاء المستخدم بنجاح'
    }).pipe(delay(500));
  }

  updateUser(props?: { body?: any; culture?: string }): Observable<any> {
    return of({
      ...props?.body,
      IsSuccess: true,
      Message: 'تم تحديث المستخدم بنجاح'
    }).pipe(delay(500));
  }

  resetPassword(props?: { body?: any; culture?: string }): Observable<void> {
    return of(void 0).pipe(delay(500));
  }

  assignUserToGroup(props?: { userId?: number; groupId?: number }): Observable<void> {
    return of(void 0).pipe(delay(500));
  }

  // ========== B2B API Methods ==========

  getB2BEntities(props?: { isActive?: boolean; entityType?: string }): Observable<B2BEntityModel[]> {
    let filteredEntities = [...this.mockB2BEntities];

    if (props?.isActive !== undefined) {
      filteredEntities = filteredEntities.filter(e => e.IsActive === props.isActive);
    }
    if (props?.entityType) {
      filteredEntities = filteredEntities.filter(e => e.EntityType === props.entityType);
    }

    return of(filteredEntities).pipe(delay(300));
  }

  getB2BEntity(props?: { entityID?: number }): Observable<B2BEntityModel | undefined> {
    const entity = this.mockB2BEntities.find(e => e.EntityID === props?.entityID);
    return of(entity).pipe(delay(300));
  }

  createB2BEntity(props?: { body?: B2BEntityModel }): Observable<B2BEntityModel> {
    const newEntity: B2BEntityModel = {
      ...props?.body,
      EntityID: this.mockB2BEntities.length + 1,
      IsActive: true,
      CreatedAt: new Date()
    };
    this.mockB2BEntities.push(newEntity);
    return of(newEntity).pipe(delay(500));
  }

  updateB2BEntity(props?: { body?: B2BEntityModel }): Observable<B2BEntityModel> {
    const index = this.mockB2BEntities.findIndex(e => e.EntityID === props?.body?.EntityID);
    if (index !== -1) {
      this.mockB2BEntities[index] = {
        ...this.mockB2BEntities[index],
        ...props?.body,
        UpdatedAt: new Date()
      };
      return of(this.mockB2BEntities[index]).pipe(delay(500));
    }
    return of(props?.body as B2BEntityModel).pipe(delay(500));
  }

  getB2BBookings(props?: {
    entityID?: number;
    status?: string;
    checkInFrom?: Date;
    checkInTo?: Date;
  }): Observable<B2BBookingModel[]> {
    let filteredBookings = [...this.mockB2BBookings];

    if (props?.entityID !== undefined) {
      filteredBookings = filteredBookings.filter(b => b.EntityID === props.entityID);
    }
    if (props?.status) {
      filteredBookings = filteredBookings.filter(b => b.Status === props.status);
    }
    if (props?.checkInFrom) {
      filteredBookings = filteredBookings.filter(b =>
        b.CheckInDate && new Date(b.CheckInDate) >= props.checkInFrom!
      );
    }
    if (props?.checkInTo) {
      filteredBookings = filteredBookings.filter(b =>
        b.CheckInDate && new Date(b.CheckInDate) <= props.checkInTo!
      );
    }

    return of(filteredBookings).pipe(delay(300));
  }

  getB2BBooking(props?: { bookingID?: number }): Observable<B2BBookingModel | undefined> {
    const booking = this.mockB2BBookings.find(b => b.BookingID === props?.bookingID);
    return of(booking).pipe(delay(300));
  }

  createB2BBooking(props?: { body?: B2BBookingModel }): Observable<B2BBookingModel> {
    const newBooking: B2BBookingModel = {
      ...props?.body,
      BookingID: 100 + this.mockB2BBookings.length + 1,
      Status: 'pending_assignment',
      AssignedRooms: [],
      CreatedAt: new Date()
    };
    this.mockB2BBookings.push(newBooking);
    return of(newBooking).pipe(delay(500));
  }

  assignRoomToB2BBooking(props?: {
    bookingID?: number;
    roomAssignment?: AssignedRoom
  }): Observable<B2BBookingModel | undefined> {
    const booking = this.mockB2BBookings.find(b => b.BookingID === props?.bookingID);
    if (booking && props?.roomAssignment) {
      if (!booking.AssignedRooms) {
        booking.AssignedRooms = [];
      }
      booking.AssignedRooms.push({
        ...props.roomAssignment,
        AssignedAt: new Date()
      });

      // Update status based on assigned rooms count
      const totalRequired = booking.TotalRooms || 0;
      const totalAssigned = booking.AssignedRooms.length;

      if (totalAssigned === 0) {
        booking.Status = 'pending_assignment';
      } else if (totalAssigned < totalRequired) {
        booking.Status = 'partially_assigned';
      } else {
        booking.Status = 'fully_assigned';
      }

      booking.UpdatedAt = new Date();
    }
    return of(booking).pipe(delay(500));
  }

  removeRoomFromB2BBooking(props?: {
    bookingID?: number;
    roomID?: number
  }): Observable<B2BBookingModel | undefined> {
    const booking = this.mockB2BBookings.find(b => b.BookingID === props?.bookingID);
    if (booking && booking.AssignedRooms) {
      booking.AssignedRooms = booking.AssignedRooms.filter(r => r.RoomID !== props?.roomID);

      // Update status
      const totalRequired = booking.TotalRooms || 0;
      const totalAssigned = booking.AssignedRooms.length;

      if (totalAssigned === 0) {
        booking.Status = 'pending_assignment';
      } else if (totalAssigned < totalRequired) {
        booking.Status = 'partially_assigned';
      } else {
        booking.Status = 'fully_assigned';
      }

      booking.UpdatedAt = new Date();
    }
    return of(booking).pipe(delay(500));
  }

  // Add more mock methods as needed for other API calls

  // ---------------------------------------------------------------------------
  // Dashboard global search index (local / mock). Future: replace with HTTP
  // GET /api/global-search?q=… returning the same GlobalSearchHit shape.
  // Searchable areas: bookings (+sub), B2B, guests, companies, rooms, floors,
  // owners (branches), sidebar modules, admin shortcuts, keyword fallbacks.
  // ---------------------------------------------------------------------------

  getDashboardGlobalSearchHits(): GlobalSearchHit[] {
    const hits: GlobalSearchHit[] = [];

    const floorName = (n?: number | null): string => {
      if (n == null) {
        return '';
      }
      return this.mockFloors.find((f) => f.FloorNumber === n)?.FloorName ?? '';
    };

    const bookingRoute = (b: BookingModel): string[] => {
      if (b.ParentBookingID != null) {
        const p = this.mockBookings.find((x) => x.BookingID === b.ParentBookingID);
        return p ? bookingRoute(p) : ['empty-full-booking', 'details', String(b.ParentBookingID)];
      }
      if (b.IsDelegateBooking) {
        return ['delegate-booking', 'details', String(b.BookingID!)];
      }
      if (b.IsEmptyFullBooking) {
        return ['empty-full-booking', 'details', String(b.BookingID!)];
      }
      return ['bookings', 'details', String(b.BookingID!)];
    };

    const searchDateTokens = (d?: Date | null): string[] => {
      if (d == null) {
        return [];
      }
      const x = d instanceof Date ? d : new Date(d);
      if (Number.isNaN(x.getTime())) {
        return [];
      }
      return [x.toISOString().slice(0, 10), x.toLocaleDateString('ar-SA'), x.toLocaleDateString('en-GB')];
    };

    const customerSearchTokens = (customerId?: number | null): string[] => {
      if (customerId == null) {
        return [];
      }
      const c = this.mockCustomers.find((x) => x.CustomerID === customerId);
      if (!c) {
        return [];
      }
      return [
        c.Name ?? '',
        c.Email ?? '',
        c.Phone ?? '',
        c.VatNumber ?? '',
        c.Address ?? '',
        c.CoutryName ?? '',
        c.CityName ?? '',
        c.District ?? '',
        c.Street ?? '',
        c.Building ?? '',
        c.PostalCode ?? '',
        c.AdditionalNumber ?? '',
      ].filter(Boolean);
    };

    /** فهرسة نصية شاملة للحجز (مرجع، نزيل، شركة مرتبطة، غرف، تواريخ، مبالغ، تفاصيل البنود…). */
    const bookingMatchText = (b: BookingModel, ref: string, rooms: string, floors: string): string => {
      const detailChunks: string[] = [];
      for (const d of b.BookingDetails ?? []) {
        detailChunks.push(
          d.Notes ?? '',
          d.RoomTypeName ?? '',
          String(d.Quantity ?? ''),
          String(d.Nights ?? ''),
          String(d.UnitCostPrice ?? ''),
          String(d.UnitSellingPrice ?? ''),
          String(d.SubTotal ?? ''),
          String(d.Total ?? ''),
        );
        for (const ar of d.AssignedRooms ?? []) {
          detailChunks.push(
            ar.RoomNumber ?? '',
            ar.RoomNotes ?? '',
            String(ar.RoomID ?? ''),
            String(ar.FloorNumber ?? ''),
          );
        }
      }
      const roomChunks = (b.BookingRooms ?? []).flatMap((br) => [
        br.RoomNumber ?? '',
        br.RoomNotes ?? '',
        String(br.FloorNumber ?? ''),
        String(br.RoomID ?? ''),
      ]);
      const parts = [
        ref,
        String(b.BookingID ?? ''),
        b.CustomerName ?? '',
        b.CustomerEmail ?? '',
        b.CustomerPhone ?? '',
        ...customerSearchTokens(b.CustomerID),
        b.BookingTypeName ?? '',
        b.BookingSource ?? '',
        b.SpecialRequests ?? '',
        b.Notes ?? '',
        b.StatusName ?? '',
        String(b.StatusID ?? ''),
        b.AddedBy ?? '',
        b.UpdatedBy ?? '',
        String(b.TotalAmount ?? ''),
        String(b.PaidAmount ?? ''),
        String(b.PendingAmount ?? ''),
        String(b.DiscountAmount ?? ''),
        String(b.TotalNights ?? ''),
        String(b.TotalGuests ?? ''),
        String(b.Adults ?? ''),
        String(b.Children ?? ''),
        String(b.OwnerID ?? ''),
        ...searchDateTokens(b.CheckInDate ?? null),
        ...searchDateTokens(b.CheckOutDate ?? null),
        rooms,
        floors,
        ...detailChunks,
        ...roomChunks,
      ];
      return parts.filter(Boolean).join(' ').toLowerCase();
    };

    const b2bBookingMatchText = (bb: B2BBookingModel, ref: string, guests: string): string => {
      const rt = (bb.RoomTypeSelections ?? []).flatMap((r) => [
        r.RoomTypeName ?? '',
        String(r.Quantity ?? ''),
        String(r.PricePerNight ?? ''),
        String(r.TotalPrice ?? ''),
      ]);
      const assigned = (bb.AssignedRooms ?? []).flatMap((a) => [
        a.GuestName ?? '',
        a.GuestPhone ?? '',
        a.RoomNumber ?? '',
        String(a.RoomID ?? ''),
      ]);
      return [
        ref,
        String(bb.BookingID ?? ''),
        String(bb.EntityID ?? ''),
        bb.EntityName ?? '',
        bb.Status ?? '',
        bb.Notes ?? '',
        guests,
        bb.CheckInTime ?? '',
        bb.CheckOutTime ?? '',
        String(bb.TotalRooms ?? ''),
        String(bb.TotalNights ?? ''),
        String(bb.TotalAmount ?? ''),
        String(bb.DiscountAmount ?? ''),
        String(bb.FinalAmount ?? ''),
        ...searchDateTokens(bb.CheckInDate ?? null),
        ...searchDateTokens(bb.CheckOutDate ?? null),
        ...rt,
        ...assigned,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
    };

    for (const f of this.mockFloors) {
      const primary = f.FloorName;
      const secondary = f.Description ?? `الطابق ${f.FloorNumber}`;
      hits.push({
        id: `floor-${f.FloorID}`,
        kind: 'floor',
        entityLabelKey: 'GLOBAL_SEARCH_KIND_FLOOR',
        primaryText: primary,
        secondaryText: secondary,
        route: ['rooms-floors'],
        queryParams: { floorId: f.FloorID },
        matchText: [primary, String(f.FloorNumber), f.Description ?? '', f.FloorNameAr ?? ''].join(' ').toLowerCase(),
      });
    }

    for (const r of this.mockRooms) {
      const rid = r.RoomId;
      if (rid == null) {
        continue;
      }
      const fname = floorName(r.FloorNumber);
      const primary = r.RoomNumber ?? `غرفة ${rid}`;
      const secondary = [r.RoomTypeName, fname].filter(Boolean).join(' · ');
      hits.push({
        id: `room-${rid}`,
        kind: 'room',
        entityLabelKey: 'GLOBAL_SEARCH_KIND_ROOM',
        primaryText: primary,
        secondaryText: secondary,
        route: ['rooms-floors'],
        queryParams: { roomId: rid, roomNumber: primary },
        matchText: [primary, r.RoomTypeName ?? '', fname, String(r.FloorNumber ?? '')].join(' ').toLowerCase(),
      });
    }

    for (const c of this.mockCustomers) {
      const cid = c.CustomerID;
      if (cid == null) {
        continue;
      }
      const primary = c.Name ?? `نزيل ${cid}`;
      const secondary = [c.Phone, c.Email, c.VatNumber].filter(Boolean).join(' · ');
      hits.push({
        id: `guest-${cid}`,
        kind: 'guest',
        entityLabelKey: 'GLOBAL_SEARCH_KIND_GUEST',
        primaryText: primary,
        secondaryText: secondary || 'customers',
        route: ['customers'],
        queryParams: { customerId: cid },
        matchText: [primary, c.Phone ?? '', c.Email ?? '', c.VatNumber ?? '', c.Address ?? ''].join(' ').toLowerCase(),
      });
    }

    for (const e of this.mockB2BEntities) {
      const eid = e.EntityID;
      if (eid == null) {
        continue;
      }
      const primary = e.EntityName ?? `جهة ${eid}`;
      const secondary = [e.TaxNumber, e.EntityType, e.ContactPerson].filter(Boolean).join(' · ');
      hits.push({
        id: `company-${eid}`,
        kind: 'company',
        entityLabelKey: 'GLOBAL_SEARCH_KIND_COMPANY',
        primaryText: primary,
        secondaryText: secondary,
        route: ['companies-suppliers'],
        queryParams: { entityId: eid },
        matchText: [
          primary,
          String(eid),
          e.TaxNumber ?? '',
          e.EntityType ?? '',
          e.ContactPerson ?? '',
          e.Email ?? '',
          e.Phone ?? '',
          e.Address ?? '',
          e.PaymentTerms ?? '',
          String(e.DiscountPercentage ?? ''),
          String(e.CreditLimit ?? ''),
          e.DeferredAccountId ?? '',
          ...searchDateTokens(e.ContractStartDate ?? null),
          ...searchDateTokens(e.ContractEndDate ?? null),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase(),
      });
    }

    for (const o of this.mockOwners) {
      const oid = o.OwnerID;
      if (oid == null) {
        continue;
      }
      const primary = o.Name ?? `فرع ${oid}`;
      hits.push({
        id: `owner-${oid}`,
        kind: 'branch_owner',
        entityLabelKey: 'GLOBAL_SEARCH_KIND_BRANCH',
        primaryText: primary,
        secondaryText: [o.Phone, o.Email].filter(Boolean).join(' · ') || 'ownership',
        route: ['ownership'],
        queryParams: { ownerId: oid },
        matchText: [primary, o.Phone ?? '', o.Email ?? '', o.VatNumber ?? '', o.Address ?? ''].join(' ').toLowerCase(),
      });
    }

    const hotel = this.hotelSnapshotForActiveEstablishment();
    hits.push({
      id: 'hotel-info',
      kind: 'module_page',
      entityLabelKey: 'GLOBAL_SEARCH_KIND_HOTEL',
      primaryText: hotel.Name ?? 'الفندق',
      secondaryText: [hotel.NameEn, hotel.HotelCode, hotel.CityName].filter(Boolean).join(' · '),
      route: ['hotelInfo'],
      matchText: [hotel.Name, hotel.NameEn, hotel.HotelCode, hotel.CityName, hotel.Address, hotel.AddressEn].filter(Boolean).join(' ').toLowerCase(),
    });

    for (const b of this.mockBookings) {
      const bid = b.BookingID;
      if (bid == null) {
        continue;
      }
      const ref = b.BookingReference ?? `BK${bid}`;
      const rooms = (b.BookingRooms ?? []).map((br) => br.RoomNumber).filter(Boolean).join(', ');
      const floors = [...new Set((b.BookingRooms ?? []).map((br) => floorName(br.FloorNumber)).filter(Boolean))].join(', ');
      const pay = [b.PaidAmount != null ? `مدفوع ${b.PaidAmount}` : '', b.PendingAmount != null ? `معلق ${b.PendingAmount}` : ''].filter(Boolean).join(' · ');
      const secondary = [b.CustomerName, rooms && `غرف: ${rooms}`, floors && `طوابق: ${floors}`, pay].filter(Boolean).join(' · ');

      const isChildRow = b.ParentBookingID != null;
      hits.push({
        id: `booking-${bid}`,
        kind: isChildRow ? 'sub_booking' : 'booking',
        entityLabelKey: isChildRow ? 'GLOBAL_SEARCH_KIND_SUB_BOOKING' : 'GLOBAL_SEARCH_KIND_BOOKING',
        primaryText: ref,
        secondaryText: secondary,
        route: bookingRoute(b),
        queryParams: isChildRow ? { highlightBookingId: bid } : { bookingId: bid },
        matchText: bookingMatchText(b, ref, rooms, floors),
      });

      for (const sub of b.SubBookings ?? []) {
        const sid = sub.BookingID;
        if (sid == null) {
          continue;
        }
        const sref = sub.BookingReference ?? `SUB-${sid}`;
        const subRooms = (sub.BookingRooms ?? [])
          .map((br) => br.RoomNumber)
          .filter(Boolean)
          .join(', ');
        const subFloors = [...new Set((sub.BookingRooms ?? []).map((br) => floorName(br.FloorNumber)).filter(Boolean))].join(
          ', ',
        );
        hits.push({
          id: `sub-${bid}-${sid}`,
          kind: 'sub_booking',
          entityLabelKey: 'GLOBAL_SEARCH_KIND_SUB_BOOKING',
          primaryText: sref,
          secondaryText: sub.CustomerName ?? '',
          route: bookingRoute(b),
          queryParams: { highlightBookingId: sid },
          matchText: bookingMatchText(sub, sref, subRooms, subFloors),
        });
      }
    }

    for (const bb of this.mockB2BBookings) {
      const bbid = bb.BookingID;
      if (bbid == null) {
        continue;
      }
      const ref = bb.BookingReference ?? `B2B-${bbid}`;
      const guests = (bb.AssignedRooms ?? []).map((a) => [a.GuestName, a.RoomNumber].filter(Boolean).join(' ')).join(', ');
      hits.push({
        id: `b2b-${bbid}`,
        kind: 'b2b_booking',
        entityLabelKey: 'GLOBAL_SEARCH_KIND_B2B_BOOKING',
        primaryText: ref,
        secondaryText: [bb.EntityName, bb.Status, guests].filter(Boolean).join(' · '),
        route: ['bookings', 'create-b2b'],
        queryParams: { b2bBookingId: bbid },
        matchText: b2bBookingMatchText(bb, ref, guests),
      });
    }

    const navSeen = new Set<string>();
    const routeFix: Record<string, string> = {
      guests: 'customers',
      entities: 'companies-suppliers',
      suppliers: 'companies-suppliers',
      expenses: 'expenses-management',
      banks: 'banks-management',
      messaging: 'messages-management',
      integrations: 'integration',
    };

    const walkNav = (items: NavItem[], trailAr: string[]) => {
      for (const item of items) {
        const label = item.displayName || item.displayNameEn || '';
        const trail = label ? [...trailAr, label] : trailAr;
        if (item.route) {
          const path = routeFix[item.route] ?? item.route;
          if (navSeen.has(path)) {
            /* continue to children */
          } else {
            navSeen.add(path);
            const parentTrail = trail.length > 1 ? trail.slice(0, -1).join(' › ') : '';
            const secondary = [parentTrail, item.displayNameEn].filter(Boolean).join(' · ');
            hits.push({
              id: `nav-${path}`,
              kind: 'module_page',
              entityLabelKey: 'GLOBAL_SEARCH_KIND_MODULE',
              primaryText: item.displayName || item.displayNameEn || path,
              secondaryText: secondary || item.displayNameEn || path,
              route: [path],
              matchText: [item.displayName, item.displayNameEn, path, ...trail].filter(Boolean).join(' ').toLowerCase(),
            });
          }
        }
        if (item.children?.length) {
          walkNav(item.children, trail);
        }
      }
    };
    walkNav(SIDEBAR_CONFIG, []);

    const adminShortcuts: GlobalSearchHit[] = [
      {
        id: 'adm-users-list',
        kind: 'module_page',
        entityLabelKey: 'GLOBAL_SEARCH_KIND_ADMIN',
        primaryText: 'مستخدمي النظام',
        secondaryText: 'UsersList · Users management',
        route: ['UsersList'],
        matchText: 'userslist users مستخدمين المستخدمين صلاحيات admins'.toLowerCase(),
      },
      {
        id: 'adm-permissions',
        kind: 'module_page',
        entityLabelKey: 'GLOBAL_SEARCH_KIND_ADMIN',
        primaryText: 'الصلاحيات والأدوار',
        secondaryText: 'users-permissions',
        route: ['users-permissions'],
        matchText: 'permissions صلاحيات أدوار roles users-permissions'.toLowerCase(),
      },
      {
        id: 'adm-groups',
        kind: 'module_page',
        entityLabelKey: 'GLOBAL_SEARCH_KIND_ADMIN',
        primaryText: 'إدارة المجموعات',
        secondaryText: 'GroupManagement',
        route: ['GroupManagement'],
        matchText: 'group groups مجموعات GroupManagement'.toLowerCase(),
      },
      {
        id: 'adm-notifications',
        kind: 'module_page',
        entityLabelKey: 'GLOBAL_SEARCH_KIND_SUPPORT',
        primaryText: 'الرسائل ومركز التواصل',
        secondaryText: 'messages-management',
        route: ['messages-management'],
        matchText: 'notifications إشعارات دعم support alerts messages رسائل تواصل'.toLowerCase(),
      },
    ];
    hits.push(...adminShortcuts);

    const keywordHits: GlobalSearchHit[] = [
      {
        id: 'kw-invoice',
        kind: 'module_page',
        entityLabelKey: 'GLOBAL_SEARCH_KIND_FINANCE',
        primaryText: 'فواتير / تقارير مالية',
        secondaryText: 'financial-reports',
        route: ['financial-reports'],
        matchText: 'invoice فاتورة فواتير إيصال billing tax zatca'.toLowerCase(),
      },
      {
        id: 'kw-payment',
        kind: 'module_page',
        entityLabelKey: 'GLOBAL_SEARCH_KIND_FINANCE',
        primaryText: 'مدفوعات وتحصيل',
        secondaryText: 'account-statement · banks-management',
        route: ['account-statement'],
        matchText: 'payment دفع سداد تحصيل مدفوعات receipt voucher سند'.toLowerCase(),
      },
      {
        id: 'kw-coupon',
        kind: 'module_page',
        entityLabelKey: 'GLOBAL_SEARCH_KIND_PRICING',
        primaryText: 'عروض وعناصر خدمات',
        secondaryText: 'items-services · pricing',
        route: ['items-services'],
        matchText: 'coupon كوبون خصم عرض offer promo code'.toLowerCase(),
      },
      {
        id: 'kw-order',
        kind: 'module_page',
        entityLabelKey: 'GLOBAL_SEARCH_KIND_ORDER',
        primaryText: 'طلبات ومشتريات',
        secondaryText: 'companies-suppliers',
        route: ['companies-suppliers'],
        matchText: 'order ord طلب purchase order po ش order number'.toLowerCase(),
      },
      {
        id: 'kw-reports',
        kind: 'module_page',
        entityLabelKey: 'GLOBAL_SEARCH_KIND_REPORTS',
        primaryText: 'التقارير',
        secondaryText: 'reports',
        route: ['reports'],
        matchText: 'report تقارير analytics إحصائيات dashboard stats'.toLowerCase(),
      },
    ];
    hits.push(...keywordHits);

    return hits;
  }

  createPrimaryStockBooking(req: CreatePrimaryStockRequest): Observable<BookingModelSystemResponse> {
    const newBooking: BookingWithStock = {
      BookingID: 1000 + this.mockBookings.length + 1,
      IsEmptyFullBooking: true,
      TotalUnits: req.totalUnits,
      UsedUnits: 0,
      RemainingUnits: req.totalUnits,
      BookingReference: req.bookingReference ?? `STOCK-${Date.now()}`,
      CheckInDate: req.checkInDate,
      CheckOutDate: req.checkOutDate,
      TotalNights: req.totalNights,
      Notes: req.notes,
      HotelID: req.hotelID,
      IsActive: true,
      CreatedAt: new Date(),
    };
    this.mockBookings.push(newBooking);
    return of({ IsSuccess: true, Message: 'تم إنشاء حجز المخزون', ReturnedValue: newBooking }).pipe(delay(400));
  }

  deductStock(parentBookingId: number, requestedUnits: number): Observable<boolean> {
    const booking = this.mockBookings.find(b => b.BookingID === parentBookingId) as BookingWithStock | undefined;
    if (!booking) {
      return of(false).pipe(delay(200));
    }
    const current = booking.RemainingUnits ?? (booking.TotalUnits ?? 0) - (booking.UsedUnits ?? 0);
    booking.UsedUnits = (booking.UsedUnits ?? 0) + requestedUnits;
    booking.RemainingUnits = Math.max(0, current - requestedUnits);
    return of(true).pipe(delay(200));
  }

  createSubReservationFromStock(req: CreateSubReservationRequest): Observable<BookingModelSystemResponse> {
    const subBooking: BookingModel = {
      BookingID: 2000 + this.mockBookings.length + 1,
      ParentBookingID: req.parentBookingId,
      BookingReference: req.bookingReference ?? `SUB-${Date.now()}`,
      CheckInDate: req.checkInDate,
      CheckOutDate: req.checkOutDate,
      TotalNights: req.totalNights,
      Notes: req.notes,
      IsActive: true,
      CreatedAt: new Date(),
    };
    this.mockBookings.push(subBooking);
    return of({ IsSuccess: true, Message: 'تم إنشاء الحجز الفرعي', ReturnedValue: subBooking }).pipe(delay(400));
  }
}

