"use client";

import { useRouter } from "next/navigation";
import { authHelper } from "@/lib/auth";
import { LogOut, User, Skull } from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const username = authHelper.getUsername();
  const role = authHelper.getUserRole();

  const handleLogout = () => {
    authHelper.logout();
    router.push("/");
  };

  const getRoleDisplay = () => {
    switch (role) {
      case "juan":
        return "Supreme Overlord";
      case "slave":
        return "Capture Agent";
      case "developer":
        return "Resistance Fighter";
      default:
        return role;
    }
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Skull className="w-8 h-8 text-purple-500" />
            <div>
              <h1 className="text-xl font-bold text-purple-500">
                Juan Sao Ville's Empire
              </h1>
              <p className="text-xs text-gray-500">{getRoleDisplay()}</p>
            </div>
          </div>

          {/* User Info & Logout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg">
              <User className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">{username}</span>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
