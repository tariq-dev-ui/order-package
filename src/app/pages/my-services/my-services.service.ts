import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { myServicesMock } from './my-services.mock';
import { MyServiceActionPayload, MyServiceActionResult, MyServiceConfig, MyServiceKind } from './my-services.model';

@Injectable({ providedIn: 'root' })
export class MyServicesService {
  // Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
  getServices(): Observable<MyServiceConfig[]> {
    return of(myServicesMock.map((service) => ({ ...service, highlights: [...service.highlights] })));
  }

  getService(kind: MyServiceKind): Observable<MyServiceConfig | undefined> {
    const service = myServicesMock.find((item) => item.kind === kind);
    return of(service ? { ...service, highlights: [...service.highlights] } : undefined);
  }

  saveDraft(payload: MyServiceActionPayload): Observable<MyServiceActionResult> {
    return of({
      success: true,
      message: `${payload.title} draft saved locally.`,
    });
  }

  submitService(payload: MyServiceActionPayload): Observable<MyServiceActionResult> {
    return of({
      success: true,
      message: `${payload.title} submitted locally.`,
    });
  }
}
