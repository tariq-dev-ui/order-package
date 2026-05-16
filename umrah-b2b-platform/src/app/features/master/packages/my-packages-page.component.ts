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
  selector: 'my-packages-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatDialogModule, PkgCardComponent, PaginationComponent],
  template: `
    <div class="page-wrap">
      <h1 class="page-title">My Packages</h1>

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
              <span class="material-icons-round empty-icon">inventory</span>
              <h2 class="empty-title">No Packages Found</h2>
              <p class="empty-body">You haven't created any packages yet.</p>
            </div>
          }

          @if (!isLoading() && packages().length > 0) {
            @for (pkg of packages(); track pkg.PackageID) {
              <pkg-card [pkg]="pkg" (book)="openModal($event)" />
            }
          }
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
    .page-title { font-size: 20px; font-weight: 700; color: #111827; margin-bottom: 20px; }
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

    .pagination-row { display: flex; justify-content: center; margin-top: 28px; }
  `],
})
export class MyPackagesPageComponent implements OnInit {
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
    this.packagesService.getMyPackages(this.page()).subscribe({
      next: (data) => this.packages.set(data),
      error: (err) => console.error('Error loading my packages:', err),
      complete: () => this.isLoading.set(false),
    });
  }

  private loadCount(): void {
    this.packagesService.getMyPackagesCount().subscribe({
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
