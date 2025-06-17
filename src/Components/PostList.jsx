import React, { useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useVirtualizer } from '@tanstack/react-virtual';
import api from '../utils/api';
import { selectIsAuthenticated, selectCurrentUser } from '../store/slices/authSlice';
import { showToast } from '../store/slices/toastSlice';
import LoadingSpinners from '../utils/Loader';

// Fetch posts
const fetchPosts = async ({ pageParam = 1 }) => {
  const response = await api.get(`/posts/posts/?page=${pageParam}`);
  console.log('Fetched posts:', response.data);
  return response.data;
};

// Like post
const likePost = async (postId) => {
  const response = await api.post(`/posts/posts/${postId}/like/`);
  return response.data;
};

// Unlike post
const unlikePost = async (postId) => {
  const response = await api.post(`/posts/posts/${postId}/unlike/`);
  return response.data;
};

// Utility to group posts into rows of three
const groupIntoRows = (posts, itemsPerRow = 3) => {
  const rows = [];
  for (let i = 0; i < posts.length; i += itemsPerRow) {
    rows.push(posts.slice(i, i + itemsPerRow));
  }
  return rows;
};

const PostList = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const currentUser = useSelector(selectCurrentUser);
  const parentRef = useRef();
  const queryClient = useQueryClient();

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error,
  } = useInfiniteQuery({
    queryKey: ['posts'],
    queryFn: fetchPosts,
    getNextPageParam: (lastPage) => {
      if (Array.isArray(lastPage)) return undefined;
      return lastPage.next ? lastPage.current_page + 1 : undefined;
    },
    initialPageParam: 1,
  });

  const likeMutation = useMutation({
    mutationFn: likePost,
    onSuccess: () => {
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
      queryClient.invalidateQueries(['posts']);
      dispatch(showToast({ message: 'Post unliked!', type: 'success' }));
    },
    onError: () => {
      dispatch(showToast({ message: 'Failed to unlike post.', type: 'error' }));
    },
  });

  const posts = data?.pages.flatMap((page) => (Array.isArray(page) ? page : page.results)) || [];
  const rows = groupIntoRows(posts, 3);
  console.log('Posts:', posts, 'Rows:', rows);

  const rowVirtualizer = useVirtualizer({
    count: hasNextPage ? rows.length + 1 : rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 450,
    overscan: 3,
  });

  const virtualRows = rowVirtualizer.getVirtualItems();
  console.log('Virtual rows:', virtualRows);

  React.useEffect(() => {
    console.log('Parent ref:', parentRef.current);
    const [lastRow] = [...virtualRows].reverse();
    if (!lastRow) return;
    if (lastRow.index >= rows.length - 1 && hasNextPage && !isFetchingNextPage) {
      console.log('Fetching next page');
      fetchNextPage();
    }
  }, [virtualRows, rows.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleLike = (postId, hasLiked) => {
    if (!isAuthenticated) {
      dispatch(showToast({ message: 'Please log in to like posts.', type: 'warning' }));
      return;
    }
    if (hasLiked) {
      dispatch(showToast({ message: 'You have already liked this post.', type: 'warning' }));
      return;
    }
    likeMutation.mutate(postId);
  };

  const handleUnlike = (postId, hasUnliked) => {
    if (!isAuthenticated) {
      dispatch(showToast({ message: 'Please log in to unlike posts.', type: 'warning' }));
      return;
    }
    if (hasUnliked) {
      dispatch(showToast({ message: 'You have already unliked this post.', type: 'warning' }));
      return;
    }
    unlikeMutation.mutate(postId);
  };

  if (isLoading) return <LoadingSpinners />;
  if (isError) return <div className="text-red-600 text-center">Error: {error.message || 'Failed to load posts'}</div>;
  if (posts.length === 0) return <div className="text-center text-gray-600">No posts available.</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Blog Posts</h1>
      <div ref={parentRef} className="h-[600px] overflow-auto border border-gray-300">
        <div
          style={{ height: `${rowVirtualizer.getTotalSize()}px`, position: 'relative' }}
          className="space-y-6"
        >
          {virtualRows.map((virtualRow) => {
            const row = rows[virtualRow.index];
            if (!row) return null;
            return (
              <div
                key={virtualRow.key}
                data-index={virtualRow.index}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  transform: `translateY(${virtualRow.start}px)`,
                }}
                className="px-2"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {row.map((post) => {
                    const hasLiked = currentUser && post.likes.includes(currentUser.id);
                    const hasUnliked = currentUser && post.unlikes.includes(currentUser.id);
                    return (
                      <div
                        key={post.id}
                        className="bg-white rounded-lg shadow-md p-4 flex flex-col h-full"
                      >
                        {post.image && (
                          <img
                            src={post.image}
                            alt={post.title}
                            className="w-full h-48 object-cover rounded-t-lg"
                          />
                        )}
                        <h2 className="text-xl font-semibold mt-4">{post.title}</h2>
                        <p className="text-gray-600 mt-2 flex-grow">
                          {post.content.substring(0, 100)}...
                        </p>
                        <p className="text-sm text-gray-500 mt-2">
                          By {post.author?.username || 'Unknown'} |{' '}
                          {new Date(post.created_at).toLocaleDateString()}
                        </p>
                        <div className="flex space-x-4 mt-2">
                          <button
                            onClick={() => handleLike(post.id, hasLiked)}
                            disabled={hasLiked || likeMutation.isLoading}
                            className={`text-blue-600 hover:text-blue-700 ${
                              hasLiked || likeMutation.isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            Like ({post.likes_count})
                          </button>
                          <button
                            onClick={() => handleUnlike(post.id, hasUnliked)}
                            disabled={hasUnliked || unlikeMutation.isLoading}
                            className={`text-red-600 hover:text-red-700 ${
                              hasUnliked || unlikeMutation.isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            Unlike ({post.unlikes_count})
                          </button>
                          <span className="text-sm text-gray-500">
                            Views: {post.read_count}
                          </span>
                        </div>
                        <Link
                          to={`/posts/${post.id}`}
                          className="text-emerald-600 hover:underline mt-4 inline-block"
                        >
                          Read More
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
          {isFetchingNextPage && (
            <div className="text-center p-4">Loading more posts...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PostList;