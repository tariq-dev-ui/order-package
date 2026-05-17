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
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Subject, takeUntil } from 'rxjs';
import { DropdownStateService } from '../../../core/services/dropdown-state.service';

export interface SeroDropdownOption<T = string | number> {
  value: T;
  label?: string;
  labelKey?: string;
}

let _uidCounter = 0;

@Component({
  selector: 'app-sero-dropdown',
  standalone: true,
  imports: [CommonModule, OverlayModule, TranslateModule],
  template: `
    <div
      class="sero-dd"
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
        <span class="sero-dd-value" [class.is-placeholder]="!selectedOption">
          @if (selectedOption) {
            {{ selectedOption.labelKey ? (selectedOption.labelKey | translate) : selectedOption.label }}
          } @else {
            {{ placeholderKey ? (placeholderKey | translate) : placeholder }}
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
        class="sero-dd-menu"
        [class.opens-above]="opensAbove"
        [id]="menuId"
        role="listbox"
        (click)="$event.stopPropagation()">
        @for (option of options; track option.value) {
          <button
            type="button"
            class="sero-dd-option"
            role="option"
            [class.active]="isOptionSelected(option)"
            [attr.aria-selected]="isOptionSelected(option)"
            (click)="selectOption(option, $event)">
            {{ option.labelKey ? (option.labelKey | translate) : option.label }}
          </button>
        }
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
      max-height: 260px;
      overflow: auto;
      animation: seroDropdownEnter 140ms ease-out;
      transform-origin: top center;
      scrollbar-width: thin;
      scrollbar-color: var(--sero-border-strong) transparent;
    }

    .sero-dd-menu.opens-above {
      transform-origin: bottom center;
    }

    .sero-dd-option {
      border: 1px solid transparent;
      background: transparent;
      border-radius: 8px;
      min-height: 38px;
      text-align: start;
      padding: 8px 12px;
      font-family: var(--sero-font);
      font-size: 0.8125rem;
      font-weight: 500;
      color: var(--sero-text-primary);
      cursor: pointer;
      transition: all var(--t-fast);
      white-space: nowrap;
    }

    .sero-dd-option:hover {
      background: var(--sero-bg-hover);
      border-color: var(--sero-border-light);
    }

    .sero-dd-option.active {
      background: var(--sero-bg-selected);
      color: var(--sero-primary-dark);
      border-color: transparent;
      font-weight: 600;
    }

    @keyframes seroDropdownEnter {
      from {
        opacity: 0;
        transform: translateY(-4px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .sero-dd-menu.opens-above {
      animation-name: seroDropdownEnterAbove;
    }

    @keyframes seroDropdownEnterAbove {
      from {
        opacity: 0;
        transform: translateY(4px) scale(0.98);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `]
})
export class SeroDropdownComponent<T = string | number> implements OnInit, OnDestroy {
  @Input() options: SeroDropdownOption<T>[] = [];
  @Input() value: T | null = null;
  @Input() placeholder = '';
  @Input() placeholderKey = '';
  @Input() size: 'sm' | 'md' = 'md';
  @Input() disabled = false;
  @Output() valueChange = new EventEmitter<T>();

  isOpen = false;
  opensAbove = false;
  overlayWidth: number | string = '';
  readonly overlayPanelClasses = ['sero-dd-overlay-pane'];
  readonly overlayPositions: ConnectedPosition[] = [
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
      offsetY: 6,
      panelClass: 'sero-dd-overlay-below',
    },
    {
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'bottom',
      offsetY: -6,
      panelClass: 'sero-dd-overlay-above',
    },
    {
      originX: 'end',
      originY: 'bottom',
      overlayX: 'end',
      overlayY: 'top',
      offsetY: 6,
      panelClass: 'sero-dd-overlay-below',
    },
    {
      originX: 'end',
      originY: 'top',
      overlayX: 'end',
      overlayY: 'bottom',
      offsetY: -6,
      panelClass: 'sero-dd-overlay-above',
    },
  ];

  private readonly uid = `sero-dd-${++_uidCounter}`;
  readonly menuId = `${this.uid}-menu`;
  private readonly destroy$ = new Subject<void>();
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly ddState = inject(DropdownStateService);
  private readonly overlay = inject(Overlay);
  readonly scrollStrategy: ScrollStrategy = this.overlay.scrollStrategies.reposition();

  ngOnInit(): void {
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

  get selectedOption(): SeroDropdownOption<T> | undefined {
    return this.options.find((option) => option.value === this.value);
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

  selectOption(option: SeroDropdownOption<T>, event: Event): void {
    event.stopPropagation();
    this.value = option.value;
    this.valueChange.emit(option.value);
    this.close();
  }

  isOptionSelected(option: SeroDropdownOption<T>): boolean {
    return option.value === this.value;
  }

  open(): void {
    this.overlayWidth = this.host.nativeElement.getBoundingClientRect().width;
    this.opensAbove = false;
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
