import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Step1MakkahComponent } from './steps/step1-makkah/step1-makkah.component';
import { Step2MadinahComponent } from './steps/step2-madinah/step2-madinah.component';
import { Step3TransportComponent } from './steps/step3-transport/step3-transport.component';
import { Step4TicketsComponent } from './steps/step4-tickets/step4-tickets.component';
import { Step5CateringComponent } from './steps/step5-catering/step5-catering.component';
import { Step6DetailsComponent } from './steps/step6-details/step6-details.component';
import { Step7PricingComponent } from './steps/step7-pricing/step7-pricing.component';
import { Package } from '../../../core/models/package.model';
import { PackageType, PackageStatus, BookingMode, VisaStatus } from '../../../core/models/enums';
import { PackageBuilderStep } from '../../../core/models/package-builder-ui.model';
import { PackageBuilderUiService } from '../../../core/services/package-builder-ui.service';
import { PackageStepperComponent } from './components/package-stepper/package-stepper.component';

@Component({
  selector: 'app-package-builder',
  standalone: true,
  imports: [
    CommonModule, PackageStepperComponent,
    Step1MakkahComponent, Step2MadinahComponent, Step3TransportComponent,
    Step4TicketsComponent, Step5CateringComponent, Step6DetailsComponent,
    Step7PricingComponent
  ],
  template: `
    <div class="builder-shell">
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
              (next)="nextStep()"
              (prev)="prevStep()" />
          }
          @case (7) {
            <app-step7-pricing
              [packageData]="packageData"
              (dataChanged)="onDataChanged($event)"
              (prev)="prevStep()"
              (publish)="publishPackage()" />
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
    visaStatus: VisaStatus.INCLUDED
  };

  steps: PackageBuilderStep[] = [];

  constructor(private readonly builderUi: PackageBuilderUiService) {
    this.steps = this.builderUi.getSteps();
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

  publishPackage(): void {
    console.log('Publishing package:', this.packageData);
    // TODO: wire to PackageService.createPackage with ACTIVE status
  }
}
