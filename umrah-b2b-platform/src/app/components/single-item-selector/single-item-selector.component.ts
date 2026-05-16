import {
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild,
  effect,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { TranslateModule } from '@ngx-translate/core';

export interface Item {
  id: number | string;
  title: string;
  subtitle?: string;
  avatar?: string;
}

@Component({
  selector: 'single-item-selector',
  imports: [CommonModule, FormsModule, MatPaginatorModule, TranslateModule],
  template: `
    <div class="relative w-full">
      @if (label) {
        <label class="block text-sm font-medium text-gray-700 mb-1">
          @if (icon) {
            <i class="{{ icon }} text-primary-500 me-2"></i>
          }
          <span>{{ label }}</span>
        </label>
      }

      <div class="relative">
        <div
          class="w-full px-4 py-3 border border-gray-300 rounded-lg
                focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500 outline-none
                transition-all pr-10 bg-white flex flex-wrap gap-2 min-h-[56px] cursor-text"
          [class.opacity-50]="isLoading"
          [class.bg-primary-50]="isOpen()"
          [class.border-primary-500]="isOpen()"
          [class.hover:bg-primary-50]="!isOpen() && !isLoading"
          [class.hover:border-primary-500]="!isOpen() && !isLoading"
        >
          <!-- Selected item -->
          @if (!hideSelectedItemWithinSearchInput && selectedItem()) {
            <div class="flex items-center bg-primary-100 text-primary-800 rounded-full py-1 pl-3 pr-2 text-sm">
              @if (selectedItem()!.avatar) {
                <img [src]="selectedItem()!.avatar" class="w-5 h-5 rounded-full me-2" [attr.alt]="selectedItem()!.title">
              }
              <span>{{ selectedItem()!.title }}</span>
              <button
                (click)="clearSelection($event)"
                class="ms-1 text-primary-600 hover:text-primary-800"
                type="button"
              >
                <i class="fas fa-times text-xs"></i>
              </button>
            </div>
          }

          <!-- Search input -->
          <input
            #searchInput
            type="text"
            class="flex-1 min-w-[100px] outline-none bg-transparent"
            [placeholder]="!selectedItem() || hideSelectedItemWithinSearchInput ? placeholder : ''"
            [(ngModel)]="searchQuery"
            (input)="filterItems()"
            (focus)="openDropdown()"
            (keydown.escape)="closeDropdown()"
            (keydown.arrowDown)="highlightNext($event)"
            (keydown.arrowUp)="highlightPrev($event)"
            (keydown.enter)="selectHighlighted($event)"
          >
        </div>

        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          @if (isLoading) {
            <i class="fas fa-spinner fa-spin text-primary-500"></i>
          } @else {
            <i
              class="fas fa-chevron-down text-gray-400 transition-transform duration-200"
              [class.text-primary-500]="isOpen()"
              [class.rotate-180]="isOpen()"
            ></i>
          }
        </div>
      </div>

      @if (isOpen()) {
        <div
          class="absolute z-10 w-full mt-1 bg-white border border-primary-100 rounded-lg shadow-lg overflow-hidden
                transition-all duration-200"
          [class.opacity-0]="!dropdownVisible"
          [class.opacity-100]="dropdownVisible"
          [class.scale-95]="!dropdownVisible"
          [class.scale-100]="dropdownVisible"
        >
          <div class="p-2 border-b border-primary-100 bg-primary-50">
            <input
              #dropdownSearchInput
              type="text"
              class="w-full px-3 py-2 text-sm border border-primary-100 rounded-md
                    focus:ring-1 focus:ring-primary-500 focus:border-primary-500 outline-none"
              [placeholder]="('Search' | translate) + ' ' + (label || ('items' | translate)) + '...'"
              autocomplete="off"
              [(ngModel)]="searchQuery"
              (input)="filterItems()"
            >
          </div>

          <div class="max-h-60 overflow-y-auto">
            @if (isLoading) {
              <div class="flex justify-center items-center p-4">
                <i class="fas fa-spinner fa-spin text-primary-500"></i>
              </div>
            } @else {
              <ul>
                @for (item of paginatedItems; track item.id; let i = $index) {
                  <li>
                    <button
                      type="button"
                      class="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-primary-50 transition-colors"
                      [class.bg-primary-100]="highlightedIndex() === i"
                      [class.font-medium]="isSelected(item)"
                      (click)="toggleItemSelection(item)"
                      (mouseenter)="highlightedIndex.set(i)"
                    >
                      <!-- Avatar/Icon -->
                      @if (item.avatar) {
                        <img [src]="item.avatar" class="w-8 h-8 rounded-full" [attr.alt]="item.title">
                      } @else {
                        <div class="w-8 h-8 rounded-full bg-primary-200 flex items-center justify-center text-primary-800">
                          <i class="fas fa-user"></i>
                        </div>
                      }

                      <!-- Text Content -->
                      <div class="flex-1 min-w-0">
                        <div class="text-sm text-gray-900 truncate">{{ item.title }}</div>
                        @if (item.subtitle) {
                          <div class="text-xs text-gray-500 truncate">{{ item.subtitle }}</div>
                        }
                      </div>

                      <!-- Selection Indicator -->
                      @if (isSelected(item)) {
                        <div class="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center">
                          <i class="fas fa-check text-white text-xs"></i>
                        </div>
                      } @else {
                        <div class="w-5 h-5 rounded-full border border-gray-300"></div>
                      }
                    </button>
                  </li>
                } @empty {
                  <li>
                    <div class="px-4 py-3 text-gray-500 text-sm text-center">
                      {{ 'No items found matching' | translate }} "{{ searchQuery }}"
                    </div>
                  </li>
                }
              </ul>
            }
          </div>

          <!-- Mat Paginator -->
          @if (enablePagination) {
            <div class="border-t border-primary-100">
              <mat-paginator
                #paginator
                [length]="totalCount || filteredItems().length"
                [pageSize]="pageSize"
                [pageSizeOptions]="[5, 10, 25, 50]"
                [pageIndex]="currentPage()"
                (page)="onPageChange($event)"
                showFirstLastButtons
                hidePageSize="false">
              </mat-paginator>
            </div>
          }

          @if (selectedItem()) {
            <div class="p-2 border-t border-primary-100 text-xs text-gray-500 bg-primary-50">
              {{ '1 selected' | translate }}
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class SingleItemSelectorComponent {
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('dropdownSearchInput') dropdownSearchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('paginator') paginator!: any;

  // Input properties
  @Input() label?: string;
  @Input() placeholder = 'Select item...';
  @Input() icon?: string;
  @Input() items: Item[] = [];
  @Input() selected: Item | null = null;
  @Input() isLoading = false;
  @Input() enablePagination = false;
  @Input() pageSize = 10;
  @Input() totalCount = 0;
  @Input() serverSide = false;
  @Input() hideSelectedItemWithinSearchInput? = false;

  // Output events
  @Output() selectionChange = new EventEmitter<Item | null>();
  @Output() pageChange = new EventEmitter<PageEvent>();
  @Output() searchChange = new EventEmitter<string>();

  // Internal state
  isOpen = signal(false);
  dropdownVisible = false;
  searchQuery = '';
  highlightedIndex = signal(-1);
  selectedItem = signal<Item | null>(null);
  filteredItems = signal<Item[]>([]);
  currentPage = signal<number>(0);

  constructor() {
    effect(() => {
      this.dropdownVisible = this.isOpen();
      if (this.isOpen()) {
        setTimeout(() => this.dropdownSearchInput?.nativeElement.focus(), 0);
      }
    });
  }

  ngOnInit() {
    this.selectedItem.set(this.selected);
    this.filteredItems.set([...this.items]);
  }

  ngOnChanges() {
    this.selectedItem.set(this.selected);
    this.filteredItems.set([...this.items]);
  }

  openDropdown() {
    if (this.isLoading) return;
    this.isOpen.set(true);
  }

  closeDropdown() {
    this.isOpen.set(false);
    this.highlightedIndex.set(-1);
  }

  toggleDropdown() {
    this.isOpen.update(open => !open);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.isOpen()) return;

    const target = event.target as HTMLElement;
    const clickedInside =
      this.searchInput?.nativeElement.contains(target) || target.closest('.absolute.z-10');

    if (!clickedInside) {
      this.closeDropdown();
    }
  }

  filterItems() {
    if (this.serverSide) {
      this.searchChange.emit(this.searchQuery);
      this.filteredItems.set([...this.items]);
    } else {
      if (!this.searchQuery) {
        this.filteredItems.set([...this.items]);
        return;
      }

      const query = this.searchQuery.toLowerCase();
      this.filteredItems.set(
        this.items.filter(
          item =>
            item.title.toLowerCase().includes(query) ||
            (item.subtitle && item.subtitle.toLowerCase().includes(query)),
        ),
      );
    }

    this.highlightedIndex.set(-1);
    this.currentPage.set(0);
  }

  // Computed paginated items for dropdown
  get paginatedItems(): Item[] {
    if (!this.enablePagination) {
      return this.filteredItems();
    }

    return this.items;
  }

  // Handle page change from mat-paginator
  onPageChange(event: PageEvent) {
    this.currentPage.set(event.pageIndex);
    this.pageChange.emit(event);
  }

  toggleItemSelection(item: Item) {
    if (this.isSelected(item)) {
      this.selectedItem.set(null);
    } else {
      this.selectedItem.set(item);
    }

    this.emitSelectionChange();
    this.closeDropdown();
  }

  isSelected(item: Item): boolean {
    return this.selectedItem()?.id === item.id;
  }

  clearSelection(event?: Event) {
    event?.stopPropagation();
    this.selectedItem.set(null);
    this.emitSelectionChange();
  }

  emitSelectionChange() {
    this.selectionChange.emit(this.selectedItem());
  }

  highlightNext(event: Event) {
    event.preventDefault();
    if (!this.isOpen()) {
      this.openDropdown();
      return;
    }

    if (this.highlightedIndex() < this.filteredItems().length - 1) {
      this.highlightedIndex.update(i => i + 1);
      this.scrollToHighlighted();
    }
  }

  highlightPrev(event: Event) {
    event.preventDefault();
    if (!this.isOpen()) {
      this.openDropdown();
      return;
    }

    if (this.highlightedIndex() > 0) {
      this.highlightedIndex.update(i => i - 1);
      this.scrollToHighlighted();
    }
  }

  selectHighlighted(event: Event) {
    event.preventDefault();
    if (this.highlightedIndex() >= 0 && this.highlightedIndex() < this.filteredItems().length) {
      this.toggleItemSelection(this.filteredItems()[this.highlightedIndex()]);
    }
  }

  scrollToHighlighted() {
    const element = document.querySelector(`button[class*="bg-primary-100"]`);
    if (element) {
      element.scrollIntoView({ block: 'nearest' });
    }
  }
}
