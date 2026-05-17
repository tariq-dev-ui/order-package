import { ApplicationConfig, importProvidersFrom, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideTranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideNativeDateAdapter } from '@angular/material/core';
import { TablerIconsModule } from 'angular-tabler-icons';
import * as TablerIcons from 'angular-tabler-icons/icons';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withRouterConfig({ onSameUrlNavigation: 'reload' })),
    provideAnimations(),
    provideNativeDateAdapter(),
    provideHttpClient(),
    importProvidersFrom(TablerIconsModule.pick(TablerIcons)),
    provideTranslateService({
      defaultLanguage: 'en',
      loader: provideTranslateHttpLoader({
        prefix: '/assets/i18n/',
        suffix: '.json'
      })
    })
  ]
};
