import { Component, inject, Input, output, SecurityContext, Signal, signal, OnInit } from '@angular/core';
// import { BookingStepperService } from '../services/booking-stepper.service';
import { FinalDetailsState } from '../../services/package-builder-state-management-service';
// import { FormControl, FormGroup, Validators } from '@angular/forms';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DomSanitizer } from '@angular/platform-browser';
import { MultiUserSelectorComponent, Country, User } from '../multi-user-selector/multi-user-selector.component';
import { AdminAPIClient, AgentModel, CountryData, SeroPackageAgentModel, TagModel } from 'src/app/services/admin.api.client';
import { TagInputComponent } from 'src/app/components/tag-input/tag-input.component';
import { getDefaultColor, TagBasicModel } from 'src/app/components/tag-input/tag.model';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'final-details-step',
  imports: [ReactiveFormsModule, CommonModule, MultiUserSelectorComponent, TagInputComponent, MatDatepickerModule, MatNativeDateModule, MatFormFieldModule, MatInputModule, TranslateModule],
  templateUrl: './final-details.html',
  styleUrl: './final-details.css'
})
export class FinalDetails {
  @Input() editMode = false;
  @Input() state!: Signal<FinalDetailsState>;
  @Input() updateFn!: (key: keyof FinalDetailsState, value: any) => void;
  readonly handleSubmitData = output<void>();
  readonly prevStep = output<void>();
  readonly nextStep = output<void>();
  private sanitizer = inject(DomSanitizer);
  adminApiClient = inject(AdminAPIClient);

  countries = signal<CountryData[]>([]);
  iCountries = signal<Country[]>([]);
  isLoadingCountries = signal<boolean>(false);

  agentsCount = signal<number>(0);
  agents = signal<AgentModel[]>([]);
  iAgents = signal<User[]>([]);
  isLoadingAgents = signal<boolean>(false);

  finalDetailsForm = new FormGroup({
    startDate: new FormControl<Date | null>(null, {
      nonNullable: false,
      validators: [Validators.required, (control) => this.startDateValidator(control)]
    }),
    endDate: new FormControl<Date | null>(null, {
      nonNullable: false,
      validators: [Validators.required, (control) => this.endDateValidator(control)]
    }),
    title: new FormControl<string | null>(null, { nonNullable: false, validators: [
      Validators.required,
      (control) => this.titleLengthValidator(control)] }),
    packageCode: new FormControl<string | null>(null, { nonNullable: false }),
    guestCount: new FormControl<number | null>(null, { nonNullable: false, validators: [Validators.min(1)] }),
    quantity: new FormControl<number | null>(null, { nonNullable: false, validators: [Validators.min(1)] }),
  });

  titleLengthValidator(control: any): { [key: string]: any } | null {
    const value = control.value;
    if (!value) return null;
    const length = value.length;
    if (length < 3) {
      return { minLength: { requiredLength: 3, actualLength: length } };
    }
    if (length > 1000) {
      return { maxLength: { requiredLength: 1000, actualLength: length } };
    }
    return null;
  }

  isTagsLoading = signal<boolean>(false);

  startDateValidator(control: any) {
    console.log("Validating start date", control.value, this.editMode);
    if (this.editMode) return null;
    if (!control.value) return null;

    const selectedDate = new Date(control.value);
    selectedDate.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return { startBeforeTomorrow: true };
    }
    return null;
  }

  endDateValidator(control: any) {
    const formGroup = control.parent as FormGroup;
    if (!formGroup) return null;
    const startDate = formGroup.get('startDate')?.value;
    if (!control.value || !startDate) return null;
    
    const selectedEndDate = new Date(control.value);
    const selectedStartDate = new Date(startDate);
    
    if (selectedEndDate <= selectedStartDate) {
      return { endBeforeStart: true };
    }
    return null;
  }

  setIAgents() {
    const agentModels = this.agents();
    const avatars = [];
    const users: User[] = agentModels.map(agent => ({
      id: agent.AgentID ?? 0,
      name: agent.AgentName ?? '',
      email: agent.AgentEmail ?? '',
      avatar: agent.LogoImageLocation ?? '',
      countryId: agent.CountryID,
      country: agent.CountryName ?? '',
      city: agent.CityName ?? '',
    }));
    this.iAgents.set(users);

  }

  setICounries() {
    const countryModels = this.countries();
    const countries: Country[] = countryModels.map(country => ({
      id: country.CountryID ?? 0,
      name: country.Title ?? '',
    }));
    this.iCountries.set(countries);
  }

  initialAgentSelection = signal<number[]>([]);

  ngOnInit() {
    this.loadCountries();
    const initialAgentsFromState = this.state().agents || [];
    this.initialAgentSelection.set(initialAgentsFromState.map(a => a.AgentId ?? null).filter(a => a !== null) as number[]);
    this.loadAgents();

    const initialTagsFromState = this.state().tags || [];
    if (this.initialTags().length == 0 && initialTagsFromState.length > 0) {
      this.initialTags.set([...initialTagsFromState]);
    }
    if (this.currentTags().length == 0 && initialTagsFromState.length > 0) {
      this.currentTags.set([...initialTagsFromState]);
    }
    this.finalDetailsForm.patchValue({
      startDate: this.startDate ?? null,
      endDate: this.endDate ?? null,
      title: this.state().title ?? '',
      packageCode: this.state().packageCode ?? '',
      guestCount: this.state().guestCount ?? null,
      quantity: this.state().quantity ?? null,
    });
    this.loadTags();

    // Re-run endDate validator whenever startDate changes (cross-field dependency)
    this.finalDetailsForm.get('startDate')?.valueChanges.subscribe(() => {
      this.finalDetailsForm.get('endDate')?.updateValueAndValidity({ emitEvent: false });
    });

    // Subscribe to form changes to update state
    this.finalDetailsForm.valueChanges.subscribe(value => {
      if (value.startDate && this.updateFn) {
        this.updateFn('startDate', value.startDate);
      }
      if (value.endDate && this.updateFn) {
        this.updateFn('endDate', value.endDate);
      }
      if (value.title !== undefined && this.updateFn) {
        this.updateFn('title', value.title || '');
      }
      if (value.packageCode !== undefined && this.updateFn) {
        this.updateFn('packageCode', value.packageCode || '');
      }
      if (value.guestCount !== undefined && this.updateFn) {
        this.updateFn('guestCount', value.guestCount ?? undefined);
      }
      if (value.quantity !== undefined && this.updateFn) {
        this.updateFn('quantity', value.quantity ?? undefined);
      }
    });
  }

  loadCountries() {
    this.isLoadingCountries.set(true);
    this.adminApiClient.getCountriesLookup().subscribe({
      next: (value) => {
        console.log("Countries", value);
        this.countries.set(value);
        this.setICounries();
      },
      error: (err) => {
        this.agentsCount.set(0);
        console.error(err);
      },
      complete: () => {
        this.isLoadingCountries.set(false);
      }
    });
  }

  loadAgents() {
    this.isLoadingAgents.set(true);
    this.adminApiClient.getAgentListCount().subscribe({
      next: (value) => {
        console.log("agents count", value);
        this.agentsCount.set(value ?? 0);
        this.adminApiClient.getAgentList({ pageIndex: 0, pageSize: this.agentsCount() }).subscribe({
          next: (agents) => {
            console.log("agents", agents);
            this.agents.set(agents);
            this.setIAgents();
          },
          error: (err) => {
            console.error(err);
          },
          complete: () => {
            this.isLoadingAgents.set(false);
          }
        });
      },
      error: (err) => {
        this.agentsCount.set(0);
        console.error(err);
      }
    });
  }



  submitData() {
    console.log("notify parent");
    this.handleSubmitData.emit();
    // this.nextStep.emit();
  }
  get startDate(): Date | null {
    const dateValue = this.state().startDate;
    if (dateValue) {
      return new Date(dateValue);
    }
    return null;
  }
  get endDate(): Date | null {
    const dateValue = this.state().endDate;
    if (dateValue) {
      return new Date(dateValue);
    }
    return null;
  }

  onChange<K extends keyof FinalDetailsState>(key: K, raw: any) {
    let val: any = raw === 'undefined' ? undefined : Number(raw);
    if (isNaN(val)) val = undefined;
    this.updateFn(key, val as FinalDetailsState[K]);
  }
  onDateChange<K extends keyof FinalDetailsState>(key: K, raw: any) {
    let val: any = raw === 'undefined' ? undefined : raw;
    if (val instanceof Date && !isNaN(val.getTime())) {
      val = val;
    } else if (typeof val === 'string') {
      val = new Date(val);
      if (isNaN(val.getTime())) val = undefined;
    } else {
      val = undefined;
    }
    this.updateFn(key, val as FinalDetailsState[K]);
  }
  onCheckboxChange<K extends keyof FinalDetailsState>(key: K, raw: any) {
    let val: any = raw === 'undefined' ? undefined : Boolean(raw);
    this.updateFn(key, val as FinalDetailsState[K]);
  }
  onTextAreaChange<K extends keyof FinalDetailsState>(key: K, raw: any) {
    let val: any = raw === 'undefined' ? undefined : String(raw);
    this.updateFn(key, val as FinalDetailsState[K]);
  }


  price = signal<number>(3);
  onPriceChange(value: number) {
    this.price.set(value);
    if (this.updateFn) {
      this.updateFn('price', value);
    }
  }

  trackByIndex(index: number) {
    return index;
  }

  get f() {
    return this.finalDetailsForm.controls;
  }




  validation() {
    //  this.isLoading = true;

    if (this.finalDetailsForm.invalid) {
      this.finalDetailsForm.markAllAsTouched();
      return;
    }

    try {
      const formValue = this.finalDetailsForm.value;
      const startDate = formValue.startDate;
      const endDate = formValue.endDate;

      if (!startDate || !endDate) {
        return;
      }

      // Additional validation if needed
      // The form validators should handle most validation now

      const title = formValue.title || '';
      // Formal XSS validation in Angular is typically handled by Angular's built-in sanitization mechanisms,
      // especially when binding to the DOM using [innerHTML] or similar. However, for form validation,
      // you can create a custom validator to check for potentially dangerous input.
      // Here, we use a custom validator function for XSS, which should be added to the FormControl.
      // For demonstration, we keep the runtime check, but the formal Angular way is to use a custom validator.

      // if (title.length > 1000) {
      //   this.finalDetailsForm.controls.title.setErrors({ maxLength: true });
      //   return;
      // }
      // XSS validation should be done via a custom validator, but for runtime check:
      // (Ideally, move this logic to a ValidatorFn and attach to the FormControl.)

      // If you have injected DomSanitizer, you could sanitize and check:
      const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, title);
      if (sanitized !== title) {
        this.finalDetailsForm.controls.title.setErrors({ xss: true });
        return;
      }
      // For now, fallback to a simple check:
      const xssPattern = /<\s*script.*?>|<\/\s*script\s*>|on\w+\s*=/i;
      if (xssPattern.test(title)) {
        this.finalDetailsForm.controls.title.setErrors({ xss: true });
        return;
      }

      this.nextStep.emit();

    } catch (error) {
      console.error('Error during form submission:', error);
      // this.notificationService.showError('An unexpected error occurred. Please try again.');
      // this.isLoading = false;
      return;
    }
  }

  // Initially selected user IDs
  initiallySelectedUserIds = []; // John and Mike

  // Current selected user IDs
  selectedUserIds: number[] = [...this.initiallySelectedUserIds];

  // Handle selection changes
  handleSelectionAgentsChange(selectedIds: number[]): void {
    this.selectedUserIds = selectedIds;
    console.log('Selected User IDs:', this.selectedUserIds);

    const agentModels = this.selectedUserIds;
    const agents: SeroPackageAgentModel[] = agentModels.map(id => ({
      AgentId: id,
      AddedBy: "string"
    }));

    if (this.updateFn) {
      this.updateFn('agents', agents);
    }
    // Here you would typically send this to your backend service
  }



  handleSelectionTagsChange(tags: TagBasicModel[]): void {
    if (this.updateFn) {
      this.updateFn('tags', tags);
    }
    // Here you would typically send this to your backend service
  }


  // Helper function to get user by ID
  getUserById(userId: number): User | undefined {
    return this.iAgents().find(user => user.id === userId);
  }

  // Initial tags to pre-populate
  initialTags = signal<TagBasicModel[]>([]);

  // Available tags for suggestions
  // make this a signal
  allTags = signal<TagBasicModel[]>([]);

  // Current selected tags
  currentTags = signal<TagBasicModel[]>([...this.initialTags()]);

  // Get default color (imported from tag.model.ts)
  getDefaultColor = getDefaultColor;

  // Calculate text color based on background
  getTextColor(bgColor: string): string {
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 150 ? '#1f2937' : '#ffffff';
  }

  // Handle tags change
  onTagsChanged(tags: TagBasicModel[]) {
    this.currentTags.set(tags);
    // console.log('Tags changed:', tags);
    this.handleSelectionTagsChange(this.currentTags());
  }

  // Handle new tag added
  onTagAdded(tag: TagBasicModel) {
    console.log('Tag added:', tag);

    const newTag: TagModel = {
      Name: tag.Name,
      Description: tag.Description,
      Color: tag.Color
    };

    this.createTag(newTag);
    // this.handleSelectionTagsChange(tags);
  }

  // Handle tag removed
  onTagRemoved(tag: TagBasicModel) {
    console.log('Tag removed:', tag);

    const tagIndex = this.currentTags().findIndex(t => t.TagID === tag.TagID);
    if (tagIndex !== -1) {
      this.currentTags().splice(tagIndex, 1);
    }
    console.log('Current tags after removal:', this.currentTags());
    this.handleSelectionTagsChange(this.currentTags());
    // If you need to notify your backend:
    // this.tagService.deleteTag(tag.TagID).subscribe();
  }

  createTag(newTag: TagModel): void {
    this.adminApiClient.createTag({ body: newTag }).subscribe(
      {
        next: (createdTag) => {
          console.log('Tag created:', createdTag);
          // Optionally, you can add the created tag to the current tags
          const newTagBasic: TagBasicModel = {
            TagID: createdTag.TagID,
            Name: createdTag?.Name,
            Description: '',
            Color: getDefaultColor(createdTag.TagID)
          };
          this.currentTags.set([...this.currentTags(), newTagBasic]);
          this.initialTags.set([...this.currentTags()]);
          this.allTags.set([...this.allTags(), newTagBasic]);
          this.handleSelectionTagsChange(this.currentTags());
          // Add to available tags
        },
        error: (err) => {
          console.error('Error creating tag:', err);
          // Handle error, e.g., show a notification
        },
        complete: () => {
          console.log('Tag creation completed');
        }
      });
  }

  loadTags() {
    this.isTagsLoading.set(true);
    this.adminApiClient.getAllTags().subscribe({
      next: (tags: TagModel[]) => {
        console.log("Tags", tags);

        this.allTags.set(tags.map(tag => ({
          TagID: tag.TagID,
          Name: tag.Name,
          Description: '',
          Color: getDefaultColor(tag.TagID)
        })));

        // Set initial tags if any
        const initialTagsFromState = this.state().tags || [];
        this.currentTags.set([...this.initialTags(), ...initialTagsFromState]);
      },
      error: (err) => {
        console.error(err);
      },
      complete: () => {
        this.isTagsLoading.set(false);
      }
    });
  }

}
