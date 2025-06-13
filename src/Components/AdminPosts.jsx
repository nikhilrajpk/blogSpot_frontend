import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectPosts, selectPostLoading, selectPostError } from '../store/slices/postSlice';
import { fetchPosts } from '../store/actions/postActions';
import { deletePost } from '../store/actions/adminActions';
import { selectCurrentUser } from '../store/slices/authSlice';
import { showToast } from '../store/slices/toastSlice';
import LoadingSpinners from '../utils/Loader';

const AdminPosts = () => {
  const dispatch = useDispatch();
  const posts = useSelector(selectPosts);
  const loading = useSelector(selectPostLoading);
  const error = useSelector(selectPostError);
  const currentUser = useSelector(selectCurrentUser);

  useEffect(() => {
    if (!currentUser?.is_staff) {
      dispatch(showToast({ message: 'Access denied. Admins only.', type: 'warning' }));
      return;
    }
    dispatch(fetchPosts());
  }, [dispatch, currentUser]);

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await dispatch(deletePost(postId)).unwrap();
      dispatch(showToast({ message: 'Post deleted successfully!', type: 'success' }));
    } catch (err) {
      dispatch(showToast({ message: 'Failed to delete post.', type: 'error' }));
    }
  };

  if (!currentUser?.is_staff) return null;
  if (loading) return <LoadingSpinners />;
  if (error) return <div className="text-red-600 text-center">Error: {error.message || 'Failed to load posts'}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Manage Posts</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-4">ID</th>
            <th className="text-left p-4">Title</th>
            <th className="text-left p-4">Author</th>
            <th className="text-center p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <tr key={post.id} className="border-t">
              <td className="p-4">{post.id}</td>
              <td className="p-4">{post.title}</td>
              <td className="p-4">{post.author.username}</td>
              <td className="text-center p-4">
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPosts;