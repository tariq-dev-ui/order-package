import { Injectable } from '@angular/core';
import {
  OrderSummaryData,
  PackageBuilderStep,
  RoomType,
  SelectOption
} from '../models/package-builder-ui.model';

@Injectable({ providedIn: 'root' })
export class PackageBuilderUiService {
  getSteps(): PackageBuilderStep[] {
    return [
      { id: 1, label: 'الفنادق مكة', icon: 'apartment' },
      { id: 2, label: 'الفنادق المدينة', icon: 'business' },
      { id: 3, label: 'النقل', icon: 'directions_car' },
      { id: 4, label: 'تذاكر', icon: 'confirmation_number' },
      { id: 5, label: 'الطعام', icon: 'restaurant' },
      { id: 6, label: 'أخرى', icon: 'receipt_long' },
      { id: 7, label: 'Pricing', icon: 'sell' }
    ];
  }

  getDistrictOptions(): SelectOption[] {
    return [
      { value: 'ajyad', label: 'أجياد' },
      { value: 'aziziyah', label: 'العزيزية' },
      { value: 'jarwal', label: 'جرول' },
      { value: 'misfalah', label: 'المسفلة' }
    ];
  }

  getCategoryOptions(): SelectOption[] {
    return [
      { value: '3', label: '3 نجوم' },
      { value: '4', label: '4 نجوم' },
      { value: '5', label: '5 نجوم' }
    ];
  }

  getRoomTypes(): RoomType[] {
    return [
      { id: 'double', label: 'غرفة مزدوجة' },
      { id: 'triple', label: 'غرفة ثلاثية' },
      { id: 'quad', label: 'غرفة رباعية' }
    ];
  }

  getRoomTypeOptions(): SelectOption[] {
    return this.getRoomTypes().map((room) => ({ value: room.id, label: room.label }));
  }

  getOrderSummaryData(): OrderSummaryData {
    return {
      title: 'تفاصيل الطلب',
      sections: [
        {
          id: 'makkah-stay',
          title: 'إقامة مكة',
          icon: 'apartment',
          lines: [
            { label: 'لم يتم إضافة أي فندق', value: '' }
          ]
        },
        {
          id: 'madinah-stay',
          title: 'إقامة المدينة',
          icon: 'business',
          lines: [
            { label: 'لم يتم إضافة أي فندق', value: '' }
          ]
        },
        {
          id: 'services',
          title: 'الخدمات',
          icon: 'inventory_2',
          lines: [
            { label: 'النقل:', value: 'لم يتم إضافة نقل' },
            { label: 'وجبات:', value: 'لم يتم إضافة خطط وجبات' },
            { label: 'تذاكر:', value: 'No tickets added' }
          ]
        }
      ],
      supportCards: [
        {
          id: 'support-1',
          title: 'تحتاج إلى مساعدة؟',
          description: 'تواصل مع فريق الدعم لدينا على مدار الساعة للحصول على المساعدة',
          icon: 'support_agent'
        },
        {
          id: 'support-2',
          title: 'تحتاج إلى مساعدة؟',
          description: 'نحن هنا للإجابة عن أي استفسار قبل المتابعة',
          icon: 'support'
        }
      ]
    };
  }
}
