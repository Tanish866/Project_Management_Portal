import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/AuthSlice";
import adminReducer from "./slices/AdminSlice";
import managerReducer from "./slices/ManagerSlice";
import memberReducer from "./slices/MemberSlice";
import commentReducer from "./slices/CommentSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    admin: adminReducer,
    manager: managerReducer,
    member: memberReducer,
    comments: commentReducer,
  },
});