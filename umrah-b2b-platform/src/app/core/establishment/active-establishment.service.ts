import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ActiveEstablishmentService {
  readonly selectedId = signal('est-1');
}
