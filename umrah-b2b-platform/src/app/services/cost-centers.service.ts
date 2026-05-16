/**
 * Cost Centers Service
 * خدمة مراكز التكلفة
 */

import { Injectable, signal } from '@angular/core';

export interface CostCenter {
  id: string;
  code: string;
  nameAr: string;
  nameEn: string;
  description?: string;
  isActive: boolean;
  parentId?: string;
  level: number;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CostCentersService {
  private costCenters = signal<CostCenter[]>([]);

  constructor() {
    // Initialize with default cost centers
    this.initializeDefaultCostCenters();
  }

  /**
   * Initialize Default Cost Centers
   * تهيئة مراكز التكلفة الافتراضية
   */
  private initializeDefaultCostCenters(): void {
    const defaultCostCenters: CostCenter[] = [
      {
        id: 'CC-001',
        code: 'CC-001',
        nameAr: 'قسم الاستقبال',
        nameEn: 'Reception Department',
        description: 'قسم استقبال النزلاء والضيوف',
        isActive: true,
        level: 1,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
      {
        id: 'CC-002',
        code: 'CC-002',
        nameAr: 'قسم الحجوزات',
        nameEn: 'Bookings Department',
        description: 'قسم إدارة الحجوزات',
        isActive: true,
        level: 1,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
      {
        id: 'CC-003',
        code: 'CC-003',
        nameAr: 'قسم المطبخ',
        nameEn: 'Kitchen Department',
        description: 'قسم المطبخ والطعام',
        isActive: true,
        level: 1,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
      {
        id: 'CC-004',
        code: 'CC-004',
        nameAr: 'قسم التنظيف',
        nameEn: 'Housekeeping Department',
        description: 'قسم التنظيف والصيانة العامة',
        isActive: true,
        level: 1,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
      {
        id: 'CC-005',
        code: 'CC-005',
        nameAr: 'قسم الصيانة',
        nameEn: 'Maintenance Department',
        description: 'قسم الصيانة والتشغيل',
        isActive: true,
        level: 1,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
      {
        id: 'CC-006',
        code: 'CC-006',
        nameAr: 'قسم المبيعات',
        nameEn: 'Sales Department',
        description: 'قسم المبيعات والتسويق',
        isActive: true,
        level: 1,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
      {
        id: 'CC-007',
        code: 'CC-007',
        nameAr: 'قسم المحاسبة',
        nameEn: 'Accounting Department',
        description: 'قسم المحاسبة والمالية',
        isActive: true,
        level: 1,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
      {
        id: 'CC-008',
        code: 'CC-008',
        nameAr: 'قسم الموارد البشرية',
        nameEn: 'HR Department',
        description: 'قسم الموارد البشرية',
        isActive: true,
        level: 1,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
      {
        id: 'CC-009',
        code: 'CC-009',
        nameAr: 'المطعم',
        nameEn: 'Restaurant',
        description: 'مركز تكلفة المطعم',
        isActive: true,
        level: 1,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
      {
        id: 'CC-010',
        code: 'CC-010',
        nameAr: 'الغرف',
        nameEn: 'Rooms',
        description: 'مركز تكلفة الغرف',
        isActive: true,
        level: 1,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
      },
    ];

    this.costCenters.set(defaultCostCenters);
  }

  /**
   * Get All Cost Centers
   * الحصول على جميع مراكز التكلفة
   */
  getAllCostCenters(): CostCenter[] {
    return this.costCenters();
  }

  /**
   * Get Active Cost Centers
   * الحصول على مراكز التكلفة النشطة
   */
  getActiveCostCenters(): CostCenter[] {
    return this.costCenters().filter(cc => cc.isActive);
  }

  /**
   * Get Cost Center by ID
   * الحصول على مركز تكلفة بالمعرف
   */
  getCostCenterById(id: string): CostCenter | undefined {
    return this.costCenters().find(cc => cc.id === id);
  }

  /**
   * Get Cost Center by Code
   * الحصول على مركز تكلفة بالكود
   */
  getCostCenterByCode(code: string): CostCenter | undefined {
    return this.costCenters().find(cc => cc.code === code);
  }

  /**
   * Get Cost Centers for Select/Dropdown
   * الحصول على مراكز التكلفة للقوائم المنسدلة
   */
  getCostCentersForSelect(includeInactive: boolean = false): Array<{ value: string; label: string; labelEn: string }> {
    const centers = includeInactive ? this.getAllCostCenters() : this.getActiveCostCenters();
    return centers.map(cc => ({
      value: cc.id,
      label: cc.nameAr,
      labelEn: cc.nameEn
    }));
  }

  /**
   * Add Cost Center
   * إضافة مركز تكلفة
   */
  addCostCenter(costCenter: Omit<CostCenter, 'id' | 'createdAt' | 'updatedAt'>): CostCenter {
    const newCostCenter: CostCenter = {
      ...costCenter,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.costCenters.update(centers => [...centers, newCostCenter]);
    return newCostCenter;
  }

  /**
   * Update Cost Center
   * تحديث مركز تكلفة
   */
  updateCostCenter(id: string, updates: Partial<CostCenter>): CostCenter | null {
    let updatedCenter: CostCenter | null = null;

    this.costCenters.update(centers =>
      centers.map(cc => {
        if (cc.id === id) {
          updatedCenter = {
            ...cc,
            ...updates,
            updatedAt: new Date()
          };
          return updatedCenter;
        }
        return cc;
      })
    );

    return updatedCenter;
  }

  /**
   * Delete Cost Center
   * حذف مركز تكلفة
   */
  deleteCostCenter(id: string): boolean {
    const initialLength = this.costCenters().length;
    this.costCenters.update(centers => centers.filter(cc => cc.id !== id));
    return this.costCenters().length < initialLength;
  }

  /**
   * Toggle Cost Center Status
   * تبديل حالة مركز التكلفة
   */
  toggleCostCenterStatus(id: string): CostCenter | null {
    let toggledCenter: CostCenter | null = null;

    this.costCenters.update(centers =>
      centers.map(cc => {
        if (cc.id === id) {
          toggledCenter = {
            ...cc,
            isActive: !cc.isActive,
            updatedAt: new Date()
          };
          return toggledCenter;
        }
        return cc;
      })
    );

    return toggledCenter;
  }

  /**
   * Search Cost Centers
   * البحث في مراكز التكلفة
   */
  searchCostCenters(query: string, language: 'ar' | 'en' = 'ar'): CostCenter[] {
    const lowerQuery = query.toLowerCase();
    return this.costCenters().filter(cc => {
      const searchText = language === 'ar' ? cc.nameAr : cc.nameEn;
      const searchCode = cc.code.toLowerCase();
      const searchDescription = (cc.description || '').toLowerCase();
      return searchText.toLowerCase().includes(lowerQuery) ||
             searchCode.includes(lowerQuery) ||
             searchDescription.includes(lowerQuery);
    });
  }

  /**
   * Generate Unique ID
   * توليد معرف فريد
   */
  private generateId(): string {
    const existingCenters = this.costCenters();
    let maxNumber = 0;

    existingCenters.forEach(cc => {
      const match = cc.id.match(/CC-(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) {
          maxNumber = num;
        }
      }
    });

    const newNumber = maxNumber + 1;
    return `CC-${String(newNumber).padStart(3, '0')}`;
  }

  /**
   * Validate Cost Center Code
   * التحقق من صحة كود مركز التكلفة
   */
  validateCostCenterCode(code: string, excludeId?: string): { valid: boolean; message?: string } {
    if (!code || code.trim() === '') {
      return { valid: false, message: 'كود مركز التكلفة مطلوب' };
    }

    // Check if code already exists
    const existingCenter = this.getCostCenterByCode(code);
    if (existingCenter && existingCenter.id !== excludeId) {
      return { valid: false, message: 'كود مركز التكلفة موجود بالفعل' };
    }

    return { valid: true };
  }

  /**
   * Get Cost Centers Statistics
   * الحصول على إحصائيات مراكز التكلفة
   */
  getCostCentersStatistics(): {
    total: number;
    active: number;
    inactive: number;
  } {
    const allCenters = this.getAllCostCenters();
    return {
      total: allCenters.length,
      active: allCenters.filter(cc => cc.isActive).length,
      inactive: allCenters.filter(cc => !cc.isActive).length,
    };
  }
}
