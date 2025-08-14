import React from "react";

export default function AdminHomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 mb-6">
            System Administration Portal
          </p>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">
                System Status
              </h2>
              <p className="text-blue-700">All systems operational</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-green-900 mb-2">
                Applications
              </h2>
              <ul className="text-green-700 space-y-1">
                <li>• LMS: Running on port 3010</li>
                <li>• TMS: Running on port 3011</li>
                <li>• Admin: Running on port 3012</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
