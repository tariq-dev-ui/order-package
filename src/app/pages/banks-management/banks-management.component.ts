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

interface BankAccount {
  id: number;
  bankName: string;
  bankNameEn?: string;
  accountNumber: string;
  accountHolderName: string;
  iban?: string; // رقم الآيبان
  swiftCode?: string; // رمز السويفت
  branchName?: string; // اسم الفرع
  branchAddress?: string; // عنوان الفرع
  currency: string; // العملة (SAR, USD, etc.)
  accountType: 'current' | 'savings' | 'investment'; // نوع الحساب
  isActive: boolean;
  isDefault: boolean; // الحساب الافتراضي
  balance?: number; // الرصيد الحالي
  description?: string;
  createdAt: Date;
  updatedAt?: Date;
}

interface PaymentMethod {
  id: number;
  name: string;
  nameEn?: string;
  type: 'bank_transfer' | 'credit_card' | 'debit_card' | 'cash' | 'online_payment' | 'other';
  bankAccountId?: number; // مرتبط بحساب بنكي
  isActive: boolean;
  isDefault: boolean;
  description?: string;
  createdAt: Date;
}

@Component({
  selector: 'app-banks-management',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    TranslateModule,
    TablerIconComponent,
    MatTableModule,
  ],
  templateUrl: './banks-management.component.html',
  styleUrl: './banks-management.component.scss',
})
export class BanksManagementComponent implements OnInit {
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
  bankAccounts = signal<BankAccount[]>([]);
  paymentMethods = signal<PaymentMethod[]>([]);
  
  // Filter form
  filterForm!: FormGroup;
  selectedView: 'accounts' | 'payment-methods' = 'accounts';

  ngOnInit() {
    this.initializeFilterForm();
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    
    // Load bank accounts and payment methods (mock data for now)
    setTimeout(() => {
      const mockAccounts: BankAccount[] = [
        {
          id: 1,
          bankName: 'البنك الأهلي السعودي',
          bankNameEn: 'Al Ahli Bank',
          accountNumber: '1234567890123456',
          accountHolderName: 'فندق سيرو',
          iban: 'SA1234567890123456789012',
          swiftCode: 'NCBKSAJE',
          branchName: 'فرع الرياض',
          branchAddress: 'الرياض، المملكة العربية السعودية',
          currency: 'SAR',
          accountType: 'current',
          isActive: true,
          isDefault: true,
          balance: 500000,
          description: 'الحساب الرئيسي للفندق',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 2,
          bankName: 'بنك الراجحي',
          bankNameEn: 'Al Rajhi Bank',
          accountNumber: '9876543210987654',
          accountHolderName: 'فندق سيرو',
          iban: 'SA9876543210987654321098',
          swiftCode: 'RJHISARI',
          branchName: 'فرع جدة',
          branchAddress: 'جدة، المملكة العربية السعودية',
          currency: 'SAR',
          accountType: 'savings',
          isActive: true,
          isDefault: false,
          balance: 250000,
          description: 'حساب توفير',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 3,
          bankName: 'البنك السعودي الفرنسي',
          bankNameEn: 'Banque Saudi Fransi',
          accountNumber: '5555666677778888',
          accountHolderName: 'فندق سيرو',
          iban: 'SA5555666677778888999900',
          swiftCode: 'BSFRSARI',
          branchName: 'فرع الدمام',
          branchAddress: 'الدمام، المملكة العربية السعودية',
          currency: 'USD',
          accountType: 'current',
          isActive: false,
          isDefault: false,
          balance: 100000,
          description: 'حساب بالدولار',
          createdAt: new Date('2024-01-01'),
        }
      ];
      
      const mockPaymentMethods: PaymentMethod[] = [
        {
          id: 1,
          name: 'تحويل بنكي',
          nameEn: 'Bank Transfer',
          type: 'bank_transfer',
          bankAccountId: 1,
          isActive: true,
          isDefault: true,
          description: 'تحويل مباشر إلى الحساب البنكي',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 2,
          name: 'بطاقة ائتمانية',
          nameEn: 'Credit Card',
          type: 'credit_card',
          isActive: true,
          isDefault: false,
          description: 'دفع بالبطاقة الائتمانية',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 3,
          name: 'نقدي',
          nameEn: 'Cash',
          type: 'cash',
          isActive: true,
          isDefault: false,
          description: 'دفع نقدي',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 4,
          name: 'دفع إلكتروني',
          nameEn: 'Online Payment',
          type: 'online_payment',
          isActive: true,
          isDefault: false,
          description: 'دفع عبر الإنترنت',
          createdAt: new Date('2024-01-01'),
        }
      ];
      
      this.bankAccounts.set(mockAccounts);
      this.paymentMethods.set(mockPaymentMethods);
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
    const baseFilters = [
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
      }
    ];

    // Add account-specific filters only when viewing accounts
    if (this.selectedView === 'accounts') {
      return [
        ...baseFilters,
        { 
          id: 'accountType', 
          label: this.translate.instant('نوع الحساب'), 
          icon: 'wallet', 
          type: 'select', 
          placeholder: '',
          options: [
            { value: 'all', label: this.translate.instant('جميع الأنواع') },
            { value: 'current', label: this.translate.instant('جاري') },
            { value: 'savings', label: this.translate.instant('توفير') },
            { value: 'investment', label: this.translate.instant('استثماري') }
          ]
        },
        { 
          id: 'currency', 
          label: this.translate.instant('العملة'), 
          icon: 'currency-dollar', 
          type: 'select', 
          placeholder: '',
          options: [
            { value: 'all', label: this.translate.instant('جميع العملات') },
            { value: 'SAR', label: this.translate.instant('ريال سعودي') },
            { value: 'USD', label: this.translate.instant('دولار أمريكي') },
            { value: 'EUR', label: this.translate.instant('يورو') }
          ]
        }
      ];
    }

    return baseFilters;
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

  exportBanks() {
    // TODO: Implement export functionality
    console.log('Export banks');
  }

  addNewBankAccount() {
    // TODO: Open dialog to add new bank account
    this.snackBarService.showSuccessSnackBar('سيتم فتح نافذة إضافة حساب بنكي جديد');
  }

  editBankAccount(account: BankAccount) {
    // TODO: Open dialog to edit bank account
    this.snackBarService.showSuccessSnackBar(`سيتم فتح نافذة تعديل: ${account.bankName}`);
  }

  deleteBankAccount(account: BankAccount) {
    if (confirm(`هل أنت متأكد من حذف حساب "${account.bankName}"?`)) {
      const accounts = this.bankAccounts();
      const updated = accounts.filter(a => a.id !== account.id);
      this.bankAccounts.set(updated);
      this.snackBarService.showSuccessSnackBar('تم حذف الحساب البنكي بنجاح');
    }
  }

  toggleAccountStatus(account: BankAccount) {
    const accounts = this.bankAccounts();
    const updated = accounts.map(a => 
      a.id === account.id ? { ...a, isActive: !a.isActive } : a
    );
    this.bankAccounts.set(updated);
    this.snackBarService.showSuccessSnackBar(
      `تم ${account.isActive ? 'تعطيل' : 'تفعيل'} حساب ${account.bankName} بنجاح`
    );
  }

  setDefaultAccount(account: BankAccount) {
    const accounts = this.bankAccounts();
    const updated = accounts.map(a => ({
      ...a,
      isDefault: a.id === account.id
    }));
    this.bankAccounts.set(updated);
    this.snackBarService.showSuccessSnackBar(`تم تعيين ${account.bankName} كحساب افتراضي`);
  }

  addNewPaymentMethod() {
    // TODO: Open dialog to add new payment method
    this.snackBarService.showSuccessSnackBar('سيتم فتح نافذة إضافة طريقة دفع جديدة');
  }

  editPaymentMethod(method: PaymentMethod) {
    // TODO: Open dialog to edit payment method
    this.snackBarService.showSuccessSnackBar(`سيتم فتح نافذة تعديل: ${method.name}`);
  }

  deletePaymentMethod(method: PaymentMethod) {
    if (confirm(`هل أنت متأكد من حذف طريقة الدفع "${method.name}"?`)) {
      const methods = this.paymentMethods();
      const updated = methods.filter(m => m.id !== method.id);
      this.paymentMethods.set(updated);
      this.snackBarService.showSuccessSnackBar('تم حذف طريقة الدفع بنجاح');
    }
  }

  togglePaymentMethodStatus(method: PaymentMethod) {
    const methods = this.paymentMethods();
    const updated = methods.map(m => 
      m.id === method.id ? { ...m, isActive: !m.isActive } : m
    );
    this.paymentMethods.set(updated);
    this.snackBarService.showSuccessSnackBar(
      `تم ${method.isActive ? 'تعطيل' : 'تفعيل'} ${method.name} بنجاح`
    );
  }

  setDefaultPaymentMethod(method: PaymentMethod) {
    const methods = this.paymentMethods();
    const updated = methods.map(m => ({
      ...m,
      isDefault: m.id === method.id
    }));
    this.paymentMethods.set(updated);
    this.snackBarService.showSuccessSnackBar(`تم تعيين ${method.name} كطريقة دفع افتراضية`);
  }

  getAccountTypeText(type: string): string {
    const types: { [key: string]: string } = {
      'current': 'جاري',
      'savings': 'توفير',
      'investment': 'استثماري'
    };
    return types[type] || type;
  }

  getPaymentMethodTypeText(type: string): string {
    const types: { [key: string]: string } = {
      'bank_transfer': 'تحويل بنكي',
      'credit_card': 'بطاقة ائتمانية',
      'debit_card': 'بطاقة مدفوعة مسبقاً',
      'cash': 'نقدي',
      'online_payment': 'دفع إلكتروني',
      'other': 'أخرى'
    };
    return types[type] || type;
  }

  getPaymentMethodTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'bank_transfer': 'building-bank',
      'credit_card': 'credit-card',
      'debit_card': 'card',
      'cash': 'cash',
      'online_payment': 'world',
      'other': 'dots'
    };
    return icons[type] || 'dots';
  }

  getStatusText(isActive: boolean): string {
    return isActive ? 'نشط' : 'غير نشط';
  }

  getStatusClass(isActive: boolean): string {
    return isActive ? 'status-active' : 'status-inactive';
  }

  formatBalance(balance: number, currency: string): string {
    return `${balance.toLocaleString()} ${currency}`;
  }

  getBankAccountName(accountId?: number): string {
    if (!accountId) return '-';
    const account = this.bankAccounts().find(a => a.id === accountId);
    return account ? account.bankName : '-';
  }

  getFilteredAccounts(): BankAccount[] {
    const accounts = this.bankAccounts();
    const filters = this.filterForm.value;
    
    return accounts.filter(account => {
      // Search filter (general search)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matches = 
          account.bankName.toLowerCase().includes(searchTerm) ||
          (account.bankNameEn && account.bankNameEn.toLowerCase().includes(searchTerm)) ||
          account.accountNumber.includes(searchTerm) ||
          (account.iban && account.iban.toLowerCase().includes(searchTerm)) ||
          (account.accountHolderName && account.accountHolderName.toLowerCase().includes(searchTerm));
        if (!matches) return false;
      }
      
      // Status filter
      if (filters.status && filters.status !== 'all') {
        if (filters.status === 'active' && !account.isActive) return false;
        if (filters.status === 'inactive' && account.isActive) return false;
      }
      
      // Account type filter
      if (filters.accountType && filters.accountType !== 'all') {
        if (filters.accountType !== account.accountType) return false;
      }
      
      // Currency filter
      if (filters.currency && filters.currency !== 'all') {
        if (filters.currency !== account.currency) return false;
      }
      
      return true;
    });
  }

  getFilteredPaymentMethods(): PaymentMethod[] {
    const methods = this.paymentMethods();
    const filters = this.filterForm.value;
    
    return methods.filter(method => {
      // Search filter (general search)
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matches = 
          method.name.toLowerCase().includes(searchTerm) ||
          (method.nameEn && method.nameEn.toLowerCase().includes(searchTerm)) ||
          (method.description && method.description.toLowerCase().includes(searchTerm));
        if (!matches) return false;
      }
      
      // Status filter
      if (filters.status && filters.status !== 'all') {
        if (filters.status === 'active' && !method.isActive) return false;
        if (filters.status === 'inactive' && method.isActive) return false;
      }
      
      return true;
    });
  }

  onFilterChange() {
    // Filtering is handled by getFilteredAccounts() and getFilteredPaymentMethods()
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

  switchView(view: 'accounts' | 'payment-methods') {
    this.selectedView = view;
    // Clear filters when switching views since available filters change
    this.clearFilters();
  }
}

