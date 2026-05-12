import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HotelRating } from '../../../../../core/models/enums';
import { HotelService, Package } from '../../../../../core/models/package.model';
import {
  PackageHotelSelection,
  OrderSummaryData,
  SelectOption
} from '../../../../../core/models/package-builder-ui.model';
import { PackageBuilderUiService } from '../../../../../core/services/package-builder-ui.service';
import { OrderSummaryComponent } from '../../components/order-summary/order-summary.component';
import { PackageStepFormComponent } from '../../components/package-step-form/package-step-form.component';
import { PackageBuilderService } from '../../../../../core/services/package-builder.service';

@Component({
  selector: 'app-step1-makkah',
  standalone: true,
  imports: [CommonModule, OrderSummaryComponent, PackageStepFormComponent],
  template: `
    <div class="step-shell animate-fade-in">
      <div class="step-grid">
        <app-order-summary class="sidebar" [data]="orderSummary"></app-order-summary>

        <app-package-step-form
          class="form-card"
          [districtOptions]="districtOptions"
          [categoryOptions]="categoryOptions"
          [roomTypeOptions]="roomTypeOptions"
          (hotelsChanged)="syncHotelsToPackageData()"
          (skip)="onSkip()"
          (next)="next.emit()"></app-package-step-form>
      </div>
    </div>
  `,
  styles: [`
    .step-shell {
      padding: 14px 0 0;
    }

    .step-grid {
      display: grid;
      grid-template-columns: 290px minmax(0, 1fr);
      gap: 16px;
      align-items: start;
    }

    .sidebar,
    .form-card {
      min-width: 0;
    }

    @media (max-width: 1024px) {
      .step-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class Step1MakkahComponent implements OnInit {
  @Input() packageData!: Partial<Package>;
  @Output() dataChanged = new EventEmitter<Partial<Package>>();
  @Output() next = new EventEmitter<void>();

  orderSummary: OrderSummaryData = { title: '', sections: [], supportCards: [] };
  districtOptions: SelectOption[] = [];
  categoryOptions: SelectOption[] = [];
  roomTypeOptions: SelectOption[] = [];
  private hasInitializedState = false;

  constructor(
    private readonly builderUi: PackageBuilderUiService,
    private readonly packageBuilderService: PackageBuilderService
  ) {}

  ngOnInit(): void {
    this.orderSummary = this.builderUi.getOrderSummaryData();
    this.districtOptions = this.builderUi.getDistrictOptions();
    this.categoryOptions = this.builderUi.getCategoryOptions();
    this.roomTypeOptions = this.builderUi.getRoomTypeOptions();

    if (!this.hasInitializedState && this.packageBuilderService.getMakkahHotelsSignal()().length === 0) {
      const mappedFromPackage = (this.packageData.makkahHotels || []).map((hotel) => this.mapPackageHotelToSelection(hotel));
      this.packageBuilderService.setMakkahHotels(mappedFromPackage);
      this.hasInitializedState = true;
    }
  }

  onSkip(): void {
    this.next.emit();
  }

  syncHotelsToPackageData(): void {
    const selected = this.packageBuilderService.getMakkahHotelsSignal()();
    const mappedHotels = selected.map((hotel) => this.mapSelectionToPackageHotel(hotel));
    const nights = selected[0]?.nightsCount || this.packageData.nights || 0;

    this.dataChanged.emit({
      makkahHotels: mappedHotels,
      nights
    });
  }

  private mapSelectionToPackageHotel(hotel: PackageHotelSelection): HotelService {
    const rating = Number(hotel.category || 5) as HotelRating;
    return {
      id: hotel.id,
      name: hotel.hotelName,
      city: 'makkah',
      rating: Number.isNaN(rating) ? HotelRating.FIVE : rating,
      distanceToHaram: 0.5,
      nights: hotel.nightsCount,
      roomType: hotel.roomType,
      mealPlan: hotel.notes || 'حسب الطلب',
      checkIn: new Date(),
      checkOut: new Date()
    };
  }

  private mapPackageHotelToSelection(hotel: HotelService): PackageHotelSelection {
    return {
      id: hotel.id,
      cityType: 'makkah',
      selectionMode: 'specific',
      hotelName: hotel.name,
      roomType: hotel.roomType,
      roomsCount: 1,
      nightsCount: hotel.nights,
      category: String(hotel.rating),
      notes: hotel.mealPlan
    };
  }
}
