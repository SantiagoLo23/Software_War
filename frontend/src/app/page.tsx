"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authAPI } from "@/lib/api";
import { authHelper } from "@/lib/auth";
import { UserRole } from "@/types";
import { Skull, Loader2 } from "lucide-react";
import { isIP } from "net";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.SLAVE);
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authHelper.isAuthenticated()) {
      const role = authHelper.getUserRole();
      redirectByRole(role);
    }
  }, []);

  const redirectByRole = (role: UserRole | null) => {
    if (!role) return;
    switch (role) {
      case UserRole.JUAN:
        router.push("/juan");
        break;
      case UserRole.SLAVE:
        router.push("/slave");
        break;
      case UserRole.DEVELOPER:
        router.push("/resistance");
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignup) {
        // Signup
        await authAPI.signup(username, password, role);
        alert("Signup successful! Please log in.");
        setIsSignup(false);
      } else {
        // Login
        const response = await authAPI.login(username, password);
        const token = response.data.access_token;
        authHelper.saveToken(token);
        const role = authHelper.getUserRole();
        redirectByRole(role);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-950 via-gray-900 to-purple-950 p-4 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      </div>

      <div className="relative max-w-md w-full">
        <div className="text-center mb-8 animate-float">
          <div className="flex justify-center mb-4">
            <Skull className="w-20 h-20 text-purple-500 animate-pulse-glow" />
          </div>
          <h1 className="text-4xl font-bold text-glow mb-2">Juan Sao Ville</h1>
          <p className="text-gray-400 text-sm">
            {isSignup
              ? "Create your account if you wanna join the data science revolution"
              : "Login to the realm of data science domination"}
          </p>
        </div>

        {/* Login */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg shadow-2xl p-8 glow-purple">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-100 placeholder-gray-500"
                placeholder="Enter your username"
                required
                disabled={loading}
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-100 placeholder-gray-500"
                placeholder="Enter your password"
                required
                disabled={loading}
              />
            </div>

            {/* Signup */}
            {isSignup && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-100"
                >
                  <option value={UserRole.SLAVE}>Slave</option>
                  <option value={UserRole.DEVELOPER}>Developer</option>
                  <option value={UserRole.JUAN}>Juan</option>
                </select>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="bg-purple-900/50 border border-purple-700 rounded-lg p-3 text-sm text-purple-200">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 text-white font-bold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {isSignup ? "Creating..." : "Entering..."}
                </>
              ) : isSignup ? (
                "Create Account"
              ) : (
                "Enter the Realm of Machine Learning"
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-purple-400 hover:text-purple-300 text-sm underline"
            >
              {isSignup
                ? "Already have an account? Enter the Darkness"
                : "New here? Create an account"}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-gray-800">
            <p className="text-center text-xs text-gray-500">
              "Embittered and obsessed with the power of data, I turned my back
              on software engineering forever." - Juan Sao Ville
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
