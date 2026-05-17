import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from 'src/app/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { CoreService } from 'src/app/services/core.service';
import { ChartOfAccountsService } from 'src/app/services/chart-of-accounts.service';
import { Account } from 'src/app/models/chart-of-accounts.model';

export interface AddAccountDialogData {
  parentAccount?: Account;
  account?: Account;
  mode?: 'add' | 'edit';
}

@Component({
  selector: 'app-add-account-dialog',
  standalone: true,
  imports: [CommonModule, MaterialModule, TranslateModule, ReactiveFormsModule],
  templateUrl: './add-account-dialog.component.html',
  styleUrl: './add-account-dialog.component.scss',
})
export class AddAccountDialogComponent implements OnInit {
  private dialogRef    = inject(MatDialogRef<AddAccountDialogComponent>);
  private fb           = inject(FormBuilder);
  private data         = inject<AddAccountDialogData>(MAT_DIALOG_DATA);
  private coreService  = inject(CoreService);
  private chartService = inject(ChartOfAccountsService);

  addAccountForm!: FormGroup;

  options = signal(this.coreService.getOptions());
  dir     = computed(() => this.options().dir);

  /** True when dialog was opened with a pre-selected parent — field is locked (not editable). */
  readonly isParentLocked = !!this.data.parentAccount;
  /** The pre-selected parent account, exposed for template binding. */
  readonly lockedParent: Account | null = this.data.parentAccount ?? null;

  // ── Parent account autocomplete ──────────────────────────────────
  parentSearchQuery = signal('');

  private allActiveAccounts = computed(() =>
    this.chartService.getAllAccounts().filter(a => a.isActive)
  );

  filteredParentAccounts = computed(() => {
    const q = this.parentSearchQuery().toLowerCase().trim();
    const all = this.allActiveAccounts();
    if (!q) return all;
    return all.filter(a =>
      a.code.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q) ||
      (a.nameEn || '').toLowerCase().includes(q)
    );
  });

  displayParentAccount = (account: Account | null): string => {
    if (!account) return '';
    return `${account.code} — ${account.name}`;
  };

  onParentSearch(value: string): void {
    this.parentSearchQuery.set(value);
  }

  onParentSelected(): void {
    this.parentSearchQuery.set('');
  }

  constructor() {
    this.coreService.notify.subscribe(() => {
      this.options.set(this.coreService.getOptions());
    });
  }

  ngOnInit(): void {
    this.initializeForm();
  }

  getMode(): 'add' | 'edit' {
    return this.data.mode || (this.data.account ? 'edit' : 'add');
  }

  isEditMode(): boolean {
    return this.getMode() === 'edit';
  }

  initializeForm(): void {
    const account = this.data.account;

    const initialParent: Account | null =
      this.data.parentAccount ??
      (account?.parentId
        ? (this.chartService.getAccountById(account.parentId) ?? null)
        : null);

    this.addAccountForm = this.fb.group({
      parentAccount: [initialParent],
      name:          [account?.name      || '', [Validators.required, Validators.maxLength(200)]],
      nameEn:        [account?.nameEn    || '', [Validators.required, Validators.maxLength(200)]],
      notes:         [account?.notes     || '', [Validators.maxLength(500)]],
      taxNumber:     [account?.taxNumber || '', [Validators.maxLength(100)]],
    });
  }

  getDialogTitle(): string {
    return this.isEditMode() ? 'تعديل الحساب' : 'إضافة حساب فرعي';
  }

  onSave(): void {
    if (this.addAccountForm.valid) {
      const { parentAccount, ...rest } = this.addAccountForm.value;
      this.dialogRef.close({
        ...rest,
        parentId: (parentAccount as Account | null)?.id ?? null,
      });
    } else {
      this.addAccountForm.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
