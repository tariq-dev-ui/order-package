import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppSelectSearchComponent } from './select-search.component';

describe('AppSelectSearchComponent', () => {
  let component: AppSelectSearchComponent;
  let fixture: ComponentFixture<AppSelectSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppSelectSearchComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppSelectSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
