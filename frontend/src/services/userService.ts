const API_BASE_URL = 'http://localhost:5001';

interface User {
  id: number;
  email: string;
  phone?: string;
  role: 'admin' | 'user' | 'readonly';
  status: 'Active' | 'Pending' | 'Disable';
  note?: string;
  createdAt: string;
  updatedAt: string;
  apiKey?: string;
}

interface CreateUserData {
  email: string;
  password: string;
  phone?: string;
  role: 'admin' | 'user' | 'readonly';
  status?: 'Active' | 'Pending' | 'Disable';
  note?: string;
}

interface UpdateUserData {
  email?: string;
  phone?: string;
  role?: 'admin' | 'user' | 'readonly';
  status?: 'Active' | 'Pending' | 'Disable';
  note?: string;
  password?: string;
}

class UserService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
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
        message: error instanceof Error ? error.message : 'Failed to fetch users',
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
        message: error instanceof Error ? error.message : 'Failed to fetch user',
      };
    }
  }

  async createUser(
    userData: CreateUserData
  ): Promise<{ success: boolean; data?: User; message?: string }> {
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
        message: error instanceof Error ? error.message : 'Failed to create user',
      };
    }
  }

  async updateUser(
    id: number,
    userData: UpdateUserData
  ): Promise<{ success: boolean; data?: User; message?: string }> {
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
        message: error instanceof Error ? error.message : 'Failed to update user',
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
        message: error instanceof Error ? error.message : 'Failed to delete user',
      };
    }
  }

  async toggleUserStatus(
    id: number,
    isActive: boolean
  ): Promise<{ success: boolean; data?: User; message?: string }> {
    return this.updateUser(id, { isActive } as Partial<User>);
  }

  async changeUserRole(
    id: number,
    role: 'admin' | 'user' | 'readonly'
  ): Promise<{ success: boolean; data?: User; message?: string }> {
    return this.updateUser(id, { role });
  }

  async changeUserStatus(
    id: number,
    status: 'Active' | 'Pending' | 'Disable'
  ): Promise<{ success: boolean; data?: User; message?: string }> {
    return this.updateUser(id, { status });
  }

  async requestAccess(accessData: {
    email: string;
    phone: string;
    note?: string;
  }): Promise<{ success: boolean; message?: string; data?: { id?: number; email?: string } }> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accessData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('Error requesting access:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to request access',
      };
    }
  }
}

export const userService = new UserService();
export type { User, CreateUserData, UpdateUserData };
