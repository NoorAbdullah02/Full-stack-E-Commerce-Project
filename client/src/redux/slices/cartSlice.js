import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const backendURL = import.meta.env.VITE_BACKEND_URL;

const initialState = {
    cartItems: localStorage.getItem('cartItems')
        ? JSON.parse(localStorage.getItem('cartItems'))
        : [],
    loading: false,
    error: null,
};

// Async Thunks
export const fetchCart = createAsyncThunk(
    'cart/fetch',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { auth: { userInfo } } = getState();
            if (!userInfo) return []; // Should not happen if called correctly

            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` },
                withCredentials: true,
            };
            const { data } = await axios.get(`${backendURL}/api/cart`, config);
            return data;
        } catch (error) {
            return rejectWithValue(error.response && error.response.data.message ? error.response.data.message : error.message);
        }
    }
);

export const addToCart = createAsyncThunk(
    'cart/add',
    async (item, { getState, rejectWithValue, dispatch }) => {
        // item: { productId, name, price, image, stock, quantity }
        const { auth: { userInfo } } = getState();

        // If not logged in, just return item to be handled by reducer (or handle here mostly)
        // BUT thunks are typically for async.
        // We can check userInfo. If guest, we just return the item and let a reducer handle it?
        // Or we can't mix logic easily.
        // BETTER: Use a separate action for "Local Add" vs "Server Add"?
        // OR: The component decides?
        // OR: We handle local logic in the 'fulfilled' or 'rejected' or just if check?

        if (!userInfo) {
            // Guest: Return item, handle in fulfilled/reducer?
            // Actually, we can just return it and have extraReducer handle local state update
            return { ...item, isLocal: true };
        }

        try {
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` },
                withCredentials: true,
            };
            // item.qty or item.quantity? Frontend usually uses 'qty'.
            // Controller expects { productId, quantity }
            const payload = {
                productId: item.productId,
                quantity: item.qty || 1
            };

            const { data } = await axios.post(`${backendURL}/api/cart`, payload, config);
            return data; // Returns full cart list from server
        } catch (error) {
            return rejectWithValue(error.response && error.response.data.message ? error.response.data.message : error.message);
        }
    }
);

export const removeFromCart = createAsyncThunk(
    'cart/remove',
    async (id, { getState, rejectWithValue }) => {
        const { auth: { userInfo } } = getState();

        if (!userInfo) {
            return { id, isLocal: true };
        }

        try {
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` },
                withCredentials: true,
            };
            const { data } = await axios.delete(`${backendURL}/api/cart/${id}`, config);
            return data; // Returns full cart list
        } catch (error) {
            return rejectWithValue(error.response && error.response.data.message ? error.response.data.message : error.message);
        }
    }
);

export const clearCart = createAsyncThunk(
    'cart/clear',
    async (_, { getState, rejectWithValue }) => {
        const { auth: { userInfo } } = getState();
        if (!userInfo) return { isLocal: true };

        try {
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` },
                withCredentials: true,
            };
            await axios.delete(`${backendURL}/api/cart`, config);
            return [];
        } catch (error) {
            return rejectWithValue(error.response && error.response.data.message ? error.response.data.message : error.message);
        }
    }
);

export const syncCart = createAsyncThunk(
    'cart/sync',
    async (items, { getState, rejectWithValue }) => {
        try {
            const { auth: { userInfo } } = getState();
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` },
                withCredentials: true,
            };
            // items: array of { productId, quantity } from local state
            const payload = { items: items.map(i => ({ productId: i.productId, quantity: i.qty || i.quantity || 1 })) };

            const { data } = await axios.post(`${backendURL}/api/cart/sync`, payload, config);
            return data;
        } catch (error) {
            return rejectWithValue(error.response && error.response.data.message ? error.response.data.message : error.message);
        }
    }
);

export const updateCartItem = createAsyncThunk(
    'cart/update',
    async ({ productId, quantity, isLocal }, { getState, rejectWithValue }) => {
        // If local update (e.g. guest or just optimistic update helper if needed, mostly for guest)
        const { auth: { userInfo } } = getState();

        if (!userInfo || isLocal) {
            return { productId, quantity, isLocal: true };
        }

        try {
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` },
                withCredentials: true,
            };
            const payload = { quantity };

            // Using productId as ID param as per route definition
            const { data } = await axios.put(`${backendURL}/api/cart/${productId}`, payload, config);
            return data; // Returns full cart items
        } catch (error) {
            return rejectWithValue(error.response && error.response.data.message ? error.response.data.message : error.message);
        }
    }
);

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        // We might keep these for manual "guest" manipulations if thunks fail or are too complex, 
        // but thunks above handle isLocal check.
        // However, standard reducer logic is simpler for local.
        // Let's rely on extraReducers for everything to keep it consistent.
    },
    extraReducers: (builder) => {
        builder
            // Fetch Cart
            .addCase(fetchCart.pending, (state) => { state.loading = true; })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;
                state.cartItems = action.payload;
                localStorage.setItem('cartItems', JSON.stringify(action.payload));
            })
            .addCase(fetchCart.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            // Add To Cart
            .addCase(addToCart.fulfilled, (state, action) => {
                // If local
                if (action.payload.isLocal) {
                    const item = action.payload;
                    const existItem = state.cartItems.find((x) => x.productId === item.productId);
                    if (existItem) {
                        state.cartItems = state.cartItems.map((x) =>
                            x.productId === existItem.productId ? item : x
                        );
                    } else {
                        state.cartItems = [...state.cartItems, item];
                    }
                } else {
                    // Server returned full cart
                    state.cartItems = action.payload;
                }
                localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
            })

            // Remove From Cart
            .addCase(removeFromCart.fulfilled, (state, action) => {
                if (action.payload.isLocal) {
                    state.cartItems = state.cartItems.filter((x) => x.productId !== action.payload.id);
                } else {
                    state.cartItems = action.payload;
                }
                localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
            })

            // Clear Cart
            .addCase(clearCart.fulfilled, (state, action) => {
                state.cartItems = [];
                localStorage.removeItem('cartItems');
            })

            // Sync Cart
            .addCase(syncCart.fulfilled, (state, action) => {
                state.cartItems = action.payload;
                localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
            })

            // Update Cart Item
            .addCase(updateCartItem.fulfilled, (state, action) => {
                if (action.payload.isLocal) {
                    const { productId, quantity } = action.payload;
                    state.cartItems = state.cartItems.map((item) =>
                        item.productId === productId ? { ...item, qty: quantity } : item
                    );
                } else {
                    state.cartItems = action.payload;
                }
                localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
            })

            // On Logout
            .addMatcher(
                (action) => action.type === 'auth/logout/fulfilled',
                (state) => {
                    state.cartItems = [];
                    localStorage.removeItem('cartItems');
                }
            );
    },
});

export default cartSlice.reducer;
