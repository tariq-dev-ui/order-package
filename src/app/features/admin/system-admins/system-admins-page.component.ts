// Currently using local mock data for frontend prototype. Later this can be replaced with backend API.

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { LoadingSpinnerComponent } from 'src/app/components/loading-spinner/loading-spinner';
import { MultiItemsSelectorComponent, Item } from 'src/app/components/multi-items-selector/multi-items-selector.component';

interface MockAdminUser {
  UserID: number;
  FirstName: string;
  LastName: string;
  UserName: string;
  Email: string;
  PhoneNumber: string;
  IsActive: boolean;
  UserTypeID: number;
  UserRole: string;
  CompanyName: string;
  SystemGroups: { GroupID: number; GroupTitle: string }[];
  AddedDate: string;
  AddedBy: string;
  LastUpdatedDate: string;
  UpdatedBy: string;
}

let MOCK_ADMIN_USERS: MockAdminUser[] = [
  { UserID: 1, FirstName: 'Ahmed', LastName: 'Al-Rashid', UserName: 'ahmed.alrashid', Email: 'ahmed@sero.travel', PhoneNumber: '+966501234567', IsActive: true, UserTypeID: 1, UserRole: 'System Admin', CompanyName: 'Sero Travel', SystemGroups: [{ GroupID: 1, GroupTitle: 'Super Admin' }], AddedDate: '2024-01-15', AddedBy: 'System', LastUpdatedDate: '2024-03-01', UpdatedBy: 'admin' },
  { UserID: 2, FirstName: 'Sara', LastName: 'Hassan', UserName: 'sara.hassan', Email: 'sara@sero.travel', PhoneNumber: '+966502345678', IsActive: true, UserTypeID: 1, UserRole: 'Finance Manager', CompanyName: 'Sero Travel', SystemGroups: [{ GroupID: 2, GroupTitle: 'Finance Manager' }], AddedDate: '2024-02-10', AddedBy: 'admin', LastUpdatedDate: '2024-03-15', UpdatedBy: 'admin' },
  { UserID: 3, FirstName: 'Khalid', LastName: 'Al-Mutairi', UserName: 'khalid.mutairi', Email: 'khalid@sero.travel', PhoneNumber: '+966503456789', IsActive: false, UserTypeID: 1, UserRole: 'Operations', CompanyName: 'Sero Travel', SystemGroups: [{ GroupID: 3, GroupTitle: 'Operations' }], AddedDate: '2024-01-20', AddedBy: 'admin', LastUpdatedDate: '2024-04-01', UpdatedBy: 'sara.hassan' },
  { UserID: 4, FirstName: 'Fatima', LastName: 'Al-Zahra', UserName: 'fatima.zahra', Email: 'fatima@sero.travel', PhoneNumber: '+966504567890', IsActive: true, UserTypeID: 1, UserRole: 'Support', CompanyName: 'Sero Travel', SystemGroups: [{ GroupID: 4, GroupTitle: 'Support' }], AddedDate: '2024-03-05', AddedBy: 'admin', LastUpdatedDate: '2024-04-10', UpdatedBy: 'admin' },
  { UserID: 5, FirstName: 'Omar', LastName: 'Bin-Saud', UserName: 'omar.binsaud', Email: 'omar@sero.travel', PhoneNumber: '+966505678901', IsActive: true, UserTypeID: 1, UserRole: 'System Admin', CompanyName: 'Sero Travel', SystemGroups: [{ GroupID: 1, GroupTitle: 'Super Admin' }, { GroupID: 2, GroupTitle: 'Finance Manager' }], AddedDate: '2024-04-01', AddedBy: 'System', LastUpdatedDate: '2024-05-01', UpdatedBy: 'admin' },
  { UserID: 6, FirstName: 'Noura', LastName: 'Al-Sabah', UserName: 'noura.sabah', Email: 'noura@sero.travel', PhoneNumber: '+966506789012', IsActive: false, UserTypeID: 1, UserRole: 'Operations', CompanyName: 'Sero Travel', SystemGroups: [{ GroupID: 3, GroupTitle: 'Operations' }], AddedDate: '2024-05-15', AddedBy: 'admin', LastUpdatedDate: '2024-06-01', UpdatedBy: 'sara.hassan' },
];

const MOCK_SYSTEM_GROUP_ITEMS: Item[] = [
  { id: 1, title: 'Super Admin', subtitle: 'Full system access' },
  { id: 2, title: 'Finance Manager', subtitle: 'Finance & accounting access' },
  { id: 3, title: 'Operations', subtitle: 'Operations management access' },
  { id: 4, title: 'Support', subtitle: 'Customer support access' },
];

// ─── Create Admin User Dialog ───────────────────────────────────────────────

@Component({
  selector: 'create-admin-user-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, TranslateModule, LoadingSpinnerComponent, MultiItemsSelectorComponent],
  template: `
<div class="relative">
  <div class="flex items-center gap-3 p-5 border-b border-gray-100">
    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center">
      <i class="fas fa-user-plus text-lg"></i>
    </div>
    <div class="flex-1">
      <h2 class="text-xl font-bold">{{ 'Create Admin User' | translate }}</h2>
      <p class="text-sm text-gray-500">{{ 'Create a new admin user by filling the details below' | translate }}</p>
    </div>
    <button (click)="onClose()" class="text-gray-400 hover:text-gray-500 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>

  <form [formGroup]="form" (ngSubmit)="submit()">
    <div class="h-[70vh] overflow-y-auto custom-scroll relative">
      @if (isSubmittingData()) {
        <div class="w-full bg-black/20 min-h-[70vh]">
          <loading-spinner [isLoading]="isSubmittingData()" [message]="'Submitting...' | translate" />
        </div>
      } @else {
        <div class="space-y-6 p-5">
          <!-- System Groups -->
          <div>
            <multi-items-selector
              [label]="'System Groups' | translate"
              [placeholder]="'Search system groups...' | translate"
              icon="fa-solid fa-users"
              [items]="systemGroupItems"
              [selected]="selectedGroupItems()"
              (selectionChange)="onGroupsChange($event)">
            </multi-items-selector>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <!-- First Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <i class="fas fa-user text-primary-500"></i>
                <span>{{ 'First Name' | translate }}</span>
              </label>
              <input type="text" formControlName="firstName" maxlength="50"
                class="w-full placeholder-gray-400 p-3 h-14 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                [placeholder]="'Enter first name' | translate">
              @if (form.get('firstName')?.invalid && (form.get('firstName')?.touched || form.get('firstName')?.dirty)) {
                <div class="text-red-500 text-xs mt-1">{{ 'First name is required' | translate }}</div>
              }
            </div>

            <!-- Last Name -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <i class="fas fa-user text-primary-500"></i>
                <span>{{ 'Last Name' | translate }}</span>
              </label>
              <input type="text" formControlName="lastName" maxlength="50"
                class="w-full placeholder-gray-400 p-3 h-14 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                [placeholder]="'Enter last name' | translate">
              @if (form.get('lastName')?.invalid && (form.get('lastName')?.touched || form.get('lastName')?.dirty)) {
                <div class="text-red-500 text-xs mt-1">{{ 'Last name is required' | translate }}</div>
              }
            </div>

            <!-- Email -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <i class="fas fa-envelope text-primary-500"></i>
                <span>{{ 'Email' | translate }}</span>
              </label>
              <input type="email" formControlName="email" maxlength="100" (blur)="onEmailBlur()"
                class="w-full placeholder-gray-400 p-3 h-14 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                [placeholder]="'Enter email' | translate">
              @if (form.get('email')?.invalid && (form.get('email')?.touched || form.get('email')?.dirty)) {
                <div class="text-red-500 text-xs mt-1">{{ 'Valid email is required' | translate }}</div>
              }
            </div>

            <!-- Mobile -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <i class="fas fa-mobile-alt text-primary-500"></i>
                <span>{{ 'Mobile' | translate }}</span>
              </label>
              <input type="text" formControlName="mobile" maxlength="20"
                class="w-full placeholder-gray-400 p-3 h-14 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                [placeholder]="'Enter mobile number' | translate">
            </div>
          </div>

          <hr class="border-gray-100 my-3">

          <!-- Username -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <i class="fas fa-at text-primary-500"></i>
              <span>{{ 'Username' | translate }}</span>
            </label>
            <input type="text" formControlName="username" maxlength="50"
              class="w-full placeholder-gray-400 p-3 h-14 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
              [placeholder]="'Enter username' | translate">
            @if (form.get('username')?.invalid && (form.get('username')?.touched || form.get('username')?.dirty)) {
              <div class="text-red-500 text-xs mt-1">{{ 'Username is required' | translate }}</div>
            }
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <!-- Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <i class="fas fa-lock text-primary-500"></i>
                <span>{{ 'Password' | translate }}</span>
              </label>
              <input type="password" formControlName="password"
                class="w-full placeholder-gray-400 p-3 h-14 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                [placeholder]="'Enter password' | translate">
              @if (form.get('password')?.invalid && (form.get('password')?.touched || form.get('password')?.dirty)) {
                <div class="text-red-500 text-xs mt-1">{{ 'Password must be at least 8 chars with uppercase, lowercase, digit, and special character' | translate }}</div>
              }
            </div>

            <!-- Confirm Password -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <i class="fas fa-lock text-primary-500"></i>
                <span>{{ 'Confirm Password' | translate }}</span>
              </label>
              <input type="password" formControlName="confirmPassword"
                class="w-full placeholder-gray-400 p-3 h-14 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 focus:border-primary-400"
                [placeholder]="'Confirm password' | translate">
              @if (form.get('confirmPassword')?.touched && form.errors?.['passwordMismatch']) {
                <div class="text-red-500 text-xs mt-1">{{ 'Passwords do not match' | translate }}</div>
              }
            </div>
          </div>
        </div>
      }
    </div>

    <hr class="border-gray-100">
    <div class="flex justify-end gap-3 p-5">
      <button type="button" (click)="onClose()"
        class="cursor-pointer px-5 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1">
        <i class="fas fa-times"></i>
        <span>{{ 'Cancel' | translate }}</span>
      </button>
      @if (isSubmittingData()) {
        <button type="button" disabled class="px-5 py-2.5 bg-primary-400 text-white rounded-lg opacity-80 flex items-center gap-1">
          <span class="mr-2">{{ 'Submitting...' | translate }}</span>
          <i class="fas fa-spinner fa-spin"></i>
        </button>
      } @else if (form.invalid) {
        <button type="button" disabled class="px-5 py-2.5 bg-gray-200 text-gray-500 rounded-lg opacity-80 flex items-center gap-1 cursor-not-allowed">
          <span class="mr-2">{{ 'Create Admin User' | translate }}</span>
          <i class="fas fa-ban"></i>
        </button>
      } @else {
        <button type="submit"
          class="cursor-pointer px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all flex items-center gap-1 shadow-lg hover:shadow-xl">
          <span class="mr-2">{{ 'Create Admin User' | translate }}</span>
          <i class="fas fa-plus"></i>
        </button>
      }
    </div>
  </form>
</div>
  `,
})
export class CreateAdminUserDialogComponent {
  readonly dialogRef = inject(MatDialogRef<CreateAdminUserDialogComponent>);
  readonly isSubmittingData = signal(false);
  readonly selectedGroupItems = signal<Item[]>([]);
  readonly systemGroupItems = MOCK_SYSTEM_GROUP_ITEMS;

  static passwordMatchValidator(control: import('@angular/forms').AbstractControl) {
    const group = control as FormGroup;
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  form = new FormGroup({
    firstName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    lastName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    email: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(100)]),
    mobile: new FormControl('', [Validators.maxLength(20)]),
    username: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    password: new FormControl('', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]),
    confirmPassword: new FormControl('', [Validators.required]),
  }, { validators: CreateAdminUserDialogComponent.passwordMatchValidator as import('@angular/forms').ValidatorFn });

  onGroupsChange(items: Item[]) {
    this.selectedGroupItems.set(items);
  }

  onEmailBlur() {
    const emailValue = this.form.get('email')?.value;
    const usernameValue = this.form.get('username')?.value;
    if (emailValue && !usernameValue) {
      this.form.get('username')?.setValue(emailValue);
    }
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.isSubmittingData.set(true);
    const v = this.form.value;
    const newUser: MockAdminUser = {
      UserID: Math.max(...MOCK_ADMIN_USERS.map(u => u.UserID), 0) + 1,
      FirstName: v.firstName ?? '',
      LastName: v.lastName ?? '',
      UserName: v.username ?? '',
      Email: v.email ?? '',
      PhoneNumber: v.mobile ?? '',
      IsActive: true,
      UserTypeID: 1,
      UserRole: 'System Admin',
      CompanyName: 'Sero Travel',
      SystemGroups: this.selectedGroupItems().map(g => ({ GroupID: g.id as number, GroupTitle: g.title })),
      AddedDate: new Date().toISOString().split('T')[0],
      AddedBy: 'admin',
      LastUpdatedDate: new Date().toISOString().split('T')[0],
      UpdatedBy: 'admin',
    };

    of(null).pipe(delay(600)).subscribe(() => {
      MOCK_ADMIN_USERS = [...MOCK_ADMIN_USERS, newUser];
      this.isSubmittingData.set(false);
      this.dialogRef.close(true);
    });
  }

  onClose() { this.dialogRef.close(); }
}

// ─── Edit Admin User Dialog ─────────────────────────────────────────────────

@Component({
  selector: 'edit-admin-user-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, TranslateModule, LoadingSpinnerComponent, MultiItemsSelectorComponent],
  template: `
<div class="relative">
  <div class="flex items-center gap-3 p-5 border-b border-gray-100">
    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center">
      <i class="fas fa-user-edit text-lg"></i>
    </div>
    <div class="flex-1">
      <h2 class="text-xl font-bold">{{ 'Edit Admin User' | translate }}</h2>
      <p class="text-sm text-gray-500">{{ 'Update the admin user details below' | translate }}</p>
    </div>
    <button (click)="onClose()" class="text-gray-400 hover:text-gray-500 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>

  <form [formGroup]="form" (ngSubmit)="submit()">
    <div class="h-[70vh] overflow-y-auto custom-scroll relative">
      @if (isSubmittingData()) {
        <div class="w-full bg-black/20 min-h-[70vh]">
          <loading-spinner [isLoading]="isSubmittingData()" [message]="'Updating...' | translate" />
        </div>
      } @else {
        <div class="space-y-6 p-5">
          <!-- System Groups -->
          <div>
            <multi-items-selector
              [label]="'System Groups' | translate"
              [placeholder]="'Search system groups...' | translate"
              icon="fa-solid fa-users"
              [items]="systemGroupItems"
              [selected]="selectedGroupItems()"
              (selectionChange)="onGroupsChange($event)">
            </multi-items-selector>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <i class="fas fa-user text-primary-500"></i>
                <span>{{ 'First Name' | translate }}</span>
              </label>
              <input type="text" formControlName="firstName" maxlength="50"
                class="w-full placeholder-gray-400 p-3 h-14 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400"
                [placeholder]="'Enter first name' | translate">
              @if (form.get('firstName')?.invalid && (form.get('firstName')?.touched || form.get('firstName')?.dirty)) {
                <div class="text-red-500 text-xs mt-1">{{ 'First name is required' | translate }}</div>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <i class="fas fa-user text-primary-500"></i>
                <span>{{ 'Last Name' | translate }}</span>
              </label>
              <input type="text" formControlName="lastName" maxlength="50"
                class="w-full placeholder-gray-400 p-3 h-14 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400"
                [placeholder]="'Enter last name' | translate">
              @if (form.get('lastName')?.invalid && (form.get('lastName')?.touched || form.get('lastName')?.dirty)) {
                <div class="text-red-500 text-xs mt-1">{{ 'Last name is required' | translate }}</div>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <i class="fas fa-envelope text-primary-500"></i>
                <span>{{ 'Email' | translate }}</span>
              </label>
              <input type="email" formControlName="email" maxlength="100"
                class="w-full placeholder-gray-400 p-3 h-14 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400"
                [placeholder]="'Enter email' | translate">
              @if (form.get('email')?.invalid && (form.get('email')?.touched || form.get('email')?.dirty)) {
                <div class="text-red-500 text-xs mt-1">{{ 'Valid email is required' | translate }}</div>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <i class="fas fa-mobile-alt text-primary-500"></i>
                <span>{{ 'Mobile' | translate }}</span>
              </label>
              <input type="text" formControlName="mobile" maxlength="20"
                class="w-full placeholder-gray-400 p-3 h-14 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400"
                [placeholder]="'Enter mobile number' | translate">
            </div>
          </div>

          <hr class="border-gray-100 my-3">

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <i class="fas fa-at text-primary-500"></i>
              <span>{{ 'Username' | translate }}</span>
            </label>
            <input type="text" formControlName="username" maxlength="50"
              class="w-full placeholder-gray-400 p-3 h-14 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400"
              [placeholder]="'Enter username' | translate">
            @if (form.get('username')?.invalid && (form.get('username')?.touched || form.get('username')?.dirty)) {
              <div class="text-red-500 text-xs mt-1">{{ 'Username is required' | translate }}</div>
            }
          </div>

          <div>
            <label class="checkbox-option cursor-pointer inline-flex items-center gap-2">
              <input type="checkbox" formControlName="isActive" class="custom-checkbox me-1">
              <span>{{ 'Active' | translate }}</span>
            </label>
          </div>
        </div>
      }
    </div>

    <hr class="border-gray-100">
    <div class="flex justify-end gap-3 p-5">
      <button type="button" (click)="onClose()"
        class="cursor-pointer px-5 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1">
        <i class="fas fa-times"></i>
        <span>{{ 'Cancel' | translate }}</span>
      </button>
      @if (isSubmittingData()) {
        <button type="button" disabled class="px-5 py-2.5 bg-primary-400 text-white rounded-lg opacity-80 flex items-center gap-1">
          <span class="mr-2">{{ 'Submitting...' | translate }}</span>
          <i class="fas fa-spinner fa-spin"></i>
        </button>
      } @else if (form.invalid) {
        <button type="button" disabled class="px-5 py-2.5 bg-gray-200 text-gray-500 rounded-lg opacity-80 flex items-center gap-1 cursor-not-allowed">
          <span class="mr-2">{{ 'Update Admin User' | translate }}</span>
          <i class="fas fa-ban"></i>
        </button>
      } @else {
        <button type="submit"
          class="cursor-pointer px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all flex items-center gap-1 shadow-lg hover:shadow-xl">
          <span class="mr-2">{{ 'Update Admin User' | translate }}</span>
          <i class="fas fa-save"></i>
        </button>
      }
    </div>
  </form>
</div>
  `,
})
export class EditAdminUserDialogComponent {
  readonly dialogRef = inject(MatDialogRef<EditAdminUserDialogComponent>);
  readonly data = inject<MockAdminUser>(MAT_DIALOG_DATA);
  readonly isSubmittingData = signal(false);
  readonly systemGroupItems = MOCK_SYSTEM_GROUP_ITEMS;
  readonly selectedGroupItems = signal<Item[]>([]);

  form = new FormGroup({
    firstName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    lastName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    email: new FormControl('', [Validators.required, Validators.email, Validators.maxLength(100)]),
    mobile: new FormControl('', [Validators.maxLength(20)]),
    username: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    isActive: new FormControl(true),
  });

  ngOnInit() {
    const u = this.data;
    this.form.patchValue({
      firstName: u.FirstName,
      lastName: u.LastName,
      email: u.Email,
      mobile: u.PhoneNumber,
      username: u.UserName,
      isActive: u.IsActive,
    });
    const preSelected = MOCK_SYSTEM_GROUP_ITEMS.filter(item =>
      u.SystemGroups.some(g => g.GroupID === item.id)
    );
    this.selectedGroupItems.set(preSelected);
  }

  onGroupsChange(items: Item[]) {
    this.selectedGroupItems.set(items);
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.isSubmittingData.set(true);
    const v = this.form.value;
    of(null).pipe(delay(600)).subscribe(() => {
      const idx = MOCK_ADMIN_USERS.findIndex(u => u.UserID === this.data.UserID);
      if (idx !== -1) {
        MOCK_ADMIN_USERS = MOCK_ADMIN_USERS.map((u, i) => i === idx ? {
          ...u,
          FirstName: v.firstName ?? u.FirstName,
          LastName: v.lastName ?? u.LastName,
          Email: v.email ?? u.Email,
          PhoneNumber: v.mobile ?? u.PhoneNumber,
          UserName: v.username ?? u.UserName,
          IsActive: v.isActive ?? u.IsActive,
          SystemGroups: this.selectedGroupItems().map(g => ({ GroupID: g.id as number, GroupTitle: g.title })),
          LastUpdatedDate: new Date().toISOString().split('T')[0],
        } : u);
      }
      this.isSubmittingData.set(false);
      this.dialogRef.close(true);
    });
  }

  onClose() { this.dialogRef.close(); }
}

// ─── View Admin User Dialog ─────────────────────────────────────────────────

@Component({
  selector: 'view-admin-user-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatDialogModule, TranslateModule],
  template: `
<div class="relative">
  <div class="flex items-center gap-3 p-5 border-b border-gray-100">
    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center">
      <i class="fas fa-user-circle text-lg"></i>
    </div>
    <div class="flex-1">
      <h2 class="text-xl font-bold">{{ 'Admin User Details' | translate }}</h2>
      <p class="text-sm text-gray-500">{{ 'View admin user information' | translate }}</p>
    </div>
    <button (click)="onClose()" class="text-gray-400 hover:text-gray-500 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>

  <div class="max-h-[70vh] overflow-y-auto p-5 custom-scroll">
    <div class="space-y-3">
      <!-- Profile Header -->
      <div class="flex items-start gap-3 p-3 bg-primary-50 rounded-lg">
        <div class="flex-shrink-0 w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-lg font-bold">
          {{ data.FirstName.charAt(0) }}{{ data.LastName.charAt(0) }}
        </div>
        <div class="min-w-0">
          <h3 class="font-medium text-gray-900 text-sm">{{ data.FirstName }} {{ data.LastName }}</h3>
          <div class="flex items-center mt-1">
            <i class="fas fa-envelope text-primary-500 text-xs me-1"></i>
            <p class="text-xs text-gray-600 truncate">{{ data.Email }}</p>
          </div>
          <div class="flex flex-wrap gap-1 mt-1.5">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-primary-100 text-primary-800">
              {{ data.UserRole }}
            </span>
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
              [class]="data.IsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
              {{ data.IsActive ? ('Active' | translate) : ('Inactive' | translate) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Info Grid -->
      <div class="grid grid-cols-2 gap-3">
        <div class="bg-white p-3 rounded-lg border border-gray-100">
          <div class="flex items-center text-primary-600 mb-1.5">
            <i class="fas fa-id-card text-xs me-1.5"></i>
            <span class="text-xs font-semibold">{{ 'Account Details' | translate }}</span>
          </div>
          <div class="space-y-1.5">
            <div>
              <p class="text-[11px] text-gray-500 font-medium">{{ 'Username' | translate }}</p>
              <p class="text-xs text-black truncate">{{ data.UserName }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-3 rounded-lg border border-gray-100">
          <div class="flex items-center text-primary-600 mb-1.5">
            <i class="fas fa-address-book text-xs me-1.5"></i>
            <span class="text-xs font-semibold">{{ 'Contact Info' | translate }}</span>
          </div>
          <div class="space-y-1.5">
            <div>
              <p class="text-[11px] text-gray-500 font-medium">{{ 'Phone Number' | translate }}</p>
              <p class="text-xs text-black">{{ data.PhoneNumber || ('Not provided' | translate) }}</p>
            </div>
          </div>
        </div>

        <div class="bg-white p-3 rounded-lg border border-gray-100">
          <div class="flex items-center text-primary-600 mb-1.5">
            <i class="fas fa-building text-xs me-1.5"></i>
            <span class="text-xs font-semibold">{{ 'Organization' | translate }}</span>
          </div>
          <div>
            <p class="text-[11px] text-gray-500 font-medium">{{ 'Company' | translate }}</p>
            <p class="text-xs text-black">{{ data.CompanyName || ('Not specified' | translate) }}</p>
          </div>
        </div>

        <div class="bg-white p-3 rounded-lg border border-gray-100">
          <div class="flex items-center text-primary-600 mb-1.5">
            <i class="fas fa-users text-xs me-1.5"></i>
            <span class="text-xs font-semibold">{{ 'System Groups' | translate }}</span>
          </div>
          <div class="space-y-1">
            @for (g of data.SystemGroups; track g.GroupID) {
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800 me-1">
                {{ g.GroupTitle }}
              </span>
            }
            @if (data.SystemGroups.length === 0) {
              <p class="text-xs text-gray-400">{{ 'No groups assigned' | translate }}</p>
            }
          </div>
        </div>
      </div>

      <!-- Activity Timeline -->
      <div class="bg-white p-3 rounded-lg border border-gray-100">
        <div class="flex items-center text-primary-600 mb-2">
          <i class="fas fa-history text-xs me-1.5"></i>
          <span class="text-xs font-semibold">{{ 'Recent Activity' | translate }}</span>
        </div>
        <div class="grid grid-cols-2 gap-3 text-xs">
          <div>
            <p class="text-[11px] text-gray-500 font-medium">{{ 'Created On' | translate }}</p>
            <p class="text-black">{{ data.AddedDate }}</p>
          </div>
          <div>
            <p class="text-[11px] text-gray-500 font-medium">{{ 'Added By' | translate }}</p>
            <p class="text-black">{{ data.AddedBy }}</p>
          </div>
          <div>
            <p class="text-[11px] text-gray-500 font-medium">{{ 'Last Updated' | translate }}</p>
            <p class="text-black">{{ data.LastUpdatedDate }}</p>
          </div>
          <div>
            <p class="text-[11px] text-gray-500 font-medium">{{ 'Updated By' | translate }}</p>
            <p class="text-black">{{ data.UpdatedBy }}</p>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-end items-center p-5 border-t border-gray-100 mt-3">
      <button type="button" (click)="onClose()"
        class="px-5 py-3 text-sm font-medium rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-all shadow-sm hover:shadow-md">
        <i class="fas fa-times me-2"></i>
        {{ 'Close' | translate }}
      </button>
    </div>
  </div>
</div>
  `,
})
export class ViewAdminUserDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ViewAdminUserDialogComponent>);
  readonly data = inject<MockAdminUser>(MAT_DIALOG_DATA);

  onClose() { this.dialogRef.close(); }
}

// ─── Confirm Delete Admin Dialog ────────────────────────────────────────────

@Component({
  selector: 'confirm-delete-admin-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatDialogModule, TranslateModule],
  template: `
<div class="p-6">
  <div class="flex items-center gap-3 mb-4">
    <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
      <i class="fas fa-trash text-red-500"></i>
    </div>
    <h2 class="text-xl font-bold text-gray-800">{{ 'Delete Admin User' | translate }}</h2>
  </div>
  <p class="text-gray-600 mb-6">
    {{ 'Are you sure you want to delete' | translate }}
    <span class="font-semibold text-gray-800">{{ data.FirstName }} {{ data.LastName }}</span>?
    {{ 'This action cannot be undone.' | translate }}
  </p>
  <div class="flex justify-end gap-3">
    <button type="button" (click)="onCancel()"
      class="px-5 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors">
      {{ 'Cancel' | translate }}
    </button>
    <button type="button" (click)="onConfirm()"
      class="px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all">
      {{ 'Delete' | translate }}
    </button>
  </div>
</div>
  `,
})
export class ConfirmDeleteAdminDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ConfirmDeleteAdminDialogComponent>);
  readonly data = inject<MockAdminUser>(MAT_DIALOG_DATA);

  onCancel() { this.dialogRef.close(false); }
  onConfirm() { this.dialogRef.close(true); }
}

// ─── System Admins Page Component ───────────────────────────────────────────

@Component({
  selector: 'system-admins-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
  ],
  template: `
<div class="p-6">
  <!-- Page Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-800">{{ 'System Admins' | translate }}</h1>
      <p class="text-sm text-gray-500 mt-1">{{ 'Manage system administrator accounts' | translate }}</p>
    </div>
    <button mat-raised-button color="primary" class="h-12" (click)="openCreateAdminDialog()">
      <i class="fas fa-plus me-2"></i>
      {{ 'New Admin' | translate }}
    </button>
  </div>

  <!-- Search Bar -->
  <div class="bg-white rounded-lg border border-gray-200 p-4 mb-4 flex items-center gap-3">
    <i class="fas fa-search text-gray-400"></i>
    <input type="text" [value]="searchQuery()" (input)="onSearch($event)"
      class="flex-1 outline-none text-sm placeholder-gray-400"
      [placeholder]="'Search by name, username, or email...' | translate">
    @if (searchQuery()) {
      <button (click)="clearSearch()" class="text-gray-400 hover:text-gray-600">
        <i class="fas fa-times"></i>
      </button>
    }
  </div>

  <!-- Table -->
  <div class="shadow-sm rounded-lg border border-gray-200 relative overflow-hidden">
    @if (isLoading()) {
      <div class="absolute inset-0 bg-black/10 flex items-center justify-center z-10">
        <mat-spinner diameter="50"></mat-spinner>
      </div>
    }
    <table mat-table [dataSource]="pagedUsers()" class="mat-elevation-z0 w-full">

      <!-- Name Column -->
      <ng-container matColumnDef="Name">
        <th mat-header-cell *matHeaderCellDef>{{ 'Name' | translate }}</th>
        <td mat-cell *matCellDef="let element">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-sm">
              {{ element.FirstName.charAt(0) }}{{ element.LastName.charAt(0) }}
            </div>
            <div>
              <p class="font-medium text-gray-900">{{ element.FirstName }} {{ element.LastName }}</p>
              <p class="text-xs text-gray-500">{{ element.UserRole }}</p>
            </div>
          </div>
        </td>
      </ng-container>

      <!-- Username Column -->
      <ng-container matColumnDef="Username">
        <th mat-header-cell *matHeaderCellDef>{{ 'Username' | translate }}</th>
        <td mat-cell *matCellDef="let element">{{ element.UserName }}</td>
      </ng-container>

      <!-- Email Column -->
      <ng-container matColumnDef="Email">
        <th mat-header-cell *matHeaderCellDef>{{ 'Email' | translate }}</th>
        <td mat-cell *matCellDef="let element">{{ element.Email }}</td>
      </ng-container>

      <!-- Mobile Column -->
      <ng-container matColumnDef="Mobile">
        <th mat-header-cell *matHeaderCellDef>{{ 'Mobile' | translate }}</th>
        <td mat-cell *matCellDef="let element">{{ element.PhoneNumber }}</td>
      </ng-container>

      <!-- Active Column -->
      <ng-container matColumnDef="Active">
        <th mat-header-cell *matHeaderCellDef>{{ 'Active' | translate }}</th>
        <td mat-cell *matCellDef="let element">
          <span class="px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit"
            [class]="element.IsActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
            <i class="fas" [class.fa-check-circle]="element.IsActive" [class.fa-times-circle]="!element.IsActive"
              [class.text-green-500]="element.IsActive" [class.text-red-400]="!element.IsActive"></i>
            {{ element.IsActive ? ('Active' | translate) : ('Inactive' | translate) }}
          </span>
        </td>
      </ng-container>

      <!-- Action Column -->
      <ng-container matColumnDef="action">
        <th mat-header-cell *matHeaderCellDef>{{ 'Action' | translate }}</th>
        <td mat-cell *matCellDef="let element">
          <div class="flex items-center gap-1">
            <button mat-icon-button (click)="openEditAdminDialog(element)" [attr.aria-label]="'Edit' | translate">
              <i class="fas fa-edit text-primary fa-xs"></i>
            </button>
            <button mat-icon-button (click)="openViewAdminDialog(element)" [attr.aria-label]="'View' | translate">
              <i class="fas fa-eye text-primary fa-xs"></i>
            </button>
            <button mat-icon-button (click)="openDeleteAdminDialog(element)" [attr.aria-label]="'Delete' | translate">
              <i class="fas fa-trash text-red-500 fa-xs"></i>
            </button>
          </div>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>

      <tr class="mat-row" *matNoDataRow>
        <td class="mat-cell text-center py-8 text-gray-500" [attr.colspan]="displayedColumns.length">
          {{ 'No admin users found' | translate }}
        </td>
      </tr>
    </table>

    <mat-paginator
      [length]="filteredUsers().length"
      [pageSize]="pageSize"
      [pageSizeOptions]="[5, 10, 20]"
      showFirstLastButtons
      (page)="onPageChange($event)">
    </mat-paginator>
  </div>
</div>
  `,
})
export class SystemAdminsPageComponent {
  private readonly dialog = inject(MatDialog);

  displayedColumns = ['Name', 'Username', 'Email', 'Mobile', 'Active', 'action'];
  readonly isLoading = signal(false);
  readonly searchQuery = signal('');
  readonly currentPage = signal(0);
  readonly pageSize = 10;

  private readonly allUsers = signal<MockAdminUser[]>([]);

  readonly filteredUsers = computed(() => {
    const q = this.searchQuery().toLowerCase();
    return this.allUsers().filter(u =>
      !q ||
      (u.FirstName + ' ' + u.LastName).toLowerCase().includes(q) ||
      u.UserName.toLowerCase().includes(q) ||
      u.Email.toLowerCase().includes(q)
    );
  });

  readonly pagedUsers = computed(() => {
    const start = this.currentPage() * this.pageSize;
    return this.filteredUsers().slice(start, start + this.pageSize);
  });

  ngOnInit() {
    this.loadUsers();
  }

  private loadUsers() {
    this.isLoading.set(true);
    of(MOCK_ADMIN_USERS).pipe(delay(400)).subscribe(users => {
      this.allUsers.set(users);
      this.isLoading.set(false);
    });
  }

  onSearch(event: Event) {
    this.searchQuery.set((event.target as HTMLInputElement).value);
    this.currentPage.set(0);
  }

  clearSearch() {
    this.searchQuery.set('');
    this.currentPage.set(0);
  }

  onPageChange(event: import('@angular/material/paginator').PageEvent) {
    this.currentPage.set(event.pageIndex);
  }

  openCreateAdminDialog() {
    const ref = this.dialog.open(CreateAdminUserDialogComponent, { width: '900px', disableClose: true });
    ref.afterClosed().subscribe(result => { if (result) this.loadUsers(); });
  }

  openEditAdminDialog(user: MockAdminUser) {
    const ref = this.dialog.open(EditAdminUserDialogComponent, { width: '900px', disableClose: true, data: user });
    ref.afterClosed().subscribe(result => { if (result) this.loadUsers(); });
  }

  openViewAdminDialog(user: MockAdminUser) {
    this.dialog.open(ViewAdminUserDialogComponent, { width: '900px', data: user });
  }

  openDeleteAdminDialog(user: MockAdminUser) {
    const ref = this.dialog.open(ConfirmDeleteAdminDialogComponent, { width: '500px', data: user });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.isLoading.set(true);
        of(null).pipe(delay(400)).subscribe(() => {
          MOCK_ADMIN_USERS = MOCK_ADMIN_USERS.filter(u => u.UserID !== user.UserID);
          this.loadUsers();
        });
      }
    });
  }
}
