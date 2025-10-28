import api from './api';

export interface User {
  id: number;
  email: string;
  role: 'admin' | 'user' | 'readonly';
  apiKey?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface UpdateUserRequest {
  email?: string;
  password?: string;
  role?: 'admin' | 'user' | 'readonly';
}

export interface WhatsAppAccount {
  sessionId: string;
  phoneNumber: string;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export const userService = {
  // Get current user's WhatsApp accounts
  getAccounts: async (): Promise<WhatsAppAccount[]> => {
    const response = await api.get('/user/accounts');
    return response.data.data;
  },

  // Get current user profile
  getProfile: async (): Promise<User> => {
    const response = await api.get('/user/profile');
    return response.data.data;
  },

  // Update current user profile
  updateProfile: async (data: UpdateUserRequest): Promise<User> => {
    const response = await api.put('/user/profile', data);
    return response.data.data;
  },

  // Admin: List all users
  listAllUsers: async (): Promise<User[]> => {
    const response = await api.get('/user/admin/users');
    return response.data.data;
  },

  // Admin: Get user by ID
  getUserById: async (userId: number): Promise<User> => {
    const response = await api.get(`/user/admin/users/${userId}`);
    return response.data.data;
  },

  // Admin: Update user
  updateUser: async (userId: number, data: UpdateUserRequest): Promise<User> => {
    const response = await api.put(`/user/admin/users/${userId}`, data);
    return response.data.data;
  },

  // Admin: Delete user
  deleteUser: async (userId: number): Promise<void> => {
    await api.delete(`/user/admin/users/${userId}`);
  },

  // Admin: List all WhatsApp accounts
  listAllAccounts: async (): Promise<WhatsAppAccount[]> => {
    const response = await api.get('/user/admin/accounts');
    return response.data.data;
  },
};
