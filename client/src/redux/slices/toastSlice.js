import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid';

const initialState = {
    toasts: []
};

const toastSlice = createSlice({
    name: 'toast',
    initialState,
    reducers: {
        addToast: (state, action) => {
            const { message, type = 'info', duration = 3000 } = action.payload;
            state.toasts.push({
                id: uuidv4(),
                message,
                type,
                duration
            });
        },
        removeToast: (state, action) => {
            state.toasts = state.toasts.filter(toast => toast.id !== action.payload);
        }
    }
});

export const { addToast, removeToast } = toastSlice.actions;

// Helper thunk to show toast with auto-dimiss is handled by component, 
// but we can expose a helper that also returns the id if needed.
// For now, simpler is better.

export default toastSlice.reducer;
