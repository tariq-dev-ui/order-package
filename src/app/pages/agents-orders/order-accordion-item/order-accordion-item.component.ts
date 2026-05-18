import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'order-accordion-item',
  imports: [CommonModule, TranslateModule],
  templateUrl: './order-accordion-item.component.html',
  styleUrl: './order-accordion-item.component.scss'
})
export class OrderAccordionItemComponent {
  private readonly translate = inject(TranslateService);
  @Input() requestId?: number;
  @Input() passengers?: number;
  @Input() packageTitle: string = '';
  @Input() addDates: string = '';
  @Input() startEndDates: string = '';
  @Input() priority: 'high' | 'medium' | 'low' = 'medium';
  @Input() status: string = '';
  @Input() unreadMessages: number = 0;
  @Input() agentName: string = '';
  @Input() agentCountry: string = '';
  @Output() expansionChange = new EventEmitter<boolean>();
  @Output() chatRequested = new EventEmitter<number>();

  openChat(event: Event, requestId?: number) {
    event.stopPropagation();
    if (requestId != null) {
      this.chatRequested.emit(requestId);
    }
  }

  private _open = false;
  
  get open(): boolean {
    return this._open;
  }
  
  set open(value: boolean) {
    if (this._open !== value) {
      this._open = value;
      this.expansionChange.emit(value);
    }
  }

  openNotifications(event: Event) {
    event.stopPropagation();
    alert(`${this.translate.instant('Open notifications for booking:')} ${this.requestId}`);
  }


//   readonly statusConfig: { [key: string]: { classes: string; icon: string; } } = {
//   approved: {
//     classes: 'bg-green-100 text-green-700',
//     icon: 'fas fa-check-circle'
//   },
//   pending: {
//     classes: 'bg-yellow-100 text-yellow-700',
//     icon: 'fas fa-hourglass-half'
//   },
//   rejected: {
//     classes: 'bg-red-100 text-red-700',
//     icon: 'fas fa-times-circle'
//   },
//   new: {
//     classes: 'bg-blue-100 text-blue-700',
//     icon: 'fas fa-star'
//   }
// };

// getStatusClasses(status: string): string {
//   const normalized = (status || '').toLowerCase();
//   const config = this.statusConfig[normalized];
//   return `text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 font-medium ${
//     config?.classes || 'bg-gray-100 text-gray-700'
//   }`;
// }

// getStatusIcon(status: string): string {
//   const normalized = (status || '').toLowerCase();
//   return this.statusConfig[normalized]?.icon || 'fas fa-info-circle';
// }

readonly statusConfig: { [key: string]: { classes: string; icon: string; } } = {
  approved: {
    classes: 'bg-green-50 text-green-800 border border-green-100 shadow-green-100/20',
    icon: 'fas fa-circle-check'  // New modern check icon
  },
  approvedbymanager: {
    classes: 'bg-green-50 text-green-800 border border-green-100 shadow-green-100/20',
    icon: 'fas fa-circle-check'  // New modern check icon
  },
  pending: {
    classes: 'bg-amber-50 text-amber-800 border border-amber-100 shadow-amber-100/20',
    icon: 'fas fa-clock'  // Simpler clock icon
  },
  rejected: {
    classes: 'bg-red-50 text-red-800 border border-red-100 shadow-red-100/20',
    icon: 'fas fa-xmark-circle'  // More modern xmark icon
  },
  new: {
    classes: 'bg-blue-50 text-blue-800 border border-blue-100 shadow-blue-100/20',
    icon: 'fas fa-bolt'  // More modern "new" indicator
  },
  completed: {
    classes: 'bg-purple-50 text-purple-800 border border-purple-100 shadow-purple-100/20',
    icon: 'fas fa-flag-checkered'  // For completion status
  }
};

getStatusClasses(status: string): string {
  const normalized = (status || '').toLowerCase();
  
  const config = this.statusConfig[normalized];
  return `inline-flex items-center text-xs leading-5 font-medium px-3 py-1.5 rounded-full shadow-xs transition-all duration-150 ${
    config?.classes || 'bg-primary-50 text-primary-800 border border-primary-100 shadow-primary-100/20'
  }`;
}

getStatusIcon(status: string): string {
  const normalized = (status || '').toLowerCase();
  return this.statusConfig[normalized]?.icon || 'fas fa-circle-info';  // Updated info icon
}


// readonly statusConfig : { [key: string]: { classes: string; icon: string; } } = {
//  approved: {
//     classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
//     icon: 'fas fa-check-circle' // Modern check
//   },
//   pending: {
//     classes: 'bg-amber-50 text-amber-700 border-amber-200',
//     icon: 'fas fa-clock' // Clean clock
//   },
//   rejected: {
//     classes: 'bg-rose-50 text-rose-700 border-rose-200',
//     icon: 'fas fa-times-circle' // Clear rejection
//   },
//   new: {
//     classes: 'bg-blue-50 text-blue-700 border-blue-200',
//     icon: 'fas fa-certificate' // Better "new" indicator
//   },
//   completed: {
//     classes: 'bg-violet-50 text-violet-700 border-violet-200',
//     icon: 'fas fa-check-double' // Completion marker
//   }
// };

// getStatusClasses(status: string): string {
//   const normalized = (status || '').toLowerCase();
//   const config = this.statusConfig[normalized];
//   return `inline-flex items-center text-[0.75rem] leading-none font-medium px-3 py-2 rounded-full border ${
//     config?.classes || 'bg-gray-50/80 text-gray-700 border-gray-200'
//   }`;
// }

// getStatusIcon(status: string): string {
//   const normalized = (status || '').toLowerCase();
//   return this.statusConfig[normalized]?.icon || 'ph ph-info-fill'; // Default Phosphor icon
// }
}
