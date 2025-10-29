"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authHelper } from "@/lib/auth";
import { usersAPI, victimsAPI } from "@/lib/api";
import { User, Victim, UserRole } from "@/types";
import Navbar from "@/components/Navbar";
import {
  Users,
  Trophy,
  Target,
  Award,
  TrendingUp,
  Trash2,
  Crown,
  Loader2,
} from "lucide-react";

export default function JuanDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [victims, setVictims] = useState<Victim[]>([]);
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [rewardInput, setRewardInput] = useState("");

  useEffect(() => {
    // Check authentication
    if (
      !authHelper.isAuthenticated() ||
      authHelper.getUserRole() !== UserRole.JUAN
    ) {
      router.push("/");
      return;
    }

    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [usersRes, victimsRes, leaderboardRes] = await Promise.all([
        usersAPI.getAll(),
        victimsAPI.getAll(),
        usersAPI.getLeaderboard(),
      ]);

      setUsers(usersRes.data);
      setVictims(victimsRes.data);
      setLeaderboard(leaderboardRes.data);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignReward = async (userId: string) => {
    if (!rewardInput.trim()) return;

    try {
      await usersAPI.assignReward(userId, rewardInput);
      setRewardInput("");
      setSelectedUser(null);
      loadData();
    } catch (error) {
      console.error("Failed to assign reward:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Delete this user permanently?")) return;

    try {
      await usersAPI.delete(userId);
      loadData();
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  const stats = {
    totalUsers: users.length,
    totalSlaves: users.filter((u) => u.role === UserRole.SLAVE).length,
    totalDevelopers: users.filter((u) => u.role === UserRole.DEVELOPER).length,
    totalVictims: victims.length,
    totalCaptures: users.reduce((sum, u) => sum + u.captureCount, 0),
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Crown className="w-10 h-10 text-yellow-500 animate-pulse" />
            <h1 className="text-4xl font-bold text-glow">
              Supreme Command Center
            </h1>
          </div>
          <p className="text-gray-400">
            Total control over the empire of data science domination
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="Total Users"
            value={stats.totalUsers}
            color="blue"
          />
          <StatCard
            icon={<Target className="w-6 h-6" />}
            label="Slaves"
            value={stats.totalSlaves}
            color="purple"
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="Developers"
            value={stats.totalDevelopers}
            color="green"
          />
          <StatCard
            icon={<Trophy className="w-6 h-6" />}
            label="Victims"
            value={stats.totalVictims}
            color="red"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Total Captures"
            value={stats.totalCaptures}
            color="yellow"
          />
        </div>

        {/* Leaderboard */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8 glow-purple">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold">Top Slaves Leaderboard</h2>
          </div>

          <div className="space-y-2">
            {leaderboard.map((slave, index) => (
              <div
                key={slave._id}
                className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-750 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      index === 0
                        ? "bg-yellow-500 text-black"
                        : index === 1
                        ? "bg-gray-400 text-black"
                        : index === 2
                        ? "bg-orange-600 text-white"
                        : "bg-gray-700 text-gray-300"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold">{slave.username}</p>
                    <p className="text-sm text-gray-400">
                      {slave.captureCount} captures
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {slave.reward && (
                    <div className="px-3 py-1 bg-yellow-500/20 border border-yellow-500 rounded-full text-yellow-500 text-sm flex items-center gap-1">
                      <Award className="w-4 h-4" />
                      {slave.reward}
                    </div>
                  )}

                  <button
                    onClick={() => setSelectedUser(slave)}
                    className="px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm transition-colors"
                  >
                    Assign Reward
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All Users Table */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">All Users</h2>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-800">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Username
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Role
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Captures
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Victim
                  </th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium">
                    Reward
                  </th>
                  <th className="text-right py-3 px-4 text-gray-400 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b border-gray-800 hover:bg-gray-800/50"
                  >
                    <td className="py-3 px-4">{user.username}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          user.role === "juan"
                            ? "bg-yellow-500/20 text-yellow-500"
                            : user.role === "slave"
                            ? "bg-purple-500/20 text-purple-500"
                            : "bg-green-500/20 text-green-500"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">{user.captureCount}</td>
                    <td className="py-3 px-4">
                      {user.isVictim ? (
                        <span className="text-red-500">✓ Yes</span>
                      ) : (
                        <span className="text-gray-500">No</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-yellow-500">
                      {user.reward || "-"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      {user.role !== "juan" && (
                        <button
                          onClick={() => handleDeleteUser(user._id)}
                          className="p-2 text-red-500 hover:bg-red-500/20 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Reward Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-md w-full glow-purple">
            <h3 className="text-xl font-bold mb-4">
              Assign Reward to {selectedUser.username}
            </h3>

            <input
              type="text"
              value={rewardInput}
              onChange={(e) => setRewardInput(e.target.value)}
              placeholder="e.g., Gold Medal, Bitcoin, Evil Trophy"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <div className="flex gap-3">
              <button
                onClick={() => handleAssignReward(selectedUser._id)}
                className="flex-1 bg-purple-600 hover:bg-purple-700 py-2 rounded-lg transition-colors"
              >
                Assign
              </button>
              <button
                onClick={() => {
                  setSelectedUser(null);
                  setRewardInput("");
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Stats Card Component
type StatColor = "blue" | "purple" | "green" | "red" | "yellow";

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: StatColor;
}

function StatCard({ icon, label, value, color }: StatCardProps) {
  const colors: Record<StatColor, string> = {
    blue: "from-blue-600 to-blue-800",
    purple: "from-purple-600 to-purple-800",
    green: "from-green-600 to-green-800",
    red: "from-red-600 to-red-800",
    yellow: "from-yellow-600 to-yellow-800",
  };

  return (
    <div
      className={`bg-gradient-to-br ${colors[color]} rounded-lg p-6 shadow-lg hover:scale-105 transition-transform`}
    >
      <div className="flex items-center justify-between mb-2">
        {icon}
        <span className="text-3xl font-bold">{value}</span>
      </div>
      <p className="text-sm opacity-90">{label}</p>
    </div>
  );
}
