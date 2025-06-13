import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import postReducer from './slices/postSlice';
import toastReducer from './slices/toastSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    posts: postReducer,
    toast: toastReducer,
    admin:adminReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(),
});