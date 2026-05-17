import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'loading-spinner',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isLoading) {
      <div class="loading-overlay">
        <div class="spinner-container">
          <div class="spinner"></div>
          @if (message) {
            <p class="loading-message">{{ message }}</p>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .loading-overlay {
      position: absolute;
      inset: 0;
      background: rgba(255, 255, 255, 0.8);
      z-index: 9999;
      display: flex;
      justify-content: center;
      align-items: center;
      backdrop-filter: blur(2px);
    }

    .spinner-container {
      text-align: center;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #f0fdfa;
      border-top: 4px solid var(--app-heading, #3a472a);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto;
    }

    .loading-message {
      margin-top: 1rem;
      color: var(--app-heading, #3a472a);
      font-weight: 500;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class LoadingSpinnerComponent {
  @Input() isLoading = false;
  @Input() message = '';
}
