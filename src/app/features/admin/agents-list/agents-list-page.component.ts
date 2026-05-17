// Currently using local mock data for frontend prototype. Later this can be replaced with backend API.

import {
  AfterViewInit, ChangeDetectionStrategy, Component,
  DestroyRef, computed, inject, signal, viewChild
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { of, startWith } from 'rxjs';
import { debounceTime, delay, distinctUntilChanged, finalize } from 'rxjs/operators';
import { dropdownSearchListComponent, SelectOption as DropdownSelectOption } from 'src/app/components/dropdown-search-list/dropdown-search-list.component';
import { SingleItemSelectorComponent, Item } from 'src/app/components/single-item-selector/single-item-selector.component';
import { LoadingSpinnerComponent } from 'src/app/components/loading-spinner/loading-spinner';

// ─── Models ──────────────────────────────────────────────────────────────────

interface AgentLocalModel {
  AgentID: number;
  AgentCode: string;
  AgentName: string;
  AgentEmail: string;
  CountryID: number;
  CountryName: string;
  CityID: number;
  CityName: string;
  CR_NO: string;
  Address: string;
  Description: string;
  IsActive: boolean;
  MasterAgentID: number | null;
  MasterAgentName: string | null;
  LogoImageLocation: string | null;
}

interface RepresenterLocalModel {
  Id: number;
  AgentId: number;
  Name: string;
  Email: string;
  Phone: string;
  IsActive: boolean;
}

type LocationOption = DropdownSelectOption & { countryId: number; regionId?: number };

// ─── Mock Location Data ───────────────────────────────────────────────────────

const MOCK_COUNTRIES: DropdownSelectOption[] = [
  { id: 1, label: 'Saudi Arabia' },
  { id: 2, label: 'UAE' },
  { id: 3, label: 'Jordan' },
  { id: 4, label: 'Egypt' },
  { id: 5, label: 'Turkey' },
];

const MOCK_REGIONS: (DropdownSelectOption & { countryId: number })[] = [
  { id: 1, label: 'Western Region', countryId: 1 },
  { id: 2, label: 'Central Region', countryId: 1 },
  { id: 3, label: 'Eastern Region', countryId: 1 },
  { id: 4, label: 'Dubai Emirate', countryId: 2 },
  { id: 5, label: 'Abu Dhabi Emirate', countryId: 2 },
];

const MOCK_CITIES: LocationOption[] = [
  { id: 1, label: 'Mecca', countryId: 1, regionId: 1 },
  { id: 2, label: 'Medina', countryId: 1, regionId: 1 },
  { id: 3, label: 'Jeddah', countryId: 1, regionId: 1 },
  { id: 4, label: 'Riyadh', countryId: 1, regionId: 2 },
  { id: 5, label: 'Khobar', countryId: 1, regionId: 3 },
  { id: 6, label: 'Dubai', countryId: 2, regionId: 4 },
  { id: 7, label: 'Abu Dhabi', countryId: 2, regionId: 5 },
  { id: 8, label: 'Amman', countryId: 3 },
  { id: 9, label: 'Cairo', countryId: 4 },
  { id: 10, label: 'Istanbul', countryId: 5 },
];

// ─── Mock Agents ──────────────────────────────────────────────────────────────

let mockAgents: AgentLocalModel[] = [
  { AgentID: 1, AgentCode: 'AGT001', AgentName: 'Al-Noor Travel', AgentEmail: 'alnoor@example.com', CountryID: 1, CountryName: 'Saudi Arabia', CityID: 1, CityName: 'Mecca', CR_NO: 'CR12345', Address: 'Ajyad St, Mecca', Description: 'Premier Umrah travel agency', IsActive: true, MasterAgentID: null, MasterAgentName: null, LogoImageLocation: null },
  { AgentID: 2, AgentCode: 'AGT002', AgentName: 'Star Tours', AgentEmail: 'star@example.com', CountryID: 1, CountryName: 'Saudi Arabia', CityID: 4, CityName: 'Riyadh', CR_NO: 'CR23456', Address: 'King Fahad Rd, Riyadh', Description: 'Domestic and international tours', IsActive: true, MasterAgentID: 1, MasterAgentName: 'Al-Noor Travel', LogoImageLocation: null },
  { AgentID: 3, AgentCode: 'AGT003', AgentName: 'Emirates Hajj Services', AgentEmail: 'ej@example.com', CountryID: 2, CountryName: 'UAE', CityID: 6, CityName: 'Dubai', CR_NO: 'CR34567', Address: 'Sheikh Zayed Rd, Dubai', Description: 'Hajj and Umrah services from UAE', IsActive: true, MasterAgentID: null, MasterAgentName: null, LogoImageLocation: null },
  { AgentID: 4, AgentCode: 'AGT004', AgentName: 'Jordan Pilgrim Agency', AgentEmail: 'jp@example.com', CountryID: 3, CountryName: 'Jordan', CityID: 8, CityName: 'Amman', CR_NO: 'CR45678', Address: '4th Circle, Amman', Description: 'Umrah packages for Jordanians', IsActive: false, MasterAgentID: null, MasterAgentName: null, LogoImageLocation: null },
  { AgentID: 5, AgentCode: 'AGT005', AgentName: 'Nile Travel & Tours', AgentEmail: 'nile@example.com', CountryID: 4, CountryName: 'Egypt', CityID: 9, CityName: 'Cairo', CR_NO: 'CR56789', Address: 'Tahrir Square, Cairo', Description: 'Egyptian Umrah services', IsActive: true, MasterAgentID: 1, MasterAgentName: 'Al-Noor Travel', LogoImageLocation: null },
  { AgentID: 6, AgentCode: 'AGT006', AgentName: 'Bosphorus Tours', AgentEmail: 'bosphorus@example.com', CountryID: 5, CountryName: 'Turkey', CityID: 10, CityName: 'Istanbul', CR_NO: 'CR67890', Address: 'Taksim Square, Istanbul', Description: 'Turkish Umrah specialists', IsActive: true, MasterAgentID: null, MasterAgentName: null, LogoImageLocation: null },
  { AgentID: 7, AgentCode: 'AGT007', AgentName: 'Medina Gateway Travel', AgentEmail: 'mg@example.com', CountryID: 1, CountryName: 'Saudi Arabia', CityID: 2, CityName: 'Medina', CR_NO: 'CR78901', Address: 'Bab Al-Baqi, Medina', Description: 'Medina based travel services', IsActive: true, MasterAgentID: null, MasterAgentName: null, LogoImageLocation: null },
  { AgentID: 8, AgentCode: 'AGT008', AgentName: 'Al-Safa Travels', AgentEmail: 'safa@example.com', CountryID: 1, CountryName: 'Saudi Arabia', CityID: 3, CityName: 'Jeddah', CR_NO: 'CR89012', Address: 'Al-Balad District, Jeddah', Description: 'Jeddah based tour operator', IsActive: false, MasterAgentID: 7, MasterAgentName: 'Medina Gateway Travel', LogoImageLocation: null },
];
let nextAgentId = 9;

const MOCK_REPRESENTERS: RepresenterLocalModel[] = [
  { Id: 1, AgentId: 1, Name: 'Ahmed Al-Noor', Email: 'ahmed@alnoor.com', Phone: '+966501234567', IsActive: true },
  { Id: 2, AgentId: 1, Name: 'Fatima Al-Noor', Email: 'fatima@alnoor.com', Phone: '+966509876543', IsActive: true },
  { Id: 3, AgentId: 2, Name: 'Mohammed Alharbi', Email: 'mohammed@star.com', Phone: '+966512345678', IsActive: true },
  { Id: 4, AgentId: 3, Name: 'Ali Mansoor', Email: 'ali@ej.com', Phone: '+971501234567', IsActive: false },
  { Id: 5, AgentId: 5, Name: 'Khaled Nile', Email: 'khaled@nile.com', Phone: '+201012345678', IsActive: true },
  { Id: 6, AgentId: 7, Name: 'Omar Medina', Email: 'omar@mg.com', Phone: '+966523456789', IsActive: true },
];

// ─── Add / Edit Agent Dialog ──────────────────────────────────────────────────

@Component({
  selector: 'add-new-agent-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    MatCheckboxModule, MatProgressSpinnerModule,
    dropdownSearchListComponent, SingleItemSelectorComponent, LoadingSpinnerComponent,
  ],
  template: `
    <div class="relative">
      <div class="flex items-center gap-3 p-5 border-b border-gray-100">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center">
          <i class="fas fa-user-plus text-lg"></i>
        </div>
        <div class="flex-1">
          <h2 class="text-xl font-bold m-0">{{ action }} Agent</h2>
          <p class="text-sm text-gray-500 m-0">{{ action === 'Add' ? 'Creating New Agent' : 'Editing Agent' }}</p>
        </div>
        <button type="button" (click)="dialogRef.close()" class="text-gray-400 hover:text-gray-500 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form [formGroup]="form" (ngSubmit)="save()">
        <div style="height:70vh;overflow-y:auto;" class="custom-scroll relative">
          @if (isLoading()) {
            <div class="w-full flex items-center justify-center" style="min-height:70vh;">
              <loading-spinner [isLoading]="isLoading()" message="Saving..." />
            </div>
          } @else {
            <div class="space-y-5 p-5">

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <i class="fas fa-hashtag text-primary-500"></i><span>Agent Code</span>
                  </label>
                  <input type="text" [formControl]="form.controls.agentCode" maxlength="50"
                    class="w-full placeholder-gray-400 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                    style="height:3.5rem;" placeholder="Enter agent code">
                  @if (form.get('agentCode')?.invalid && (form.get('agentCode')?.touched || form.get('agentCode')?.dirty)) {
                    <div class="text-red-500 text-xs mt-1">
                      @if (form.get('agentCode')?.errors?.['required']) { <span>Please enter agent code</span> }
                    </div>
                  }
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <i class="fas fa-id-card text-primary-500"></i><span>CR Number</span>
                  </label>
                  <input type="text" [formControl]="form.controls.crNumber" maxlength="50"
                    class="w-full placeholder-gray-400 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                    style="height:3.5rem;" placeholder="Enter CR number">
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <i class="fas fa-user text-primary-500"></i><span>Agent Name</span>
                  </label>
                  <input type="text" [formControl]="form.controls.agentName" maxlength="100"
                    class="w-full placeholder-gray-400 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                    style="height:3.5rem;" placeholder="Enter agent name">
                  @if (form.get('agentName')?.invalid && (form.get('agentName')?.touched || form.get('agentName')?.dirty)) {
                    <div class="text-red-500 text-xs mt-1">
                      @if (form.get('agentName')?.errors?.['required']) { <span>Please enter agent name</span> }
                    </div>
                  }
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <i class="fas fa-envelope text-primary-500"></i><span>Agent Email</span>
                  </label>
                  <input type="email" [formControl]="form.controls.agentEmail" maxlength="100"
                    class="w-full placeholder-gray-400 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                    style="height:3.5rem;" placeholder="Enter agent email">
                  @if (form.get('agentEmail')?.invalid && (form.get('agentEmail')?.touched || form.get('agentEmail')?.dirty)) {
                    <div class="text-red-500 text-xs mt-1">
                      @if (form.get('agentEmail')?.errors?.['required']) { <span>Please enter agent email</span> }
                      @if (form.get('agentEmail')?.errors?.['email']) { <span>Please enter a valid email</span> }
                    </div>
                  }
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <i class="fas fa-map-marker-alt text-primary-500"></i><span>Address</span>
                </label>
                <input type="text" [formControl]="form.controls.address" maxlength="200"
                  class="w-full placeholder-gray-400 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                  style="height:3.5rem;" placeholder="Enter address">
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <i class="fas fa-globe text-primary-500"></i><span>Country</span>
                  </label>
                  <dropdown-search-list
                    [options]="countryOptions"
                    [isOptionsLoading]="isCountryLoading"
                    placeholder="Select country"
                    [selectedId]="selectedCountryId"
                    (selectionChanged)="onCountrySelected($event)" />
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <i class="fas fa-city text-primary-500"></i><span>City</span>
                  </label>
                  <dropdown-search-list
                    [options]="cityOptions"
                    [isOptionsLoading]="isCityLoading"
                    placeholder="Select city"
                    [selectedId]="selectedCityId"
                    [disabled]="!selectedCountryId"
                    (selectionChanged)="onCitySelected($event)" />
                </div>
              </div>

              <div>
                <single-item-selector
                  label="Main Agent"
                  placeholder="Select main agent (optional)"
                  icon="fas fa-sitemap"
                  [items]="masterAgentItems()"
                  [selected]="masterAgentSelectedItem()"
                  [isLoading]="false"
                  (selectionChange)="onMasterAgentSelected($event)" />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <i class="fas fa-info-circle text-primary-500"></i><span>Description</span>
                </label>
                <textarea [formControl]="form.controls.description" maxlength="500" rows="3"
                  class="w-full placeholder-gray-400 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                  placeholder="Enter description"></textarea>
              </div>

              <div>
                <label class="cursor-pointer flex items-center gap-2">
                  <input type="checkbox" formControlName="isActive" class="w-4 h-4">
                  <span class="text-sm font-medium text-gray-700">Is Active</span>
                </label>
              </div>

            </div>
          }
        </div>

        <hr class="border-gray-100">
        <div class="flex justify-end gap-3 p-5">
          <button type="button" (click)="dialogRef.close()" [disabled]="isLoading()"
            class="cursor-pointer px-5 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1">
            <i class="fas fa-times"></i><span>Cancel</span>
          </button>
          @if (isLoading()) {
            <button type="button" disabled
              class="px-5 py-2.5 bg-primary-400 text-white rounded-lg opacity-80 flex items-center gap-1">
              <span class="me-2">Saving...</span><i class="fas fa-spinner fa-spin"></i>
            </button>
          } @else if (form.invalid) {
            <button type="button" disabled
              class="px-5 py-2.5 bg-gray-200 text-gray-500 rounded-lg opacity-80 flex items-center gap-1 cursor-not-allowed">
              <span class="me-2">Save</span><i class="fas fa-ban"></i>
            </button>
          } @else {
            <button type="submit"
              class="cursor-pointer px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all flex items-center gap-1 shadow-lg hover:shadow-xl">
              <span class="me-2">Save</span><i class="fas fa-save"></i>
            </button>
          }
        </div>
      </form>
    </div>
  `,
})
export class AddNewAgentDialogComponent {
  dialogRef = inject(MatDialogRef<AddNewAgentDialogComponent>);
  data = inject<{ agent?: AgentLocalModel } | null>(MAT_DIALOG_DATA, { optional: true });
  snackBar = inject(MatSnackBar);

  agent = this.data?.agent;
  action = this.agent ? 'Edit' : 'Add';
  isLoading = signal(false);

  countryOptions = signal<DropdownSelectOption[]>(MOCK_COUNTRIES);
  isCountryLoading = signal(false);
  cityOptions = signal<DropdownSelectOption[]>([]);
  isCityLoading = signal(false);
  selectedCountryId: number | null = null;
  selectedCityId: number | null = null;

  masterAgentItems = signal<Item[]>([]);
  masterAgentSelectedItem = signal<Item | null>(null);

  form = new FormGroup({
    agentCode:    new FormControl('',  [Validators.required, Validators.maxLength(50)]),
    agentName:    new FormControl('',  [Validators.required, Validators.maxLength(100)]),
    agentEmail:   new FormControl('',  [Validators.required, Validators.email]),
    crNumber:     new FormControl(''),
    address:      new FormControl(''),
    description:  new FormControl(''),
    countryId:    new FormControl<number | null>(null, [Validators.required]),
    cityId:       new FormControl<number | null>(null),
    masterAgentId: new FormControl<number | null>(null),
    isActive:     new FormControl(false),
  });

  ngOnInit() {
    this.masterAgentItems.set(
      mockAgents.map(a => ({
        id: a.AgentID,
        title: a.AgentName,
        subtitle: [a.CountryName, a.CityName].filter(Boolean).join(' — '),
        avatar: a.LogoImageLocation || '/favicon3.ico',
      }))
    );

    if (this.agent) {
      this.form.patchValue({
        agentCode:    this.agent.AgentCode,
        agentName:    this.agent.AgentName,
        agentEmail:   this.agent.AgentEmail,
        crNumber:     this.agent.CR_NO,
        address:      this.agent.Address,
        description:  this.agent.Description,
        countryId:    this.agent.CountryID,
        cityId:       this.agent.CityID,
        masterAgentId: this.agent.MasterAgentID,
        isActive:     this.agent.IsActive,
      });
      this.selectedCountryId = this.agent.CountryID;
      this.selectedCityId    = this.agent.CityID;
      this.cityOptions.set(MOCK_CITIES.filter(c => c.countryId === this.agent!.CountryID));

      if (this.agent.MasterAgentID) {
        const ma = mockAgents.find(a => a.AgentID === this.agent!.MasterAgentID);
        if (ma) {
          this.masterAgentSelectedItem.set({
            id: ma.AgentID,
            title: ma.AgentName,
            subtitle: [ma.CountryName, ma.CityName].filter(Boolean).join(' — '),
            avatar: ma.LogoImageLocation || '/favicon3.ico',
          });
        }
      }
    }
  }

  onCountrySelected(opt: DropdownSelectOption | null) {
    this.selectedCountryId = opt ? (opt.id as number) : null;
    this.form.controls.countryId.setValue(this.selectedCountryId);
    this.cityOptions.set(opt ? MOCK_CITIES.filter(c => c.countryId === this.selectedCountryId) : []);
    this.selectedCityId = null;
    this.form.controls.cityId.setValue(null);
  }

  onCitySelected(opt: DropdownSelectOption | null) {
    this.selectedCityId = opt ? (opt.id as number) : null;
    this.form.controls.cityId.setValue(this.selectedCityId);
  }

  onMasterAgentSelected(item: Item | null) {
    this.masterAgentSelectedItem.set(item);
    this.form.controls.masterAgentId.setValue(item ? (item.id as number) : null);
  }

  save() {
    if (this.form.invalid) return;
    this.isLoading.set(true);
    of(true).pipe(delay(500)).subscribe(() => {
      const v = this.form.getRawValue();
      const country   = MOCK_COUNTRIES.find(c => c.id === v.countryId);
      const city      = MOCK_CITIES.find(c => c.id === v.cityId);
      const masterAgent = v.masterAgentId ? mockAgents.find(a => a.AgentID === v.masterAgentId) : null;

      if (this.agent) {
        const idx = mockAgents.findIndex(a => a.AgentID === this.agent!.AgentID);
        if (idx >= 0) {
          mockAgents[idx] = {
            ...mockAgents[idx],
            AgentCode:      v.agentCode!,
            AgentName:      v.agentName!,
            AgentEmail:     v.agentEmail!,
            CR_NO:          v.crNumber ?? '',
            Address:        v.address ?? '',
            Description:    v.description ?? '',
            CountryID:      v.countryId!,
            CountryName:    country?.label ?? '',
            CityID:         v.cityId ?? 0,
            CityName:       city?.label ?? '',
            MasterAgentID:  v.masterAgentId ?? null,
            MasterAgentName: masterAgent?.AgentName ?? null,
            IsActive:       v.isActive === true,
          };
        }
      } else {
        mockAgents = [{
          AgentID:        nextAgentId++,
          AgentCode:      v.agentCode!,
          AgentName:      v.agentName!,
          AgentEmail:     v.agentEmail!,
          CR_NO:          v.crNumber ?? '',
          Address:        v.address ?? '',
          Description:    v.description ?? '',
          CountryID:      v.countryId!,
          CountryName:    country?.label ?? '',
          CityID:         v.cityId ?? 0,
          CityName:       city?.label ?? '',
          MasterAgentID:  v.masterAgentId ?? null,
          MasterAgentName: masterAgent?.AgentName ?? null,
          IsActive:       v.isActive === true,
          LogoImageLocation: null,
        }, ...mockAgents];
      }

      this.isLoading.set(false);
      this.snackBar.open(
        this.agent ? 'Agent updated successfully' : 'Agent added successfully',
        'Close', { duration: 3000 }
      );
      this.dialogRef.close(true);
    });
  }
}

// ─── Agent Details Dialog ─────────────────────────────────────────────────────

@Component({
  selector: 'agent-details-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div>
      <div class="flex items-center gap-3 p-5 border-b border-gray-100">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center">
          <i class="fas fa-user text-lg"></i>
        </div>
        <div class="flex-1">
          <h2 class="text-xl font-bold m-0">Agent Details</h2>
          <p class="text-sm text-gray-500 m-0">{{ agent.AgentName }}</p>
        </div>
        <button type="button" mat-icon-button (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="p-5" style="max-height:70vh;overflow-y:auto;">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-xs text-gray-500 mb-1">Agent Code</p>
            <p class="font-semibold text-gray-800">{{ agent.AgentCode }}</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-xs text-gray-500 mb-1">Agent Name</p>
            <p class="font-semibold text-gray-800">{{ agent.AgentName }}</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-xs text-gray-500 mb-1">Email</p>
            <p class="font-semibold text-gray-800">{{ agent.AgentEmail }}</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-xs text-gray-500 mb-1">CR Number</p>
            <p class="font-semibold text-gray-800">{{ agent.CR_NO || '—' }}</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-xs text-gray-500 mb-1">Country</p>
            <p class="font-semibold text-gray-800">{{ agent.CountryName }}</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-xs text-gray-500 mb-1">City</p>
            <p class="font-semibold text-gray-800">{{ agent.CityName }}</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-4 md:col-span-2">
            <p class="text-xs text-gray-500 mb-1">Address</p>
            <p class="font-semibold text-gray-800">{{ agent.Address || '—' }}</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-xs text-gray-500 mb-1">Main Agent</p>
            <p class="font-semibold text-gray-800">{{ agent.MasterAgentName || '—' }}</p>
          </div>
          <div class="bg-gray-50 rounded-lg p-4">
            <p class="text-xs text-gray-500 mb-1">Status</p>
            <span class="px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1"
              [class.bg-green-100]="agent.IsActive" [class.text-green-800]="agent.IsActive"
              [class.bg-red-100]="!agent.IsActive" [class.text-red-800]="!agent.IsActive">
              <i class="fas" [class.fa-check-circle]="agent.IsActive" [class.fa-times-circle]="!agent.IsActive"></i>
              {{ agent.IsActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
          @if (agent.Description) {
            <div class="bg-gray-50 rounded-lg p-4 md:col-span-2">
              <p class="text-xs text-gray-500 mb-1">Description</p>
              <p class="font-semibold text-gray-800">{{ agent.Description }}</p>
            </div>
          }
        </div>
      </div>

      <div class="flex justify-end p-5 border-t border-gray-100">
        <button mat-flat-button color="primary" (click)="dialogRef.close()">Close</button>
      </div>
    </div>
  `,
})
export class AgentDetailsDialogComponent {
  dialogRef = inject(MatDialogRef<AgentDetailsDialogComponent>);
  data      = inject<{ agent: AgentLocalModel }>(MAT_DIALOG_DATA);
  agent     = this.data.agent;
}

// ─── Assign Master Agent Dialog ───────────────────────────────────────────────

@Component({
  selector: 'assign-master-agent-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, SingleItemSelectorComponent],
  template: `
    <div>
      <div class="flex items-center gap-3 p-5 border-b border-gray-100">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center">
          <i class="fas fa-sitemap text-lg"></i>
        </div>
        <div class="flex-1">
          <h2 class="text-xl font-bold m-0">Assign Main Agent</h2>
          <p class="text-sm text-gray-500 m-0">{{ agent.AgentName }}</p>
        </div>
        <button type="button" mat-icon-button (click)="dialogRef.close(false)">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="p-5">
        <single-item-selector
          label="Select Main Agent"
          placeholder="Search and select main agent..."
          icon="fas fa-sitemap"
          [items]="agentItems"
          [selected]="selectedItem()"
          [isLoading]="false"
          (selectionChange)="onSelectionChange($event)" />
      </div>

      <div class="flex justify-end gap-3 p-5 border-t border-gray-100">
        <button mat-stroked-button (click)="dialogRef.close(false)">Cancel</button>
        <button mat-flat-button color="primary" (click)="save()">Save</button>
      </div>
    </div>
  `,
})
export class AssignMasterAgentDialogComponent {
  dialogRef = inject(MatDialogRef<AssignMasterAgentDialogComponent>);
  data      = inject<{ agent: AgentLocalModel }>(MAT_DIALOG_DATA);
  snackBar  = inject(MatSnackBar);

  agent = this.data.agent;
  agentItems: Item[] = mockAgents
    .filter(a => a.AgentID !== this.agent.AgentID)
    .map(a => ({
      id: a.AgentID,
      title: a.AgentName,
      subtitle: [a.CountryName, a.CityName].filter(Boolean).join(' — '),
      avatar: a.LogoImageLocation || '/favicon3.ico',
    }));

  selectedItem = signal<Item | null>(
    this.agent.MasterAgentID
      ? this.agentItems.find(i => i.id === this.agent.MasterAgentID) ?? null
      : null
  );

  onSelectionChange(item: Item | null) {
    this.selectedItem.set(item);
  }

  save() {
    const idx = mockAgents.findIndex(a => a.AgentID === this.agent.AgentID);
    if (idx >= 0) {
      const masterAgentId   = this.selectedItem() ? (this.selectedItem()!.id as number) : null;
      const masterAgentName = this.selectedItem()?.title ?? null;
      mockAgents[idx] = { ...mockAgents[idx], MasterAgentID: masterAgentId, MasterAgentName: masterAgentName };
    }
    this.snackBar.open('Master agent assignment updated', 'Close', { duration: 3000 });
    this.dialogRef.close(true);
  }
}

// ─── Show Agent Representers Dialog ──────────────────────────────────────────

@Component({
  selector: 'show-agent-representers-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatTableModule],
  template: `
    <div>
      <div class="flex items-center gap-3 p-5 border-b border-gray-100">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center">
          <i class="fas fa-users text-lg"></i>
        </div>
        <div class="flex-1">
          <h2 class="text-xl font-bold m-0">Agent Representers</h2>
          <p class="text-sm text-gray-500 m-0">{{ data.agentName }}</p>
        </div>
        <button type="button" mat-icon-button (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="p-5" style="max-height:60vh;overflow-y:auto;">
        @if (representers.length === 0) {
          <div class="text-center py-8 text-gray-400">
            <i class="fas fa-users text-4xl mb-3 block"></i>
            <p>No representers found for this agent.</p>
          </div>
        } @else {
          <table mat-table [dataSource]="representers" class="mat-elevation-z2 w-full">
            <ng-container matColumnDef="Name">
              <th mat-header-cell *matHeaderCellDef>Name</th>
              <td mat-cell *matCellDef="let r">{{ r.Name }}</td>
            </ng-container>
            <ng-container matColumnDef="Email">
              <th mat-header-cell *matHeaderCellDef>Email</th>
              <td mat-cell *matCellDef="let r">{{ r.Email }}</td>
            </ng-container>
            <ng-container matColumnDef="Phone">
              <th mat-header-cell *matHeaderCellDef>Phone</th>
              <td mat-cell *matCellDef="let r">{{ r.Phone }}</td>
            </ng-container>
            <ng-container matColumnDef="IsActive">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let r">
                <span class="px-2 py-1 rounded-full text-xs font-medium inline-flex items-center gap-1"
                  [class.bg-green-100]="r.IsActive" [class.text-green-800]="r.IsActive"
                  [class.bg-red-100]="!r.IsActive" [class.text-red-800]="!r.IsActive">
                  <i class="fas" [class.fa-check-circle]="r.IsActive" [class.fa-times-circle]="!r.IsActive"></i>
                  {{ r.IsActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="columns"></tr>
            <tr mat-row *matRowDef="let row; columns: columns"></tr>
          </table>
        }
      </div>

      <div class="flex justify-end p-5 border-t border-gray-100">
        <button mat-flat-button color="primary" (click)="dialogRef.close()">Close</button>
      </div>
    </div>
  `,
})
export class ShowAgentRepresentersDialogComponent {
  dialogRef    = inject(MatDialogRef<ShowAgentRepresentersDialogComponent>);
  data         = inject<{ agentId: number; agentName: string }>(MAT_DIALOG_DATA);
  representers = MOCK_REPRESENTERS.filter(r => r.AgentId === this.data.agentId);
  columns      = ['Name', 'Email', 'Phone', 'IsActive'];
}

// ─── Agent Image Manager Dialog ───────────────────────────────────────────────

@Component({
  selector: 'agent-image-manager-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div>
      <div class="flex items-center gap-3 p-5 border-b border-gray-100">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center">
          <i class="fas fa-images text-lg"></i>
        </div>
        <div class="flex-1">
          <h2 class="text-xl font-bold m-0">Agent Images</h2>
          <p class="text-sm text-gray-500 m-0">{{ data.agent.AgentName }}</p>
        </div>
        <button type="button" mat-icon-button (click)="dialogRef.close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="p-10 text-center" style="height:40vh;display:flex;flex-direction:column;align-items:center;justify-content:center;">
        <i class="fas fa-image text-gray-200" style="font-size:4rem;margin-bottom:1rem;"></i>
        <p class="text-gray-500 font-medium">Image management is not available in the prototype.</p>
        <p class="text-gray-400 text-sm">This feature will be connected to the backend API.</p>
      </div>

      <div class="flex justify-end p-5 border-t border-gray-100">
        <button mat-flat-button color="primary" (click)="dialogRef.close()">Close</button>
      </div>
    </div>
  `,
})
export class AgentImageManagerDialogComponent {
  dialogRef = inject(MatDialogRef<AgentImageManagerDialogComponent>);
  data      = inject<{ agent: AgentLocalModel }>(MAT_DIALOG_DATA);
}

// ─── Agents List Page ─────────────────────────────────────────────────────────

@Component({
  selector: 'app-agents-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatProgressSpinnerModule, MatTooltipModule, MatIconModule,
    dropdownSearchListComponent, SingleItemSelectorComponent,
  ],
  styles: [`
    .loading-shade {
      position: absolute; inset: 0;
      background: rgba(0,0,0,0.06);
      display: flex; align-items: center; justify-content: center;
      z-index: 10;
    }
    table { width: 100%; }
  `],
  template: `
    <div class="bg-white p-5 mb-6">
      <form [formGroup]="filterForm" (submit)="$event.preventDefault()" class="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">

        <div class="relative">
          <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <i class="fas fa-search text-primary-500"></i><span>Search Agents</span>
          </label>
          <div class="relative">
            <input type="text" [formControl]="filterForm.controls.filterText"
              class="w-full h-12 pl-10 pr-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all placeholder-gray-400"
              placeholder="Type to search agents...">
            <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <i class="fas fa-globe text-primary-500"></i><span>Country</span>
          </label>
          <dropdown-search-list
            [options]="countryListOptions"
            [isOptionsLoading]="isCountryLoading"
            placeholder="All Countries"
            [selectedId]="selectedCountryId()"
            (selectionChanged)="onCountrySelected($event)" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <i class="fas fa-map text-primary-500"></i><span>Region</span>
          </label>
          <dropdown-search-list
            [options]="regionListOptions"
            [isOptionsLoading]="isRegionLoading"
            placeholder="All Regions"
            [selectedId]="selectedRegionId()"
            [disabled]="!selectedCountryId()"
            (selectionChanged)="onRegionSelected($event)" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <i class="fas fa-city text-primary-500"></i><span>City</span>
          </label>
          <dropdown-search-list
            [options]="cityListOptions"
            [isOptionsLoading]="isCityLoading"
            placeholder="All Cities"
            [selectedId]="selectedCityId()"
            [disabled]="!selectedCountryId()"
            (selectionChanged)="onCitySelected($event)" />
        </div>

        <div>
          <single-item-selector
            label="Main Agent"
            placeholder="All Main Agents"
            icon="fas fa-sitemap"
            [items]="masterAgentFilterItems()"
            [selected]="masterAgentFilterSelectedItem()"
            [isLoading]="isMasterAgentFilterLoading()"
            (selectionChange)="onMasterAgentFilterSelectionChange($event)" />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <i class="fas fa-project-diagram text-primary-500"></i><span>Main Agent Status</span>
          </label>
          <dropdown-search-list
            [options]="hasMasterAgentOptions"
            [isOptionsLoading]="isHasMasterAgentLoading"
            placeholder="All"
            [selectedId]="selectedHasMasterAgentId()"
            (selectionChanged)="onHasMasterAgentSelected($event)" />
        </div>

      </form>
    </div>

    <div class="flex justify-start mt-2">
      <button mat-raised-button class="h-12" color="primary" (click)="openAddAgentDialog()">
        New Agent
      </button>
    </div>

    <div class="shadow-sm rounded table-responsive mt-2 position-relative">
      @if (isLoading()) {
        <div class="loading-shade">
          <mat-spinner diameter="50"></mat-spinner>
        </div>
      }

      <table mat-table [dataSource]="agentsDataSource()" class="mat-elevation-z8">

        <ng-container matColumnDef="agent-code">
          <th mat-header-cell *matHeaderCellDef>Code</th>
          <td mat-cell *matCellDef="let element">
            <div class="d-flex align-items-center">
              <div class="me-2 flex-shrink-0">
                @if (element.LogoImageLocation) {
                  <img class="rounded-circle" [src]="element.LogoImageLocation" width="40" height="40" alt="logo" />
                } @else {
                  <img class="rounded-circle" src="/favicon3.ico" width="40" height="40" alt="logo"
                    onerror="this.style.display='none'" />
                }
              </div>
              <div>{{ element.AgentCode }}</div>
            </div>
          </td>
        </ng-container>

        <ng-container matColumnDef="agent-name">
          <th mat-header-cell *matHeaderCellDef>Agent Name</th>
          <td mat-cell *matCellDef="let element">{{ element.AgentName }}</td>
        </ng-container>

        <ng-container matColumnDef="country">
          <th mat-header-cell *matHeaderCellDef>Country</th>
          <td mat-cell *matCellDef="let element">{{ element.CountryName }}</td>
        </ng-container>

        <ng-container matColumnDef="city">
          <th mat-header-cell *matHeaderCellDef>City</th>
          <td mat-cell *matCellDef="let element">{{ element.CityName }}</td>
        </ng-container>

        <ng-container matColumnDef="master-agent">
          <th mat-header-cell *matHeaderCellDef>Main Agent</th>
          <td mat-cell *matCellDef="let element">{{ element.MasterAgentName || '—' }}</td>
        </ng-container>

        <ng-container matColumnDef="is-active">
          <th mat-header-cell *matHeaderCellDef>Is Active</th>
          <td mat-cell *matCellDef="let element">
            <span class="px-2 py-1 rounded-full flex flex-nowrap items-center justify-center gap-1 text-xs font-medium"
              style="width:fit-content;"
              [class.bg-green-100]="element.IsActive" [class.text-green-800]="element.IsActive"
              [class.bg-red-100]="!element.IsActive" [class.text-red-800]="!element.IsActive">
              <i class="fas" [class.fa-check-circle]="element.IsActive" [class.fa-times-circle]="!element.IsActive"
                [class.text-green-500]="element.IsActive" [class.text-red-400]="!element.IsActive"></i>
              {{ element.IsActive ? 'Active' : 'Inactive' }}
            </span>
          </td>
        </ng-container>

        <ng-container matColumnDef="action">
          <th mat-header-cell *matHeaderCellDef>Action</th>
          <td mat-cell *matCellDef="let element">
            <div class="d-flex align-items-center gap-1">
              <button mat-icon-button (click)="openAgentImagesDialog(element)" matTooltip="Manage Images">
                <i class="fas fa-images text-primary fa-xs"></i>
              </button>
              <button mat-icon-button (click)="openEditAgentDialog(element)" matTooltip="Edit">
                <i class="fas fa-edit text-primary fa-xs"></i>
              </button>
              <button mat-icon-button (click)="openAssignMasterAgentDialog(element)" matTooltip="Assign Main Agent">
                <i class="fas fa-sitemap text-primary fa-xs"></i>
              </button>
              <button mat-icon-button (click)="openDetailAgentDialog(element)" matTooltip="View Details">
                <i class="fas fa-eye text-primary fa-xs"></i>
              </button>
              <button mat-icon-button (click)="showRepresenters(element)" matTooltip="View Representers">
                <i class="fas fa-users text-primary fa-xs"></i>
              </button>
            </div>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns()"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns()"></tr>
      </table>

      <mat-paginator [length]="agentsCount()" [pageSizeOptions]="[5, 10, 20]" showFirstLastButtons></mat-paginator>
    </div>
  `,
})
export class AgentsListPageComponent implements AfterViewInit {
  paginator  = viewChild.required(MatPaginator);
  matDialog  = inject(MatDialog);
  snackBar   = inject(MatSnackBar);
  destroyRef = inject(DestroyRef);

  readonly displayedColumns = computed(() => ['agent-code', 'agent-name', 'country', 'city', 'master-agent', 'is-active', 'action']);

  filterForm = new FormGroup({
    filterText:    new FormControl<string>(''),
    countryId:     new FormControl<number | null>(null),
    regionId:      new FormControl<number | null>(null),
    cityId:        new FormControl<number | null>(null),
    masterAgentId: new FormControl<number | null>(null),
    hasMasterAgent: new FormControl<boolean | null>(null),
  });

  isLoading        = signal(false);
  agentsCount      = signal(0);
  agentsDataSource = signal<AgentLocalModel[]>([]);

  countryListOptions = signal<DropdownSelectOption[]>(MOCK_COUNTRIES);
  regionListOptions  = signal<DropdownSelectOption[]>([]);
  cityListOptions    = signal<DropdownSelectOption[]>([]);
  isCountryLoading   = signal(false);
  isRegionLoading    = signal(false);
  isCityLoading      = signal(false);

  selectedCountryId = signal<number | null>(null);
  selectedRegionId  = signal<number | null>(null);
  selectedCityId    = signal<number | null>(null);

  masterAgentFilterItems        = signal<Item[]>([]);
  masterAgentFilterTotalCount   = signal(0);
  isMasterAgentFilterLoading    = signal(false);
  masterAgentFilterSelectedItem = signal<Item | null>(null);

  hasMasterAgentOptions    = signal<DropdownSelectOption[]>([
    { id: 'true', label: 'Has Main Agent' },
    { id: 'false', label: 'No Main Agent' },
  ]);
  isHasMasterAgentLoading  = signal(false);
  selectedHasMasterAgentId = signal<string | null>(null);

  ngAfterViewInit() {
    this.loadMasterAgentFilterItems();
    this.paginator().page.pipe(startWith({})).subscribe(() => this.loadAgents());
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      this.paginator().pageIndex = 0;
      this.loadAgents();
    });
  }

  loadAgents() {
    this.isLoading.set(true);
    const { filterText, countryId, cityId, masterAgentId, hasMasterAgent } = this.filterForm.getRawValue();

    let list = [...mockAgents];

    if (filterText?.trim()) {
      const term = filterText.trim().toLowerCase();
      list = list.filter(a =>
        a.AgentCode.toLowerCase().includes(term) ||
        a.AgentName.toLowerCase().includes(term) ||
        a.AgentEmail.toLowerCase().includes(term)
      );
    }
    if (countryId   != null) list = list.filter(a => a.CountryID      === countryId);
    if (cityId      != null) list = list.filter(a => a.CityID         === cityId);
    if (masterAgentId != null) list = list.filter(a => a.MasterAgentID === masterAgentId);
    if (hasMasterAgent === true)  list = list.filter(a => a.MasterAgentID != null);
    if (hasMasterAgent === false) list = list.filter(a => a.MasterAgentID == null);

    const total     = list.length;
    const pageIndex = this.paginator().pageIndex;
    const pageSize  = this.paginator().pageSize;
    const page      = list.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

    of({ list: page, count: total }).pipe(
      delay(300),
      finalize(() => this.isLoading.set(false))
    ).subscribe(({ list: pageData, count }) => {
      this.agentsDataSource.set(pageData);
      this.agentsCount.set(count);
    });
  }

  loadMasterAgentFilterItems() {
    const items = mockAgents.map(a => ({
      id: a.AgentID,
      title: a.AgentName,
      subtitle: [a.CountryName, a.CityName].filter(Boolean).join(' — '),
      avatar: a.LogoImageLocation || '/favicon3.ico',
    }));
    this.masterAgentFilterItems.set(items);
    this.masterAgentFilterTotalCount.set(items.length);
  }

  onCountrySelected(opt: DropdownSelectOption | null) {
    const id = opt ? (opt.id as number) : null;
    this.selectedCountryId.set(id);
    this.selectedRegionId.set(null);
    this.selectedCityId.set(null);
    this.regionListOptions.set(id ? MOCK_REGIONS.filter(r => r.countryId === id) : []);
    this.cityListOptions.set(id ? MOCK_CITIES.filter(c => c.countryId === id) : []);
    this.filterForm.patchValue({ countryId: id ?? undefined, regionId: null, cityId: null }, { emitEvent: true });
  }

  onRegionSelected(opt: DropdownSelectOption | null) {
    const id = opt ? (opt.id as number) : null;
    this.selectedRegionId.set(id);
    this.selectedCityId.set(null);
    const countryId = this.selectedCountryId();
    if (countryId) {
      this.cityListOptions.set(
        MOCK_CITIES.filter(c => c.countryId === countryId && (id == null || c.regionId === id))
      );
    }
    this.filterForm.patchValue({ regionId: id ?? undefined, cityId: null }, { emitEvent: true });
  }

  onCitySelected(opt: DropdownSelectOption | null) {
    const id = opt ? (opt.id as number) : null;
    this.selectedCityId.set(id);
    this.filterForm.patchValue({ cityId: id ?? undefined }, { emitEvent: true });
  }

  onMasterAgentFilterSelectionChange(item: Item | null) {
    this.masterAgentFilterSelectedItem.set(item);
    const id = item ? (item.id as number) : null;
    this.filterForm.patchValue({ masterAgentId: id ?? undefined }, { emitEvent: true });
    this.paginator().pageIndex = 0;
  }

  onHasMasterAgentSelected(opt: DropdownSelectOption | null) {
    this.selectedHasMasterAgentId.set(opt ? (opt.id as string) : null);
    this.filterForm.patchValue(
      { hasMasterAgent: opt ? opt.id === 'true' : null },
      { emitEvent: true }
    );
    this.paginator().pageIndex = 0;
  }

  openAddAgentDialog() {
    this.matDialog.open(AddNewAgentDialogComponent, { width: '900px' })
      .afterClosed().subscribe(changed => { if (changed) { this.loadMasterAgentFilterItems(); this.loadAgents(); } });
  }

  openEditAgentDialog(agent: AgentLocalModel) {
    this.matDialog.open(AddNewAgentDialogComponent, { width: '900px', data: { agent } })
      .afterClosed().subscribe(changed => { if (changed) { this.loadAgents(); } });
  }

  openDetailAgentDialog(agent: AgentLocalModel) {
    this.matDialog.open(AgentDetailsDialogComponent, { width: '900px', data: { agent }, disableClose: true });
  }

  showRepresenters(agent: AgentLocalModel) {
    this.matDialog.open(ShowAgentRepresentersDialogComponent, {
      width: '900px',
      data: { agentId: agent.AgentID, agentName: agent.AgentName },
    });
  }

  openAssignMasterAgentDialog(agent: AgentLocalModel) {
    this.matDialog.open(AssignMasterAgentDialogComponent, { width: '900px', data: { agent } })
      .afterClosed().subscribe(changed => { if (changed) { this.loadAgents(); } });
  }

  openAgentImagesDialog(agent: AgentLocalModel) {
    this.matDialog.open(AgentImageManagerDialogComponent, {
      width: '900px', maxWidth: '95vw', height: '70vh',
      autoFocus: false, disableClose: true, data: { agent },
    });
  }
}
