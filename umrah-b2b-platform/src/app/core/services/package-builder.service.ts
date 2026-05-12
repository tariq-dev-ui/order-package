import { Injectable, Signal, signal } from '@angular/core';
import { Package, PackageVisibilityType } from '../models/package.model';
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
  selectedAgents: string[];
  selectedGroups: string[];
  allowReselling: boolean;
  hideOriginalCost: boolean;
  subagentAccessMode: SubagentAccessMode;
  pricingPermission: PricingPermission;
  commissionModel: CommissionModel;
  commissionValue: number;
  allocatedInventory: number;
}

@Injectable({ providedIn: 'root' })
export class PackageBuilderService {
  private readonly makkahHotels = signal<PackageHotelSelection[]>([]);
  private readonly visibilityState = signal<PackageVisibilityState>({
    visibilityType: 'shared',
    selectedAgents: [],
    selectedGroups: [],
    allowReselling: true,
    hideOriginalCost: true,
    subagentAccessMode: SubagentAccessMode.ALL,
    pricingPermission: PricingPermission.AGENT_MARKUP,
    commissionModel: CommissionModel.PERCENTAGE,
    commissionValue: 8,
    allocatedInventory: 50
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

  setVisibilityType(type: PackageVisibilityType): void {
    this.visibilityState.update((current) => ({
      ...current,
      visibilityType: type,
      selectedAgents: type === 'private' ? current.selectedAgents : [],
      selectedGroups: type === 'group' ? current.selectedGroups : []
    }));
  }

  setSelectedAgents(agentIds: string[]): void {
    this.visibilityState.update((current) => ({
      ...current,
      selectedAgents: [...agentIds]
    }));
  }

  setSelectedGroups(groupIds: string[]): void {
    this.visibilityState.update((current) => ({
      ...current,
      selectedGroups: [...groupIds]
    }));
  }

  setAllowReselling(value: boolean): void {
    this.visibilityState.update((current) => ({ ...current, allowReselling: value }));
  }

  setHideOriginalCost(value: boolean): void {
    this.visibilityState.update((current) => ({ ...current, hideOriginalCost: value }));
  }

  setSubagentAccessMode(value: SubagentAccessMode): void {
    this.visibilityState.update((current) => ({ ...current, subagentAccessMode: value }));
  }

  setPricingPermission(value: PricingPermission): void {
    this.visibilityState.update((current) => ({ ...current, pricingPermission: value }));
  }

  setCommissionModel(value: CommissionModel): void {
    this.visibilityState.update((current) => ({ ...current, commissionModel: value }));
  }

  setCommissionValue(value: number): void {
    this.visibilityState.update((current) => ({ ...current, commissionValue: value }));
  }

  setAllocatedInventory(value: number): void {
    this.visibilityState.update((current) => ({ ...current, allocatedInventory: value }));
  }

  resetBuilderState(): void {
    this.makkahHotels.set([]);
    this.visibilityState.set({
      visibilityType: 'shared',
      selectedAgents: [],
      selectedGroups: [],
      allowReselling: true,
      hideOriginalCost: true,
      subagentAccessMode: SubagentAccessMode.ALL,
      pricingPermission: PricingPermission.AGENT_MARKUP,
      commissionModel: CommissionModel.PERCENTAGE,
      commissionValue: 8,
      allocatedInventory: 50
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

    if (packageData.visibilityType === 'private' && !(packageData.selectedAgents?.length)) {
      errors.push('يرجى اختيار وكيل واحد على الأقل لنوع الظهور الخاص');
    }

    if (packageData.visibilityType === 'group' && !(packageData.selectedGroups?.length)) {
      errors.push('يرجى اختيار مجموعة واحدة على الأقل لنوع ظهور المجموعات');
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
}
