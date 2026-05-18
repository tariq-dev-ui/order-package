import { Component } from '@angular/core';
import { OrderAccordionItemComponent } from '../order-accordion-item/order-accordion-item.component';

@Component({
  selector: 'order-accordion',
  standalone: true,
  imports: [],
  template: `
    <div class="space-y-4">
      <ng-content></ng-content>
    </div>
  `
})
export class OrderAccordionComponent {

}