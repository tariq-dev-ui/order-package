import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AppSnackBarService } from 'src/app/services/app-snack-bar.service';
import { AdminAPIClient, FileParameter, SeroPackageModel } from 'src/app/services/admin.api.client';
import { PackageImagePreviewDialogComponent } from '../package-image-preview-dialog/package-image-preview-dialog.component';

@Component({
  selector: 'app-upload-image',
  imports: [CommonModule, TranslateModule],
  templateUrl: './upload-image.component.html',
  styleUrl: './upload-image.component.scss',
})
export class UploadImageComponent implements OnInit {
  private adminApiClient = inject(AdminAPIClient);
  private snackBar = inject(AppSnackBarService);
  private translate = inject(TranslateService);
  private dialog = inject(MatDialog);
  dialogRef = inject(MatDialogRef<UploadImageComponent>);
  private data = inject(MAT_DIALOG_DATA);

  private isDataChanged = signal(false);
  pkg = signal<SeroPackageModel | undefined>(this.data?.pkg as SeroPackageModel);

  fileData: WritableSignal<FileParameter | undefined> = signal<FileParameter | undefined>(undefined);
  file = signal<File | null>(null);
  preview = signal<string | null>(null);
  isPreviewLoading = signal(false);
  isUploading = signal(false);
  isRemoving = signal(false);

  ngOnInit() {
    this.loadExistingImage();
  }

  private loadExistingImage() {
    if (!this.pkg()) return;
    if (this.pkg()?.ImageUrl) {
      this.isPreviewLoading.set(true);
      this.preview.set(this.pkg()!.ImageUrl || null);
    } else {
      this.preview.set(null);
      this.isPreviewLoading.set(false);
    }
  }

  handleImageUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.snackBar.showErrorSnackBar(this.translate.instant('Only image files are allowed'));
      return;
    }

    this.file.set(file);
    this.isPreviewLoading.set(true);
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => this.preview.set(String(e.target?.result ?? ''));
    reader.readAsDataURL(file);

    const fileData: FileParameter = { data: file, fileName: file.name };
    this.fileData.set(fileData);

    const pkgId = this.pkg()?.PackageID;
    if (!pkgId) {
      this.snackBar.showSuccessSnackBar(this.translate.instant('Preview ready. Save package to upload image.'));
      return;
    }

    this.isUploading.set(true);
    this.adminApiClient.uploadPackagePhoto({ packageId: pkgId, file: fileData }).subscribe({
      next: (pkg) => {
        this.pkg.set(pkg);
        this.isDataChanged.set(true);
        this.isUploading.set(false);
        this.snackBar.showSuccessSnackBar(this.translate.instant('Image uploaded successfully'));
      },
      error: (err) => {
        this.isUploading.set(false);
        this.isPreviewLoading.set(false);
        this.loadExistingImage();
        this.snackBar.showErrorSnackBar(this.translate.instant('Failed to upload image'));
        console.error('Upload error:', err);
      },
    });
  }

  removeImage() {
    if (!this.pkg()) return;
    this.isRemoving.set(true);
    this.adminApiClient.updatePackage({ packageId: this.pkg()!.PackageID, body: { ...this.pkg()!, ImageUrl: null } }).subscribe({
      next: () => {
        this.pkg.set({ ...this.pkg()!, ImageUrl: null });
        this.isRemoving.set(false);
        this.preview.set(null);
        this.isPreviewLoading.set(false);
        this.snackBar.showSuccessSnackBar(this.translate.instant('Image removed'));
        this.isDataChanged.set(true);
      },
      error: (err: { message?: string }) => {
        this.isRemoving.set(false);
        this.snackBar.showErrorSnackBar(err?.message || this.translate.instant('Failed to remove image'));
      },
    });
  }

  onImageLoaded() {
    this.isPreviewLoading.set(false);
  }

  onImageError() {
    this.isPreviewLoading.set(false);
    if (this.preview()) {
      this.snackBar.showErrorSnackBar(this.translate.instant('Unable to load image preview'));
    }
  }

  overlayMessage(): string {
    if (this.isUploading()) {
      return this.translate.instant('Uploading...');
    }
    if (this.isRemoving()) {
      return this.translate.instant('Removing...');
    }
    if (this.isPreviewLoading()) {
      return this.translate.instant('Loading image...');
    }
    return this.translate.instant('Processing...');
  }

  openGenerateDialog() {
    const imageUrl = '/IMG/logo.png';
    this.preview.set(imageUrl);
    this.isPreviewLoading.set(false);
    this.isDataChanged.set(true);

    const pkgId = this.pkg()?.PackageID;
    if (!pkgId || !this.pkg()) {
      this.snackBar.showSuccessSnackBar(this.translate.instant('Preview ready. Save package to upload image.'));
      return;
    }

    this.adminApiClient.updatePackage({ packageId: pkgId, body: { ...this.pkg()!, ImageUrl: imageUrl } }).subscribe({
      next: (refreshed) => {
        this.pkg.set(refreshed);
        this.snackBar.showSuccessSnackBar(this.translate.instant('Image generated locally'));
      },
      error: () => {
        this.pkg.set({ ...this.pkg()!, ImageUrl: imageUrl });
      },
    });
  }

  openImagePreview() {
    const url = this.preview();
    if (!url) return;
    this.dialog.open(PackageImagePreviewDialogComponent, {
      maxWidth: '95vw',
      width: '95vw',
      height: '95vh',
      panelClass: 'image-preview-dialog-panel',
      data: { imageUrl: url, title: this.pkg()?.Title ?? null, code: this.pkg()?.PackageCode ?? null },
    });
  }

  close() {
    this.dialogRef.close({ refreshData: this.isDataChanged() });
  }
}
