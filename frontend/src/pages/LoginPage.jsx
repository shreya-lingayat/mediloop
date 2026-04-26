import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Activity, Lock, User, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.status === 401) {
        setError(data.error || "Invalid username or password.");
        return;
      }
      if (data.message === "Login success") {
        localStorage.setItem("loggedIn", "true");
        localStorage.setItem("username", username);
        navigate("/dashboard");
      }
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Registration failed.");
        return;
      }
      setError("Registration successful. Please sign in.");
      setMode("login");
      setPassword("");
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/forgot_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to generate reset token.");
        return;
      }
      setToken(data.reset_token || "");
      setError("Account verified. Please enter your new password.");
      setMode("reset");
      setPassword("");
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/reset_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, token, new_password: password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Password reset failed.");
        return;
      }
      setError("Password reset successful. Please sign in.");
      setMode("login");
      setPassword("");
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  };


return (
  <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center px-4">
    <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-2">

      {/* LEFT SIDE - Branding */}
      <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-blue-800 to-blue-700 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-semibold">MediLoop</h1>
        </div>

        <div>
          <h2 className="text-3xl font-bold leading-snug">
            Smart Pharmacy <br /> Management System
          </h2>
          <p className="mt-3 text-blue-100 text-sm">
            Manage inventory, billing, expiry tracking and patient credits
            efficiently in one platform.
          </p>
        </div>

        <div className="text-sm text-blue-100">
          Secure • Reliable • Fast
        </div>
      </div>

      {/* RIGHT SIDE - Login */}
      <div className="p-8 lg:p-10 flex flex-col justify-center">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Sign in to your account
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {mode === "login" && "Enter your credentials to continue"}
          {mode === "register" && "Create a new account"}
          {mode === "forgot" && "Enter either your username or email to verify your account"}
          {mode === "reset" && "Enter your new password"}
        </p>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 mb-4 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5" />
            {error}
          </div>
        )}

        <form
          onSubmit={
            mode === "login"
              ? handleLogin
              : mode === "register"
              ? handleRegister
              : mode === "forgot"
              ? handleForgot
              : handleReset
          }
          className="space-y-4"
        >

          {mode !== "reset" && (
            <div>
              <label className="text-sm font-medium text-gray-600">
                Username
              </label>
              <div className="relative mt-1">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={mode === "forgot" ? "Enter username (optional if email provided)" : "Enter username"}
                  required={mode !== "forgot"}
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {(mode === "register" || mode === "forgot") && (
            <div>
              <label className="text-sm font-medium text-gray-600">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={mode === "forgot" ? "Enter email (optional if username provided)" : "Enter email"}
                required={mode === "register"}
                className="w-full mt-1 border border-gray-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          )}

          {/* Password */}
          {mode !== "forgot" && (
            <div>
              <label className="text-sm font-medium text-gray-600">
                {mode === "reset" ? "New Password" : "Password"}
              </label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "reset" ? "Enter new password" : "Enter password"}
                  required
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Sign in"
              : mode === "register"
              ? "Register"
              : mode === "forgot"
              ? "Generate reset token"
              : "Reset password"}
          </button>
        </form>

        <div className="mt-4 flex gap-3 text-xs">
          <button type="button" onClick={() => setMode("login")} className="text-blue-700 hover:underline">Sign in</button>
          <button type="button" onClick={() => setMode("register")} className="text-blue-700 hover:underline">Register</button>
          <button type="button" onClick={() => setMode("forgot")} className="text-blue-700 hover:underline">Forgot password</button>
        </div>

        <p className="text-xs text-gray-400 mt-6 text-center">
          © 2026 MediLoop • Pharmacy Management System
        </p>
      </div>
    </div>
  </div>
);


}
