const BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://localhost:8080/api';

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const body = await res.json().catch(() => ({ success: false, message: res.statusText }));
  if (!res.ok) {
    throw new ApiError(body.message || 'Error en la solicitud', res.status);
  }
  return body.data as T;
}

export type UserResponse = {
  id: string;
  first_name: string;
  last_name?: string;
  email: string;
  role_id: string;
};

export type LoginResponse = {
  token: string;
  user: UserResponse;
};

export type WaitlistEntry = {
  id: number;
  user_id: string;
  priority: number;
  status: string;
  reason: string;
  created_at: string;
};

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<LoginResponse>('/auth/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    register: (data: { first_name: string; last_name?: string; email: string; password: string }) =>
      request<UserResponse>('/auth/users', { method: 'POST', body: JSON.stringify(data) }),
    getUsers: () => request<UserResponse[]>('/auth/users'),
    getUserById: (id: string) => request<UserResponse>(`/auth/users/${id}`),
  },
  waitlist: {
    getQueue: () => request<WaitlistEntry[]>('/waitlist'),
    getMyQueue: () => request<WaitlistEntry[]>('/waitlist/mine'),
    addPatient: (data: { userId: string; priority: number; reason: string }) =>
      request<WaitlistEntry>('/waitlist', { method: 'POST', body: JSON.stringify(data) }),
    updateStatus: (id: number, status: string) =>
      request<WaitlistEntry>(`/waitlist/${id}`, { method: 'PATCH', body: JSON.stringify({ newStatus: status }) }),
  },
};
