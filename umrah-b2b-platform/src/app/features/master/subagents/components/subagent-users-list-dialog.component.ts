import {
  ChangeDetectionStrategy, Component, inject, OnInit, signal, computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule, MatDialog } from '@angular/material/dialog';
import { AgentModel, UserAccountViewModel } from '../subagents.model';
import { SubagentsService } from '../subagents.service';
import { SubagentUserFormDialogComponent } from './subagent-user-form-dialog.component';
import { SubagentUserDetailsDialogComponent } from './subagent-user-details-dialog.component';

@Component({
  selector: 'subagent-users-list-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatDialogModule],
  template: `
    <div class="suld-wrap">

      <!-- Header -->
      <div class="suld-header">
        <div class="suld-header-content">
          <div class="suld-header-icon"><span class="material-icons-round">group</span></div>
          <div>
            <h2 class="suld-header-title">Manage Users</h2>
            <p class="suld-header-sub">{{ subagent.AgentName }}</p>
          </div>
        </div>
        <div class="suld-header-actions">
          <button class="suld-add-btn" (click)="openAddForm()">
            <span class="material-icons-round">add</span>
            Add User
          </button>
          <button class="suld-close" (click)="dialogRef.close()">
            <span class="material-icons-round">close</span>
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="suld-content">

        @if (isLoading()) {
          <div class="suld-loading">
            <div class="suld-spinner"></div>
            <span>Loading users...</span>
          </div>
        }

        @if (!isLoading() && users().length === 0) {
          <div class="suld-empty">
            <div class="suld-empty-icon"><span class="material-icons-round">group</span></div>
            <h3>No users yet</h3>
            <p>No user accounts have been created for this subagent.</p>
            <button class="suld-empty-add" (click)="openAddForm()">
              <span class="material-icons-round">add</span>
              Add First User
            </button>
          </div>
        }

        @if (!isLoading() && users().length > 0) {
          <table class="suld-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Username</th>
                <th>Email</th>
                <th>Mobile</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (user of users(); track user.UserID) {
                <tr>
                  <td>
                    <div class="suld-user-cell">
                      <div class="suld-avatar">
                        {{ (user.FirstName?.[0] ?? user.UserName?.[0] ?? '?').toUpperCase() }}
                      </div>
                      <span class="suld-user-name">
                        {{ user.FirstName }} {{ user.LastName }}
                        @if (!user.FirstName && !user.LastName) { <span class="suld-dash">—</span> }
                      </span>
                    </div>
                  </td>
                  <td class="suld-secondary">{{ user.UserName }}</td>
                  <td class="suld-secondary">{{ user.Email || '—' }}</td>
                  <td class="suld-secondary">{{ user.PhoneNumber || '—' }}</td>
                  <td>
                    <span class="suld-status" [class.active]="user.IsActive" [class.inactive]="!user.IsActive">
                      <span class="suld-status-dot"></span>
                      {{ user.IsActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td>
                    <div class="suld-actions">
                      <button class="suld-action-btn" title="View details" (click)="openDetails(user)">
                        <span class="material-icons-round">visibility</span>
                      </button>
                      <button class="suld-action-btn" title="Edit user" (click)="openEditForm(user)">
                        <span class="material-icons-round">edit</span>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        }

      </div>

      <!-- Footer -->
      <div class="suld-footer">
        <p class="suld-footer-count">
          @if (users().length > 0) {
            {{ users().length }} user{{ users().length !== 1 ? 's' : '' }} found
          }
        </p>
      </div>

    </div>
  `,
  styles: [`
    .suld-wrap { background: #f4f6f2; display: flex; flex-direction: column; max-height: 85vh; }

    .suld-header {
      padding: 20px 24px; border-bottom: 1px solid #d8decf;
      background: linear-gradient(to right, #3a472a, #4a5a38, #3a472a);
      display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-shrink: 0;
    }
    .suld-header-content { display: flex; align-items: flex-start; gap: 14px; }
    .suld-header-icon {
      width: 40px; height: 40px; background: rgba(255,255,255,.1); color: #fff;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .suld-header-icon .material-icons-round { font-size: 20px; }
    .suld-header-title { font-size: 20px; font-weight: 700; color: #fff; margin: 0; }
    .suld-header-sub   { font-size: 13px; color: rgba(255,255,255,.75); margin: 3px 0 0; }
    .suld-header-actions { display: flex; align-items: center; gap: 8px; }
    .suld-add-btn {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 8px 16px; background: rgba(255,255,255,.15); border: none;
      color: #fff; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s;
    }
    .suld-add-btn:hover { background: rgba(255,255,255,.25); }
    .suld-add-btn .material-icons-round { font-size: 14px; }
    .suld-close {
      background: rgba(255,255,255,.15); border: none; border-radius: 6px;
      padding: 6px; cursor: pointer; color: rgba(255,255,255,.8); display: flex; align-items: center;
    }
    .suld-close:hover { background: rgba(255,255,255,.25); }
    .suld-close .material-icons-round { font-size: 18px; }

    .suld-content { flex: 1; overflow-y: auto; background: #f4f6f2; }

    .suld-loading {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 12px; padding: 60px 16px; color: #74806a; font-size: 13px;
    }
    .suld-spinner {
      width: 36px; height: 36px; border: 4px solid #d8decf; border-top-color: #3a472a;
      border-radius: 50%; animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .suld-empty {
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      text-align: center; padding: 60px 24px;
    }
    .suld-empty-icon {
      width: 64px; height: 64px; background: #e8ecdf;
      display: flex; align-items: center; justify-content: center; margin-bottom: 16px;
    }
    .suld-empty-icon .material-icons-round { font-size: 28px; color: #74806a; }
    .suld-empty h3 { font-size: 14px; font-weight: 600; color: #242e1a; margin: 0 0 4px; }
    .suld-empty p  { font-size: 12px; color: #74806a; margin: 0 0 20px; max-width: 280px; }
    .suld-empty-add {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 9px 18px; background: #242e1a; color: #fff; border: none;
      font-size: 13px; font-weight: 500; cursor: pointer; transition: background 0.15s;
    }
    .suld-empty-add:hover { background: #3a472a; }
    .suld-empty-add .material-icons-round { font-size: 14px; }

    .suld-table { width: 100%; border-collapse: collapse; }
    .suld-table thead tr { border-bottom: 1px solid #d8decf; background: #f9f7f1; }
    .suld-table th {
      text-align: left; padding: 12px 24px;
      font-size: 11px; font-weight: 700; color: #74806a;
      text-transform: uppercase; letter-spacing: .5px;
    }
    .suld-table td { padding: 12px 24px; border-bottom: 1px solid #e8ecdf; }
    .suld-table tbody tr:last-child td { border-bottom: none; }
    .suld-table tbody tr:hover td { background: #f9f7f1; }

    .suld-user-cell { display: flex; align-items: center; gap: 10px; }
    .suld-avatar {
      width: 36px; height: 36px; background: #3a472a; color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 13px; font-weight: 700; flex-shrink: 0;
    }
    .suld-user-name { font-size: 13px; font-weight: 600; color: #242e1a; }
    .suld-dash { color: #74806a; font-weight: 400; }
    .suld-secondary { font-size: 13px; color: #74806a; }

    .suld-status {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 3px 10px; border: 1px solid; font-size: 11px; font-weight: 600;
    }
    .suld-status.active   { border-color: #86efac; color: #166534; background: #f0fdf4; }
    .suld-status.inactive { border-color: #fca5a5; color: #991b1b; background: #fef2f2; }
    .suld-status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

    .suld-actions { display: flex; align-items: center; gap: 4px; justify-content: flex-end; }
    .suld-action-btn {
      width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;
      background: none; border: none; cursor: pointer;
      color: #74806a; transition: all 0.15s;
    }
    .suld-action-btn:hover { color: #3a472a; background: #e8ecdf; }
    .suld-action-btn .material-icons-round { font-size: 14px; }

    .suld-footer {
      padding: 10px 24px; border-top: 1px solid #d8decf;
      background: #f9f7f1; flex-shrink: 0;
    }
    .suld-footer-count { font-size: 12px; color: #74806a; margin: 0; }
  `],
})
export class SubagentUsersListDialogComponent implements OnInit {
  private readonly service = inject(SubagentsService);
  private readonly matDialog = inject(MatDialog);
  readonly dialogRef = inject(MatDialogRef<SubagentUsersListDialogComponent>);
  readonly data: { agent: AgentModel } = inject(MAT_DIALOG_DATA);

  get subagent(): AgentModel { return this.data.agent; }

  isLoading = signal(false);
  allUsers = signal<UserAccountViewModel[]>([]);
  users = computed(() => this.allUsers());

  ngOnInit() { this.loadUsers(); }

  loadUsers() {
    this.isLoading.set(true);
    this.service.getSubAgentUsersList(this.subagent.AgentID).subscribe({
      next: (list) => { this.allUsers.set(list ?? []); this.isLoading.set(false); },
      error: ()     => { this.allUsers.set([]);         this.isLoading.set(false); },
    });
  }

  openAddForm() {
    this.matDialog.open(SubagentUserFormDialogComponent, {
      width: '700px', maxWidth: '95vw', disableClose: true,
      data: { agent: this.subagent },
    }).afterClosed().subscribe((saved) => { if (saved) this.loadUsers(); });
  }

  openEditForm(user: UserAccountViewModel) {
    this.matDialog.open(SubagentUserFormDialogComponent, {
      width: '700px', maxWidth: '95vw', disableClose: true,
      data: { agent: this.subagent, user },
    }).afterClosed().subscribe((saved) => { if (saved) this.loadUsers(); });
  }

  openDetails(user: UserAccountViewModel) {
    this.matDialog.open(SubagentUserDetailsDialogComponent, {
      width: '600px', maxWidth: '95vw',
      data: { user, agent: this.subagent },
    });
  }
}
