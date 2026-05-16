import { AfterViewInit, DestroyRef, Directive, ElementRef, OnDestroy, Renderer2, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { TranslateService } from '@ngx-translate/core';
import { matchesSelectSearchQuery } from './mat-select-search.utils';

const HOST_CLASS = 'rms-mat-select-panel-search-host';
const INPUT_CLASS = 'rms-mat-select-panel-search-input';
const EMPTY_CLASS = 'rms-mat-select-panel-search-empty';
const OPTION_HIDDEN_CLASS = 'rms-mat-option--hidden-by-search';
const OPTGROUP_HIDDEN_CLASS = 'rms-mat-optgroup--hidden-by-search';

function getOptionHost(option: MatOption): HTMLElement {
  return (option as unknown as { _getHostElement(): HTMLElement })._getHostElement();
}

/**
 * Global in-panel search for Angular Material `mat-select`.
 *
 * On open, injects a sticky search row (icon + input) at the top of the overlay panel, filters
 * `mat-option` rows by visible label (`MatOption.getLabel()`), keeps selected multi-select values
 * visible while filtering, and shows a translated empty state when nothing matches.
 *
 * Skips selects that already embed `<ngx-mat-select-search>` (manual / server-side search).
 * Opt out per control: `<mat-select disableMatSelectSearch>`.
 *
 * Autocomplete: the trigger input is already the search field; reuse {@link matchesSelectSearchQuery}
 * (or {@link normalizeSelectSearchText}) inside existing `filter()` / `valueChanges` logic.
 */
@Directive({
  selector: 'mat-select:not([disableMatSelectSearch])',
  standalone: true,
})
export class MatSelectGlobalSearchDirective implements AfterViewInit, OnDestroy {
  private readonly matSelect = inject(MatSelect);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly translate = inject(TranslateService);
  private readonly destroyRef = inject(DestroyRef);

  private currentQuery = '';
  private unlistenInput?: () => void;

  ngAfterViewInit(): void {
    if (this.host.nativeElement.querySelector('ngx-mat-select-search')) {
      return;
    }

    this.matSelect.openedChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((open) => {
      if (open) {
        queueMicrotask(() => this.onPanelOpened());
      } else {
        this.currentQuery = '';
        this.applyFilter('');
      }
    });

    this.matSelect.options.changes.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      if (this.matSelect.panelOpen) {
        this.applyFilter(this.currentQuery);
      }
    });
  }

  ngOnDestroy(): void {
    this.unlistenInput?.();
    this.unlistenInput = undefined;
  }

  private onPanelOpened(): void {
    const panel = this.matSelect.panel;
    if (!panel) {
      return;
    }
    const panelEl = panel.nativeElement;
    let bar = panelEl.querySelector(`.${HOST_CLASS}`) as HTMLElement | null;
    if (!bar) {
      bar = this.createSearchBar(panelEl);
    }
    const input = bar.querySelector(`.${INPUT_CLASS}`) as HTMLInputElement | null;
    if (input) {
      input.value = '';
      this.currentQuery = '';
      const ph = this.translate.instant('MAT_SELECT_SEARCH_PLACEHOLDER');
      input.placeholder = ph;
      this.renderer.setAttribute(input, 'aria-label', ph);
    }
    this.applyFilter('');
    queueMicrotask(() => input?.focus());
  }

  private createSearchBar(panelEl: HTMLElement): HTMLElement {
    const bar = this.renderer.createElement('div') as HTMLElement;
    this.renderer.addClass(bar, HOST_CLASS);

    const icon = this.renderer.createElement('span') as HTMLElement;
    this.renderer.addClass(icon, 'rms-mat-select-panel-search-icon');
    this.renderer.addClass(icon, 'material-icons');
    icon.textContent = 'search';

    const input = this.renderer.createElement('input') as HTMLInputElement;
    this.renderer.addClass(input, INPUT_CLASS);
    this.renderer.setAttribute(input, 'type', 'text');
    this.renderer.setAttribute(input, 'autocomplete', 'off');

    this.unlistenInput?.();
    this.unlistenInput = this.renderer.listen(input, 'input', (event: Event) => {
      const v = (event.target as HTMLInputElement).value;
      this.currentQuery = v;
      this.applyFilter(v);
    });

    const empty = this.renderer.createElement('div') as HTMLElement;
    this.renderer.addClass(empty, EMPTY_CLASS);
    this.renderer.setProperty(empty, 'textContent', this.translate.instant('MAT_SELECT_NO_RESULTS'));
    this.renderer.setStyle(empty, 'display', 'none');

    this.renderer.appendChild(bar, icon);
    this.renderer.appendChild(bar, input);

    const first = panelEl.firstChild;
    if (first) {
      this.renderer.insertBefore(panelEl, bar, first);
    } else {
      this.renderer.appendChild(panelEl, bar);
    }

    if (bar.nextSibling) {
      this.renderer.insertBefore(panelEl, empty, bar.nextSibling);
    } else {
      this.renderer.appendChild(panelEl, empty);
    }

    return bar;
  }

  private applyFilter(raw: string): void {
    const options = this.matSelect.options;
    if (!options?.length) {
      return;
    }

    const q = (raw ?? '').trim();
    let visible = 0;

    for (const opt of options.toArray()) {
      const host = getOptionHost(opt);
      const label = opt.getLabel();
      const keep = !q || opt.selected || matchesSelectSearchQuery(label, raw);
      if (keep) {
        this.renderer.removeClass(host, OPTION_HIDDEN_CLASS);
        visible++;
      } else {
        this.renderer.addClass(host, OPTION_HIDDEN_CLASS);
      }
    }

    const panel = this.matSelect.panel?.nativeElement;
    if (panel) {
      this.syncOptgroups(panel, q);
      const emptyRow = panel.querySelector(`.${EMPTY_CLASS}`) as HTMLElement | null;
      if (emptyRow) {
        const show = !!q && visible === 0;
        this.renderer.setStyle(emptyRow, 'display', show ? 'block' : 'none');
      }
    }
  }

  private syncOptgroups(panelEl: HTMLElement, queryTrimmed: string): void {
    panelEl.querySelectorAll('mat-optgroup').forEach((group) => {
      const opts = Array.from(group.querySelectorAll('mat-option'));
      const anyVisible = opts.some((el) => !el.classList.contains(OPTION_HIDDEN_CLASS));
      const hide = !!queryTrimmed && !anyVisible;
      if (hide) {
        this.renderer.addClass(group, OPTGROUP_HIDDEN_CLASS);
      } else {
        this.renderer.removeClass(group, OPTGROUP_HIDDEN_CLASS);
      }
    });
  }
}
