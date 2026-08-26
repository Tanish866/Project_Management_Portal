import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Send, MessageSquare, Pencil, Trash2, Check, X } from "lucide-react";
import {
  fetchTaskComments,
  addTaskComment,
  editTaskComment,
  deleteTaskComment,
} from "../Redux/slices/CommentSlice";

const ROLE_LABEL = {
  ADMIN: "Admin",
  PROJECT_MANAGER: "Manager",
  TEAM_MEMBER: "Member",
};

const ROLE_STYLE = {
  PROJECT_MANAGER: "bg-primary/10 border-primary/20",
  TEAM_MEMBER: "bg-base-200 border-base-300",
  ADMIN: "bg-secondary/10 border-secondary/20",
};

export default function CommentThread({ taskId }) {
  const dispatch = useDispatch();
  const { byTaskId, loading } = useSelector((state) => state.comments);
  const { user: currentUser } = useSelector((state) => state.auth);
  const comments = byTaskId[taskId] || [];

  const [message, setMessage] = useState("");
  const [posting, setPosting] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    dispatch(fetchTaskComments(taskId));
  }, [dispatch, taskId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!message.trim()) return;
    setPosting(true);
    const result = await dispatch(addTaskComment({ taskId, message }));
    setPosting(false);
    if (addTaskComment.fulfilled.match(result)) setMessage("");
  }

  function startEdit(comment) {
    setEditingId(comment._id);
    setEditText(comment.message);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText("");
  }

  async function saveEdit(commentId) {
    if (!editText.trim()) return;
    setSavingEdit(true);
    const result = await dispatch(editTaskComment({ taskId, commentId, message: editText }));
    setSavingEdit(false);
    if (editTaskComment.fulfilled.match(result)) {
      setEditingId(null);
      setEditText("");
    }
  }

  async function handleDelete(commentId) {
    if (!window.confirm("Delete this comment?")) return;
    setDeletingId(commentId);
    await dispatch(deleteTaskComment({ taskId, commentId }));
    setDeletingId(null);
  }

  function canEdit(comment) {
    return comment.user?._id === currentUser?._id;
  }

  function canDelete(comment) {
    return (
      comment.user?._id === currentUser?._id ||
      currentUser?.role === "PROJECT_MANAGER" ||
      currentUser?.role === "ADMIN"
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 text-sm font-semibold text-base-content">
        <MessageSquare size={15} /> Feedback & Comments
      </div>

      <div className="mt-3 max-h-72 space-y-2.5 overflow-y-auto pr-1">
        {loading && comments.length === 0 ? (
          <p className="py-4 text-center text-sm text-base-content/40">Loading...</p>
        ) : comments.length === 0 ? (
          <p className="py-4 text-center text-sm text-base-content/40">No comments yet. Start the conversation.</p>
        ) : (
          comments.map((c) => (
            <div
              key={c._id}
              className={`group rounded-xl border px-3 py-2 ${ROLE_STYLE[c.user?.role] || "bg-base-200 border-base-300"}`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-base-content">
                  {c.user?.name}{" "}
                  <span className="font-normal text-base-content/40">· {ROLE_LABEL[c.user?.role] || c.user?.role}</span>
                </p>
                <div className="flex shrink-0 items-center gap-2">
                  <p className="text-[10px] text-base-content/40">
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleString([], { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
                      : ""}
                  </p>
                  <div className="hidden items-center gap-1 group-hover:flex">
                    {canEdit(c) && editingId !== c._id && (
                      <button onClick={() => startEdit(c)} className="text-base-content/40 hover:text-primary" title="Edit">
                        <Pencil size={12} />
                      </button>
                    )}
                    {canDelete(c) && (
                      <button
                        onClick={() => handleDelete(c._id)}
                        disabled={deletingId === c._id}
                        className="text-base-content/40 hover:text-red-500"
                        title="Delete"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {editingId === c._id ? (
                <div className="mt-1.5 flex items-center gap-2">
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="flex-1 rounded-lg border border-primary/40 bg-base-100 px-2 py-1 text-sm text-base-content outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => saveEdit(c._id)}
                    disabled={savingEdit}
                    className="text-emerald-500 hover:opacity-80"
                    title="Save"
                  >
                    <Check size={16} />
                  </button>
                  <button onClick={cancelEdit} className="text-base-content/40 hover:text-red-500" title="Cancel">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <p className="mt-1 text-sm text-base-content/80">{c.message}</p>
              )}
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write feedback, a question, or a reply..."
          className="flex-1 rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-sm text-base-content outline-none focus:border-primary"
        />
        <button type="submit" disabled={posting} className="btn btn-primary rounded-lg">
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}