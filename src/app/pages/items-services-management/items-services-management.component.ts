import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { MaterialModule } from 'src/app/material.module';
import { TranslateModule } from '@ngx-translate/core';
import { TablerIconComponent } from 'angular-tabler-icons';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { AppSnackBarService } from 'src/app/services/app-snack-bar.service';
import { AddServiceDialogComponent } from './add-service-dialog/add-service-dialog.component';
import { AddServiceTypeDialogComponent } from './add-service-type-dialog/add-service-type-dialog.component';
import { formatSeroCurrency } from 'src/app/shared/currency/currency-format.util';

export type ServiceType = string; // Now dynamic, using string keys

interface ServiceTypeInfo {
  value: string;
  label: string;
  labelEn: string;
}

interface Service {
  id: number;
  nameAr: string;
  nameEn: string;
  serviceType: ServiceType;
  purchasePrice: number;
  sellingPrice: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
}

@Component({
  selector: 'app-items-services-management',
  standalone: true,
  imports: [
    CommonModule,
    MaterialModule,
    TranslateModule,
    TablerIconComponent,
    MatTableModule,
  ],
  templateUrl: './items-services-management.component.html',
  styleUrl: './items-services-management.component.scss',
})
export class ItemsServicesManagementComponent implements OnInit {
  private dialog = inject(MatDialog);
  private snackBarService = inject(AppSnackBarService);

  isLoading = signal(false);
  services = signal<Service[]>([]);
  
  // Selected service type tab
  selectedServiceType = signal<ServiceType | 'all'>('all');
  
  // Service type options (now dynamic)
  serviceTypes = signal<ServiceTypeInfo[]>([
    { value: 'laundry', label: 'مغسلة', labelEn: 'Laundry' },
    { value: 'cleaning', label: 'نضافة', labelEn: 'Cleaning' },
    { value: 'grocery', label: 'بقالة', labelEn: 'Grocery' },
  ]);

  // Table columns for services
  serviceDisplayedColumns: string[] = ['nameAr', 'purchasePrice', 'sellingPrice', 'status', 'actions'];

  // Computed: Filtered services by selected type
  filteredServices = computed(() => {
    const allServices = this.services();
    const selectedType = this.selectedServiceType();
    
    if (selectedType === 'all') {
      return allServices;
    }
    
    return allServices.filter(service => service.serviceType === selectedType);
  });

  // Computed: Group services by type
  servicesByType = computed(() => {
    const allServices = this.services();
    const grouped: { [key: string]: Service[] } = {};
    
    // Initialize all service types
    this.serviceTypes().forEach(type => {
      grouped[type.value] = [];
    });
    
    // Group services
    allServices.forEach(service => {
      if (!grouped[service.serviceType]) {
        grouped[service.serviceType] = [];
      }
      grouped[service.serviceType].push(service);
    });
    
    return grouped;
  });

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    
    // Load services (mock data for now)
    setTimeout(() => {
      const mockData: Service[] = [
        {
          id: 1,
          nameAr: 'غسيل وكي الملابس',
          nameEn: 'Laundry and Ironing',
          serviceType: 'laundry',
          purchasePrice: 50,
          sellingPrice: 80,
          isActive: true,
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 2,
          nameAr: 'غسيل سجاد',
          nameEn: 'Carpet Cleaning',
          serviceType: 'laundry',
          purchasePrice: 100,
          sellingPrice: 150,
          isActive: true,
          createdAt: new Date('2024-01-02'),
        },
        {
          id: 3,
          nameAr: 'تنظيف الغرفة',
          nameEn: 'Room Cleaning',
          serviceType: 'cleaning',
          purchasePrice: 30,
          sellingPrice: 50,
          isActive: true,
          createdAt: new Date('2024-01-03'),
        },
        {
          id: 4,
          nameAr: 'تنظيف عميق',
          nameEn: 'Deep Cleaning',
          serviceType: 'cleaning',
          purchasePrice: 80,
          sellingPrice: 120,
          isActive: true,
          createdAt: new Date('2024-01-04'),
        },
        {
          id: 5,
          nameAr: 'مستلزمات غرفة',
          nameEn: 'Room Supplies',
          serviceType: 'grocery',
          purchasePrice: 20,
          sellingPrice: 35,
          isActive: true,
          createdAt: new Date('2024-01-05'),
        },
        {
          id: 6,
          nameAr: 'وجبات جاهزة',
          nameEn: 'Ready Meals',
          serviceType: 'grocery',
          purchasePrice: 40,
          sellingPrice: 70,
          isActive: true,
          createdAt: new Date('2024-01-06'),
        },
      ];
      
      this.services.set(mockData);
      this.isLoading.set(false);
    }, 500);
  }


  switchServiceType(type: ServiceType | 'all') {
    this.selectedServiceType.set(type);
  }

  getServiceTypeLabel(type: ServiceType | 'all'): string {
    if (type === 'all') {
      return '';
    }
    const serviceType = this.serviceTypes().find(st => st.value === type);
    return serviceType?.label || type;
  }

  addNewServiceType() {
    const dialogRef = this.dialog.open(AddServiceTypeDialogComponent, {
      width: '700px',
      maxWidth: '95vw',
      disableClose: false,
      data: {
        existingTypes: this.serviceTypes(),
        onAdd: (newType: ServiceTypeInfo) => {
          this.serviceTypes.update(types => [...types, newType]);
          this.snackBarService.showSuccessSnackBar('تم إضافة نوع الخدمة بنجاح');
        },
        onUpdate: (oldType: ServiceTypeInfo, newType: ServiceTypeInfo) => {
          this.serviceTypes.update(types => 
            types.map(t => t.value === oldType.value ? newType : t)
          );
          this.snackBarService.showSuccessSnackBar('تم تحديث نوع الخدمة بنجاح');
        },
        onDelete: (type: ServiceTypeInfo) => {
          this.serviceTypes.update(types => types.filter(t => t.value !== type.value));
          this.snackBarService.showSuccessSnackBar('تم حذف نوع الخدمة بنجاح');
        },
      },
    });
  }

  addNewService(serviceType?: ServiceType) {
    const dialogRef = this.dialog.open(AddServiceDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: { 
        serviceType,
        serviceTypes: this.serviceTypes(),
        existingServices: this.services(),
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.success) {
        const newService: Service = {
          id: Date.now(),
          ...result.data,
          isActive: true,
          createdAt: new Date(),
        };
        this.services.update(services => [...services, newService]);
        this.snackBarService.showSuccessSnackBar('تم إضافة الخدمة بنجاح');
      }
    });
  }

  addNewServiceForSelectedType() {
    const selectedType = this.selectedServiceType();
    if (selectedType !== 'all') {
      this.addNewService(selectedType);
    } else {
      this.addNewService();
    }
  }

  editService(service: Service) {
    // TODO: Open edit dialog (can reuse AddServiceDialogComponent with edit mode)
    this.snackBarService.showSuccessSnackBar(`سيتم فتح نافذة تعديل: ${service.nameAr}`);
  }

  deleteService(service: Service) {
    if (confirm(`هل أنت متأكد من حذف "${service.nameAr}"?`)) {
      this.services.update(services => services.filter(s => s.id !== service.id));
      this.snackBarService.showSuccessSnackBar('تم حذف الخدمة بنجاح');
    }
  }

  toggleStatus(service: Service) {
    this.services.update(services => 
      services.map(s => 
        s.id === service.id ? { ...s, isActive: !s.isActive } : s
      )
    );
    this.snackBarService.showSuccessSnackBar(
      `تم ${service.isActive ? 'تعطيل' : 'تفعيل'} ${service.nameAr} بنجاح`
    );
  }

  formatPrice(price: number): string {
    return formatSeroCurrency(price);
  }
}

