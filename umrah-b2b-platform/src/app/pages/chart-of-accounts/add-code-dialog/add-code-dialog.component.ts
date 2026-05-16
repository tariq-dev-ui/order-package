/**
 * Add Code Dialog Component
 * نافذة منبثقة لتأكيد إضافة خانة كود
 */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MaterialModule } from 'src/app/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { CoreService } from 'src/app/services/core.service';
import { Account } from 'src/app/models/chart-of-accounts.model';
import { computed, signal } from '@angular/core';

export interface AddCodeDialogData {
  account: Account;
}

@Component({
  selector: 'app-add-code-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    TranslateModule
  ],
  templateUrl: './add-code-dialog.component.html',
  styleUrl: './add-code-dialog.component.scss'
})
export class AddCodeDialogComponent {
  private dialogRef = inject(MatDialogRef<AddCodeDialogComponent>);
  private data = inject<AddCodeDialogData>(MAT_DIALOG_DATA);
  private coreService = inject(CoreService);

  options = signal(this.coreService.getOptions());
  dir = computed(() => this.options().dir);

  constructor() {
    this.coreService.notify.subscribe(() => {
      this.options.set(this.coreService.getOptions());
    });
  }

  /**
   * Get Account Display Name
   */
  getAccountName(): string {
    return this.dir() === 'rtl' 
      ? this.data.account.name 
      : this.data.account.nameEn;
  }

  /**
   * Confirm
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
