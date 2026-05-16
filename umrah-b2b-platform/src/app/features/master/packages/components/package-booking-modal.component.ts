import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, inject, OnInit, signal, computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { SeroPackageModel } from '../packages.model';
import { PackagesService } from '../packages.service';

export interface PackageBookingModalData {
  package: SeroPackageModel | null;
}

@Component({
  selector: 'pkg-booking-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule],
  template: `
    <div class="modal-wrap">
      @if (isLoading()) {
        <div class="modal-loading-overlay">
          <div class="modal-spinner"></div>
          <span class="modal-loading-text">Submitting data...</span>
        </div>
      }

      <!-- Header -->
      <div class="modal-header">
        <div class="modal-header-inner">
          <div class="modal-header-icon">
            <span class="material-icons-round" style="font-size:20px">inventory_2</span>
          </div>
          <div>
            <h3 class="modal-title">Complete Reserving this Package</h3>
            <p class="modal-subtitle">Fill in remaining information to submit your request</p>
          </div>
        </div>
        <button type="button" class="modal-close-btn" (click)="dialogRef.close()" aria-label="Close">
          <span class="material-icons-round">close</span>
        </button>
      </div>

      <!-- Form -->
      <form [formGroup]="packageForm" (ngSubmit)="validateAndSubmit()">
        <div class="modal-body">
          <div class="modal-grid">

            <!-- Start Date -->
            <div class="form-group">
              <label class="form-label">
                Start Date
                @if (packageStartDate()) {
                  <span class="form-label-hint">— from {{ packageStartDate() }}</span>
                }
              </label>
              <input formControlName="startDate" type="date"
                [min]="packageStartDate()" [max]="packageEndDate()"
                (change)="runDateValidation()"
                class="form-input"
                [class.form-input-error]="(f.startDate.dirty || f.startDate.touched) && f.startDate.errors" />
              @if ((f.startDate.dirty || f.startDate.touched) && f.startDate.errors) {
                <div class="form-error">
                  @if (f.startDate.errors['required']) { <span>Start date is required.</span> }
                  @if (f.startDate.errors['beforePackageStart']) {
                    <span>Start date cannot be before {{ packageStartDate() }}.</span>
                  }
                </div>
              }
            </div>

            <!-- End Date -->
            <div class="form-group">
              <label class="form-label">
                End Date
                @if (packageEndDate()) {
                  <span class="form-label-hint">— until {{ packageEndDate() }}</span>
                }
              </label>
              <input formControlName="endDate" type="date"
                [min]="endDateMin()" [max]="packageEndDate()"
                (change)="runDateValidation()"
                class="form-input"
                [class.form-input-error]="(f.endDate.dirty || f.endDate.touched) && f.endDate.errors" />
              @if ((f.endDate.dirty || f.endDate.touched) && f.endDate.errors) {
                <div class="form-error">
                  @if (f.endDate.errors['required']) { <span>End date is required.</span> }
                  @if (f.endDate.errors['dateRange']) { <span>End date must be after start date.</span> }
                  @if (f.endDate.errors['afterPackageEnd']) {
                    <span>End date cannot be after {{ packageEndDate() }}.</span>
                  }
                </div>
              }
            </div>

            <!-- Requested Packages -->
            <div class="form-group">
              <label class="form-label">
                Requested Packages
                @if (pkg()?.Quantity) {
                  <span class="form-label-hint">({{ pkg()?.Quantity }} available)</span>
                }
              </label>
              <input formControlName="requestedQuantity" type="number" min="1"
                class="form-input"
                [class.form-input-error]="f.requestedQuantity.touched && f.requestedQuantity.errors" />
              @if (f.requestedQuantity.touched && f.requestedQuantity.errors) {
                <div class="form-error">
                  @if (f.requestedQuantity.errors['required']) { <span>Quantity is required.</span> }
                  @if (f.requestedQuantity.errors['min']) { <span>Minimum 1 package required.</span> }
                </div>
              }
            </div>

            <!-- Guests (calculated) -->
            <div class="form-group">
              <label class="form-label">Number of Guests</label>
              <div class="form-readonly">
                <span class="form-readonly-val">{{ calculatedGuestCount() }}</span>
                @if (pkg()?.GuestCount) {
                  <span class="form-readonly-hint">
                    {{ f.requestedQuantity.value }} pkg × {{ pkg()?.GuestCount }} guests/pkg
                  </span>
                }
              </div>
            </div>

            <!-- Notes -->
            <div class="form-group form-group-full">
              <label class="form-label">
                Special Notes
                <span class="form-label-hint">(optional)</span>
              </label>
              <textarea formControlName="notes" rows="3" class="form-textarea"
                placeholder="Add any special requests or notes here..."></textarea>
            </div>

          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button type="button" class="btn-cancel" (click)="dialogRef.close()">Cancel</button>
          <button type="submit" class="btn-submit" [disabled]="packageForm.invalid">
            <span class="material-icons-round" style="font-size:14px">check</span>
            Save &amp; Create
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .modal-wrap { background: #f9f7f1; display: flex; flex-direction: column; position: relative; min-width: 540px; max-width: 800px; }
    .modal-loading-overlay {
      position: absolute; inset: 0; background: rgba(255,255,255,.8);
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 10px; z-index: 100; border-radius: 4px;
    }
    .modal-spinner {
      width: 32px; height: 32px; border: 3px solid #d1d5db;
      border-top-color: var(--sero-primary, #3a472a); border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .modal-loading-text { font-size: 13px; color: #6b7280; }

    .modal-header {
      padding: 18px 22px; border-bottom: 1px solid #d8decf;
      background: linear-gradient(to right, #3a472a, #4a5a38, #3a472a);
      display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-shrink: 0;
    }
    .modal-header-inner { display: flex; align-items: flex-start; gap: 12px; }
    .modal-header-icon {
      width: 40px; height: 40px; background: rgba(255,255,255,.1); color: #fff;
      display: flex; align-items: center; justify-content: center; border-radius: 6px; flex-shrink: 0;
    }
    .modal-title { font-size: 17px; font-weight: 700; color: #fff; }
    .modal-subtitle { font-size: 13px; color: rgba(255,255,255,.8); margin-top: 2px; }
    .modal-close-btn {
      background: none; border: none; color: rgba(255,255,255,.8); cursor: pointer;
      padding: 6px; border-radius: 6px; display: flex; align-items: center; justify-content: center;
      transition: background 0.15s, color 0.15s;
    }
    .modal-close-btn:hover { background: rgba(255,255,255,.1); color: #fff; }

    .modal-body { max-height: 65vh; overflow-y: auto; padding: 20px 22px; background: #f4f6f2; }
    .modal-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

    .form-group { display: flex; flex-direction: column; gap: 5px; }
    .form-group-full { grid-column: 1 / -1; }
    .form-label { font-size: 11px; font-weight: 600; color: #242e1a; }
    .form-label-hint { font-size: 11px; font-weight: 400; color: #74806a; margin-left: 4px; }
    .form-input {
      height: 42px; padding: 0 10px; border: 1px solid #d8decf; background: #fff;
      font-size: 13px; color: #242e1a; border-radius: 4px; width: 100%; box-sizing: border-box;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    .form-input:focus { outline: none; border-color: #3a472a; box-shadow: 0 0 0 3px rgba(58,71,42,.15); }
    .form-input-error { border-color: #f87171 !important; }
    .form-error { font-size: 11px; color: #ef4444; }
    .form-readonly {
      height: 42px; padding: 0 10px; border: 1px solid #d8decf; background: #f9f7f1;
      border-radius: 4px; display: flex; align-items: center; justify-content: space-between;
    }
    .form-readonly-val { font-size: 13px; font-weight: 600; color: #242e1a; }
    .form-readonly-hint { font-size: 11px; color: #74806a; }
    .form-textarea {
      width: 100%; padding: 10px; border: 1px solid #d8decf; background: #fff;
      font-size: 13px; color: #242e1a; border-radius: 4px; box-sizing: border-box;
      resize: none; transition: border-color 0.15s, box-shadow 0.15s;
      font-family: inherit;
    }
    .form-textarea:focus { outline: none; border-color: #3a472a; box-shadow: 0 0 0 3px rgba(58,71,42,.15); }
    .form-textarea::placeholder { color: #74806a; }

    .modal-footer {
      display: flex; justify-content: flex-end; gap: 10px;
      border-top: 1px solid #d8decf; padding: 14px 22px; background: #f9f7f1;
    }
    .btn-cancel {
      padding: 9px 18px; font-size: 13px; font-weight: 500;
      border: 1px solid #d8decf; color: #242e1a; background: #fff;
      border-radius: 4px; cursor: pointer; transition: background 0.15s;
    }
    .btn-cancel:hover { background: #f4f6f2; }
    .btn-submit {
      display: flex; align-items: center; gap: 6px;
      padding: 9px 18px; font-size: 13px; font-weight: 500;
      background: #242e1a; color: #fff; border: none;
      border-radius: 4px; cursor: pointer; transition: background 0.15s;
    }
    .btn-submit:hover:not(:disabled) { background: #3a472a; }
    .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
  `],
})
export class PackageBookingModalComponent implements OnInit {
  private readonly _data = inject<PackageBookingModalData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<PackageBookingModalComponent>);
  private readonly packagesService = inject(PackagesService);
  private readonly cdr = inject(ChangeDetectorRef);

  pkg = signal<SeroPackageModel | null>(this._data?.package ?? null);
  isLoading = signal(false);

  private requestedQuantityValue = signal(1);
  private startDateValue = signal('');

  packageStartDate = computed(() => {
    const d = this.pkg()?.StartDate;
    return d ? new Date(d).toISOString().split('T')[0] : '';
  });

  packageEndDate = computed(() => {
    const d = this.pkg()?.EndDate;
    return d ? new Date(d).toISOString().split('T')[0] : '';
  });

  endDateMin = computed(() => this.startDateValue() || this.packageStartDate());

  calculatedGuestCount = computed(() => {
    const guestCount = this.pkg()?.GuestCount || 1;
    return this.requestedQuantityValue() * guestCount;
  });

  packageForm = new FormGroup({
    startDate: new FormControl('', [Validators.required]),
    endDate: new FormControl('', [Validators.required]),
    requestedQuantity: new FormControl<number>(1, [Validators.required, Validators.min(1)]),
    notes: new FormControl(''),
  });

  get f() { return this.packageForm.controls; }

  ngOnInit(): void {
    this.packageForm.get('requestedQuantity')!.valueChanges.subscribe(val => {
      this.requestedQuantityValue.set(Number(val) || 1);
    });
    this.packageForm.get('startDate')!.valueChanges.subscribe(val => {
      this.startDateValue.set(val || '');
      this.runDateValidation();
    });
    this.packageForm.get('endDate')!.valueChanges.subscribe(() => {
      this.runDateValidation();
    });
  }

  runDateValidation(): void {
    const startVal = this.f.startDate.value;
    const endVal = this.f.endDate.value;
    if (!startVal || !endVal) {
      if (!startVal && !endVal) this.clearCrossFieldErrors();
      this.cdr.markForCheck();
      return;
    }
    this.clearCrossFieldErrors();
    const startDate = new Date(startVal);
    const endDate = new Date(endVal);
    if (endDate <= startDate) {
      this.f.endDate.setErrors({ ...this.f.endDate.errors, dateRange: true });
      this.cdr.markForCheck();
      return;
    }
    const pkgStart = this.pkg()?.StartDate ? new Date(this.pkg()!.StartDate!) : null;
    const pkgEnd   = this.pkg()?.EndDate   ? new Date(this.pkg()!.EndDate!)   : null;
    if (pkgStart) {
      pkgStart.setHours(0, 0, 0, 0);
      if (startDate < pkgStart) {
        this.f.startDate.setErrors({ ...this.f.startDate.errors, beforePackageStart: true });
        this.cdr.markForCheck();
        return;
      }
    }
    if (pkgEnd) {
      pkgEnd.setHours(23, 59, 59, 999);
      if (endDate > pkgEnd) {
        this.f.endDate.setErrors({ ...this.f.endDate.errors, afterPackageEnd: true });
      }
    }
    this.cdr.markForCheck();
  }

  private clearCrossFieldErrors(): void {
    const strip = (errors: Record<string, unknown> | null, keys: string[]) => {
      if (!errors) return null;
      const c = { ...errors };
      keys.forEach(k => delete c[k]);
      return Object.keys(c).length ? c : null;
    };
    this.f.startDate.setErrors(strip(this.f.startDate.errors, ['beforePackageStart']));
    this.f.endDate.setErrors(strip(this.f.endDate.errors, ['dateRange', 'afterPackageEnd']));
  }

  validateAndSubmit(): void {
    this.runDateValidation();
    if (this.packageForm.invalid) {
      this.packageForm.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }
    this.isLoading.set(true);
    const formValue = this.packageForm.value;
    this.packagesService.bookPackage(this.pkg()?.PackageID ?? 0, formValue).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: () => {
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
      complete: () => {
        this.isLoading.set(false);
        this.cdr.markForCheck();
      },
    });
  }
}
