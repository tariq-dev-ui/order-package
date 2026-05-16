import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

type StepDef = {
  index: number;
  label: string;
  subLabel?: string;
  iconClass: string;
  iconExtraClass?: string;
};

@Component({
  selector: 'stepper-header',
  imports: [TranslateModule],
  templateUrl: './stepper-header.html',
  styleUrl: './stepper-header.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepperHeader {
  readonly currentStep = input.required<number>();
  readonly totalSteps = input.required<number>();
  readonly maxEnabledStep = input<number>(Number.POSITIVE_INFINITY);

  readonly stepSelected = output<number>();

  readonly steps = computed<StepDef[]>(() => {
    const total = this.totalSteps();

    const allSteps: StepDef[] = [
      { index: 1, label: 'Hotels', subLabel: 'Makkah', iconClass: 'fas fa-hotel' },
      { index: 2, label: 'Hotels', subLabel: 'Al-Madinah', iconClass: 'fas fa-hotel' },
      { index: 3, label: 'Transport', iconClass: 'fas fa-bus' },
      { index: 4, label: 'Tickets', iconClass: 'fas fa-ticket-alt' },
      { index: 5, label: 'Food', iconClass: 'fas fa-utensils', iconExtraClass: 'text-lg' },
      { index: 6, label: 'Others', iconClass: 'fas fa-passport' },
      { index: 7, label: 'Pricing', iconClass: 'fas fa-tag' },
    ];

    return allSteps.filter((s) => s.index <= total);
  });

  onStepClick(stepIndex: number) {
    if (stepIndex > this.maxEnabledStep()) {
      return;
    }
    this.stepSelected.emit(stepIndex);
  }
}
