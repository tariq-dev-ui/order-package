import { Injectable } from '@angular/core';
import { CustomerFormValue, CustomerModel } from './customer.model';
import { CUSTOMERS_ROWS } from './customers.mock';

@Injectable({ providedIn: 'root' })
export class CustomersService {
  private customers: CustomerModel[] = CUSTOMERS_ROWS.map((customer) => ({ ...customer }));

  getAll(): CustomerModel[] {
    return this.customers.map((customer) => ({ ...customer }));
  }

  update(id: string, value: CustomerFormValue): CustomerModel | null {
    // Future backend integration: replace this local update with an update-customer API call.
    let updated: CustomerModel | null = null;

    this.customers = this.customers.map((customer) => {
      if (customer.id !== id) {
        return customer;
      }

      updated = { ...customer, ...value };
      return updated;
    });

    return updated ? { ...(updated as CustomerModel) } : null;
  }

  delete(id: string): void {
    // Future backend integration: replace this local delete with a delete-customer API call.
    this.customers = this.customers.filter((customer) => customer.id !== id);
  }
}
