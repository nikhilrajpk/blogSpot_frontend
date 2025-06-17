import { createSlice } from '@reduxjs/toolkit';
import { fetchPosts, createPost, createComment,} from '../actions/postActions';

const initialState = {
  posts: [],
  currentPost: null,
  loading: false,
  error: null,
};

const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.posts = action.payload;
        state.loading = false;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      // .addCase(fetchPost.pending, (state) => {
      //   state.loading = true;
      // })
      // .addCase(fetchPost.fulfilled, (state, action) => {
      //   state.currentPost = action.payload;
      //   state.loading = false;
      // })
      // .addCase(fetchPost.rejected, (state, action) => {
      //   state.error = action.payload;
      //   state.loading = false;
      // })
      .addCase(createPost.pending, (state) => {
        state.loading = true;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.posts.unshift(action.payload);
        state.loading = false;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(createComment.pending, (state) => {
        state.loading = true;
      })
      .addCase(createComment.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createComment.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      // .addCase(likePost.fulfilled, (state, action) => {
      //   const { postId } = action.payload;
      //   const post = state.posts.find((p) => p.id === postId) || (state.currentPost?.id === postId ? state.currentPost : null);
      //   if (post && !post.likes.includes(action.meta.arg.userId)) {
      //     post.likes_count += 1;
      //     post.likes.push(action.meta.arg.userId);
      //     if (post.unlikes_count > 0 && post.unlikes.includes(action.meta.arg.userId)) {
      //       post.unlikes_count -= 1;
      //       post.unlikes = post.unlikes.filter((id) => id !== action.meta.arg.userId);
      //     }
      //   }
      // })
      // .addCase(likePost.rejected, (state, action) => {
      //   state.error = action.payload;
      // })
      // .addCase(unlikePost.fulfilled, (state, action) => {
      //   const { postId } = action.payload;
      //   const post = state.posts.find((p) => p.id === postId) || (state.currentPost?.id === postId ? state.currentPost : null);
      //   if (post && !post.unlikes.includes(action.meta.arg.userId)) {
      //     post.unlikes_count += 1;
      //     post.unlikes.push(action.meta.arg.userId);
      //     if (post.likes_count > 0 && post.likes.includes(action.meta.arg.userId)) {
      //       post.likes_count -= 1;
      //       post.likes = post.likes.filter((id) => id !== action.meta.arg.userId);
      //     }
      //   }
      // })
      // .addCase(unlikePost.rejected, (state, action) => {
      //   state.error = action.payload;
      // });
  },
});

export const { clearError } = postSlice.actions;
export const selectPosts = (state) => state.posts.posts;
export const selectCurrentPost = (state) => state.posts.currentPost;
export const selectPostLoading = (state) => state.posts.loading;
export const selectPostError = (state) => state.posts.error;

export default postSlice.reducer;