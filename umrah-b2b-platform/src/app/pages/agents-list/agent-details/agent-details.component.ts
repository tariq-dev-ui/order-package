import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { AdminAPIClient, AgentModel } from 'src/app/services/admin.api.client';

@Component({
  selector: 'app-agent-details',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, TranslateModule],
  template: `
    <div class="p-6 bg-white min-w-[420px]">
      <div class="flex items-center justify-between gap-4 mb-5">
        <h2 class="text-lg font-bold text-gray-900">{{ agent()?.AgentName || ('Agent Details' | translate) }}</h2>
        <button mat-button type="button" (click)="close()">{{ 'Close' | translate }}</button>
      </div>
      @if (agent(); as item) {
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div class="rounded-lg border border-gray-200 p-3">
            <div class="text-xs text-gray-500">{{ 'Email' | translate }}</div>
            <div class="font-semibold text-gray-800">{{ item.AgentEmail || '-' }}</div>
          </div>
          <div class="rounded-lg border border-gray-200 p-3">
            <div class="text-xs text-gray-500">{{ 'Country' | translate }}</div>
            <div class="font-semibold text-gray-800">{{ item.CountryName || '-' }}</div>
          </div>
          <div class="rounded-lg border border-gray-200 p-3">
            <div class="text-xs text-gray-500">{{ 'City' | translate }}</div>
            <div class="font-semibold text-gray-800">{{ item.CityName || '-' }}</div>
          </div>
        </div>
      }
    </div>
  `,
})
export class AgentDetailsComponent {
  private readonly data = inject(MAT_DIALOG_DATA) as { agentId?: number };
  private readonly dialogRef = inject(MatDialogRef<AgentDetailsComponent>);
  private readonly adminClient = inject(AdminAPIClient);

  readonly agent = signal<AgentModel | null>(null);

  ngOnInit(): void {
    this.adminClient.getAgent({ agentID: this.data.agentId }).subscribe((agent) => this.agent.set(agent));
  }

  close(): void {
    this.dialogRef.close();
  }
}
