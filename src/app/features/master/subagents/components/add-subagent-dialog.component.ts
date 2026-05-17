import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AgentModel, CountryData, CityData } from '../subagents.model';
import { SubagentsService } from '../subagents.service';

@Component({
  selector: 'add-subagent-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatDialogModule],
  template: `
    <div class="asd-wrap">

      @if (isLoading()) {
        <div class="asd-overlay">
          <div class="asd-spinner"></div>
          <p>Saving...</p>
        </div>
      }

      <!-- Header -->
      <div class="asd-header">
        <div class="asd-header-content">
          <div class="asd-header-icon">
            <span class="material-icons-round">{{ action === 'Add' ? 'person_add' : 'edit' }}</span>
          </div>
          <div>
            <h2 class="asd-header-title">{{ action }} Subagent</h2>
            <p class="asd-header-sub">
              {{ action === 'Add' ? 'Fill in the details to register a new subagent' : 'Update the subagent information below' }}
            </p>
          </div>
        </div>
        <button class="asd-close-btn" (click)="dialogRef.close()">
          <span class="material-icons-round">close</span>
        </button>
      </div>

      <!-- Form -->
      <form [formGroup]="form" (ngSubmit)="save()" class="asd-form">
        <div class="asd-body">

          <!-- Basic Info Section -->
          <div class="asd-section">
            <div class="asd-section-label">
              <span class="material-icons-round">info</span>
              Basic Information
            </div>
            <div class="asd-grid-2">

              <div class="asd-field">
                <label class="asd-label">Agent Code <span class="req">*</span></label>
                <div class="asd-input-wrap">
                  <span class="material-icons-round asd-input-icon">tag</span>
                  <input type="text" formControlName="agentCode" maxlength="50"
                    class="asd-input" [class.asd-input-err]="form.controls.agentCode.invalid && form.controls.agentCode.touched"
                    placeholder="e.g. AGT-001">
                </div>
                @if (form.controls.agentCode.invalid && form.controls.agentCode.touched) {
                  <p class="asd-err">
                    @if (form.controls.agentCode.errors?.['required']) { Agent code is required. }
                    @if (form.controls.agentCode.errors?.['maxlength']) { Maximum 50 characters. }
                  </p>
                }
              </div>

              <div class="asd-field">
                <label class="asd-label">CR Number</label>
                <div class="asd-input-wrap">
                  <span class="material-icons-round asd-input-icon">badge</span>
                  <input type="text" formControlName="crNumber" maxlength="50"
                    class="asd-input" placeholder="Commercial registration number">
                </div>
              </div>

              <div class="asd-field">
                <label class="asd-label">Agent Name <span class="req">*</span></label>
                <div class="asd-input-wrap">
                  <span class="material-icons-round asd-input-icon">person</span>
                  <input type="text" formControlName="agentName" maxlength="100"
                    class="asd-input" [class.asd-input-err]="form.controls.agentName.invalid && form.controls.agentName.touched"
                    placeholder="Full name of the agent">
                </div>
                @if (form.controls.agentName.invalid && form.controls.agentName.touched) {
                  <p class="asd-err">Agent name is required.</p>
                }
              </div>

              <div class="asd-field">
                <label class="asd-label">Email</label>
                <div class="asd-input-wrap">
                  <span class="material-icons-round asd-input-icon">email</span>
                  <input type="email" formControlName="agentEmail" maxlength="100"
                    class="asd-input" [class.asd-input-err]="form.controls.agentEmail.invalid && form.controls.agentEmail.touched"
                    placeholder="agent@example.com">
                </div>
                @if (form.controls.agentEmail.invalid && form.controls.agentEmail.touched) {
                  <p class="asd-err">Please enter a valid email address.</p>
                }
              </div>

            </div>
          </div>

          <!-- Location Section -->
          <div class="asd-section">
            <div class="asd-section-label">
              <span class="material-icons-round">location_on</span>
              Location
            </div>
            <div class="asd-grid-2">

              <div class="asd-field asd-full">
                <label class="asd-label">Address</label>
                <div class="asd-input-wrap">
                  <span class="material-icons-round asd-input-icon">home</span>
                  <input type="text" formControlName="address" maxlength="200"
                    class="asd-input" placeholder="Street address">
                </div>
              </div>

              <div class="asd-field">
                <label class="asd-label">Country</label>
                <div class="asd-select-wrap">
                  <span class="material-icons-round asd-input-icon">public</span>
                  @if (isCountryLoading()) {
                    <div class="asd-select-loading">Loading...</div>
                  } @else {
                    <select class="asd-select" [value]="form.controls.countryId.value ?? ''"
                      (change)="onCountryChange($event)">
                      <option value="">Select country</option>
                      @for (c of countryList(); track c.CountryID) {
                        <option [value]="c.CountryID">{{ c.TitleEnglish ?? c.Title }}</option>
                      }
                    </select>
                  }
                  <span class="material-icons-round asd-select-arrow">expand_more</span>
                </div>
              </div>

              <div class="asd-field">
                <label class="asd-label">City</label>
                <div class="asd-select-wrap">
                  <span class="material-icons-round asd-input-icon" [class.disabled-icon]="!form.controls.countryId.value">location_city</span>
                  @if (isCityLoading()) {
                    <div class="asd-select-loading">Loading...</div>
                  } @else {
                    <select class="asd-select" [value]="form.controls.cityId.value ?? ''"
                      (change)="onCityChange($event)" [disabled]="!form.controls.countryId.value">
                      <option value="">Select city</option>
                      @for (c of cityList(); track c.CityID) {
                        <option [value]="c.CityID">{{ c.NameEn ?? c.Name }}</option>
                      }
                    </select>
                  }
                  <span class="material-icons-round asd-select-arrow" [class.disabled-icon]="!form.controls.countryId.value">expand_more</span>
                </div>
              </div>

            </div>
          </div>

          <!-- Active Toggle -->
          <div class="asd-toggle-row">
            <div>
              <p class="asd-toggle-label">Active</p>
              <p class="asd-toggle-sub">Allow this subagent to access the platform</p>
            </div>
            <label class="asd-toggle">
              <input type="checkbox" formControlName="isActive" class="asd-toggle-input" />
              <span class="asd-toggle-track"></span>
            </label>
          </div>

        </div>

        <!-- Footer -->
        <div class="asd-footer">
          <button type="button" (click)="dialogRef.close()" [disabled]="isLoading()" class="asd-btn-cancel">
            Cancel
          </button>
          <button type="submit" [disabled]="isLoading() || form.invalid" class="asd-btn-save">
            <span class="material-icons-round">check</span>
            Save Subagent
          </button>
        </div>
      </form>

    </div>
  `,
  styles: [`
    .asd-wrap { background: #f4f6f2; display: flex; flex-direction: column; max-height: 90vh; position: relative; }

    .asd-overlay {
      position: absolute; inset: 0; background: rgba(255,255,255,.8);
      backdrop-filter: blur(2px); z-index: 10;
      display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px;
    }
    .asd-overlay p { font-size: 14px; color: #3a472a; font-weight: 500; }
    .asd-spinner {
      width: 36px; height: 36px; border: 4px solid #d8decf; border-top-color: #3a472a;
      border-radius: 50%; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .asd-header {
      padding: 20px 24px; border-bottom: 1px solid #d8decf;
      background: linear-gradient(to right, #3a472a, #4a5a38, #3a472a);
      display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-shrink: 0;
    }
    .asd-header-content { display: flex; align-items: flex-start; gap: 14px; }
    .asd-header-icon {
      width: 40px; height: 40px; background: rgba(255,255,255,.1); color: #fff;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .asd-header-icon .material-icons-round { font-size: 20px; }
    .asd-header-title { font-size: 20px; font-weight: 700; color: #fff; margin: 0; }
    .asd-header-sub { font-size: 13px; color: rgba(255,255,255,.75); margin: 4px 0 0; }
    .asd-close-btn {
      background: rgba(255,255,255,.15); border: none; border-radius: 6px;
      padding: 6px; cursor: pointer; color: rgba(255,255,255,.8); display: flex; align-items: center;
      transition: background 0.15s; flex-shrink: 0;
    }
    .asd-close-btn:hover { background: rgba(255,255,255,.25); }
    .asd-close-btn .material-icons-round { font-size: 18px; }

    .asd-form { display: flex; flex-direction: column; flex: 1; overflow: hidden; }
    .asd-body { flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 20px; }

    .asd-section { }
    .asd-section-label {
      display: flex; align-items: center; gap: 6px;
      font-size: 11px; font-weight: 700; color: #74806a;
      text-transform: uppercase; letter-spacing: .6px;
      margin-bottom: 14px;
    }
    .asd-section-label .material-icons-round { font-size: 14px; }

    .asd-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    @media (max-width: 600px) { .asd-grid-2 { grid-template-columns: 1fr; } }
    .asd-full { grid-column: 1 / -1; }

    .asd-field { display: flex; flex-direction: column; gap: 5px; }
    .asd-label { font-size: 11px; font-weight: 600; color: #242e1a; }
    .req { color: #ef4444; font-weight: 400; }

    .asd-input-wrap { position: relative; display: flex; align-items: center; }
    .asd-input-icon { position: absolute; left: 10px; font-size: 16px; color: #74806a; pointer-events: none; }
    .asd-input {
      width: 100%; height: 42px; padding: 0 12px 0 36px;
      border: 1px solid #d8decf; background: #fff;
      font-size: 13px; color: #242e1a; box-sizing: border-box;
      transition: border-color 0.15s;
    }
    .asd-input::placeholder { color: #74806a; }
    .asd-input:focus { outline: none; border-color: #3a472a; box-shadow: 0 0 0 2px rgba(58,71,42,.15); }
    .asd-input-err { border-color: #f87171 !important; }
    .asd-err { font-size: 11px; color: #ef4444; margin: 0; }

    .asd-select-wrap { position: relative; display: flex; align-items: center; }
    .asd-select {
      width: 100%; height: 42px; padding: 0 32px 0 36px;
      border: 1px solid #d8decf; background: #fff;
      font-size: 13px; color: #242e1a; box-sizing: border-box;
      appearance: none; cursor: pointer; transition: border-color 0.15s;
    }
    .asd-select:focus { outline: none; border-color: #3a472a; }
    .asd-select:disabled { background: #f4f6f2; color: #74806a; cursor: not-allowed; border-color: #e5e7eb; }
    .asd-select-loading {
      width: 100%; height: 42px; padding: 0 12px 0 36px;
      border: 1px solid #d8decf; background: #f4f6f2;
      font-size: 13px; color: #74806a; display: flex; align-items: center;
    }
    .asd-select-arrow { position: absolute; right: 10px; font-size: 16px; color: #74806a; pointer-events: none; }
    .disabled-icon { color: #d8decf !important; }

    .asd-toggle-row {
      display: flex; align-items: center; justify-content: space-between;
      padding: 12px 16px; background: #f9f7f1; border: 1px solid #d8decf;
    }
    .asd-toggle-label { font-size: 13px; font-weight: 600; color: #242e1a; margin: 0; }
    .asd-toggle-sub   { font-size: 11px; color: #74806a; margin: 2px 0 0; }
    .asd-toggle { position: relative; display: inline-flex; align-items: center; cursor: pointer; }
    .asd-toggle-input { position: absolute; opacity: 0; width: 0; height: 0; }
    .asd-toggle-track {
      width: 40px; height: 20px; background: #d8decf; border-radius: 10px;
      transition: background 0.15s; position: relative;
    }
    .asd-toggle-track::after {
      content: ''; position: absolute; top: 2px; left: 2px;
      width: 16px; height: 16px; background: #fff; border-radius: 50%;
      box-shadow: 0 1px 3px rgba(0,0,0,.2); transition: transform 0.15s;
    }
    .asd-toggle-input:checked + .asd-toggle-track { background: #3a472a; }
    .asd-toggle-input:checked + .asd-toggle-track::after { transform: translateX(20px); }

    .asd-footer {
      display: flex; align-items: center; justify-content: flex-end; gap: 10px;
      padding: 14px 24px; border-top: 1px solid #d8decf;
      background: #f9f7f1; flex-shrink: 0;
    }
    .asd-btn-cancel {
      padding: 9px 20px; font-size: 13px; font-weight: 500;
      border: 1px solid #d8decf; background: #fff; color: #242e1a;
      cursor: pointer; transition: background 0.15s;
    }
    .asd-btn-cancel:hover { background: #f4f6f2; }
    .asd-btn-cancel:disabled { opacity: .5; cursor: not-allowed; }
    .asd-btn-save {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 9px 20px; font-size: 13px; font-weight: 500;
      background: #242e1a; color: #fff; border: none; cursor: pointer;
      transition: background 0.15s; box-shadow: 0 1px 2px rgba(0,0,0,.1);
    }
    .asd-btn-save:hover { background: #3a472a; }
    .asd-btn-save:disabled { opacity: .5; cursor: not-allowed; }
    .asd-btn-save .material-icons-round { font-size: 14px; }
  `],
})
export class AddSubagentDialogComponent implements OnInit {
  private readonly service = inject(SubagentsService);
  private readonly snackBar = inject(MatSnackBar);
  readonly dialogRef = inject(MatDialogRef<AddSubagentDialogComponent>);
  readonly data: { agent?: AgentModel } | null = inject(MAT_DIALOG_DATA);

  subagent: AgentModel | undefined = this.data?.agent;
  action = this.subagent ? 'Edit' : 'Add';

  isLoading = signal(false);
  countryList = signal<CountryData[]>([]);
  isCountryLoading = signal(false);
  cityList = signal<CityData[]>([]);
  isCityLoading = signal(false);

  form = new FormGroup({
    agentCode:   new FormControl('', [Validators.required, Validators.maxLength(50)]),
    agentName:   new FormControl('', [Validators.required, Validators.maxLength(100)]),
    countryId:   new FormControl<number | undefined>(undefined),
    cityId:      new FormControl<number | undefined>(undefined),
    crNumber:    new FormControl('', [Validators.maxLength(50)]),
    agentEmail:  new FormControl('', [Validators.email, Validators.maxLength(100)]),
    address:     new FormControl('', [Validators.maxLength(200)]),
    description: new FormControl('', [Validators.maxLength(500)]),
    isActive:    new FormControl(false),
  });

  ngOnInit() {
    if (this.subagent) {
      this.form.setValue({
        agentCode:   this.subagent.AgentCode ?? '',
        agentName:   this.subagent.AgentName ?? '',
        countryId:   this.subagent.CountryID,
        cityId:      this.subagent.CityID,
        crNumber:    this.subagent.CR_NO ?? '',
        agentEmail:  this.subagent.AgentEmail ?? '',
        address:     this.subagent.Address ?? '',
        description: this.subagent.Description ?? '',
        isActive:    this.subagent.IsActive === true,
      });
      if (this.subagent.CountryID) this.loadCities(this.subagent.CountryID);
    }
    this.isCountryLoading.set(true);
    this.service.getCountriesLookup().subscribe({
      next: (c) => { this.countryList.set(c); this.isCountryLoading.set(false); },
      error: () => this.isCountryLoading.set(false),
    });
  }

  onCountryChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    const id = val ? Number(val) : undefined;
    this.form.controls.countryId.setValue(id);
    this.form.controls.cityId.setValue(undefined);
    this.cityList.set([]);
    if (id) this.loadCities(id);
  }

  private loadCities(countryId: number) {
    this.isCityLoading.set(true);
    this.service.getCitiesLookup(countryId).subscribe({
      next: (c) => { this.cityList.set(c); this.isCityLoading.set(false); },
      error: () => this.isCityLoading.set(false),
    });
  }

  onCityChange(event: Event) {
    const val = (event.target as HTMLSelectElement).value;
    this.form.controls.cityId.setValue(val ? Number(val) : undefined);
  }

  save() {
    if (this.form.invalid) return;
    const c = this.form.controls;
    const agent: AgentModel = {
      AgentID:      this.subagent?.AgentID,
      AgentCode:    c.agentCode.value  ?? '',
      AgentName:    c.agentName.value  ?? '',
      AgentEmail:   c.agentEmail.value ?? '',
      CountryID:    c.countryId.value  ?? undefined,
      CityID:       c.cityId.value     ?? undefined,
      CR_NO:        c.crNumber.value   ?? '',
      Address:      c.address.value    ?? '',
      Description:  c.description.value ?? '',
      IsActive:     c.isActive.value   === true,
      MasterAgentID: this.subagent?.MasterAgentID ?? 10,
    };
    this.isLoading.set(true);
    const obs = this.subagent ? this.service.updateAgent(agent) : this.service.createAgent(agent);
    obs.subscribe({
      next: () => {
        this.snackBar.open('Subagent saved successfully', '', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: () => {
        this.snackBar.open('An error occurred', '', { duration: 3000 });
        this.isLoading.set(false);
      },
    });
  }
}
