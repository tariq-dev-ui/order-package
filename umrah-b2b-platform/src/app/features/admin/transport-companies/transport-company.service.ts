import { Injectable } from '@angular/core';
import {
  TRANSPORT_COMPANIES,
  TransportCompany,
  TransportCompanyFormValue,
} from './transport-company.mock';

@Injectable({ providedIn: 'root' })
export class TransportCompanyService {
  private companies: TransportCompany[] = [...TRANSPORT_COMPANIES];
  private nextIdNum = TRANSPORT_COMPANIES.length + 1;

  getAll(): TransportCompany[] {
    return this.companies.map((c) => ({ ...c }));
  }

  getById(id: string): TransportCompany | null {
    const company = this.companies.find((c) => c.id === id);
    return company ? { ...company } : null;
  }

  add(form: TransportCompanyFormValue): TransportCompany {
    const id = `TC-${String(this.nextIdNum++).padStart(2, '0')}`;
    const company: TransportCompany = { id, ...form };
    this.companies = [company, ...this.companies];
    return { ...company };
  }

  update(id: string, form: TransportCompanyFormValue): void {
    this.companies = this.companies.map((c) => (c.id === id ? { id, ...form } : c));
  }

  delete(id: string): void {
    this.companies = this.companies.filter((c) => c.id !== id);
  }
}
