import { Component } from '@angular/core';

@Component({
  selector: 'order-accordion',
  standalone: true,
  template: `<div class="order-accordion"><ng-content /></div>`,
  styles: [`
    .order-accordion { display: flex; flex-direction: column; gap: 12px; }
  `],
})
export class OrderAccordionComponent {}
