import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'pkg-pagination',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <nav class="pg-nav">
      <button class="pg-btn" type="button"
        [disabled]="currentNormalized() === 1"
        (click)="changePage(currentNormalized() - 1)"
        aria-label="Previous page">
        <span class="material-icons-round" style="font-size:18px">chevron_left</span>
      </button>

      @for (item of pageItems(); track $index) {
        @if (item === '...') {
          <span class="pg-ellipsis" aria-hidden="true">…</span>
        } @else {
          <button type="button"
            class="pg-btn"
            [class.pg-btn--active]="item === currentNormalized()"
            [attr.aria-current]="item === currentNormalized() ? 'page' : null"
            (click)="changePage(item)">
            {{ item }}
          </button>
        }
      }

      <button class="pg-btn" type="button"
        [disabled]="currentNormalized() === totalNormalized()"
        (click)="changePage(currentNormalized() + 1)"
        aria-label="Next page">
        <span class="material-icons-round" style="font-size:18px">chevron_right</span>
      </button>
    </nav>
  `,
  styles: [`
    .pg-nav {
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .pg-btn {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      border: 1px solid #e5e7eb;
      background: #fff;
      color: #374151;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.12s;
    }
    .pg-btn:hover:not(:disabled):not(.pg-btn--active) { background: #f3f4f6; }
    .pg-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .pg-btn--active {
      background: var(--sero-primary, #3a472a);
      color: #fff;
      border-color: var(--sero-primary, #3a472a);
    }
    .pg-ellipsis {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #6b7280;
      user-select: none;
    }
  `],
})
export class PaginationComponent {
  currentPage = input<number>(1);
  totalPages = input<number>(1);
  maxButtons = input<number>(7);
  pageChange = output<number>();

  readonly pageItems = computed<(number | '...')[]>(() => {
    const total = Math.max(1, this.totalPages());
    const current = this.clamp(this.currentPage(), total);
    return this.buildItems(current, total, Math.max(5, this.maxButtons()));
  });

  readonly currentNormalized = computed(() => this.clamp(this.currentPage(), Math.max(1, this.totalPages())));
  readonly totalNormalized = computed(() => Math.max(1, this.totalPages()));

  changePage(page: number | '...'): void {
    if (page === '...') return;
    const next = this.clamp(page, this.totalNormalized());
    if (next !== this.currentPage()) this.pageChange.emit(next);
  }

  private clamp(p: number, total: number): number {
    return Math.min(Math.max(1, p), total);
  }

  private buildItems(current: number, total: number, max: number): (number | '...')[] {
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
