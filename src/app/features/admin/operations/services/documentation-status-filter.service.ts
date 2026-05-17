import { Injectable } from '@angular/core';
import { DocumentationStatus, DocumentationStatusRecord } from '../models/documentation-status.model';

@Injectable({ providedIn: 'root' })
export class DocumentationStatusFilterService {
  readonly defaultStatus: DocumentationStatus = 'pending';

  getStatus(item: DocumentationStatusRecord | null | undefined): DocumentationStatus {
    return item?.documentationStatus ?? this.defaultStatus;
  }

  filterByStatus<T extends DocumentationStatusRecord>(items: readonly T[], status: DocumentationStatus): T[] {
    return items.filter((item) => this.getStatus(item) === status);
  }

  countByStatus<T extends DocumentationStatusRecord>(items: readonly T[], status: DocumentationStatus): number {
    return items.reduce((count, item) => count + (this.getStatus(item) === status ? 1 : 0), 0);
  }
}
