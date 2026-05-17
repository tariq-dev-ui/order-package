import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LanguageService } from './core/services/language.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`,
  styles: [`:host { display: block; min-height: 100vh; }`]
})
export class App implements OnInit {
  constructor(private langService: LanguageService) {}

  ngOnInit(): void {
    this.langService.init();
  }
}
