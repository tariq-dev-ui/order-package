import { MyServiceConfig } from './my-services.model';

export const foodServiceMock: MyServiceConfig = {
  kind: 'food',
  title: 'Food Service',
  subtitle: 'Configure meal plans and meal counts',
  iconClass: 'fas fa-utensils text-lg',
  accent: 'primary',
  highlights: ['Meal Matrix', 'Plan Variety', 'Guest Volume'],
};
