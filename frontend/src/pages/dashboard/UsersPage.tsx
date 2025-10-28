import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  UserCheck,
  UserX,
  Mail,
  Calendar,
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { userService, type User } from '@/services/userService';

interface UserFormData {
  email: string;
  password: string;
  phone: string;
  role: 'admin' | 'user' | 'readonly';
  status: 'Active' | 'Pending' | 'Disable';
  note: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    password: '',
    phone: '',
    role: 'user',
    status: 'Pending',
    note: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user: currentUser } = useAuth();

  // Check if current user is admin
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have permission to access user management.</p>
          <p className="text-sm text-gray-500 mt-2">Only administrators can manage users.</p>
        </div>
      </div>
    );
  }

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const result = await userService.getAllUsers();
      
      if (result.success && result.data) {
        setUsers(result.data);
        setFilteredUsers(result.data);
        setError('');
      } else {
        setError(result.message || 'Failed to load users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  // Create new user
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const result = await userService.createUser(formData);
      
      if (result.success) {
        setShowCreateModal(false);
        setFormData({ email: '', password: '', phone: '', role: 'user', status: 'Pending', note: '' });
        fetchUsers(); // Refresh list
        setError('');
      } else {
        setError(result.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update user
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    setError('');

    try {
      // Prepare update data - exclude empty password
      const updateData: Partial<UserFormData> = { ...formData };
      if (!updateData.password) {
        delete (updateData as any).password;
      }
      
      const result = await userService.updateUser(selectedUser.id, updateData);
      
      if (result.success) {
        setShowEditModal(false);
        setSelectedUser(null);
        setFormData({ email: '', password: '', phone: '', role: 'user', status: 'Pending', note: '' });
        fetchUsers(); // Refresh list
        setError('');
      } else {
        setError(result.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };  // Delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    setError('');

    try {
      const result = await userService.deleteUser(selectedUser.id);
      
      if (result.success) {
        setShowDeleteModal(false);
        setSelectedUser(null);
        fetchUsers(); // Refresh list
        setError('');
      } else {
        setError(result.message || 'Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      setError('Failed to delete user');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle search
  useEffect(() => {
    const filtered = users.filter(user =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.note && user.note.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

  // Open edit modal
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: '',
      phone: user.phone || '',
      role: user.role,
      status: user.status,
      note: user.note || '',
    });
    setShowEditModal(true);
  };

  // Open delete modal
  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
          <p className="text-muted-foreground">Manage system users and their permissions</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add New User
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-3">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search users by email, phone, or note..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{users.length}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <div className="flex items-center gap-2 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <span>⚠️</span>
          {error}
        </div>
      )}

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Users List
          </CardTitle>
          <CardDescription>
            {filteredUsers.length} of {users.length} users
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Note</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Mail className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.email}
                          </p>
                          <p className="text-sm text-gray-500">{user.phone || 'No phone'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Shield className={`h-4 w-4 ${user.role === 'admin' ? 'text-red-600' : 'text-green-600'}`} />
                        <span className={`text-sm font-medium capitalize ${
                          user.role === 'admin' ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        {user.status === 'Active' ? (
                          <>
                            <UserCheck className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-600">Active</span>
                          </>
                        ) : user.status === 'Pending' ? (
                          <>
                            <UserX className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm text-yellow-600">Pending</span>
                          </>
                        ) : (
                          <>
                            <UserX className="h-4 w-4 text-red-600" />
                            <span className="text-sm text-red-600">Disabled</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600 truncate max-w-xs">
                        {user.note || '-'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {formatDate(user.createdAt)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditModal(user)}
                          disabled={currentUser?.id === user.id.toString()}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteModal(user)}
                          disabled={currentUser?.id === user.id.toString()}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No users found</p>
                {searchTerm && (
                  <p className="text-sm text-gray-400 mt-1">
                    Try adjusting your search terms
                  </p>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Create New User</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <Label htmlFor="create-phone">Phone Number</Label>
                <Input
                  id="create-phone"
                  type="tel"
                  placeholder="628123456789"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="create-email">Email *</Label>
                <Input
                  id="create-email"
                  type="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="create-password">Password *</Label>
                <Input
                  id="create-password"
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="create-role">Role</Label>
                <select
                  id="create-role"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as 'admin' | 'user' | 'readonly'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="readonly">Read Only</option>
                </select>
              </div>
              <div>
                <Label htmlFor="create-status">Status</Label>
                <select
                  id="create-status"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as 'Active' | 'Pending' | 'Disable'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Active">Active</option>
                  <option value="Disable">Disabled</option>
                </select>
              </div>
              <div>
                <Label htmlFor="create-note">Note</Label>
                <textarea
                  id="create-note"
                  placeholder="Optional note about user"
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? 'Creating...' : 'Create User'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Edit User</h3>
            <form onSubmit={handleUpdateUser} className="space-y-4">
              <div>
                <Label htmlFor="edit-phone">Phone Number</Label>
                <Input
                  id="edit-phone"
                  type="tel"
                  placeholder="628123456789"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-password">Password (leave blank to keep current)</Label>
                <Input
                  id="edit-password"
                  type="password"
                  placeholder="New password (optional)"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="edit-role">Role</Label>
                <select
                  id="edit-role"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value as 'admin' | 'user' | 'readonly'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="readonly">Read Only</option>
                </select>
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <select
                  id="edit-status"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as 'Active' | 'Pending' | 'Disable'})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Active">Active</option>
                  <option value="Disable">Disabled</option>
                </select>
              </div>
              <div>
                <Label htmlFor="edit-note">Note</Label>
                <textarea
                  id="edit-note"
                  placeholder="Optional note about user"
                  value={formData.note}
                  onChange={(e) => setFormData({...formData, note: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? 'Updating...' : 'Update User'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Delete User</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete user <strong>{selectedUser.email}</strong>? 
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                onClick={handleDeleteUser}
                disabled={isSubmitting}
                variant="destructive"
                className="flex-1"
              >
                {isSubmitting ? 'Deleting...' : 'Delete User'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}