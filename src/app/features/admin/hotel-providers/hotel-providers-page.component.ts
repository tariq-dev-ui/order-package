// Currently using local mock data for frontend prototype. Later this can be replaced with backend API.

import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component,
  computed, inject, OnInit, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { MatDialog, MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

import { dropdownSearchListComponent, SelectOption } from 'src/app/components/dropdown-search-list/dropdown-search-list.component';
import { LoadingSpinnerComponent } from 'src/app/components/loading-spinner/loading-spinner';

// ── Local Models ───────────────────────────────────────────────────────────

export interface ProviderLocalModel {
  ProviderID: number;
  Code: string;
  Name: string;
  Mobile: string;
  CountryID: number;
  CountryTitle: string;
  CityID: number;
  CityTitle: string;
  Address: string;
  Notes: string | null;
  UserName: string;
  IsActive: boolean;
  AddedBy: string;
  CreatedDate: Date;
}

// ── Mock Data ─────────────────────────────────────────────────────────────

interface CountryLookup { id: number; name: string; }
interface CityLookup { id: number; countryId: number; name: string; }

const MOCK_COUNTRIES: CountryLookup[] = [
  { id: 1, name: 'Saudi Arabia' },
  { id: 2, name: 'UAE' },
  { id: 3, name: 'Jordan' },
  { id: 4, name: 'Egypt' },
];

const MOCK_CITIES: CityLookup[] = [
  { id: 1, countryId: 1, name: 'Makkah' },
  { id: 2, countryId: 1, name: 'Madinah' },
  { id: 3, countryId: 1, name: 'Riyadh' },
  { id: 4, countryId: 1, name: 'Jeddah' },
  { id: 5, countryId: 2, name: 'Dubai' },
  { id: 6, countryId: 2, name: 'Abu Dhabi' },
  { id: 7, countryId: 3, name: 'Amman' },
  { id: 8, countryId: 4, name: 'Cairo' },
];

let MOCK_PROVIDERS: ProviderLocalModel[] = [
  {
    ProviderID: 1, Code: 'PRV-001', Name: 'Al Zahra Hotel Services', Mobile: '+966501234567',
    CountryID: 1, CountryTitle: 'Saudi Arabia', CityID: 1, CityTitle: 'Makkah',
    Address: 'King Abdul Aziz Road, Makkah', Notes: 'Specialized in Haram-facing rooms',
    UserName: 'alzahra.admin', IsActive: true, AddedBy: 'Admin', CreatedDate: new Date('2024-01-15')
  },
  {
    ProviderID: 2, Code: 'PRV-002', Name: 'Madinah Hospitality Group', Mobile: '+966512345678',
    CountryID: 1, CountryTitle: 'Saudi Arabia', CityID: 2, CityTitle: 'Madinah',
    Address: 'Quba Road, Madinah', Notes: null,
    UserName: 'madinah.admin', IsActive: true, AddedBy: 'Admin', CreatedDate: new Date('2024-02-10')
  },
  {
    ProviderID: 3, Code: 'PRV-003', Name: 'Gulf Hotels Distribution', Mobile: '+971501234567',
    CountryID: 2, CountryTitle: 'UAE', CityID: 5, CityTitle: 'Dubai',
    Address: 'Sheikh Zayed Road, Dubai', Notes: 'Premium segment only',
    UserName: 'gulf.hotels', IsActive: true, AddedBy: 'Admin', CreatedDate: new Date('2024-03-05')
  },
  {
    ProviderID: 4, Code: 'PRV-004', Name: 'Nile Valley Accommodations', Mobile: '+201001234567',
    CountryID: 4, CountryTitle: 'Egypt', CityID: 8, CityTitle: 'Cairo',
    Address: 'Tahrir Square Area, Cairo', Notes: null,
    UserName: 'nilevalley', IsActive: false, AddedBy: 'Admin', CreatedDate: new Date('2024-01-20')
  },
  {
    ProviderID: 5, Code: 'PRV-005', Name: 'Jeddah Coastal Resorts', Mobile: '+966523456789',
    CountryID: 1, CountryTitle: 'Saudi Arabia', CityID: 4, CityTitle: 'Jeddah',
    Address: 'Corniche Road, Jeddah', Notes: 'Focus on coastal properties',
    UserName: 'jeddah.resorts', IsActive: true, AddedBy: 'Admin', CreatedDate: new Date('2024-04-01')
  },
  {
    ProviderID: 6, Code: 'PRV-006', Name: 'Levant Stay Solutions', Mobile: '+962791234567',
    CountryID: 3, CountryTitle: 'Jordan', CityID: 7, CityTitle: 'Amman',
    Address: 'Rainbow Street, Amman', Notes: null,
    UserName: 'levant.stay', IsActive: true, AddedBy: 'Admin', CreatedDate: new Date('2024-05-12')
  },
];

// ── Create Provider Dialog ─────────────────────────────────────────────────

@Component({
  selector: 'app-create-provider-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, dropdownSearchListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative">
      <div class="flex items-center gap-3 p-5 border-b border-gray-200">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center">
          <i class="fas fa-user-plus text-lg"></i>
        </div>
        <div class="flex-1">
          <h2 class="text-xl font-bold">إضافة مزود جديد</h2>
          <p class="text-sm text-gray-500">أدخل بيانات المزود أدناه</p>
        </div>
        <button (click)="onClose()" class="text-gray-400 hover:text-gray-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="h-[70vh] overflow-y-auto custom-scroll relative">
          @if (isSubmitting()) {
            <div class="w-full bg-black/20 h-[70vh]">
              <loading-spinner [isLoading]="isSubmitting()" [message]="'جاري الحفظ...'" />
            </div>
          } @else {
            <div class="space-y-6 p-5">

              <!-- Code -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-3">
                  <i class="fas fa-hashtag text-primary-500"></i>
                  <span>الكود <span class="text-red-500">*</span></span>
                </label>
                <input type="text" formControlName="Code" maxlength="50"
                  class="w-full placeholder-gray-400 p-3 h-14 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                  placeholder="أدخل كود المزود">
                @if (form.controls.Code.invalid && (form.controls.Code.touched || form.controls.Code.dirty)) {
                  <div class="text-red-500 text-xs mt-1">
                    @if (form.controls.Code.errors?.['required']) { <span>الكود مطلوب</span> }
                  </div>
                }
              </div>

              <!-- Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-3">
                  <i class="fas fa-user text-primary-500"></i>
                  <span>الاسم <span class="text-red-500">*</span></span>
                </label>
                <input type="text" formControlName="Name" maxlength="100"
                  class="w-full placeholder-gray-400 p-3 h-14 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                  placeholder="أدخل اسم المزود">
                @if (form.controls.Name.invalid && (form.controls.Name.touched || form.controls.Name.dirty)) {
                  <div class="text-red-500 text-xs mt-1">
                    @if (form.controls.Name.errors?.['required']) { <span>الاسم مطلوب</span> }
                  </div>
                }
              </div>

              <!-- Username + Mobile -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-3">
                    <i class="fas fa-user-circle text-primary-500"></i>
                    <span>اسم المستخدم <span class="text-red-500">*</span></span>
                  </label>
                  <input type="text" formControlName="UserName" maxlength="50"
                    class="w-full placeholder-gray-400 p-3 h-14 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                    placeholder="أدخل اسم المستخدم">
                  @if (form.controls.UserName.invalid && (form.controls.UserName.touched || form.controls.UserName.dirty)) {
                    <div class="text-red-500 text-xs mt-1">
                      @if (form.controls.UserName.errors?.['required']) { <span>اسم المستخدم مطلوب</span> }
                    </div>
                  }
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-3">
                    <i class="fas fa-mobile-alt text-primary-500"></i>
                    <span>الجوال <span class="text-red-500">*</span></span>
                  </label>
                  <input type="text" formControlName="Mobile" maxlength="20"
                    class="w-full placeholder-gray-400 p-3 h-14 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                    placeholder="أدخل رقم الجوال">
                  @if (form.controls.Mobile.invalid && (form.controls.Mobile.touched || form.controls.Mobile.dirty)) {
                    <div class="text-red-500 text-xs mt-1">
                      @if (form.controls.Mobile.errors?.['required']) { <span>الجوال مطلوب</span> }
                    </div>
                  }
                </div>
              </div>

              <!-- Country + City -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-3">
                    <i class="fas fa-globe text-primary-500"></i>
                    <span>الدولة <span class="text-red-500">*</span></span>
                  </label>
                  <dropdown-search-list
                    [options]="countryOptions"
                    [isOptionsLoading]="isLoadingCountries"
                    placeholder="اختر الدولة"
                    [selectedId]="selectedCountry()"
                    (selectionChanged)="onCountryChange($event)">
                  </dropdown-search-list>
                  @if (form.controls.CountryID.invalid && (form.controls.CountryID.touched || form.controls.CountryID.dirty)) {
                    <div class="text-red-500 text-xs mt-1"><span>الدولة مطلوبة</span></div>
                  }
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-3">
                    <i class="fas fa-city text-primary-500"></i>
                    <span>المدينة <span class="text-red-500">*</span></span>
                  </label>
                  <dropdown-search-list
                    [options]="cityOptions"
                    [isOptionsLoading]="isLoadingCities"
                    [placeholder]="!selectedCountry() ? 'اختر الدولة أولاً' : 'اختر المدينة'"
                    [selectedId]="selectedCity()"
                    (selectionChanged)="onCityChange($event)"
                    [disabled]="!selectedCountry()">
                  </dropdown-search-list>
                  @if (form.controls.CityID.invalid && (form.controls.CityID.touched || form.controls.CityID.dirty)) {
                    <div class="text-red-500 text-xs mt-1"><span>المدينة مطلوبة</span></div>
                  }
                </div>
              </div>

              <!-- Address -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-3">
                  <i class="fas fa-map-marker-alt text-primary-500"></i>
                  <span>العنوان <span class="text-red-500">*</span></span>
                </label>
                <input type="text" formControlName="Address" maxlength="200"
                  class="w-full placeholder-gray-400 p-3 h-14 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                  placeholder="أدخل العنوان">
                @if (form.controls.Address.invalid && (form.controls.Address.touched || form.controls.Address.dirty)) {
                  <div class="text-red-500 text-xs mt-1">
                    @if (form.controls.Address.errors?.['required']) { <span>العنوان مطلوب</span> }
                  </div>
                }
              </div>

              <!-- Notes -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-3">
                  <i class="fas fa-sticky-note text-primary-500"></i>
                  <span>ملاحظات</span>
                </label>
                <textarea formControlName="Notes" maxlength="500"
                  class="w-full p-3 border placeholder-gray-400 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                  rows="4" placeholder="ملاحظات إضافية (اختياري)"></textarea>
              </div>

            </div>
          }
        </div>

        <hr class="border-gray-200">
        <div class="flex justify-end gap-3 p-5">
          <button type="button" (click)="onClose()"
            class="cursor-pointer px-5 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-primary-500 transition-colors flex items-center gap-3">
            <i class="fas fa-times"></i><span>إلغاء</span>
          </button>
          @if (isSubmitting()) {
            <button type="button" disabled class="px-5 py-2.5 bg-primary-400 text-white rounded-lg opacity-80 flex items-center gap-3">
              <span class="me-2">جاري الحفظ...</span><i class="fas fa-spinner fa-spin"></i>
            </button>
          } @else if (form.invalid) {
            <button type="button" disabled class="px-5 py-2.5 bg-gray-200 text-gray-500 rounded-lg opacity-80 flex items-center gap-3 cursor-not-allowed">
              <span class="me-2">حفظ المزود</span><i class="fas fa-ban"></i>
            </button>
          } @else {
            <button type="submit"
              class="cursor-pointer px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all flex items-center gap-3 shadow-lg hover:shadow-xl">
              <span class="me-2">حفظ المزود</span><i class="fas fa-save"></i>
            </button>
          }
        </div>
      </form>
    </div>
  `
})
export class CreateProviderDialogComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly dialogRef = inject(MatDialogRef<CreateProviderDialogComponent>);

  readonly isSubmitting = signal(false);
  readonly selectedCountry = signal<number | null>(null);
  readonly selectedCity = signal<number | null>(null);
  readonly isLoadingCountries = signal(false);
  readonly isLoadingCities = signal(false);

  readonly countryOptions = computed<SelectOption[]>(() =>
    MOCK_COUNTRIES.map(c => ({ id: c.id, label: c.name }))
  );
  readonly cityOptions = computed<SelectOption[]>(() =>
    MOCK_CITIES.filter(c => c.countryId === this.selectedCountry()).map(c => ({ id: c.id, label: c.name }))
  );

  readonly form = this.fb.group({
    Code:      this.fb.control('', [Validators.required, Validators.maxLength(50)]),
    Name:      this.fb.control('', [Validators.required, Validators.maxLength(100)]),
    Mobile:    this.fb.control('', [Validators.required, Validators.maxLength(20)]),
    UserName:  this.fb.control('', [Validators.required, Validators.maxLength(50)]),
    CountryID: this.fb.control<number | null>(null, [Validators.required]),
    CityID:    this.fb.control<number | null>(null, [Validators.required]),
    Address:   this.fb.control('', [Validators.required, Validators.maxLength(200)]),
    Notes:     this.fb.control('', [Validators.maxLength(500)]),
  });

  onCountryChange(opt: SelectOption | null) {
    const id = opt ? Number(opt.id) : null;
    this.selectedCountry.set(id);
    this.selectedCity.set(null);
    this.form.patchValue({ CountryID: id, CityID: null });
  }

  onCityChange(opt: SelectOption | null) {
    const id = opt ? Number(opt.id) : null;
    this.selectedCity.set(id);
    this.form.patchValue({ CityID: id });
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.isSubmitting.set(true);
    const v = this.form.getRawValue();
    const country = MOCK_COUNTRIES.find(c => c.id === v.CountryID);
    const city    = MOCK_CITIES.find(c => c.id === v.CityID);
    const nextId  = Math.max(...MOCK_PROVIDERS.map(p => p.ProviderID), 0) + 1;
    const newProvider: ProviderLocalModel = {
      ProviderID:    nextId,
      Code:          v.Code,
      Name:          v.Name,
      Mobile:        v.Mobile,
      UserName:      v.UserName,
      CountryID:     v.CountryID!,
      CountryTitle:  country?.name ?? '',
      CityID:        v.CityID!,
      CityTitle:     city?.name ?? '',
      Address:       v.Address,
      Notes:         v.Notes || null,
      IsActive:      true,
      AddedBy:       'Admin',
      CreatedDate:   new Date(),
    };
    of(newProvider).pipe(delay(500)).subscribe(p => {
      MOCK_PROVIDERS = [p, ...MOCK_PROVIDERS];
      this.isSubmitting.set(false);
      this.dialogRef.close(true);
    });
  }

  onClose() { this.dialogRef.close(); }
}

// ── Edit Provider Dialog ───────────────────────────────────────────────────

@Component({
  selector: 'app-edit-provider-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, dropdownSearchListComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative">
      <div class="flex items-center gap-3 p-5 border-b border-gray-200">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center">
          <i class="fas fa-user-edit text-lg"></i>
        </div>
        <div class="flex-1">
          <h2 class="text-xl font-bold">تعديل المزود</h2>
          <p class="text-sm text-gray-500">تحديث بيانات المزود</p>
        </div>
        <button (click)="onClose()" class="text-gray-400 hover:text-gray-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="submit()">
        <div class="h-[70vh] overflow-y-auto custom-scroll relative">
          @if (isSubmitting()) {
            <div class="w-full bg-black/20 h-[70vh]">
              <loading-spinner [isLoading]="isSubmitting()" [message]="'جاري التحديث...'" />
            </div>
          } @else {
            <div class="space-y-6 p-5">

              <!-- Code -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-3">
                  <i class="fas fa-hashtag text-primary-500"></i><span>الكود</span>
                </label>
                <input type="text" formControlName="Code" maxlength="50"
                  class="w-full placeholder-gray-400 p-3 h-14 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                  placeholder="أدخل كود المزود">
                @if (form.controls.Code.invalid && (form.controls.Code.touched || form.controls.Code.dirty)) {
                  <div class="text-red-500 text-xs mt-1">
                    @if (form.controls.Code.errors?.['required']) { <span>الكود مطلوب</span> }
                  </div>
                }
              </div>

              <!-- Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-3">
                  <i class="fas fa-user text-primary-500"></i><span>الاسم</span>
                </label>
                <input type="text" formControlName="Name" maxlength="100"
                  class="w-full placeholder-gray-400 p-3 h-14 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                  placeholder="أدخل اسم المزود">
                @if (form.controls.Name.invalid && (form.controls.Name.touched || form.controls.Name.dirty)) {
                  <div class="text-red-500 text-xs mt-1">
                    @if (form.controls.Name.errors?.['required']) { <span>الاسم مطلوب</span> }
                  </div>
                }
              </div>

              <!-- Username + Mobile -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-3">
                    <i class="fas fa-user-circle text-primary-500"></i><span>اسم المستخدم</span>
                  </label>
                  <input type="text" formControlName="UserName" maxlength="50"
                    class="w-full placeholder-gray-400 p-3 h-14 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                    placeholder="أدخل اسم المستخدم">
                  @if (form.controls.UserName.invalid && (form.controls.UserName.touched || form.controls.UserName.dirty)) {
                    <div class="text-red-500 text-xs mt-1">
                      @if (form.controls.UserName.errors?.['required']) { <span>اسم المستخدم مطلوب</span> }
                    </div>
                  }
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-3">
                    <i class="fas fa-mobile-alt text-primary-500"></i><span>الجوال</span>
                  </label>
                  <input type="text" formControlName="Mobile" maxlength="20"
                    class="w-full placeholder-gray-400 p-3 h-14 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                    placeholder="أدخل رقم الجوال">
                  @if (form.controls.Mobile.invalid && (form.controls.Mobile.touched || form.controls.Mobile.dirty)) {
                    <div class="text-red-500 text-xs mt-1">
                      @if (form.controls.Mobile.errors?.['required']) { <span>الجوال مطلوب</span> }
                    </div>
                  }
                </div>
              </div>

              <!-- Country + City -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-3">
                    <i class="fas fa-globe text-primary-500"></i><span>الدولة <span class="text-red-500">*</span></span>
                  </label>
                  <dropdown-search-list
                    [options]="countryOptions"
                    [isOptionsLoading]="isLoadingCountries"
                    placeholder="اختر الدولة"
                    [selectedId]="selectedCountry()"
                    (selectionChanged)="onCountryChange($event)">
                  </dropdown-search-list>
                  @if (form.controls.CountryID.invalid && (form.controls.CountryID.touched || form.controls.CountryID.dirty)) {
                    <div class="text-red-500 text-xs mt-1"><span>الدولة مطلوبة</span></div>
                  }
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-3">
                    <i class="fas fa-city text-primary-500"></i><span>المدينة <span class="text-red-500">*</span></span>
                  </label>
                  <dropdown-search-list
                    [options]="cityOptions"
                    [isOptionsLoading]="isLoadingCities"
                    [placeholder]="!selectedCountry() ? 'اختر الدولة أولاً' : 'اختر المدينة'"
                    [selectedId]="selectedCity()"
                    (selectionChanged)="onCityChange($event)"
                    [disabled]="!selectedCountry()">
                  </dropdown-search-list>
                  @if (form.controls.CityID.invalid && (form.controls.CityID.touched || form.controls.CityID.dirty)) {
                    <div class="text-red-500 text-xs mt-1"><span>المدينة مطلوبة</span></div>
                  }
                </div>
              </div>

              <!-- Address -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-3">
                  <i class="fas fa-map-marker-alt text-primary-500"></i><span>العنوان</span>
                </label>
                <input type="text" formControlName="Address" maxlength="200"
                  class="w-full placeholder-gray-400 p-3 h-14 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                  placeholder="أدخل العنوان">
                @if (form.controls.Address.invalid && (form.controls.Address.touched || form.controls.Address.dirty)) {
                  <div class="text-red-500 text-xs mt-1">
                    @if (form.controls.Address.errors?.['required']) { <span>العنوان مطلوب</span> }
                  </div>
                }
              </div>

              <!-- Notes -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-3">
                  <i class="fas fa-sticky-note text-primary-500"></i><span>ملاحظات</span>
                </label>
                <textarea formControlName="Notes" maxlength="500"
                  class="w-full p-3 border placeholder-gray-400 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                  rows="4" placeholder="ملاحظات إضافية (اختياري)"></textarea>
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

        <hr class="border-gray-200">
        <div class="flex justify-end gap-3 p-5">
          <button type="button" (click)="onClose()"
            class="cursor-pointer px-5 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:text-primary-500 transition-colors flex items-center gap-3">
            <i class="fas fa-times"></i><span>إلغاء</span>
          </button>
          @if (isSubmitting()) {
            <button type="button" disabled class="px-5 py-2.5 bg-primary-400 text-white rounded-lg opacity-80 flex items-center gap-3">
              <span class="me-2">جاري التحديث...</span><i class="fas fa-spinner fa-spin"></i>
            </button>
          } @else if (form.invalid) {
            <button type="button" disabled class="px-5 py-2.5 bg-gray-200 text-gray-500 rounded-lg opacity-80 flex items-center gap-3 cursor-not-allowed">
              <span class="me-2">تحديث المزود</span><i class="fas fa-ban"></i>
            </button>
          } @else {
            <button type="submit"
              class="cursor-pointer px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all flex items-center gap-3 shadow-lg hover:shadow-xl">
              <span class="me-2">تحديث المزود</span><i class="fas fa-save"></i>
            </button>
          }
        </div>
      </form>
    </div>
  `
})
export class EditProviderDialogComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly dialogRef = inject(MatDialogRef<EditProviderDialogComponent>);
  readonly data = inject(MAT_DIALOG_DATA) as { provider: ProviderLocalModel };

  readonly isSubmitting = signal(false);
  readonly selectedCountry = signal<number | null>(null);
  readonly selectedCity = signal<number | null>(null);
  readonly isLoadingCountries = signal(false);
  readonly isLoadingCities = signal(false);

  readonly countryOptions = computed<SelectOption[]>(() =>
    MOCK_COUNTRIES.map(c => ({ id: c.id, label: c.name }))
  );
  readonly cityOptions = computed<SelectOption[]>(() =>
    MOCK_CITIES.filter(c => c.countryId === this.selectedCountry()).map(c => ({ id: c.id, label: c.name }))
  );

  readonly form = this.fb.group({
    Code:      this.fb.control('', [Validators.required, Validators.maxLength(50)]),
    Name:      this.fb.control('', [Validators.required, Validators.maxLength(100)]),
    Mobile:    this.fb.control('', [Validators.required, Validators.maxLength(20)]),
    UserName:  this.fb.control('', [Validators.required, Validators.maxLength(50)]),
    CountryID: this.fb.control<number | null>(null, [Validators.required]),
    CityID:    this.fb.control<number | null>(null, [Validators.required]),
    Address:   this.fb.control('', [Validators.required, Validators.maxLength(200)]),
    Notes:     this.fb.control('', [Validators.maxLength(500)]),
    IsActive:  this.fb.control(true),
  });

  constructor() {
    const p = this.data.provider;
    this.form.patchValue({
      Code: p.Code, Name: p.Name, Mobile: p.Mobile, UserName: p.UserName,
      CountryID: p.CountryID, CityID: p.CityID, Address: p.Address,
      Notes: p.Notes ?? '', IsActive: p.IsActive,
    });
    this.selectedCountry.set(p.CountryID);
    this.selectedCity.set(p.CityID);
  }

  onCountryChange(opt: SelectOption | null) {
    const id = opt ? Number(opt.id) : null;
    this.selectedCountry.set(id);
    this.selectedCity.set(null);
    this.form.patchValue({ CountryID: id, CityID: null });
  }

  onCityChange(opt: SelectOption | null) {
    const id = opt ? Number(opt.id) : null;
    this.selectedCity.set(id);
    this.form.patchValue({ CityID: id });
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.isSubmitting.set(true);
    const v = this.form.getRawValue();
    of(true).pipe(delay(500)).subscribe(() => {
      const idx = MOCK_PROVIDERS.findIndex(p => p.ProviderID === this.data.provider.ProviderID);
      if (idx !== -1) {
        const country = MOCK_COUNTRIES.find(c => c.id === v.CountryID);
        const city    = MOCK_CITIES.find(c => c.id === v.CityID);
        MOCK_PROVIDERS[idx] = {
          ...MOCK_PROVIDERS[idx],
          Code: v.Code, Name: v.Name, Mobile: v.Mobile, UserName: v.UserName,
          CountryID: v.CountryID!, CountryTitle: country?.name ?? '',
          CityID: v.CityID!, CityTitle: city?.name ?? '',
          Address: v.Address, Notes: v.Notes || null, IsActive: v.IsActive,
        };
      }
      this.isSubmitting.set(false);
      this.dialogRef.close(true);
    });
  }

  onClose() { this.dialogRef.close(); }
}

// ── View Provider Dialog ───────────────────────────────────────────────────

@Component({
  selector: 'app-view-provider-dialog',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative">
      <div class="border-b border-gray-100 p-5">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-semibold text-gray-900">
            <i class="fas fa-user text-primary-500 me-2"></i>
            بيانات المزود
          </h2>
          <button (click)="onClose()" class="text-gray-400 hover:text-gray-500 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <p class="mt-1 text-sm text-gray-500">عرض تفاصيل المزود</p>
      </div>

      <div class="max-h-[60vh] overflow-y-auto p-5 custom-scroll">
        @if (provider) {
          <!-- Profile Header -->
          <div class="flex items-start gap-4 p-4 bg-primary-50 rounded-xl mb-4">
            <div class="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 flex-shrink-0">
              <i class="fas fa-user text-2xl"></i>
            </div>
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-bold text-gray-900">{{ provider.Name }}</h3>
              <div class="flex flex-wrap gap-2 mt-2">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                  <i class="fas fa-user-circle me-1"></i>{{ provider.UserName }}
                </span>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  <i class="fas fa-hashtag me-1"></i>{{ provider.Code }}
                </span>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                  [class]="provider.IsActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                  <i class="me-1" [class]="provider.IsActive ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                  {{ provider.IsActive ? 'نشط' : 'غير نشط' }}
                </span>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Provider Details -->
            <div class="bg-white p-3 rounded-lg border border-gray-100">
              <div class="flex items-center text-primary-600 mb-2">
                <i class="fas fa-info-circle text-xs me-1.5"></i>
                <span class="text-xs font-semibold">بيانات المزود</span>
              </div>
              <div class="space-y-2">
                <div>
                  <p class="text-[11px] text-gray-500 font-medium">الكود</p>
                  <p class="text-xs text-black">{{ provider.Code }}</p>
                </div>
                <div>
                  <p class="text-[11px] text-gray-500 font-medium">الاسم</p>
                  <p class="text-xs text-black">{{ provider.Name }}</p>
                </div>
                <div>
                  <p class="text-[11px] text-gray-500 font-medium">اسم المستخدم</p>
                  <p class="text-xs text-black">{{ provider.UserName }}</p>
                </div>
              </div>
            </div>

            <!-- Contact Info -->
            <div class="bg-white p-3 rounded-lg border border-gray-100">
              <div class="flex items-center text-primary-600 mb-2">
                <i class="fas fa-phone text-xs me-1.5"></i>
                <span class="text-xs font-semibold">معلومات الاتصال</span>
              </div>
              <div class="space-y-2">
                <div>
                  <p class="text-[11px] text-gray-500 font-medium">الجوال</p>
                  <p class="text-xs text-black">{{ provider.Mobile }}</p>
                </div>
                <div>
                  <p class="text-[11px] text-gray-500 font-medium">العنوان</p>
                  <p class="text-xs text-black">{{ provider.Address }}</p>
                </div>
              </div>
            </div>

            <!-- Location Info -->
            <div class="bg-white p-3 rounded-lg border border-gray-100">
              <div class="flex items-center text-primary-600 mb-2">
                <i class="fas fa-map-marker-alt text-xs me-1.5"></i>
                <span class="text-xs font-semibold">معلومات الموقع</span>
              </div>
              <div class="space-y-2">
                <div>
                  <p class="text-[11px] text-gray-500 font-medium">الدولة</p>
                  <p class="text-xs text-black">{{ provider.CountryTitle }}</p>
                </div>
                <div>
                  <p class="text-[11px] text-gray-500 font-medium">المدينة</p>
                  <p class="text-xs text-black">{{ provider.CityTitle }}</p>
                </div>
              </div>
            </div>

            <!-- Additional Info -->
            <div class="bg-white p-3 rounded-lg border border-gray-100">
              <div class="flex items-center text-primary-600 mb-2">
                <i class="fas fa-sticky-note text-xs me-1.5"></i>
                <span class="text-xs font-semibold">معلومات إضافية</span>
              </div>
              <div class="space-y-2">
                <div>
                  <p class="text-[11px] text-gray-500 font-medium">ملاحظات</p>
                  <p class="text-xs text-black">{{ provider.Notes || 'لا توجد ملاحظات' }}</p>
                </div>
              </div>
            </div>

            <!-- Audit Info -->
            <div class="bg-white p-3 rounded-lg border border-gray-100 md:col-span-2">
              <div class="flex items-center text-primary-600 mb-2">
                <i class="fas fa-history text-xs me-1.5"></i>
                <span class="text-xs font-semibold">معلومات التدقيق</span>
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <p class="text-[11px] text-gray-500 font-medium">أضيف بواسطة</p>
                  <p class="text-xs text-black">{{ provider.AddedBy }}</p>
                </div>
                <div>
                  <p class="text-[11px] text-gray-500 font-medium">تاريخ الإنشاء</p>
                  <p class="text-xs text-black">{{ provider.CreatedDate | date:'dd-MM-yyyy' }}</p>
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
export class ViewProviderDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ViewProviderDialogComponent>);
  readonly data = inject(MAT_DIALOG_DATA) as { provider: ProviderLocalModel };
  get provider() { return this.data.provider; }
  onClose() { this.dialogRef.close(); }
}

// ── Confirm Delete Dialog ──────────────────────────────────────────────────

@Component({
  selector: 'app-confirm-delete-provider-dialog',
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
        هل أنت متأكد من حذف المزود <strong>{{ data.provider.Name }}</strong>؟ لا يمكن التراجع عن هذا الإجراء.
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
export class ConfirmDeleteProviderDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ConfirmDeleteProviderDialogComponent>);
  readonly data = inject(MAT_DIALOG_DATA) as { provider: ProviderLocalModel };
  confirm() { this.dialogRef.close(true); }
  cancel()  { this.dialogRef.close(false); }
}

// ── Main Page Component ────────────────────────────────────────────────────

@Component({
  selector: 'app-hotel-providers-page',
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
          <h1 class="text-2xl font-bold text-gray-900">قائمة المزودين</h1>
          <p class="text-sm text-gray-500 mt-1">إدارة مزودي الفنادق</p>
        </div>
        <button (click)="openCreateDialog()"
          class="inline-flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors shadow-sm font-medium text-sm">
          <i class="fas fa-plus"></i>
          <span>مزود جديد</span>
        </button>
      </div>

      <!-- Search / Filter Panel -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <!-- Status Filter -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
            <dropdown-search-list
              [options]="statusOptions"
              [isOptionsLoading]="isStatusLoading"
              placeholder="جميع الحالات"
              [selectedId]="selectedStatus()"
              (selectionChanged)="onStatusChange($event)">
            </dropdown-search-list>
          </div>
          <div class="flex items-end gap-2">
            <button (click)="clearFilters()"
              class="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm flex items-center gap-2">
              <i class="fas fa-times"></i><span>مسح</span>
            </button>
            <button (click)="loadProviders()"
              class="px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors text-sm flex items-center gap-2">
              <i class="fas fa-search"></i><span>بحث</span>
            </button>
          </div>
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
            <table mat-table [dataSource]="providers()" class="w-full mat-elevation-z0">

              <!-- Name Column -->
              <ng-container matColumnDef="Name">
                <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-700" style="min-width:200px">الاسم</th>
                <td mat-cell *matCellDef="let row">
                  <div class="flex items-center gap-3 py-2">
                    <div class="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <i class="fas fa-user text-primary-500 text-sm"></i>
                    </div>
                    <span class="font-semibold text-gray-900">{{ row.Name }}</span>
                  </div>
                </td>
              </ng-container>

              <!-- Mobile Column -->
              <ng-container matColumnDef="Mobile">
                <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-700" style="min-width:140px">الجوال</th>
                <td mat-cell *matCellDef="let row" class="text-sm text-gray-600">{{ row.Mobile }}</td>
              </ng-container>

              <!-- Country Column -->
              <ng-container matColumnDef="CountryTitle">
                <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-700" style="min-width:120px">الدولة</th>
                <td mat-cell *matCellDef="let row" class="text-sm text-gray-600">{{ row.CountryTitle }}</td>
              </ng-container>

              <!-- City Column -->
              <ng-container matColumnDef="CityTitle">
                <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-700" style="min-width:120px">المدينة</th>
                <td mat-cell *matCellDef="let row" class="text-sm text-gray-600">{{ row.CityTitle }}</td>
              </ng-container>

              <!-- IsActive Column -->
              <ng-container matColumnDef="IsActive">
                <th mat-header-cell *matHeaderCellDef class="!font-bold !text-gray-700" style="min-width:100px">الحالة</th>
                <td mat-cell *matCellDef="let row">
                  @if (row.IsActive) {
                    <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <i class="fas fa-check-circle"></i> نشط
                    </span>
                  } @else {
                    <span class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <i class="fas fa-times-circle"></i> غير نشط
                    </span>
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
export class HotelProvidersPageComponent implements OnInit {
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly displayedColumns = ['Name', 'Mobile', 'CountryTitle', 'CityTitle', 'IsActive', 'action'];
  readonly pageSize = 10;

  readonly isLoading  = signal(false);
  readonly providers  = signal<ProviderLocalModel[]>([]);
  readonly totalCount = signal(0);
  readonly pageIndex  = signal(0);

  readonly selectedStatus  = signal<number | null>(null);
  readonly isStatusLoading = signal(false);

  readonly statusOptions = computed<SelectOption[]>(() => [
    { id: 1, label: 'نشط' },
    { id: 2, label: 'غير نشط' },
  ]);

  ngOnInit() { this.loadProviders(); }

  loadProviders() {
    this.isLoading.set(true);
    of(MOCK_PROVIDERS).pipe(delay(300)).subscribe(all => {
      let filtered = [...all];
      if (this.selectedStatus() === 1) filtered = filtered.filter(p => p.IsActive);
      if (this.selectedStatus() === 2) filtered = filtered.filter(p => !p.IsActive);
      this.totalCount.set(filtered.length);
      const start = this.pageIndex() * this.pageSize;
      this.providers.set(filtered.slice(start, start + this.pageSize));
      this.isLoading.set(false);
      this.cdr.markForCheck();
    });
  }

  onStatusChange(opt: SelectOption | null) {
    this.selectedStatus.set(opt ? Number(opt.id) : null);
  }

  clearFilters() {
    this.selectedStatus.set(null);
    this.pageIndex.set(0);
    this.loadProviders();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.loadProviders();
  }

  openCreateDialog() {
    const ref = this.dialog.open(CreateProviderDialogComponent, { width: '1200px', maxWidth: '95vw' });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.loadProviders();
        this.snackBar.open('تم إضافة المزود بنجاح', 'إغلاق', { duration: 3000 });
      }
    });
  }

  openEditDialog(provider: ProviderLocalModel) {
    const ref = this.dialog.open(EditProviderDialogComponent, { width: '1200px', maxWidth: '95vw', data: { provider } });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.loadProviders();
        this.snackBar.open('تم تحديث المزود بنجاح', 'إغلاق', { duration: 3000 });
      }
    });
  }

  openViewDialog(provider: ProviderLocalModel) {
    this.dialog.open(ViewProviderDialogComponent, { width: '1200px', maxWidth: '95vw', data: { provider } });
  }

  openDeleteDialog(provider: ProviderLocalModel) {
    const ref = this.dialog.open(ConfirmDeleteProviderDialogComponent, { width: '400px', data: { provider } });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        of(true).pipe(delay(300)).subscribe(() => {
          MOCK_PROVIDERS = MOCK_PROVIDERS.filter(p => p.ProviderID !== provider.ProviderID);
          this.loadProviders();
          this.snackBar.open('تم حذف المزود بنجاح', 'إغلاق', { duration: 3000 });
        });
      }
    });
  }
}
