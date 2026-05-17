import {
  AfterViewInit, ChangeDetectionStrategy, Component, DestroyRef, inject, signal, computed, viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, of, startWith } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { AgentModel, CountryData, CityData } from './subagents.model';
import { SubagentsService } from './subagents.service';
import { AddSubagentDialogComponent } from './components/add-subagent-dialog.component';
import { SubagentUsersListDialogComponent } from './components/subagent-users-list-dialog.component';

@Component({
  selector: 'subagents-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule,
    MatTableModule, MatPaginatorModule, MatProgressSpinnerModule, MatDialogModule,
  ],
  template: `
    <div class="sp-wrap">

      <!-- Page Header -->
      <div class="sp-header-card">
        <div class="sp-header-inner">
          <div class="sp-header-left">
            <div class="sp-icon-box">
              <span class="material-icons-round">group</span>
            </div>
            <div>
              <h1 class="sp-title">Subagents</h1>
              <p class="sp-subtitle">Manage your registered subagents</p>
            </div>
          </div>
          <div class="sp-header-right">
            @if (subagentsCount() > 0) {
              <span class="sp-count-badge">{{ subagentsCount() }} total</span>
            }
            <button class="sp-new-btn" (click)="openAddDialog()">
              <span class="material-icons-round">add</span>
              New Subagent
            </button>
          </div>
        </div>
      </div>

      <!-- Filter Card -->
      <div class="sp-filter-card">
        <div class="sp-filter-label">
          <span class="material-icons-round">tune</span>
          Filters
        </div>
        <form (submit)="$event.preventDefault()" class="sp-filter-grid">

          <!-- Country -->
          <div class="sp-filter-field">
            <label class="sp-filter-fl">Country</label>
            <div class="sp-select-wrap">
              <span class="material-icons-round sp-select-icon">public</span>
              @if (isCountryLoading()) {
                <div class="sp-select-loading">Loading...</div>
              } @else {
                <select class="sp-select"
                  [value]="selectedCountryId() ?? ''"
                  (change)="onCountryChange($event)">
                  <option value="">All Countries</option>
                  @for (c of countryList(); track c.CountryID) {
                    <option [value]="c.CountryID">{{ c.TitleEnglish ?? c.Title }}</option>
                  }
                </select>
              }
              <span class="material-icons-round sp-select-arrow">expand_more</span>
            </div>
          </div>

          <!-- City -->
          <div class="sp-filter-field">
            <label class="sp-filter-fl">City</label>
            <div class="sp-select-wrap">
              <span class="material-icons-round sp-select-icon" [class.sp-icon-disabled]="!selectedCountryId()">location_city</span>
              @if (isCityLoading()) {
                <div class="sp-select-loading">Loading...</div>
              } @else {
                <select class="sp-select" [disabled]="!selectedCountryId()"
                  [value]="filterForm.controls.cityId.value ?? ''"
                  (change)="onCityChange($event)">
                  <option value="">All Cities</option>
                  @for (c of cityList(); track c.CityID) {
                    <option [value]="c.CityID">{{ c.NameEn ?? c.Name }}</option>
                  }
                </select>
              }
              <span class="material-icons-round sp-select-arrow" [class.sp-icon-disabled]="!selectedCountryId()">expand_more</span>
            </div>
          </div>

          <!-- Status -->
          <div class="sp-filter-field">
            <label class="sp-filter-fl">Status</label>
            <div class="sp-select-wrap">
              <span class="material-icons-round sp-select-icon">radio_button_checked</span>
              <select class="sp-select"
                [value]="filterForm.controls.isActive.value ?? ''"
                (change)="onStatusChange($event)">
                <option value="">All Statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              <span class="material-icons-round sp-select-arrow">expand_more</span>
            </div>
          </div>

        </form>
      </div>

      <!-- Table Card -->
      <div class="sp-table-card">

        @if (isLoading()) {
          <div class="sp-table-overlay">
            <mat-spinner diameter="36" />
            <span>Loading subagents...</span>
          </div>
        }

        <table mat-table [dataSource]="subagentsDataSource()" class="sp-table">

          <!-- Code -->
          <ng-container matColumnDef="agent-code">
            <th mat-header-cell *matHeaderCellDef>Code</th>
            <td mat-cell *matCellDef="let el">
              <div class="sp-code-cell">
                <div class="sp-logo">
                  @if (el.LogoImageLocation) {
                    <img [src]="el.LogoImageLocation" alt="logo" class="sp-logo-img">
                  } @else {
                    <span class="material-icons-round">business</span>
                  }
                </div>
                <span class="sp-code-text">{{ el.AgentCode }}</span>
              </div>
            </td>
          </ng-container>

          <!-- Name -->
          <ng-container matColumnDef="agent-name">
            <th mat-header-cell *matHeaderCellDef>Agent Name</th>
            <td mat-cell *matCellDef="let el">
              <p class="sp-name">{{ el.AgentName }}</p>
              @if (el.AgentEmail) {
                <p class="sp-email">{{ el.AgentEmail }}</p>
              }
            </td>
          </ng-container>

          <!-- Country -->
          <ng-container matColumnDef="country">
            <th mat-header-cell *matHeaderCellDef>Country</th>
            <td mat-cell *matCellDef="let el">
              @if (el.CountryName) {
                <div class="sp-location">
                  <span class="material-icons-round sp-loc-icon">public</span>
                  {{ el.CountryName }}
                </div>
              } @else { <span class="sp-dash">—</span> }
            </td>
          </ng-container>

          <!-- City -->
          <ng-container matColumnDef="city">
            <th mat-header-cell *matHeaderCellDef>City</th>
            <td mat-cell *matCellDef="let el">
              @if (el.CityName) {
                <div class="sp-location">
                  <span class="material-icons-round sp-loc-icon">place</span>
                  {{ el.CityName }}
                </div>
              } @else { <span class="sp-dash">—</span> }
            </td>
          </ng-container>

          <!-- Status -->
          <ng-container matColumnDef="is-active">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let el">
              <span class="sp-status-badge" [class.sp-active]="el.IsActive" [class.sp-inactive]="!el.IsActive">
                <span class="sp-status-dot"></span>
                {{ el.IsActive ? 'Active' : 'Inactive' }}
              </span>
            </td>
          </ng-container>

          <!-- Actions -->
          <ng-container matColumnDef="action">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let el">
              <div class="sp-action-btns">
                <button class="sp-action-btn sp-action-users" title="Manage users" (click)="openUsersDialog(el)">
                  <span class="material-icons-round">manage_accounts</span>
                </button>
                <button class="sp-action-btn sp-action-edit" title="Edit subagent" (click)="openEditDialog(el)">
                  <span class="material-icons-round">edit</span>
                </button>
              </div>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns()"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns()"></tr>
        </table>

        <!-- Empty State -->
        @if (!isLoading() && subagentsDataSource().length === 0) {
          <div class="sp-empty">
            <div class="sp-empty-icon"><span class="material-icons-round">group</span></div>
            <h3>No subagents found</h3>
            <p>No subagents match your current filters, or none have been added yet.</p>
            <button class="sp-empty-add" (click)="openAddDialog()">
              <span class="material-icons-round">add</span>
              Add First Subagent
            </button>
          </div>
        }

        <mat-paginator
          [length]="subagentsCount()"
          [pageSizeOptions]="[5, 10, 20]"
          showFirstLastButtons
          class="sp-paginator" />
      </div>

    </div>
  `,
  styles: [`
    .sp-wrap { display: flex; flex-direction: column; gap: 16px; }

    /* Header Card */
    .sp-header-card {
      background: #fff; border: 1px solid #e5e7eb;
      border-radius: 12px; padding: 20px 24px; box-shadow: 0 1px 3px rgba(0,0,0,.06);
    }
    .sp-header-inner { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
    .sp-header-left  { display: flex; align-items: center; gap: 16px; }
    .sp-header-right { display: flex; align-items: center; gap: 10px; }
    .sp-icon-box {
      width: 48px; height: 48px; background: #f0fdf4; color: var(--sero-primary, #3a472a);
      border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .sp-icon-box .material-icons-round { font-size: 22px; }
    .sp-title    { font-size: 20px; font-weight: 700; color: #111827; margin: 0; }
    .sp-subtitle { font-size: 13px; color: #9ca3af; margin: 4px 0 0; }
    .sp-count-badge {
      background: #f0fdf4; color: var(--sero-primary, #3a472a); border: 1px solid #bbf7d0;
      border-radius: 20px; padding: 3px 12px; font-size: 13px; font-weight: 600;
    }
    .sp-new-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 9px 18px; background: var(--sero-primary, #3a472a); color: #fff;
      border: none; border-radius: 8px; font-size: 13px; font-weight: 600;
      cursor: pointer; transition: background 0.15s; box-shadow: 0 1px 3px rgba(0,0,0,.1);
    }
    .sp-new-btn:hover { background: #4d6038; }
    .sp-new-btn .material-icons-round { font-size: 14px; }

    /* Filter Card */
    .sp-filter-card {
      background: #fff; border: 1px solid #e5e7eb;
      border-radius: 12px; padding: 18px 24px; box-shadow: 0 1px 3px rgba(0,0,0,.06);
    }
    .sp-filter-label {
      display: flex; align-items: center; gap: 6px;
      font-size: 11px; font-weight: 700; color: #9ca3af;
      text-transform: uppercase; letter-spacing: .5px;
      margin-bottom: 14px;
    }
    .sp-filter-label .material-icons-round { font-size: 14px; color: #9ca3af; }
    .sp-filter-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; }
    @media (max-width: 640px) { .sp-filter-grid { grid-template-columns: 1fr; } }

    .sp-filter-field { display: flex; flex-direction: column; gap: 5px; }
    .sp-filter-fl { font-size: 11px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: .3px; }
    .sp-select-wrap { position: relative; display: flex; align-items: center; }
    .sp-select-icon { position: absolute; left: 10px; font-size: 16px; color: #9ca3af; pointer-events: none; }
    .sp-icon-disabled { color: #d1d5db !important; }
    .sp-select {
      width: 100%; height: 42px; padding: 0 32px 0 36px;
      border: 1px solid #d1d5db; border-radius: 8px; background: #fff;
      font-size: 13px; color: #374151; appearance: none; cursor: pointer; transition: border-color 0.15s;
    }
    .sp-select:focus { outline: none; border-color: var(--sero-primary, #3a472a); }
    .sp-select:disabled { background: #f9fafb; color: #9ca3af; cursor: not-allowed; border-color: #f3f4f6; }
    .sp-select-loading {
      width: 100%; height: 42px; padding: 0 12px 0 36px;
      border: 1px solid #d1d5db; border-radius: 8px; background: #f9fafb;
      font-size: 13px; color: #9ca3af; display: flex; align-items: center;
    }
    .sp-select-arrow { position: absolute; right: 10px; font-size: 16px; color: #9ca3af; pointer-events: none; }

    /* Table Card */
    .sp-table-card {
      background: #fff; border: 1px solid #e5e7eb; border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,.06); overflow: hidden; position: relative;
    }
    .sp-table-overlay {
      position: absolute; inset: 0; background: rgba(255,255,255,.8);
      backdrop-filter: blur(2px); z-index: 10;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px;
    }
    .sp-table-overlay span { font-size: 13px; color: #6b7280; }

    .sp-table { width: 100%; }

    /* Material table override */
    ::ng-deep .sp-wrap .mat-mdc-header-row {
      background-color: #f9fafb; border-bottom: 1px solid #e5e7eb;
    }
    ::ng-deep .sp-wrap .mat-mdc-header-cell {
      color: #6b7280; font-size: 11px; font-weight: 700; text-transform: uppercase;
      letter-spacing: .05em; border-bottom: none; padding: 12px 16px;
    }
    ::ng-deep .sp-wrap .mat-mdc-row { border-bottom: 1px solid #f3f4f6; }
    ::ng-deep .sp-wrap .mat-mdc-row:last-child { border-bottom: none; }
    ::ng-deep .sp-wrap .mat-mdc-row:hover { background-color: #f9fafb; }
    ::ng-deep .sp-wrap .mat-mdc-cell { border-bottom: none; padding: 12px 16px; color: #374151; }
    ::ng-deep .sp-wrap .mat-column-action { width: 72px; }
    ::ng-deep .sp-wrap .mat-column-is-active { width: 120px; }
    ::ng-deep .sp-wrap .mat-mdc-paginator { background: transparent; }
    ::ng-deep .sp-wrap .mat-mdc-paginator-container { padding: 8px 16px; min-height: 52px; border-top: 1px solid #f3f4f6; }
    ::ng-deep .sp-wrap .mat-mdc-paginator-page-size-label,
    ::ng-deep .sp-wrap .mat-mdc-paginator-range-label { font-size: 12px; color: #6b7280; }

    .sp-code-cell { display: flex; align-items: center; gap: 10px; }
    .sp-logo {
      width: 36px; height: 36px; border-radius: 50%; background: #f0fdf4;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      overflow: hidden; box-shadow: 0 0 0 2px #f3f4f6;
    }
    .sp-logo .material-icons-round { font-size: 16px; color: var(--sero-primary, #3a472a); }
    .sp-logo-img { width: 100%; height: 100%; object-fit: cover; }
    .sp-code-text { font-size: 13px; font-weight: 600; color: #374151; }

    .sp-name  { font-size: 13px; font-weight: 600; color: #111827; margin: 0; }
    .sp-email { font-size: 11px; color: #9ca3af; margin: 2px 0 0; }

    .sp-location { display: flex; align-items: center; gap: 5px; font-size: 13px; color: #374151; }
    .sp-loc-icon { font-size: 13px; color: #d1d5db; }
    .sp-dash { color: #d1d5db; }

    .sp-status-badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 4px 10px; border-radius: 20px; border: 1px solid;
      font-size: 11px; font-weight: 600;
    }
    .sp-active   { background: #f0fdf4; color: #166534; border-color: #bbf7d0; }
    .sp-inactive { background: #fef2f2; color: #991b1b; border-color: #fecaca; }
    .sp-status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

    .sp-action-btns { display: flex; align-items: center; gap: 2px; }
    .sp-action-btn {
      width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
      background: none; border: none; cursor: pointer; color: #9ca3af; transition: all 0.15s;
    }
    .sp-action-btn .material-icons-round { font-size: 16px; }
    .sp-action-users:hover { color: #6366f1; background: #eef2ff; }
    .sp-action-edit:hover  { color: var(--sero-primary, #3a472a); background: #f0fdf4; }

    /* Empty State */
    .sp-empty {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      text-align: center; padding: 60px 24px;
    }
    .sp-empty-icon {
      width: 64px; height: 64px; background: #f3f4f6; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; margin-bottom: 16px;
    }
    .sp-empty-icon .material-icons-round { font-size: 28px; color: #d1d5db; }
    .sp-empty h3 { font-size: 15px; font-weight: 600; color: #374151; margin: 0 0 4px; }
    .sp-empty p  { font-size: 13px; color: #9ca3af; margin: 0 0 20px; max-width: 280px; }
    .sp-empty-add {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 9px 18px; background: var(--sero-primary, #3a472a); color: #fff;
      border: none; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer;
    }
    .sp-empty-add:hover { background: #4d6038; }
    .sp-empty-add .material-icons-round { font-size: 14px; }
  `],
})
export class SubagentsPageComponent implements AfterViewInit {
  private readonly service = inject(SubagentsService);
  private readonly matDialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  paginator = viewChild.required(MatPaginator);

  readonly displayedColumns = computed(() => ['agent-code', 'agent-name', 'country', 'city', 'is-active', 'action']);

  filterForm = new FormGroup({
    cityId:   new FormControl<number | undefined>(undefined),
    isActive: new FormControl<boolean | undefined>(undefined),
  });

  isLoading = signal(false);
  subagentsCount = signal(0);
  subagentsDataSource = signal<AgentModel[]>([]);

  countryList = signal<CountryData[]>([]);
  isCountryLoading = signal(false);
  selectedCountryId = signal<number | null>(null);

  cityList = signal<CityData[]>([]);
  isCityLoading = signal(false);

  ngAfterViewInit() {
    this.loadCountries();

    this.paginator().page.pipe(startWith({})).subscribe(() => this.loadSubagents());

    this.filterForm.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged((a, b) => a?.cityId === b?.cityId && a?.isActive === b?.isActive),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe(() => {
      this.paginator().pageIndex = 0;
      this.loadSubagents();
    });
  }

  private loadSubagents() {
    this.isLoading.set(true);
    const { cityId, isActive } = this.filterForm.getRawValue();

    forkJoin({
      list:  this.service.getAgentList({
        pageIndex: this.paginator().pageIndex,
        pageSize:  this.paginator().pageSize,
        cityID:    cityId  ?? undefined,
        isActive:  isActive ?? undefined,
      }).pipe(catchError(() => of([] as AgentModel[]))),
      count: this.service.getAgentListCount({
        cityID:   cityId  ?? undefined,
        isActive: isActive ?? undefined,
      }).pipe(catchError(() => of(0))),
    }).pipe(finalize(() => this.isLoading.set(false)))
      .subscribe(({ list, count }) => {
        this.subagentsDataSource.set(list ?? []);
        this.subagentsCount.set(count ?? 0);
      });
  }

  private loadCountries() {
    this.isCountryLoading.set(true);
    this.service.getCountriesLookup().subscribe({
      next: (c) => { this.countryList.set(c ?? []); this.isCountryLoading.set(false); },
      error: () => this.isCountryLoading.set(false),
    });
  }

  onCountryChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    const id = val ? Number(val) : null;
    this.selectedCountryId.set(id);
    this.cityList.set([]);
    this.filterForm.patchValue({ cityId: undefined }, { emitEvent: true });
    if (id) {
      this.isCityLoading.set(true);
      this.service.getCitiesLookup(id).subscribe({
        next: (c) => { this.cityList.set(c ?? []); this.isCityLoading.set(false); },
        error: () => this.isCityLoading.set(false),
      });
    }
  }

  onCityChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.filterForm.patchValue({ cityId: val ? Number(val) : undefined }, { emitEvent: true });
  }

  onStatusChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    const parsed = val === '' ? undefined : val === 'true';
    this.filterForm.patchValue({ isActive: parsed }, { emitEvent: true });
    this.paginator().pageIndex = 0;
  }

  openAddDialog() {
    this.matDialog.open(AddSubagentDialogComponent, { width: '900px', maxWidth: '95vw' })
      .afterClosed().subscribe((changed) => { if (changed) this.loadSubagents(); });
  }

  openEditDialog(agent: AgentModel) {
    this.matDialog.open(AddSubagentDialogComponent, { width: '900px', maxWidth: '95vw', data: { agent } })
      .afterClosed().subscribe((changed) => { if (changed) this.loadSubagents(); });
  }

  openUsersDialog(agent: AgentModel) {
    this.matDialog.open(SubagentUsersListDialogComponent, {
      width: '1200px', maxWidth: '95vw', data: { agent }, disableClose: false,
    });
  }
}
