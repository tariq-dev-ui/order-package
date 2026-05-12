import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderSummaryData } from '../../../../../core/models/package-builder-ui.model';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside class="summary-card">
      <div class="summary-head">
        <h3>{{ data.title }}</h3>
        <span class="material-icons-round">list_alt</span>
      </div>

      @for (section of data.sections; track section.id) {
        <section class="summary-section">
          <header class="summary-section-head">
            <div class="summary-arrow">
              <span class="material-icons-round">expand_less</span>
            </div>
            <div class="summary-title">
              <h4>{{ section.title }}</h4>
              <span class="material-icons-round">{{ section.icon }}</span>
            </div>
          </header>

          <div class="summary-lines">
            @for (line of section.lines; track $index) {
              <p>
                @if (line.value) {
                  <strong>{{ line.label }}</strong> {{ line.value }}
                } @else {
                  {{ line.label }}
                }
              </p>
            }
          </div>
        </section>
      }

      <div class="summary-support">
        @for (card of data.supportCards; track card.id) {
          <article class="support-card">
            <div>
              <h5>{{ card.title }}</h5>
              <p>{{ card.description }}</p>
            </div>
            <span class="material-icons-round">{{ card.icon }}</span>
          </article>
        }
      </div>
    </aside>
  `,
  styles: [`
    .summary-card {
      background: #fff;
      border: 1px solid var(--sero-border-light);
      border-radius: 14px;
      box-shadow: var(--shadow-sm);
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .summary-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--sero-border-light);
      padding: 4px 6px 8px;
    }

    .summary-head h3 {
      font-size: 1.95rem;
      font-weight: 700;
      color: #1f2a1a;
    }

    .summary-head .material-icons-round {
      font-size: 20px;
      color: var(--sero-text-secondary);
    }

    .summary-section {
      border: 1px solid #ecf0e7;
      border-radius: 10px;
      overflow: hidden;
      background: #fff;
    }

    .summary-section-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 38px;
      padding: 6px 10px;
      background: #f9fbf6;
      border-bottom: 1px solid #edf1e8;
    }

    .summary-title {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      color: var(--sero-text-primary);
    }

    .summary-title h4 {
      font-size: 1.05rem;
      font-weight: 700;
      line-height: 1.2;
    }

    .summary-title .material-icons-round {
      font-size: 16px;
      color: var(--sero-primary);
    }

    .summary-arrow {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 1px solid var(--sero-border);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--sero-text-muted);
    }

    .summary-arrow .material-icons-round {
      font-size: 14px;
    }

    .summary-lines {
      padding: 8px 10px;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }

    .summary-lines p {
      margin: 0;
      color: #8a919f;
      font-size: 0.98rem;
      line-height: 1.45;
    }

    .summary-lines strong {
      color: var(--sero-text-primary);
      font-weight: 700;
    }

    .summary-support {
      margin-top: 2px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .support-card {
      border: 1px solid #e8ede2;
      border-radius: 10px;
      padding: 8px 10px;
      background: #fbfcf9;
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
    }

    .support-card h5 {
      font-size: 1.02rem;
      font-weight: 700;
      color: var(--sero-text-primary);
      margin-bottom: 3px;
    }

    .support-card p {
      margin: 0;
      font-size: 0.84rem;
      color: #788576;
      line-height: 1.4;
    }

    .support-card .material-icons-round {
      font-size: 18px;
      color: var(--sero-primary);
      margin-top: 2px;
    }
  `]
})
export class OrderSummaryComponent {
  @Input({ required: true }) data!: OrderSummaryData;
}
