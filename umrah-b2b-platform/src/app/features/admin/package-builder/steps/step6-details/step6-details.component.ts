import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { BookingMode, PackageType, VisaStatus } from '../../../../../core/models/enums';
import { Package } from '../../../../../core/models/package.model';
import { CustomerInfo, OtherServiceSelection } from '../../../../../core/models/package-order.model';

@Component({
  selector: 'app-step6-details',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  template: `
    <div class="step-content animate-fade-in">
      <div class="detail-section">
        <div class="section-header">
          <div>
            <div class="section-title">بيانات العميل</div>
            <div class="section-subtitle">مطلوبة لإرسال الطلب إلى الوكيل</div>
          </div>
        </div>
        <div class="form-grid">
          <div class="form-group">
            <label class="form-label">اسم العميل <span class="required">*</span></label>
            <input class="form-control" [(ngModel)]="customer.name" (ngModelChange)="emitCustomerData()" placeholder="أدخل اسم العميل" />
          </div>
          <div class="form-group">
            <label class="form-label">رقم الهاتف <span class="required">*</span></label>
            <input class="form-control" [(ngModel)]="customer.phone" (ngModelChange)="emitCustomerData()" placeholder="+9665XXXXXXXX" />
          </div>
          <div class="form-group">
            <label class="form-label">البريد الإلكتروني <span class="required">*</span></label>
            <input class="form-control" [(ngModel)]="customer.email" (ngModelChange)="emitCustomerData()" placeholder="customer@email.com" />
          </div>
          <div class="form-group">
            <label class="form-label">ملاحظات العميل</label>
            <input class="form-control" [(ngModel)]="customer.notes" (ngModelChange)="emitCustomerData()" placeholder="أي ملاحظات إضافية" />
          </div>
        </div>
      </div>

      <div class="detail-section">
        <div class="section-header">
          <div>
            <div class="section-title">الخدمات الأخرى</div>
            <div class="section-subtitle">اكتب كل خدمة في سطر مستقل</div>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">قائمة الخدمات <span class="required">*</span></label>
          <textarea
            class="form-control"
            rows="4"
            [(ngModel)]="otherServicesText"
            (ngModelChange)="emitOtherServices()"
            placeholder="مرشد ديني&#10;بطاقة إنترنت&#10;تأمين سفر"></textarea>
        </div>
      </div>

      <div class="detail-section">
        <div class="section-header">
          <div>
            <div class="section-title">تفاصيل الباقة</div>
            <div class="section-subtitle">معلومات عامة عن الطلب</div>
          </div>
        </div>
        <div class="form-grid">
          <div class="form-group col-span-2">
            <label class="form-label">عنوان الباقة</label>
            <input class="form-control" [(ngModel)]="title" (ngModelChange)="emitPackageData()" />
          </div>
          <div class="form-group col-span-2">
            <label class="form-label">وصف الباقة</label>
            <textarea class="form-control" [(ngModel)]="description" (ngModelChange)="emitPackageData()" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">السعة الكلية</label>
            <input class="form-control" type="number" [(ngModel)]="totalCapacity" (ngModelChange)="emitPackageData()" />
          </div>
          <div class="form-group">
            <label class="form-label">عدد الليالي</label>
            <input class="form-control" type="number" [(ngModel)]="nights" (ngModelChange)="emitPackageData()" />
          </div>
          <div class="form-group">
            <label class="form-label">نوع الحجز</label>
            <select class="form-control" [(ngModel)]="bookingMode" (ngModelChange)="emitPackageData()">
              <option [value]="BookingMode.INSTANT">Instant</option>
              <option [value]="BookingMode.REQUEST">Request</option>
              <option [value]="BookingMode.MANUAL">Manual</option>
              <option [value]="BookingMode.INQUIRY">Inquiry</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">حالة التأشيرة</label>
            <select class="form-control" [(ngModel)]="visaStatus" (ngModelChange)="emitPackageData()">
              <option [value]="VisaStatus.INCLUDED">Included</option>
              <option [value]="VisaStatus.NOT_INCLUDED">Not Included</option>
              <option [value]="VisaStatus.OPTIONAL">Optional</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">تاريخ المغادرة</label>
            <input class="form-control" type="date" [(ngModel)]="departureDateStr" (ngModelChange)="emitPackageData()" />
          </div>
          <div class="form-group">
            <label class="form-label">نوع الباقة</label>
            <select class="form-control" [(ngModel)]="packageType" (ngModelChange)="emitPackageData()">
              <option [value]="PackageType.SHARED">Shared</option>
              <option [value]="PackageType.PRIVATE_RESELL">Private Resell</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="step-nav">
        <button class="btn btn--secondary btn--lg" (click)="prev.emit()">
          <span class="material-icons-round">arrow_back</span> {{ 'common.buttons.back' | translate }}
        </button>
        <button class="btn btn--primary btn--lg" (click)="next.emit()">
          {{ 'builder.navigation.nextPricing' | translate }} <span class="material-icons-round">arrow_forward</span>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .step-content { padding: var(--space-xl); max-width: 920px; margin: 0 auto; }

    .detail-section {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
      padding: var(--space-xl);
      margin-bottom: var(--space-lg);
    }

    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: var(--space-md); }
    .col-span-2 { grid-column: 1 / -1; }

    .step-nav {
      display: flex; align-items: center; justify-content: space-between;
      margin-top: var(--space-xl); padding-top: var(--space-xl); border-top: 1px solid var(--color-border);
    }
  `]
})
export class Step6DetailsComponent implements OnInit {
  @Input() packageData!: Partial<Package>;
  @Output() dataChanged = new EventEmitter<Partial<Package>>();
  @Output() next = new EventEmitter<void>();
  @Output() prev = new EventEmitter<void>();
  @Output() customerInfoChanged = new EventEmitter<CustomerInfo>();
  @Output() otherServicesChanged = new EventEmitter<OtherServiceSelection[]>();

  PackageType = PackageType;
  BookingMode = BookingMode;
  VisaStatus = VisaStatus;

  title = '';
  description = '';
  totalCapacity = 50;
  nights = 14;
  visaStatus = VisaStatus.INCLUDED;
  bookingMode = BookingMode.INSTANT;
  packageType = PackageType.SHARED;
  departureDateStr = '';
  customer: CustomerInfo = { name: '', phone: '', email: '', notes: '' };
  otherServicesText = '';

  ngOnInit(): void {
    this.title = this.packageData.title || '';
    this.description = this.packageData.description || '';
    this.totalCapacity = this.packageData.totalCapacity || 50;
    this.nights = this.packageData.nights || 14;
    this.visaStatus = this.packageData.visaStatus || VisaStatus.INCLUDED;
    this.bookingMode = this.packageData.bookingMode || BookingMode.INSTANT;
    this.packageType = this.packageData.type || PackageType.SHARED;
  }

  emitCustomerData(): void {
    this.customerInfoChanged.emit({ ...this.customer });
  }

  emitOtherServices(): void {
    const services = this.otherServicesText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((name) => ({ name }));

    this.otherServicesChanged.emit(services);
  }

  emitPackageData(): void {
    const update: Partial<Package> = {
      title: this.title,
      description: this.description,
      totalCapacity: this.totalCapacity,
      nights: this.nights,
      visaStatus: this.visaStatus,
      bookingMode: this.bookingMode,
      isInstantBooking: this.bookingMode === BookingMode.INSTANT,
      type: this.packageType,
      departureDate: this.departureDateStr ? new Date(this.departureDateStr) : undefined
    };
    this.dataChanged.emit(update);
  }
}
