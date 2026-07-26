import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { NgStyle } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CalendarDay,
  CalendarSegment,
  OccupancyReportService,
  PaymentStatus,
  Reservation,
  ReservationStatus,
  Room,
  RoomStatus,
} from './occupancy-report.service';

interface QuickReservationForm {
  guestName: string;
  guestPhone: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  bookingType: string;
  notes: string;
}

@Component({
  selector: 'app-occupancy-report',
  standalone: true,
  imports: [FormsModule, NgStyle],
  templateUrl: './occupancy-report.component.html',
  styleUrl: './occupancy-report.component.scss',
})
export class OccupancyReportComponent implements OnInit {
  private svc = inject(OccupancyReportService);

  // ── Source Data ──────────────────────────────────────────────────────────────
  private readonly allRooms    = signal<Room[]>([]);
  private readonly allReservations = signal<Reservation[]>([]);

  // ── Filter State ─────────────────────────────────────────────────────────────
  readonly calendarStartDate = signal<Date>(new Date(2026, 4, 19));
  readonly selectedFloor     = signal<string>('all');
  readonly selectedRoomType  = signal<string>('all');
  readonly selectedStatus    = signal<string>('all');
  readonly datePreset        = signal<'today' | 'week' | 'month' | 'custom'>('today');
  readonly searchQuery       = signal<string>('');

  // ── UI State ─────────────────────────────────────────────────────────────────
  readonly isDetailModalOpen  = signal<boolean>(false);
  readonly isCreateModalOpen  = signal<boolean>(false);
  readonly selectedReservation = signal<Reservation | null>(null);
  readonly tooltipData        = signal<Reservation | null>(null);
  readonly tooltipPosition    = signal<{ top: number; left: number } | null>(null);
  readonly isRefreshing       = signal<boolean>(false);

  newReservation: QuickReservationForm = this.emptyForm();

  // ── Computed ─────────────────────────────────────────────────────────────────
  readonly calendarDays = computed<CalendarDay[]>(() =>
    this.svc.getCalendarDays(this.calendarStartDate(), 14)
  );

  readonly filteredRooms = computed<Room[]>(() => {
    let rooms = this.allRooms();
    const floor  = this.selectedFloor();
    const type   = this.selectedRoomType();
    const status = this.selectedStatus();
    const q      = this.searchQuery().toLowerCase().trim();

    if (floor  !== 'all') rooms = rooms.filter(r => r.floor === floor);
    if (type   !== 'all') rooms = rooms.filter(r => r.type  === type);
    if (status !== 'all') rooms = rooms.filter(r => r.status === status);

    if (q) {
      const matchedRoomIds = new Set(
        this.allReservations()
          .filter(res =>
            res.guestName.toLowerCase().includes(q) ||
            res.bookingNumber.toLowerCase().includes(q)
          )
          .map(res => res.roomId)
      );
      rooms = rooms.filter(r => r.number.toLowerCase().includes(q) || matchedRoomIds.has(r.id));
    }

    return rooms;
  });

  readonly summary = computed(() => this.svc.getSummary(this.allRooms()));

  readonly dateRangeLabel = computed<string>(() => {
    const days = this.calendarDays();
    if (!days.length) return '';
    const s = days[0];
    const e = days[days.length - 1];
    const year = this.calendarStartDate().getFullYear();
    return `${s.dayNumber} ${s.monthShort} – ${e.dayNumber} ${e.monthShort} ${year}`;
  });

  readonly roomSegments = computed<Map<string, CalendarSegment[]>>(() => {
    const map = new Map<string, CalendarSegment[]>();
    const days         = this.calendarDays();
    const reservations = this.allReservations();
    for (const room of this.filteredRooms()) {
      map.set(room.id, this.computeSegments(room, days, reservations));
    }
    return map;
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.allRooms.set(this.svc.getRooms());
    this.allReservations.set(this.svc.getReservations());
  }

  // ── Navigation ────────────────────────────────────────────────────────────────
  navigatePrev(): void {
    const d = new Date(this.calendarStartDate());
    d.setDate(d.getDate() - 14);
    this.calendarStartDate.set(d);
  }

  navigateNext(): void {
    const d = new Date(this.calendarStartDate());
    d.setDate(d.getDate() + 14);
    this.calendarStartDate.set(d);
  }

  goToToday(): void {
    this.calendarStartDate.set(new Date(2026, 4, 19));
    this.datePreset.set('today');
  }

  setDatePreset(preset: 'today' | 'week' | 'month' | 'custom'): void {
    this.datePreset.set(preset);
    this.calendarStartDate.set(new Date(2026, 4, 19));
  }

  // ── Calendar Actions ─────────────────────────────────────────────────────────
  onReservationClick(reservation: Reservation): void {
    this.tooltipData.set(null);
    this.selectedReservation.set(reservation);
    this.isDetailModalOpen.set(true);
  }

  onAvailableSlotClick(roomId: string, date: Date): void {
    this.newReservation = { ...this.emptyForm(), roomId, checkIn: this.toInputDate(date) };
    this.isCreateModalOpen.set(true);
  }

  onCellHover(reservation: Reservation, event: MouseEvent): void {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.tooltipData.set(reservation);
    this.tooltipPosition.set({
      top:  rect.bottom + window.scrollY + 10,
      left: Math.min(rect.left + window.scrollX, window.innerWidth - 340),
    });
  }

  onCellLeave(): void {
    this.tooltipData.set(null);
    this.tooltipPosition.set(null);
  }

  closeModals(): void {
    this.isDetailModalOpen.set(false);
    this.isCreateModalOpen.set(false);
    this.selectedReservation.set(null);
  }

  saveQuickReservation(): void {
    const form = this.newReservation;
    if (!form.guestName || !form.roomId || !form.checkIn || !form.checkOut) return;
    const checkIn  = new Date(form.checkIn);
    const checkOut = new Date(form.checkOut);
    const nights   = Math.round((checkOut.getTime() - checkIn.getTime()) / 86_400_000);
    const room     = this.allRooms().find(r => r.id === form.roomId);
    this.svc.createQuickReservation({
      roomId:   form.roomId,
      guestName: form.guestName,
      guestPhone: form.guestPhone,
      checkIn,
      checkOut,
      nights,
      totalAmount: (room?.pricePerNight ?? 0) * nights,
      notes: form.notes,
    });
    this.allReservations.set(this.svc.getReservations());
    this.closeModals();
  }

  exportReport(): void {
    this.svc.exportReport();
  }

  refreshData(): void {
    this.isRefreshing.set(true);
    setTimeout(() => {
      this.allRooms.set(this.svc.getRooms());
      this.allReservations.set(this.svc.getReservations());
      this.isRefreshing.set(false);
    }, 800);
  }

  // ── Getters ───────────────────────────────────────────────────────────────────
  getSegmentsForRoom(roomId: string): CalendarSegment[] {
    return this.roomSegments().get(roomId) ?? [];
  }

  getRoomById(roomId: string): Room | undefined {
    return this.allRooms().find(r => r.id === roomId);
  }

  getRoomLabel(roomId: string): string {
    const room = this.getRoomById(roomId);
    return room ? `${room.number} – ${room.floorLabel}` : roomId;
  }

  getStatusLabel(status: RoomStatus): string {
    const MAP: Record<RoomStatus, string> = {
      'available':      'متاحة',
      'booked':         'محجوزة',
      'checkin-today':  'وصول اليوم',
      'checkout-today': 'مغادرة اليوم',
      'maintenance':    'صيانة',
    };
    return MAP[status];
  }

  getReservationStatusLabel(status: ReservationStatus): string {
    const MAP: Record<ReservationStatus, string> = {
      'confirmed':     'مؤكد',
      'checkin-today': 'وصول اليوم',
      'checkout-today':'مغادرة اليوم',
      'cancelled':     'ملغي',
    };
    return MAP[status];
  }

  getPaymentLabel(status: PaymentStatus): string {
    const MAP: Record<PaymentStatus, string> = { paid: 'مدفوع', pending: 'معلق', partial: 'جزئي' };
    return MAP[status];
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric', month: 'long', day: 'numeric',
    }).format(new Date(date));
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency', currency: 'SAR',
      minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(amount);
  }

  occupancyBarStyle(): { width: string; background: string } {
    const rate = this.summary().occupancyRate;
    const color = rate >= 80 ? '#16a34a' : rate >= 50 ? '#d97706' : '#3a472a';
    return { width: `${rate}%`, background: color };
  }

  // ── Private Helpers ───────────────────────────────────────────────────────────
  private computeSegments(room: Room, days: CalendarDay[], reservations: Reservation[]): CalendarSegment[] {
    const segments: CalendarSegment[] = [];
    let i = 0;
    while (i < days.length) {
      const dayTs = this.svc.dateOnly(days[i].date);
      const activeRes = reservations.find(r =>
        r.roomId === room.id &&
        this.svc.dateOnly(r.checkIn)  <= dayTs &&
        this.svc.dateOnly(r.checkOut) >  dayTs
      );
      if (activeRes) {
        let span = 0;
        while (i + span < days.length && this.svc.dateOnly(days[i + span].date) < this.svc.dateOnly(activeRes.checkOut)) {
          span++;
        }
        span = Math.max(span, 1);
        segments.push({ type: 'reservation', reservation: activeRes, span, dayDate: days[i].date });
        i += span;
      } else {
        segments.push({ type: 'available', reservation: null, span: 1, dayDate: days[i].date });
        i++;
      }
    }
    return segments;
  }

  private toInputDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private emptyForm(): QuickReservationForm {
    return { guestName: '', guestPhone: '', roomId: '', checkIn: '', checkOut: '', bookingType: '', notes: '' };
  }
}
