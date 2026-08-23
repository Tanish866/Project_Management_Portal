import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import MemberLayout from "../../Layouts/MemberLayout";
import Avatar from "../../components/ui/Avatar";
import Toast from "../../components/Toast";
import useToast from "../../hooks/useToast";
import {
  fetchTaskById, updateMyTaskStatus,
  fetchTaskComments, addTaskComment,
  clearCurrentTask,
} from "../../Redux/slices/MemberSlice";

const STATUSES = ["TODO", "IN_PROGRESS", "COMPLETED"];

const PRIORITY_COLORS = {
  LOW: "bg-base-300 text-base-content/60",
  MEDIUM: "bg-amber-500/10 text-amber-600",
  HIGH: "bg-red-500/10 text-red-500",
};

export default function TaskDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentTask, comments, loading } = useSelector((state) => state.member);
  const { toast, showToast, clearToast } = useToast();

  const [newComment, setNewComment] = useState("");
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    dispatch(fetchTaskById(id));
    dispatch(fetchTaskComments(id));
    return () => dispatch(clearCurrentTask());
  }, [dispatch, id]);

  async function handleStatusChange(status) {
    const result = await dispatch(updateMyTaskStatus({ id, status }));
    showToast(
      updateMyTaskStatus.fulfilled.match(result) ? "Status updated" : result.payload || "Failed to update",
      updateMyTaskStatus.fulfilled.match(result) ? "success" : "error"
    );
  }

  async function handleAddComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setPosting(true);
    const result = await dispatch(addTaskComment({ taskId: id, message: newComment }));
    setPosting(false);
    if (addTaskComment.fulfilled.match(result)) {
      setNewComment("");
    } else {
      showToast(result.payload || "Failed to add comment", "error");
    }
  }

  if (!currentTask) {
    return (
      <MemberLayout>
        <p className="text-sm text-base-content/40">Loading task...</p>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <Link to="/member/projects" className="flex items-center gap-1 text-sm text-base-content/50 hover:text-base-content">
        <ArrowLeft size={14} /> Back
      </Link>

      <div className="mt-3 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-xl font-bold text-base-content">{currentTask.title}</h1>
            <p className="mt-1 text-sm text-base-content/50">{currentTask.description}</p>
          </div>
          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${PRIORITY_COLORS[currentTask.priority]}`}>
            {currentTask.priority}
          </span>
        </div>

        {currentTask.deadline && (
          <p className="mt-3 text-xs text-base-content/40">
            Due {new Date(currentTask.deadline).toLocaleDateString()}
          </p>
        )}

        <div className="mt-5">
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-base-content/40">Status</label>
          <select
            value={currentTask.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={loading}
            className="select select-bordered select-sm"
          >
            {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
        <p className="font-semibold text-base-content">Comments</p>

        <div className="mt-4 space-y-4">
          {comments.length === 0 ? (
            <p className="py-4 text-center text-sm text-base-content/40">No comments yet.</p>
          ) : (
            comments.map((c) => (
              <div key={c._id} className="flex gap-3">
                <Avatar name={c.user?.name} role={c.user?.role} />
                <div className="min-w-0 flex-1 rounded-xl bg-base-200 px-3 py-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-base-content">{c.user?.name}</p>
                    <p className="text-[11px] text-base-content/40">
                      {c.createdAt ? new Date(c.createdAt).toLocaleString() : ""}
                    </p>
                  </div>
                  <p className="mt-0.5 text-sm text-base-content/70">{c.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleAddComment} className="mt-5 flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-sm text-base-content outline-none focus:border-primary"
          />
          <button type="submit" disabled={posting} className="btn btn-primary rounded-lg">
            <Send size={16} />
          </button>
        </form>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
    </MemberLayout>
  );
}