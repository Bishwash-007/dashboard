export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiEnvelope<T> {
  message: string;
  data: T;
}

export interface PaginatedEnvelope<T> extends ApiEnvelope<T[]> {
  pagination?: PaginationMeta;
}

export interface ProductVariant {
  _id?: string;
  color?: string;
  price: number;
  stock: number;
  sku?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductUploadAsset {
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

export interface ProductUploadResult {
  count: number;
  images: string[];
  assets: ProductUploadAsset[];
}

export interface Product {
  _id: string;
  name: string;
  description?: string;
  brand?: string;
  categories?: Array<string | Category>;
  variants: ProductVariant[];
  images?: string[];
  specifications?: Record<string, string | number>;
  status?: "draft" | "active" | "archived";
  createdAt?: string;
  updatedAt?: string;
}

export interface OrderItem {
  productId: string;
  productName?: string;
  variantId?: string;
  quantity: number;
  price: number;
}

export interface Order {
  _id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus?: "pending" | "completed" | "refunded";
  totalAmount: number;
  items: OrderItem[];
  customerName?: string;
  customerEmail?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface OrdersByStatus {
  status: OrderStatus;
  count: number;
}

export interface DashboardSnapshot {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalUsers: number;
  recentOrders: Order[];
  ordersByStatus: OrdersByStatus[];
}

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "staff";
  avatar?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AdminUserInsights extends AdminUser {
  segment?: string;
  status?: "healthy" | "nurture" | "at-risk" | "dormant";
  totalOrders?: number;
  lifetimeValue?: number;
  monthlySpend?: number;
  lastActive?: string;
  location?: string;
}

export interface SiteSettingsContact {
  email?: string;
  phone?: string;
  supportHours?: string;
  website?: string;
}

export interface SiteSettingsAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface SiteSettingsSocials {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  linkedin?: string;
  tiktok?: string;
}

export interface SitePolicies {
  termsOfService?: string;
  privacyPolicy?: string;
  refundPolicy?: string;
}

export interface PaymentMethod {
  name: string;
  description?: string;
  instructions?: string;
  enabled: boolean;
}

export interface SiteSettings {
  _id?: string;
  key?: string;
  contact?: SiteSettingsContact;
  address?: SiteSettingsAddress;
  socials?: SiteSettingsSocials;
  policies?: SitePolicies;
  paymentMethods?: PaymentMethod[];
  updatedBy?: Pick<AdminUser, "_id" | "name" | "email"> | string;
  updatedAt?: string;
  createdAt?: string;
}

export interface SiteSettingsPayload {
  contact?: SiteSettingsContact;
  address?: SiteSettingsAddress;
  socials?: SiteSettingsSocials;
  policies?: SitePolicies;
  paymentMethods?: PaymentMethod[];
}

export interface SalesDaySummary {
  date: string;
  revenue: number;
  orders: number;
  averageOrderValue?: number;
}

export interface TopProductSummary {
  productId: string;
  name: string;
  revenue: number;
  units: number;
}

export interface SalesReportTotals {
  revenue?: number;
  orders?: number;
  averageOrderValue?: number;
}

export interface SalesReport {
  salesData: SalesDaySummary[];
  topProducts: TopProductSummary[];
  totals?: SalesReportTotals;
}

export interface AuditLogEntry {
  _id: string;
  action: string;
  description?: string;
  actor?: Pick<AdminUser, "_id" | "name" | "email"> | string;
  context?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt?: string;
}
