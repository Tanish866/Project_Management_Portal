import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosInstance";

const initialState = {
  dashboard: null,
  users: [],
  projects: [],   
  loading: false,
  error: null,
};

export const fetchAdminDashboard = createAsyncThunk(
  "admin/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/admin/dashboard");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load dashboard");
    }
  }
);
export const fetchAllProjects = createAsyncThunk(
  "admin/fetchAllProjects",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/projects");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load projects");
    }
  }
);

export const fetchUsers = createAsyncThunk(
  "admin/fetchUsers",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get("/users", { params });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load users");
    }
  }
);

export const createUserByAdmin = createAsyncThunk(
  "admin/createUser",
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post("/users", formData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create user");
    }
  }
);

export const updateUser = createAsyncThunk(
  "admin/updateUser",
  async ({ id, name, email }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(`/users/${id}`, { name, email });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update user");
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  "admin/updateUserStatus",
  async ({ id, isActive }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/users/${id}/status`, { isActive });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update status");
    }
  }
);

export const updateUserRole = createAsyncThunk(
  "admin/updateUserRole",
  async ({ id, role }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.patch(`/users/${id}/role`, { role });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update role");
    }
  }
);

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearAdminError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchAdminDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users || action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createUserByAdmin.fulfilled, (state, action) => {
        state.users.unshift(action.payload.user);
      })

      .addCase(updateUser.fulfilled, (state, action) => {
        const updated = action.payload.user;
        const idx = state.users.findIndex((u) => u._id === updated._id);
        if (idx !== -1) state.users[idx] = updated;
      })

      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const updated = action.payload.user;
        const idx = state.users.findIndex((u) => u._id === updated._id);
        if (idx !== -1) state.users[idx] = updated;
      })
      .addCase(fetchAllProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload.projects || action.payload;
      })

      .addCase(updateUserRole.fulfilled, (state, action) => {
        const updated = action.payload.user;
        const idx = state.users.findIndex((u) => u._id === updated._id);
        if (idx !== -1) state.users[idx] = updated;
      });
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;