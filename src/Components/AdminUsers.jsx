import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { selectCurrentUser } from '../store/slices/authSlice';
import { showToast } from '../store/slices/toastSlice';
import LoadingSpinners from '../utils/Loader';
import usePagination from '../utils/usePagination';
import Pagination from './Pagination';

const fetchUsers = async () => {
  const response = await api.get('/auth/users/');
  return response.data;
};

const AdminUsers = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: users = [], isLoading, isError, error } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
    enabled: !!currentUser?.is_staff,
  });

  const filteredUsers = users
    .filter(
      (user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));

  const { currentPage, totalPages, paginatedData, onPageChange } = usePagination(filteredUsers);

  if (!currentUser?.is_staff) {
    dispatch(showToast({ message: 'Access denied. Admins only.', type: 'warning' }));
    return null;
  }
  if (isLoading) return <LoadingSpinners />;
  if (isError) return <div className="text-red-600 text-center">Error: {error.message || 'Failed to load users'}</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Manage Users</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by username or email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
      <div className="overflow-x-auto bg-white shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Staff</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.is_staff ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={onPageChange} />
      )}
    </div>
  );
};

export default AdminUsers;