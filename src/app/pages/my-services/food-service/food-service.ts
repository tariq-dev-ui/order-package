import { Component } from '@angular/core';
import { ServicePageShell } from '../components/service-page-shell/service-page-shell';

@Component({
  selector: 'food-service-page',
  standalone: true,
  imports: [ServicePageShell],
  templateUrl: './food-service.html',
})
export class FoodServicePage {}

