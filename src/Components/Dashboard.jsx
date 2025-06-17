import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectPostLoading } from '../store/slices/postSlice';
import { createPost } from '../store/actions/postActions';
import { selectCurrentUser } from '../store/slices/authSlice';
import { showToast } from '../store/slices/toastSlice';
import LoadingSpinners from '../utils/Loader';

const Dashboard = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const loading = useSelector(selectPostLoading);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    image: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'image' ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.content.trim()) {
      dispatch(showToast({ message: 'Title and content are required.', type: 'error' }));
      return;
    }
    const data = new FormData();
    data.append('title', formData.title);
    data.append('content', formData.content);
    if (formData.image) data.append('image', formData.image);

    try {
      await dispatch(createPost(data)).unwrap();
      dispatch(showToast({ message: 'Post created successfully!', type: 'success' }));
      setFormData({ title: '', content: '', image: null });
    } catch (err) {
      dispatch(showToast({ message: err || 'Failed to create post.', type: 'error' }));
    }
  };

  if (!user) return <LoadingSpinners />;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Welcome, {user.username}!</h1>

      {user.is_staff && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Admin Actions</h3>
          <div className="space-x-4">
            <Link to="/admin/users" className="text-blue-600 hover:underline">Manage Users</Link>
            <Link to="/admin/posts" className="text-blue-600 hover:underline">Manage Posts</Link>
            <Link to="/admin/comments" className="text-blue-600 hover:underline">Manage Comments</Link>
          </div>
        </div>
      )}

      <h3 className="text-xl font-semibold mb-4">Create New Post</h3>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl mx-auto">
        <div>
          <label htmlFor="title" className="text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-200"
            required
          />
        </div>
        <div>
          <label htmlFor="content" className="text-sm font-medium text-gray-700">Content</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            className="w-full p-3 border rounded-lg h-32 focus:outline-none focus:ring-2 focus:ring-emerald-200"
            required
          ></textarea>
        </div>
        <div>
          <label htmlFor="image" className="text-sm font-medium text-gray-700">Image (Optional)</label>
          <input
            type="file"
            id="image"
            name="image"
            accept="image/*"
            onChange={handleChange}
            className="mt-2"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Post'}
        </button>
      </form>
    </div>
  );
};

export default Dashboard;