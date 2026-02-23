/**
 * API Client for W.O.JP Admin Backend
 * 
 * This module provides type-safe API calls to the admin backend.
 * All admin operations require authentication via httpOnly cookies.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// Types
export interface User {
  id: number;
  email: string;
  name: string | null;
  role: 'admin' | 'editor';
  is_active: boolean;
  created_at: string;
  last_signed_in: string | null;
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  message?: string;
}

export interface NewsItem {
  id: number;
  title: string;
  slug: string;
  body: string;
  eyecatch_image_url: string | null;
  category: 'お知らせ' | '重要なお知らせ' | 'プレスリリース' | 'メディア掲載';
  is_published: boolean;
  published_at: string | null;
  created_by: number | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
}

export type PublicNewsItem = NewsPublicItem;

export interface NewsPublicItem {
  id: number;
  title: string;
  slug: string;
  eyecatch_image_url: string | null;
  category: string;
  published_at: string | null;
  excerpt?: string;
}

export interface JobItem {
  id: number;
  title: string;
  slug: string;
  description: string;
  requirements: string;
  employment_type: string | null;
  location: string;
  salary_range: string | null;
  is_published: boolean;
  published_at: string | null;
  created_by: number | null;
  updated_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

// API Error class
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper function for API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    credentials: 'include', // Include cookies for auth
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new ApiError(response.status, errorData.detail || 'API Error');
  }

  return response.json();
}

// ============================================
// Auth API
// ============================================

export const authApi = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    return apiCall('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  logout: async (): Promise<MessageResponse> => {
    return apiCall('/api/auth/logout', {
      method: 'POST',
    });
  },

  me: async (): Promise<User> => {
    return apiCall('/api/auth/me');
  },

  forgotPassword: async (email: string): Promise<MessageResponse> => {
    return apiCall('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (token: string, newPassword: string): Promise<MessageResponse> => {
    return apiCall('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword }),
    });
  },
};

// ============================================
// Public API (for Corp site)
// ============================================

export const publicApi = {
  getNews: async (params?: {
    limit?: number;
    page?: number;
    category?: string;
  }): Promise<PaginatedResponse<NewsPublicItem>> => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.category) searchParams.set('category', params.category);
    
    const query = searchParams.toString();
    return apiCall(`/api/public/news${query ? `?${query}` : ''}`);
  },

  getNewsDetail: async (idOrSlug: string | number): Promise<NewsPublicItem & { body: string }> => {
    return apiCall(`/api/public/news/${idOrSlug}`);
  },

  getJobs: async (params?: {
    limit?: number;
    page?: number;
    department?: string;
  }): Promise<PaginatedResponse<JobItem>> => {
    const searchParams = new URLSearchParams();
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.department) searchParams.set('department', params.department);
    
    const query = searchParams.toString();
    return apiCall(`/api/public/jobs${query ? `?${query}` : ''}`);
  },

  getJobDetail: async (idOrSlug: string | number): Promise<JobItem> => {
    return apiCall(`/api/public/jobs/${idOrSlug}`);
  },
};

// ============================================
// Admin News API
// ============================================

export const adminNewsApi = {
  list: async (): Promise<NewsItem[]> => {
    return apiCall('/api/admin/news');
  },

  get: async (id: number): Promise<NewsItem> => {
    return apiCall(`/api/admin/news/${id}`);
  },

  create: async (data: {
    title: string;
    body: string;
    category: string;
    eyecatch_image_url?: string;
    is_published?: boolean;
  }): Promise<NewsItem> => {
    return apiCall('/api/admin/news', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: {
    title?: string;
    body?: string;
    category?: string;
    eyecatch_image_url?: string;
    is_published?: boolean;
  }): Promise<NewsItem> => {
    return apiCall(`/api/admin/news/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  togglePublish: async (id: number, isPublished: boolean): Promise<NewsItem> => {
    return apiCall(`/api/admin/news/${id}/publish`, {
      method: 'PATCH',
      body: JSON.stringify({ is_published: isPublished }),
    });
  },

  delete: async (id: number): Promise<MessageResponse> => {
    return apiCall(`/api/admin/news/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// Admin Jobs API
// ============================================

export const adminJobsApi = {
  list: async (): Promise<JobItem[]> => {
    return apiCall('/api/admin/jobs');
  },

  get: async (id: number): Promise<JobItem> => {
    return apiCall(`/api/admin/jobs/${id}`);
  },

  create: async (data: {
    title: string;
    description: string;
    requirements: string;
    location: string;
    employment_type?: string;
    salary_range?: string;
    is_published?: boolean;
  }): Promise<JobItem> => {
    return apiCall('/api/admin/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: number, data: {
    title?: string;
    description?: string;
    requirements?: string;
    location?: string;
    employment_type?: string;
    salary_range?: string;
    is_published?: boolean;
  }): Promise<JobItem> => {
    return apiCall(`/api/admin/jobs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  togglePublish: async (id: number, isPublished: boolean): Promise<JobItem> => {
    return apiCall(`/api/admin/jobs/${id}/publish`, {
      method: 'PATCH',
      body: JSON.stringify({ is_published: isPublished }),
    });
  },

  delete: async (id: number): Promise<MessageResponse> => {
    return apiCall(`/api/admin/jobs/${id}`, {
      method: 'DELETE',
    });
  },
};
