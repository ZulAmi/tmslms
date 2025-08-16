'use client';

import React, { useState } from 'react';
import { Button } from './button';
import { Card } from './card';
import { Badge } from './badge';
import { Input } from './input';
import { Flex, Stack, Container } from './layout';
import { cn } from '../lib/utils';

// Student Dashboard with Learning Analytics
export function StudentDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');

  const stats = {
    coursesInProgress: 3,
    coursesCompleted: 8,
    hoursThisWeek: 12,
    streak: 7,
    certificates: 5,
    avgScore: 87,
  };

  const currentCourses = [
    {
      id: '1',
      title: 'Advanced React Development',
      progress: 67,
      nextLesson: 'React Performance Optimization',
      dueDate: 'Tomorrow',
      instructor: 'Sarah Johnson',
    },
    {
      id: '2',
      title: 'Full-Stack TypeScript',
      progress: 34,
      nextLesson: 'Database Design with Prisma',
      dueDate: 'In 3 days',
      instructor: 'Mike Chen',
    },
    {
      id: '3',
      title: 'UI/UX Design Fundamentals',
      progress: 89,
      nextLesson: 'Final Project Review',
      dueDate: 'Next week',
      instructor: 'Emma Wilson',
    },
  ];

  const recentActivity = [
    {
      type: 'completed',
      item: 'JavaScript Async/Await Quiz',
      score: 92,
      time: '2 hours ago',
    },
    { type: 'started', item: 'React Hooks Deep Dive', time: '1 day ago' },
    {
      type: 'certificate',
      item: 'Web Development Fundamentals',
      time: '3 days ago',
    },
    {
      type: 'completed',
      item: 'CSS Grid Layout Assignment',
      score: 88,
      time: '4 days ago',
    },
  ];

  return (
    <Container size="xl" className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome back, Alex!</h1>
        <p className="text-muted-foreground">
          Ready to continue your learning journey? You're doing great! 🚀
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">
            {stats.coursesInProgress}
          </div>
          <div className="text-sm text-muted-foreground">In Progress</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-success">
            {stats.coursesCompleted}
          </div>
          <div className="text-sm text-muted-foreground">Completed</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {stats.hoursThisWeek}h
          </div>
          <div className="text-sm text-muted-foreground">This Week</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {stats.streak}🔥
          </div>
          <div className="text-sm text-muted-foreground">Day Streak</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.certificates}🏆
          </div>
          <div className="text-sm text-muted-foreground">Certificates</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {stats.avgScore}%
          </div>
          <div className="text-sm text-muted-foreground">Avg Score</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Current Courses */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Continue Learning</h2>
            <Button variant="outline" size="sm">
              View All Courses
            </Button>
          </div>

          <div className="space-y-4">
            {currentCourses.map((course) => (
              <Card key={course.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold mb-1">{course.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      by {course.instructor}
                    </p>
                  </div>
                  <Badge variant="outline">{course.progress}% complete</Badge>
                </div>

                <div className="w-full bg-muted rounded-full h-2 mb-4">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">
                      Next: {course.nextLesson}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Due: {course.dueDate}
                    </p>
                  </div>
                  <Button size="sm">Continue</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div
                    className={cn(
                      'h-2 w-2 rounded-full mt-2',
                      activity.type === 'completed'
                        ? 'bg-success'
                        : activity.type === 'certificate'
                          ? 'bg-yellow-500'
                          : 'bg-primary'
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.item}</p>
                    {activity.score && (
                      <p className="text-xs text-success">
                        Score: {activity.score}%
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <Stack spacing="sm">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                📚 Browse Catalog
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                📊 View Progress
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                🏆 Certificates
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                ⚙️ Settings
              </Button>
            </Stack>
          </Card>

          {/* Upcoming Deadlines */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Upcoming Deadlines</h3>
            <div className="space-y-3">
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm font-medium text-orange-900">
                  Assignment Due Tomorrow
                </p>
                <p className="text-xs text-orange-700">
                  React Performance Quiz
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900">
                  Project Due in 3 days
                </p>
                <p className="text-xs text-blue-700">TypeScript API Design</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Container>
  );
}

// Instructor Dashboard with Course Management
export function InstructorDashboard() {
  const [selectedCourse, setSelectedCourse] = useState('all');

  const stats = {
    activeCourses: 5,
    totalStudents: 147,
    avgRating: 4.8,
    completionRate: 89,
    hoursContent: 45,
    revenue: 12450,
  };

  const courses = [
    {
      id: '1',
      title: 'Advanced React Development',
      students: 42,
      rating: 4.9,
      completion: 76,
      revenue: 4200,
      status: 'active',
      lastUpdated: '2 days ago',
    },
    {
      id: '2',
      title: 'Full-Stack TypeScript',
      students: 38,
      rating: 4.8,
      completion: 82,
      revenue: 3800,
      status: 'active',
      lastUpdated: '1 week ago',
    },
    {
      id: '3',
      title: 'JavaScript Fundamentals',
      students: 67,
      rating: 4.7,
      completion: 91,
      revenue: 4450,
      status: 'active',
      lastUpdated: '3 days ago',
    },
  ];

  const recentActivity = [
    {
      type: 'review',
      content: 'New 5-star review on React course',
      time: '2 hours ago',
    },
    {
      type: 'question',
      content: 'Student question on TypeScript generics',
      time: '4 hours ago',
    },
    {
      type: 'enrollment',
      content: '5 new students enrolled in React course',
      time: '1 day ago',
    },
    {
      type: 'completion',
      content: 'Student completed JavaScript course',
      time: '2 days ago',
    },
  ];

  return (
    <Container size="xl" className="py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Instructor Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your courses and track student progress
          </p>
        </div>
        <Button>Create New Course</Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">
            {stats.activeCourses}
          </div>
          <div className="text-sm text-muted-foreground">Active Courses</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {stats.totalStudents}
          </div>
          <div className="text-sm text-muted-foreground">Total Students</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.avgRating}⭐
          </div>
          <div className="text-sm text-muted-foreground">Avg Rating</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-success">
            {stats.completionRate}%
          </div>
          <div className="text-sm text-muted-foreground">Completion</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {stats.hoursContent}h
          </div>
          <div className="text-sm text-muted-foreground">Content Hours</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            ${stats.revenue.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Revenue</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Course Management */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">Your Courses</h2>
            <select
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
            >
              <option value="all">All Courses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div className="space-y-4">
            {courses.map((course) => (
              <Card key={course.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold mb-1">{course.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{course.students} students</span>
                      <span>{course.rating}⭐</span>
                      <span>{course.completion}% completion</span>
                    </div>
                  </div>
                  <Badge variant="success">Active</Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {course.students}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Students
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">
                      ${course.revenue}
                    </div>
                    <div className="text-xs text-muted-foreground">Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-orange-600">
                      {course.completion}%
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Completion
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Updated {course.lastUpdated}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Analytics
                    </Button>
                    <Button size="sm">Manage</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div
                    className={cn(
                      'h-2 w-2 rounded-full mt-2',
                      activity.type === 'review'
                        ? 'bg-yellow-500'
                        : activity.type === 'question'
                          ? 'bg-blue-500'
                          : activity.type === 'enrollment'
                            ? 'bg-success'
                            : 'bg-primary'
                    )}
                  />
                  <div className="flex-1">
                    <p className="text-sm">{activity.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <Stack spacing="sm">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                📝 Create Course
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                📊 View Analytics
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                💬 Q&A Forum
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                💰 Revenue Report
              </Button>
            </Stack>
          </Card>

          {/* Pending Tasks */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Pending Tasks</h3>
            <div className="space-y-3">
              <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                <p className="text-sm font-medium text-orange-900">
                  Review Assignments
                </p>
                <p className="text-xs text-orange-700">5 submissions pending</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900">
                  Answer Questions
                </p>
                <p className="text-xs text-blue-700">3 student questions</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm font-medium text-green-900">
                  Update Content
                </p>
                <p className="text-xs text-green-700">React course feedback</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </Container>
  );
}

// Admin Dashboard with System Overview
export function AdminDashboard() {
  const [timeframe, setTimeframe] = useState('month');

  const systemStats = {
    totalUsers: 12450,
    activeUsers: 8930,
    coursesTotal: 234,
    completionRate: 78,
    revenue: 245750,
    supportTickets: 23,
  };

  const userGrowth = [
    { month: 'Jan', users: 8500 },
    { month: 'Feb', users: 9200 },
    { month: 'Mar', users: 9800 },
    { month: 'Apr', users: 10500 },
    { month: 'May', users: 11200 },
    { month: 'Jun', users: 12450 },
  ];

  const topCourses = [
    { title: 'React Fundamentals', students: 1247, revenue: 24940 },
    { title: 'Python for Beginners', students: 1156, revenue: 23120 },
    { title: 'Web Design Basics', students: 1098, revenue: 21960 },
    { title: 'JavaScript Advanced', students: 987, revenue: 19740 },
    { title: 'Database Design', students: 892, revenue: 17840 },
  ];

  const recentActivity = [
    {
      type: 'user',
      content: 'New user registration: Sarah Johnson',
      time: '5 min ago',
    },
    {
      type: 'course',
      content: 'Course published: Advanced CSS Grid',
      time: '1 hour ago',
    },
    {
      type: 'payment',
      content: 'Payment processed: $299',
      time: '2 hours ago',
    },
    {
      type: 'support',
      content: 'Support ticket resolved: #1234',
      time: '3 hours ago',
    },
  ];

  return (
    <Container size="xl" className="py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">System Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor platform performance and user activity
          </p>
        </div>
        <div className="flex gap-2">
          <select
            className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
          <Button variant="outline">Export Report</Button>
        </div>
      </div>

      {/* System Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">
            {systemStats.totalUsers.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Total Users</div>
          <div className="text-xs text-success">+12% from last month</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-success">
            {systemStats.activeUsers.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Active Users</div>
          <div className="text-xs text-success">+8% from last month</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {systemStats.coursesTotal}
          </div>
          <div className="text-sm text-muted-foreground">Total Courses</div>
          <div className="text-xs text-success">+5 this month</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">
            {systemStats.completionRate}%
          </div>
          <div className="text-sm text-muted-foreground">Completion Rate</div>
          <div className="text-xs text-success">+3% from last month</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            ${systemStats.revenue.toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">Revenue</div>
          <div className="text-xs text-success">+18% from last month</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {systemStats.supportTickets}
          </div>
          <div className="text-sm text-muted-foreground">Open Tickets</div>
          <div className="text-xs text-red-600">+3 today</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* User Growth Chart */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">User Growth</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {userGrowth.map((data, index) => (
                <div
                  key={data.month}
                  className="flex flex-col items-center flex-1"
                >
                  <div
                    className="w-full bg-primary rounded-t-md transition-all hover:bg-primary/80"
                    style={{ height: `${(data.users / 12450) * 200}px` }}
                    title={`${data.month}: ${data.users.toLocaleString()} users`}
                  />
                  <div className="text-xs mt-2">{data.month}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Courses */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Top Performing Courses
            </h3>
            <div className="space-y-3">
              {topCourses.map((course, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                >
                  <div>
                    <p className="font-medium">{course.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {course.students} students
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      ${course.revenue.toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* System Health */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">System Health</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Server Status</span>
                <Badge variant="success">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Database</span>
                <Badge variant="success">Healthy</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">CDN</span>
                <Badge variant="success">Fast</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">API Response</span>
                <Badge variant="success">&lt; 100ms</Badge>
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div
                    className={cn(
                      'h-2 w-2 rounded-full mt-2',
                      activity.type === 'user'
                        ? 'bg-blue-500'
                        : activity.type === 'course'
                          ? 'bg-purple-500'
                          : activity.type === 'payment'
                            ? 'bg-green-500'
                            : 'bg-orange-500'
                    )}
                  />
                  <div className="flex-1">
                    <p className="text-sm">{activity.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <Stack spacing="sm">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                👥 Manage Users
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                📚 Review Courses
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                💰 Financial Reports
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                🎫 Support Tickets
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                ⚙️ System Settings
              </Button>
            </Stack>
          </Card>
        </div>
      </div>
    </Container>
  );
}
