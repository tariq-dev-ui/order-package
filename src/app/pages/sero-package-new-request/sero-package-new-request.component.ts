import { CommonModule, NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal, computed, OnInit, Inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AdminAPIClient, AgentModel, CityData, CountryData, SeroPackageModel, SeroPackageRequestModel, UserAccountViewModel } from 'src/app/services/admin.api.client';
import { PackageImagePreviewDialogComponent } from '../sero-packages/package-image-preview-dialog/package-image-preview-dialog.component';
import { dropdownSearchListComponent, SelectOption } from 'src/app/components/dropdown-search-list/dropdown-search-list.component';
import { PackageHotelsDetailsComponent } from '../components/request-package-details/package-hotels-details/package-hotels-details.component';
import { PackageTagsDetailsComponent } from '../components/request-package-details/package-tags-details/package-tags-details.component';
import { PackageTripsDetailsComponent } from '../components/request-package-details/package-trips-details/package-trips-details.component';
import { PackageTicketsDetailsComponent } from '../components/request-package-details/package-tickets-details/package-tickets-details.component';
import { PackageCateringsDetailsComponent } from '../components/request-package-details/package-caterings-details/package-caterings-details.component';
import { Pagination } from '../agents-orders/components/pagination/pagination';
import { LoadingSpinnerComponent } from 'src/app/components/loading-spinner/loading-spinner';
import { AppSnackBarService } from 'src/app/services/app-snack-bar.service';
import { SingleAgentSelectorComponent } from 'src/app/pages/agents-list/components/single-agent-selector/single-agent-selector.component';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { SeroCurrencyPipe } from 'src/app/shared/pipes/sero-currency.pipe';

@Component({
  selector: 'app-sero-package-new-request',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDialogModule,
    TranslateModule,
    PackageHotelsDetailsComponent,
    PackageTagsDetailsComponent,
    PackageTripsDetailsComponent,
    PackageTicketsDetailsComponent,
    PackageCateringsDetailsComponent,
    SingleAgentSelectorComponent,
    NgOptimizedImage,
    Pagination,
    SeroCurrencyPipe
  ],
  templateUrl: './sero-package-new-request.component.html',
  styleUrl: './sero-package-new-request.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SeroPackageNewRequestComponent implements OnInit {
  private adminApiClient = inject(AdminAPIClient);
  private dialog = inject(MatDialog);
  private readonly snackBar = inject(AppSnackBarService);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  // Signals for state management
  readonly isLoading = signal(false);
  readonly packages = signal<SeroPackageModel[]>([]);
  readonly agentsLists = signal<AgentModel[]>([]);
  readonly isAgentListLoading = signal(false);




  // Pagination signals
  page = signal(1);
  totalPages = signal(1);
  pageSize = 9;

  // Filter form
  readonly filterForm = new FormGroup({
    agentId: new FormControl<number | undefined>(undefined),
    includeInactive: new FormControl<boolean>(false, { nonNullable: true }),
  });

  readonly isFilterPanelOpen = signal(false);

  readonly selectedAgentId = signal<number | undefined>(undefined);

  toggleFilterPanel() {
    this.isFilterPanelOpen.update((open) => !open);
  }

  onAgentFilterChange(agentId: number | undefined) {
    this.selectedAgentId.set(agentId);
    this.filterForm.patchValue({ agentId });
  }



  readonly defaultImageUrl = signal('/IMG/logo.png');

  

  // Agent dropdown options
  readonly agentListOptions = signal<SelectOption[]>([]);



  ngOnInit(): void {
    this.filterForm.valueChanges
      .pipe(
        map((value) => ({
          agentId: value.agentId ?? undefined,
          includeInactive: value.includeInactive ?? false,
        })),
        distinctUntilChanged(
          (a, b) => a.agentId === b.agentId && a.includeInactive === b.includeInactive,
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.page.set(1);
        this.loadCount();
        this.loadPackages();
      });

    this.loadAgents();
   
    this.loadCount();
    this.loadPackages();
  }

 

  // Package methods
  loadPackages(): void {
    this.isLoading.set(true);
    const { agentId, includeInactive } = this.filterForm.getRawValue();

    this.adminApiClient
      .getAllPackages({
        pageIndex: Math.max(0, this.page() - 1),
        pageSize: this.pageSize,
        agentId: agentId ?? undefined,
        includeInactive,
        isByAgent: false,
      })
      .subscribe({
        next: (packages) => {
          this.isLoading.set(false);
          this.packages.set(packages ?? []);
        },
        error: (error) => {
          this.isLoading.set(false);
          this.packages.set([]);
          console.error('Error loading packages:', error);
          this.snackBar.showErrorSnackBar(this.translate.instant('Failed to load packages') || 'Failed to load packages');
        },
      });
  }

  loadCount(): void {
    const { agentId, includeInactive } = this.filterForm.getRawValue();
    this.adminApiClient
      .getPackagesCount({
        agentId: agentId ?? undefined,
        includeInactive,
        isByAgent: false,
      })
      .subscribe({
        next: (count) => {
          const total = Math.ceil((count ?? 0) / this.pageSize);
          this.totalPages.set(Math.max(1, total));
        },
        error: (err) => {
          console.error(err);
          this.snackBar.showErrorSnackBar(this.translate.instant('Failed to load package count') || 'Failed to load package count');
        },
      });
  }

  setPage(newPage: number): void {
    this.page.set(newPage);
    this.loadPackages();
  }

  onSearch(): void {
    this.page.set(1);
    this.loadCount();
    this.loadPackages();
  }

  loadAgents(): void {
    this.isAgentListLoading.set(true);
    this.adminApiClient
      .getAgentList({
        pageIndex: 0,
        pageSize: 10000,
      })
      .subscribe({
        next: (value) => {
          this.agentsLists.set(value ?? []);
          this.loadAgentListOptions();
        },
        error: (err) => {
          this.agentsLists.set([]);
          this.agentListOptions.set([]);
          console.error(err);
          this.snackBar.showErrorSnackBar(this.translate.instant('Failed to load agents') || 'Failed to load agents');
        },
        complete: () => {
          this.isAgentListLoading.set(false);
        },
      });
  }

  private loadAgentListOptions(): void {
    const options: SelectOption[] = [];
    this.agentsLists().forEach((agent) => {
      if (agent.AgentID !== undefined) {
        options.push({
          id: agent.AgentID,
          label: (agent.AgentName ?? '') + ' : ' + (agent.CountryName ?? ''),
        });
      }
    });
    this.agentListOptions.set(options);
  }

  // Signal for tracking open sections
  readonly openSections = signal<Map<number, string>>(new Map());

  // UI methods
  toggleSection(packageId: number, section: string): void {
    const currentSections = new Map(this.openSections());

    if (currentSections.get(packageId) === section) {
      currentSections.delete(packageId);
    } else {
      currentSections.set(packageId, section);
    }

    this.openSections.set(currentSections);
  }

  isSectionOpen(packageId: number, section: string): boolean {
    return this.openSections().get(packageId) === section;
  }

  totalNights(umrahPackage: SeroPackageModel): number {
    return umrahPackage.HotelCounts?.reduce((total, count) => total + (count.NightCount ?? 0), 0) || 0;
  }

  selectPackage(umrahPackage: SeroPackageModel): void {
    const dialogRef = this.dialog.open(PackageSelectionDialogComponent, {
      data: {
        package: umrahPackage,
        selectedAgentId: this.selectedAgentId() ?? null,
      },
      width: '1100px',
      maxWidth: '98vw',
      height: '92vh',
      maxHeight: '92vh',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Package selected with details:', {
          package: umrahPackage,
          selection: result
        });
      }
    });
  }



  openImageModal(pkg: SeroPackageModel): void {
    if (!pkg.ImageUrl) return;
    this.dialog.open(PackageImagePreviewDialogComponent, {
      maxWidth: '95vw',
      width: '95vw',
      height: '95vh',
      panelClass: 'image-preview-dialog-panel',
      data: { imageUrl: pkg.ImageUrl, title: pkg.Title ?? null, code: pkg.PackageCode ?? null },
    });
  }



}















// Package Selection Dialog Component
@Component({
  selector: 'app-package-selection-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    SingleAgentSelectorComponent,
    TranslateModule,
    LoadingSpinnerComponent],
  template: `
    <div class="flex flex-col h-full overflow-hidden">
      <!-- Header Section -->
      <div class="flex items-center gap-3 p-5 border-b border-gray-100 shrink-0">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center">
          <i class="fas fa-shopping-cart text-lg"></i>
        </div>
        <div class="flex-1">
          <h2 class="text-xl font-bold">{{ 'BOOK PACKAGE' | translate }}</h2>
          <p class="text-sm text-gray-500">{{ data.package.Title }}</p>
        </div>
        <button (click)="cancel()" class="text-gray-400 hover:text-gray-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Form Section -->
      <div class="flex-1 overflow-y-auto custom-scroll relative">

            <loading-spinner [isLoading]="isSavingData()" [message]="'Sending Request...' | translate" />

        <form [formGroup]="selectionForm">
          <div class="space-y-4 p-5">

            <!-- Agent Selection -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <i class="fas fa-user-tie text-primary-500"></i>
                <span>{{ 'SELECT AGENT' | translate }}</span>
              </label>
              <app-single-agent-selector
                [selectedAgentId]="selectedAgentId()"
                (agentIdChange)="onAgentIdChange($event)" />
              @if (selectionForm.get('agentId')?.invalid && (selectionForm.get('agentId')?.touched || selectionForm.get('agentId')?.dirty)) {
              <div class="text-red-500 text-xs mt-1">
                @if (selectionForm.get('agentId')?.errors?.['required']) {
                <span>{{ 'AGENT IS REQUIRED' | translate }}</span>
                }
              </div>
              }
            </div>
            
            
            <!-- Section Divider -->
            <div class="flex items-center gap-3 mb-5  mt-5">
              <hr class="flex-1 border-gray-200">
              <span class="text-xs font-medium text-gray-400 uppercase tracking-wider">{{ 'Trip Details' | translate }}</span>
              <hr class="flex-1 border-gray-200">
            </div>
          

            <!-- Date Range Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
              <!-- Start Date -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-3">
                  <i class="fas fa-calendar-alt text-primary-500"></i>
                  <span>{{ 'START DATE' | translate }}</span>
                </label>
                <mat-form-field appearance="outline" class="w-full">
                  <!-- <mat-label>{{ 'START DATE' | translate }}</mat-label> -->
                  <input matInput [matDatepicker]="startPicker" formControlName="startDate"  placeholder="{{ 'START DATE' | translate }}"         required>
                  <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                  <mat-datepicker #startPicker></mat-datepicker>
                  @if (selectionForm.get('startDate')?.invalid && (selectionForm.get('startDate')?.touched || selectionForm.get('startDate')?.dirty)) {
                  <mat-error>
                    @if (selectionForm.get('startDate')?.errors?.['required']) {
                    {{ 'START DATE IS REQUIRED' | translate }}
                    }
                    @if (selectionForm.get('startDate')?.errors?.['startBeforeTomorrow']) {
                    {{ 'START DATE MUST BE TOMORROW OR LATER' | translate }}
                    }
                  </mat-error>
                  }
                </mat-form-field>
              </div>

              <!-- End Date -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-3">
                  <i class="fas fa-calendar-check text-primary-500"></i>
                  <span>{{ 'END DATE' | translate }}</span>
                </label>
                <mat-form-field appearance="outline" class="w-full">
                  <!-- <mat-label>{{ 'END DATE' | translate }}</mat-label> -->
                  <input matInput [matDatepicker]="endPicker" formControlName="endDate" required placeholder="{{ 'END DATE' | translate }}">
                  <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                  <mat-datepicker #endPicker></mat-datepicker>
                  @if (selectionForm.get('endDate')?.invalid && (selectionForm.get('endDate')?.touched || selectionForm.get('endDate')?.dirty)) {
                  <mat-error>
                    @if (selectionForm.get('endDate')?.errors?.['required']) {
                    {{ 'END DATE IS REQUIRED' | translate }}
                    }
                    @if (selectionForm.get('endDate')?.errors?.['endBeforeStart']) {
                    {{ 'END DATE MUST BE AFTER START DATE' | translate }}
                    }
                  </mat-error>
                  }
                </mat-form-field>
              </div>
            </div>

           
            

            <!-- Number of Passengers -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-3">
                <i class="fas fa-users text-primary-500"></i>
                <span>{{ 'NUMBER OF PASSENGERS' | translate }}</span>
              </label>
              <input type="number" formControlName="passengers" min="1"
                class="w-full placeholder-gray-400 p-3 h-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-500"
                [placeholder]="'Enter number of passengers' | translate">
              @if (selectionForm.get('passengers')?.invalid && (selectionForm.get('passengers')?.touched || selectionForm.get('passengers')?.dirty)) {
              <div class="text-red-500 text-xs mt-1">
                @if (selectionForm.get('passengers')?.errors?.['required']) {
                <span>{{ 'NUMBER OF PASSENGERS IS REQUIRED' | translate }}</span>
                }
                @if (selectionForm.get('passengers')?.errors?.['min']) {
                <span>{{ 'MUST BE AT LEAST 1' | translate }}</span>
                }
              </div>
              }
            </div>

            <!-- Quantity -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-3">
                <i class="fas fa-cubes text-primary-500"></i>
                <span>{{ 'QUANTITY' | translate }}</span>
              </label>
              <input type="number" formControlName="quantity" min="1"
                class="w-full placeholder-gray-400 p-3 h-12 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-500"
                [placeholder]="'Enter quantity (optional)' | translate">
              @if (selectionForm.get('quantity')?.invalid && (selectionForm.get('quantity')?.touched || selectionForm.get('quantity')?.dirty)) {
              <div class="text-red-500 text-xs mt-1">
                @if (selectionForm.get('quantity')?.errors?.['min']) {
                <span>{{ 'MUST BE AT LEAST 1' | translate }}</span>
                }
              </div>
              }
            </div>

            <!-- Note -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-3">
                <i class="fas fa-sticky-note text-primary-500"></i>
                <span>{{ 'NOTE' | translate }}</span>
              </label>
              <textarea formControlName="note" rows="2"
                class="w-full p-3 placeholder-gray-400 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 hover:border-gray-300"
                placeholder="{{ 'Enter any additional notes' | translate }}"></textarea>
            </div>

          </div>
        </form>
      </div>

      <hr class="border-gray-100 shrink-0">
      <div class="flex justify-end gap-3 p-5 shrink-0">
        <button type="button" (click)="cancel()"
          class="cursor-pointer px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 active:bg-primary-50 hover:text-primary-500 transition-colors flex items-center gap-3 group">
          <i class="fas fa-times"></i>
          <span>{{ 'CANCEL' | translate }}</span>
        </button>
        <button type="button" (click)="confirm()"
          class="cursor-pointer px-4 py-2 bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white rounded-lg transition-all flex items-center gap-3 group shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          [disabled]="!selectionForm.valid || isSavingData()">
          @if (isSavingData()) {
            <i class="fas fa-spinner fa-spin"></i>
            <span>{{ 'SAVING...' | translate }}</span>
          } @else {
            <span class="mr-2">{{ 'CONFIRM' | translate }}</span>
            <i class="fas fa-check group-hover:translate-x-1 transition-transform"></i>
          }
        </button>
      </div>
    </div>
  `,
  styles: [`
    
    
  `],
  standalone: true,
})
export class PackageSelectionDialogComponent {
  selectedAgentId = signal<number | null>(null);

  selectionForm = new FormGroup({
    startDate: new FormControl<Date | null>(null, {
          nonNullable: false,
          validators: [Validators.required, (control) => this.startDateValidator(control)]
        }),
        endDate: new FormControl<Date | null>(null, {
          nonNullable: false,
          validators: [Validators.required, (control) => this.endDateValidator(control)]
        }),
    passengers: new FormControl<number | null>(null, {
      nonNullable: false,
      validators: [Validators.required, Validators.min(1)]
    }),
    quantity: new FormControl<number | null>(null, {
      nonNullable: false,
      validators: [Validators.min(1)]
    }),
    agentId: new FormControl<number | null>(null, {
      nonNullable: false,
      validators: [Validators.required]
    }),
    note: new FormControl<string>('')
  });

  private startDateValidator(control: any) {
    if (!control.value) return null;
    
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    
    if (selectedDate < tomorrow) {
      return { startBeforeTomorrow: true };
    }
    return null;
  }

  private endDateValidator(control: any) {
    const formGroup = control.parent as FormGroup;
    if (!formGroup) return null;
    const startDate = formGroup.get('startDate')?.value;
    if (!control.value || !startDate) return null;
    
    const selectedEndDate = new Date(control.value);
    const selectedStartDate = new Date(startDate);
    
    if (selectedEndDate <= selectedStartDate) {
      return { endBeforeStart: true };
    }
    return null;
  }

  constructor(
    public dialogRef: MatDialogRef<PackageSelectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      package: SeroPackageModel,
      selectedAgentId: number | null,
    }
  ) {
    if (data.selectedAgentId) {
      this.selectedAgentId.set(data.selectedAgentId);
      this.selectionForm.patchValue({ agentId: data.selectedAgentId });
    }

    // Re-run endDate validator whenever startDate changes (cross-field dependency)
    this.selectionForm.get('startDate')?.valueChanges.subscribe(() => {
      this.selectionForm.get('endDate')?.updateValueAndValidity({ emitEvent: false });
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }

  isSavingData = signal(false);
  adminAPIClient = inject(AdminAPIClient);
  private readonly snackBar = inject(AppSnackBarService);
  private readonly translate = inject(TranslateService);
  confirm(): void {
    if (this.selectionForm.valid) {
      this.isSavingData.set(true);
      this.selectionForm.disable();

      const seroPackageRequestModel: SeroPackageRequestModel={};

      const packageId = this.data.package.PackageID;
      const { startDate, endDate, passengers, quantity, agentId, note } = this.selectionForm.value;
      seroPackageRequestModel.AgentId=agentId!;
      seroPackageRequestModel.StartDate=startDate!;
      seroPackageRequestModel.EndDate=endDate!;
      seroPackageRequestModel.PassengerCount=passengers!;
      seroPackageRequestModel.RequestedQuantity=quantity ?? undefined;
      seroPackageRequestModel.Notes=note??'';
      seroPackageRequestModel.SeroPackageId=packageId;
      seroPackageRequestModel.IsByAgent=false;

      this.adminAPIClient.createPackageRequest({
        body: seroPackageRequestModel
      }).subscribe({
        next: (res) => {
          this.isSavingData.set(false);
          this.selectionForm.enable();
          console.log('Package request created successfully:', res);
          this.snackBar.showSuccessSnackBar(this.translate.instant('Package request created successfully') || 'Package request created successfully');
          this.dialogRef.close(this.selectionForm.value);
        },
        error: (err) => {
          this.isSavingData.set(false);
          this.selectionForm.enable();
          console.error('Error creating package request:', err);
          this.snackBar.showErrorSnackBar(this.translate.instant('Failed to create package request') || 'Failed to create package request');
        }
      }); 
    }
  }

  onAgentIdChange(id: number | undefined) {
    this.selectedAgentId.set(id ?? null);
    this.selectionForm.patchValue({ agentId: id ?? null });
  }
}
