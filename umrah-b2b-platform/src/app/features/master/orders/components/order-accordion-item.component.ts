import {
  ChangeDetectionStrategy, Component, input, output, signal, computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RequestModel } from '../orders.model';

const statusConfig: Record<string, { classes: string; icon: string; label: string }> = {
  approved:           { classes: 'status-approved',   icon: 'check_circle',    label: 'Approved' },
  approvedbymanager:  { classes: 'status-approved',   icon: 'check_circle',    label: 'Approved' },
  pending:            { classes: 'status-pending',     icon: 'schedule',        label: 'Pending' },
  rejected:           { classes: 'status-rejected',    icon: 'cancel',          label: 'Rejected' },
  new:                { classes: 'status-new',         icon: 'bolt',            label: 'New' },
  completed:          { classes: 'status-completed',   icon: 'flag',            label: 'Completed' },
};

@Component({
  selector: 'order-accordion-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: `
    <div class="accordion-card" [class.is-open]="isOpen()">
      <!-- Header row -->
      <div class="accordion-header" (click)="toggle()">
        <!-- Col 1: Request info -->
        <div class="col-request">
          <div class="request-id-box">
            <span class="material-icons-round id-icon">work</span>
            <span class="id-text">#{{ request().Id }}</span>
          </div>
          <div class="request-meta">
            <div class="request-title">{{ request().Title }}</div>
            <div class="request-code">{{ request().PackageCode }}</div>
          </div>
        </div>

        <!-- Col 2: Dates + passengers -->
        <div class="col-dates">
          <div class="date-row">
            <span class="material-icons-round date-icon">calendar_today</span>
            <span class="date-text">{{ request().StartDate | date:'dd MMM yyyy' }}</span>
            <span class="date-sep">→</span>
            <span class="date-text">{{ request().EndDate | date:'dd MMM yyyy' }}</span>
          </div>
          <div class="pax-row">
            <span class="material-icons-round pax-icon">group</span>
            <span class="pax-text">{{ request().PassengerCount }} passengers · {{ request().RequestedQuantity }} pkg</span>
          </div>
        </div>

        <!-- Col 3: Status + actions -->
        <div class="col-status">
          <span class="status-badge" [ngClass]="statusCfg().classes">
            <span class="material-icons-round status-icon">{{ statusCfg().icon }}</span>
            {{ statusCfg().label }}
          </span>
          @if (unreadMessages() > 0) {
            <button class="chat-btn has-unread" (click)="$event.stopPropagation(); chatRequested.emit(request())">
              <span class="material-icons-round">chat</span>
              <span class="unread-badge">{{ unreadMessages() }}</span>
            </button>
          } @else {
            <button class="chat-btn" (click)="$event.stopPropagation(); chatRequested.emit(request())">
              <span class="material-icons-round">chat</span>
            </button>
          }
          <span class="material-icons-round chevron" [class.rotated]="isOpen()">expand_more</span>
        </div>
      </div>

      <!-- Body (lazy) -->
      @if (isOpen()) {
        <div class="accordion-body">
          <ng-content />
        </div>
      }
    </div>
  `,
  styles: [`
    .accordion-card {
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
      transition: box-shadow 0.2s;
    }
    .accordion-card.is-open { box-shadow: 0 4px 16px rgba(0,0,0,.08); }

    .accordion-header {
      display: grid;
      grid-template-columns: 1fr 1fr auto;
      gap: 16px;
      align-items: center;
      padding: 18px 24px;
      cursor: pointer;
      user-select: none;
    }
    .accordion-header:hover { background: #f9fafb; }

    /* Col 1 */
    .col-request { display: flex; align-items: center; gap: 12px; }
    .request-id-box {
      display: flex; align-items: center; gap: 6px;
      background: #e8f5e9; color: #2e7d32;
      border-radius: 8px; padding: 8px 12px;
      flex-shrink: 0;
    }
    .id-icon { font-size: 16px; }
    .id-text { font-size: 14px; font-weight: 700; }
    .request-meta { display: flex; flex-direction: column; gap: 2px; }
    .request-title { font-size: 14px; font-weight: 600; color: #111827; }
    .request-code { font-size: 12px; color: #6b7280; }

    /* Col 2 */
    .col-dates { display: flex; flex-direction: column; gap: 6px; }
    .date-row, .pax-row { display: flex; align-items: center; gap: 6px; }
    .date-icon, .pax-icon { font-size: 14px; color: #9ca3af; }
    .date-text { font-size: 13px; color: #374151; }
    .date-sep { font-size: 12px; color: #9ca3af; }
    .pax-text { font-size: 12px; color: #6b7280; }

    /* Col 3 */
    .col-status { display: flex; align-items: center; gap: 10px; }
    .status-badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 5px 10px; border-radius: 20px;
      font-size: 12px; font-weight: 600; white-space: nowrap;
    }
    .status-icon { font-size: 14px; }
    .status-approved   { background: #f0fdf4; color: #166534; }
    .status-pending    { background: #fffbeb; color: #92400e; }
    .status-rejected   { background: #fef2f2; color: #991b1b; }
    .status-new        { background: #eff6ff; color: #1e40af; }
    .status-completed  { background: #faf5ff; color: #6b21a8; }

    .chat-btn {
      position: relative;
      background: none; border: 1px solid #e5e7eb;
      border-radius: 8px; padding: 6px 8px;
      cursor: pointer; color: #6b7280;
      display: flex; align-items: center;
      transition: all 0.15s;
    }
    .chat-btn:hover { background: #f3f4f6; color: #374151; }
    .chat-btn.has-unread { border-color: var(--sero-primary, #3a472a); color: var(--sero-primary, #3a472a); }
    .unread-badge {
      position: absolute; top: -6px; right: -6px;
      background: #ef4444; color: #fff;
      font-size: 10px; font-weight: 700;
      min-width: 16px; height: 16px;
      border-radius: 8px; display: flex; align-items: center; justify-content: center;
      padding: 0 3px;
    }
    .chat-btn .material-icons-round { font-size: 18px; }

    .chevron {
      font-size: 20px; color: #9ca3af;
      transition: transform 0.2s;
    }
    .chevron.rotated { transform: rotate(180deg); }

    .accordion-body {
      border-top: 1px solid #f3f4f6;
      padding: 0;
    }
  `],
})
export class OrderAccordionItemComponent {
  request = input.required<RequestModel>();
  unreadMessages = input<number>(0);
  opened = output<number>();
  chatRequested = output<RequestModel>();

  isOpen = signal(false);

  statusCfg = computed(() => {
    const key = (this.request().StatusName ?? '').toLowerCase().replace(/\s/g, '');
    return statusConfig[key] ?? { classes: 'status-pending', icon: 'help', label: this.request().StatusName };
  });

  toggle() {
    const opening = !this.isOpen();
    this.isOpen.set(opening);
    if (opening) {
      this.opened.emit(this.request().Id!);
    }
  }
}
