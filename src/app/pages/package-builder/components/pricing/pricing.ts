import { Component, computed, DestroyRef, inject, Input, OnInit, output, Signal, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import {
  AdminAPIClient,
  CateringPackageModel2,
  HotelPriceDetailModel,
  HotelPricePolicyModel,
  TransPackageModel2,
  TransPackagePriceModel2,
} from '../../../../services/admin.api.client';
import {
  FinalDetailsState,
  FoodState,
  HotelCountState,
  HotelState,
  PricingState,
  TicketState,
  TransportState,
} from '../../services/package-builder-state-management-service';
import { dropdownSearchListComponent, SelectOption } from 'src/app/components/dropdown-search-list/dropdown-search-list.component';

@Component({
  selector: 'pricing-step',
  standalone: true,
  imports: [CommonModule, TranslateModule, dropdownSearchListComponent],
  templateUrl: './pricing.html',
  styleUrl: './pricing.css',
})
export class Pricing implements OnInit {
  @Input() makkahHotelListState!: Signal<HotelState[]>;
  @Input() makkahHotelCountState!: Signal<HotelCountState>;
  @Input() madinahHotelListState!: Signal<HotelState[]>;
  @Input() madinahHotelCountState!: Signal<HotelCountState>;
  @Input() transportListState!: Signal<TransportState[]>;
  @Input() foodListState!: Signal<FoodState[]>;
  @Input() ticketListState!: Signal<TicketState[]>;
  @Input() pricingState!: Signal<PricingState>;

  @Input() updateMakkahHotelPricingAtIndex!: (i: number, val: number | undefined) => void;
  @Input() updateMadinahHotelPricingAtIndex!: (i: number, val: number | undefined) => void;
  @Input() updateTransportPricingAtIndex!: (i: number, val: number | undefined) => void;
  @Input() updateFoodPricingAtIndex!: (i: number, val: number | undefined) => void;
  @Input() updateTicketPricingAtIndex!: (i: number, val: number | undefined) => void;
  @Input() finalDetailsState!: Signal<FinalDetailsState>;
  @Input() updatePricingStateFn!: (p: Partial<PricingState>) => void;
  @Input() updateFinalDetailsFn!: (key: keyof FinalDetailsState, val: any) => void;

  readonly prevStep = output<void>();
  readonly handleSubmitData = output<void>();

  private api = inject(AdminAPIClient);
  private destroyRef = inject(DestroyRef);

  // Policy lists fetched on init
  readonly hotelPolicies = signal<HotelPricePolicyModel[]>([]);
  readonly hotelAllPriceDetails = signal<Map<number, HotelPriceDetailModel[]>>(new Map());
  readonly loadingHotelDetails = signal(false);
  readonly cateringPackages = signal<CateringPackageModel2[]>([]);
  readonly transPackages = signal<TransPackageModel2[]>([]);
  readonly loadingPolicies = signal(false);
  readonly emptyOptions = signal<SelectOption[]>([]);
  readonly falseLoading = signal(false);

  // Per-item option signal caches keyed by index
  private _hotelOptionSignals = new Map<string, Signal<SelectOption[]>>();
  private _transOptionSignals = new Map<number, Signal<SelectOption[]>>();
  private _foodOptionSignals = new Map<number, Signal<SelectOption[]>>();

  getHotelOptionsSignal(city: 'makkah' | 'madinah', idx: number): Signal<SelectOption[]> {
    const key = `${city}_${idx}`;
    if (!this._hotelOptionSignals.has(key)) {
      this._hotelOptionSignals.set(key, computed(() => {
        const hotels = city === 'makkah' ? this.makkahHotelListState() : this.madinahHotelListState();
        const hotel = hotels[idx];
        if (!hotel) return [];
        const packageOptions = this.getFilteredHotelPolicies(hotel).map(item => ({
          id: item.policy.HotelPricePolicyID!,
          label: item.policy.Title ?? '',
          description: `${item.price.toFixed(2)} / room / night`,
        }));
        const original = city === 'makkah' ? this.originalMakkahPrices[idx] : this.originalMadinahPrices[idx];
        if (original != null) {
          return [
            { id: 'current', label: 'Current price', description: `${original.toFixed(2)} total` },
            ...packageOptions,
          ];
        }
        return packageOptions;
      }));
    }
    return this._hotelOptionSignals.get(key)!;
  }

  private hotelMultiplier(hotel: HotelState, countState: HotelCountState): number {
    const nights = countState.nightsCountEnabled
      ? countState.nightsCount
      : (hotel.activeTab === 'specific' ? hotel.specific.nightCount ?? 0 : hotel.criteria.nightCount ?? 0);
    const rooms = hotel.activeTab === 'specific' ? hotel.specific.roomCount ?? 0 : hotel.criteria.roomCount ?? 0;
    return rooms * nights;
  }

  getFilteredHotelPolicies(hotel: HotelState): { policy: HotelPricePolicyModel; price: number }[] {
    const allDetails = this.hotelAllPriceDetails();
    return this.hotelPolicies()
      .map(policy => {
        if (!policy.HotelPricePolicyID) return null;
        const details = allDetails.get(policy.HotelPricePolicyID);
        if (!details) return null;
        const sellPrice = hotel.activeTab === 'specific'
          ? details.find(d => d.HotelID === hotel.specific.hotelId && d.RoomTypeID === hotel.specific.roomTypeId)?.UnitSellPrice
          : details.find(d => d.RoomTypeID === hotel.criteria.roomTypeId)?.UnitSellPrice;
        return sellPrice != null ? { policy, price: sellPrice } : null;
      })
      .filter((x): x is { policy: HotelPricePolicyModel; price: number } => x !== null)
      .sort((a, b) => a.price - b.price);
  }

  getTransOptionsSignal(idx: number): Signal<SelectOption[]> {
    if (!this._transOptionSignals.has(idx)) {
      this._transOptionSignals.set(idx, computed(() => {
        const t = this.transportListState()[idx];
        if (!t) return [];
        const packageOptions = this.getFilteredTransPackages(t)
          .filter(item => item.pkg.TransPackageID != null)
          .map(item => ({
            id: item.pkg.TransPackageID!,
            label: item.pkg.PackageTitle ?? '',
            description: `${item.price.toFixed(2)} / vehicle`,
          }));
        const original = this.originalTransportPrices[idx];
        if (original != null) {
          return [
            { id: 'current', label: 'Current price', description: `${original.toFixed(2)} total` },
            ...packageOptions,
          ];
        }
        return packageOptions;
      }));
    }
    return this._transOptionSignals.get(idx)!;
  }

  getFoodOptionsSignal(idx: number): Signal<SelectOption[]> {
    if (!this._foodOptionSignals.has(idx)) {
      this._foodOptionSignals.set(idx, computed(() => {
        const f = this.foodListState()[idx];
        if (!f) return [];
        const packageOptions = this.getFilteredCateringPackages(f)
          .filter(item => item.pkg.CateringPackageID != null)
          .map(item => ({
            id: item.pkg.CateringPackageID!,
            label: item.pkg.PackageTitle ?? '',
            description: `${item.price.toFixed(2)} / serving`,
          }));
        const original = this.originalFoodPrices[idx];
        if (original != null) {
          return [
            { id: 'current', label: 'Current price', description: `${original.toFixed(2)} total` },
            ...packageOptions,
          ];
        }
        return packageOptions;
      }));
    }
    return this._foodOptionSignals.get(idx)!;
  }

  // Per-item policy override selections — 'current' sentinel = pre-existing price (edit mode)
  readonly itemMakkahPolicyIds = signal<(number | string | null)[]>([]);
  readonly itemMadinahPolicyIds = signal<(number | string | null)[]>([]);
  readonly itemTransportPolicyIds = signal<(number | string | null)[]>([]);
  readonly itemFoodPolicyIds = signal<(number | string | null)[]>([]);

  // Original prices captured at init (used to revert when user picks "Current price")
  private originalMakkahPrices: (number | undefined)[] = [];
  private originalMadinahPrices: (number | undefined)[] = [];
  private originalTransportPrices: (number | undefined)[] = [];
  private originalFoodPrices: (number | undefined)[] = [];

  private hotelDetailCache = new Map<number, HotelPriceDetailModel[]>();
  private transDetailCache = new Map<number, TransPackagePriceModel2[]>();

  /** True when editing a package that already has a saved final price — skip all auto-prefill */
  private get skipPrefill(): boolean {
    return (this.finalDetailsState().price ?? 0) !== 0;
  }

  readonly adjustmentMode = signal<'markup_percent' | 'discount'>('markup_percent');
  readonly pendingAdjustmentValue = signal<number | null>(null);

  sumOfServices = computed(() => {
    let sum = 0;
    for (const h of this.makkahHotelListState()) sum += h.sellingPrice ?? 0;
    for (const h of this.madinahHotelListState()) sum += h.sellingPrice ?? 0;
    for (const t of this.transportListState()) sum += t.sellingPrice ?? 0;
    for (const f of this.foodListState()) sum += f.sellingPrice ?? 0;
    for (const t of this.ticketListState()) sum += t.sellingPrice ?? 0;
    return sum;
  });

  computedBlendedPrice = computed(() => {
    const ps = this.pricingState();
    if (ps.blendedPrice != null) return ps.blendedPrice;
    const sum = this.sumOfServices();
    if (!ps.markupValue) return sum;
    if (ps.markupType === 'percent') return sum + (sum * ps.markupValue) / 100;
    return sum + ps.markupValue;
  });

  hotelLabel(hotel: HotelState, countState: HotelCountState): string {
    if (hotel.activeTab === 'specific') {
      const nights = countState.nightsCountEnabled ? countState.nightsCount : hotel.specific.nightCount ?? 0;
      return `${hotel.specific.roomTypeName ?? ''} · ${hotel.specific.roomCount ?? 0} Rooms · ${nights} Nights`;
    }
    const nights = countState.nightsCountEnabled ? countState.nightsCount : hotel.criteria.nightCount ?? 0;
    return `${hotel.criteria.roomTypeName ?? ''} · ${hotel.criteria.roomCount ?? 0} Rooms · ${nights} Nights`;
  }

  parsePrice(raw: string): number | undefined {
    const v = parseFloat(raw);
    return isNaN(v) ? undefined : v;
  }

  readonly previewTotal = computed(() => {
    const v = this.pendingAdjustmentValue();
    const sum = this.sumOfServices();
    if (v == null) return null;
    return this.adjustmentMode() === 'discount'
      ? sum * (1 - v / 100)
      : sum * (1 + v / 100);
  });

  readonly previewAmount = computed(() => {
    const total = this.previewTotal();
    return total != null ? total - this.sumOfServices() : null;
  });

  ngOnInit(): void {
    // Capture pre-existing prices before any auto-prefill (edit mode support)
    this.originalMakkahPrices = this.makkahHotelListState().map(h => h.sellingPrice);
    this.originalMadinahPrices = this.madinahHotelListState().map(h => h.sellingPrice);
    this.originalTransportPrices = this.transportListState().map(t => t.sellingPrice);
    this.originalFoodPrices = this.foodListState().map(f => f.sellingPrice);

    this.itemMakkahPolicyIds.set(Array(this.makkahHotelListState().length).fill(null));
    this.itemMadinahPolicyIds.set(Array(this.madinahHotelListState().length).fill(null));
    this.itemTransportPolicyIds.set(Array(this.transportListState().length).fill(null));
    this.itemFoodPolicyIds.set(Array(this.foodListState().length).fill(null));

    this.loadingPolicies.set(true);
    const { startDate, endDate } = this.finalDetailsState();

    this.api.getHotelPricePolicies({
      pageIndex: 0, pageSize: 1000,
      body: { IsActive: true, StartTo: startDate, EndFrom: endDate },
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        const policies = res.Items ?? [];
        this.hotelPolicies.set(policies);
        this.loadHotelDetails(policies);
      },
      error: () => {},
    });

    this.api.getCateringPackages({
      pageIndex: 0, pageSize: 1000,
      body: { IsActive: true, StartDateTo: startDate, EndDateFrom: endDate },
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.cateringPackages.set(res ?? []);
        this.autoPrefillFood();
      },
      error: () => {},
    });

    this.api.getTransPackages({
      pageIndex: 0, pageSize: 1000,
      body: { IsActive: true, StartTo: startDate, EndFrom: endDate },
    }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.transPackages.set(res ?? []);
        this.autoPrefillTransport();
        this.loadingPolicies.set(false);
      },
      error: () => this.loadingPolicies.set(false),
    });
  }

  // --- Per-item policy override ---

  onItemHotelPolicyChange(city: 'makkah' | 'madinah', index: number, policyOption: SelectOption | null): void {
    const sentinel = policyOption?.id === 'current';
    const selectedId = sentinel ? 'current' : (policyOption?.id != null ? Number(policyOption.id) : null);
    if (city === 'makkah') this.itemMakkahPolicyIds.update(arr => arr.map((v, i) => i === index ? selectedId : v));
    else this.itemMadinahPolicyIds.update(arr => arr.map((v, i) => i === index ? selectedId : v));

    if (sentinel) {
      const original = city === 'makkah' ? this.originalMakkahPrices[index] : this.originalMadinahPrices[index];
      if (original != null) city === 'makkah' ? this.onMakkahHotelPrice(index, original) : this.onMadinahHotelPrice(index, original);
      return;
    }
    const policyId = selectedId as number | null;
    if (policyId == null) return;
    const hotel = (city === 'makkah' ? this.makkahHotelListState() : this.madinahHotelListState())[index];
    const countState = city === 'makkah' ? this.makkahHotelCountState() : this.madinahHotelCountState();
    this.resolveHotelDetails(policyId).subscribe(details => {
      const unitPrice = this.matchHotelPrice(hotel, details);
      if (unitPrice != null) {
        const total = unitPrice * this.hotelMultiplier(hotel, countState);
        if (city === 'makkah') this.onMakkahHotelPrice(index, total);
        else this.onMadinahHotelPrice(index, total);
      }
    });
  }

  onItemTransportPolicyChange(index: number, policyOption: SelectOption | null): void {
    const sentinel = policyOption?.id === 'current';
    const selectedId = sentinel ? 'current' : (policyOption?.id != null ? Number(policyOption.id) : null);
    this.itemTransportPolicyIds.update(arr => arr.map((v, i) => i === index ? selectedId : v));

    if (sentinel) {
      const original = this.originalTransportPrices[index];
      if (original != null) this.onTransportPrice(index, original);
      return;
    }
    const policyId = selectedId as number | null;
    if (policyId == null) return;
    const t = this.transportListState()[index];
    const pkg = this.transPackages().find(p => p.TransPackageID === policyId);
    const applyPrice = (prices: TransPackagePriceModel2[]) => {
      const price = prices.find(p => p.TripPathID === t.tripRouteId)?.Price;
      if (price != null) this.onTransportPrice(index, price * (t.numberOfVehicles ?? 1));
    };
    if (pkg?.Prices?.length) applyPrice(pkg.Prices);
    else this.resolveTransDetails(policyId).subscribe(applyPrice);
  }

  onItemFoodPolicyChange(index: number, policyOption: SelectOption | null): void {
    const sentinel = policyOption?.id === 'current';
    const selectedId = sentinel ? 'current' : (policyOption?.id != null ? Number(policyOption.id) : null);
    this.itemFoodPolicyIds.update(arr => arr.map((v, i) => i === index ? selectedId : v));

    if (sentinel) {
      const original = this.originalFoodPrices[index];
      if (original != null) this.onFoodPrice(index, original);
      return;
    }
    const policyId = selectedId as number | null;
    if (policyId == null) return;
    const f = this.foodListState()[index];
    const pkg = this.cateringPackages().find(p => p.CateringPackageID === policyId);
    const price = pkg?.CateringPackagePrices?.find(p => p.FoodTypeId === f.foodTypeId && p.CateringTypeID === f.mealTypeId)?.SellPrice;
    if (price != null) this.onFoodPrice(index, price * (f.mealCount ?? 1));
  }

  getFoodCostTotal(food: FoodState, index: number): number | undefined {
    const policyId = this.itemFoodPolicyIds()[index];
    if (policyId == null || typeof policyId !== 'number') return undefined;
    const pkg = this.cateringPackages().find(p => p.CateringPackageID === policyId);
    const unitCost = pkg?.CateringPackagePrices?.find(
      p => p.FoodTypeId === food.foodTypeId && p.CateringTypeID === food.mealTypeId
    )?.CostPrice;
    return unitCost != null ? unitCost * (food.mealCount ?? 1) : undefined;
  }

  // Returns packages matching this food item, sorted by SellPrice ascending (best price first)
  getFilteredCateringPackages(food: FoodState): { pkg: CateringPackageModel2; price: number }[] {
    return this.cateringPackages()
      .map(pkg => {
        const entry = pkg.CateringPackagePrices?.find(
          p => p.FoodTypeId === food.foodTypeId && p.CateringTypeID === food.mealTypeId
        );
        return entry?.SellPrice != null ? { pkg, price: entry.SellPrice } : null;
      })
      .filter((x): x is { pkg: CateringPackageModel2; price: number } => x !== null)
      .sort((a, b) => a.price - b.price);
  }

  // Returns packages matching this transport route, sorted by Price ascending (best price first)
  getFilteredTransPackages(transport: TransportState): { pkg: TransPackageModel2; price: number }[] {
    return this.transPackages()
      .map(pkg => {
        const entry = pkg.Prices?.find(p => p.TripPathID === transport.tripRouteId);
        return entry?.Price != null ? { pkg, price: entry.Price } : null;
      })
      .filter((x): x is { pkg: TransPackageModel2; price: number } => x !== null)
      .sort((a, b) => a.price - b.price);
  }

  private loadHotelDetails(policies: HotelPricePolicyModel[]): void {
    const valid = policies.filter(p => p.HotelPricePolicyID != null);
    if (!valid.length) return;
    this.loadingHotelDetails.set(true);
    forkJoin(
      valid.map(p => this.api.getHotelPriceDetails({ policyId: p.HotelPricePolicyID!, pageSize: 500 }).pipe(
        map(r => ({ policyId: p.HotelPricePolicyID!, items: r.Items ?? [] as HotelPriceDetailModel[] })),
        catchError(() => of({ policyId: p.HotelPricePolicyID!, items: [] as HotelPriceDetailModel[] })),
      ))
    ).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (results) => {
        const map = new Map<number, HotelPriceDetailModel[]>();
        results.forEach(r => {
          map.set(r.policyId, r.items);
          this.hotelDetailCache.set(r.policyId, r.items);
        });
        this.hotelAllPriceDetails.set(map);
        this.autoPrefillHotels();
        this.loadingHotelDetails.set(false);
      },
      error: () => this.loadingHotelDetails.set(false),
    });
  }

  private autoPrefillHotels(): void {
    const mCount = this.makkahHotelCountState();
    const mIds = this.makkahHotelListState().map((h, i) => {
      if (h.sellingPrice != null) return 'current' as const;
      if (this.skipPrefill) return null;
      const best = this.getFilteredHotelPolicies(h)[0];
      if (!best) return null;
      this.onMakkahHotelPrice(i, best.price * this.hotelMultiplier(h, mCount));
      return best.policy.HotelPricePolicyID ?? null;
    });
    this.itemMakkahPolicyIds.set(mIds);

    const dCount = this.madinahHotelCountState();
    const dIds = this.madinahHotelListState().map((h, i) => {
      if (h.sellingPrice != null) return 'current' as const;
      if (this.skipPrefill) return null;
      const best = this.getFilteredHotelPolicies(h)[0];
      if (!best) return null;
      this.onMadinahHotelPrice(i, best.price * this.hotelMultiplier(h, dCount));
      return best.policy.HotelPricePolicyID ?? null;
    });
    this.itemMadinahPolicyIds.set(dIds);
  }

  private autoPrefillFood(): void {
    const ids = this.foodListState().map((f, i) => {
      if (f.sellingPrice != null) return 'current' as const;
      if (this.skipPrefill) return null;
      const best = this.getFilteredCateringPackages(f)[0];
      if (!best) return null;
      this.onFoodPrice(i, best.price * (f.mealCount ?? 1));
      return best.pkg.CateringPackageID ?? null;
    });
    this.itemFoodPolicyIds.set(ids);
  }

  private autoPrefillTransport(): void {
    const ids = this.transportListState().map((t, i) => {
      if (t.sellingPrice != null) return 'current' as const;
      if (this.skipPrefill) return null;
      const best = this.getFilteredTransPackages(t)[0];
      if (!best) return null;
      this.onTransportPrice(i, best.price * (t.numberOfVehicles ?? 1));
      return best.pkg.TransPackageID ?? null;
    });
    this.itemTransportPolicyIds.set(ids);
  }

  // --- Price resolution with caching ---

  private resolveHotelDetails(policyId: number): Observable<HotelPriceDetailModel[]> {
    if (this.hotelDetailCache.has(policyId)) return of(this.hotelDetailCache.get(policyId)!);
    return this.api.getHotelPriceDetails({ policyId, pageSize: 500 }).pipe(
      map(r => r.Items ?? []),
      tap(items => {
        this.hotelDetailCache.set(policyId, items);
        const updated = new Map(this.hotelAllPriceDetails());
        updated.set(policyId, items);
        this.hotelAllPriceDetails.set(updated);
      }),
    );
  }

  private resolveTransDetails(packageId: number): Observable<TransPackagePriceModel2[]> {
    if (this.transDetailCache.has(packageId)) return of(this.transDetailCache.get(packageId)!);
    return this.api.getTransPackage({ packageID: packageId }).pipe(
      map(pkg => pkg.Prices ?? []),
      tap(prices => this.transDetailCache.set(packageId, prices)),
    );
  }

  getHotelCostTotal(city: 'makkah' | 'madinah', index: number): number | undefined {
    const policyId = (city === 'makkah' ? this.itemMakkahPolicyIds() : this.itemMadinahPolicyIds())[index];
    if (policyId == null || typeof policyId !== 'number') return undefined;
    const details = this.hotelAllPriceDetails().get(policyId);
    if (!details) return undefined;
    const hotel = (city === 'makkah' ? this.makkahHotelListState() : this.madinahHotelListState())[index];
    const countState = city === 'makkah' ? this.makkahHotelCountState() : this.madinahHotelCountState();
    const unitCost = hotel.activeTab === 'specific'
      ? details.find(d => d.HotelID === hotel.specific.hotelId && d.RoomTypeID === hotel.specific.roomTypeId)?.UnitCostPrice
      : details.find(d => d.RoomTypeID === hotel.criteria.roomTypeId)?.UnitCostPrice;
    return unitCost != null ? unitCost * this.hotelMultiplier(hotel, countState) : undefined;
  }

  private matchHotelPrice(hotel: HotelState, details: HotelPriceDetailModel[]): number | undefined {
    if (hotel.activeTab === 'specific') {
      return details.find(d => d.HotelID === hotel.specific.hotelId && d.RoomTypeID === hotel.specific.roomTypeId)?.UnitSellPrice;
    }
    return details.find(d => d.RoomTypeID === hotel.criteria.roomTypeId)?.UnitSellPrice;
  }

  // --- Existing price handlers ---

  private resetFinalPrice(): void {
    this.updatePricingStateFn({ blendedPrice: undefined });
    this.pendingAdjustmentValue.set(null);
  }

  onMakkahHotelPrice(i: number, val: number | undefined): void {
    this.updateMakkahHotelPricingAtIndex(i, val);
    this.resetFinalPrice();
  }

  onMadinahHotelPrice(i: number, val: number | undefined): void {
    this.updateMadinahHotelPricingAtIndex(i, val);
    this.resetFinalPrice();
  }

  onTransportPrice(i: number, val: number | undefined): void {
    this.updateTransportPricingAtIndex(i, val);
    this.resetFinalPrice();
  }

  onTicketPrice(i: number, val: number | undefined): void {
    this.updateTicketPricingAtIndex(i, val);
    this.resetFinalPrice();
  }

  onFoodPrice(i: number, val: number | undefined): void {
    this.updateFoodPricingAtIndex(i, val);
    this.resetFinalPrice();
  }

  onAdjustmentModeChange(mode: 'markup_percent' | 'discount') {
    this.adjustmentMode.set(mode);
    this.pendingAdjustmentValue.set(null);
  }

  onAdjustmentInputChange(raw: string) {
    const v = parseFloat(raw);
    this.pendingAdjustmentValue.set(isNaN(v) ? null : v);
  }

  onApplyAdjustment() {
    const newTotal = this.previewTotal();
    if (newTotal == null) return;
    this.updatePricingStateFn({ blendedPrice: newTotal, markupValue: undefined });
    this.pendingAdjustmentValue.set(null);
  }

  onBlendedPriceInput(raw: string) {
    const v = parseFloat(raw);
    this.updatePricingStateFn({ blendedPrice: isNaN(v) ? undefined : v });
  }

  submit() {
    this.updateFinalDetailsFn('price', this.computedBlendedPrice());
    this.handleSubmitData.emit();
  }

  trackByIndex(index: number) { return index; }
}
