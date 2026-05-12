import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentService } from '../../../../../core/services/agent.service';
import { PackageBuilderUiService } from '../../../../../core/services/package-builder-ui.service';
import { PackageBuilderService } from '../../../../../core/services/package-builder.service';
import { PackageVisibilityType } from '../../../../../core/models/package.model';
import { Agent } from '../../../../../core/models/agent.model';
import { SelectOption } from '../../../../../core/models/package-builder-ui.model';

@Component({
  selector: 'app-package-visibility',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="visibility-card">
      <div class="visibility-header">
        <h3>Package Visibility & Distribution</h3>
        <p>حدد من يمكنه مشاهدة هذه الباقة قبل بدء إضافة الخدمات</p>
      </div>

      <div class="visibility-options">
        @for (option of options; track option.type) {
          <button
            type="button"
            class="visibility-option"
            [class.active]="visibility().visibilityType === option.type"
            (click)="selectType(option.type)">
            <span class="material-icons-round">{{ option.icon }}</span>
            <div>
              <strong>{{ option.title }}</strong>
              <p>{{ option.description }}</p>
            </div>
          </button>
        }
      </div>

      @if (visibility().visibilityType === 'private') {
        <div class="selectors-wrap">
          <div class="selector-title">اختر الوكلاء المسموح لهم</div>
          <div class="selector-list">
            @for (agent of agents; track agent.id) {
              <label>
                <input
                  type="checkbox"
                  [checked]="visibility().selectedAgents.includes(agent.id)"
                  (change)="toggleAgent(agent.id)" />
                <span>{{ agent.name }}</span>
              </label>
            }
          </div>
        </div>
      }

      @if (visibility().visibilityType === 'group') {
        <div class="selectors-wrap">
          <div class="selector-title">اختر مجموعات الوكلاء</div>
          <div class="selector-list">
            @for (group of groups; track group.value) {
              <label>
                <input
                  type="checkbox"
                  [checked]="visibility().selectedGroups.includes(group.value)"
                  (change)="toggleGroup(group.value)" />
                <span>{{ group.label }}</span>
              </label>
            }
          </div>
        </div>
      }
    </section>
  `,
  styles: [`
    .visibility-card {
      background: #fff;
      border: 1px solid var(--sero-border-light);
      border-radius: 14px;
      box-shadow: var(--shadow-sm);
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .visibility-header h3 {
      font-size: 1rem;
      font-weight: 800;
      color: var(--sero-text-primary);
      margin-bottom: 2px;
    }

    .visibility-header p {
      margin: 0;
      font-size: 0.82rem;
      color: var(--sero-text-secondary);
    }

    .visibility-options {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }

    .visibility-option {
      border: 1px solid var(--sero-border);
      border-radius: 10px;
      background: #fff;
      text-align: right;
      padding: 10px;
      display: flex;
      align-items: flex-start;
      gap: 8px;
      cursor: pointer;
      transition: border-color var(--t-fast), background var(--t-fast);
    }

    .visibility-option.active {
      border-color: var(--sero-primary);
      background: var(--sero-primary-50);
      box-shadow: 0 0 0 1px var(--sero-primary-100);
    }

    .visibility-option .material-icons-round {
      font-size: 18px;
      color: var(--sero-primary);
      margin-top: 2px;
    }

    .visibility-option strong {
      display: block;
      font-size: 0.86rem;
      color: var(--sero-text-primary);
      margin-bottom: 2px;
    }

    .visibility-option p {
      margin: 0;
      font-size: 0.76rem;
      color: var(--sero-text-secondary);
      line-height: 1.35;
    }

    .selectors-wrap {
      border-top: 1px dashed var(--sero-border-light);
      padding-top: 10px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .selector-title {
      font-size: 0.83rem;
      font-weight: 700;
      color: var(--sero-text-primary);
    }

    .selector-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px 14px;
    }

    .selector-list label {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      color: var(--sero-text-secondary);
      cursor: pointer;
    }

    @media (max-width: 900px) {
      .visibility-options {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PackageVisibilityComponent implements OnInit {
  @Output() visibilityChanged = new EventEmitter<void>();

  readonly visibility;
  agents: Agent[] = [];
  groups: SelectOption[] = [];

  readonly options: Array<{
    type: PackageVisibilityType;
    icon: string;
    title: string;
    description: string;
  }> = [
    {
      type: 'shared',
      icon: 'public',
      title: 'Shared Package',
      description: 'Visible to all agents on the platform.'
    },
    {
      type: 'private',
      icon: 'lock',
      title: 'Private Package',
      description: 'Visible only to selected agents.'
    },
    {
      type: 'group',
      icon: 'groups',
      title: 'Group Package',
      description: 'Visible to selected agent groups.'
    }
  ];

  constructor(
    private readonly builderService: PackageBuilderService,
    private readonly agentService: AgentService,
    private readonly builderUiService: PackageBuilderUiService
  ) {
    this.visibility = this.builderService.getVisibilitySignal();
  }

  ngOnInit(): void {
    this.agentService.getSubagents().subscribe((agents) => {
      this.agents = agents;
    });
    this.groups = this.builderUiService.getAgentGroupOptions();
  }

  selectType(type: PackageVisibilityType): void {
    this.builderService.setVisibilityType(type);
    this.visibilityChanged.emit();
  }

  toggleAgent(agentId: string): void {
    const current = this.visibility().selectedAgents;
    const next = current.includes(agentId)
      ? current.filter((id) => id !== agentId)
      : [...current, agentId];
    this.builderService.setSelectedAgents(next);
    this.visibilityChanged.emit();
  }

  toggleGroup(groupId: string): void {
    const current = this.visibility().selectedGroups;
    const next = current.includes(groupId)
      ? current.filter((id) => id !== groupId)
      : [...current, groupId];
    this.builderService.setSelectedGroups(next);
    this.visibilityChanged.emit();
  }
}
