import { foodServiceMock } from './food-services.mock';
import { madinaServiceMock } from './madina-services.mock';
import { makkahServiceMock } from './makkah-services.mock';
import { MyServiceConfig } from './my-services.model';
import { ticketsServiceMock } from './tickets-services.mock';
import { transportServiceMock } from './transport-services.mock';

export const myServicesMock: MyServiceConfig[] = [
  makkahServiceMock,
  madinaServiceMock,
  transportServiceMock,
  ticketsServiceMock,
  foodServiceMock,
];
