import { useState } from "react";
import { User, Lock, CheckCircle, AlertCircle, Eye, EyeOff, Settings } from "lucide-react";

// ─── Reusable input ────────────────────────────────────────────────────────

function Field({ label, type = "text", value, onChange, placeholder, icon: Icon, toggle, onToggle, showValue }) {
  const inputType = toggle ? (showValue ? "text" : "password") : type;
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
        {label}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />}
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required
          className="w-full bg-slate-800/60 border border-slate-700 text-white placeholder-slate-600 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all"
        />
        {toggle && (
          <button type="button" onClick={onToggle} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
            {showValue ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
    </div>
  );
}

function Notice({ type, message }) {
  const isError = type === "error";
  return (
    <div className={`flex items-start gap-3 rounded-xl px-4 py-3 mb-5 border ${isError ? "bg-red-500/10 border-red-500/20" : "bg-emerald-500/10 border-emerald-500/20"}`}>
      {isError
        ? <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
        : <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
      }
      <p className={`text-sm ${isError ? "text-red-300" : "text-emerald-300"}`}>{message}</p>
    </div>
  );
}

// ─── Change Password ───────────────────────────────────────────────────────

function ChangePassword() {
  const username = localStorage.getItem("username") || "admin";
  const [form, setForm] = useState({ old: "", new_: "", confirm: "" });
  const [show, setShow] = useState({ old: false, new_: false, confirm: false });
  const [status, setStatus] = useState(null); // { type, message }
  const [loading, setLoading] = useState(false);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));
  const tog = (key) => () => setShow((s) => ({ ...s, [key]: !s[key] }));

  const handle = async (e) => {
    e.preventDefault();
    setStatus(null);
    if (form.new_ !== form.confirm) {
      setStatus({ type: "error", message: "New passwords do not match." });
      return;
    }
    if (form.new_.length < 8) {
      setStatus({ type: "error", message: "Password must be at least 8 characters." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, old_password: form.old, new_password: form.new_ }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: "error", message: data.error });
      } else {
        setStatus({ type: "success", message: "Password updated successfully." });
        setForm({ old: "", new_: "", confirm: "" });
      }
    } catch {
      setStatus({ type: "error", message: "Server error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handle} className="space-y-4">
      {status && <Notice {...status} />}
      <Field label="Current Password" value={form.old} onChange={set("old")} placeholder="Your current password" icon={Lock} toggle onToggle={tog("old")} showValue={show.old} />
      <Field label="New Password" value={form.new_} onChange={set("new_")} placeholder="Min. 8 characters" icon={Lock} toggle onToggle={tog("new_")} showValue={show.new_} />
      <Field label="Confirm New Password" value={form.confirm} onChange={set("confirm")} placeholder="Repeat new password" icon={Lock} toggle onToggle={tog("confirm")} showValue={show.confirm} />
      <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl py-3 text-sm transition-all flex items-center justify-center gap-2">
        {loading ? "Updating..." : "Update Password"}
      </button>
    </form>
  );
}

// ─── Change Username ───────────────────────────────────────────────────────

function ChangeUsername() {
  const [form, setForm] = useState({ username: localStorage.getItem("username") || "", password: "", new_username: "" });
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const handle = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/change-username", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: form.username, password: form.password, new_username: form.new_username }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus({ type: "error", message: data.error });
      } else {
        localStorage.setItem("username", form.new_username);
        setStatus({ type: "success", message: "Username updated. Please log in again." });
        setTimeout(() => { localStorage.clear(); window.location.href = "/login"; }, 2000);
      }
    } catch {
      setStatus({ type: "error", message: "Server error. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handle} className="space-y-4">
      {status && <Notice {...status} />}
      <Field label="Current Username" value={form.username} onChange={set("username")} placeholder="Your current username" icon={User} />
      <Field label="Confirm Password" value={form.password} onChange={set("password")} placeholder="Your password" icon={Lock} toggle onToggle={() => setShow(!show)} showValue={show} />
      <Field label="New Username" value={form.new_username} onChange={set("new_username")} placeholder="Choose a new username" icon={User} />
      <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold rounded-xl py-3 text-sm transition-all flex items-center justify-center gap-2">
        {loading ? "Updating..." : "Update Username"}
      </button>
    </form>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function AccountSettingsPage() {
  const [tab, setTab] = useState("password");

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }} className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-slate-800 border border-slate-700 rounded-xl flex items-center justify-center">
            <Settings className="w-5 h-5 text-slate-300" />
          </div>
          <div>
            <h1 style={{ fontFamily: "'Sora', sans-serif" }} className="text-white font-bold text-xl">Account Settings</h1>
            <p className="text-slate-500 text-xs">Manage your login credentials</p>
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 bg-slate-800/60 border border-slate-700 rounded-xl p-1 mb-6">
          {[{ key: "password", label: "Change Password" }, { key: "username", label: "Change Username" }].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${tab === key ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-slate-200"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          {tab === "password" ? <ChangePassword /> : <ChangeUsername />}
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Changes take effect immediately. You'll be asked to sign in again if the username changes.
        </p>
      </div>
    </div>
  );
}
