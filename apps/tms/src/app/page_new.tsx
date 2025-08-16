'use client';

import { Button, Card, Badge, Container, Grid, Flex, Stack } from '@tmslms/ui';

export default function TMSDashboard() {
  // Mock data for TMS
  const stats = [
    {
      label: 'Active Programs',
      value: '24',
      change: '+15% this month',
      trend: 'up',
      icon: '📚',
    },
    {
      label: 'Total Participants',
      value: '1,847',
      change: '+23% enrollment rate',
      trend: 'up',
      icon: '👥',
    },
    {
      label: 'This Month Sessions',
      value: '68',
      change: '12 completed today',
      trend: 'up',
      icon: '🎯',
    },
    {
      label: 'Success Rate',
      value: '94.2%',
      change: '+2.1% improvement',
      trend: 'up',
      icon: '🏆',
    },
  ];

  const upcomingTraining = [
    {
      id: 1,
      title: 'Advanced Leadership Bootcamp',
      date: 'Aug 18, 09:00 AM',
      participants: 28,
      maxParticipants: 35,
      instructor: 'Dr. Sarah Mitchell',
      type: 'Intensive Workshop',
      status: 'confirmed',
      duration: '3 days',
      completion: 80,
    },
    {
      id: 2,
      title: 'Digital Transformation Masterclass',
      date: 'Aug 19, 02:00 PM',
      participants: 45,
      maxParticipants: 50,
      instructor: 'Prof. James Chen',
      type: 'Hybrid Session',
      status: 'confirmed',
      duration: '2 days',
      completion: 90,
    },
    {
      id: 3,
      title: 'Agile Project Management',
      date: 'Aug 20, 10:00 AM',
      participants: 22,
      maxParticipants: 30,
      instructor: 'Maria Rodriguez',
      type: 'Interactive Workshop',
      status: 'filling',
      duration: '5 days',
      completion: 73,
    },
    {
      id: 4,
      title: 'AI & Machine Learning Fundamentals',
      date: 'Aug 22, 09:30 AM',
      participants: 38,
      maxParticipants: 40,
      instructor: 'Dr. Alex Kim',
      type: 'Technical Deep-dive',
      status: 'confirmed',
      duration: '4 days',
      completion: 95,
    },
  ];

  const recentActivities = [
    {
      id: 1,
      action: 'Program Completed',
      item: 'Cloud Architecture Certification',
      time: '1 hour ago',
      type: 'completion',
      participants: 24,
    },
    {
      id: 2,
      action: 'New Enrollment Wave',
      item: 'Leadership Excellence Program',
      time: '2 hours ago',
      type: 'enrollment',
      participants: 15,
    },
    {
      id: 3,
      action: 'Session Started',
      item: 'Data Analytics Workshop',
      time: '3 hours ago',
      type: 'session',
      participants: 32,
    },
    {
      id: 4,
      action: 'Certificates Issued',
      item: 'Digital Marketing Mastery',
      time: '5 hours ago',
      type: 'certificate',
      participants: 28,
    },
    {
      id: 5,
      action: 'Program Created',
      item: 'Advanced React Development',
      time: '1 day ago',
      type: 'creation',
      participants: 0,
    },
  ];

  const instructorPerformance = [
    {
      name: 'Dr. Sarah Mitchell',
      programs: 8,
      rating: 4.9,
      participants: 245,
      specialization: 'Leadership',
    },
    {
      name: 'Prof. James Chen',
      programs: 6,
      rating: 4.8,
      participants: 198,
      specialization: 'Technology',
    },
    {
      name: 'Maria Rodriguez',
      programs: 12,
      rating: 4.7,
      participants: 324,
      specialization: 'Management',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      <Container size="xl" className="py-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Training Command Center 🚀
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Orchestrating excellence in corporate learning and development
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex items-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              Analytics Hub
            </Button>
            <Button className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
              Launch New Program
            </Button>
          </div>
        </div>

        {/* Performance Stats */}
        <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{stat.icon}</span>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.label}
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-emerald-600 font-medium">
                    {stat.change}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full flex items-center justify-center group-hover:from-emerald-200 group-hover:to-teal-200 transition-all duration-300">
                  <svg
                    className="w-6 h-6 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
              </div>
            </Card>
          ))}
        </Grid>

        {/* Main Dashboard Grid */}
        <Grid className="grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Training Sessions - Large Column */}
          <div className="lg:col-span-3">
            <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    Active Training Programs
                  </h2>
                  <p className="text-gray-600 mt-1">
                    Manage and monitor ongoing training sessions
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="text-emerald-600 hover:text-emerald-700"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                      />
                    </svg>
                    Filter
                  </Button>
                  <Button
                    variant="ghost"
                    className="text-emerald-600 hover:text-emerald-700"
                  >
                    View All
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {upcomingTraining.map((training) => (
                  <div
                    key={training.id}
                    className="p-5 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300 group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg group-hover:text-emerald-600 transition-colors">
                            {training.title}
                          </h3>
                          <Badge
                            variant={
                              training.status === 'confirmed'
                                ? 'success'
                                : training.status === 'filling'
                                  ? 'warning'
                                  : 'default'
                            }
                          >
                            {training.status}
                          </Badge>
                        </div>
                        <p className="text-gray-600 text-sm mb-2">
                          Led by {training.instructor}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {training.date}
                          </span>
                          <span className="flex items-center gap-1">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                              />
                            </svg>
                            {training.participants}/{training.maxParticipants}{' '}
                            enrolled
                          </span>
                          <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                            {training.duration}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 mb-2">
                          Enrollment Progress
                        </div>
                        <div className="w-24 bg-gray-200 rounded-full h-2 mb-2">
                          <div
                            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${training.completion}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {training.completion}% full
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                      <Badge variant="outline" className="text-xs">
                        {training.type}
                      </Badge>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-gray-600 hover:text-gray-800"
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-emerald-500 to-teal-600"
                        >
                          Manage
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Real-time Activity Feed */}
            <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Live Activity Feed
              </h3>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-100 hover:shadow-sm transition-all duration-300"
                  >
                    <div
                      className={`mt-1 w-10 h-10 rounded-full flex items-center justify-center ${
                        activity.type === 'completion'
                          ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                          : activity.type === 'enrollment'
                            ? 'bg-gradient-to-r from-blue-400 to-cyan-500'
                            : activity.type === 'session'
                              ? 'bg-gradient-to-r from-purple-400 to-indigo-500'
                              : activity.type === 'certificate'
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500'
                                : 'bg-gradient-to-r from-emerald-400 to-teal-500'
                      }`}
                    >
                      <svg
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        {activity.type === 'completion' ? (
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        ) : activity.type === 'enrollment' ? (
                          <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6z" />
                        ) : (
                          <path
                            fillRule="evenodd"
                            d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                            clipRule="evenodd"
                          />
                        )}
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {activity.action}
                      </p>
                      <p className="text-gray-600 text-sm">{activity.item}</p>
                      <div className="flex justify-between items-center mt-2">
                        <p className="text-xs text-gray-500">{activity.time}</p>
                        <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                          {activity.participants} participants
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4"
                    />
                  </svg>
                  Schedule Training
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                  Manage Participants
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Generate Reports
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left"
                >
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Performance Analytics
                </Button>
              </div>
            </Card>
          </div>
        </Grid>

        {/* Instructor Performance Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Top Performing Instructors
            </h2>
            <Button
              variant="ghost"
              className="text-emerald-600 hover:text-emerald-700"
            >
              View All Instructors
            </Button>
          </div>
          <Grid className="grid-cols-1 md:grid-cols-3 gap-6">
            {instructorPerformance.map((instructor, index) => (
              <Card
                key={index}
                className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl text-white font-bold">
                      {instructor.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-lg group-hover:text-emerald-600 transition-colors">
                    {instructor.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {instructor.specialization} Expert
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-600">
                        {instructor.programs}
                      </p>
                      <p className="text-xs text-gray-600">Programs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-600">
                        {instructor.participants}
                      </p>
                      <p className="text-xs text-gray-600">Participants</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-center gap-1 mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(instructor.rating) ? 'text-yellow-500' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 ml-1">
                      {instructor.rating}
                    </span>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="group-hover:bg-emerald-50 group-hover:text-emerald-600 group-hover:border-emerald-300"
                  >
                    View Profile
                  </Button>
                </div>
              </Card>
            ))}
          </Grid>
        </div>
      </Container>
    </div>
  );
}
