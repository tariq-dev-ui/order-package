import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageService } from './core/services/language.service';
import { DateInputIconService } from './shared/services/date-input-icon.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styles: [`:host { display: block; min-height: 100vh; }`]
})
export class App implements OnInit {
  constructor(
    private langService: LanguageService,
    private dateInputIconService: DateInputIconService,
  ) {}

  ngOnInit(): void {
    this.langService.init();
    this.dateInputIconService.start();
  }
}
