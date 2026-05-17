import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';

const emptyPage = () => import('./features/shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent);
const statisticsPage = () => import('./features/admin/statistics/statistics-page.component').then(m => m.StatisticsPageComponent);
const analyticsDashboardPage = () => import('./features/admin/analytics/analytics-dashboard.component').then(m => m.AnalyticsDashboardComponent);
const transportPricingPage = () => import('./features/admin/transport-pricing/transport-pricing-page.component').then(m => m.TransportPricingPageComponent);
const transportPricingFormPage = () => import('./features/admin/transport-pricing/transport-pricing-form-page.component').then(m => m.TransportPricingFormPageComponent);
const foodPricingPage = () => import('./features/admin/food-pricing/food-pricing-page.component').then(m => m.FoodPricingPageComponent);
const hotelPricingPage = () => import('./features/admin/hotel-pricing/hotel-pricing-page.component').then(m => m.HotelPricingPageComponent);
const hotelsPage = () => import('./features/admin/hotels/hotels-page.component').then(m => m.HotelsPageComponent);
const hotelCategoriesPage = () => import('./features/admin/hotel-categories/hotel-categories-page.component').then(m => m.HotelCategoriesPageComponent);
const transportCompaniesPage = () => import('./features/admin/transport-companies/transport-companies-page.component').then(m => m.TransportCompaniesPageComponent);
const newRfqPage = () => import('./features/admin/new-rfq/new-rfq-page.component').then(m => m.NewRfqPageComponent);
const agentPackagesPage = () => import('./features/admin/agent-packages/agent-packages-page.component').then(m => m.AgentPackagesPageComponent);
const agentPackageFormPage = () => import('./features/admin/agent-packages/agent-package-form-page.component').then(m => m.AgentPackageFormPageComponent);
const currentRfqPage = () => import('./features/admin/current-rfq/current-rfq-page.component').then(m => m.CurrentRfqPageComponent);
const customersPage = () => import('./features/admin/customers/customers-page.component').then(m => m.CustomersPageComponent);
const accountStatementPage = () => import('./pages/account-statement/account-statement.component').then(m => m.AccountStatementComponent);
const trialBalancePage = () => import('./pages/trial-balance/trial-balance.component').then(m => m.TrialBalanceComponent);
const costCentersPage = () => import('./pages/cost-centers/cost-centers.component').then(m => m.CostCentersComponent);
const chartOfAccountsPage = () => import('./pages/chart-of-accounts/chart-of-accounts.component').then(m => m.ChartOfAccountsComponent);
const incomeStatementPage = () => import('./pages/income-statement/income-statement.component').then(m => m.IncomeStatementComponent);
const journalEntriesPage = () => import('./pages/journal-entries/journal-entries.component').then(m => m.JournalEntriesComponent);
const journalEntryFormPage = () => import('./pages/journal-entries/create-journal-entry/create-journal-entry.component').then(m => m.CreateJournalEntryComponent);
const pendingJournalEntriesPage = () => import('./pages/journal-entries/pending-entries/pending-entries.component').then(m => m.PendingEntriesComponent);
const unapprovedJournalEntriesPage = () => import('./pages/journal-entries/unapproved-entries/unapproved-entries.component').then(m => m.UnapprovedEntriesComponent);
const importJournalEntriesPage = () => import('./pages/journal-entries/import-entries/import-entries.component').then(m => m.ImportEntriesComponent);
const taxExpenseEntryPage = () => import('./pages/journal-entries/tax-expense-entry/tax-expense-entry.component').then(m => m.TaxExpenseEntryComponent);
const fiscalYearPage = () => import('./pages/fiscal-year/fiscal-year.component').then(m => m.FiscalYearComponent);
const financialReportsPage = () => import('./pages/financial-reports/financial-reports.component').then(m => m.FinancialReportsComponent);
const accountRoutingPage = () => import('./pages/account-routing/account-routing.component').then(m => m.AccountRoutingComponent);
const banksManagementPage = () => import('./pages/banks-management/banks-management.component').then(m => m.BanksManagementComponent);
const expensesManagementPage = () => import('./pages/expenses-management/expenses-management.component').then(m => m.ExpensesManagementComponent);
const operationsHotelBookingsPage = () => import('./features/admin/operations/hotel-bookings/hotel-bookings-page.component').then(m => m.HotelBookingsPageComponent);
const operationsVisaRequestsPage = () => import('./features/admin/operations/visa-requests/visa-requests-page.component').then(m => m.VisaRequestsPageComponent);
const operationsTransportRequestsPage = () => import('./features/admin/operations/transport-requests/transport-requests-page.component').then(m => m.TransportRequestsPageComponent);
const operationsCateringRequestsPage = () => import('./features/admin/operations/catering-requests/catering-requests-page.component').then(m => m.CateringRequestsPageComponent);
const operationsFlightRequestsPage = () => import('./features/admin/operations/flight-requests/flight-requests-page.component').then(m => m.FlightRequestsPageComponent);
const salamAgentPackagesPage = () => import('./pages/sero-packages/sero-packages.component').then(m => m.SeroPackagesComponent);
const salamPackageBuilderPage = () => import('./pages/package-builder/package-builder.component').then(m => m.PackageBuilderComponent);
const agentRequestsPage = () => import('./features/admin/agent-requests/agent-requests-page.component').then(m => m.AgentRequestsPageComponent);
const newAgentRequestPage = () => import('./features/admin/agent-requests/new-agent-request-page.component').then(m => m.NewAgentRequestPageComponent);
const ownersPage = () => import('./features/admin/owners/owners-page.component').then(m => m.OwnersPageComponent);
const approvalsPage = () => import('./features/admin/approvals/approvals-page.component').then(m => m.ApprovalsPageComponent);
const agentsListPage = () => import('./features/admin/agents-list/agents-list-page.component').then(m => m.AgentsListPageComponent);
const accountManagersPage = () => import('./features/admin/account-managers/account-managers-page.component').then(m => m.AccountManagersPageComponent);
const hotelProvidersPage = () => import('./features/admin/hotel-providers/hotel-providers-page.component').then(m => m.HotelProvidersPageComponent);
const hotelSubscriptionsPage = () => import('./features/admin/hotel-subscriptions/hotel-subscriptions-page.component').then(m => m.HotelSubscriptionsPageComponent);
const userGroupsPage = () => import('./features/admin/user-groups/user-groups-page.component').then(m => m.UserGroupsPageComponent);
const systemAdminsPage = () => import('./features/admin/system-admins/system-admins-page.component').then(m => m.SystemAdminsPageComponent);
const providerUsersPage = () => import('./features/admin/provider-users/provider-users-page.component').then(m => m.ProviderUsersPageComponent);
const agentUsersPage = () => import('./features/admin/agent-users/agent-users-page.component').then(m => m.AgentUsersPageComponent);
const myServicesMakkahPage = () => import('./pages/my-services/makkah-service/makkah-service').then(m => m.MakkahServicePage);
const myServicesMadinaPage = () => import('./pages/my-services/madina-service/madina-service').then(m => m.MadinaServicePage);
const myServicesTransportPage = () => import('./pages/my-services/transport-service/transport-service').then(m => m.TransportServicePage);
const myServicesTicketsPage = () => import('./pages/my-services/tickets-service/tickets-service').then(m => m.TicketsServicePage);
const myServicesFoodPage = () => import('./pages/my-services/food-service/food-service').then(m => m.FoodServicePage);
const myServicesManagementPage = () => import('./features/admin/my-services/my-services-page.component').then(m => m.MyServicesPageComponent);

export const routes: Routes = [
  { path: '', redirectTo: 'admin/analytics', pathMatch: 'full' },
  {
    path: 'my-services',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'makkah', pathMatch: 'full' },
      { path: 'makkah', loadComponent: myServicesMakkahPage },
      { path: 'madina', loadComponent: myServicesMadinaPage },
      { path: 'transport', loadComponent: myServicesTransportPage },
      { path: 'tickets', loadComponent: myServicesTicketsPage },
      { path: 'food', loadComponent: myServicesFoodPage },
    ],
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: '', loadComponent: analyticsDashboardPage },
      { path: 'analytics', loadComponent: analyticsDashboardPage },
      { path: 'distribution', loadComponent: emptyPage },
      { path: 'agent-packages',           loadComponent: salamAgentPackagesPage },
      { path: 'agent-packages/new',       loadComponent: salamPackageBuilderPage },
      { path: 'agent-packages/:packageId/edit', loadComponent: salamPackageBuilderPage },
      { path: 'packages/new',       redirectTo: 'agent-packages/new', pathMatch: 'full' },
      { path: 'packages/:packageId/edit',  loadComponent: salamPackageBuilderPage },
      { path: 'packages/edit/:id',  redirectTo: 'agent-packages', pathMatch: 'full' },
      { path: 'packages/view/:id',  loadComponent: agentPackageFormPage },
      { path: 'packages',           loadComponent: salamAgentPackagesPage },
      { path: 'packages/builder',   redirectTo: 'agent-packages/new', pathMatch: 'full' },
      { path: 'orders/confirmation/:orderId', loadComponent: emptyPage },
      // TODO: new order form
      { path: 'orders/new', loadComponent: emptyPage },
      { path: 'operations/hotel-bookings',     loadComponent: operationsHotelBookingsPage },
      { path: 'operations/visa-requests',      loadComponent: operationsVisaRequestsPage },
      { path: 'operations/transport-requests', loadComponent: operationsTransportRequestsPage },
      { path: 'operations/catering-requests',  loadComponent: operationsCateringRequestsPage },
      { path: 'operations/flight-requests',    loadComponent: operationsFlightRequestsPage },
      { path: 'operations/hotels',             redirectTo: 'operations/hotel-bookings', pathMatch: 'full' },
      { path: 'operations/visa',               redirectTo: 'operations/visa-requests', pathMatch: 'full' },
      { path: 'operations/transport',          redirectTo: 'operations/transport-requests', pathMatch: 'full' },
      { path: 'operations/catering',           redirectTo: 'operations/catering-requests', pathMatch: 'full' },
      { path: 'operations/flights',            redirectTo: 'operations/flight-requests', pathMatch: 'full' },
      // TODO: pricing
      { path: 'pricing/transport/new', loadComponent: transportPricingFormPage },
      { path: 'pricing/transport/edit/:id', loadComponent: transportPricingFormPage },
      { path: 'pricing/transport/view/:id', loadComponent: transportPricingFormPage },
      { path: 'pricing/transport',    loadComponent: transportPricingPage },
      { path: 'pricing/food',         loadComponent: foodPricingPage },
      { path: 'pricing/hotel',         loadComponent: hotelPricingPage },
      // My Services Management
      { path: 'my-services',           loadComponent: myServicesManagementPage },
      // TODO: service center
      { path: 'agent-requests',              loadComponent: agentRequestsPage },
      { path: 'agent-requests/new',          loadComponent: newAgentRequestPage },
      { path: 'rfq/new',                     loadComponent: newRfqPage },
      { path: 'service-center/rfq/new',      loadComponent: newRfqPage },
      { path: 'service-center/rfq/current',  loadComponent: currentRfqPage },
      { path: 'service-center/rfq/closed',   loadComponent: emptyPage },
      { path: 'service-center/customers',    loadComponent: customersPage },
      { path: 'finance',                         redirectTo: 'finance/chart-of-accounts', pathMatch: 'full' },
      { path: 'finance/tree',                    loadComponent: chartOfAccountsPage },
      { path: 'finance/chart-of-accounts',       loadComponent: chartOfAccountsPage },
      { path: 'finance/year',                    loadComponent: fiscalYearPage },
      { path: 'finance/fiscal-year',             loadComponent: fiscalYearPage },
      { path: 'finance/entries',                 loadComponent: journalEntriesPage },
      { path: 'finance/journal-entries',         loadComponent: journalEntriesPage },
      { path: 'finance/journal-entries/create',  loadComponent: journalEntryFormPage },
      { path: 'finance/opening-balance',         loadComponent: journalEntryFormPage },
      { path: 'finance/journal-entries/:id',     loadComponent: journalEntryFormPage },
      { path: 'finance/journal-entries-pending', loadComponent: pendingJournalEntriesPage },
      { path: 'finance/journal-entries-unapproved', loadComponent: unapprovedJournalEntriesPage },
      { path: 'finance/journal-entries-import',  loadComponent: importJournalEntriesPage },
      { path: 'finance/journal-entries-tax-expense', loadComponent: taxExpenseEntryPage },
      { path: 'finance/statement',               loadComponent: accountStatementPage },
      { path: 'finance/account-statement',       loadComponent: accountStatementPage },
      { path: 'finance/trial-balance',           loadComponent: trialBalancePage },
      { path: 'finance/cash',                    loadComponent: banksManagementPage },
      { path: 'finance/banks-management',        loadComponent: banksManagementPage },
      { path: 'finance/expenses-management',     loadComponent: expensesManagementPage },
      { path: 'finance/cost-centers',            loadComponent: costCentersPage },
      { path: 'finance/reports',                 loadComponent: financialReportsPage },
      { path: 'finance/financial-reports',       loadComponent: financialReportsPage },
      { path: 'finance/account-routing',         loadComponent: accountRoutingPage },
      { path: 'finance/income-statement',        loadComponent: incomeStatementPage },
      // TODO: financials
      { path: 'financials/owners',                   loadComponent: ownersPage },
      { path: 'financials/approvals',                loadComponent: approvalsPage },
      // TODO: services
      { path: 'services/hotels',                     loadComponent: hotelsPage },
      { path: 'services/transport-companies',        loadComponent: transportCompaniesPage },
      { path: 'services/hotel-categories',           loadComponent: hotelCategoriesPage },
      // TODO: agent management
      { path: 'agents/list',                         loadComponent: agentsListPage },
      { path: 'agents/account-managers',             loadComponent: accountManagersPage },
      // TODO: users
      { path: 'users/groups',                        loadComponent: userGroupsPage },
      { path: 'users/system-admins',                 loadComponent: systemAdminsPage },
      { path: 'users/provider-users',                loadComponent: providerUsersPage },
      { path: 'users/agent-users',                   loadComponent: agentUsersPage },
      // hotel providers
      { path: 'hotel-providers/list',                loadComponent: hotelProvidersPage },
      { path: 'hotel-providers/subscriptions',       loadComponent: hotelSubscriptionsPage }
    ]
  },
  {
    path: 'master',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'distributed', pathMatch: 'full' },
      { path: 'distributed', loadComponent: () => import('./features/master/distributed/distributed-page.component').then(m => m.DistributedPageComponent) },
      { path: 'packages',    loadComponent: () => import('./features/master/packages/package-list-page.component').then(m => m.PackageListPageComponent) },
      { path: 'my-packages', loadComponent: () => import('./features/master/packages/my-packages-page.component').then(m => m.MyPackagesPageComponent) },
      { path: 'orders', loadComponent: () => import('./features/master/orders/orders-page.component').then(m => m.OrdersPageComponent) },
      { path: 'quotations', loadComponent: () => import('./features/master/quotations/quotations-page.component').then(m => m.QuotationsPageComponent) },
      { path: 'subagents',   loadComponent: () => import('./features/master/subagents/subagents-page.component').then(m => m.SubagentsPageComponent) },
      { path: 'analytics',   loadComponent: emptyPage },
      { path: 'settings',    loadComponent: emptyPage },
      { path: 'finance/chart-of-accounts', loadComponent: () => import('./pages/chart-of-accounts/chart-of-accounts.component').then(m => m.ChartOfAccountsComponent) },
      { path: 'finance/fiscal-year',        loadComponent: () => import('./pages/fiscal-year/fiscal-year.component').then(m => m.FiscalYearComponent) },
      { path: 'finance/journal-entries',    loadComponent: () => import('./pages/journal-entries/journal-entries.component').then(m => m.JournalEntriesComponent) },
      { path: 'finance/account-statement',  loadComponent: () => import('./pages/account-statement/account-statement.component').then(m => m.AccountStatementComponent) },
      { path: 'finance/trial-balance',      loadComponent: () => import('./pages/trial-balance/trial-balance.component').then(m => m.TrialBalanceComponent) },
      { path: 'finance/opening-balance',    loadComponent: () => import('./pages/journal-entries/create-journal-entry/create-journal-entry.component').then(m => m.CreateJournalEntryComponent) },
      { path: 'finance/account-routing',    loadComponent: () => import('./pages/account-routing/account-routing.component').then(m => m.AccountRoutingComponent) },
      { path: 'finance/income-statement',   loadComponent: () => import('./pages/income-statement/income-statement.component').then(m => m.IncomeStatementComponent) },
      { path: 'finance/cashier-session',    loadComponent: emptyPage }
    ]
  },
  {
    path: 'agent',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'marketplace', pathMatch: 'full' },
      { path: 'marketplace', loadComponent: emptyPage },
      { path: 'orders', loadComponent: emptyPage },
      { path: 'orders/:id', loadComponent: emptyPage }
    ]
  },
  { path: 'journal-entries', redirectTo: 'admin/finance/journal-entries', pathMatch: 'full' },
  { path: 'journal-entries/create', redirectTo: 'admin/finance/journal-entries/create', pathMatch: 'full' },
  { path: 'journal-entries-pending', redirectTo: 'admin/finance/journal-entries-pending', pathMatch: 'full' },
  { path: 'journal-entries-unapproved', redirectTo: 'admin/finance/journal-entries-unapproved', pathMatch: 'full' },
  { path: 'journal-entries-import', redirectTo: 'admin/finance/journal-entries-import', pathMatch: 'full' },
  { path: 'journal-entries-tax-expense', redirectTo: 'admin/finance/journal-entries-tax-expense', pathMatch: 'full' },
  { path: 'journal-entries/:id', redirectTo: 'admin/finance/journal-entries/:id', pathMatch: 'full' },
  { path: 'pages/journal-entries/create', redirectTo: 'admin/finance/journal-entries/create', pathMatch: 'full' },
  { path: 'pages/journal-entries/:id', redirectTo: 'admin/finance/journal-entries/:id', pathMatch: 'full' },
  { path: '**', redirectTo: 'admin/analytics' }
];
