import { Component, signal } from '@angular/core';
import { ServicePageShell } from '../components/service-page-shell/service-page-shell';

type City = 'makkah' | 'madina';
type Tab = 'criteria' | 'specific';

@Component({
  selector: 'hotel-service-page',
  standalone: true,
  imports: [ServicePageShell],
  templateUrl: './hotel-service.html',
  styleUrl: '../shared/ws-hotel-service.css',
})
export class HotelServicePage {
  readonly activeCity = signal<City>('makkah');
  readonly activeTab = signal<Tab>('criteria');

  switchCity(city: City): void {
    this.activeCity.set(city);
    this.activeTab.set('criteria');
  }

  switchTab(tab: Tab): void {
    this.activeTab.set(tab);
  }
}
