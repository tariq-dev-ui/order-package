import { Component } from '@angular/core';
import { ServicePageShell } from '../components/service-page-shell/service-page-shell';

@Component({
  selector: 'transport-service-page',
  standalone: true,
  imports: [ServicePageShell],
  templateUrl: './transport-service.html',
})
export class TransportServicePage {}

