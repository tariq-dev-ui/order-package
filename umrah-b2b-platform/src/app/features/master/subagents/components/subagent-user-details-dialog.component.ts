import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { AgentModel, UserAccountViewModel } from '../subagents.model';

@Component({
  selector: 'subagent-user-details-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatDialogModule],
  template: `
    <div class="sud-wrap">

      <!-- Header -->
      <div class="sud-header">
        <div class="sud-header-content">
          <div class="sud-header-icon"><span class="material-icons-round">badge</span></div>
          <div>
            <h2 class="sud-header-title">User Details</h2>
            <p class="sud-header-sub">{{ agent.AgentName }}</p>
          </div>
        </div>
        <button class="sud-close" (click)="dialogRef.close()">
          <span class="material-icons-round">close</span>
        </button>
      </div>

      <!-- Content -->
      <div class="sud-body">

        <!-- Profile Card -->
        <div class="sud-profile-card">
          <div class="sud-avatar">{{ initials }}</div>
          <div class="sud-profile-info">
            <p class="sud-full-name">{{ fullName }}</p>
            <p class="sud-username">{{ user.UserName }}</p>
            <span class="sud-status-badge" [class.active]="user.IsActive" [class.inactive]="!user.IsActive">
              <span class="sud-status-dot"></span>
              {{ user.IsActive ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>

        <!-- Contact -->
        <div class="sud-section">
          <p class="sud-section-title">Contact</p>
          <div class="sud-info-list">
            <div class="sud-info-row">
              <div class="sud-info-icon"><span class="material-icons-round">email</span></div>
              <div>
                <p class="sud-info-label">Email</p>
                <p class="sud-info-value">{{ user.Email || '—' }}</p>
              </div>
            </div>
            <div class="sud-info-row">
              <div class="sud-info-icon"><span class="material-icons-round">phone</span></div>
              <div>
                <p class="sud-info-label">Mobile</p>
                <p class="sud-info-value">{{ user.PhoneNumber || '—' }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Account -->
        <div class="sud-section">
          <p class="sud-section-title">Account</p>
          <div class="sud-grid-2">
            <div class="sud-meta-card">
              <p class="sud-meta-label">Added Date</p>
              <p class="sud-meta-value">{{ user.AddedDate ? (user.AddedDate | date:'mediumDate') : '—' }}</p>
            </div>
            <div class="sud-meta-card">
              <p class="sud-meta-label">Last Updated</p>
              <p class="sud-meta-value">{{ user.LastUpdatedDate ? (user.LastUpdatedDate | date:'mediumDate') : '—' }}</p>
            </div>
            <div class="sud-meta-card">
              <p class="sud-meta-label">Added By</p>
              <p class="sud-meta-value">{{ user.AddedBy || '—' }}</p>
            </div>
            <div class="sud-meta-card">
              <p class="sud-meta-label">User ID</p>
              <p class="sud-meta-value">{{ user.UserID ?? '—' }}</p>
            </div>
          </div>
        </div>

      </div>

      <!-- Footer -->
      <div class="sud-footer">
        <button class="sud-btn-close" (click)="dialogRef.close()">Close</button>
      </div>

    </div>
  `,
  styles: [`
    .sud-wrap { background: #f4f6f2; display: flex; flex-direction: column; max-height: 85vh; }

    .sud-header {
      padding: 20px 24px; border-bottom: 1px solid #d8decf;
      background: linear-gradient(to right, #3a472a, #4a5a38, #3a472a);
      display: flex; align-items: flex-start; justify-content: space-between; gap: 16px; flex-shrink: 0;
    }
    .sud-header-content { display: flex; align-items: flex-start; gap: 14px; }
    .sud-header-icon {
      width: 40px; height: 40px; background: rgba(255,255,255,.1); color: #fff;
      display: flex; align-items: center; justify-content: center;
    }
    .sud-header-icon .material-icons-round { font-size: 20px; }
    .sud-header-title { font-size: 18px; font-weight: 700; color: #fff; margin: 0; }
    .sud-header-sub   { font-size: 12px; color: rgba(255,255,255,.7); margin: 3px 0 0; }
    .sud-close {
      background: rgba(255,255,255,.15); border: none; border-radius: 6px;
      padding: 6px; cursor: pointer; color: rgba(255,255,255,.8); display: flex; align-items: center;
    }
    .sud-close:hover { background: rgba(255,255,255,.25); }
    .sud-close .material-icons-round { font-size: 18px; }

    .sud-body { flex: 1; overflow-y: auto; padding: 20px 24px; display: flex; flex-direction: column; gap: 18px; }

    .sud-profile-card {
      display: flex; align-items: center; gap: 16px;
      padding: 16px; background: #f9f7f1; border: 1px solid #d8decf;
    }
    .sud-avatar {
      width: 56px; height: 56px; background: #3a472a; color: #fff;
      display: flex; align-items: center; justify-content: center;
      font-size: 20px; font-weight: 700; text-transform: uppercase; flex-shrink: 0;
    }
    .sud-profile-info { flex: 1; min-width: 0; }
    .sud-full-name { font-size: 16px; font-weight: 700; color: #242e1a; margin: 0; }
    .sud-username  { font-size: 13px; color: #74806a; margin: 2px 0 6px; }
    .sud-status-badge {
      display: inline-flex; align-items: center; gap: 5px;
      padding: 3px 10px; border: 1px solid; font-size: 11px; font-weight: 600;
    }
    .sud-status-badge.active   { border-color: #86efac; color: #166534; background: #f0fdf4; }
    .sud-status-badge.inactive { border-color: #fca5a5; color: #991b1b; background: #fef2f2; }
    .sud-status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

    .sud-section { }
    .sud-section-title { font-size: 11px; font-weight: 700; color: #74806a; text-transform: uppercase; letter-spacing: .5px; margin: 0 0 10px; }
    .sud-info-list { display: flex; flex-direction: column; gap: 8px; }
    .sud-info-row {
      display: flex; align-items: flex-start; gap: 12px;
      padding: 10px 12px; background: #f9f7f1; border: 1px solid #d8decf;
    }
    .sud-info-icon {
      width: 32px; height: 32px; background: #e8ecdf;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .sud-info-icon .material-icons-round { font-size: 14px; color: #74806a; }
    .sud-info-label { font-size: 11px; color: #74806a; margin: 0 0 2px; }
    .sud-info-value { font-size: 13px; color: #242e1a; font-weight: 500; margin: 0; }

    .sud-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .sud-meta-card { padding: 10px 12px; background: #f9f7f1; border: 1px solid #d8decf; }
    .sud-meta-label { font-size: 11px; color: #74806a; margin: 0 0 2px; }
    .sud-meta-value { font-size: 13px; color: #242e1a; font-weight: 500; margin: 0; }

    .sud-footer {
      display: flex; justify-content: flex-end; padding: 14px 24px;
      border-top: 1px solid #d8decf; background: #f9f7f1; flex-shrink: 0;
    }
    .sud-btn-close {
      padding: 9px 20px; font-size: 13px; font-weight: 500;
      border: 1px solid #d8decf; background: #fff; color: #242e1a;
      cursor: pointer; transition: background 0.15s;
    }
    .sud-btn-close:hover { background: #f4f6f2; }
  `],
})
export class SubagentUserDetailsDialogComponent {
  readonly dialogRef = inject(MatDialogRef<SubagentUserDetailsDialogComponent>);
  readonly data: { user: UserAccountViewModel; agent: AgentModel } = inject(MAT_DIALOG_DATA);

  get user(): UserAccountViewModel { return this.data.user; }
  get agent(): AgentModel { return this.data.agent; }

  get fullName(): string {
    const parts = [this.user.FirstName, this.user.LastName].filter(Boolean);
    return parts.length ? parts.join(' ') : '—';
  }

  get initials(): string {
    const f = this.user.FirstName?.[0] ?? '';
    const l = this.user.LastName?.[0] ?? '';
    return (f + l).toUpperCase() || this.user.UserName?.[0]?.toUpperCase() || '?';
  }
}
