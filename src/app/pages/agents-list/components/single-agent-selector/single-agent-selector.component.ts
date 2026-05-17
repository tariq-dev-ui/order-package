import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { PageEvent } from '@angular/material/paginator';

import {
  AdminAPIClient,
  AgentModel,
  CityData,
  CountryData,
  RegionModel,
} from 'src/app/services/admin.api.client';
import {
  Item,
  SingleItemSelectorComponent,
} from 'src/app/components/single-item-selector/single-item-selector.component';
import {
  dropdownSearchListComponent,
  SelectOption,
} from 'src/app/components/dropdown-search-list/dropdown-search-list.component';
import { CoreService } from 'src/app/services/core.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-single-agent-selector',
  imports: [CommonModule, SingleItemSelectorComponent, dropdownSearchListComponent, TranslateModule],
  templateUrl: './single-agent-selector.component.html',
  styleUrl: './single-agent-selector.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SingleAgentSelectorComponent {
  private readonly api = inject(AdminAPIClient);
  private readonly destroyRef = inject(DestroyRef);
  private readonly core = inject(CoreService);
  private readonly translate = inject(TranslateService);
  private readonly lang = this.core.getLanguage();

  // UI inputs
  readonly label = input<string | undefined>(this.translate.instant('Select Agent'));
  readonly placeholder = input<string>(this.translate.instant('Choose an agent'));
  readonly icon = input<string | undefined>('fas fa-users');
  readonly enablePagination = input<boolean>(true);

  // Selection input
  readonly selectedAgentId = input<number | null>(null);

  // Pre-filter: set an initial country filter on first load
  readonly initialCountryId = input<number | undefined>(undefined);

  // Outputs
  readonly agentIdChange = output<number | undefined>();
  readonly agentChange = output<AgentModel | null>();

  // Data
  private readonly agents = signal<AgentModel[]>([]);
  readonly totalAgentsCount = signal<number>(0);

  // Loading
  readonly isLoadingAgents = signal<boolean>(false);

  // Query state
  private readonly searchText = signal<string>('');
  private readonly pageIndex = signal<number>(0);
  readonly pageSize = signal<number>(10);

  // Location filters (same shape as multi-agent-selector)
  private readonly countries = signal<CountryData[]>([]);
  private readonly regions = signal<RegionModel[]>([]);
  private readonly cities = signal<CityData[]>([]);

  readonly selectedCountryId = signal<number | undefined>(undefined);
  readonly selectedRegionId = signal<number | undefined>(undefined);
  readonly selectedCityId = signal<number | undefined>(undefined);

  readonly isLoadingCountries = signal<boolean>(false);
  readonly isLoadingRegions = signal<boolean>(false);
  readonly isLoadingCities = signal<boolean>(false);

  readonly countryOptions = computed<SelectOption[]>(() =>
    (this.countries() ?? [])
      .filter((c) => c.CountryID != null)
      .map((c) => ({
        id: c.CountryID as number,
        label: c.TitleEnglish ?? c.Title ?? '',
      })),
  );

  readonly regionOptions = computed<SelectOption[]>(() =>
    (this.regions() ?? [])
      .filter((r) => r.RegionID != null)
      .map((r) => ({
        id: r.RegionID as number,
        label: r.TitleEnglish ?? r.Title ?? '',
      })),
  );

  readonly cityOptions = computed<SelectOption[]>(() =>
    (this.cities() ?? [])
      .filter((c) => c.CityID != null)
      .map((c) => ({
        id: c.CityID as number,
        label: c.NameEn ?? c.Name ?? '',
      })),
  );

  // Adapter to selector component
  readonly availableItems = computed<Item[]>(() =>
    this.agents().map((agent) => ({
      id: agent.AgentID ?? 0,
      title: agent.AgentName ?? '',
      subtitle: [agent.CountryName, agent.CityName].filter(Boolean).join(' — ') || undefined,
      avatar: agent.LogoImageLocation || '/IMG/logo.png',
    })),
  );

  readonly selectedItem = signal<Item | null>(null);

  constructor() {
    this.loadCountries();

    const initCountryId = this.initialCountryId();
    if (initCountryId != null) {
      this.selectedCountryId.set(initCountryId);
      this.loadRegions(initCountryId);
      this.loadCities(initCountryId);
    }

    this.loadAgents();

    effect(
      () => {
        const id = this.selectedAgentId();
        if (!id) {
          this.selectedItem.set(null);
          return;
        }

        const existing = this.agents().find((a) => a.AgentID === id);
        if (existing) {
          this.selectedItem.set({
            id: existing.AgentID ?? id,
            title: existing.AgentName ?? '',
            subtitle: [existing.CountryName, existing.CityName].filter(Boolean).join(' — ') || undefined,
            avatar: existing.LogoImageLocation || '/IMG/logo.png',
          });
          return;
        }

        this.api
          .getAgent({ agentID: id })
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (agent) => {
              this.selectedItem.set({
                id: agent.AgentID ?? id,
                title: agent.AgentName ?? '',
                subtitle: [agent.CountryName, agent.CityName].filter(Boolean).join(' — ') || undefined,
                avatar: agent.LogoImageLocation || '/IMG/logo.png',
              });
            },
            error: () => {
              // If the agent cannot be loaded, clear the selection
              this.selectedItem.set(null);
            },
          });
      },
      { allowSignalWrites: true },
    );
  }

  onCountryChange(countryId?: string | number) {
    const id = this.toNumberOrUndefined(countryId);
    this.selectedCountryId.set(id);
    this.selectedRegionId.set(undefined);
    this.selectedCityId.set(undefined);
    this.regions.set([]);
    this.cities.set([]);

    if (id) {
      this.loadRegions(id);
      this.loadCities(id);
    }

    this.pageIndex.set(0);
    this.loadAgents();
  }

  onRegionChange(regionId?: string | number) {
    const id = this.toNumberOrUndefined(regionId);
    this.selectedRegionId.set(id);
    this.selectedCityId.set(undefined);
    this.cities.set([]);

    const countryId = this.selectedCountryId();
    if (countryId) {
      this.loadCities(countryId, id);
    }

    this.pageIndex.set(0);
    this.loadAgents();
  }

  onCityChange(cityId?: string | number) {
    const id = this.toNumberOrUndefined(cityId);
    this.selectedCityId.set(id);
    this.pageIndex.set(0);
    this.loadAgents();
  }

  private toNumberOrUndefined(value?: string | number | null): number | undefined {
    if (value === null || value === undefined) return undefined;
    const num = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(num) ? num : undefined;
  }

  onSearchChange(query: string) {
    this.searchText.set(query ?? '');
    this.pageIndex.set(0);
    this.loadAgents();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadAgents();
  }

  onSelectionChange(item: Item | null) {
    this.selectedItem.set(item);

    const selectedId = item?.id;
    const agentId = typeof selectedId === 'number' ? selectedId : Number(selectedId);

    if (!item) {
      this.agentIdChange.emit(undefined);
      this.agentChange.emit(null);
      return;
    }

    const agent = this.agents().find((a) => a.AgentID === agentId) ?? null;
    this.agentIdChange.emit(agentId);
    this.agentChange.emit(agent);
  }

  private loadAgents() {
    this.isLoadingAgents.set(true);

    const filterText = this.searchText();
    const pageIndex = this.pageIndex();
    const pageSize = this.pageSize();
    const countryID = this.selectedCountryId();
    const cityID = this.selectedCityId();

    forkJoin({
      list: this.api
        .getAgentList({ pageIndex, pageSize, filterText, countryID, cityID })
        .pipe(catchError(() => of([] as AgentModel[]))),
      count: this.api
        .getAgentListCount({ filterText, countryID, cityID })
        .pipe(catchError(() => of(0))),
    })
      .pipe(finalize(() => this.isLoadingAgents.set(false)))
      .subscribe(({ list, count }) => {
        this.agents.set(list ?? []);
        this.totalAgentsCount.set(count ?? 0);
      });
  }

  private loadCountries() {
    this.isLoadingCountries.set(true);
    this.api.getCountriesLookup({ culture: this.lang }).subscribe({
      next: (data) => this.countries.set(data ?? []),
      error: () => this.countries.set([]),
      complete: () => this.isLoadingCountries.set(false),
    });
  }

  private loadRegions(countryId: number) {
    this.isLoadingRegions.set(true);
    this.api
      .getRegionsLookup({ countryID: countryId, culture: this.lang, filter: '' })
      .subscribe({
        next: (data) => this.regions.set(data ?? []),
        error: () => this.regions.set([]),
        complete: () => this.isLoadingRegions.set(false),
      });
  }

  private loadCities(countryId: number, regionId?: number) {
    this.isLoadingCities.set(true);
    this.api
      .getCitiesLookup({ countryID: countryId, regionID: regionId, culture: this.lang, filter: '' })
      .subscribe({
        next: (data) => this.cities.set(data ?? []),
        error: () => this.cities.set([]),
        complete: () => this.isLoadingCities.set(false),
      });
  }
}
