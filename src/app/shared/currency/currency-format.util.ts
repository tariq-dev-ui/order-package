export const SAUDI_RIYAL_SYMBOL = '\uFDFC';
export const SAUDI_RIYAL_CODE = 'SAR';

export type SeroCurrencyDisplay = 'symbol' | 'code';

export interface SeroCurrencyFormatOptions {
  currency?: string;
  display?: SeroCurrencyDisplay;
  fallback?: string;
  locale?: string;
  maximumFractionDigits?: number;
  minimumFractionDigits?: number;
}

export function formatSeroCurrency(
  value: number | string | null | undefined,
  options: SeroCurrencyFormatOptions = {},
): string {
  const numericValue = normalizeCurrencyValue(value);

  if (numericValue === null) {
    return options.fallback ?? '';
  }

  const formatter = new Intl.NumberFormat(options.locale ?? 'en-US', {
    maximumFractionDigits: options.maximumFractionDigits ?? 2,
    minimumFractionDigits: options.minimumFractionDigits ?? 2,
    useGrouping: true,
  });

  const suffix = options.display === 'code'
    ? (options.currency ?? SAUDI_RIYAL_CODE)
    : SAUDI_RIYAL_SYMBOL;

  return `${formatter.format(numericValue)} ${suffix}`;
}

function normalizeCurrencyValue(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const numericValue = typeof value === 'number'
    ? value
    : Number(value.replace(/,/g, ''));

  return Number.isFinite(numericValue) ? numericValue : null;
}
