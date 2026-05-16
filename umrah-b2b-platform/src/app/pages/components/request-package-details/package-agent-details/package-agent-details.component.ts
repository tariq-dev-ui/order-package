import { Component, Input, inject, OnInit, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { SlicePipe } from '@angular/common';
import { AdminAPIClient, AgentModel, SeroPackageAgentModel } from 'src/app/services/admin.api.client';

@Component({
  selector: 'package-agent-details',
  imports: [TranslateModule, SlicePipe],
  templateUrl: './package-agent-details.component.html',
})
export class PackageAgentDetailsComponent implements OnInit {
  private adminClient = inject(AdminAPIClient);
  agents = signal<Map<number, AgentModel>>(new Map());

  @Input({ required: true }) Agents: SeroPackageAgentModel[] | null | undefined;

  ngOnInit() {
    if (this.Agents) {
      this.loadAgents();
    }
  }

  private loadAgents() {
    if (!this.Agents) return;
    const agentIds = this.Agents.map(a => a.AgentId).filter(id => id !== undefined) as number[];
    agentIds.forEach(agentId => {
      if (!this.agents().has(agentId)) {
        this.adminClient.getAgent({ agentID: agentId }).subscribe({
          next: (agent) => {
            const currentAgents = this.agents();
            currentAgents.set(agentId, agent);
            this.agents.set(new Map(currentAgents));
          },
          error: (error) => {
            console.error('Error fetching agent:', error);
          }
        });
      }
    });
  }

  getAgentName(agentId: number | undefined): string {
    if (!agentId) return '';
    const agent = this.agents().get(agentId);
    return agent?.AgentName ?? '';
  }

  getAgentCountry(agentId: number | undefined): string {
    if (!agentId) return '';
    const agent = this.agents().get(agentId);
    return agent?.CountryName ?? '';
  }
}
