import { Component } from '@angular/core';
import { ServicePageShell } from '../components/service-page-shell/service-page-shell';

@Component({
  selector: 'madina-service-page',
  standalone: true,
  imports: [ServicePageShell],
  templateUrl: './madina-service.html',
})
export class MadinaServicePage {}

