import { Component, signal } from '@angular/core';
import { ServicePageShell } from '../components/service-page-shell/service-page-shell';

@Component({
  selector: 'madina-service-page',
  standalone: true,
  imports: [ServicePageShell],
  templateUrl: './madina-service.html',
})
export class MadinaServicePage {
  activeTab = signal<'criteria' | 'specific'>('criteria');

  switchTab(tab: 'criteria' | 'specific'): void {
    this.activeTab.set(tab);
  }
}
