import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// export const fetchUsers = createAsyncThunk(
//   'admin/fetchUsers',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await api.get('/auth/users/');
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to fetch users');
//     }
//   }
// );

export const deletePost = createAsyncThunk(
  'admin/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      await api.delete(`/posts/posts/${postId}/`);
      return postId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete post');
    }
  }
);

// export const fetchAdminComments = createAsyncThunk(
//   'admin/fetchAdminComments',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await api.get('/posts/admin/comments/');
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to fetch comments');
//     }
//   }
// );

// export const approveComment = createAsyncThunk(
//   'admin/approveComment',
//   async (commentId, { rejectWithValue }) => {
//     try {
//       const response = await api.post(`/posts/admin/comments/${commentId}/approve/`);
//       return { commentId, status: response.data.status };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to approve comment');
//     }
//   }
// );

// export const blockComment = createAsyncThunk(
//   'admin/blockComment',
//   async (commentId, { rejectWithValue }) => {
//     try {
//       const response = await api.post(`/posts/admin/comments/${commentId}/block/`);
//       return { commentId, status: response.data.status };
//     } catch (error) {
//       return rejectWithValue(error.response?.data || 'Failed to block comment');
//     }
//   }
// );