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
import { SingleItemSelectorComponent, Item } from 'src/app/components/single-item-selector/single-item-selector.component';

interface MockAgent {
  AgentID: number;
  Name: string;
  Code: string;
}

interface MockAgentUser {
  UserID: number;
  FirstName: string;
  LastName: string;
  UserName: string;
  Email: string;
  PhoneNumber: string;
  IsActive: boolean;
  UserTypeID: number;
  UserOwnerID: number;
  UserRole: string;
  CompanyName: string;
  AddedDate: string;
  AddedBy: string;
  LastUpdatedDate: string;
  UpdatedBy: string;
}

const MOCK_AGENTS: MockAgent[] = [
  { AgentID: 1, Name: 'Al-Noor Travel Agency', Code: 'ANT' },
  { AgentID: 2, Name: 'Zamzam Tours', Code: 'ZZT' },
  { AgentID: 3, Name: 'Golden Path Travels', Code: 'GPT' },
  { AgentID: 4, Name: 'Makkah Express Agency', Code: 'MEA' },
  { AgentID: 5, Name: 'Safa Tours & Travel', Code: 'STT' },
];

let MOCK_AGENT_USERS: MockAgentUser[] = [
  { UserID: 201, FirstName: 'Hassan', LastName: 'Al-Noor', UserName: 'hassan.noor', Email: 'hassan@alnoor.com', PhoneNumber: '+966521111111', IsActive: true, UserTypeID: 2, UserOwnerID: 1, UserRole: 'Agent User', CompanyName: 'Al-Noor Travel Agency', AddedDate: '2024-01-10', AddedBy: 'admin', LastUpdatedDate: '2024-03-01', UpdatedBy: 'admin' },
  { UserID: 202, FirstName: 'Mona', LastName: 'Khalil', UserName: 'mona.khalil', Email: 'mona@alnoor.com', PhoneNumber: '+966522222222', IsActive: true, UserTypeID: 2, UserOwnerID: 1, UserRole: 'Agent User', CompanyName: 'Al-Noor Travel Agency', AddedDate: '2024-02-15', AddedBy: 'admin', LastUpdatedDate: '2024-04-01', UpdatedBy: 'admin' },
  { UserID: 203, FirstName: 'Tariq', LastName: 'Zamzam', UserName: 'tariq.zamzam', Email: 'tariq@zamzam.com', PhoneNumber: '+966523333333', IsActive: false, UserTypeID: 2, UserOwnerID: 2, UserRole: 'Agent User', CompanyName: 'Zamzam Tours', AddedDate: '2024-01-20', AddedBy: 'admin', LastUpdatedDate: '2024-05-01', UpdatedBy: 'admin' },
  { UserID: 204, FirstName: 'Layla', LastName: 'Al-Ahmad', UserName: 'layla.ahmad', Email: 'layla@zamzam.com', PhoneNumber: '+966524444444', IsActive: true, UserTypeID: 2, UserOwnerID: 2, UserRole: 'Agent User', CompanyName: 'Zamzam Tours', AddedDate: '2024-03-10', AddedBy: 'admin', LastUpdatedDate: '2024-05-10', UpdatedBy: 'admin' },
  { UserID: 205, FirstName: 'Yusuf', LastName: 'Golden', UserName: 'yusuf.golden', Email: 'yusuf@goldenpath.com', PhoneNumber: '+966525555555', IsActive: true, UserTypeID: 2, UserOwnerID: 3, UserRole: 'Agent User', CompanyName: 'Golden Path Travels', AddedDate: '2024-04-01', AddedBy: 'admin', LastUpdatedDate: '2024-06-01', UpdatedBy: 'admin' },
];

// ─── Create Agent User Dialog ────────────────────────────────────────────────

@Component({
  selector: 'create-agent-user-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, TranslateModule, LoadingSpinnerComponent],
  template: `
<div class="relative">
  <div class="flex items-center gap-3 p-5 border-b border-gray-100">
    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center">
      <i class="fas fa-user-plus text-lg"></i>
    </div>
    <div class="flex-1">
      <h2 class="text-xl font-bold">{{ 'Create Agent User' | translate }}</h2>
      <p class="text-sm text-gray-500">{{ 'Create a new agent user by filling the details below' | translate }}</p>
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
          <loading-spinner [isLoading]="isSubmittingData()" [message]="'Submitting Agent User...' | translate" />
        </div>
      } @else {
        <div class="space-y-6 p-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <i class="fas fa-user text-primary-500"></i>
                <span>{{ 'First Name' | translate }}</span>
              </label>
              <input type="text" formControlName="FirstName" maxlength="50"
                class="w-full placeholder-gray-400 p-3 h-14 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400"
                [placeholder]="'Enter first name' | translate">
              @if (form.get('FirstName')?.invalid && (form.get('FirstName')?.touched || form.get('FirstName')?.dirty)) {
                <div class="text-red-500 text-xs mt-1">{{ 'First Name is required' | translate }}</div>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <i class="fas fa-user text-primary-500"></i>
                <span>{{ 'Last Name' | translate }}</span>
              </label>
              <input type="text" formControlName="LastName" maxlength="50"
                class="w-full placeholder-gray-400 p-3 h-14 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400"
                [placeholder]="'Enter last name' | translate">
              @if (form.get('LastName')?.invalid && (form.get('LastName')?.touched || form.get('LastName')?.dirty)) {
                <div class="text-red-500 text-xs mt-1">{{ 'Last Name is required' | translate }}</div>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <i class="fas fa-envelope text-primary-500"></i>
                <span>{{ 'Email' | translate }}</span>
              </label>
              <input type="email" formControlName="Email" maxlength="100" (blur)="onEmailBlur()"
                class="w-full placeholder-gray-400 p-3 h-14 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400"
                [placeholder]="'Enter email' | translate">
              @if (form.get('Email')?.invalid && (form.get('Email')?.touched || form.get('Email')?.dirty)) {
                <div class="text-red-500 text-xs mt-1">{{ 'Valid email is required' | translate }}</div>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <i class="fas fa-mobile-alt text-primary-500"></i>
                <span>{{ 'Mobile' | translate }}</span>
              </label>
              <input type="text" formControlName="Mobile" maxlength="20"
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
            <input type="text" formControlName="UserName" maxlength="50"
              class="w-full placeholder-gray-400 p-3 h-14 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400"
              [placeholder]="'Enter username' | translate">
            @if (form.get('UserName')?.invalid && (form.get('UserName')?.touched || form.get('UserName')?.dirty)) {
              <div class="text-red-500 text-xs mt-1">{{ 'Username is required' | translate }}</div>
            }
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <i class="fas fa-lock text-primary-500"></i>
                <span>{{ 'Password' | translate }}</span>
              </label>
              <input type="password" formControlName="Password"
                class="w-full placeholder-gray-400 p-3 h-14 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400"
                [placeholder]="'Enter password' | translate">
              @if (form.get('Password')?.invalid && (form.get('Password')?.touched || form.get('Password')?.dirty)) {
                <div class="text-red-500 text-xs mt-1">{{ 'Password must be at least 8 chars with uppercase, lowercase, digit, and special character' | translate }}</div>
              }
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                <i class="fas fa-lock text-primary-500"></i>
                <span>{{ 'Confirm Password' | translate }}</span>
              </label>
              <input type="password" formControlName="ConfirmPassword"
                class="w-full placeholder-gray-400 p-3 h-14 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400"
                [placeholder]="'Confirm password' | translate">
              @if (form.errors?.['passwordMismatch'] && (form.get('ConfirmPassword')?.touched || form.get('ConfirmPassword')?.dirty)) {
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
          <span class="mr-2">{{ 'Create Agent User' | translate }}</span>
          <i class="fas fa-ban"></i>
        </button>
      } @else {
        <button type="submit"
          class="cursor-pointer px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all flex items-center gap-1 shadow-lg hover:shadow-xl">
          <span class="mr-2">{{ 'Create Agent User' | translate }}</span>
          <i class="fas fa-plus"></i>
        </button>
      }
    </div>
  </form>
</div>
  `,
})
export class CreateAgentUserDialogComponent {
  readonly dialogRef = inject(MatDialogRef<CreateAgentUserDialogComponent>);
  readonly data = inject<{ agentId: number | null }>(MAT_DIALOG_DATA);
  readonly isSubmittingData = signal(false);

  static passwordMatchValidator(control: import('@angular/forms').AbstractControl) {
    const group = control as FormGroup;
    const password = group.get('Password')?.value;
    const confirm = group.get('ConfirmPassword')?.value;
    return password === confirm ? null : { passwordMismatch: true };
  }

  form = new FormGroup({
    FirstName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    LastName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    UserName: new FormControl('', [Validators.required, Validators.maxLength(50)]),
    Password: new FormControl('', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)]),
    ConfirmPassword: new FormControl('', [Validators.required]),
    Email: new FormControl('', [Validators.email, Validators.maxLength(100)]),
    Mobile: new FormControl('', [Validators.maxLength(20)]),
  }, { validators: CreateAgentUserDialogComponent.passwordMatchValidator as import('@angular/forms').ValidatorFn });

  onEmailBlur() {
    const emailValue = this.form.get('Email')?.value;
    const usernameValue = this.form.get('UserName')?.value;
    if (emailValue && !usernameValue) {
      this.form.get('UserName')?.setValue(emailValue);
    }
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.isSubmittingData.set(true);
    const v = this.form.value;
    const agentId = this.data?.agentId;
    const agent = MOCK_AGENTS.find(a => a.AgentID === agentId);
    const newUser: MockAgentUser = {
      UserID: Math.max(...MOCK_AGENT_USERS.map(u => u.UserID), 200) + 1,
      FirstName: v.FirstName ?? '',
      LastName: v.LastName ?? '',
      UserName: v.UserName ?? '',
      Email: v.Email ?? '',
      PhoneNumber: v.Mobile ?? '',
      IsActive: true,
      UserTypeID: 2,
      UserOwnerID: agentId ?? 0,
      UserRole: 'Agent User',
      CompanyName: agent?.Name ?? '',
      AddedDate: new Date().toISOString().split('T')[0],
      AddedBy: 'admin',
      LastUpdatedDate: new Date().toISOString().split('T')[0],
      UpdatedBy: 'admin',
    };

    of(null).pipe(delay(600)).subscribe(() => {
      MOCK_AGENT_USERS = [...MOCK_AGENT_USERS, newUser];
      this.isSubmittingData.set(false);
      this.dialogRef.close(true);
    });
  }

  onClose() { this.dialogRef.close(false); }
}

// ─── Edit Agent User Dialog ──────────────────────────────────────────────────

@Component({
  selector: 'edit-agent-user-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, TranslateModule, LoadingSpinnerComponent],
  template: `
<div class="relative">
  <div class="flex items-center gap-3 p-5 border-b border-gray-100">
    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center">
      <i class="fas fa-user-edit text-lg"></i>
    </div>
    <div class="flex-1">
      <h2 class="text-xl font-bold">{{ 'Edit Agent User' | translate }}</h2>
      <p class="text-sm text-gray-500">{{ 'Update the agent user details below' | translate }}</p>
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
          <span class="mr-2">{{ 'Update Agent User' | translate }}</span>
          <i class="fas fa-ban"></i>
        </button>
      } @else {
        <button type="submit"
          class="cursor-pointer px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all flex items-center gap-1 shadow-lg hover:shadow-xl">
          <span class="mr-2">{{ 'Update Agent User' | translate }}</span>
          <i class="fas fa-save"></i>
        </button>
      }
    </div>
  </form>
</div>
  `,
})
export class EditAgentUserDialogComponent {
  readonly dialogRef = inject(MatDialogRef<EditAgentUserDialogComponent>);
  readonly data = inject<MockAgentUser>(MAT_DIALOG_DATA);
  readonly isSubmittingData = signal(false);

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
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.isSubmittingData.set(true);
    const v = this.form.value;
    of(null).pipe(delay(600)).subscribe(() => {
      MOCK_AGENT_USERS = MOCK_AGENT_USERS.map(u => u.UserID === this.data.UserID ? {
        ...u,
        FirstName: v.firstName ?? u.FirstName,
        LastName: v.lastName ?? u.LastName,
        Email: v.email ?? u.Email,
        PhoneNumber: v.mobile ?? u.PhoneNumber,
        UserName: v.username ?? u.UserName,
        IsActive: v.isActive ?? u.IsActive,
        LastUpdatedDate: new Date().toISOString().split('T')[0],
      } : u);
      this.isSubmittingData.set(false);
      this.dialogRef.close(true);
    });
  }

  onClose() { this.dialogRef.close(false); }
}

// ─── View Agent User Dialog ──────────────────────────────────────────────────

@Component({
  selector: 'view-agent-user-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatDialogModule, TranslateModule],
  template: `
<div class="relative">
  <div class="flex items-center gap-3 p-5 border-b border-gray-100">
    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center">
      <i class="fas fa-user-tie text-lg"></i>
    </div>
    <div class="flex-1">
      <h2 class="text-xl font-bold">{{ 'Agent User Details' | translate }}</h2>
      <p class="text-sm text-gray-500">{{ 'View agent user information' | translate }}</p>
    </div>
    <button (click)="onClose()" class="text-gray-400 hover:text-gray-500 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>

  <div class="max-h-[70vh] overflow-y-auto p-5 custom-scroll">
    <div class="space-y-3">
      <div class="flex items-start gap-3 p-3 bg-primary-50 rounded-lg">
        <div class="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
          <i class="fas fa-user text-sm"></i>
        </div>
        <div class="min-w-0">
          <h3 class="font-medium text-gray-900 text-sm truncate">{{ data.FirstName }} {{ data.LastName }}</h3>
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

      <div class="grid grid-cols-2 gap-3">
        <div class="bg-white p-3 rounded-lg border border-gray-100">
          <div class="flex items-center text-primary-600 mb-1.5">
            <i class="fas fa-id-card text-xs me-1.5"></i>
            <span class="text-xs font-semibold">{{ 'Account Details' | translate }}</span>
          </div>
          <div>
            <p class="text-[11px] text-gray-500 font-medium">{{ 'Username' | translate }}</p>
            <p class="text-xs text-black truncate">{{ data.UserName }}</p>
          </div>
        </div>

        <div class="bg-white p-3 rounded-lg border border-gray-100">
          <div class="flex items-center text-primary-600 mb-1.5">
            <i class="fas fa-address-book text-xs me-1.5"></i>
            <span class="text-xs font-semibold">{{ 'Contact Info' | translate }}</span>
          </div>
          <div>
            <p class="text-[11px] text-gray-500 font-medium">{{ 'Phone Number' | translate }}</p>
            <p class="text-xs text-black">{{ data.PhoneNumber || ('Not provided' | translate) }}</p>
          </div>
        </div>

        <div class="bg-white p-3 rounded-lg border border-gray-100 col-span-2">
          <div class="flex items-center text-primary-600 mb-1.5">
            <i class="fas fa-building text-xs me-1.5"></i>
            <span class="text-xs font-semibold">{{ 'Agency' | translate }}</span>
          </div>
          <div>
            <p class="text-[11px] text-gray-500 font-medium">{{ 'Company' | translate }}</p>
            <p class="text-xs text-black">{{ data.CompanyName || ('Not specified' | translate) }}</p>
          </div>
        </div>
      </div>

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
export class ViewAgentUserDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ViewAgentUserDialogComponent>);
  readonly data = inject<MockAgentUser>(MAT_DIALOG_DATA);

  onClose() { this.dialogRef.close(); }
}

// ─── Agent Users Page Component ──────────────────────────────────────────────

@Component({
  selector: 'agent-users-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
    SingleItemSelectorComponent,
  ],
  template: `
<div class="p-6">
  <!-- Page Header -->
  <div class="mb-6">
    <h1 class="text-2xl font-bold text-gray-800">{{ 'Agent Users' | translate }}</h1>
    <p class="text-sm text-gray-500 mt-1">{{ 'Manage users for travel agents' | translate }}</p>
  </div>

  <!-- Agent Selector -->
  <div class="rounded border border-gray-200 p-5 bg-white mb-2">
    <single-item-selector
      [label]="'Select Agent' | translate"
      [placeholder]="'Choose an agent' | translate"
      icon="fas fa-badge"
      [items]="agentItems"
      [selected]="selectedAgentItem()"
      (selectionChange)="onAgentSelect($event)">
    </single-item-selector>
  </div>

  <!-- New Agent User Button -->
  @if (selectedAgentId()) {
    <div class="flex justify-start mt-2">
      <button mat-raised-button color="primary" class="h-12" (click)="openCreateDialog()">
        <i class="fas fa-plus me-2"></i>
        {{ 'New Agent User' | translate }}
      </button>
    </div>
  }

  <!-- Table -->
  <div class="shadow-sm rounded table-responsive mt-2 position-relative">
    @if (isLoading()) {
      <div class="loading-shade">
        <mat-spinner diameter="50"></mat-spinner>
      </div>
    }
    <table mat-table [class.hidden]="!selectedAgentId()" [dataSource]="filteredUsers()" class="mat-elevation-z8 w-full">

      <ng-container matColumnDef="Name">
        <th mat-header-cell *matHeaderCellDef>{{ 'Name' | translate }}</th>
        <td mat-cell *matCellDef="let element">
          <div class="d-flex align-items-center">
            <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center me-3">
              <i class="fas fa-user text-gray-400"></i>
            </div>
            <div>
              <b>{{ element.FirstName }}</b> - {{ element.LastName }}
            </div>
          </div>
        </td>
      </ng-container>

      <ng-container matColumnDef="Username">
        <th mat-header-cell *matHeaderCellDef>{{ 'Username' | translate }}</th>
        <td mat-cell *matCellDef="let element">{{ element.UserName }}</td>
      </ng-container>

      <ng-container matColumnDef="Email">
        <th mat-header-cell *matHeaderCellDef>{{ 'Email' | translate }}</th>
        <td mat-cell *matCellDef="let element">{{ element.Email }}</td>
      </ng-container>

      <ng-container matColumnDef="Mobile">
        <th mat-header-cell *matHeaderCellDef>{{ 'Mobile' | translate }}</th>
        <td mat-cell *matCellDef="let element">{{ element.PhoneNumber }}</td>
      </ng-container>

      <ng-container matColumnDef="Active">
        <th mat-header-cell *matHeaderCellDef>{{ 'Active' | translate }}</th>
        <td mat-cell *matCellDef="let element">
          <span class="px-2 py-1 rounded-full w-fit flex flex-nowrap items-center justify-center gap-1 text-xs font-medium"
            [class.bg-green-100]="element.IsActive" [class.text-green-800]="element.IsActive"
            [class.bg-red-100]="!element.IsActive" [class.text-red-800]="!element.IsActive">
            <i class="fas" [class.fa-check-circle]="element.IsActive" [class.fa-times-circle]="!element.IsActive"
              [class.text-green-500]="element.IsActive" [class.text-red-400]="!element.IsActive"></i>
            {{ element.IsActive ? ('Active' | translate) : ('Inactive' | translate) }}
          </span>
        </td>
      </ng-container>

      <ng-container matColumnDef="action">
        <th mat-header-cell *matHeaderCellDef>{{ 'Action' | translate }}</th>
        <td mat-cell *matCellDef="let element">
          <div class="d-flex align-items-center gap-1">
            <button mat-icon-button (click)="openEditDialog(element)" [attr.aria-label]="'Edit' | translate">
              <i class="fas fa-edit text-primary fa-xs"></i>
            </button>
            <button mat-icon-button (click)="openViewDialog(element)" [attr.aria-label]="'View' | translate">
              <i class="fas fa-eye text-primary fa-xs"></i>
            </button>
          </div>
        </td>
      </ng-container>

      <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
      <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
    </table>

    <mat-paginator
      [style.display]="selectedAgentId() ? 'block' : 'none'"
      [length]="filteredUsers().length"
      [pageSizeOptions]="[5, 10, 20]"
      showFirstLastButtons>
    </mat-paginator>
  </div>

  @if (!selectedAgentId()) {
    <div class="flex justify-center items-center h-64 mt-4 flex-col border-2 border-dashed border-gray-300 rounded">
      <i class="fas fa-badge text-gray-300 text-4xl mb-3"></i>
      <p class="text-gray-500">{{ 'Please select an agent to view users.' | translate }}</p>
    </div>
  }
</div>
  `,
})
export class AgentUsersPageComponent {
  private readonly dialog = inject(MatDialog);

  displayedColumns = ['Name', 'Username', 'Email', 'Mobile', 'Active', 'action'];
  readonly isLoading = signal(false);
  readonly selectedAgentId = signal<number | null>(null);
  readonly selectedAgentItem = signal<Item | null>(null);

  readonly agentItems: Item[] = MOCK_AGENTS.map(a => ({
    id: a.AgentID,
    title: a.Name,
    subtitle: a.Code,
  }));

  readonly filteredUsers = computed(() => {
    const id = this.selectedAgentId();
    if (!id) return [];
    return MOCK_AGENT_USERS.filter(u => u.UserOwnerID === id);
  });

  onAgentSelect(item: Item | null) {
    this.selectedAgentItem.set(item);
    this.selectedAgentId.set(item ? item.id as number : null);
  }

  openCreateDialog() {
    const ref = this.dialog.open(CreateAgentUserDialogComponent, {
      width: '900px',
      disableClose: true,
      data: { agentId: this.selectedAgentId() },
    });
    ref.afterClosed().subscribe(result => { if (result) this.triggerRefresh(); });
  }

  openEditDialog(user: MockAgentUser) {
    const ref = this.dialog.open(EditAgentUserDialogComponent, { width: '900px', disableClose: true, data: user });
    ref.afterClosed().subscribe(result => { if (result) this.triggerRefresh(); });
  }

  openViewDialog(user: MockAgentUser) {
    this.dialog.open(ViewAgentUserDialogComponent, { width: '900px', data: user });
  }

  private triggerRefresh() {
    const id = this.selectedAgentId();
    this.selectedAgentId.set(null);
    this.selectedAgentId.set(id);
  }
}
