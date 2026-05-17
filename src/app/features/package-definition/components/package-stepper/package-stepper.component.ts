import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PackageStep } from '../../package-definition.models';

@Component({
  selector: 'app-package-stepper',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="stepper-shell" role="list">
      @for (step of steps; track step.id; let i = $index) {

        <div class="stepper-item"
             [class.active]="step.id === currentStep"
             [class.completed]="step.id < currentStep"
             role="listitem">
          <button class="step-btn" type="button"
                  (click)="stepClicked.emit(step.id)"
                  [attr.aria-current]="step.id === currentStep ? 'step' : null">
            <div class="step-circle">
              <span class="material-symbols-outlined">{{ step.icon }}</span>
              <span
                class="step-status-badge"
                [class.completed]="getStepStatus(step.id) === 'completed'"
                [class.incomplete]="getStepStatus(step.id) === 'incomplete'">
                <span class="material-symbols-outlined">
                  {{ getStepStatus(step.id) === 'completed' ? 'check' : 'close' }}
                </span>
              </span>
            </div>
            <span class="step-label">{{ step.label | translate }}</span>
          </button>
        </div>

        @if (i < steps.length - 1) {
          <div class="step-line" [class.completed]="step.id < currentStep"></div>
        }
      }
    </div>
  `,
  styles: [`
    .stepper-shell {
      display: flex;
      align-items: center;
      width: 100%;
      padding: 16px 4px;
    }

    .stepper-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-shrink: 0;
    }

    .step-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 7px;
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px 6px;
      border-radius: 8px;
      transition: background 0.15s;
    }

    .step-btn:hover .step-circle:not(.active-circle) {
      border-color: var(--sero-primary);
      color: var(--sero-primary);
    }

    .step-circle {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: visible;
      border: 2px solid var(--sero-border);
      background: var(--sero-card-bg);
      color: var(--sero-text-secondary);
      transition: border-color 0.2s, background 0.2s, color 0.2s, transform 0.2s, box-shadow 0.2s;
    }

    .step-circle .material-symbols-outlined {
      font-size: 20px;
      font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
    }

    .stepper-item.active .step-circle {
      border-color: var(--sero-primary);
      background: var(--sero-primary);
      color: #fff;
      transform: scale(1.1);
      box-shadow: 0 4px 14px color-mix(in srgb, var(--sero-primary) 35%, transparent);
    }

    .stepper-item.active .step-circle .material-symbols-outlined {
      font-variation-settings: 'FILL' 1, 'wght' 500, 'GRAD' 0, 'opsz' 24;
    }

    .stepper-item.completed .step-circle {
      border-color: var(--sero-primary);
      background: color-mix(in srgb, var(--sero-primary) 10%, transparent);
      color: var(--sero-primary);
    }

    .step-status-badge {
      position: absolute;
      top: -5px;
      inset-inline-end: -5px;
      width: 16px;
      height: 16px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid #fff;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.15);
      pointer-events: none;
    }

    .step-status-badge .material-symbols-outlined {
      font-size: 10px;
      font-variation-settings: 'FILL' 1, 'wght' 700, 'GRAD' 0, 'opsz' 20;
      line-height: 1;
    }

    .step-status-badge.completed {
      background: color-mix(in srgb, var(--sero-primary) 86%, #fff);
      color: #fff;
    }

    .step-status-badge.incomplete {
      background: #fee2e2;
      color: #b42318;
      border-color: #fecaca;
    }

    .step-label {
      font-size: 0.6875rem;
      color: var(--sero-text-secondary);
      white-space: nowrap;
      text-align: center;
      font-weight: 500;
      transition: color 0.2s;
      max-width: 72px;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .stepper-item.active .step-label {
      color: var(--sero-primary);
      font-weight: 700;
    }

    .stepper-item.completed .step-label {
      color: var(--sero-primary);
      font-weight: 600;
    }

    .step-line {
      flex: 1;
      height: 2px;
      background: var(--sero-border);
      margin-bottom: 28px;
      transition: background 0.4s;
      min-width: 8px;
    }

    .step-line.completed {
      background: var(--sero-primary);
    }
  `]
})
export class PackageStepperComponent {
  @Input() stepStatuses: Record<number, 'completed' | 'incomplete'> = {};
  @Input() steps: PackageStep[] = [];
  @Input() currentStep = 1;
  @Output() stepClicked = new EventEmitter<number>();

  getStepStatus(stepId: number): 'completed' | 'incomplete' {
    return this.stepStatuses[stepId] ?? 'incomplete';
  }
}
