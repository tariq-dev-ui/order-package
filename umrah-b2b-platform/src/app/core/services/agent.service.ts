import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Agent, AgentSummary } from '../models/agent.model';
import { UserRole } from '../models/enums';
import { MockDataService } from './mock-data.service';

@Injectable({ providedIn: 'root' })
export class AgentService {
  private agents$ = new BehaviorSubject<Agent[]>([]);
  private currentAgent$ = new BehaviorSubject<Agent | null>(null);

  constructor(private mock: MockDataService) {
    this.agents$.next(this.mock.agents);
    // Default to master agent view for demo
    this.currentAgent$.next(this.mock.agents.find(a => a.id === 'master-001') || null);
  }

  getAll(): Observable<Agent[]> {
    return this.agents$.asObservable().pipe(delay(150));
  }

  getMasterAgents(): Observable<Agent[]> {
    return this.agents$.pipe(
      map(agents => agents.filter(a => a.role === UserRole.MASTER_AGENT)),
      delay(100)
    );
  }

  getSubagents(): Observable<Agent[]> {
    return this.agents$.pipe(
      map(agents => agents.filter(a => a.role === UserRole.SUB_AGENT)),
      delay(100)
    );
  }

  getSubagentsForMaster(masterAgentId: string): Observable<Agent[]> {
    return this.agents$.pipe(
      map(agents => agents.filter(a => a.masterAgentId === masterAgentId)),
      delay(100)
    );
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

  setCurrentAgent(agentId: string): void {
    const agent = this.mock.agents.find(a => a.id === agentId);
    this.currentAgent$.next(agent || null);
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
