export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  phoneNumber?: string;
  createdAt?: string;
}

export interface LocationDimension {
  id: number;
  clusterName: string;
  subCounty: string | null;
}

export interface BadgeDimension {
  id: number;
  badgeName: string;
  salesThreshold: number;
}

export type MpesaPaymentType = 'BUY_GOODS_TILL' | 'PAYBILL' | 'SEND_MONEY_PHONE' | string;

export interface BusinessProfile {
  id?: number;
  userId?: number;
  user?: User;

  // 1. General Business Information
  businessName: string;
  headOfficeAddress?: string;
  phoneNumber?: string;
  emailAddress?: string;
  registrationDate?: string;
  companyStatus?: string;

  // 2. Social Links & Direct Contacts
  instagramUrl?: string;
  tiktokUrl?: string;
  whatsappNumber?: string;
  contactNumber?: string;

  // 3. Safaricom M-Pesa Payment Setup
  mpesaPaymentType?: MpesaPaymentType;
  mpesaTillNumber?: string | null;
  mpesaPaybillNumber?: string | null;
  mpesaAccountNumber?: string | null;
  mpesaNumber?: string | null;

  // 4. Narrative, Strategy & Personnel
  companyOverview?: string;
  mission?: string;
  vision?: string;
  productsAndServices?: string;
  keyPersonnel?: string;
  majorClientsAchievements?: string;

  // Legacy Relational Dimensions & Badges
  location?: LocationDimension | null;
  badge?: BadgeDimension | null;

  // Metrics & Digital Badges
  completedOrders?: number;
  isVerified?: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  iconName?: string | null;
  parentId?: number | null;
  children?: Category[];
}

export interface Product {
  id: number;
  sellerId?: number;
  seller?: User;
  categoryId: number;
  category?: Category;
  title: string;
  description?: string | null;
  price: number;
  stockQuantity: number;
  isActive?: boolean;
  imageUrl?: string | null;
  videoUrl?: string | null;
  whatsappLink?: string | null;
  createdAt?: string;
}

export type LeadStatus = 'PENDING' | 'CONNECTED' | 'SETTLED' | 'CANCELLED';

export interface ProductLead {
  id: number;
  buyerId: number;
  productId: number;
  status: LeadStatus;
  createdAt: string;
}

export type NotificationType = 'LOW_STOCK' | 'NEW_LEAD' | 'SYSTEM' | string;

export interface Notification {
  id: number;
  userId: number;
  type?: NotificationType;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  role: UserRole;
  businessName?: string;
  mpesaNumber?: string;
  locationId?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}
export interface OrderItem {
  id: number;
  productId: number;
  productTitle: string;
  quantity: number;
  unitPrice: number;
}
export interface AdminOrder {
  id: number;
  trackingNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  deliveryAddress: string;
  subtotalAmount: number;
  deliveryFee: number;
  totalAmount: number;
  paymentMethod: 'MPESA' | 'CARD' | 'CASH_ON_DELIVERY';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED';
  orderStatus: 'PENDING_PAYMENT' | 'CONFIRMED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED';
  mpesaReceiptNumber?: string;
  createdAt: string;
  items?: OrderItem[];
}

export interface AnalyticsSummary {
  totalRevenue: number;
  dailySales: number;
  conversionRate: number;
  averageOrderValue: number;
  salesTrend: { date: string; sales: number; orders: number }[];
  orderStatusBreakdown: { status: string; count: number }[];
}

export interface PromoCode {
  id: number;
  code: string;
  discountPercentage: number;
  expirationDate: string;
  isActive: boolean;
}

export interface StoreSettings {
  storeName: string;
  supportPhone: string;
  standardDeliveryFee: number;
  taxRatePercent: number;
  enableGuestCheckout: boolean;
}

export interface SavedAddress {
  id: number;
  label: string; // e.g., "Site Workshop", "Home Office"
  recipientName: string;
  phone: string;
  streetAddress: string;
  city: string;
  isDefault: boolean;
}

export interface SavedPaymentMethod {
  id: number;
  type: 'MPESA' | 'CARD';
  identifier: string; // "254712***456" or "•••• 4242"
  providerTitle: string;
  isDefault: boolean;
}

export interface LoyaltyProfile {
  pointsBalance: number;
  tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'BUILDER_PRO';
  storeCreditKes: number;
  activeCouponsCount: number;
}

export interface CommunicationPreferences {
  emailReceipts: boolean;
  smsDeliveryAlerts: boolean;
  priceDropAlerts: boolean;
  marketingNewsletter: boolean;
}

export interface BuyerProfileData {
  fullName: string;
  email: string;
  phoneNumber: string;
  addresses: SavedAddress[];
  paymentMethods: SavedPaymentMethod[];
  loyalty: LoyaltyProfile;
  preferences: CommunicationPreferences;
}

export interface SavedAddress {
  id: number;
  label: string;
  recipientName: string;
  phone: string;
  streetAddress: string;
  city: string;
  isDefault: boolean;
}

