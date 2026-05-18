import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterLink, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

import { AdminAPIClient } from 'src/app/services/admin.api.client';
import { MaterialModule } from 'src/app/material.module';
import { SeroPackageModel } from './agent-package.model';
import { AgentPackagesMockService } from './agent-packages.service';
import { SeroPackageDetailsDialogComponent } from './sero-package-details-dialog/sero-package-details-dialog.component';
import { CreateSeroPackageDialogComponent } from './create-sero-package-dialog/create-sero-package-dialog.component';
import { PackageBuilderStateManagementService } from '../package-builder/services/package-builder-state-management-service';
import { UploadImageComponent } from './upload-image/upload-image.component';
import { ManagePackageAgentsDialogComponent } from './manage-package-agents-dialog/manage-package-agents-dialog.component';
import { PackageImagePreviewDialogComponent } from './package-image-preview-dialog/package-image-preview-dialog.component';
import { LoadingSpinnerComponent } from 'src/app/components/loading-spinner/loading-spinner';
import { ConfirmationDialogComponent } from 'src/app/components/confirmation-dialog/confirmation-dialog.component';
import { SingleAgentSelectorComponent } from 'src/app/pages/agents-list/components/single-agent-selector/single-agent-selector.component';

@Component({
  selector: 'app-sero-packages',
  imports: [
    MaterialModule,
    CommonModule,
    MatTableModule,
    FormsModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    MatButtonModule,
    MatSelectModule,
    MatCardModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    TranslateModule,
    RouterLink,
    LoadingSpinnerComponent,
    SingleAgentSelectorComponent,
  ],
  templateUrl: './sero-packages.component.html',
  styleUrl: './sero-packages.component.scss',
})
export class SeroPackagesComponent implements OnInit {
  // Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
  private readonly mockService = inject(AgentPackagesMockService);
  private readonly adminApiClient = inject(AdminAPIClient); // kept only for PDF download
  private readonly pkgStateService = inject(PackageBuilderStateManagementService);

  readonly router = inject(Router);
  readonly dialog = inject(MatDialog);
  readonly snackBar = inject(MatSnackBar);
  readonly translate = inject(TranslateService);

  // ── Pagination ──────────────────────────────────────────────────────────
  pageSizeOptions = [5, 10, 20, 50];
  readonly currentPageIndex = signal(0);
  readonly currentPageSize = signal(10);

  // ── Filters ─────────────────────────────────────────────────────────────
  readonly searchText = signal('');
  readonly visaFilter = signal('');      // '' | 'yes' | 'no'
  readonly statusFilter = signal('');    // '' | 'active' | 'inactive' | 'expired'
  readonly showFilters = signal(false);
  readonly selectedAgentId = signal<number | undefined>(undefined);

  // Kept for SingleAgentSelectorComponent compatibility
  filterForm = new FormGroup({
    agentId: new FormControl<number | undefined>(undefined),
    includeInactive: new FormControl<boolean>(false, { nonNullable: true }),
  });

  // ── Loading ──────────────────────────────────────────────────────────────
  readonly isLoading = signal(false);
  readonly isDownloading = signal(false);

  // ── Data ────────────────────────────────────────────────────────────────
  readonly allPackages = signal<SeroPackageModel[]>([]);

  readonly filteredPackages = computed(() => {
    let data = [...this.allPackages()];

    const s = this.searchText().toLowerCase().trim();
    if (s) {
      data = data.filter(
        (p) =>
          (p.Title ?? '').toLowerCase().includes(s) ||
          (p.PackageCode ?? '').toLowerCase().includes(s) ||
          (p.Description ?? '').toLowerCase().includes(s),
      );
    }

    if (this.visaFilter() === 'yes') data = data.filter((p) => p.IsVisaIncluded);
    if (this.visaFilter() === 'no') data = data.filter((p) => !p.IsVisaIncluded);

    const st = this.statusFilter();
    if (st) data = data.filter((p) => this.getPackageStatus(p) === st);

    const agentId = this.selectedAgentId();
    if (agentId) data = data.filter((p) => (p.Agents ?? []).some((a) => a.AgentId === agentId));

    return data;
  });

  readonly filteredCount = computed(() => this.filteredPackages().length);

  readonly pagedPackages = computed(() => {
    const start = this.currentPageIndex() * this.currentPageSize();
    return this.filteredPackages().slice(start, start + this.currentPageSize());
  });

  // ── Summary cards ────────────────────────────────────────────────────────
  readonly totalCount = computed(() => this.allPackages().length);
  readonly activeCount = computed(
    () => this.allPackages().filter((p) => this.getPackageStatus(p) === 'active').length,
  );
  readonly visaCount = computed(
    () => this.allPackages().filter((p) => p.IsVisaIncluded === true).length,
  );
  readonly expiringSoonCount = computed(() => {
    const now = new Date();
    const limit = new Date(now.getTime() + 30 * 86_400_000);
    return this.allPackages().filter((p) => {
      if (!p.EndDate || p.IsActive === false) return false;
      const end = new Date(p.EndDate);
      return end >= now && end <= limit;
    }).length;
  });

  // ── Table columns ────────────────────────────────────────────────────────
  displayedColumns = ['package', 'price', 'period', 'visa', 'status', 'actions'];

  constructor() {
    // Reset to first page when any filter changes
    effect(() => {
      this.searchText();
      this.visaFilter();
      this.statusFilter();
      this.selectedAgentId();
      untracked(() => this.currentPageIndex.set(0));
    });
  }

  ngOnInit(): void {
    this.refreshPackages();
  }

  refreshPackages(): void {
    this.allPackages.set(this.mockService.getAll({ includeInactive: true }));
  }

  onPage(event: { pageIndex: number; pageSize: number }): void {
    this.currentPageIndex.set(event.pageIndex);
    this.currentPageSize.set(event.pageSize);
  }

  clearFilters(): void {
    this.searchText.set('');
    this.visaFilter.set('');
    this.statusFilter.set('');
    this.selectedAgentId.set(undefined);
    this.currentPageIndex.set(0);
  }

  onAgentFilterChange(agentId: number | undefined): void {
    this.selectedAgentId.set(agentId);
  }

  toggleFilters(): void {
    this.showFilters.update((v) => !v);
  }

  // ── Status ───────────────────────────────────────────────────────────────
  getPackageStatus(pkg: SeroPackageModel): 'active' | 'inactive' | 'expired' {
    if (pkg.IsActive === false) return 'inactive';
    if (pkg.EndDate && new Date(pkg.EndDate) < new Date()) return 'expired';
    return 'active';
  }

  // ── Formatters ───────────────────────────────────────────────────────────
  formatDate(date: Date | undefined | string): string {
    if (!date) return '—';
    const locale = this.translate.currentLang || 'en';
    return new Date(date).toLocaleDateString(locale, {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    });
  }

  // ── Dialogs ──────────────────────────────────────────────────────────────
  openImagePreview(pkg: SeroPackageModel): void {
    if (!pkg.ImageUrl) return;
    this.dialog.open(PackageImagePreviewDialogComponent, {
      maxWidth: '95vw',
      width: '95vw',
      height: '95vh',
      panelClass: 'image-preview-dialog-panel',
      data: { imageUrl: pkg.ImageUrl, title: pkg.Title ?? null, code: pkg.PackageCode ?? null },
    });
  }

  viewPackageDetails(pkg: SeroPackageModel): void {
    const ref = this.dialog.open(SeroPackageDetailsDialogComponent, {
      width: '95vw',
      maxWidth: '98vw',
      height: '97vh',
      maxHeight: '97vh',
      data: { package: pkg },
      panelClass: 'package-details-dialog-container',
    });
    ref.afterClosed().subscribe((result) => {
      if (result?.action === 'edit') this.editPackage(result.package);
      if (result?.refreshData) this.refreshPackages();
    });
  }

  editPackage(pkg: SeroPackageModel): void {
    this.pkgStateService.editPackage(pkg);
    this.router.navigate(['/admin/agent-packages', pkg.PackageID, 'edit']);
  }

  createPackage(): void {
    const ref = this.dialog.open(CreateSeroPackageDialogComponent, {
      width: '1400px',
      height: '95vh',
      maxHeight: '95vh',
      panelClass: 'create-package-dialog-container',
    });
    ref.afterClosed().subscribe((result) => {
      if (result?.success) this.refreshPackages();
    });
  }

  uploadImageDialog(pkg: SeroPackageModel): void {
    const ref = this.dialog.open(UploadImageComponent, {
      width: '1400px',
      height: '95vh',
      maxHeight: '95vh',
      autoFocus: false,
      disableClose: true,
      data: { pkg },
    });
    ref.afterClosed().subscribe((r) => {
      if (r?.refreshData) this.refreshPackages();
    });
  }

  duplicatePackage(pkg: SeroPackageModel): void {
    this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Duplicate Package',
        message: `Duplicate "${pkg.Title}"?`,
        onConfirm: () => {
          this.mockService.create({
            ...structuredClone(pkg),
            PackageID: undefined,
            PackageCode: undefined,
            Title: (pkg.Title || '') + ' (Copy)',
            IsActive: false,
            AddedDate: new Date(),
          });
          this.refreshPackages();
          this.snackBar.open(
            this.translate.instant('Package duplicated successfully'),
            this.translate.instant('Close'),
            { duration: 3000 },
          );
        },
      },
    });
  }

  deletePackage(pkg: SeroPackageModel): void {
    this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Delete Package',
        message: `Delete "${pkg.Title}"? This action cannot be undone.`,
        onConfirm: () => {
          this.allPackages.update((pkgs) =>
            pkgs.filter((p) => p.PackageID !== pkg.PackageID),
          );
          this.snackBar.open(
            this.translate.instant('Package deleted'),
            this.translate.instant('Close'),
            { duration: 3000 },
          );
        },
      },
    });
  }

  manageAgents(pkg: SeroPackageModel): void {
    const ref = this.dialog.open(ManagePackageAgentsDialogComponent, {
      width: '1200px',
      data: { package: pkg },
      disableClose: true,
    });
    ref.afterClosed().subscribe((result) => {
      if (result?.success) {
        this.refreshPackages();
        this.snackBar.open(
          this.translate.instant('Agents updated successfully'),
          this.translate.instant('Close'),
          { duration: 3000 },
        );
      }
    });
  }

  downloadPackageDetails(pkg: SeroPackageModel): void {
    if (!pkg.PackageID) return;
    this.isDownloading.set(true);
    this.adminApiClient.getPackagePdf({ packageId: pkg.PackageID }).subscribe({
      next: (response) => {
        this.isDownloading.set(false);
        if (response?.Content) {
          const bytes = atob(response.Content);
          const arr = new Uint8Array(bytes.length);
          for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
          const blob = new Blob([arr], { type: response.ContentType || 'application/pdf' });
          const link = document.createElement('a');
          link.href = URL.createObjectURL(blob);
          link.download = response.FileName || `package-${pkg.PackageID}.pdf`;
          link.click();
          URL.revokeObjectURL(link.href);
          this.snackBar.open(
            this.translate.instant('Package details downloaded successfully'),
            this.translate.instant('Close'),
            { duration: 3000 },
          );
        }
      },
      error: () => {
        this.isDownloading.set(false);
        this.snackBar.open(
          this.translate.instant('Error downloading package details'),
          this.translate.instant('Close'),
          { duration: 3000 },
        );
      },
    });
  }
}
