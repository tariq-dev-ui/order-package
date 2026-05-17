import { Component } from '@angular/core';
import { ServicePageShell } from '../components/service-page-shell/service-page-shell';

@Component({
  selector: 'makkah-service-page',
  standalone: true,
  imports: [ServicePageShell],
  templateUrl: './makkah-service.html',
})
export class MakkahServicePage {}

