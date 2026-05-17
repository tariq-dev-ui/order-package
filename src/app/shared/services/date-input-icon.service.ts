import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, NgZone, OnDestroy, PLATFORM_ID, inject } from '@angular/core';

type PickerInput = HTMLInputElement & { showPicker?: () => void };

@Injectable({ providedIn: 'root' })
export class DateInputIconService implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly zone = inject(NgZone);

  private readonly enhancedInputs = new WeakSet<HTMLInputElement>();
  private observer?: MutationObserver;
  private started = false;

  start(): void {
    if (this.started || !isPlatformBrowser(this.platformId)) {
      return;
    }

    this.started = true;
    this.zone.runOutsideAngular(() => {
      queueMicrotask(() => this.enhanceTree(this.document.body));

      this.observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'attributes' && mutation.target instanceof HTMLInputElement) {
            this.enhanceInput(mutation.target);
            continue;
          }

          mutation.addedNodes.forEach((node) => this.enhanceTree(node));
        }
      });

      this.observer.observe(this.document.body, {
        attributes: true,
        attributeFilter: ['class', 'disabled', 'formcontrolname', 'id', 'name', 'placeholder', 'readonly', 'type'],
        childList: true,
        subtree: true,
      });
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  private enhanceTree(node: Node): void {
    if (node instanceof HTMLInputElement) {
      this.enhanceInput(node);
      return;
    }

    if (!(node instanceof Element)) {
      return;
    }

    node.querySelectorAll('input').forEach((input) => {
      if (input instanceof HTMLInputElement) {
        this.enhanceInput(input);
      }
    });
  }

  private enhanceInput(input: HTMLInputElement): void {
    if (this.enhancedInputs.has(input)) {
      this.syncButtonState(input);
      return;
    }

    if (!this.isDateField(input)) {
      return;
    }

    const wrapper = this.wrapInput(input);
    const picker = this.createPickerInput(input);
    const button = this.createButton(input, picker);

    if (picker) {
      wrapper.appendChild(picker);
    }

    wrapper.appendChild(button);
    input.classList.add('sero-global-date-input');
    input.setAttribute('data-sero-date-enhanced', 'true');

    this.enhancedInputs.add(input);
    this.syncButtonState(input);
  }

  private isDateField(input: HTMLInputElement): boolean {
    if (
      input.closest('.sero-date-field, .sero-global-date-field, mat-form-field') ||
      input.classList.contains('mat-datepicker-input') ||
      input.type === 'hidden' ||
      input.hasAttribute('data-sero-date-skip')
    ) {
      return false;
    }

    const type = (input.getAttribute('type') || 'text').toLowerCase();
    if (type === 'date') {
      return true;
    }

    if (type !== 'text') {
      return false;
    }

    const metadata = [
      input.getAttribute('aria-label'),
      input.getAttribute('formcontrolname'),
      input.getAttribute('id'),
      input.getAttribute('name'),
      input.getAttribute('ng-reflect-name'),
      input.getAttribute('placeholder'),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return /mm\/dd\/yyyy|dd\/mm\/yyyy|yyyy-mm-dd|yyyy\/mm\/dd|\bdate\b|startdate|enddate|departuredate|returndate|traveldate|validfrom|validto|checkindate|checkoutdate/.test(metadata);
  }

  private wrapInput(input: HTMLInputElement): HTMLElement {
    const existingWrapper = input.closest('.sero-global-date-field');
    if (existingWrapper instanceof HTMLElement) {
      return existingWrapper;
    }

    const wrapper = this.document.createElement('div');
    wrapper.className = 'sero-global-date-field';
    input.parentNode?.insertBefore(wrapper, input);
    wrapper.appendChild(input);
    return wrapper;
  }

  private createPickerInput(input: HTMLInputElement): HTMLInputElement | null {
    if (input.type === 'date') {
      return null;
    }

    const picker = this.document.createElement('input');
    picker.type = 'date';
    picker.tabIndex = -1;
    picker.className = 'sero-global-date-native-picker';
    picker.setAttribute('aria-hidden', 'true');

    this.syncPickerInput(input, picker);

    picker.addEventListener('change', () => {
      input.value = picker.value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });

    input.addEventListener('input', () => {
      picker.value = this.normalizeDateValue(input.value);
    });

    return picker;
  }

  private createButton(input: HTMLInputElement, picker: HTMLInputElement | null): HTMLButtonElement {
    const button = this.document.createElement('button');
    button.type = 'button';
    button.className = 'sero-global-date-trigger';
    button.setAttribute('aria-label', 'Open calendar');
    button.innerHTML = '<span class="material-icons-round">calendar_month</span>';

    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();

      if (input.disabled) {
        return;
      }

      const target = (picker ?? input) as PickerInput;
      if (picker) {
        this.syncPickerInput(input, picker);
      }
      target.focus({ preventScroll: true });

      if (typeof target.showPicker === 'function') {
        target.showPicker();
      } else {
        target.click();
      }
    });

    return button;
  }

  private copyDateBound(source: HTMLInputElement, target: HTMLInputElement, attribute: 'max' | 'min'): void {
    const value = source.getAttribute(attribute);
    if (value) {
      target.setAttribute(attribute, value);
    } else {
      target.removeAttribute(attribute);
    }
  }

  private syncPickerInput(source: HTMLInputElement, picker: HTMLInputElement): void {
    this.copyDateBound(source, picker, 'min');
    this.copyDateBound(source, picker, 'max');
    picker.value = this.normalizeDateValue(source.value);
  }

  private normalizeDateValue(value: string): string {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return value;
    }

    const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!match) {
      return '';
    }

    const [, month, day, year] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  private syncButtonState(input: HTMLInputElement): void {
    const wrapper = input.closest('.sero-global-date-field');
    const button = wrapper?.querySelector<HTMLButtonElement>('.sero-global-date-trigger');
    const picker = wrapper?.querySelector<HTMLInputElement>('.sero-global-date-native-picker');
    if (button) {
      button.disabled = input.disabled;
    }
    if (picker) {
      this.syncPickerInput(input, picker);
    }
  }
}
