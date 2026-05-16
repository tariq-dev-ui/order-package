import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TablerIconComponent } from 'angular-tabler-icons';
import { MatDialog } from '@angular/material/dialog';
import { AppSnackBarService } from 'src/app/services/app-snack-bar.service';
import { CoreService } from 'src/app/services/core.service';
import { CostCentersService, CostCenter } from 'src/app/services/cost-centers.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-cost-centers',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    TablerIconComponent,
  ],
  templateUrl: './cost-centers.component.html',
  styleUrl: './cost-centers.component.scss',
})
export class CostCentersComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private snackBarService = inject(AppSnackBarService);
  private translate = inject(TranslateService);
  private coreService = inject(CoreService);
  private costCentersService = inject(CostCentersService);

  isLoading = signal(false);
  costCenters = signal<CostCenter[]>([]);
  filteredCostCenters = signal<CostCenter[]>([]);
  searchQuery = signal<string>('');

  // Form
  costCenterForm: FormGroup;
  isEditing = signal(false);
  showForm = signal(false);

  // Options
  options = signal(this.coreService.getOptions());
  dir = computed(() => this.options().dir);

  constructor() {
    this.coreService.notify.subscribe(() => {
      this.options.set(this.coreService.getOptions());
    });

    this.costCenterForm = this.fb.group({
      id: [''],
      code: ['', [Validators.required, Validators.minLength(2)]],
      nameAr: ['', [Validators.required]],
      nameEn: ['', [Validators.required]],
      description: [''],
      isActive: [true],
    });
  }

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);

    setTimeout(() => {
      // Load data from service
      const allCostCenters = this.costCentersService.getAllCostCenters();
      this.costCenters.set(allCostCenters);
      this.filteredCostCenters.set(allCostCenters);
      this.isLoading.set(false);
    }, 500);
  }

  onSearchChange() {
    const query = this.searchQuery().toLowerCase();
    const allCenters = this.costCenters();

    if (!query || query.trim() === '') {
      this.filteredCostCenters.set(allCenters);
    } else {
      const filtered = allCenters.filter(center => {
        const matchesCode = center.code.toLowerCase().includes(query);
        const matchesNameAr = center.nameAr.toLowerCase().includes(query);
        const matchesNameEn = center.nameEn.toLowerCase().includes(query);
        const matchesDescription = (center.description || '').toLowerCase().includes(query);
        return matchesCode || matchesNameAr || matchesNameEn || matchesDescription;
      });
      this.filteredCostCenters.set(filtered);
    }
  }

  openAddForm() {
    this.isEditing.set(false);
    this.costCenterForm.reset({
      id: '',
      code: '',
      nameAr: '',
      nameEn: '',
      description: '',
      isActive: true,
    });
    this.showForm.set(true);
  }

  openEditForm(costCenter: CostCenter) {
    this.isEditing.set(true);
    this.costCenterForm.patchValue({
      id: costCenter.id,
      code: costCenter.code,
      nameAr: costCenter.nameAr,
      nameEn: costCenter.nameEn,
      description: costCenter.description || '',
      isActive: costCenter.isActive,
    });
    this.showForm.set(true);
  }

  closeForm() {
    this.showForm.set(false);
    this.isEditing.set(false);
    this.costCenterForm.reset();
  }

  saveCostCenter() {
    if (this.costCenterForm.invalid) {
      this.costCenterForm.markAllAsTouched();
      return;
    }

    const formValue = this.costCenterForm.value;

    if (this.isEditing()) {
      // Update existing
      const updated = this.costCentersService.updateCostCenter(formValue.id, {
        code: formValue.code,
        nameAr: formValue.nameAr,
        nameEn: formValue.nameEn,
        description: formValue.description || '',
        isActive: formValue.isActive,
      });
      
      if (updated) {
        this.snackBarService.showSuccessSnackBar('تم تحديث مركز التكلفة بنجاح');
        this.loadData();
      }
    } else {
      // Add new - validate code first
      const validation = this.costCentersService.validateCostCenterCode(formValue.code);
      if (!validation.valid) {
        this.snackBarService.showErrorSnackBar(validation.message || 'كود مركز التكلفة غير صحيح');
        return;
      }

      this.costCentersService.addCostCenter({
        code: formValue.code,
        nameAr: formValue.nameAr,
        nameEn: formValue.nameEn,
        description: formValue.description || '',
        isActive: formValue.isActive,
        level: 1,
      });
      
      this.snackBarService.showSuccessSnackBar('تم إضافة مركز التكلفة بنجاح');
      this.loadData();
    }

    this.onSearchChange();
    this.closeForm();
  }

  deleteCostCenter(costCenter: CostCenter) {
    if (confirm(`هل أنت متأكد من حذف ${costCenter.nameAr}؟`)) {
      const deleted = this.costCentersService.deleteCostCenter(costCenter.id);
      if (deleted) {
        this.loadData();
        this.onSearchChange();
        this.snackBarService.showSuccessSnackBar('تم حذف مركز التكلفة بنجاح');
      } else {
        this.snackBarService.showErrorSnackBar('فشل حذف مركز التكلفة');
      }
    }
  }

  toggleActive(costCenter: CostCenter) {
    const toggled = this.costCentersService.toggleCostCenterStatus(costCenter.id);
    if (toggled) {
      this.loadData();
      this.onSearchChange();
      this.snackBarService.showSuccessSnackBar(
        toggled.isActive ? 'تم تفعيل مركز التكلفة' : 'تم إلغاء تفعيل مركز التكلفة'
      );
    } else {
      this.snackBarService.showErrorSnackBar('فشل تغيير حالة مركز التكلفة');
    }
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '-';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date);
  }
}
