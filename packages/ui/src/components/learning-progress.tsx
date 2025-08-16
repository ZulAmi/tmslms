'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Card } from './card';
import { Badge } from './badge';
import { cn } from '../lib/utils';

// Learning Progress and Journey Components

interface LearningProgress {
  courseId: string;
  courseTitle: string;
  progress: number; // 0-100
  completedLessons: number;
  totalLessons: number;
  timeSpent: number; // in minutes
  lastAccessed: Date;
  streak?: number;
  achievements?: Achievement[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt: Date;
  type: 'progress' | 'streak' | 'completion' | 'skill';
}

interface Lesson {
  id: string;
  title: string;
  duration: number;
  completed: boolean;
  locked?: boolean;
  type: 'video' | 'reading' | 'quiz' | 'assignment' | 'discussion';
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  courses: Course[];
  progress: number;
  estimatedTime: string;
}

interface Course {
  id: string;
  title: string;
  progress: number;
  lessons: Lesson[];
  completed: boolean;
}

// Main Learning Dashboard
interface LearningDashboardProps {
  user: {
    name: string;
    avatar?: string;
    level: number;
    xp: number;
    streak: number;
  };
  progress: LearningProgress[];
  achievements: Achievement[];
  learningPaths: LearningPath[];
  onContinueLearning?: (courseId: string) => void;
  onViewCourse?: (courseId: string) => void;
}

export function LearningDashboard({
  user,
  progress,
  achievements,
  learningPaths,
  onContinueLearning,
  onViewCourse,
}: LearningDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'progress' | 'paths' | 'achievements'
  >('overview');

  const recentAchievements = achievements
    .sort((a, b) => b.unlockedAt.getTime() - a.unlockedAt.getTime())
    .slice(0, 3);

  const activeCourses = progress.filter(
    (p) => p.progress > 0 && p.progress < 100
  );
  const completedCourses = progress.filter((p) => p.progress === 100);

  return (
    <div className="space-y-6">
      {/* User Stats Header */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 bg-primary rounded-full flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-white text-xl font-bold">
                  {user.name.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">Welcome back, {user.name}!</h2>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>Level {user.level}</span>
                <span>{user.xp} XP</span>
                <span>{user.streak} day streak 🔥</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-muted-foreground">Weekly Goal</div>
            <div className="flex items-center space-x-2">
              <div className="w-24 h-2 bg-muted rounded-full">
                <div
                  className="h-2 bg-primary rounded-full"
                  style={{ width: '65%' }}
                />
              </div>
              <span className="text-sm">13/20 hours</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'progress', label: 'My Courses' },
          { id: 'paths', label: 'Learning Paths' },
          { id: 'achievements', label: 'Achievements' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              'flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors',
              activeTab === tab.id
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Continue Learning */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Continue Learning</h3>
              <div className="space-y-4">
                {activeCourses.slice(0, 3).map((course) => (
                  <div
                    key={course.courseId}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium">{course.courseTitle}</h4>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-muted-foreground">
                        <span>
                          {course.completedLessons}/{course.totalLessons}{' '}
                          lessons
                        </span>
                        <span>
                          {Math.floor(course.timeSpent / 60)}h{' '}
                          {course.timeSpent % 60}m spent
                        </span>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground mt-1 block">
                          {course.progress}% complete
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <Button
                        size="sm"
                        onClick={() => onContinueLearning?.(course.courseId)}
                      >
                        Continue
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Learning Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {activeCourses.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Active Courses
                </div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-success">
                  {completedCourses.length}
                </div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </Card>
              <Card className="p-4 text-center">
                <div className="text-2xl font-bold text-warning">
                  {achievements.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Achievements
                </div>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Achievements */}
            {recentAchievements.length > 0 && (
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Recent Achievements</h3>
                <div className="space-y-3">
                  {recentAchievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-center space-x-3 p-2 bg-muted/50 rounded-lg"
                    >
                      <div className="text-2xl">{achievement.icon}</div>
                      <div>
                        <div className="font-medium text-sm">
                          {achievement.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {achievement.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Study Streak */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Study Streak</h3>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">
                  {user.streak}
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                  days in a row
                </div>
                <div className="flex justify-center space-x-1">
                  {[...Array(7)].map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-6 h-6 rounded-full',
                        i < user.streak % 7 ? 'bg-primary' : 'bg-muted'
                      )}
                    />
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'progress' && (
        <CourseProgressView
          progress={progress}
          onContinue={onContinueLearning}
          onView={onViewCourse}
        />
      )}

      {activeTab === 'paths' && (
        <LearningPathsView learningPaths={learningPaths} />
      )}

      {activeTab === 'achievements' && (
        <AchievementsView achievements={achievements} />
      )}
    </div>
  );
}

// Course Progress View
function CourseProgressView({
  progress,
  onContinue,
  onView,
}: {
  progress: LearningProgress[];
  onContinue?: (courseId: string) => void;
  onView?: (courseId: string) => void;
}) {
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  const filteredProgress = progress.filter((p) => {
    if (filter === 'active') return p.progress > 0 && p.progress < 100;
    if (filter === 'completed') return p.progress === 100;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Filter Tabs */}
      <div className="flex space-x-4">
        {[
          { id: 'all', label: 'All Courses' },
          { id: 'active', label: 'In Progress' },
          { id: 'completed', label: 'Completed' },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={filter === tab.id ? 'default' : 'outline'}
            onClick={() => setFilter(tab.id as any)}
            size="sm"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Course List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredProgress.map((course) => (
          <Card key={course.courseId} className="p-6">
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{course.courseTitle}</h3>
                  <div className="text-sm text-muted-foreground mt-1">
                    Last accessed {course.lastAccessed.toLocaleDateString()}
                  </div>
                </div>
                {course.progress === 100 && (
                  <Badge variant="secondary">Completed</Badge>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{course.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Lessons</div>
                  <div>
                    {course.completedLessons}/{course.totalLessons}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Time Spent</div>
                  <div>
                    {Math.floor(course.timeSpent / 60)}h {course.timeSpent % 60}
                    m
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => onView?.(course.courseId)}
                >
                  View Details
                </Button>
                {course.progress < 100 && (
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => onContinue?.(course.courseId)}
                  >
                    Continue
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Learning Paths View
function LearningPathsView({
  learningPaths,
}: {
  learningPaths: LearningPath[];
}) {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Learning Paths</h2>
        <p className="text-muted-foreground">
          Follow structured learning paths to master new skills
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {learningPaths.map((path) => (
          <Card key={path.id} className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">{path.title}</h3>
                <p className="text-muted-foreground mt-2">{path.description}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{path.progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${path.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{path.courses.length} courses</span>
                <span>~{path.estimatedTime}</span>
              </div>

              <div className="space-y-2">
                {path.courses.map((course, index) => (
                  <div
                    key={course.id}
                    className="flex items-center space-x-3 p-2 border rounded"
                  >
                    <div
                      className={cn(
                        'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                        course.completed
                          ? 'bg-success text-white'
                          : course.progress > 0
                            ? 'bg-primary text-white'
                            : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {course.completed ? '✓' : index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{course.title}</div>
                      {course.progress > 0 && (
                        <div className="w-full bg-muted rounded-full h-1 mt-1">
                          <div
                            className="bg-primary h-1 rounded-full"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full">
                {path.progress > 0 ? 'Continue Path' : 'Start Path'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Achievements View
function AchievementsView({ achievements }: { achievements: Achievement[] }) {
  const [filter, setFilter] = useState<
    'all' | 'progress' | 'streak' | 'completion' | 'skill'
  >('all');

  const filteredAchievements = achievements.filter(
    (a) => filter === 'all' || a.type === filter
  );

  const achievementsByType = achievements.reduce(
    (acc, achievement) => {
      acc[achievement.type] = (acc[achievement.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Achievements</h2>
        <p className="text-muted-foreground">
          Track your learning milestones and celebrate your progress
        </p>
      </div>

      {/* Achievement Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold">{achievements.length}</div>
          <div className="text-sm text-muted-foreground">Total</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold">
            {achievementsByType.progress || 0}
          </div>
          <div className="text-sm text-muted-foreground">Progress</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold">
            {achievementsByType.streak || 0}
          </div>
          <div className="text-sm text-muted-foreground">Streak</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold">
            {achievementsByType.completion || 0}
          </div>
          <div className="text-sm text-muted-foreground">Completion</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold">
            {achievementsByType.skill || 0}
          </div>
          <div className="text-sm text-muted-foreground">Skill</div>
        </Card>
      </div>

      {/* Filter */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'All' },
          { id: 'progress', label: 'Progress' },
          { id: 'streak', label: 'Streak' },
          { id: 'completion', label: 'Completion' },
          { id: 'skill', label: 'Skill' },
        ].map((tab) => (
          <Button
            key={tab.id}
            variant={filter === tab.id ? 'default' : 'outline'}
            onClick={() => setFilter(tab.id as any)}
            size="sm"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => (
          <Card key={achievement.id} className="p-6 text-center">
            <div className="space-y-3">
              <div className="text-4xl">{achievement.icon}</div>
              <div>
                <h3 className="font-semibold">{achievement.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {achievement.description}
                </p>
              </div>
              <div className="text-xs text-muted-foreground">
                Unlocked {achievement.unlockedAt.toLocaleDateString()}
              </div>
              <Badge variant="secondary" size="sm">
                {achievement.type}
              </Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
