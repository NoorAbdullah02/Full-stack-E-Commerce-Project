import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const backendURL = import.meta.env.VITE_BACKEND_URL || '';

const getConfig = (getState) => {
    const { auth } = getState();
    const token = auth?.userInfo?.token;
    return {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        withCredentials: true,
    };
};

const getStoredWishlist = () => {
    try {
        const stored = localStorage.getItem('wishlistItems');
        if (!stored) return [];
        const parsed = JSON.parse(stored);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
};

export const getWishlist = createAsyncThunk(
    'wishlist/get',
    async (_, { getState, rejectWithValue }) => {
        try {
            const config = getConfig(getState);
            const { data } = await axios.get(`${backendURL}/api/wishlist`, config);
            return data; // Array of items
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

export const addToWishlist = createAsyncThunk(
    'wishlist/add',
    async (productData, { getState }) => {
        const productId = typeof productData === 'string' ? productData : productData.id;
        const itemObj = typeof productData === 'object'
            ? { id: productId, productId, product: productData }
            : { id: productId, productId, product: { id: productId } };

        try {
            const config = getConfig(getState);
            await axios.post(`${backendURL}/api/wishlist`, { productId }, config);
        } catch (error) {
            // Unauthenticated or guest mode: fallback seamlessly to local storage
            console.log('Wishlist backend note:', error.message);
        }
        return itemObj;
    }
);

export const removeFromWishlist = createAsyncThunk(
    'wishlist/remove',
    async (productId, { getState }) => {
        try {
            const config = getConfig(getState);
            await axios.delete(`${backendURL}/api/wishlist/${productId}`, config);
        } catch (error) {
            console.log('Wishlist backend removal note:', error.message);
        }
        return productId;
    }
);

const initialState = {
    items: getStoredWishlist(),
    loading: false,
    error: null,
};

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        clearWishlist: (state) => {
            state.items = [];
            localStorage.removeItem('wishlistItems');
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getWishlist.pending, (state) => {
                if (state.items.length === 0) state.loading = true;
            })
            .addCase(getWishlist.fulfilled, (state, action) => {
                state.loading = false;
                if (action.payload && Array.isArray(action.payload) && action.payload.length > 0) {
                    state.items = action.payload;
                    localStorage.setItem('wishlistItems', JSON.stringify(action.payload));
                }
            })
            .addCase(getWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(addToWishlist.fulfilled, (state, action) => {
                const item = action.payload;
                const pid = item.productId || item.id;
                const exists = state.items.some(i => (i.productId === pid || i.id === pid || i.product?.id === pid));
                if (!exists) {
                    state.items.push(item);
                    localStorage.setItem('wishlistItems', JSON.stringify(state.items));
                }
            })
            .addCase(removeFromWishlist.fulfilled, (state, action) => {
                const pid = action.payload;
                state.items = state.items.filter(i => (i.productId !== pid && i.id !== pid && i.product?.id !== pid));
                localStorage.setItem('wishlistItems', JSON.stringify(state.items));
            });
    },
});

export const { clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
