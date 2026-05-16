import { Component, inject, Input, output, Signal, signal } from '@angular/core';
import { CounterInput } from '../counter-input/counter-input';
import { TransportState } from '../../services/package-builder-state-management-service';
import { CarTypeModel, TripPathModel } from 'src/app/services/admin.api.client';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'transport-step',
  imports: [CounterInput, CommonModule, TranslateModule],
  templateUrl: './transport.html',
  styleUrl: './transport.css'
})
export class Transport {

  @Input() state!: Signal<TransportState>;
  @Input() listState!: Signal<TransportState[]>;
  @Input() addFn!: () => void;
  @Input() removeFn!: (index: number) => void;
  @Input() updateFn!: (key: keyof TransportState, value: any) => void;
  @Input() tripPaths!: Signal<TripPathModel[]>;
  @Input() carTypes!: Signal<CarTypeModel[]>;
  @Input() isLoadingTripPahts!: Signal<boolean>;
  @Input() isLoadingCarTypes!: Signal<boolean>;
  readonly nextStep = output<void>();
  readonly prevStep = output<void>();



  // agentClient = inject(AgentAPIClient);
  // tripPaths = signal<TripPathModel[]>([]);
  // carTypes = signal<CarTypeModel[]>([]);
  // isLoadingTripPahts = signal(false);
  // isLoadingCarTypes = signal(false);


  // ngOnInit(): void {
  //   this.loadTripPahts();
  //   this.loadCarTypes();
  // }

  //  loadTripPahts() {
  //   this.isLoadingTripPahts.set(true);
  //   this.agentClient.getTripPathsLookup().subscribe({
  //     next: (data) => {
  //       this.tripPaths.set(data ?? []);
  //       console.error(data);
  //     },
  //     error: (error) => {
  //       console.error('Error fetching packages:', error);
  //     },
  //     complete: () => {
  //       this.isLoadingTripPahts.set(false);
  //     },
  //   });
  // }

  // loadCarTypes() {
  //   this.isLoadingCarTypes.set(true);
  //   this.agentClient.getCarTypesLookup().subscribe({
  //     next: (data) => {
  //       this.carTypes.set(data ?? []);
  //     },
  //     error: (error) => {
  //       console.error('Error fetching packages:', error);
  //     },
  //     complete: () => {
  //       this.isLoadingCarTypes.set(false);
  //     },
  //   });
  // }


  onCarTypeChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    const id = value === 'undefined' ? undefined : Number(value);
    const carType = this.carTypes().find(d => d.CarTypeID === id);
    if (this.updateFn) {
      this.updateFn('transportTypeId', id);
      this.updateFn('transportType', carType ? carType.Title : '');
    }
  }

  onTripPathChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    console.log(value);
    const id = value === 'undefined' ? undefined : Number(value);
    const tripPath = this.tripPaths().find(d => d.TripPathID === id);
    console.log(tripPath);
    if (this.updateFn) {
      this.updateFn('tripRouteId', id);
      this.updateFn('tripRoute', tripPath ? tripPath.Title : '');
    }
  }

  addRow() {
    this.addFn();
    console.log('Adding new row');
  }

  removeRow(i: number) {
    this.removeFn(i);
  }

  onChange<K extends keyof TransportState>(key: K, raw: any) {
    let val: any = raw === 'undefined' ? undefined : Number(raw);
    if (isNaN(val)) val = undefined;
    this.updateFn(key, val as TransportState[K]);
  }

  trackByIndex(index: number) {
    return index;
  }



  vehicles = signal<number>(3);
  onVehiclesChange(value: number) {
    this.vehicles.set(value);
    if (this.updateFn) {
      this.updateFn('numberOfVehicles', value);
    }
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

  isTransportValid(): boolean {
    const s = this.state();
    return !!(
      s.transportTypeId &&
      s.tripRouteId &&
      s.numberOfVehicles
    );
  }
}
