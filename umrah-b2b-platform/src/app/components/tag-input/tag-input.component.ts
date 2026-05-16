import {
  Component, computed, effect, Signal, signal,
  ChangeDetectionStrategy, input, output, Input
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { TagCreateModalComponent } from './tag-create-modal.component';
import { TagBasicModel, getDefaultColor, DEFAULT_TAG_COLORS } from './tag.model';
// import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// import { faPlus, faTimes, faTag, faCheck } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-tag-input',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, TagCreateModalComponent, TranslateModule],
  template: `
    <div class="relative bg-white ">
      <!-- Tags Display -->
      @if (selectedTags().length > 0) {
        <div class="flex flex-wrap gap-2 mb-3">
          @for (tag of selectedTags(); track $index) {
            <span 
              class="inline-flex items-center text-xs px-3 py-1.5 rounded-full font-medium"
              [style.backgroundColor]="bgWithOpacity(tag.Color || getDefaultColor(tag.TagID), 0.1)"
              [style.color]="tag.Color ? tag.Color : getDefaultColor(tag.TagID)"
            >
              {{ tag.Name }}
              <button type="button"
                (click)="removeTag(tag.TagID)" 
                class="ms-1.5 hover:opacity-80 transition-opacity"
                [style.color]="tag.Color ? tag.Color : getDefaultColor(tag.TagID)"
              >
                <!-- <fa-icon [icon]="faTimes" class="text-xs"></fa-icon> -->
                <i class="fas fa-times text-xs"></i>
              </button>
            </span>
          }
        </div>
      }

      <!-- Input Area -->
      <div class="flex gap-1">
        <input
          type="text"
          class="flex-1 placeholder-gray-400 px-3 py-2 h-13 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-all disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
          [ngModel]="tagInput()"
          (ngModelChange)="tagInput.set($event)"
          (keydown)="handleKeyDown($event)"
          (focus)="showSuggestions.set(true)"
          [placeholder]="isTabsLoading() ? ('Loading Tags...' | translate) : ('Type to add a tag...' | translate)"
          [disabled]="isTabsLoading()"
        />
        <button type="button"
          class="flex items-center justify-center w-13 h-13 bg-primary-500 text-white rounded-sm hover:bg-primary-600 active:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:cursor-not-allowed disabled:bg-gray-400 disabled:text-gray-300"
          (click)="openCreateTagModal()"
          [attr.title]="'Create new tag' | translate"
          [disabled]="isTabsLoading()"
        >
          @if (isTabsLoading()) {
            <i class="fas fa-spinner fa-spin"></i>
          } @else {
            <i class="fas fa-plus"></i>
          }
        </button>
      </div>

      <!-- Suggestions Dropdown -->
      @if (showSuggestions() && filteredSuggestions().length > 0) {
        <div class="absolute z-10 mt-1 w-full max-h-[30vh] overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div class="divide-y divide-gray-100">
            @for (tag of filteredSuggestions(); track tag.TagID) {
              <div 
                class="flex items-center px-4 py-2 hover:bg-gray-50 cursor-pointer transition-colors"
                (click)="addTag(tag)"
              >
                <span 
                  class="w-3 h-3 rounded-full me-3 flex-shrink-0"
                  [style.background]="tag.Color || getDefaultColor(tag.TagID)"
                ></span>
                <span class="truncate font-medium">{{ tag.Name }}</span>
                @if (tag.Description) {
                  <span class="ms-auto text-xs text-gray-500 truncate max-w-[40%]">{{ tag.Description }}</span>
                }
              </div>
            }
          </div>
        </div>
      }

      <!-- Create Tag Modal -->
      @if (showModal()) {
        <app-tag-create-modal
          [tag]="newTag"
          (saved)="onTagCreated($event)"
          (closed)="closeModal()"
        />
      }
    </div>
  `
})
export class TagInputComponent {
  // Icons
  // faPlus = faPlus;
  // faTimes = faTimes;

  // Input properties
  // make these input signals
  @Input() initialTags = signal<TagBasicModel[]>([]);
  @Input() availableTags = signal<TagBasicModel[]>([]);
  @Input() isTabsLoading = signal(false);
  @Input() allowCreate = signal(true);

  // Output events
  tagsChanged = output<TagBasicModel[]>();
  tagAdded = output<TagBasicModel>();
  tagRemoved = output<TagBasicModel>();

  // State signals
  selectedTags = signal<TagBasicModel[]>([]);
  tagInput = signal('');
  showSuggestions = signal(false);
  showModal = signal(false);
  newTag: TagBasicModel = {
    Name: '',
    Description: '',
    Color: getDefaultColor()
  };

  // Computed values
  filteredSuggestions = computed(() => {
    const input = this.tagInput().toLowerCase();
    if (!input) return [];

    return this.availableTags().filter(tag =>
      tag.Name?.toLowerCase().includes(input) &&
      !this.selectedTags().some(t => t.TagID === tag.TagID)
    );
  });

  constructor() {
    // Initialize with input tags
    effect(() => {
      if (this.initialTags().length > 0) {
        this.selectedTags.set([...this.initialTags()]);
      }
    });

    // Notify when tags change
    effect(() => {
      this.tagsChanged.emit([...this.selectedTags()]);
    });
  }

  getDefaultColor(tagId?: number): string {
    return tagId ? DEFAULT_TAG_COLORS[tagId % 8] : DEFAULT_TAG_COLORS[0];
  }

  /**
   * Convert a hex (#RGB, #RRGGBB, #RRGGBBAA) or rgb/rgba string into an rgba() with the requested opacity.
   * Falls back to the original color string if it can't parse.
   */
  bgWithOpacity(color: string | undefined, opacity = 0.1): string {
    if (!color) return `rgba(0,0,0,${opacity})`;
    const c = color.trim();

    // hex formats
    if (c.startsWith('#')) {
      const hex = c.slice(1);
      let r = 0, g = 0, b = 0;
      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16);
        g = parseInt(hex[1] + hex[1], 16);
        b = parseInt(hex[2] + hex[2], 16);
        return `rgba(${r},${g},${b},${opacity})`;
      }
      if (hex.length === 6 || hex.length === 8) {
        r = parseInt(hex.slice(0, 2), 16);
        g = parseInt(hex.slice(2, 4), 16);
        b = parseInt(hex.slice(4, 6), 16);
        return `rgba(${r},${g},${b},${opacity})`;
      }
      // unknown hex length -> fallback
      return c;
    }

    // rgb / rgba formats
    if (c.startsWith('rgb')) {
      const nums = c.replace(/rgba?\(|\)|\s/g, '').split(',').map(n => parseFloat(n));
      if (nums.length >= 3) {
        const [r, g, b] = nums;
        return `rgba(${r},${g},${b},${opacity})`;
      }
      return c;
    }

    // otherwise return original string (could be a CSS var or color name)
    return c;
  }

  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      this.processTagInput();
    }
  }

  processTagInput() {
    const inputVal = this.tagInput().trim();
    if (!inputVal) return;

    if (this.filteredSuggestions().length > 0) {
      this.addTag(this.filteredSuggestions()[0]);
    } else if (this.allowCreate()) {
      this.openCreateTagModal(inputVal);
    }
  }

  openCreateTagModal(prefilledName = '') {
    this.newTag = {
      Name: prefilledName,
      Description: '',
      Color: this.getDefaultColor()
    };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  onTagCreated(tag: TagBasicModel) {
    this.createTag(tag);
    this.closeModal();
  }

  addTag(tag: TagBasicModel) {
    if (!tag.TagID || this.selectedTags().some(t => t.TagID === tag.TagID)) return;
    

    this.selectedTags.update(tags => [...tags, tag]);
    this.tagInput.set('');
    this.showSuggestions.set(false);
    this.tagsChanged.emit(this.selectedTags());
  }

  createTag(tag: TagBasicModel) {
    const newTag: TagBasicModel = {
      ...tag,
    };

    
    this.tagInput.set('');
    this.showSuggestions.set(false);
    this.tagAdded.emit(newTag);
  }

  removeTag(tagId?: number) {
    if (!tagId) return;

    const tag = this.selectedTags().find(t => t.TagID === tagId);
    if (!tag) return;

    this.selectedTags.update(tags => tags.filter(t => t.TagID !== tagId));
    this.tagRemoved.emit(tag);
  }
}
