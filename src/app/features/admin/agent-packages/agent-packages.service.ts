import { Injectable } from '@angular/core';
import { AGENT_PACKAGES, AgentPackage, AgentPackageFormValue } from './agent-package.mock';

@Injectable({ providedIn: 'root' })
export class AgentPackagesService {
  private packages: AgentPackage[] = [...AGENT_PACKAGES];
  private nextIdNum = AGENT_PACKAGES.length + 1;

  getAll(): AgentPackage[] {
    return this.packages.map((p) => ({ ...p }));
  }

  getById(id: string): AgentPackage | null {
    const pkg = this.packages.find((p) => p.id === id);
    return pkg ? { ...pkg } : null;
  }

  add(form: AgentPackageFormValue): AgentPackage {
    const id = `AP-${String(this.nextIdNum++).padStart(2, '0')}`;
    const pkg: AgentPackage = { id, ...form, price: form.price ?? 0 };
    this.packages = [pkg, ...this.packages];
    return { ...pkg };
  }

  update(id: string, form: AgentPackageFormValue): void {
    this.packages = this.packages.map((p) =>
      p.id === id ? { id, ...form, price: form.price ?? 0 } : p
    );
  }

  delete(id: string): void {
    this.packages = this.packages.filter((p) => p.id !== id);
  }
}
