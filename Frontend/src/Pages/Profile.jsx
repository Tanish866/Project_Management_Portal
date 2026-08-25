import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { User, Mail, Lock, Save } from "lucide-react";
import { updateProfile, changePassword } from "../Redux/slices/AuthSlice";
import Toast from "../components/Toast";
import useToast from "../hooks/useToast";
import AdminLayout from "../Layouts/AdminLayout";
import ManagerLayout from "../Layouts/ManagerLayout";
import MemberLayout from "../Layouts/MemberLayout";

const LAYOUTS = {
  ADMIN: AdminLayout,
  PROJECT_MANAGER: ManagerLayout,
  TEAM_MEMBER: MemberLayout,
};

export default function Profile() {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { toast, showToast, clearToast } = useToast();

  const Layout = LAYOUTS[user?.role] || AdminLayout;

  const [profileForm, setProfileForm] = useState({ name: user?.name || "", email: user?.email || "" });
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [savingPw, setSavingPw] = useState(false);

  async function handleProfileSubmit(e) {
    e.preventDefault();
    setSavingProfile(true);
    const result = await dispatch(updateProfile(profileForm));
    setSavingProfile(false);
    showToast(
      updateProfile.fulfilled.match(result) ? "Profile updated" : result.payload || "Failed to update",
      updateProfile.fulfilled.match(result) ? "success" : "error"
    );
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      showToast("New passwords do not match", "error");
      return;
    }
    setSavingPw(true);
    const result = await dispatch(changePassword({
      currentPassword: pwForm.currentPassword,
      newPassword: pwForm.newPassword,
    }));
    setSavingPw(false);

    if (changePassword.fulfilled.match(result)) {
      showToast("Password changed successfully");
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      showToast(result.payload || "Failed to change password", "error");
    }
  }

  return (
    <Layout>
      <h1 className="font-display text-2xl font-bold text-base-content">My Profile</h1>
      <p className="mt-1 text-sm text-base-content/50">Manage your account details and password.</p>

      <div className="mt-6 flex items-center gap-4 rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-content">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-lg font-semibold text-base-content">{user?.name}</p>
          <span className="mt-1 inline-block rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
            {user?.role?.replace("_", " ")}
          </span>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
          <p className="font-semibold text-base-content">Account Details</p>
          <form onSubmit={handleProfileSubmit} className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-base-content/40">Name</label>
              <label className="flex items-center gap-2 rounded-lg border border-base-300 bg-base-100 px-3 py-2 focus-within:border-primary">
                <User size={15} className="text-base-content/40" />
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full bg-transparent text-sm text-base-content outline-none"
                />
              </label>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-base-content/40">Email</label>
              <label className="flex items-center gap-2 rounded-lg border border-base-300 bg-base-100 px-3 py-2 focus-within:border-primary">
                <Mail size={15} className="text-base-content/40" />
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full bg-transparent text-sm text-base-content outline-none"
                />
              </label>
            </div>
            <button type="submit" disabled={savingProfile} className="btn btn-primary btn-sm rounded-lg">
              <Save size={14} /> {savingProfile ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-base-300 bg-base-100 p-6 shadow-sm">
          <p className="font-semibold text-base-content">Change Password</p>
          <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-3">
            <label className="flex items-center gap-2 rounded-lg border border-base-300 bg-base-100 px-3 py-2 focus-within:border-primary">
              <Lock size={15} className="text-base-content/40" />
              <input
                type="password"
                placeholder="Current password"
                value={pwForm.currentPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, currentPassword: e.target.value }))}
                required
                className="w-full bg-transparent text-sm text-base-content outline-none placeholder:text-base-content/30"
              />
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-base-300 bg-base-100 px-3 py-2 focus-within:border-primary">
              <Lock size={15} className="text-base-content/40" />
              <input
                type="password"
                placeholder="New password"
                value={pwForm.newPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, newPassword: e.target.value }))}
                required
                className="w-full bg-transparent text-sm text-base-content outline-none placeholder:text-base-content/30"
              />
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-base-300 bg-base-100 px-3 py-2 focus-within:border-primary">
              <Lock size={15} className="text-base-content/40" />
              <input
                type="password"
                placeholder="Confirm new password"
                value={pwForm.confirmPassword}
                onChange={(e) => setPwForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                required
                className="w-full bg-transparent text-sm text-base-content outline-none placeholder:text-base-content/30"
              />
            </label>
            <button type="submit" disabled={savingPw} className="btn btn-primary btn-sm rounded-lg">
              {savingPw ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={clearToast} />}
    </Layout>
  );
}