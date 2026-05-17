import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'pagination',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  currentPage = input<number>();
  totalPages = input<number | undefined>();
  maxButtons = input<number>(7);
  pageChange = output<number>();

  protected readonly pageItems = computed<(number | '...')[]>(() => {
    const total = Math.max(1, this.totalPages() ?? 1);
    const current = this.clampPage(this.currentPage() ?? 1, total);
    const maxButtons = Math.max(5, this.maxButtons());
    return this.buildPageItems(current, total, maxButtons);
  });

  protected readonly currentNormalized = computed(() => {
    const total = Math.max(1, this.totalPages() ?? 1);
    return this.clampPage(this.currentPage() ?? 1, total);
  });

  protected readonly totalNormalized = computed(() => Math.max(1, this.totalPages() ?? 1));

  changePage(page: number): void {
    const total = Math.max(1, this.totalPages() ?? 1);
    const nextPage = this.clampPage(page, total);
    if (nextPage !== (this.currentPage() ?? 1)) {
      this.pageChange.emit(nextPage);
    }
  }

  private clampPage(page: number, total: number): number {
    if (Number.isNaN(page)) {
      return 1;
    }
    return Math.min(Math.max(1, page), total);
  }

  private buildPageItems(current: number, total: number, maxButtons: number): (number | '...')[] {
    if (total <= maxButtons) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const items: (number | '...')[] = [];
    const side = Math.floor((maxButtons - 3) / 2);
    let left = Math.max(2, current - side);
    let right = Math.min(total - 1, current + side);

    if (current - 1 <= side) {
      left = 2;
      right = Math.min(total - 1, maxButtons - 2);
    }

    if (total - current <= side) {
      right = total - 1;
      left = Math.max(2, total - (maxButtons - 3));
    }

    items.push(1);
    if (left > 2) {
      items.push('...');
    }
    for (let i = left; i <= right; i += 1) {
      items.push(i);
    }
    if (right < total - 1) {
      items.push('...');
    }
    items.push(total);

    return items;
  }
}
