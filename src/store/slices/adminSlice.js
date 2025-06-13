import { createSlice } from '@reduxjs/toolkit';
import { fetchUsers, deletePost, fetchAdminComments, approveComment, blockComment } from '../actions/adminActions';

const initialState = {
  users: [],
  comments: [],
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload;
        state.loading = false;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(fetchAdminComments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAdminComments.fulfilled, (state, action) => {
        state.comments = action.payload;
        state.loading = false;
      })
      .addCase(fetchAdminComments.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(deletePost.pending, (state) => {
        state.loading = true;
      })
      .addCase(deletePost.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(approveComment.pending, (state) => {
        state.loading = true;
      })
      .addCase(approveComment.fulfilled, (state, action) => {
        const { commentId } = action.payload;
        const comment = state.comments.find((c) => c.id === commentId);
        if (comment) comment.is_approved = true;
        state.loading = false;
      })
      .addCase(approveComment.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(blockComment.pending, (state) => {
        state.loading = true;
      })
      .addCase(blockComment.fulfilled, (state, action) => {
        const { commentId } = action.payload;
        state.comments = state.comments.filter((c) => c.id !== commentId);
        state.loading = false;
      })
      .addCase(blockComment.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export const { clearError } = adminSlice.actions;
export const selectUsers = (state) => state.admin.users;
export const selectAdminComments = (state) => state.admin.comments;
export const selectAdminLoading = (state) => state.admin.loading;
export const selectAdminError = (state) => state.admin.error;

export default adminSlice.reducer;