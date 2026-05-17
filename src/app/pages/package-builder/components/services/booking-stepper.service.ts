import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BookingStepperService {
  private _currentStep = signal<number>(1);

  // Get the current step (read-only)
  currentStep = this._currentStep.asReadonly();

  // Navigate to a specific step
  goToStep(step: number) {
    this._currentStep.set(step);
  }

  // Next step (with optional max limit)
  nextStep(step: number) {
    this._currentStep.set(step);
  }

  // Previous step (with optional min limit)
  previousStep(step: number = 1) {
    this._currentStep.set(step);
  }
}
