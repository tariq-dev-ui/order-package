import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { SeroPackageModel } from './packages.model';
import { MOCK_PACKAGES, MOCK_MY_PACKAGES } from './packages.mock';

// Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
@Injectable({ providedIn: 'root' })
export class PackagesService {
  private readonly pageSize = 10;

  getActivePackages(page: number): Observable<SeroPackageModel[]> {
    const start = (page - 1) * this.pageSize;
    return of(MOCK_PACKAGES.slice(start, start + this.pageSize));
  }

  getActivePackagesCount(): Observable<number> {
    return of(MOCK_PACKAGES.length);
  }

  getMyPackages(page: number): Observable<SeroPackageModel[]> {
    const start = (page - 1) * this.pageSize;
    return of(MOCK_MY_PACKAGES.slice(start, start + this.pageSize));
  }

  getMyPackagesCount(): Observable<number> {
    return of(MOCK_MY_PACKAGES.length);
  }

  bookPackage(_packageId: number, _formData: unknown): Observable<boolean> {
    return of(true);
  }
}
