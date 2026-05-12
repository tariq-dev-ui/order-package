import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AgentService } from './agent.service';

export type ViewMode = 'admin' | 'master' | 'subAgent';

@Injectable({ providedIn: 'root' })
export class ViewModeService {
  private readonly storageKey = 'sero_selected_view_mode';
  private readonly mode$ = new BehaviorSubject<ViewMode>(this.readInitialMode());

  readonly selectedView$ = this.mode$.asObservable();

  constructor(
    private readonly router: Router,
    private readonly agentService: AgentService
  ) {
    this.syncAgentForMode(this.mode$.value);
    this.ensureRouteMatchesMode(this.mode$.value);

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.ensureRouteMatchesMode(this.mode$.value);
      });
  }

  getCurrentMode(): ViewMode {
    return this.mode$.value;
  }

  setMode(mode: ViewMode): void {
    if (this.mode$.value === mode) {
      return;
    }

    this.mode$.next(mode);
    this.persistMode(mode);
    this.syncAgentForMode(mode);
    this.ensureRouteMatchesMode(mode);
  }

  private ensureRouteMatchesMode(mode: ViewMode): void {
    const currentUrl = this.router.url || '/';
    if (this.isRouteAllowedForMode(currentUrl, mode)) {
      return;
    }

    this.router.navigateByUrl(this.getDefaultRoute(mode));
  }

  private isRouteAllowedForMode(url: string, mode: ViewMode): boolean {
    if (url.startsWith('/admin')) {
      return mode === 'admin';
    }
    if (url.startsWith('/master')) {
      return mode === 'master';
    }
    if (url.startsWith('/agent')) {
      return mode === 'subAgent';
    }

    // Keep neutral or non-existing utility routes unaffected.
    return true;
  }

  private getDefaultRoute(mode: ViewMode): string {
    if (mode === 'admin') {
      return '/admin';
    }
    if (mode === 'subAgent') {
      return '/agent/marketplace';
    }
    return '/master/distributed';
  }

  private syncAgentForMode(mode: ViewMode): void {
    const agentId = mode === 'admin'
      ? 'admin-001'
      : mode === 'master'
        ? 'master-001'
        : 'agent-001';
    this.agentService.setCurrentAgent(agentId);
  }

  private readInitialMode(): ViewMode {
    const saved = localStorage.getItem(this.storageKey);
    if (saved === 'admin' || saved === 'master' || saved === 'subAgent') {
      return saved;
    }
    return 'master';
  }

  private persistMode(mode: ViewMode): void {
    localStorage.setItem(this.storageKey, mode);
  }
}
