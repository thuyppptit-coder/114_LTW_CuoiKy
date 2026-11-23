import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchRooms = createAsyncThunk('rooms/fetchRooms', async (params = {}, thunkAPI) => {
  try {
    const res = await axios.get(`${API_URL}/rooms`, { params });
    return res.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi tải phòng');
  }
});

export const createRoom = createAsyncThunk('rooms/createRoom', async (data, thunkAPI) => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.post(`${API_URL}/rooms`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi tạo phòng');
  }
});

const roomSlice = createSlice({
  name: 'rooms',
  initialState: {
    items: [],
    pagination: { page: 1, limit: 6, total: 0, totalPages: 1 },
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createRoom.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      });
  },
});

export default roomSlice.reducer;