import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { clearCart } from './cartSlice';
import { logout } from './authSlice';

const backendURL = import.meta.env.VITE_BACKEND_URL;

const getConfig = (getState) => {
    const { auth: { userInfo } } = getState();
    return {
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${userInfo.token}`,
        },
        withCredentials: true,
    };
};

export const createOrder = createAsyncThunk(
    'order/create',
    async (orderData, { getState, dispatch, rejectWithValue }) => {
        try {
            const config = getConfig(getState);
            const { data } = await axios.post(`${backendURL}/api/orders`, orderData, config);
            dispatch(clearCart());
            return data;
        } catch (error) {
            return rejectWithValue(error.response && error.response.data.message ? error.response.data.message : error.message);
        }
    }
);

export const listMyOrders = createAsyncThunk(
    'order/listMy',
    async (_, { getState, rejectWithValue }) => {
        try {
            const config = getConfig(getState);
            const { data } = await axios.get(`${backendURL}/api/orders/myorders`, config);
            return data;
        } catch (error) {
            return rejectWithValue(error.response && error.response.data.message ? error.response.data.message : error.message);
        }
    }
);

export const listAllOrders = createAsyncThunk(
    'order/listAll',
    async (_, { getState, rejectWithValue }) => {
        try {
            const config = getConfig(getState);
            const { data } = await axios.get(`${backendURL}/api/orders`, config);
            return data;
        } catch (error) {
            return rejectWithValue(error.response && error.response.data.message ? error.response.data.message : error.message);
        }
    }
);

export const getOrderDetails = createAsyncThunk(
    'order/details',
    async (id, { getState, rejectWithValue }) => {
        try {
            const config = getConfig(getState);
            const { data } = await axios.get(`${backendURL}/api/orders/${id}`, config);
            return data;
        } catch (error) {
            return rejectWithValue(error.response && error.response.data.message ? error.response.data.message : error.message);
        }
    }
);

export const updateOrderStatus = createAsyncThunk(
    'order/updateStatus',
    async ({ id, status }, { getState, rejectWithValue }) => {
        try {
            const config = getConfig(getState);
            const { data } = await axios.put(`${backendURL}/api/orders/${id}/status`, { status }, config);
            return data;
        } catch (error) {
            return rejectWithValue(error.response && error.response.data.message ? error.response.data.message : error.message);
        }
    }
);

export const cancelOrder = createAsyncThunk(
    'order/cancel',
    async (id, { getState, rejectWithValue }) => {
        try {
            const config = getConfig(getState);
            const { data } = await axios.put(`${backendURL}/api/orders/${id}/cancel`, {}, config);
            return data.order; // API returns { message, order }
        } catch (error) {
            return rejectWithValue(error.response && error.response.data.message ? error.response.data.message : error.message);
        }
    }
);

const orderSlice = createSlice({
    name: 'order',
    initialState: {
        orders: [],
        order: null,
        loading: false,
        success: false,
        error: null,
    },
    reducers: {
        resetOrder: (state) => {
            state.success = false;
            state.error = null;
            state.order = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Clear state on logout
            .addCase(logout.fulfilled, (state) => {
                state.orders = [];
                state.order = null;
                state.success = false;
                state.error = null;
            })
            // Create Order
            .addCase(createOrder.pending, (state) => {
                state.loading = true;
            })
            .addCase(createOrder.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(createOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // List My Orders
            .addCase(listMyOrders.pending, (state) => {
                state.loading = true;
            })
            .addCase(listMyOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload;
            })
            .addCase(listMyOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // List All Orders
            .addCase(listAllOrders.pending, (state) => {
                state.loading = true;
            })
            .addCase(listAllOrders.fulfilled, (state, action) => {
                state.loading = false;
                state.orders = action.payload;
            })
            .addCase(listAllOrders.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Order Details
            .addCase(getOrderDetails.pending, (state) => {
                state.loading = true;
            })
            .addCase(getOrderDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.order = action.payload;
            })
            .addCase(getOrderDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Status
            .addCase(updateOrderStatus.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateOrderStatus.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                const index = state.orders.findIndex(o => o.id === action.payload.id);
                if (index !== -1) {
                    state.orders[index] = { ...state.orders[index], ...action.payload };
                }
                if (state.order && state.order.id === action.payload.id) {
                    state.order = { ...state.order, ...action.payload };
                }
            })
            .addCase(updateOrderStatus.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Cancel Order
            .addCase(cancelOrder.pending, (state) => {
                state.loading = true;
            })
            .addCase(cancelOrder.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                const index = state.orders.findIndex(o => o.id === action.payload.id);
                if (index !== -1) {
                    state.orders[index] = { ...state.orders[index], ...action.payload };
                }
                if (state.order && state.order.id === action.payload.id) {
                    state.order = { ...state.order, ...action.payload };
                }
            })
            .addCase(cancelOrder.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { resetOrder } = orderSlice.actions;
export default orderSlice.reducer;
