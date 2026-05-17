import { CommonModule } from '@angular/common';
import { Component, inject, signal, computed } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { TranslateModule } from '@ngx-translate/core';
import { map } from 'rxjs';

import { AdminAPIClient, SeroPackageModel } from 'src/app/services/admin.api.client';
import { AppSelectSearchComponent, SelectOption } from 'src/app/components/select-search/select-search.component';
// import { PackageBuilderComponent } from '../../package-builder/package-builder.component';

@Component({
  selector: 'app-create-sero-package-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatStepperModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule,
    MatDatepickerModule,
    MatCheckboxModule,
    TranslateModule,
  ],
  templateUrl: './create-sero-package-dialog.component.html',
  styleUrl: './create-sero-package-dialog.component.scss',
})
export class CreateSeroPackageDialogComponent {
  private adminApiClient = inject(AdminAPIClient);
  private dialogRef = inject(MatDialogRef<CreateSeroPackageDialogComponent>);

  isLoading = signal(false);
  isSaving = signal(false);

  // Basic Info Form
  basicInfoForm = new FormGroup({
    title: new FormControl('', [Validators.required]),
    startDate: new FormControl<Date | null>(null, [Validators.required]),
    endDate: new FormControl<Date | null>(null, [Validators.required]),
    price: new FormControl<number | null>(null, [Validators.required, Validators.min(0)]),
    isVisaIncluded: new FormControl(false),
    description: new FormControl(''),
  });

  // Hotel Forms
  makkahHotelsForm = new FormGroup({
    selectedHotels: new FormControl<number[]>([]),
  });

  madinahHotelsForm = new FormGroup({
    selectedHotels: new FormControl<number[]>([]),
  });

  // Transport Form
  transportForm = new FormGroup({
    selectedTransport: new FormControl<number | null>(null),
  });

  // Food Form
  foodForm = new FormGroup({
    selectedCatering: new FormControl<number | null>(null),
    selectedFoodType: new FormControl<number | null>(null),
  });

  // Computed validation
  isAllFormsValid = () => {
    return (
      this.basicInfoForm.valid &&
      this.makkahHotelsForm.valid &&
      this.madinahHotelsForm.valid &&
      this.transportForm.valid &&
      this.foodForm.valid
    );
  };

  onCancel() {
    this.dialogRef.close();
  }

  onSave() {
    if (!this.isAllFormsValid()) {
      return;
    }

    this.isSaving.set(true);
    const packageData = this.buildPackageModel();

    this.adminApiClient.createPackage({ body: packageData }).subscribe({
      next: (result) => {
        this.isSaving.set(false);
        this.dialogRef.close({ success: true, package: result });
      },
      error: (error) => {
        this.isSaving.set(false);
        console.error('Error creating package:', error);
      },
    });
  }

  private buildPackageModel(): SeroPackageModel {
    const basicInfo = this.basicInfoForm.value;
    const makkahHotels = this.makkahHotelsForm.controls.selectedHotels.value || [];
    const madinahHotels = this.madinahHotelsForm.controls.selectedHotels.value || [];
    const transport = this.transportForm.controls.selectedTransport.value;
    const catering = this.foodForm.controls.selectedCatering.value;
    const foodType = this.foodForm.controls.selectedFoodType.value;

    return {
      Title: basicInfo.title!,
      StartDate: basicInfo.startDate!,
      EndDate: basicInfo.endDate!,
      IsVisaIncluded: basicInfo.isVisaIncluded!,
      Price: basicInfo.price!,
      Hotels: [
        ...makkahHotels.map((hotelId) => ({
          CityId: 1, // Makkah
          HotelId: hotelId,
        })),
        ...madinahHotels.map((hotelId) => ({
          CityId: 2, // Madinah
          HotelId: hotelId,
        })),
      ],
      Trips: transport
        ? [
            {
              TripPathId: transport,
            },
          ]
        : [],
      Caterings: catering
        ? [
            {
              CateringTypeId: catering,
              FoodTypeId: foodType || undefined,
            },
          ]
        : [],
    };
  }

  // Data sources for select components
  makkahHotelsDataSource = (filter: string) => {
    return this.adminApiClient
      .getHotelsLookup({
        body: {
          FilterText: filter,
          CityId: 1, // Makkah city ID
          IsActive: true,
        },
      })
      .pipe(
        map((hotels) =>
          hotels.map(
            (hotel) =>
              ({
                label: `${hotel.Name} - ${hotel.NameEn}`,
                value: hotel.HotelID!,
              } as SelectOption)
          )
        )
      );
  };

  madinahHotelsDataSource = (filter: string) => {
    return this.adminApiClient
      .getHotelsLookup({
        body: {
          FilterText: filter,
          CityId: 2, // Madinah city ID
          IsActive: true,
        },
      })
      .pipe(
        map((hotels) =>
          hotels.map(
            (hotel) =>
              ({
                label: `${hotel.Name} - ${hotel.NameEn}`,
                value: hotel.HotelID!,
              } as SelectOption)
          )
        )
      );
  };

  tripPathsDataSource = (filter: string) => {
    return this.adminApiClient
      .getTripPathsLookup({
        filter: filter,
        isActive: true,
      })
      .pipe(
        map((paths) =>
          paths.map(
            (path) =>
              ({
                label: path.Title,
                value: path.TripPathID!,
              } as SelectOption)
          )
        )
      );
  };

  cateringTypesDataSource = (filter: string) => {
    return this.adminApiClient
      .getCateringTypesLookup({
        filter: filter,
        isActive: true,
      })
      .pipe(
        map((packages) =>
          packages.map(
            (pkg) =>
              ({
                label: pkg.Title,
                value: pkg.CateringTypeID!,
              } as SelectOption)
          )
        )
      );
  };

  foodTypesDataSource = (filter: string) => {
    return this.adminApiClient
      .getFoodTypesLookup({
        filter: filter,
        isActive: true,
      })
      .pipe(
        map((types) =>
          types.map(
            (type) =>
              ({
                label: type.TypeName,
                value: type.Id!,
              } as SelectOption)
          )
        )
      );
  };
}
