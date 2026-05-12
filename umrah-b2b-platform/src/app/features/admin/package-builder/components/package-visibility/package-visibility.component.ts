import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgentService } from '../../../../../core/services/agent.service';
import { PackageBuilderService } from '../../../../../core/services/package-builder.service';
import { PackageVisibilityType } from '../../../../../core/models/package.model';
import { Agent } from '../../../../../core/models/agent.model';
import {
  CommissionModel,
  PricingPermission,
  SubagentAccessMode
} from '../../../../../core/models/enums';

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

      <div class="visibility-actions">
        <button type="button" class="btn btn--secondary btn--sm" (click)="showDetailsPopup = true">
          <span class="material-icons-round">tune</span>
          عرض التفاصيل
        </button>
      </div>

      @if (showDetailsPopup) {
        <div class="details-modal-overlay" (click)="showDetailsPopup = false">
          <div class="details-modal" (click)="$event.stopPropagation()">
            <div class="details-modal-head">
              <h4>تفاصيل التوزيع</h4>
              <button type="button" class="close-btn" (click)="showDetailsPopup = false">
                <span class="material-icons-round">close</span>
              </button>
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

            <div class="advanced-grid">
              <label class="inline-toggle">
                <input type="checkbox" [checked]="visibility().allowReselling" (change)="onAllowReselling($event)" />
                <span>السماح بإعادة البيع</span>
              </label>

              <label class="inline-toggle">
                <input type="checkbox" [checked]="visibility().hideOriginalCost" (change)="onHideCost($event)" />
                <span>إخفاء التكلفة الأصلية</span>
              </label>

              <label class="inline-field">
                <span>وصول الوكلاء الفرعيين</span>
                <select [value]="visibility().subagentAccessMode" (change)="onSubagentAccessChange($event)">
                  <option [value]="SubagentAccessMode.ALL">All</option>
                  <option [value]="SubagentAccessMode.SELECTED">Selected</option>
                </select>
              </label>

              <label class="inline-field">
                <span>صلاحية التسعير</span>
                <select [value]="visibility().pricingPermission" (change)="onPricingPermissionChange($event)">
                  <option [value]="PricingPermission.FIXED_BY_ADMIN">Fixed by Admin</option>
                  <option [value]="PricingPermission.AGENT_MARKUP">Agent Markup</option>
                  <option [value]="PricingPermission.AGENT_FULL_CONTROL">Agent Full Control</option>
                </select>
              </label>

              <label class="inline-field">
                <span>نموذج العمولة</span>
                <select [value]="visibility().commissionModel" (change)="onCommissionModelChange($event)">
                  <option [value]="CommissionModel.PERCENTAGE">Percentage</option>
                  <option [value]="CommissionModel.FIXED_AMOUNT">Fixed Amount</option>
                </select>
              </label>

              <label class="inline-field">
                <span>قيمة العمولة</span>
                <input type="number" min="0" [value]="visibility().commissionValue" (input)="onCommissionValueChange($event)" />
              </label>

              <label class="inline-field">
                <span>المخزون المخصص</span>
                <input type="number" min="1" [value]="visibility().allocatedInventory" (input)="onAllocatedInventoryChange($event)" />
              </label>
            </div>
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

    .advanced-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px 10px;
      border-top: 1px dashed var(--sero-border-light);
      padding-top: 10px;
    }

    .inline-toggle {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      color: var(--sero-text-secondary);
      cursor: pointer;
    }

    .inline-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 0.76rem;
      color: var(--sero-text-secondary);
    }

    .inline-field select,
    .inline-field input {
      height: 34px;
      border: 1px solid var(--sero-border);
      border-radius: 8px;
      padding: 6px 8px;
      font-size: 0.8rem;
      color: var(--sero-text-primary);
      background: #fff;
      outline: none;
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

    .visibility-actions {
      display: flex;
      justify-content: flex-end;
      border-top: 1px dashed var(--sero-border-light);
      padding-top: 8px;
    }

    .details-modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(34, 43, 28, 0.45);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }

    .details-modal {
      width: min(760px, 100%);
      max-height: 85vh;
      overflow-y: auto;
      background: #fff;
      border: 1px solid var(--sero-border-light);
      border-radius: 14px;
      box-shadow: var(--shadow-lg);
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .details-modal-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--sero-border-light);
      padding-bottom: 8px;
    }

    .details-modal-head h4 {
      margin: 0;
      font-size: 0.96rem;
      color: var(--sero-text-primary);
      font-weight: 800;
    }

    .close-btn {
      width: 28px;
      height: 28px;
      border: 1px solid var(--sero-border);
      border-radius: 8px;
      background: #fff;
      color: var(--sero-text-secondary);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .close-btn .material-icons-round {
      font-size: 16px;
    }

    @media (max-width: 900px) {
      .visibility-options {
        grid-template-columns: 1fr;
      }
      .advanced-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PackageVisibilityComponent implements OnInit {
  @Output() visibilityChanged = new EventEmitter<void>();
  readonly SubagentAccessMode = SubagentAccessMode;
  readonly PricingPermission = PricingPermission;
  readonly CommissionModel = CommissionModel;
  showDetailsPopup = false;

  readonly visibility;
  agents: Agent[] = [];

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
    }
  ];

  constructor(
    private readonly builderService: PackageBuilderService,
    private readonly agentService: AgentService
  ) {
    this.visibility = this.builderService.getVisibilitySignal();
  }

  ngOnInit(): void {
    this.agentService.getSubagents().subscribe((agents) => {
      this.agents = agents;
    });
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

  onAllowReselling(event: Event): void {
    this.builderService.setAllowReselling((event.target as HTMLInputElement).checked);
    this.visibilityChanged.emit();
  }

  onHideCost(event: Event): void {
    this.builderService.setHideOriginalCost((event.target as HTMLInputElement).checked);
    this.visibilityChanged.emit();
  }

  onSubagentAccessChange(event: Event): void {
    this.builderService.setSubagentAccessMode((event.target as HTMLSelectElement).value as SubagentAccessMode);
    this.visibilityChanged.emit();
  }

  onPricingPermissionChange(event: Event): void {
    this.builderService.setPricingPermission((event.target as HTMLSelectElement).value as PricingPermission);
    this.visibilityChanged.emit();
  }

  onCommissionModelChange(event: Event): void {
    this.builderService.setCommissionModel((event.target as HTMLSelectElement).value as CommissionModel);
    this.visibilityChanged.emit();
  }

  onCommissionValueChange(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value || 0);
    this.builderService.setCommissionValue(value);
    this.visibilityChanged.emit();
  }

  onAllocatedInventoryChange(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value || 1);
    this.builderService.setAllocatedInventory(value);
    this.visibilityChanged.emit();
  }
}
