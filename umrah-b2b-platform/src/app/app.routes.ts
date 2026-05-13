import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';

const emptyPage = () => import('./features/shared/placeholder/placeholder.component').then(m => m.PlaceholderComponent);

export const routes: Routes = [
  { path: '', redirectTo: 'admin/analytics', pathMatch: 'full' },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: '', loadComponent: emptyPage },
      { path: 'analytics', loadComponent: emptyPage },
      { path: 'distribution', loadComponent: emptyPage },
      { path: 'packages', loadComponent: emptyPage },
      { path: 'packages/builder', loadComponent: emptyPage },
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
      { path: 'pricing/transport',    loadComponent: emptyPage },
      { path: 'pricing/food',         loadComponent: emptyPage },
      { path: 'pricing/hotel',        loadComponent: emptyPage },
      // TODO: service center
      { path: 'service-center',       loadComponent: emptyPage },
      // TODO: finance
      { path: 'finance/tree',         loadComponent: emptyPage },
      { path: 'finance/year',         loadComponent: emptyPage },
      { path: 'finance/entries',      loadComponent: emptyPage },
      { path: 'finance/statement',    loadComponent: emptyPage }
    ]
  },
  {
    path: 'master',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'distributed', pathMatch: 'full' },
      { path: 'distributed', loadComponent: emptyPage },
      { path: 'packages', loadComponent: emptyPage },
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
