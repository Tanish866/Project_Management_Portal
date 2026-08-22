import { configureStore } from "@reduxjs/toolkit";
import authReducer from './slices/AuthSlice';
import adminReducer from "./slices/AdminSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
  },
});