import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const getUserInfoFromStorage = () => {
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
        try {
            const parsedUser = JSON.parse(storedUserInfo);
            // Check if token exists, strictly require it for new auth flow
            if (parsedUser && parsedUser.token) {
                return parsedUser;
            }
        } catch (err) {
            return null;
        }
    }
    return null;
};

const initialState = {
    userInfo: getUserInfoFromStorage(),
    loading: false,
    error: null,
    users: [],
};

const backendURL = import.meta.env.VITE_BACKEND_URL;

export const login = createAsyncThunk(
    'auth/login',
    async ({ email, password }, { rejectWithValue }) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            };
            const { data } = await axios.post(
                `${backendURL}/api/auth/login`,
                { email, password },
                config
            );
            return data;
        } catch (error) {
            if (error.response && error.response.data.message) {
                return rejectWithValue(error.response.data.message);
            } else {
                return rejectWithValue(error.message);
            }
        }
    }
);

export const register = createAsyncThunk(
    'auth/register',
    async ({ name, email, password }, { rejectWithValue }) => {
        try {
            const config = {
                headers: {
                    'Content-Type': 'application/json',
                },
                withCredentials: true,
            };
            const { data } = await axios.post(
                `${backendURL}/api/auth/register`,
                { name, email, password },
                config
            );
            return data;
        } catch (error) {
            return rejectWithValue(error.response.data.message);
        }
    }
);

export const logout = createAsyncThunk('auth/logout', async () => {
    await axios.post(`${backendURL}/api/auth/logout`);
    return null;
});

export const listUsers = createAsyncThunk(
    'auth/listUsers',
    async (_, { getState, rejectWithValue }) => {
        try {
            const { auth: { userInfo } } = getState();
            const config = {
                headers: { Authorization: `Bearer ${userInfo.token}` },
                withCredentials: true,
            };
            const { data } = await axios.get(`${backendURL}/api/auth/users`, config);
            return data;
        } catch (error) {
            return rejectWithValue(error.response && error.response.data.message ? error.response.data.message : error.message);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            state.userInfo = action.payload;
            localStorage.setItem('userInfo', JSON.stringify(action.payload));
        },
        logoutLocal: (state) => {
            state.userInfo = null;
            localStorage.removeItem('userInfo');
        },
    },
    extraReducers: (builder) => {
        // Login
        builder.addCase(login.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(login.fulfilled, (state, action) => {
            state.loading = false;
            state.userInfo = action.payload;
            localStorage.setItem('userInfo', JSON.stringify(action.payload));
        });
        builder.addCase(login.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        // Register
        builder.addCase(register.pending, (state) => {
            state.loading = true;
            state.error = null;
        });
        builder.addCase(register.fulfilled, (state, action) => {
            state.loading = false;
            state.userInfo = action.payload;
            localStorage.setItem('userInfo', JSON.stringify(action.payload));
        });
        builder.addCase(register.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload;
        });
        // Logout
        builder.addCase(logout.fulfilled, (state) => {
            state.userInfo = null;
            localStorage.removeItem('userInfo');
        })
            .addCase(listUsers.pending, (state) => {
                state.loading = true;
            })
            .addCase(listUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.users = action.payload;
            })
            .addCase(listUsers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { setCredentials, logoutLocal } = authSlice.actions;
export default authSlice.reducer;
