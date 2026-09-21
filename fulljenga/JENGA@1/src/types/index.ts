export type UserRole = 'BUYER' | 'SELLER' | 'ADMIN';

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: UserRole;
  phoneNumber: string;
  createdAt: string;
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

export interface BusinessProfile {
  id: number;
  userId: number;
  businessName: string;
  location: LocationDimension;
  badge: BadgeDimension;
  mpesaNumber: string;
  mpesaTillNumber: string | null;
  lowStockThreshold: number;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  iconName: string | null;
  parentId: number | null;
  children?: Category[];
}

export interface Product {
  id: number;
  sellerId: number;
  seller?: User;
  categoryId: number;
  category?: Category;
  title: string;
  description: string | null;
  price: number;
  stockQuantity: number;
  imageUrl: string | null;
  whatsappLink: string | null;
  createdAt: string;
}

export type LeadStatus = 'PENDING' | 'CONNECTED' | 'SETTLED' | 'CANCELLED';

export interface ProductLead {
  id: number;
  buyerId: number;
  productId: number;
  status: LeadStatus;
  createdAt: string;
}

export type NotificationType = 'LOW_STOCK' | 'NEW_LEAD' | 'SYSTEM';

export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
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
