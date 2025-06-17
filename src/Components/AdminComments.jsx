import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { selectCurrentUser } from '../store/slices/authSlice';
import { showToast } from '../store/slices/toastSlice';
import LoadingSpinners from '../utils/Loader';
import usePagination from '../utils/usePagination';
import Pagination from './Pagination';

const fetchComments = async () => {
  const response = await api.get('/posts/admin/comments/');
  return response.data;
};

const approveComment = async (commentId) => {
  const response = await api.post(`/posts/admin/comments/${commentId}/approve/`);
  return response.data;
};

const blockComment = async (commentId) => {
  const response = await api.post(`/posts/admin/comments/${commentId}/block/`);
  return response.data;
};

const AdminComments = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: comments = [], isLoading, isError, error } = useQuery({
    queryKey: ['adminComments'],
    queryFn: fetchComments,
    enabled: !!currentUser?.is_staff,
  });

  const approveMutation = useMutation({
    mutationFn: approveComment,
    onSuccess: () => {
      queryClient.invalidateQueries(['adminComments']);
      dispatch(showToast({ message: 'Comment approved successfully!', type: 'success' }));
    },
    onError: () => {
      dispatch(showToast({ message: 'Failed to approve comment.', type: 'error' }));
    },
  });

  const blockMutation = useMutation({
    mutationFn: blockComment,
    onSuccess: () => {
      queryClient.invalidateQueries(['adminComments']);
      dispatch(showToast({ message: 'Comment blocked successfully!', type: 'success' }));
    },
    onError: () => {
      dispatch(showToast({ message: 'Failed to block comment.', type: 'error' }));
    },
  });

  const filteredComments = comments
    .filter((comment) => comment.content.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const { currentPage, totalPages, paginatedData, onPageChange } = usePagination(filteredComments);

  const handleApprove = (commentId) => {
    if (!window.confirm('Are you sure you want to approve this comment?')) return;
    approveMutation.mutate(commentId);
  };

  const handleBlock = (commentId) => {
    if (!window.confirm('Are you sure you want to block this comment?')) return;
    blockMutation.mutate(commentId);
  };

  if (!currentUser?.is_staff) {
    dispatch(showToast({ message: 'Access denied. Admins only.', type: 'warning' }));
    return null;
  }
  if (isLoading) return <LoadingSpinners />;
  if (isError) return <div className="text-red-600 text-center">Error: {error.message || 'Failed to load comments'}</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Manage Comments</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by comment content..."
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Content</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Post Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((comment) => (
              <tr key={comment.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comment.id}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{comment.content.substring(0, 50)}...</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comment.post_title || 'Unknown'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comment.author?.username || 'Unknown'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comment.is_approved ? 'Approved' : 'Pending'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm space-x-2">
                  {!comment.is_approved && (
                    <button
                      onClick={() => handleApprove(comment.id)}
                      disabled={approveMutation.isLoading}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => handleBlock(comment.id)}
                    disabled={blockMutation.isLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Block
                  </button>
                </td>
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

export default AdminComments;