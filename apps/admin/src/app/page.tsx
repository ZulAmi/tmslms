'use client';

import { Button, Card, Badge, Container, Grid, Flex, Stack } from '@tmslms/ui';

export default function AdminDashboard() {
  // Mock data for Admin
  const systemStats = [
    { label: 'Total Users', value: '12,847', change: '+18%', trend: 'up' },
    { label: 'Active Sessions', value: '1,456', change: '+5.2%', trend: 'up' },
    { label: 'System Uptime', value: '99.8%', change: '+0.1%', trend: 'up' },
    { label: 'Data Storage', value: '847 GB', change: '+12%', trend: 'up' },
  ];

  const systemHealth = [
    {
      component: 'Web Server',
      status: 'healthy',
      uptime: '99.9%',
      response: '120ms',
    },
    {
      component: 'Database',
      status: 'healthy',
      uptime: '99.8%',
      response: '45ms',
    },
    {
      component: 'File Storage',
      status: 'warning',
      uptime: '98.2%',
      response: '230ms',
    },
    {
      component: 'Cache Server',
      status: 'healthy',
      uptime: '99.9%',
      response: '12ms',
    },
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'User registration',
      user: 'john.doe@company.com',
      time: '5 min ago',
      type: 'user',
    },
    {
      id: 2,
      action: 'Course published',
      course: 'Advanced React Training',
      time: '15 min ago',
      type: 'content',
    },
    {
      id: 3,
      action: 'System backup completed',
      details: 'Full database backup',
      time: '1 hour ago',
      type: 'system',
    },
    {
      id: 4,
      action: 'Security scan completed',
      result: 'No issues found',
      time: '2 hours ago',
      type: 'security',
    },
  ];

  const pendingTasks = [
    {
      id: 1,
      task: 'Review user permissions',
      priority: 'high',
      assignee: 'Admin Team',
      due: 'Today',
    },
    {
      id: 2,
      task: 'Update system certificates',
      priority: 'medium',
      assignee: 'DevOps',
      due: 'Tomorrow',
    },
    {
      id: 3,
      task: 'Database maintenance',
      priority: 'low',
      assignee: 'DBA Team',
      due: 'Next Week',
    },
    {
      id: 4,
      task: 'Security audit report',
      priority: 'high',
      assignee: 'Security Team',
      due: 'Today',
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <Container size="xl" className="space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Administrative Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              System overview and management controls
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline">System Settings</Button>
            <Button variant="destructive">Emergency Mode</Button>
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-gradient-to-r from-info/10 via-info/5 to-transparent border border-info/20 rounded-lg p-6">
          <Flex align="center" gap={3}>
            <div className="h-8 w-8 bg-info rounded-full flex items-center justify-center">
              <svg
                className="h-5 w-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-info">
                Admin Interface Complete! 🛠️
              </h3>
              <p className="text-info/80">
                Professional admin dashboard with system monitoring and
                management tools.
              </p>
            </div>
          </Flex>
        </div>

        {/* System Stats */}
        <Grid cols={4} gap={6}>
          {systemStats.map((stat, index) => (
            <Card key={index} variant="elevated" className="p-6">
              <Flex justify="between" align="start">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-foreground mt-2">
                    {stat.value}
                  </p>
                </div>
                <Badge
                  variant={stat.trend === 'up' ? 'success' : 'warning'}
                  size="sm"
                >
                  {stat.change}
                </Badge>
              </Flex>
            </Card>
          ))}
        </Grid>

        <Grid cols={3} gap={8}>
          {/* System Health */}
          <div className="col-span-2 space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">
                System Health Monitor
              </h2>

              <div className="space-y-4">
                {systemHealth.map((component, index) => (
                  <div
                    key={index}
                    className="border border-border rounded-lg p-4"
                  >
                    <Flex justify="between" align="center">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            component.status === 'healthy'
                              ? 'bg-success'
                              : component.status === 'warning'
                                ? 'bg-warning'
                                : 'bg-destructive'
                          }`}
                        />
                        <h3 className="font-medium">{component.component}</h3>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>⏱️ {component.uptime}</span>
                        <span>⚡ {component.response}</span>
                        <Badge
                          variant={
                            component.status === 'healthy'
                              ? 'success'
                              : 'warning'
                          }
                          size="sm"
                        >
                          {component.status}
                        </Badge>
                      </div>
                    </Flex>
                  </div>
                ))}
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-6">
                Recent System Activity
              </h2>

              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 hover:bg-muted/20 rounded-lg"
                  >
                    <div
                      className={`mt-1 h-2 w-2 rounded-full ${
                        activity.type === 'user'
                          ? 'bg-primary'
                          : activity.type === 'content'
                            ? 'bg-success'
                            : activity.type === 'system'
                              ? 'bg-info'
                              : 'bg-warning'
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.action}:</span>{' '}
                        <span className="text-muted-foreground">
                          {activity.user ||
                            activity.course ||
                            activity.details ||
                            activity.result}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Quick Admin Actions */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <Stack gap={3}>
                <Button className="w-full justify-start">
                  👥 User Management
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  🏢 Organizations
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  📊 Analytics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  🔒 Security
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  💾 Backup
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  🔧 Maintenance
                </Button>
              </Stack>
            </Card>

            {/* Pending Tasks */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Pending Tasks</h2>
              <div className="space-y-3">
                {pendingTasks.map((task) => (
                  <div
                    key={task.id}
                    className="border border-border rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-sm font-medium">{task.task}</h3>
                      <Badge
                        variant={
                          task.priority === 'high'
                            ? 'destructive'
                            : task.priority === 'medium'
                              ? 'warning'
                              : 'secondary'
                        }
                        size="sm"
                      >
                        {task.priority}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>👤 {task.assignee}</p>
                      <p>📅 {task.due}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* System Resources */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">System Resources</h2>
              <div className="space-y-4">
                <div>
                  <Flex justify="between" className="mb-2">
                    <span className="text-sm font-medium">CPU Usage</span>
                    <span className="text-sm">23%</span>
                  </Flex>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full"
                      style={{ width: '23%' }}
                    />
                  </div>
                </div>
                <div>
                  <Flex justify="between" className="mb-2">
                    <span className="text-sm font-medium">Memory</span>
                    <span className="text-sm">68%</span>
                  </Flex>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-warning h-2 rounded-full"
                      style={{ width: '68%' }}
                    />
                  </div>
                </div>
                <div>
                  <Flex justify="between" className="mb-2">
                    <span className="text-sm font-medium">Storage</span>
                    <span className="text-sm">45%</span>
                  </Flex>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-success h-2 rounded-full"
                      style={{ width: '45%' }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </Grid>
      </Container>
    </div>
  );
}
