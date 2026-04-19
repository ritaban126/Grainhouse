import { useAuth } from "../../context/AuthContext.jsx";
import { userAPI, authAPI } from "../../api/services.js";
import { Input } from "../../components/common";

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { success, error: toastErr } = useToast();
  const [name,     setName]     = useState(user?.name || "");
  const [password, setPassword] = useState("");
  const [saving,   setSaving]   = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await userAPI.updateMe({ name });
      updateUser({ name: data.user.name });
      success("Profile updated.");
    } catch (err) { toastErr(err.response?.data?.message || "Failed."); }
    finally { setSaving(false); }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;
    const form = new FormData();
    form.append("avatar", avatarFile);
    setSaving(true);
    try {
      const { data } = await userAPI.uploadAvatar(form);
      updateUser({ avatar: data.avatar });
      success("Avatar updated.");
    } catch (err) { toastErr("Avatar upload failed."); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (password.length < 6) { toastErr("Password must be at least 6 characters."); return; }
    setSaving(true);
    try {
      await userAPI.updateMe({ password });
      setPassword("");
      success("Password changed.");
    } catch (err) { toastErr(err.response?.data?.message || "Failed."); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <PageHeader title="Settings" />

      {/* Avatar */}
      <div className="border border-border rounded-sm p-6 mb-4">
        <p className="font-mono text-xs text-paper/40 tracking-widest uppercase mb-4">Profile photo</p>
        <div className="flex items-center gap-4">
          {user?.avatar?.url
            ? <img src={user.avatar.url} alt="" className="w-16 h-16 rounded-full object-cover border border-border" />
            : <div className="w-16 h-16 rounded-full bg-paper/10 border border-border flex items-center justify-center font-serif text-2xl text-paper/40">{user?.name?.[0]}</div>
          }
          <div className="flex gap-2 items-center">
            <input type="file" accept="image/*" className="hidden" id="avatar-input"
              onChange={e => setAvatarFile(e.target.files[0])} />
            <label htmlFor="avatar-input"
              className="font-mono text-xs border border-border px-4 py-2 rounded-sm cursor-pointer hover:border-paper/30 transition-colors">
              Choose file
            </label>
            {avatarFile && (
              <Button size="sm" onClick={handleAvatarUpload} loading={saving}>Upload</Button>
            )}
          </div>
        </div>
      </div>

      {/* Name */}
      <form onSubmit={handleProfileSave} className="border border-border rounded-sm p-6 mb-4">
        <p className="font-mono text-xs text-paper/40 tracking-widest uppercase mb-4">Profile</p>
        <div className="flex flex-col gap-4">
          <Input label="Display name" id="name" value={name} onChange={e => setName(e.target.value)} />
          <Input label="Email" id="email" value={user?.email || ""} disabled className="opacity-50 cursor-not-allowed" />
          <Button type="submit" size="sm" loading={saving}>Save changes</Button>
        </div>
      </form>

      {/* Password */}
      <form onSubmit={handlePasswordChange} className="border border-border rounded-sm p-6">
        <p className="font-mono text-xs text-paper/40 tracking-widest uppercase mb-4">Change password</p>
        <div className="flex flex-col gap-4">
          <Input label="New password" id="password" type="password" value={password}
            onChange={e => setPassword(e.target.value)} minLength={6} />
          <Button type="submit" size="sm" loading={saving}>Update password</Button>
        </div>
      </form>
    </div>
  );
}