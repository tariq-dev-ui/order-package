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

type NavbarMenu = 'language' | 'profile' | null;
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
      <div class="topbar-section topbar-section--left">
        <button
          class="rms-icon-btn rms-icon-btn--sidebar"
          type="button"
          (click)="layout.toggle()"
          [attr.aria-label]="'topbar.toggleSidebar' | translate"
          [attr.aria-pressed]="layout.sidebarCollapsed()"
        >
          <tabler-icon name="menu-2" class="icon-20"></tabler-icon>
        </button>
      </div>

      <div class="topbar-title-wrap" aria-live="polite">
        <h1 class="topbar-title">{{ currentTitleKey | translate }}</h1>
      </div>

      <div class="topbar-section topbar-section--right" aria-label="Navbar actions">
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
            class="rms-icon-btn language-trigger"
            type="button"
            (click)="toggleMenu('language', $event)"
            [class.is-open]="activeMenu === 'language'"
            [attr.aria-expanded]="activeMenu === 'language'"
            aria-haspopup="menu"
            aria-label="Choose language"
            title="Language"
          >
            <span class="language-current-flag" aria-hidden="true">{{ currentLanguageFlag() }}</span>
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
                  <span class="language-flag" aria-hidden="true">{{ lang.flag }}</span>
                  <span class="language-label">{{ lang.label }}</span>
                  @if (langService.currentLang() === lang.code) {
                    <tabler-icon name="check" class="language-check"></tabler-icon>
                  }
                </button>
              }
            </div>
          }
        </div>

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
      --topbar-control-radius: 10px;
      height: var(--sero-topbar-height);
      background: var(--theme-bg-card, var(--sero-card-bg));
      border-bottom: 1px solid var(--theme-border, var(--sero-border));
      border-top: 1px solid color-mix(in srgb, var(--theme-border, var(--sero-border)) 70%, transparent);
      display: grid;
      grid-template-columns: minmax(140px, 1fr) minmax(0, auto) minmax(140px, 1fr);
      align-items: center;
      column-gap: clamp(8px, 2vw, 16px);
      padding: 0 0 0 clamp(14px, 2vw, 20px);
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

    .topbar-section {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      align-self: center;
      min-width: 0;
    }

    .topbar-section--left {
      justify-self: start;
      justify-content: flex-start;
    }

    .topbar-section--right {
      justify-self: end;
      justify-content: flex-end;
      gap: 12px;
      direction: ltr;
    }

    .topbar-title-wrap {
      min-width: 0;
      max-width: min(48vw, 640px);
      justify-self: center;
      align-self: center;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      overflow: hidden;
    }

    .topbar-title {
      margin: 0;
      max-width: 100%;
      font-size: 1.18rem;
      font-weight: 800;
      line-height: 1.25;
      letter-spacing: 0;
      color: var(--theme-text-primary, var(--sero-text-primary));
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
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
      width: 64px;
      min-width: 64px;
      height: 100%;
      min-height: var(--sero-topbar-height);
      border: 0;
      border-inline-end: 1px solid var(--theme-border, var(--sero-border));
      border-radius: 0;
      background: transparent;
      color: var(--theme-text-primary, #1f2937);
    }

    .rms-icon-btn--sidebar .icon-20 {
      width: 24px;
      height: 24px;
    }

    .rms-icon-btn--sidebar:hover {
      border-color: var(--theme-border, var(--sero-border));
      background: color-mix(in srgb, var(--theme-primary, #3a472a) 4%, transparent);
      color: var(--theme-text-primary, #1f2937);
    }

    .theme-trigger {
      width: 34px;
      min-width: 34px;
      height: 34px;
      min-height: 34px;
      border-color: transparent;
      border-radius: 50%;
      background: transparent;
      color: var(--theme-text-primary, #1f2937);
    }

    .theme-trigger:hover,
    .theme-trigger.is-open {
      border-color: transparent;
      background: color-mix(in srgb, var(--theme-primary, #3a472a) 7%, transparent);
      color: var(--theme-text-primary, #1f2937);
    }

    .theme-trigger .icon-20 {
      width: 25px;
      height: 25px;
    }

    .language-trigger {
      width: 28px;
      min-width: 28px;
      height: 28px;
      min-height: 28px;
      border: 0;
      border-radius: 50%;
      background: #159a52;
      color: #fff;
    }

    .language-trigger:hover,
    .language-trigger.is-open {
      border-color: transparent;
      background: #13884a;
      color: #fff;
    }

    .language-current-flag {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      font-size: 0.78rem;
      line-height: 1;
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
      border-color: var(--theme-border, var(--sero-border));
      background: color-mix(in srgb, var(--theme-primary, #3a472a) 4%, transparent);
      color: var(--theme-text-primary, #1f2937);
    }

    .theme-trigger:hover,
    .theme-trigger.is-open {
      border-color: transparent;
      background: color-mix(in srgb, var(--theme-primary, #3a472a) 7%, transparent);
      color: var(--theme-text-primary, #1f2937);
    }

    .language-trigger:hover,
    .language-trigger.is-open {
      border-color: transparent;
      background: #13884a;
      color: #fff;
    }

    .rms-icon-btn:focus-visible,
    .profile-trigger:focus-visible,
    .language-option:focus-visible,
    .profile-menu-item:focus-visible {
      outline: 2px solid var(--theme-primary, #3a472a);
      outline-offset: 2px;
    }

    .icon-20,
    .icon-17,
    .language-check,
    .profile-chevron {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .icon-20 { width: 20px; height: 20px; }
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
      line-height: 1;
      font-size: 1rem;
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

    .profile-trigger {
      width: 52px;
      min-width: 52px;
      height: 52px;
      min-height: 52px;
      padding: 0;
      border: 0;
      border-radius: 50%;
      background: transparent;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0;
    }

    .profile-trigger:hover,
    .profile-trigger.is-open {
      border-color: transparent;
      background: transparent;
      color: var(--theme-text-primary, #1f2937);
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
      width: 52px;
      height: 52px;
      border: 0;
      border-radius: 50%;
      background: #f0edff;
      color: #262a33;
      font-size: 0.66rem;
      line-height: 1;
    }

    .profile-avatar-icon {
      width: 26px;
      height: 26px;
    }

    .profile-chevron {
      display: none;
      width: 15px;
      height: 15px;
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

    :host-context([dir="rtl"]) .topbar-section--left {
      grid-column: 3;
      justify-self: end;
      justify-content: flex-end;
    }

    :host-context([dir="rtl"]) .topbar-title-wrap {
      grid-column: 2;
    }

    :host-context([dir="rtl"]) .topbar-section--right {
      grid-column: 1;
      justify-self: start;
      justify-content: flex-end;
      flex-direction: row-reverse;
    }

    :host-context([dir="rtl"]) .topbar-title,
    :host-context([dir="rtl"]) .dropdown-panel {
      direction: rtl;
    }

    :host-context([dir="rtl"]) .dropdown-panel {
      right: auto;
      left: 0;
    }

    :host-context([dir="rtl"]) .sero-topbar {
      padding: 0 0 0 clamp(14px, 2vw, 20px);
    }

    :host-context([dir="rtl"]) .rms-icon-btn--sidebar {
      border-inline-end: 0;
      border-inline-start: 1px solid var(--theme-border, var(--sero-border));
    }

    @media (max-width: 1023px) {
      .sero-topbar {
        grid-template-columns: minmax(116px, 1fr) minmax(0, auto) minmax(116px, 1fr);
        left: 0 !important;
        right: 0 !important;
        padding: 0 12px;
        column-gap: 10px;
      }

      .topbar-title-wrap {
        max-width: 44vw;
      }
    }

    @media (max-width: 575.98px) {
      .sero-topbar {
        --topbar-control-size: 36px;
        --topbar-control-radius: 9px;
        grid-template-columns: minmax(92px, 1fr) minmax(0, auto) minmax(92px, 1fr);
        column-gap: 8px;
      }

      .topbar-section--right {
        gap: 6px;
      }

      .rms-icon-btn {
        width: var(--topbar-control-size);
        min-width: var(--topbar-control-size);
        height: var(--topbar-control-size);
        min-height: var(--topbar-control-size);
      }

      .rms-icon-btn--sidebar {
        width: 54px;
        min-width: 54px;
        height: 100%;
        min-height: var(--sero-topbar-height);
      }

      .theme-trigger {
        width: 32px;
        min-width: 32px;
        height: 32px;
        min-height: 32px;
      }

      .language-trigger {
        width: 26px;
        min-width: 26px;
        height: 26px;
        min-height: 26px;
      }

      .profile-trigger {
        width: 44px;
        min-width: 44px;
        height: 44px;
        min-height: 44px;
      }

      .profile-avatar {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        font-size: 0.64rem;
      }

      .profile-avatar-icon {
        width: 23px;
        height: 23px;
      }

      .profile-chevron {
        display: none;
      }

      .topbar-title {
        font-size: 0.9rem;
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
    { code: 'en', flag: '🇺🇸', label: 'English' },
    { code: 'ar', flag: '🇸🇦', label: 'العربية' }
  ];

  private readonly routeTitleMap: { prefix: string; key: string }[] = [
    { prefix: '/master/my-services/makkah', key: 'Makkah' },
    { prefix: '/master/my-services/madina', key: 'Madina' },
    { prefix: '/master/my-services/transport', key: 'Transport' },
    { prefix: '/master/my-services/tickets', key: 'Tickets' },
    { prefix: '/master/my-services/food', key: 'Food' },
    { prefix: '/master/my-services', key: 'sidebar.nav.myServices' },
    { prefix: '/my-services/makkah', key: 'Makkah' },
    { prefix: '/my-services/madina', key: 'Madina' },
    { prefix: '/my-services/transport', key: 'Transport' },
    { prefix: '/my-services/tickets', key: 'Tickets' },
    { prefix: '/my-services/food', key: 'Food' },
    { prefix: '/my-services', key: 'sidebar.nav.myServices' },
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
    { prefix: '/admin/hotel-providers', key: 'sidebar.nav.hotelProvidersGroup' },
    { prefix: '/agent/orders', key: 'sidebar.nav.agentOrders' },
    { prefix: '/agent/marketplace', key: 'sidebar.nav.marketplace' },
    { prefix: '/master/finance/chart-of-accounts', key: 'sidebar.nav.accountingTree' },
    { prefix: '/master/finance/fiscal-year', key: 'sidebar.nav.financialYear' },
    { prefix: '/master/finance/journal-entries', key: 'sidebar.nav.journalEntries' },
    { prefix: '/master/finance/account-statement', key: 'sidebar.nav.accountStatement' },
    { prefix: '/master/finance/trial-balance', key: 'sidebar.nav.trialBalance' },
    { prefix: '/master/finance/opening-balance', key: 'sidebar.nav.openingBalance' },
    { prefix: '/master/finance/account-routing', key: 'sidebar.nav.accountRouting' },
    { prefix: '/master/finance/income-statement', key: 'sidebar.nav.incomeStatement' },
    { prefix: '/master/finance/cashier-session', key: 'Cashier Session' },
    { prefix: '/master/packages/create', key: 'Create Package' },
    { prefix: '/master/packages', key: 'Packages' },
    { prefix: '/master/my-packages', key: 'My Packages' },
    { prefix: '/master/orders', key: 'Orders' },
    { prefix: '/master/quotations', key: 'Quotations' },
    { prefix: '/master/subagents', key: 'sidebar.nav.subagents' },
    { prefix: '/master/settings', key: 'sidebar.nav.settings' },
    { prefix: '/master', key: 'sidebar.nav.distributedPackages' }
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
    const route = this.routeRoot() === '/master' ? '/master/settings' : '/admin/users/agent-users';
    void this.router.navigate([route]);
  }

  navigateToSettings(event: Event): void {
    event.stopPropagation();
    this.closeMenus();
    const route = this.routeRoot() === '/master' ? '/master/settings' : '/admin/users/system-admins';
    void this.router.navigate([route]);
  }

  navigateToWallet(event: Event): void {
    event.stopPropagation();
    this.closeMenus();
    const route = this.routeRoot() === '/master'
      ? '/master/finance/account-statement'
      : '/admin/finance/account-statement';
    void this.router.navigate([route]);
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
    return this.languages.find((language) => language.code === this.langService.currentLang())?.flag ?? '🌐';
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

  private routeRoot(): '/admin' | '/master' {
    return this.router.url.split('?')[0].startsWith('/master') ? '/master' : '/admin';
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
