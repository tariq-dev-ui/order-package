import { Component, computed, effect, inject, input, output, signal, ViewChild, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminAPIClient, AgentModel, CityData, CountryData, RegionModel } from 'src/app/services/admin.api.client';
import { debounceTime, distinctUntilChanged, switchMap, tap, catchError, finalize } from 'rxjs/operators';
import { Subject, of, forkJoin, Observable } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { AgentDetailsComponent } from 'src/app/pages/agents-list/agent-details/agent-details.component';
import { dropdownSearchListComponent, SelectOption } from 'src/app/components/dropdown-search-list/dropdown-search-list.component';
import { MultiItemsSelectorComponent, Item } from 'src/app/components/multi-items-selector/multi-items-selector.component';
import { SingleItemSelectorComponent, Item as SingleItem } from 'src/app/components/single-item-selector/single-item-selector.component';
import { LoadingSpinnerComponent } from 'src/app/components/loading-spinner/loading-spinner';
import { CoreService } from 'src/app/services/core.service';

@Component({
  selector: 'app-multi-agent-selector',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatTooltipModule,
    TranslateModule,
    dropdownSearchListComponent,
    MultiItemsSelectorComponent,
    SingleItemSelectorComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './multi-agent-selector.component.html',
  styleUrl: './multi-agent-selector.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultiAgentSelectorComponent implements OnInit {
  private adminApiClient = inject(AdminAPIClient);
  private dialog = inject(MatDialog);
  private coreService = inject(CoreService);
  private lang = this.coreService.getLanguage();

  // Inputs
  initialSelection = input<number[]>([], { alias: 'selectedUsers' });

  // Outputs
  selectionChanged = output<number[]>();

  // Data Signals
  countries = signal<CountryData[]>([]);
  regions = signal<RegionModel[]>([]);
  cities = signal<CityData[]>([]);
  
  availableAgents = signal<AgentModel[]>([]);
  totalAgentsCount = signal<number>(0);
  
  selectedAgents = signal<AgentModel[]>([]);

  // Computed options for dropdowns
  countryOptions = computed<SelectOption[]>(() => 
    this.countries().map(c => ({ id: c.CountryID!, label: c.TitleEnglish ?? c.Title ?? '' }))
  );
  regionOptions = computed<SelectOption[]>(() => 
    this.regions().map(r => ({ id: r.RegionID!, label: r.TitleEnglish ?? r.Title ?? '' }))
  );
  cityOptions = computed<SelectOption[]>(() => 
    this.cities().map(c => ({ id: c.CityID!, label: c.NameEn ?? c.Name ?? '' }))
  );

  // Computed items for multi-items-selector
  availableItems = computed<Item[]>(() =>
    this.availableAgents().map(agent => ({
      id: agent.AgentID!,
      title: agent.AgentName || '',
      subtitle: agent.AgentEmail || ''
    }))
  );

  // Computed selected items for multi-items-selector: only selected agents that are currently available
  selectedItems = computed<Item[]>(() => {
    const availableIds = new Set(this.availableAgents().map(a => a.AgentID));
    return this.selectedAgents()
      .filter(agent => availableIds.has(agent.AgentID))  // Only include if in current availableAgents
      .map(agent => ({
        id: agent.AgentID!,
        title: agent.AgentName || '',
        subtitle: agent.AgentEmail || ''
      }));
  });
  
  // Filter Signals
  selectedCountryId = signal<number | undefined>(undefined);
  selectedRegionId = signal<number | undefined>(undefined);
  selectedCityId = signal<number | undefined>(undefined);

  // Main Agent filter (single-item-selector, server-side)
  masterAgentFilterItems = signal<SingleItem[]>([]);
  masterAgentFilterTotalCount = signal<number>(0);
  isMasterAgentFilterLoading = signal<boolean>(false);
  masterAgentFilterSelectedItem = signal<SingleItem | null>(null);
  readonly masterAgentFilterPageSize = 10;
  private masterAgentFilterPageIndex = 0;
  private masterAgentFilterSearchText = '';
  selectedMasterAgentId = signal<number | undefined>(undefined);

  // Has Main Agent filter
  readonly hasMasterAgentOptions = signal<SelectOption[]>([
    { id: 'true', label: 'Has Main Agent' },
    { id: 'false', label: 'No Main Agent' },
  ]);
  readonly isHasMasterAgentLoading = signal(false);
  selectedHasMasterAgentId = signal<string | null>(null);
  selectedHasMasterAgent = signal<boolean | undefined>(undefined);
  
  searchQuery = new FormControl('');
  pageIndex = signal<number>(0);
  pageSize = signal<number>(10);

  // Loading States
  isLoadingCountries = signal<boolean>(false);
  isLoadingRegions = signal<boolean>(false);
  isLoadingCities = signal<boolean>(false);
  isLoadingAgents = signal<boolean>(false);
  isLoadingDetails = signal<boolean>(false);

  // Initial load tracking
  initialAgentsLoaded = signal<boolean>(false);

  // Selected Agents Table
  displayedColumns: string[] = ['avatar', 'name', 'email', 'country', 'city', 'actions'];
  dataSource = new MatTableDataSource<AgentModel>([]);
  
  @ViewChild('selectedPaginator') selectedPaginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor() {
    // Handle Search Debounce
    this.searchQuery.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.pageIndex.set(0); // Reset page on search
      this.loadAgents();
    });

    // Effect to update table data source when selected agents change
    effect(() => {
      const agents = this.selectedAgents();
      this.dataSource.data = agents;
      if (this.selectedPaginator) {
        this.dataSource.paginator = this.selectedPaginator;
      }
      // Note: sort is set in ngAfterViewInit, no need to set it here
      // Emit changes
      this.selectionChanged.emit(agents.map(a => a.AgentID!));
    });

    // Effect to load initial selection
    effect(() => {
      const ids = this.initialSelection();
      if (ids.length > 0 && this.selectedAgents().length === 0 && !this.isLoadingDetails() && !this.initialAgentsLoaded()) {
        this.loadInitialAgents(ids);
        this.initialAgentsLoaded.set(true);
      }
    }, { allowSignalWrites: true });
  }

  ngOnInit() {
    this.loadCountries();
    this.loadAgents();
    this.loadMasterAgentFilterItems();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.selectedPaginator;
    this.dataSource.sort = this.sort;
    
    // Configure sort data accessor for custom sorting
    this.dataSource.sortingDataAccessor = (data: AgentModel, sortHeaderId: string): string | number => {
      switch (sortHeaderId) {
        case 'name': return data.AgentName || '';
        case 'email': return data.AgentEmail || '';
        case 'country': return data.CountryName || '';
        case 'city': return data.CityName || '';
        default: return '';
      }
    };
  }

  // --- Data Loading ---

  loadCountries() {
    this.isLoadingCountries.set(true);
    this.adminApiClient.getCountriesLookup({ culture: this.lang }).subscribe({
      next: (data) => {
        this.countries.set(data);
        this.isLoadingCountries.set(false);
      },
      error: () => this.isLoadingCountries.set(false)
    });
  }

  loadRegions(countryId: number) {
    this.isLoadingRegions.set(true);
    this.adminApiClient.getRegionsLookup({ countryID: countryId, culture: this.lang, filter: '' }).subscribe({
      next: (data) => {
        this.regions.set(data);
        this.isLoadingRegions.set(false);
      },
      error: () => this.isLoadingRegions.set(false)
    });
  }

  loadCities(countryId: number, regionId?: number) {
    this.isLoadingCities.set(true);
    this.adminApiClient.getCitiesLookup({ countryID: countryId, regionID: regionId, culture: this.lang, filter: '' }).subscribe({
      next: (data) => {
        this.cities.set(data);
        this.isLoadingCities.set(false);
      },
      error: () => this.isLoadingCities.set(false)
    });
  }

  loadAgents() {
    this.isLoadingAgents.set(true);
    const filterText = this.searchQuery.value || '';
    const countryId = this.selectedCountryId();
    const cityId = this.selectedCityId();
    
    // Note: API does not support CityID filtering directly.
    // We will filter by Country and Text, and if City is selected, we might need to filter client-side
    // or accept that the list shows all agents in the country matching the text.
    // Given the requirement "reload from backend with updated city filter", 
    // but the API signature provided lacks cityID, we proceed with available params.
    
    const masterAgentId = this.selectedMasterAgentId();
    const hasMasterAgent = this.selectedHasMasterAgent();

    const params = {
      pageIndex: this.pageIndex(),
      pageSize: this.pageSize(),
      filterText: filterText,
      countryID: countryId,
      masterAgentId,
      hasMasterAgent,
    };

    // Parallel call for list and count
    forkJoin({
      list: this.adminApiClient.getAgentList(params),
      count: this.adminApiClient.getAgentListCount({
        countryID: countryId,
        filterText: filterText,
        masterAgentId,
        hasMasterAgent,
      })
    }).pipe(
      finalize(() => this.isLoadingAgents.set(false))
    ).subscribe({
      next: ({ list, count }) => {
        let agents = list;
        let total = count;
        // Client-side filtering for City if selected (Best effort)
        if (cityId) {
           agents = agents.filter(a => a.CityID === cityId);
           // We can't easily adjust total count for server-side pagination without fetching all
           // So we keep the total count as returned by server (or maybe hide it?)
           // For now, we'll just show the filtered list.
        }
        this.availableAgents.set(agents);
        this.totalAgentsCount.set(total);
      },
      error: (err) => console.error('Error loading agents', err)
    });
  }


  loadInitialAgents(ids: number[]) {
    this.isLoadingDetails.set(true);
    const requests = ids.map(id => this.adminApiClient.getAgent({ agentID: id }));
    
    forkJoin(requests).pipe(
      finalize(() => this.isLoadingDetails.set(false))
    ).subscribe({
      next: (agents) => {
        // Filter out any undefined/null responses if any
        const validAgents = agents.filter(a => !!a) as AgentModel[];
        this.selectedAgents.set(validAgents);
      },
      error: (err) => console.error('Error loading initial agents', err)
    });
  }


  // --- Main Agent Filter ---

  loadMasterAgentFilterItems() {
    this.isMasterAgentFilterLoading.set(true);
    forkJoin({
      list: this.adminApiClient
        .getAgentList({ pageIndex: this.masterAgentFilterPageIndex, pageSize: this.masterAgentFilterPageSize, filterText: this.masterAgentFilterSearchText })
        .pipe(catchError(() => of([] as AgentModel[]))),
      count: this.adminApiClient
        .getAgentListCount({ filterText: this.masterAgentFilterSearchText })
        .pipe(catchError(() => of(0))),
    })
      .pipe(finalize(() => this.isMasterAgentFilterLoading.set(false)))
      .subscribe(({ list, count }) => {
        this.masterAgentFilterItems.set(
          (list ?? []).map((a) => ({
            id: a.AgentID ?? 0,
            title: a.AgentName ?? '',
            subtitle: [a.CountryName, a.CityName].filter(Boolean).join(' — ') || undefined,
            avatar: a.LogoImageLocation || '/IMG/logo.png',
          }))
        );
        this.masterAgentFilterTotalCount.set(count ?? 0);
      });
  }

  onMasterAgentFilterSearch(query: string) {
    this.masterAgentFilterSearchText = query ?? '';
    this.masterAgentFilterPageIndex = 0;
    this.loadMasterAgentFilterItems();
  }

  onMasterAgentFilterPageChange(event: PageEvent) {
    this.masterAgentFilterPageIndex = event.pageIndex;
    this.loadMasterAgentFilterItems();
  }

  onMasterAgentFilterSelectionChange(item: SingleItem | null) {
    this.masterAgentFilterSelectedItem.set(item);
    const id = item ? (typeof item.id === 'number' ? item.id : Number(item.id)) : undefined;
    this.selectedMasterAgentId.set(id);
    this.pageIndex.set(0);
    this.loadAgents();
  }

  onHasMasterAgentSelected(option: SelectOption | null) {
    this.selectedHasMasterAgentId.set(option ? option.id as string : null);
    this.selectedHasMasterAgent.set(option ? option.id === 'true' : undefined);
    this.pageIndex.set(0);
    this.loadAgents();
  }

  // --- Event Handlers ---
  onCountryChange(countryId: string | number | null | undefined) {
    const id = countryId === null || countryId === undefined ? undefined : typeof countryId === 'string' ? parseInt(countryId, 10) : countryId;
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

  onRegionChange(regionId: string | number | null | undefined) {
    const id = regionId === null || regionId === undefined ? undefined : typeof regionId === 'string' ? parseInt(regionId, 10) : regionId;
    this.selectedRegionId.set(id);
    this.selectedCityId.set(undefined);
    
    const countryId = this.selectedCountryId();
    if (countryId) {
      this.loadCities(countryId, id);
    }
  }

  onCityChange(cityId: string | number | null | undefined) {
    const id = cityId === null || cityId === undefined ? undefined : typeof cityId === 'string' ? parseInt(cityId, 10) : cityId;
    this.selectedCityId.set(id);
    this.pageIndex.set(0);
    this.loadAgents();
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadAgents();
  }

  // --- Selection Management ---

  isAgentSelected(agent: AgentModel): boolean {
    return this.selectedAgents().some(a => a.AgentID === agent.AgentID);
  }

  toggleAgent(agent: AgentModel) {
    if (this.isAgentSelected(agent)) {
      this.removeAgent(agent);
    } else {
      this.addAgent(agent);
    }
  }

  addAgent(agent: AgentModel) {
    if (!this.isAgentSelected(agent)) {
      this.selectedAgents.update(current => [...current, agent]);
    }
  }

  removeAgent(agent: AgentModel) {
    this.selectedAgents.update(current => current.filter(a => a.AgentID !== agent.AgentID));
  }

  viewAgentDetails(agent: AgentModel) {
     var dialogRef = this.dialog.open(AgentDetailsComponent, {
      data: { agentId: agent.AgentID },
      width: '1200px',
      disableClose: true,
    });
  }

  // Multi-items-selector event handlers
  onSelectionChange(items: Item[]) {
    // Map selected items back to agents and update selectedAgents
    // Since items are from availableAgents, we can directly map
    const selectedAgents = items.map(item => 
      this.availableAgents().find(agent => agent.AgentID === item.id)
    ).filter(agent => agent !== undefined) as AgentModel[];
    
    // Preserve any previously selected agents not in current availableAgents
    const preservedAgents = this.selectedAgents().filter(agent => 
      !this.availableAgents().some(available => available.AgentID === agent.AgentID)
    );
    
    this.selectedAgents.set([...preservedAgents, ...selectedAgents]);
  }

  onSearchChange(query: string) {
    this.searchQuery.setValue(query);
  }

}
