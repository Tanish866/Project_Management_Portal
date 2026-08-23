import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../config/axiosInstance";

const initialState = {
  byTaskId: {},
  loading: false,
  error: null,
};

export const fetchTaskComments = createAsyncThunk(
  "comments/fetchTaskComments",
  async (taskId, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.get(`/tasks/${taskId}/comments`);
      return { taskId, comments: res.data.data.comments || res.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to load comments");
    }
  }
);

export const addTaskComment = createAsyncThunk(
  "comments/addTaskComment",
  async ({ taskId, message }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.post(`/tasks/${taskId}/comments`, { message });
      return { taskId, comment: res.data.data.comment || res.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to add comment");
    }
  }
);

const commentSlice = createSlice({
  name: "comments",
  initialState,
  reducers: {
    clearCommentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTaskComments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTaskComments.fulfilled, (state, action) => {
        state.loading = false;
        state.byTaskId[action.payload.taskId] = action.payload.comments;
      })
      .addCase(fetchTaskComments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addTaskComment.fulfilled, (state, action) => {
        const { taskId, comment } = action.payload;
        if (!state.byTaskId[taskId]) state.byTaskId[taskId] = [];
        state.byTaskId[taskId].push(comment);
      })
      .addCase(addTaskComment.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearCommentError } = commentSlice.actions;
export default commentSlice.reducer;