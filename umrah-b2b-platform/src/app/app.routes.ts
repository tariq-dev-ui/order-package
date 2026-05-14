import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';

const emptyPage = () => import('./features/shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent);
const statisticsPage = () => import('./features/admin/statistics/statistics-page.component').then(m => m.StatisticsPageComponent);
const transportPricingPage = () => import('./features/admin/transport-pricing/transport-pricing-page.component').then(m => m.TransportPricingPageComponent);
const transportPricingFormPage = () => import('./features/admin/transport-pricing/transport-pricing-form-page.component').then(m => m.TransportPricingFormPageComponent);
const foodPricingPage = () => import('./features/admin/food-pricing/food-pricing-page.component').then(m => m.FoodPricingPageComponent);

export const routes: Routes = [
  { path: '', redirectTo: 'admin/analytics', pathMatch: 'full' },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: '', loadComponent: statisticsPage },
      { path: 'analytics', loadComponent: statisticsPage },
      { path: 'distribution', loadComponent: emptyPage },
      { path: 'packages', loadComponent: emptyPage },
      { path: 'packages/builder', loadComponent: () => import('./features/package-definition/package-definition-page.component').then(m => m.PackageDefinitionPageComponent) },
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
      { path: 'pricing/hotel',        loadComponent: emptyPage },
      // TODO: service center
      { path: 'service-center/rfq/new',      loadComponent: emptyPage },
      { path: 'service-center/rfq/current',  loadComponent: emptyPage },
      { path: 'service-center/rfq/closed',   loadComponent: emptyPage },
      { path: 'service-center/customers',    loadComponent: emptyPage },
      // TODO: finance
      { path: 'finance/tree',                loadComponent: emptyPage },
      { path: 'finance/year',                loadComponent: emptyPage },
      { path: 'finance/entries',             loadComponent: emptyPage },
      { path: 'finance/statement',           loadComponent: emptyPage },
      { path: 'finance/trial-balance',       loadComponent: emptyPage },
      { path: 'finance/opening-balance',     loadComponent: emptyPage },
      { path: 'finance/cash',                loadComponent: emptyPage },
      { path: 'finance/account-routing',     loadComponent: emptyPage },
      { path: 'finance/income-statement',    loadComponent: emptyPage },
      // TODO: financials
      { path: 'financials/owners',                   loadComponent: emptyPage },
      { path: 'financials/approvals',                loadComponent: emptyPage },
      // TODO: services
      { path: 'services/hotels',                     loadComponent: emptyPage },
      { path: 'services/transport-companies',        loadComponent: emptyPage },
      { path: 'services/hotel-categories',           loadComponent: emptyPage },
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
  { path: '**', redirectTo: 'admin/analytics' }
];
