// Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AgentModel, UserAccountViewModel, UserViewModel, CountryData, CityData } from './subagents.model';
import {
  MOCK_SUBAGENTS, MOCK_SUBAGENT_USERS, MOCK_COUNTRIES, MOCK_CITIES,
} from './subagents.mock';

@Injectable({ providedIn: 'root' })
export class SubagentsService {
  private subagents = [...MOCK_SUBAGENTS];
  private nextAgentId = 200;

  private usersMap: Record<number, UserAccountViewModel[]> = { ...MOCK_SUBAGENT_USERS };
  private nextUserId = 300;

  // Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
  getAgentList(params: {
    pageIndex?: number;
    pageSize?: number;
    cityID?: number;
    isActive?: boolean;
  }): Observable<AgentModel[]> {
    let list = [...this.subagents];
    if (params.cityID != null) list = list.filter(a => a.CityID === params.cityID);
    if (params.isActive != null) list = list.filter(a => a.IsActive === params.isActive);
    const pi = params.pageIndex ?? 0;
    const ps = params.pageSize ?? 10;
    return of(list.slice(pi * ps, pi * ps + ps)).pipe(delay(300));
  }

  // Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
  getAgentListCount(params: { cityID?: number; isActive?: boolean }): Observable<number> {
    let list = [...this.subagents];
    if (params.cityID != null) list = list.filter(a => a.CityID === params.cityID);
    if (params.isActive != null) list = list.filter(a => a.IsActive === params.isActive);
    return of(list.length).pipe(delay(100));
  }

  // Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
  createAgent(agent: AgentModel): Observable<AgentModel> {
    const newAgent = { ...agent, AgentID: this.nextAgentId++ };
    this.subagents = [...this.subagents, newAgent];
    if (newAgent.AgentID) this.usersMap[newAgent.AgentID] = [];
    return of(newAgent).pipe(delay(400));
  }

  // Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
  updateAgent(agent: AgentModel): Observable<AgentModel> {
    this.subagents = this.subagents.map(a => a.AgentID === agent.AgentID ? { ...a, ...agent } : a);
    return of(agent).pipe(delay(400));
  }

  // Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
  getCountriesLookup(): Observable<CountryData[]> {
    return of(MOCK_COUNTRIES).pipe(delay(200));
  }

  // Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
  getCitiesLookup(countryId: number): Observable<CityData[]> {
    return of(MOCK_CITIES[countryId] ?? []).pipe(delay(200));
  }

  // Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
  getSubAgentUsersList(subagentId?: number): Observable<UserAccountViewModel[]> {
    if (subagentId == null) return of([]).pipe(delay(200));
    return of(this.usersMap[subagentId] ?? []).pipe(delay(300));
  }

  // Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
  createUser(user: UserViewModel): Observable<{ IsSuccess: boolean; Message?: string }> {
    const newUser: UserAccountViewModel = {
      UserID: this.nextUserId++,
      UserName: user.UserName,
      FirstName: user.FirstName,
      LastName: user.LastName,
      Email: user.Email,
      PhoneNumber: user.Mobile,
      IsActive: user.IsActive,
      UserOwnerID: user.UserOwnerID ?? undefined,
      UserTypeID: user.UserTypeID,
      AddedDate: new Date().toISOString(),
      LastUpdatedDate: new Date().toISOString(),
      AddedBy: 'Current User',
    };
    const ownerId = user.UserOwnerID ?? 0;
    if (!this.usersMap[ownerId]) this.usersMap[ownerId] = [];
    this.usersMap[ownerId] = [...this.usersMap[ownerId], newUser];
    return of({ IsSuccess: true }).pipe(delay(400));
  }

  // Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
  updateUser(user: UserViewModel): Observable<{ IsSuccess: boolean; Message?: string }> {
    const ownerId = user.UserOwnerID ?? 0;
    if (this.usersMap[ownerId]) {
      this.usersMap[ownerId] = this.usersMap[ownerId].map(u =>
        u.UserID === user.UserID
          ? { ...u, UserName: user.UserName, FirstName: user.FirstName, LastName: user.LastName, Email: user.Email, PhoneNumber: user.Mobile, IsActive: user.IsActive, LastUpdatedDate: new Date().toISOString() }
          : u
      );
    }
    return of({ IsSuccess: true }).pipe(delay(400));
  }
}
