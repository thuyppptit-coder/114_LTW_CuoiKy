import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const fetchContracts = createAsyncThunk('contracts/fetchAll', async (_, thunkAPI) => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.get(`${API_URL}/contracts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi tải hợp đồng');
  }
});

export const createContract = createAsyncThunk('contracts/create', async (payload, thunkAPI) => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.post(`${API_URL}/contracts`, payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi tạo hợp đồng');
  }
});

export const endContract = createAsyncThunk('contracts/end', async (id, thunkAPI) => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.patch(
      `${API_URL}/contracts/${id}/end`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return res.data.data;
  } catch (err) {
    return thunkAPI.rejectWithValue(err.response?.data?.message || 'Lỗi kết thúc hợp đồng');
  }
});

const contractSlice = createSlice({
  name: 'contracts',
  initialState: { items: [], loading: false, error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchContracts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContracts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchContracts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createContract.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(endContract.fulfilled, (state, action) => {
        const idx = state.items.findIndex((item) => item._id === action.payload._id);
        if (idx !== -1) state.items[idx] = action.payload;
      });
  },
});

export default contractSlice.reducer;