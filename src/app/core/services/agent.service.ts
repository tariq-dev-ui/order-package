import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Agent, AgentSummary } from '../models/agent.model';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class AgentService {
  private agents$ = new BehaviorSubject<Agent[]>([]);
  private currentAgent$ = new BehaviorSubject<Agent | null>(null);

  constructor(private mock: MockDataService) {
    this.agents$.next(this.mock.agents);
    this.currentAgent$.next(this.mock.agents.find(a => a.id === 'admin-001') || null);
  }

  getAll(): Observable<Agent[]> {
    return this.agents$.asObservable().pipe(delay(150));
  }

  getById(id: string): Observable<Agent | undefined> {
    return this.agents$.pipe(
      map(agents => agents.find(a => a.id === id)),
      delay(100)
    );
  }

  getCurrentAgent(): Observable<Agent | null> {
    return this.currentAgent$.asObservable();
  }

  toSummary(agent: Agent): AgentSummary {
    return {
      id: agent.id,
      name: agent.name,
      companyName: agent.companyName,
      role: agent.role,
      isVerified: agent.isVerified,
      isActive: agent.isActive,
      totalSales: agent.totalSales
    };
  }
}
