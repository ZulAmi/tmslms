'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Card } from './card';
import { Badge } from './badge';
import { Input } from './input';
import { cn } from '../lib/utils';

// Course Discovery and Enrollment Flow
interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  enrolled: number;
  price?: number;
  thumbnail?: string;
  tags: string[];
  prerequisites?: string[];
  objectives: string[];
}

interface CourseDiscoveryProps {
  courses: Course[];
  onEnroll?: (courseId: string) => void;
  onViewDetails?: (courseId: string) => void;
  filters?: {
    level?: string[];
    duration?: string[];
    tags?: string[];
  };
}

export function CourseDiscovery({
  courses,
  onEnroll,
  onViewDetails,
  filters,
}: CourseDiscoveryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    level: [] as string[],
    duration: [] as string[],
    tags: [] as string[],
  });
  const [sortBy, setSortBy] = useState<
    'relevance' | 'rating' | 'enrolled' | 'recent'
  >('relevance');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredCourses = courses.filter((course) => {
    // Search filter
    const matchesSearch =
      searchQuery === '' ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchQuery.toLowerCase());

    // Level filter
    const matchesLevel =
      selectedFilters.level.length === 0 ||
      selectedFilters.level.includes(course.level);

    // Tags filter
    const matchesTags =
      selectedFilters.tags.length === 0 ||
      selectedFilters.tags.some((tag) => course.tags.includes(tag));

    return matchesSearch && matchesLevel && matchesTags;
  });

  const sortedCourses = [...filteredCourses].sort((a, b) => {
    switch (sortBy) {
      case 'rating':
        return b.rating - a.rating;
      case 'enrolled':
        return b.enrolled - a.enrolled;
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="relevance">Relevance</option>
              <option value="rating">Rating</option>
              <option value="enrolled">Most Popular</option>
              <option value="recent">Most Recent</option>
            </select>

            <div className="flex border rounded-md">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                  />
                </svg>
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 10h16M4 14h16M4 18h16"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Level</label>
            <div className="flex gap-2">
              {['Beginner', 'Intermediate', 'Advanced'].map((level) => (
                <Badge
                  key={level}
                  variant={
                    selectedFilters.level.includes(level)
                      ? 'default'
                      : 'outline'
                  }
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedFilters((prev) => ({
                      ...prev,
                      level: prev.level.includes(level)
                        ? prev.level.filter((l) => l !== level)
                        : [...prev.level, level],
                    }));
                  }}
                >
                  {level}
                </Badge>
              ))}
            </div>
          </div>

          {filters?.tags && (
            <div>
              <label className="text-sm font-medium mb-2 block">Topics</label>
              <div className="flex flex-wrap gap-2">
                {filters.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={
                      selectedFilters.tags.includes(tag) ? 'default' : 'outline'
                    }
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedFilters((prev) => ({
                        ...prev,
                        tags: prev.tags.includes(tag)
                          ? prev.tags.filter((t) => t !== tag)
                          : [...prev.tags, tag],
                      }));
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Course List */}
      <div
        className={cn(
          'gap-6',
          viewMode === 'grid'
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'space-y-4'
        )}
      >
        {sortedCourses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            viewMode={viewMode}
            onEnroll={onEnroll}
            onViewDetails={onViewDetails}
          />
        ))}
      </div>

      {sortedCourses.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-muted-foreground">
            <svg
              className="h-12 w-12 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47.94-6.02 2.47M12 3a9 9 0 110 18 9 9 0 010-18z"
              />
            </svg>
            <p>No courses found matching your criteria</p>
          </div>
        </Card>
      )}
    </div>
  );
}

// Course Card Component
interface CourseCardProps {
  course: Course;
  viewMode: 'grid' | 'list';
  onEnroll?: (courseId: string) => void;
  onViewDetails?: (courseId: string) => void;
}

function CourseCard({
  course,
  viewMode,
  onEnroll,
  onViewDetails,
}: CourseCardProps) {
  if (viewMode === 'list') {
    return (
      <Card className="p-6">
        <div className="flex gap-4">
          <div className="h-20 w-32 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <svg
                  className="h-8 w-8 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{course.title}</h3>
              <div className="flex items-center space-x-1">
                <svg
                  className="h-4 w-4 text-yellow-400 fill-current"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="text-sm">{course.rating}</span>
              </div>
            </div>

            <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
              {course.description}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>{course.instructor}</span>
                <span>{course.duration}</span>
                <Badge variant="outline" size="sm">
                  {course.level}
                </Badge>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails?.(course.id)}
                >
                  View Details
                </Button>
                <Button size="sm" onClick={() => onEnroll?.(course.id)}>
                  Enroll
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="h-48 bg-muted overflow-hidden">
        {course.thumbnail ? (
          <img
            src={course.thumbnail}
            alt={course.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <svg
              className="h-12 w-12 text-muted-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="outline" size="sm">
            {course.level}
          </Badge>
          <div className="flex items-center space-x-1">
            <svg
              className="h-4 w-4 text-yellow-400 fill-current"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-sm">{course.rating}</span>
          </div>
        </div>

        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          {course.title}
        </h3>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-3">
          {course.description}
        </p>

        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span>{course.instructor}</span>
          <span>{course.duration}</span>
        </div>

        <div className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => onViewDetails?.(course.id)}
          >
            View Details
          </Button>
          <Button
            size="sm"
            className="w-full"
            onClick={() => onEnroll?.(course.id)}
          >
            Enroll Now
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Course Details Modal/View
interface CourseDetailsProps {
  course: Course;
  onEnroll?: (courseId: string) => void;
  onClose?: () => void;
}

export function CourseDetails({
  course,
  onEnroll,
  onClose,
}: CourseDetailsProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Badge variant="outline">{course.level}</Badge>
            <div className="flex items-center space-x-1">
              <svg
                className="h-4 w-4 text-yellow-400 fill-current"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span>{course.rating}</span>
              <span className="text-muted-foreground">
                ({course.enrolled} students)
              </span>
            </div>
          </div>
          <h1 className="text-3xl font-bold">{course.title}</h1>
          <p className="text-muted-foreground">by {course.instructor}</p>
        </div>

        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Image */}
          <div className="aspect-video bg-muted rounded-lg overflow-hidden">
            {course.thumbnail ? (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <svg
                  className="h-16 w-16 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Description */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">About This Course</h2>
            <p className="text-muted-foreground leading-relaxed">
              {course.description}
            </p>
          </Card>

          {/* Learning Objectives */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">What You'll Learn</h2>
            <ul className="space-y-2">
              {course.objectives.map((objective, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <svg
                    className="h-5 w-5 text-success mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Prerequisites */}
          {course.prerequisites && course.prerequisites.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Prerequisites</h2>
              <ul className="space-y-2">
                {course.prerequisites.map((prerequisite, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <svg
                      className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    <span>{prerequisite}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Enrollment Card */}
          <Card className="p-6">
            <div className="space-y-4">
              {course.price && course.price > 0 ? (
                <div className="text-2xl font-bold">${course.price}</div>
              ) : (
                <div className="text-2xl font-bold text-success">Free</div>
              )}

              <Button
                size="lg"
                className="w-full"
                onClick={() => onEnroll?.(course.id)}
              >
                Enroll Now
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                {course.enrolled} students enrolled
              </div>
            </div>
          </Card>

          {/* Course Info */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Course Details</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span>{course.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Level:</span>
                <span>{course.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Language:</span>
                <span>English</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Certificate:</span>
                <span>Yes</span>
              </div>
            </div>
          </Card>

          {/* Tags */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Topics</h3>
            <div className="flex flex-wrap gap-2">
              {course.tags.map((tag) => (
                <Badge key={tag} variant="secondary" size="sm">
                  {tag}
                </Badge>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
