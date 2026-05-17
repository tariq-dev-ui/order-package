import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, DestroyRef, effect, inject, signal, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, distinctUntilChanged, map, startWith } from 'rxjs';

import { AdminAPIClient, SeroPackageModel } from 'src/app/services/admin.api.client';
import { MaterialModule } from 'src/app/material.module';
import { SeroPackageDetailsDialogComponent } from './sero-package-details-dialog/sero-package-details-dialog.component';
import { CreateSeroPackageDialogComponent } from './create-sero-package-dialog/create-sero-package-dialog.component';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';
import { PackageBuilderStateManagementService } from '../package-builder/services/package-builder-state-management-service';
import { UploadImageComponent } from './upload-image/upload-image.component';
import { ManagePackageAgentsDialogComponent } from './manage-package-agents-dialog/manage-package-agents-dialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoadingSpinnerComponent } from 'src/app/components/loading-spinner/loading-spinner';
import { ConfirmationDialogComponent } from 'src/app/components/confirmation-dialog/confirmation-dialog.component';
import { SingleAgentSelectorComponent } from 'src/app/pages/agents-list/components/single-agent-selector/single-agent-selector.component';
import { PackageImagePreviewDialogComponent } from './package-image-preview-dialog/package-image-preview-dialog.component';

type PackageFilterParams = {
  agentId?: number;
  includeInactive?: boolean;
  isByAgent?: boolean;
};
@Component({
  selector: 'app-sero-packages',
  imports: [
    MaterialModule,
    CommonModule,
    MatTableModule,
    FormsModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule,
    TranslateModule,
    RouterLink,
    LoadingSpinnerComponent,
    SingleAgentSelectorComponent,
  ],
  templateUrl: './sero-packages.component.html',
  styleUrl: './sero-packages.component.scss',
})
export class SeroPackagesComponent implements AfterViewInit {
  adminApiClient = inject(AdminAPIClient);
  router = inject(Router);
  dialog = inject(MatDialog);
  snackBar = inject(MatSnackBar);
  translate = inject(TranslateService);
  paginator = viewChild(MatPaginator);
  private readonly pkgStateService = inject(PackageBuilderStateManagementService);
  private readonly destroyRef = inject(DestroyRef);

  pageSizeOptions = [5, 10, 20, 50, 100];
  displayedColumns: string[] = [
    'Package',
    'Price',
    'StartDate',
    'EndDate',
    'IsVisaIncluded',
    // 'IsByAgent',
    'action',
  ];

  filterForm = new FormGroup({
    agentId: new FormControl<number | undefined>(undefined),
    includeInactive: new FormControl<boolean>(false, { nonNullable: true }),
    // isByAgent: new FormControl<boolean | undefined>(undefined),
  });

  readonly isFilterPanelOpen = signal(false);
  readonly selectedAgentId = signal<number | undefined>(undefined);

  toggleFilterPanel(): void {
    this.isFilterPanelOpen.update((open) => !open);
  }

  onAgentFilterChange(agentId: number | undefined): void {
    this.selectedAgentId.set(agentId);
    this.filterForm.patchValue({ agentId });
  }

  isLoading = signal(false);
  isDownloading = signal(false);
  packagesDataSource = signal<SeroPackageModel[]>([]);
  packagesCount = signal(0);
  agentId = signal<number | undefined>(undefined);
  includeInactive = signal<boolean | undefined>(false);
  isByAgent = signal<boolean | undefined>(undefined);

  constructor() {
    // Use an effect to subscribe to paginator.page only when it's available
    effect(() => {
      const paginator = this.paginator();
      if (paginator) {
        paginator.page.pipe(startWith({})).subscribe(() => {
          this.loadPackages();
        });
      }
    });

    this.filterForm.valueChanges
      .pipe(
        debounceTime(150),
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
        this.loadPackages(true);
      });
  }

  openImagePreview(pkg: SeroPackageModel): void {
    const imageUrl = pkg.ImageUrl ?? null;
    if (!imageUrl) {
      return;
    }

    this.dialog.open(PackageImagePreviewDialogComponent, {
      maxWidth: '95vw',
      width: '95vw',
      height: '95vh',
      panelClass: 'image-preview-dialog-panel',
      data: {
        imageUrl,
        title: pkg.Title ?? null,
        code: pkg.PackageCode ?? null,
      },
    });
  }

  ngAfterViewInit() {
    // Load initial data
    this.loadPackages(true);
  }

  loadPackages(refreshCount = false) {
    const filters = this.buildFilterParams();
    const paginator = this.paginator();

    if (refreshCount && paginator) {
      paginator.pageIndex = 0;
    }

    const pageIndex = paginator?.pageIndex ?? 0;
    const pageSize = paginator?.pageSize ?? this.pageSizeOptions[0]; // Use first option as default

    if (refreshCount) {
      this.fetchPackagesCount(filters);
    }

    this.isLoading.set(true);
    this.packagesDataSource.set([]);
    this.adminApiClient
      .getAllPackages({
        pageIndex: pageIndex,
        pageSize: pageSize,
        agentId: filters.agentId,
        includeInactive: filters.includeInactive,
        isByAgent: false,
      })
      .subscribe({
        next: (val) => {
          this.isLoading.set(false);
          this.packagesDataSource.set(val);
        },
        error: (err) => {
          this.isLoading.set(false);
          this.packagesDataSource.set([]);
          console.error(err);
        },
      });
  }

  private buildFilterParams(): PackageFilterParams {
    // const { agentId, includeInactive, isByAgent } = this.filterForm.getRawValue();
    const { agentId, includeInactive } = this.filterForm.getRawValue();
    const normalizedIncludeInactive = includeInactive ?? false;

    const filters: PackageFilterParams = {
      agentId: agentId ?? undefined,
      includeInactive: normalizedIncludeInactive,
      isByAgent: false,
    };

    this.agentId.set(filters.agentId);
    this.includeInactive.set(filters.includeInactive);
    this.isByAgent.set(false);

    return filters;
  }

  private fetchPackagesCount(filters: PackageFilterParams) {
    this.adminApiClient.getPackagesCount(filters).subscribe({
      next: (val) => {
        this.packagesCount.set(val ?? 0);
      },
      error: (err) => {
        console.error(err);
        this.packagesCount.set(0);
      },
    });
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '';
    const locale = this.translate.currentLang || this.translate.getDefaultLang() || 'en';
    return new Date(date).toLocaleDateString(locale);
  }

  viewPackageDetails(packageItem: SeroPackageModel) {
    const dialogRef = this.dialog.open(SeroPackageDetailsDialogComponent, {
      width: '95vw',
      maxWidth: '98vw',
      height: '97vh',
      maxHeight: '97vh',
      data: { package: packageItem },
      panelClass: 'package-details-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.action === 'edit') {
        this.editPackage(result.package);
      }
      if (result?.refreshData) {
        this.loadPackages();
      }
    });
  }

  editPackage(packageItem: SeroPackageModel) {
    this.pkgStateService.editPackage(packageItem);
    this.router.navigate(['/admin/agent-packages', packageItem.PackageID, 'edit']);
  }

  createPackage() {
    const dialogRef = this.dialog.open(CreateSeroPackageDialogComponent, {
      width: '1400px',
      height: '95vh',
      maxHeight: '95vh',
      panelClass: 'create-package-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result?.success) {
        this.loadPackages(true); // Reload the packages list and refresh count
      }
    });
  }

  uploadImageDialog(packageItem: SeroPackageModel): void {
      let dialogRef = this.dialog.open(UploadImageComponent, {
        width: '1400px',
        height: '95vh',
        maxHeight: '95vh',
        autoFocus: false,
        disableClose: true,
        data: {
          pkg: packageItem,
        },
      });
      dialogRef.afterClosed().subscribe({
        next: (refreshData) => {
          console.log(refreshData?.refreshData);
          if (refreshData?.refreshData) {
            console.log('Reloading packages after image upload');
            this.loadPackages();
          }
        },
      });
    }

  duplicatePackage(packageItem: SeroPackageModel) {
    if (!packageItem.PackageID) return;

    this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Duplicate Package',
        message: 'Are you sure you want to duplicate this package?',
        onConfirm: () => {
          this.executePackageDuplication(packageItem);
        }
      }
    });
  }

  private executePackageDuplication(packageItem: SeroPackageModel) {
    console.log('Starting duplication for package', packageItem);
    this.isLoading.set(true);

        const newPackage: SeroPackageModel = { ...packageItem };

        newPackage.PackageID = undefined; // Or 0, depending on backend expectation
        newPackage .PackageCode = null; // Let backend generate new code
        newPackage.Title = (newPackage.Title || '');
        newPackage.AddedDate = undefined;
        newPackage.AddedBy = undefined;
        newPackage.LastUpdateDate = undefined;
        newPackage.LastUpdateBy = undefined;
        
        if (newPackage.Hotels) {
          newPackage.Hotels = newPackage.Hotels.map(h => ({ ...h, Id: undefined, SeroPackageId: undefined }));
        }
        if (newPackage.Trips) {
          newPackage.Trips = newPackage.Trips.map(t => ({ ...t, Id: undefined, SeroPackageId: undefined }));
        }
        if (newPackage.Caterings) {
          newPackage.Caterings = newPackage.Caterings.map(c => ({ ...c, Id: undefined, SeroPackageId: undefined }));
        }
        if (newPackage.Agents) {
          newPackage.Agents = newPackage.Agents.map(a => ({ ...a, Id: undefined, SeroPackageId: undefined }));
        }

        console.log('Creating duplicate package', newPackage);

        this.adminApiClient.createPackage({ body: newPackage }).subscribe({
          next: (createdPackage) => {
            this.isLoading.set(false);
            this.snackBar.open(this.translate.instant('Package duplicated successfully'), this.translate.instant('Close'), { duration: 3000 });
            this.loadPackages(true);
          },
          error: (err) => {
            this.isLoading.set(false);
            console.error('Error duplicating package', err);
            this.snackBar.open(this.translate.instant('Error duplicating package'), this.translate.instant('Close'), { duration: 3000 });
          }
        });
  }

  manageAgents(packageItem: SeroPackageModel) {

        const dialogRef = this.dialog.open(ManagePackageAgentsDialogComponent, {
          width: '1200px',
          data: { package: packageItem },
          disableClose: true
        });

        dialogRef.afterClosed().subscribe(result => {
          if (result?.success) {
            this.loadPackages(); // Refresh list
            this.snackBar.open(this.translate.instant('Agents updated successfully'), this.translate.instant('Close'), { duration: 3000 });
          }
        });
  }

  downloadPackageDetails(packageItem: SeroPackageModel) {
    if (!packageItem.PackageID) return;
    
    this.isDownloading.set(true);
    this.adminApiClient.getPackagePdf({packageId: packageItem.PackageID}).subscribe({
      next: (response) => {
        this.isDownloading.set(false);
        if (response && response.Content) {
          const byteCharacters = atob(response.Content);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: response.ContentType || 'application/pdf' });

          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(blob);
          link.download = response.FileName || `package-${packageItem.PackageID}.pdf`;
          link.click();
          window.URL.revokeObjectURL(link.href);
          
          this.snackBar.open(this.translate.instant('Package details downloaded successfully'), this.translate.instant('Close'), { duration: 3000 });
        }
      },
      error: (err) => {
        this.isDownloading.set(false);
        console.error('Error downloading PDF', err);
        this.snackBar.open(this.translate.instant('Error downloading package details'), this.translate.instant('Close'), { duration: 3000 });
      }
    });
  }

}
