import { Component, ElementRef, HostListener, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TablerIconComponent } from 'angular-tabler-icons';
import { filter, Subject, takeUntil } from 'rxjs';
import { Agent } from '../../../core/models/agent.model';
import { AgentService } from '../../../core/services/agent.service';
import { LanguageService, SupportedLang } from '../../../core/services/language.service';
import { LayoutService } from '../../../core/services/layout.service';

type NavbarMenu = 'language' | 'notifications' | 'profile' | null;
type ThemeMode = 'light' | 'dark';

interface LanguageOption {
  code: SupportedLang;
  flag: string;
  label: string;
}

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, TranslateModule, TablerIconComponent],
  template: `
    <header class="sero-topbar" role="banner">
      <button
        class="rms-icon-btn rms-icon-btn--sidebar"
        type="button"
        (click)="layout.toggle()"
        [attr.aria-label]="'topbar.toggleSidebar' | translate"
        [attr.aria-pressed]="layout.sidebarCollapsed()"
      >
        <tabler-icon name="menu-2" class="icon-20"></tabler-icon>
      </button>

      <div class="topbar-title">
        {{ currentTitleKey | translate }}
      </div>

      <div class="topbar-actions" aria-label="Navbar actions">
        <div class="navbar-menu">
          <button
            class="rms-icon-btn language-trigger"
            type="button"
            (click)="toggleMenu('language', $event)"
            [class.is-open]="activeMenu === 'language'"
            [attr.aria-expanded]="activeMenu === 'language'"
            aria-haspopup="menu"
            aria-label="Choose language"
            title="Language"
          >
            <img class="language-current-flag" [src]="currentLanguageFlag()" alt="" aria-hidden="true" />
          </button>

          @if (activeMenu === 'language') {
            <div class="dropdown-panel language-panel" role="menu" aria-label="Language menu">
              @for (lang of languages; track lang.code) {
                <button
                  type="button"
                  class="language-option"
                  role="menuitemradio"
                  [class.active]="langService.currentLang() === lang.code"
                  [attr.aria-checked]="langService.currentLang() === lang.code"
                  (click)="selectLanguage(lang.code, $event)"
                >
                  <img class="language-flag" [src]="lang.flag" alt="" aria-hidden="true" />
                  <span class="language-label">{{ lang.label }}</span>
                  @if (langService.currentLang() === lang.code) {
                    <tabler-icon name="check" class="language-check"></tabler-icon>
                  }
                </button>
              }
            </div>
          }
        </div>

        <button
          class="rms-icon-btn theme-trigger"
          type="button"
          (click)="toggleTheme($event)"
          [attr.aria-label]="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
          [attr.title]="theme === 'dark' ? 'Light mode' : 'Dark mode'"
        >
          <tabler-icon [name]="theme === 'dark' ? 'sun-high' : 'moon'" class="icon-20"></tabler-icon>
        </button>

        <div class="navbar-menu">
          <button
            class="profile-trigger"
            type="button"
            (click)="toggleMenu('profile', $event)"
            [class.is-open]="activeMenu === 'profile'"
            [attr.aria-label]="'topbar.profile' | translate"
            [attr.aria-expanded]="activeMenu === 'profile'"
            [attr.title]="displayName()"
            aria-haspopup="menu"
          >
            <span class="profile-avatar" aria-hidden="true">
              <tabler-icon name="user-circle" class="profile-avatar-icon"></tabler-icon>
            </span>
            <span class="profile-trigger__name">{{ displayName() }}</span>
            <tabler-icon
              name="chevron-down"
              class="profile-chevron"
              [class.profile-chevron--open]="activeMenu === 'profile'"
            ></tabler-icon>
          </button>

          @if (activeMenu === 'profile') {
            <div class="dropdown-panel profile-panel" role="menu" aria-label="User profile menu">
              <div class="profile-header">
                <span class="profile-header-avatar" aria-hidden="true">{{ getInitials(displayName()) }}</span>
                <div class="profile-header-copy">
                  <strong class="profile-name">{{ displayName() }}</strong>
                </div>
              </div>

              <div class="profile-divider"></div>

              <div class="profile-menu-section">
                <button type="button" class="profile-menu-item" role="menuitem" (click)="navigateToAccount($event)">
                  <span class="profile-item-icon"><tabler-icon name="user" class="icon-17"></tabler-icon></span>
                  <span class="profile-item-copy">
                    <span class="profile-item-title">My Account</span>
                    <span class="profile-item-desc">Manage your personal profile.</span>
                  </span>
                </button>

                <button type="button" class="profile-menu-item" role="menuitem" (click)="navigateToSettings($event)">
                  <span class="profile-item-icon"><tabler-icon name="settings" class="icon-17"></tabler-icon></span>
                  <span class="profile-item-copy">
                    <span class="profile-item-title">Account Settings</span>
                    <span class="profile-item-desc">Update your account preferences.</span>
                  </span>
                </button>
              </div>

              <div class="profile-menu-section">
                <button type="button" class="profile-menu-item" role="menuitem" (click)="navigateToWallet($event)">
                  <span class="profile-item-icon"><tabler-icon name="wallet" class="icon-17"></tabler-icon></span>
                  <span class="profile-item-copy">
                    <span class="profile-item-title">My Wallet</span>
                    <span class="profile-item-desc">View your wallet statement and transactions.</span>
                  </span>
                </button>
              </div>

              <div class="profile-divider"></div>

              <button type="button" class="profile-menu-item profile-menu-item--danger" role="menuitem" (click)="logout($event)">
                <span class="profile-item-icon"><tabler-icon name="logout" class="icon-17"></tabler-icon></span>
                <span class="profile-item-copy">
                  <span class="profile-item-title">Logout</span>
                </span>
              </button>
            </div>
          }
        </div>

        <div class="navbar-menu">
          <button
            class="rms-icon-btn notification-trigger"
            type="button"
            (click)="toggleMenu('notifications', $event)"
            [class.is-open]="activeMenu === 'notifications'"
            [attr.aria-expanded]="activeMenu === 'notifications'"
            aria-haspopup="menu"
            aria-label="Notifications"
            title="Notifications"
          >
            <tabler-icon name="bell" class="icon-20"></tabler-icon>
            <span class="notification-dot" aria-hidden="true"></span>
          </button>

          @if (activeMenu === 'notifications') {
            <div class="dropdown-panel notifications-panel" role="menu" aria-label="Notifications menu">
              <div class="notifications-header">
                <strong>Notifications</strong>
                <span>0 new</span>
              </div>
              <div class="notifications-empty">
                <tabler-icon name="bell-off" class="notifications-empty-icon"></tabler-icon>
                <span>No notifications</span>
              </div>
            </div>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    :host {
      display: block;
      height: var(--sero-topbar-height);
      flex-shrink: 0;
    }

    .sero-topbar {
      --topbar-control-size: 40px;
      --topbar-control-radius: 50%;
      --topbar-control-gap: 16px;
      height: var(--sero-topbar-height);
      background: var(--theme-bg-card, var(--sero-card-bg));
      border-bottom: 1px solid var(--theme-border, var(--sero-border));
      display: grid;
      grid-template-columns: minmax(var(--topbar-control-size), 1fr) minmax(220px, 620px) minmax(max-content, 1fr);
      align-items: center;
      column-gap: var(--topbar-control-gap);
      padding: 0 24px;
      position: fixed;
      top: 0;
      left: var(--layout-sidebar-offset, var(--sero-sidebar-width));
      right: 0;
      z-index: 90;
      direction: ltr;
      box-sizing: border-box;
      overflow: visible;
      transition: left var(--t-slow), right var(--t-slow), background 0.2s ease, border-color 0.2s ease;
    }

    .topbar-title {
      grid-column: 2;
      justify-self: center;
      min-width: 0;
      width: 100%;
      max-width: 620px;
      overflow: hidden;
      color: var(--theme-text-primary, #1f2937);
      font-size: 0.95rem;
      font-weight: 800;
      line-height: 1.2;
      text-align: center;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .topbar-actions {
      grid-column: 3;
      justify-self: end;
      min-width: 0;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      gap: var(--topbar-control-gap);
      direction: ltr;
    }

    .rms-icon-btn,
    .profile-trigger {
      width: var(--topbar-control-size);
      min-width: var(--topbar-control-size);
      height: var(--topbar-control-size);
      min-height: var(--topbar-control-size);
      border: 1px solid var(--theme-border, var(--app-border, rgba(0, 0, 0, 0.12)));
      border-radius: var(--topbar-control-radius);
      background: var(--theme-bg-card, var(--theme-bg, #fff));
      color: var(--theme-text-secondary, #64748b);
      box-shadow: none;
      box-sizing: border-box;
      cursor: pointer;
      transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;
    }

    .rms-icon-btn {
      padding: 0;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .rms-icon-btn--sidebar {
      grid-column: 1;
      justify-self: start;
      border-radius: 50%;
      color: var(--theme-text-primary, #1f2937);
    }

    .rms-icon-btn--sidebar .icon-20 {
      width: 22px;
      height: 22px;
    }

    .rms-icon-btn--sidebar:hover {
      border-color: color-mix(in srgb, var(--theme-primary, #3a472a) 32%, var(--theme-border, #e2e8f0));
      background: color-mix(in srgb, var(--theme-primary, #3a472a) 7%, var(--theme-bg-card, #fff));
      color: var(--theme-primary, #3a472a);
    }

    .theme-trigger {
      border-radius: 50%;
      color: var(--theme-text-primary, #1f2937);
    }

    .theme-trigger:hover,
    .theme-trigger.is-open {
      border-color: transparent;
      background: color-mix(in srgb, var(--theme-primary, #3a472a) 7%, transparent);
      color: var(--theme-text-primary, #1f2937);
    }

    .theme-trigger .icon-20 {
      width: 21px;
      height: 21px;
    }

    .language-trigger {
      border-radius: 50%;
      color: var(--theme-text-primary, #2a3524);
      overflow: hidden;
    }

    .language-trigger:hover,
    .language-trigger.is-open {
      border-color: color-mix(in srgb, var(--theme-primary, #3a472a) 18%, transparent);
      background: color-mix(in srgb, var(--theme-primary, #3a472a) 7%, transparent);
      color: var(--theme-primary, #3a472a);
    }

    .language-current-flag {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      object-fit: cover;
    }

    .rms-icon-btn:hover,
    .rms-icon-btn.is-open,
    .profile-trigger:hover,
    .profile-trigger.is-open {
      border-color: color-mix(in srgb, var(--theme-primary, #3a472a) 32%, var(--theme-border, #e2e8f0));
      background: var(--theme-bg-card, var(--theme-bg, #fff));
      color: var(--theme-primary, #3a472a);
    }

    .rms-icon-btn--sidebar:hover,
    .rms-icon-btn--sidebar.is-open {
      border-color: color-mix(in srgb, var(--theme-primary, #3a472a) 32%, var(--theme-border, #e2e8f0));
      background: color-mix(in srgb, var(--theme-primary, #3a472a) 7%, var(--theme-bg-card, #fff));
      color: var(--theme-primary, #3a472a);
    }

    .theme-trigger:hover,
    .theme-trigger.is-open {
      border-color: transparent;
      background: color-mix(in srgb, var(--theme-primary, #3a472a) 7%, transparent);
      color: var(--theme-text-primary, #1f2937);
    }

    .language-trigger:hover,
    .language-trigger.is-open {
      border-color: color-mix(in srgb, var(--theme-primary, #3a472a) 18%, transparent);
      background: color-mix(in srgb, var(--theme-primary, #3a472a) 7%, transparent);
      color: var(--theme-primary, #3a472a);
    }

    .rms-icon-btn:focus-visible,
    .profile-trigger:focus-visible,
    .language-option:focus-visible,
    .profile-menu-item:focus-visible {
      outline: 2px solid var(--theme-primary, #3a472a);
      outline-offset: 2px;
    }

    .icon-20,
    .icon-18,
    .icon-17,
    .language-check,
    .profile-chevron {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .icon-20 { width: 20px; height: 20px; }
    .icon-18 { width: 18px; height: 18px; }
    .icon-17 { width: 17px; height: 17px; }

    .navbar-menu {
      position: relative;
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
    }

    .dropdown-panel {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      z-index: 220;
      background: var(--theme-bg-card, var(--theme-bg, #fff));
      border: 1px solid var(--theme-border, var(--app-border, rgba(0, 0, 0, 0.08)));
      border-radius: 12px;
      box-shadow:
        0 10px 32px color-mix(in srgb, var(--theme-text-primary, #0f172a) 10%, transparent),
        0 2px 10px color-mix(in srgb, var(--theme-text-primary, #0f172a) 5%, transparent);
      color: var(--theme-text-primary, #0f172a);
      animation: navbarMenuIn 0.18s ease;
      box-sizing: border-box;
    }

    .language-panel {
      width: 184px;
      padding: 6px;
    }

    .language-option {
      width: 100%;
      min-height: 38px;
      border: 1px solid transparent;
      border-radius: 8px;
      background: transparent;
      color: var(--theme-text-primary, #0f172a);
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 7px 9px;
      font: inherit;
      font-size: 0.82rem;
      font-weight: 600;
      text-align: start;
      cursor: pointer;
      transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
    }

    .language-option:hover {
      background: color-mix(in srgb, var(--theme-primary, #3a472a) 7%, transparent);
      color: var(--theme-primary, #3a472a);
    }

    .language-option.active {
      background: color-mix(in srgb, var(--theme-primary, #3a472a) 9%, transparent);
      border-color: color-mix(in srgb, var(--theme-primary, #3a472a) 18%, transparent);
      color: var(--theme-primary, #3a472a);
    }

    .language-flag {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      object-fit: cover;
      flex-shrink: 0;
    }

    .language-label {
      min-width: 0;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .language-check {
      width: 15px;
      height: 15px;
      color: var(--theme-primary, #3a472a);
    }

    .notification-trigger {
      position: relative;
    }

    .notification-dot {
      position: absolute;
      top: 9px;
      right: 9px;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: var(--theme-primary, #3a472a);
      border: 1px solid var(--theme-bg-card, #fff);
    }

    .notifications-panel {
      width: min(360px, calc(100vw - 24px));
      padding: 0;
      overflow: hidden;
    }

    .notifications-header {
      min-height: 54px;
      padding: 0 16px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--theme-border, #d8decf);
      color: var(--theme-text-primary, #2a3524);
    }

    .notifications-header strong {
      font-size: 0.9rem;
      font-weight: 800;
    }

    .notifications-header span {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--theme-text-secondary, #5c6652);
    }

    .notifications-empty {
      min-height: 120px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 8px;
      color: var(--theme-text-secondary, #5c6652);
      font-size: 0.8125rem;
      font-weight: 600;
    }

    .notifications-empty-icon {
      width: 26px;
      height: 26px;
      color: var(--theme-text-tertiary, #7b8574);
    }

    .profile-trigger {
      width: auto;
      max-width: 220px;
      padding: 0 10px 0 5px;
      border-radius: 999px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .profile-trigger:hover,
    .profile-trigger.is-open {
      border-color: color-mix(in srgb, var(--theme-primary, #3a472a) 32%, var(--theme-border, #e2e8f0));
      background: color-mix(in srgb, var(--theme-primary, #3a472a) 7%, var(--theme-bg-card, #fff));
      color: var(--theme-primary, #3a472a);
    }

    .profile-avatar,
    .profile-header-avatar {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      color: var(--theme-primary, #3a472a);
      background: color-mix(in srgb, var(--theme-primary, #3a472a) 9%, transparent);
      border: 1px solid color-mix(in srgb, var(--theme-primary, #3a472a) 14%, transparent);
      font-weight: 800;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    .profile-avatar {
      width: 28px;
      height: 28px;
      border: 0;
      border-radius: 50%;
      background: color-mix(in srgb, var(--theme-primary, #3a472a) 9%, transparent);
      color: var(--theme-primary, #3a472a);
      font-size: 0.66rem;
      line-height: 1;
    }

    .profile-avatar-icon {
      width: 19px;
      height: 19px;
    }

    .profile-trigger__name {
      display: block;
      max-width: 128px;
      min-width: 0;
      overflow: hidden;
      color: var(--theme-text-primary, #1f2937);
      font-size: 0.8125rem;
      font-weight: 700;
      line-height: 1;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .profile-chevron {
      display: inline-flex;
      width: 14px;
      height: 14px;
      color: var(--theme-text-secondary, #64748b);
      transition: transform 0.22s ease;
    }

    .profile-chevron--open {
      transform: rotate(180deg);
    }

    .profile-panel {
      width: min(340px, calc(100vw - 24px));
      padding: 12px;
      overflow: hidden;
    }

    .profile-header {
      display: flex;
      align-items: center;
      gap: 12px;
      min-width: 0;
    }

    .profile-header-avatar {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      font-size: 0.88rem;
    }

    .profile-header-copy {
      min-width: 0;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .profile-name {
      display: block;
      margin: 0;
      color: var(--theme-text-primary, #0f172a);
      font-size: 0.95rem;
      font-weight: 800;
      line-height: 1.25;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .profile-divider {
      height: 1px;
      margin: 10px 0 8px;
      background: linear-gradient(
        90deg,
        transparent,
        color-mix(in srgb, var(--theme-border, #cbd5e1) 82%, transparent) 20%,
        color-mix(in srgb, var(--theme-border, #cbd5e1) 82%, transparent) 80%,
        transparent
      );
    }

    .profile-menu-section {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .profile-menu-item {
      width: 100%;
      min-height: 54px;
      display: grid;
      grid-template-columns: 32px minmax(0, 1fr);
      align-items: center;
      gap: 10px;
      padding: 8px 9px;
      border: 1px solid transparent;
      border-radius: 10px;
      background: transparent;
      color: var(--theme-text-primary, #0f172a);
      font: inherit;
      text-align: start;
      cursor: pointer;
      transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
    }

    .profile-menu-item:hover {
      background: color-mix(in srgb, var(--theme-primary, #3a472a) 7%, transparent);
      color: var(--theme-primary, #3a472a);
    }

    .profile-item-icon {
      width: 32px;
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      background: color-mix(in srgb, var(--theme-primary, #3a472a) 8%, transparent);
      color: var(--theme-primary, #3a472a);
      border: 1px solid color-mix(in srgb, var(--theme-primary, #3a472a) 12%, transparent);
    }

    .profile-item-copy {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .profile-item-title {
      font-size: 0.82rem;
      font-weight: 750;
      line-height: 1.25;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .profile-item-desc {
      color: var(--theme-text-secondary, #64748b);
      font-size: 0.7rem;
      font-weight: 500;
      line-height: 1.3;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .profile-menu-item--danger {
      color: color-mix(in srgb, var(--theme-danger, #b84040) 94%, #7f1d1d);
    }

    .profile-menu-item--danger .profile-item-icon {
      background: color-mix(in srgb, var(--theme-danger, #b84040) 9%, transparent);
      border-color: color-mix(in srgb, var(--theme-danger, #b84040) 18%, transparent);
      color: var(--theme-danger, #b84040);
    }

    .profile-menu-item--danger:hover {
      background: color-mix(in srgb, var(--theme-danger, #b84040) 9%, transparent);
      color: var(--theme-danger, #b84040);
    }

    @keyframes navbarMenuIn {
      from {
        opacity: 0;
        transform: translateY(-6px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    :host-context([dir="rtl"]) .sero-topbar {
      left: 0;
      right: var(--layout-sidebar-offset, var(--sero-sidebar-width));
    }

    :host-context([dir="rtl"]) .dropdown-panel {
      direction: rtl;
    }

    @media (max-width: 1023px) {
      .sero-topbar {
        grid-template-columns: auto minmax(120px, 1fr) auto;
        left: 0 !important;
        right: 0 !important;
        column-gap: 12px;
        padding: 0 16px;
      }

      .topbar-actions {
        gap: 12px;
      }

      .profile-trigger__name {
        max-width: 96px;
      }
    }

    @media (max-width: 575.98px) {
      .sero-topbar {
        --topbar-control-size: 36px;
        --topbar-control-gap: 8px;
        grid-template-columns: auto minmax(40px, 1fr) auto;
        column-gap: var(--topbar-control-gap);
        padding: 0 12px;
      }

      .rms-icon-btn {
        width: var(--topbar-control-size);
        min-width: var(--topbar-control-size);
        height: var(--topbar-control-size);
        min-height: var(--topbar-control-size);
      }

      .rms-icon-btn--sidebar {
        width: var(--topbar-control-size);
        min-width: var(--topbar-control-size);
        height: var(--topbar-control-size);
        min-height: var(--topbar-control-size);
      }

      .profile-trigger {
        width: var(--topbar-control-size);
        min-width: var(--topbar-control-size);
        max-width: var(--topbar-control-size);
        padding: 0;
      }

      .profile-avatar {
        width: 26px;
        height: 26px;
        border-radius: 50%;
        font-size: 0.64rem;
      }

      .profile-avatar-icon {
        width: 18px;
        height: 18px;
      }

      .profile-trigger__name,
      .profile-chevron {
        display: none;
      }

      .topbar-title {
        font-size: 0.82rem;
      }

      .dropdown-panel {
        position: fixed;
        top: calc(var(--sero-topbar-height) + 8px);
        right: 12px;
      }

      :host-context([dir="rtl"]) .dropdown-panel {
        right: auto;
        left: 12px;
      }
    }
  `]
})
export class TopbarComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();
  private readonly themeStorageKey = 'sero_theme';

  currentAgent: Agent | null = null;
  currentTitleKey = 'sidebar.nav.statisticsGroup';
  activeMenu: NavbarMenu = null;
  theme: ThemeMode = 'light';

  readonly languages: LanguageOption[] = [
    { code: 'en', flag: '/images/flag/icon-flag-en.svg', label: 'English' },
    { code: 'ar', flag: '/images/flag/icon-flag-ar.svg', label: 'العربية' }
  ];

  private readonly routeTitleMap: { prefix: string; key: string }[] = [
    { prefix: '/admin/agent-packages/new', key: 'sidebar.nav.defineNewPackage' },
    { prefix: '/admin/agent-packages', key: 'sidebar.nav.agentPackages' },
    { prefix: '/admin/packages/builder', key: 'sidebar.nav.defineNewPackage' },
    { prefix: '/admin/packages', key: 'sidebar.nav.agentPackages' },
    { prefix: '/admin/agent-requests/new', key: 'sidebar.nav.newOrder' },
    { prefix: '/admin/agent-requests', key: 'sidebar.nav.agentOrders' },
    { prefix: '/admin/orders/new', key: 'sidebar.nav.newOrder' },
    { prefix: '/admin/orders', key: 'orders.title' },
    { prefix: '/admin/analytics', key: 'sidebar.nav.statisticsGroup' },
    { prefix: '/admin/operations/hotel-bookings', key: 'sidebar.nav.hotelBookings' },
    { prefix: '/admin/operations/visa-requests', key: 'sidebar.nav.visaRequests' },
    { prefix: '/admin/operations/transport-requests', key: 'sidebar.nav.transportRequests' },
    { prefix: '/admin/operations/catering-requests', key: 'sidebar.nav.cateringRequests' },
    { prefix: '/admin/operations/flight-requests', key: 'sidebar.nav.flightRequests' },
    { prefix: '/admin/operations/hotels', key: 'sidebar.nav.hotelBookings' },
    { prefix: '/admin/operations/visa', key: 'sidebar.nav.visaRequests' },
    { prefix: '/admin/operations/transport', key: 'sidebar.nav.transportRequests' },
    { prefix: '/admin/operations/catering', key: 'sidebar.nav.cateringRequests' },
    { prefix: '/admin/operations/flights', key: 'sidebar.nav.flightRequests' },
    { prefix: '/admin/operations', key: 'sidebar.nav.operationsGroup' },
    { prefix: '/admin/pricing/transport', key: 'sidebar.nav.transportPricing' },
    { prefix: '/admin/pricing/food', key: 'sidebar.nav.foodPricing' },
    { prefix: '/admin/pricing/hotel', key: 'sidebar.nav.hotelPricing' },
    { prefix: '/admin/pricing', key: 'sidebar.nav.pricingGroup' },
    { prefix: '/admin/service-center/rfq/new', key: 'sidebar.nav.newRfq' },
    { prefix: '/admin/service-center/rfq/current', key: 'sidebar.nav.currentRequests' },
    { prefix: '/admin/service-center/rfq/closed', key: 'sidebar.nav.closedRequests' },
    { prefix: '/admin/service-center/customers', key: 'sidebar.nav.customers' },
    { prefix: '/admin/service-center', key: 'sidebar.nav.serviceCenterGroup' },
    { prefix: '/admin/finance/chart-of-accounts', key: 'sidebar.nav.accountingTree' },
    { prefix: '/admin/finance/tree', key: 'sidebar.nav.accountingTree' },
    { prefix: '/admin/finance/fiscal-year', key: 'sidebar.nav.financialYear' },
    { prefix: '/admin/finance/year', key: 'sidebar.nav.financialYear' },
    { prefix: '/admin/finance/journal-entries/create', key: 'sidebar.nav.journalEntries' },
    { prefix: '/admin/finance/journal-entries-pending', key: 'sidebar.nav.journalEntries' },
    { prefix: '/admin/finance/journal-entries-unapproved', key: 'sidebar.nav.journalEntries' },
    { prefix: '/admin/finance/journal-entries-import', key: 'sidebar.nav.journalEntries' },
    { prefix: '/admin/finance/journal-entries-tax-expense', key: 'sidebar.nav.journalEntries' },
    { prefix: '/admin/finance/journal-entries', key: 'sidebar.nav.journalEntries' },
    { prefix: '/admin/finance/entries', key: 'sidebar.nav.journalEntries' },
    { prefix: '/admin/finance/account-statement', key: 'sidebar.nav.accountStatement' },
    { prefix: '/admin/finance/statement', key: 'sidebar.nav.accountStatement' },
    { prefix: '/admin/finance/trial-balance', key: 'sidebar.nav.trialBalance' },
    { prefix: '/admin/finance/opening-balance', key: 'sidebar.nav.openingBalance' },
    { prefix: '/admin/finance/banks-management', key: 'sidebar.nav.financeWallets' },
    { prefix: '/admin/finance/cash', key: 'sidebar.nav.financeWallets' },
    { prefix: '/admin/finance/expenses-management', key: 'sidebar.nav.expensesManagement' },
    { prefix: '/admin/finance/cost-centers', key: 'sidebar.nav.costCenters' },
    { prefix: '/admin/finance/financial-reports', key: 'sidebar.nav.financialReports' },
    { prefix: '/admin/finance/reports', key: 'sidebar.nav.financialReports' },
    { prefix: '/admin/finance/account-routing', key: 'sidebar.nav.accountRouting' },
    { prefix: '/admin/finance/income-statement', key: 'sidebar.nav.incomeStatement' },
    { prefix: '/admin/finance', key: 'sidebar.nav.financeGroup' },
    { prefix: '/admin/financials/owners', key: 'sidebar.nav.ownersList' },
    { prefix: '/admin/financials/approvals', key: 'sidebar.nav.approvalRequests' },
    { prefix: '/admin/financials', key: 'sidebar.nav.financialsGroup' },
    { prefix: '/admin/services/hotels', key: 'sidebar.nav.hotelsService' },
    { prefix: '/admin/services/transport-companies', key: 'sidebar.nav.transportCompanies' },
    { prefix: '/admin/services/hotel-categories', key: 'sidebar.nav.hotelCategories' },
    { prefix: '/admin/services', key: 'sidebar.nav.servicesGroup' },
    { prefix: '/admin/agents/list', key: 'sidebar.nav.agentsList' },
    { prefix: '/admin/agents/account-managers', key: 'sidebar.nav.accountManagers' },
    { prefix: '/admin/agents', key: 'sidebar.nav.agentManagementGroup' },
    { prefix: '/admin/users/groups', key: 'sidebar.nav.userGroups' },
    { prefix: '/admin/users/system-admins', key: 'sidebar.nav.systemAdmins' },
    { prefix: '/admin/users/provider-users', key: 'sidebar.nav.providerUsers' },
    { prefix: '/admin/users/agent-users', key: 'sidebar.nav.agentUsers' },
    { prefix: '/admin/users', key: 'sidebar.nav.usersGroup' },
    { prefix: '/admin/hotel-providers/list', key: 'sidebar.nav.providersList' },
    { prefix: '/admin/hotel-providers/subscriptions', key: 'sidebar.nav.subscriptions' },
    { prefix: '/admin/hotel-providers', key: 'sidebar.nav.hotelProvidersGroup' }
  ];

  constructor(
    private readonly agentService: AgentService,
    private readonly hostElement: ElementRef<HTMLElement>,
    private readonly router: Router,
    public readonly layout: LayoutService,
    public readonly langService: LanguageService
  ) {}

  ngOnInit(): void {
    this.theme = this.readTheme();
    this.applyTheme(this.theme);

    this.agentService.getCurrentAgent()
      .pipe(takeUntil(this.destroy$))
      .subscribe((agent) => {
        this.currentAgent = agent;
      });

    this.currentTitleKey = this.resolveTitle(this.router.url);
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      takeUntil(this.destroy$)
    ).subscribe((event) => {
      this.currentTitleKey = this.resolveTitle(event.urlAfterRedirects);
      this.closeMenus();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleMenu(menu: Exclude<NavbarMenu, null>, event: Event): void {
    event.stopPropagation();
    this.activeMenu = this.activeMenu === menu ? null : menu;
  }

  closeMenus(): void {
    this.activeMenu = null;
  }

  toggleTheme(event: Event): void {
    event.stopPropagation();
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(this.themeStorageKey, this.theme);
    this.applyTheme(this.theme);
  }

  selectLanguage(lang: SupportedLang, event: Event): void {
    event.stopPropagation();
    this.langService.setLang(lang);
    this.closeMenus();
  }

  navigateToAccount(event: Event): void {
    event.stopPropagation();
    this.closeMenus();
    void this.router.navigate(['/admin/users/agent-users']);
  }

  navigateToSettings(event: Event): void {
    event.stopPropagation();
    this.closeMenus();
    void this.router.navigate(['/admin/users/system-admins']);
  }

  navigateToWallet(event: Event): void {
    event.stopPropagation();
    this.closeMenus();
    void this.router.navigate(['/admin/finance/account-statement']);
  }

  logout(event: Event): void {
    event.stopPropagation();
    this.closeMenus();
    localStorage.removeItem('token');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    void this.router.navigate(['/']);
  }

  displayName(): string {
    return (this.currentAgent?.name || this.currentAgent?.email || 'System User').trim();
  }

  currentLanguageFlag(): string {
    return this.languages.find((language) => language.code === this.langService.currentLang())?.flag ?? '/images/flag/icon-flag-en.svg';
  }

  getInitials(name: string): string {
    const initials = name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();

    return initials || 'SU';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target;
    if (this.activeMenu && target instanceof Node && !this.hostElement.nativeElement.contains(target)) {
      this.closeMenus();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.closeMenus();
  }

  private resolveTitle(url: string): string {
    const path = url.split('?')[0];
    for (const entry of this.routeTitleMap) {
      if (path === entry.prefix || path.startsWith(entry.prefix + '/')) {
        return entry.key;
      }
    }
    return 'sidebar.nav.statisticsGroup';
  }

  private readTheme(): ThemeMode {
    const saved = localStorage.getItem(this.themeStorageKey) || localStorage.getItem('theme');
    return saved === 'dark' ? 'dark' : 'light';
  }

  private applyTheme(theme: ThemeMode): void {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.classList.toggle('dark-theme', theme === 'dark');
    document.documentElement.classList.toggle('light-theme', theme === 'light');
    document.body.classList.toggle('dark-theme', theme === 'dark');
    document.body.classList.toggle('light-theme', theme === 'light');
  }
}
