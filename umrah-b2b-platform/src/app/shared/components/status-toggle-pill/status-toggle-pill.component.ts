import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';

@Component({
  selector: 'app-status-toggle-pill',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="status-toggle-wrap" (click)="$event.stopPropagation()">
      <button
        type="button"
        class="status-toggle-pill"
        role="switch"
        [class.is-active]="isActive"
        [class.is-inactive]="!isActive"
        [attr.aria-checked]="isActive"
        [attr.aria-label]="ariaLabel"
        (click)="openConfirmation($event)">
        <span class="material-icons-round status-toggle-icon">{{ isActive ? 'check' : 'close' }}</span>
        <span>{{ isActive ? activeLabel : inactiveLabel }}</span>
      </button>

      @if (confirmationOpen) {
        <div
          class="status-confirm-popover"
          role="dialog"
          aria-modal="false"
          (click)="$event.stopPropagation()">
          <p>{{ isActive ? deactivateMessage : activateMessage }}</p>
          <div class="status-confirm-actions">
            <button type="button" class="confirm-btn confirm-btn--primary" (click)="confirmChange($event)">تأكيد</button>
            <button type="button" class="confirm-btn confirm-btn--secondary" (click)="cancelChange($event)">إلغاء</button>
          </div>
        </div>
      }
    </span>
  `,
  styles: [`
    :host {
      display: inline-flex;
      vertical-align: middle;
    }

    .status-toggle-wrap {
      position: relative;
      display: inline-flex;
      justify-content: center;
    }

    .status-toggle-pill {
      min-width: 54px;
      min-height: 24px;
      border: 1px solid transparent;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      padding: 3px 9px;
      font-family: var(--sero-font);
      font-size: 0.68rem;
      font-weight: 800;
      cursor: pointer;
      transform-origin: center;
      transition: background var(--t-fast), border-color var(--t-fast), color var(--t-fast), transform var(--t-fast), box-shadow var(--t-fast), filter var(--t-fast);
    }

    .status-toggle-pill.is-active {
      color: var(--sero-success);
      background: var(--sero-success-bg);
      border-color: var(--sero-success-border);
    }

    .status-toggle-pill.is-inactive {
      color: var(--sero-danger);
      background: var(--sero-danger-bg);
      border-color: var(--sero-danger-border);
    }

    .status-toggle-pill:hover {
      filter: brightness(0.98);
      transform: scale(1.025);
      box-shadow: var(--shadow-sm);
    }

    .status-toggle-pill:focus-visible {
      outline: 2px solid var(--sero-primary);
      outline-offset: 2px;
      box-shadow: 0 0 0 4px color-mix(in srgb, var(--sero-primary) 12%, transparent);
    }

    .status-toggle-icon {
      font-size: 14px;
      line-height: 1;
    }

    .status-confirm-popover {
      position: absolute;
      top: calc(100% + 8px);
      left: 50%;
      z-index: 80;
      width: 190px;
      border: 1px solid var(--sero-border-light);
      border-radius: 8px;
      background: var(--sero-card-bg);
      box-shadow: var(--shadow-xl);
      padding: 10px;
      transform: translateX(-50%);
      animation: confirmIn 0.14s ease-out;
    }

    .status-confirm-popover p {
      margin: 0 0 9px;
      color: var(--sero-text-primary);
      font-size: 0.74rem;
      font-weight: 800;
      line-height: 1.5;
      text-align: center;
      white-space: normal;
    }

    .status-confirm-actions {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .confirm-btn {
      min-height: 28px;
      border-radius: 7px;
      border: 1px solid transparent;
      flex: 1;
      font-family: var(--sero-font);
      font-size: 0.7rem;
      font-weight: 800;
      cursor: pointer;
      transition: background var(--t-fast), border-color var(--t-fast), color var(--t-fast);
    }

    .confirm-btn--primary {
      background: var(--sero-primary);
      color: var(--sero-card-bg);
    }

    .confirm-btn--primary:hover {
      background: var(--sero-primary-dark);
    }

    .confirm-btn--secondary {
      background: var(--sero-card-bg);
      color: var(--sero-text-primary);
      border-color: var(--sero-border);
    }

    .confirm-btn--secondary:hover {
      background: var(--sero-surface-2);
      border-color: var(--sero-border-strong);
    }

    @keyframes confirmIn {
      from {
        opacity: 0;
        transform: translateX(-50%) translateY(-4px) scale(0.96);
      }
      to {
        opacity: 1;
        transform: translateX(-50%) translateY(0) scale(1);
      }
    }
  `],
})
export class StatusTogglePillComponent {
  @Input() isActive = false;
  @Input() activeLabel = 'فعال';
  @Input() inactiveLabel = 'غير فعال';
  @Input() activateMessage = 'هل تريد تفعيل العنصر؟';
  @Input() deactivateMessage = 'هل تريد إلغاء التفعيل؟';
  @Output() statusChange = new EventEmitter<boolean>();

  confirmationOpen = false;

  get ariaLabel(): string {
    const nextLabel = this.isActive ? this.inactiveLabel : this.activeLabel;
    return `الحالة الحالية: ${this.isActive ? this.activeLabel : this.inactiveLabel}. اضغط لتغيير الحالة إلى ${nextLabel}`;
  }

  openConfirmation(event: Event): void {
    event.stopPropagation();
    this.confirmationOpen = true;
  }

  confirmChange(event: Event): void {
    event.stopPropagation();
    this.confirmationOpen = false;
    this.statusChange.emit(!this.isActive);
  }

  cancelChange(event: Event): void {
    event.stopPropagation();
    this.confirmationOpen = false;
  }

  @HostListener('document:click')
  closeConfirmation(): void {
    this.confirmationOpen = false;
  }

  @HostListener('document:keydown.escape')
  closeConfirmationOnEscape(): void {
    this.confirmationOpen = false;
  }
}
