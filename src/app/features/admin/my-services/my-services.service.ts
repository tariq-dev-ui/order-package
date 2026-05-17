import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MY_SERVICES_MOCK_DATA, MyService, MyServiceFormValue } from './my-service.mock';

@Injectable({
  providedIn: 'root',
})
export class MyServicesService {
  private mockData = [...MY_SERVICES_MOCK_DATA];

  getServices(filters?: any): Observable<MyService[]> {
    // Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
    let result = [...this.mockData];

    if (filters) {
      if (filters.searchText) {
        const searchLower = filters.searchText.toLowerCase();
        result = result.filter(
          (s) =>
            s.from.toLowerCase().includes(searchLower) ||
            s.to.toLowerCase().includes(searchLower) ||
            s.description.toLowerCase().includes(searchLower)
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
    }

    return of(result).pipe(delay(200));
  }

  getServiceById(id: string): Observable<MyService | null> {
    const service = this.mockData.find((s) => s.id === id);
    return of(service || null).pipe(delay(100));
  }

  createService(formValue: MyServiceFormValue): Observable<MyService> {
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
