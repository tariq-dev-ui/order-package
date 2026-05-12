import { Injectable } from '@angular/core';
import {
  Agent, Package, SubagentAllocation, DistributionConfig, PackageOwnership
} from '../models';
import {
  UserRole, PackageType, PackageStatus, BookingMode, VisaStatus,
  HotelRating, TransportType, DistributionStatus, PricingPermission,
  CommissionModel, SubagentAccessMode, MarkupType
} from '../models/enums';

@Injectable({ providedIn: 'root' })
export class MockDataService {

  readonly agents: Agent[] = [
    {
      id: 'admin-001',
      name: 'TARIQ AMER',
      companyName: 'Umrah Platform Admin',
      email: 'admin@umrahplatform.com',
      phone: '+966501234567',
      country: 'Saudi Arabia',
      city: 'Riyadh',
      role: UserRole.ADMIN,
      isVerified: true,
      isActive: true,
      joinedAt: new Date('2022-01-01'),
      lastActiveAt: new Date(),
      totalSales: 0,
      totalRevenue: 0,
      pendingBalance: 0,
      commissionRate: 0
    },
    {
      id: 'master-001',
      name: 'Abdullah Al-Noor',
      companyName: 'Al Noor Travel & Tourism',
      email: 'abdullahalnoor@alnoortravel.com',
      phone: '+966551234567',
      country: 'Saudi Arabia',
      city: 'Jeddah',
      role: UserRole.MASTER_AGENT,
      isVerified: true,
      isActive: true,
      subagentIds: ['agent-001', 'agent-002', 'agent-003'],
      joinedAt: new Date('2022-03-15'),
      lastActiveAt: new Date(),
      totalSales: 248,
      totalRevenue: 1240000,
      pendingBalance: 42000,
      commissionRate: 8,
      licenseNumber: 'SA-TA-20221847'
    },
    {
      id: 'master-002',
      name: 'Khalid Al-Zamil',
      companyName: 'Zamil Tourism Group',
      email: 'khalid@zamiltourism.com',
      phone: '+966501112233',
      country: 'Saudi Arabia',
      city: 'Riyadh',
      role: UserRole.MASTER_AGENT,
      isVerified: true,
      isActive: true,
      subagentIds: ['agent-004', 'agent-005'],
      joinedAt: new Date('2022-06-10'),
      lastActiveAt: new Date(),
      totalSales: 185,
      totalRevenue: 925000,
      pendingBalance: 18500,
      commissionRate: 7,
      licenseNumber: 'SA-TA-20224519'
    },
    {
      id: 'agent-001',
      name: 'Tariq Hassan',
      companyName: 'Hassan Travel Agency',
      email: 'tariq@hassantravel.com',
      phone: '+966509876543',
      country: 'Saudi Arabia',
      city: 'Makkah',
      role: UserRole.SUB_AGENT,
      isVerified: true,
      isActive: true,
      masterAgentId: 'master-001',
      joinedAt: new Date('2022-05-20'),
      lastActiveAt: new Date(),
      totalSales: 64,
      totalRevenue: 320000,
      pendingBalance: 12000,
      commissionRate: 5
    },
    {
      id: 'agent-002',
      name: 'Yusuf Badr',
      companyName: 'Badr Pilgrim Services',
      email: 'yusuf@badrpilgrim.com',
      phone: '+966508765432',
      country: 'Saudi Arabia',
      city: 'Madinah',
      role: UserRole.SUB_AGENT,
      isVerified: true,
      isActive: true,
      masterAgentId: 'master-001',
      joinedAt: new Date('2022-07-12'),
      lastActiveAt: new Date(),
      totalSales: 48,
      totalRevenue: 240000,
      pendingBalance: 9600,
      commissionRate: 5
    },
    {
      id: 'agent-003',
      name: 'Ibrahim Qureshi',
      companyName: 'Qureshi Umrah Services',
      email: 'ibrahim@qureshitravel.com',
      phone: '+923001234567',
      country: 'Pakistan',
      city: 'Lahore',
      role: UserRole.SUB_AGENT,
      isVerified: false,
      isActive: true,
      masterAgentId: 'master-001',
      joinedAt: new Date('2023-01-05'),
      lastActiveAt: new Date(),
      totalSales: 22,
      totalRevenue: 110000,
      pendingBalance: 4400,
      commissionRate: 4
    },
    {
      id: 'agent-004',
      name: 'Amr Mostafa',
      companyName: 'Mostafa Hajj & Umrah',
      email: 'amr@mostafaftravel.com',
      phone: '+201012345678',
      country: 'Egypt',
      city: 'Cairo',
      role: UserRole.SUB_AGENT,
      isVerified: true,
      isActive: true,
      masterAgentId: 'master-002',
      joinedAt: new Date('2022-09-01'),
      lastActiveAt: new Date(),
      totalSales: 91,
      totalRevenue: 455000,
      pendingBalance: 18200,
      commissionRate: 5
    },
    {
      id: 'agent-005',
      name: 'Bilal Chaudhry',
      companyName: 'Chaudhry Travel & Tours',
      email: 'bilal@chaudhrytravel.pk',
      phone: '+923214567890',
      country: 'Pakistan',
      city: 'Karachi',
      role: UserRole.SUB_AGENT,
      isVerified: true,
      isActive: true,
      masterAgentId: 'master-002',
      joinedAt: new Date('2023-02-18'),
      lastActiveAt: new Date(),
      totalSales: 55,
      totalRevenue: 275000,
      pendingBalance: 11000,
      commissionRate: 4.5
    }
  ];

  readonly packages: Package[] = [
    {
      id: 'pkg-001',
      title: 'Premium Umrah Ramadan Gold Package',
      description: 'Luxury 21-night Umrah experience during Ramadan featuring 5-star accommodation steps from Haram, private transport, and business class flights.',
      thumbnailUrl: 'assets/images/packages/pkg-ramadan-gold.jpg',
      type: PackageType.PRIVATE_RESELL,
      status: PackageStatus.ACTIVE,
      bookingMode: BookingMode.INSTANT,
      isInstantBooking: true,
      isVerified: true,
      makkahHotels: [{
        id: 'hotel-m-001', name: 'Fairmont Makkah Clock Royal Tower',
        city: 'makkah', rating: HotelRating.FIVE, distanceToHaram: 0.05,
        nights: 14, roomType: 'Deluxe King', mealPlan: 'Breakfast & Dinner',
        checkIn: new Date('2026-03-01'), checkOut: new Date('2026-03-15'),
        thumbnailUrl: 'assets/images/hotels/fairmont.jpg'
      }],
      madinahHotels: [{
        id: 'hotel-d-001', name: 'Anwar Al Madinah Mövenpick Hotel',
        city: 'madinah', rating: HotelRating.FIVE, distanceToHaram: 0.1,
        nights: 7, roomType: 'Superior Room', mealPlan: 'Full Board',
        checkIn: new Date('2026-03-15'), checkOut: new Date('2026-03-22'),
        thumbnailUrl: 'assets/images/hotels/movenpick.jpg'
      }],
      transportation: [{
        id: 'trans-001', type: TransportType.VIP_BUS,
        route: 'Airport → Makkah → Madinah → Airport',
        capacity: 20, isAirConditioned: true, provider: 'Al Mowasalat Premium'
      }],
      tickets: [{
        id: 'ticket-001', airline: 'Saudi Arabian Airlines',
        flightNumber: 'SV-301', origin: 'JED', destination: 'JED',
        departureDate: new Date('2026-03-01'), returnDate: new Date('2026-03-22'),
        class: 'business', baggageAllowance: 40
      }],
      catering: [{
        id: 'catering-001', provider: 'Al Barakah Catering',
        mealsPerDay: 3, mealTypes: ['Breakfast', 'Lunch', 'Dinner'],
        dietaryOptions: ['Halal', 'Vegetarian'], serviceLocation: 'Hotel'
      }],
      visaStatus: VisaStatus.INCLUDED,
      visaCost: 500,
      validFrom: new Date('2026-02-01'),
      validTo: new Date('2026-03-31'),
      departureDate: new Date('2026-03-01'),
      totalCapacity: 50,
      soldCount: 18,
      reservedCount: 6,
      distributionConfig: {
        packageId: 'pkg-001',
        masterAgentId: 'master-001',
        masterAgentName: 'Al Noor Travel & Tourism',
        allowReselling: true,
        subagentAccessMode: SubagentAccessMode.SELECTED,
        selectedSubagentIds: ['agent-001', 'agent-002'],
        pricingPermission: PricingPermission.AGENT_MARKUP,
        hideOriginalCost: true,
        commissionModel: CommissionModel.PERCENTAGE,
        commissionValue: 8,
        allocatedInventory: 50,
        reservedInventory: 6,
        soldInventory: 18,
        status: DistributionStatus.ACTIVE,
        createdAt: new Date('2026-01-10'),
        expiresAt: new Date('2026-03-31')
      },
      pricingConfig: {
        currency: 'SAR',
        costBreakdown: {
          hotelMakkah: 8400, hotelMadinah: 3500, transportation: 800,
          tickets: 4200, catering: 1200, visa: 500, other: 400, total: 19000
        },
        adminCostTotal: 19000,
        agentMargin: { type: MarkupType.PERCENTAGE, value: 15, calculatedAmount: 2850 },
        finalSellingPrice: 21850,
        profitMargin: 2850,
        profitPercentage: 15,
        hideServiceBreakdown: true,
        hideCostFromSubagents: true,
        isBlendedPrice: true,
        perPersonPrice: 21850
      },
      ownership: {
        createdByAdminId: 'admin-001',
        createdByAdminName: 'Umrah Platform Admin',
        distributedByAgentId: 'master-001',
        distributedByAgentName: 'Al Noor Travel & Tourism',
        ownershipChain: [
          { id: 'admin-001', name: 'Umrah Platform Admin', role: 'Admin', level: 0, timestamp: new Date('2026-01-05') },
          { id: 'master-001', name: 'Al Noor Travel & Tourism', role: 'Master Agent', level: 1, timestamp: new Date('2026-01-10') }
        ]
      },
      tags: ['ramadan', 'vip', 'luxury', '5-star', 'business-class'],
      nights: 21,
      paxCount: 1,
      createdAt: new Date('2026-01-05'),
      updatedAt: new Date('2026-01-15')
    },
    {
      id: 'pkg-002',
      title: 'Economy Umrah Package — Standard 14 Nights',
      description: 'Affordable 14-night Umrah package with 4-star hotels, economy class flights, and shuttle service. Ideal for first-time pilgrims.',
      thumbnailUrl: 'assets/images/packages/pkg-economy-14.jpg',
      type: PackageType.SHARED,
      status: PackageStatus.ACTIVE,
      bookingMode: BookingMode.REQUEST,
      isInstantBooking: false,
      isVerified: true,
      makkahHotels: [{
        id: 'hotel-m-002', name: 'Hilton Suites Makkah',
        city: 'makkah', rating: HotelRating.FOUR, distanceToHaram: 0.3,
        nights: 7, roomType: 'Standard Room', mealPlan: 'Breakfast',
        checkIn: new Date('2026-04-01'), checkOut: new Date('2026-04-08')
      }],
      madinahHotels: [{
        id: 'hotel-d-002', name: 'Dar Al Eiman Royal Hotel',
        city: 'madinah', rating: HotelRating.FOUR, distanceToHaram: 0.2,
        nights: 7, roomType: 'Standard Room', mealPlan: 'Breakfast',
        checkIn: new Date('2026-04-08'), checkOut: new Date('2026-04-15')
      }],
      transportation: [{
        id: 'trans-002', type: TransportType.BUS,
        route: 'Airport → Hotels → Airport',
        capacity: 40, isAirConditioned: true, provider: 'Saptco'
      }],
      tickets: [{
        id: 'ticket-002', airline: 'flynas',
        flightNumber: 'XY-100', origin: 'CAI', destination: 'JED',
        departureDate: new Date('2026-04-01'), returnDate: new Date('2026-04-15'),
        class: 'economy', baggageAllowance: 23
      }],
      catering: [],
      visaStatus: VisaStatus.INCLUDED,
      visaCost: 350,
      validFrom: new Date('2026-03-15'),
      validTo: new Date('2026-04-30'),
      departureDate: new Date('2026-04-01'),
      totalCapacity: 120,
      soldCount: 45,
      reservedCount: 12,
      pricingConfig: {
        currency: 'SAR',
        costBreakdown: {
          hotelMakkah: 2800, hotelMadinah: 2100, transportation: 400,
          tickets: 1800, catering: 0, visa: 350, other: 150, total: 7600
        },
        adminCostTotal: 7600,
        agentMargin: { type: MarkupType.PERCENTAGE, value: 12, calculatedAmount: 912 },
        finalSellingPrice: 8512,
        profitMargin: 912,
        profitPercentage: 12,
        hideServiceBreakdown: false,
        hideCostFromSubagents: false,
        isBlendedPrice: false,
        perPersonPrice: 8512
      },
      ownership: {
        createdByAdminId: 'admin-001',
        createdByAdminName: 'Umrah Platform Admin',
        ownershipChain: [
          { id: 'admin-001', name: 'Umrah Platform Admin', role: 'Admin', level: 0, timestamp: new Date('2026-02-01') }
        ]
      },
      tags: ['economy', 'standard', '4-star', 'shared'],
      nights: 14,
      paxCount: 1,
      createdAt: new Date('2026-02-01'),
      updatedAt: new Date('2026-02-10')
    },
    {
      id: 'pkg-003',
      title: 'Family Umrah Deluxe — 10 Nights VIP',
      description: 'Premium family package for 2 adults & 2 children. Connecting rooms, private transport, and dedicated family concierge.',
      thumbnailUrl: 'assets/images/packages/pkg-family-vip.jpg',
      type: PackageType.PRIVATE_RESELL,
      status: PackageStatus.ACTIVE,
      bookingMode: BookingMode.INSTANT,
      isInstantBooking: true,
      isVerified: true,
      makkahHotels: [{
        id: 'hotel-m-003', name: 'Swissôtel Makkah',
        city: 'makkah', rating: HotelRating.FIVE, distanceToHaram: 0.08,
        nights: 5, roomType: 'Family Suite Connecting', mealPlan: 'Half Board',
        checkIn: new Date('2026-05-10'), checkOut: new Date('2026-05-15')
      }],
      madinahHotels: [{
        id: 'hotel-d-003', name: 'Le Méridien Madinah',
        city: 'madinah', rating: HotelRating.FIVE, distanceToHaram: 0.15,
        nights: 5, roomType: 'Family Room', mealPlan: 'Half Board',
        checkIn: new Date('2026-05-15'), checkOut: new Date('2026-05-20')
      }],
      transportation: [{
        id: 'trans-003', type: TransportType.PRIVATE_CAR,
        route: 'Jeddah → Makkah → Madinah → Jeddah',
        capacity: 6, isAirConditioned: true, provider: 'Qasr Limousine'
      }],
      tickets: [{
        id: 'ticket-003', airline: 'Emirates',
        flightNumber: 'EK-803', origin: 'DXB', destination: 'JED',
        departureDate: new Date('2026-05-10'), returnDate: new Date('2026-05-20'),
        class: 'economy', baggageAllowance: 30
      }],
      catering: [{
        id: 'catering-002', provider: 'Family Kitchen',
        mealsPerDay: 2, mealTypes: ['Breakfast', 'Dinner'],
        dietaryOptions: ['Halal', 'Kids Menu'], serviceLocation: 'Hotel & Room Service'
      }],
      visaStatus: VisaStatus.INCLUDED,
      visaCost: 1400,
      validFrom: new Date('2026-04-15'),
      validTo: new Date('2026-05-31'),
      departureDate: new Date('2026-05-10'),
      totalCapacity: 30,
      soldCount: 8,
      reservedCount: 4,
      distributionConfig: {
        packageId: 'pkg-003',
        masterAgentId: 'master-002',
        masterAgentName: 'Zamil Tourism Group',
        allowReselling: true,
        subagentAccessMode: SubagentAccessMode.ALL,
        pricingPermission: PricingPermission.AGENT_MARKUP,
        hideOriginalCost: true,
        commissionModel: CommissionModel.FIXED_AMOUNT,
        commissionValue: 1500,
        allocatedInventory: 30,
        reservedInventory: 4,
        soldInventory: 8,
        status: DistributionStatus.ACTIVE,
        createdAt: new Date('2026-03-01')
      },
      pricingConfig: {
        currency: 'SAR',
        costBreakdown: {
          hotelMakkah: 6000, hotelMadinah: 4500, transportation: 1200,
          tickets: 6400, catering: 800, visa: 1400, other: 600, total: 20900
        },
        adminCostTotal: 20900,
        agentMargin: { type: MarkupType.PERCENTAGE, value: 18, calculatedAmount: 3762 },
        finalSellingPrice: 24662,
        profitMargin: 3762,
        profitPercentage: 18,
        hideServiceBreakdown: true,
        hideCostFromSubagents: true,
        isBlendedPrice: true,
        perPersonPrice: 12331,
        childPrice: 9000,
        infantPrice: 2000
      },
      ownership: {
        createdByAdminId: 'admin-001',
        createdByAdminName: 'Umrah Platform Admin',
        distributedByAgentId: 'master-002',
        distributedByAgentName: 'Zamil Tourism Group',
        ownershipChain: [
          { id: 'admin-001', name: 'Umrah Platform Admin', role: 'Admin', level: 0, timestamp: new Date('2026-02-20') },
          { id: 'master-002', name: 'Zamil Tourism Group', role: 'Master Agent', level: 1, timestamp: new Date('2026-03-01') }
        ]
      },
      tags: ['family', 'vip', '5-star', 'private-transport', 'connecting-rooms'],
      nights: 10,
      paxCount: 4,
      createdAt: new Date('2026-02-20'),
      updatedAt: new Date('2026-03-05')
    }
  ];

  readonly allocations: SubagentAllocation[] = [
    {
      id: 'alloc-001',
      distributionId: 'dist-001',
      packageId: 'pkg-001',
      subagentId: 'agent-001',
      subagentName: 'Tariq Hassan',
      subagentCompany: 'Hassan Travel Agency',
      allocatedUnits: 20,
      soldUnits: 12,
      remainingUnits: 8,
      sellingPrice: 23500,
      markup: 1650,
      status: DistributionStatus.ACTIVE,
      assignedAt: new Date('2026-01-12'),
      expiresAt: new Date('2026-03-31')
    },
    {
      id: 'alloc-002',
      distributionId: 'dist-001',
      packageId: 'pkg-001',
      subagentId: 'agent-002',
      subagentName: 'Yusuf Badr',
      subagentCompany: 'Badr Pilgrim Services',
      allocatedUnits: 10,
      soldUnits: 6,
      remainingUnits: 4,
      sellingPrice: 22800,
      markup: 950,
      status: DistributionStatus.ACTIVE,
      assignedAt: new Date('2026-01-12'),
      expiresAt: new Date('2026-03-31')
    },
    {
      id: 'alloc-003',
      distributionId: 'dist-002',
      packageId: 'pkg-003',
      subagentId: 'agent-004',
      subagentName: 'Amr Mostafa',
      subagentCompany: 'Mostafa Hajj & Umrah',
      allocatedUnits: 15,
      soldUnits: 5,
      remainingUnits: 10,
      sellingPrice: 26000,
      markup: 1338,
      status: DistributionStatus.ACTIVE,
      assignedAt: new Date('2026-03-05'),
      expiresAt: new Date('2026-05-31')
    },
    {
      id: 'alloc-004',
      distributionId: 'dist-002',
      packageId: 'pkg-003',
      subagentId: 'agent-005',
      subagentName: 'Bilal Chaudhry',
      subagentCompany: 'Chaudhry Travel & Tours',
      allocatedUnits: 15,
      soldUnits: 3,
      remainingUnits: 12,
      sellingPrice: 25500,
      markup: 838,
      status: DistributionStatus.ACTIVE,
      assignedAt: new Date('2026-03-05'),
      expiresAt: new Date('2026-05-31')
    }
  ];

  getPackageById(id: string): Package | undefined {
    return this.packages.find(p => p.id === id);
  }

  getAgentById(id: string): Agent | undefined {
    return this.agents.find(a => a.id === id);
  }

  getSubagentsForMaster(masterAgentId: string): Agent[] {
    return this.agents.filter(a => a.masterAgentId === masterAgentId);
  }

  getAllocationsForPackage(packageId: string): SubagentAllocation[] {
    return this.allocations.filter(a => a.packageId === packageId);
  }

  getPackagesForMasterAgent(masterAgentId: string): Package[] {
    return this.packages.filter(
      p => p.distributionConfig?.masterAgentId === masterAgentId
    );
  }
}
