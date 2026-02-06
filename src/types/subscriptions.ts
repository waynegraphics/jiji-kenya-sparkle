// Subscription system types

export type AddonType = 'bumping' | 'featured' | 'promotion';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export interface SubscriptionPackage {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  duration_days: number;
  max_ads: number;
  analytics_access: boolean;
  allowed_categories: string[] | null;
  is_active: boolean;
  display_order: number;
  is_popular: boolean;
  bg_color: string;
  text_color: string;
  button_color: string;
  button_text_color: string;
  created_at: string;
  updated_at: string;
}

export interface Addon {
  id: string;
  name: string;
  description: string | null;
  type: AddonType;
  is_active: boolean;
  display_order: number;
  bg_color: string;
  text_color: string;
  created_at: string;
  updated_at: string;
}

export interface AddonTier {
  id: string;
  addon_id: string;
  name: string;
  description: string | null;
  quantity: number;
  price: number;
  currency: string;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface SellerSubscription {
  id: string;
  user_id: string;
  package_id: string;
  status: SubscriptionStatus;
  ads_used: number;
  starts_at: string | null;
  expires_at: string | null;
  payment_status: PaymentStatus;
  payment_reference: string | null;
  mpesa_receipt: string | null;
  created_at: string;
  updated_at: string;
  package?: SubscriptionPackage;
}

export interface SellerAddon {
  id: string;
  user_id: string;
  addon_id: string;
  tier_id: string;
  quantity_purchased: number;
  quantity_used: number;
  status: SubscriptionStatus;
  expires_at: string | null;
  payment_status: PaymentStatus;
  payment_reference: string | null;
  mpesa_receipt: string | null;
  created_at: string;
  updated_at: string;
  addon?: Addon;
  tier?: AddonTier;
}

export interface PaymentTransaction {
  id: string;
  user_id: string;
  subscription_id: string | null;
  addon_purchase_id: string | null;
  phone_number: string;
  amount: number;
  currency: string;
  merchant_request_id: string | null;
  checkout_request_id: string | null;
  mpesa_receipt_number: string | null;
  transaction_date: string | null;
  status: PaymentStatus;
  result_code: string | null;
  result_desc: string | null;
  created_at: string;
  updated_at: string;
}

// Form types
export interface PackageFormData {
  name: string;
  description: string;
  price: number;
  currency: string;
  duration_days: number;
  max_ads: number;
  analytics_access: boolean;
  allowed_categories: string[];
  is_active: boolean;
  display_order: number;
  is_popular: boolean;
  bg_color: string;
  text_color: string;
  button_color: string;
  button_text_color: string;
}

export interface AddonFormData {
  name: string;
  description: string;
  type: AddonType;
  is_active: boolean;
  display_order: number;
  bg_color: string;
  text_color: string;
}

export interface TierFormData {
  addon_id: string;
  name: string;
  description: string;
  quantity: number;
  price: number;
  currency: string;
  is_active: boolean;
  display_order: number;
}
