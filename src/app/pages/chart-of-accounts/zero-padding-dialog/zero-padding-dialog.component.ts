import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MaterialModule } from 'src/app/material.module';

export interface ZeroPaddingPreviewRow {
  oldCode: string;
  newCode: string;
  name: string;
  depth: number;
}

export interface ZeroPaddingDialogData {
  categoryLabel: string;
  categoryType: string;
  preview: ZeroPaddingPreviewRow[];
}

@Component({
  selector: 'app-zero-padding-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MaterialModule, TranslateModule],
  templateUrl: './zero-padding-dialog.component.html',
  styleUrl: './zero-padding-dialog.component.scss',
})
export class ZeroPaddingDialogComponent {
  dialogRef = inject(MatDialogRef<ZeroPaddingDialogComponent>);
  data: ZeroPaddingDialogData = inject(MAT_DIALOG_DATA);
}
