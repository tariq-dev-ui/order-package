import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';

const emptyPage = () => import('./features/shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent);
const statisticsPage = () => import('./features/admin/statistics/statistics-page.component').then(m => m.StatisticsPageComponent);
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

export const routes: Routes = [
  { path: '', redirectTo: 'admin/analytics', pathMatch: 'full' },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: '', loadComponent: statisticsPage },
      { path: 'analytics', loadComponent: statisticsPage },
      { path: 'distribution', loadComponent: emptyPage },
      { path: 'packages/new',       loadComponent: agentPackageFormPage },
      { path: 'packages/edit/:id',  loadComponent: agentPackageFormPage },
      { path: 'packages/view/:id',  loadComponent: agentPackageFormPage },
      { path: 'packages',           loadComponent: agentPackagesPage },
      { path: 'packages/builder',   loadComponent: () => import('./features/package-definition/package-definition-page.component').then(m => m.PackageDefinitionPageComponent) },
      { path: 'orders/confirmation/:orderId', loadComponent: emptyPage },
      // TODO: new order form
      { path: 'orders/new', loadComponent: emptyPage },
      // TODO: operations
      { path: 'operations/hotels',    loadComponent: emptyPage },
      { path: 'operations/visa',      loadComponent: emptyPage },
      { path: 'operations/transport', loadComponent: emptyPage },
      { path: 'operations/catering',  loadComponent: emptyPage },
      { path: 'operations/flights',   loadComponent: emptyPage },
      // TODO: pricing
      { path: 'pricing/transport/new', loadComponent: transportPricingFormPage },
      { path: 'pricing/transport/edit/:id', loadComponent: transportPricingFormPage },
      { path: 'pricing/transport/view/:id', loadComponent: transportPricingFormPage },
      { path: 'pricing/transport',    loadComponent: transportPricingPage },
      { path: 'pricing/food',         loadComponent: foodPricingPage },
      { path: 'pricing/hotel',         loadComponent: hotelPricingPage },
      // TODO: service center
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
      { path: 'financials/owners',                   loadComponent: emptyPage },
      { path: 'financials/approvals',                loadComponent: emptyPage },
      // TODO: services
      { path: 'services/hotels',                     loadComponent: hotelsPage },
      { path: 'services/transport-companies',        loadComponent: transportCompaniesPage },
      { path: 'services/hotel-categories',           loadComponent: hotelCategoriesPage },
      // TODO: agent management
      { path: 'agents/list',                         loadComponent: emptyPage },
      { path: 'agents/account-managers',             loadComponent: emptyPage },
      // TODO: users
      { path: 'users/groups',                        loadComponent: emptyPage },
      { path: 'users/system-admins',                 loadComponent: emptyPage },
      { path: 'users/provider-users',                loadComponent: emptyPage },
      { path: 'users/agent-users',                   loadComponent: emptyPage },
      // TODO: hotel providers
      { path: 'hotel-providers/list',                loadComponent: emptyPage },
      { path: 'hotel-providers/subscriptions',       loadComponent: emptyPage }
    ]
  },
  {
    path: 'master',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'distributed', pathMatch: 'full' },
      { path: 'distributed', loadComponent: emptyPage },
      { path: 'packages', loadComponent: emptyPage },
      { path: 'orders', loadComponent: emptyPage },
      { path: 'quotations', loadComponent: emptyPage },
      { path: 'subagents', loadComponent: emptyPage },
      { path: 'analytics', loadComponent: emptyPage }
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
