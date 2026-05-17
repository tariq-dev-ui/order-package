import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { buildOperationalMeta, MY_SERVICES_MOCK_DATA, MyService, MyServiceFilterState, MyServiceFormValue } from './my-service.mock';

@Injectable({
  providedIn: 'root',
})
export class MyServicesService {
  private mockData = [...MY_SERVICES_MOCK_DATA];

  getServices(filters?: MyServiceFilterState): Observable<MyService[]> {
    // Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
    let result = [...this.mockData];

    if (filters) {
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        result = result.filter(
          (s) =>
            s.from.toLowerCase().includes(searchLower) ||
            s.to.toLowerCase().includes(searchLower) ||
            s.description.toLowerCase().includes(searchLower) ||
            s.operational.title.toLowerCase().includes(searchLower) ||
            s.operational.coverage.toLowerCase().includes(searchLower) ||
            s.operational.summaryLines.some((line) => line.toLowerCase().includes(searchLower))
        );
      }

      if (filters.serviceType) {
        result = result.filter((s) => s.serviceType === filters.serviceType);
      }

      if (filters.serviceCity) {
        result = result.filter((s) => s.serviceCity === filters.serviceCity);
      }

      if (filters.status) {
        result = result.filter((s) => s.status === filters.status);
      }

      if (filters.pricingRange) {
        result = result.filter((s) => {
          const amount = s.pricing.amount;
          if (filters.pricingRange === 'under_250') return amount < 250;
          if (filters.pricingRange === '250_750') return amount >= 250 && amount <= 750;
          if (filters.pricingRange === '750_2000') return amount > 750 && amount <= 2000;
          if (filters.pricingRange === 'over_2000') return amount > 2000;
          return true;
        });
      }

      if (filters.lifecycle) {
        result = result.filter((s) => s.status === filters.lifecycle);
      }

      if (filters.lastUpdated) {
        result = result.filter((s) => {
          const relative = s.lastUpdate.relative.toLowerCase();
          if (filters.lastUpdated === 'today') return relative.includes('h ago') || relative.includes('now');
          if (filters.lastUpdated === 'week') return !relative.includes('2w');
          if (filters.lastUpdated === 'month') return true;
          return true;
        });
      }
    }

    return of(result).pipe(delay(200));
  }

  getServiceById(id: string): Observable<MyService | null> {
    const service = this.mockData.find((s) => s.id === id);
    return of(service || null).pipe(delay(100));
  }

  createService(formValue: MyServiceFormValue): Observable<MyService> {
    const operationalFields = buildOperationalMeta(formValue);
    const newService: MyService = {
      id: `SVC-${Date.now()}`,
      from: formValue.from,
      to: formValue.to,
      serviceType: formValue.serviceType,
      serviceCity: formValue.serviceCity,
      price: formValue.price || 0,
      status: formValue.status,
      createdDate: new Date().toISOString().split('T')[0],
      description: formValue.description,
      images: formValue.images,
      ...operationalFields,
    };

    this.mockData.push(newService);
    return of(newService).pipe(delay(200));
  }

  updateService(id: string, formValue: MyServiceFormValue): Observable<MyService | null> {
    const index = this.mockData.findIndex((s) => s.id === id);

    if (index > -1) {
      const updatedService: MyService = {
        ...this.mockData[index],
        from: formValue.from,
        to: formValue.to,
        serviceType: formValue.serviceType,
        serviceCity: formValue.serviceCity,
        price: formValue.price || 0,
        status: formValue.status,
        description: formValue.description,
        images: formValue.images,
        ...buildOperationalMeta(formValue),
      };

      this.mockData[index] = updatedService;
      return of(updatedService).pipe(delay(200));
    }

    return of(null).pipe(delay(200));
  }

  deleteService(id: string): Observable<boolean> {
    const index = this.mockData.findIndex((s) => s.id === id);

    if (index > -1) {
      this.mockData.splice(index, 1);
      return of(true).pipe(delay(150));
    }

    return of(false).pipe(delay(150));
  }
}
