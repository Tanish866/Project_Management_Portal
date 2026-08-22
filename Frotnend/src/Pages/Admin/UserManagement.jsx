import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Search, UserPlus, Download, Pencil, RotateCcw, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import AdminLayout from "../../Layouts/AdminLayout";
import Modal from "../../components/ui/Modal";
import FormField from "../../components/ui/FormField";
import Avatar from "../../components/ui/Avatar";
import StatusBadge from "../../components/ui/StatusBadge";
import Toast from "../../components/Toast";
import useUserFilters from "../../hooks/useUserFilters";
import useToast from "../../hooks/useToast";
import {
  fetchUsers, updateUserStatus, updateUserRole, updateUser, createUserByAdmin,
} from "../../Redux/slices/AdminSlice";

const ROLES = ["ADMIN", "PROJECT_MANAGER", "TEAM_MEMBER"];

function exportCsv(users) {
  const headers = ["Name", "Email", "Role", "Status", "Joined"];
  const rows = users.map((u) => [
    u.name, u.email, u.role, u.isActive ? "Active" : "Inactive",
    u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "",
  ]);
  const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = "users.csv";
  a.click();
  URL.revokeObjectURL(url);
}

function SortHeader({ column, label, sortBy, sortDir, onSort }) {
  return (
    <th className="cursor-pointer select-none px-5 py-3 font-medium text-base-content/50 hover:text-base-content" onClick={() => onSort(column)}>
      <span className="flex items-center gap-1">
        {label}
        {sortBy === column ? (sortDir === "asc" ? <ChevronUp size={13} /> : <ChevronDown size={13} />) : <ArrowUpDown size={12} className="opacity-30" />}
      </span>
    </th>
  );
}

export default function UserManagement() {
  const dispatch = useDispatch();
  const { users, loading, error } = useSelector((state) => state.admin);
  const { toast, showToast, clearToast } = useToast();
  const f = useUserFilters(users);

  const [selectedIds, setSelectedIds] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewUser, setViewUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  async function dispatchWithToast(thunk, payload, successMsg) {
    const result = await dispatch(thunk(payload));
    showToast(thunk.fulfilled.match(result) ? successMsg : result.payload || "Something went wrong",
      thunk.fulfilled.match(result) ? "success" : "error");
    return result;
  }

  function requestStatusToggle(user) {
    setConfirmAction({
      title: user.isActive ? "Deactivate user?" : "Activate user?",
      message: `${user.name} will ${user.isActive ? "lose" : "regain"} access to their account.`,
      onConfirm: async () => {
        await dispatchWithToast(updateUserStatus, { id: user._id, isActive: !user.isActive },
          `User ${user.isActive ? "deactivated" : "activated"} successfully`);
        setConfirmAction(null);
      },
    });
  }

  function toggleSelect(id) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function toggleSelectAll() {
    setSelectedIds(selectedIds.length === f.paginatedUsers.length ? [] : f.paginatedUsers.map((u) => u._id));
  }

  async function handleBulkStatus(isActive) {
    await Promise.all(selectedIds.map((id) => dispatch(updateUserStatus({ id, isActive }))));
    showToast(`${selectedIds.length} users ${isActive ? "activated" : "deactivated"}`);
    setSelectedIds([]);
  }

  return (
    <AdminLayout>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-display text-2xl font-bold text-base-content">User Management</h1>
          <p className="mt-1 text-sm text-base-content/50">Manage roles, status, and account details.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => exportCsv(f.filteredUsers)} className="btn btn-outline rounded-xl">
            <Download size={16} /> Export CSV
          </button>
          <button onClick={() => setShowCreateModal(true)} className="btn btn-primary rounded-xl">
            <UserPlus size={16} /> Create User
          </button>
        </div>
      </div>

      {error && <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <label className="flex flex-1 items-center gap-2 rounded-xl border border-base-300 bg-base-100 px-3 py-2">
          <Search size={16} className="text-base-content/40" />
          <input type="text" placeholder="Search users..." value={f.search} onChange={(e) => f.setSearch(e.target.value)}
            className="w-full bg-transparent text-sm text-base-content outline-none placeholder:text-base-content/30" />
        </label>
        <select value={f.roleFilter} onChange={(e) => f.setRoleFilter(e.target.value)} className="select select-bordered">
          <option value="ALL">All Roles</option>
          {ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
        </select>
        <select value={f.statusFilter} onChange={(e) => f.setStatusFilter(e.target.value)} className="select select-bordered">
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
        <button onClick={f.resetFilters} className="btn btn-ghost" title="Reset filters">
          <RotateCcw size={16} />
        </button>
      </div>

      {selectedIds.length > 0 && (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-4 py-2.5">
          <p className="text-sm font-medium text-base-content">{selectedIds.length} selected</p>
          <div className="flex gap-2">
            <button onClick={() => handleBulkStatus(true)} className="btn btn-outline btn-sm rounded-lg">Activate</button>
            <button onClick={() => handleBulkStatus(false)} className="btn btn-outline btn-sm rounded-lg">Deactivate</button>
          </div>
        </div>
      )}

      <div className="mt-4 overflow-hidden rounded-2xl border border-base-300 bg-base-100">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-base-300 bg-base-200/50">
            <tr>
              <th className="w-10 px-5 py-3">
                <input type="checkbox" className="checkbox checkbox-sm"
                  checked={f.paginatedUsers.length > 0 && selectedIds.length === f.paginatedUsers.length}
                  onChange={toggleSelectAll} />
              </th>
              <SortHeader column="name" label="Name" sortBy={f.sortBy} sortDir={f.sortDir} onSort={f.handleSort} />
              <SortHeader column="email" label="Email" sortBy={f.sortBy} sortDir={f.sortDir} onSort={f.handleSort} />
              <th className="px-5 py-3 font-medium text-base-content/50">Role</th>
              <th className="px-5 py-3 font-medium text-base-content/50">Status</th>
              <SortHeader column="createdAt" label="Joined" sortBy={f.sortBy} sortDir={f.sortDir} onSort={f.handleSort} />
              <th className="px-5 py-3 font-medium text-base-content/50">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i} className="border-b border-base-300 last:border-0">
                  <td colSpan={7} className="px-5 py-4"><div className="h-4 w-full animate-pulse rounded bg-base-200" /></td>
                </tr>
              ))
            ) : f.paginatedUsers.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-base-content/40">No users found.</td></tr>
            ) : (
              f.paginatedUsers.map((u) => (
                <tr key={u._id} className="border-b border-base-300 last:border-0 hover:bg-base-200/40">
                  <td className="px-5 py-3">
                    <input type="checkbox" className="checkbox checkbox-sm" checked={selectedIds.includes(u._id)} onChange={() => toggleSelect(u._id)} />
                  </td>
                  <td className="cursor-pointer px-5 py-3" onClick={() => { setViewUser(u); setEditMode(false); }}>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={u.name} role={u.role} />
                      <span className="font-medium text-base-content hover:underline">{u.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-base-content/60">{u.email}</td>
                  <td className="px-5 py-3">
                    <select value={u.role} onChange={(e) => dispatchWithToast(updateUserRole, { id: u._id, role: e.target.value }, "Role updated successfully")} className="select select-bordered select-sm">
                      {ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-3"><StatusBadge isActive={u.isActive} /></td>
                  <td className="px-5 py-3 text-base-content/50">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}</td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => { setViewUser(u); setEditMode(false); }} className="btn btn-ghost btn-sm btn-circle" title="Edit">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => requestStatusToggle(u)} className="btn btn-outline btn-sm rounded-lg">
                        {u.isActive ? "Deactivate" : "Activate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {f.totalPages > 1 && (
        <div className="mt-5 flex items-center justify-between text-sm text-base-content/50">
          <p>Page {f.page} of {f.totalPages} · {f.filteredUsers.length} users</p>
          <div className="join">
            <button className="join-item btn btn-sm" disabled={f.page === 1} onClick={() => f.setPage((p) => p - 1)}>Prev</button>
            <button className="join-item btn btn-sm" disabled={f.page === f.totalPages} onClick={() => f.setPage((p) => p + 1)}>Next</button>
          </div>
        </div>
      )}

      {showCreateModal && (
        <CreateUserModal
          onClose={() => setShowCreateModal(false)}
          onCreate={async (data) => {
            const result = await dispatchWithToast(createUserByAdmin, data, "User created successfully");
            if (createUserByAdmin.fulfilled.match(result)) setShowCreateModal(false);
            return result;
          }}
        />
      )}

      {viewUser && (
        <UserDetailModal
          user={viewUser}
          editMode={editMode}
          onEdit={() => setEditMode(true)}
          onCancelEdit={() => setEditMode(false)}
          onClose={() => setViewUser(null)}
          onSave={async (form) => {
            const result = await dispatchWithToast(updateUser, { id: viewUser._id, ...form }, "User details updated");
            if (updateUser.fulfilled.match(result)) {
              setViewUser(result.payload.user);
              setEditMode(false);
            }
          }}
        />
      )}

      {confirmAction && (
        <Modal title={confirmAction.title} maxWidth="max-w-sm">
          <p className="text-sm text-base-content/60">{confirmAction.message}</p>
          <div className="mt-5 flex gap-2">
            <button onClick={() => setConfirmAction(null)} className="btn btn-ghost flex-1 rounded-lg">Cancel</button>
            <button onClick={confirmAction.onConfirm} className="btn btn-primary flex-1 rounded-lg">Confirm</button>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
    </AdminLayout>
  );
}

function CreateUserModal({ onClose, onCreate }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "TEAM_MEMBER" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const result = await onCreate(form);
    setSaving(false);
    if (result?.payload?.message || result?.error) setError(result.payload || "Failed to create user");
  }

  return (
    <Modal title="Create User" onClose={onClose}>
      {error && <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-3">
        <FormField label="Name" type="text" name="name" value={form.name} onChange={handleChange} required />
        <FormField label="Email" type="email" name="email" value={form.email} onChange={handleChange} required />
        <FormField label="Password" type="password" name="password" value={form.password} onChange={handleChange} required />
        <div>
          <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-base-content/40">Role</label>
          <select name="role" value={form.role} onChange={handleChange} className="select select-bordered w-full">
            {ROLES.map((r) => <option key={r} value={r}>{r.replace("_", " ")}</option>)}
          </select>
        </div>
        <button type="submit" disabled={saving} className="btn btn-primary w-full rounded-xl">
          {saving ? "Creating..." : "Create User"}
        </button>
      </form>
    </Modal>
  );
}

function UserDetailModal({ user, editMode, onEdit, onCancelEdit, onClose, onSave }) {
  const [form, setForm] = useState({ name: user.name, email: user.email });
  const [saving, setSaving] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSave() {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  }

  return (
    <Modal title="User Details" onClose={onClose}>
      <div className="flex items-center gap-3">
        <Avatar name={user.name} role={user.role} size="lg" />
        <div>
          <p className="font-semibold text-base-content">{user.name}</p>
          <span className="mt-1 inline-block text-xs font-medium text-base-content/50">{user.role?.replace("_", " ")}</span>
        </div>
      </div>

      {!editMode ? (
        <div className="mt-5 space-y-3 text-sm">
          <div className="flex justify-between border-b border-base-300 pb-2">
            <span className="text-base-content/50">Email</span>
            <span className="text-base-content">{user.email}</span>
          </div>
          <div className="flex justify-between border-b border-base-300 pb-2">
            <span className="text-base-content/50">Status</span>
            <StatusBadge isActive={user.isActive} />
          </div>
          <div className="flex justify-between pb-2">
            <span className="text-base-content/50">Joined</span>
            <span className="text-base-content">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</span>
          </div>
          <button onClick={onEdit} className="btn btn-outline btn-sm mt-2 w-full rounded-lg">
            <Pencil size={14} /> Edit Details
          </button>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          <FormField label="Name" type="text" name="name" value={form.name} onChange={handleChange} />
          <FormField label="Email" type="email" name="email" value={form.email} onChange={handleChange} />
          <div className="flex gap-2">
            <button onClick={onCancelEdit} className="btn btn-ghost flex-1 rounded-lg">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn btn-primary flex-1 rounded-lg">
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}