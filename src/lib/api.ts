const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1";

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
    return this.request("/auth/register", {
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

    const success = result as SuccessResponse<{ access_token: string; token_type: string; user: any }>;
    if (success.data?.access_token) {
      this.setToken(success.data.access_token);
    }
    return success.data;
  }

  async getUsers() {
    return this.request("/users/");
  }

  async getUser(userId: string) {
    return this.request(`/users/${userId}`);
  }

  async createDeal(data: any) {
    return this.request("/deals/", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getDeals() {
    return this.request("/deals/");
  }

  async getUserDeals(userId: string) {
    return this.request(`/deals/user/${userId}`);
  }

  async getDeal(dealId: string) {
    return this.request(`/deals/${dealId}`);
  }

  async updateDeal(dealId: string, data: any) {
    return this.request(`/deals/${dealId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async fundDeal(dealId: string) {
    return this.request(`/deals/${dealId}/fund`, { method: "POST" });
  }

  async conditionMet(dealId: string) {
    return this.request(`/deals/${dealId}/condition-met`, { method: "POST" });
  }

  async releaseDeal(dealId: string) {
    return this.request(`/deals/${dealId}/release`, { method: "POST" });
  }

  async disputeDeal(dealId: string) {
    return this.request(`/deals/${dealId}/dispute`, { method: "POST" });
  }

  async refundDeal(dealId: string) {
    return this.request(`/deals/${dealId}/refund`, { method: "POST" });
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
    return this.request(`/wallets/?user_id=${userId}`, { method: "POST" });
  }

  async getWalletByUser(userId: string) {
    return this.request(`/wallets/user/${userId}`);
  }

  async getWalletTransactions(walletId: string) {
    return this.request(`/wallets/${walletId}/transactions`);
  }
}

export const api = new ApiClient();
