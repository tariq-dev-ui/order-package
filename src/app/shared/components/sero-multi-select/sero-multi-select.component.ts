import { CommonModule } from '@angular/common';
import {
  ConnectedOverlayPositionChange,
  ConnectedPosition,
  Overlay,
  OverlayModule,
  ScrollStrategy,
} from '@angular/cdk/overlay';
import {
  Component,
  computed,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { DropdownStateService } from '../../../core/services/dropdown-state.service';

export interface SeroMultiSelectOption<T = string | number> {
  value: T;
  label?: string;
  labelKey?: string;
}

let _uidCounter = 0;

@Component({
  selector: 'app-sero-multi-select',
  standalone: true,
  imports: [CommonModule, OverlayModule, FormsModule, TranslateModule],
  template: `
    <div
      class="sero-dd sero-ms"
      cdkOverlayOrigin
      #dropdownOrigin="cdkOverlayOrigin"
      [class.is-open]="isOpen"
      [class.is-disabled]="disabled"
      [class.size-sm]="size === 'sm'">
      <button
        type="button"
        class="sero-dd-trigger"
        [disabled]="disabled"
        [attr.aria-expanded]="isOpen"
        [attr.aria-controls]="menuId"
        aria-haspopup="listbox"
        (click)="toggle($event)">
        <span class="sero-dd-value" [class.is-placeholder]="selectedValues().length === 0">
          @if (selectedValues().length === 0) {
            {{ placeholderKey ? (placeholderKey | translate) : placeholder }}
          } @else {
            @for (option of selectedOptions(); track option.value; let last = $last) {
              {{ option.labelKey ? (option.labelKey | translate) : option.label }}{{ last ? '' : ', ' }}
            }
          }
        </span>
        <span class="material-icons-round sero-dd-chevron" [class.open]="isOpen">expand_more</span>
      </button>
    </div>

    <ng-template
      cdkConnectedOverlay
      [cdkConnectedOverlayOrigin]="dropdownOrigin"
      [cdkConnectedOverlayOpen]="isOpen"
      [cdkConnectedOverlayPositions]="overlayPositions"
      [cdkConnectedOverlayWidth]="overlayWidth"
      [cdkConnectedOverlayMinWidth]="overlayWidth"
      [cdkConnectedOverlayPanelClass]="overlayPanelClasses"
      [cdkConnectedOverlayScrollStrategy]="scrollStrategy"
      [cdkConnectedOverlayPush]="true"
      [cdkConnectedOverlayViewportMargin]="8"
      (detach)="close()"
      (positionChange)="onPositionChange($event)">
      <div
        class="sero-dd-menu sero-ms-menu"
        [class.opens-above]="opensAbove"
        [id]="menuId"
        role="listbox"
        aria-multiselectable="true"
        (click)="$event.stopPropagation()">
        <div class="sero-ms-search">
          <span class="material-icons-round sero-ms-search-icon">search</span>
          <input
            type="text"
            class="sero-ms-search-input"
            [placeholder]="searchPlaceholderKey ? (searchPlaceholderKey | translate) : searchPlaceholder"
            [(ngModel)]="searchTerm"
            (ngModelChange)="onSearchTermChange($event)"
            (click)="$event.stopPropagation()" />
        </div>

        <div class="sero-ms-options">
          @for (option of filteredOptions(); track option.value) {
            <label class="sero-ms-option" [class.active]="isSelected(option.value)">
              <span class="sero-ms-option-label">{{ option.labelKey ? (option.labelKey | translate) : option.label }}</span>
              <input
                type="checkbox"
                class="sero-ms-checkbox"
                [checked]="isSelected(option.value)"
                (change)="toggleOption(option.value)" />
            </label>
          } @empty {
            <div class="sero-ms-empty">{{ noOptionsKey ? (noOptionsKey | translate) : noOptionsText }}</div>
          }
        </div>
      </div>
    </ng-template>
  `,
  styles: [`
    :host { display: block; width: 100%; }

    .sero-dd {
      position: relative;
      width: 100%;
    }

    .sero-dd-trigger {
      width: 100%;
      min-height: 42px;
      border: 1px solid var(--sero-border);
      border-radius: 10px;
      background: var(--sero-card-bg);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 9px 12px;
      font-family: var(--sero-font);
      font-size: 0.86rem;
      color: var(--sero-text-primary);
      cursor: pointer;
      transition: border-color var(--t-fast), box-shadow var(--t-fast), background var(--t-fast);
    }

    .sero-dd.size-sm .sero-dd-trigger {
      min-height: 34px;
      padding: 6px 10px;
      font-size: 0.8rem;
    }

    .sero-dd-trigger:hover:not(:disabled) {
      border-color: var(--sero-border-strong);
      background: var(--sero-surface-2);
    }

    .sero-dd.is-open .sero-dd-trigger {
      border-color: var(--sero-primary);
      box-shadow: 0 0 0 3px rgba(58, 71, 42, 0.1);
    }

    .sero-dd-trigger:disabled {
      cursor: not-allowed;
      background: var(--sero-surface-2);
      color: var(--sero-text-muted);
    }

    .sero-dd-value {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      text-align: start;
      flex: 1;
    }

    .sero-dd-value.is-placeholder {
      color: var(--sero-text-muted);
      font-weight: 500;
    }

    .sero-dd-chevron {
      font-size: 18px;
      color: var(--sero-text-muted);
      transition: transform var(--t-fast);
      flex-shrink: 0;
    }

    .sero-dd-chevron.open {
      transform: rotate(180deg);
    }

    .sero-dd-menu {
      position: static;
      width: 100%;
      background: var(--sero-card-bg);
      border: 1px solid var(--sero-border);
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(15, 23, 42, 0.09), 0 2px 10px rgba(15, 23, 42, 0.04);
      padding: 6px;
      z-index: 300;
      display: flex;
      flex-direction: column;
      gap: 2px;
      max-height: 320px;
      overflow: hidden;
      animation: seroDropdownEnter 140ms ease-out;
      transform-origin: top center;
    }

    .sero-dd-menu.opens-above {
      transform-origin: bottom center;
    }

    .sero-ms-search {
      position: relative;
      display: flex;
      align-items: center;
      gap: 6px;
      margin-bottom: 6px;
      padding: 0 10px;
      border: 1px solid var(--sero-border);
      border-radius: 8px;
      background: var(--sero-surface-2);
      flex-shrink: 0;
    }

    .sero-ms-search-icon {
      font-size: 18px;
      color: var(--sero-text-muted);
      flex-shrink: 0;
    }

    .sero-ms-search-input {
      width: 100%;
      height: 36px;
      border: none;
      outline: none;
      background: transparent;
      font-family: var(--sero-font);
      font-size: 0.82rem;
      color: var(--sero-text-primary);
    }

    .sero-ms-search-input::placeholder {
      color: var(--sero-text-muted);
    }

    .sero-ms-options {
      display: flex;
      flex-direction: column;
      gap: 2px;
      overflow-y: auto;
      max-height: 240px;
      scrollbar-width: thin;
      scrollbar-color: var(--sero-border-strong) transparent;
    }

    .sero-ms-option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      border: 1px solid transparent;
      border-radius: 8px;
      min-height: 38px;
      padding: 8px 10px;
      font-family: var(--sero-font);
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--sero-text-primary);
      cursor: pointer;
      transition: all var(--t-fast);
      user-select: none;
    }

    .sero-ms-option:hover {
      background: var(--sero-bg-hover);
      border-color: var(--sero-border-light);
    }

    .sero-ms-option.active {
      background: var(--sero-bg-selected);
      color: var(--sero-primary-dark);
      font-weight: 600;
    }

    .sero-ms-option-label {
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .sero-ms-checkbox {
      flex-shrink: 0;
      width: 17px;
      height: 17px;
      margin: 0;
      accent-color: var(--sero-primary);
      cursor: pointer;
    }

    .sero-ms-empty {
      padding: 1.25rem 0.5rem;
      text-align: center;
      color: var(--sero-text-muted);
      font-size: 0.8rem;
    }

    @keyframes seroDropdownEnter {
      from { opacity: 0; transform: translateY(-4px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    .sero-dd-menu.opens-above {
      animation-name: seroDropdownEnterAbove;
    }

    @keyframes seroDropdownEnterAbove {
      from { opacity: 0; transform: translateY(4px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  `]
})
export class SeroMultiSelectComponent<T = string | number> implements OnInit, OnDestroy {
  @Input() options: SeroMultiSelectOption<T>[] = [];
  @Input() value: T[] = [];
  @Input() placeholder = '';
  @Input() placeholderKey = '';
  @Input() searchPlaceholder = '';
  @Input() searchPlaceholderKey = '';
  @Input() noOptionsText = '';
  @Input() noOptionsKey = '';
  @Input() size: 'sm' | 'md' = 'md';
  @Input() disabled = false;
  @Output() valueChange = new EventEmitter<T[]>();

  isOpen = false;
  opensAbove = false;
  overlayWidth: number | string = '';
  searchTerm = '';
  readonly overlayPanelClasses = ['sero-dd-overlay-pane'];
  readonly overlayPositions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 6, panelClass: 'sero-dd-overlay-below' },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -6, panelClass: 'sero-dd-overlay-above' },
    { originX: 'end', originY: 'bottom', overlayX: 'end', overlayY: 'top', offsetY: 6, panelClass: 'sero-dd-overlay-below' },
    { originX: 'end', originY: 'top', overlayX: 'end', overlayY: 'bottom', offsetY: -6, panelClass: 'sero-dd-overlay-above' },
  ];

  private readonly uid = `sero-ms-${++_uidCounter}`;
  readonly menuId = `${this.uid}-menu`;
  private readonly destroy$ = new Subject<void>();
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly ddState = inject(DropdownStateService);
  private readonly overlay = inject(Overlay);
  private readonly translate = inject(TranslateService);
  readonly scrollStrategy: ScrollStrategy = this.overlay.scrollStrategies.reposition();

  readonly selectedValues = signal<T[]>([]);
  private readonly searchTermSignal = signal('');

  readonly filteredOptions = computed(() => {
    const term = this.searchTermSignal().trim().toLowerCase();
    if (!term) return this.options;
    return this.options.filter((option) => {
      const label = option.labelKey ? this.translate.instant(option.labelKey) : option.label ?? '';
      return label.toLowerCase().includes(term);
    });
  });

  readonly selectedOptions = computed(() => {
    const selected = this.selectedValues();
    return this.options.filter((option) => selected.includes(option.value));
  });

  ngOnInit(): void {
    this.selectedValues.set(this.value ?? []);
    this.ddState.closeOthers
      .pipe(takeUntil(this.destroy$))
      .subscribe((openId) => {
        if (openId !== this.uid) {
          this.close();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchTermChange(term: string): void {
    this.searchTermSignal.set(term);
  }

  isSelected(value: T): boolean {
    return this.selectedValues().includes(value);
  }

  toggleOption(value: T): void {
    const current = this.selectedValues();
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    this.selectedValues.set(next);
    this.valueChange.emit(next);
  }

  toggle(event: Event): void {
    event.stopPropagation();
    if (this.disabled) return;
    if (this.isOpen) {
      this.close();
      return;
    }
    this.open();
  }

  open(): void {
    this.overlayWidth = this.host.nativeElement.getBoundingClientRect().width;
    this.opensAbove = false;
    this.searchTerm = '';
    this.searchTermSignal.set('');
    this.isOpen = true;
    this.ddState.requestCloseOthers(this.uid);
  }

  close(): void {
    this.isOpen = false;
    this.opensAbove = false;
  }

  onPositionChange(event: ConnectedOverlayPositionChange): void {
    this.opensAbove = event.connectionPair.overlayY === 'bottom';
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (this.isOpen) {
      this.overlayWidth = this.host.nativeElement.getBoundingClientRect().width;
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (this.isOpen && !this.host.nativeElement.contains(event.target as Node)) {
      this.isOpen = false;
    }
  }
}
