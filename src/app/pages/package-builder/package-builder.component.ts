import { Component, inject, computed, signal, ChangeDetectionStrategy, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { StepperHeader } from './components/stepper-header/stepper-header';
// Update these imports to reflect your actual step component names, e.g., HotelSelectorStep, TransportStep, FoodStep, FinalDetailsStep, ConfirmationStep
import { HotelSelector } from './components/hotel-selector/hotel-selector'; // Assuming HotelSelector is now HotelSelectorStep
import { Food } from './components/food/food'; // Assuming Food is now FoodStep
import { Transport } from './components/transport/transport'; // Assuming Transport is now TransportStep
import { Tickets } from './components/tickets/tickets';
import { FinalDetails } from './components/final-details/final-details'; // Assuming FinalDetails is now FinalDetailsStep
import { Confirmation } from './components/confirmation/confirmation'; // Assuming Confirmation is now ConfirmationStep
import { Pricing } from './components/pricing/pricing';
import { SummaryPanel } from './components/summary-panel/summary-panel'; // Assuming SummaryPanel is now StepperSummaryPanel
import { PackageBuilderStateManagementService } from './services/package-builder-state-management-service';
import { PackageDataService } from './services/package-data.service'; // New service
import { PackageSubmissionService } from './services/package-submission.service'; // New service
import { LoadingSpinnerComponent } from 'src/app/components/loading-spinner/loading-spinner';
import { SeroPackageModel } from 'src/app/services/admin.api.client';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';


@Component({
  selector: 'package-builder',
  standalone: true, // Explicitly declare standalone for clarity, though implied by default in v17+
  imports: [
    StepperHeader,
    HotelSelector, // Rename to HotelSelectorStep etc. in your project
    Food,          // Rename to FoodStep
    Transport,     // Rename to TransportStep
    Tickets,
    FinalDetails,  // Rename to FinalDetailsStep
    Confirmation,  // Rename to ConfirmationStep
    Pricing,

    SummaryPanel,   // Rename to StepperSummaryPanel
    LoadingSpinnerComponent,
    TranslateModule,
  ],
  templateUrl: './package-builder.component.html',
  styleUrl: './package-builder.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush // Apply OnPush change detection
})
export class PackageBuilderComponent {
  
  readonly state = inject(PackageBuilderStateManagementService);
  readonly packageDataService = inject(PackageDataService); // Inject new service
  readonly packageSubmissionService = inject(PackageSubmissionService); // Inject new service
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
      
  isLoading = signal(false);
  editMode = signal(false);
  private readonly _currentStep = signal<number>(1);
  readonly currentStep = computed(() => this._currentStep());

  // Total steps (consider making this dynamic based on available steps if possible)
  // Still hardcoded, but consider deriving from route config or component array
  readonly totalSteps = 8;

  readonly maxEnabledStep = computed(() => (this.packageId() != null ? this.totalSteps : this.totalSteps - 1));

  constructor() {}

  ngOnInit() {
    // Check if we are in edit mode based on route params
    const packageId = this.route.snapshot.paramMap.get('packageId');
    const id = packageId ? Number(packageId) : undefined;
    if (id == undefined) {
      this.state.reset();
      this.editMode.set(false);
    }else if (id && id != this.state.finalDetailsState().packageId) {
       this.router.navigate(['/admin/agent-packages']);
    }else{
      this.editMode.set(true);
    }
  }

  onCloseSummary(){
    this.editMode.set(false);
    this.state.reset();
    this.router.navigate(['/admin/agent-packages']);
  }

  goToStep(step: number) {
    if (step === this.totalSteps && this.packageId() == null) {
      return;
    }

    if (step >= 1 && step <= this.totalSteps) {

      this.scrollToElement('stepper-contianer-id', {
        offset: 10,          // 20px from top
        highlightColor: 'var(--color-primary-500)', // Red highlight
        duration: 1000       // 1 second duration
      });
      this._currentStep.set(step);
    }
  }

  nextStep() {
    if (this._currentStep() < this.totalSteps) {

      this.scrollToElement('stepper-contianer-id', {
        offset: 10,          // 20px from top
        highlightColor: 'var(--color-primary-500)', // Red highlight
        duration: 1000       // 1 second duration
      });
      this._currentStep.update(s => s + 1);
    }
  }

  prevStep() {
    if (this._currentStep() > 1) {

      this.scrollToElement('stepper-contianer-id', {
        offset: 10,          // 20px from top
        highlightColor: 'var(--color-primary-500)', // Red highlight
        duration: 1000       // 1 second duration
      });
      this._currentStep.update(s => s - 1);
    }
  }

  isFirstStep = computed(() => this._currentStep() === 1);
  isLastStep = computed(() => this._currentStep() === this.totalSteps);

  submitData(): void {
      const pkgId = this.state.finalDetailsState().packageId;
      const packageId = this.route.snapshot.paramMap.get('packageId');
      const id = packageId ? Number(packageId) : undefined;
      if(id && id == pkgId){
        this.updatePkg();
      }else{
        this.createPkg();
      }
  }

  packageId = signal<number | null>(null);

  private updatePkg(){
    this.isLoading.set(true);
    const pkgId = this.state.finalDetailsState().packageId;
    if(pkgId != null)
    this.packageSubmissionService.updatePackage(pkgId)
      .subscribe({
        next: (response) => {
            this.packageId.set(response.PackageID);
            this.state.reset();
            this.nextStep();
        },
        error: () => {
          this.isLoading.set(false);
        },
        complete: () => {
          this.isLoading.set(false);
        }
      });
  }
  
  private createPkg(){
    this.isLoading.set(true);
    this.packageSubmissionService.submitPackage()
      .subscribe({
        next: (response) => {
            this.packageId.set(response.PackageID);
            this.state.reset();
            this.nextStep();
        },
        error: () => {
          this.isLoading.set(false);
        },
        complete: () => {
          this.isLoading.set(false);
        }
      });
  }


  scrollToElement(elementId: string, options: {
    offset?: number;
    highlightColor?: string;
    duration?: number;
  } = {}): void {
    const {
      offset = 0,
      highlightColor = '#14b8a64d', // Your primary color
      duration = 800
    } = options;

    const element = document.getElementById(elementId);
    if (!element) return;

    // 1. Apply temporary highlight style
    const originalTransition = element.style.transition;
    element.style.transition = `box-shadow ${duration}ms ease-out`;
    element.style.boxShadow = `0 0 0 2px ${highlightColor}`;

    // 2. Smooth scroll to element
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });

    // 3. Adjust for offset (after scroll starts)
    setTimeout(() => {
      window.scrollBy(0, -offset);
    }, 20);

    // 4. Clean up highlight effect
    setTimeout(() => {
      element.style.boxShadow = 'none';
      setTimeout(() => {
        element.style.transition = originalTransition;
      }, duration);
    }, duration + 200);
  }
}
