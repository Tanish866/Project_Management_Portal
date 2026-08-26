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

export const editTaskComment = createAsyncThunk(
  "comments/editTaskComment",
  async ({ taskId, commentId, message }, { rejectWithValue }) => {
    try {
      const res = await axiosInstance.put(`/comments/${commentId}`, { message });
      return { taskId, comment: res.data.data.comment || res.data.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to edit comment");
    }
  }
);

export const deleteTaskComment = createAsyncThunk(
  "comments/deleteTaskComment",
  async ({ taskId, commentId }, { rejectWithValue }) => {
    try {
      await axiosInstance.delete(`/comments/${commentId}`);
      return { taskId, commentId };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete comment");
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
      })

      .addCase(editTaskComment.fulfilled, (state, action) => {
        const { taskId, comment } = action.payload;
        const list = state.byTaskId[taskId];
        if (list) {
          const idx = list.findIndex((c) => c._id === comment._id);
          if (idx !== -1) list[idx] = comment;
        }
      })
      .addCase(editTaskComment.rejected, (state, action) => {
        state.error = action.payload;
      })

      .addCase(deleteTaskComment.fulfilled, (state, action) => {
        const { taskId, commentId } = action.payload;
        if (state.byTaskId[taskId]) {
          state.byTaskId[taskId] = state.byTaskId[taskId].filter((c) => c._id !== commentId);
        }
      })
      .addCase(deleteTaskComment.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearCommentError } = commentSlice.actions;
export default commentSlice.reducer;