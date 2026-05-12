import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Step1MakkahComponent } from './steps/step1-makkah/step1-makkah.component';
import { Step2MadinahComponent } from './steps/step2-madinah/step2-madinah.component';
import { Step3TransportComponent } from './steps/step3-transport/step3-transport.component';
import { Step4TicketsComponent } from './steps/step4-tickets/step4-tickets.component';
import { Step5CateringComponent } from './steps/step5-catering/step5-catering.component';
import { Step6DetailsComponent } from './steps/step6-details/step6-details.component';
import { Step7PricingComponent } from './steps/step7-pricing/step7-pricing.component';
import { Package } from '../../../core/models/package.model';
import {
  BookingMode,
  CommissionModel,
  DistributionStatus,
  PackageStatus,
  PackageType,
  PricingPermission,
  SubagentAccessMode,
  VisaStatus
} from '../../../core/models/enums';
import { PackageBuilderStep } from '../../../core/models/package-builder-ui.model';
import { PackageBuilderUiService } from '../../../core/services/package-builder-ui.service';
import { PackageStepperComponent } from './components/package-stepper/package-stepper.component';
import { CustomerInfo, OtherServiceSelection } from '../../../core/models/package-order.model';
import { PackageBuilderService } from '../../../core/services/package-builder.service';
import { OrderService } from '../../../core/services/order.service';
import { PackageVisibilityComponent } from './components/package-visibility/package-visibility.component';

@Component({
  selector: 'app-package-builder',
  standalone: true,
  imports: [
    CommonModule, PackageStepperComponent, PackageVisibilityComponent,
    Step1MakkahComponent, Step2MadinahComponent, Step3TransportComponent,
    Step4TicketsComponent, Step5CateringComponent, Step6DetailsComponent,
    Step7PricingComponent
  ],
  template: `
    <div class="builder-shell">
      <app-package-visibility (visibilityChanged)="onVisibilityChanged()"></app-package-visibility>
      <div class="stepper-wrap">
        <app-package-stepper
          [steps]="steps"
          [activeStep]="currentStep()"
          (stepChange)="goToStep($event)"></app-package-stepper>
      </div>

      <div class="builder-body">
        @switch (currentStep()) {
          @case (1) {
            <app-step1-makkah
              [packageData]="packageData"
              (dataChanged)="onDataChanged($event)"
              (next)="nextStep()" />
          }
          @case (2) {
            <app-step2-madinah
              [packageData]="packageData"
              (dataChanged)="onDataChanged($event)"
              (next)="nextStep()"
              (prev)="prevStep()" />
          }
          @case (3) {
            <app-step3-transport
              [packageData]="packageData"
              (dataChanged)="onDataChanged($event)"
              (next)="nextStep()"
              (prev)="prevStep()" />
          }
          @case (4) {
            <app-step4-tickets
              [packageData]="packageData"
              (dataChanged)="onDataChanged($event)"
              (next)="nextStep()"
              (prev)="prevStep()" />
          }
          @case (5) {
            <app-step5-catering
              [packageData]="packageData"
              (dataChanged)="onDataChanged($event)"
              (next)="nextStep()"
              (prev)="prevStep()" />
          }
          @case (6) {
            <app-step6-details
              [packageData]="packageData"
              (dataChanged)="onDataChanged($event)"
              (customerInfoChanged)="onCustomerInfoChanged($event)"
              (otherServicesChanged)="onOtherServicesChanged($event)"
              (next)="nextStep()"
              (prev)="prevStep()" />
          }
          @case (7) {
            <app-step7-pricing
              [packageData]="packageData"
              [validationErrors]="validationErrors()"
              [canCreateOrder]="canCreateOrder()"
              [isSubmitting]="isCreatingOrder()"
              [statusMessage]="statusMessage()"
              (dataChanged)="onDataChanged($event)"
              (prev)="prevStep()"
              (createOrder)="publishPackage()" />
          }
        }
      </div>
    </div>
  `,
  styles: [`
    .builder-shell {
      display: flex;
      flex-direction: column;
      gap: 14px;
      min-height: calc(100vh - var(--topbar-height) - 2 * var(--space-xl));
      background: #f8faf6;
    }

    .stepper-wrap {
      background: #fff;
      border: 1px solid var(--sero-border-light);
      border-radius: 14px;
      box-shadow: var(--shadow-sm);
      padding: 2px 12px;
    }

    .builder-body {
      flex: 1;
      padding: 0;
    }
  `]
})
export class PackageBuilderComponent {
  currentStep = signal(1);
  isCreatingOrder = signal(false);
  statusMessage = signal('');
  totalSteps = 7;

  packageData: Partial<Package> = {
    type: PackageType.SHARED,
    status: PackageStatus.DRAFT,
    bookingMode: BookingMode.INSTANT,
    isInstantBooking: true,
    isVerified: false,
    makkahHotels: [],
    madinahHotels: [],
    transportation: [],
    tickets: [],
    catering: [],
    tags: [],
    nights: 0,
    paxCount: 1,
    totalCapacity: 0,
    soldCount: 0,
    reservedCount: 0,
    visaStatus: VisaStatus.INCLUDED,
    visibilityType: 'shared',
    selectedAgent: null
  };

  steps: PackageBuilderStep[] = [];
  customerInfo: CustomerInfo = { name: '', phone: '', email: '', notes: '' };
  otherServices: OtherServiceSelection[] = [];

  constructor(
    private readonly builderUi: PackageBuilderUiService,
    private readonly packageBuilderService: PackageBuilderService,
    private readonly orderService: OrderService,
    private readonly router: Router
  ) {
    this.steps = this.builderUi.getSteps();
    this.onVisibilityChanged();
  }

  goToStep(step: number): void {
    if (step > 0 && step <= this.totalSteps) {
      this.currentStep.set(step);
    }
  }

  nextStep(): void {
    if (this.currentStep() < this.totalSteps) {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.update(s => s - 1);
    }
  }

  onDataChanged(data: Partial<Package>): void {
    this.packageData = { ...this.packageData, ...data };
  }

  onVisibilityChanged(): void {
    const visibility = this.packageBuilderService.getVisibilitySignal()();
    this.packageData = {
      ...this.packageData,
      visibilityType: visibility.visibilityType,
      selectedAgent: visibility.selectedAgent,
      distributionConfig: {
        packageId: this.packageData.id || 'draft-package',
        masterAgentId: visibility.selectedAgent?.id || 'master-001',
        masterAgentName: visibility.selectedAgent?.name || 'Distribution Owner',
        allowReselling: visibility.allowReselling,
        subagentAccessMode: visibility.subagentAccessMode || SubagentAccessMode.ALL,
        selectedSubagentIds: visibility.selectedAgent ? [visibility.selectedAgent.id] : [],
        pricingPermission: visibility.pricingPermission || PricingPermission.AGENT_MARKUP,
        agentMarkupType: visibility.agentMarkupType,
        agentMarkupValue: visibility.agentMarkupValue,
        hideOriginalCost: visibility.hideOriginalCost,
        commissionModel: visibility.commissionModel || CommissionModel.PERCENTAGE,
        commissionValue: visibility.commissionValue,
        allocatedInventory: visibility.allocatedInventory,
        reservedInventory: 0,
        soldInventory: 0,
        status: DistributionStatus.ACTIVE,
        createdAt: new Date()
      }
    };
  }

  onCustomerInfoChanged(data: CustomerInfo): void {
    this.customerInfo = { ...data };
  }

  onOtherServicesChanged(data: OtherServiceSelection[]): void {
    this.otherServices = [...data];
  }

  validationErrors(): string[] {
    return this.packageBuilderService.validateForOrderCreation(this.packageData, this.customerInfo, this.otherServices).errors;
  }

  canCreateOrder(): boolean {
    return this.packageBuilderService.validateForOrderCreation(this.packageData, this.customerInfo, this.otherServices).isValid;
  }

  publishPackage(): void {
    const validation = this.packageBuilderService.validateForOrderCreation(this.packageData, this.customerInfo, this.otherServices);
    if (!validation.isValid) {
      this.statusMessage.set('يرجى استكمال البيانات المطلوبة قبل إنشاء الطلب');
      return;
    }

    this.isCreatingOrder.set(true);
    this.statusMessage.set('');

    this.orderService.createOrder(this.packageData, this.customerInfo, this.otherServices).subscribe({
      next: (order) => {
        this.isCreatingOrder.set(false);
        this.statusMessage.set(`تم إنشاء الطلب بنجاح. رقم الطلب: ${order.orderNumber}`);
        this.router.navigate(['/admin/orders/confirmation', order.id]);
      },
      error: () => {
        this.isCreatingOrder.set(false);
        this.statusMessage.set('حدث خطأ أثناء إنشاء الطلب. حاول مرة أخرى');
      }
    });
  }
}
