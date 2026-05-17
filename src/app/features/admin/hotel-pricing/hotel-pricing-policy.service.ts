import { Injectable } from '@angular/core';
import {
  HOTEL_PRICING_POLICIES,
  HotelPricingPolicy,
  HotelPricingPolicyFormValue,
} from './hotel-pricing-policy.mock';

@Injectable({ providedIn: 'root' })
export class HotelPricingPolicyService {
  private policies: HotelPricingPolicy[] = [...HOTEL_PRICING_POLICIES];
  private nextIdNum = HOTEL_PRICING_POLICIES.length + 1;

  getAll(): HotelPricingPolicy[] {
    return this.policies.map((p) => ({ ...p }));
  }

  getById(id: string): HotelPricingPolicy | null {
    const policy = this.policies.find((p) => p.id === id);
    return policy ? { ...policy } : null;
  }

  add(form: HotelPricingPolicyFormValue): HotelPricingPolicy {
    const id = `HP-${String(this.nextIdNum++).padStart(3, '0')}`;
    const policy: HotelPricingPolicy = { id, ...form };
    this.policies = [policy, ...this.policies];
    return { ...policy };
  }

  update(id: string, form: HotelPricingPolicyFormValue): void {
    this.policies = this.policies.map((p) => (p.id === id ? { id, ...form } : p));
  }

  delete(id: string): void {
    this.policies = this.policies.filter((p) => p.id !== id);
  }

  toggleStatus(id: string, isActive: boolean): void {
    this.policies = this.policies.map((p) => (p.id === id ? { ...p, isActive } : p));
  }
}
