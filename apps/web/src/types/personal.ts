export interface SubscriptionCategory {
  id: string;
  name: string;
  description?: string;
  status: string;
}

export interface PaymentMethod {
  id: string;
  type: string;
  cardBrand?: string;
  lastFour?: string;
  expiresAt?: string;
  status: string;
}

export interface Subscription {
  id: string;
  name: string;
  costAmount: number;
  currencyCode: string;
  billingCycle: string;
  status: string;
  trialEndsAt?: string;
  paymentMethodId?: string;
  subscriptionType: string;
  categoryId: string;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;

  // Joined properties
  category?: SubscriptionCategory;
  paymentMethod?: PaymentMethod;

  // Polymorphic child properties
  provider?: string;
  accountIdentifier?: string;
  region?: string;
  projectIdentifier?: string;
  modelPlan?: string;
  seatCount?: number;
}

export interface UsageRecord {
  id: string;
  subscriptionId: string;
  usageDate: string;
  quantity: number;
  unit: string;
  cost: number;
  currencyCode: string;
}

export interface RenewalSchedule {
  id: string;
  subscriptionId: string;
  renewalDate: string;
  reminderDaysBefore: number;
  autoRenew: boolean;
  notificationStatus: string;
}

export interface PersonalDashboard {
  monthlySpend: number;
  aiSpend: number;
  activeSubscriptionsCount: number;
  cloudProjectsCount: number;
  upcomingRenewals: RenewalSchedule[];
  recentUsage: UsageRecord[];
}
