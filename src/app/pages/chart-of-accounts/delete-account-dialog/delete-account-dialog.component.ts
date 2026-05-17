/**
 * Delete Account Dialog Component
 * نافذة منبثقة لتأكيد حذف الحساب
 */

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { CoreService } from 'src/app/services/core.service';
import { Account } from 'src/app/models/chart-of-accounts.model';
import { computed, signal } from '@angular/core';

export interface DeleteAccountDialogData {
  account: Account;
}

@Component({
  selector: 'app-delete-account-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    TranslateModule
  ],
  templateUrl: './delete-account-dialog.component.html',
  styleUrl: './delete-account-dialog.component.scss'
})
export class DeleteAccountDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<DeleteAccountDialogComponent>);
  private data = inject<DeleteAccountDialogData>(MAT_DIALOG_DATA);
  private coreService = inject(CoreService);

  account!: Account;

  options = signal(this.coreService.getOptions());
  dir = computed(() => this.options().dir);

  constructor() {
    this.coreService.notify.subscribe(() => {
      this.options.set(this.coreService.getOptions());
    });
  }

  ngOnInit(): void {
    this.account = this.data.account;
  }

  /**
   * Get Account Display Name
   */
  getAccountDisplayName(): string {
    return this.dir() === 'rtl' 
      ? this.account.name 
      : this.account.nameEn;
  }

  /**
   * Confirm Delete
   */
  onConfirm(): void {
    this.dialogRef.close(true);
  }

  /**
   * Cancel
   */
  onCancel(): void {
    this.dialogRef.close(false);
  }
}
