const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

// Type definitions
export interface User {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  role: string;
  kyc_tier: number;
  payout_bank_name?: string | null;
  payout_account_number?: string | null;
}

export interface Deal {
  id: string;
  title: string;
  description: string;
  vertical: string;
  amount: number;
  currency: string;
  buyer_id: string;
  seller_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  expiry_date?: string;
  virtual_account_number?: string;
  virtual_account_bank?: string;
  nominal_account_reference?: string;
  buyer_confirmed_rendered?: boolean;
  seller_confirmed_rendered?: boolean;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  amount: number;
  type: string;
  description?: string;
  created_at: string;
}

export interface DealAnalytics {
  visits_count: number;
  activities: DealActivity[];
  reviews: Review[];
}

export interface DealActivity {
  id: string;
  deal_id: string;
  user_id?: string;
  activity_type: string;
  description?: string;
  created_at: string;
}

export interface Review {
  id: string;
  deal_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment?: string;
  created_at: string;
}

export interface ApiError {
  success: false;
  message: string;
  error_code?: string;
  details?: Record<string, string>;
}

export interface SuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export class ApiErrorException extends Error {
  public error_code?: string;
  public details?: Record<string, string>;

  constructor(message: string, error_code?: string, details?: Record<string, string>) {
    super(message);
    this.name = "ApiErrorException";
    this.error_code = error_code;
    this.details = details;
  }
}

// Simple API client
class ApiClient {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  getToken() {
    return this.token;
  }

  clearToken() {
    this.token = null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      // Handle error response
      const error = result as ApiError;
      throw new ApiErrorException(
        error.message || `HTTP ${response.status}`,
        error.error_code,
        error.details
      );
    }

    // Handle success response
    const success = result as SuccessResponse<T>;
    return success.data;
  }

  async register(data: {
    email: string;
    password: string;
    phone: string;
    full_name: string;
    role: string;
  }) {
    return this.request<{ access_token: string; token_type: string; user: User }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async login(data: { username: string; password: string }) {
    // Use URLSearchParams for OAuth2 password flow
    const params = new URLSearchParams();
    params.append("username", data.username);
    params.append("password", data.password);

    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = result as ApiError;
      throw new ApiErrorException(
        error.message || `HTTP ${response.status}`,
        error.error_code,
        error.details
      );
    }

    const success = result as SuccessResponse<{ access_token: string; token_type: string; user: User }>;
    if (success.data?.access_token) {
      this.setToken(success.data.access_token);
    }
    return success.data;
  }

  async getUsers() {
    return this.request<User[]>("/users/");
  }

  async getUser(userId: string) {
    return this.request<User>(`/users/${userId}`);
  }

  async getUserByEmail(email: string) {
    return this.request<User>(`/users/email/${encodeURIComponent(email)}`);
  }

  async getCurrentUser() {
    return this.request<User>("/users/me");
  }

  async updateCurrentUser(data: Partial<User>) {
    return this.request<User>("/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async createDeal(data: Omit<Deal, "id" | "created_at" | "updated_at" | "buyer_confirmed_rendered" | "seller_confirmed_rendered">) {
    return this.request<Deal>("/deals/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getDeals() {
    return this.request<Deal[]>("/deals/");
  }

  async getUserDeals(userId: string) {
    return this.request<Deal[]>(`/deals/user/${userId}`);
  }

  async getDeal(dealId: string) {
    return this.request<Deal>(`/deals/${dealId}`);
  }

  async updateDeal(dealId: string, data: Partial<Deal>) {
    return this.request<Deal>(`/deals/${dealId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async fundDeal(dealId: string) {
    return this.request<{ deal_id: string; new_status: string }>(`/deals/${dealId}/fund`, {
      method: "POST",
    });
  }

  async conditionMet(dealId: string) {
    return this.request<{ deal_id: string; new_status: string }>(`/deals/${dealId}/condition-met`, {
      method: "POST",
    });
  }

  async releaseDeal(dealId: string) {
    return this.request<{ deal_id: string; new_status: string; seller_amount: number; platform_fee: number }>(`/deals/${dealId}/release`, {
      method: "POST",
    });
  }

  async disputeDeal(dealId: string) {
    return this.request<{ deal_id: string; new_status: string }>(`/deals/${dealId}/dispute`, {
      method: "POST",
    });
  }

  async refundDeal(dealId: string) {
    return this.request<{ deal_id: string; new_status: string }>(`/deals/${dealId}/refund`, {
      method: "POST",
    });
  }

  async trackDealVisit(dealId: string) {
    return this.request<void>(`/deals/${dealId}/visit`, {
      method: "POST",
    });
  }

  async getDealAnalytics(dealId: string) {
    return this.request<DealAnalytics>(`/deals/${dealId}/analytics`);
  }

  async confirmServiceRendered(dealId: string) {
    return this.request<Deal>(`/deals/${dealId}/confirm-rendered`, {
      method: "POST",
    });
  }

  async createReview(dealId: string, reviewData: { rating: number; comment?: string }) {
    return this.request<Review>(`/deals/${dealId}/reviews`, {
      method: "POST",
      body: JSON.stringify(reviewData),
    });
  }

  async createDispute(data: any) {
    return this.request("/disputes/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getDisputes() {
    return this.request("/disputes/");
  }

  async getDisputesByDeal(dealId: string) {
    return this.request(`/disputes/deal/${dealId}`);
  }

  async createWallet(userId: string) {
    return this.request<Wallet>(`/wallets/?user_id=${userId}`, {
      method: "POST",
    });
  }

  async getWalletByUser(userId: string) {
    return this.request<Wallet>(`/wallets/user/${userId}`);
  }

  async getWalletTransactions(walletId: string) {
    return this.request<Transaction[]>(`/wallets/${walletId}/transactions`);
  }

  async getCurrentWallet() {
    return this.request<Wallet>("/wallets/me");
  }

  async getCurrentWalletTransactions() {
    return this.request<Transaction[]>("/wallets/me/transactions");
  }
}

export const api = new ApiClient();
