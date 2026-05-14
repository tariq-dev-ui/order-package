import { SeroDropdownOption } from '../../../shared/components/sero-dropdown/sero-dropdown.component';

export interface AgentPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  startDate: string;
  endDate: string;
  visaIncluded: boolean;
  imageUrl: string | null;
  country: string;
  region: string;
  city: string;
  agent: string;
  isActive: boolean;
}

export interface AgentPackageFilterState {
  country: string;
  region: string;
  city: string;
  agent: string;
  includeInactive: boolean;
}

export interface AgentPackageFormValue {
  name: string;
  description: string;
  price: number | null;
  startDate: string;
  endDate: string;
  visaIncluded: boolean;
  imageUrl: string | null;
  country: string;
  region: string;
  city: string;
  agent: string;
  isActive: boolean;
}

export const AGENT_PACKAGE_DEFAULT_FILTERS: AgentPackageFilterState = {
  country: '',
  region: '',
  city: '',
  agent: '',
  includeInactive: false,
};

export const AGENT_PACKAGE_ITEMS_PER_PAGE_OPTIONS = [5, 10, 20];

export const AGENT_PACKAGE_COUNTRY_OPTIONS: SeroDropdownOption<string>[] = [
  { value: '', label: 'كل الدول' },
  { value: 'SA', label: 'المملكة العربية السعودية' },
  { value: 'EG', label: 'مصر' },
  { value: 'AE', label: 'الإمارات العربية المتحدة' },
];

export const AGENT_PACKAGE_REGION_OPTIONS: SeroDropdownOption<string>[] = [
  { value: '', label: 'كل المناطق' },
  { value: 'makkah-region', label: 'منطقة مكة المكرمة' },
  { value: 'madinah-region', label: 'المنطقة المدنية' },
  { value: 'riyadh-region', label: 'منطقة الرياض' },
];

export const AGENT_PACKAGE_CITY_OPTIONS: SeroDropdownOption<string>[] = [
  { value: '', label: 'كل المدن' },
  { value: 'makkah', label: 'مكة المكرمة' },
  { value: 'madinah', label: 'المدينة المنورة' },
  { value: 'jeddah', label: 'جدة' },
  { value: 'riyadh', label: 'الرياض' },
];

export const AGENT_PACKAGE_AGENT_OPTIONS: SeroDropdownOption<string>[] = [
  { value: '', label: 'كل الوكلاء' },
  { value: 'agent-01', label: 'وكالة النور' },
  { value: 'agent-02', label: 'وكالة السفر الذهبي' },
  { value: 'agent-03', label: 'وكالة الحرمين' },
];

export function createAgentPackageFormValue(): AgentPackageFormValue {
  return {
    name: '', description: '', price: null,
    startDate: '', endDate: '', visaIncluded: false, imageUrl: null,
    country: '', region: '', city: '', agent: '', isActive: true,
  };
}

export const AGENT_PACKAGES: AgentPackage[] = [
  {
    id: 'AP-01', name: 'family', description: '', price: 803,
    startDate: '2026-05-14', endDate: '2026-05-31', visaIncluded: false,
    imageUrl: null, country: 'SA', region: 'makkah-region', city: 'makkah', agent: 'agent-01', isActive: true,
  },
  {
    id: 'AP-02', name: 'pkg', description: 'pkg', price: 1000,
    startDate: '2026-05-12', endDate: '2026-05-20', visaIncluded: false,
    imageUrl: null, country: 'SA', region: 'makkah-region', city: 'jeddah', agent: 'agent-02', isActive: true,
  },
  {
    id: 'AP-03', name: '10G20P', description: '10 Guest and 20 Package', price: 1000,
    startDate: '2026-05-12', endDate: '2026-05-19', visaIncluded: false,
    imageUrl: null, country: 'SA', region: 'madinah-region', city: 'madinah', agent: 'agent-01', isActive: true,
  },
  {
    id: 'AP-04', name: '4 guests', description: '4x packages', price: 1425,
    startDate: '2026-05-09', endDate: '2026-06-30', visaIncluded: false,
    imageUrl: null, country: 'SA', region: 'riyadh-region', city: 'riyadh', agent: 'agent-03', isActive: true,
  },
  {
    id: 'AP-05', name: 'SepPkg', description: 'May Package', price: 4500,
    startDate: '2026-05-07', endDate: '2026-05-29', visaIncluded: false,
    imageUrl: null, country: 'SA', region: 'makkah-region', city: 'makkah', agent: 'agent-02', isActive: true,
  },
  {
    id: 'AP-06', name: 'HajjPlus', description: 'Hajj Package Plus', price: 8500,
    startDate: '2026-06-01', endDate: '2026-06-20', visaIncluded: true,
    imageUrl: null, country: 'SA', region: 'makkah-region', city: 'makkah', agent: 'agent-01', isActive: true,
  },
  {
    id: 'AP-07', name: 'UmrahEco', description: 'Economy Umrah', price: 2200,
    startDate: '2026-04-01', endDate: '2026-04-30', visaIncluded: true,
    imageUrl: null, country: 'SA', region: 'makkah-region', city: 'jeddah', agent: 'agent-03', isActive: false,
  },
  {
    id: 'AP-08', name: 'GoldTour', description: 'Golden Tour Package', price: 6000,
    startDate: '2026-07-01', endDate: '2026-07-15', visaIncluded: true,
    imageUrl: null, country: 'SA', region: 'madinah-region', city: 'madinah', agent: 'agent-02', isActive: true,
  },
  {
    id: 'AP-09', name: 'Deluxe5N', description: 'Deluxe 5 Nights', price: 3200,
    startDate: '2026-06-10', endDate: '2026-06-15', visaIncluded: false,
    imageUrl: null, country: 'SA', region: 'makkah-region', city: 'makkah', agent: 'agent-01', isActive: true,
  },
  {
    id: 'AP-10', name: 'VIPUmrah', description: 'VIP Umrah Experience', price: 12000,
    startDate: '2026-08-01', endDate: '2026-08-10', visaIncluded: true,
    imageUrl: null, country: 'SA', region: 'makkah-region', city: 'makkah', agent: 'agent-02', isActive: true,
  },
];
