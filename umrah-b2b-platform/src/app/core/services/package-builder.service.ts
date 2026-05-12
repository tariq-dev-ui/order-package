import { Injectable, Signal, signal } from '@angular/core';
import { Package, PackageVisibilityType } from '../models/package.model';
import { Agent } from '../models/agent.model';
import { CustomerInfo, OtherServiceSelection } from '../models/package-order.model';
import { PackageHotelSelection } from '../models/package-builder-ui.model';
import {
  CommissionModel,
  PricingPermission,
  SubagentAccessMode
} from '../models/enums';

export interface PackageBuilderValidation {
  isValid: boolean;
  errors: string[];
}

export interface PackageVisibilityState {
  visibilityType: PackageVisibilityType;
  selectedAgent: Agent | null;
  selectedGroups: string[];
  allowReselling: boolean;
  hideOriginalCost: boolean;
  subagentAccessMode: SubagentAccessMode;
  pricingPermission: PricingPermission;
  commissionModel: CommissionModel;
  commissionValue: number;
  allocatedInventory: number;
}

type VisibilityConfigState = Omit<PackageVisibilityState, 'visibilityType'>;

const DEFAULT_VISIBILITY_PROFILE: VisibilityConfigState = {
  selectedAgent: null,
  selectedGroups: [],
  allowReselling: true,
  hideOriginalCost: true,
  subagentAccessMode: SubagentAccessMode.ALL,
  pricingPermission: PricingPermission.AGENT_MARKUP,
  commissionModel: CommissionModel.PERCENTAGE,
  commissionValue: 8,
  allocatedInventory: 50
};

@Injectable({ providedIn: 'root' })
export class PackageBuilderService {
  private readonly makkahHotels = signal<PackageHotelSelection[]>([]);
  private readonly visibilityProfiles = signal<Record<PackageVisibilityType, VisibilityConfigState>>({
    shared: { ...DEFAULT_VISIBILITY_PROFILE },
    private: {
      ...DEFAULT_VISIBILITY_PROFILE,
      subagentAccessMode: SubagentAccessMode.SELECTED
    },
    group: {
      ...DEFAULT_VISIBILITY_PROFILE,
      subagentAccessMode: SubagentAccessMode.SELECTED
    }
  });
  private readonly visibilityState = signal<PackageVisibilityState>({
    visibilityType: 'shared',
    ...DEFAULT_VISIBILITY_PROFILE
  });

  getMakkahHotelsSignal(): Signal<PackageHotelSelection[]> {
    return this.makkahHotels.asReadonly();
  }

  setMakkahHotels(hotels: PackageHotelSelection[]): void {
    this.makkahHotels.set([...hotels]);
  }

  addMakkahHotel(hotel: PackageHotelSelection): void {
    this.makkahHotels.update((current) => [...current, hotel]);
  }

  updateMakkahHotel(hotelId: string, hotel: PackageHotelSelection): void {
    this.makkahHotels.update((current) =>
      current.map((item) => (item.id === hotelId ? hotel : item))
    );
  }

  removeMakkahHotel(hotelId: string): void {
    this.makkahHotels.update((current) => current.filter((item) => item.id !== hotelId));
  }

  getVisibilitySignal(): Signal<PackageVisibilityState> {
    return this.visibilityState.asReadonly();
  }

  setVisibilityState(state: PackageVisibilityState): void {
    const normalized: PackageVisibilityState = {
      ...state,
      selectedAgent: state.selectedAgent ? { ...state.selectedAgent } : null,
      selectedGroups: [...(state.selectedGroups || [])],
      visibilityType: state.visibilityType || 'shared'
    };

    this.visibilityProfiles.update((current) => ({
      ...current,
      [normalized.visibilityType]: this.extractProfile(normalized)
    }));
    this.visibilityState.set(normalized);
  }

  setVisibilityType(type: PackageVisibilityType): void {
    const profile = this.visibilityProfiles()[type] || { ...DEFAULT_VISIBILITY_PROFILE };
    this.visibilityState.set({
      visibilityType: type,
      ...profile
    });
  }

  setSelectedAgent(agent: Agent | null): void {
    this.patchVisibility({
      selectedAgent: agent ? { ...agent } : null
    });
  }

  setSelectedGroups(groupIds: string[]): void {
    this.patchVisibility({
      selectedGroups: [...groupIds]
    });
  }

  setAllowReselling(value: boolean): void {
    this.patchVisibility({ allowReselling: value });
  }

  setHideOriginalCost(value: boolean): void {
    this.patchVisibility({ hideOriginalCost: value });
  }

  setSubagentAccessMode(value: SubagentAccessMode): void {
    this.patchVisibility({ subagentAccessMode: value });
  }

  setPricingPermission(value: PricingPermission): void {
    this.patchVisibility({ pricingPermission: value });
  }

  setCommissionModel(value: CommissionModel): void {
    this.patchVisibility({ commissionModel: value });
  }

  setCommissionValue(value: number): void {
    this.patchVisibility({ commissionValue: value });
  }

  setAllocatedInventory(value: number): void {
    this.patchVisibility({ allocatedInventory: value });
  }

  resetBuilderState(): void {
    this.makkahHotels.set([]);
    this.visibilityProfiles.set({
      shared: { ...DEFAULT_VISIBILITY_PROFILE },
      private: {
        ...DEFAULT_VISIBILITY_PROFILE,
        subagentAccessMode: SubagentAccessMode.SELECTED
      },
      group: {
        ...DEFAULT_VISIBILITY_PROFILE,
        subagentAccessMode: SubagentAccessMode.SELECTED
      }
    });
    this.visibilityState.set({
      visibilityType: 'shared',
      ...DEFAULT_VISIBILITY_PROFILE
    });
  }

  validateForOrderCreation(
    packageData: Partial<Package>,
    customerInfo: CustomerInfo,
    otherServices: OtherServiceSelection[]
  ): PackageBuilderValidation {
    const errors: string[] = [];

    if (!customerInfo.name?.trim()) {
      errors.push('يرجى إدخال اسم العميل');
    }

    if (!customerInfo.phone?.trim()) {
      errors.push('يرجى إدخال رقم هاتف العميل');
    }

    if (!customerInfo.email?.trim()) {
      errors.push('يرجى إدخال البريد الإلكتروني للعميل');
    }

    if (!packageData.makkahHotels?.length) {
      errors.push('يجب إضافة فندق مكة واحد على الأقل');
    }

    if (!packageData.madinahHotels?.length) {
      errors.push('يجب إضافة فندق المدينة واحد على الأقل');
    }

    if (!packageData.transportation?.length) {
      errors.push('يجب إضافة وسيلة نقل واحدة على الأقل');
    }

    if (!packageData.tickets?.length) {
      errors.push('يجب إضافة تذكرة واحدة على الأقل');
    }

    if (!packageData.catering?.length) {
      errors.push('يجب إضافة خدمة طعام واحدة على الأقل');
    }

    if (packageData.visibilityType === 'private' && !packageData.selectedAgent?.id) {
      errors.push('يجب اختيار الوكيل الخاص بالباقة');
    }
    if (packageData.visibilityType === 'group' && !(packageData.selectedGroups?.length)) {
      errors.push('يرجى اختيار مجموعة واحدة على الأقل لنوع الظهور الجماعي');
    }

    if (!otherServices.length) {
      errors.push('يرجى إضافة خدمة واحدة على الأقل في قسم الخدمات الأخرى');
    }

    if (!packageData.pricingConfig?.finalSellingPrice || packageData.pricingConfig.finalSellingPrice <= 0) {
      errors.push('يرجى إكمال التسعير وتحديد سعر نهائي صالح');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private patchVisibility(patch: Partial<PackageVisibilityState>): void {
    this.visibilityState.update((current) => {
      const next = {
        ...current,
        ...patch,
        selectedAgent: patch.selectedAgent !== undefined
          ? (patch.selectedAgent ? { ...patch.selectedAgent } : null)
          : current.selectedAgent,
        selectedGroups: patch.selectedGroups ? [...patch.selectedGroups] : current.selectedGroups
      };

      this.updateCurrentProfile(next);
      return next;
    });
  }

  private updateCurrentProfile(state: PackageVisibilityState): void {
    this.visibilityProfiles.update((current) => ({
      ...current,
      [state.visibilityType]: this.extractProfile(state)
    }));
  }

  private extractProfile(state: PackageVisibilityState): VisibilityConfigState {
    return {
      selectedAgent: state.selectedAgent ? { ...state.selectedAgent } : null,
      selectedGroups: [...state.selectedGroups],
      allowReselling: state.allowReselling,
      hideOriginalCost: state.hideOriginalCost,
      subagentAccessMode: state.subagentAccessMode,
      pricingPermission: state.pricingPermission,
      commissionModel: state.commissionModel,
      commissionValue: state.commissionValue,
      allocatedInventory: state.allocatedInventory
    };
  }
}
