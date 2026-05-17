import { MyServiceConfig } from './my-services.model';

export const transportServiceMock: MyServiceConfig = {
  kind: 'transport',
  title: 'Transport Service',
  subtitle: 'Select routes, vehicles, and transport counts',
  iconClass: 'fas fa-bus text-lg',
  accent: 'sky',
  highlights: ['Route-Based', 'Fleet Mix', 'Quick Allocation'],
};
