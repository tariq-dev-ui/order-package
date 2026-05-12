import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';

export const routes: Routes = [
  { path: '', redirectTo: 'master/distributed', pathMatch: 'full' },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    children: [
      { path: '', loadComponent: () => import('./features/admin/analytics/admin-analytics.component').then(m => m.AdminAnalyticsComponent) },
      { path: 'analytics', loadComponent: () => import('./features/admin/analytics/admin-analytics.component').then(m => m.AdminAnalyticsComponent) },
      { path: 'distribution', loadComponent: () => import('./features/admin/distribution/admin-distribution.component').then(m => m.AdminDistributionComponent) },
      { path: 'packages', loadComponent: () => import('./features/admin/distribution/admin-distribution.component').then(m => m.AdminDistributionComponent) },
      { path: 'packages/builder', loadComponent: () => import('./features/admin/package-builder/package-builder.component').then(m => m.PackageBuilderComponent) },
      { path: 'orders/confirmation/:orderId', loadComponent: () => import('./features/admin/orders/order-confirmation.component').then(m => m.OrderConfirmationComponent) }
    ]
  },
  {
    path: 'master',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'distributed', pathMatch: 'full' },
      { path: 'distributed', loadComponent: () => import('./features/master-agent/distributed-packages/distributed-packages.component').then(m => m.DistributedPackagesComponent) },
      { path: 'packages', loadComponent: () => import('./features/master-agent/distributed-packages/distributed-packages.component').then(m => m.DistributedPackagesComponent) },
      { path: 'subagents', loadComponent: () => import('./features/master-agent/distributed-packages/distributed-packages.component').then(m => m.DistributedPackagesComponent) },
      { path: 'analytics', loadComponent: () => import('./features/admin/analytics/admin-analytics.component').then(m => m.AdminAnalyticsComponent) }
    ]
  },
  {
    path: 'agent',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'marketplace', pathMatch: 'full' },
      { path: 'marketplace', loadComponent: () => import('./features/master-agent/distributed-packages/distributed-packages.component').then(m => m.DistributedPackagesComponent) },
      { path: 'orders', loadComponent: () => import('./features/agent/orders/agent-orders.component').then(m => m.AgentOrdersComponent) },
      { path: 'orders/:id', loadComponent: () => import('./features/agent/orders/agent-order-details.component').then(m => m.AgentOrderDetailsComponent) }
    ]
  },
  { path: '**', redirectTo: 'master/distributed' }
];
