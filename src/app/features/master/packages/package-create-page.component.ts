import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface PackageTemplateOption {
  id: string;
  title: string;
  description: string;
  services: string[];
}

const PACKAGE_TEMPLATES: PackageTemplateOption[] = [
  {
    id: 'umrah-essential',
    title: 'Umrah Essentials',
    description: 'A balanced hotel, transport, food, and ticket package.',
    services: ['Makkah hotel', 'Madina hotel', 'Transport', 'Food'],
  },
  {
    id: 'family-comfort',
    title: 'Family Comfort',
    description: 'A room-focused template for family and group travel.',
    services: ['Family rooms', 'Private transport', 'Breakfast'],
  },
  {
    id: 'vip-short-stay',
    title: 'VIP Short Stay',
    description: 'Premium stays and transport for a shorter itinerary.',
    services: ['Premium hotels', 'VIP transport', 'Tickets'],
  },
];

@Component({
  selector: 'pkg-create-page',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="create-page">
      <header class="page-head">
        <button type="button" class="back-btn" (click)="backToPackages()" aria-label="Back to packages">
          <span class="material-icons-round">arrow_back</span>
        </button>
        <div>
          <h1>Create Package</h1>
          <p>Choose from templates or start from scratch</p>
        </div>
      </header>

      @if (view() === 'options') {
        <div class="option-grid">
          <article class="option-card">
            <div class="option-icon">
              <span class="material-icons-round">add_box</span>
            </div>
            <div class="option-copy">
              <h2>Start from Scratch</h2>
              <p>Build a custom package manually</p>
            </div>
            <button type="button" class="primary-btn" (click)="startFromScratch()">
              <span>Start</span>
              <span class="material-icons-round">arrow_forward</span>
            </button>
          </article>

          <article class="option-card">
            <div class="option-icon option-icon-alt">
              <span class="material-icons-round">dashboard_customize</span>
            </div>
            <div class="option-copy">
              <h2>Use Template</h2>
              <p>Select a ready package template</p>
            </div>
            <button type="button" class="secondary-btn" (click)="openTemplates()">
              <span>Choose Template</span>
              <span class="material-icons-round">view_list</span>
            </button>
          </article>
        </div>
      } @else {
        <section class="templates-view">
          <div class="templates-head">
            <div>
              <h2>Package Templates</h2>
              <p>Select a ready package template</p>
            </div>
            <button type="button" class="text-btn" (click)="view.set('options')">
              <span class="material-icons-round">arrow_back</span>
              <span>Back</span>
            </button>
          </div>

          <div class="template-grid">
            @for (template of templates; track template.id) {
              <article class="template-card">
                <h3>{{ template.title }}</h3>
                <p>{{ template.description }}</p>
                <div class="tag-row">
                  @for (service of template.services; track service) {
                    <span>{{ service }}</span>
                  }
                </div>
                <button type="button" class="primary-btn" (click)="useTemplate(template)">
                  <span>Use Template</span>
                  <span class="material-icons-round">arrow_forward</span>
                </button>
              </article>
            }
          </div>
        </section>
      }
    </section>
  `,
  styles: [`
    :host { display: block; }

    .create-page {
      min-height: calc(100vh - var(--sero-topbar-height, 70px));
      padding: 24px;
      background: var(--sero-app-bg);
      color: var(--sero-text-primary);
    }

    .page-head {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 22px;
    }

    .back-btn,
    .text-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border: 1px solid var(--sero-border);
      border-radius: 8px;
      background: var(--sero-card-bg);
      color: var(--sero-primary);
      cursor: pointer;
      transition: background 160ms ease, border-color 160ms ease;
    }

    .back-btn {
      width: 40px;
      height: 40px;
      flex: 0 0 auto;
    }

    .back-btn:hover,
    .text-btn:hover {
      background: var(--sero-primary-50);
      border-color: var(--sero-primary);
    }

    h1,
    h2,
    h3,
    p {
      margin: 0;
    }

    h1 {
      color: var(--sero-primary);
      font-size: 24px;
      line-height: 1.3;
    }

    .page-head p,
    .templates-head p,
    .option-copy p,
    .template-card p {
      color: var(--sero-text-secondary);
      font-size: 13px;
    }

    .option-grid,
    .template-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 18px;
      max-width: 960px;
    }

    .option-card,
    .template-card,
    .templates-view {
      border: 1px solid var(--sero-border);
      border-radius: 8px;
      background: var(--sero-card-bg);
    }

    .option-card {
      display: grid;
      grid-template-columns: auto 1fr;
      align-items: center;
      gap: 14px;
      min-height: 170px;
      padding: 22px;
    }

    .option-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 8px;
      background: var(--sero-primary);
      color: var(--sero-card-bg);
    }

    .option-icon-alt {
      background: var(--sero-gold);
    }

    .option-icon .material-icons-round {
      font-size: 24px;
    }

    .option-copy h2,
    .templates-head h2,
    .template-card h3 {
      color: var(--sero-primary);
      font-size: 18px;
      line-height: 1.35;
    }

    .option-copy p {
      margin-top: 4px;
    }

    .primary-btn,
    .secondary-btn,
    .text-btn {
      min-height: 40px;
      padding: 0 16px;
      font: inherit;
      font-size: 13px;
      font-weight: 800;
      gap: 8px;
    }

    .primary-btn,
    .secondary-btn {
      grid-column: 1 / -1;
      justify-self: start;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      cursor: pointer;
      transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
    }

    .primary-btn {
      border: 1px solid var(--sero-primary);
      background: var(--sero-primary);
      color: var(--sero-card-bg);
    }

    .secondary-btn {
      border: 1px solid var(--sero-border);
      background: var(--sero-card-bg);
      color: var(--sero-primary);
    }

    .primary-btn:hover,
    .secondary-btn:hover {
      transform: translateY(-1px);
    }

    .primary-btn:hover {
      background: var(--sero-primary-light);
      border-color: var(--sero-primary-light);
    }

    .secondary-btn:hover {
      background: var(--sero-primary-50);
      border-color: var(--sero-primary);
    }

    .templates-view {
      max-width: 1060px;
      padding: 20px;
    }

    .templates-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 14px;
      margin-bottom: 18px;
    }

    .text-btn {
      text-decoration: none;
      white-space: nowrap;
    }

    .template-card {
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-height: 210px;
    }

    .tag-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: auto;
    }

    .tag-row span {
      display: inline-flex;
      align-items: center;
      min-height: 26px;
      padding: 0 10px;
      border-radius: 999px;
      background: var(--sero-primary-50);
      color: var(--sero-primary);
      font-size: 12px;
      font-weight: 700;
    }

    @media (max-width: 760px) {
      .create-page {
        padding: 16px;
      }

      .option-grid,
      .template-grid {
        grid-template-columns: 1fr;
      }

      .option-card {
        grid-template-columns: 1fr;
      }

      .templates-head {
        flex-direction: column;
      }
    }
  `],
})
export class PackageCreatePageComponent {
  private readonly router = inject(Router);

  readonly templates = PACKAGE_TEMPLATES;
  readonly view = signal<'options' | 'templates'>('options');

  startFromScratch(): void {
    this.router.navigate(['/admin/agent-packages/new']);
  }

  openTemplates(): void {
    this.view.set('templates');
  }

  useTemplate(template: PackageTemplateOption): void {
    this.router.navigate(['/admin/agent-packages/new'], {
      queryParams: { template: template.id },
    });
  }

  backToPackages(): void {
    this.router.navigate(['/master/packages']);
  }
}
