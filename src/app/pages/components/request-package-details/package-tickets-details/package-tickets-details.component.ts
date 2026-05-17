import { Component, Input, inject } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SeroPackageTicketModel } from 'src/app/services/admin.api.client';

@Component({
  selector: 'package-tickets-details',
  imports: [TranslateModule],
  templateUrl: './package-tickets-details.component.html',
})
export class PackageTicketsDetailsComponent {
  private readonly translate = inject(TranslateService);

  @Input({ required: true }) Tickets: SeroPackageTicketModel[] | null | undefined;

  private isArabicLanguage(): boolean {
    const currentLang = this.translate.currentLang || this.translate.getDefaultLang() || 'en';
    return currentLang.startsWith('ar');
  }

  private getTicketArrow(ticket: SeroPackageTicketModel): string {
    const normalizedTripType = (ticket.TripType ?? '').toLowerCase().replace(/\s+/g, '');
    if (normalizedTripType === 'roundtrip') {
      return '↔';
    }
    return this.isArabicLanguage() ? '←' : '→';
  }

  getTicketRouteLabel(ticket: SeroPackageTicketModel): string {
    const sourceLabel = ticket.SourceCityName || this.translate.instant('Source');
    const destinationLabel = ticket.DestinationCityName || this.translate.instant('Destination');
    const arrow = this.getTicketArrow(ticket);
    return `${sourceLabel} ${arrow} ${destinationLabel}`;
  }

  getTicketAirlineName(ticket: SeroPackageTicketModel): string {
    return this.isArabicLanguage()
      ? (ticket.AirlineCompanyNameAr ?? ticket.AirlineCompanyNameEn ?? '')
      : (ticket.AirlineCompanyNameEn ?? ticket.AirlineCompanyNameAr ?? '');
  }

  private normalizeTicketMetaKey(value?: string | null): string {
    const normalized = (value ?? '').toLowerCase().replace(/\s+/g, '');
    const map: Record<string, string> = {
      oneway: 'OneWay',
      roundtrip: 'RoundTrip',
      economy: 'Economy',
      business: 'Business',
      first: 'First',
    };
    return map[normalized] ?? (value ?? '');
  }

  getTicketMetaLabel(value?: string | null): string {
    if (!value) {
      return this.translate.instant('Not set');
    }
    const normalizedKey = this.normalizeTicketMetaKey(value);
    const localizedNormalized = this.translate.instant(normalizedKey);
    if (localizedNormalized !== normalizedKey) {
      return localizedNormalized;
    }
    const localizedOriginal = this.translate.instant(value);
    return localizedOriginal !== value ? localizedOriginal : value;
  }
}
