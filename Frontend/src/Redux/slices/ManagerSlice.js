import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosInstance";

const initialState = {
  dashboard: null,
  projects: [],
  currentProject: null,
  members: [],
  tasks: [],
  eligibleMembers: [],
  loading: false,
  error: null,
};

export const fetchManagerDashboard = createAsyncThunk(
  "manager/fetchDashboard",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/manager/dashboard");
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load dashboard");
    }
  }
);

export const fetchProjects = createAsyncThunk(
  "manager/fetchProjects",
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
  "manager/fetchProjectById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/projects/${id}`);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load project");
    }
  }
);

export const createProject = createAsyncThunk(
  "manager/createProject",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post("/projects", formData);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create project");
    }
  }
);

export const updateProject = createAsyncThunk(
  "manager/updateProject",
  async ({ id, ...formData }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/projects/${id}`, formData);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update project");
    }
  }
);

export const deleteProject = createAsyncThunk(
  "manager/deleteProject",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/projects/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete project");
    }
  }
);

export const fetchProjectMembers = createAsyncThunk(
  "manager/fetchProjectMembers",
  async (projectId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/projects/${projectId}/members`);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load members");
    }
  }
);

export const fetchEligibleMembers = createAsyncThunk(
  "manager/fetchEligibleMembers",
  async (search = "", { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get("/users/eligible-members", {
        params: search ? { search } : {},
      });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load users");
    }
  }
);

export const addProjectMember = createAsyncThunk(
  "manager/addProjectMember",
  async ({ projectId, userId }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/projects/${projectId}/members`, { userId });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to add member");
    }
  }
);

export const removeProjectMember = createAsyncThunk(
  "manager/removeProjectMember",
  async ({ projectId, userId }, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/projects/${projectId}/members/${userId}`);
      return userId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to remove member");
    }
  }
);

export const fetchProjectTasks = createAsyncThunk(
  "manager/fetchProjectTasks",
  async (projectId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/projects/${projectId}/tasks`);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load tasks");
    }
  }
);

export const createTask = createAsyncThunk(
  "manager/createTask",
  async ({ projectId, ...formData }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/projects/${projectId}/tasks`, formData);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create task");
    }
  }
);

export const updateTask = createAsyncThunk(
  "manager/updateTask",
  async ({ id, ...formData }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/tasks/${id}`, formData);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update task");
    }
  }
);

export const updateTaskStatus = createAsyncThunk(
  "manager/updateTaskStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.patch(`/tasks/${id}/status`, { status });
      return res.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update status");
    }
  }
);

export const deleteTask = createAsyncThunk(
  "manager/deleteTask",
  async (id, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/tasks/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete task");
    }
  }
);

function upsertById(array, item) {
  const idx = array.findIndex((x) => x._id === item._id);
  if (idx !== -1) array[idx] = item;
  else array.unshift(item);
}

const managerSlice = createSlice({
  name: "manager",
  initialState,
  reducers: {
    clearManagerError: (state) => {
      state.error = null;
    },
    clearCurrentProject: (state) => {
      state.currentProject = null;
      state.members = [];
      state.tasks = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchManagerDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
      })

      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload.projects || action.payload;
      })

      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentProject = action.payload.project || action.payload;
      })

      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects.unshift(action.payload.project);
      })

      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        upsertById(state.projects, action.payload.project);
        if (state.currentProject?._id === action.payload.project._id) {
          state.currentProject = action.payload.project;
        }
      })

      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = state.projects.filter((p) => p._id !== action.payload);
      })

      .addCase(fetchProjectMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload.members || action.payload;
      })

      .addCase(fetchEligibleMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.eligibleMembers = action.payload.users || action.payload;
      })

      .addCase(addProjectMember.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload.members || state.members;
      })

      .addCase(removeProjectMember.fulfilled, (state, action) => {
        state.loading = false;
        state.members = state.members.filter((m) => m._id !== action.payload);
      })

      .addCase(fetchProjectTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload.tasks || action.payload;
      })

      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.unshift(action.payload.task);
      })

      .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        upsertById(state.tasks, action.payload.task);
      })

      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        state.loading = false;
        upsertById(state.tasks, action.payload.task);
      })

      .addCase(deleteTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.filter((t) => t._id !== action.payload);
      })

      .addMatcher(
        (action) => action.type.startsWith("manager/") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith("manager/") && action.type.endsWith("/rejected"),
        (state, action) => {
          state.loading = false;
          state.error = action.payload;
        }
      );
  },
});

export const { clearManagerError, clearCurrentProject } = managerSlice.actions;
export default managerSlice.reducer;