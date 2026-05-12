import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Package } from '../../../../../core/models/package.model';
import {
  MakkahFormSelection,
  OrderSummaryData,
  SelectOption
} from '../../../../../core/models/package-builder-ui.model';
import { PackageBuilderUiService } from '../../../../../core/services/package-builder-ui.service';
import { OrderSummaryComponent } from '../../components/order-summary/order-summary.component';
import { PackageStepFormComponent } from '../../components/package-step-form/package-step-form.component';

@Component({
  selector: 'app-step1-makkah',
  standalone: true,
  imports: [CommonModule, OrderSummaryComponent, PackageStepFormComponent],
  template: `
    <div class="step-shell animate-fade-in">
      <div class="step-grid">
        <app-order-summary class="sidebar" [data]="orderSummary"></app-order-summary>

        <app-package-step-form
          class="form-card"
          [districtOptions]="districtOptions"
          [categoryOptions]="categoryOptions"
          [roomTypeOptions]="roomTypeOptions"
          (addNew)="onSelectionAdded($event)"
          (skip)="onSkip()"
          (next)="next.emit()"></app-package-step-form>
      </div>
    </div>
  `,
  styles: [`
    .step-shell {
      padding: 14px 0 0;
    }

    .step-grid {
      display: grid;
      grid-template-columns: 290px minmax(0, 1fr);
      gap: 16px;
      align-items: start;
    }

    .sidebar,
    .form-card {
      min-width: 0;
    }

    @media (max-width: 1024px) {
      .step-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class Step1MakkahComponent implements OnInit {
  @Input() packageData!: Partial<Package>;
  @Output() dataChanged = new EventEmitter<Partial<Package>>();
  @Output() next = new EventEmitter<void>();

  orderSummary: OrderSummaryData = { title: '', sections: [], supportCards: [] };
  districtOptions: SelectOption[] = [];
  categoryOptions: SelectOption[] = [];
  roomTypeOptions: SelectOption[] = [];

  constructor(private readonly builderUi: PackageBuilderUiService) {}

  ngOnInit(): void {
    this.orderSummary = this.builderUi.getOrderSummaryData();
    this.districtOptions = this.builderUi.getDistrictOptions();
    this.categoryOptions = this.builderUi.getCategoryOptions();
    this.roomTypeOptions = this.builderUi.getRoomTypeOptions();
  }

  onSelectionAdded(selection: MakkahFormSelection): void {
    this.dataChanged.emit({
      ...this.packageData,
      nights: selection.nights
    });
  }

  onSkip(): void {
    this.next.emit();
  }
}
