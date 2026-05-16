import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SeroPackageModel } from './packages.model';
import { PackagesService } from './packages.service';
import { PkgCardComponent } from './components/package-card.component';
import { PaginationComponent } from './components/pagination.component';
import { PackageBookingModalComponent } from './components/package-booking-modal.component';

@Component({
  selector: 'pkg-list-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatDialogModule, PkgCardComponent, PaginationComponent],
  template: `
    <div class="page-wrap">
      <div class="page-relative">
        @if (isLoading()) {
          <div class="loading-overlay">
            <div class="spinner"></div>
            <span class="loading-text">Loading packages...</span>
          </div>
        }

        <div class="pkg-grid">
          @if (!isLoading() && packages().length === 0) {
            <div class="empty-state">
              <span class="material-icons-round empty-icon">inventory_2</span>
              <h2 class="empty-title">No Packages Found</h2>
              <p class="empty-body">There are no catalog packages available right now.</p>
            </div>
          }

          @if (!isLoading() && packages().length > 0) {
            @for (pkg of packages(); track pkg.PackageID) {
              <pkg-card [pkg]="pkg" (book)="openModal($event)" />
            }
          }

          <!-- Create Your Own Package Card -->
          <div class="create-card">
            <div class="create-icon-wrap">
              <span class="material-icons-round create-icon">add</span>
            </div>
            <h3 class="create-title">Create Your Own Package</h3>
            <p class="create-body">Choose from templates or start from scratch</p>
          </div>
        </div>

        <pkg-pagination
          class="pagination-row"
          [currentPage]="page()"
          [totalPages]="totalPages()"
          (pageChange)="setPage($event)" />
      </div>
    </div>
  `,
  styles: [`
    .page-wrap { padding: 0; }
    .page-relative { position: relative; }
    .loading-overlay {
      position: absolute; inset: 0; background: rgba(255,255,255,.75);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 10px; z-index: 10; min-height: 200px;
    }
    .spinner {
      width: 36px; height: 36px; border: 3px solid #e5e7eb;
      border-top-color: var(--sero-primary, #3a472a); border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .loading-text { font-size: 13px; color: #6b7280; }

    .pkg-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 20px;
    }

    .empty-state {
      grid-column: 1 / -1; text-align: center; padding: 48px 24px;
      background: #f9fafb; border-radius: 12px; border: 1px dashed #d1d5db;
    }
    .empty-icon { font-size: 40px; color: #d1d5db; display: block; margin-bottom: 12px; }
    .empty-title { font-size: 16px; font-weight: 600; color: #374151; margin-bottom: 6px; }
    .empty-body { font-size: 13px; color: #6b7280; }

    .create-card {
      border: 2px dashed #9ca3af; border-radius: 12px;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 32px; cursor: pointer; min-height: 240px;
      transition: border-color 0.2s, background 0.2s;
    }
    .create-card:hover {
      border-color: var(--sero-primary, #3a472a);
      background: var(--sero-primary-50, #f2f4ee);
    }
    .create-icon-wrap {
      width: 56px; height: 56px; border-radius: 50%;
      background: var(--sero-primary-100, #d9e0cf);
      color: var(--sero-primary, #3a472a);
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 12px;
    }
    .create-icon { font-size: 24px; }
    .create-title { font-size: 15px; font-weight: 700; color: var(--sero-primary, #3a472a); margin-bottom: 4px; }
    .create-body { font-size: 12px; color: #6b7280; text-align: center; }

    .pagination-row { display: flex; justify-content: center; margin-top: 28px; }
  `],
})
export class PackageListPageComponent implements OnInit {
  private readonly packagesService = inject(PackagesService);
  private readonly matDialog = inject(MatDialog);

  packages = signal<SeroPackageModel[]>([]);
  isLoading = signal(false);
  page = signal(1);
  totalPages = signal(0);
  readonly pageSize = 10;

  ngOnInit(): void {
    this.loadCount();
    this.loadPackages();
  }

  setPage(newPage: number): void {
    if (newPage === this.page()) return;
    this.page.set(newPage);
    this.loadPackages();
  }

  private loadPackages(): void {
    this.isLoading.set(true);
    this.packagesService.getActivePackages(this.page()).subscribe({
      next: (data) => this.packages.set(data),
      error: (err) => console.error('Error loading packages:', err),
      complete: () => this.isLoading.set(false),
    });
  }

  private loadCount(): void {
    this.packagesService.getActivePackagesCount().subscribe({
      next: (count) => {
        const pages = Math.ceil((count ?? 0) / this.pageSize);
        this.totalPages.set(pages);
        if (pages > 0 && this.page() > pages) {
          this.page.set(pages);
          this.loadPackages();
        }
      },
      error: () => this.totalPages.set(0),
    });
  }

  openModal(pkg: SeroPackageModel): void {
    this.matDialog.open(PackageBookingModalComponent, {
      width: '800px',
      maxWidth: '95vw',
      data: { package: pkg },
      disableClose: false,
    });
  }
}
