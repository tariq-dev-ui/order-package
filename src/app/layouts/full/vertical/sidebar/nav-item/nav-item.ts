import { PageAuthActions } from 'src/app/services/user-auth.service';

export interface NavItem {
  pageId?: number;
  displayName?: string;
  displayNameEn?: string;
  displayOrder?: number;
  disabled?: boolean;
  external?: boolean;
  twoLines?: boolean;
  chip?: boolean;
  iconName?: string;
  navCap?: string;
  chipContent?: string;
  chipClass?: string;
  subtext?: string;
  route?: string;
  queryParams?: { [key: string]: any };
  children?: NavItem[];
  ddType?: string;
  isChild:boolean;
  authActions: PageAuthActions[];
}
