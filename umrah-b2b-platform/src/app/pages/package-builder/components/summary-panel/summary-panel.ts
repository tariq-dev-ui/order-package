import { Component, inject, Input, Signal } from '@angular/core';
import { FinalDetailsState, FoodState, HotelCountState, HotelState, TicketState, TransportState } from '../../services/package-builder-state-management-service';
import {  DatePipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
@Component({
  selector: 'stepper-summary-panel',
  imports: [DatePipe, TranslateModule],
  templateUrl: './summary-panel.html',
  styleUrl: './summary-panel.css'
})
export class SummaryPanel {
  private readonly translate = inject(TranslateService);

  @Input() makkahHotelListState!: Signal<HotelState[]>;
  @Input() makkahHotelCountState!: Signal<HotelCountState>;
  @Input() madinahHotelListState!: Signal<HotelState[]>;
  @Input() madinahHotelCountState!: Signal<HotelCountState>;
  @Input() foodListState!: Signal<FoodState[]>;
  @Input() transportListState!: Signal<TransportState[]>;
  @Input() ticketListState!: Signal<TicketState[]>;
  @Input() finalDetailsState!: Signal<FinalDetailsState>; // Adjust type as needed

  private isArabicLanguage(): boolean {
    const currentLang = this.translate.currentLang || this.translate.getDefaultLang() || 'en';
    return currentLang.startsWith('ar');
  }

  getTicketAirlineName(ticket: TicketState): string {
    const currentLang = this.translate.currentLang || this.translate.getDefaultLang() || 'en';
    return currentLang.startsWith('ar')
      ? (ticket.airlineCompanyNameAr ?? ticket.airlineCompanyNameEn ?? ticket.airlineCompanyName ?? '')
      : (ticket.airlineCompanyNameEn ?? ticket.airlineCompanyNameAr ?? ticket.airlineCompanyName ?? '');
  }

  private getTicketArrow(tripType?: string): string {
    const normalizedTripType = (tripType ?? '').toLowerCase().replace(/\s+/g, '');
    const isRoundTrip = normalizedTripType === 'roundtrip';

    if (isRoundTrip) {
      return '↔';
    }

    return this.isArabicLanguage() ? '←' : '→';
  }

  formatTicketRoute(sourceCityName: string, destinationCityName: string, tripType?: string): string {
    const arrow = this.getTicketArrow(tripType);
    return `${sourceCityName} ${arrow} ${destinationCityName}`;
  }
  
}
