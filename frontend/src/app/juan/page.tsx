"use client";

import { useState } from "react";
import JuanDashboard from "./JuanDashboard";
import SlaveDashboard from "../slave/page";
import Navbar from "@/components/Navbar";

export default function JuanPage() {
  const [activeTab, setActiveTab] = useState<"dashboard" | "capture">(
    "dashboard"
  );

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      {/* Tabs Header */}
      <div className="max-w-7xl mx-auto px-4 mt-6">
        <div className="flex gap-4 border-b border-gray-800">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === "dashboard"
                ? "text-purple-500 border-b-2 border-purple-500"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            🏆 Command Center
          </button>

          <button
            onClick={() => setActiveTab("capture")}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === "capture"
                ? "text-purple-500 border-b-2 border-purple-500"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            🎯 Capture Interface
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === "dashboard" ? <JuanDashboard /> : <SlaveDashboard />}
      </div>
    </div>
  );
}
