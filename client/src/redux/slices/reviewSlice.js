import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
    reviews: [],
    averageRating: 0,
    totalReviews: 0,
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    loading: false,
    error: null,
    success: false, // For review submission
    page: 1,
    pages: 1
};

const backendURL = import.meta.env.VITE_BACKEND_URL;

export const createReview = createAsyncThunk(
    'reviews/create',
    async ({ productId, rating, title, comment }, { getState, rejectWithValue }) => {
        try {
            const { auth: { userInfo } } = getState();
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
                withCredentials: true,
            };
            const { data } = await axios.post(
                `${backendURL}/api/reviews`,
                { productId, rating, title, comment },
                config
            );
            return data;
        } catch (error) {
            return rejectWithValue(error.response && error.response.data.message ? error.response.data.message : error.message);
        }
    }
);

export const getReviews = createAsyncThunk(
    'reviews/get',
    async ({ productId, page = 1 }, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`${backendURL}/api/reviews/product/${productId}?page=${page}`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response && error.response.data.message ? error.response.data.message : error.message);
        }
    }
);

export const markHelpful = createAsyncThunk(
    'reviews/helpful',
    async ({ reviewId, type }, { getState, rejectWithValue }) => {
        try {
            const { auth: { userInfo } } = getState();
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${userInfo.token}`,
                },
                withCredentials: true,
            };
            const { data } = await axios.post(
                `${backendURL}/api/reviews/${reviewId}/helpful`,
                { type },
                config
            );
            return data;
        } catch (error) {
            return rejectWithValue(error.response && error.response.data.message ? error.response.data.message : error.message);
        }
    }
);

const reviewSlice = createSlice({
    name: 'review',
    initialState,
    reducers: {
        resetReviewSuccess: (state) => {
            state.success = false;
        },
        clearReviews: (state) => {
            state.reviews = [];
        }
    },
    extraReducers: (builder) => {
        builder
            // Create Review
            .addCase(createReview.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createReview.fulfilled, (state, action) => {
                state.loading = false;
                state.success = true;
                state.reviews.unshift(action.payload); // Add new review to top
                state.totalReviews += 1;
                // Ideally re-fetch or recalculate average locally, simplified for now
            })
            .addCase(createReview.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Get Reviews
            .addCase(getReviews.pending, (state) => {
                state.loading = true;
            })
            .addCase(getReviews.fulfilled, (state, action) => {
                state.loading = false;
                state.reviews = action.payload.reviews;
                state.page = action.payload.page;
                state.pages = action.payload.pages;
                state.averageRating = action.payload.averageRating;
                state.totalReviews = action.payload.totalReviews;
                state.ratingDistribution = action.payload.ratingDistribution;
            })
            .addCase(getReviews.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Mark Helpful
            .addCase(markHelpful.fulfilled, (state, action) => {
                const index = state.reviews.findIndex(r => r.id === action.payload.id);
                if (index !== -1) {
                    state.reviews[index] = { ...state.reviews[index], ...action.payload };
                }
            });
    },
});

export const { resetReviewSuccess, clearReviews } = reviewSlice.actions;
export default reviewSlice.reducer;
