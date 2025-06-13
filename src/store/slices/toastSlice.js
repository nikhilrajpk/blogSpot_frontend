import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  message: '',
  type: 'success',
  duration: 3000,
  isVisible: false,
};

const toastSlice = createSlice({
  name: 'toast',
  initialState,
  reducers: {
    showToast: (state, action) => {
      state.message = action.payload.message;
      state.type = action.payload.type || 'success';
      state.duration = action.payload.duration || 3000;
      state.isVisible = true;
    },
    hideToast: (state) => {
      state.isVisible = false;
      state.message = '';
    },
  },
});

export const { showToast, hideToast } = toastSlice.actions;
export const selectToast = (state) => state.toast;

export default toastSlice.reducer;