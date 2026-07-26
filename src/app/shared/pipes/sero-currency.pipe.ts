import { Pipe, PipeTransform } from '@angular/core';
import { formatSeroCurrency, SeroCurrencyDisplay } from '../currency/currency-format.util';

@Pipe({
  name: 'seroCurrency',
  standalone: true,
})
export class SeroCurrencyPipe implements PipeTransform {
  transform(
    value: number | string | null | undefined,
    display: SeroCurrencyDisplay = 'symbol',
    fallback = '',
    minimumFractionDigits = 2,
    maximumFractionDigits = minimumFractionDigits,
  ): string {
    return formatSeroCurrency(value, {
      display,
      fallback,
      minimumFractionDigits,
      maximumFractionDigits,
    });
  }
}
