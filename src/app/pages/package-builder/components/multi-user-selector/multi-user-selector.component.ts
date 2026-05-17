import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal, ViewChild, ElementRef, TemplateRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OverlayModule, CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay'; // Import CDK Overlay modules
import { TranslateModule } from '@ngx-translate/core';
export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  countryId?: number;
  country?: string;
  city?: string;
}

export interface Country {
  id: number;
  name: string;
}

@Component({
  selector: 'app-multi-user-selector',
  standalone: true,
  imports: [CommonModule, FormsModule, OverlayModule, TranslateModule],
  templateUrl: './multi-user-selector.component.html',
  styleUrl: './multi-user-selector.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MultiUserSelectorComponent {
  dropdownWidth = signal<number | undefined>(undefined);
  
  // Inputs
  users = input.required<User[]>();
  countries = input.required<Country[]>();
  initialSelection = input<number[]>([], { alias: 'selectedUsers' });
   @Input() isLoadingUsers= signal(false);
   @Input() isLoadingCountries = signal(false);
  
  // Outputs
  selectionChanged = output<number[]>();
  
  // State signals
  selectedUsers = signal<User[]>([]);
  showDropdown = signal(false);
  searchQuery = signal('');
  selectedCountryId = signal<number | null>(null);

  // References
  @ViewChild('searchOrigin') searchOrigin!: ElementRef;

  overlayPositions: ConnectedPosition[] = [
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
      offsetY: 4,
    },
    {
      originX: 'start',
      originY: 'top',
      overlayX: 'start',
      overlayY: 'bottom',
      offsetY: -4,
    },
  ];

  ngAfterViewInit(): void {
    this.dropdownWidth.set(this.searchOrigin.nativeElement.offsetWidth);
  }

  // Computed filtered users list
  filteredUsers = computed(() => {
    const query = this.searchQuery().toLowerCase();
    const countryId = this.selectedCountryId();
    
    return this.users().filter(user => {
      // Filter by search query
      const matchesQuery = !query || 
        user.name.toLowerCase().includes(query) || 
        user.email.toLowerCase().includes(query);
      
      // Filter by country if selected
      const matchesCountry = !countryId || user.countryId === countryId;
      
      return matchesQuery && matchesCountry;
    });
  });

  constructor() {
    // Initialize with selected users
    effect(() => {
      const selectedIds = this.initialSelection();
      if (selectedIds.length) {
        const users = this.users().filter(user => selectedIds.includes(user.id));
        this.selectedUsers.set(users);
      }
    }, { allowSignalWrites: true });
  }

  // Check if user is selected
  isSelected(id: number): boolean {
    return this.selectedUsers().some(user => user.id === id);
  }

  // Toggle user selection
  toggleUser(user: User): void {
    if (this.isSelected(user.id)) {
      this.removeUser(user.id);
    } else {
      this.addUser(user);
    }
  }

  // Add user to selection
  addUser(user: User): void {
    this.selectedUsers.update(users => [...users, user]);
    this.emitSelection();
  }

  // Remove user from selection
  removeUser(id: number): void {
    this.selectedUsers.update(users => users.filter(user => user.id !== id));
    this.emitSelection();
  }

  // Filter users based on search query
  filterUsers(): void {
    // This will trigger the computed `filteredUsers` to re-evaluate
  }

  // Handle country change
  onCountryChange(countryId: Event): void {
    const selectElement = countryId.target as HTMLSelectElement;
    this.selectedCountryId.set(selectElement.value ? parseInt(selectElement.value) : null);
  }

  // Emit selection change event
  private emitSelection(): void {
    this.selectionChanged.emit(this.selectedUsers().map(user => user.id));
  }

  onBackdropClick(): void {
    this.showDropdown.set(false);
  }

  onAvatarError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = '/IMG/logo.png';
    img.className = img.className.replace('rounded-full', 'object-contain opacity-80');
  }
}
