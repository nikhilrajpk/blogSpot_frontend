import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectPosts, selectPostLoading, selectPostError } from '../store/slices/postSlice';
import { fetchPosts, likePost, unlikePost,  } from '../store/actions/postActions';
import { selectIsAuthenticated, selectCurrentUser } from '../store/slices/authSlice';
import { showToast } from '../store/slices/toastSlice';
import LoadingSpinners from '../utils/Loader';

const PostList = () => {
  const dispatch = useDispatch();
  const posts = useSelector(selectPosts);
  const loading = useSelector(selectPostLoading);
  const error = useSelector(selectPostError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);

  useEffect(() => {
    dispatch(fetchPosts());
  }, [dispatch]);

  const handleLike = async (postId, hasLiked) => {
    if (!isAuthenticated) {
      dispatch(showToast({ message: 'Please log in to like posts.', type: 'warning' }));
      return;
    }
    if (hasLiked) {
      dispatch(showToast({ message: 'You have already liked this post.', type: 'warning' }));
      return;
    }
    try {
      await dispatch(likePost(postId)).unwrap();
      dispatch(showToast({ message: 'Post liked!', type: 'success' }));
      dispatch(fetchPosts()); // Refresh posts
    } catch (err) {
      dispatch(showToast({ message: 'Failed to like post.', type: 'error' }));
    }
  };

  const handleUnlike = async (postId, hasUnliked) => {
    if (!isAuthenticated) {
      dispatch(showToast({ message: 'Please log in to unlike posts.', type: 'warning' }));
      return;
    }
    if (hasUnliked) {
      dispatch(showToast({ message: 'You have already unliked this post.', type: 'warning' }));
      return;
    }
    try {
      await dispatch(unlikePost(postId)).unwrap();
      dispatch(showToast({ message: 'Post unliked!', type: 'success' }));
      dispatch(fetchPosts()); // Refresh posts
    } catch (err) {
      dispatch(showToast({ message: 'Failed to unlike post.', type: 'error' }));
    }
  };

  if (loading) return <LoadingSpinners />;
  if (error) return <div className="text-red-600 text-center">Error: {error.message || 'Failed to load posts'}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Blog Posts</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => {
          const hasLiked = currentUser && post.likes.includes(currentUser.id);
          const hasUnliked = currentUser && post.unlikes.includes(currentUser.id);
          return (
            <div key={post.id} className="bg-white rounded-lg shadow-md p-4">
              {post.image && (
                <img src={post.image} alt={post.title} className="w-full h-48 object-cover rounded-t-lg" />
              )}
              <h2 className="text-xl font-semibold mt-4">{post.title}</h2>
              <p className="text-gray-600 mt-2">{post.content.substring(0, 100)}...</p>
              <p className="text-sm text-gray-500 mt-2">
                By {post.author.username} | {new Date(post.created_at).toLocaleDateString()}
              </p>
              <div className="flex space-x-4 mt-2">
                <button
                  onClick={() => handleLike(post.id, hasLiked)}
                  disabled={hasLiked}
                  className={`text-blue-600 hover:text-blue-700 ${hasLiked ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Like ({post.likes_count})
                </button>
                <button
                  onClick={() => handleUnlike(post.id, hasUnliked)}
                  disabled={hasUnliked}
                  className={`text-red-600 hover:text-red-700 ${hasUnliked ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  Unlike ({post.unlikes_count})
                </button>
                <span className="text-sm text-gray-500">Views: {post.read_count}</span>
              </div>
              <Link to={`/posts/${post.id}`} className="text-emerald-600 hover:underline mt-4 inline-block">
                Read More
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PostList;