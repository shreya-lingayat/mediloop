import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Activity, Lock, User, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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


return (
  <div className="min-h-screen bg-[#f4f7fb] flex items-center justify-center px-4">
    <div className="w-full max-w-5xl bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 lg:grid-cols-2">

      {/* LEFT SIDE - Branding */}
      <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-blue-600 to-blue-500 text-white">
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
          Enter your credentials to continue
        </p>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 mb-4 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5" />
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">

          {/* Username */}
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
                placeholder="Enter username"
                required
                className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Password
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
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

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg text-sm font-medium transition"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-xs text-gray-400 mt-6 text-center">
          © 2026 MediLoop • Pharmacy Management System
        </p>
      </div>
    </div>
  </div>
);


}
