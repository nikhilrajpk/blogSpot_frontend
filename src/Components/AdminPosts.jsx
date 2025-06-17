import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { selectCurrentUser } from '../store/slices/authSlice';
import { showToast } from '../store/slices/toastSlice';
import LoadingSpinners from '../utils/Loader';
import usePagination from '../utils/usePagination';
import Pagination from './Pagination';

const fetchPosts = async () => {
  const response = await api.get('/posts/admin/posts/');
  return response.data;
};

const deletePost = async (postId) => {
  await api.delete(`/posts/posts/${postId}/`);
};

const AdminPosts = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectCurrentUser);
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: posts = [], isLoading, isError, error } = useQuery({
    queryKey: ['adminPosts'],
    queryFn: fetchPosts,
    enabled: !!currentUser?.is_staff,
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries(['adminPosts']);
      dispatch(showToast({ message: 'Post deleted successfully!', type: 'success' }));
    },
    onError: () => {
      dispatch(showToast({ message: 'Failed to delete post.', type: 'error' }));
    },
  });

  const filteredPosts = posts
    .filter(
      (post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  const { currentPage, totalPages, paginatedData, onPageChange } = usePagination(filteredPosts);

  const handleDeletePost = (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    deleteMutation.mutate(postId);
  };

  if (!currentUser?.is_staff) {
    dispatch(showToast({ message: 'Access denied. Admins only.', type: 'warning' }));
    return null;
  }
  if (isLoading) return <LoadingSpinners />;
  if (isError) return <div className="text-red-600 text-center">Error: {error.message || 'Failed to load posts'}</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Manage Posts</h1>
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by title or content..."
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Author</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedData.map((post) => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.id}</td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{post.title}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.author?.username || 'Unknown'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                  <button
                    onClick={() => handleDeletePost(post.id)}
                    disabled={deleteMutation.isLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Delete
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

export default AdminPosts;