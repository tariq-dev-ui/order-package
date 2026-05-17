// Currently using local mock data for frontend prototype. Later this can be replaced with backend API.

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';

// ─── Mock Data Types ─────────────────────────────────────────────────────────

interface MockSystem {
  SystemID: number;
  SystemTitle: string;
}

interface MockGroup {
  GroupID: number;
  SystemID: number;
  Title: string;
  TitleRes: string;
  IsActive: boolean;
}

interface MockPrivilegeAction {
  key: string;
  label: string;
  checked: boolean;
}

interface MockPrivilegePage {
  PageID: number;
  PageTitle: string;
  ParentTitle: string;
  actions: MockPrivilegeAction[];
}

interface MockPrivilegeSection {
  parentTitle: string;
  pages: MockPrivilegePage[];
}

interface MockGroupUser {
  UserID: number;
  FirstName: string;
  LastName: string;
  UserName: string;
  Email: string;
  PhoneNumber: string;
  IsAssigned: boolean;
}

const MOCK_SYSTEMS: MockSystem[] = [
  { SystemID: 1, SystemTitle: 'Order Package' },
  { SystemID: 2, SystemTitle: 'Finance System' },
  { SystemID: 3, SystemTitle: 'Operations System' },
];

let MOCK_GROUPS: MockGroup[] = [
  { GroupID: 1, SystemID: 1, Title: 'Super Admin', TitleRes: 'مدير النظام', IsActive: true },
  { GroupID: 2, SystemID: 1, Title: 'Finance Manager', TitleRes: 'مدير المالية', IsActive: true },
  { GroupID: 3, SystemID: 1, Title: 'Operations', TitleRes: 'العمليات', IsActive: true },
  { GroupID: 4, SystemID: 1, Title: 'Support', TitleRes: 'الدعم', IsActive: false },
  { GroupID: 5, SystemID: 2, Title: 'Finance Admin', TitleRes: 'مدير مالي', IsActive: true },
  { GroupID: 6, SystemID: 2, Title: 'Finance Viewer', TitleRes: 'مشاهد مالي', IsActive: true },
  { GroupID: 7, SystemID: 3, Title: 'Ops Manager', TitleRes: 'مدير عمليات', IsActive: true },
];

const MOCK_PRIVILEGE_TEMPLATES: MockPrivilegePage[] = [
  { PageID: 1, PageTitle: 'Dashboard', ParentTitle: 'Main', actions: [{ key: 'view', label: 'View', checked: false }] },
  { PageID: 2, PageTitle: 'Agents List', ParentTitle: 'Agents', actions: [{ key: 'view', label: 'View', checked: false }, { key: 'create', label: 'Create', checked: false }, { key: 'edit', label: 'Edit', checked: false }, { key: 'delete', label: 'Delete', checked: false }] },
  { PageID: 3, PageTitle: 'Agent Requests', ParentTitle: 'Agents', actions: [{ key: 'view', label: 'View', checked: false }, { key: 'approve', label: 'Approve', checked: false }, { key: 'reject', label: 'Reject', checked: false }] },
  { PageID: 4, PageTitle: 'Hotel Providers', ParentTitle: 'Hotels', actions: [{ key: 'view', label: 'View', checked: false }, { key: 'create', label: 'Create', checked: false }, { key: 'edit', label: 'Edit', checked: false }] },
  { PageID: 5, PageTitle: 'Hotel Subscriptions', ParentTitle: 'Hotels', actions: [{ key: 'view', label: 'View', checked: false }, { key: 'create', label: 'Create', checked: false }, { key: 'edit', label: 'Edit', checked: false }, { key: 'delete', label: 'Delete', checked: false }] },
  { PageID: 6, PageTitle: 'Packages', ParentTitle: 'Products', actions: [{ key: 'view', label: 'View', checked: false }, { key: 'create', label: 'Create', checked: false }, { key: 'edit', label: 'Edit', checked: false }] },
  { PageID: 7, PageTitle: 'System Admins', ParentTitle: 'Users', actions: [{ key: 'view', label: 'View', checked: false }, { key: 'create', label: 'Create', checked: false }, { key: 'edit', label: 'Edit', checked: false }, { key: 'delete', label: 'Delete', checked: false }] },
  { PageID: 8, PageTitle: 'Reports', ParentTitle: 'Finance', actions: [{ key: 'view', label: 'View', checked: false }, { key: 'export', label: 'Export', checked: false }] },
];

const MOCK_ALL_ADMIN_USERS: MockGroupUser[] = [
  { UserID: 1, FirstName: 'Ahmed', LastName: 'Al-Rashid', UserName: 'ahmed.alrashid', Email: 'ahmed@sero.travel', PhoneNumber: '+966501234567', IsAssigned: false },
  { UserID: 2, FirstName: 'Sara', LastName: 'Hassan', UserName: 'sara.hassan', Email: 'sara@sero.travel', PhoneNumber: '+966502345678', IsAssigned: false },
  { UserID: 3, FirstName: 'Khalid', LastName: 'Al-Mutairi', UserName: 'khalid.mutairi', Email: 'khalid@sero.travel', PhoneNumber: '+966503456789', IsAssigned: false },
  { UserID: 4, FirstName: 'Fatima', LastName: 'Al-Zahra', UserName: 'fatima.zahra', Email: 'fatima@sero.travel', PhoneNumber: '+966504567890', IsAssigned: false },
  { UserID: 5, FirstName: 'Omar', LastName: 'Bin-Saud', UserName: 'omar.binsaud', Email: 'omar@sero.travel', PhoneNumber: '+966505678901', IsAssigned: false },
  { UserID: 6, FirstName: 'Noura', LastName: 'Al-Sabah', UserName: 'noura.sabah', Email: 'noura@sero.travel', PhoneNumber: '+966506789012', IsAssigned: false },
];

// Simulate group-to-user assignments (GroupID → UserID[])
let GROUP_USER_ASSIGNMENTS: Record<number, number[]> = {
  1: [1, 5],
  2: [2],
  3: [3, 6],
  4: [],
  5: [1],
  6: [2, 3],
  7: [4],
};

// Simulate group privileges (GroupID → Record<pageId, Record<action, checked>>)
let GROUP_PRIVILEGES: Record<number, Record<number, Record<string, boolean>>> = {};

function getGroupPrivileges(groupId: number): MockPrivilegePage[] {
  const stored = GROUP_PRIVILEGES[groupId] ?? {};
  return MOCK_PRIVILEGE_TEMPLATES.map(page => ({
    ...page,
    actions: page.actions.map(action => ({
      ...action,
      checked: stored[page.PageID]?.[action.key] ?? false,
    })),
  }));
}

function setGroupPrivilege(groupId: number, pageId: number, actionKey: string, checked: boolean) {
  if (!GROUP_PRIVILEGES[groupId]) GROUP_PRIVILEGES[groupId] = {};
  if (!GROUP_PRIVILEGES[groupId][pageId]) GROUP_PRIVILEGES[groupId][pageId] = {};
  GROUP_PRIVILEGES[groupId][pageId][actionKey] = checked;
}

function groupPrivilegeSections(pages: MockPrivilegePage[]): MockPrivilegeSection[] {
  const map = new Map<string, MockPrivilegePage[]>();
  for (const page of pages) {
    if (!map.has(page.ParentTitle)) map.set(page.ParentTitle, []);
    map.get(page.ParentTitle)!.push(page);
  }
  return Array.from(map.entries()).map(([parentTitle, pages]) => ({ parentTitle, pages }));
}

// ─── Add/Edit Group Dialog ────────────────────────────────────────────────────

@Component({
  selector: 'group-form-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, TranslateModule],
  template: `
<div class="relative">
  <div class="flex items-center gap-3 p-5 border-b border-gray-100">
    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center">
      <i class="fas fa-users-cog text-lg"></i>
    </div>
    <div class="flex-1">
      <h2 class="text-xl font-bold">{{ (isEdit ? 'Edit Group' : 'Add Group') | translate }}</h2>
      <p class="text-sm text-gray-500">{{ (isEdit ? 'Update group details' : 'Create a new system group') | translate }}</p>
    </div>
    <button (click)="onClose()" class="text-gray-400 hover:text-gray-500 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>

  <form [formGroup]="form" (ngSubmit)="submit()">
    <div class="p-5 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          <i class="fas fa-globe text-primary-500 me-1"></i>
          {{ 'System' | translate }}
        </label>
        <select formControlName="systemID" class="w-full p-3 h-14 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 bg-white">
          <option value="">{{ 'Select System' | translate }}</option>
          @for (s of systems; track s.SystemID) {
            <option [value]="s.SystemID">{{ s.SystemTitle }}</option>
          }
        </select>
        @if (form.get('systemID')?.invalid && form.get('systemID')?.touched) {
          <div class="text-red-500 text-xs mt-1">{{ 'System is required' | translate }}</div>
        }
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          <i class="fas fa-tag text-primary-500 me-1"></i>
          {{ 'Title (English)' | translate }}
        </label>
        <input type="text" formControlName="title" maxlength="100"
          class="w-full p-3 h-14 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400"
          [placeholder]="'Enter group title in English' | translate">
        @if (form.get('title')?.invalid && form.get('title')?.touched) {
          <div class="text-red-500 text-xs mt-1">{{ 'Title is required' | translate }}</div>
        }
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          <i class="fas fa-tag text-primary-500 me-1"></i>
          {{ 'Title (Arabic)' | translate }}
        </label>
        <input type="text" formControlName="titleRes" maxlength="100" dir="rtl"
          class="w-full p-3 h-14 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400"
          [placeholder]="'Enter group title in Arabic' | translate">
        @if (form.get('titleRes')?.invalid && form.get('titleRes')?.touched) {
          <div class="text-red-500 text-xs mt-1">{{ 'Arabic title is required' | translate }}</div>
        }
      </div>
    </div>

    <hr class="border-gray-100">
    <div class="flex justify-end gap-3 p-5">
      <button type="button" (click)="onClose()"
        class="cursor-pointer px-5 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1">
        <i class="fas fa-times"></i>
        <span>{{ 'Cancel' | translate }}</span>
      </button>
      @if (isSubmitting()) {
        <button type="button" disabled class="px-5 py-2.5 bg-primary-400 text-white rounded-lg opacity-80 flex items-center gap-1">
          <span class="mr-2">{{ 'Submitting...' | translate }}</span>
          <i class="fas fa-spinner fa-spin"></i>
        </button>
      } @else if (form.invalid) {
        <button type="button" disabled class="px-5 py-2.5 bg-gray-200 text-gray-500 rounded-lg opacity-80 flex items-center gap-1 cursor-not-allowed">
          <span class="mr-2">{{ (isEdit ? 'Update Group' : 'Add Group') | translate }}</span>
          <i class="fas fa-ban"></i>
        </button>
      } @else {
        <button type="submit"
          class="cursor-pointer px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-all flex items-center gap-1 shadow-lg hover:shadow-xl">
          <span class="mr-2">{{ (isEdit ? 'Update Group' : 'Add Group') | translate }}</span>
          <i class="fas fa-save"></i>
        </button>
      }
    </div>
  </form>
</div>
  `,
})
export class GroupFormDialogComponent {
  readonly dialogRef = inject(MatDialogRef<GroupFormDialogComponent>);
  readonly data = inject<{ group?: MockGroup; systemID?: number; action: 'Add' | 'Edit' }>(MAT_DIALOG_DATA);
  readonly isSubmitting = signal(false);
  readonly systems = MOCK_SYSTEMS;
  get isEdit() { return this.data.action === 'Edit'; }

  form = new FormGroup({
    systemID: new FormControl<number | null>(null, [Validators.required]),
    title: new FormControl('', [Validators.required, Validators.maxLength(100)]),
    titleRes: new FormControl('', [Validators.required, Validators.maxLength(100)]),
  });

  ngOnInit() {
    if (this.data.group) {
      this.form.patchValue({
        systemID: this.data.group.SystemID,
        title: this.data.group.Title,
        titleRes: this.data.group.TitleRes,
      });
    } else if (this.data.systemID) {
      this.form.patchValue({ systemID: this.data.systemID });
    }
  }

  submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.isSubmitting.set(true);
    const v = this.form.value;
    of(null).pipe(delay(500)).subscribe(() => {
      if (this.isEdit && this.data.group) {
        MOCK_GROUPS = MOCK_GROUPS.map(g => g.GroupID === this.data.group!.GroupID ? {
          ...g,
          SystemID: v.systemID ?? g.SystemID,
          Title: v.title ?? g.Title,
          TitleRes: v.titleRes ?? g.TitleRes,
        } : g);
      } else {
        const newGroup: MockGroup = {
          GroupID: Math.max(...MOCK_GROUPS.map(g => g.GroupID), 0) + 1,
          SystemID: v.systemID ?? 1,
          Title: v.title ?? '',
          TitleRes: v.titleRes ?? '',
          IsActive: true,
        };
        MOCK_GROUPS = [...MOCK_GROUPS, newGroup];
        GROUP_USER_ASSIGNMENTS[newGroup.GroupID] = [];
      }
      this.isSubmitting.set(false);
      this.dialogRef.close(true);
    });
  }

  onClose() { this.dialogRef.close(); }
}

// ─── Confirm Delete Group Dialog ──────────────────────────────────────────────

@Component({
  selector: 'confirm-delete-group-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatDialogModule, TranslateModule],
  template: `
<div class="p-6">
  <div class="flex items-center gap-3 mb-4">
    <div class="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
      <i class="fas fa-trash text-red-500"></i>
    </div>
    <h2 class="text-xl font-bold text-gray-800">{{ 'Delete Group' | translate }}</h2>
  </div>
  <p class="text-gray-600 mb-6">
    {{ 'Are you sure you want to delete the group' | translate }}
    <span class="font-semibold text-gray-800">{{ data.Title }}</span>?
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
export class ConfirmDeleteGroupDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ConfirmDeleteGroupDialogComponent>);
  readonly data = inject<MockGroup>(MAT_DIALOG_DATA);

  onCancel() { this.dialogRef.close(false); }
  onConfirm() { this.dialogRef.close(true); }
}

// ─── User Group Assignment Dialog ────────────────────────────────────────────

@Component({
  selector: 'manage-user-groups-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatDialogModule, MatCheckboxModule, MatTabsModule, MatProgressSpinnerModule, TranslateModule],
  template: `
<div class="relative">
  <div class="flex items-center gap-3 p-5 border-b border-gray-100">
    <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center">
      <i class="fas fa-users-cog text-lg"></i>
    </div>
    <div class="flex-1">
      <h2 class="text-xl font-bold">{{ 'Manage Groups' | translate }}</h2>
      <p class="text-sm text-gray-500">{{ data.userName }} — {{ 'Assign user to system groups' | translate }}</p>
    </div>
    <button (click)="close()" class="text-gray-400 hover:text-gray-500 transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>

  <div class="max-h-[65vh] overflow-y-auto p-5 custom-scroll">
    @if (isLoading()) {
      <div class="flex items-center justify-center py-8">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
    } @else {
      @for (section of sections(); track section.systemId) {
        <div class="mb-4">
          <h3 class="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
            <i class="fas fa-desktop text-primary-500 text-xs"></i>
            {{ section.systemTitle }}
            <span class="text-xs text-primary-600 font-normal">({{ getAssignedCount(section.groups) }}/{{ section.groups.length }} {{ 'assigned' | translate }})</span>
          </h3>
          <div class="space-y-2 ms-4">
            @for (group of section.groups; track group.GroupID) {
              <div class="flex items-center gap-2 p-2 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                @if (pendingGroupIds().has(group.GroupID)) {
                  <mat-spinner diameter="16"></mat-spinner>
                } @else {
                  <mat-checkbox
                    [checked]="isAssigned(group.GroupID)"
                    (change)="onGroupToggle(group.GroupID, $event.checked)"
                    color="primary">
                  </mat-checkbox>
                }
                <div>
                  <p class="text-sm font-medium text-gray-800">{{ group.Title }}</p>
                  <p class="text-xs text-gray-500">{{ group.TitleRes }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      }
    }
  </div>

  <div class="flex justify-end p-5 border-t border-gray-100">
    <button type="button" (click)="close()"
      class="px-5 py-3 text-sm font-medium rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-all shadow-sm">
      <i class="fas fa-check me-2"></i>
      {{ 'Done' | translate }}
    </button>
  </div>
</div>
  `,
})
export class ManageUserGroupsDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ManageUserGroupsDialogComponent>);
  readonly data = inject<{ userId: number; userName: string }>(MAT_DIALOG_DATA);
  readonly isLoading = signal(false);
  readonly pendingGroupIds = signal<Set<number>>(new Set());
  readonly assignedGroupIds = signal<Set<number>>(new Set());
  readonly changed = signal(false);

  readonly sections = computed(() => {
    return MOCK_SYSTEMS.map(sys => ({
      systemId: sys.SystemID,
      systemTitle: sys.SystemTitle,
      groups: MOCK_GROUPS.filter(g => g.SystemID === sys.SystemID),
    })).filter(s => s.groups.length > 0);
  });

  ngOnInit() {
    const assigned = GROUP_USER_ASSIGNMENTS[this.data.userId] ?? [];
    // Build assigned set: groups where userId is in the group's assignment
    const assignedGroupIds = new Set<number>();
    for (const [groupId, userIds] of Object.entries(GROUP_USER_ASSIGNMENTS)) {
      if (userIds.includes(this.data.userId)) {
        assignedGroupIds.add(Number(groupId));
      }
    }
    this.assignedGroupIds.set(assignedGroupIds);
  }

  isAssigned(groupId: number): boolean {
    return this.assignedGroupIds().has(groupId);
  }

  getAssignedCount(groups: MockGroup[]): number {
    return groups.filter(g => this.isAssigned(g.GroupID)).length;
  }

  onGroupToggle(groupId: number, checked: boolean) {
    this.pendingGroupIds.update(set => { const next = new Set(set); next.add(groupId); return next; });

    of(null).pipe(delay(300)).subscribe(() => {
      const current = GROUP_USER_ASSIGNMENTS[groupId] ?? [];
      if (checked) {
        GROUP_USER_ASSIGNMENTS[groupId] = [...current, this.data.userId];
      } else {
        GROUP_USER_ASSIGNMENTS[groupId] = current.filter(id => id !== this.data.userId);
      }

      const next = new Set(this.assignedGroupIds());
      if (checked) next.add(groupId); else next.delete(groupId);
      this.assignedGroupIds.set(next);
      this.changed.set(true);
      this.pendingGroupIds.update(set => { const next = new Set(set); next.delete(groupId); return next; });
    });
  }

  close() { this.dialogRef.close({ changed: this.changed() }); }
}

// ─── User Groups Page Component ───────────────────────────────────────────────

@Component({
  selector: 'user-groups-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MatTabsModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatSlideToggleModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,
  ],
  template: `
<div class="p-6">
  <!-- Page Header -->
  <div class="mb-6">
    <h1 class="text-2xl font-bold text-gray-800">{{ 'User Groups' | translate }}</h1>
    <p class="text-sm text-gray-500 mt-1">{{ 'Manage system groups, privileges, and user assignments' | translate }}</p>
  </div>

  <!-- System + Group Selectors -->
  <div class="bg-white rounded-lg border border-gray-200 p-4 mb-4">
    <div class="flex flex-wrap items-center gap-4">
      <!-- System Selector -->
      <div class="flex-1 min-w-[200px]">
        <label class="block text-xs font-semibold text-gray-500 mb-1">{{ 'System' | translate }}</label>
        <select class="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 bg-white text-sm"
          [ngModel]="selectedSystemId()" (ngModelChange)="onSystemChange($event)">
          <option [value]="null">{{ 'Select System' | translate }}</option>
          @for (s of systems; track s.SystemID) {
            <option [value]="s.SystemID">{{ s.SystemTitle }}</option>
          }
        </select>
      </div>

      <!-- Group Selector -->
      @if (selectedSystemId()) {
        <div class="flex-1 min-w-[200px]">
          <label class="block text-xs font-semibold text-gray-500 mb-1">{{ 'Group' | translate }}</label>
          <select class="w-full p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-400 bg-white text-sm"
            [ngModel]="selectedGroupId()" (ngModelChange)="onGroupChange($event)">
            <option [value]="null">{{ 'Select Group' | translate }}</option>
            @for (g of filteredGroups(); track g.GroupID) {
              <option [value]="g.GroupID">{{ g.Title }} ({{ g.TitleRes }})</option>
            }
          </select>
        </div>
      }

      <!-- Group Controls -->
      @if (selectedGroup()) {
        <div class="flex items-center gap-2 flex-wrap">
          <mat-slide-toggle color="primary" [checked]="selectedGroup()!.IsActive" (change)="onToggleActive($event.checked)">
            {{ selectedGroup()!.IsActive ? ('Active' | translate) : ('Inactive' | translate) }}
          </mat-slide-toggle>
          <button mat-stroked-button (click)="openEditGroup()" class="h-9 text-sm">
            <i class="fas fa-edit me-1"></i>{{ 'Edit' | translate }}
          </button>
          <button mat-stroked-button color="warn" (click)="openDeleteGroup()" class="h-9 text-sm">
            <i class="fas fa-trash me-1"></i>{{ 'Delete' | translate }}
          </button>
        </div>
      }

      <!-- Add Group Button -->
      @if (selectedSystemId()) {
        <div>
          <button mat-raised-button color="primary" class="h-9" (click)="openAddGroup()">
            <i class="fas fa-plus me-1"></i>{{ 'Add Group' | translate }}
          </button>
        </div>
      }
    </div>
  </div>

  <!-- Tabs: Privileges + Users -->
  @if (selectedGroupId()) {
    <mat-tab-group dynamicHeight>
      <!-- Tab 1: Privileges -->
      <mat-tab [label]="'Privileges' | translate">
        <div class="py-4">
          <div class="flex gap-2 mb-4">
            <button mat-stroked-button class="h-9 text-sm" (click)="selectAllPrivileges()">
              <i class="fas fa-check-double me-1"></i>{{ 'Select All' | translate }}
            </button>
            <button mat-stroked-button class="h-9 text-sm" (click)="unselectAllPrivileges()">
              <i class="fas fa-times me-1"></i>{{ 'Unselect All' | translate }}
            </button>
          </div>

          @if (isLoadingPrivileges()) {
            <div class="flex justify-center py-8">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          } @else {
            <mat-accordion multi>
              @for (section of privilegeSections(); track section.parentTitle) {
                <mat-expansion-panel [expanded]="true">
                  <mat-expansion-panel-header>
                    <mat-panel-title class="flex items-center gap-2">
                      <mat-checkbox
                        color="primary"
                        [checked]="isSectionAllChecked(section)"
                        [indeterminate]="isSectionPartiallyChecked(section)"
                        (change)="onSectionToggle(section, $event.checked)"
                        (click)="$event.stopPropagation()">
                      </mat-checkbox>
                      <span class="font-semibold text-gray-700">{{ section.parentTitle }}</span>
                    </mat-panel-title>
                  </mat-expansion-panel-header>

                  <div class="space-y-2">
                    @for (page of section.pages; track page.PageID) {
                      <div class="p-3 bg-gray-50 rounded-lg">
                        <p class="text-sm font-medium text-gray-800 mb-2">{{ page.PageTitle }}</p>
                        <div class="flex flex-wrap gap-4">
                          @for (action of page.actions; track action.key) {
                            <mat-checkbox
                              color="primary"
                              [checked]="action.checked"
                              (change)="onPrivilegeChange(page.PageID, action.key, $event.checked)">
                              {{ action.label | translate }}
                            </mat-checkbox>
                          }
                        </div>
                      </div>
                    }
                  </div>
                </mat-expansion-panel>
              }
            </mat-accordion>
          }
        </div>
      </mat-tab>

      <!-- Tab 2: Users -->
      <mat-tab [label]="'Users' | translate">
        <div class="py-4">
          @if (isLoadingUsers()) {
            <div class="flex justify-center py-8">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          } @else {
            <table mat-table [dataSource]="groupUsersDisplay()" class="mat-elevation-z2 w-full">

              <!-- Assigned Column -->
              <ng-container matColumnDef="Assigned">
                <th mat-header-cell *matHeaderCellDef>{{ 'Assigned' | translate }}</th>
                <td mat-cell *matCellDef="let element">
                  <mat-slide-toggle color="primary"
                    [checked]="element.IsAssigned"
                    (change)="onUserAssignmentToggle(element, $event.checked)">
                  </mat-slide-toggle>
                </td>
              </ng-container>

              <!-- Name Column -->
              <ng-container matColumnDef="Name">
                <th mat-header-cell *matHeaderCellDef>{{ 'Name' | translate }}</th>
                <td mat-cell *matCellDef="let element">
                  <div class="flex items-center gap-2">
                    <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-xs font-semibold">
                      {{ element.FirstName.charAt(0) }}{{ element.LastName.charAt(0) }}
                    </div>
                    <span class="font-medium">{{ element.FirstName }} {{ element.LastName }}</span>
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

              <!-- Action Column -->
              <ng-container matColumnDef="action">
                <th mat-header-cell *matHeaderCellDef>{{ 'Action' | translate }}</th>
                <td mat-cell *matCellDef="let element">
                  <button mat-icon-button (click)="openManageUserGroups(element)" [attr.aria-label]="'Manage Groups' | translate"
                    class="text-primary-500">
                    <i class="fas fa-users-cog fa-xs"></i>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="userColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: userColumns;"
                [class.bg-primary-50]="row.IsAssigned"></tr>
            </table>
          }
        </div>
      </mat-tab>
    </mat-tab-group>
  } @else if (selectedSystemId()) {
    <div class="flex justify-center items-center h-48 border-2 border-dashed border-gray-200 rounded-lg">
      <p class="text-gray-500 text-sm">{{ 'Select a group to manage privileges and users' | translate }}</p>
    </div>
  } @else {
    <div class="flex justify-center items-center h-48 border-2 border-dashed border-gray-200 rounded-lg">
      <p class="text-gray-500 text-sm">{{ 'Select a system to get started' | translate }}</p>
    </div>
  }
</div>
  `,
})
export class UserGroupsPageComponent {
  private readonly dialog = inject(MatDialog);

  readonly systems = MOCK_SYSTEMS;
  userColumns = ['Assigned', 'Name', 'Username', 'Email', 'Mobile', 'action'];

  readonly selectedSystemId = signal<number | null>(null);
  readonly selectedGroupId = signal<number | null>(null);
  readonly isLoadingPrivileges = signal(false);
  readonly isLoadingUsers = signal(false);

  readonly privilegePages = signal<MockPrivilegePage[]>([]);

  readonly filteredGroups = computed(() => {
    const sysId = this.selectedSystemId();
    if (!sysId) return [];
    return MOCK_GROUPS.filter(g => g.SystemID === sysId);
  });

  readonly selectedGroup = computed(() => {
    const id = this.selectedGroupId();
    if (!id) return null;
    return MOCK_GROUPS.find(g => g.GroupID === id) ?? null;
  });

  readonly privilegeSections = computed(() => groupPrivilegeSections(this.privilegePages()));

  readonly groupUsersDisplay = computed(() => {
    const groupId = this.selectedGroupId();
    if (!groupId) return [];
    const assignedIds = new Set(GROUP_USER_ASSIGNMENTS[groupId] ?? []);
    return MOCK_ALL_ADMIN_USERS
      .map(u => ({ ...u, IsAssigned: assignedIds.has(u.UserID) }))
      .sort((a, b) => (b.IsAssigned ? 1 : 0) - (a.IsAssigned ? 1 : 0));
  });

  onSystemChange(sysId: number | null) {
    this.selectedSystemId.set(sysId ? Number(sysId) : null);
    this.selectedGroupId.set(null);
    this.privilegePages.set([]);
  }

  onGroupChange(groupId: number | null) {
    this.selectedGroupId.set(groupId ? Number(groupId) : null);
    if (groupId) this.loadGroupPrivileges(Number(groupId));
  }

  private loadGroupPrivileges(groupId: number) {
    this.isLoadingPrivileges.set(true);
    of(getGroupPrivileges(groupId)).pipe(delay(300)).subscribe(pages => {
      this.privilegePages.set(pages);
      this.isLoadingPrivileges.set(false);
    });
  }

  onPrivilegeChange(pageId: number, actionKey: string, checked: boolean) {
    const groupId = this.selectedGroupId();
    if (!groupId) return;
    setGroupPrivilege(groupId, pageId, actionKey, checked);
    this.privilegePages.update(pages => pages.map(p =>
      p.PageID === pageId ? {
        ...p,
        actions: p.actions.map(a => a.key === actionKey ? { ...a, checked } : a),
      } : p
    ));
  }

  isSectionAllChecked(section: MockPrivilegeSection): boolean {
    return section.pages.every(p => p.actions.every(a => a.checked));
  }

  isSectionPartiallyChecked(section: MockPrivilegeSection): boolean {
    const allChecked = this.isSectionAllChecked(section);
    const noneChecked = section.pages.every(p => p.actions.every(a => !a.checked));
    return !allChecked && !noneChecked;
  }

  onSectionToggle(section: MockPrivilegeSection, checked: boolean) {
    const groupId = this.selectedGroupId();
    if (!groupId) return;
    for (const page of section.pages) {
      for (const action of page.actions) {
        setGroupPrivilege(groupId, page.PageID, action.key, checked);
      }
    }
    this.privilegePages.update(pages => pages.map(p =>
      section.pages.some(sp => sp.PageID === p.PageID) ? {
        ...p,
        actions: p.actions.map(a => ({ ...a, checked })),
      } : p
    ));
  }

  selectAllPrivileges() {
    const groupId = this.selectedGroupId();
    if (!groupId) return;
    for (const page of this.privilegePages()) {
      for (const action of page.actions) {
        setGroupPrivilege(groupId, page.PageID, action.key, true);
      }
    }
    this.privilegePages.update(pages => pages.map(p => ({
      ...p,
      actions: p.actions.map(a => ({ ...a, checked: true })),
    })));
  }

  unselectAllPrivileges() {
    const groupId = this.selectedGroupId();
    if (!groupId) return;
    for (const page of this.privilegePages()) {
      for (const action of page.actions) {
        setGroupPrivilege(groupId, page.PageID, action.key, false);
      }
    }
    this.privilegePages.update(pages => pages.map(p => ({
      ...p,
      actions: p.actions.map(a => ({ ...a, checked: false })),
    })));
  }

  onToggleActive(checked: boolean) {
    const groupId = this.selectedGroupId();
    if (!groupId) return;
    MOCK_GROUPS = MOCK_GROUPS.map(g => g.GroupID === groupId ? { ...g, IsActive: checked } : g);
  }

  onUserAssignmentToggle(user: MockGroupUser & { IsAssigned: boolean }, checked: boolean) {
    const groupId = this.selectedGroupId();
    if (!groupId) return;
    const current = GROUP_USER_ASSIGNMENTS[groupId] ?? [];
    if (checked) {
      GROUP_USER_ASSIGNMENTS[groupId] = [...current, user.UserID];
    } else {
      GROUP_USER_ASSIGNMENTS[groupId] = current.filter(id => id !== user.UserID);
    }
    // Trigger recompute
    const id = this.selectedGroupId();
    this.selectedGroupId.set(null);
    this.selectedGroupId.set(id);
  }

  openAddGroup() {
    const ref = this.dialog.open(GroupFormDialogComponent, {
      width: '600px',
      disableClose: true,
      data: { action: 'Add', systemID: this.selectedSystemId() },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        const sysId = this.selectedSystemId();
        this.selectedSystemId.set(null);
        this.selectedSystemId.set(sysId);
      }
    });
  }

  openEditGroup() {
    const group = this.selectedGroup();
    if (!group) return;
    const ref = this.dialog.open(GroupFormDialogComponent, {
      width: '600px',
      disableClose: true,
      data: { action: 'Edit', group },
    });
    ref.afterClosed().subscribe(result => {
      if (result) {
        const sysId = this.selectedSystemId();
        this.selectedSystemId.set(null);
        this.selectedSystemId.set(sysId);
      }
    });
  }

  openDeleteGroup() {
    const group = this.selectedGroup();
    if (!group) return;
    const ref = this.dialog.open(ConfirmDeleteGroupDialogComponent, {
      width: '500px',
      data: group,
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        MOCK_GROUPS = MOCK_GROUPS.filter(g => g.GroupID !== group.GroupID);
        this.selectedGroupId.set(null);
        this.privilegePages.set([]);
        const sysId = this.selectedSystemId();
        this.selectedSystemId.set(null);
        this.selectedSystemId.set(sysId);
      }
    });
  }

  openManageUserGroups(user: MockGroupUser) {
    this.dialog.open(ManageUserGroupsDialogComponent, {
      width: '700px',
      data: { userId: user.UserID, userName: user.UserName },
    });
  }
}
