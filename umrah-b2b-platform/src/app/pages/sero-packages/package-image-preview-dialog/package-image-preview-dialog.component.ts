import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

export type PackageImagePreviewDialogData = {
  imageUrl: string;
  title?: string | null;
  code?: string | null;
};

@Component({
  selector: 'app-package-image-preview-dialog',
  imports: [CommonModule, MatDialogModule, MatButtonModule, TranslateModule],
  template: `
    <div class="flex flex-col h-full bg-white overflow-hidden">

      <!-- ── Fixed Header ── -->
      <div class="shrink-0 flex items-center justify-between gap-3 px-5 py-3 bg-white border-b border-gray-100 shadow-sm">
        <div class="flex items-center gap-3 min-w-0">
          <div class="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
            <i class="fas fa-image text-primary-500 text-sm"></i>
          </div>
          <div class="min-w-0">
            <p class="text-sm font-semibold text-gray-800 truncate leading-tight">
              {{ data.title || ('Package Image' | translate) }}
            </p>
            @if (data.code) {
              <p class="text-xs text-gray-400 truncate leading-tight mt-0.5">{{ data.code }}</p>
            }
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">

          <!-- Download -->
          <a
            [href]="data.imageUrl"
            target="_blank"
            rel="noopener"
            download
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                   border border-gray-200 text-gray-600 bg-white hover:bg-gray-50
                   hover:border-gray-300 transition-colors cursor-pointer select-none"
            [title]="'Download' | translate">
            <i class="fas fa-download text-xs text-gray-500"></i>
            <span class="hidden sm:inline">{{ 'Download' | translate }}</span>
          </a>

          <!-- Close -->
          <button
            type="button"
            (click)="close()"
            class="w-8 h-8 flex items-center justify-center rounded-full
                   text-gray-400 hover:text-gray-700 hover:bg-gray-100
                   transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300"
            [attr.aria-label]="'Close' | translate"
            [title]="('Close' | translate) + ' (Esc)'">
            <i class="fas fa-times text-sm"></i>
          </button>
        </div>
      </div>

      <!-- ── Image Canvas (scrollable) ── -->
      <div class="flex-1 min-h-0 overflow-auto custom-scroll flex items-center justify-center p-6"
           style="background: linear-gradient(160deg, #1a2214 0%, #0e1609 100%);">
        <img
          [src]="data.imageUrl"
          [alt]="data.title || ('Package image' | translate)"
          class="max-w-full max-h-full object-contain rounded-xl shadow-2xl
                 ring-1 ring-white/10 transition-transform duration-200"
        />
      </div>

      <!-- ── Footer ── -->
      <div class="shrink-0 flex items-center justify-between gap-4 px-5 py-2 border-t"
           style="background-color: #131a0e; border-top-color: #253018;">
        <span class="text-xs flex items-center gap-1.5" style="color: #6b7f5a;">
          <i class="fas fa-keyboard text-xs" style="color: #4a5c38;"></i>
          {{ 'Press Esc to close' | translate }}
        </span>
        @if (data.title) {
          <span class="text-xs truncate" style="color: #4a5c38;">{{ data.title }}</span>
        }
      </div>

    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PackageImagePreviewDialogComponent {
  readonly dialogRef = inject(MatDialogRef<PackageImagePreviewDialogComponent>);
  readonly data      = inject<PackageImagePreviewDialogData>(MAT_DIALOG_DATA);

  close(): void {
    this.dialogRef.close();
  }
}
