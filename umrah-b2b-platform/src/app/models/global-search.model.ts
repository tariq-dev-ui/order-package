/**
 * Dashboard global search — unified hit shape.
 * Backend: map API DTOs to GlobalSearchHit; keep `route` + `queryParams` stable for deep links.
 */

export type GlobalSearchEntityKind =
  | 'booking'
  | 'sub_booking'
  | 'b2b_booking'
  | 'guest'
  | 'company'
  | 'room'
  | 'floor'
  | 'branch_owner'
  | 'module_page'
  | 'journal_entry';

export interface GlobalSearchHit {
  id: string;
  kind: GlobalSearchEntityKind;
  /** ngx-translate key for the entity-type badge */
  entityLabelKey: string;
  primaryText: string;
  secondaryText: string;
  /** `Router.navigate()` commands */
  route: string[];
  queryParams?: Record<string, string | number>;
  /**
   * Precomputed lowercase string (Arabic + English + numbers) for fast `includes` matching.
   * Extend when wiring real API (e.g. normalize diacritics).
   */
  matchText: string;
}
