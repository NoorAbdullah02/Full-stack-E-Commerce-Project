import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const backendURL = import.meta.env.VITE_BACKEND_URL;

const getConfig = (getState) => {
    // Assuming cookie auth, but if header needed:
    // const { auth: { userInfo } } = getState();
    return {
        withCredentials: true,
    };
};

export const getWishlist = createAsyncThunk(
    'wishlist/get',
    async (_, { getState, rejectWithValue }) => {
        try {
            const config = getConfig(getState);
            const { data } = await axios.get(`${backendURL}/api/wishlist`, config);
            return data; // Array of items
        } catch (error) {
            return rejectWithValue(error.response && error.response.data.message ? error.response.data.message : error.message);
        }
    }
);

export const addToWishlist = createAsyncThunk(
    'wishlist/add',
    async (productId, { getState, rejectWithValue }) => {
        try {
            const config = getConfig(getState);
            await axios.post(`${backendURL}/api/wishlist`, { productId }, config);
            return productId; // Return id to optimistically update or just re-fetch
        } catch (error) {
            return rejectWithValue(error.response && error.response.data.message ? error.response.data.message : error.message);
        }
    }
);

export const removeFromWishlist = createAsyncThunk(
    'wishlist/remove',
    async (productId, { getState, rejectWithValue }) => {
        try {
            const config = getConfig(getState);
            await axios.delete(`${backendURL}/api/wishlist/${productId}`, config);
            return productId;
        } catch (error) {
            return rejectWithValue(error.response && error.response.data.message ? error.response.data.message : error.message);
        }
    }
);

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState: {
        items: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getWishlist.pending, (state) => {
                state.loading = true;
            })
            .addCase(getWishlist.fulfilled, (state, action) => {
                state.loading = false;
                state.items = action.payload;
            })
            .addCase(getWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(addToWishlist.fulfilled, (state) => {
                // Could assume success or trigger re-fetch in component
            })
            .addCase(removeFromWishlist.fulfilled, (state, action) => {
                state.items = state.items.filter(item => item.productId !== action.payload);
            });
    },
});

export default wishlistSlice.reducer;
