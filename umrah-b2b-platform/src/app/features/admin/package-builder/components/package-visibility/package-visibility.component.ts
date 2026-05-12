import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AgentService } from '../../../../../core/services/agent.service';
import {
  PackageBuilderService,
  PackageVisibilityState
} from '../../../../../core/services/package-builder.service';
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
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <section class="visibility-card">
      <div class="visibility-header">
        <h3>{{ 'distribution.modalDetails.cardTitle' | translate }}</h3>
        <p>{{ 'distribution.modalDetails.cardSubtitle' | translate }}</p>
      </div>

      <div class="visibility-options">
        @for (option of options; track option.type) {
          <button
            type="button"
            class="visibility-option"
            [class.active]="visibility().visibilityType === option.type"
            [class.private-option]="option.type === 'private'"
            (click)="selectType(option.type)">
            <span class="material-icons-round">{{ option.icon }}</span>
            <div>
              <strong>{{ option.titleKey | translate }}</strong>
              <p>{{ option.descriptionKey | translate }}</p>
            </div>
          </button>
        }
      </div>

      <div class="visibility-actions">
        <button type="button" class="btn btn--secondary btn--sm" (click)="openDetails()">
          <span class="material-icons-round">tune</span>
          {{ 'distribution.modalDetails.openDetails' | translate }}
        </button>
      </div>

      @if (showDetailsPopup) {
        <div class="details-modal-overlay" (click)="cancelDetails()">
          <div class="details-modal" (click)="$event.stopPropagation()">
            <div class="details-modal-head">
              <div>
                <h4>{{ activeVisibilityConfig().titleKey | translate }}</h4>
                <p>{{ activeVisibilityConfig().subtitleKey | translate }}</p>
              </div>
              <button type="button" class="close-btn" (click)="cancelDetails()">
                <span class="material-icons-round">close</span>
              </button>
            </div>

            <section class="modal-section">
              <h5><span class="material-icons-round">verified_user</span> {{ 'distribution.modalDetails.permissionsTitle' | translate }}</h5>
              <div class="toggle-cards">
                <label class="toggle-card">
                  <input type="checkbox" [checked]="modalDraft.allowReselling" (change)="onDraftToggle('allowReselling', $event)" />
                  <div>
                    <strong>{{ 'distribution.modalDetails.allowReselling' | translate }}</strong>
                    <p>{{ 'distribution.modalDetails.allowResellingDesc' | translate }}</p>
                  </div>
                </label>
                <label class="toggle-card">
                  <input type="checkbox" [checked]="modalDraft.hideOriginalCost" (change)="onDraftToggle('hideOriginalCost', $event)" />
                  <div>
                    <strong>{{ 'distribution.modalDetails.hideCost' | translate }}</strong>
                    <p>{{ 'distribution.modalDetails.hideCostDesc' | translate }}</p>
                  </div>
                </label>
                @if (activeVisibilityConfig().showAgentSelector) {
                  <div class="toggle-card static">
                    <div>
                      <strong>{{ 'distribution.modalDetails.privateSingleAgent' | translate }}</strong>
                      <p>{{ 'distribution.modalDetails.privateSingleAgentDesc' | translate }}</p>
                    </div>
                  </div>
                }
              </div>
            </section>

            @if (activeVisibilityConfig().showAgentSelector) {
              <section class="modal-section">
                <h5><span class="material-icons-round">person_search</span> {{ 'distribution.modalDetails.agentAccessTitle' | translate }}</h5>
                <div class="selected-box">
                  <strong>{{ 'distribution.modalDetails.selectedAgentTitle' | translate }}</strong>
                  @if (modalDraft.selectedAgent) {
                    <div class="selected-agent-card">
                      <div class="selected-agent-main">
                        <div class="agent-top-line">
                          <span class="material-icons-round">badge</span>
                          <strong>{{ modalDraft.selectedAgent.name }}</strong>
                        </div>
                        <p>{{ modalDraft.selectedAgent.companyName }}</p>
                        <small>{{ 'distribution.modalDetails.agentCodeLabel' | translate }}: {{ selectedAgentCode() }}</small>
                      </div>
                      <div class="selected-agent-actions">
                        <button type="button" class="btn-link" (click)="focusAgentSearch()">
                          {{ 'distribution.modalDetails.changeAgent' | translate }}
                        </button>
                        <button type="button" class="btn-link danger" (click)="removeDraftAgent()">
                          {{ 'distribution.modalDetails.removeAgent' | translate }}
                        </button>
                      </div>
                    </div>
                  } @else {
                    <p class="empty-search">{{ 'distribution.modalDetails.noAgentSelected' | translate }}</p>
                  }
                </div>
                <div class="agent-selector">
                  <input
                    #agentSearchInput
                    type="text"
                    class="agent-search"
                    [(ngModel)]="agentSearch"
                    [placeholder]="'distribution.modalDetails.searchAgent' | translate" />
                  <div class="selector-list">
                    @for (agent of filteredAgents(); track agent.id) {
                      <label class="single-select-option">
                        <input
                          type="radio"
                          name="private-agent"
                          [checked]="modalDraft.selectedAgent?.id === agent.id"
                          (change)="selectDraftAgent(agent)" />
                        <span>{{ agent.name }} - {{ agent.companyName }}</span>
                      </label>
                    } @empty {
                      <p class="empty-search">{{ 'distribution.modalDetails.noAgentResults' | translate }}</p>
                    }
                  </div>
                </div>
                @if (privateSelectionError) {
                  <p class="validation-msg">{{ privateSelectionError }}</p>
                }
              </section>
            }

            <section class="modal-section">
              <h5><span class="material-icons-round">payments</span> {{ 'distribution.modalDetails.pricingAuthorityTitle' | translate }}</h5>
              <div class="option-cards">
                @for (priceOption of pricingOptions; track priceOption.value) {
                  <button
                    type="button"
                    class="option-card"
                    [class.active]="modalDraft.pricingPermission === priceOption.value"
                    (click)="modalDraft.pricingPermission = priceOption.value">
                    <strong>{{ priceOption.titleKey | translate }}</strong>
                    <p>{{ priceOption.descriptionKey | translate }}</p>
                  </button>
                }
              </div>
            </section>

            <section class="modal-section">
              <h5><span class="material-icons-round">percent</span> {{ 'distribution.modalDetails.commissionModelTitle' | translate }}</h5>
              <div class="segmented-row">
                @for (commissionOption of commissionOptions; track commissionOption.value) {
                  <button
                    type="button"
                    class="segmented-btn"
                    [class.active]="modalDraft.commissionModel === commissionOption.value"
                    (click)="modalDraft.commissionModel = commissionOption.value">
                    {{ commissionOption.labelKey | translate }}
                  </button>
                }
              </div>
              <div class="inline-input-grid">
                <label class="inline-field">
                  <span>{{ modalDraft.commissionModel === CommissionModel.PERCENTAGE ? ('distribution.modalDetails.commissionPercent' | translate) : ('distribution.modalDetails.commissionFixed' | translate) }}</span>
                  <input
                    type="number"
                    min="0"
                    [value]="modalDraft.commissionValue"
                    (input)="onDraftNumber('commissionValue', $event)" />
                </label>
                <label class="inline-field">
                  <span>{{ 'distribution.modalDetails.allocatedInventory' | translate }}</span>
                  <input
                    type="number"
                    min="1"
                    [value]="modalDraft.allocatedInventory"
                    (input)="onDraftNumber('allocatedInventory', $event)" />
                </label>
              </div>
            </section>

            <div class="modal-footer">
              <button type="button" class="btn btn--secondary" (click)="cancelDetails()">{{ 'common.buttons.cancel' | translate }}</button>
              <button type="button" class="btn btn--primary" (click)="saveDetails()">{{ 'distribution.modalDetails.saveSettings' | translate }}</button>
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

    .visibility-option.private-option.active {
      border-color: #7a5a1d;
      background: #fff8e9;
      box-shadow: 0 0 0 1px #f4deb1;
    }

    .visibility-option .material-icons-round {
      font-size: 18px;
      color: var(--sero-primary);
      margin-top: 2px;
    }

    .visibility-option.private-option .material-icons-round {
      color: #7a5a1d;
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
      max-height: 180px;
      overflow-y: auto;
      border: 1px solid var(--sero-border-light);
      border-radius: 10px;
      padding: 8px;
      background: #fff;
    }

    .selector-list label {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.8rem;
      color: var(--sero-text-secondary);
      cursor: pointer;
    }

    .single-select-option {
      width: 100%;
      justify-content: space-between;
      border: 1px solid #edf2e8;
      border-radius: 8px;
      padding: 6px 8px;
      background: #fff;
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
      animation: modalIn 180ms ease;
    }

    .details-modal-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--sero-border-light);
      padding-bottom: 8px;
    }

    .details-modal-head p {
      margin: 2px 0 0;
      font-size: 0.78rem;
      color: var(--sero-text-secondary);
      font-weight: 500;
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

    .modal-section {
      border: 1px solid #ecefe5;
      border-radius: 12px;
      padding: 10px;
      background: #fcfdfb;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .modal-section h5 {
      margin: 0;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-size: 0.88rem;
      color: var(--sero-text-primary);
      font-weight: 800;
    }

    .modal-section h5 .material-icons-round {
      font-size: 16px;
      color: var(--sero-primary);
    }

    .toggle-cards {
      display: grid;
      grid-template-columns: 1fr;
      gap: 8px;
    }

    .toggle-card {
      border: 1px solid #e4e9de;
      border-radius: 10px;
      padding: 8px 10px;
      display: flex;
      align-items: flex-start;
      gap: 8px;
      background: #fff;
      cursor: pointer;
    }

    .toggle-card.static {
      cursor: default;
      background: #f9fbf6;
    }

    .toggle-card strong {
      font-size: 0.82rem;
      color: var(--sero-text-primary);
      display: block;
      margin-bottom: 2px;
    }

    .toggle-card p {
      margin: 0;
      font-size: 0.75rem;
      color: var(--sero-text-secondary);
    }

    .segmented-row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .segmented-btn {
      border: 1px solid var(--sero-border);
      border-radius: 9px;
      background: #fff;
      color: var(--sero-text-secondary);
      padding: 7px 10px;
      font-size: 0.79rem;
      font-weight: 700;
      cursor: pointer;
      transition: all var(--t-fast);
    }

    .segmented-btn.active {
      border-color: var(--sero-primary);
      background: var(--sero-primary-50);
      color: var(--sero-primary-dark);
    }

    .agent-selector {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .selected-box {
      border: 1px solid #e7ecdf;
      border-radius: 10px;
      background: #fff;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .selected-box strong {
      font-size: 0.79rem;
      color: var(--sero-text-primary);
    }

    .selected-agent-card {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 10px;
      border: 1px solid #dfe7d3;
      border-radius: 10px;
      background: #f8fbf4;
      padding: 8px;
    }

    .selected-agent-main {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }

    .selected-agent-main p,
    .selected-agent-main small {
      margin: 0;
      color: var(--sero-text-secondary);
    }

    .selected-agent-main small {
      font-size: 0.72rem;
    }

    .agent-top-line {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    .agent-top-line .material-icons-round {
      font-size: 14px;
      color: var(--sero-primary);
    }

    .selected-agent-actions {
      display: inline-flex;
      flex-direction: column;
      gap: 4px;
    }

    .btn-link {
      border: none;
      background: transparent;
      color: var(--sero-primary-dark);
      font-size: 0.74rem;
      cursor: pointer;
      text-align: right;
      padding: 0;
      font-weight: 700;
    }

    .btn-link.danger {
      color: #a34444;
    }

    .selected-chip {
      display: inline-flex;
      align-items: center;
      gap: 2px;
      border: 1px solid #d8e0cd;
      border-radius: 999px;
      background: #f6f9f2;
      color: #384532;
      padding: 3px 8px;
      font-size: 0.75rem;
      cursor: pointer;
    }

    .selected-chip .material-icons-round {
      font-size: 13px;
    }

    .agent-search {
      height: 36px;
      border: 1px solid var(--sero-border);
      border-radius: 9px;
      padding: 8px 10px;
      outline: none;
      font-size: 0.8rem;
      color: var(--sero-text-primary);
      background: #fff;
    }

    .empty-search {
      margin: 0;
      font-size: 0.78rem;
      color: var(--sero-text-muted);
    }

    .validation-msg {
      margin: 0;
      color: #b33a3a;
      font-size: 0.78rem;
      font-weight: 700;
    }

    .option-cards {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }

    .option-card {
      border: 1px solid var(--sero-border);
      border-radius: 10px;
      padding: 9px 10px;
      text-align: right;
      background: #fff;
      cursor: pointer;
      transition: all var(--t-fast);
    }

    .option-card:hover {
      border-color: var(--sero-border-strong);
    }

    .option-card.active {
      border-color: var(--sero-primary);
      background: var(--sero-primary-50);
      box-shadow: 0 0 0 1px var(--sero-primary-100);
    }

    .option-card strong {
      display: block;
      font-size: 0.8rem;
      color: var(--sero-text-primary);
      margin-bottom: 2px;
    }

    .option-card p {
      margin: 0;
      font-size: 0.74rem;
      color: var(--sero-text-secondary);
      line-height: 1.35;
    }

    .inline-input-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px;
    }

    .inline-field {
      display: flex;
      flex-direction: column;
      gap: 4px;
      font-size: 0.76rem;
      color: var(--sero-text-secondary);
    }

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

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      border-top: 1px solid var(--sero-border-light);
      padding-top: 10px;
      position: sticky;
      bottom: 0;
      background: #fff;
    }

    @keyframes modalIn {
      from { opacity: 0; transform: translateY(8px) scale(0.98); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }

    @media (max-width: 900px) {
      .visibility-options {
        grid-template-columns: 1fr;
      }
      .details-modal {
        width: 100%;
        max-height: 92vh;
        border-radius: 12px;
      }
      .option-cards { grid-template-columns: 1fr; }
      .inline-input-grid { grid-template-columns: 1fr; }
      .modal-footer { justify-content: stretch; }
      .modal-footer .btn { flex: 1; }
    }
  `]
})
export class PackageVisibilityComponent implements OnInit {
  @Output() visibilityChanged = new EventEmitter<void>();
  readonly PricingPermission = PricingPermission;
  readonly CommissionModel = CommissionModel;
  showDetailsPopup = false;
  agentSearch = '';
  privateSelectionError = '';
  modalDraft: PackageVisibilityState = {
    visibilityType: 'shared',
    selectedAgent: null,
    allowReselling: true,
    hideOriginalCost: true,
    subagentAccessMode: SubagentAccessMode.ALL,
    pricingPermission: PricingPermission.AGENT_MARKUP,
    commissionModel: CommissionModel.PERCENTAGE,
    commissionValue: 8,
    allocatedInventory: 50
  };

  readonly visibility;
  agents: Agent[] = [];

  readonly publicVisibilityConfig = {
    type: 'shared' as PackageVisibilityType,
    titleKey: 'distribution.modalDetails.publicModalTitle',
    subtitleKey: 'distribution.modalDetails.publicModalSubtitle',
    showAgentSelector: false
  };

  readonly privateVisibilityConfig = {
    type: 'private' as PackageVisibilityType,
    titleKey: 'distribution.modalDetails.privateModalTitle',
    subtitleKey: 'distribution.modalDetails.privateModalSubtitle',
    showAgentSelector: true
  };

  readonly options: Array<{
    type: PackageVisibilityType;
    icon: string;
    titleKey: string;
    descriptionKey: string;
  }> = [
    {
      type: 'shared',
      icon: 'public',
      titleKey: 'distribution.modalDetails.sharedTitle',
      descriptionKey: 'distribution.modalDetails.sharedDesc'
    },
    {
      type: 'private',
      icon: 'lock',
      titleKey: 'distribution.modalDetails.privateTitle',
      descriptionKey: 'distribution.modalDetails.privateDesc'
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
    if (this.showDetailsPopup) {
      this.saveDetails();
    }
    this.builderService.setVisibilityType(type);
    this.modalDraft = this.cloneState(this.visibility());
    this.visibilityChanged.emit();
  }

  openDetails(): void {
    this.modalDraft = this.cloneState(this.visibility());
    this.agentSearch = '';
    this.privateSelectionError = '';
    this.showDetailsPopup = true;
  }

  cancelDetails(): void {
    this.showDetailsPopup = false;
    this.agentSearch = '';
    this.privateSelectionError = '';
  }

  saveDetails(): void {
    if (this.modalDraft.visibilityType === 'private' && !this.modalDraft.selectedAgent?.id) {
      this.privateSelectionError = 'يجب اختيار الوكيل الخاص بالباقة';
      return;
    }

    this.builderService.setVisibilityState({
      ...this.modalDraft,
      selectedAgent: this.modalDraft.visibilityType === 'private'
        ? this.modalDraft.selectedAgent
        : null
    });
    this.visibilityChanged.emit();
    this.cancelDetails();
  }

  activeVisibilityConfig() {
    const type = this.modalDraft.visibilityType || this.visibility().visibilityType;
    if (type === 'private') {
      return this.privateVisibilityConfig;
    }
    return this.publicVisibilityConfig;
  }

  filteredAgents(): Agent[] {
    const q = this.agentSearch.trim().toLowerCase();
    if (!q) {
      return this.agents;
    }

    return this.agents.filter((agent) => `${agent.name} ${agent.companyName}`.toLowerCase().includes(q));
  }

  selectedAgentCode(): string {
    const selected = this.modalDraft.selectedAgent;
    if (!selected) {
      return '-';
    }

    return selected.agentCode || selected.licenseNumber || `AG-${selected.id}`;
  }

  focusAgentSearch(): void {
    this.agentSearch = '';
  }

  selectDraftAgent(agent: Agent): void {
    this.privateSelectionError = '';
    this.modalDraft = {
      ...this.modalDraft,
      selectedAgent: { ...agent }
    };
  }

  removeDraftAgent(): void {
    this.modalDraft = {
      ...this.modalDraft,
      selectedAgent: null
    };
  }

  onDraftToggle(
    key: 'allowReselling' | 'hideOriginalCost',
    event: Event
  ): void {
    this.modalDraft = { ...this.modalDraft, [key]: (event.target as HTMLInputElement).checked };
  }

  onDraftNumber(key: 'commissionValue' | 'allocatedInventory', event: Event): void {
    const value = Number((event.target as HTMLInputElement).value || 0);
    this.modalDraft = { ...this.modalDraft, [key]: key === 'allocatedInventory' ? Math.max(1, value) : value };
  }

  readonly pricingOptions = [
    {
      value: PricingPermission.FIXED_BY_ADMIN,
      titleKey: 'distribution.modalDetails.fixedByAdminTitle',
      descriptionKey: 'distribution.modalDetails.fixedByAdminDesc'
    },
    {
      value: PricingPermission.AGENT_MARKUP,
      titleKey: 'distribution.modalDetails.agentMarkupTitle',
      descriptionKey: 'distribution.modalDetails.agentMarkupDesc'
    },
    {
      value: PricingPermission.AGENT_FULL_CONTROL,
      titleKey: 'distribution.modalDetails.fullControlTitle',
      descriptionKey: 'distribution.modalDetails.fullControlDesc'
    }
  ];

  readonly commissionOptions = [
    { value: CommissionModel.PERCENTAGE, labelKey: 'distribution.modalDetails.percentage' },
    { value: CommissionModel.FIXED_AMOUNT, labelKey: 'distribution.modalDetails.fixedAmount' }
  ];

  private cloneState(state: PackageVisibilityState): PackageVisibilityState {
    return {
      ...state,
      selectedAgent: state.selectedAgent ? { ...state.selectedAgent } : null
    };
  }
}
