import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Plus, MoreVertical, Trash2, Pencil, FolderKanban } from "lucide-react";
import ManagerLayout from "../../Layouts/ManagerLayout";
import Modal from "../../components/ui/Modal";
import FormField from "../../components/ui/FormField";
import EmptyState from "../../components/ui/EmptyState";
import { SkeletonCard } from "../../components/ui/Skeleton";
import Toast from "../../components/Toast";
import useToast from "../../hooks/useToast";
import { fetchProjects, createProject, updateProject, deleteProject } from "../../Redux/slices/ManagerSlice";

const STATUSES = ["NOT_STARTED", "IN_PROGRESS", "ON_HOLD", "COMPLETED"];

const STATUS_COLORS = {
  NOT_STARTED: "bg-base-300 text-base-content/60",
  IN_PROGRESS: "bg-amber-500/10 text-amber-600",
  ON_HOLD: "bg-red-500/10 text-red-500",
  COMPLETED: "bg-emerald-500/10 text-emerald-600",
};

export default function ProjectsPage() {
  const dispatch = useDispatch();
  const { projects, loading, error } = useSelector((state) => state.manager);
  const { toast, showToast, clearToast } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    dispatch(fetchProjects());
  }, [dispatch]);

  async function handleDelete() {
    const result = await dispatch(deleteProject(confirmDelete._id));
    showToast(
      deleteProject.fulfilled.match(result) ? "Project deleted" : result.payload || "Failed to delete",
      deleteProject.fulfilled.match(result) ? "success" : "error"
    );
    setConfirmDelete(null);
  }

  return (
    <ManagerLayout>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-base-content">Projects</h1>
          <p className="mt-1 text-sm text-base-content/50">Manage the projects you own.</p>
        </div>
        <button onClick={() => { setEditingProject(null); setShowModal(true); }} className="btn btn-primary rounded-xl">
          <Plus size={16} /> New Project
        </button>
      </div>

      {error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
        ) : projects.length === 0 ? (
          <EmptyState
            icon={<FolderKanban size={24} />}
            title="No projects yet"
            description="Create your first project to start assigning tasks and tracking progress."
            action={
              <button onClick={() => { setEditingProject(null); setShowModal(true); }} className="btn btn-primary btn-sm rounded-lg">
                <Plus size={14} /> New Project
              </button>
            }
          />
        ) : (
          projects.map((p) => (
            <div key={p._id} className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <Link to={`/manager/projects/${p._id}`} className="font-semibold text-base-content hover:underline">
                  {p.name}
                </Link>
                <div className="dropdown dropdown-end">
                  <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-xs">
                    <MoreVertical size={14} />
                  </div>
                  <ul tabIndex={0} className="dropdown-content menu z-10 w-36 rounded-box border border-base-300 bg-base-100 p-1 shadow-lg">
                    <li>
                      <button onClick={() => { setEditingProject(p); setShowModal(true); }}>
                        <Pencil size={13} /> Edit
                      </button>
                    </li>
                    <li>
                      <button onClick={() => setConfirmDelete(p)} className="text-red-500">
                        <Trash2 size={13} /> Delete
                      </button>
                    </li>
                  </ul>
                </div>
              </div>

              <p className="mt-1 line-clamp-2 text-xs text-base-content/50">{p.description || "No description"}</p>

              <span className={`mt-3 inline-block rounded-full px-2.5 py-1 text-[11px] font-medium ${STATUS_COLORS[p.status] || STATUS_COLORS.NOT_STARTED}`}>
                {p.status?.replace("_", " ") || "Not Started"}
              </span>

              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-base-content/40">
                  <span>Progress</span>
                  <span>{p.progress || 0}%</span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-base-200">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${p.progress || 0}%` }} />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <ProjectFormModal
          project={editingProject}
          onClose={() => setShowModal(false)}
          onSubmit={async (formData) => {
            const action = editingProject
              ? updateProject({ id: editingProject._id, ...formData })
              : createProject(formData);
            const result = await dispatch(action);
            const isSuccess = editingProject ? updateProject.fulfilled.match(result) : createProject.fulfilled.match(result);
            showToast(isSuccess ? `Project ${editingProject ? "updated" : "created"}` : result.payload || "Something went wrong", isSuccess ? "success" : "error");
            if (isSuccess) setShowModal(false);
          }}
        />
      )}

      {confirmDelete && (
        <Modal title="Delete project?" onClose={() => setConfirmDelete(null)} maxWidth="max-w-sm">
          <p className="text-sm text-base-content/60">
            This will permanently delete "{confirmDelete.name}" and all its tasks and comments.
          </p>
          <div className="mt-5 flex gap-2">
            <button onClick={() => setConfirmDelete(null)} className="btn btn-ghost flex-1 rounded-lg">Cancel</button>
            <button onClick={handleDelete} className="btn flex-1 rounded-lg bg-red-500 text-white hover:bg-red-600">Delete</button>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
    </ManagerLayout>
  );
}

function ProjectFormModal({ project, onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: project?.name || "",
    description: project?.description || "",
    startDate: project?.startDate?.slice(0, 10) || "",
    endDate: project?.endDate?.slice(0, 10) || "",
    status: project?.status || "NOT_STARTED",
  });
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const payload = project ? form : { ...form, status: undefined };
    await onSubmit(payload);
    setSaving(false);
  }

  return (
    <Modal title={project ? "Edit Project" : "New Project"} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3">
        <FormField label="Name" type="text" name="name" value={form.name} onChange={handleChange} required />
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-base-content/40">Description</label>
          <textarea
            name="description" value={form.description} onChange={handleChange} rows={3}
            className="w-full rounded-lg border border-base-300 bg-base-100 px-3 py-2 text-sm text-base-content outline-none focus:border-primary"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Start Date" type="date" name="startDate" value={form.startDate} onChange={handleChange} required />
          <FormField label="End Date" type="date" name="endDate" value={form.endDate} onChange={handleChange} />
        </div>

        {project && (
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-base-content/40">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="select select-bordered w-full">
              {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
            </select>
          </div>
        )}

        <button type="submit" disabled={saving} className="btn btn-primary w-full rounded-xl">
          {saving ? "Saving..." : project ? "Save Changes" : "Create Project"}
        </button>
      </form>
    </Modal>
  );
}