import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, ViewChild, HostListener, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TablerIconComponent } from 'angular-tabler-icons';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MockDataService } from 'src/app/services/mock-data.service';
import { AppSnackBarService } from 'src/app/services/app-snack-bar.service';
import { formatSeroCurrency } from 'src/app/shared/currency/currency-format.util';

interface TaxOrFee {
  id: number;
  name: string;
  nameEn?: string;
  type: 'tax' | 'fee'; // نوع: ضريبة أو رسوم
  calculationType: 'percentage' | 'fixed'; // نوع الحساب: نسبة مئوية أو مبلغ ثابت
  value: number; // القيمة (نسبة مئوية أو مبلغ)
  appliesTo: 'bookings' | 'services' | 'both'; // يطبق على: الحجوزات، الخدمات، أو كليهما
  isMandatory: boolean; // إلزامي
  isActive: boolean;
  description?: string;
  descriptionEn?: string;
  createdAt: Date;
  updatedAt?: Date;
}

@Component({
  selector: 'app-taxes-fees-management',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    TranslateModule,
    TablerIconComponent,
    MatTableModule,
  ],
  templateUrl: './taxes-fees-management.component.html',
  styleUrl: './taxes-fees-management.component.scss',
})
export class TaxesFeesManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private mockDataService = inject(MockDataService);
  private snackBarService = inject(AppSnackBarService);
  private translate = inject(TranslateService);

  // Unified Filters
  activeFilters = signal<Array<{id: string, type: string, label: string, value: string}>>([]);
  showFilterMenu = signal(false);
  @ViewChild('filterButtonContainer', { static: false }) filterButtonContainer!: ElementRef;

  isLoading = signal(false);
  taxesAndFees = signal<TaxOrFee[]>([]);
  
  displayedColumns: string[] = ['name', 'type', 'calculationType', 'value', 'appliesTo', 'isMandatory', 'status', 'actions'];
  
  // Filter form
  filterForm!: FormGroup;
  selectedCategory: 'all' | 'taxes' | 'fees' = 'all';

  ngOnInit() {
    this.initializeFilterForm();
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    
    // Load taxes and fees (mock data for now)
    setTimeout(() => {
      const mockData: TaxOrFee[] = [
        {
          id: 1,
          name: 'ضريبة القيمة المضافة',
          nameEn: 'Value Added Tax (VAT)',
          type: 'tax',
          calculationType: 'percentage',
          value: 15,
          appliesTo: 'both',
          isMandatory: true,
          isActive: true,
          description: 'ضريبة القيمة المضافة بنسبة 15%',
          descriptionEn: 'Value Added Tax at 15%',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 2,
          name: 'رسوم الخدمة',
          nameEn: 'Service Fee',
          type: 'fee',
          calculationType: 'percentage',
          value: 10,
          appliesTo: 'bookings',
          isMandatory: false,
          isActive: true,
          description: 'رسوم خدمة بنسبة 10% على الحجوزات',
          descriptionEn: 'Service fee at 10% on bookings',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 3,
          name: 'رسوم المدينة',
          nameEn: 'City Tax',
          type: 'fee',
          calculationType: 'fixed',
          value: 50,
          appliesTo: 'bookings',
          isMandatory: true,
          isActive: true,
          description: `رسوم المدينة بمبلغ ثابت ${formatSeroCurrency(50)}`,
          descriptionEn: `City tax at fixed amount of ${formatSeroCurrency(50)}`,
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 4,
          name: 'رسوم التنظيف',
          nameEn: 'Cleaning Fee',
          type: 'fee',
          calculationType: 'fixed',
          value: 100,
          appliesTo: 'bookings',
          isMandatory: false,
          isActive: true,
          description: `رسوم تنظيف بمبلغ ثابت ${formatSeroCurrency(100)}`,
          descriptionEn: `Cleaning fee at fixed amount of ${formatSeroCurrency(100)}`,
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 5,
          name: 'ضريبة السياحة',
          nameEn: 'Tourism Tax',
          type: 'tax',
          calculationType: 'percentage',
          value: 5,
          appliesTo: 'bookings',
          isMandatory: true,
          isActive: false,
          description: 'ضريبة السياحة بنسبة 5%',
          descriptionEn: 'Tourism tax at 5%',
          createdAt: new Date('2024-01-01'),
        }
      ];
      
      this.taxesAndFees.set(mockData);
      this.isLoading.set(false);
    }, 1000);
  }

  initializeFilterForm() {
    this.filterForm = this.fb.group({
      search: ['']
    });
  }

  // Available filter types
  get availableFilterTypes() {
    return [
      { 
        id: 'status', 
        label: this.translate.instant('الحالة'), 
        icon: 'filter', 
        type: 'select', 
        placeholder: '',
        options: [
          { value: 'all', label: this.translate.instant('جميع الحالات') },
          { value: 'active', label: this.translate.instant('نشط') },
          { value: 'inactive', label: this.translate.instant('غير نشط') }
        ]
      },
      { 
        id: 'calculationType', 
        label: this.translate.instant('نوع الحساب'), 
        icon: 'calculator', 
        type: 'select', 
        placeholder: '',
        options: [
          { value: 'all', label: this.translate.instant('جميع الأنواع') },
          { value: 'percentage', label: this.translate.instant('نسبة مئوية') },
          { value: 'fixed', label: this.translate.instant('مبلغ ثابت') }
        ]
      },
      { 
        id: 'appliesTo', 
        label: this.translate.instant('يطبق على'), 
        icon: 'tag', 
        type: 'select', 
        placeholder: '',
        options: [
          { value: 'all', label: this.translate.instant('الكل') },
          { value: 'bookings', label: this.translate.instant('الحجوزات') },
          { value: 'services', label: this.translate.instant('الخدمات') },
          { value: 'both', label: this.translate.instant('الحجوزات والخدمات') }
        ]
      }
    ];
  }

  getAvailableFilters() {
    const activeFilterIds = this.activeFilters().map(f => f.id);
    return this.availableFilterTypes.filter(f => !activeFilterIds.includes(f.id));
  }

  addFilter(filterType: any) {
    const newFilter = {
      id: filterType.id,
      type: filterType.type,
      label: filterType.label,
      value: ''
    };
    
    this.activeFilters.update(filters => [...filters, newFilter]);
    this.filterForm.addControl(filterType.id, this.fb.control(''));
    this.showFilterMenu.set(false);
  }

  removeFilter(filterId: string) {
    this.activeFilters.update(filters => filters.filter(f => f.id !== filterId));
    this.filterForm.removeControl(filterId);
    this.onFilterChange();
  }

  updateFilterValue(filterId: string, value: string) {
    if (!this.filterForm.get(filterId)) {
      this.filterForm.addControl(filterId, this.fb.control(''));
    }
    this.filterForm.get(filterId)?.setValue(value);
    this.activeFilters.update(filters => 
      filters.map(f => f.id === filterId ? {...f, value} : f)
    );
    this.onFilterChange();
  }

  getFilterIcon(filterId: string): string {
    const filterType = this.availableFilterTypes.find(f => f.id === filterId);
    return filterType?.icon || 'filter';
  }

  getFilterPlaceholder(filterId: string): string {
    const filterType = this.availableFilterTypes.find(f => f.id === filterId);
    return filterType?.placeholder || '';
  }

  getFilterOptions(filterId: string) {
    const filterType = this.availableFilterTypes.find(f => f.id === filterId);
    return filterType?.options || [];
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (this.showFilterMenu() && this.filterButtonContainer) {
      const clickedInside = this.filterButtonContainer.nativeElement.contains(event.target);
      if (!clickedInside) {
        this.showFilterMenu.set(false);
      }
    }
  }

  exportTaxesFees() {
    // TODO: Implement export functionality
    console.log('Export taxes and fees');
  }

  addNewTaxOrFee() {
    // TODO: Open dialog to add new tax or fee
    this.snackBarService.showSuccessSnackBar('سيتم فتح نافذة إضافة ضريبة أو رسوم جديدة');
  }

  editTaxOrFee(item: TaxOrFee) {
    // TODO: Open dialog to edit tax or fee
    this.snackBarService.showSuccessSnackBar(`سيتم فتح نافذة تعديل: ${item.name}`);
  }

  deleteTaxOrFee(item: TaxOrFee) {
    if (confirm(`هل أنت متأكد من حذف "${item.name}"?`)) {
      const items = this.taxesAndFees();
      const updated = items.filter(i => i.id !== item.id);
      this.taxesAndFees.set(updated);
      this.snackBarService.showSuccessSnackBar('تم حذف الضريبة/الرسوم بنجاح');
    }
  }

  toggleStatus(item: TaxOrFee) {
    const items = this.taxesAndFees();
    const updated = items.map(i => 
      i.id === item.id ? { ...i, isActive: !i.isActive } : i
    );
    this.taxesAndFees.set(updated);
    this.snackBarService.showSuccessSnackBar(
      `تم ${item.isActive ? 'تعطيل' : 'تفعيل'} ${item.name} بنجاح`
    );
  }

  getTypeText(type: string): string {
    return type === 'tax' ? 'ضريبة' : 'رسوم';
  }

  getTypeClass(type: string): string {
    return `type-${type}`;
  }

  getCalculationTypeText(type: string): string {
    return type === 'percentage' ? 'نسبة مئوية' : 'مبلغ ثابت';
  }

  getAppliesToText(appliesTo: string): string {
    const texts: { [key: string]: string } = {
      'bookings': 'الحجوزات',
      'services': 'الخدمات',
      'both': 'الحجوزات والخدمات'
    };
    return texts[appliesTo] || appliesTo;
  }

  formatValue(item: TaxOrFee): string {
    if (item.calculationType === 'percentage') {
      return `${item.value}%`;
    }
    return formatSeroCurrency(item.value);
  }

  getStatusText(item: TaxOrFee): string {
    return item.isActive ? 'نشط' : 'غير نشط';
  }

  getStatusClass(item: TaxOrFee): string {
    return item.isActive ? 'status-active' : 'status-inactive';
  }

  getFilteredItems(): TaxOrFee[] {
    const items = this.taxesAndFees();
    const filters = this.filterForm.value;
    
    return items.filter(item => {
      // Category filter (from tabs)
      if (this.selectedCategory !== 'all') {
        if (this.selectedCategory === 'taxes' && item.type !== 'tax') return false;
        if (this.selectedCategory === 'fees' && item.type !== 'fee') return false;
      }
      
      // Search filter (general search)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(searchTerm) ||
                           (item.nameEn && item.nameEn.toLowerCase().includes(searchTerm));
        const matchesDescription = item.description?.toLowerCase().includes(searchTerm) ||
                                  (item.descriptionEn && item.descriptionEn.toLowerCase().includes(searchTerm));
        if (!matchesName && !matchesDescription) return false;
      }
      
      // Status filter
      if (filters.status && filters.status !== 'all') {
        if (filters.status === 'active' && !item.isActive) return false;
        if (filters.status === 'inactive' && item.isActive) return false;
      }
      
      // Calculation type filter
      if (filters.calculationType && filters.calculationType !== 'all') {
        if (filters.calculationType !== item.calculationType) return false;
      }
      
      // Applies to filter
      if (filters.appliesTo && filters.appliesTo !== 'all') {
        if (filters.appliesTo !== item.appliesTo) return false;
      }
      
      return true;
    });
  }

  onFilterChange() {
    // Filtering is handled by getFilteredItems()
  }

  clearFilters() {
    // Remove all filter controls from form
    this.activeFilters().forEach(filter => {
      if (this.filterForm.get(filter.id)) {
        this.filterForm.removeControl(filter.id);
      }
    });
    
    // Clear active filters
    this.activeFilters.set([]);
    
    // Reset and recreate form
    this.filterForm.reset();
    this.filterForm = this.fb.group({
      search: ['']
    });
    
    // Reload data without filters
    this.onFilterChange();
  }

  switchCategory(category: 'all' | 'taxes' | 'fees') {
    this.selectedCategory = category;
    this.onFilterChange();
  }
}

