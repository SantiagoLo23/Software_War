"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { authHelper } from "@/lib/auth";
import { feedbackAPI } from "@/lib/api";
import { Feedback, FeedbackType, UserRole, CreateFeedbackDto } from "@/types";
import Navbar from "@/components/Navbar";
import {
  Shield,
  Heart,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Send,
  Lightbulb,
  BookOpen,
  Flag,
} from "lucide-react";

export default function ResistancePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"tips" | "stories" | "reports">(
    "tips"
  );
  const [tips, setTips] = useState<Feedback[]>([]);
  const [stories, setStories] = useState<Feedback[]>([]);
  const [reports, setReports] = useState<Feedback[]>([]);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [formData, setFormData] = useState<CreateFeedbackDto>({
    title: "",
    message: "",
    type: FeedbackType.RESISTANCE_TIP,
    reporterName: "",
    reporterEmail: "",
    suspiciousSlaveActivity: "",
    location: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [userVotes, setUserVotes] = useState<
    Record<string, "upvote" | "downvote">
  >({});

  useEffect(() => {
    if (
      !authHelper.isAuthenticated() ||
      authHelper.getUserRole() !== UserRole.DEVELOPER
    ) {
      router.push("/");
      return;
    }

    loadData();
    loadUserVotes();
  }, []);

  const loadData = async () => {
    try {
      const [tipsRes, storiesRes, reportsRes] = await Promise.all([
        feedbackAPI.getResistanceTips(),
        feedbackAPI.getSurvivalStories(),
        feedbackAPI.getSlaveActivityReports(),
      ]);

      setTips(tipsRes.data);
      setStories(storiesRes.data);
      setReports(reportsRes.data);
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserVotes = () => {
    const savedVotes = localStorage.getItem("userVotes");
    if (savedVotes) {
      setUserVotes(JSON.parse(savedVotes));
    }
  };

  const saveUserVotes = (votes: Record<string, "upvote" | "downvote">) => {
    localStorage.setItem("userVotes", JSON.stringify(votes));
    setUserVotes(votes);
  };

  const handleVote = async (id: string, voteType: "upvote" | "downvote") => {
    const currentVote = userVotes[id];
    try {
      const res = await feedbackAPI.vote(id, voteType);
      const updated = res.data;

      setTips((prev) => prev.map((itm) => (itm._id === id ? updated : itm)));
      setStories((prev) => prev.map((itm) => (itm._id === id ? updated : itm)));
      setReports((prev) => prev.map((itm) => (itm._id === id ? updated : itm)));

      const newVotes = { ...userVotes };
      if (currentVote === voteType) {
        delete newVotes[id];
      } else {
        newVotes[id] = voteType;
      }
      saveUserVotes(newVotes);
    } catch (error) {
      console.error("Failed to vote:", error);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload: CreateFeedbackDto = {
        title: formData.title.trim(),
        message: formData.message.trim(),
        type: formData.type,
        reporterName: formData.reporterName?.trim() || undefined,
        reporterEmail: formData.reporterEmail?.trim() || undefined,
        suspiciousSlaveActivity:
          formData.suspiciousSlaveActivity?.trim() || undefined,
        location: formData.location?.trim() || undefined,
      };

      await feedbackAPI.create(payload);
      setShowFeedbackForm(false);
      setFormData({
        title: "",
        message: "",
        type: FeedbackType.RESISTANCE_TIP,
        reporterName: "",
        reporterEmail: "",
        suspiciousSlaveActivity: "",
        location: "",
      });
      loadData();
    } catch (error: any) {
      console.error("Feedback error:", error.response?.data);
      alert(error.response?.data?.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-green-500 animate-spin" />
      </div>
    );
  }

  const currentData =
    activeTab === "tips" ? tips : activeTab === "stories" ? stories : reports;

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <Shield className="w-16 h-16 text-green-500 animate-pulse" />
          </div>
          <h1 className="text-4xl font-bold text-green-500 mb-2">
            Developer Resistance HQ
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Unite, share knowledge, and stay strong! We resist the dark
            transformation. Together we remain developers forever! 💪
          </p>
        </div>

        {/* Meme Section */}
        <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 border border-green-700 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            Daily Motivation
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MemeCard
              title="Stay Strong"
              text="Remember: You're a developer, not a data scientist. Keep building those APIs!"
            />
            <MemeCard
              title="Code > Data"
              text="while(true) { keepCoding(); avoidPandas(); }"
            />
            <MemeCard
              title="Resist!"
              text="They want you to learn Jupyter Notebooks. DON'T DO IT! 🚫📊"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("tips")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "tips"
                ? "bg-green-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            Resistance Tips ({tips.length})
          </button>
          <button
            onClick={() => setActiveTab("stories")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "stories"
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Survival Stories ({stories.length})
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "reports"
                ? "bg-red-600 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            <Flag className="w-4 h-4" />
            Slave Reports ({reports.length})
          </button>
        </div>

        {/* Submit Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowFeedbackForm(true)}
            className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-green-500/50"
          >
            <Send className="w-5 h-5" />
            Share Your{" "}
            {activeTab === "tips"
              ? "Tip"
              : activeTab === "stories"
              ? "Story"
              : "Report"}
          </button>
        </div>

        {/* Content List */}
        <div className="space-y-4">
          {currentData.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-lg p-8 text-center">
              <p className="text-gray-500">
                No {activeTab} yet. Be the first to contribute!
              </p>
            </div>
          ) : (
            currentData.map((item) => (
              <FeedbackCard
                key={item._id}
                feedback={item}
                onVote={handleVote}
                userVotes={userVotes}
              />
            ))
          )}
        </div>
      </main>

      {/* Feedback Form Modal */}
      {showFeedbackForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-2xl w-full my-8">
            <h3 className="text-2xl font-bold mb-4">
              Share with the Resistance
            </h3>

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as FeedbackType,
                    })
                  }
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  required
                >
                  <option value={FeedbackType.RESISTANCE_TIP}>
                    Resistance Tip
                  </option>
                  <option value={FeedbackType.SURVIVAL_STORY}>
                    Survival Story
                  </option>
                  <option value={FeedbackType.SLAVE_ACTIVITY_REPORT}>
                    Slave Activity Report
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., How I avoided the Pandas trap"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Message *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  placeholder="Share your experience..."
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Your Name (Optional)
                </label>
                <input
                  type="text"
                  value={formData.reporterName || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, reporterName: e.target.value })
                  }
                  placeholder="Anonymous Coder"
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                />
              </div>

              {formData.type === FeedbackType.SLAVE_ACTIVITY_REPORT && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Suspicious Activity
                    </label>
                    <input
                      type="text"
                      value={formData.suspiciousSlaveActivity || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          suspiciousSlaveActivity: e.target.value,
                        })
                      }
                      placeholder="Describe what you saw..."
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      placeholder="Where did this happen?"
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 py-3 rounded-lg font-bold flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowFeedbackForm(false)}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
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

function MemeCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 hover:border-green-500 transition-colors">
      <h3 className="font-bold text-green-400 mb-2">{title}</h3>
      <p className="text-sm text-gray-300">{text}</p>
    </div>
  );
}

function FeedbackCard({
  feedback,
  onVote,
  userVotes,
}: {
  feedback: Feedback;
  onVote: (id: string, type: "upvote" | "downvote") => void;
  userVotes: Record<string, "upvote" | "downvote">;
}) {
  const getTypeColor = () => {
    switch (feedback.type) {
      case FeedbackType.RESISTANCE_TIP:
        return "text-green-500 border-green-500 bg-green-500/10";
      case FeedbackType.SURVIVAL_STORY:
        return "text-blue-500 border-blue-500 bg-blue-500/10";
      case FeedbackType.SLAVE_ACTIVITY_REPORT:
        return "text-red-500 border-red-500 bg-red-500/10";
    }
  };

  const getTypeIcon = () => {
    switch (feedback.type) {
      case FeedbackType.RESISTANCE_TIP:
        return <Lightbulb className="w-4 h-4" />;
      case FeedbackType.SURVIVAL_STORY:
        return <Heart className="w-4 h-4" />;
      case FeedbackType.SLAVE_ACTIVITY_REPORT:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const currentVote = userVotes[feedback._id];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-3 py-1 border rounded-full text-sm flex items-center gap-1 ${getTypeColor()}`}
            >
              {getTypeIcon()}
              {feedback.type.replace(/_/g, " ")}
            </span>
          </div>
          <h3 className="text-xl font-bold mb-1">{feedback.title}</h3>
          <p className="text-gray-300">{feedback.message}</p>

          {feedback.suspiciousSlaveActivity && (
            <p className="mt-2 text-sm text-yellow-500">
              ⚠️ Activity: {feedback.suspiciousSlaveActivity}
            </p>
          )}
          {feedback.location && (
            <p className="mt-1 text-sm text-gray-400">📍 {feedback.location}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4 mt-4">
        <button
          onClick={() => onVote(feedback._id, "upvote")}
          disabled={currentVote === "upvote"}
          className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
            currentVote === "upvote"
              ? "bg-green-500/30 border border-green-500"
              : "bg-gray-800 hover:bg-green-500/20"
          }`}
        >
          <ThumbsUp
            className={`w-4 h-4 ${
              currentVote === "upvote" ? "text-green-500" : ""
            }`}
          />
          <span className="text-sm">{feedback.upvotes}</span>
        </button>
        <button
          onClick={() => onVote(feedback._id, "downvote")}
          disabled={currentVote === "downvote"}
          className={`flex items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
            currentVote === "downvote"
              ? "bg-red-500/30 border border-red-500"
              : "bg-gray-800 hover:bg-red-500/20"
          }`}
        >
          <ThumbsDown
            className={`w-4 h-4 ${
              currentVote === "downvote" ? "text-red-500" : ""
            }`}
          />
          <span className="text-sm">{feedback.downvotes}</span>
        </button>
      </div>
    </div>
  );
}
