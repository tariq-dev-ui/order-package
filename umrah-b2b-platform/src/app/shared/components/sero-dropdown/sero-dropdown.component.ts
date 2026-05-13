import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

export interface SeroDropdownOption<T = string | number> {
  value: T;
  label?: string;
  labelKey?: string;
}

@Component({
  selector: 'app-sero-dropdown',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="sero-dd" [class.is-open]="isOpen" [class.is-disabled]="disabled" [class.size-sm]="size === 'sm'">
      <button type="button" class="sero-dd-trigger" [disabled]="disabled" (click)="toggle($event)">
        <span class="sero-dd-value" [class.is-placeholder]="!selectedOption">
          @if (selectedOption) {
            {{ selectedOption.labelKey ? (selectedOption.labelKey | translate) : selectedOption.label }}
          } @else {
            {{ placeholderKey ? (placeholderKey | translate) : placeholder }}
          }
        </span>
        <span class="material-icons-round sero-dd-chevron" [class.open]="isOpen">expand_more</span>
      </button>

      @if (isOpen) {
        <div class="sero-dd-menu">
          @for (option of options; track option.value) {
            <button
              type="button"
              class="sero-dd-option"
              [class.active]="isOptionSelected(option)"
              (click)="selectOption(option, $event)">
              {{ option.labelKey ? (option.labelKey | translate) : option.label }}
            </button>
          }
        </div>
      }
    </div>
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
      position: absolute;
      top: calc(100% + 6px);
      inset-inline-start: 0;
      width: 100%;
      background: var(--sero-card-bg);
      border: 1px solid var(--sero-border);
      border-radius: 10px;
      box-shadow: var(--shadow-lg);
      padding: 6px;
      z-index: 300;
      display: flex;
      flex-direction: column;
      gap: 4px;
      max-height: 260px;
      overflow: auto;
    }

    .sero-dd-option {
      border: 1px solid transparent;
      background: transparent;
      border-radius: 8px;
      min-height: 34px;
      text-align: start;
      padding: 6px 10px;
      font-family: var(--sero-font);
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--sero-text-primary);
      cursor: pointer;
      transition: all var(--t-fast);
    }

    .sero-dd-option:hover {
      background: var(--sero-surface-2);
      border-color: var(--sero-border-light);
    }

    .sero-dd-option.active {
      background: var(--sero-primary-50);
      color: var(--sero-primary-dark);
      border-color: var(--sero-primary-100);
    }
  `]
})
export class SeroDropdownComponent<T = string | number> {
  @Input() options: SeroDropdownOption<T>[] = [];
  @Input() value: T | null = null;
  @Input() placeholder = '';
  @Input() placeholderKey = '';
  @Input() size: 'sm' | 'md' = 'md';
  @Input() disabled = false;
  @Output() valueChange = new EventEmitter<T>();

  isOpen = false;

  constructor(private readonly host: ElementRef<HTMLElement>) {}

  get selectedOption(): SeroDropdownOption<T> | undefined {
    return this.options.find((option) => option.value === this.value);
  }

  toggle(event: Event): void {
    event.stopPropagation();
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
  }

  selectOption(option: SeroDropdownOption<T>, event: Event): void {
    event.stopPropagation();
    this.value = option.value;
    this.valueChange.emit(option.value);
    this.isOpen = false;
  }

  isOptionSelected(option: SeroDropdownOption<T>): boolean {
    return option.value === this.value;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.isOpen = false;
    }
  }
}
