import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectUsers, selectAdminLoading, selectAdminError } from '../store/slices/adminSlice';
import { fetchUsers } from '../store/actions/adminActions';
import { selectCurrentUser } from '../store/slices/authSlice';
import { showToast } from '../store/slices/toastSlice';
import LoadingSpinners from '../utils/Loader';

const AdminUsers = () => {
  const dispatch = useDispatch();
  const users = useSelector(selectUsers);
  const loading = useSelector(selectAdminLoading);
  const error = useSelector(selectAdminError);
  const currentUser = useSelector(selectCurrentUser);

  useEffect(() => {
    if (!currentUser?.is_staff) {
      dispatch(showToast({ message: 'Access denied. Admins only.', type: 'warning' }));
      return;
    }
    dispatch(fetchUsers());
  }, [dispatch, currentUser]);

  if (!currentUser?.is_staff) return null;
  if (loading) return <LoadingSpinners />;
  if (error) return <div className="text-red-600 text-center">Error: {error.message || 'Failed to load users'}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Manage Users</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-4">ID</th>
            <th className="text-left p-4">Username</th>
            <th className="text-left p-4">Email</th>
            <th className="text-left p-4">Staff</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t">
              <td className="p-4">{user.id}</td>
              <td className="p-4">{user.username}</td>
              <td className="p-4">{user.email}</td>
              <td className="p-4">{user.is_staff ? 'Yes' : 'No'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsers;