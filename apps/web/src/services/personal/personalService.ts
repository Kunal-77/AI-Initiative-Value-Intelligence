import {
  PersonalDashboard,
  Subscription,
  PaymentMethod,
  SubscriptionCategory,
  UsageRecord,
} from "../../types/personal";

import { API_BASE as BASE_URL } from "../../lib/apiConfig";

const API_BASE = `${BASE_URL}/api/v1`;

function mapSubscription(item: any): Subscription {
  return {
    id: item.id,
    name: item.name,
    costAmount: Number(item.cost_amount),
    currencyCode: item.currency_code,
    billingCycle: item.billing_cycle,
    status: item.status,
    trialEndsAt: item.trial_ends_at,
    paymentMethodId: item.payment_method_id,
    subscriptionType: item.subscription_type,
    categoryId: item.category_id,
    createdAt: item.created_at,
    updatedAt: item.updated_at,
    cancelledAt: item.cancelled_at,
    category: item.category
      ? {
          id: item.category.id,
          name: item.category.name,
          description: item.category.description,
          status: item.category.status,
        }
      : undefined,
    paymentMethod: item.payment_method
      ? {
          id: item.payment_method.id,
          type: item.payment_method.type,
          cardBrand: item.payment_method.card_brand,
          lastFour: item.payment_method.last_four,
          expiresAt: item.payment_method.expires_at,
          status: item.payment_method.status,
        }
      : undefined,
    provider: item.provider,
    accountIdentifier: item.account_identifier,
    region: item.region,
    projectIdentifier: item.project_identifier,
    modelPlan: item.model_plan,
    seatCount: item.seat_count,
  };
}

function mapUsageRecord(item: any): UsageRecord {
  return {
    id: item.id,
    subscriptionId: item.subscription_id,
    usageDate: item.usage_date,
    quantity: Number(item.quantity),
    unit: item.unit,
    cost: Number(item.cost),
    currencyCode: item.currency_code,
  };
}

export async function getPersonalDashboard(token: string): Promise<PersonalDashboard> {
  const res = await fetch(`${API_BASE}/personal/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch personal dashboard summary");
  const data = await res.json();
  
  return {
    monthlySpend: Number(data.monthly_spend),
    aiSpend: Number(data.ai_spend),
    activeSubscriptionsCount: data.active_subscriptions_count,
    cloudProjectsCount: data.cloud_projects_count,
    upcomingRenewals: (data.upcoming_renewals || []).map((item: any) => ({
      id: item.id,
      subscriptionId: item.subscription_id,
      renewalDate: item.renewal_date,
      reminderDaysBefore: item.reminder_days_before,
      autoRenew: item.auto_renew,
      notificationStatus: item.notification_status,
    })),
    recentUsage: (data.recent_usage || []).map(mapUsageRecord),
  };
}

export async function getSubscriptions(token: string): Promise<Subscription[]> {
  const res = await fetch(`${API_BASE}/personal/subscriptions`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch subscriptions");
  const data = await res.json();
  return data.map(mapSubscription);
}

export async function addSubscription(
  token: string,
  data: {
    name: string;
    cost_amount: number;
    currency_code: string;
    billing_cycle: string;
    category_id: string;
    payment_method_id?: string | null;
    subscription_type: string;
    provider?: string;
    account_identifier?: string;
    region?: string;
    project_identifier?: string;
    model_plan?: string;
    seat_count?: number;
  }
): Promise<Subscription> {
  const res = await fetch(`${API_BASE}/personal/subscriptions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.detail || "Failed to add subscription");
  }
  return mapSubscription(await res.json());
}

export async function deleteSubscription(token: string, id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/personal/subscriptions/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.detail || "Failed to cancel subscription");
  }
}

export async function getPaymentMethods(token: string): Promise<PaymentMethod[]> {
  const res = await fetch(`${API_BASE}/personal/payment-methods`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch payment methods");
  const data = await res.json();
  return data.map((item: any) => ({
    id: item.id,
    type: item.type,
    cardBrand: item.card_brand,
    lastFour: item.last_four,
    expiresAt: item.expires_at,
    status: item.status,
  }));
}

export async function addPaymentMethod(
  token: string,
  data: {
    type: string;
    card_brand?: string;
    last_four?: string;
    expires_at?: string;
  }
): Promise<PaymentMethod> {
  const res = await fetch(`${API_BASE}/personal/payment-methods`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      type: data.type,
      card_brand: data.card_brand || null,
      last_four: data.last_four || null,
      expires_at: data.expires_at || null,
    }),
  });
  if (!res.ok) throw new Error("Failed to add payment method");
  return res.json();
}

export async function getCategories(token: string): Promise<SubscriptionCategory[]> {
  const res = await fetch(`${API_BASE}/personal/categories`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch categories");
  return res.json();
}

export async function getUsage(token: string): Promise<UsageRecord[]> {
  const res = await fetch(`${API_BASE}/personal/usage`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch usage logs");
  const data = await res.json();
  return data.map(mapUsageRecord);
}

export async function addUsage(
  token: string,
  data: {
    subscription_id: string;
    usage_date: string;
    quantity: number;
    unit: string;
    cost: number;
    currency_code?: string;
  }
): Promise<UsageRecord> {
  const res = await fetch(`${API_BASE}/personal/usage`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      subscription_id: data.subscription_id,
      usage_date: data.usage_date,
      quantity: data.quantity,
      unit: data.unit,
      cost: data.cost,
      currency_code: data.currency_code || "USD",
    }),
  });
  if (!res.ok) throw new Error("Failed to add usage entry");
  return mapUsageRecord(await res.json());
}
