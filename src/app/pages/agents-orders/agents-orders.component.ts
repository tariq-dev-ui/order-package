import { ChangeDetectionStrategy, Component, viewChildren, inject, signal } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { AdminAPIClient, RequestModel } from '../../services/admin.api.client';
import { OrderAccordionComponent } from './order-accordion-wrapper/order-accordion-wrapper.component';
import { OrderAccordionItemComponent } from './order-accordion-item/order-accordion-item.component';
import { Pagination } from './components/pagination/pagination';
import { VoucherSectionComponent } from './components/vouchers/voucher-section/voucher-section.component';
import { RequestPackageDetailsComponent } from 'src/app/pages/components/request-package-details/request-package-details.component';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ConfirmationDialogComponent } from 'src/app/components/confirmation-dialog/confirmation-dialog.component';
import { SingleAgentSelectorComponent } from 'src/app/pages/agents-list/components/single-agent-selector/single-agent-selector.component';
import { ChatDialogComponent } from 'src/app/features/master/orders/components/chat-dialog.component';

@Component({
  selector: 'app-agents-orders',
  imports: [Pagination,
    DatePipe,
    TranslateModule,
    VoucherSectionComponent,
    OrderAccordionComponent,
    OrderAccordionItemComponent,
    MatExpansionModule,
    CommonModule,
    RequestPackageDetailsComponent,
    SingleAgentSelectorComponent
  ],
  // ChatDialogComponent is opened via MatDialog, not used in template directly
  templateUrl: './agents-orders.component.html',
  styleUrl: './agents-orders.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})


export class AgentsOrdersComponent {


  voucherSections = viewChildren(VoucherSectionComponent);
  adminClient = inject(AdminAPIClient);
  dialog = inject(MatDialog);
  snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);
  packageRequests = signal<RequestModel[]>([]);
  unreadMessagesByRequest = signal<Map<number, number>>(new Map());
  selectedPackageRequest = signal<RequestModel | null>(null);
  isLoading = signal(false);
  page = signal(1);
  totalPages = signal(1);
  pageSize = 10;
  isFilterPanelOpen = signal(false);
  activeFilterTab = signal<'agent' | 'request'>('agent');

  requestIdText = signal<string>('');
  requestIdFilter = signal<number | undefined>(undefined);

  toggleFilterPanel() {
    this.isFilterPanelOpen.update((open) => !open);
  }

  setFilterTab(tab: 'agent' | 'request') {
    this.activeFilterTab.set(tab);
    this.page.set(1);
    this.refreshPackageRequests();
  }

  onRequestIdInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.requestIdText.set(input.value ?? '');
  }

  applyRequestIdFilter() {
    const raw = this.requestIdText().trim();

    if (!raw.length) {
      this.requestIdFilter.set(undefined);
      this.refreshPackageRequests();
      return;
    }

    const value = Number(raw);
    if (!Number.isFinite(value) || value <= 0) {
      this.snackBar.open(this.translate.instant('Please enter a valid Request ID'), this.translate.instant('Close'), { duration: 2500 });
      return;
    }

    this.requestIdFilter.set(value);
    this.page.set(1);
    this.refreshPackageRequests();
  }

  clearRequestIdFilter() {
    this.requestIdText.set('');
    this.requestIdFilter.set(undefined);
    this.page.set(1);
    this.refreshPackageRequests();
  }

  setPage(newPage: number) {
    this.page.set(newPage);
    this.loadPackageRequests();
  }

  ngOnInit() {
    
    this.loadCount();
    this.loadPackageRequests();
  }

  
  deleteRequest(requestId: number) {
    this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: this.translate.instant('Delete Request'),
        message: this.translate.instant('Are you sure you want to delete this request? This action cannot be undone.'),
        onConfirm: () => {
          this.isLoading.set(true);
          this.adminClient.deletePackageRequest({ requestId }).subscribe({
            next: () => {
              this.snackBar.open(this.translate.instant('Request deleted successfully'), this.translate.instant('Close'), { duration: 3000 });
              this.refreshPackageRequests();
            },
            error: (err) => {
              console.error('Error deleting request:', err);
              this.snackBar.open(this.translate.instant('Error deleting request'), this.translate.instant('Close'), { duration: 3000 });
              this.isLoading.set(false);
            }
          });
        }
      }
    });
  }

  private loadPackageRequests() {
    console.log('Start Loading package requests for page:', this.page());
    const tab = this.activeFilterTab();
    const pageIndex = this.page() - 1;
    const requestId = tab === 'request' ? this.requestIdFilter() : undefined;
    const agentId = tab === 'agent' ? this.selectedAgentId() : undefined;

    const searchQuery: {
      pageIndex: number;
      pageSize: number;
      agentId?: number;
      requestId?: number;
    } = {
      pageIndex,
      pageSize: this.pageSize,
    };

    if (agentId) {
      searchQuery.agentId = agentId;
    }

    if (requestId) {
      searchQuery.requestId = requestId;
    }
    console.log('Loading package requests for page:', this.page(), 'with page index:', pageIndex);
    this.isLoading.set(true);
    this.adminClient.getSeroRequests(searchQuery).subscribe({
      next: (data) => {
        console.log('Active packages:', data);
        const requests = data ?? [];
        this.packageRequests.set(requests);
        // Fetch agent details for each request
        this.isLoading.set(false);
        // this.loadAgentDetails(data ?? []);
      },
      error: (error) => {
        console.error('Error fetching package requests:', error);
        this.isLoading.set(false);
      },
      complete: () => {
        this.isLoading.set(false);
      },
    });
  }

  loadCount() {
    const tab = this.activeFilterTab();
    const requestId = tab === 'request' ? this.requestIdFilter() : undefined;

    if (tab === 'request' && requestId) {
      this.totalPages.set(1);
      return;
    }

    const agentId = tab === 'agent' ? this.selectedAgentId() : undefined;
    const searchQuery = agentId ? { agentId } : {};
    this.adminClient.getSeroRequestsCount(searchQuery).subscribe({
      next: (count) => {
        this.totalPages.set(Math.ceil(count / this.pageSize));
      },
      error: (err) => console.error(err)
    });
  }

  refreshPackageRequests() {
    console.log('Refreshing package requests...');
    this.loadCount();
    this.loadPackageRequests();
  }

  // private loadAgentDetails(requests: RequestModel[]) {
  //   const agentIds = requests
  //     .map(req => req.AgentId)
  //     .filter((id): id is number => id !== null && id !== undefined);

  //   // Remove duplicates
  //   const uniqueAgentIds = [...new Set(agentIds)];

  //   uniqueAgentIds.forEach(agentId => {
  //     if (!this.agents().has(agentId)) {
  //       this.adminClient.getAgent({ agentID: agentId }).subscribe({
  //         next: (agent) => {
  //           const currentAgents = this.agents();
  //           currentAgents.set(agentId, agent);
  //           this.agents.set(new Map(currentAgents));
  //         },
  //         error: (error) => {
  //           console.error('Error fetching agent details:', error);
  //         }
  //       });
  //     }
  //   });
  // }



  onChatRequested(requestId: number, pkg: RequestModel) {
    this.dialog.open(ChatDialogComponent, {
      data: { requestId, agentId: pkg.AgentId ?? 0, requestTitle: pkg.Title ?? '' },
      width: '600px',
      maxWidth: '98vw',
      height: '92vh',
      panelClass: 'chat-dialog-panel',
      disableClose: false,
    });
  }

  getUnreadCount(requestId?: number): number {
    if (!requestId) {
      return 0;
    }

    return this.unreadMessagesByRequest().get(requestId) ?? 0;
  }

  ngOnDestroy() {}

  // Track accordion expansion state for lazy loading vouchers
  accordionExpandedStates = signal<Map<number, boolean>>(new Map());

  onAccordionExpansionChange(isExpanded: boolean, requestId: number) {
    const currentStates = this.accordionExpandedStates();
    currentStates.set(requestId, isExpanded);
    this.accordionExpandedStates.set(new Map(currentStates));
  }

  getAccordionExpandedState(requestId: number): boolean {
    return this.accordionExpandedStates().get(requestId) ?? false;
  }












  selectedAgentId = signal<number | undefined>(undefined);

  onAgentFilterChange(agentId: number | undefined) {
    this.selectedAgentId.set(agentId);
    this.page.set(1);
    this.loadCount();
    this.loadPackageRequests();
  }
}
