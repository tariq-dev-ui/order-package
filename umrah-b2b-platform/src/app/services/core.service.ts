import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AppSettings, defaults } from '../config';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class CoreService {
  private document = inject(DOCUMENT);

  get notify(): Observable<Record<string, any>> {
    return this.notify$.asObservable();
  }

  private notify$ = new BehaviorSubject<Record<string, any>>({});

  getOptions() {
    return this.options;
  }

  setOptions(options: AppSettings) {
    this.options = Object.assign(defaults, options);
    this.notify$.next(this.options);
  }

  private options = defaults;

  getLanguage() {
    return this.options?.language;
  }

  setLanguage(lang: any) {
    window.localStorage.setItem('language', JSON.stringify(lang));

    this.options.language = lang.code;
    this.options.dir = lang.languageDir;

    var langCode = lang.code;
    this.notify$.next({ langCode });

    // Update HTML element
    this.document.documentElement.dir = lang.languageDir;
    this.document.documentElement.lang = lang.code;
  }
}
