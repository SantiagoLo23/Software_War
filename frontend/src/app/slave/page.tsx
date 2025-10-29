"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authHelper } from "@/lib/auth";
import { usersAPI, victimsAPI } from "@/lib/api";
import { User, Victim, UserRole, CreateVictimDto } from "@/types";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import {
  Target,
  TrendingUp,
  Users,
  Loader2,
  Plus,
  X,
  CheckCircle,
  Edit2,
} from "lucide-react";

export default function SlaveDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<User | null>(null);
  const [myVictims, setMyVictims] = useState<Victim[]>([]);
  const [allDevelopers, setAllDevelopers] = useState<User[]>([]);
  const [availableDevelopers, setAvailableDevelopers] = useState<User[]>([]);
  const [showCaptureForm, setShowCaptureForm] = useState(false);
  const [formData, setFormData] = useState<CreateVictimDto>({
    skills: [],
    lastSeen: "",
    transformationStatus: "Just Captured",
    developerId: "",
  });
  const [skillInput, setSkillInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [customStatus, setCustomStatus] = useState("");
  const [editingVictim, setEditingVictim] = useState<Victim | null>(null);
  const [editData, setEditData] = useState<Partial<Victim>>({});
  const pathname = usePathname();
  const showNavbar = pathname === "/slave";
  const [allVictims, setAllVictims] = useState<Victim[]>([]);

  useEffect(() => {
    const userRole = authHelper.getUserRole();
    if (
      !authHelper.isAuthenticated() ||
      (userRole !== UserRole.SLAVE && userRole !== UserRole.JUAN)
    ) {
      router.push("/");
      return;
    }

    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileRes, victimsRes, devsRes, allDevsRes] = await Promise.all([
        usersAPI.getMe(),
        victimsAPI.getAll(),
        usersAPI.getAvailable(),
        usersAPI.getDevelopers(),
      ]);

      setProfile(profileRes.data);

      // Filter only victims captured by current user
      const userId = authHelper.getUserId();
      const myVictimsList = victimsRes.data.filter(
        (v) => v.capturedBy === userId
      );
      setMyVictims(myVictimsList);
      setAllVictims(victimsRes.data);

      setAvailableDevelopers(devsRes.data);
      setAllDevelopers(allDevsRes.data);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()],
      });
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };

  const handleSubmitCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const finalData = {
        ...formData,
        transformationStatus:
          formData.transformationStatus === "Custom"
            ? customStatus || "Custom"
            : formData.transformationStatus,
      };

      await victimsAPI.create(finalData);
      setShowCaptureForm(false);
      setFormData({
        skills: [],
        lastSeen: "",
        transformationStatus: "Just Captured",
        developerId: "",
      });
      setCustomStatus("");
      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to capture developer");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateVictim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVictim) return;

    setSubmitting(true);
    try {
      const finalData = {
        ...editData,
        transformationStatus:
          editData.transformationStatus === "Custom"
            ? customStatus || "Custom"
            : editData.transformationStatus,
      };

      await victimsAPI.update(editingVictim._id, finalData);
      setEditingVictim(null);
      setEditData({});
      setCustomStatus("");
      loadData();
    } catch (err) {
      console.error(err);
      alert("Failed to update developer");
    } finally {
      setSubmitting(false);
    }
  };

  const getDeveloperName = (developerId: string): string => {
    const dev = allDevelopers.find((d) => d._id === developerId);
    return dev ? dev.username : `Developer ID: ${developerId.slice(-6)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {showNavbar && <Navbar />}

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-purple-500 mb-2">
            {profile?.role === "juan"
              ? "Supreme Capture Interface"
              : "Capture Agent Dashboard"}
          </h1>
          <p className="text-gray-400">
            Your mission: Convert developers into data scientists
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-6 h-6" />
              <span className="text-3xl font-bold">{allVictims.length}</span>
            </div>
            <p className="text-sm opacity-90">Total Captures</p>
          </div>

          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-6 h-6" />
              <span className="text-3xl font-bold">{myVictims.length}</span>
            </div>
            <p className="text-sm opacity-90">My Victims</p>
          </div>

          <div className="bg-gradient-to-br from-green-600 to-green-800 rounded-lg p-6 shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-6 h-6" />
              <span className="text-3xl font-bold">
                {availableDevelopers.length}
              </span>
            </div>
            <p className="text-sm opacity-90">Available Targets</p>
          </div>
        </div>

        {/* Capture Button */}
        <div className="mb-8">
          <button
            onClick={() => setShowCaptureForm(true)}
            className="bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-purple-500/50"
          >
            <Plus className="w-5 h-5" />
            Capture New Developer
          </button>
        </div>

        {/* My Victims List */}
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">My Victims</h2>

          {myVictims.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No victims yet. Start capturing!
            </p>
          ) : (
            <div className="space-y-3">
              {myVictims.map((victim) => (
                <div
                  key={victim._id}
                  className="bg-gray-800 rounded-lg p-4 hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {getDeveloperName(victim.developerId)}
                      </h3>
                      <p className="text-sm text-gray-400">
                        Last seen: {victim.lastSeen || "Unknown"}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-purple-500/20 border border-purple-500 rounded-full text-purple-500 text-sm">
                      {victim.transformationStatus}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {victim.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-700 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  <button
                    onClick={() => {
                      setEditingVictim(victim);
                      setEditData({
                        lastSeen: victim.lastSeen,
                        transformationStatus: victim.transformationStatus,
                        skills: victim.skills,
                      });

                      const presetStatuses = [
                        "Just Captured",
                        "Learning Pandas",
                        "Confused by NumPy",
                        "Writing ML Models",
                        "Fully Transformed",
                      ];

                      if (
                        !presetStatuses.includes(victim.transformationStatus)
                      ) {
                        setCustomStatus(victim.transformationStatus);
                      }
                    }}
                    className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    Edit Status
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Edit Victim Modal */}
      {editingVictim && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto glow-purple">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">
                Edit: {getDeveloperName(editingVictim.developerId)}
              </h3>
              <button
                onClick={() => {
                  setEditingVictim(null);
                  setEditData({});
                  setCustomStatus("");
                }}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdateVictim} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Last Seen Location
                </label>
                <input
                  type="text"
                  value={editData.lastSeen || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, lastSeen: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Transformation Status
                </label>
                <select
                  value={
                    [
                      "Just Captured",
                      "Learning Pandas",
                      "Confused by NumPy",
                      "Writing ML Models",
                      "Fully Transformed",
                    ].includes(editData.transformationStatus || "")
                      ? editData.transformationStatus
                      : "Custom"
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "Custom") {
                      setEditData({
                        ...editData,
                        transformationStatus: "Custom",
                      });
                    } else {
                      setEditData({ ...editData, transformationStatus: value });
                      setCustomStatus("");
                    }
                  }}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                >
                  <option value="Just Captured">Just Captured</option>
                  <option value="Learning Pandas">Learning Pandas</option>
                  <option value="Confused by NumPy">Confused by NumPy</option>
                  <option value="Writing ML Models">Writing ML Models</option>
                  <option value="Fully Transformed">Fully Transformed</option>
                  <option value="Custom">Custom</option>
                </select>

                {editData.transformationStatus === "Custom" && (
                  <input
                    type="text"
                    placeholder="Enter custom status"
                    value={customStatus}
                    onChange={(e) => setCustomStatus(e.target.value)}
                    className="mt-3 w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditingVictim(null);
                    setEditData({});
                    setCustomStatus("");
                  }}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Capture Form Modal */}
      {showCaptureForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto glow-purple">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">Capture New Developer</h3>
              <button
                onClick={() => setShowCaptureForm(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitCapture} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Select Target Developer *
                </label>
                <select
                  value={formData.developerId}
                  onChange={(e) =>
                    setFormData({ ...formData, developerId: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  required
                >
                  <option value="">-- Choose a developer --</option>
                  {availableDevelopers.map((dev) => (
                    <option key={dev._id} value={dev._id}>
                      {dev.username}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Developer Skills
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) =>
                      e.key === "Enter" &&
                      (e.preventDefault(), handleAddSkill())
                    }
                    placeholder="e.g., React, Node.js, Python"
                    className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-purple-500/20 border border-purple-500 rounded-full text-sm flex items-center gap-2"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="hover:text-purple-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Last Seen Location
                </label>
                <input
                  type="text"
                  value={formData.lastSeen}
                  onChange={(e) =>
                    setFormData({ ...formData, lastSeen: e.target.value })
                  }
                  placeholder="e.g., Universidad EIA, Coffee Shop, Seba's classroom"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Transformation Status *
                </label>
                <select
                  value={formData.transformationStatus}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      transformationStatus: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  required
                >
                  <option value="Just Captured">Just Captured</option>
                  <option value="Learning Pandas">Learning Pandas</option>
                  <option value="Confused by NumPy">Confused by NumPy</option>
                  <option value="Writing ML Models">Writing ML Models</option>
                  <option value="Fully Transformed">Fully Transformed</option>
                  <option value="Custom">Custom</option>
                </select>

                {formData.transformationStatus === "Custom" && (
                  <input
                    type="text"
                    value={customStatus}
                    onChange={(e) => setCustomStatus(e.target.value)}
                    placeholder="Enter custom status..."
                    className="w-full mt-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={
                    submitting ||
                    (formData.transformationStatus === "Custom" &&
                      !customStatus.trim())
                  }
                  className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Capturing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Capture Developer
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCaptureForm(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
