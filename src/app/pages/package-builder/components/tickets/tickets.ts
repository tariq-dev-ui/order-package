import { ChangeDetectionStrategy, Component, Input, OnInit, computed, inject, output, Signal, signal } from '@angular/core';
import { CounterInput } from '../counter-input/counter-input';
import { AirlineCompanyLookupModel, CityData, CountryData } from 'src/app/services/admin.api.client';
import { TicketState } from '../../services/package-builder-state-management-service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MOCK_COUNTRIES, MOCK_CITIES_BY_COUNTRY, MOCK_AIRLINES } from '../../services/package-builder.mock';

@Component({
  selector: 'tickets-step',
  imports: [CounterInput, TranslateModule],
  templateUrl: './tickets.html',
  styleUrl: './tickets.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Tickets implements OnInit {
  private readonly translate = inject(TranslateService);
  private readonly SAUDI_ARABIA_FALLBACK_ID = 1;
  private lastSourceCitiesRequestCountryId?: number;

  readonly nextStep = output<void>();
  readonly prevStep = output<void>();

  @Input() state!: Signal<TicketState>;
  @Input() listState!: Signal<TicketState[]>;
  @Input() addFn!: () => void;
  @Input() removeFn!: (index: number) => void;
  @Input() updateFn!: (key: keyof TicketState, value: TicketState[keyof TicketState]) => void;

  countries = signal<CountryData[]>([]);
  airlineCompanies = signal<AirlineCompanyLookupModel[]>([]);
  sourceCities = signal<CityData[]>([]);
  destinationCities = signal<CityData[]>([]);

  isLoadingCountries = signal<boolean>(false);
  isLoadingAirlineCompanies = signal<boolean>(false);
  isLoadingSourceCities = signal<boolean>(false);
  isLoadingDestinationCities = signal<boolean>(false);

  readonly tripTypes = signal<string[]>(['OneWay', 'RoundTrip']);
  readonly travelClasses = signal<string[]>(['Economy', 'Business', 'First']);
  readonly saudiCountry = computed(() => this.resolveSaudiCountry(this.countries()));

  private get currentCulture(): string {
    return this.translate.currentLang || this.translate.getDefaultLang() || 'en';
  }

  private isArabicLanguage(): boolean {
    return this.currentCulture.startsWith('ar');
  }

  constructor() {
    this.loadCountries();
    this.loadAirlineCompanies();
  }

  ngOnInit(): void {
    const current = this.state();
    if (current.sourceCountryID) {
      this.loadSourceCities(current.sourceCountryID);
    }
    if (current.destinationCountryID) {
      this.loadDestinationCities(current.destinationCountryID);
    }
  }

  private loadCountries() {
    this.isLoadingCountries.set(true);
    this.countries.set(MOCK_COUNTRIES);
    this.enforceSaudiDestination(MOCK_COUNTRIES);
    this.isLoadingCountries.set(false);
  }

  private loadAirlineCompanies() {
    this.isLoadingAirlineCompanies.set(true);
    this.airlineCompanies.set(MOCK_AIRLINES);
    this.isLoadingAirlineCompanies.set(false);
  }

  private resolveSaudiCountry(countries: CountryData[]): CountryData | undefined {
    return countries.find((country) => (country.Code ?? '').toUpperCase() === 'SA')
      ?? countries.find((country) => (country.Code ?? '').toUpperCase() === 'KSA')
      ?? countries.find((country) => (country.TitleEnglish ?? '').toLowerCase().includes('saudi'))
      ?? countries.find((country) => (country.Title ?? '').includes('السعود'))
      ?? countries.find((country) => country.CountryID === this.SAUDI_ARABIA_FALLBACK_ID);
  }

  private enforceSaudiDestination(countries: CountryData[]) {
    const saudi = this.resolveSaudiCountry(countries);
    if (!saudi?.CountryID) {
      const currentDestinationCountryId = this.state().destinationCountryID;
      if (currentDestinationCountryId) {
        this.loadDestinationCities(currentDestinationCountryId);
      }
      return;
    }

    const current = this.state();
    const destinationChanged = current.destinationCountryID !== saudi.CountryID;

    this.updateFn('destinationCountryID', saudi.CountryID);
    this.updateFn('destinationCountryName', saudi.Title ?? saudi.TitleEnglish ?? 'Saudi Arabia');

    if (destinationChanged) {
      this.updateFn('destinationCityID', undefined);
      this.updateFn('destinationCityName', '');
    }

    this.loadDestinationCities(saudi.CountryID);
  }

  private loadSourceCities(countryId?: number) {
    if (!countryId) {
      this.sourceCities.set([]);
      return;
    }
    this.lastSourceCitiesRequestCountryId = countryId;
    this.isLoadingSourceCities.set(true);
    const cities = MOCK_CITIES_BY_COUNTRY[countryId] ?? [];
    const selectedSourceCountryId = this.state().sourceCountryID;
    if (this.lastSourceCitiesRequestCountryId === countryId && selectedSourceCountryId === countryId) {
      this.sourceCities.set(cities);
    }
    this.isLoadingSourceCities.set(false);
  }

  private loadDestinationCities(countryId?: number) {
    if (!countryId) {
      this.destinationCities.set([]);
      return;
    }
    this.isLoadingDestinationCities.set(true);
    this.destinationCities.set(MOCK_CITIES_BY_COUNTRY[countryId] ?? []);
    this.isLoadingDestinationCities.set(false);
  }

  onSourceCountryChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    const id = value === 'undefined' ? undefined : Number(value);
    const country = this.countries().find((item) => item.CountryID === id);

    this.updateFn('sourceCountryID', id);
    this.updateFn('sourceCountryName', country?.Title ?? '');

    this.updateFn('sourceCityID', undefined);
    this.updateFn('sourceCityName', '');

    this.loadSourceCities(id);
  }

  onSourceCityChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    const id = value === 'undefined' ? undefined : Number(value);
    const city = this.sourceCities().find((item) => item.CityID === id);

    this.updateFn('sourceCityID', id);
    this.updateFn('sourceCityName', city?.Name ?? city?.NameEn ?? '');
  }

  onDestinationCountryChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    const id = value === 'undefined' ? undefined : Number(value);
    const country = this.countries().find((item) => item.CountryID === id);

    this.updateFn('destinationCountryID', id);
    this.updateFn('destinationCountryName', country?.Title ?? '');

    this.updateFn('destinationCityID', undefined);
    this.updateFn('destinationCityName', '');

    this.loadDestinationCities(id);
  }

  onDestinationCityChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    const id = value === 'undefined' ? undefined : Number(value);
    const city = this.destinationCities().find((item) => item.CityID === id);

    this.updateFn('destinationCityID', id);
    this.updateFn('destinationCityName', city?.Name ?? city?.NameEn ?? '');
  }

  onTripTypeChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.updateFn('tripType', value === 'undefined' ? '' : value);
  }

  onTravelClassChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.updateFn('travelClass', value === 'undefined' ? '' : value);
  }

  onAirlineChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    const id = value === 'undefined' ? undefined : Number(value);
    const airline = this.airlineCompanies().find((item) => item.AirlineCompanyID === id);
    const displayName = this.getAirlineDisplayName(airline);

    this.updateFn('airlineCompanyID', id);
    this.updateFn('airlineCompanyName', displayName);
    this.updateFn('airlineCompanyNameEn', airline?.NameEn ?? '');
    this.updateFn('airlineCompanyNameAr', airline?.NameAr ?? '');
  }

  getAirlineDisplayName(airline?: AirlineCompanyLookupModel): string {
    const isArabic = this.currentCulture.startsWith('ar');
    return isArabic
      ? (airline?.NameAr ?? airline?.NameEn ?? '')
      : (airline?.NameEn ?? airline?.NameAr ?? '');
  }

  getTicketAirlineName(ticket: TicketState): string {
    if (ticket.airlineCompanyID) {
      const airline = this.airlineCompanies().find((item) => item.AirlineCompanyID === ticket.airlineCompanyID);
      const localized = this.getAirlineDisplayName(airline);
      if (localized) {
        return localized;
      }
    }

    return this.currentCulture.startsWith('ar')
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

  onSeatsChange(value: number) {
    this.updateFn('seatCount', value);
  }

  addRow() {
    this.addFn();
    this.sourceCities.set([]);
    this.enforceSaudiDestination(this.countries());
  }

  removeRow(index: number) {
    this.removeFn(index);
  }

  onSkip() {
    this.nextStep.emit();
  }

  onNext() {
    this.nextStep.emit();
  }

  canGoNext(): boolean {
    return this.listState().length > 0;
  }

  isTicketValid(): boolean {
    const ticket = this.state();
    return !!(
      ticket.sourceCountryID &&
      ticket.sourceCityID &&
      ticket.destinationCountryID &&
      ticket.destinationCityID &&
      ticket.tripType &&
      ticket.travelClass &&
      ticket.seatCount &&
      ticket.seatCount > 0
    );
  }
}
