/**
 * Fiscal Year Component
 * مكون السنة المالية
 */

import { Component, OnInit, inject, signal, computed, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/material.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TablerIconComponent } from 'angular-tabler-icons';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { CoreService } from 'src/app/services/core.service';
import { AddFiscalYearDialogComponent } from './add-fiscal-year-dialog/add-fiscal-year-dialog.component';
import { EditFiscalYearDialogComponent } from './edit-fiscal-year-dialog/edit-fiscal-year-dialog.component';

export interface FiscalYear {
  id: string;
  year: number;
  startDate: Date;
  endDate: Date;
  status: 'upcoming' | 'current' | 'closing' | 'closed';
}

@Component({
  selector: 'app-fiscal-year',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    TranslateModule,
    TablerIconComponent,
    FormsModule
  ],
  templateUrl: './fiscal-year.component.html',
  styleUrl: './fiscal-year.component.scss'
})
export class FiscalYearComponent implements OnInit, AfterViewInit {
  private dialog = inject(MatDialog);
  private coreService = inject(CoreService);
  private translate = inject(TranslateService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<FiscalYear>([]);
  isLoading = signal(false);

  displayedColumns: string[] = [
    'year',
    'startDate',
    'endDate',
    'status',
    'actions',
  ];

  pageSize = signal(10);
  pageIndex = signal(0);
  totalItems = signal(0);

  options = signal(this.coreService.getOptions());
  dir = computed(() => this.options().dir);

  constructor() {
    this.coreService.notify.subscribe(() => {
      this.options.set(this.coreService.getOptions());
    });
  }

  ngOnInit(): void {
    this.loadFiscalYears();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Load Fiscal Years
   */
  loadFiscalYears(): void {
    this.isLoading.set(true);
    try {
      // Mock data based on user requirements
      const mockData: FiscalYear[] = [
        {
          id: '1',
          year: 2022,
          startDate: new Date(2022, 0, 1),
          endDate: new Date(2022, 11, 31),
          status: 'current'
        },
        {
          id: '2',
          year: 2026,
          startDate: new Date(2026, 0, 1),
          endDate: new Date(2026, 11, 31),
          status: 'current'
        },
        {
          id: '3',
          year: 2023,
          startDate: new Date(2023, 0, 1),
          endDate: new Date(2023, 11, 31),
          status: 'closing'
        },
        {
          id: '4',
          year: 2024,
          startDate: new Date(2024, 0, 1),
          endDate: new Date(2024, 11, 31),
          status: 'closing'
        },
        {
          id: '5',
          year: 2020,
          startDate: new Date(2020, 1, 2),
          endDate: new Date(1, 0, 1),
          status: 'closing'
        },
        {
          id: '6',
          year: 2025,
          startDate: new Date(2025, 0, 1),
          endDate: new Date(2025, 11, 31),
          status: 'closing'
        },
        {
          id: '7',
          year: 2027,
          startDate: new Date(2027, 0, 1),
          endDate: new Date(2027, 11, 31),
          status: 'closing'
        },
        {
          id: '8',
          year: 2028,
          startDate: new Date(2028, 0, 1),
          endDate: new Date(2028, 11, 31),
          status: 'closing'
        },
        {
          id: '9',
          year: 2021,
          startDate: new Date(2021, 8, 1),
          endDate: new Date(2021, 11, 31),
          status: 'closed'
        },
        {
          id: '10',
          year: 2019,
          startDate: new Date(2019, 0, 1),
          endDate: new Date(2019, 0, 1),
          status: 'closed'
        }
      ];

      this.dataSource.data = mockData;
      this.totalItems.set(mockData.length);
    } catch (error) {
      console.error('Error loading fiscal years:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  /**
   * Format Date
   */
  formatDate(date: Date): string {
    if (!date || isNaN(date.getTime())) {
      return '-';
    }
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Get Status Label
   */
  getStatusLabel(status: string): string {
    switch (status) {
      case 'upcoming':
        return 'سنة قادمة';
      case 'current':
        return 'سنة حالية';
      case 'closing':
        return 'قيد الإقفال';
      case 'closed':
        return 'سنة مقفلة';
      default:
        return status;
    }
  }

  /**
   * Get Status Color
   */
  getStatusColor(status: string): 'primary' | 'accent' | 'warn' {
    switch (status) {
      case 'upcoming':
        return 'primary';
      case 'current':
        return 'primary';
      case 'closing':
        return 'accent';
      case 'closed':
        return 'warn';
      default:
        return 'primary';
    }
  }

  /**
   * Open Add Fiscal Year Dialog
   */
  openAddFiscalYearDialog(): void {
    const dialogRef = this.dialog.open(AddFiscalYearDialogComponent, {
      width: '500px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Add new fiscal year to the list
        const newFiscalYear: FiscalYear = {
          id: Date.now().toString(),
          year: result.year,
          startDate: result.startDate,
          endDate: result.endDate,
          status: result.status || 'closing'
        };
        
        const currentData = this.dataSource.data;
        this.dataSource.data = [newFiscalYear, ...currentData];
        this.totalItems.set(this.dataSource.data.length);
      }
    });
  }

  /**
   * Edit Fiscal Year
   */
  editFiscalYear(fiscalYear: FiscalYear): void {
    const dialogRef = this.dialog.open(EditFiscalYearDialogComponent, {
      width: '500px',
      disableClose: true,
      data: {
        fiscalYear: {
          year: fiscalYear.year,
          startDate: fiscalYear.startDate,
          endDate: fiscalYear.endDate,
          status: fiscalYear.status
        }
      }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        // Update fiscal year in the list
        const updatedData = this.dataSource.data.map(item => {
          if (item.id === fiscalYear.id) {
            return {
              ...item,
              year: result.year,
              startDate: result.startDate,
              endDate: result.endDate,
              status: result.status || item.status
            };
          }
          return item;
        });
        
        this.dataSource.data = updatedData;
      }
    });
  }

  /**
   * Handle Page Change
   */
  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.pageIndex.set(event.pageIndex);
  }
}

