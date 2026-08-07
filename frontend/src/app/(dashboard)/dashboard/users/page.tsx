'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  User as UserIcon,
  X,
  UserPlus,
  Search,
  EyeOff,
  Eye,
  AlertCircle,
  RefreshCw,
  CheckCircle,
  Filter,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import useToast from '@/hooks/useToast';
import { useConfirmationDialog } from '@/providers/ConfirmationProvider';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ToastContainer } from '@/components/ui/Toast';

// Define API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  createdAt: string;
  isVerified: boolean;
}

export default function UsersPage() {
  const { token } = useAuth();
  const { toasts, removeToast, showSuccess, showError, showInfo } = useToast();
  const { confirmDelete } = useConfirmationDialog();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user' as 'user' | 'admin' | 'superadmin',
    isVerified: true,
  });

  const fetchUsers = useCallback(async () => {
    if (!token) return;

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_URL}/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Authentication failed. Please log in again.');
          showError('Authentication failed. Please log in again.');
          return;
        }

        if (response.status === 403) {
          setError('You do not have permission to view users.');
          showError('You do not have permission to view users.');
          return;
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users || []);
      showInfo('Users loaded successfully');
    } catch (error) {
      console.error('Error fetching users:', error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Failed to fetch users. Please try again.';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [token, showError, showInfo]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const refreshUsers = async () => {
    setIsRefreshing(true);
    await fetchUsers();
    setIsRefreshing(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newUserData.email)) {
        setError('Please enter a valid email address');
        showError('Please enter a valid email address');
        return;
      }

      // Validate password
      if (newUserData.password.length < 6) {
        setError('Password must be at least 6 characters long');
        showError('Password must be at least 6 characters long');
        return;
      }

      const response = await fetch(`${API_URL}/api/auth/admin-register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newUserData.name,
          email: newUserData.email,
          password: newUserData.password,
          role: newUserData.role,
          isVerified: newUserData.isVerified,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to create user');
      }

      // Reset form and close modal
      setNewUserData({
        name: '',
        email: '',
        password: '',
        role: 'user',
        isVerified: true,
      });
      setShowCreateModal(false);

      // Refresh user list
      fetchUsers();
      showSuccess(
        `User created successfully${
          newUserData.isVerified ? ' and verified' : ''
        }`
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create user';
      setError(errorMessage);
      showError(errorMessage);
      console.error(error);
    }
  };

  const handleChangeUserRole = async (
    userId: string,
    newRole: 'user' | 'admin' | 'superadmin'
  ) => {
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user role');
      }

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
      showSuccess(`User role updated to ${newRole} successfully`);
    } catch (error) {
      setError('Error updating user role');
      showError('Failed to update user role. Please try again.');
      console.error(error);
    }
  };

  const handleVerifyUser = async (userId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/users/${userId}/verify`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to verify user');
      }

      // Update local state
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, isVerified: true } : user
        )
      );
      showSuccess('User verified successfully');
    } catch (error) {
      setError('Error verifying user');
      showError('Failed to verify user. Please try again.');
      console.error(error);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    const confirmed = await confirmDelete(userName);

    if (!confirmed) return;

    try {
      const response = await fetch(`${API_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      // Remove the user from state
      setUsers(users.filter((user) => user.id !== userId));
      showSuccess('User deleted successfully');
    } catch (error) {
      setError('Error deleting user');
      showError('Failed to delete user. Please try again.');
      console.error(error);
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter users based on search query and filters
  const filteredUsers = users.filter((user) => {
    // Text search filter
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    // Role filter
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    // Verification filter
    const matchesVerification =
      verificationFilter === 'all' ||
      (verificationFilter === 'verified' && user.isVerified) ||
      (verificationFilter === 'unverified' && !user.isVerified);

    return matchesSearch && matchesRole && matchesVerification;
  });

  return (
    <ProtectedRoute requiresAuth superAdminOnly>
      <div className='min-h-screen bg-gray-50'>
        <div className='mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <div className='mb-8'>
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6'>
              <div>
                <h1 className='text-2xl font-bold text-gray-900'>
                  User Management
                </h1>
                <p className='mt-1 text-sm text-gray-500'>
                  Manage user accounts and permissions
                </p>
              </div>
              <div className='flex gap-3'>
                <button
                  onClick={refreshUsers}
                  disabled={isRefreshing}
                  className='inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 shadow-sm transition'
                  title='Refresh user list'
                >
                  <RefreshCw
                    className={`w-4 h-4 mr-2 ${
                      isRefreshing ? 'animate-spin' : ''
                    }`}
                  />
                  <span className='hidden sm:inline'>Refresh</span>
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className='inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 transition-colors'
                >
                  <UserPlus className='w-4 h-4 mr-2' />
                  <span className='hidden sm:inline'>Add User</span>
                </button>
              </div>
            </div>

            {error && (
              <div className='mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-md shadow-sm'>
                <div className='flex items-center'>
                  <AlertCircle className='h-5 w-5 text-red-500 mr-2 flex-shrink-0' />
                  <p className='text-sm text-red-700'>{error}</p>
                </div>
              </div>
            )}

            <div className='mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-200'>
              <div className='flex flex-col md:flex-row gap-4'>
                <div className='flex-grow'>
                  <div className='relative rounded-md shadow-sm'>
                    <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none'>
                      <Search className='h-5 w-5 text-gray-400' />
                    </div>
                    <input
                      type='text'
                      className='block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm'
                      placeholder='Search users by name or email'
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
                <div className='flex flex-wrap sm:flex-nowrap gap-3'>
                  <div className='w-full sm:w-auto'>
                    <label htmlFor='role-filter' className='sr-only'>
                      Filter by role
                    </label>
                    <div className='relative'>
                      <select
                        id='role-filter'
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className='block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md appearance-none'
                      >
                        <option value='all'>All Roles</option>
                        <option value='user'>Users Only</option>
                        <option value='admin'>Admins Only</option>
                        <option value='superadmin'>Super Admins Only</option>
                      </select>
                      <div className='absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none'>
                        <Filter className='h-4 w-4 text-gray-400' />
                      </div>
                    </div>
                  </div>
                  <div className='w-full sm:w-auto'>
                    <label htmlFor='verification-filter' className='sr-only'>
                      Filter by verification
                    </label>
                    <div className='relative'>
                      <select
                        id='verification-filter'
                        value={verificationFilter}
                        onChange={(e) => setVerificationFilter(e.target.value)}
                        className='block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md appearance-none'
                      >
                        <option value='all'>All Users</option>
                        <option value='verified'>Verified Only</option>
                        <option value='unverified'>Unverified Only</option>
                      </select>
                      <div className='absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none'>
                        <Filter className='h-4 w-4 text-gray-400' />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className='flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow-sm border border-gray-200'>
              <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mb-4'></div>
              <p className='text-gray-500'>Loading users...</p>
            </div>
          ) : (
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
              {filteredUsers.length === 0 ? (
                <div className='px-6 py-10 text-center'>
                  <div className='mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100'>
                    <UserIcon className='h-6 w-6 text-gray-400' />
                  </div>
                  <h3 className='mt-2 text-sm font-medium text-gray-900'>
                    No users found
                  </h3>
                  <p className='mt-1 text-sm text-gray-500'>
                    {searchQuery
                      ? 'No users match your search criteria'
                      : 'Get started by creating a new user'}
                  </p>
                  <div className='mt-6'>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none'
                    >
                      <UserPlus className='-ml-1 mr-2 h-5 w-5' />
                      Add New User
                    </button>
                  </div>
                </div>
              ) : (
                <div className='overflow-x-auto'>
                  <table className='min-w-full divide-y divide-gray-200'>
                    <thead className='bg-gray-50'>
                      <tr>
                        <th
                          scope='col'
                          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                        >
                          User
                        </th>
                        <th
                          scope='col'
                          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                        >
                          Role
                        </th>
                        <th
                          scope='col'
                          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                        >
                          Status
                        </th>
                        <th
                          scope='col'
                          className='px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider'
                        >
                          Joined
                        </th>
                        <th
                          scope='col'
                          className='px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider'
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className='bg-white divide-y divide-gray-200'>
                      {filteredUsers.map((user) => (
                        <tr
                          key={user.id}
                          className='hover:bg-gray-50 transition-colors'
                        >
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <div className='flex items-center'>
                              <div className='flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center'>
                                <UserIcon className='h-5 w-5 text-indigo-600' />
                              </div>
                              <div className='ml-4'>
                                <div className='text-sm font-medium text-gray-900'>
                                  {user.name}
                                </div>
                                <div className='text-sm text-gray-500'>
                                  {user.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeClass(
                                user.role
                              )}`}
                            >
                              {user.role === 'superadmin'
                                ? 'Super Admin'
                                : user.role === 'admin'
                                ? 'Admin'
                                : 'User'}
                            </span>
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap'>
                            {user.isVerified ? (
                              <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200'>
                                <CheckCircle className='h-3.5 w-3.5 mr-1' />
                                Verified
                              </span>
                            ) : (
                              <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200'>
                                <Clock className='h-3.5 w-3.5 mr-1' />
                                Unverified
                              </span>
                            )}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-sm text-gray-500'>
                            {new Date(user.createdAt).toLocaleDateString(
                              undefined,
                              {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              }
                            )}
                          </td>
                          <td className='px-6 py-4 whitespace-nowrap text-right text-sm font-medium'>
                            <div className='flex items-center justify-end gap-2'>
                              <select
                                value={user.role}
                                onChange={(e) =>
                                  handleChangeUserRole(
                                    user.id,
                                    e.target.value as
                                      | 'user'
                                      | 'admin'
                                      | 'superadmin'
                                  )
                                }
                                className='text-sm rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 py-1 pl-2 pr-8'
                              >
                                <option value='user'>User</option>
                                <option value='admin'>Admin</option>
                                <option value='superadmin'>Super Admin</option>
                              </select>

                              {!user.isVerified && (
                                <button
                                  onClick={() => handleVerifyUser(user.id)}
                                  className='inline-flex items-center p-1.5 text-sm border border-green-300 bg-green-50 text-green-700 rounded-md hover:bg-green-100 transition'
                                  title='Verify user'
                                >
                                  <CheckCircle className='h-4 w-4' />
                                </button>
                              )}

                              <button
                                onClick={() =>
                                  handleDeleteUser(user.id, user.name)
                                }
                                className='inline-flex items-center p-1.5 text-sm border border-red-300 bg-red-50 text-red-700 rounded-md hover:bg-red-100 transition'
                                title='Delete user'
                              >
                                <X className='h-4 w-4' />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Create User Modal */}
        {showCreateModal && (
          <div className='fixed inset-0 overflow-y-auto z-50 flex items-center justify-center'>
            <div
              className='fixed inset-0 bg-black bg-opacity-50 transition-opacity'
              onClick={() => setShowCreateModal(false)}
            ></div>
            <div className='relative bg-white rounded-lg max-w-md w-full mx-auto p-6 shadow-xl transform transition-all'>
              <div className='flex justify-between items-center mb-5'>
                <h3 className='text-lg font-semibold text-gray-900'>
                  Create New User
                </h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className='text-gray-400 hover:text-gray-500 transition-colors'
                >
                  <X className='h-5 w-5' />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className='space-y-5'>
                <div>
                  <label
                    htmlFor='name'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Name
                  </label>
                  <input
                    type='text'
                    id='name'
                    name='name'
                    required
                    value={newUserData.name}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 shadow-sm'
                    placeholder='Full Name'
                  />
                </div>

                <div>
                  <label
                    htmlFor='email'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Email
                  </label>
                  <input
                    type='email'
                    id='email'
                    name='email'
                    required
                    value={newUserData.email}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 shadow-sm'
                    placeholder='user@example.com'
                  />
                </div>

                <div>
                  <label
                    htmlFor='password'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Password
                  </label>
                  <div className='relative'>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id='password'
                      name='password'
                      required
                      value={newUserData.password}
                      onChange={handleInputChange}
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 shadow-sm'
                      placeholder='Minimum 6 characters'
                    />
                    <button
                      type='button'
                      className='absolute inset-y-0 right-0 pr-3 flex items-center'
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className='h-5 w-5 text-gray-400' />
                      ) : (
                        <Eye className='h-5 w-5 text-gray-400' />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor='role'
                    className='block text-sm font-medium text-gray-700 mb-1'
                  >
                    Role
                  </label>
                  <select
                    id='role'
                    name='role'
                    value={newUserData.role}
                    onChange={handleInputChange}
                    className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 shadow-sm'
                  >
                    <option value='user'>User</option>
                    <option value='admin'>Admin</option>
                    <option value='superadmin'>Super Admin</option>
                  </select>
                </div>

                <div className='flex items-start'>
                  <div className='flex items-center h-5'>
                    <input
                      type='checkbox'
                      id='isVerified'
                      name='isVerified'
                      checked={newUserData.isVerified}
                      onChange={(e) =>
                        setNewUserData((prev) => ({
                          ...prev,
                          isVerified: e.target.checked,
                        }))
                      }
                      className='h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded'
                    />
                  </div>
                  <div className='ml-3 text-sm'>
                    <label
                      htmlFor='isVerified'
                      className='font-medium text-gray-700'
                    >
                      Verify immediately
                    </label>
                    <p className='text-gray-500'>
                      User can log in without email verification
                    </p>
                  </div>
                </div>

                <div className='flex justify-end pt-2 gap-3'>
                  <button
                    type='button'
                    onClick={() => setShowCreateModal(false)}
                    className='px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 shadow-sm'
                  >
                    Cancel
                  </button>
                  <button
                    type='submit'
                    className='px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                  >
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ProtectedRoute>
  );
}
