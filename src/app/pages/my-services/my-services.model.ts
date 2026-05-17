export type MyServiceKind = 'makkah' | 'madina' | 'transport' | 'tickets' | 'food';

export type MyServiceAccent = 'primary' | 'emerald' | 'sky' | 'violet' | 'amber';

export interface MyServiceConfig {
  kind: MyServiceKind;
  title: string;
  subtitle: string;
  iconClass: string;
  accent: MyServiceAccent;
  highlights: string[];
}

export interface MyServiceActionPayload {
  serviceKind: MyServiceKind;
  title: string;
}

export interface MyServiceActionResult {
  success: boolean;
  message: string;
}
