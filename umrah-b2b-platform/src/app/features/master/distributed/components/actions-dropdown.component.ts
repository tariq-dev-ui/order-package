import {
  Component, input, output, signal, computed,
  ChangeDetectionStrategy, ElementRef, ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverlayModule, ConnectedPosition } from '@angular/cdk/overlay';
import { DropdownAction } from '../distributed-dashboard.model';

@Component({
  selector: 'app-dash-actions-dropdown',
  standalone: true,
  imports: [CommonModule, OverlayModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dropdown-host">
      <button type="button"
        class="dropdown-btn"
        [class.dropdown-btn--status]="hasStatusActions()"
        (click)="toggleDropdown()"
        [attr.aria-expanded]="isOpen()"
        aria-haspopup="true"
        #dropdownTrigger
        cdkOverlayOrigin>
        Actions
        <svg class="chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clip-rule="evenodd" />
        </svg>
      </button>

      <ng-template
        cdkConnectedOverlay
        [cdkConnectedOverlayOrigin]="dropdownTrigger"
        [cdkConnectedOverlayOpen]="isOpen()"
        [cdkConnectedOverlayPositions]="overlayPositions"
        (backdropClick)="onBackdropClick()"
        cdkConnectedOverlayHasBackdrop>
        <div class="dropdown-menu" role="menu">
          <div class="menu-inner" role="none">
            @for (action of actions(); track $index) {
              <a href="#"
                (click)="onActionClick(action); $event.preventDefault()"
                class="menu-item"
                [class.menu-item--status]="!!action.status"
                [class.rounded-t]="$index === 0"
                [class.rounded-b]="$index === actions().length - 1"
                role="menuitem">
                {{ action.label }}
              </a>
            }
          </div>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .dropdown-host { position: relative; display: inline-block; }

    .dropdown-btn {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      gap: 4px;
      padding: 6px 14px;
      font-size: 13px;
      font-weight: 500;
      border-radius: 6px;
      border: 1px solid #d1d5db;
      background: #fff;
      color: #374151;
      cursor: pointer;
      transition: background 0.15s;
      white-space: nowrap;
    }
    .dropdown-btn:hover { background: #f9fafb; }
    .dropdown-btn:focus { outline: 2px solid var(--sero-primary); outline-offset: 2px; }

    .dropdown-btn--status {
      background: #eab308;
      color: #fff;
      border-color: #eab308;
    }
    .dropdown-btn--status:hover { background: #ca8a04; }

    .chevron { width: 18px; height: 18px; margin-left: 4px; }

    .dropdown-menu {
      width: 224px;
      border-radius: 6px;
      box-shadow: 0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -2px rgba(0,0,0,.05);
      background: #fff;
      border: 1px solid rgba(0,0,0,.08);
      outline: none;
      z-index: 1000;
    }
    .menu-inner { padding: 4px 0; }

    .menu-item {
      display: block;
      padding: 8px 16px;
      font-size: 13px;
      text-decoration: none;
      color: #374151;
      transition: background 0.1s;
    }
    .menu-item:hover { background: #f3f4f6; color: #111827; }

    .menu-item--status {
      background: #fef9c3;
      color: #92400e;
    }
    .menu-item--status:hover { background: #fef08a; }

    .rounded-t { border-radius: 6px 6px 0 0; }
    .rounded-b { border-radius: 0 0 6px 6px; }
  `],
})
export class DashActionsDropdownComponent {
  actions = input.required<DropdownAction[]>();
  actionSelected = output<DropdownAction>();

  isOpen = signal(false);

  hasStatusActions = computed(() => this.actions().some(a => a.status));

  @ViewChild('dropdownTrigger') dropdownTrigger!: ElementRef;

  overlayPositions: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top', offsetY: 4 },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom', offsetY: -4 },
  ];

  toggleDropdown(): void { this.isOpen.update(v => !v); }

  onActionClick(action: DropdownAction): void {
    this.actionSelected.emit(action);
    this.isOpen.set(false);
  }

  onBackdropClick(): void { this.isOpen.set(false); }
}
