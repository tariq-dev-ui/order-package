import { Component, computed, effect, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'counter-input',
  imports: [CommonModule, TranslateModule],
  templateUrl: './counter-input.html',
  styleUrl: './counter-input.css'
})
export class CounterInput {
  // Required value input
  value = input<number>(3);
  icon = input<string>('fas fa-bus');
  singularLabel = input<string>('Item');
  pluralLabel = input<string>('Items');
  min = input<number>(1);
  max = input<number>(999);

  // Emits whenever the value changes
  valueChange = output<number>();

  // Internal count signal
  count = signal(this.value());



  // Sync external value input with local signal
  constructor() {
    effect(() => {
      const val = this.value();
      if (val !== undefined) {
        this.count.set(val);
      }
    });
  }

// Computed display label (e.g. "1 Night" or "3 Nights")
displayLabel = computed(() => this.count() === 1 ? this.singularLabel() : this.pluralLabel());

increment() {
  if (this.count() < this.max()) {
    this.count.update(n => n + 1);
    this.valueChange.emit(this.count());
  }
}

decrement() {
  if (this.count() > this.min()) {
    this.count.update(n => n - 1);
    this.valueChange.emit(this.count());
  }
}

onManualInput(event: Event) {
  const raw = parseInt((event.target as HTMLInputElement).value, 10);
  if (!isNaN(raw)) {
    const clamped = Math.min(this.max(), Math.max(this.min(), raw));
    this.count.set(clamped);
    this.valueChange.emit(clamped);
  }
}
}
