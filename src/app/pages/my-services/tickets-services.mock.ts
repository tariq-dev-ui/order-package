import { MyServiceConfig } from './my-services.model';

export const ticketsServiceMock: MyServiceConfig = {
  kind: 'tickets',
  title: 'Tickets Service',
  subtitle: 'Prepare flight and seat requirements for the service',
  iconClass: 'fas fa-ticket-alt text-lg',
  accent: 'amber',
  highlights: ['Flight Ready', 'Seat Planning', 'Class Selection'],
};
