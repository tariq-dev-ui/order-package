import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import {
  PricingSimulationInput, PricingSimulationResult, PricingConfig
} from '../models/pricing.model';
import { MarkupType } from '../models/enums';
import { formatSeroCurrency } from '../../shared/currency/currency-format.util';

@Injectable({ providedIn: 'root' })
export class PricingService {

  simulate(input: PricingSimulationInput): PricingSimulationResult {
    const { baseAdminCost, markupType, markupValue, paxCount, includeVisa, visaCost, groupDiscount } = input;

    const totalBase = baseAdminCost + (includeVisa ? visaCost : 0);

    const markupAmount = markupType === MarkupType.PERCENTAGE
      ? totalBase * (markupValue / 100)
      : markupValue;

    const sellingPrice = totalBase + markupAmount;
    const discountAmount = sellingPrice * (groupDiscount / 100);
    const priceAfterDiscount = sellingPrice - discountAmount;
    const totalProfit = markupAmount * paxCount;
    const profitPercentage = totalBase > 0 ? (markupAmount / totalBase) * 100 : 0;

    return {
      basePrice: totalBase,
      markupAmount,
      sellingPrice,
      profitPerPax: markupAmount,
      totalProfit,
      profitPercentage: Math.round(profitPercentage * 10) / 10,
      priceAfterDiscount
    };
  }

  simulateAsync(input: PricingSimulationInput): Observable<PricingSimulationResult> {
    return of(this.simulate(input)).pipe(delay(100));
  }

  calculateProfitMargin(costBreakdownTotal: number, sellingPrice: number): number {
    return sellingPrice - costBreakdownTotal;
  }

  calculateProfitPercentage(costBreakdownTotal: number, sellingPrice: number): number {
    if (costBreakdownTotal === 0) return 0;
    return Math.round(((sellingPrice - costBreakdownTotal) / costBreakdownTotal) * 1000) / 10;
  }

  applyMarkup(basePrice: number, type: MarkupType, value: number): number {
    if (type === MarkupType.PERCENTAGE) {
      return basePrice + basePrice * (value / 100);
    }
    return basePrice + value;
  }

  formatCurrency(amount: number, currency = 'SAR'): string {
    return formatSeroCurrency(amount, {
      currency,
      display: currency === 'SAR' ? 'symbol' : 'code',
      maximumFractionDigits: 0,
      minimumFractionDigits: 0,
    });
  }
}
