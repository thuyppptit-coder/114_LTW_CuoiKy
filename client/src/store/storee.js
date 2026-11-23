import { configureStore } from '@reduxjs/toolkit';
import roomReducer from '../features/rooms/roomSlice';
import contractReducer from '../features/contracts/contractSlice';

export const store = configureStore({
  reducer: {
    rooms: roomReducer,
    contracts: contractReducer,
  },
});