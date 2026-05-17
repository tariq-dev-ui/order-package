import { Component, OnInit, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { TablerIconComponent } from 'angular-tabler-icons';
import { MatDialog } from '@angular/material/dialog';
import { CoreService } from 'src/app/services/core.service';
import { ChartOfAccountsService } from 'src/app/services/chart-of-accounts.service';
import { Account } from 'src/app/models/chart-of-accounts.model';
import { AddTaxSupplierDialogComponent } from './add-tax-supplier-dialog.component';

interface TaxSupplier {
  id: string;
  name: string;
  taxNumber: string;
}

@Component({
  selector: 'app-tax-expense-entry',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    TranslateModule,
    TablerIconComponent
  ],
  templateUrl: './tax-expense-entry.component.html',
  styleUrl: './tax-expense-entry.component.scss'
})
export class TaxExpenseEntryComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private coreService = inject(CoreService);
  private chartService = inject(ChartOfAccountsService);

  options = signal(this.coreService.getOptions());
  dir = computed(() => this.options().dir);

  entryForm!: FormGroup;
  accounts: Account[] = [];

  taxSuppliers = signal<TaxSupplier[]>([
    { id: 'ts-1', name: 'شركة ضريبة 1', taxNumber: '3000000001' },
    { id: 'ts-2', name: 'شركة ضريبة 2', taxNumber: '3000000002' }
  ]);

  costCenters = [
    { id: 'CC-001', nameAr: '01 - فراي برجر', nameEn: '01 - Fry Burger' },
    { id: 'CC-002', nameAr: '02 - مطبخ رئيسي', nameEn: '02 - Main Kitchen' }
  ];

  get dirIsRtl(): boolean {
    return this.dir() === 'rtl';
  }

  get details(): FormArray {
    return this.entryForm.get('details') as FormArray;
  }

  constructor() {
    this.coreService.notify.subscribe(() => {
      this.options.set(this.coreService.getOptions());
    });
  }

  ngOnInit(): void {
    this.accounts = this.chartService.getAllAccounts().filter(a => !a.isParent && a.isActive);

    this.entryForm = this.fb.group({
      amount: [0, [Validators.required, Validators.min(0)]],
      taxRate: [15, [Validators.required, Validators.min(0), Validators.max(100)]],
      date: [new Date(2026, 0, 15), Validators.required],
      description: ['', Validators.required],
      invoiceNumber: [''],
      taxSupplierId: [''],
      fromAccountId: ['', Validators.required],
      toAccountId: ['', Validators.required],
      costCenterId: ['CC-001'],
      details: this.fb.array([])
    });

    // Initialize with one empty detail row
    this.addDetailRow();
  }

  addDetailRow(): void {
    this.details.push(
      this.fb.group({
        debit: [0, [Validators.min(0)]],
        credit: [0, [Validators.min(0)]],
        accountId: ['', Validators.required],
        costCenterId: ['CC-001'],
        description: [''],
        invoiceNumber: [''],
        taxNumber: [''],
        companyName: ['']
      })
    );
  }

  removeDetailRow(index: number): void {
    if (this.details.length > 1) {
      this.details.removeAt(index);
    }
  }

  getAccountName(id: string): string {
    const acc = this.accounts.find(a => a.id === id);
    if (!acc) return '';
    return this.dirIsRtl ? acc.name : acc.nameEn;
  }

  getCostCenterName(id: string): string {
    const cc = this.costCenters.find(c => c.id === id);
    if (!cc) return '';
    return this.dirIsRtl ? cc.nameAr : cc.nameEn;
  }

  getSupplierName(id: string): string {
    const s = this.taxSuppliers().find(t => t.id === id);
    return s ? `${s.name} - ${s.taxNumber}` : '';
  }

  openAddSupplierDialog(): void {
    const dialogRef = this.dialog.open(AddTaxSupplierDialogComponent, {
      width: '420px'
    });

    dialogRef.afterClosed().subscribe((result: { name: string; taxNumber: string } | undefined) => {
      if (result) {
        const newSupplier: TaxSupplier = {
          id: `ts-${Date.now()}`,
          name: result.name,
          taxNumber: result.taxNumber
        };
        this.taxSuppliers.update(list => [...list, newSupplier]);
        this.entryForm.get('taxSupplierId')?.setValue(newSupplier.id);
      }
    });
  }

  save(): void {
    if (this.entryForm.invalid) {
      this.entryForm.markAllAsTouched();
      return;
    }
    // Placeholder: Here we would build and send the tax expense entry
    console.log('Tax expense entry:', this.entryForm.value);
    this.router.navigate(['/journal-entries']);
  }

  cancel(): void {
    this.router.navigate(['/journal-entries']);
  }
}

