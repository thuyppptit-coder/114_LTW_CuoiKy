import { configureStore } from "@reduxjs/toolkit";

// B thêm reducer (rooms, contracts...) vào đây
export const store = configureStore({
    reducer: {
        app: (state = {}) => state, // giữ chỗ vì Redux không cho reducer rỗng
    },
});