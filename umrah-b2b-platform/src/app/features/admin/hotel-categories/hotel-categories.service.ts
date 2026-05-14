import { Injectable } from '@angular/core';
import { HOTEL_CATEGORIES_MOCK } from './hotel-categories.mock';
import { HotelCategoryFormValue, HotelCategoryModel } from './hotel-category.model';

@Injectable({ providedIn: 'root' })
export class HotelCategoriesService {
  private categories: HotelCategoryModel[] = [...HOTEL_CATEGORIES_MOCK];
  private nextId = HOTEL_CATEGORIES_MOCK.length + 1;

  getAll(): HotelCategoryModel[] {
    return this.categories.map((item) => ({ ...item }));
  }

  add(value: HotelCategoryFormValue): HotelCategoryModel {
    const newItem: HotelCategoryModel = {
      id: `HC-${String(this.nextId++).padStart(3, '0')}`,
      title: value.title.trim(),
      description: value.description.trim(),
      isActive: value.isActive,
      added: this.getTodayAsDdMmYyyy(),
    };

    this.categories = [newItem, ...this.categories];
    return { ...newItem };
  }

  update(id: string, value: HotelCategoryFormValue): void {
    this.categories = this.categories.map((item) =>
      item.id === id
        ? {
            ...item,
            title: value.title.trim(),
            description: value.description.trim(),
            isActive: value.isActive,
          }
        : item
    );
  }

  delete(id: string): void {
    this.categories = this.categories.filter((item) => item.id !== id);
  }

  private getTodayAsDdMmYyyy(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `${day}-${month}-${year}`;
  }
}
