import {
  ChangeDetectionStrategy, Component, DestroyRef, Inject, inject, OnInit, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { SeroPackageModel } from 'src/app/services/admin.api.client';
import { AgentRequestsService } from './agent-requests.service';
import { SingleAgentSelectorComponent } from 'src/app/pages/agents-list/components/single-agent-selector/single-agent-selector.component';
import { PackageHotelsDetailsComponent } from 'src/app/pages/components/request-package-details/package-hotels-details/package-hotels-details.component';
import { PackageTagsDetailsComponent } from 'src/app/pages/components/request-package-details/package-tags-details/package-tags-details.component';
import { PackageTripsDetailsComponent } from 'src/app/pages/components/request-package-details/package-trips-details/package-trips-details.component';
import { PackageTicketsDetailsComponent } from 'src/app/pages/components/request-package-details/package-tickets-details/package-tickets-details.component';
import { PackageCateringsDetailsComponent } from 'src/app/pages/components/request-package-details/package-caterings-details/package-caterings-details.component';
import { SeroCurrencyPipe } from 'src/app/shared/pipes/sero-currency.pipe';

// ────────────────────────────────────────────────────────────
// Main Page Component
// ────────────────────────────────────────────────────────────
@Component({
  selector: 'new-agent-request-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule,
    PackageHotelsDetailsComponent, PackageTagsDetailsComponent,
    PackageTripsDetailsComponent, PackageTicketsDetailsComponent,
    PackageCateringsDetailsComponent, SingleAgentSelectorComponent,
    SeroCurrencyPipe,
  ],
  template: `
    <!-- Filters -->
    <div class="nr-filter-card">
      <div class="nr-filter-header">
        <div class="nr-filter-title">
          <i class="fas fa-filter nr-icon-primary"></i>
          <span>Filters</span>
        </div>
        <button class="nr-toggle-btn" (click)="toggleFilterPanel()">
          <span>{{ isFilterPanelOpen() ? 'Hide' : 'Show' }}</span>
          <i class="fas" [class.fa-chevron-up]="isFilterPanelOpen()" [class.fa-chevron-down]="!isFilterPanelOpen()"></i>
        </button>
      </div>

      @if (isFilterPanelOpen()) {
        <div class="nr-filter-body">
          <form [formGroup]="filterForm">
            <div class="nr-filter-row">
              <div class="nr-filter-agent">
                <app-single-agent-selector
                  [placeholder]="'All Agents'"
                  [selectedAgentId]="selectedAgentId() ?? null"
                  (agentIdChange)="onAgentFilterChange($event)"
                ></app-single-agent-selector>
              </div>
              <div class="nr-filter-inactive">
                <label class="nr-label">Include Inactive</label>
                <select formControlName="includeInactive" class="nr-select">
                  <option [ngValue]="false">No</option>
                  <option [ngValue]="true">Yes</option>
                </select>
              </div>
            </div>
          </form>
        </div>
      }
    </div>

    <!-- Packages Grid -->
    <main class="nr-main">
      @if (isLoading()) {
        <div class="nr-loading">
          <i class="fas fa-spinner fa-spin nr-spinner-icon"></i>
          <p>Loading packages...</p>
        </div>
      } @else {
        <div class="nr-grid">
          @for (pkg of packages(); track pkg.PackageID) {
            <div class="nr-card">
              <!-- Image -->
              <div class="nr-card-img-wrap">
                <img [src]="pkg.ImageUrl || 'images/logos/logo1.svg'"
                     [alt]="pkg.Title || 'Umrah Package'"
                     class="nr-card-img"
                     (error)="onImgError($event)" />
                <!-- Package code -->
                @if (pkg.PackageCode) {
                  <div class="nr-badge-code">
                    <i class="fas fa-tag"></i>
                    {{ pkg.PackageCode }}
                  </div>
                }
                <!-- Visa badge -->
                <div class="nr-badge-visa" [class.visa-yes]="pkg.IsVisaIncluded" [class.visa-no]="!pkg.IsVisaIncluded">
                  <span class="nr-visa-icon-wrap">
                    <i class="fas" [class.fa-check]="pkg.IsVisaIncluded" [class.fa-times]="!pkg.IsVisaIncluded"></i>
                  </span>
                  <span>{{ pkg.IsVisaIncluded ? 'VISA INCLUDED' : 'NO VISA' }}</span>
                </div>
              </div>

              <!-- Card body -->
              <div class="nr-card-body">
                <div class="nr-card-top">
                  <h2 class="nr-card-title">{{ pkg.Title }}</h2>
                  <div class="nr-price-block">
                    <span class="nr-price">
                      @if ((pkg.Price ?? 0) > 0) { {{ pkg.Price | seroCurrency }} } @else { N/A }
                    </span>
                    <div class="nr-price-flags">
                      <span class="nr-flag" [class.verified]="pkg.VerifiedPrice" [class.approx]="!pkg.VerifiedPrice">
                        <i class="fas fa-xs" [class.fa-lock]="pkg.VerifiedPrice" [class.fa-clock]="!pkg.VerifiedPrice"></i>
                        {{ pkg.VerifiedPrice ? 'Verified' : 'Approximate' }}
                      </span>
                      <span class="nr-flag" [class.blended]="pkg.BlendedPrice" [class.itemized]="!pkg.BlendedPrice">
                        <i class="fas fa-xs" [class.fa-layer-group]="pkg.BlendedPrice" [class.fa-list]="!pkg.BlendedPrice"></i>
                        {{ pkg.BlendedPrice ? 'Blended' : 'Itemized' }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="nr-dates">
                  <i class="far fa-calendar"></i>
                  {{ pkg.StartDate | date:'MMM d, y' }} – {{ pkg.EndDate | date:'MMM d, y' }}
                </div>

                @if (pkg.Tags?.length) {
                  <package-tags-details [Tags]="pkg.Tags" />
                }

                <div class="nr-stats">
                  @if (pkg.GuestCount) {
                    <div class="nr-stat indigo">
                      <i class="fas fa-users"></i>
                      <span>{{ pkg.GuestCount }} Guests</span>
                    </div>
                  }
                  @if (pkg.Quantity) {
                    <div class="nr-stat teal">
                      <i class="fas fa-cubes"></i>
                      <span>{{ pkg.Quantity }} Available</span>
                    </div>
                  }
                </div>

                <!-- Collapsible sections -->
                <!-- Hotels -->
                <div class="nr-section">
                  <button class="nr-section-toggle" (click)="toggleSection(pkg.PackageID!, 'hotel')">
                    <span><i class="fas fa-hotel nr-icon-primary"></i> Hotels ({{ pkg.Hotels?.length || 0 }})</span>
                    <i class="fas fa-chevron-down nr-chevron" [class.open]="isSectionOpen(pkg.PackageID!, 'hotel')"></i>
                  </button>
                  @if (isSectionOpen(pkg.PackageID!, 'hotel')) {
                    <div class="nr-section-body">
                      <package-hotels-details [Hotels]="pkg.Hotels" [HotelCounts]="pkg.HotelCounts" [withTitle]="false" />
                    </div>
                  }
                </div>

                <!-- Transport -->
                <div class="nr-section">
                  <button class="nr-section-toggle" (click)="toggleSection(pkg.PackageID!, 'transport')">
                    <span><i class="fas fa-bus nr-icon-primary"></i> Transportation ({{ pkg.Trips?.length || 0 }})</span>
                    <i class="fas fa-chevron-down nr-chevron" [class.open]="isSectionOpen(pkg.PackageID!, 'transport')"></i>
                  </button>
                  @if (isSectionOpen(pkg.PackageID!, 'transport')) {
                    <div class="nr-section-body">
                      <package-trips-details [Trips]="pkg.Trips" />
                    </div>
                  }
                </div>

                <!-- Tickets -->
                <div class="nr-section">
                  <button class="nr-section-toggle" (click)="toggleSection(pkg.PackageID!, 'tickets')">
                    <span><i class="fas fa-ticket-alt nr-icon-primary"></i> Tickets ({{ pkg.Tickets?.length || 0 }})</span>
                    <i class="fas fa-chevron-down nr-chevron" [class.open]="isSectionOpen(pkg.PackageID!, 'tickets')"></i>
                  </button>
                  @if (isSectionOpen(pkg.PackageID!, 'tickets')) {
                    <div class="nr-section-body">
                      <package-tickets-details [Tickets]="pkg.Tickets" />
                    </div>
                  }
                </div>

                <!-- Catering -->
                <div class="nr-section">
                  <button class="nr-section-toggle" (click)="toggleSection(pkg.PackageID!, 'food')">
                    <span><i class="fas fa-utensils nr-icon-primary"></i> Catering ({{ pkg.Caterings?.length || 0 }})</span>
                    <i class="fas fa-chevron-down nr-chevron" [class.open]="isSectionOpen(pkg.PackageID!, 'food')"></i>
                  </button>
                  @if (isSectionOpen(pkg.PackageID!, 'food')) {
                    <div class="nr-section-body">
                      <package-caterings-details [Caterings]="pkg.Caterings" />
                    </div>
                  }
                </div>

                <!-- Book button -->
                <button class="nr-book-btn" (click)="selectPackage(pkg)">
                  <span>BOOK PACKAGE</span>
                  <i class="fas fa-shopping-cart"></i>
                </button>
              </div>
            </div>
          }
        </div>

        <!-- Empty state -->
        @if (packages().length === 0 && !isLoading()) {
          <div class="nr-empty">
            <i class="fas fa-box-open"></i>
            <h3>No packages found</h3>
            <p>Try changing the filters or check back later.</p>
          </div>
        }

        <!-- Pagination -->
        @if (totalPages() > 1) {
          <nav class="nr-pagination">
            <button class="nr-page-btn" [disabled]="page() === 1" (click)="setPage(page() - 1)">
              <i class="fas fa-chevron-left"></i>
            </button>
            @for (p of pageItems(); track $index) {
              @if (p === '...') {
                <span class="nr-page-ellipsis">…</span>
              } @else {
                <button class="nr-page-btn" [class.active]="p === page()" (click)="setPage(+p)">{{ p }}</button>
              }
            }
            <button class="nr-page-btn" [disabled]="page() === totalPages()" (click)="setPage(page() + 1)">
              <i class="fas fa-chevron-right"></i>
            </button>
          </nav>
        }
      }
    </main>
  `,
  styles: [`
    /* ── Filter card ── */
    .nr-filter-card {
      background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 32px;
    }
    .nr-filter-header {
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px; padding: 16px 20px;
    }
    .nr-filter-title { display: flex; align-items: center; gap: 8px; color: #1f2937; font-weight: 600; }
    .nr-icon-primary { color: var(--sero-primary, #3a472a); }
    .nr-toggle-btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 6px;
      background: #fff; color: #374151; font-size: 13px; cursor: pointer;
    }
    .nr-toggle-btn:hover { background: #f9fafb; }
    .nr-filter-body { padding: 0 20px 20px; }
    .nr-filter-row { display: flex; flex-wrap: wrap; gap: 16px; align-items: flex-end; }
    .nr-filter-agent { flex: 1; min-width: 280px; }
    .nr-filter-inactive { min-width: 160px; }
    .nr-label { display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 4px; }
    .nr-select {
      width: 100%; height: 44px; padding: 0 12px; border: 1px solid #d1d5db; border-radius: 6px;
      font-size: 14px; outline: none; background: #fff;
    }
    .nr-select:focus { border-color: var(--sero-primary, #3a472a); box-shadow: 0 0 0 3px rgba(58,71,42,.12); }

    /* ── Main ── */
    .nr-main { padding: 4px 0 20px; }
    .nr-loading {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 64px; gap: 12px; color: #6b7280;
    }
    .nr-spinner-icon { font-size: 2.5rem; color: var(--sero-primary, #3a472a); }
    .nr-empty {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 80px 24px; text-align: center; color: #9ca3af;
    }
    .nr-empty i { font-size: 4rem; margin-bottom: 16px; }
    .nr-empty h3 { font-size: 20px; font-weight: 600; color: #6b7280; margin: 0 0 8px; }
    .nr-empty p  { font-size: 14px; margin: 0; }

    /* ── Grid ── */
    .nr-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 20px;
    }

    /* ── Card ── */
    .nr-card {
      background: #fff; border: 1px solid #f3f4f6; border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,.07), 0 2px 4px -2px rgba(0,0,0,.05);
      overflow: hidden; display: flex; flex-direction: column;
      transition: box-shadow 0.3s, transform 0.3s;
    }
    .nr-card:hover { box-shadow: 0 10px 25px -5px rgba(0,0,0,.12); transform: translateY(-4px); }

    .nr-card-img-wrap { position: relative; }
    .nr-card-img { width: 100%; height: 250px; object-fit: cover; display: block; }
    .nr-badge-code {
      position: absolute; top: 12px; left: 12px;
      background: rgba(0,0,0,.75); color: #fff;
      padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 600;
      display: inline-flex; align-items: center; gap: 4px; backdrop-filter: blur(4px);
    }
    .nr-badge-code i { font-size: 10px; color: #b6c9a2; }
    .nr-badge-visa {
      position: absolute; top: 12px; right: 12px;
      display: inline-flex; align-items: center; gap: 6px;
      padding: 6px 12px; border-radius: 999px; font-size: 11px; font-weight: 700;
      border: 1px solid rgba(255,255,255,.2); backdrop-filter: blur(8px);
    }
    .nr-badge-visa.visa-yes { background: rgba(22,101,52,.6); color: #fff; }
    .nr-badge-visa.visa-no  { background: rgba(153,27,27,.6); color: #fff; }
    .nr-visa-icon-wrap {
      width: 20px; height: 20px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; font-size: 10px;
    }
    .visa-yes .nr-visa-icon-wrap { background: #16a34a; }
    .visa-no  .nr-visa-icon-wrap { background: #dc2626; }

    .nr-card-body { padding: 20px; flex: 1; display: flex; flex-direction: column; gap: 12px; }

    .nr-card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
    .nr-card-title { font-size: 18px; font-weight: 700; color: #1f2937; margin: 0; }
    .nr-price-block { flex-shrink: 0; display: flex; flex-direction: column; align-items: flex-end; gap: 6px; }
    .nr-price { font-size: 18px; font-weight: 700; color: var(--sero-primary, #3a472a); }
    .nr-price-flags { display: flex; flex-direction: column; gap: 4px; align-items: flex-end; }
    .nr-flag {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 2px 8px; border-radius: 999px; font-size: 10px; font-weight: 600; border: 1px solid;
    }
    .nr-flag.verified { background: #f0fdf4; border-color: #bbf7d0; color: #15803d; }
    .nr-flag.approx   { background: #fffbeb; border-color: #fde68a; color: #b45309; }
    .nr-flag.blended  { background: #eff6ff; border-color: #bfdbfe; color: #1d4ed8; }
    .nr-flag.itemized { background: #f9fafb; border-color: #e5e7eb; color: #374151; }

    .nr-dates { font-size: 13px; color: #9ca3af; display: flex; align-items: center; gap: 4px; }
    .nr-dates i { margin-right: 2px; }

    .nr-stats { display: flex; flex-wrap: wrap; gap: 8px; }
    .nr-stat {
      display: flex; align-items: center; gap: 6px;
      padding: 6px 10px; border-radius: 8px; font-size: 12px; font-weight: 600; border: 1px solid;
    }
    .nr-stat.indigo { background: #eef2ff; border-color: #c7d2fe; color: #4338ca; }
    .nr-stat.teal   { background: #f0fdfa; border-color: #99f6e4; color: #0f766e; }

    /* ── Collapsible sections ── */
    .nr-section { border-top: 1px solid #f3f4f6; }
    .nr-section-toggle {
      width: 100%; display: flex; justify-content: space-between; align-items: center;
      text-align: left; padding: 10px 0; background: none; border: none;
      font-size: 13px; font-weight: 500; color: #374151; cursor: pointer; transition: color 0.15s;
    }
    .nr-section-toggle:hover { color: var(--sero-primary, #3a472a); }
    .nr-chevron { font-size: 11px; transition: transform 0.3s; }
    .nr-chevron.open { transform: rotate(180deg); }
    .nr-section-body { padding-bottom: 8px; }

    /* ── Book button ── */
    .nr-book-btn {
      margin-top: auto; width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px;
      padding: 12px 20px; background: var(--sero-primary, #3a472a); color: #fff;
      border: none; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;
      box-shadow: 0 4px 6px -1px rgba(58,71,42,.3); transition: all 0.2s;
    }
    .nr-book-btn:hover {
      background: var(--sero-primary-light, #4d6038);
      box-shadow: 0 10px 15px -3px rgba(58,71,42,.35); transform: translateY(-1px);
    }
    .nr-book-btn i { transition: transform 0.2s; }
    .nr-book-btn:hover i { transform: translateX(4px); }

    /* ── Pagination ── */
    .nr-pagination { display: flex; align-items: center; justify-content: center; gap: 4px; margin-top: 40px; }
    .nr-page-btn {
      width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
      border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; color: #374151;
      font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s;
    }
    .nr-page-btn:hover:not(:disabled):not(.active) { background: #f9fafb; }
    .nr-page-btn.active { background: var(--sero-primary, #3a472a); color: #fff; border-color: var(--sero-primary, #3a472a); }
    .nr-page-btn:disabled { opacity: .4; cursor: not-allowed; }
    .nr-page-ellipsis { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; color: #9ca3af; }
  `],
})
export class NewAgentRequestPageComponent implements OnInit {
  private readonly service = inject(AgentRequestsService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  isLoading = signal(false);
  packages = signal<SeroPackageModel[]>([]);
  page = signal(1);
  totalPages = signal(1);
  readonly pageSize = 9;
  isFilterPanelOpen = signal(false);
  selectedAgentId = signal<number | undefined>(undefined);
  openSections = signal<Map<number, string>>(new Map());

  filterForm = new FormGroup({
    agentId: new FormControl<number | undefined>(undefined),
    includeInactive: new FormControl<boolean>(false, { nonNullable: true }),
  });

  ngOnInit() {
    this.filterForm.valueChanges
      .pipe(
        map(v => ({ agentId: v.agentId ?? undefined, includeInactive: v.includeInactive ?? false })),
        distinctUntilChanged((a, b) => a.agentId === b.agentId && a.includeInactive === b.includeInactive),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => { this.page.set(1); this.loadCount(); this.loadPackages(); });

    this.loadCount();
    this.loadPackages();
  }

  toggleFilterPanel() { this.isFilterPanelOpen.update(v => !v); }

  onAgentFilterChange(agentId: number | undefined) {
    this.selectedAgentId.set(agentId);
    this.filterForm.patchValue({ agentId });
  }

  loadPackages() {
    this.isLoading.set(true);
    const { agentId, includeInactive } = this.filterForm.getRawValue();
    this.service.getPackages({
      pageIndex: Math.max(0, this.page() - 1),
      pageSize: this.pageSize,
      agentId: agentId ?? undefined,
      includeInactive: includeInactive ?? false,
    }).subscribe({
      next: (pkgs: SeroPackageModel[]) => { this.packages.set(pkgs); this.isLoading.set(false); },
      error: () => { this.packages.set([]); this.isLoading.set(false); },
    });
  }

  loadCount() {
    const { agentId, includeInactive } = this.filterForm.getRawValue();
    this.service.getPackagesCount({ agentId: agentId ?? undefined, includeInactive: includeInactive ?? false }).subscribe({
      next: (count: number) => this.totalPages.set(Math.max(1, Math.ceil((count ?? 0) / this.pageSize))),
      error: () => this.totalPages.set(1),
    });
  }

  setPage(p: number) { this.page.set(p); this.loadPackages(); }

  toggleSection(pkgId: number, section: string) {
    const m = new Map(this.openSections());
    m.get(pkgId) === section ? m.delete(pkgId) : m.set(pkgId, section);
    this.openSections.set(m);
  }

  isSectionOpen(pkgId: number, section: string): boolean {
    return this.openSections().get(pkgId) === section;
  }

  onImgError(ev: Event) {
    (ev.target as HTMLImageElement).src = 'images/logos/logo1.svg';
  }

  selectPackage(pkg: SeroPackageModel) {
    const ref = this.dialog.open(PackageSelectionDialogComponent, {
      data: { package: pkg, selectedAgentId: this.selectedAgentId() ?? null },
      width: '1100px', maxWidth: '98vw', height: '92vh', maxHeight: '92vh', disableClose: true,
    });
    ref.afterClosed().subscribe(result => {
      if (result) { /* request created, optionally refresh */ }
    });
  }

  pageItems(): (number | '...')[] {
    const total = Math.max(1, this.totalPages());
    const current = this.page();
    const max = 7;
    if (total <= max) return Array.from({ length: total }, (_, i) => i + 1);
    const items: (number | '...')[] = [];
    const side = Math.floor((max - 3) / 2);
    let left = Math.max(2, current - side);
    let right = Math.min(total - 1, current + side);
    if (current - 1 <= side) { left = 2; right = Math.min(total - 1, max - 2); }
    if (total - current <= side) { right = total - 1; left = Math.max(2, total - (max - 3)); }
    items.push(1);
    if (left > 2) items.push('...');
    for (let i = left; i <= right; i++) items.push(i);
    if (right < total - 1) items.push('...');
    items.push(total);
    return items;
  }
}

// ────────────────────────────────────────────────────────────
// Package Selection Dialog Component
// ────────────────────────────────────────────────────────────
@Component({
  selector: 'package-selection-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, ReactiveFormsModule,
    MatDialogModule, MatFormFieldModule, MatInputModule,
    MatDatepickerModule, MatNativeDateModule,
    SingleAgentSelectorComponent,
  ],
  template: `
    <div class="psd-wrap">
      <!-- Header -->
      <div class="psd-header">
        <div class="psd-header-icon">
          <i class="fas fa-shopping-cart"></i>
        </div>
        <div class="psd-header-info">
          <h2 class="psd-header-title">BOOK PACKAGE</h2>
          <p class="psd-header-sub">{{ data.package.Title }}</p>
        </div>
        <button class="psd-close-btn" (click)="cancel()">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Body -->
      <div class="psd-body">
        @if (isSaving()) {
          <div class="psd-saving-overlay">
            <div class="psd-saving-spinner"></div>
            <span>Sending Request...</span>
          </div>
        }

        <form [formGroup]="form">
          <!-- Agent -->
          <div class="psd-field">
            <label class="psd-label">
              <i class="fas fa-user-tie psd-field-icon"></i>
              SELECT AGENT
            </label>
            <app-single-agent-selector
              [selectedAgentId]="selectedAgentId()"
              (agentIdChange)="onAgentIdChange($event)"
            ></app-single-agent-selector>
            @if (form.get('agentId')?.invalid && form.get('agentId')?.touched) {
              <div class="psd-error">Agent is required</div>
            }
          </div>

          <div class="psd-divider"><span>Trip Details</span></div>

          <!-- Dates -->
          <div class="psd-dates-grid">
            <div class="psd-field">
              <label class="psd-label">
                <i class="fas fa-calendar-alt psd-field-icon"></i>
                START DATE
              </label>
              <mat-form-field appearance="outline" class="psd-datefield">
                <input matInput [matDatepicker]="startPicker" formControlName="startDate" placeholder="Start Date" required>
                <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
                <mat-datepicker #startPicker></mat-datepicker>
                @if (form.get('startDate')?.invalid && form.get('startDate')?.touched) {
                  <mat-error>
                    @if (form.get('startDate')?.errors?.['required']) { Start date is required }
                    @if (form.get('startDate')?.errors?.['startBeforeTomorrow']) { Must be tomorrow or later }
                  </mat-error>
                }
              </mat-form-field>
            </div>

            <div class="psd-field">
              <label class="psd-label">
                <i class="fas fa-calendar-check psd-field-icon"></i>
                END DATE
              </label>
              <mat-form-field appearance="outline" class="psd-datefield">
                <input matInput [matDatepicker]="endPicker" formControlName="endDate" placeholder="End Date" required>
                <mat-datepicker-toggle matSuffix [for]="endPicker"></mat-datepicker-toggle>
                <mat-datepicker #endPicker></mat-datepicker>
                @if (form.get('endDate')?.invalid && form.get('endDate')?.touched) {
                  <mat-error>
                    @if (form.get('endDate')?.errors?.['required']) { End date is required }
                    @if (form.get('endDate')?.errors?.['endBeforeStart']) { Must be after start date }
                  </mat-error>
                }
              </mat-form-field>
            </div>
          </div>

          <!-- Passengers -->
          <div class="psd-field">
            <label class="psd-label">
              <i class="fas fa-users psd-field-icon"></i>
              NUMBER OF PASSENGERS
            </label>
            <input type="number" formControlName="passengers" min="1" class="psd-input" placeholder="Enter number of passengers">
            @if (form.get('passengers')?.invalid && form.get('passengers')?.touched) {
              <div class="psd-error">
                @if (form.get('passengers')?.errors?.['required']) { Required }
                @if (form.get('passengers')?.errors?.['min']) { Must be at least 1 }
              </div>
            }
          </div>

          <!-- Quantity -->
          <div class="psd-field">
            <label class="psd-label">
              <i class="fas fa-cubes psd-field-icon"></i>
              QUANTITY
            </label>
            <input type="number" formControlName="quantity" min="1" class="psd-input" placeholder="Enter quantity (optional)">
            @if (form.get('quantity')?.errors?.['min'] && form.get('quantity')?.touched) {
              <div class="psd-error">Must be at least 1</div>
            }
          </div>

          <!-- Notes -->
          <div class="psd-field">
            <label class="psd-label">
              <i class="fas fa-sticky-note psd-field-icon"></i>
              NOTE
            </label>
            <textarea formControlName="note" rows="2" class="psd-textarea" placeholder="Enter any additional notes"></textarea>
          </div>
        </form>
      </div>

      <!-- Footer -->
      <div class="psd-footer">
        <button type="button" class="psd-btn-cancel" (click)="cancel()">
          <i class="fas fa-times"></i>
          CANCEL
        </button>
        <button type="button" class="psd-btn-confirm" (click)="confirm()" [disabled]="!form.valid || isSaving()">
          @if (isSaving()) {
            <i class="fas fa-spinner fa-spin"></i>
            SAVING...
          } @else {
            CONFIRM
            <i class="fas fa-check"></i>
          }
        </button>
      </div>
    </div>
  `,
  styles: [`
    .psd-wrap { display: flex; flex-direction: column; height: 100%; overflow: hidden; }

    .psd-header {
      display: flex; align-items: center; gap: 12px;
      padding: 20px; border-bottom: 1px solid #f3f4f6; flex-shrink: 0;
    }
    .psd-header-icon {
      width: 40px; height: 40px; border-radius: 50%;
      background: linear-gradient(135deg, var(--sero-primary-200,#b6c9a2), var(--sero-primary,#3a472a));
      color: #fff; display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .psd-header-icon i { font-size: 18px; }
    .psd-header-info { flex: 1; }
    .psd-header-title { font-size: 18px; font-weight: 700; color: #1f2937; margin: 0; }
    .psd-header-sub { font-size: 13px; color: #9ca3af; margin: 2px 0 0; }
    .psd-close-btn {
      width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
      background: none; border: none; color: #9ca3af; cursor: pointer; border-radius: 6px;
    }
    .psd-close-btn:hover { color: #374151; background: #f9fafb; }

    .psd-body { flex: 1; overflow-y: auto; padding: 20px; position: relative; }
    .psd-saving-overlay {
      position: absolute; inset: 0; background: rgba(255,255,255,.85);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 12px; z-index: 10; font-size: 14px; color: var(--sero-primary, #3a472a);
    }
    .psd-saving-spinner {
      width: 36px; height: 36px; border: 4px solid #e5e7eb;
      border-top-color: var(--sero-primary, #3a472a); border-radius: 50%;
      animation: psdSpin .8s linear infinite;
    }
    @keyframes psdSpin { to { transform: rotate(360deg); } }

    .psd-field { margin-bottom: 20px; }
    .psd-label {
      display: flex; align-items: center; gap: 8px;
      font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 8px;
    }
    .psd-field-icon { color: var(--sero-primary, #3a472a); font-size: 13px; }
    .psd-input, .psd-textarea {
      width: 100%; padding: 12px; border: 1px solid #e5e7eb; border-radius: 8px;
      font-size: 14px; outline: none; box-sizing: border-box; transition: border 0.15s;
    }
    .psd-input:focus, .psd-textarea:focus {
      border-color: var(--sero-primary, #3a472a); box-shadow: 0 0 0 3px rgba(58,71,42,.1);
    }
    .psd-textarea { resize: vertical; font-family: inherit; }
    .psd-error { font-size: 12px; color: #dc2626; margin-top: 4px; }

    .psd-divider {
      display: flex; align-items: center; gap: 12px; margin: 20px 0;
    }
    .psd-divider::before, .psd-divider::after {
      content: ''; flex: 1; border-top: 1px solid #e5e7eb;
    }
    .psd-divider span { font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: .5px; }

    .psd-dates-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .psd-datefield { width: 100%; }

    .psd-footer {
      display: flex; justify-content: flex-end; gap: 12px;
      padding: 16px 20px; border-top: 1px solid #f3f4f6; flex-shrink: 0;
    }
    .psd-btn-cancel {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 18px; border: 1px solid #e5e7eb; border-radius: 8px;
      background: #fff; color: #374151; font-size: 13px; cursor: pointer; transition: all 0.15s;
    }
    .psd-btn-cancel:hover { background: #f9fafb; color: var(--sero-primary, #3a472a); }
    .psd-btn-confirm {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 10px 20px; background: var(--sero-primary, #3a472a); color: #fff;
      border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer;
      box-shadow: 0 4px 6px -1px rgba(58,71,42,.3); transition: all 0.2s;
    }
    .psd-btn-confirm:hover:not(:disabled) { background: var(--sero-primary-light, #4d6038); box-shadow: 0 10px 15px -3px rgba(58,71,42,.35); }
    .psd-btn-confirm:disabled { opacity: .5; cursor: not-allowed; }
  `],
})
export class PackageSelectionDialogComponent {
  selectedAgentId = signal<number | null>(null);
  isSaving = signal(false);

  form = new FormGroup({
    startDate: new FormControl<Date | null>(null, {
      validators: [Validators.required, ctrl => this.startDateValidator(ctrl)],
    }),
    endDate: new FormControl<Date | null>(null, {
      validators: [Validators.required, ctrl => this.endDateValidator(ctrl)],
    }),
    passengers: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(1)],
    }),
    quantity: new FormControl<number | null>(null, { validators: [Validators.min(1)] }),
    agentId: new FormControl<number | null>(null, { validators: [Validators.required] }),
    note: new FormControl<string>(''),
  });

  private startDateValidator(ctrl: AbstractControl) {
    if (!ctrl.value) return null;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today.getTime() + 86400000);
    return new Date(ctrl.value) < tomorrow ? { startBeforeTomorrow: true } : null;
  }

  private endDateValidator(ctrl: AbstractControl) {
    const fg = ctrl.parent as FormGroup | null;
    if (!fg) return null;
    const start = fg.get('startDate')?.value;
    if (!ctrl.value || !start) return null;
    return new Date(ctrl.value) <= new Date(start) ? { endBeforeStart: true } : null;
  }

  private readonly service = inject(AgentRequestsService);
  private readonly snackBar = inject(MatSnackBar);

  constructor(
    public dialogRef: MatDialogRef<PackageSelectionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { package: SeroPackageModel; selectedAgentId: number | null },
  ) {
    if (data.selectedAgentId) {
      this.selectedAgentId.set(data.selectedAgentId);
      this.form.patchValue({ agentId: data.selectedAgentId });
    }
    this.form.get('startDate')?.valueChanges.subscribe(() =>
      this.form.get('endDate')?.updateValueAndValidity({ emitEvent: false })
    );
  }

  onAgentIdChange(id: number | undefined) {
    this.selectedAgentId.set(id ?? null);
    this.form.patchValue({ agentId: id ?? null });
  }

  cancel() { this.dialogRef.close(); }

  confirm() {
    if (!this.form.valid) { this.form.markAllAsTouched(); return; }
    this.isSaving.set(true);
    this.form.disable();

    const { startDate, endDate, passengers, quantity, agentId, note } = this.form.value;
    this.service.createRequest({
      SeroPackageId: this.data.package.PackageID!,
      AgentId: agentId!,
      StartDate: startDate!,
      EndDate: endDate!,
      PassengerCount: passengers!,
      RequestedQuantity: quantity ?? 1,
      Notes: note ?? null,
    }).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.form.enable();
        this.snackBar.open('Package request created successfully', 'Close', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => {
        this.isSaving.set(false);
        this.form.enable();
        this.snackBar.open('Failed to create request', 'Close', { duration: 3000 });
      },
    });
  }
}
