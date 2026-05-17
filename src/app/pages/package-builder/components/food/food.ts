import { Component, Input, output, Signal, signal } from '@angular/core';
import { CounterInput } from '../counter-input/counter-input';
import { FoodState } from '../../services/package-builder-state-management-service';
import { CateringFoodTypeModel, CateringTypeModel } from 'src/app/services/admin.api.client';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'food-step',
  imports: [CounterInput, CommonModule, TranslateModule],
  templateUrl: './food.html',
  styleUrl: './food.css'
})
export class Food {
  readonly nextStep = output<void>();
  readonly prevStep = output<void>();
  @Input() state!: Signal<FoodState>;
  @Input() listState!: Signal<FoodState[]>;
  @Input() addFn!: () => void;
  @Input() removeFn!: (index: number) => void;
  @Input() updateFn!: (key: keyof FoodState, value: any) => void;
  @Input() foodTypes!: Signal<CateringFoodTypeModel[]>;
  @Input() cateringTypes!: Signal<CateringTypeModel[]>;
  @Input() isLoadingFoodTypes!: Signal<boolean>;
  @Input() isLoadingCateringTypes!: Signal<boolean>;


  onCateringTypeChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    const id = value === 'undefined' ? undefined : Number(value);
    const cateringType = this.cateringTypes().find(d => d.CateringTypeID === id);
    if (this.updateFn) {
      this.updateFn('mealTypeId', id);
      this.updateFn('mealType', cateringType ? cateringType.Title : '');
    }
  }
  
  onFoodTypeChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    const id = value === 'undefined' ? undefined : Number(value);
    const foodType = this.foodTypes().find(d => d.Id === id);
    if (this.updateFn) {
      this.updateFn('foodTypeId', id);
      this.updateFn('foodType', foodType ? foodType.TypeName : '');
    }
  }

  addRow() {
    this.addFn();
  }

  removeRow(i: number) {
    this.removeFn(i);
  }

  onChange<K extends keyof FoodState>(key: K, raw: any) {
    let val: any = raw === 'undefined' ? undefined : Number(raw);
    if (isNaN(val)) val = undefined;
    this.updateFn(key, val as FoodState[K]);
  }

  trackByIndex(index: number) {
    return index;
  }

  meals = signal<number>(3);
  onMealsChange(value: number) {
    this.meals.set(value);
    if (this.updateFn) {
      this.updateFn('mealCount', value);
    }
  }

  onSkip() {
    this.nextStep.emit();
  }

  onNext() {
    this.nextStep.emit();
  }

canGoNext(): boolean {
   return this.listState().length > 0;
  }


   isFoodValid(): boolean {
    const s = this.state();
    return !!(
      s.foodTypeId &&
      s.mealTypeId &&
      s.mealCount
    );
  }
}
