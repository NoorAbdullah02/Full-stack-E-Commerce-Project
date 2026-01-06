import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
    products: [],
    product: null,
    categories: [],
    loading: false,
    error: null,
    page: 1,
    pages: 1,
};

const backendURL = import.meta.env.VITE_BACKEND_URL;

export const listProducts = createAsyncThunk(
    'products/list',
    async ({ keyword = '', pageNumber = '', category = '', minPrice = '', maxPrice = '', sort = '' } = {}, { rejectWithValue }) => {
        try {
            const queryParams = new URLSearchParams({
                keyword,
                pageNumber,
                ...(category && { category }),
                ...(minPrice && { minPrice }),
                ...(maxPrice && { maxPrice }),
                ...(sort && { sort }),
            });
            const { data } = await axios.get(`${backendURL}/api/products?${queryParams}`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response && error.response.data.message ? error.response.data.message : error.message);
        }
    }
);

export const getCategories = createAsyncThunk(
    'products/categories',
    async (_, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`${backendURL}/api/products/categories`);
            console.log('Frontend getCategories response:', data);
            return data;
        } catch (error) {
            console.error('Frontend getCategories error:', error);
            return rejectWithValue(error.response && error.response.data.message ? error.response.data.message : error.message);
        }
    }
);

export const listProductDetails = createAsyncThunk(
    'products/details',
    async (id, { rejectWithValue }) => {
        try {
            const { data } = await axios.get(`${backendURL}/api/products/${id}`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response && error.response.data.message ? error.response.data.message : error.message);
        }
    }
);

export const createProduct = createAsyncThunk(
    'products/create',
    async (productData, { getState, rejectWithValue }) => {
        try {
            // productData should be FormData for file upload
            const { auth: { userInfo } } = getState();
            const config = {
                headers: {
                    // 'Content-Type': 'multipart/form-data', // Axios sets this automatically with FormData
                    Authorization: `Bearer ${userInfo.token}`,
                },
                withCredentials: true,
            };
            console.log('Frontend createProduct data:', Object.fromEntries(productData));
            const { data } = await axios.post(`${backendURL}/api/products`, productData, config);
            console.log('Frontend createProduct success:', data);
            return data;
        } catch (error) {
            console.error('Frontend createProduct error:', error);
            return rejectWithValue(error.response && error.response.data.message ? error.response.data.message : error.message);
        }
    }
);

export const updateProduct = createAsyncThunk(
    'products/update',
    async ({ id, productData }, { getState, rejectWithValue }) => {
        try {
            const { auth: { userInfo } } = getState();
            const config = {
                headers: {
                    Authorization: `Bearer ${userInfo.token}`,
                },
                withCredentials: true,
            };
            const { data } = await axios.put(`${backendURL}/api/products/${id}`, productData, config);
            return data;
        } catch (error) {
            return rejectWithValue(error.response && error.response.data.message ? error.response.data.message : error.message);
        }
    }
);

export const deleteProduct = createAsyncThunk(
    'products/delete',
    async (id, { getState, rejectWithValue }) => {
        try {
            const { auth: { userInfo } } = getState();
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` },
                withCredentials: true,
            };
            await axios.delete(`${backendURL}/api/products/${id}`, config);
            return id;
        } catch (error) {
            return rejectWithValue(error.response && error.response.data.message ? error.response.data.message : error.message);
        }
    }
);

export const generateDescription = createAsyncThunk(
    'products/generateDescription',
    async (prompt, { getState, rejectWithValue }) => {
        try {
            const { auth: { userInfo } } = getState();
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` },
                withCredentials: true,
            };
            const { data } = await axios.post(`${backendURL}/api/ai/generate-description`, { prompt }, config);
            return data.description;
        } catch (error) {
            return rejectWithValue(error.response && error.response.data.message ? error.response.data.message : error.message);
        }
    }
);

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(listProducts.pending, (state) => {
                state.loading = true;
            })
            .addCase(listProducts.fulfilled, (state, action) => {
                state.loading = false;
                state.products = action.payload.products;
                state.page = action.payload.page;
                state.pages = action.payload.pages;
            })
            .addCase(listProducts.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(listProductDetails.pending, (state) => {
                state.loading = true;
            })
            .addCase(listProductDetails.fulfilled, (state, action) => {
                state.loading = false;
                state.product = action.payload;
            })
            .addCase(listProductDetails.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Create Product
            .addCase(createProduct.pending, (state) => {
                state.loading = true;
            })
            .addCase(createProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.products.push(action.payload);
            })
            .addCase(createProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Product
            .addCase(updateProduct.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateProduct.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.products.findIndex(p => p.id === action.payload.id);
                if (index !== -1) {
                    state.products[index] = action.payload;
                }
            })
            .addCase(updateProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Delete Product
            .addCase(deleteProduct.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteProduct.fulfilled, (state, action) => {
                state.loading = false;
                state.products = state.products.filter(p => p.id !== action.payload);
            })
            .addCase(deleteProduct.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(getCategories.fulfilled, (state, action) => {
                state.categories = action.payload;
            });
    },
});

export default productSlice.reducer;
