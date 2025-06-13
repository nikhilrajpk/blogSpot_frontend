import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectAdminComments, selectAdminLoading, selectAdminError } from '../store/slices/adminSlice';
import { fetchAdminComments, approveComment, blockComment } from '../store/actions/adminActions';
import { selectCurrentUser } from '../store/slices/authSlice';
import { showToast } from '../store/slices/toastSlice';
import LoadingSpinners from '../utils/Loader';

const AdminComments = () => {
  const dispatch = useDispatch();
  const comments = useSelector(selectAdminComments);
  const loading = useSelector(selectAdminLoading);
  const error = useSelector(selectAdminError);
  const currentUser = useSelector(selectCurrentUser);

  useEffect(() => {
    if (!currentUser?.is_staff) {
      dispatch(showToast({ message: 'Access denied. Admins only.', type: 'warning' }));
      return;
    }
    dispatch(fetchAdminComments());
  }, [dispatch, currentUser]);

  const handleApprove = async (commentId) => {
    if (!window.confirm('Are you sure you want to approve this comment?')) return;
    try {
      await dispatch(approveComment(commentId)).unwrap();
      dispatch(showToast({ message: 'Comment approved successfully!', type: 'success' }));
      dispatch(fetchAdminComments()); // Refresh comments
    } catch (err) {
      dispatch(showToast({ message: 'Failed to approve comment.', type: 'error' }));
    }
  };

  const handleBlock = async (commentId) => {
    if (!window.confirm('Are you sure you want to block this comment?')) return;
    try {
      await dispatch(blockComment(commentId)).unwrap();
      dispatch(showToast({ message: 'Comment blocked successfully!', type: 'success' }));
      dispatch(fetchAdminComments()); // Refresh comments
    } catch (err) {
      dispatch(showToast({ message: 'Failed to block comment.', type: 'error' }));
    }
  };

  if (!currentUser?.is_staff) return null;
  if (loading) return <LoadingSpinners />;
  if (error) return <div className="text-red-600 text-center">Error: {error.message || 'Failed to load comments'}</div>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Manage Comments</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="text-left p-4">ID</th>
            <th className="text-left p-4">Content</th>
            <th className="text-left p-4">Post Title</th>
            <th className="text-left p-4">Author</th>
            <th className="text-left p-4">Status</th>
            <th className="text-center p-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {comments.map((comment) => (
            <tr key={comment.id} className="border-t">
              <td className="p-4">{comment.id}</td>
              <td className="p-4">{comment.content.substring(0, 50)}...</td>
              <td className="p-4">{comment.post_title || 'Unknown Post'}</td>
              <td className="p-4">{comment.author?.username || 'Unknown'}</td>
              <td className="p-4">{comment.is_approved ? 'Approved' : 'Pending'}</td>
              <td className="text-center p-4">
                {!comment.is_approved && (
                  <button
                    onClick={() => handleApprove(comment.id)}
                    className="text-green-600 hover:text-green-700 mr-4"
                  >
                    Approve
                  </button>
                )}
                <button
                  onClick={() => handleBlock(comment.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Block
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminComments;