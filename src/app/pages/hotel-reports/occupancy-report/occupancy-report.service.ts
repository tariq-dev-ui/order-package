import { Injectable } from '@angular/core';

export type RoomType = 'Standard' | 'Deluxe' | 'Suite' | 'Premium' | 'Penthouse';
export type FloorKey = 'floor1' | 'floor2' | 'floor3' | 'penthouse';
export type RoomStatus = 'available' | 'booked' | 'checkin-today' | 'checkout-today' | 'maintenance';
export type ReservationStatus = 'confirmed' | 'checkin-today' | 'checkout-today' | 'cancelled';
export type PaymentStatus = 'paid' | 'pending' | 'partial';

export interface Room {
  id: string;
  number: string;
  type: RoomType;
  floor: FloorKey;
  floorLabel: string;
  status: RoomStatus;
  capacity: number;
  pricePerNight: number;
}

export interface Reservation {
  id: string;
  bookingNumber: string;
  roomId: string;
  guestName: string;
  guestPhone: string;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  status: ReservationStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  notes?: string;
}

export interface CalendarDay {
  date: Date;
  dayShort: string;
  dayNumber: number;
  monthShort: string;
  isToday: boolean;
  isWeekend: boolean;
}

export interface ReportSummary {
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
  maintenanceRooms: number;
  occupancyRate: number;
}

export interface CalendarSegment {
  type: 'reservation' | 'available';
  reservation: Reservation | null;
  span: number;
  dayDate: Date;
}

@Injectable({ providedIn: 'root' })
export class OccupancyReportService {
  private readonly TODAY = new Date(2026, 4, 19);

  getRooms(): Room[] {
    return [...MOCK_ROOMS];
  }

  getReservations(): Reservation[] {
    return [...MOCK_RESERVATIONS];
  }

  getReservationReport(startDate: Date, endDate: Date): { rooms: Room[]; reservations: Reservation[] } {
    return {
      rooms: this.getRooms(),
      reservations: this.getReservations().filter(
        r => r.checkOut > startDate && r.checkIn < endDate
      ),
    };
  }

  createQuickReservation(data: Partial<Reservation>): Reservation {
    const newReservation: Reservation = {
      id: `res-${Date.now()}`,
      bookingNumber: `BK-2026-${String(MOCK_RESERVATIONS.length + 1).padStart(4, '0')}`,
      roomId: data.roomId ?? '',
      guestName: data.guestName ?? '',
      guestPhone: data.guestPhone ?? '',
      checkIn: data.checkIn ?? new Date(),
      checkOut: data.checkOut ?? new Date(),
      nights: data.nights ?? 1,
      status: 'confirmed',
      paymentStatus: 'pending',
      totalAmount: data.totalAmount ?? 0,
      notes: data.notes,
    };
    MOCK_RESERVATIONS.push(newReservation);
    return newReservation;
  }

  exportReport(): void {
    // Future: generate PDF / Excel export
    console.log('Exporting occupancy report...');
  }

  getCalendarDays(startDate: Date, count = 14): CalendarDay[] {
    const AR_DAYS_SHORT = ['أحد', 'اثن', 'ثلا', 'أرب', 'خمي', 'جمع', 'سبت'];
    const AR_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    const todayTs = this.dateOnly(this.TODAY);

    return Array.from({ length: count }, (_, i) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      date.setHours(0, 0, 0, 0);
      return {
        date,
        dayShort: AR_DAYS_SHORT[date.getDay()],
        dayNumber: date.getDate(),
        monthShort: AR_MONTHS[date.getMonth()],
        isToday: date.getTime() === todayTs,
        isWeekend: date.getDay() === 5 || date.getDay() === 6,
      };
    });
  }

  getSummary(rooms: Room[]): ReportSummary {
    const total = rooms.length;
    const occupied = rooms.filter(
      r => r.status === 'booked' || r.status === 'checkin-today'
    ).length;
    const available = rooms.filter(
      r => r.status === 'available' || r.status === 'checkout-today'
    ).length;
    const maintenance = rooms.filter(r => r.status === 'maintenance').length;

    return {
      totalRooms: total,
      occupiedRooms: occupied,
      availableRooms: available,
      maintenanceRooms: maintenance,
      occupancyRate: total > 0 ? Math.round((occupied / total) * 100) : 0,
    };
  }

  dateOnly(date: Date): number {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_ROOMS: Room[] = [
  // طابق 1
  { id: 'r101', number: '101', type: 'Standard',  floor: 'floor1',    floorLabel: 'الطابق الأول',   status: 'available',      capacity: 2, pricePerNight: 350  },
  { id: 'r102', number: '102', type: 'Standard',  floor: 'floor1',    floorLabel: 'الطابق الأول',   status: 'booked',         capacity: 2, pricePerNight: 350  },
  { id: 'r103', number: '103', type: 'Deluxe',    floor: 'floor1',    floorLabel: 'الطابق الأول',   status: 'checkin-today',  capacity: 2, pricePerNight: 480  },
  { id: 'r104', number: '104', type: 'Deluxe',    floor: 'floor1',    floorLabel: 'الطابق الأول',   status: 'booked',         capacity: 3, pricePerNight: 480  },
  { id: 'r105', number: '105', type: 'Standard',  floor: 'floor1',    floorLabel: 'الطابق الأول',   status: 'maintenance',    capacity: 2, pricePerNight: 350  },
  { id: 'r106', number: '106', type: 'Standard',  floor: 'floor1',    floorLabel: 'الطابق الأول',   status: 'checkout-today', capacity: 2, pricePerNight: 350  },
  { id: 'r107', number: '107', type: 'Deluxe',    floor: 'floor1',    floorLabel: 'الطابق الأول',   status: 'available',      capacity: 2, pricePerNight: 480  },
  { id: 'r108', number: '108', type: 'Deluxe',    floor: 'floor1',    floorLabel: 'الطابق الأول',   status: 'booked',         capacity: 2, pricePerNight: 480  },
  // طابق 2
  { id: 'r201', number: '201', type: 'Suite',     floor: 'floor2',    floorLabel: 'الطابق الثاني',  status: 'booked',         capacity: 4, pricePerNight: 750  },
  { id: 'r202', number: '202', type: 'Deluxe',    floor: 'floor2',    floorLabel: 'الطابق الثاني',  status: 'available',      capacity: 2, pricePerNight: 480  },
  { id: 'r203', number: '203', type: 'Suite',     floor: 'floor2',    floorLabel: 'الطابق الثاني',  status: 'booked',         capacity: 4, pricePerNight: 750  },
  { id: 'r204', number: '204', type: 'Premium',   floor: 'floor2',    floorLabel: 'الطابق الثاني',  status: 'checkin-today',  capacity: 2, pricePerNight: 950  },
  { id: 'r205', number: '205', type: 'Deluxe',    floor: 'floor2',    floorLabel: 'الطابق الثاني',  status: 'booked',         capacity: 2, pricePerNight: 480  },
  { id: 'r206', number: '206', type: 'Suite',     floor: 'floor2',    floorLabel: 'الطابق الثاني',  status: 'maintenance',    capacity: 4, pricePerNight: 750  },
  { id: 'r207', number: '207', type: 'Premium',   floor: 'floor2',    floorLabel: 'الطابق الثاني',  status: 'available',      capacity: 2, pricePerNight: 950  },
  { id: 'r208', number: '208', type: 'Deluxe',    floor: 'floor2',    floorLabel: 'الطابق الثاني',  status: 'available',      capacity: 2, pricePerNight: 480  },
  // طابق 3
  { id: 'r301', number: '301', type: 'Suite',     floor: 'floor3',    floorLabel: 'الطابق الثالث',  status: 'booked',         capacity: 4, pricePerNight: 750  },
  { id: 'r302', number: '302', type: 'Premium',   floor: 'floor3',    floorLabel: 'الطابق الثالث',  status: 'available',      capacity: 2, pricePerNight: 950  },
  { id: 'r303', number: '303', type: 'Suite',     floor: 'floor3',    floorLabel: 'الطابق الثالث',  status: 'checkin-today',  capacity: 4, pricePerNight: 750  },
  { id: 'r304', number: '304', type: 'Premium',   floor: 'floor3',    floorLabel: 'الطابق الثالث',  status: 'booked',         capacity: 2, pricePerNight: 950  },
  { id: 'r305', number: '305', type: 'Suite',     floor: 'floor3',    floorLabel: 'الطابق الثالث',  status: 'available',      capacity: 4, pricePerNight: 750  },
  { id: 'r306', number: '306', type: 'Premium',   floor: 'floor3',    floorLabel: 'الطابق الثالث',  status: 'booked',         capacity: 2, pricePerNight: 950  },
  // بنتهاوس
  { id: 'rP01', number: 'P01', type: 'Penthouse', floor: 'penthouse', floorLabel: 'البنتهاوس',      status: 'booked',         capacity: 6, pricePerNight: 2500 },
  { id: 'rP02', number: 'P02', type: 'Penthouse', floor: 'penthouse', floorLabel: 'البنتهاوس',      status: 'available',      capacity: 6, pricePerNight: 2500 },
  { id: 'rP03', number: 'P03', type: 'Penthouse', floor: 'penthouse', floorLabel: 'البنتهاوس',      status: 'booked',         capacity: 6, pricePerNight: 2500 },
];

const d = (y: number, m: number, day: number) => new Date(y, m - 1, day);

const MOCK_RESERVATIONS: Reservation[] = [
  { id: 'res-001', bookingNumber: 'BK-2026-0001', roomId: 'r102', guestName: 'ماجد العتيبي',      guestPhone: '+966 55 123 4567', checkIn: d(2026,5,16), checkOut: d(2026,5,22), nights: 6,  status: 'confirmed',     paymentStatus: 'paid',    totalAmount: 2100,  notes: 'طلب وجبة إفطار يومية' },
  { id: 'res-002', bookingNumber: 'BK-2026-0002', roomId: 'r103', guestName: 'أحمد حسن',          guestPhone: '+966 50 987 6543', checkIn: d(2026,5,19), checkOut: d(2026,5,24), nights: 5,  status: 'checkin-today', paymentStatus: 'pending', totalAmount: 2400  },
  { id: 'res-003', bookingNumber: 'BK-2026-0003', roomId: 'r104', guestName: 'Sarah Wilson',       guestPhone: '+44 7700 900123',  checkIn: d(2026,5,17), checkOut: d(2026,5,25), nights: 8,  status: 'confirmed',     paymentStatus: 'paid',    totalAmount: 3840,  notes: 'Honeymoon couple' },
  { id: 'res-004', bookingNumber: 'BK-2026-0004', roomId: 'r106', guestName: 'محمد الراشد',        guestPhone: '+966 56 444 7890', checkIn: d(2026,5,15), checkOut: d(2026,5,19), nights: 4,  status: 'checkout-today',paymentStatus: 'paid',    totalAmount: 1400  },
  { id: 'res-005', bookingNumber: 'BK-2026-0005', roomId: 'r108', guestName: 'نورة الزهراني',      guestPhone: '+966 54 321 0987', checkIn: d(2026,5,20), checkOut: d(2026,5,27), nights: 7,  status: 'confirmed',     paymentStatus: 'partial', totalAmount: 3360  },
  { id: 'res-006', bookingNumber: 'BK-2026-0006', roomId: 'r201', guestName: 'فاطمة القحطاني',    guestPhone: '+966 55 667 8901', checkIn: d(2026,5,18), checkOut: d(2026,5,25), nights: 7,  status: 'confirmed',     paymentStatus: 'paid',    totalAmount: 5250,  notes: 'عائلة - سرير إضافي' },
  { id: 'res-007', bookingNumber: 'BK-2026-0007', roomId: 'r203', guestName: 'John Smith',         guestPhone: '+1 555 234 5678',  checkIn: d(2026,5,21), checkOut: d(2026,5,28), nights: 7,  status: 'confirmed',     paymentStatus: 'pending', totalAmount: 5250  },
  { id: 'res-008', bookingNumber: 'BK-2026-0008', roomId: 'r204', guestName: 'خالد إبراهيم',      guestPhone: '+966 50 111 2233', checkIn: d(2026,5,19), checkOut: d(2026,5,23), nights: 4,  status: 'checkin-today', paymentStatus: 'paid',    totalAmount: 3800  },
  { id: 'res-009', bookingNumber: 'BK-2026-0009', roomId: 'r205', guestName: 'عائشة المالكي',     guestPhone: '+966 56 789 0123', checkIn: d(2026,5,16), checkOut: d(2026,5,23), nights: 7,  status: 'confirmed',     paymentStatus: 'partial', totalAmount: 3360,  notes: 'خدمة الغرف يومياً' },
  { id: 'res-010', bookingNumber: 'BK-2026-0010', roomId: 'r301', guestName: 'عمر عبدالله',       guestPhone: '+966 55 456 7890', checkIn: d(2026,5,21), checkOut: d(2026,5,26), nights: 5,  status: 'confirmed',     paymentStatus: 'pending', totalAmount: 3750  },
  { id: 'res-011', bookingNumber: 'BK-2026-0011', roomId: 'r303', guestName: 'ياسر الشهري',       guestPhone: '+966 54 678 9012', checkIn: d(2026,5,19), checkOut: d(2026,5,28), nights: 9,  status: 'checkin-today', paymentStatus: 'partial', totalAmount: 6750,  notes: 'VIP - مجموعة عمل' },
  { id: 'res-012', bookingNumber: 'BK-2026-0012', roomId: 'r304', guestName: 'Robert Johnson',     guestPhone: '+1 555 876 5432',  checkIn: d(2026,5,22), checkOut: d(2026,5,30), nights: 8,  status: 'confirmed',     paymentStatus: 'paid',    totalAmount: 7600  },
  { id: 'res-013', bookingNumber: 'BK-2026-0013', roomId: 'r306', guestName: 'سلمى العسيري',      guestPhone: '+966 50 234 5678', checkIn: d(2026,5,23), checkOut: d(2026,5,29), nights: 6,  status: 'confirmed',     paymentStatus: 'pending', totalAmount: 5700  },
  { id: 'res-014', bookingNumber: 'BK-2026-0014', roomId: 'rP01', guestName: 'الأمير فيصل',       guestPhone: '+966 56 000 0001', checkIn: d(2026,5,17), checkOut: d(2026,5,31), nights: 14, status: 'confirmed',     paymentStatus: 'paid',    totalAmount: 35000, notes: 'VIP - خاصة جداً' },
  { id: 'res-015', bookingNumber: 'BK-2026-0015', roomId: 'rP03', guestName: 'عبدالله المحمد',    guestPhone: '+966 55 999 8877', checkIn: d(2026,5,25), checkOut: d(2026,6,2),  nights: 8,  status: 'confirmed',     paymentStatus: 'partial', totalAmount: 20000 },
  { id: 'res-016', bookingNumber: 'BK-2026-0016', roomId: 'r101', guestName: 'حمد الدوسري',       guestPhone: '+966 55 111 3344', checkIn: d(2026,5,24), checkOut: d(2026,5,28), nights: 4,  status: 'confirmed',     paymentStatus: 'pending', totalAmount: 1400  },
  { id: 'res-017', bookingNumber: 'BK-2026-0017', roomId: 'r202', guestName: 'Priya Sharma',       guestPhone: '+91 98765 43210',  checkIn: d(2026,5,26), checkOut: d(2026,6,1),  nights: 6,  status: 'confirmed',     paymentStatus: 'paid',    totalAmount: 2880  },
  { id: 'res-018', bookingNumber: 'BK-2026-0018', roomId: 'r207', guestName: 'سارة البلوي',       guestPhone: '+966 54 555 6677', checkIn: d(2026,5,22), checkOut: d(2026,5,26), nights: 4,  status: 'confirmed',     paymentStatus: 'paid',    totalAmount: 3800  },
  { id: 'res-019', bookingNumber: 'BK-2026-0019', roomId: 'r208', guestName: 'عبدالرحمن الغامدي', guestPhone: '+966 56 333 4455', checkIn: d(2026,5,20), checkOut: d(2026,5,25), nights: 5,  status: 'confirmed',     paymentStatus: 'partial', totalAmount: 2400  },
  { id: 'res-020', bookingNumber: 'BK-2026-0020', roomId: 'r302', guestName: 'Michael Brown',      guestPhone: '+1 555 567 8901',  checkIn: d(2026,5,27), checkOut: d(2026,6,3),  nights: 7,  status: 'confirmed',     paymentStatus: 'pending', totalAmount: 6650  },
  { id: 'res-021', bookingNumber: 'BK-2026-0021', roomId: 'r305', guestName: 'منيرة الحربي',      guestPhone: '+966 55 888 9900', checkIn: d(2026,5,23), checkOut: d(2026,5,30), nights: 7,  status: 'confirmed',     paymentStatus: 'paid',    totalAmount: 5250  },
  { id: 'res-022', bookingNumber: 'BK-2026-0022', roomId: 'rP02', guestName: 'وليد المطيري',      guestPhone: '+966 50 777 6655', checkIn: d(2026,5,29), checkOut: d(2026,6,5),  nights: 7,  status: 'confirmed',     paymentStatus: 'pending', totalAmount: 17500 },
];
