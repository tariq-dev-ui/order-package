// Currently using local mock data for frontend prototype. Later this can be replaced with backend API.

import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component,
  computed, inject, OnInit, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators, FormGroup, AbstractControl } from '@angular/forms';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { dropdownSearchListComponent, SelectOption } from 'src/app/components/dropdown-search-list/dropdown-search-list.component';
import { LoadingSpinnerComponent } from 'src/app/components/loading-spinner/loading-spinner';

// ── Local Models ───────────────────────────────────────────────────────────

export interface ProviderLocalRef {
  ProviderID: number;
  Name: string;
}

export interface HotelLocalRef {
  HotelID: number;
  Name: string;
  Stars: number;
  Category: string;
  CityID: number;
  CityName: string;
  CountryName: string;
  LogoUrl: string | null;
}

export interface CityLocalRef {
  CityID: number;
  Name: string;
  CountryName: string;
  CountryID: number;
}

export interface SubscriptionRoomLocal {
  SubscriptionRoomID: number;
  RoomTypeName: string;
  RoomCount: number;
  AveragePrice: number;
  IsActive: boolean;
}

export interface ProviderSubscriptionLocalModel {
  ProviderSubscriptionID: number;
  ProviderID: number;
  ProviderName: string;
  HotelID: number;
  HotelName: string;
  HotelLogo: string | null;
  HotelStars: number;
  HotelCategory: string;
  CityID: number;
  CityName: string;
  CountryID: number;
  CountryName: string;
  SubscriptionTypeID: number;
  SubscriptionTypeName: string;
  PricingTypeID: number;
  PricingTypeName: string;
  PeriodFrom: Date;
  PeriodTo: Date;
  CommissionRate: number;
  IsActive: boolean;
  Rooms: SubscriptionRoomLocal[];
  AddedBy: string;
  CreatedDate: Date;
  ModifiedDate: Date | null;
  ModifiedBy: string | null;
}

// ── Mock Reference Data ────────────────────────────────────────────────────

const PROVIDERS_REF: ProviderLocalRef[] = [
  { ProviderID: 1, Name: 'Al Zahra Hotel Services' },
  { ProviderID: 2, Name: 'Madinah Hospitality Group' },
  { ProviderID: 3, Name: 'Gulf Hotels Distribution' },
  { ProviderID: 5, Name: 'Jeddah Coastal Resorts' },
  { ProviderID: 6, Name: 'Levant Stay Solutions' },
];

const CITIES_REF: CityLocalRef[] = [
  { CityID: 1, Name: 'Makkah',   CountryID: 1, CountryName: 'Saudi Arabia' },
  { CityID: 2, Name: 'Madinah',  CountryID: 1, CountryName: 'Saudi Arabia' },
  { CityID: 3, Name: 'Riyadh',   CountryID: 1, CountryName: 'Saudi Arabia' },
  { CityID: 4, Name: 'Jeddah',   CountryID: 1, CountryName: 'Saudi Arabia' },
  { CityID: 5, Name: 'Dubai',    CountryID: 2, CountryName: 'UAE' },
  { CityID: 6, Name: 'Abu Dhabi',CountryID: 2, CountryName: 'UAE' },
  { CityID: 7, Name: 'Amman',    CountryID: 3, CountryName: 'Jordan' },
  { CityID: 8, Name: 'Cairo',    CountryID: 4, CountryName: 'Egypt' },
];

const COUNTRIES_REF = [
  { id: 1, name: 'Saudi Arabia' },
  { id: 2, name: 'UAE' },
  { id: 3, name: 'Jordan' },
  { id: 4, name: 'Egypt' },
];

const HOTELS_REF: HotelLocalRef[] = [
  { HotelID: 1, Name: 'Makkah Clock Royal Tower', Stars: 5, Category: 'فندق فاخر', CityID: 1, CityName: 'Makkah', CountryName: 'Saudi Arabia', LogoUrl: null },
  { HotelID: 2, Name: 'Hilton Makkah Convention', Stars: 5, Category: 'فندق فاخر', CityID: 1, CityName: 'Makkah', CountryName: 'Saudi Arabia', LogoUrl: null },
  { HotelID: 3, Name: 'Anwar Al Madinah Movenpick', Stars: 5, Category: 'فندق فاخر', CityID: 2, CityName: 'Madinah', CountryName: 'Saudi Arabia', LogoUrl: null },
  { HotelID: 4, Name: 'Madinah Hilton Hotel', Stars: 4, Category: 'فندق راقٍ', CityID: 2, CityName: 'Madinah', CountryName: 'Saudi Arabia', LogoUrl: null },
  { HotelID: 5, Name: 'Burj Al Arab', Stars: 5, Category: 'فندق فاخر', CityID: 5, CityName: 'Dubai', CountryName: 'UAE', LogoUrl: null },
  { HotelID: 6, Name: 'Atlantis The Palm', Stars: 5, Category: 'منتجع فاخر', CityID: 5, CityName: 'Dubai', CountryName: 'UAE', LogoUrl: null },
  { HotelID: 7, Name: 'Four Seasons Amman', Stars: 5, Category: 'فندق فاخر', CityID: 7, CityName: 'Amman', CountryName: 'Jordan', LogoUrl: null },
  { HotelID: 8, Name: 'Sofitel Cairo', Stars: 5, Category: 'فندق فاخر', CityID: 8, CityName: 'Cairo', CountryName: 'Egypt', LogoUrl: null },
];

const SUBSCRIPTION_TYPES = [
  { id: 1, name: 'Allotment' },
  { id: 2, name: 'Free Sale' },
  { id: 3, name: 'On Request' },
];

const PRICING_TYPES = [
  { id: 1, name: 'Per Room' },
  { id: 2, name: 'Per Person' },
  { id: 3, name: 'Package' },
];

let MOCK_SUBSCRIPTIONS: ProviderSubscriptionLocalModel[] = [
  {
    ProviderSubscriptionID: 1, ProviderID: 1, ProviderName: 'Al Zahra Hotel Services',
    HotelID: 1, HotelName: 'Makkah Clock Royal Tower', HotelLogo: null, HotelStars: 5,
    HotelCategory: 'فندق فاخر', CityID: 1, CityName: 'Makkah', CountryID: 1, CountryName: 'Saudi Arabia',
    SubscriptionTypeID: 1, SubscriptionTypeName: 'Allotment',
    PricingTypeID: 1, PricingTypeName: 'Per Room',
    PeriodFrom: new Date('2025-01-01'), PeriodTo: new Date('2025-12-31'),
    CommissionRate: 10, IsActive: true,
    Rooms: [
      { SubscriptionRoomID: 1, RoomTypeName: 'Standard Room', RoomCount: 20, AveragePrice: 500, IsActive: true },
      { SubscriptionRoomID: 2, RoomTypeName: 'Deluxe Room', RoomCount: 10, AveragePrice: 800, IsActive: true },
    ],
    AddedBy: 'Admin', CreatedDate: new Date('2024-12-01'), ModifiedDate: null, ModifiedBy: null
  },
  {
    ProviderSubscriptionID: 2, ProviderID: 2, ProviderName: 'Madinah Hospitality Group',
    HotelID: 3, HotelName: 'Anwar Al Madinah Movenpick', HotelLogo: null, HotelStars: 5,
    HotelCategory: 'فندق فاخر', CityID: 2, CityName: 'Madinah', CountryID: 1, CountryName: 'Saudi Arabia',
    SubscriptionTypeID: 2, SubscriptionTypeName: 'Free Sale',
    PricingTypeID: 1, PricingTypeName: 'Per Room',
    PeriodFrom: new Date('2025-03-01'), PeriodTo: new Date('2025-11-30'),
    CommissionRate: 8, IsActive: true,
    Rooms: [
      { SubscriptionRoomID: 3, RoomTypeName: 'Single Room', RoomCount: 15, AveragePrice: 400, IsActive: true },
      { SubscriptionRoomID: 4, RoomTypeName: 'Twin Room', RoomCount: 8, AveragePrice: 600, IsActive: true },
    ],
    AddedBy: 'Admin', CreatedDate: new Date('2025-02-15'), ModifiedDate: null, ModifiedBy: null
  },
  {
    ProviderSubscriptionID: 3, ProviderID: 3, ProviderName: 'Gulf Hotels Distribution',
    HotelID: 5, HotelName: 'Burj Al Arab', HotelLogo: null, HotelStars: 5,
    HotelCategory: 'فندق فاخر', CityID: 5, CityName: 'Dubai', CountryID: 2, CountryName: 'UAE',
    SubscriptionTypeID: 1, SubscriptionTypeName: 'Allotment',
    PricingTypeID: 2, PricingTypeName: 'Per Person',
    PeriodFrom: new Date('2024-06-01'), PeriodTo: new Date('2024-12-31'),
    CommissionRate: 12, IsActive: false,
    Rooms: [
      { SubscriptionRoomID: 5, RoomTypeName: 'Junior Suite', RoomCount: 5, AveragePrice: 2000, IsActive: true },
    ],
    AddedBy: 'Admin', CreatedDate: new Date('2024-05-20'), ModifiedDate: null, ModifiedBy: null
  },
  {
    ProviderSubscriptionID: 4, ProviderID: 1, ProviderName: 'Al Zahra Hotel Services',
    HotelID: 2, HotelName: 'Hilton Makkah Convention', HotelLogo: null, HotelStars: 5,
    HotelCategory: 'فندق فاخر', CityID: 1, CityName: 'Makkah', CountryID: 1, CountryName: 'Saudi Arabia',
    SubscriptionTypeID: 3, SubscriptionTypeName: 'On Request',
    PricingTypeID: 3, PricingTypeName: 'Package',
    PeriodFrom: new Date('2026-01-01'), PeriodTo: new Date('2026-12-31'),
    CommissionRate: 15, IsActive: true,
    Rooms: [
      { SubscriptionRoomID: 6, RoomTypeName: 'Standard Room', RoomCount: 30, AveragePrice: 450, IsActive: true },
      { SubscriptionRoomID: 7, RoomTypeName: 'Suite', RoomCount: 5, AveragePrice: 1200, IsActive: false },
    ],
    AddedBy: 'Admin', CreatedDate: new Date('2025-11-01'), ModifiedDate: null, ModifiedBy: null
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function getSubscriptionStatus(sub: ProviderSubscriptionLocalModel): 'Active' | 'Pending' | 'Expired' {
  const now = new Date();
  if (now < new Date(sub.PeriodFrom)) return 'Pending';
  if (now > new Date(sub.PeriodTo))   return 'Expired';
  return 'Active';
}

function endDateValidator(control: AbstractControl) {
  const fg = control.parent as FormGroup | null;
  if (!fg) return null;
  const start = fg.get('StartDate')?.value;
  if (start && control.value && new Date(control.value) <= new Date(start)) {
    return { endBeforeStart: true };
  }
  return null;
}

// ── View Subscription Dialog ───────────────────────────────────────────────

@Component({
  selector: 'app-view-subscription-dialog',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative">
      <div class="border-b border-gray-100 p-5">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-semibold text-gray-900">
            <i class="fas fa-calendar-alt text-primary-500 me-2"></i>
            تفاصيل الاشتراك
          </h2>
          <button (click)="onClose()" class="text-gray-400 hover:text-gray-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p class="mt-1 text-sm text-gray-500">عرض معلومات الاشتراك</p>
      </div>

      <div class="max-h-[60vh] overflow-y-auto p-5 custom-scroll">
        @if (sub) {
          <div class="space-y-3">
            <!-- Header -->
            <div class="flex items-start gap-3 p-3 bg-primary-50 rounded-lg">
              <div class="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                <i class="fas fa-calendar-alt text-sm"></i>
              </div>
              <div class="min-w-0">
                <h3 class="font-medium text-gray-900 text-sm truncate">{{ sub.ProviderName }}</h3>
                <div class="flex items-center mt-1">
                  <i class="fas fa-tag text-primary-500 text-xs me-1"></i>
                  <p class="text-xs text-gray-600 truncate">{{ sub.SubscriptionTypeName }}</p>
                </div>
                <div class="flex flex-wrap gap-1 mt-1.5">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium" [class]="statusColor">{{ statusText }}</span>
                </div>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <!-- Hotel Info -->
              <div class="bg-white p-3 rounded-lg border border-gray-100">
                <div class="flex items-center text-primary-600 mb-1.5">
                  <i class="fas fa-building text-xs me-1.5"></i>
                  <span class="text-xs font-semibold">بيانات الفندق</span>
                </div>
                <div class="flex items-center space-x-3 mb-2">
                  <div class="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <i class="fas fa-hotel text-gray-400 text-sm"></i>
                  </div>
                  <div>
                    <p class="text-[11px] text-gray-500 font-medium">اسم الفندق</p>
                    <p class="text-xs text-black">{{ sub.HotelName }}</p>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <p class="text-[11px] text-gray-500 font-medium">التصنيف</p>
                    <p class="text-xs text-black">{{ sub.HotelCategory }}</p>
                  </div>
                  <div>
                    <p class="text-[11px] text-gray-500 font-medium">النجوم</p>
                    <p class="text-xs text-black">
                      @for (s of starsArray; track $index) {
                        <i class="fas fa-star text-yellow-500 text-xs"></i>
                      }
                    </p>
                  </div>
                  <div>
                    <p class="text-[11px] text-gray-500 font-medium">المدينة</p>
                    <p class="text-xs text-black">{{ sub.CityName }}</p>
                  </div>
                  <div>
                    <p class="text-[11px] text-gray-500 font-medium">الدولة</p>
                    <p class="text-xs text-black">{{ sub.CountryName }}</p>
                  </div>
                </div>
              </div>

              <!-- Period Info -->
              <div class="bg-white p-3 rounded-lg border border-gray-100">
                <div class="flex items-center text-primary-600 mb-1.5">
                  <i class="fas fa-calendar text-xs me-1.5"></i>
                  <span class="text-xs font-semibold">الفترة الزمنية</span>
                </div>
                <div class="space-y-1.5">
                  <div>
                    <p class="text-[11px] text-gray-500 font-medium">تاريخ البداية</p>
                    <p class="text-xs text-black">{{ sub.PeriodFrom | date:'dd-MM-yyyy' }}</p>
                  </div>
                  <div>
                    <p class="text-[11px] text-gray-500 font-medium">تاريخ الانتهاء</p>
                    <p class="text-xs text-black">{{ sub.PeriodTo | date:'dd-MM-yyyy' }}</p>
                  </div>
                  <div>
                    <p class="text-[11px] text-gray-500 font-medium">الحالة</p>
                    <p class="text-xs" [class]="statusColor">{{ statusText }}</p>
                  </div>
                </div>
              </div>

              <!-- Rooms Info -->
              <div class="bg-white p-3 rounded-lg border border-gray-100 md:col-span-2">
                <div class="flex items-center text-primary-600 mb-1.5">
                  <i class="fas fa-bed text-xs me-1.5"></i>
                  <span class="text-xs font-semibold">معلومات الغرف</span>
                </div>
                @if (sub.Rooms && sub.Rooms.length > 0) {
                  <div class="overflow-x-auto">
                    <table class="min-w-full divide-y divide-gray-200">
                      <thead class="bg-gray-50">
                        <tr>
                          <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">نوع الغرفة</th>
                          <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">العدد</th>
                          <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">متوسط السعر</th>
                          <th class="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">الحالة</th>
                        </tr>
                      </thead>
                      <tbody class="bg-white divide-y divide-gray-200">
                        @for (room of sub.Rooms; track room.SubscriptionRoomID) {
                          <tr>
                            <td class="px-2 py-2 text-xs text-gray-900">{{ room.RoomTypeName }}</td>
                            <td class="px-2 py-2 text-xs text-gray-900">{{ room.RoomCount }}</td>
                            <td class="px-2 py-2 text-xs text-gray-900">{{ room.AveragePrice | number:'1.2-2' }} <span class="text-gray-500 sar-symbol">R</span></td>
                            <td class="px-2 py-2">
                              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                                [class]="room.IsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                                {{ room.IsActive ? 'نشط' : 'غير نشط' }}
                              </span>
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                } @else {
                  <p class="text-xs text-gray-500">لا توجد معلومات عن الغرف</p>
                }
              </div>

              <!-- Audit Info -->
              <div class="bg-white p-3 rounded-lg border border-gray-100">
                <div class="flex items-center text-primary-600 mb-1.5">
                  <i class="fas fa-history text-xs me-1.5"></i>
                  <span class="text-xs font-semibold">معلومات التدقيق</span>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <p class="text-[11px] text-gray-500 font-medium">تاريخ الإنشاء</p>
                    <p class="text-xs text-black">{{ sub.CreatedDate | date:'dd-MM-yyyy' }}</p>
                  </div>
                  <div>
                    <p class="text-[11px] text-gray-500 font-medium">أضيف بواسطة</p>
                    <p class="text-xs text-black">{{ sub.AddedBy }}</p>
                  </div>
                </div>
              </div>

              <!-- Subscription Details -->
              <div class="bg-white p-3 rounded-lg border border-gray-100">
                <div class="flex items-center text-primary-600 mb-1.5">
                  <i class="fas fa-info-circle text-xs me-1.5"></i>
                  <span class="text-xs font-semibold">تفاصيل الاشتراك</span>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div>
                    <p class="text-[11px] text-gray-500 font-medium">المزود</p>
                    <p class="text-xs text-black truncate">{{ sub.ProviderName }}</p>
                  </div>
                  <div>
                    <p class="text-[11px] text-gray-500 font-medium">نوع الاشتراك</p>
                    <p class="text-xs text-black truncate">{{ sub.SubscriptionTypeName }}</p>
                  </div>
                  <div>
                    <p class="text-[11px] text-gray-500 font-medium">نوع التسعير</p>
                    <p class="text-xs text-black truncate">{{ sub.PricingTypeName }}</p>
                  </div>
                  <div>
                    <p class="text-[11px] text-gray-500 font-medium">نسبة العمولة</p>
                    <p class="text-xs text-black">{{ sub.CommissionRate }}%</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        }
      </div>

      <div class="flex justify-end items-center p-5 border-t border-gray-100">
        <button type="button" (click)="onClose()"
          class="px-5 py-3 text-sm font-medium rounded-lg bg-primary-500 text-white hover:bg-primary-600 focus:outline-none transition-all shadow-sm">
          <i class="fas fa-times me-2"></i>إغلاق
        </button>
      </div>
    </div>
  `
})
export class ViewSubscriptionDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ViewSubscriptionDialogComponent>);
  readonly data = inject(MAT_DIALOG_DATA) as { subscription: ProviderSubscriptionLocalModel };

  get sub() { return this.data.subscription; }
  get statusText() { return getSubscriptionStatus(this.sub) === 'Active' ? 'نشط' : getSubscriptionStatus(this.sub) === 'Pending' ? 'قادم' : 'منتهي'; }
  get statusColor() {
    const s = getSubscriptionStatus(this.sub);
    return s === 'Active' ? 'text-green-600' : s === 'Pending' ? 'text-yellow-600' : 'text-red-600';
  }
  get starsArray() { return Array(this.sub.HotelStars).fill(0); }
  onClose() { this.dialogRef.close(); }
}

// ── Create Subscription Dialog ─────────────────────────────────────────────

@Component({
  selector: 'app-create-subscription-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, dropdownSearchListComponent,
    MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative">
      <div class="flex items-center gap-3 p-5 border-b border-gray-100">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center">
          <i class="fas fa-plus text-lg"></i>
        </div>
        <div class="flex-1">
          <h2 class="text-xl font-bold">إضافة اشتراك جديد</h2>
          <p class="text-sm text-gray-500">أدخل تفاصيل الاشتراك أدناه</p>
        </div>
        <button (click)="onClose()" class="text-gray-400 hover:text-gray-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="max-h-[70vh] overflow-y-auto custom-scroll relative">
          @if (isSubmitting()) {
            <div class="w-full bg-black/20 min-h-[70vh]">
              <loading-spinner [isLoading]="isSubmitting()" [message]="'جاري الحفظ...'" />
            </div>
          } @else {
            <div class="space-y-6 p-5">

              <!-- Provider + Subscription Type -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <i class="fas fa-building text-primary-500"></i><span>المزود <span class="text-red-500">*</span></span>
                  </label>
                  <dropdown-search-list [options]="providerOptions" [isOptionsLoading]="isLoadingProviders"
                    placeholder="اختر المزود" [selectedId]="selectedProvider()"
                    (selectionChanged)="onProviderChange($event)"></dropdown-search-list>
                  @if (form.controls.ProviderID.invalid && (form.controls.ProviderID.touched || form.controls.ProviderID.dirty)) {
                    <div class="text-red-500 text-xs mt-1"><span>المزود مطلوب</span></div>
                  }
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <i class="fas fa-tags text-primary-500"></i><span>نوع الاشتراك <span class="text-red-500">*</span></span>
                  </label>
                  <dropdown-search-list [options]="subscriptionTypeOptions" [isOptionsLoading]="isLoadingTypes"
                    placeholder="اختر نوع الاشتراك" [selectedId]="selectedSubscriptionType()"
                    (selectionChanged)="onSubscriptionTypeChange($event)"></dropdown-search-list>
                  @if (form.controls.SubscriptionTypeID.invalid && (form.controls.SubscriptionTypeID.touched || form.controls.SubscriptionTypeID.dirty)) {
                    <div class="text-red-500 text-xs mt-1"><span>نوع الاشتراك مطلوب</span></div>
                  }
                </div>
              </div>

              <!-- Start + End Date -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <i class="fas fa-calendar-alt text-primary-500"></i><span>تاريخ البداية <span class="text-red-500">*</span></span>
                  </label>
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>تاريخ البداية</mat-label>
                    <input matInput [matDatepicker]="startPicker" formControlName="StartDate">
                    <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                    <mat-datepicker #startPicker></mat-datepicker>
                    @if (form.controls.StartDate.invalid && (form.controls.StartDate.touched || form.controls.StartDate.dirty)) {
                      <mat-error>التاريخ مطلوب</mat-error>
                    }
                  </mat-form-field>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <i class="fas fa-calendar-check text-primary-500"></i><span>تاريخ الانتهاء <span class="text-red-500">*</span></span>
                  </label>
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>تاريخ الانتهاء</mat-label>
                    <input matInput [matDatepicker]="endPicker" formControlName="EndDate">
                    <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                    <mat-datepicker #endPicker></mat-datepicker>
                    @if (form.controls.EndDate.invalid && (form.controls.EndDate.touched || form.controls.EndDate.dirty)) {
                      <mat-error>
                        @if (form.controls.EndDate.errors?.['required']) { التاريخ مطلوب }
                        @else if (form.controls.EndDate.errors?.['endBeforeStart']) { يجب أن يكون بعد تاريخ البداية }
                      </mat-error>
                    }
                  </mat-form-field>
                </div>
                @if (nightsCount > 0) {
                  <div class="flex items-center gap-2 text-sm text-gray-600">
                    <i class="fas fa-moon text-primary-500"></i>
                    <span>عدد الليالي: <strong>{{ nightsCount }}</strong></span>
                  </div>
                }
              </div>

              <hr class="border-gray-100">

              <!-- Country + City + Hotel -->
              <div class="flex flex-wrap gap-3">
                <div class="flex-1 min-w-[250px]">
                  <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <i class="fas fa-globe text-primary-500"></i><span>الدولة <span class="text-red-500">*</span></span>
                  </label>
                  <dropdown-search-list [options]="countryOptions" [isOptionsLoading]="isLoadingCountries"
                    placeholder="اختر الدولة" [selectedId]="selectedCountry()"
                    (selectionChanged)="onCountryChange($event)"></dropdown-search-list>
                  @if (form.controls.CountryID.invalid && (form.controls.CountryID.touched || form.controls.CountryID.dirty)) {
                    <div class="text-red-500 text-xs mt-1"><span>الدولة مطلوبة</span></div>
                  }
                </div>
                <div class="flex-1 min-w-[250px]">
                  <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <i class="fas fa-city text-primary-500"></i><span>المدينة <span class="text-red-500">*</span></span>
                  </label>
                  <dropdown-search-list [options]="cityOptions" [isOptionsLoading]="isLoadingCities"
                    [placeholder]="!selectedCountry() ? 'اختر الدولة أولاً' : 'اختر المدينة'"
                    [selectedId]="selectedCity()"
                    (selectionChanged)="onCityChange($event)"
                    [disabled]="!selectedCountry()"></dropdown-search-list>
                  @if (form.controls.CityID.invalid && (form.controls.CityID.touched || form.controls.CityID.dirty)) {
                    <div class="text-red-500 text-xs mt-1"><span>المدينة مطلوبة</span></div>
                  }
                </div>
                <div class="flex-1 min-w-[250px]">
                  <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <i class="fas fa-hotel text-primary-500"></i><span>الفندق <span class="text-red-500">*</span></span>
                  </label>
                  <dropdown-search-list [options]="hotelOptions" [isOptionsLoading]="isLoadingHotels"
                    [placeholder]="!selectedCity() ? 'اختر المدينة أولاً' : 'اختر الفندق'"
                    [selectedId]="selectedHotel()"
                    (selectionChanged)="onHotelChange($event)"
                    [disabled]="!selectedCity()"></dropdown-search-list>
                  @if (form.controls.HotelID.invalid && (form.controls.HotelID.touched || form.controls.HotelID.dirty)) {
                    <div class="text-red-500 text-xs mt-1"><span>الفندق مطلوب</span></div>
                  }
                </div>
              </div>

              <!-- Pricing Type + Commission -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <i class="fas fa-money-bill text-primary-500"></i><span>نوع التسعير <span class="text-red-500">*</span></span>
                  </label>
                  <dropdown-search-list [options]="pricingTypeOptions" [isOptionsLoading]="isLoadingPricingTypes"
                    placeholder="اختر نوع التسعير" [selectedId]="selectedPricingType()"
                    (selectionChanged)="onPricingTypeChange($event)"></dropdown-search-list>
                  @if (form.controls.PricingTypeID.invalid && (form.controls.PricingTypeID.touched || form.controls.PricingTypeID.dirty)) {
                    <div class="text-red-500 text-xs mt-1"><span>نوع التسعير مطلوب</span></div>
                  }
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <i class="fas fa-percentage text-primary-500"></i><span>نسبة العمولة (%) <span class="text-red-500">*</span></span>
                  </label>
                  <div class="relative">
                    <input type="number" formControlName="CommissionRate" min="0" max="100" step="0.01"
                      class="w-full placeholder-gray-400 p-3 h-14 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                      placeholder="أدخل نسبة العمولة">
                    <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <span class="text-gray-500 text-sm">%</span>
                    </div>
                  </div>
                  @if (form.controls.CommissionRate.invalid && (form.controls.CommissionRate.touched || form.controls.CommissionRate.dirty)) {
                    <div class="text-red-500 text-xs mt-1">
                      @if (form.controls.CommissionRate.errors?.['required']) { <span>نسبة العمولة مطلوبة</span> }
                      @if (form.controls.CommissionRate.errors?.['max']) { <span>لا يمكن أن تتجاوز 100%</span> }
                    </div>
                  }
                </div>
              </div>

            </div>
          }
        </div>

        <div class="flex justify-end items-center gap-3 p-5 border-t border-gray-100">
          <button type="button" (click)="onClose()"
            class="cursor-pointer px-6 py-3 text-sm font-medium border border-gray-200 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-200 transition-all">
            <i class="fas fa-times me-2"></i>إلغاء
          </button>
          <button type="submit" [disabled]="form.invalid"
            class="cursor-pointer px-6 py-3 text-sm font-medium border border-transparent rounded-lg bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            <i class="fas fa-plus me-2"></i>إضافة الاشتراك
          </button>
        </div>
      </form>
    </div>
  `
})
export class CreateSubscriptionDialogComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CreateSubscriptionDialogComponent>);

  readonly isSubmitting = signal(false);
  readonly selectedProvider = signal<number | null>(null);
  readonly selectedSubscriptionType = signal<number | null>(null);
  readonly selectedPricingType = signal<number | null>(null);
  readonly selectedCountry = signal<number | null>(null);
  readonly selectedCity = signal<number | null>(null);
  readonly selectedHotel = signal<number | null>(null);

  readonly isLoadingProviders    = signal(false);
  readonly isLoadingTypes        = signal(false);
  readonly isLoadingPricingTypes = signal(false);
  readonly isLoadingCountries    = signal(false);
  readonly isLoadingCities       = signal(false);
  readonly isLoadingHotels       = signal(false);

  readonly providerOptions          = computed<SelectOption[]>(() => PROVIDERS_REF.map(p => ({ id: p.ProviderID, label: p.Name })));
  readonly subscriptionTypeOptions  = computed<SelectOption[]>(() => SUBSCRIPTION_TYPES.map(t => ({ id: t.id, label: t.name })));
  readonly pricingTypeOptions       = computed<SelectOption[]>(() => PRICING_TYPES.map(t => ({ id: t.id, label: t.name })));
  readonly countryOptions           = computed<SelectOption[]>(() => COUNTRIES_REF.map(c => ({ id: c.id, label: c.name })));
  readonly cityOptions              = computed<SelectOption[]>(() =>
    CITIES_REF.filter(c => c.CountryID === this.selectedCountry()).map(c => ({ id: c.CityID, label: c.Name }))
  );
  readonly hotelOptions             = computed<SelectOption[]>(() =>
    HOTELS_REF.filter(h => h.CityID === this.selectedCity()).map(h => ({ id: h.HotelID, label: h.Name }))
  );

  readonly form = this.fb.group({
    ProviderID:         this.fb.control<number | null>(null, [Validators.required]),
    SubscriptionTypeID: this.fb.control<number | null>(null, [Validators.required]),
    PricingTypeID:      this.fb.control<number | null>(null, [Validators.required]),
    StartDate:          this.fb.control<Date | null>(null, [Validators.required]),
    EndDate:            this.fb.control<Date | null>(null, [Validators.required, endDateValidator]),
    CountryID:          this.fb.control<number | null>(null, [Validators.required]),
    CityID:             this.fb.control<number | null>(null, [Validators.required]),
    HotelID:            this.fb.control<number | null>(null, [Validators.required]),
    CommissionRate:     this.fb.control<number | null>(null, [Validators.required, Validators.min(0), Validators.max(100)]),
  });

  get nightsCount(): number {
    const start = this.form.controls.StartDate.value;
    const end   = this.form.controls.EndDate.value;
    if (start && end) {
      const diff = new Date(end).getTime() - new Date(start).getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      return days > 0 ? days : 0;
    }
    return 0;
  }

  onProviderChange(opt: SelectOption | null) {
    this.selectedProvider.set(opt ? Number(opt.id) : null);
    this.form.patchValue({ ProviderID: opt ? Number(opt.id) : null });
  }
  onSubscriptionTypeChange(opt: SelectOption | null) {
    this.selectedSubscriptionType.set(opt ? Number(opt.id) : null);
    this.form.patchValue({ SubscriptionTypeID: opt ? Number(opt.id) : null });
  }
  onPricingTypeChange(opt: SelectOption | null) {
    this.selectedPricingType.set(opt ? Number(opt.id) : null);
    this.form.patchValue({ PricingTypeID: opt ? Number(opt.id) : null });
  }
  onCountryChange(opt: SelectOption | null) {
    const id = opt ? Number(opt.id) : null;
    this.selectedCountry.set(id);
    this.selectedCity.set(null);
    this.selectedHotel.set(null);
    this.form.patchValue({ CountryID: id, CityID: null, HotelID: null });
  }
  onCityChange(opt: SelectOption | null) {
    const id = opt ? Number(opt.id) : null;
    this.selectedCity.set(id);
    this.selectedHotel.set(null);
    this.form.patchValue({ CityID: id, HotelID: null });
  }
  onHotelChange(opt: SelectOption | null) {
    const id = opt ? Number(opt.id) : null;
    this.selectedHotel.set(id);
    this.form.patchValue({ HotelID: id });
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.isSubmitting.set(true);
    const v = this.form.getRawValue();
    const provider = PROVIDERS_REF.find(p => p.ProviderID === v.ProviderID);
    const hotel    = HOTELS_REF.find(h => h.HotelID === v.HotelID);
    const city     = CITIES_REF.find(c => c.CityID === v.CityID);
    const subType  = SUBSCRIPTION_TYPES.find(t => t.id === v.SubscriptionTypeID);
    const pricType = PRICING_TYPES.find(t => t.id === v.PricingTypeID);
    const nextId   = Math.max(...MOCK_SUBSCRIPTIONS.map(s => s.ProviderSubscriptionID), 0) + 1;
    const newSub: ProviderSubscriptionLocalModel = {
      ProviderSubscriptionID: nextId,
      ProviderID: v.ProviderID!, ProviderName: provider?.Name ?? '',
      HotelID: v.HotelID!, HotelName: hotel?.Name ?? '',
      HotelLogo: null, HotelStars: hotel?.Stars ?? 0, HotelCategory: hotel?.Category ?? '',
      CityID: v.CityID!, CityName: city?.Name ?? '',
      CountryID: v.CountryID!, CountryName: city?.CountryName ?? '',
      SubscriptionTypeID: v.SubscriptionTypeID!, SubscriptionTypeName: subType?.name ?? '',
      PricingTypeID: v.PricingTypeID!, PricingTypeName: pricType?.name ?? '',
      PeriodFrom: v.StartDate!, PeriodTo: v.EndDate!,
      CommissionRate: v.CommissionRate!,
      IsActive: true, Rooms: [],
      AddedBy: 'Admin', CreatedDate: new Date(), ModifiedDate: null, ModifiedBy: null
    };
    of(newSub).pipe(delay(500)).subscribe(s => {
      MOCK_SUBSCRIPTIONS = [s, ...MOCK_SUBSCRIPTIONS];
      this.isSubmitting.set(false);
      this.dialogRef.close(true);
    });
  }

  onClose() { this.dialogRef.close(); }
}

// ── Edit Subscription Dialog ───────────────────────────────────────────────

@Component({
  selector: 'app-edit-subscription-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, dropdownSearchListComponent,
    MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative">
      <div class="flex items-center gap-3 p-5 border-b border-gray-100">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center">
          <i class="fas fa-edit text-lg"></i>
        </div>
        <div class="flex-1">
          <h2 class="text-xl font-bold">تعديل الاشتراك</h2>
          <p class="text-sm text-gray-500">تحديث تفاصيل الاشتراك</p>
        </div>
        <button (click)="onClose()" class="text-gray-400 hover:text-gray-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="max-h-[70vh] overflow-y-auto custom-scroll relative">
          @if (isSubmitting()) {
            <div class="w-full bg-black/20 min-h-[70vh]">
              <loading-spinner [isLoading]="isSubmitting()" [message]="'جاري التحديث...'" />
            </div>
          } @else {
            <div class="space-y-6 p-5">

              <!-- Provider + Subscription Type -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <i class="fas fa-building text-primary-500"></i><span>المزود</span>
                  </label>
                  <dropdown-search-list [options]="providerOptions" [isOptionsLoading]="isLoadingProviders"
                    placeholder="اختر المزود" [selectedId]="selectedProvider()"
                    (selectionChanged)="onProviderChange($event)"></dropdown-search-list>
                  @if (form.controls.ProviderID.invalid && (form.controls.ProviderID.touched || form.controls.ProviderID.dirty)) {
                    <div class="text-red-500 text-xs mt-1"><span>المزود مطلوب</span></div>
                  }
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <i class="fas fa-tags text-primary-500"></i><span>نوع الاشتراك</span>
                  </label>
                  <dropdown-search-list [options]="subscriptionTypeOptions" [isOptionsLoading]="isLoadingTypes"
                    placeholder="اختر نوع الاشتراك" [selectedId]="selectedSubscriptionType()"
                    (selectionChanged)="onSubscriptionTypeChange($event)"></dropdown-search-list>
                  @if (form.controls.SubscriptionTypeID.invalid && (form.controls.SubscriptionTypeID.touched || form.controls.SubscriptionTypeID.dirty)) {
                    <div class="text-red-500 text-xs mt-1"><span>نوع الاشتراك مطلوب</span></div>
                  }
                </div>
              </div>

              <!-- Start + End Date -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <i class="fas fa-calendar-alt text-primary-500"></i><span>تاريخ البداية</span>
                  </label>
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>تاريخ البداية</mat-label>
                    <input matInput [matDatepicker]="startPicker" formControlName="StartDate">
                    <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                    <mat-datepicker #startPicker></mat-datepicker>
                    @if (form.controls.StartDate.invalid && (form.controls.StartDate.touched || form.controls.StartDate.dirty)) {
                      <mat-error>التاريخ مطلوب</mat-error>
                    }
                  </mat-form-field>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <i class="fas fa-calendar-check text-primary-500"></i><span>تاريخ الانتهاء</span>
                  </label>
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>تاريخ الانتهاء</mat-label>
                    <input matInput [matDatepicker]="endPicker" formControlName="EndDate">
                    <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                    <mat-datepicker #endPicker></mat-datepicker>
                    @if (form.controls.EndDate.invalid && (form.controls.EndDate.touched || form.controls.EndDate.dirty)) {
                      <mat-error>
                        @if (form.controls.EndDate.errors?.['required']) { التاريخ مطلوب }
                        @else if (form.controls.EndDate.errors?.['endBeforeStart']) { يجب أن يكون بعد تاريخ البداية }
                      </mat-error>
                    }
                  </mat-form-field>
                </div>
                @if (nightsCount > 0) {
                  <div class="flex items-center gap-2 text-sm text-gray-600 mt-[-20px]">
                    <i class="fas fa-moon text-primary-500"></i>
                    <span>عدد الليالي: <strong>{{ nightsCount }}</strong></span>
                  </div>
                }
              </div>

              <hr class="border-gray-100">

              <!-- Country + City + Hotel -->
              <div class="flex flex-wrap gap-3">
                <div class="flex-1 min-w-[250px]">
                  <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <i class="fas fa-globe text-primary-500"></i><span>الدولة</span>
                  </label>
                  <dropdown-search-list [options]="countryOptions" [isOptionsLoading]="isLoadingCountries"
                    placeholder="اختر الدولة" [selectedId]="selectedCountry()"
                    (selectionChanged)="onCountryChange($event)"></dropdown-search-list>
                  @if (form.controls.CountryID.invalid && (form.controls.CountryID.touched || form.controls.CountryID.dirty)) {
                    <div class="text-red-500 text-xs mt-1"><span>الدولة مطلوبة</span></div>
                  }
                </div>
                <div class="flex-1 min-w-[250px]">
                  <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <i class="fas fa-city text-primary-500"></i><span>المدينة</span>
                  </label>
                  <dropdown-search-list [options]="cityOptions" [isOptionsLoading]="isLoadingCities"
                    [placeholder]="!selectedCountry() ? 'اختر الدولة أولاً' : 'اختر المدينة'"
                    [selectedId]="selectedCity()"
                    (selectionChanged)="onCityChange($event)"
                    [disabled]="!selectedCountry()"></dropdown-search-list>
                  @if (form.controls.CityID.invalid && (form.controls.CityID.touched || form.controls.CityID.dirty)) {
                    <div class="text-red-500 text-xs mt-1"><span>المدينة مطلوبة</span></div>
                  }
                </div>
                <div class="flex-1 min-w-[250px]">
                  <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <i class="fas fa-hotel text-primary-500"></i><span>الفندق</span>
                  </label>
                  <dropdown-search-list [options]="hotelOptions" [isOptionsLoading]="isLoadingHotels"
                    [placeholder]="!selectedCity() ? 'اختر المدينة أولاً' : 'اختر الفندق'"
                    [selectedId]="selectedHotel()"
                    (selectionChanged)="onHotelChange($event)"
                    [disabled]="!selectedCity()"></dropdown-search-list>
                  @if (form.controls.HotelID.invalid && (form.controls.HotelID.touched || form.controls.HotelID.dirty)) {
                    <div class="text-red-500 text-xs mt-1"><span>الفندق مطلوب</span></div>
                  }
                </div>
              </div>

              <!-- Pricing Type + Commission -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <i class="fas fa-money-bill text-primary-500"></i><span>نوع التسعير</span>
                  </label>
                  <dropdown-search-list [options]="pricingTypeOptions" [isOptionsLoading]="isLoadingPricingTypes"
                    placeholder="اختر نوع التسعير" [selectedId]="selectedPricingType()"
                    (selectionChanged)="onPricingTypeChange($event)"></dropdown-search-list>
                  @if (form.controls.PricingTypeID.invalid && (form.controls.PricingTypeID.touched || form.controls.PricingTypeID.dirty)) {
                    <div class="text-red-500 text-xs mt-1"><span>نوع التسعير مطلوب</span></div>
                  }
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <i class="fas fa-percentage text-primary-500"></i><span>نسبة العمولة (%)</span>
                  </label>
                  <div class="relative">
                    <input type="number" formControlName="CommissionRate" min="0" max="100" step="0.01"
                      class="w-full placeholder-gray-400 p-3 h-14 pr-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                      placeholder="أدخل نسبة العمولة">
                    <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <span class="text-gray-500 text-sm">%</span>
                    </div>
                  </div>
                  @if (form.controls.CommissionRate.invalid && (form.controls.CommissionRate.touched || form.controls.CommissionRate.dirty)) {
                    <div class="text-red-500 text-xs mt-1">
                      @if (form.controls.CommissionRate.errors?.['required']) { <span>نسبة العمولة مطلوبة</span> }
                      @if (form.controls.CommissionRate.errors?.['max']) { <span>لا يمكن أن تتجاوز 100%</span> }
                    </div>
                  }
                </div>
              </div>

              <!-- Active Status -->
              <div>
                <label class="checkbox-option cursor-pointer">
                  <input type="checkbox" formControlName="IsActive" class="custom-checkbox me-3">
                  <span>نشط</span>
                </label>
              </div>

            </div>
          }
        </div>

        <div class="flex justify-end items-center gap-3 p-5 border-t border-gray-100">
          <button type="button" (click)="onClose()"
            class="cursor-pointer px-6 py-3 text-sm font-medium border border-gray-200 rounded-lg bg-gray-50 text-gray-700 hover:bg-gray-200 transition-all">
            <i class="fas fa-times me-2"></i>إلغاء
          </button>
          <button type="submit" [disabled]="form.invalid"
            class="cursor-pointer px-6 py-3 text-sm font-medium border border-transparent rounded-lg bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
            <i class="fas fa-plus me-2"></i>تحديث الاشتراك
          </button>
        </div>
      </form>
    </div>
  `
})
export class EditSubscriptionDialogComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly dialogRef = inject(MatDialogRef<EditSubscriptionDialogComponent>);
  readonly data = inject(MAT_DIALOG_DATA) as { subscription: ProviderSubscriptionLocalModel };

  readonly isSubmitting = signal(false);
  readonly selectedProvider = signal<number | null>(null);
  readonly selectedSubscriptionType = signal<number | null>(null);
  readonly selectedPricingType = signal<number | null>(null);
  readonly selectedCountry = signal<number | null>(null);
  readonly selectedCity = signal<number | null>(null);
  readonly selectedHotel = signal<number | null>(null);

  readonly isLoadingProviders    = signal(false);
  readonly isLoadingTypes        = signal(false);
  readonly isLoadingPricingTypes = signal(false);
  readonly isLoadingCountries    = signal(false);
  readonly isLoadingCities       = signal(false);
  readonly isLoadingHotels       = signal(false);

  readonly providerOptions          = computed<SelectOption[]>(() => PROVIDERS_REF.map(p => ({ id: p.ProviderID, label: p.Name })));
  readonly subscriptionTypeOptions  = computed<SelectOption[]>(() => SUBSCRIPTION_TYPES.map(t => ({ id: t.id, label: t.name })));
  readonly pricingTypeOptions       = computed<SelectOption[]>(() => PRICING_TYPES.map(t => ({ id: t.id, label: t.name })));
  readonly countryOptions           = computed<SelectOption[]>(() => COUNTRIES_REF.map(c => ({ id: c.id, label: c.name })));
  readonly cityOptions              = computed<SelectOption[]>(() =>
    CITIES_REF.filter(c => c.CountryID === this.selectedCountry()).map(c => ({ id: c.CityID, label: c.Name }))
  );
  readonly hotelOptions             = computed<SelectOption[]>(() =>
    HOTELS_REF.filter(h => h.CityID === this.selectedCity()).map(h => ({ id: h.HotelID, label: h.Name }))
  );

  readonly form = this.fb.group({
    ProviderID:         this.fb.control<number | null>(null, [Validators.required]),
    SubscriptionTypeID: this.fb.control<number | null>(null, [Validators.required]),
    PricingTypeID:      this.fb.control<number | null>(null, [Validators.required]),
    StartDate:          this.fb.control<Date | null>(null, [Validators.required]),
    EndDate:            this.fb.control<Date | null>(null, [Validators.required, endDateValidator]),
    CountryID:          this.fb.control<number | null>(null, [Validators.required]),
    CityID:             this.fb.control<number | null>(null, [Validators.required]),
    HotelID:            this.fb.control<number | null>(null, [Validators.required]),
    CommissionRate:     this.fb.control<number | null>(null, [Validators.required, Validators.min(0), Validators.max(100)]),
    IsActive:           this.fb.control(true),
  });

  constructor() {
    const s = this.data.subscription;
    this.form.patchValue({
      ProviderID: s.ProviderID, SubscriptionTypeID: s.SubscriptionTypeID,
      PricingTypeID: s.PricingTypeID, StartDate: new Date(s.PeriodFrom), EndDate: new Date(s.PeriodTo),
      CountryID: s.CountryID, CityID: s.CityID, HotelID: s.HotelID,
      CommissionRate: s.CommissionRate, IsActive: s.IsActive,
    });
    this.selectedProvider.set(s.ProviderID);
    this.selectedSubscriptionType.set(s.SubscriptionTypeID);
    this.selectedPricingType.set(s.PricingTypeID);
    this.selectedCountry.set(s.CountryID);
    this.selectedCity.set(s.CityID);
    this.selectedHotel.set(s.HotelID);
  }

  get nightsCount(): number {
    const start = this.form.controls.StartDate.value;
    const end   = this.form.controls.EndDate.value;
    if (start && end) {
      const diff = new Date(end).getTime() - new Date(start).getTime();
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      return days > 0 ? days : 0;
    }
    return 0;
  }

  onProviderChange(opt: SelectOption | null) {
    this.selectedProvider.set(opt ? Number(opt.id) : null);
    this.form.patchValue({ ProviderID: opt ? Number(opt.id) : null });
  }
  onSubscriptionTypeChange(opt: SelectOption | null) {
    this.selectedSubscriptionType.set(opt ? Number(opt.id) : null);
    this.form.patchValue({ SubscriptionTypeID: opt ? Number(opt.id) : null });
  }
  onPricingTypeChange(opt: SelectOption | null) {
    this.selectedPricingType.set(opt ? Number(opt.id) : null);
    this.form.patchValue({ PricingTypeID: opt ? Number(opt.id) : null });
  }
  onCountryChange(opt: SelectOption | null) {
    const id = opt ? Number(opt.id) : null;
    this.selectedCountry.set(id);
    this.selectedCity.set(null);
    this.selectedHotel.set(null);
    this.form.patchValue({ CountryID: id, CityID: null, HotelID: null });
  }
  onCityChange(opt: SelectOption | null) {
    const id = opt ? Number(opt.id) : null;
    this.selectedCity.set(id);
    this.selectedHotel.set(null);
    this.form.patchValue({ CityID: id, HotelID: null });
  }
  onHotelChange(opt: SelectOption | null) {
    const id = opt ? Number(opt.id) : null;
    this.selectedHotel.set(id);
    this.form.patchValue({ HotelID: id });
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.isSubmitting.set(true);
    of(true).pipe(delay(500)).subscribe(() => {
      const v = this.form.getRawValue();
      const idx = MOCK_SUBSCRIPTIONS.findIndex(s => s.ProviderSubscriptionID === this.data.subscription.ProviderSubscriptionID);
      if (idx !== -1) {
        const provider = PROVIDERS_REF.find(p => p.ProviderID === v.ProviderID);
        const hotel    = HOTELS_REF.find(h => h.HotelID === v.HotelID);
        const city     = CITIES_REF.find(c => c.CityID === v.CityID);
        const subType  = SUBSCRIPTION_TYPES.find(t => t.id === v.SubscriptionTypeID);
        const pricType = PRICING_TYPES.find(t => t.id === v.PricingTypeID);
        MOCK_SUBSCRIPTIONS[idx] = {
          ...MOCK_SUBSCRIPTIONS[idx],
          ProviderID: v.ProviderID!, ProviderName: provider?.Name ?? '',
          HotelID: v.HotelID!, HotelName: hotel?.Name ?? '',
          HotelStars: hotel?.Stars ?? 0, HotelCategory: hotel?.Category ?? '',
          CityID: v.CityID!, CityName: city?.Name ?? '',
          CountryID: v.CountryID!, CountryName: city?.CountryName ?? '',
          SubscriptionTypeID: v.SubscriptionTypeID!, SubscriptionTypeName: subType?.name ?? '',
          PricingTypeID: v.PricingTypeID!, PricingTypeName: pricType?.name ?? '',
          PeriodFrom: v.StartDate!, PeriodTo: v.EndDate!,
          CommissionRate: v.CommissionRate!, IsActive: v.IsActive,
          ModifiedDate: new Date(), ModifiedBy: 'Admin',
        };
      }
      this.isSubmitting.set(false);
      this.dialogRef.close(true);
    });
  }

  onClose() { this.dialogRef.close(); }
}

// ── Confirm Delete Dialog ──────────────────────────────────────────────────

@Component({
  selector: 'app-confirm-delete-subscription-dialog',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6">
      <div class="flex items-center gap-3 mb-4">
        <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
          <i class="fas fa-trash text-red-500"></i>
        </div>
        <h2 class="text-lg font-bold text-gray-900">تأكيد الحذف</h2>
      </div>
      <p class="text-sm text-gray-600 mb-6">
        هل أنت متأكد من حذف اشتراك الفندق <strong>{{ data.subscription.HotelName }}</strong>؟ لا يمكن التراجع عن هذا الإجراء.
      </p>
      <div class="flex justify-end gap-3">
        <button (click)="cancel()" class="px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">إلغاء</button>
        <button (click)="confirm()" class="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">
          <i class="fas fa-trash me-1"></i> حذف
        </button>
      </div>
    </div>
  `
})
export class ConfirmDeleteSubscriptionDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ConfirmDeleteSubscriptionDialogComponent>);
  readonly data = inject(MAT_DIALOG_DATA) as { subscription: ProviderSubscriptionLocalModel };
  confirm() { this.dialogRef.close(true); }
  cancel()  { this.dialogRef.close(false); }
}

// ── Hotel Details Placeholder Dialog ──────────────────────────────────────

@Component({
  selector: 'app-hotel-details-dialog',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-6">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-xl font-bold text-gray-900 flex items-center gap-2">
          <i class="fas fa-hotel text-primary-500"></i>
          تفاصيل الفندق
        </h2>
        <button (click)="onClose()" class="text-gray-400 hover:text-gray-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="p-6 bg-primary-50 rounded-xl text-center">
        <i class="fas fa-hotel text-4xl text-primary-400 mb-3 block"></i>
        <p class="text-gray-600 font-medium">{{ data.hotelName }}</p>
        <p class="text-sm text-gray-400 mt-2">{{ data.cityName }}</p>
        <div class="flex justify-center mt-2">
          @for (s of starsArray; track $index) {
            <i class="fas fa-star text-yellow-500 text-sm"></i>
          }
        </div>
      </div>
      <div class="flex justify-end mt-4">
        <button (click)="onClose()" class="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">إغلاق</button>
      </div>
    </div>
  `
})
export class HotelDetailsDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<HotelDetailsDialogComponent>);
  readonly data = inject(MAT_DIALOG_DATA) as { hotelName: string; cityName: string; stars: number };
  get starsArray() { return Array(this.data.stars ?? 0).fill(0); }
  onClose() { this.dialogRef.close(); }
}

// ── Main Page Component ────────────────────────────────────────────────────

@Component({
  selector: 'app-hotel-subscriptions-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatDialogModule,
    dropdownSearchListComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="p-4 md:p-6">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">الاشتراكات</h1>
          <p class="text-sm text-gray-500 mt-1">إدارة اشتراكات مزودي الفنادق</p>
        </div>
        <button (click)="openCreateDialog()"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors shadow-sm font-medium text-sm">
          <i class="fas fa-plus"></i>
          <span>اشتراك جديد</span>
        </button>
      </div>

      <!-- Filter Panel -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <!-- Provider Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">المزود</label>
            <dropdown-search-list [options]="providerFilterOptions" [isOptionsLoading]="isProvidersLoading"
              placeholder="جميع المزودين" [selectedId]="filterProvider()"
              (selectionChanged)="onFilterProviderChange($event)"></dropdown-search-list>
          </div>
          <!-- City Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">المدينة</label>
            <dropdown-search-list [options]="cityFilterOptions" [isOptionsLoading]="isCitiesLoading"
              placeholder="جميع المدن" [selectedId]="filterCity()"
              (selectionChanged)="onFilterCityChange($event)"></dropdown-search-list>
          </div>
        </div>

        <!-- Advanced Filters -->
        @if (isAdvancedOpen()) {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3 pt-3 border-t border-gray-100">
            <!-- Hotel Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">الفندق</label>
              <dropdown-search-list [options]="hotelFilterOptions" [isOptionsLoading]="isHotelsLoading"
                placeholder="جميع الفنادق" [selectedId]="filterHotel()"
                (selectionChanged)="onFilterHotelChange($event)"></dropdown-search-list>
            </div>
            <!-- Status Filter -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">حالة الاشتراك</label>
              <dropdown-search-list [options]="statusFilterOptions" [isOptionsLoading]="isStatusLoading"
                placeholder="جميع الحالات" [selectedId]="filterStatus()"
                (selectionChanged)="onFilterStatusChange($event)"></dropdown-search-list>
            </div>
          </div>
        }

        <div class="flex items-center gap-2">
          <button (click)="clearFilters()"
            class="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm flex items-center gap-2">
            <i class="fas fa-times"></i><span>مسح</span>
          </button>
          <button (click)="toggleAdvanced()"
            class="px-4 py-2.5 border rounded-lg transition-colors text-sm flex items-center gap-2"
            [class]="isAdvancedOpen() ? 'border-primary-300 bg-primary-50 text-primary-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'">
            <i class="fas fa-sliders-h"></i>
            <span>{{ isAdvancedOpen() ? 'إخفاء البحث المتقدم' : 'البحث المتقدم' }}</span>
          </button>
          <button (click)="loadSubscriptions()"
            class="px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors text-sm flex items-center gap-2">
            <i class="fas fa-search"></i><span>بحث</span>
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        @if (isLoading()) {
          <div class="flex items-center justify-center py-20">
            <mat-spinner diameter="40"></mat-spinner>
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table mat-table [dataSource]="subscriptions()" class="w-full mat-elevation-z0">

              <!-- Hotel Name Column -->
              <ng-container matColumnDef="HotelName">
                <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-700" style="min-width:220px">الفندق</th>
                <td mat-cell *matCellDef="let row">
                  <div class="flex items-center gap-3 py-2">
                    <div class="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <i class="fas fa-hotel text-gray-400 text-sm"></i>
                    </div>
                    <div>
                      <button class="font-semibold text-primary-600 hover:text-primary-700 hover:underline text-sm text-start"
                        (click)="openHotelDetails(row)">
                        {{ row.HotelName }}
                      </button>
                      <div class="flex items-center mt-0.5">
                        @for (s of getStarsArray(row.HotelStars); track $index) {
                          <i class="fas fa-star text-yellow-500 text-[10px]"></i>
                        }
                        <span class="text-xs text-gray-400 ms-1">{{ row.HotelCategory }}</span>
                      </div>
                    </div>
                  </div>
                </td>
              </ng-container>

              <!-- Provider Column -->
              <ng-container matColumnDef="ProviderName">
                <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-700" style="min-width:160px">المزود</th>
                <td mat-cell *matCellDef="let row" class="text-sm text-gray-600">{{ row.ProviderName }}</td>
              </ng-container>

              <!-- City Column -->
              <ng-container matColumnDef="CityName">
                <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-700" style="min-width:130px">المدينة</th>
                <td mat-cell *matCellDef="let row">
                  <div>
                    <p class="text-sm text-gray-600">{{ row.CityName }}</p>
                    <p class="text-xs text-gray-400">{{ row.CountryName }}</p>
                  </div>
                </td>
              </ng-container>

              <!-- Period From Column -->
              <ng-container matColumnDef="PeriodFrom">
                <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-700" style="min-width:120px">من</th>
                <td mat-cell *matCellDef="let row" class="text-sm text-gray-600">{{ row.PeriodFrom | date:'dd-MM-yyyy' }}</td>
              </ng-container>

              <!-- Period To Column -->
              <ng-container matColumnDef="PeriodTo">
                <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-700" style="min-width:120px">إلى</th>
                <td mat-cell *matCellDef="let row" class="text-sm text-gray-600">{{ row.PeriodTo | date:'dd-MM-yyyy' }}</td>
              </ng-container>

              <!-- Status Column -->
              <ng-container matColumnDef="IsActive">
                <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-700" style="min-width:100px">الحالة</th>
                <td mat-cell *matCellDef="let row">
                  @switch (getStatus(row)) {
                    @case ('Active') {
                      <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <i class="fas fa-check-circle"></i> نشط
                      </span>
                    }
                    @case ('Pending') {
                      <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <i class="fas fa-clock"></i> قادم
                      </span>
                    }
                    @case ('Expired') {
                      <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <i class="fas fa-times-circle"></i> منتهي
                      </span>
                    }
                  }
                </td>
              </ng-container>

              <!-- Action Column -->
              <ng-container matColumnDef="action">
                <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-700" style="min-width:130px">الإجراءات</th>
                <td mat-cell *matCellDef="let row">
                  <div class="flex items-center gap-1">
                    <button mat-icon-button (click)="openEditDialog(row)" matTooltip="تعديل"
                      class="!text-amber-500 hover:!bg-amber-50">
                      <mat-icon>edit</mat-icon>
                    </button>
                    <button mat-icon-button (click)="openViewDialog(row)" matTooltip="عرض"
                      class="!text-blue-500 hover:!bg-blue-50">
                      <mat-icon>visibility</mat-icon>
                    </button>
                    <button mat-icon-button (click)="openDeleteDialog(row)" matTooltip="حذف"
                      class="!text-red-500 hover:!bg-red-50">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns" class="!bg-gray-50"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="hover:bg-gray-50 transition-colors"></tr>

              <tr class="mat-row" *matNoDataRow>
                <td class="mat-cell text-center py-10 text-gray-400" [attr.colspan]="displayedColumns.length">
                  <i class="fas fa-search text-4xl mb-3 block"></i>
                  لا توجد بيانات
                </td>
              </tr>
            </table>
          </div>

          <mat-paginator
            [length]="totalCount()"
            [pageSize]="pageSize"
            [pageIndex]="pageIndex()"
            [pageSizeOptions]="[10, 25, 50]"
            (page)="onPageChange($event)"
            showFirstLastButtons>
          </mat-paginator>
        }
      </div>
    </div>
  `
})
export class HotelSubscriptionsPageComponent implements OnInit {
  private readonly dialog    = inject(MatDialog);
  private readonly snackBar  = inject(MatSnackBar);
  private readonly cdr       = inject(ChangeDetectorRef);

  readonly displayedColumns = ['HotelName', 'ProviderName', 'CityName', 'PeriodFrom', 'PeriodTo', 'IsActive', 'action'];
  readonly pageSize = 10;

  readonly isLoading       = signal(false);
  readonly subscriptions   = signal<ProviderSubscriptionLocalModel[]>([]);
  readonly totalCount      = signal(0);
  readonly pageIndex       = signal(0);
  readonly isAdvancedOpen  = signal(false);

  readonly filterProvider  = signal<number | null>(null);
  readonly filterCity      = signal<number | null>(null);
  readonly filterHotel     = signal<number | null>(null);
  readonly filterStatus    = signal<number | null>(null);

  readonly isProvidersLoading = signal(false);
  readonly isCitiesLoading    = signal(false);
  readonly isHotelsLoading    = signal(false);
  readonly isStatusLoading    = signal(false);

  readonly providerFilterOptions = computed<SelectOption[]>(() => PROVIDERS_REF.map(p => ({ id: p.ProviderID, label: p.Name })));
  readonly cityFilterOptions     = computed<SelectOption[]>(() => CITIES_REF.map(c => ({ id: c.CityID, label: c.Name })));
  readonly hotelFilterOptions    = computed<SelectOption[]>(() => HOTELS_REF.map(h => ({ id: h.HotelID, label: h.Name })));
  readonly statusFilterOptions   = computed<SelectOption[]>(() => [
    { id: 1, label: 'نشط' },
    { id: 2, label: 'قادم' },
    { id: 3, label: 'منتهي' },
  ]);

  ngOnInit() { this.loadSubscriptions(); }

  loadSubscriptions() {
    this.isLoading.set(true);
    of(MOCK_SUBSCRIPTIONS).pipe(delay(300)).subscribe(all => {
      let filtered = [...all];
      if (this.filterProvider()) filtered = filtered.filter(s => s.ProviderID === this.filterProvider());
      if (this.filterCity())     filtered = filtered.filter(s => s.CityID     === this.filterCity());
      if (this.filterHotel())    filtered = filtered.filter(s => s.HotelID    === this.filterHotel());
      if (this.filterStatus()) {
        filtered = filtered.filter(s => {
          const st = getSubscriptionStatus(s);
          if (this.filterStatus() === 1) return st === 'Active';
          if (this.filterStatus() === 2) return st === 'Pending';
          if (this.filterStatus() === 3) return st === 'Expired';
          return true;
        });
      }
      this.totalCount.set(filtered.length);
      const start = this.pageIndex() * this.pageSize;
      this.subscriptions.set(filtered.slice(start, start + this.pageSize));
      this.isLoading.set(false);
      this.cdr.markForCheck();
    });
  }

  onFilterProviderChange(opt: SelectOption | null) { this.filterProvider.set(opt ? Number(opt.id) : null); }
  onFilterCityChange(opt: SelectOption | null)     { this.filterCity.set(opt ? Number(opt.id) : null); }
  onFilterHotelChange(opt: SelectOption | null)    { this.filterHotel.set(opt ? Number(opt.id) : null); }
  onFilterStatusChange(opt: SelectOption | null)   { this.filterStatus.set(opt ? Number(opt.id) : null); }

  toggleAdvanced() { this.isAdvancedOpen.update(v => !v); }

  clearFilters() {
    this.filterProvider.set(null);
    this.filterCity.set(null);
    this.filterHotel.set(null);
    this.filterStatus.set(null);
    this.pageIndex.set(0);
    this.loadSubscriptions();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.loadSubscriptions();
  }

  getStatus(sub: ProviderSubscriptionLocalModel): 'Active' | 'Pending' | 'Expired' {
    return getSubscriptionStatus(sub);
  }

  getStarsArray(stars: number): number[] { return Array(stars).fill(0); }

  openHotelDetails(sub: ProviderSubscriptionLocalModel) {
    this.dialog.open(HotelDetailsDialogComponent, {
      width: '500px',
      data: { hotelName: sub.HotelName, cityName: sub.CityName, stars: sub.HotelStars }
    });
  }

  openCreateDialog() {
    const ref = this.dialog.open(CreateSubscriptionDialogComponent, { width: '1000px', maxWidth: '95vw' });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.loadSubscriptions();
        this.snackBar.open('تم إضافة الاشتراك بنجاح', 'إغلاق', { duration: 3000 });
      }
    });
  }

  openEditDialog(sub: ProviderSubscriptionLocalModel) {
    const ref = this.dialog.open(EditSubscriptionDialogComponent, { width: '1000px', maxWidth: '95vw', data: { subscription: sub } });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.loadSubscriptions();
        this.snackBar.open('تم تحديث الاشتراك بنجاح', 'إغلاق', { duration: 3000 });
      }
    });
  }

  openViewDialog(sub: ProviderSubscriptionLocalModel) {
    this.dialog.open(ViewSubscriptionDialogComponent, { width: '1000px', maxWidth: '95vw', data: { subscription: sub } });
  }

  openDeleteDialog(sub: ProviderSubscriptionLocalModel) {
    const ref = this.dialog.open(ConfirmDeleteSubscriptionDialogComponent, { width: '400px', data: { subscription: sub } });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        of(true).pipe(delay(300)).subscribe(() => {
          MOCK_SUBSCRIPTIONS = MOCK_SUBSCRIPTIONS.filter(s => s.ProviderSubscriptionID !== sub.ProviderSubscriptionID);
          this.loadSubscriptions();
          this.snackBar.open('تم حذف الاشتراك بنجاح', 'إغلاق', { duration: 3000 });
        });
      }
    });
  }
}
