import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import productReducer from './slices/productSlice';
import cartReducer from './slices/cartSlice';
import orderReducer from './slices/orderSlice';
import wishlistReducer from './slices/wishlistSlice';
import reviewReducer from './slices/reviewSlice';
import toastReducer from './slices/toastSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        product: productReducer,
        cart: cartReducer,
        order: orderReducer,
        wishlist: wishlistReducer,
        review: reviewReducer,
        toast: toastReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',
});

export default store;
