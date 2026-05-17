import { CommonModule } from '@angular/common';
import { Component, Input, inject, signal } from '@angular/core';
import { MyServiceKind } from '../../my-services.model';
import { MyServicesService } from '../../my-services.service';
import { ServiceOthers } from '../service-others/service-others';

@Component({
  selector: 'service-page-shell',
  standalone: true,
  imports: [CommonModule, ServiceOthers],
  templateUrl: './service-page-shell.html',
})
export class ServicePageShell {
  private readonly myServicesService = inject(MyServicesService);

  @Input({ required: true }) title = '';
  @Input({ required: true }) subtitle = '';
  @Input({ required: true }) iconClass = '';
  @Input() accent: 'primary' | 'emerald' | 'sky' | 'violet' | 'amber' = 'primary';
  @Input() highlights: string[] = [];
  readonly lastLocalAction = signal('');

  headerClass(): string {
    const classMap: Record<typeof this.accent, string> = {
      primary: 'from-primary-50 to-white',
      emerald: 'from-emerald-50 to-white',
      sky: 'from-sky-50 to-white',
      violet: 'from-violet-50 to-white',
      amber: 'from-amber-50 to-white',
    };
    return classMap[this.accent];
  }

  badgeClass(): string {
    const classMap: Record<typeof this.accent, string> = {
      primary: 'bg-primary-100 text-primary-700',
      emerald: 'bg-emerald-100 text-emerald-700',
      sky: 'bg-sky-100 text-sky-700',
      violet: 'bg-violet-100 text-violet-700',
      amber: 'bg-amber-100 text-amber-700',
    };
    return classMap[this.accent];
  }

  iconClassName(): string {
    const classMap: Record<typeof this.accent, string> = {
      primary: 'from-primary-400 to-primary-600',
      emerald: 'from-emerald-400 to-emerald-600',
      sky: 'from-sky-400 to-sky-600',
      violet: 'from-violet-400 to-violet-600',
      amber: 'from-amber-400 to-amber-600',
    };
    return classMap[this.accent];
  }

  highlightChipClass(): string {
    const classMap: Record<typeof this.accent, string> = {
      primary: 'bg-primary-50 text-primary-700 border-primary-100',
      emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
      sky: 'bg-sky-50 text-sky-700 border-sky-100',
      violet: 'bg-violet-50 text-violet-700 border-violet-100',
      amber: 'bg-amber-50 text-amber-700 border-amber-100',
    };
    return classMap[this.accent];
  }

  saveDraft(): void {
    this.myServicesService.saveDraft({ serviceKind: this.resolveServiceKind(), title: this.title }).subscribe((result) => {
      this.lastLocalAction.set(result.message);
    });
  }

  submitService(): void {
    this.myServicesService.submitService({ serviceKind: this.resolveServiceKind(), title: this.title }).subscribe((result) => {
      this.lastLocalAction.set(result.message);
    });
  }

  private resolveServiceKind(): MyServiceKind {
    const normalized = this.title.toLowerCase();
    if (normalized.includes('madina')) return 'madina';
    if (normalized.includes('transport')) return 'transport';
    if (normalized.includes('ticket')) return 'tickets';
    if (normalized.includes('food')) return 'food';
    return 'makkah';
  }
}

