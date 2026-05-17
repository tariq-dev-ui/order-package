import { Component, inject, Input, output, Signal, signal } from '@angular/core';
import { CityDistData, HotelCategoryModel, HotelModel, HotelRoomTypeModel } from 'src/app/services/admin.api.client';
import { MOCK_HOTELS } from '../../services/package-builder.mock';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, } from 'rxjs/operators';
import { CounterInput } from '../counter-input/counter-input';
import { HotelCountState, HotelState } from '../../services/package-builder-state-management-service';
import { MatDialog } from '@angular/material/dialog';
import { HotelProfileComponent } from 'src/app/pages/hotels/hotel-profile/hotel-profile.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'hotel-selector-step',
  imports: [
    CounterInput,
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
  ],
  templateUrl: './hotel-selector.html',
  styleUrl: './hotel-selector.css'
})
export class HotelSelector {

  getRoomTypeTitle(roomType: HotelRoomTypeModel | null | undefined): string {
    return roomType?.Title ?? roomType?.TitleEn ?? '';
  }




  @Input() currentStep!: number;
  @Input() title!: string;
  @Input() icon!: string;
  @Input() city!: string;
  @Input() cityId!: number; // 1 for Makkah, 2 for Madinah
  @Input() state!: Signal<HotelState>;
  @Input() districts!: Signal<CityDistData[]>;
  @Input() isLoadingDistincts!: Signal<boolean>;
  @Input() roomTypes!: Signal<HotelRoomTypeModel[]>;
  @Input() isLoadingRoomTypes!: Signal<boolean>;
  @Input() categories!: Signal<HotelCategoryModel[]>;
  @Input() isLoadingCategories!: Signal<boolean>;
  @Input() listState!: Signal<HotelState[]>;
  @Input() HotelCountState!: Signal<HotelCountState>;
  @Input() addFn!: () => void;
  @Input() resetState!: () => void;
  @Input() removeFn!: (index: number) => void;
  @Input() updateFn!: (tab: 'activeTab' | 'criteria' | 'specific' | 'isSkipped', key: string, value: any) => void;
  @Input() updateHotelCount!: (key: string, value: any) => void;

  readonly nextStep = output<void>();
  readonly prevStep = output<void>();

  hotels = signal<HotelModel[]>([]);

  private dialog = inject(MatDialog);

  isLoading = signal(false);

  openHotelProfileDialog(hotelId: number | null | undefined) {
    if (!hotelId) {
      return;
    }

    this.dialog.open(HotelProfileComponent, {
      width: '95vw',
      maxWidth: '95vw',
      height: '90vh',
      maxHeight: '90vh',
      panelClass: 'hotel-profile-dialog',
      autoFocus: false,
      disableClose: false,
      data: { hotelId },
    });
  }


  nights = signal<number>(0);
  selectedHotelId = signal<number | null>(null);
  isLoadingSearchHotels = signal<boolean>(false);


  searchForm = new FormGroup({
    filterText: new FormControl<string | null>(''),
    filterDistrict: new FormControl<number | null>(null),
    filterMaxDistanceFromHaram: new FormControl<number | null>(null),
  });

  stars = [3, 4, 5];
  allowNightsForAll = signal<boolean>(false);
  globalNightsCount = signal<number>(0);

  onAllowNightsForAllChange($event: Event) {
    this.globalNightsCount.set(0);
    this.allowNightsForAll.set((<HTMLInputElement>$event.target).checked);
    if(this.resetState)
    this.resetState();
    if(this.updateHotelCount)
    this.updateHotelCount('nightsCountEnabled', this.allowNightsForAll()); 
  }

  onNightsCountForAllChange($event: number) {
    this.globalNightsCount.set($event);
    if(this.updateHotelCount)
    this.updateHotelCount('nightsCount', $event);
  }

 

  ngOnInit(): void {
    this.allowNightsForAll.set(this.HotelCountState().nightsCountEnabled ?? false);
    this.globalNightsCount.set(this.HotelCountState().nightsCount ?? 0 );
    if (!this.allowNightsForAll() && this.state().activeTab === 'specific' && this.state().specific?.nightCount) {
      this.nights.set(this.state().specific?.nightCount ?? 0);
    }
    if (!this.allowNightsForAll() && this.state().activeTab === 'criteria' && this.state().criteria?.nightCount) {
      this.nights.set(this.state().criteria?.nightCount ?? 0);
    }
    this.loadHotels(this.cityId);
    this.searchHotels();
    // for (let index = 0; index < this.roomType.length; index++) {
    //   const element = this.roomType[index];

    // }
    // this.roomTypes.push({id:, name:});
  }

  addRow() {
    this.addFn();
  }

  removeRow(i: number) {
    this.removeFn(i);
  }

  toggleHotelSelection(hotelId: number) {
    if (this.updateFn) {
      this.updateFn('isSkipped', 'isSkipped', false);
    }
    if (this.selectedHotelId() === hotelId) {
      this.selectedHotelId.set(null);
    } else {
      this.selectedHotelId.set(hotelId);
    }
  }

  changeTabTo(tab: string) {
    if (this.updateFn) {
      this.updateFn('isSkipped', 'isSkipped', false);
    }
    if (tab === 'specific' && !this.hotels().length) {
      this.loadHotels(this.cityId);
    }
    if (this.updateFn) {
      this.updateFn('activeTab', 'activeTab', tab);
    }
  }

  onChange(tab: 'criteria' | 'specific', key: string, raw: any) {
    if (this.updateFn) {
      this.updateFn('isSkipped', 'isSkipped', false);
    }
    let val: any = raw === 'undefined' ? undefined : Number(raw);
    if (isNaN(val)) val = undefined;
    if (this.updateFn) {
      this.updateFn(tab, key, val);
    }
  }

  onDistrictChange(event: Event) {
    if (this.updateFn) {
      this.updateFn('isSkipped', 'isSkipped', false);
    }
    const value = (event.target as HTMLSelectElement).value;
    const id = value === 'undefined' ? undefined : Number(value);
    const district = this.districts().find(d => d.CityDistID === id);
    if (this.updateFn) {
      this.updateFn('criteria', 'districtId', id);
      this.updateFn('criteria', 'districtName', district ? district.DistTitle : '');
    }
  }
 
  onCategoryChange(event: Event) {
    if (this.updateFn) {
      this.updateFn('isSkipped', 'isSkipped', false);
    }
    const value = (event.target as HTMLSelectElement).value;
    const id = value === 'undefined' ? undefined : Number(value);
    const category = this.categories().find(d => d.CategoryID === id);
    if (this.updateFn) {
      this.updateFn('criteria', 'HotelCategoryID', id);
      this.updateFn('criteria', 'HotelCategoryName', category ? category.Title : '');
    }
  }

  onRoomTypesChange(event: Event) {
    if (this.updateFn) {
      this.updateFn('isSkipped', 'isSkipped', false);
    }
    const value = (event.target as HTMLSelectElement).value;
    const id = value === 'undefined' ? undefined : Number(value);
    const roomType = this.roomTypes().find(d => d.RoomTypeID === id);
    const roomTypeTitle = this.getRoomTypeTitle(roomType);

    if (this.updateFn) {
      if (this.state().activeTab === 'specific') {
        this.updateFn('specific', 'roomTypeId', id);
        this.updateFn('specific', 'roomTypeName', roomTypeTitle);
      }
      if (this.state().activeTab === 'criteria') {
        this.updateFn('criteria', 'roomTypeId', id);
        this.updateFn('criteria', 'roomTypeName', roomTypeTitle);
      }
    }
  }

  onSkip() {
    if (this.updateFn) {
      this.updateFn('isSkipped', 'isSkipped', true);
    }
    if(this.updateHotelCount){
      this.updateHotelCount('isSkipped', true);
    }
    this.nextStep.emit();
  }

  onNext() {
    if (this.updateFn) {
      this.updateFn('isSkipped', 'isSkipped', false);
    }
    this.nextStep.emit();
  }

  canGoNext(): boolean {
    return this.listState().length > 0;
  }

  searchHotels() {
    this.searchForm.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(formValue => {
        this.isLoadingSearchHotels.set(true);
        const filterText = (formValue.filterText ?? '').trim().toLowerCase();
        const districtId = formValue.filterDistrict ? +formValue.filterDistrict : null;

        let results = MOCK_HOTELS.filter(h => h.CityId === this.cityId || h.CityID === this.cityId);

        if (filterText) {
          results = results.filter(h =>
            (h.Name ?? '').toLowerCase().includes(filterText) ||
            (h.NameEn ?? '').toLowerCase().includes(filterText)
          );
        }
        if (districtId) {
          results = results.filter(h => h.DistID === districtId);
        }

        this.hotels.set(results);
        this.isLoadingSearchHotels.set(false);
      });
  }

  loadHotels(id: number) {
    this.isLoadingSearchHotels.set(true);
    const cityHotels = MOCK_HOTELS.filter(h => h.CityId === id || h.CityID === id);
    this.hotels.set(cityHotels);
    this.isLoadingSearchHotels.set(false);
  }

  getTabClass(tab: string) {

    if (this.state().activeTab == tab) {
      return 'tab-btn active py-3 px-4 font-medium text-primary-500 border-b-2 border-primary-500 flex items-center gap-2';
    }
    return 'tab-btn py-3 px-4 font-medium text-gray-500 flex items-center gap-2';
  }

  getSelectedHotelName(): string {
    const selectedHotel = this.hotels().find(hotel => hotel.HotelID === this.selectedHotelId());
    return selectedHotel?.Name ? selectedHotel.Name : 'None';
  }

  getDistrictsName(id: number): string {
    const selectedDistrict = this.districts().find(district => district.CityDistID === id);
    return selectedDistrict?.DistTitle ? selectedDistrict.DistTitle : 'Not Mention';
  }

  onHotelSelected(hotelId: number): void {
    if (this.updateFn) {
      this.updateFn('isSkipped', 'isSkipped', false);
    }
    const hotel = this.hotels().find(h => h.HotelID === hotelId);
    this.selectedHotel.set(hotel);
    this.selectedHotelId.set(hotelId);
    const selectedHotelName = this.getSelectedHotelName();
    if (this.updateFn) {
      this.updateFn('specific', 'hotelId', hotelId);
      this.updateFn('specific', 'hotelName', selectedHotelName);
    }
  }

  onNightsChange(value: number) {
    if (this.updateFn) {
      this.updateFn('isSkipped', 'isSkipped', false);
    }
    this.nights.set(value);
    if (this.updateFn) {
      if (this.state().activeTab === 'specific') {
        this.updateFn('specific', 'nightCount', value);
      }
      if (this.state().activeTab === 'criteria') {
        this.updateFn('criteria', 'nightCount', value);
      }
    }
  }

  onRoomCountChange(value: number) {
    if (this.updateFn) {
      this.updateFn('isSkipped', 'isSkipped', false);
    }
    this.nights.set(value);
    if (this.updateFn) {
      if (this.state().activeTab === 'specific') {
        this.updateFn('specific', 'roomCount', value);
      }
      if (this.state().activeTab === 'criteria') {
        this.updateFn('criteria', 'roomCount', value);
      }
    }
  }

  isCriteriaTabValid(): boolean {
    // Example: require district, starRank, roomTypeId, nightCount
    const criteria = this.state().criteria;
    const nightCount= this.allowNightsForAll() ? (this.globalNightsCount() > 0) :  ((criteria?.nightCount ?? 0) > 0);
    return !!(
      criteria?.districtId &&
      criteria?.roomTypeId &&
      nightCount
    );
  }

  isSpecificTabValid(): boolean {
    // Example: require hotelId, roomTypeId, nightCount
    
    const specific = this.state().specific;
    const nightCount= this.allowNightsForAll() ? (this.globalNightsCount() > 0) :  ((specific?.nightCount ?? 0) > 0);
    return !!(
      specific?.hotelId &&
      specific?.roomTypeId &&
      nightCount
    );
  }

  // canGoNext(): boolean {
  //   if (this.state().activeTab === 'criteria') {
  //     return this.isCriteriaTabValid();
  //   }
  //   if (this.state().activeTab === 'specific') {
  //     return this.isSpecificTabValid();
  //   }
  //   return false;
  // }







  // In your component class
  selectedHotel = signal<any>(null);
  selectedRoomTypeId: string | null = null;
  selectedNights = 0;


  clearSelectedHotel() {
    this.selectedHotel.set(null);
    this.selectedRoomTypeId = null;
    if (this.updateFn) {
      this.updateFn('specific', 'hotelId', undefined);
      this.updateFn('specific', 'hotelName', '');
    }
  }

  adjustNights(change: number) {
    const newValue = this.selectedNights + change;
    if (newValue >= 1 && newValue <= 30) {
      this.selectedNights = newValue;
    }
  }

  resetFilters() {
    this.searchForm.reset();
    this.searchHotels();
  }

  getButtonCardClasses(hotelId: number): string {
    if (this.state().specific?.hotelId == hotelId) {
      return 'bg-primary-500 text-white';
    } else {
      return 'bg-gray-100 hover:bg-gray-200 text-gray-800';
    }
  }
}
