import { SeroDropdownOption } from '../../../shared/components/sero-dropdown/sero-dropdown.component';

export type TransportCompanyStatusFilter = 'all' | 'فعال' | 'غير فعال';

export interface TransportCompany {
  id: string;
  code: string;
  arabicName: string;
  englishName: string;
  isActive: boolean;
}

export interface TransportCompanyFilterState {
  status: TransportCompanyStatusFilter;
}

export interface TransportCompanyFormValue {
  code: string;
  arabicName: string;
  englishName: string;
  isActive: boolean;
}

export const TRANSPORT_COMPANY_DEFAULT_FILTERS: TransportCompanyFilterState = {
  status: 'all',
};

export const TRANSPORT_COMPANY_STATUS_OPTIONS: SeroDropdownOption<TransportCompanyStatusFilter>[] = [
  { value: 'all', label: 'الكل' },
  { value: 'فعال', label: 'فعال' },
  { value: 'غير فعال', label: 'غير فعال' },
];

export const TRANSPORT_COMPANY_ITEMS_PER_PAGE_OPTIONS = [5, 10, 20];

export const TRANSPORT_COMPANIES: TransportCompany[] = [
  { id: 'TC-01', code: '01', arabicName: 'شركة 2',               englishName: 'Company 2',                    isActive: true  },
  { id: 'TC-02', code: '02', arabicName: 'الجزيرة للنقل',        englishName: 'AL Jazerah for Transporation', isActive: true  },
  { id: 'TC-03', code: '03', arabicName: 'test3Engli',            englishName: 'test3Engli',                   isActive: true  },
  { id: 'TC-04', code: '04', arabicName: 'البرق',                 englishName: 'AlBarq',                       isActive: true  },
  { id: 'TC-05', code: '05', arabicName: 'أمجاد للنقل',          englishName: 'Amjad for transportation',     isActive: true  },
  { id: 'TC-06', code: '06', arabicName: 'الشركة الوطنية للنقل', englishName: 'National Transport Co.',        isActive: true  },
  { id: 'TC-07', code: '07', arabicName: 'الخطوط السعودية',      englishName: 'Saudi Lines',                  isActive: false },
  { id: 'TC-08', code: '08', arabicName: 'مكة إكسبريس',          englishName: 'Makkah Express',               isActive: true  },
  { id: 'TC-09', code: '09', arabicName: 'نقل المدينة',           englishName: 'Al Madinah Transport',         isActive: false },
  { id: 'TC-10', code: '10', arabicName: 'ناقلات الخليج',         englishName: 'Gulf Carriers',                isActive: true  },
  { id: 'TC-11', code: '11', arabicName: 'طرق الصحراء',           englishName: 'Desert Routes',                isActive: true  },
];
