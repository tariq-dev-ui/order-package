import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

interface HotelItem {
  id: number;
  districtKey: string;
  districtLabel: string;
  categoryKey: string;
  categoryLabel: string;
  roomTypeKey: string;
  roomTypeLabel: string;
  roomCount: number;
  nightCount: number;
}

const DISTRICTS_MAKKAH = [
  { key: 'DIST_AL_HARAM',    value: 'al-haram' },
  { key: 'DIST_AL_AZIZIYAH', value: 'al-aziziyah' },
  { key: 'DIST_AJYAD',       value: 'ajyad' },
  { key: 'DIST_AL_NASEEM',   value: 'al-naseem' },
];

const DISTRICTS_MADINA = [
  { key: 'DIST_CENTRAL', value: 'central' },
  { key: 'DIST_QUBA',    value: 'quba' },
  { key: 'DIST_AL_NASEEM', value: 'al-naseem' },
];

const CATEGORIES = [
  { key: 'CAT_3_STARS', value: '3-stars' },
  { key: 'CAT_4_STARS', value: '4-stars' },
  { key: 'CAT_5_STARS', value: '5-stars' },
];

const ROOM_TYPES = [
  { key: 'RT_SINGLE', value: 'single' },
  { key: 'RT_DOUBLE', value: 'double' },
  { key: 'RT_TRIPLE', value: 'triple' },
  { key: 'RT_FAMILY', value: 'family' },
];

@Component({
  selector: 'app-my-services-hotel-create-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <section class="hs-page" dir="ltr">

      <!-- Page header -->
      <header class="hs-head">
        <button type="button" class="icon-btn" [attr.aria-label]="'MY_SERVICES.HOTEL.BACK' | translate" (click)="back()">
          <span class="material-icons-round">arrow_back</span>
        </button>

        <div class="hero-icon">
          <span class="material-icons-round">hotel</span>
        </div>

        <div class="head-copy">
          <p class="kicker">{{ 'MY_SERVICES.HOTEL.HOTEL_OPTIONS' | translate }}</p>
          <h1>{{ (isMakkah() ? 'MY_SERVICES.HOTEL.TITLE_MAKKAH' : 'MY_SERVICES.HOTEL.TITLE_MADINA') | translate }}</h1>
          <p>{{ 'MY_SERVICES.HOTEL.SUBTITLE' | translate }}</p>
        </div>
      </header>

      <!-- Toast -->
      @if (toast()) {
        <div class="toast" role="status">
          <span class="material-icons-round">check_circle</span>
          <span>{{ toast() | translate }}</span>
        </div>
      }

      <!-- ── Single Container Card ── -->
      <div class="hs-card">

        <!-- ── Hotel Options Section ── -->
        <div class="section-header">
          <div class="section-icon">
            <span class="material-icons-round">hotel</span>
          </div>
          <div>
            <h2 class="section-title">{{ 'MY_SERVICES.HOTEL.HOTEL_OPTIONS' | translate }}</h2>
          </div>
        </div>

        <!-- 3-column selects row -->
        <div class="form-row">
          <!-- District -->
          <div class="field">
            <span class="field-label">
              <span class="material-icons-round">location_city</span>
              {{ 'MY_SERVICES.HOTEL.DISTRICT' | translate }}
            </span>
            <select class="field-input" [ngModel]="selectedDistrict()" (ngModelChange)="selectedDistrict.set($event)">
              <option value="">{{ 'MY_SERVICES.HOTEL.SELECT_DISTRICT' | translate }}</option>
              @for (opt of districts(); track opt.value) {
                <option [value]="opt.value">{{ ('MY_SERVICES.HOTEL.' + opt.key) | translate }}</option>
              }
            </select>
          </div>

          <!-- Category -->
          <div class="field">
            <span class="field-label">
              <span class="material-icons-round">star</span>
              {{ 'MY_SERVICES.HOTEL.CATEGORY' | translate }}
            </span>
            <select class="field-input" [ngModel]="selectedCategory()" (ngModelChange)="selectedCategory.set($event)">
              <option value="">{{ 'MY_SERVICES.HOTEL.SELECT_CATEGORY' | translate }}</option>
              @for (opt of categories; track opt.value) {
                <option [value]="opt.value">{{ ('MY_SERVICES.HOTEL.' + opt.key) | translate }}</option>
              }
            </select>
          </div>

          <!-- Room Type -->
          <div class="field">
            <span class="field-label">
              <span class="material-icons-round">bed</span>
              {{ 'MY_SERVICES.HOTEL.ROOM_TYPE' | translate }}
            </span>
            <select class="field-input" [ngModel]="selectedRoomType()" (ngModelChange)="selectedRoomType.set($event)">
              <option value="">{{ 'MY_SERVICES.HOTEL.SELECT_ROOM_TYPE' | translate }}</option>
              @for (opt of roomTypes; track opt.value) {
                <option [value]="opt.value">{{ ('MY_SERVICES.HOTEL.' + opt.key) | translate }}</option>
              }
            </select>
          </div>
        </div>

        <!-- Counters row -->
        <div class="counters-row">
          <!-- Room Count -->
          <div class="field">
            <span class="field-label">
              <span class="material-icons-round">meeting_room</span>
              {{ 'MY_SERVICES.HOTEL.ROOMS' | translate }}
            </span>
            <div class="counter">
              <button type="button" class="counter-btn" (click)="updateRooms(-1)">
                <span class="material-icons-round">remove</span>
              </button>
              <strong class="counter-val">{{ roomCount() }}</strong>
              <span class="counter-label">
                {{ (roomCount() === 1 ? 'MY_SERVICES.HOTEL.ROOM_LABEL' : 'MY_SERVICES.HOTEL.ROOMS_LABEL') | translate }}
              </span>
              <button type="button" class="counter-btn" (click)="updateRooms(1)">
                <span class="material-icons-round">add</span>
              </button>
            </div>
          </div>

          <!-- Night Count -->
          <div class="field">
            <span class="field-label">
              <span class="material-icons-round">nights_stay</span>
              {{ 'MY_SERVICES.HOTEL.NIGHTS' | translate }}
            </span>
            <div class="counter">
              <button type="button" class="counter-btn" (click)="updateNights(-1)">
                <span class="material-icons-round">remove</span>
              </button>
              <strong class="counter-val">{{ nightCount() }}</strong>
              <span class="counter-label">
                {{ (nightCount() === 1 ? 'MY_SERVICES.HOTEL.NIGHT_LABEL' : 'MY_SERVICES.HOTEL.NIGHTS_LABEL') | translate }}
              </span>
              <button type="button" class="counter-btn" (click)="updateNights(1)">
                <span class="material-icons-round">add</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Hint + Add button -->
        <div class="add-row">
          @if (!isFormReady()) {
            <p class="hint-text">
              <span class="material-icons-round">info</span>
              {{ 'MY_SERVICES.HOTEL.HINT_FILL' | translate }}
            </p>
          }
          <button
            type="button"
            class="add-btn"
            [disabled]="!isFormReady()"
            (click)="addOrUpdateItem()">
            <span class="material-icons-round">{{ editingId() !== null ? 'check' : 'add' }}</span>
            <span>{{ (editingId() !== null ? 'MY_SERVICES.HOTEL.UPDATE' : 'MY_SERVICES.HOTEL.ADD_NEW') | translate }}</span>
          </button>
        </div>

        <!-- ── Added Items Table ── -->
        <div class="divider"></div>

        <div class="table-section">
          <h3 class="table-heading">{{ 'MY_SERVICES.HOTEL.ADDED_ITEMS' | translate }}</h3>

          @if (addedItems().length === 0) {
            <div class="empty-state">
              <span class="material-icons-round">hotel</span>
              <span>{{ 'MY_SERVICES.HOTEL.NO_ITEMS' | translate }}</span>
            </div>
          } @else {
            <div class="table-wrap">
              <table class="items-table">
                <thead>
                  <tr>
                    <th>{{ 'MY_SERVICES.HOTEL.COL_DISTRICT' | translate }}</th>
                    <th>{{ 'MY_SERVICES.HOTEL.COL_CATEGORY' | translate }}</th>
                    <th>{{ 'MY_SERVICES.HOTEL.COL_ROOM_TYPE' | translate }}</th>
                    <th class="col-center">{{ 'MY_SERVICES.HOTEL.COL_ROOMS' | translate }}</th>
                    <th class="col-center">{{ 'MY_SERVICES.HOTEL.COL_NIGHTS' | translate }}</th>
                    <th class="col-center">{{ 'MY_SERVICES.HOTEL.COL_ACTIONS' | translate }}</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of addedItems(); track item.id) {
                    <tr [class.row-editing]="editingId() === item.id">
                      <td>
                        <span class="district-cell">
                          <span class="material-icons-round">location_city</span>
                          {{ ('MY_SERVICES.HOTEL.' + item.districtLabel) | translate }}
                        </span>
                      </td>
                      <td>
                        <span class="category-badge">
                          <span class="material-icons-round">star</span>
                          {{ ('MY_SERVICES.HOTEL.' + item.categoryLabel) | translate }}
                        </span>
                      </td>
                      <td>
                        <span class="roomtype-badge">
                          <span class="material-icons-round">bed</span>
                          {{ ('MY_SERVICES.HOTEL.' + item.roomTypeLabel) | translate }}
                        </span>
                      </td>
                      <td class="col-center">
                        <span class="count-pill">{{ item.roomCount }}</span>
                      </td>
                      <td class="col-center">
                        <span class="count-pill">{{ item.nightCount }}</span>
                      </td>
                      <td class="col-center">
                        <div class="action-btns">
                          <button type="button" class="row-btn row-btn--edit" (click)="editItem(item)" [attr.aria-label]="'common.buttons.edit' | translate">
                            <span class="material-icons-round">edit</span>
                          </button>
                          <button type="button" class="row-btn row-btn--del" (click)="removeItem(item.id)" [attr.aria-label]="'common.buttons.delete' | translate">
                            <span class="material-icons-round">delete_outline</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        </div>

      </div>
    </section>
  `,
  styles: [`
    :host { display: block; }

    .hs-page {
      min-height: calc(100vh - var(--sero-topbar-height, 64px));
      padding: var(--sp-6, 24px);
      background: var(--sero-app-bg, #f4f5f7);
      color: var(--sero-text-primary, #111827);
      display: flex; flex-direction: column; gap: 20px;
    }

    /* ── Header ── */
    .hs-head {
      display: flex; align-items: center; gap: 16px;
    }

    .icon-btn {
      width: 42px; height: 42px; flex-shrink: 0;
      border: 1px solid var(--sero-border-light, #e5e7eb);
      border-radius: 10px;
      background: var(--sero-card-bg, #fff);
      color: var(--sero-text-primary, #111827);
      display: inline-flex; align-items: center; justify-content: center;
      cursor: pointer;
      box-shadow: 0 1px 2px rgba(0,0,0,.05);
      transition: border-color .15s, color .15s, background .15s;
    }
    .icon-btn:hover {
      border-color: var(--sero-primary, #3a472a);
      color: var(--sero-primary, #3a472a);
      background: color-mix(in srgb, var(--sero-primary, #3a472a) 6%, #fff);
    }

    .hero-icon {
      width: 48px; height: 48px; flex-shrink: 0;
      border-radius: 50%;
      display: inline-flex; align-items: center; justify-content: center;
      color: #fff;
      background: linear-gradient(135deg, var(--sero-primary-light, #6d7f5c), var(--sero-primary, #3a472a));
      box-shadow: 0 2px 8px rgba(58,71,42,.3);
    }
    .hero-icon .material-icons-round { font-size: 26px; }

    .kicker {
      margin: 0 0 4px;
      color: var(--sero-primary, #3a472a);
      font-size: .76rem; font-weight: 800;
      text-transform: uppercase; letter-spacing: .04em;
    }

    h1 {
      margin: 0;
      color: var(--sero-text-primary, #111827);
      font-size: 1.45rem; font-weight: 800; line-height: 1.3;
    }

    .head-copy p:last-child {
      margin: 4px 0 0;
      color: var(--sero-text-secondary, #6b7280);
      font-size: .88rem;
    }

    /* ── Toast ── */
    .toast {
      display: flex; align-items: center; gap: 8px;
      padding: 11px 16px;
      border: 1px solid var(--sero-success-border, #a3d9a5);
      border-radius: 10px;
      background: var(--sero-success-bg, #f0fdf4);
      color: var(--sero-success, #166534);
      font-size: .84rem; font-weight: 700;
    }
    .toast .material-icons-round { font-size: 20px; }

    /* ── Card ── */
    .hs-card {
      padding: 28px;
      border: 1px solid var(--sero-border-light, #e5e7eb);
      border-radius: 16px;
      background: var(--sero-card-bg, #fff);
      box-shadow: 0 1px 4px rgba(0,0,0,.06);
      display: flex; flex-direction: column; gap: 22px;
    }

    /* ── Section header ── */
    .section-header {
      display: flex; align-items: center; gap: 14px;
    }

    .section-icon {
      width: 44px; height: 44px; flex-shrink: 0;
      border-radius: 12px;
      display: inline-flex; align-items: center; justify-content: center;
      background: color-mix(in srgb, var(--sero-primary, #3a472a) 10%, #fff);
      color: var(--sero-primary, #3a472a);
    }
    .section-icon--blue { background: #eff6ff; color: #1d4ed8; }
    .section-icon .material-icons-round { font-size: 22px; }

    .section-title {
      margin: 0; font-size: 1.05rem; font-weight: 800;
      color: var(--sero-text-primary, #111827);
    }
    .section-sub {
      margin: 3px 0 0; font-size: .82rem;
      color: var(--sero-text-secondary, #6b7280);
    }

    /* ── Divider ── */
    .divider { height: 1px; background: var(--sero-border-light, #e5e7eb); }

    /* ── 3-column selects ── */
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 18px;
    }

    /* ── 2-column counters ── */
    .counters-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 18px;
    }

    /* ── Details grid ── */
    .details-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 18px;
    }

    /* ── Field ── */
    .field { display: flex; flex-direction: column; gap: 8px; min-width: 0; }

    .field-label {
      display: inline-flex; align-items: center; gap: 6px;
      font-size: .82rem; font-weight: 700;
      color: var(--sero-text-secondary, #6b7280);
    }
    .field-label .material-icons-round { font-size: 17px; color: var(--sero-primary, #3a472a); }

    .field-input {
      width: 100%; height: 46px;
      border: 1px solid var(--sero-border-light, #e5e7eb);
      border-radius: 10px;
      background: var(--sero-card-bg, #fff);
      color: var(--sero-text-primary, #111827);
      font: inherit; font-weight: 600; font-size: .88rem;
      outline: none; padding: 0 12px;
      transition: border-color .15s, box-shadow .15s;
      appearance: auto;
    }
    .field-input:focus {
      border-color: var(--sero-primary, #3a472a);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--sero-primary, #3a472a) 16%, transparent);
    }

    .field-textarea {
      width: 100%;
      border: 1px solid var(--sero-border-light, #e5e7eb);
      border-radius: 10px;
      background: var(--sero-card-bg, #fff);
      color: var(--sero-text-primary, #111827);
      font: inherit; font-size: .88rem; font-weight: 600;
      outline: none; padding: 10px 12px; resize: vertical; min-height: 80px;
      transition: border-color .15s, box-shadow .15s;
    }
    .field-textarea:focus {
      border-color: var(--sero-primary, #3a472a);
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--sero-primary, #3a472a) 16%, transparent);
    }

    /* ── Counter ── */
    .counter {
      display: grid;
      grid-template-columns: 46px auto 1fr 46px;
      align-items: center;
      height: 46px;
      border: 1px solid var(--sero-border-light, #e5e7eb);
      border-radius: 10px;
      background: var(--sero-surface-2, #f9fafb);
      overflow: hidden;
    }
    .counter-btn {
      width: 46px; height: 46px; border: 0; border-radius: 0;
      background: var(--sero-card-bg, #fff);
      color: var(--sero-text-secondary, #6b7280);
      display: inline-flex; align-items: center; justify-content: center;
      cursor: pointer; font-size: 18px;
      transition: color .15s, background .15s;
    }
    .counter-btn:hover {
      color: var(--sero-primary, #3a472a);
      background: color-mix(in srgb, var(--sero-primary, #3a472a) 8%, #fff);
    }
    .counter-val {
      padding-inline: 10px;
      color: var(--sero-primary, #3a472a);
      font-size: 1rem; font-weight: 800;
    }
    .counter-label {
      color: var(--sero-text-secondary, #6b7280);
      font-size: .82rem; font-weight: 600;
    }

    /* ── Add button row ── */
    .add-row {
      display: flex; align-items: center; gap: 14px;
    }

    .hint-text {
      flex: 1;
      display: flex; align-items: center; gap: 6px;
      margin: 0;
      color: var(--sero-warning, #b45309);
      font-size: .82rem; font-weight: 600; line-height: 1.55;
    }
    .hint-text .material-icons-round { font-size: 17px; flex-shrink: 0; }

    .add-btn {
      display: inline-flex; align-items: center; gap: 7px;
      min-height: 42px; padding: 0 22px;
      border-radius: 10px; border: 1px solid transparent;
      font: inherit; font-size: .88rem; font-weight: 800;
      cursor: pointer;
      background: var(--sero-primary, #3a472a); color: #fff;
      box-shadow: 0 2px 6px rgba(58,71,42,.3);
      transition: background .15s, transform .15s, box-shadow .15s;
      white-space: nowrap;
      margin-inline-start: auto;
    }
    .add-btn:hover:not(:disabled) { background: #4d6038; transform: translateY(-1px); }
    .add-btn:disabled {
      cursor: not-allowed;
      background: var(--sero-surface-4, #e5e7eb);
      color: var(--sero-text-muted, #9ca3af);
      box-shadow: none;
    }

    /* ── Table ── */
    .table-section { display: flex; flex-direction: column; gap: 12px; }

    .table-heading {
      margin: 0; font-size: .9rem; font-weight: 800;
      color: var(--sero-text-primary, #111827);
    }

    .empty-state {
      display: flex; align-items: center; gap: 10px;
      padding: 18px 16px;
      border: 1px dashed var(--sero-border-light, #e5e7eb);
      border-radius: 10px;
      background: var(--sero-surface-2, #f9fafb);
      color: var(--sero-text-secondary, #6b7280);
      font-size: .84rem; font-weight: 600;
    }
    .empty-state .material-icons-round { font-size: 20px; }

    .table-wrap {
      overflow-x: auto;
      border: 1px solid var(--sero-border-light, #e5e7eb);
      border-radius: 10px;
    }

    .items-table { width: 100%; border-collapse: collapse; font-size: .86rem; }

    .items-table thead th {
      padding: 10px 14px; text-align: start;
      font-size: .76rem; font-weight: 700; text-transform: uppercase; letter-spacing: .03em;
      color: var(--sero-text-secondary, #6b7280);
      background: var(--sero-surface-2, #f9fafb);
      border-bottom: 1px solid var(--sero-border-light, #e5e7eb);
    }

    .items-table tbody tr {
      border-bottom: 1px solid var(--sero-border-light, #e5e7eb);
      transition: background .12s;
    }
    .items-table tbody tr:last-child { border-bottom: 0; }
    .items-table tbody tr:hover { background: var(--sero-surface-2, #f9fafb); }
    .items-table tbody tr.row-editing {
      background: color-mix(in srgb, var(--sero-primary, #3a472a) 6%, #fff);
    }

    .items-table td {
      padding: 11px 14px;
      color: var(--sero-text-primary, #111827);
      font-weight: 600;
    }

    .col-center { text-align: center; }

    .district-cell, .category-badge, .roomtype-badge {
      display: inline-flex; align-items: center; gap: 6px;
    }
    .district-cell .material-icons-round { font-size: 17px; color: var(--sero-primary, #3a472a); }
    .category-badge .material-icons-round { font-size: 17px; color: #f59e0b; }
    .roomtype-badge .material-icons-round { font-size: 17px; color: var(--sero-text-secondary, #6b7280); }

    .count-pill {
      display: inline-flex; align-items: center; justify-content: center;
      min-width: 32px; height: 26px; padding: 0 10px;
      border-radius: 999px;
      background: color-mix(in srgb, var(--sero-primary, #3a472a) 10%, #fff);
      color: var(--sero-primary, #3a472a);
      font-weight: 800; font-size: .84rem;
    }

    .action-btns {
      display: inline-flex; align-items: center; gap: 6px; justify-content: center;
    }

    .row-btn {
      width: 32px; height: 32px; border-radius: 8px; border: 1px solid transparent;
      display: inline-flex; align-items: center; justify-content: center;
      cursor: pointer; transition: background .12s, border-color .12s, color .12s;
    }
    .row-btn .material-icons-round { font-size: 17px; }

    .row-btn--edit {
      background: var(--sero-surface-2, #f9fafb);
      color: var(--sero-text-secondary, #6b7280);
      border-color: var(--sero-border-light, #e5e7eb);
    }
    .row-btn--edit:hover { background: #eff6ff; border-color: #bfdbfe; color: #1d4ed8; }

    .row-btn--del {
      background: var(--sero-surface-2, #f9fafb);
      color: var(--sero-text-secondary, #6b7280);
      border-color: var(--sero-border-light, #e5e7eb);
    }
    .row-btn--del:hover { background: #fef2f2; border-color: #fecaca; color: #b91c1c; }

    /* ── Visa toggle ── */
    .visa-toggle-field { justify-content: flex-start; }
    .toggle-wrap { display: inline-flex; align-items: center; gap: 10px; cursor: pointer; }
    .toggle-input { display: none; }
    .toggle-track {
      position: relative; width: 44px; height: 24px; border-radius: 999px;
      background: #d1d5db; transition: background .2s;
    }
    .toggle-input:checked + .toggle-track { background: var(--sero-primary, #3a472a); }
    .toggle-thumb {
      position: absolute; top: 3px; left: 3px;
      width: 18px; height: 18px; border-radius: 50%;
      background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.2);
      transition: left .2s;
    }
    .toggle-input:checked + .toggle-track .toggle-thumb { left: 23px; }
    .toggle-text { font-size: .84rem; font-weight: 700; color: var(--sero-text-primary, #111827); }

    /* ── Submit row ── */
    .submit-row {
      display: flex; align-items: center; gap: 14px;
      border-top: 1px solid var(--sero-border-light, #e5e7eb);
      padding-top: 20px;
    }

    .submit-btn {
      margin-inline-start: auto;
      display: inline-flex; align-items: center; gap: 7px;
      min-height: 46px; padding: 0 28px;
      border-radius: 10px; border: 1px solid transparent;
      font: inherit; font-size: .92rem; font-weight: 800;
      cursor: pointer;
      background: var(--sero-primary, #3a472a); color: #fff;
      box-shadow: 0 2px 8px rgba(58,71,42,.3);
      transition: background .15s, transform .15s, box-shadow .15s;
    }
    .submit-btn:hover:not(:disabled) {
      background: #4d6038; transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(58,71,42,.35);
    }
    .submit-btn:disabled {
      cursor: not-allowed;
      background: var(--sero-surface-4, #e5e7eb);
      color: var(--sero-text-muted, #9ca3af);
      box-shadow: none;
    }

    /* ── Responsive ── */
    @media (max-width: 900px) {
      .form-row { grid-template-columns: 1fr 1fr; }
      .counters-row { grid-template-columns: 1fr 1fr; }
      .details-grid { grid-template-columns: 1fr 1fr; }
    }

    @media (max-width: 600px) {
      .hs-page { padding: 16px; gap: 14px; }
      .form-row, .counters-row, .details-grid { grid-template-columns: 1fr; }
      h1 { font-size: 1.18rem; }
    }
  `],
})
export class HotelServiceCreatePageComponent {
  private readonly route  = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly categories = CATEGORIES;
  readonly roomTypes  = ROOM_TYPES;

  readonly isMakkah = computed(() => this.route.snapshot.data['cityId'] !== 2);
  readonly districts = computed(() => this.isMakkah() ? DISTRICTS_MAKKAH : DISTRICTS_MADINA);

  selectedDistrict = signal('');
  selectedCategory = signal('');
  selectedRoomType = signal('');
  roomCount  = signal(1);
  nightCount = signal(1);

  addedItems = signal<HotelItem[]>([]);
  editingId  = signal<number | null>(null);
  toast      = signal('');

  readonly isFormReady = computed(() =>
    !!this.selectedDistrict() &&
    !!this.selectedCategory() &&
    !!this.selectedRoomType() &&
    this.roomCount() > 0 &&
    this.nightCount() > 0
  );

  updateRooms(delta: number): void  { this.roomCount.update(v => Math.max(1, v + delta)); }
  updateNights(delta: number): void { this.nightCount.update(v => Math.max(1, v + delta)); }

  addOrUpdateItem(): void {
    if (!this.isFormReady()) return;

    const distEntry = this.districts().find(d => d.value === this.selectedDistrict());
    const catEntry  = CATEGORIES.find(c => c.value === this.selectedCategory());
    const rtEntry   = ROOM_TYPES.find(r => r.value === this.selectedRoomType());

    const distLabel = distEntry?.key ?? '';
    const catLabel  = catEntry?.key ?? '';
    const rtLabel   = rtEntry?.key ?? '';

    if (this.editingId() !== null) {
      this.addedItems.update(items =>
        items.map(item =>
          item.id === this.editingId()
            ? {
                ...item,
                districtKey: distEntry?.key ?? '', districtLabel: distLabel,
                categoryKey: catEntry?.key ?? '', categoryLabel: catLabel,
                roomTypeKey: rtEntry?.key ?? '', roomTypeLabel: rtLabel,
                roomCount: this.roomCount(), nightCount: this.nightCount(),
              }
            : item
        )
      );
      this.editingId.set(null);
      this.showToast('MY_SERVICES.HOTEL.TOAST_UPDATED');
    } else {
      this.addedItems.update(items => [
        ...items,
        {
          id: Date.now(),
          districtKey: distEntry?.key ?? '', districtLabel: distLabel,
          categoryKey: catEntry?.key ?? '', categoryLabel: catLabel,
          roomTypeKey: rtEntry?.key ?? '', roomTypeLabel: rtLabel,
          roomCount: this.roomCount(), nightCount: this.nightCount(),
        },
      ]);
      this.showToast('MY_SERVICES.HOTEL.TOAST_ADDED');
    }

    this.selectedDistrict.set('');
    this.selectedCategory.set('');
    this.selectedRoomType.set('');
    this.roomCount.set(1);
    this.nightCount.set(1);
  }

  editItem(item: HotelItem): void {
    this.selectedDistrict.set(this.districts().find(d => d.key === item.districtKey)?.value ?? '');
    this.selectedCategory.set(CATEGORIES.find(c => c.key === item.categoryKey)?.value ?? '');
    this.selectedRoomType.set(ROOM_TYPES.find(r => r.key === item.roomTypeKey)?.value ?? '');
    this.roomCount.set(item.roomCount);
    this.nightCount.set(item.nightCount);
    this.editingId.set(item.id);
  }

  removeItem(id: number): void {
    this.addedItems.update(items => items.filter(i => i.id !== id));
    if (this.editingId() === id) {
      this.editingId.set(null);
      this.selectedDistrict.set('');
      this.selectedCategory.set('');
      this.selectedRoomType.set('');
      this.roomCount.set(1);
      this.nightCount.set(1);
    }
  }

  back(): void {
    this.router.navigate(['/master/my-services']);
  }

  private showToast(key: string): void {
    this.toast.set(key);
    setTimeout(() => this.toast.set(''), 3500);
  }
}
