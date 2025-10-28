const API_BASE_URL = 'http://localhost:5001';

interface User {
  id: number;
  email: string;
  role: 'admin' | 'user';
  name?: string;
  createdAt: string;
  updatedAt: string;
  isActive?: boolean;
  apiKey?: string;
}

interface CreateUserData {
  email: string;
  password: string;
  role: 'admin' | 'user';
  name?: string;
}

interface UpdateUserData {
  email?: string;
  role?: 'admin' | 'user';
  name?: string;
}

class UserService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };
  }

  async getAllUsers(): Promise<{ success: boolean; data?: User[]; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/admin/users`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch users'
      };
    }
  }

  async getUserById(id: number): Promise<{ success: boolean; data?: User; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/admin/users/${id}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch user'
      };
    }
  }

  async createUser(userData: CreateUserData): Promise<{ success: boolean; data?: User; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Error creating user:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create user'
      };
    }
  }

  async updateUser(id: number, userData: UpdateUserData): Promise<{ success: boolean; data?: User; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/admin/users/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update user'
      };
    }
  }

  async deleteUser(id: number): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/user/admin/users/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Error deleting user:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete user'
      };
    }
  }

  async toggleUserStatus(id: number, isActive: boolean): Promise<{ success: boolean; data?: User; message?: string }> {
    return this.updateUser(id, { isActive } as any);
  }

  async changeUserRole(id: number, role: 'admin' | 'user'): Promise<{ success: boolean; data?: User; message?: string }> {
    return this.updateUser(id, { role });
  }
}

export const userService = new UserService();
export type { User, CreateUserData, UpdateUserData };