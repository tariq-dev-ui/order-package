import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule, ReactiveFormsModule, FormControl, FormGroup, Validators,
  AbstractControl, ValidationErrors,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AgentModel, UserAccountViewModel, UserViewModel } from '../subagents.model';
import { SubagentsService } from '../subagents.service';

function strongPassword(control: AbstractControl): ValidationErrors | null {
  const v = control.value as string;
  if (!v) return null;
  const errors: ValidationErrors = {};
  if (v.length < 8)             errors['minLength']  = true;
  if (!/[A-Z]/.test(v))         errors['uppercase']  = true;
  if (!/[a-z]/.test(v))         errors['lowercase']  = true;
  if (!/[0-9]/.test(v))         errors['number']     = true;
  if (!/[^A-Za-z0-9]/.test(v))  errors['symbol']     = true;
  return Object.keys(errors).length ? errors : null;
}

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const pw  = group.get('password')?.value;
  const cpw = group.get('confirmPassword')?.value;
  if (!pw || !cpw) return null;
  return pw === cpw ? null : { passwordMismatch: true };
}

@Component({
  selector: 'subagent-user-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatDialogModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="save()" class="sufd-wrap">

      @if (isSaving()) {
        <div class="sufd-overlay">
          <div class="sufd-spinner"></div>
          <p>Saving...</p>
        </div>
      }

      <!-- Header -->
      <div class="sufd-header">
        <div class="sufd-header-content">
          <div class="sufd-header-icon">
            <span class="material-icons-round">{{ isEditMode ? 'edit' : 'person_add' }}</span>
          </div>
          <div>
            <h2 class="sufd-header-title">{{ isEditMode ? 'Edit User' : 'Add User' }}</h2>
            <p class="sufd-header-sub">{{ subagent.AgentName }}</p>
          </div>
        </div>
        <button type="button" class="sufd-close" (click)="dialogRef.close()">
          <span class="material-icons-round">close</span>
        </button>
      </div>

      <!-- Body -->
      <div class="sufd-body">

        <!-- Account Info -->
        <div class="sufd-section">
          <p class="sufd-section-title">Account Information</p>
          <div class="sufd-grid-2">

            <div class="sufd-field">
              <label class="sufd-label">Username <span class="req">*</span></label>
              <input formControlName="username" type="text" autocomplete="off" placeholder="e.g. john.doe"
                class="sufd-input" [class.sufd-input-err]="form.controls.username.invalid && form.controls.username.touched">
              @if (form.controls.username.touched && form.controls.username.errors?.['required']) {
                <p class="sufd-err">Username is required.</p>
              }
            </div>

            <div class="sufd-field">
              <label class="sufd-label">Email <span class="req">*</span></label>
              <input formControlName="email" type="email" autocomplete="off" placeholder="e.g. john@example.com"
                class="sufd-input" [class.sufd-input-err]="form.controls.email.invalid && form.controls.email.touched">
              @if (form.controls.email.touched && form.controls.email.errors?.['required']) {
                <p class="sufd-err">Email is required.</p>
              }
              @if (form.controls.email.touched && form.controls.email.errors?.['email']) {
                <p class="sufd-err">Enter a valid email address.</p>
              }
            </div>

          </div>
        </div>

        <!-- Personal Info -->
        <div class="sufd-section">
          <p class="sufd-section-title">Personal Information</p>
          <div class="sufd-grid-2">

            <div class="sufd-field">
              <label class="sufd-label">First Name <span class="req">*</span></label>
              <input formControlName="firstName" type="text" placeholder="First name"
                class="sufd-input" [class.sufd-input-err]="form.controls.firstName.invalid && form.controls.firstName.touched">
              @if (form.controls.firstName.touched && form.controls.firstName.errors?.['required']) {
                <p class="sufd-err">First name is required.</p>
              }
            </div>

            <div class="sufd-field">
              <label class="sufd-label">Last Name</label>
              <input formControlName="lastName" type="text" placeholder="Last name" class="sufd-input">
            </div>

            <div class="sufd-field sufd-full">
              <label class="sufd-label">Mobile</label>
              <input formControlName="mobile" type="tel" placeholder="+1 555 000 0000" class="sufd-input">
            </div>

          </div>
        </div>

        <!-- Password -->
        <div class="sufd-section">
          <p class="sufd-section-title">
            {{ isEditMode ? 'Change Password' : 'Password' }}
            @if (isEditMode) { <span class="sufd-optional">(leave blank to keep current)</span> }
          </p>
          <div class="sufd-grid-2">

            <div class="sufd-field">
              <label class="sufd-label">
                Password @if (!isEditMode) { <span class="req">*</span> }
              </label>
              <div class="sufd-pw-wrap">
                <input formControlName="password" [type]="showPassword() ? 'text' : 'password'"
                  placeholder="Min. 8 characters"
                  class="sufd-input sufd-input-pw" [class.sufd-input-err]="form.controls.password.invalid && form.controls.password.touched">
                <button type="button" class="sufd-pw-toggle" (click)="showPassword.set(!showPassword())">
                  <span class="material-icons-round">{{ showPassword() ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
              @if (form.controls.password.touched && form.controls.password.errors) {
                <div class="sufd-err-list">
                  @if (form.controls.password.errors['required'])  { <p class="sufd-err">Password is required.</p> }
                  @if (form.controls.password.errors['minLength'])  { <p class="sufd-err">At least 8 characters.</p> }
                  @if (form.controls.password.errors['uppercase']) { <p class="sufd-err">At least one uppercase letter.</p> }
                  @if (form.controls.password.errors['lowercase']) { <p class="sufd-err">At least one lowercase letter.</p> }
                  @if (form.controls.password.errors['number'])    { <p class="sufd-err">At least one number.</p> }
                  @if (form.controls.password.errors['symbol'])    { <p class="sufd-err">At least one special character.</p> }
                </div>
              }
            </div>

            <div class="sufd-field">
              <label class="sufd-label">
                Confirm Password @if (!isEditMode) { <span class="req">*</span> }
              </label>
              <div class="sufd-pw-wrap">
                <input formControlName="confirmPassword" [type]="showConfirm() ? 'text' : 'password'"
                  placeholder="Repeat password"
                  class="sufd-input sufd-input-pw"
                  [class.sufd-input-err]="form.errors?.['passwordMismatch'] && form.controls.confirmPassword.touched">
                <button type="button" class="sufd-pw-toggle" (click)="showConfirm.set(!showConfirm())">
                  <span class="material-icons-round">{{ showConfirm() ? 'visibility_off' : 'visibility' }}</span>
                </button>
              </div>
              @if (form.controls.confirmPassword.touched && form.controls.confirmPassword.errors?.['required']) {
                <p class="sufd-err">Please confirm your password.</p>
              }
              @if (form.errors?.['passwordMismatch'] && form.controls.confirmPassword.touched) {
                <p class="sufd-err">Passwords do not match.</p>
              }
            </div>

          </div>
        </div>

        <!-- Status Toggle -->
        <div class="sufd-toggle-row">
          <div>
            <p class="sufd-toggle-label">Active</p>
            <p class="sufd-toggle-sub">User can log in when active</p>
          </div>
          <label class="sufd-toggle">
            <input type="checkbox" formControlName="isActive" class="sufd-toggle-input" />
            <span class="sufd-toggle-track"></span>
          </label>
        </div>

      </div>

      <!-- Footer -->
      <div class="sufd-footer">
        <button type="button" (click)="dialogRef.close()" [disabled]="isSaving()" class="sufd-btn-cancel">
          Cancel
        </button>
        <button type="submit" [disabled]="isSaving()" class="sufd-btn-save">
          {{ isEditMode ? 'Save Changes' : 'Create User' }}
        </button>
      </div>

    </form>
  `,
  styles: [`
    .sufd-wrap { background: #f4f6f2; display: flex; flex-direction: column; max-height: 90vh; position: relative; }

    .sufd-overlay {
      position: absolute; inset: 0; background: rgba(255,255,255,.8); backdrop-filter: blur(2px);
      z-index: 10; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
    }
    .sufd-overlay p { font-size: 14px; color: #3a472a; font-weight: 500; margin: 0; }
    .sufd-spinner {
      width: 36px; height: 36px; border: 4px solid #d8decf; border-top-color: #3a472a;
      border-radius: 50%; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .sufd-header {
      padding: 20px 24px; border-bottom: 1px solid #d8decf;
      background: linear-gradient(to right, #3a472a, #4a5a38, #3a472a);
      display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-shrink: 0;
    }
    .sufd-header-content { display: flex; align-items: flex-start; gap: 14px; }
    .sufd-header-icon {
      width: 40px; height: 40px; background: rgba(255,255,255,.1); color: #fff;
      display: flex; align-items: center; justify-content: center;
    }
    .sufd-header-icon .material-icons-round { font-size: 20px; }
    .sufd-header-title { font-size: 18px; font-weight: 700; color: #fff; margin: 0; }
    .sufd-header-sub   { font-size: 12px; color: rgba(255,255,255,.7); margin: 3px 0 0; }
    .sufd-close {
      background: rgba(255,255,255,.15); border: none; border-radius: 6px;
      padding: 6px; cursor: pointer; color: rgba(255,255,255,.8); display: flex; align-items: center;
    }
    .sufd-close:hover { background: rgba(255,255,255,.25); }
    .sufd-close .material-icons-round { font-size: 18px; }

    .sufd-body { flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 18px; }

    .sufd-section { }
    .sufd-section-title { font-size: 11px; font-weight: 700; color: #74806a; text-transform: uppercase; letter-spacing: .5px; margin: 0 0 12px; }
    .sufd-optional { font-size: 11px; color: rgba(116,128,106,.6); text-transform: none; font-weight: 400; letter-spacing: 0; }

    .sufd-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    @media (max-width: 560px) { .sufd-grid-2 { grid-template-columns: 1fr; } }
    .sufd-full { grid-column: 1 / -1; }

    .sufd-field { display: flex; flex-direction: column; gap: 5px; }
    .sufd-label { font-size: 11px; font-weight: 600; color: #242e1a; }
    .req { color: #ef4444; font-weight: 400; }

    .sufd-input {
      width: 100%; height: 40px; padding: 0 12px;
      border: 1px solid #d8decf; background: #fff;
      font-size: 13px; color: #242e1a; box-sizing: border-box; transition: border-color 0.15s;
    }
    .sufd-input::placeholder { color: #74806a; }
    .sufd-input:focus { outline: none; border-color: #3a472a; box-shadow: 0 0 0 2px rgba(58,71,42,.12); }
    .sufd-input-err { border-color: #f87171 !important; }
    .sufd-err  { font-size: 11px; color: #ef4444; margin: 0; }
    .sufd-err-list { display: flex; flex-direction: column; gap: 2px; margin-top: 4px; }

    .sufd-pw-wrap { position: relative; }
    .sufd-input-pw { padding-right: 36px; }
    .sufd-pw-toggle {
      position: absolute; right: 8px; top: 50%; transform: translateY(-50%);
      background: none; border: none; cursor: pointer; color: #74806a; display: flex;
    }
    .sufd-pw-toggle:hover { color: #242e1a; }
    .sufd-pw-toggle .material-icons-round { font-size: 16px; }

    .sufd-toggle-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px; background: #f9f7f1; border: 1px solid #d8decf;
    }
    .sufd-toggle-label { font-size: 13px; font-weight: 600; color: #242e1a; margin: 0; }
    .sufd-toggle-sub   { font-size: 11px; color: #74806a; margin: 2px 0 0; }
    .sufd-toggle { position: relative; display: inline-flex; align-items: center; cursor: pointer; }
    .sufd-toggle-input { position: absolute; opacity: 0; width: 0; height: 0; }
    .sufd-toggle-track {
      width: 40px; height: 20px; background: #d8decf; border-radius: 10px;
      transition: background 0.15s; position: relative;
    }
    .sufd-toggle-track::after {
      content: ''; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px;
      background: #fff; border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,.2); transition: transform 0.15s;
    }
    .sufd-toggle-input:checked + .sufd-toggle-track { background: #3a472a; }
    .sufd-toggle-input:checked + .sufd-toggle-track::after { transform: translateX(20px); }

    .sufd-footer {
      display: flex; align-items: center; justify-content: flex-end; gap: 10px;
      padding: 14px 24px; border-top: 1px solid #d8decf;
      background: #f9f7f1; flex-shrink: 0;
    }
    .sufd-btn-cancel {
      padding: 9px 20px; font-size: 13px; font-weight: 500;
      border: 1px solid #d8decf; background: #fff; color: #242e1a;
      cursor: pointer; transition: background 0.15s;
    }
    .sufd-btn-cancel:hover { background: #f4f6f2; }
    .sufd-btn-cancel:disabled { opacity: .5; cursor: not-allowed; }
    .sufd-btn-save {
      padding: 9px 20px; font-size: 13px; font-weight: 500;
      background: #242e1a; color: #fff; border: none;
      cursor: pointer; transition: background 0.15s;
    }
    .sufd-btn-save:hover { background: #3a472a; }
    .sufd-btn-save:disabled { opacity: .6; cursor: not-allowed; }
  `],
})
export class SubagentUserFormDialogComponent implements OnInit {
  private readonly service = inject(SubagentsService);
  private readonly snackBar = inject(MatSnackBar);
  readonly dialogRef = inject(MatDialogRef<SubagentUserFormDialogComponent>);
  readonly data: { agent: AgentModel; user?: UserAccountViewModel } = inject(MAT_DIALOG_DATA);

  get subagent(): AgentModel { return this.data.agent; }
  get editingUser(): UserAccountViewModel | undefined { return this.data.user; }
  get isEditMode(): boolean { return !!this.editingUser; }

  showPassword = signal(false);
  showConfirm  = signal(false);
  isSaving     = signal(false);

  form = new FormGroup(
    {
      username:        new FormControl('', [Validators.required, Validators.maxLength(50)]),
      email:           new FormControl('', [Validators.required, Validators.email, Validators.maxLength(100)]),
      firstName:       new FormControl('', [Validators.required, Validators.maxLength(100)]),
      lastName:        new FormControl('', [Validators.maxLength(100)]),
      mobile:          new FormControl('', [Validators.maxLength(30)]),
      password:        new FormControl(''),
      confirmPassword: new FormControl(''),
      isActive:        new FormControl(true),
    },
    { validators: passwordsMatch },
  );

  ngOnInit() {
    if (this.isEditMode) {
      const u = this.editingUser!;
      this.form.setValue({
        username: u.UserName ?? '', email: u.Email ?? '',
        firstName: u.FirstName ?? '', lastName: u.LastName ?? '',
        mobile: u.PhoneNumber ?? '', password: '', confirmPassword: '',
        isActive: u.IsActive ?? true,
      });
      this.setPasswordRequired(false);
    } else {
      this.setPasswordRequired(true);
    }
  }

  private setPasswordRequired(required: boolean) {
    const pw  = this.form.controls.password;
    const cpw = this.form.controls.confirmPassword;
    pw.setValidators(required ? [Validators.required, strongPassword] : [strongPassword]);
    cpw.setValidators(required ? [Validators.required] : []);
    pw.updateValueAndValidity();
    cpw.updateValueAndValidity();
  }

  save() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const c = this.form.controls;
    const payload: UserViewModel = {
      UserID:             this.editingUser?.UserID,
      UserName:           c.username.value  ?? '',
      Email:              c.email.value     ?? '',
      FirstName:          c.firstName.value ?? '',
      LastName:           c.lastName.value  ?? '',
      Mobile:             c.mobile.value    ?? '',
      IsActive:           c.isActive.value  === true,
      IsAdmin:            false,
      UserSystemGroupIDs: [],
      UserTypeID:         2,
      UserOwnerID:        this.subagent.AgentID ?? null,
      ...(c.password.value ? { Password: c.password.value } : {}),
    };

    this.isSaving.set(true);
    const obs = this.isEditMode
      ? this.service.updateUser(payload)
      : this.service.createUser(payload);

    obs.subscribe({
      next: (res) => {
        this.isSaving.set(false);
        if (res?.IsSuccess) {
          this.snackBar.open(
            this.isEditMode ? 'User updated successfully' : 'User created successfully',
            '', { duration: 3000 }
          );
          this.dialogRef.close(true);
        } else {
          this.snackBar.open(res?.Message ?? 'Failed to save user', '', { duration: 4000 });
        }
      },
      error: () => {
        this.isSaving.set(false);
        this.snackBar.open('An error occurred', '', { duration: 3000 });
      },
    });
  }
}
