import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

// Currently using local mock data for frontend prototype. Later this can be replaced with backend API.

type ServiceKey = 'makkah' | 'madina' | 'transport' | 'tickets' | 'food';

type ServiceCard = {
  key: ServiceKey;
  title: string;
  subtitle: string;
  iconClass: string;
  accentClass: string;
  badge: string;
  location: string;
  summary: string;
};

type ServiceStatus = 'Active' | 'Pending' | 'Draft' | 'Fully Booked' | 'Expired';

type ServicePreviewRow = {
  key: ServiceKey;
  title: string;
  typeLabel: string;
  location: string;
  capacity: string;
  availability: string;
  pricing: string;
  updated: string;
  notes: string;
  status: ServiceStatus;
  iconClass: string;
  accentClass: string;
};

@Component({
  selector: 'my-services-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './my-services.html',
})
export class MyServicesPage {
  isPickerOpen = false;

  readonly summaryCards = [
    { label: 'Total Services', value: '6', subLabel: 'Operational catalog', iconClass: 'fas fa-layer-group', accentClass: 'bg-primary-100 text-primary-700' },
    { label: 'Active Services', value: '2', subLabel: 'Ready for booking', iconClass: 'fas fa-check-circle', accentClass: 'bg-emerald-100 text-emerald-700' },
    { label: 'Drafts', value: '1', subLabel: 'Needs completion', iconClass: 'fas fa-pencil-alt', accentClass: 'bg-violet-100 text-violet-700' },
    { label: 'Average Pricing', value: 'SAR 622', subLabel: 'Across visible services', iconClass: 'fas fa-receipt', accentClass: 'bg-amber-100 text-amber-700' },
  ] as const;

  readonly filterPills = [
    'All Service Types',
    'All Cities',
    'All Status',
    'All Prices',
    'Any Update',
  ] as const;

  readonly serviceCards: ServiceCard[] = [
    {
      key: 'makkah',
      title: 'Makkah Service',
      subtitle: 'Hotels and room setup near key zones',
      iconClass: 'fas fa-kaaba',
      accentClass: 'bg-emerald-100 text-emerald-700',
      badge: 'Ready',
      location: 'Makkah',
      summary: 'District, category, room type, and room count.',
    },
    {
      key: 'madina',
      title: 'Madina Service',
      subtitle: 'Accommodation planning for Madina stay',
      iconClass: 'fas fa-mosque',
      accentClass: 'bg-violet-100 text-violet-700',
      badge: 'Ready',
      location: 'Madina',
      summary: 'Hotel criteria with flexible stay details.',
    },
    {
      key: 'transport',
      title: 'Transport Service',
      subtitle: 'Route and vehicle allocation',
      iconClass: 'fas fa-bus',
      accentClass: 'bg-sky-100 text-sky-700',
      badge: 'Ready',
      location: 'Intercity',
      summary: 'Trip route, transport type, and vehicles count.',
    },
    {
      key: 'tickets',
      title: 'Tickets Service',
      subtitle: 'Flight ticket planning and seat volume',
      iconClass: 'fas fa-ticket-alt',
      accentClass: 'bg-amber-100 text-amber-700',
      badge: 'Ready',
      location: 'International',
      summary: 'Source/destination, airline, class, and seats.',
    },
    {
      key: 'food',
      title: 'Food Service',
      subtitle: 'Meal plan and catering quantity',
      iconClass: 'fas fa-utensils',
      accentClass: 'bg-primary-100 text-primary-700',
      badge: 'Ready',
      location: 'On-site',
      summary: 'Food type, meal plan, and number of meals.',
    },
  ];

  readonly servicePreviewRows: ServicePreviewRow[] = [
    {
      key: 'makkah',
      title: 'Makkah Hotel Service',
      typeLabel: 'Accommodation',
      location: 'Al Haram — Makkah',
      capacity: '4 Rooms',
      availability: '12 Jun - 18 Jun',
      pricing: 'Starting from SAR 450',
      updated: 'Updated 2h ago',
      notes: 'Visa included, family rooms confirmed, late check-in supported.',
      status: 'Active',
      iconClass: 'fas fa-hotel',
      accentClass: 'bg-emerald-100 text-emerald-700',
    },
    {
      key: 'transport',
      title: 'Transport Service',
      typeLabel: 'Transport',
      location: 'Airport Transfer — Madina',
      capacity: '3 Vehicles',
      availability: 'Daily departures',
      pricing: 'Per vehicle SAR 150',
      updated: 'Updated 6h ago',
      notes: 'Two drivers assigned, luggage trailer available on request.',
      status: 'Active',
      iconClass: 'fas fa-bus',
      accentClass: 'bg-sky-100 text-sky-700',
    },
    {
      key: 'food',
      title: 'Catering Service',
      typeLabel: 'Food',
      location: 'Quba — Madina',
      capacity: '150 Meals',
      availability: '14 Jun - 20 Jun',
      pricing: 'Per guest SAR 80',
      updated: 'Updated yesterday',
      notes: 'Kitchen is at full allocation for Friday dinner.',
      status: 'Fully Booked',
      iconClass: 'fas fa-utensils',
      accentClass: 'bg-primary-100 text-primary-700',
    },
    {
      key: 'tickets',
      title: 'Tickets Service',
      typeLabel: 'Tickets',
      location: 'Riyadh Station',
      capacity: '40 Seats',
      availability: 'Expired 10 May',
      pricing: 'Starting from SAR 350',
      updated: 'Updated 2w ago',
      notes: 'Fare window expired. Refresh supplier allocation before reuse.',
      status: 'Expired',
      iconClass: 'fas fa-ticket-alt',
      accentClass: 'bg-amber-100 text-amber-700',
    },
    {
      key: 'madina',
      title: 'Madina Hotel Service',
      typeLabel: 'Accommodation',
      location: 'Central Area — Madina',
      capacity: '2 Rooms',
      availability: 'Pending schedule',
      pricing: 'Starting from SAR 390',
      updated: 'Updated 1d ago',
      notes: 'Draft needs confirmed room split and final nights count.',
      status: 'Draft',
      iconClass: 'fas fa-mosque',
      accentClass: 'bg-violet-100 text-violet-700',
    },
  ];

  togglePicker(): void {
    this.isPickerOpen = !this.isPickerOpen;
  }

  statusClass(status: ServiceStatus): string {
    const map: Record<ServiceStatus, string> = {
      Active: 'bg-emerald-100 text-emerald-700',
      Pending: 'bg-sky-100 text-sky-700',
      Draft: 'bg-violet-100 text-violet-700',
      'Fully Booked': 'bg-amber-100 text-amber-700',
      Expired: 'bg-gray-200 text-gray-700',
    };
    return map[status];
  }
}
