import { createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/posts/posts/');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch posts');
    }
  }
);

export const fetchPost = createAsyncThunk(
  'posts/fetchPost',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/posts/posts/${id}/`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to fetch post');
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await api.post('/posts/posts/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create post');
    }
  }
);


export const createComment = createAsyncThunk(
  'posts/createComment',
  async ({ postId, content }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/posts/posts/${postId}/comments/`, { content });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to create comment');
    }
  }
);

export const likePost = createAsyncThunk(
  'posts/likePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/posts/posts/${postId}/like/`);
      return { postId, status: response.data.status };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to like post');
    }
  }
);

export const unlikePost = createAsyncThunk(
  'posts/unlikePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/posts/posts/${postId}/unlike/`);
      return { postId, status: response.data.status };
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to unlike post');
    }
  }
);