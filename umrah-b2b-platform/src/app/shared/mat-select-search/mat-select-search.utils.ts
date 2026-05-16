/**
 * Shared text normalization for mat-select panel search and optional mat-autocomplete filters.
 * Use the same helpers in component `filter()` callbacks so autocomplete behavior matches selects.
 */

/** Unicode NFC + trim; folds Latin case for partial matching (Arabic text passes through unchanged for matching). */
export function normalizeSelectSearchText(value: string): string {
  return (value ?? '').normalize('NFC').trim().toLocaleLowerCase();
}

/** True if option label contains the query as a substring after normalization (partial match). */
export function matchesSelectSearchQuery(optionLabel: string, rawQuery: string): boolean {
  if (!(rawQuery ?? '').trim()) {
    return true;
  }
  const hay = normalizeSelectSearchText(optionLabel);
  const needle = normalizeSelectSearchText(rawQuery);
  return needle.length === 0 || hay.includes(needle);
}
