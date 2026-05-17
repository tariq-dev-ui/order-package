import {
  ChangeDetectionStrategy, Component, inject, OnDestroy, OnInit, signal,
} from '@angular/core';
import { CommonModule, DatePipe, TitleCasePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AgentRequestsService } from './agent-requests.service';
import { RequestModelLocal } from './agent-requests.mock';
import { SingleAgentSelectorComponent } from 'src/app/pages/agents-list/components/single-agent-selector/single-agent-selector.component';
import { VoucherSectionComponent } from '../../../features/master/orders/components/voucher-section.component';
import { ConfirmationDialogComponent } from 'src/app/components/confirmation-dialog/confirmation-dialog.component';
import { ChatDialogComponent } from '../../../features/master/orders/components/chat-dialog.component';

@Component({
  selector: 'agent-requests-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, DatePipe, TitleCasePipe, SingleAgentSelectorComponent, VoucherSectionComponent],
  template: `
    <div class="ar-page">

      <!-- Filters -->
      <div class="ar-filter-card">
        <div class="ar-filter-header">
          <div class="ar-filter-title">
            <i class="fas fa-filter ar-icon-primary"></i>
            <span>Filters</span>
          </div>
          <button class="ar-toggle-btn" (click)="toggleFilterPanel()" [attr.aria-expanded]="isFilterPanelOpen()">
            <span>{{ isFilterPanelOpen() ? 'Hide' : 'Show' }}</span>
            <i class="fas" [class.fa-chevron-up]="isFilterPanelOpen()" [class.fa-chevron-down]="!isFilterPanelOpen()"></i>
          </button>
        </div>

        @if (isFilterPanelOpen()) {
          <div class="ar-filter-body">
            <!-- Tab buttons -->
            <div class="ar-tab-row">
              <button class="ar-tab-btn" [class.active]="activeFilterTab() === 'agent'" (click)="setFilterTab('agent')">By Agent</button>
              <button class="ar-tab-btn" [class.active]="activeFilterTab() === 'request'" (click)="setFilterTab('request')">By Request ID</button>
            </div>

            <!-- Agent filter -->
            @if (activeFilterTab() === 'agent') {
              <div class="ar-filter-field">
                <app-single-agent-selector
                  [label]="'Select Agent'"
                  [placeholder]="'Choose an agent'"
                  [selectedAgentId]="selectedAgentId() ?? null"
                  (agentIdChange)="onAgentFilterChange($event)"
                ></app-single-agent-selector>
              </div>
            }

            <!-- Request ID filter -->
            @if (activeFilterTab() === 'request') {
              <div class="ar-filter-field">
                <div class="ar-request-filter-row">
                  <div class="ar-request-filter-input-wrap">
                    <label class="ar-label">Request ID</label>
                    <input
                      type="number"
                      min="1"
                      class="ar-input"
                      [value]="requestIdText()"
                      (input)="onRequestIdInput($event)"
                      (keydown.enter)="applyRequestIdFilter()"
                      placeholder="e.g. 1001"
                    />
                  </div>
                  <button class="ar-btn-primary" (click)="applyRequestIdFilter()" [disabled]="!requestIdText().trim().length">Apply</button>
                  <button class="ar-btn-outline" (click)="clearRequestIdFilter()" [disabled]="!requestIdText().trim().length && requestIdFilter() == null">Clear</button>
                </div>
                <p class="ar-hint">Tip: when a Request ID is set, the page shows that single order.</p>
              </div>
            }
          </div>
        }
      </div>

      <!-- List -->
      <div class="ar-list">
        @if (isLoading()) {
          <div class="ar-loading">
            <i class="fas fa-spinner fa-spin ar-spinner-icon"></i>
            <p>Loading orders...</p>
          </div>
        } @else {
          @for (req of requests(); track req.Id) {
            <div class="ar-accordion" [class.open]="isExpanded(req.Id)">
              <!-- Accordion header -->
              <button class="ar-accordion-header" (click)="toggleAccordion(req.Id)" [attr.aria-expanded]="isExpanded(req.Id)">
                <!-- Column 1: ID + Title -->
                <div class="ar-acc-col1">
                  <div class="ar-acc-id-box">
                    <span class="ar-acc-id">{{ req.Id }}</span>
                    <i class="fas fa-suitcase"></i>
                  </div>
                  <div>
                    <div class="ar-acc-title">{{ req.Title | titlecase }}</div>
                    <div class="ar-acc-date">
                      <i class="far fa-calendar"></i>
                      {{ req.AddedDate | date:'dd MMM yyyy, h:mm a' }}
                    </div>
                  </div>
                </div>

                <!-- Column 2: Agent info -->
                <div class="ar-acc-col2">
                  @if (req.AgentName || req.AgentCountry) {
                    <div class="ar-acc-agent">
                      @if (req.AgentName) {
                        <div class="ar-acc-agent-name">
                          <i class="fas fa-user ar-icon-primary"></i>
                          <span>{{ req.AgentName }}</span>
                        </div>
                      }
                      @if (req.AgentCountry) {
                        <div class="ar-acc-agent-country">
                          <i class="fas fa-map-marker-alt"></i>
                          <span>{{ req.AgentCountry }}</span>
                        </div>
                      }
                    </div>
                  } @else {
                    <div class="ar-acc-no-agent">
                      <i class="fas fa-user-slash"></i>
                      <span>No Agent Assigned</span>
                    </div>
                  }
                </div>

                <!-- Column 3: Status + chat + chevron -->
                <div class="ar-acc-col3">
                  <span class="ar-status-badge" [class]="getStatusClass(req.StatusName)">
                    <i [class]="getStatusIcon(req.StatusName)"></i>
                    {{ req.StatusName | titlecase }}
                  </span>
                  <button class="ar-chat-btn" title="Messages" (click)="openChat($event, req)">
                    <i class="fas fa-comments"></i>
                  </button>
                  <i class="fas fa-chevron-down ar-chevron" [class.rotated]="isExpanded(req.Id)"></i>
                </div>
              </button>

              <!-- Accordion content -->
              @if (isExpanded(req.Id)) {
                <div class="ar-accordion-body">
                  <!-- Request summary -->
                  <div class="ar-req-summary">
                    <div class="ar-req-info-row">
                      <div class="ar-req-info-item">
                        <span class="ar-req-info-label">Package Code</span>
                        <span class="ar-req-info-value">{{ req.PackageCode || '—' }}</span>
                      </div>
                      <div class="ar-req-info-item">
                        <span class="ar-req-info-label">Start – End</span>
                        <span class="ar-req-info-value">{{ req.StartDate | date:'dd MMM' }} – {{ req.EndDate | date:'dd MMM yyyy' }}</span>
                      </div>
                      <div class="ar-req-info-item">
                        <span class="ar-req-info-label">Passengers</span>
                        <span class="ar-req-info-value">{{ req.PassengerCount }}</span>
                      </div>
                      <div class="ar-req-info-item">
                        <span class="ar-req-info-label">Quantity</span>
                        <span class="ar-req-info-value">{{ req.RequestedQuantity }}</span>
                      </div>
                      <div class="ar-req-info-item">
                        <span class="ar-req-info-label">Price</span>
                        <span class="ar-req-info-value">{{ req.Price | number }} SAR</span>
                      </div>
                      @if (req.Notes) {
                        <div class="ar-req-info-item ar-req-notes">
                          <span class="ar-req-info-label">Notes</span>
                          <span class="ar-req-info-value">{{ req.Notes }}</span>
                        </div>
                      }
                    </div>
                  </div>

                  <!-- Vouchers -->
                  <voucher-section [requestId]="req.Id" [agentId]="req.AgentId" />

                  <!-- Delete button -->
                  <div class="ar-delete-row">
                    <button class="ar-delete-btn" (click)="deleteRequest(req.Id)">
                      <i class="fas fa-trash-alt"></i>
                      Delete Request
                    </button>
                  </div>
                </div>
              }
            </div>
          }

          @if (requests().length === 0 && !isLoading()) {
            <div class="ar-empty">
              <i class="fas fa-inbox"></i>
              <h3>No requests found</h3>
              <p>Try changing the filter or add a new request.</p>
            </div>
          }

          <!-- Pagination -->
          @if (totalPages() > 1) {
            <nav class="ar-pagination">
              <button class="ar-page-btn" [disabled]="page() === 1" (click)="setPage(page() - 1)">
                <i class="fas fa-chevron-left"></i>
              </button>
              @for (p of pageItems(); track $index) {
                @if (p === '...') {
                  <span class="ar-page-ellipsis">…</span>
                } @else {
                  <button class="ar-page-btn" [class.active]="p === page()" (click)="setPage(+p)">{{ p }}</button>
                }
              }
              <button class="ar-page-btn" [disabled]="page() === totalPages()" (click)="setPage(page() + 1)">
                <i class="fas fa-chevron-right"></i>
              </button>
            </nav>
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .ar-page { min-height: 100vh; }

    /* ── Filter card ── */
    .ar-filter-card {
      background: #fff; border: 1px solid #e5e7eb; border-radius: 8px; margin-bottom: 24px;
    }
    .ar-filter-header {
      display: flex; align-items: center; justify-content: space-between;
      gap: 12px; padding: 16px 20px;
    }
    .ar-filter-title {
      display: flex; align-items: center; gap: 8px;
      color: #1f2937; font-weight: 600;
    }
    .ar-icon-primary { color: var(--sero-primary, #3a472a); }
    .ar-toggle-btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 8px 12px; border: 1px solid #e5e7eb; border-radius: 6px;
      background: #fff; color: #374151; font-size: 13px; cursor: pointer;
    }
    .ar-toggle-btn:hover { background: #f9fafb; }
    .ar-filter-body { padding: 0 20px 20px; }

    .ar-tab-row { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
    .ar-tab-btn {
      padding: 8px 16px; border: 1px solid #e5e7eb; border-radius: 6px;
      background: #fff; color: #374151; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s;
    }
    .ar-tab-btn.active {
      background: var(--sero-primary-50, #f2f4ee);
      border-color: var(--sero-primary-200, #b6c9a2);
      color: var(--sero-primary, #3a472a);
    }
    .ar-filter-field { }
    .ar-request-filter-row {
      display: flex; flex-wrap: wrap; align-items: flex-end; gap: 12px;
    }
    .ar-request-filter-input-wrap { min-width: 260px; }
    .ar-label { display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 4px; }
    .ar-input {
      width: 100%; height: 44px; padding: 0 12px; border: 1px solid #d1d5db; border-radius: 6px;
      font-size: 14px; outline: none; box-sizing: border-box;
    }
    .ar-input:focus { border-color: var(--sero-primary, #3a472a); box-shadow: 0 0 0 3px rgba(58,71,42,.12); }
    .ar-btn-primary {
      height: 44px; padding: 0 16px; background: var(--sero-primary, #3a472a); color: #fff;
      border: none; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; transition: background 0.15s;
    }
    .ar-btn-primary:hover { background: var(--sero-primary-light, #4d6038); }
    .ar-btn-primary:disabled { background: #d1d5db; cursor: not-allowed; }
    .ar-btn-outline {
      height: 44px; padding: 0 16px; background: #fff; color: #374151;
      border: 1px solid #e5e7eb; border-radius: 6px; font-size: 13px; cursor: pointer;
    }
    .ar-btn-outline:hover { background: #f9fafb; }
    .ar-btn-outline:disabled { opacity: .5; cursor: not-allowed; }
    .ar-hint { font-size: 11px; color: #9ca3af; margin: 8px 0 0; }

    /* ── Loading / Empty ── */
    .ar-loading {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 48px; gap: 12px; color: #6b7280;
    }
    .ar-spinner-icon { font-size: 2rem; color: var(--sero-primary, #3a472a); }
    .ar-empty {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 64px 24px; text-align: center; color: #9ca3af;
    }
    .ar-empty i { font-size: 3rem; margin-bottom: 16px; }
    .ar-empty h3 { font-size: 18px; font-weight: 600; color: #6b7280; margin: 0 0 8px; }
    .ar-empty p  { font-size: 14px; margin: 0; }

    /* ── Accordion ── */
    .ar-accordion {
      background: #fff; border: 1px solid #e5e7eb; border-radius: 8px;
      margin-bottom: 12px; box-shadow: 0 1px 3px rgba(0,0,0,.06); overflow: hidden;
    }
    .ar-accordion-header {
      width: 100%; display: grid; grid-template-columns: 1fr 1fr auto;
      gap: 16px; align-items: center; padding: 20px 24px;
      background: none; border: none; cursor: pointer; text-align: left;
      transition: background 0.15s;
    }
    .ar-accordion-header:hover { background: #f9fafb; }

    .ar-acc-col1 { display: flex; align-items: center; gap: 16px; }
    .ar-acc-id-box {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      padding: 10px 12px; border-radius: 10px;
      background: var(--sero-primary-50, #f2f4ee); color: var(--sero-primary, #3a472a);
      flex-shrink: 0;
    }
    .ar-acc-id { font-size: 13px; font-weight: 700; }
    .ar-acc-id-box i { font-size: 16px; margin-top: 2px; }
    .ar-acc-title { font-size: 15px; font-weight: 600; color: #111827; }
    .ar-acc-date { font-size: 12px; color: #9ca3af; margin-top: 4px; }
    .ar-acc-date i { margin-right: 4px; }

    .ar-acc-col2 { display: flex; justify-content: center; align-items: center; }
    .ar-acc-agent { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .ar-acc-agent-name { display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 600; color: #1f2937; }
    .ar-acc-agent-country { font-size: 12px; color: #9ca3af; display: flex; align-items: center; gap: 4px; }
    .ar-acc-no-agent { display: flex; flex-direction: column; align-items: center; gap: 4px; font-size: 12px; color: #9ca3af; text-align: center; }

    .ar-acc-col3 { display: flex; align-items: center; justify-content: flex-end; gap: 12px; }

    /* Status badges */
    .ar-status-badge {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: 12px; font-weight: 500; padding: 6px 12px; border-radius: 999px;
      border: 1px solid;
    }
    .ar-status-badge.approved, .ar-status-badge.approvedbymanager {
      background: #f0fdf4; color: #166534; border-color: #bbf7d0;
    }
    .ar-status-badge.pending {
      background: #fffbeb; color: #92400e; border-color: #fde68a;
    }
    .ar-status-badge.rejected {
      background: #fef2f2; color: #991b1b; border-color: #fecaca;
    }
    .ar-status-badge.new {
      background: #eff6ff; color: #1e40af; border-color: #bfdbfe;
    }
    .ar-status-badge.completed {
      background: #faf5ff; color: #6b21a8; border-color: #e9d5ff;
    }

    .ar-chat-btn {
      width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;
      background: none; border: none; cursor: pointer; color: #9ca3af; border-radius: 6px; position: relative;
    }
    .ar-chat-btn:hover { color: var(--sero-primary, #3a472a); background: var(--sero-primary-50, #f2f4ee); }
    .ar-chat-btn i { font-size: 18px; }

    .ar-chevron { font-size: 18px; color: var(--sero-primary-200, #b6c9a2); transition: transform 0.3s; }
    .ar-chevron.rotated { transform: rotate(180deg); }

    /* Accordion body */
    .ar-accordion-body {
      border-top: 1px solid #f3f4f6; padding: 24px; background: rgba(255,255,255,.8);
    }

    .ar-req-summary { margin-bottom: 20px; }
    .ar-req-info-row {
      display: flex; flex-wrap: wrap; gap: 16px;
    }
    .ar-req-info-item {
      display: flex; flex-direction: column; gap: 2px;
      padding: 10px 14px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px;
      min-width: 120px;
    }
    .ar-req-info-item.ar-req-notes { flex: 1 1 100%; }
    .ar-req-info-label { font-size: 11px; color: #9ca3af; font-weight: 500; text-transform: uppercase; letter-spacing: .4px; }
    .ar-req-info-value { font-size: 13px; font-weight: 600; color: #1f2937; }

    .ar-delete-row { display: flex; justify-content: flex-end; margin-top: 16px; padding-top: 16px; }
    .ar-delete-btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 8px 16px; background: #fef2f2; color: #dc2626;
      border: 1px solid #fecaca; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s;
    }
    .ar-delete-btn:hover { background: #fee2e2; }

    /* Pagination */
    .ar-pagination { display: flex; align-items: center; justify-content: center; gap: 4px; margin-top: 32px; }
    .ar-page-btn {
      width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;
      border: 1px solid #e5e7eb; border-radius: 8px; background: #fff; color: #374151;
      font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.15s;
    }
    .ar-page-btn:hover:not(:disabled):not(.active) { background: #f9fafb; }
    .ar-page-btn.active { background: var(--sero-primary, #3a472a); color: #fff; border-color: var(--sero-primary, #3a472a); }
    .ar-page-btn:disabled { opacity: .4; cursor: not-allowed; }
    .ar-page-ellipsis { width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; color: #9ca3af; }
  `],
})
export class AgentRequestsPageComponent implements OnInit, OnDestroy {
  private readonly service = inject(AgentRequestsService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);

  requests = signal<RequestModelLocal[]>([]);
  isLoading = signal(false);
  page = signal(1);
  totalPages = signal(1);
  readonly pageSize = 10;

  isFilterPanelOpen = signal(false);
  activeFilterTab = signal<'agent' | 'request'>('agent');
  requestIdText = signal('');
  requestIdFilter = signal<number | undefined>(undefined);
  selectedAgentId = signal<number | undefined>(undefined);

  expandedStates = signal<Map<number, boolean>>(new Map());

  ngOnInit() {
    this.loadCount();
    this.loadRequests();
  }

  ngOnDestroy() {}

  toggleFilterPanel() { this.isFilterPanelOpen.update(v => !v); }

  setFilterTab(tab: 'agent' | 'request') {
    this.activeFilterTab.set(tab);
    this.page.set(1);
    this.refresh();
  }

  onRequestIdInput(ev: Event) {
    this.requestIdText.set((ev.target as HTMLInputElement).value ?? '');
  }

  applyRequestIdFilter() {
    const raw = this.requestIdText().trim();
    if (!raw.length) { this.requestIdFilter.set(undefined); this.refresh(); return; }
    const v = Number(raw);
    if (!Number.isFinite(v) || v <= 0) {
      this.snackBar.open('Please enter a valid Request ID', 'Close', { duration: 2500 }); return;
    }
    this.requestIdFilter.set(v);
    this.page.set(1);
    this.refresh();
  }

  clearRequestIdFilter() {
    this.requestIdText.set('');
    this.requestIdFilter.set(undefined);
    this.page.set(1);
    this.refresh();
  }

  onAgentFilterChange(agentId: number | undefined) {
    this.selectedAgentId.set(agentId);
    this.page.set(1);
    this.loadCount();
    this.loadRequests();
  }

  setPage(p: number) { this.page.set(p); this.loadRequests(); }

  refresh() { this.loadCount(); this.loadRequests(); }

  private loadRequests() {
    const tab = this.activeFilterTab();
    const pageIndex = this.page() - 1;
    const agentId = tab === 'agent' ? this.selectedAgentId() : undefined;
    const requestId = tab === 'request' ? this.requestIdFilter() : undefined;

    this.isLoading.set(true);
    this.service.getRequests({ pageIndex, pageSize: this.pageSize, agentId, requestId }).subscribe({
      next: data => { this.requests.set(data); this.isLoading.set(false); },
      error: ()   => { this.requests.set([]); this.isLoading.set(false); },
    });
  }

  private loadCount() {
    const tab = this.activeFilterTab();
    const requestId = tab === 'request' ? this.requestIdFilter() : undefined;
    if (tab === 'request' && requestId) { this.totalPages.set(1); return; }
    const agentId = tab === 'agent' ? this.selectedAgentId() : undefined;
    this.service.getRequestsCount({ agentId, requestId }).subscribe({
      next: count => this.totalPages.set(Math.max(1, Math.ceil(count / this.pageSize))),
      error: () => this.totalPages.set(1),
    });
  }

  deleteRequest(id: number) {
    this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: 'Delete Request',
        message: 'Are you sure you want to delete this request? This action cannot be undone.',
        onConfirm: () => {
          this.service.deleteRequest(id).subscribe({
            next: () => { this.snackBar.open('Request deleted successfully', 'Close', { duration: 3000 }); this.refresh(); },
            error: () => { this.snackBar.open('Error deleting request', 'Close', { duration: 3000 }); },
          });
        },
      },
    });
  }

  openChat(ev: Event, req: RequestModelLocal) {
    ev.stopPropagation();
    this.dialog.open(ChatDialogComponent, {
      data: { requestId: req.Id, agentId: req.AgentId, requestTitle: req.Title ?? '' },
      width: '600px', maxWidth: '98vw', height: '92vh', panelClass: 'chat-dialog-panel', disableClose: false,
    });
  }

  toggleAccordion(id: number) {
    const m = new Map(this.expandedStates());
    m.set(id, !m.get(id));
    this.expandedStates.set(m);
  }

  isExpanded(id: number): boolean { return this.expandedStates().get(id) ?? false; }

  /* ── Status helpers ── */
  getStatusClass(status: string | null | undefined): string {
    const s = (status ?? '').toLowerCase().replace(/\s+/g, '');
    const map: Record<string, string> = {
      approved: 'approved', approvedbymanager: 'approvedbymanager',
      pending: 'pending', rejected: 'rejected', new: 'new', completed: 'completed',
    };
    return `ar-status-badge ${map[s] ?? ''}`;
  }

  getStatusIcon(status: string | null | undefined): string {
    const s = (status ?? '').toLowerCase();
    const map: Record<string, string> = {
      approved: 'fas fa-circle-check', approvedbymanager: 'fas fa-circle-check',
      pending: 'fas fa-clock', rejected: 'fas fa-circle-xmark',
      new: 'fas fa-bolt', completed: 'fas fa-flag-checkered',
    };
    return map[s] ?? 'fas fa-circle-info';
  }

  /* ── Pagination items ── */
  pageItems(): (number | '...')[] {
    const total = Math.max(1, this.totalPages());
    const current = this.page();
    const max = 7;
    if (total <= max) return Array.from({ length: total }, (_, i) => i + 1);
    const items: (number | '...')[] = [];
    const side = Math.floor((max - 3) / 2);
    let left = Math.max(2, current - side);
    let right = Math.min(total - 1, current + side);
    if (current - 1 <= side) { left = 2; right = Math.min(total - 1, max - 2); }
    if (total - current <= side) { right = total - 1; left = Math.max(2, total - (max - 3)); }
    items.push(1);
    if (left > 2) items.push('...');
    for (let i = left; i <= right; i++) items.push(i);
    if (right < total - 1) items.push('...');
    items.push(total);
    return items;
  }
}
