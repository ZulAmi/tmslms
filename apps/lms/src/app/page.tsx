'use client';

import {
  Button,
  Card,
  Badge,
  Container,
  Grid,
  Flex,
  Stack,
  Input,
} from '@tmslms/ui';

export default function LMSDashboard() {
  // Mock data for LMS
  const userStats = [
    {
      label: 'Courses Enrolled',
      value: '8',
      change: '+2 this month',
      trend: 'up',
    },
    {
      label: 'Completed',
      value: '5',
      change: '62.5% completion rate',
      trend: 'up',
    },
    {
      label: 'Learning Hours',
      value: '84',
      change: '+12 hours this week',
      trend: 'up',
    },
    { label: 'Certificates', value: '3', change: '2 pending', trend: 'stable' },
  ];

  const currentCourses = [
    {
      id: 1,
      title: 'Advanced React Development',
      progress: 75,
      instructor: 'Sarah Johnson',
      nextSession: 'Aug 18, 10:00 AM',
      type: 'Live Session',
      difficulty: 'Intermediate',
    },
    {
      id: 2,
      title: 'UI/UX Design Principles',
      progress: 45,
      instructor: 'Michael Chen',
      nextSession: 'Aug 19, 2:00 PM',
      type: 'Workshop',
      difficulty: 'Beginner',
    },
    {
      id: 3,
      title: 'Data Science with Python',
      progress: 30,
      instructor: 'Dr. Emily Rodriguez',
      nextSession: 'Aug 20, 9:00 AM',
      type: 'Online Lab',
      difficulty: 'Advanced',
    },
  ];

  const recommendedCourses = [
    {
      id: 1,
      title: 'Machine Learning Fundamentals',
      instructor: 'Prof. David Kim',
      rating: 4.8,
      students: 2547,
      duration: '8 weeks',
      price: '$99',
    },
    {
      id: 2,
      title: 'Digital Marketing Strategy',
      instructor: 'Lisa Wang',
      rating: 4.9,
      students: 1823,
      duration: '6 weeks',
      price: '$79',
    },
    {
      id: 3,
      title: 'Cloud Computing Essentials',
      instructor: 'James Miller',
      rating: 4.7,
      students: 3201,
      duration: '10 weeks',
      price: '$129',
    },
  ];

  const recentAchievements = [
    {
      id: 1,
      achievement: 'Completed React Fundamentals',
      date: '2 days ago',
      points: 150,
    },
    {
      id: 2,
      achievement: 'Perfect Quiz Score',
      date: '1 week ago',
      points: 100,
    },
    {
      id: 3,
      achievement: '7-Day Learning Streak',
      date: '3 days ago',
      points: 75,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Container size="xl" className="py-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Welcome back, Alex! 👋
            </h1>
            <p className="text-lg text-gray-600 mt-2">
              Ready to continue your learning journey today?
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
                  d="M15 17h5l-5 5-5-5h5V4h0z"
                />
              </svg>
              Download App
            </Button>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              Browse Courses
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {userStats.map((stat, index) => (
            <Card
              key={index}
              className="p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    stat.trend === 'up' ? 'bg-green-100' : 'bg-blue-100'
                  }`}
                >
                  <svg
                    className={`w-6 h-6 ${stat.trend === 'up' ? 'text-green-600' : 'text-blue-600'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d={
                        stat.trend === 'up'
                          ? 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                          : 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'
                      }
                    />
                  </svg>
                </div>
              </div>
            </Card>
          ))}
        </Grid>

        {/* Main Content Grid */}
        <Grid className="grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Current Courses */}
          <div className="lg:col-span-2">
            <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  Continue Learning
                </h2>
                <Button
                  variant="ghost"
                  className="text-blue-600 hover:text-blue-700"
                >
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {currentCourses.map((course) => (
                  <div
                    key={course.id}
                    className="p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-100 hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {course.title}
                        </h3>
                        <p className="text-gray-600 text-sm mt-1">
                          by {course.instructor}
                        </p>
                      </div>
                      <Badge
                        variant={
                          course.difficulty === 'Beginner'
                            ? 'success'
                            : course.difficulty === 'Intermediate'
                              ? 'warning'
                              : 'default'
                        }
                      >
                        {course.difficulty}
                      </Badge>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{course.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${course.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">
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
                          {course.nextSession}
                        </span>
                        <span className="text-xs text-blue-600 mt-1 block">
                          {course.type}
                        </span>
                      </div>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-blue-500 to-purple-600"
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Achievements */}
            <Card className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Recent Achievements
              </h3>
              <div className="space-y-3">
                {recentAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-100"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732L14.146 12.8l-1.179 4.456a1 1 0 01-1.934 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732L9.854 7.2l1.179-4.456A1 1 0 0112 2z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {achievement.achievement}
                      </p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="text-xs text-gray-600">
                          {achievement.date}
                        </p>
                        <span className="text-xs font-medium text-orange-600">
                          +{achievement.points} pts
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
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  Browse Library
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  My Certificates
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
                      d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m0 0v8a2 2 0 01-2 2H10a2 2 0 01-2-2V7m0 0H4a2 2 0 00-2 2v10a2 2 0 002 2h2"
                    />
                  </svg>
                  Study Schedule
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  Discussion Forums
                </Button>
              </div>
            </Card>
          </div>
        </Grid>

        {/* Recommended Courses */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Recommended for You
            </h2>
            <Button
              variant="ghost"
              className="text-blue-600 hover:text-blue-700"
            >
              View All Courses
            </Button>
          </div>
          <Grid className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedCourses.map((course) => (
              <Card
                key={course.id}
                className="p-6 bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">
                    by {course.instructor}
                  </p>
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <svg
                      className="w-4 h-4 text-yellow-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>{course.rating}</span>
                  </div>
                  <div>{course.students.toLocaleString()} students</div>
                  <div>{course.duration}</div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-2xl font-bold text-gray-900">
                    {course.price}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-300"
                  >
                    Enroll Now
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
