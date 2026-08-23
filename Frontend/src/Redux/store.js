import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/AuthSlice";
import adminReducer from "./slices/AdminSlice";
import managerReducer from "./slices/ManagerSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    manager: managerReducer,
  },
});