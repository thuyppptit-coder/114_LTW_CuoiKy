import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const fetchRooms = createAsyncThunk(
  "rooms/fetchRooms",
  async (params = {}, { rejectWithValue }) => {
    try {
      const qs = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== "" && v !== undefined && v !== null)
      ).toString();
      const res = await fetch(`${API_URL}/rooms?${qs}`);
      const json = await res.json();
      if (!res.ok) return rejectWithValue(json.message || "Lỗi tải phòng");
      return json;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const roomsSlice = createSlice({
  name: "rooms",
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
        state.items = action.payload.data || [];
        if (action.payload.pagination) state.pagination = action.payload.pagination;
      })
      .addCase(fetchRooms.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default roomsSlice.reducer;