import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      class="sero-lang-btn"
      (click)="langService.toggle()"
      [class.is-ar]="langService.currentLang() === 'ar'"
      [attr.aria-label]="langService.currentLang() === 'en' ? 'Switch to Arabic' : 'Switch to English'">
      <span class="lang-globe material-icons-round">language</span>
      <span class="lang-current">{{ langService.currentLang() === 'en' ? 'EN' : 'عر' }}</span>
      <span class="lang-target">{{ langService.currentLang() === 'en' ? '→ عربي' : '→ EN' }}</span>
    </button>
  `,
  styles: [`
    .sero-lang-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 6px 11px;
      border: 1px solid var(--sero-border);
      border-radius: 8px;
      background: var(--sero-card-bg);
      cursor: pointer;
      transition: all var(--t-fast);
      color: var(--sero-text-secondary);
      font-family: var(--sero-font);

      &:hover {
        background: var(--sero-primary-50);
        border-color: var(--sero-primary-200);
        color: var(--sero-primary);
      }

      &.is-ar {
        direction: rtl;
        font-family: var(--sero-font-latin);
      }
    }

    .lang-globe {
      font-size: 15px;
      flex-shrink: 0;
    }

    .lang-current {
      font-size: 0.8rem;
      font-weight: 700;
      letter-spacing: 0.04em;
    }

    .lang-target {
      font-size: 0.72rem;
      font-weight: 500;
      color: var(--sero-text-muted);
      white-space: nowrap;
    }
  `]
})
export class LanguageSwitcherComponent {
  constructor(public langService: LanguageService) {}
}
