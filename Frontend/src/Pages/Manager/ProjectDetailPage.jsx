import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, UserPlus, Plus, Trash2, X } from "lucide-react";
import ManagerLayout from "../../Layouts/ManagerLayout";
import Modal from "../../components/ui/Modal";
import FormField from "../../components/ui/FormField";
import Avatar from "../../components/ui/Avatar";
import Toast from "../../components/Toast";
import useToast from "../../hooks/useToast";
import {
  fetchProjectById, fetchProjectMembers, fetchProjectTasks,
  addProjectMember, removeProjectMember,
  createTask, updateTaskStatus, deleteTask,
  clearCurrentProject,
} from "../../Redux/slices/ManagerSlice";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];
const STATUSES = ["TODO", "IN_PROGRESS", "COMPLETED"];

const PRIORITY_COLORS = {
  LOW: "bg-base-300 text-base-content/60",
  MEDIUM: "bg-amber-500/10 text-amber-600",
  HIGH: "bg-red-500/10 text-red-500",
};

export default function ProjectDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentProject, members, tasks, loading } = useSelector((state) => state.manager);
  const { toast, showToast, clearToast } = useToast();

  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);

  useEffect(() => {
    dispatch(fetchProjectById(id));
    dispatch(fetchProjectMembers(id));
    dispatch(fetchProjectTasks(id));
    return () => dispatch(clearCurrentProject());
  }, [dispatch, id]);

  async function handleRemoveMember(userId) {
    const result = await dispatch(removeProjectMember({ projectId: id, userId }));
    showToast(
      removeProjectMember.fulfilled.match(result) ? "Member removed" : result.payload || "Failed to remove",
      removeProjectMember.fulfilled.match(result) ? "success" : "error"
    );
  }

  async function handleStatusChange(taskId, status) {
    const result = await dispatch(updateTaskStatus({ id: taskId, status }));
    showToast(
      updateTaskStatus.fulfilled.match(result) ? "Task status updated" : result.payload || "Failed to update",
      updateTaskStatus.fulfilled.match(result) ? "success" : "error"
    );
  }

  async function handleDeleteTask(taskId) {
    const result = await dispatch(deleteTask(taskId));
    showToast(
      deleteTask.fulfilled.match(result) ? "Task deleted" : result.payload || "Failed to delete",
      deleteTask.fulfilled.match(result) ? "success" : "error"
    );
  }

  if (!currentProject) {
    return (
      <ManagerLayout>
        <p className="text-sm text-base-content/40">Loading project...</p>
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout>
      <Link to="/manager/projects" className="flex items-center gap-1 text-sm text-base-content/50 hover:text-base-content">
        <ArrowLeft size={14} /> Back to Projects
      </Link>

      <div className="mt-3 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h1 className="font-display text-2xl font-bold text-base-content">{currentProject.name}</h1>
          <p className="mt-1 max-w-xl text-sm text-base-content/50">{currentProject.description}</p>
        </div>
        <div className="rounded-xl border border-base-300 bg-base-100 px-4 py-2 text-right">
          <p className="font-display text-lg font-bold text-base-content">{currentProject.progress || 0}%</p>
          <p className="text-xs text-base-content/40">Progress</p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm lg:col-span-1">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-base-content">Team Members</p>
            <button onClick={() => setShowMemberModal(true)} className="btn btn-ghost btn-circle btn-sm">
              <UserPlus size={16} />
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {members.length === 0 ? (
              <p className="py-4 text-center text-sm text-base-content/40">No members yet.</p>
            ) : (
              members.map((m) => (
                <div key={m._id} className="flex items-center justify-between rounded-xl px-2 py-2 hover:bg-base-200">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={m.name} role={m.role} />
                    <div>
                      <p className="text-sm font-medium text-base-content">{m.name}</p>
                      <p className="text-xs text-base-content/40">{m.email}</p>
                    </div>
                  </div>
                  <button onClick={() => handleRemoveMember(m._id)} className="btn btn-ghost btn-circle btn-xs text-red-500">
                    <X size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-base-content">Tasks</p>
            <button onClick={() => setShowTaskModal(true)} className="btn btn-primary btn-sm rounded-lg">
              <Plus size={14} /> New Task
            </button>
          </div>

          <div className="mt-4 space-y-2">
            {loading ? (
              <p className="py-6 text-center text-sm text-base-content/40">Loading tasks...</p>
            ) : tasks.length === 0 ? (
              <p className="py-6 text-center text-sm text-base-content/40">No tasks yet.</p>
            ) : (
              tasks.map((t) => (
                <div key={t._id} className="flex items-center justify-between gap-3 rounded-xl border border-base-300 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-base-content">{t.title}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${PRIORITY_COLORS[t.priority]}`}>
                        {t.priority}
                      </span>
                      {t.deadline && (
                        <span className="text-[11px] text-base-content/40">
                          Due {new Date(t.deadline).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <select
                    value={t.status}
                    onChange={(e) => handleStatusChange(t._id, e.target.value)}
                    className="select select-bordered select-sm"
                  >
                    {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                  </select>

                  <button onClick={() => handleDeleteTask(t._id)} className="btn btn-ghost btn-circle btn-sm text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {showMemberModal && (
        <AddMemberModal
          onClose={() => setShowMemberModal(false)}
          onSubmit={async (userId) => {
            const result = await dispatch(addProjectMember({ projectId: id, userId }));
            showToast(
              addProjectMember.fulfilled.match(result) ? "Member added" : result.payload || "Failed to add member",
              addProjectMember.fulfilled.match(result) ? "success" : "error"
            );
            if (addProjectMember.fulfilled.match(result)) setShowMemberModal(false);
          }}
        />
      )}

      {showTaskModal && (
        <TaskFormModal
          members={members}
          onClose={() => setShowTaskModal(false)}
          onSubmit={async (formData) => {
            const result = await dispatch(createTask({ projectId: id, ...formData }));
            showToast(
              createTask.fulfilled.match(result) ? "Task created" : result.payload || "Failed to create task",
              createTask.fulfilled.match(result) ? "success" : "error"
            );
            if (createTask.fulfilled.match(result)) setShowTaskModal(false);
          }}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
    </ManagerLayout>
  );
}

function AddMemberModal({ onClose, onSubmit }) {
  const [userId, setUserId] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await onSubmit(userId);
    setSaving(false);
  }

  return (
    <Modal title="Add Team Member" onClose={onClose}>
      <p className="mb-3 text-xs text-base-content/50">
        Enter the User ID of a registered Team Member (ask your Admin for their ID if you don't have it).
      </p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <FormField label="User ID" type="text" value={userId} onChange={(e) => setUserId(e.target.value)} required />
        <button type="submit" disabled={saving} className="btn btn-primary w-full rounded-xl">
          {saving ? "Adding..." : "Add Member"}
        </button>
      </form>
    </Modal>
  );
}

function TaskFormModal({ members, onClose, onSubmit }) {
  const [form, setForm] = useState({ title: "", description: "", priority: "MEDIUM", deadline: "", assignedTo: "" });
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    await onSubmit(form);
    setSaving(false);
  }

  return (
    <Modal title="New Task" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <FormField label="Title" type="text" name="title" value={form.title} onChange={handleChange} required />
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-base-content/40">Description</label>
          <textarea
            name="description" value={form.description} onChange={handleChange} rows={2}
            className="w-full rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-sm text-base-content outline-none focus:border-primary"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-base-content/40">Priority</label>
            <select name="priority" value={form.priority} onChange={handleChange} className="select select-bordered w-full">
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <FormField label="Deadline" type="date" name="deadline" value={form.deadline} onChange={handleChange} />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-base-content/40">Assign To</label>
          <select name="assignedTo" value={form.assignedTo} onChange={handleChange} className="select select-bordered w-full">
            <option value="">Unassigned</option>
            {members.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
          </select>
        </div>
        <button type="submit" disabled={saving} className="btn btn-primary w-full rounded-xl">
          {saving ? "Creating..." : "Create Task"}
        </button>
      </form>
    </Modal>
  );
}