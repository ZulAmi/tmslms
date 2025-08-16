'use client';

import React, { useState, useContext, createContext } from 'react';
import { Button } from './button';
import { Card } from './card';
import { Badge } from './badge';
import { Input } from './input';
import { Flex, Stack, Container } from './layout';
import { cn } from '../lib/utils';

// User Experience Context for managing complex interactions
interface UXContextType {
  currentFlow: string | null;
  flowData: Record<string, any>;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    timestamp: Date;
  }>;
  addNotification: (
    notification: Omit<UXContextType['notifications'][0], 'id' | 'timestamp'>
  ) => void;
  clearNotification: (id: string) => void;
  setFlowData: (flowId: string, data: any) => void;
  getFlowData: (flowId: string) => any;
}

const UXContext = createContext<UXContextType | undefined>(undefined);

export function useUX() {
  const context = useContext(UXContext);
  if (!context) {
    throw new Error('useUX must be used within UXProvider');
  }
  return context;
}

// UX Provider for managing user experience state
export function UXProvider({ children }: { children: React.ReactNode }) {
  const [currentFlow, setCurrentFlow] = useState<string | null>(null);
  const [flowData, setFlowDataState] = useState<Record<string, any>>({});
  const [notifications, setNotifications] = useState<
    UXContextType['notifications']
  >([]);

  const addNotification = (
    notification: Omit<UXContextType['notifications'][0], 'id' | 'timestamp'>
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = {
      ...notification,
      id,
      timestamp: new Date(),
    };
    setNotifications((prev) => [...prev, newNotification]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      clearNotification(id);
    }, 5000);
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  const setFlowData = (flowId: string, data: any) => {
    setFlowDataState((prev) => ({
      ...prev,
      [flowId]: { ...prev[flowId], ...data },
    }));
  };

  const getFlowData = (flowId: string) => {
    return flowData[flowId] || {};
  };

  return (
    <UXContext.Provider
      value={{
        currentFlow,
        flowData,
        notifications,
        addNotification,
        clearNotification,
        setFlowData,
        getFlowData,
      }}
    >
      {children}
      <NotificationCenter />
    </UXContext.Provider>
  );
}

// Notification Center
function NotificationCenter() {
  const { notifications, clearNotification } = useUX();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <Card
          key={notification.id}
          className={cn(
            'p-4 shadow-lg border-l-4 max-w-sm animate-in slide-in-from-right',
            notification.type === 'success' && 'border-l-green-500 bg-green-50',
            notification.type === 'error' && 'border-l-red-500 bg-red-50',
            notification.type === 'warning' &&
              'border-l-yellow-500 bg-yellow-50',
            notification.type === 'info' && 'border-l-blue-500 bg-blue-50'
          )}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="font-semibold text-sm mb-1">
                {notification.title}
              </h4>
              <p className="text-sm text-muted-foreground">
                {notification.message}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0"
              onClick={() => clearNotification(notification.id)}
            >
              ×
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}

// Learning Progress Tracker
export function LearningProgressTracker({ userId }: { userId: string }) {
  const [progressData, setProgressData] = useState({
    totalCourses: 8,
    completedCourses: 3,
    inProgressCourses: 3,
    totalHours: 24,
    streak: 7,
    skillsLearned: 12,
    certificates: 2,
  });

  const completionRate =
    (progressData.completedCourses / progressData.totalCourses) * 100;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Learning Progress</h2>
          <p className="text-muted-foreground">Track your learning journey</p>
        </div>
        <Badge variant="outline">{Math.round(completionRate)}% Complete</Badge>
      </div>

      {/* Progress Ring */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="#e5e5e5"
              strokeWidth="2"
            />
            <path
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${completionRate}, 100`}
              className="text-primary"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Math.round(completionRate)}%
              </div>
              <div className="text-xs text-muted-foreground">Complete</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">
            {progressData.totalHours}
          </div>
          <div className="text-xs text-muted-foreground">Hours Learned</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-success">
            {progressData.completedCourses}
          </div>
          <div className="text-xs text-muted-foreground">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {progressData.streak}
          </div>
          <div className="text-xs text-muted-foreground">Day Streak</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {progressData.certificates}
          </div>
          <div className="text-xs text-muted-foreground">Certificates</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="font-semibold mb-3">Recent Achievements</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3 p-2 bg-green-50 rounded-lg">
            <div className="h-2 w-2 bg-success rounded-full" />
            <span className="text-sm">Completed React Hooks module</span>
            <span className="text-xs text-muted-foreground ml-auto">
              2 hours ago
            </span>
          </div>
          <div className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
            <div className="h-2 w-2 bg-blue-500 rounded-full" />
            <span className="text-sm">7-day learning streak achieved!</span>
            <span className="text-xs text-muted-foreground ml-auto">Today</span>
          </div>
          <div className="flex items-center gap-3 p-2 bg-yellow-50 rounded-lg">
            <div className="h-2 w-2 bg-yellow-500 rounded-full" />
            <span className="text-sm">
              JavaScript Fundamentals certificate earned
            </span>
            <span className="text-xs text-muted-foreground ml-auto">
              2 days ago
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Skill Development Path
export function SkillDevelopmentPath({ skillId }: { skillId: string }) {
  const skillPaths = {
    'web-development': {
      name: 'Full-Stack Web Development',
      description: 'Master modern web development from frontend to backend',
      totalCourses: 8,
      estimatedHours: 120,
      difficulty: 'Intermediate',
      prerequisites: ['HTML/CSS Basics', 'JavaScript Fundamentals'],
      path: [
        {
          id: '1',
          title: 'HTML & CSS Mastery',
          status: 'completed',
          duration: '15h',
        },
        {
          id: '2',
          title: 'JavaScript ES6+',
          status: 'completed',
          duration: '20h',
        },
        {
          id: '3',
          title: 'React Fundamentals',
          status: 'in-progress',
          duration: '25h',
          progress: 60,
        },
        {
          id: '4',
          title: 'Node.js & Express',
          status: 'locked',
          duration: '20h',
        },
        {
          id: '5',
          title: 'Database Design',
          status: 'locked',
          duration: '18h',
        },
        {
          id: '6',
          title: 'API Development',
          status: 'locked',
          duration: '15h',
        },
        {
          id: '7',
          title: 'Deployment & DevOps',
          status: 'locked',
          duration: '12h',
        },
        {
          id: '8',
          title: 'Advanced Patterns',
          status: 'locked',
          duration: '15h',
        },
      ],
    },
  };

  const skill = skillPaths[skillId as keyof typeof skillPaths];
  if (!skill) return null;

  const completedCourses = skill.path.filter(
    (course) => course.status === 'completed'
  ).length;
  const totalProgress = (completedCourses / skill.totalCourses) * 100;

  return (
    <Container size="lg" className="py-8">
      <Card className="p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold mb-2">{skill.name}</h1>
              <p className="text-muted-foreground mb-4">{skill.description}</p>
              <div className="flex items-center gap-4 text-sm">
                <Badge variant="outline">{skill.difficulty}</Badge>
                <span>{skill.estimatedHours} hours total</span>
                <span>{skill.totalCourses} courses</span>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary">
                {Math.round(totalProgress)}%
              </div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>

          {/* Prerequisites */}
          {skill.prerequisites.length > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-900 mb-2">Prerequisites</h3>
              <div className="flex flex-wrap gap-2">
                {skill.prerequisites.map((prereq) => (
                  <Badge
                    key={prereq}
                    variant="secondary"
                    className="bg-blue-100 text-blue-800"
                  >
                    {prereq}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Learning Path */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Learning Path</h2>

          <div className="space-y-3">
            {skill.path.map((course, index) => (
              <Card
                key={course.id}
                variant={course.status === 'locked' ? 'outlined' : 'default'}
                className={cn(
                  'p-4 transition-all',
                  course.status === 'completed' &&
                    'bg-green-50 border-green-200',
                  course.status === 'in-progress' &&
                    'bg-blue-50 border-blue-200',
                  course.status === 'locked' && 'bg-muted/20 border-muted'
                )}
              >
                <div className="flex items-center gap-4">
                  {/* Step indicator */}
                  <div
                    className={cn(
                      'flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium',
                      course.status === 'completed' && 'bg-success text-white',
                      course.status === 'in-progress' &&
                        'bg-primary text-white',
                      course.status === 'locked' &&
                        'bg-muted text-muted-foreground'
                    )}
                  >
                    {course.status === 'completed' ? '✓' : index + 1}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3
                        className={cn(
                          'font-medium',
                          course.status === 'locked' && 'text-muted-foreground'
                        )}
                      >
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                          {course.duration}
                        </span>
                        {course.status === 'completed' && (
                          <Badge variant="success" size="sm">
                            Completed
                          </Badge>
                        )}
                        {course.status === 'in-progress' && (
                          <Badge variant="default" size="sm">
                            In Progress
                          </Badge>
                        )}
                        {course.status === 'locked' && (
                          <Badge variant="outline" size="sm">
                            Locked
                          </Badge>
                        )}
                      </div>
                    </div>

                    {course.status === 'in-progress' && course.progress && (
                      <div className="mb-2">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {course.progress}% complete
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0">
                    {course.status === 'completed' && (
                      <Button variant="outline" size="sm">
                        Review
                      </Button>
                    )}
                    {course.status === 'in-progress' && (
                      <Button size="sm">Continue</Button>
                    )}
                    {course.status === 'locked' && (
                      <Button variant="ghost" size="sm" disabled>
                        🔒 Locked
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-8 text-center">
          <Button size="lg">Continue Learning Path</Button>
        </div>
      </Card>
    </Container>
  );
}

// Interactive Course Player
export function InteractiveCoursePlayer({ courseId }: { courseId: string }) {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showTranscript, setShowTranscript] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const [notes, setNotes] = useState('');

  const course = {
    id: courseId,
    title: 'React Hooks Deep Dive',
    instructor: 'Sarah Johnson',
    lessons: [
      {
        id: '1',
        title: 'Introduction to Hooks',
        duration: '8:24',
        type: 'video',
      },
      { id: '2', title: 'useState Hook', duration: '12:15', type: 'video' },
      { id: '3', title: 'useEffect Hook', duration: '15:30', type: 'video' },
      { id: '4', title: 'Custom Hooks', duration: '10:45', type: 'video' },
      {
        id: '5',
        title: 'Practice Exercise',
        duration: '20:00',
        type: 'exercise',
      },
    ],
  };

  const currentLessonData = course.lessons[currentLesson];

  return (
    <Container size="xl" className="py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Player */}
        <div className="lg:col-span-3">
          <Card className="p-0 overflow-hidden">
            {/* Video Player */}
            <div className="aspect-video bg-black flex items-center justify-center text-white">
              <div className="text-center">
                <div className="text-6xl mb-4">▶️</div>
                <h3 className="text-xl mb-2">{currentLessonData.title}</h3>
                <p className="text-muted-foreground">
                  Duration: {currentLessonData.duration}
                </p>
              </div>
            </div>

            {/* Player Controls */}
            <div className="p-4 border-t">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    ⏮️
                  </Button>
                  <Button size="sm">▶️</Button>
                  <Button size="sm" variant="outline">
                    ⏭️
                  </Button>
                  <span className="text-sm text-muted-foreground ml-4">
                    2:15 / {currentLessonData.duration}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                    className="px-2 py-1 border rounded text-sm"
                  >
                    <option value={0.5}>0.5x</option>
                    <option value={1}>1x</option>
                    <option value={1.25}>1.25x</option>
                    <option value={1.5}>1.5x</option>
                    <option value={2}>2x</option>
                  </select>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowTranscript(!showTranscript)}
                  >
                    📄 Transcript
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowNotes(!showNotes)}
                  >
                    📝 Notes
                  </Button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: '30%' }}
                />
              </div>
            </div>

            {/* Transcript */}
            {showTranscript && (
              <div className="p-4 border-t bg-muted/20">
                <h4 className="font-medium mb-2">Transcript</h4>
                <div className="text-sm space-y-2 max-h-40 overflow-y-auto">
                  <p>
                    <strong>00:15</strong> Welcome to React Hooks Deep Dive. In
                    this lesson...
                  </p>
                  <p>
                    <strong>00:45</strong> React Hooks were introduced in React
                    16.8...
                  </p>
                  <p>
                    <strong>01:20</strong> Let's start with the most commonly
                    used hook...
                  </p>
                </div>
              </div>
            )}

            {/* Notes */}
            {showNotes && (
              <div className="p-4 border-t">
                <h4 className="font-medium mb-2">My Notes</h4>
                <textarea
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  rows={4}
                  placeholder="Take notes while watching..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
                <div className="flex justify-end mt-2">
                  <Button size="sm" variant="outline">
                    Save Notes
                  </Button>
                </div>
              </div>
            )}
          </Card>

          {/* Lesson Info */}
          <Card className="p-6 mt-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold mb-2">
                  {currentLessonData.title}
                </h2>
                <p className="text-muted-foreground mb-4">
                  Learn the fundamentals of React Hooks and how to use them
                  effectively in your applications.
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>By {course.instructor}</span>
                  <span>•</span>
                  <span>{currentLessonData.duration}</span>
                  <span>•</span>
                  <span>
                    Lesson {currentLesson + 1} of {course.lessons.length}
                  </span>
                </div>
              </div>
              <Button>Mark Complete</Button>
            </div>

            {/* Lesson Resources */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card variant="outlined" className="p-4 text-center">
                <div className="text-2xl mb-2">📁</div>
                <h4 className="font-medium mb-1">Resources</h4>
                <p className="text-sm text-muted-foreground">
                  Code files & slides
                </p>
                <Button variant="outline" size="sm" className="mt-2">
                  Download
                </Button>
              </Card>
              <Card variant="outlined" className="p-4 text-center">
                <div className="text-2xl mb-2">💬</div>
                <h4 className="font-medium mb-1">Discussion</h4>
                <p className="text-sm text-muted-foreground">Ask questions</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Join Chat
                </Button>
              </Card>
              <Card variant="outlined" className="p-4 text-center">
                <div className="text-2xl mb-2">✅</div>
                <h4 className="font-medium mb-1">Exercise</h4>
                <p className="text-sm text-muted-foreground">Practice coding</p>
                <Button variant="outline" size="sm" className="mt-2">
                  Start
                </Button>
              </Card>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Course Progress */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Course Progress</h3>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-1">
                <span>Overall Progress</span>
                <span>40%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full"
                  style={{ width: '40%' }}
                />
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              2 of 5 lessons completed
            </div>
          </Card>

          {/* Lesson List */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Lessons</h3>
            <div className="space-y-2">
              {course.lessons.map((lesson, index) => (
                <div
                  key={lesson.id}
                  className={cn(
                    'flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-muted/50 transition-colors',
                    index === currentLesson &&
                      'bg-primary/10 border border-primary/20'
                  )}
                  onClick={() => setCurrentLesson(index)}
                >
                  <div
                    className={cn(
                      'h-6 w-6 rounded-full flex items-center justify-center text-xs',
                      index < currentLesson
                        ? 'bg-success text-white'
                        : index === currentLesson
                          ? 'bg-primary text-white'
                          : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {index < currentLesson ? '✓' : index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {lesson.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {lesson.duration}
                    </p>
                  </div>
                  <div className="text-xs">
                    {lesson.type === 'video' ? '🎥' : '💻'}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Quick Actions</h3>
            <Stack spacing="sm">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                📋 View Syllabus
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                ⭐ Rate Course
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                🔖 Bookmark
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
              >
                📤 Share
              </Button>
            </Stack>
          </Card>
        </div>
      </div>
    </Container>
  );
}
