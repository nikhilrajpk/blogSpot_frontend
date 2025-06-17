import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { selectCurrentPost, selectPostLoading, selectPostError } from '../store/slices/postSlice';
import { fetchPost, likePost, unlikePost, createComment } from '../store/actions/postActions';
import { selectIsAuthenticated, selectCurrentUser } from '../store/slices/authSlice';
import { showToast } from '../store/slices/toastSlice';
import LoadingSpinners from '../utils/Loader';
import { debounce } from 'lodash';

const PostDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const post = useSelector(selectCurrentPost);
  const loading = useSelector(selectPostLoading);
  const error = useSelector(selectPostError);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const [commentContent, setCommentContent] = useState('');
  const [commentError, setCommentError] = useState('');
  const [hasLiked, setHasLiked] = useState(false);
  const [hasUnliked, setHasUnliked] = useState(false);

  const debouncedFetchPost = useCallback(
    debounce((postId) => {
      dispatch(fetchPost(postId));
    }, 300),[dispatch]
  );

  useEffect(() => {
    debouncedFetchPost(id);
    return () => debouncedFetchPost.cancel();
  }, [id, debouncedFetchPost]);

  useEffect(() => {
    if (post && currentUser) {
      setHasLiked(post.likes.includes(currentUser.id));
      setHasUnliked(post.unlikes.includes(currentUser.id));
    }
  }, [post, currentUser]);

  const validateComment = (content) => {
    if (!content.trim()) {
      return 'Comment cannot be empty.';
    }
    if (content.length < 5) {
      return 'Comment must be at least 5 characters long.';
    }
    if (content.length > 500) {
      return 'Comment cannot exceed 500 characters.';
    }
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
      dispatch(showToast({ message: 'Comment submitted for review! It will appear once approved.', type: 'success' }));
      setCommentContent('');
      setCommentError('');
      debouncedFetchPost(id); // Refresh post to ensure approved comments only
    } catch (err) {
      const errorMessage = err?.content?.[0] || err?.detail || 'Failed to post comment.';
      setCommentError(errorMessage);
      dispatch(showToast({ message: errorMessage, type: 'error' }));
      console.error('Comment error:', err);
    }
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      dispatch(showToast({ message: 'Please log in to like posts.', type: 'warning' }));
      return;
    }
    if (hasLiked) {
      dispatch(showToast({ message: 'You have already liked this post.', type: 'warning' }));
      return;
    }
    try {
      await dispatch(likePost(id)).unwrap();
      dispatch(showToast({ message: 'Post liked!', type: 'success' }));
      setHasLiked(true);
      setHasUnliked(false);
      debouncedFetchPost(id);
    } catch (err) {
      dispatch(showToast({ message: 'Failed to like post.', type: 'error' }));
    }
  };

  const handleUnlike = async () => {
    if (!isAuthenticated) {
      dispatch(showToast({ message: 'Please log in to unlike posts.', type: 'warning' }));
      return;
    }
    if (hasUnliked) {
      dispatch(showToast({ message: 'You have already unliked this post.', type: 'warning' }));
      return;
    }
    try {
      await dispatch(unlikePost(id)).unwrap();
      dispatch(showToast({ message: 'Post unliked!', type: 'success' }));
      setHasUnliked(true);
      setHasLiked(false);
      debouncedFetchPost(id);
    } catch (err) {
      dispatch(showToast({ message: 'Failed to unlike post.', type: 'error' }));
    }
  };

  if (loading) return <LoadingSpinners />;
  if (error) return <div className="text-red-600 text-center">Error: {error.message || 'Failed to load post'}</div>;
  if (!post) return null;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">{post.title}</h1>
      {post.image && (
        <img src={post.image} alt={post.title} className="w-full max-w-2xl mx-auto h-auto rounded-lg mb-4" />
      )}
      <p className="text-gray-600 mb-4">{post.content}</p>
      <p className="text-sm text-gray-500 mb-2">By: {post.author.username} | {new Date(post.created_at).toLocaleDateString()}</p>
      <div className="flex space-x-4 mb-6">
        <button
          onClick={handleLike}
          disabled={hasLiked}
          className={`text-blue-600 hover:text-blue-700 font-semibold ${hasLiked ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Like ({post.likes_count})
        </button>
        <button
          onClick={handleUnlike}
          disabled={hasUnliked}
          className={`text-red-600 hover:text-red-700 font-semibold ${hasUnliked ? 'opacity-50 cursor-not-allowed' : ''}`}
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
              <p className="text-sm text-gray-400">By {comment.author.username} | {new Date(comment.created_at).toLocaleDateString()}</p>
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
          disabled={loading || commentError}
          className="bg-emerald-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
        >
          Post Comment
        </button>
      </form>
    </div>
  );
};

export default PostDetail;