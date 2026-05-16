import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, DestroyRef, forwardRef, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { debounceTime, filter, Observable, ReplaySubject, startWith, tap } from 'rxjs';

@Component({
  selector: 'app-select-search',
  imports: [
    ReactiveFormsModule,
    CommonModule,
    MatFormFieldModule,
    MatSelectModule,
    TranslateModule,
    NgxMatSelectSearchModule,
    AsyncPipe,
    MatIconModule,
    MatIconButton,
    MatProgressSpinnerModule,
  ],
  templateUrl: './select-search.component.html',
  styleUrl: './select-search.component.scss',
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AppSelectSearchComponent), multi: true }],
})
export class AppSelectSearchComponent implements ControlValueAccessor {
  formControl = input.required<FormControl>();
  placeHolder = input.required<string>();
  dataSource = input.required<(filter: string) => Observable<SelectOption[]>>();
  multiple = input<boolean>(false);
  filterCtrl = input(new FormControl(''));

  parentCtrl = input<FormControl | undefined>(undefined);

  onValueChanged = output<any>();

  destroyRef = inject(DestroyRef);
  searching = signal(false);
  data = new ReplaySubject<SelectOption[]>(1);
  private wasEnabledBeforeSearch = true;

  ngOnInit() {
    if (this.parentCtrl() !== undefined) {
      // If parent already has a value, enable the control and trigger an initial load.
      // Otherwise keep it disabled until a parent value is provided.
      let lastParentValue = this.parentCtrl()?.value;
      if (lastParentValue === undefined || lastParentValue === null) {
        this.formControl().disable();
      } else {
        this.formControl().enable();
        // trigger initial load
        this.filterCtrl().setValue(' ');
        this.filterCtrl().setValue('');
      }

      this.parentCtrl()
        ?.valueChanges
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((value) => {
          // Only clear the child selection when the parent actually changes to a different value.
          if (value !== lastParentValue) {
            try {
              this.formControl()?.setValue(undefined);
            } catch (e) {
              // noop
            }
          }
          lastParentValue = value;

          if (value === undefined || value === null) {
            this.formControl().disable();
          } else {
            this.formControl().enable();
            // reload options for the new parent value
            this.filterCtrl().setValue(' ');
            this.filterCtrl().setValue('');
          }
        });
    }

    this.filterCtrl()
      .valueChanges.pipe(
        startWith(' '),
        filter((val) => !!val),
        tap(() => {
          // mark searching and disable control programmatically to avoid template-level disabled binding
          this.searching.set(true);
          try {
            this.wasEnabledBeforeSearch = !this.formControl()?.disabled;
            if (this.wasEnabledBeforeSearch) {
              this.formControl()?.disable();
            }
          } catch (e) {
            // ignore if formControl not available yet
          }
        }),
        takeUntilDestroyed(this.destroyRef),
        debounceTime(500)
      )
      .subscribe((filter) => {
        this.dataSource()(filter?.trim() ?? '').subscribe({
          next: (val) => {
            this.searching.set(false);
            this.data.next(val);
            // restore control state
            try {
              if (this.wasEnabledBeforeSearch) {
                this.formControl()?.enable();
              }
            } catch (e) {
              // noop
            }
          },
          error: (err) => {
            this.searching.set(false);
            console.error(err);
            try {
              if (this.wasEnabledBeforeSearch) {
                this.formControl()?.enable();
              }
            } catch (e) {
              // noop
            }
          },
        });
      });
  }

  onChanged(e: any) {
    this.onValueChanged.emit(e);
  }

  writeValue(obj: any): void {}
  registerOnChange(fn: any): void {}
  registerOnTouched(fn: any): void {}
  setDisabledState?(isDisabled: boolean): void {}
}

export interface SelectOption {
  label: string;
  value: any;
}
