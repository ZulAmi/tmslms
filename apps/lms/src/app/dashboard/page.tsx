'use client';

import React from 'react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Layout,
  Sidebar,
  NavigationGroup,
  SidebarItem,
  TopNav,
  Container,
  Stack,
  Grid,
  Flex,
  StatusBadge,
} from '@tmslms/ui';
import {
  BookOpen,
  Users,
  TrendingUp,
  Award,
  Clock,
  PlayCircle,
  CheckCircle,
  AlertCircle,
  Calendar,
  Bell,
  Search,
  User,
  Settings,
  Home,
  GraduationCap,
  BarChart3,
  MessageSquare,
  HelpCircle,
} from 'lucide-react';

// Mock data for demonstration
const dashboardStats = [
  {
    title: 'Active Courses',
    value: '12',
    change: '+2 this month',
    trend: 'up',
    icon: BookOpen,
    color: 'primary',
  },
  {
    title: 'Completed Courses',
    value: '28',
    change: '+5 this month',
    trend: 'up',
    icon: CheckCircle,
    color: 'success',
  },
  {
    title: 'Learning Hours',
    value: '142',
    change: '+18 this week',
    trend: 'up',
    icon: Clock,
    color: 'warning',
  },
  {
    title: 'Certificates',
    value: '15',
    change: '+3 this month',
    trend: 'up',
    icon: Award,
    color: 'primary',
  },
];

const recentCourses = [
  {
    id: '1',
    title: 'Advanced React Development',
    instructor: 'Sarah Johnson',
    progress: 75,
    status: 'in-progress',
    nextLesson: 'React Hooks Deep Dive',
    dueDate: '2024-08-20',
    thumbnail: '/api/placeholder/400/200',
  },
  {
    id: '2',
    title: 'Data Analytics with Python',
    instructor: 'Dr. Michael Chen',
    progress: 45,
    status: 'in-progress',
    nextLesson: 'Pandas DataFrames',
    dueDate: '2024-08-25',
    thumbnail: '/api/placeholder/400/200',
  },
  {
    id: '3',
    title: 'Digital Marketing Strategy',
    instructor: 'Emma Rodriguez',
    progress: 100,
    status: 'completed',
    nextLesson: 'Course Completed',
    completedDate: '2024-08-10',
    thumbnail: '/api/placeholder/400/200',
  },
];

const upcomingDeadlines = [
  {
    id: '1',
    type: 'assignment',
    title: 'React Project Submission',
    course: 'Advanced React Development',
    dueDate: '2024-08-20',
    priority: 'high',
  },
  {
    id: '2',
    type: 'quiz',
    title: 'Python Fundamentals Quiz',
    course: 'Data Analytics with Python',
    dueDate: '2024-08-22',
    priority: 'medium',
  },
  {
    id: '3',
    type: 'discussion',
    title: 'Marketing Campaign Analysis',
    course: 'Digital Marketing Strategy',
    dueDate: '2024-08-25',
    priority: 'low',
  },
];

const notifications = [
  {
    id: '1',
    type: 'course_update',
    title: 'New lesson available in Advanced React',
    message: 'React Hooks Deep Dive is now available',
    time: '2 hours ago',
    read: false,
  },
  {
    id: '2',
    type: 'achievement',
    title: 'Certificate earned!',
    message: "You've completed Digital Marketing Strategy",
    time: '1 day ago',
    read: false,
  },
  {
    id: '3',
    type: 'reminder',
    title: 'Assignment due soon',
    message: 'React Project due in 2 days',
    time: '3 hours ago',
    read: true,
  },
];

export default function LMSDashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <Layout variant="sidebar">
      {/* Sidebar Navigation */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      >
        <div className="p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h2 className="font-semibold text-sm">TMSLMS</h2>
                <p className="text-xs text-muted-foreground">Learning Hub</p>
              </div>
            )}
          </div>
        </div>

        <NavigationGroup label="Main">
          <SidebarItem
            icon={<Home className="h-4 w-4" />}
            active={true}
            collapsed={sidebarCollapsed}
            tooltip="Dashboard"
          >
            Dashboard
          </SidebarItem>
          <SidebarItem
            icon={<BookOpen className="h-4 w-4" />}
            collapsed={sidebarCollapsed}
            tooltip="My Courses"
          >
            My Courses
          </SidebarItem>
          <SidebarItem
            icon={<Calendar className="h-4 w-4" />}
            collapsed={sidebarCollapsed}
            tooltip="Schedule"
          >
            Schedule
          </SidebarItem>
          <SidebarItem
            icon={<BarChart3 className="h-4 w-4" />}
            collapsed={sidebarCollapsed}
            tooltip="Progress"
          >
            Progress
          </SidebarItem>
        </NavigationGroup>

        <NavigationGroup label="Learning" collapsed={sidebarCollapsed}>
          <SidebarItem
            icon={<Search className="h-4 w-4" />}
            collapsed={sidebarCollapsed}
            tooltip="Browse Courses"
          >
            Browse Courses
          </SidebarItem>
          <SidebarItem
            icon={<Award className="h-4 w-4" />}
            collapsed={sidebarCollapsed}
            tooltip="Certificates"
          >
            Certificates
          </SidebarItem>
          <SidebarItem
            icon={<MessageSquare className="h-4 w-4" />}
            collapsed={sidebarCollapsed}
            tooltip="Discussions"
          >
            Discussions
          </SidebarItem>
        </NavigationGroup>

        <NavigationGroup label="Support" collapsed={sidebarCollapsed}>
          <SidebarItem
            icon={<HelpCircle className="h-4 w-4" />}
            collapsed={sidebarCollapsed}
            tooltip="Help Center"
          >
            Help Center
          </SidebarItem>
          <SidebarItem
            icon={<Settings className="h-4 w-4" />}
            collapsed={sidebarCollapsed}
            tooltip="Settings"
          >
            Settings
          </SidebarItem>
        </NavigationGroup>
      </Sidebar>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Navigation */}
        <TopNav
          logo={
            <div className="flex items-center gap-2 text-xl font-bold">
              Student Portal
            </div>
          }
          actions={
            <Flex align="center" gap="md">
              <Button variant="ghost" size="icon">
                <Search className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-destructive rounded-full text-xs flex items-center justify-center text-destructive-foreground">
                  3
                </span>
              </Button>
              <Button variant="ghost" size="icon">
                <User className="h-4 w-4" />
              </Button>
            </Flex>
          }
        />

        {/* Main Dashboard Content */}
        <main>
          <Container>
            <Stack spacing="lg">
              {/* Welcome Header */}
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                  Welcome back, John! 👋
                </h1>
                <p className="text-muted-foreground">
                  Continue your learning journey. You have 3 courses in progress
                  and 2 upcoming deadlines.
                </p>
              </div>

              {/* Stats Overview */}
              <Grid cols={4} gap="lg">
                {dashboardStats.map((stat, index) => {
                  const Icon = stat.icon;
                  return (
                    <Card key={index} variant="elevated">
                      <CardContent className="p-6">
                        <Flex justify="between" align="center">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">
                              {stat.title}
                            </p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                            <p className="text-xs text-success mt-1">
                              {stat.change}
                            </p>
                          </div>
                          <div className={`p-2 rounded-lg bg-${stat.color}/10`}>
                            <Icon className={`h-5 w-5 text-${stat.color}`} />
                          </div>
                        </Flex>
                      </CardContent>
                    </Card>
                  );
                })}
              </Grid>

              {/* Main Content Grid */}
              <Grid cols={3} gap="lg">
                {/* Recent Courses */}
                <div className="col-span-2">
                  <Card>
                    <CardHeader>
                      <Flex justify="between" align="center">
                        <CardTitle>My Courses</CardTitle>
                        <Button variant="outline" size="sm">
                          View All
                        </Button>
                      </Flex>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {recentCourses.map((course) => (
                        <Card key={course.id} variant="ghost" className="p-4">
                          <Flex gap="md">
                            <div className="h-16 w-24 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                              <PlayCircle className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <Flex
                                justify="between"
                                align="start"
                                className="mb-2"
                              >
                                <div>
                                  <h4 className="font-medium truncate">
                                    {course.title}
                                  </h4>
                                  <p className="text-sm text-muted-foreground">
                                    by {course.instructor}
                                  </p>
                                </div>
                                <StatusBadge
                                  status={
                                    course.status === 'completed'
                                      ? 'completed'
                                      : 'active'
                                  }
                                  size="sm"
                                  className=""
                                />
                              </Flex>
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <div className="flex-1 bg-secondary rounded-full h-2">
                                    <div
                                      className="bg-primary h-2 rounded-full transition-all"
                                      style={{ width: `${course.progress}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {course.progress}%
                                  </span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {course.status === 'completed'
                                    ? `Completed on ${course.completedDate}`
                                    : `Next: ${course.nextLesson}`}
                                </p>
                              </div>
                            </div>
                          </Flex>
                        </Card>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Sidebar Content */}
                <Stack spacing="lg">
                  {/* Upcoming Deadlines */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Upcoming Deadlines
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {upcomingDeadlines.map((deadline) => (
                        <div
                          key={deadline.id}
                          className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="mt-1">
                            {deadline.priority === 'high' ? (
                              <div className="h-2 w-2 bg-destructive rounded-full" />
                            ) : deadline.priority === 'medium' ? (
                              <div className="h-2 w-2 bg-warning rounded-full" />
                            ) : (
                              <div className="h-2 w-2 bg-success rounded-full" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {deadline.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {deadline.course}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Due: {deadline.dueDate}
                            </p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Recent Notifications */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        Recent Updates
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="mt-1">
                            {!notification.read && (
                              <div className="h-2 w-2 bg-primary rounded-full" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {notification.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {notification.message}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </Stack>
              </Grid>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Grid cols={4} gap="md">
                    <Button variant="outline" className="h-16 flex-col gap-2">
                      <Search className="h-5 w-5" />
                      <span className="text-xs">Browse Courses</span>
                    </Button>
                    <Button variant="outline" className="h-16 flex-col gap-2">
                      <Calendar className="h-5 w-5" />
                      <span className="text-xs">View Schedule</span>
                    </Button>
                    <Button variant="outline" className="h-16 flex-col gap-2">
                      <BarChart3 className="h-5 w-5" />
                      <span className="text-xs">Progress Report</span>
                    </Button>
                    <Button variant="outline" className="h-16 flex-col gap-2">
                      <MessageSquare className="h-5 w-5" />
                      <span className="text-xs">Join Discussion</span>
                    </Button>
                  </Grid>
                </CardContent>
              </Card>
            </Stack>
          </Container>
        </main>
      </div>
    </Layout>
  );
}
function useState(arg0: boolean): [any, any] {
  throw new Error('Function not implemented.');
}
