export type Role = 'Admin' | 'Manager' | 'Cashier' | 'Waiter' | 'Kitchen Staff';
export type UserRole = Role;

export type ActiveTab =
  | 'landing'
  | 'dashboard'
  | 'floorplan'
  | 'menu'
  | 'orders'
  | 'receipts'
  | 'kds'
  | 'checkout'
  | 'reservations'
  | 'customers'
  | 'inventory'
  | 'promos'
  | 'staff'
  | 'logs'
  | 'analytics'
  | 'settings'
  | 'gas';

export interface Employee {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  phone: string;
  isClockedIn: boolean;
  hourlyRate: number;
  shiftsThisWeek: number;
  pinCode: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  pin?: string;
  avatar?: string;
  isClockedIn?: boolean;
  clockInTime?: string;
}

export type TableStatus = 'Available' | 'Occupied' | 'Reserved' | 'Cleaning';
export type TableShape = 'square' | 'circle' | 'rectangle';
export type FloorZone = 'Main Hall' | 'Patio' | 'VIP Room' | 'Bar Area';

export interface Table {
  id: string;
  number: number;
  name: string;
  seats: number;
  status: TableStatus;
  zone: FloorZone;
  x: number; // Percentage or px offset on floor layout
  y: number;
  shape: TableShape;
  currentOrderId?: string;
  customerName?: string;
  reservationTime?: string;
  mergedWith?: string[]; // IDs of merged tables
}

export interface MenuItemAddOn {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'Starters' | 'Mains' | 'Drinks' | 'Desserts' | 'Fries' | 'Combos' | 'Others';
  price: number;
  cost: number;
  image: string;
  description: string;
  isAvailable: boolean;
  isPopular?: boolean;
  isCombo?: boolean;
  modifiers?: string[]; // e.g. ["Mild", "Medium", "Spicy", "Extra Hot"]
  addOns?: MenuItemAddOn[];
}

export type OrderType = 'Dine-in' | 'Takeaway' | 'Delivery';
export type OrderStatus = 'Pending' | 'Cooking' | 'Ready' | 'Served' | 'Completed' | 'Cancelled';

export interface OrderItemModifier {
  name: string;
  price?: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  modifiers: string[];
  addOns: MenuItemAddOn[];
  kitchenNotes?: string;
  status: 'Pending' | 'Cooking' | 'Ready' | 'Served';
}

export interface Order {
  id: string;
  orderNumber: string;
  type: OrderType;
  tableId?: string;
  tableName?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items: OrderItem[];
  status: OrderStatus;
  kitchenNotes?: string;
  discountPercentage: number;
  discountAmount: number;
  pointsRedeemed?: number;
  pointsDiscountAmount?: number;
  couponCode?: string;
  couponDiscountAmount?: number;
  percentageDiscountAmount?: number;
  promoDiscountAmount?: number;
  appliedPromos?: AppliedPromo[];
  customerPointsBalance?: number;
  taxRate: number;
  taxAmount: number;
  serviceChargeRate: number;
  serviceChargeAmount: number;
  subtotal: number;
  totalAmount: number;
  paymentStatus: 'Unpaid' | 'Paid' | 'Partially Paid' | 'Refunded';
  paymentMethod?: 'Cash' | 'Credit Card' | 'Debit Card' | 'QR Code' | 'UPI' | 'Digital Wallet' | 'Split';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface Reservation {
  id: string;
  customerName: string;
  phone: string;
  email?: string;
  customerId?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  partySize: number;
  tableId?: string;
  tableName?: string;
  status: 'Upcoming' | 'Seated' | 'Completed' | 'Cancelled';
  notes?: string;
  durationMinutes?: number; // Default 90
  seatedAt?: string; // ISO String or HH:mm
  actualEndTime?: string; // ISO String or HH:mm if finished early
  createdAt: string;
  updatedAt?: string;
}

export interface WaitlistItem {
  id: string;
  queueNumber: string; // e.g. #W-01
  customerName: string;
  phone: string;
  partySize: number;
  notes?: string;
  status: 'Waiting' | 'Notified' | 'Seated' | 'Cancelled';
  createdAt: string; // ISO String in Asia/Taipei
  estimatedWaitMinutes?: number;
}

export interface CustomerCoupon {
  id: string;
  customerId: string;
  code: string;
  title: string;
  discountType: 'fixed' | 'percentage';
  discountValue: number;
  pointsSpent: number;
  redeemedAt: string;
  isUsed?: boolean;
  usedAt?: string;
  usedOnOrderNumber?: string;
  usedDiscountAmount?: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  birthday?: string;
  loyaltyPoints: number;
  visitCount: number;
  totalSpent: number;
  tier: 'Bronze' | 'Silver' | 'Gold' | 'VIP';
  favoriteDishes?: string[];
  notes?: string;
  lastVisit?: string;
  updatedAt?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  unit: 'kg' | 'g' | 'liters' | 'ml' | 'pcs' | 'boxes';
  stockQuantity: number;
  minStockAlert: number;
  costPerUnit: number;
  supplierName: string;
  lastRestocked: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  itemsSupplied: string[];
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  orderNumber: string;
  customerName?: string;
  amount: number;
  method: 'Cash' | 'Credit Card' | 'Debit Card' | 'QR Code' | 'UPI' | 'Digital Wallet' | 'Split';
  discountApplied: number;
  couponCode?: string;
  pointsRedeemed?: number;
  status: 'Success' | 'Failed' | 'Refunded';
  timestamp: string;
  cashReceived?: number;
  changeGiven?: number;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  user: string;
  role: Role;
  action: string;
  details: string;
}

export type RolePermissions = Record<Role, ActiveTab[]>;

export interface RestaurantSettings {
  restaurantName: string;
  logoUrl: string;
  phone: string;
  email?: string;
  address: string;
  currency?: string;
  currencySymbol: string;
  taxRate: number; // e.g. 8%
  serviceChargeRate: number; // e.g. 5%
  tableCount: number;
  openingHours: string;
  receiptHeader: string;
  receiptFooter: string;
  gasWebAppUrl: string; // Google Apps Script URL
  autoSyncToSheets: boolean;
  autoKdsSync?: boolean;
  theme: 'light' | 'dark';
  cashInputMode?: 'typed' | 'keypad';
  rolePermissions?: RolePermissions;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  timestamp: string;
  read: boolean;
}

export interface CategoryCondition {
  category: string; // e.g. 'Mains', 'Drinks', 'Appetizers', 'Desserts'
  minQuantity: number; // e.g. 1
}

export interface PromoRule {
  id: string;
  title: string; // e.g. "Mains + 2 Drinks Combo Special"
  description: string; // e.g. "Order 1 Main Dish and 2 Drinks to get $3.00 off automatically"
  code?: string; // Optional code if entered manually
  isAutomatic: boolean; // Automatically evaluated if true
  discountType: 'fixed' | 'percentage';
  discountValue: number; // e.g. 3 ($3.00) or 10 (10%)
  categoryConditions?: CategoryCondition[]; // e.g. [{ category: 'Mains', minQuantity: 1 }, { category: 'Drinks', minQuantity: 2 }]
  minSubtotal?: number; // e.g. 50
  requiredMenuItemIds?: string[];
  isActive: boolean;
  createdAt: string;
}

export interface AppliedPromo {
  promoId: string;
  title: string;
  reason: string;
  discountAmount: number;
}

export interface CouponCode {
  id: string;
  code: string; // e.g. "WELCOME10", "VIP20", "SUMMER15"
  title: string; // e.g. "Welcome 10% Off", "VIP 20% Discount"
  description?: string;
  discountType: 'fixed' | 'percentage';
  discountValue: number; // e.g. 10 ($10 or 10%)
  minSubtotal?: number; // e.g. 25 ($25 minimum spend requirement)
  usageCount: number; // Total times redeemed across orders
  isActive: boolean;
  validUntil?: string; // Optional expiry date string
  createdAt: string;
}

