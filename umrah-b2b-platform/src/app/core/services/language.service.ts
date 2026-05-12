import { Injectable, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

export type SupportedLang = 'en' | 'ar';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly STORAGE_KEY = 'umrah_lang';
  readonly currentLang = signal<SupportedLang>('en');

  constructor(private translate: TranslateService) {}

  init(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY) as SupportedLang | null;
    const lang: SupportedLang = saved === 'ar' ? 'ar' : 'en';
    this.applyLang(lang);
  }

  setLang(lang: SupportedLang): void {
    localStorage.setItem(this.STORAGE_KEY, lang);
    this.applyLang(lang);
  }

  toggle(): void {
    this.setLang(this.currentLang() === 'en' ? 'ar' : 'en');
  }

  isRtl(): boolean {
    return this.currentLang() === 'ar';
  }

  private applyLang(lang: SupportedLang): void {
    this.currentLang.set(lang);
    this.translate.use(lang);
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
    document.body.setAttribute('data-lang', lang);
  }
}
