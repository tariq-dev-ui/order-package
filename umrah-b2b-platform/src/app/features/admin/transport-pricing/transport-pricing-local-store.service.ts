import { Injectable } from '@angular/core';
import {
  TRANSPORT_PRICING_ROWS,
  TransportPricingFormValue,
  TransportPricingRow,
} from './transport-pricing.mock';

@Injectable({ providedIn: 'root' })
export class TransportPricingLocalStoreService {
  private rows: TransportPricingRow[] = [...TRANSPORT_PRICING_ROWS];

  getRows(): TransportPricingRow[] {
    return this.rows.map((row) => ({ ...row }));
  }

  getRow(rowCode: string): TransportPricingRow | null {
    const row = this.rows.find((currentRow) => currentRow.code === rowCode);
    return row ? { ...row } : null;
  }

  savePackage(form: TransportPricingFormValue): void {
    const row: TransportPricingRow = {
      code: form.code.trim(),
      title: form.packageName.trim(),
      vehicleType: form.vehicleType,
      company: form.company,
      startDate: form.startDate,
      endDate: form.endDate,
      isActive: form.isActive,
    };

    this.rows = [row, ...this.rows.filter((existingRow) => existingRow.code !== row.code)];
  }

  updateRow(row: TransportPricingRow): void {
    this.rows = this.rows.map((existingRow) => existingRow.code === row.code ? { ...row } : existingRow);
  }

  deleteRow(rowCode: string): void {
    this.rows = this.rows.filter((row) => row.code !== rowCode);
  }
}
