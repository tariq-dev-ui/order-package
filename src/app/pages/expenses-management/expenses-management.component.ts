import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, viewChild, ViewChild, HostListener, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TablerIconComponent } from 'angular-tabler-icons';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MockDataService } from 'src/app/services/mock-data.service';
import { AppSnackBarService } from 'src/app/services/app-snack-bar.service';

interface Expense {
  id: number;
  nameAr: string; // الاسم بالعربي
  nameEn: string; // الاسم بالإنجليزي
  isActive: boolean; // الحالة
  createdAt: Date; // تاريخ الإنشاء
  updatedAt?: Date; // تاريخ التحديث
}

@Component({
  selector: 'app-expenses-management',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    TranslateModule,
    TablerIconComponent,
    MatTableModule,
    MatPaginatorModule,
  ],
  templateUrl: './expenses-management.component.html',
  styleUrl: './expenses-management.component.scss',
})
export class ExpensesManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private mockDataService = inject(MockDataService);
  private snackBarService = inject(AppSnackBarService);
  private translate = inject(TranslateService);

  // Unified Filters
  activeFilters = signal<Array<{id: string, type: string, label: string, value: string}>>([]);
  showFilterMenu = signal(false);
  @ViewChild('filterButtonContainer', { static: false }) filterButtonContainer!: ElementRef;

  paginator = viewChild(MatPaginator);
  
  isLoading = signal(false);
  expenses = signal<Expense[]>([]);
  dataSource = new MatTableDataSource<Expense>([]);
  
  displayedColumns: string[] = ['nameEn', 'nameAr', 'status', 'createdAt', 'updatedAt', 'actions'];
  
  // Filter form
  filterForm!: FormGroup;
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;

  ngOnInit() {
    this.initializeFilterForm();
    this.loadData();
  }

  ngAfterViewInit() {
    const paginator = this.paginator();
    if (paginator) {
      this.dataSource.paginator = paginator;
    }
  }

  loadData() {
    this.isLoading.set(true);
    
    // Load expenses (mock data for now)
    setTimeout(() => {
      const mockData: Expense[] = [
        {
          id: 1,
          nameAr: 'مصروفات الكهرباء',
          nameEn: 'Electricity Expenses',
          isActive: true,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-02-10'),
        },
        {
          id: 2,
          nameAr: 'مصروفات المياه',
          nameEn: 'Water Expenses',
          isActive: true,
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-02-08'),
        },
        {
          id: 3,
          nameAr: 'مصروفات الصيانة',
          nameEn: 'Maintenance Expenses',
          isActive: true,
          createdAt: new Date('2024-01-20'),
          updatedAt: new Date('2024-02-15'),
        },
        {
          id: 4,
          nameAr: 'مصروفات الرواتب',
          nameEn: 'Salaries Expenses',
          isActive: true,
          createdAt: new Date('2024-01-10'),
          updatedAt: new Date('2024-02-01'),
        },
        {
          id: 5,
          nameAr: 'مصروفات التسويق',
          nameEn: 'Marketing Expenses',
          isActive: false,
          createdAt: new Date('2024-01-25'),
          updatedAt: new Date('2024-02-12'),
        },
        {
          id: 6,
          nameAr: 'مصروفات التأمين',
          nameEn: 'Insurance Expenses',
          isActive: true,
          createdAt: new Date('2024-01-18'),
          updatedAt: new Date('2024-02-05'),
        },
        {
          id: 7,
          nameAr: 'مصروفات النقل',
          nameEn: 'Transportation Expenses',
          isActive: true,
          createdAt: new Date('2024-01-22'),
          updatedAt: new Date('2024-02-14'),
        },
        {
          id: 8,
          nameAr: 'مصروفات الاتصالات',
          nameEn: 'Telecommunications Expenses',
          isActive: true,
          createdAt: new Date('2024-01-12'),
          updatedAt: new Date('2024-02-03'),
        },
        {
          id: 9,
          nameAr: 'مصروفات الأثاث',
          nameEn: 'Furniture Expenses',
          isActive: false,
          createdAt: new Date('2024-01-28'),
          updatedAt: new Date('2024-02-16'),
        },
        {
          id: 10,
          nameAr: 'مصروفات التنظيف',
          nameEn: 'Cleaning Expenses',
          isActive: true,
          createdAt: new Date('2024-01-14'),
          updatedAt: new Date('2024-02-07'),
        },
        {
          id: 11,
          nameAr: 'مصروفات الأمن',
          nameEn: 'Security Expenses',
          isActive: true,
          createdAt: new Date('2024-01-16'),
          updatedAt: new Date('2024-02-09'),
        },
        {
          id: 12,
          nameAr: 'مصروفات التدريب',
          nameEn: 'Training Expenses',
          isActive: true,
          createdAt: new Date('2024-01-24'),
          updatedAt: new Date('2024-02-11'),
        }
      ];
      
      this.expenses.set(mockData);
      this.totalItems = mockData.length;
      this.updateDataSource();
      this.isLoading.set(false);
    }, 1000);
  }

  updateDataSource() {
    const filtered = this.getFilteredExpenses();
    this.totalItems = filtered.length;
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.dataSource.data = filtered.slice(startIndex, endIndex);
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
        id: 'createdAt', 
        label: this.translate.instant('تاريخ الإنشاء'), 
        icon: 'calendar', 
        type: 'date', 
        placeholder: this.translate.instant('اختر التاريخ') 
      },
      { 
        id: 'updatedAt', 
        label: this.translate.instant('تاريخ التحديث'), 
        icon: 'calendar-event', 
        type: 'date', 
        placeholder: this.translate.instant('اختر التاريخ') 
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

  exportExpenses() {
    // TODO: Implement export functionality
    console.log('Export expenses');
  }

  addNewExpense() {
    // TODO: Open dialog to add new expense
    this.snackBarService.showSuccessSnackBar('سيتم فتح نافذة إضافة مصروف جديد');
  }

  editExpense(expense: Expense) {
    // TODO: Open dialog to edit expense
    this.snackBarService.showSuccessSnackBar(`سيتم فتح نافذة تعديل: ${expense.nameAr}`);
  }

  deleteExpense(expense: Expense) {
    if (confirm(`هل أنت متأكد من حذف "${expense.nameAr}"?`)) {
      const expenses = this.expenses();
      const updated = expenses.filter(e => e.id !== expense.id);
      this.expenses.set(updated);
      this.updateDataSource();
      this.snackBarService.showSuccessSnackBar('تم حذف المصروف بنجاح');
    }
  }

  toggleStatus(expense: Expense) {
    const expenses = this.expenses();
    const updated = expenses.map(e => 
      e.id === expense.id ? { ...e, isActive: !e.isActive, updatedAt: new Date() } : e
    );
    this.expenses.set(updated);
    this.updateDataSource();
    this.snackBarService.showSuccessSnackBar(
      `تم ${expense.isActive ? 'تعطيل' : 'تفعيل'} ${expense.nameAr} بنجاح`
    );
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'نشط' : 'غير نشط';
  }

  getStatusClass(isActive: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getFilteredExpenses(): Expense[] {
    const expenses = this.expenses();
    const filters = this.filterForm.value;
    
    return expenses.filter(expense => {
      // Search filter (general search)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matches = 
          expense.nameAr.toLowerCase().includes(searchTerm) ||
          expense.nameEn.toLowerCase().includes(searchTerm);
        if (!matches) return false;
      }
      
      // Status filter
      if (filters.status && filters.status !== 'all') {
        if (filters.status === 'active' && !expense.isActive) return false;
        if (filters.status === 'inactive' && expense.isActive) return false;
      }
      
      // Created date filter
      if (filters.createdAt) {
        const expenseDate = new Date(expense.createdAt).toDateString();
        const filterDate = new Date(filters.createdAt).toDateString();
        if (expenseDate !== filterDate) return false;
      }
      
      // Updated date filter
      if (filters.updatedAt) {
        if (!expense.updatedAt) return false;
        const expenseDate = new Date(expense.updatedAt).toDateString();
        const filterDate = new Date(filters.updatedAt).toDateString();
        if (expenseDate !== filterDate) return false;
      }
      
      return true;
    });
  }

  onFilterChange() {
    this.pageIndex = 0;
    this.updateDataSource();
    const paginator = this.paginator();
    if (paginator) {
      paginator.firstPage();
    }
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updateDataSource();
  }

  clearFilters() {
    // Remove all filter controls except search
    const filterIds = this.activeFilters().map(f => f.id);
    filterIds.forEach(id => {
      this.filterForm.removeControl(id);
    });
    
    // Clear active filters
    this.activeFilters.set([]);
    
    // Reset and recreate form with search only
    this.filterForm.reset({
      search: ''
    });
    
    // Reload data
    this.onFilterChange();
  }
}

