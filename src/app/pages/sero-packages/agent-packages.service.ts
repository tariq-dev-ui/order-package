import { Injectable } from '@angular/core';
import { SeroPackageModel } from './agent-package.model';
import { mockAgentPackages } from './agent-packages.mock';

@Injectable({ providedIn: 'root' })
export class AgentPackagesMockService {
  // Currently using local mock data for frontend prototype. Later this can be replaced with backend API.
  private packages: SeroPackageModel[] = mockAgentPackages.map((item) => this.clonePackage(item));
  private nextPackageId = 1100;

  getAll(filters: { agentId?: number; includeInactive?: boolean; pageIndex?: number; pageSize?: number } = {}): SeroPackageModel[] {
    const includeInactive = filters.includeInactive ?? false;
    let data = this.packages.filter((item) => includeInactive || item.IsActive !== false);

    if (filters.agentId) {
      data = data.filter((item) => (item.Agents ?? []).some((agent) => agent.AgentId === filters.agentId));
    }

    const pageIndex = filters.pageIndex ?? 0;
    const pageSize = filters.pageSize ?? data.length;
    return data.slice(pageIndex * pageSize, pageIndex * pageSize + pageSize).map((item) => this.clonePackage(item));
  }

  count(filters: { agentId?: number; includeInactive?: boolean } = {}): number {
    return this.getAll({ ...filters, pageIndex: 0, pageSize: Number.MAX_SAFE_INTEGER }).length;
  }

  getById(packageId?: number): SeroPackageModel {
    const found = this.packages.find((item) => item.PackageID === packageId) ?? this.packages[0];
    return this.clonePackage(found);
  }

  create(body: SeroPackageModel): SeroPackageModel {
    const created: SeroPackageModel = {
      ...this.clonePackage(body),
      PackageID: this.nextPackageId++,
      PackageCode: body.PackageCode || `PKG-LOCAL-${this.nextPackageId}`,
      IsActive: body.IsActive ?? true,
      AddedBy: body.AddedBy || 'Prototype Admin',
      AddedDate: body.AddedDate || new Date(),
    };
    this.packages = [created, ...this.packages];
    return this.clonePackage(created);
  }

  update(packageId: number | undefined, body: SeroPackageModel): SeroPackageModel {
    const id = packageId ?? body.PackageID;
    if (!id) {
      return this.create(body);
    }

    const index = this.packages.findIndex((item) => item.PackageID === id);
    const updated: SeroPackageModel = {
      ...(index >= 0 ? this.packages[index] : {}),
      ...this.clonePackage(body),
      PackageID: id,
      LastUpdateBy: 'Prototype Admin',
      LastUpdateDate: new Date(),
    };

    if (index >= 0) {
      this.packages = this.packages.map((item, itemIndex) => (itemIndex === index ? updated : item));
    } else {
      this.packages = [updated, ...this.packages];
    }

    return this.clonePackage(updated);
  }

  setImage(packageId: number | undefined, imageUrl: string | null): SeroPackageModel {
    const current = this.getById(packageId);
    return this.update(packageId, { ...current, ImageUrl: imageUrl });
  }

  private clonePackage<T>(item: T): T {
    return structuredClone(item);
  }
}
