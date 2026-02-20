"use client";

import { useAuthStore } from "@/store/authStore";

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Welcome, {user?.name}!</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Stats Cards */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm">Total Solved</div>
          <div className="text-3xl font-bold">0</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm">Easy</div>
          <div className="text-3xl font-bold text-green-600">0</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm">Medium</div>
          <div className="text-3xl font-bold text-yellow-600">0</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-gray-600 text-sm">Hard</div>
          <div className="text-3xl font-bold text-red-600">0</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Your Problems</h2>
        <p className="text-gray-600">
          No problems yet. Add your first problem to get started!
        </p>
      </div>
    </div>
  );
}
