export const OrderPermissions = {
  View: 'Orders.View'
} as const;

export type OrderPermission = typeof OrderPermissions[keyof typeof OrderPermissions];
