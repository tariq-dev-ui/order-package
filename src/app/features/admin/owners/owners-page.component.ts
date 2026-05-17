// Currently using local mock data for frontend prototype. Later this can be replaced with backend API.

import {
  AfterViewInit, ChangeDetectionStrategy, Component,
  inject, signal, viewChild, OnInit
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { startWith } from 'rxjs';

// ── Owner Model ────────────────────────────────────────────────────────────────

export interface SeroOwnerModel {
  OwnerID?: number;
  OwnerCode?: string;
  OwnerName?: string;
  Email?: string;
  Mobile?: string;
  Phone?: string;
  UserName?: string;
  IsActive?: boolean;
}

// ── Mock Data ──────────────────────────────────────────────────────────────────

let nextOwnerId = 6;
let mockOwners: SeroOwnerModel[] = [
  { OwnerID: 1, OwnerCode: 'OWN-001', OwnerName: 'Abdullah Al-Rashid',  Email: 'a.rashid@sero.sa',   Mobile: '+966501234567', Phone: '+96611234567', UserName: 'a.rashid',   IsActive: true  },
  { OwnerID: 2, OwnerCode: 'OWN-002', OwnerName: 'Fatima Al-Zahraa',    Email: 'f.zahraa@sero.sa',   Mobile: '+966507654321', Phone: '+96617654321', UserName: 'f.zahraa',   IsActive: true  },
  { OwnerID: 3, OwnerCode: 'OWN-003', OwnerName: 'Khalid Al-Mansoori',  Email: 'k.mansoori@sero.sa', Mobile: '+966509876543', Phone: '+96619876543', UserName: 'k.mansoori', IsActive: false },
  { OwnerID: 4, OwnerCode: 'OWN-004', OwnerName: 'Maryam Al-Haddad',    Email: 'm.haddad@sero.sa',   Mobile: '+966551122334', Phone: '+96611122334', UserName: 'm.haddad',   IsActive: true  },
  { OwnerID: 5, OwnerCode: 'OWN-005', OwnerName: 'Omar Al-Farouq',      Email: 'o.farouq@sero.sa',   Mobile: '+966565432109', Phone: '+96615432109', UserName: 'o.farouq',   IsActive: true  },
];

// ── New / Edit Owner Dialog ────────────────────────────────────────────────────

@Component({
  selector: 'app-new-owner-dialog',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatDialogModule, MatButtonModule,
    MatFormFieldModule, MatInputModule, MatCheckboxModule,
    MatProgressSpinnerModule, TranslateModule
  ],
  template: `
    <h1 mat-dialog-title>{{ action | translate }} {{ 'Owner' | translate }}</h1>
    <div mat-dialog-content style="max-width:520px; padding:16px 24px;" class="position-relative">
      @if (isLoading()) {
        <div class="ow-loading-shade"><mat-spinner [diameter]="50" /></div>
      }
      <form [formGroup]="form">
        <div class="ow-form-grid">
          <mat-form-field appearance="outline" class="ow-half">
            <mat-label>{{ 'Owner Code' | translate }}</mat-label>
            <input matInput [formControl]="form.controls.OwnerCode" placeholder="{{ 'Owner Code' | translate }}" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="ow-full">
            <mat-label>{{ 'Owner Name' | translate }}</mat-label>
            <input matInput [formControl]="form.controls.OwnerName" placeholder="{{ 'Owner Name' | translate }}" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="ow-full">
            <mat-label>{{ 'Email' | translate }}</mat-label>
            <input matInput [formControl]="form.controls.Email" placeholder="{{ 'Email' | translate }}" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="ow-full">
            <mat-label>{{ 'Mobile Number' | translate }}</mat-label>
            <input matInput [formControl]="form.controls.Mobile" placeholder="{{ 'Mobile Number' | translate }}" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="ow-full">
            <mat-label>{{ 'Phone Number' | translate }}</mat-label>
            <input matInput [formControl]="form.controls.Phone" placeholder="{{ 'Phone Number' | translate }}" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="ow-full">
            <mat-label>{{ 'User Name' | translate }}</mat-label>
            <input matInput [formControl]="form.controls.UserName" placeholder="{{ 'User Name' | translate }}" />
          </mat-form-field>
          <div class="ow-full">
            <mat-checkbox
              [checked]="form.controls.isActive.value ?? false"
              (change)="form.controls.isActive.setValue($event.checked)">
              {{ 'Is Active' | translate }}
            </mat-checkbox>
          </div>
        </div>
      </form>
    </div>
    <mat-dialog-actions align="end" style="padding:8px 24px 16px;">
      <button mat-flat-button (click)="dialogRef.close()">{{ 'Cancel' | translate }}</button>
      <button mat-flat-button color="primary" (click)="save()">{{ 'Save' | translate }}</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .ow-loading-shade {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,.15); z-index: 1;
      display: flex; align-items: center; justify-content: center;
    }
    .ow-form-grid { display: flex; flex-wrap: wrap; gap: 4px 12px; }
    .ow-half { flex: 0 0 calc(50% - 6px); min-width: 140px; }
    .ow-full { flex: 0 0 100%; }
    mat-form-field { width: 100%; }
  `]
})
export class NewOwnerDialogComponent implements OnInit {
  dialogRef = inject(MatDialogRef<NewOwnerDialogComponent>);
  private snackBar = inject(MatSnackBar);
  data = inject<{ Owner?: SeroOwnerModel } | null>(MAT_DIALOG_DATA, { optional: true });

  owner: SeroOwnerModel | undefined = this.data?.Owner;
  action = this.owner === undefined ? 'Add' : 'Edit';
  isLoading = signal(false);

  form = new FormGroup({
    OwnerCode: new FormControl(''),
    OwnerName: new FormControl(''),
    Email:     new FormControl(''),
    Mobile:    new FormControl(''),
    Phone:     new FormControl(''),
    UserName:  new FormControl(''),
    isActive:  new FormControl(true),
  });

  ngOnInit() {
    if (this.owner) {
      this.form.setValue({
        OwnerCode: this.owner.OwnerCode ?? '',
        OwnerName: this.owner.OwnerName ?? '',
        Email:     this.owner.Email     ?? '',
        Mobile:    this.owner.Mobile    ?? '',
        Phone:     this.owner.Phone     ?? '',
        UserName:  this.owner.UserName  ?? '',
        isActive:  this.owner.IsActive  ?? true,
      });
    }
  }

  save() {
    this.isLoading.set(true);
    const v = this.form.value;
    const saved: SeroOwnerModel = {
      OwnerID:   this.owner?.OwnerID ?? nextOwnerId++,
      OwnerCode: v.OwnerCode ?? '',
      OwnerName: v.OwnerName ?? '',
      Email:     v.Email     ?? '',
      Mobile:    v.Mobile    ?? '',
      Phone:     v.Phone     ?? '',
      UserName:  v.UserName  || (v.Email?.split('@')[0] ?? ''),
      IsActive:  v.isActive  ?? true,
    };

    if (this.owner?.OwnerID) {
      const idx = mockOwners.findIndex(o => o.OwnerID === this.owner!.OwnerID);
      if (idx >= 0) mockOwners[idx] = saved;
    } else {
      mockOwners = [saved, ...mockOwners];
    }

    this.isLoading.set(false);
    this.snackBar.open('Owner saved successfully', 'Close', { duration: 3000 });
    this.dialogRef.close(true);
  }
}

// ── Owners Page ────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-owners-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule, MatTableModule, MatPaginatorModule,
    MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule,
    MatCheckboxModule, MatSelectModule, MatProgressSpinnerModule,
    MatCardModule, MatTooltipModule, TranslateModule
  ],
  template: `
    <mat-card class="ow-page-card">

      <!-- Header -->
      <div class="ow-header">
        <button mat-raised-button color="primary" (click)="openAddDialog()">
          {{ 'New Owner' | translate }}
        </button>
      </div>

      <!-- Search criteria -->
      <fieldset class="ow-filter-box">
        <legend class="ow-filter-legend">{{ 'Search Criteria' | translate }}</legend>
        <form [formGroup]="filterForm" class="ow-filter-form">
          <mat-form-field appearance="outline" class="ow-filter-field">
            <mat-label>{{ 'Search' | translate }}</mat-label>
            <input matInput [formControl]="filterForm.controls.filterText"
                   placeholder="{{ 'Search' | translate }}" />
          </mat-form-field>
          <mat-form-field appearance="outline" class="ow-filter-field">
            <mat-label>{{ 'Status' | translate }}</mat-label>
            <mat-select [formControl]="filterForm.controls.isActive">
              <mat-option [value]="null">{{ 'All' | translate }}</mat-option>
              <mat-option [value]="true">{{ 'Active' | translate }}</mat-option>
              <mat-option [value]="false">{{ 'Inactive' | translate }}</mat-option>
            </mat-select>
          </mat-form-field>
        </form>
        <div class="ow-filter-actions">
          <button mat-raised-button color="primary" (click)="loadOwners()">
            {{ 'Search' | translate }}
          </button>
          <button mat-button (click)="clearFilter()">
            {{ 'Clear' | translate }}
          </button>
        </div>
      </fieldset>

      <!-- Table -->
      <div class="ow-table-wrapper position-relative">
        @if (isLoading()) {
          <div class="ow-loading-shade"><mat-spinner diameter="50" /></div>
        }
        <table mat-table [dataSource]="ownerDataSource()" class="mat-elevation-z8 w-100">

          <ng-container matColumnDef="OwnerCode">
            <th mat-header-cell *matHeaderCellDef>{{ 'Owner Code' | translate }}</th>
            <td mat-cell *matCellDef="let element">{{ element.OwnerCode }}</td>
          </ng-container>

          <ng-container matColumnDef="OwnerName">
            <th mat-header-cell *matHeaderCellDef>{{ 'Owner Name' | translate }}</th>
            <td mat-cell *matCellDef="let element">{{ element.OwnerName }}</td>
          </ng-container>

          <ng-container matColumnDef="Email">
            <th mat-header-cell *matHeaderCellDef>{{ 'Email' | translate }}</th>
            <td mat-cell *matCellDef="let element">{{ element.Email }}</td>
          </ng-container>

          <ng-container matColumnDef="Mobile">
            <th mat-header-cell *matHeaderCellDef>{{ 'Mobile Number' | translate }}</th>
            <td mat-cell *matCellDef="let element">{{ element.Mobile }}</td>
          </ng-container>

          <ng-container matColumnDef="Phone">
            <th mat-header-cell *matHeaderCellDef>{{ 'Phone' | translate }}</th>
            <td mat-cell *matCellDef="let element">{{ element.Phone }}</td>
          </ng-container>

          <ng-container matColumnDef="UserName">
            <th mat-header-cell *matHeaderCellDef>{{ 'User Name' | translate }}</th>
            <td mat-cell *matCellDef="let element">{{ element.UserName }}</td>
          </ng-container>

          <ng-container matColumnDef="IsActive">
            <th mat-header-cell *matHeaderCellDef>{{ 'Is Active' | translate }}</th>
            <td mat-cell *matCellDef="let element" class="ow-center-cell">
              <mat-icon
                [fontIcon]="element.IsActive ? 'check_circle' : 'cancel'"
                [class.ow-text-success]="element.IsActive"
                [class.ow-text-error]="!element.IsActive" />
            </td>
          </ng-container>

          <ng-container matColumnDef="Action">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let element" class="ow-action-cell">
              <button mat-icon-button color="primary" (click)="openEditDialog(element)"
                      [matTooltip]="'Edit' | translate">
                <mat-icon fontIcon="edit" />
              </button>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
        </table>

        <mat-paginator
          [length]="ownerCount()"
          [pageSizeOptions]="pageSizeOptions"
          showFirstLastButtons />
      </div>
    </mat-card>
  `,
  styles: [`
    .ow-page-card { padding: 24px; display: block; }

    .ow-header {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 16px;
    }

    .ow-filter-box {
      border: 1px solid var(--sero-border, #e0e0e0);
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 16px;
      box-shadow: 0 2px 8px rgba(0,0,0,.06);
    }

    .ow-filter-legend {
      font-weight: 700;
      padding: 0 8px;
      font-size: 0.875rem;
      color: var(--sero-text-primary, #333);
    }

    .ow-filter-form {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
      margin-bottom: 12px;
    }

    .ow-filter-field {
      flex: 1 1 220px;
    }

    .ow-filter-actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
    }

    .ow-table-wrapper {
      overflow-x: auto;
      border-radius: 8px;
      border: 1px solid var(--sero-border, #e0e0e0);
    }

    .ow-loading-shade {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,.15); z-index: 1;
      display: flex; align-items: center; justify-content: center;
    }

    .ow-center-cell { text-align: center; }
    .ow-action-cell { white-space: nowrap; }

    .ow-text-success { color: #4caf50 !important; }
    .ow-text-error   { color: #f44336 !important; }

    .w-100  { width: 100%; }
    .position-relative { position: relative; }

    table { width: 100%; }

    th.mat-header-cell {
      font-weight: 600;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }
  `]
})
export class OwnersPageComponent implements AfterViewInit {
  private matDialog = inject(MatDialog);
  paginator = viewChild(MatPaginator);

  pageSizeOptions = [5, 10, 20, 50, 100];

  displayedColumns = [
    'OwnerCode', 'OwnerName', 'Email', 'Mobile',
    'Phone', 'UserName', 'IsActive', 'Action'
  ];

  filterForm = new FormGroup({
    filterText: new FormControl<string>(''),
    isActive:   new FormControl<boolean | null>(null),
  });

  isLoading    = signal(false);
  ownerCount   = signal(0);
  ownerDataSource = signal<SeroOwnerModel[]>([]);

  ngAfterViewInit() {
    const pag = this.paginator();
    if (pag) {
      pag.page.pipe(startWith({})).subscribe(() => this.loadOwners());
    } else {
      this.loadOwners();
    }
  }

  loadOwners() {
    this.isLoading.set(true);
    const { filterText, isActive } = this.filterForm.value;

    let data = [...mockOwners];

    if (filterText) {
      const q = filterText.toLowerCase();
      data = data.filter(o =>
        o.OwnerCode?.toLowerCase().includes(q)  ||
        o.OwnerName?.toLowerCase().includes(q)  ||
        o.Email?.toLowerCase().includes(q)       ||
        o.Mobile?.toLowerCase().includes(q)
      );
    }

    if (isActive !== null && isActive !== undefined) {
      data = data.filter(o => o.IsActive === isActive);
    }

    this.ownerCount.set(data.length);

    const pag       = this.paginator();
    const pageIndex = pag?.pageIndex ?? 0;
    const pageSize  = pag?.pageSize  ?? 10;
    this.ownerDataSource.set(data.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize));
    this.isLoading.set(false);
  }

  clearFilter() {
    this.filterForm.reset();
    const pag = this.paginator();
    if (pag) pag.pageIndex = 0;
    this.loadOwners();
  }

  openAddDialog() {
    const ref = this.matDialog.open(NewOwnerDialogComponent, { width: '560px' });
    ref.afterClosed().subscribe(result => { if (result) this.loadOwners(); });
  }

  openEditDialog(owner: SeroOwnerModel) {
    const ref = this.matDialog.open(NewOwnerDialogComponent, {
      width: '560px',
      data: { Owner: owner }
    });
    ref.afterClosed().subscribe(result => { if (result) this.loadOwners(); });
  }
}
