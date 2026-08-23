import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosInstance";

const initialState = {
  dashboard: null,
  projects: [],
  currentProject: null,
  tasks: [],
  currentTask: null,
  comments: [],
  loading: false,
  error: null,
};

export const fetchMemberDashboard = createAsyncThunk(
  "member/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/member/dashboard");
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load dashboard");
    }
  }
);

export const fetchMyProjects = createAsyncThunk(
  "member/fetchMyProjects",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/projects");
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load projects");
    }
  }
);

export const fetchProjectById = createAsyncThunk(
  "member/fetchProjectById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/projects/${id}`);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load project");
    }
  }
);

export const fetchMyTasksInProject = createAsyncThunk(
  "member/fetchMyTasksInProject",
  async (projectId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/projects/${projectId}/tasks`);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load tasks");
    }
  }
);

export const fetchTaskById = createAsyncThunk(
  "member/fetchTaskById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/tasks/${id}`);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load task");
    }
  }
);

export const updateMyTaskStatus = createAsyncThunk(
  "member/updateMyTaskStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch(`/tasks/${id}/status`, { status });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update status");
    }
  }
);

export const fetchTaskComments = createAsyncThunk(
  "member/fetchTaskComments",
  async (taskId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/tasks/${taskId}/comments`);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load comments");
    }
  }
);

export const addTaskComment = createAsyncThunk(
  "member/addTaskComment",
  async ({ taskId, message }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/tasks/${taskId}/comments`, { message });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to add comment");
    }
  }
);

const memberSlice = createSlice({
  name: "member",
  initialState,
  reducers: {
    clearMemberError: (state) => {
      state.error = null;
    },
    clearCurrentProject: (state) => {
      state.currentProject = null;
      state.tasks = [];
    },
    clearCurrentTask: (state) => {
      state.currentTask = null;
      state.comments = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMemberDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
      })

      .addCase(fetchMyProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload.projects || action.payload;
      })

      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload.project || action.payload;
      })

      .addCase(fetchMyTasksInProject.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.tasks || action.payload;
      })

      .addCase(fetchTaskById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentTask = action.payload.task || action.payload;
      })

      .addCase(updateMyTaskStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.task;
        const idx = state.tasks.findIndex((t) => t._id === updated._id);
        if (idx !== -1) state.tasks[idx] = updated;
        if (state.currentTask?._id === updated._id) state.currentTask = updated;
      })

      .addCase(fetchTaskComments.fulfilled, (state, action) => {
        state.loading = false;
        state.comments = action.payload.comments || action.payload;
      })

      .addCase(addTaskComment.fulfilled, (state, action) => {
        state.loading = false;
        state.comments.push(action.payload.comment);
      })

      .addMatcher(
        (action) => action.type.startsWith("member/") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith("member/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearMemberError, clearCurrentProject, clearCurrentTask } = memberSlice.actions;
export default memberSlice.reducer;