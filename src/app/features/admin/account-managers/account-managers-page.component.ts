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
import { takeUntilDestroyed as takeUntilDestroyed2 } from '@angular/core/rxjs-interop';
import { LoadingSpinnerComponent } from 'src/app/components/loading-spinner/loading-spinner';

// ─── Model ────────────────────────────────────────────────────────────────────

interface AgentManagerLocalModel {
  Id: number;
  Name: string;
  UserName: string;
  Phone: string;
  IsActive: boolean;
  AgentCount: number;
  AgentIds: number[];
}

// ─── Simple agent reference for the assignment dialog ────────────────────────

interface SimpleAgent {
  AgentID: number;
  AgentCode: string;
  AgentName: string;
  CountryName: string;
  CityName: string;
}

const MANAGER_AGENTS: SimpleAgent[] = [
  { AgentID: 1, AgentCode: 'AGT001', AgentName: 'Al-Noor Travel',        CountryName: 'Saudi Arabia', CityName: 'Mecca' },
  { AgentID: 2, AgentCode: 'AGT002', AgentName: 'Star Tours',            CountryName: 'Saudi Arabia', CityName: 'Riyadh' },
  { AgentID: 3, AgentCode: 'AGT003', AgentName: 'Emirates Hajj Services', CountryName: 'UAE',          CityName: 'Dubai' },
  { AgentID: 4, AgentCode: 'AGT004', AgentName: 'Jordan Pilgrim Agency',  CountryName: 'Jordan',       CityName: 'Amman' },
  { AgentID: 5, AgentCode: 'AGT005', AgentName: 'Nile Travel & Tours',   CountryName: 'Egypt',        CityName: 'Cairo' },
  { AgentID: 6, AgentCode: 'AGT006', AgentName: 'Bosphorus Tours',       CountryName: 'Turkey',       CityName: 'Istanbul' },
  { AgentID: 7, AgentCode: 'AGT007', AgentName: 'Medina Gateway Travel', CountryName: 'Saudi Arabia', CityName: 'Medina' },
  { AgentID: 8, AgentCode: 'AGT008', AgentName: 'Al-Safa Travels',       CountryName: 'Saudi Arabia', CityName: 'Jeddah' },
];

// ─── Mock Data ────────────────────────────────────────────────────────────────

let mockManagers: AgentManagerLocalModel[] = [
  { Id: 1, Name: 'Khalid Al-Mansouri', UserName: 'kmansouri',  Phone: '+966501111111', IsActive: true,  AgentCount: 3, AgentIds: [1, 2, 5] },
  { Id: 2, Name: 'Sara Al-Rashid',     UserName: 'srashid',    Phone: '+966502222222', IsActive: true,  AgentCount: 2, AgentIds: [3, 4] },
  { Id: 3, Name: 'Omar Farouq',        UserName: 'ofarouq',    Phone: '+966503333333', IsActive: false, AgentCount: 1, AgentIds: [6] },
  { Id: 4, Name: 'Nour El-Din',        UserName: 'nourdin',    Phone: '+966504444444', IsActive: true,  AgentCount: 2, AgentIds: [7, 8] },
  { Id: 5, Name: 'Layla Hassan',       UserName: 'lhassan',    Phone: '+966505555555', IsActive: true,  AgentCount: 0, AgentIds: [] },
];
let nextManagerId = 6;

// ─── New / Edit Manager Dialog ────────────────────────────────────────────────

@Component({
  selector: 'new-agent-manager-dialog',
  standalone: true,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatDialogModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    MatCheckboxModule, MatProgressSpinnerModule, LoadingSpinnerComponent,
  ],
  template: `
    <div>
      <div class="flex items-center gap-3 p-5 border-b border-gray-100">
        <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center">
          <i class="fas fa-user-cog text-lg"></i>
        </div>
        <div class="flex-1">
          <h2 class="text-xl font-bold m-0">{{ action }} Manager</h2>
          <p class="text-sm text-gray-500 m-0">{{ action === 'Add' ? 'Creating New Manager' : 'Editing Manager' }}</p>
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

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                  <i class="fas fa-user text-primary-500"></i><span>Manager Name</span>
                </label>
                <input type="text" [formControl]="form.controls.Name" maxlength="100"
                  class="w-full placeholder-gray-400 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                  style="height:3.5rem;" placeholder="Enter manager name">
                @if (form.get('Name')?.invalid && (form.get('Name')?.touched || form.get('Name')?.dirty)) {
                  <div class="text-red-500 text-xs mt-1">
                    @if (form.get('Name')?.errors?.['required']) { <span>Please enter a manager name</span> }
                    @if (form.get('Name')?.errors?.['maxlength']) { <span>Manager name must be 100 characters or fewer</span> }
                  </div>
                }
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <i class="fas fa-at text-primary-500"></i><span>User Name</span>
                  </label>
                  <input type="text" [formControl]="form.controls.UserName" maxlength="50"
                    class="w-full placeholder-gray-400 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                    style="height:3.5rem;" placeholder="Enter user name">
                  @if (form.get('UserName')?.invalid && (form.get('UserName')?.touched || form.get('UserName')?.dirty)) {
                    <div class="text-red-500 text-xs mt-1">
                      @if (form.get('UserName')?.errors?.['required']) { <span>Please enter a user name</span> }
                    </div>
                  }
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                    <i class="fas fa-mobile-alt text-primary-500"></i><span>Phone Number</span>
                  </label>
                  <input type="text" [formControl]="form.controls.Phone" maxlength="20"
                    class="w-full placeholder-gray-400 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400"
                    style="height:3.5rem;" placeholder="Enter phone number">
                  @if (form.get('Phone')?.invalid && (form.get('Phone')?.touched || form.get('Phone')?.dirty)) {
                    <div class="text-red-500 text-xs mt-1">
                      @if (form.get('Phone')?.errors?.['required']) { <span>Please enter a phone number</span> }
                    </div>
                  }
                </div>
              </div>

              <div>
                <label class="cursor-pointer flex items-center gap-2">
                  <input type="checkbox" formControlName="IsActive" class="w-4 h-4">
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
            <button type="button" disabled class="px-5 py-2.5 bg-primary-400 text-white rounded-lg opacity-80 flex items-center gap-1">
              <span class="me-2">Saving...</span><i class="fas fa-spinner fa-spin"></i>
            </button>
          } @else if (form.invalid) {
            <button type="button" disabled class="px-5 py-2.5 bg-gray-200 text-gray-500 rounded-lg opacity-80 flex items-center gap-1 cursor-not-allowed">
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
export class NewAgentManagerDialogComponent {
  dialogRef = inject(MatDialogRef<NewAgentManagerDialogComponent>);
  data      = inject<{ agent?: AgentManagerLocalModel } | null>(MAT_DIALOG_DATA, { optional: true });
  snackBar  = inject(MatSnackBar);

  manager  = this.data?.agent;
  action   = this.manager ? 'Edit' : 'Add';
  isLoading = signal(false);

  form = new FormGroup({
    Name:     new FormControl('', [Validators.required, Validators.maxLength(100)]),
    UserName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    Phone:    new FormControl('', [Validators.required, Validators.maxLength(20)]),
    IsActive: new FormControl(false),
  });

  ngOnInit() {
    if (this.manager) {
      this.form.patchValue({
        Name:     this.manager.Name,
        UserName: this.manager.UserName,
        Phone:    this.manager.Phone,
        IsActive: this.manager.IsActive,
      });
    }
  }

  save() {
    if (this.form.invalid) return;
    this.isLoading.set(true);
    of(true).pipe(delay(400)).subscribe(() => {
      const v = this.form.getRawValue();
      if (this.manager) {
        const idx = mockManagers.findIndex(m => m.Id === this.manager!.Id);
        if (idx >= 0) {
          mockManagers[idx] = {
            ...mockManagers[idx],
            Name:     v.Name!,
            UserName: v.UserName!,
            Phone:    v.Phone!,
            IsActive: v.IsActive === true,
          };
        }
      } else {
        mockManagers = [{
          Id:         nextManagerId++,
          Name:       v.Name!,
          UserName:   v.UserName!,
          Phone:      v.Phone!,
          IsActive:   v.IsActive === true,
          AgentCount: 0,
          AgentIds:   [],
        }, ...mockManagers];
      }
      this.isLoading.set(false);
      this.snackBar.open(
        this.manager ? 'Manager updated successfully' : 'Manager added successfully',
        'Close', { duration: 3000 }
      );
      this.dialogRef.close(true);
    });
  }
}

// ─── Show Agents for Manager Dialog ──────────────────────────────────────────

@Component({
  selector: 'show-agent-for-manager-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatTableModule, MatProgressSpinnerModule, FormsModule],
  template: `
    <div class="flex flex-col" style="height:95vh;">
      <div class="flex justify-between items-center px-6 py-5 border-b border-gray-100 bg-white sticky top-0 z-10">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center border border-primary-100">
            <i class="fas fa-users-cog text-primary-500 text-lg"></i>
          </div>
          <div>
            <h2 class="text-xl font-bold text-primary-500 m-0">Agents</h2>
            <p class="text-sm text-gray-500 m-0">Select agents linked to {{ manager.Name }}</p>
          </div>
        </div>
        <button type="button" mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="flex-1 overflow-y-auto p-5 bg-white custom-scroll">
        <table mat-table [dataSource]="allAgents" class="mat-elevation-z2 w-full">
          <ng-container matColumnDef="select">
            <th mat-header-cell *matHeaderCellDef>Assign</th>
            <td mat-cell *matCellDef="let a">
              <input type="checkbox"
                [checked]="isSelected(a.AgentID)"
                (change)="toggleAgent(a.AgentID)"
                class="w-4 h-4 cursor-pointer">
            </td>
          </ng-container>
          <ng-container matColumnDef="AgentCode">
            <th mat-header-cell *matHeaderCellDef>Code</th>
            <td mat-cell *matCellDef="let a">{{ a.AgentCode }}</td>
          </ng-container>
          <ng-container matColumnDef="AgentName">
            <th mat-header-cell *matHeaderCellDef>Agent Name</th>
            <td mat-cell *matCellDef="let a">{{ a.AgentName }}</td>
          </ng-container>
          <ng-container matColumnDef="CountryName">
            <th mat-header-cell *matHeaderCellDef>Country</th>
            <td mat-cell *matCellDef="let a">{{ a.CountryName }}</td>
          </ng-container>
          <ng-container matColumnDef="CityName">
            <th mat-header-cell *matHeaderCellDef>City</th>
            <td mat-cell *matCellDef="let a">{{ a.CityName }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="columns"></tr>
          <tr mat-row *matRowDef="let row; columns: columns"></tr>
        </table>
      </div>

      <div class="px-6 py-5 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 sticky bottom-0 z-10">
        <button type="button" mat-stroked-button (click)="close()" [disabled]="isSaving()">Cancel</button>
        <button type="button" mat-flat-button color="primary" (click)="save()" [disabled]="isSaving()"
          style="min-width:160px;height:2.75rem;">
          <div class="flex items-center justify-center gap-2">
            @if (isSaving()) {
              <mat-spinner diameter="18"></mat-spinner>
              <span>Saving...</span>
            } @else {
              <span>Save Changes</span>
            }
          </div>
        </button>
      </div>
    </div>
  `,
})
export class ShowAgentForManagerDialogComponent {
  dialogRef = inject(MatDialogRef<ShowAgentForManagerDialogComponent>);
  data      = inject<AgentManagerLocalModel>(MAT_DIALOG_DATA);
  snackBar  = inject(MatSnackBar);

  manager      = this.data;
  allAgents    = MANAGER_AGENTS;
  columns      = ['select', 'AgentCode', 'AgentName', 'CountryName', 'CityName'];
  isSaving     = signal(false);
  selectedIds  = signal<Set<number>>(new Set(this.data.AgentIds ?? []));

  isSelected(id: number): boolean {
    return this.selectedIds().has(id);
  }

  toggleAgent(id: number) {
    const current = new Set(this.selectedIds());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.selectedIds.set(current);
  }

  close() {
    this.dialogRef.close();
  }

  save() {
    this.isSaving.set(true);
    of(true).pipe(delay(400)).subscribe(() => {
      const newIds   = [...this.selectedIds()];
      const delta    = newIds.length - (this.manager.AgentIds?.length ?? 0);
      const idx      = mockManagers.findIndex(m => m.Id === this.manager.Id);
      if (idx >= 0) {
        mockManagers[idx] = {
          ...mockManagers[idx],
          AgentIds:   newIds,
          AgentCount: newIds.length,
        };
        // Persist delta so parent can refresh count
        const key     = 'agentCountUpdate_' + this.manager.Id;
        const current = +(localStorage.getItem(key) ?? '0');
        localStorage.setItem(key, (current + delta).toString());
      }
      this.isSaving.set(false);
      this.snackBar.open('Agents updated successfully', 'Close', { duration: 3000 });
      this.dialogRef.close(true);
    });
  }
}

// ─── Account Managers Page ────────────────────────────────────────────────────

@Component({
  selector: 'app-account-managers-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatButtonModule, MatFormFieldModule,
    MatInputModule, MatProgressSpinnerModule, MatTooltipModule, MatIconModule,
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
      <form [formGroup]="filterForm" class="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">

        <div class="relative md:col-span-2">
          <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
            <i class="fas fa-search text-primary-500"></i><span>Search Managers</span>
          </label>
          <div class="relative">
            <input type="text" [formControl]="filterForm.controls.filterText"
              class="w-full h-12 pl-10 pr-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-400 transition-all placeholder-gray-400"
              placeholder="Type to search managers...">
            <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
          </div>
        </div>

        <div class="flex gap-3">
          <button type="button" (click)="loadManagers()" [disabled]="isLoading()"
            class="px-5 h-12 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white rounded-lg transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl">
            @if (isLoading()) {
              <i class="fas fa-spinner fa-spin"></i>
            } @else {
              <i class="fas fa-search"></i>
            }
            <span>Search</span>
          </button>
        </div>

      </form>
    </div>

    <div class="flex justify-start mt-2">
      <button mat-raised-button class="h-12" color="primary" (click)="openAddManagerDialog()">
        New Manager
      </button>
    </div>

    <div class="shadow-sm rounded table-responsive mt-2 position-relative">
      @if (isLoading()) {
        <div class="loading-shade">
          <mat-spinner diameter="50"></mat-spinner>
        </div>
      }

      <table mat-table [dataSource]="usersDataSource()" class="mat-elevation-z8">

        <ng-container matColumnDef="Name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let element">{{ element.Name }}</td>
        </ng-container>

        <ng-container matColumnDef="UserName">
          <th mat-header-cell *matHeaderCellDef>Username</th>
          <td mat-cell *matCellDef="let element">{{ element.UserName }}</td>
        </ng-container>

        <ng-container matColumnDef="Phone">
          <th mat-header-cell *matHeaderCellDef>Phone Number</th>
          <td mat-cell *matCellDef="let element">{{ element.Phone }}</td>
        </ng-container>

        <ng-container matColumnDef="IsActive">
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

        <ng-container matColumnDef="AgentCount">
          <th mat-header-cell *matHeaderCellDef class="text-center">Agent Count</th>
          <td mat-cell *matCellDef="let element" class="text-center">{{ element.AgentCount }}</td>
        </ng-container>

        <ng-container matColumnDef="action">
          <th mat-header-cell *matHeaderCellDef>Actions</th>
          <td mat-cell *matCellDef="let element">
            <button mat-icon-button (click)="openEditManagerDialog(element)" matTooltip="Edit">
              <i class="fas fa-edit text-primary fa-xs"></i>
            </button>
            <button mat-icon-button (click)="showAgentsForManager(element)" matTooltip="View Agents">
              <i class="fas fa-users text-primary fa-xs"></i>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns()"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns()"></tr>
      </table>

      <mat-paginator [length]="agentsCount()" [pageSizeOptions]="[5, 10, 20]" showFirstLastButtons></mat-paginator>
    </div>
  `,
})
export class AccountManagersPageComponent implements AfterViewInit {
  paginator  = viewChild.required(MatPaginator);
  matDialog  = inject(MatDialog);
  snackBar   = inject(MatSnackBar);
  destroyRef = inject(DestroyRef);

  readonly displayedColumns = computed(() => ['Name', 'UserName', 'Phone', 'IsActive', 'AgentCount', 'action']);

  filterForm = new FormGroup({
    filterText: new FormControl<string>(''),
  });

  isLoading       = signal(false);
  agentsCount     = signal(0);
  usersDataSource = signal<AgentManagerLocalModel[]>([]);

  ngAfterViewInit() {
    this.paginator().page.pipe(startWith({})).subscribe(() => this.loadManagers());
    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      this.paginator().pageIndex = 0;
      this.loadManagers();
    });
  }

  loadManagers() {
    this.isLoading.set(true);

    // Sync agent counts from localStorage (updated by ShowAgentForManagerDialog)
    mockManagers = mockManagers.map(m => {
      const key   = 'agentCountUpdate_' + m.Id;
      const raw   = localStorage.getItem(key);
      if (raw !== null) {
        localStorage.removeItem(key);
        const newCount = m.AgentIds?.length ?? 0;
        return { ...m, AgentCount: newCount };
      }
      return m;
    });

    const { filterText } = this.filterForm.getRawValue();
    let list = [...mockManagers];

    if (filterText?.trim()) {
      const term = filterText.trim().toLowerCase();
      list = list.filter(m =>
        m.Name.toLowerCase().includes(term) ||
        m.UserName.toLowerCase().includes(term) ||
        m.Phone.includes(term)
      );
    }

    const total     = list.length;
    const pageIndex = this.paginator().pageIndex;
    const pageSize  = this.paginator().pageSize;
    const page      = list.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);

    of({ list: page, count: total }).pipe(
      delay(300),
      finalize(() => this.isLoading.set(false))
    ).subscribe(({ list: pageData, count }) => {
      this.usersDataSource.set(pageData);
      this.agentsCount.set(count);
    });
  }

  openAddManagerDialog() {
    this.matDialog.open(NewAgentManagerDialogComponent, { width: '900px', disableClose: true })
      .afterClosed().subscribe(changed => { if (changed) this.loadManagers(); });
  }

  openEditManagerDialog(manager: AgentManagerLocalModel) {
    this.matDialog.open(NewAgentManagerDialogComponent, {
      width: '900px', disableClose: true, data: { agent: manager },
    }).afterClosed().subscribe(changed => { if (changed) this.loadManagers(); });
  }

  showAgentsForManager(manager: AgentManagerLocalModel) {
    this.matDialog.open(ShowAgentForManagerDialogComponent, {
      width: '1200px', data: manager,
    }).afterClosed().subscribe(() => this.loadManagers());
  }
}
