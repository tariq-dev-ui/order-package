import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PackageBuilderStep } from '../../../../../core/models/package-builder-ui.model';

@Component({
  selector: 'app-package-stepper',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="pb-stepper" aria-label="Package Builder Steps">
      <div class="pb-stepper-line"></div>
      @for (step of steps; track step.id) {
        <button
          type="button"
          class="pb-step"
          [class.active]="step.id === activeStep"
          [class.completed]="step.id < activeStep"
          (click)="stepChange.emit(step.id)">
          <span class="pb-step-icon">
            <span class="material-icons-round">{{ step.icon }}</span>
          </span>
          <span class="pb-step-label">{{ step.label }}</span>
        </button>
      }
    </nav>
  `,
  styles: [`
    .pb-stepper {
      position: relative;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      padding: 18px 8px 12px;
      overflow-x: auto;
      scrollbar-width: thin;
    }

    .pb-stepper-line {
      position: absolute;
      top: 36px;
      left: 42px;
      right: 42px;
      height: 1px;
      background: var(--sero-border);
      z-index: 0;
    }

    .pb-step {
      position: relative;
      z-index: 1;
      border: 0;
      background: transparent;
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      min-width: 88px;
      color: var(--sero-text-secondary);
      padding: 0;
    }

    .pb-step-icon {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: 1px solid var(--sero-border);
      background: #f0f2f4;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: #7b8590;
      transition: all var(--t-fast);
    }

    .pb-step-label {
      font-size: 0.88rem;
      font-weight: 600;
      white-space: nowrap;
      color: #5a6675;
    }

    .pb-step.active .pb-step-icon {
      border-color: var(--sero-primary);
      background: var(--sero-primary);
      color: #fff;
      box-shadow: 0 0 0 4px var(--sero-primary-50);
    }

    .pb-step.active .pb-step-label {
      color: var(--sero-text-primary);
      font-weight: 700;
    }

    .pb-step.completed .pb-step-icon {
      background: #eef3e8;
      color: var(--sero-primary);
      border-color: var(--sero-primary-100);
    }

    .pb-step-icon .material-icons-round {
      font-size: 18px;
    }

    @media (max-width: 900px) {
      .pb-step {
        min-width: 74px;
      }

      .pb-step-label {
        font-size: 0.78rem;
      }
    }
  `]
})
export class PackageStepperComponent {
  @Input() steps: PackageBuilderStep[] = [];
  @Input() activeStep = 1;
  @Output() stepChange = new EventEmitter<number>();
}
