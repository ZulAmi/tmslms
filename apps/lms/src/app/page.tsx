import React from "react";
import { auth } from "@repo/auth";
import { Button } from "@repo/ui";

export default async function HomePage() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-blue-50 flex flex-col items-center justify-center">
      <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-blue-900 mb-4">
            Learning Management System
          </h1>
          <p className="text-gray-600 mb-6">
            Welcome to your learning platform
          </p>
          
          {session ? (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">Welcome back, {session.user?.name}!</p>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800">Please sign in to access your courses</p>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">
                Features
              </h2>
              <ul className="text-blue-700 space-y-1 text-left">
                <li>• Course Management</li>
                <li>• Student Progress Tracking</li>
                <li>• Interactive Learning Materials</li>
                <li>• Assessment Tools</li>
              </ul>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-green-900 mb-2">
                Quick Stats
              </h2>
              <div className="text-green-700 space-y-1">
                <p>Active Courses: 15</p>
                <p>Enrolled Students: 234</p>
                <p>Completion Rate: 87%</p>
              </div>
            </div>
            <div className="flex space-x-4 justify-center mt-6">
              <Button>Get Started</Button>
              {!session && <Button variant="outline">Sign In</Button>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
