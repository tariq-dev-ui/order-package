import {
  Component,
  input,
  output,
  signal,
  computed,
  effect,
  viewChild,
  ElementRef,
  ChangeDetectionStrategy,
  Input,
  Signal
} from '@angular/core';

export interface SelectOption {
  id: string | number;
  label: string;
  icon?: string;
  description?: string; // secondary line shown below label (e.g. price per unit)
}

@Component({
  selector: 'dropdown-search-list',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative w-full">
      @if (label()) {
        <label class="block text-xs font-medium text-gray-500 mb-1">
          @if (icon()) {
            <i class="{{ icon() }} text-primary-500 me-1.5"></i>
          }
          <span>{{ label() }}</span>
        </label>
      }

      <div class="relative">
        <input
          #selectInput
          type="text"
          class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg
                 focus:ring-1 focus:ring-primary-400 focus:border-primary-400 outline-none
                 transition-all duration-150 pr-8 bg-white cursor-pointer truncate"
          [class.opacity-40]="isOptionsLoading() || disabled()"
          [class.cursor-not-allowed]="disabled()"
          [class.cursor-pointer]="!disabled()"
          [disabled]="isOptionsLoading() || disabled()"
          [placeholder]="placeholder()"
          [value]="selectedOption()?.label || ''"
          readonly
          autocomplete="off"
          (click)="toggleDropdown()"
          (keydown.escape)="closeDropdown()"
          (keydown.enter)="toggleDropdown()"
          [class.bg-primary-50]="isOpen()"
          [class.border-primary-400]="isOpen()"
        >
        <div class="absolute inset-y-0 right-0 flex items-center pr-2.5 pointer-events-none">
          @if (isOptionsLoading()) {
            <i class="fas fa-spinner fa-spin text-primary-400 text-xs"></i>
          } @else {
            <i
              class="fas fa-chevron-down text-gray-300 text-xs transition-transform duration-200"
              [class.text-primary-400]="isOpen()"
              [class.rotate-180]="isOpen()"
            ></i>
          }
        </div>
      </div>

      @if (isOpen()) {
        <div class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
          <div class="p-1.5 border-b border-gray-100">
            <input
              #searchInput
              type="text"
              class="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-md
                     focus:ring-1 focus:ring-primary-400 focus:border-primary-400 outline-none bg-gray-50"
              [placeholder]="searchPlaceholder()"
              autocomplete="off"
              (input)="onSearch($event)"
              [disabled]="isOptionsLoading()"
            >
          </div>

          <div class="max-h-48 overflow-y-auto">
            @if (isOptionsLoading()) {
              <div class="flex justify-center items-center py-5">
                <i class="fas fa-spinner fa-spin text-primary-400 text-sm"></i>
              </div>
            } @else {
              <ul class="py-0.5">
                <li>
                  <button
                    type="button"
                    class="w-full text-left px-3 py-1.5 text-xs text-gray-400 transition-colors hover:bg-gray-50"
                    [class.bg-primary-500]="selectedOption() === null"
                    [class.!text-white]="selectedOption() === null"
                    [class.hover:bg-primary-500]="selectedOption() === null"
                    (click)="selectOption(null)"
                  >
                    — {{ 'None' }}
                  </button>
                </li>
                @for (option of filteredOptions(); track option.id) {
                  <li>
                    <button
                      type="button"
                      class="w-full text-left px-3 py-2 flex items-start gap-2 transition-colors"
                      [class.bg-primary-500]="option.id === selectedOption()?.id"
                      [class.text-white]="option.id === selectedOption()?.id"
                      [class.hover:bg-primary-50]="option.id !== selectedOption()?.id"
                      (click)="selectOption(option)"
                    >
                      @if (option.icon) {
                        <i class="fas {{ option.icon }} text-primary-400 text-[10px] mt-1 flex-shrink-0"
                           [class.!text-white]="option.id === selectedOption()?.id"></i>
                      }
                      <div class="min-w-0 flex-1">
                        <span class="block text-xs font-medium truncate"
                          [class.text-white]="option.id === selectedOption()?.id"
                          [class.text-gray-800]="option.id !== selectedOption()?.id">{{ option.label }}</span>
                        @if (option.description) {
                          <span class="block text-[10px] mt-0.5 font-semibold"
                            [class.text-primary-100]="option.id === selectedOption()?.id"
                            [class.text-primary-500]="option.id !== selectedOption()?.id">
                            {{ option.description }}
                          </span>
                        }
                      </div>
                    </button>
                  </li>
                } @empty {
                  <li class="px-3 py-3 text-center">
                    <i class="fas fa-search text-gray-200 text-lg block mb-1"></i>
                    <span class="text-xs text-gray-400">{{ noOptionsText() }}</span>
                  </li>
                }
              </ul>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class dropdownSearchListComponent {
  // Inputs

  @Input() options: Signal<SelectOption[] | []> = signal<SelectOption[]>([]);
  @Input() isOptionsLoading: Signal<boolean> = signal(false);

  label = input<string>('');
  icon = input<string>('');
  placeholder = input('Select an option');
  searchPlaceholder = input('Search options...');
  noOptionsText = input('No options found');
  selectedId = input<string | number | null | undefined>(null);
  disabled = input<boolean>(false);

  // Outputs
  selectionChanged = output<SelectOption | null>();

  // State signals
  isOpen = signal(false);
  searchTerm = signal('');
  selectedOption = signal<SelectOption | null>(null);

  // View children
  selectInput = viewChild<ElementRef<HTMLInputElement>>('selectInput');
  searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  // Computed properties
  filteredOptions = computed(() => {
    if (this.isOptionsLoading()) return [];
    const term = this.searchTerm().toLowerCase();
    return this.options().filter(option =>
      option.label.toLowerCase().includes(term)
    );
  });

  constructor() {
    // Update selected option when selectedId changes
    effect(() => {
      const selectedId = this.selectedId();
      if (selectedId === null) {
        this.selectedOption.set(null);
        return;
      }

      const option = this.options().find(o => o.id === selectedId);
      this.selectedOption.set(option || null);
    });

    // Close dropdown when clicked outside
    effect((onCleanup) => {
      const handler = (event: MouseEvent) => {
        if (!this.selectInput()?.nativeElement.contains(event.target as Node)) {
          this.closeDropdown();
        }
      };

      if (this.isOpen()) {
        document.addEventListener('click', handler);
      }

      onCleanup(() => document.removeEventListener('click', handler));
    });

    // Close dropdown when loading starts
    effect(() => {
      if (this.isOptionsLoading()) {
        this.closeDropdown();
      }
    });
  }

  toggleDropdown() {
    if (this.isOptionsLoading() || this.disabled()) return;
    this.isOpen.update(open => !open);
    if (this.isOpen()) {
      setTimeout(() => this.searchInput()?.nativeElement.focus(), 0);
    }
  }

  closeDropdown() {
    this.isOpen.set(false);
    this.searchTerm.set('');
  }

  onSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  selectOption(option: SelectOption | null) {
    if (this.isOptionsLoading()) return;

    this.selectedOption.set(option);
    this.selectionChanged.emit(option);
    this.closeDropdown();
  }
}
