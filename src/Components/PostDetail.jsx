import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { selectIsAuthenticated, selectCurrentUser } from '../store/slices/authSlice';
import { showToast } from '../store/slices/toastSlice';
import { createComment } from '../store/actions/postActions';
import LoadingSpinners from '../utils/Loader';

const fetchPost = async (postId) => {
  const response = await api.get(`/posts/posts/${postId}/`);
  console.log('Fetched post:', response.data);
  return response.data;
};

const likePost = async (postId) => {
  const response = await api.post(`/posts/posts/${postId}/like/`);
  return response.data;
};

const unlikePost = async (postId) => {
  const response = await api.post(`/posts/posts/${postId}/unlike/`);
  return response.data;
};

const PostDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const queryClient = useQueryClient();
  const [commentContent, setCommentContent] = useState('');
  const [commentError, setCommentError] = useState('');

  const { data: post, isLoading, isError, error } = useQuery({
    queryKey: ['post', id],
    queryFn: () => fetchPost(id),
  });

  const likeMutation = useMutation({
    mutationFn: likePost,
    onSuccess: () => {
      queryClient.invalidateQueries(['post', id]);
      queryClient.invalidateQueries(['posts']);
      dispatch(showToast({ message: 'Post liked!', type: 'success' }));
    },
    onError: () => {
      dispatch(showToast({ message: 'Failed to like post.', type: 'error' }));
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: unlikePost,
    onSuccess: () => {
      queryClient.invalidateQueries(['post', id]);
      queryClient.invalidateQueries(['posts']);
      dispatch(showToast({ message: 'Post unliked!', type: 'success' }));
    },
    onError: () => {
      dispatch(showToast({ message: 'Failed to unlike post.', type: 'error' }));
    },
  });

  const validateComment = (content) => {
    if (!content.trim()) return 'Comment cannot be empty.';
    if (content.length < 5) return 'Comment must be at least 5 characters long.';
    if (content.length > 500) return 'Comment cannot exceed 500 characters.';
    return '';
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      dispatch(showToast({ message: 'Please log in to comment.', type: 'warning' }));
      return;
    }
    const error = validateComment(commentContent);
    if (error) {
      setCommentError(error);
      dispatch(showToast({ message: error, type: 'error' }));
      return;
    }
    try {
      await dispatch(createComment({ postId: id, content: commentContent.trim() })).unwrap();
      dispatch(showToast({ message: 'Comment submitted for review!', type: 'success' }));
      setCommentContent('');
      setCommentError('');
      queryClient.invalidateQueries(['post', id]);
    } catch (err) {
      const errorMessage = err?.content?.[0] || err?.detail || 'Failed to post comment.';
      setCommentError(errorMessage);
      dispatch(showToast({ message: errorMessage, type: 'error' }));
      console.error('Comment error:', err);
    }
  };

  const handleLike = () => {
    if (!isAuthenticated) {
      dispatch(showToast({ message: 'Please log in to like posts.', type: 'warning' }));
      return;
    }
    if (hasLiked) {
      dispatch(showToast({ message: 'You have already liked this post.', type: 'warning' }));
      return;
    }
    likeMutation.mutate(id);
  };

  const handleUnlike = () => {
    if (!isAuthenticated) {
      dispatch(showToast({ message: 'Please log in to unlike posts.', type: 'warning' }));
      return;
    }
    if (hasUnliked) {
      dispatch(showToast({ message: 'You have already unliked this post.', type: 'warning' }));
      return;
    }
    unlikeMutation.mutate(id);
  };

  const hasLiked = post && currentUser && post.likes.includes(currentUser.id);
  const hasUnliked = post && currentUser && post.unlikes.includes(currentUser.id);

  if (isLoading) return <LoadingSpinners />;
  if (isError) return <div className="text-red-600 text-center">Error: {error.message || 'Failed to load post'}</div>;
  if (!post) return <div className="text-gray-600 text-center">Post not found.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      {post.image && (
        <img src={post.image} alt={post.title} className="w-full max-w-2xl mx-auto h-auto rounded-lg mb-4" />
      )}
      <p className="text-gray-600 mb-4">{post.content}</p>
      <p className="text-sm text-gray-500 mb-2">
        By: {post.author?.username || 'Unknown'} | {new Date(post.created_at).toLocaleDateString()}
      </p>
      <div className="flex space-x-4 mb-6">
        <button
          onClick={handleLike}
          disabled={hasLiked || likeMutation.isLoading}
          className={`text-blue-600 hover:text-blue-700 font-semibold ${hasLiked || likeMutation.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Like ({post.likes_count})
        </button>
        <button
          onClick={handleUnlike}
          disabled={hasUnliked || unlikeMutation.isLoading}
          className={`text-red-600 hover:text-red-700 font-semibold ${hasUnliked || unlikeMutation.isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Unlike ({post.unlikes_count})
        </button>
        <span className="text-sm text-gray-500">Views: {post.read_count}</span>
      </div>

      <h3 className="text-2xl font-semibold mb-4">Comments</h3>
      {post.comments.length > 0 ? (
        <ul className="space-y-4 mb-6">
          {post.comments.map((comment) => (
            <li key={comment.id} className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-gray-600">{comment.content}</p>
              <p className="text-sm text-gray-400">
                By {comment.author?.username || 'Unknown'} | {new Date(comment.created_at).toLocaleDateString()}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600 mb-6">No approved comments yet.</p>
      )}

      <form onSubmit={handleCommentSubmit} className="space-y-4">
        <textarea
          value={commentContent}
          onChange={(e) => {
            setCommentContent(e.target.value);
            setCommentError(validateComment(e.target.value));
          }}
          placeholder="Write a comment..."
          className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-200 ${commentError ? 'border-red-500' : ''}`}
          rows="4"
        />
        {commentError && <p className="text-red-500 text-sm mt-1">{commentError}</p>}
        <button
          type="submit"
          disabled={commentError}
          className="bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
        >
          Post Comment
        </button>
      </form>
    </div>
  );
};

export default PostDetail;