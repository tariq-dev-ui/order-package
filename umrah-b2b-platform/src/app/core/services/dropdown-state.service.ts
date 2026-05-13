import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DropdownStateService {
  private readonly closeOthers$ = new Subject<string>();
  readonly closeOthers = this.closeOthers$.asObservable();

  requestCloseOthers(openId: string): void {
    this.closeOthers$.next(openId);
  }
}
