import { Component } from '@angular/core';
import { ServicePageShell } from '../components/service-page-shell/service-page-shell';

@Component({
  selector: 'tickets-service-page',
  standalone: true,
  imports: [ServicePageShell],
  templateUrl: './tickets-service.html',
})
export class TicketsServicePage {}

