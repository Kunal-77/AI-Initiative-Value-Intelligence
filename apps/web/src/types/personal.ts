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

export interface BankConnection {
  id: string;
  provider: string;
  institutionName: string;
  accountMask: string;
  accountType: string;
  status: string;
  consentStatus: string;
  lastSyncedAt?: string;
  transactionCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BankTransaction {
  id: string;
  bankConnectionId: string;
  transactionDate: string;
  amount: number;
  currency: string;
  rawDescription: string;
  normalizedMerchant?: string;
  transactionType: string;
  fingerprint: string;
  createdAt: string;
}

export interface BankSyncResult {
  status: string;
  message: string;
  newTransactions: number;
  candidatesDetected: number;
  connection: BankConnection;
}

export interface SubscriptionCandidate {
  id: string;
  merchantName: string;
  category: string;
  amount: number;
  currency: string;
  billingFrequency: string;
  confidenceScore: number;
  detectedFrom: string;
  firstTransactionDate: string;
  lastTransactionDate: string;
  nextExpectedDate?: string;
  status: string;
  convertedSubscriptionId?: string;
  createdAt: string;
  updatedAt: string;
}

