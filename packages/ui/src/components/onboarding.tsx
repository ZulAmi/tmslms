'use client';

import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Card } from './card';
import { Badge } from './badge';
import { Input } from './input';

// Add proper type definitions
interface ProfileData {
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  bio: string;
  avatar: string | null;
}

interface PreferencesData {
  theme: string;
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  courseReminders: boolean;
}

interface LearningGoalsData {
  interests: string[];
  skillLevel: string;
  learningTime: string;
  goals: string[];
}

// Onboarding Flow Component
interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: React.ReactNode;
  required?: boolean;
}

interface OnboardingFlowProps {
  steps: OnboardingStep[];
  onComplete: (data: any) => void;
  initialData?: any;
}

export function OnboardingFlow({
  steps,
  onComplete,
  initialData = {},
}: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState(initialData);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const canProceed =
    !currentStepData?.required || completedSteps.includes(currentStepData.id);

  const handleNext = () => {
    if (isLastStep) {
      onComplete(formData);
    } else {
      setCurrentStep((prev: number) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev: number) => Math.max(0, prev - 1));
  };

  const markStepComplete = (stepId: string) => {
    setCompletedSteps((prev: string[]) => [
      ...prev.filter((id) => id !== stepId),
      stepId,
    ]);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Welcome to TMSLMS</h1>
            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-muted rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>

          {/* Step Indicators */}
          <div className="flex justify-between mt-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex flex-col items-center ${
                  index <= currentStep
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center border-2 ${
                    index < currentStep
                      ? 'bg-primary border-primary text-white'
                      : index === currentStep
                        ? 'border-primary bg-primary/10'
                        : 'border-muted-foreground/30'
                  }`}
                >
                  {index < currentStep ? (
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                <span className="text-xs mt-1 text-center max-w-20 leading-tight">
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Current Step Content */}
        <Card className="p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">
              {currentStepData.title}
            </h2>
            <p className="text-muted-foreground">
              {currentStepData.description}
            </p>
          </div>

          <div className="mb-8">
            {React.cloneElement(
              currentStepData.component as React.ReactElement,
              {
                data: formData,
                onDataChange: setFormData,
                onComplete: () => markStepComplete(currentStepData.id),
              }
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Back
            </Button>

            <Button
              onClick={handleNext}
              disabled={currentStepData.required && !canProceed}
            >
              {isLastStep ? 'Complete Setup' : 'Next'}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Profile Setup Step
export function ProfileSetupStep({ data, onDataChange, onComplete }: any) {
  const [profile, setProfile] = useState<ProfileData & Record<string, any>>({
    firstName: data?.firstName || '',
    lastName: data?.lastName || '',
    jobTitle: data?.jobTitle || '',
    department: data?.department || '',
    bio: data?.bio || '',
    avatar: data?.avatar || null,
    ...data,
  });

  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const valid = !!(profile.firstName && profile.lastName && profile.jobTitle);
    setIsValid(valid);
    if (valid) {
      onDataChange({ ...data, ...profile });
      onComplete?.();
    }
  }, [profile]);

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfile((prev: typeof profile) => ({
          ...prev,
          avatar: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Avatar Upload */}
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <div className="h-24 w-24 bg-muted rounded-full flex items-center justify-center overflow-hidden">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt="Avatar"
                className="h-full w-full object-cover"
              />
            ) : (
              <svg
                className="h-8 w-8 text-muted-foreground"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
          <label className="absolute bottom-0 right-0 h-8 w-8 bg-primary rounded-full flex items-center justify-center cursor-pointer text-white hover:bg-primary/90">
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleAvatarUpload}
            />
          </label>
        </div>
        <p className="text-sm text-muted-foreground">
          Upload your profile picture
        </p>
      </div>

      {/* Form Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">First Name *</label>
          <Input
            value={profile.firstName}
            onChange={(e) =>
              setProfile((prev: typeof profile) => ({
                ...prev,
                firstName: e.target.value,
              }))
            }
            placeholder="John"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Last Name *</label>
          <Input
            value={profile.lastName}
            onChange={(e) =>
              setProfile((prev: typeof profile) => ({
                ...prev,
                lastName: e.target.value,
              }))
            }
            placeholder="Doe"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Job Title *</label>
        <Input
          value={profile.jobTitle}
          onChange={(e) =>
            setProfile((prev: typeof profile) => ({
              ...prev,
              jobTitle: e.target.value,
            }))
          }
          placeholder="Software Engineer"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Department</label>
        <select
          value={profile.department}
          onChange={(e) =>
            setProfile((prev: typeof profile) => ({
              ...prev,
              department: e.target.value,
            }))
          }
          className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <option value="">Select department</option>
          <option value="engineering">Engineering</option>
          <option value="marketing">Marketing</option>
          <option value="sales">Sales</option>
          <option value="hr">Human Resources</option>
          <option value="finance">Finance</option>
          <option value="operations">Operations</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Bio</label>
        <textarea
          value={profile.bio}
          onChange={(e) =>
            setProfile((prev: typeof profile) => ({
              ...prev,
              bio: e.target.value,
            }))
          }
          placeholder="Tell us about yourself..."
          rows={3}
          className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none"
        />
      </div>

      {isValid && (
        <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
          <p className="text-sm text-success">
            ✓ Profile information completed
          </p>
        </div>
      )}
    </div>
  );
}

// Preferences Setup Step
export function PreferencesSetupStep({ data, onDataChange, onComplete }: any) {
  const [preferences, setPreferences] = useState<
    PreferencesData & Record<string, any>
  >({
    theme: data?.theme || 'system',
    language: data?.language || 'en',
    timezone:
      data?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
    emailNotifications: data?.emailNotifications ?? true,
    pushNotifications: data?.pushNotifications ?? true,
    weeklyDigest: data?.weeklyDigest ?? true,
    courseReminders: data?.courseReminders ?? true,
    ...data,
  });

  useEffect(() => {
    onDataChange({ ...data, ...preferences });
    onComplete?.(); // Preferences are always complete
  }, [preferences]);

  return (
    <div className="space-y-6">
      {/* Appearance */}
      <div>
        <h3 className="text-lg font-medium mb-4">Appearance</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Theme</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'light', label: 'Light', icon: '☀️' },
                { value: 'dark', label: 'Dark', icon: '🌙' },
                { value: 'system', label: 'System', icon: '💻' },
              ].map((theme) => (
                <button
                  key={theme.value}
                  type="button"
                  onClick={() =>
                    setPreferences((prev: typeof preferences) => ({
                      ...prev,
                      theme: theme.value,
                    }))
                  }
                  className={`p-4 border rounded-lg text-center transition-colors ${
                    preferences.theme === theme.value
                      ? 'border-primary bg-primary/10'
                      : 'border-input hover:bg-muted/50'
                  }`}
                >
                  <div className="text-2xl mb-1">{theme.icon}</div>
                  <div className="text-sm font-medium">{theme.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Language</label>
            <select
              value={preferences.language}
              onChange={(e) =>
                setPreferences((prev: typeof preferences) => ({
                  ...prev,
                  language: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="zh">中文</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Timezone</label>
            <select
              value={preferences.timezone}
              onChange={(e) =>
                setPreferences((prev: typeof preferences) => ({
                  ...prev,
                  timezone: e.target.value,
                }))
              }
              className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Denver">Mountain Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
              <option value="Europe/London">London</option>
              <option value="Europe/Paris">Paris</option>
              <option value="Asia/Tokyo">Tokyo</option>
              <option value="Asia/Shanghai">Shanghai</option>
            </select>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div>
        <h3 className="text-lg font-medium mb-4">Notifications</h3>
        <div className="space-y-4">
          {[
            {
              key: 'emailNotifications',
              label: 'Email Notifications',
              description: 'Receive important updates via email',
            },
            {
              key: 'pushNotifications',
              label: 'Push Notifications',
              description: 'Get notified about course activities',
            },
            {
              key: 'weeklyDigest',
              label: 'Weekly Digest',
              description: 'Summary of your learning progress',
            },
            {
              key: 'courseReminders',
              label: 'Course Reminders',
              description: 'Reminders for upcoming lessons',
            },
          ].map((setting) => (
            <div
              key={setting.key}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <div className="font-medium">{setting.label}</div>
                <div className="text-sm text-muted-foreground">
                  {setting.description}
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    preferences[
                      setting.key as keyof typeof preferences
                    ] as boolean
                  }
                  onChange={(e) =>
                    setPreferences((prev: typeof preferences) => ({
                      ...prev,
                      [setting.key]: e.target.checked,
                    }))
                  }
                  className="sr-only"
                />
                <div
                  className={`w-11 h-6 rounded-full transition-colors ${
                    preferences[setting.key as keyof typeof preferences]
                      ? 'bg-primary'
                      : 'bg-muted'
                  }`}
                >
                  <div
                    className={`h-5 w-5 bg-white rounded-full shadow transition-transform ${
                      preferences[setting.key as keyof typeof preferences]
                        ? 'translate-x-5'
                        : 'translate-x-0.5'
                    } mt-0.5`}
                  />
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
        <p className="text-sm text-success">✓ Preferences configured</p>
      </div>
    </div>
  );
}

// Learning Goals Step
export function LearningGoalsStep({ data, onDataChange, onComplete }: any) {
  const [goals, setGoals] = useState<LearningGoalsData & Record<string, any>>({
    interests: data?.interests || [],
    skillLevel: data?.skillLevel || '',
    learningTime: data?.learningTime || '',
    goals: data?.goals || [],
    ...data,
  });

  const [isValid, setIsValid] = useState(false);

  const interests = [
    'Web Development',
    'Mobile Development',
    'Data Science',
    'Machine Learning',
    'Cloud Computing',
    'DevOps',
    'Cybersecurity',
    'UI/UX Design',
    'Project Management',
    'Digital Marketing',
    'Business Analytics',
    'Leadership',
  ];

  const skillLevels = [
    {
      value: 'beginner',
      label: 'Beginner',
      description: 'Just getting started',
    },
    {
      value: 'intermediate',
      label: 'Intermediate',
      description: 'Some experience',
    },
    {
      value: 'advanced',
      label: 'Advanced',
      description: 'Experienced professional',
    },
  ];

  const learningTimes = [
    {
      value: '1-2',
      label: '1-2 hours/week',
      description: 'Light learning pace',
    },
    {
      value: '3-5',
      label: '3-5 hours/week',
      description: 'Moderate learning pace',
    },
    {
      value: '6-10',
      label: '6-10 hours/week',
      description: 'Intensive learning pace',
    },
    {
      value: '10+',
      label: '10+ hours/week',
      description: 'Full-time learning',
    },
  ];

  useEffect(() => {
    const valid =
      goals.interests.length > 0 && !!goals.skillLevel && !!goals.learningTime;
    setIsValid(valid);
    if (valid) {
      onDataChange({ ...data, ...goals });
      onComplete?.();
    }
  }, [goals]);

  const toggleInterest = (interest: string) => {
    setGoals((prev: typeof goals) => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter((i: string) => i !== interest)
        : [...prev.interests, interest],
    }));
  };

  const toggleGoal = (goal: string) => {
    setGoals((prev: typeof goals) => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter((g: string) => g !== goal)
        : [...prev.goals, goal],
    }));
  };

  return (
    <div className="space-y-8">
      {/* Interests */}
      <div>
        <h3 className="text-lg font-medium mb-4">
          What are you interested in learning? *
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select all that apply
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {interests.map((interest) => (
            <button
              key={interest}
              type="button"
              onClick={() => toggleInterest(interest)}
              className={`p-3 text-sm border rounded-lg transition-colors text-left ${
                goals.interests.includes(interest)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-input hover:bg-muted/50'
              }`}
            >
              {interest}
            </button>
          ))}
        </div>
      </div>

      {/* Skill Level */}
      <div>
        <h3 className="text-lg font-medium mb-4">
          What's your current skill level? *
        </h3>
        <div className="space-y-3">
          {skillLevels.map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() =>
                setGoals((prev: typeof goals) => ({
                  ...prev,
                  skillLevel: level.value,
                }))
              }
              className={`w-full p-4 text-left border rounded-lg transition-colors ${
                goals.skillLevel === level.value
                  ? 'border-primary bg-primary/10'
                  : 'border-input hover:bg-muted/50'
              }`}
            >
              <div className="font-medium">{level.label}</div>
              <div className="text-sm text-muted-foreground">
                {level.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Learning Time */}
      <div>
        <h3 className="text-lg font-medium mb-4">
          How much time can you dedicate to learning? *
        </h3>
        <div className="space-y-3">
          {learningTimes.map((time) => (
            <button
              key={time.value}
              type="button"
              onClick={() =>
                setGoals((prev: typeof goals) => ({
                  ...prev,
                  learningTime: time.value,
                }))
              }
              className={`w-full p-4 text-left border rounded-lg transition-colors ${
                goals.learningTime === time.value
                  ? 'border-primary bg-primary/10'
                  : 'border-input hover:bg-muted/50'
              }`}
            >
              <div className="font-medium">{time.label}</div>
              <div className="text-sm text-muted-foreground">
                {time.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Learning Goals */}
      <div>
        <h3 className="text-lg font-medium mb-4">
          What are your learning goals?
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Optional - help us personalize your experience
        </p>
        <div className="space-y-3">
          {[
            'Get certified in my field',
            'Advance my career',
            'Switch to a new career',
            'Start my own business',
            'Improve job performance',
            'Learn for personal interest',
          ].map((goal) => (
            <button
              key={goal}
              type="button"
              onClick={() => toggleGoal(goal)}
              className={`w-full p-3 text-left border rounded-lg transition-colors ${
                goals.goals.includes(goal)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-input hover:bg-muted/50'
              }`}
            >
              {goal}
            </button>
          ))}
        </div>
      </div>

      {isValid && (
        <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
          <p className="text-sm text-success">✓ Learning goals set</p>
        </div>
      )}
    </div>
  );
}

// Welcome/Complete Step
export function WelcomeStep({ data }: any) {
  const recommendations = [
    {
      title: 'JavaScript Fundamentals',
      level: 'Beginner',
      duration: '4 weeks',
    },
    { title: 'React Development', level: 'Intermediate', duration: '6 weeks' },
    {
      title: 'Python for Data Science',
      level: 'Beginner',
      duration: '8 weeks',
    },
  ];

  return (
    <div className="text-center space-y-8">
      <div>
        <div className="h-16 w-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="h-8 w-8 text-success"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold mb-2">
          Welcome to TMSLMS, {data?.firstName}! 🎉
        </h2>
        <p className="text-muted-foreground">
          Your account is ready! Based on your preferences, here are some
          recommended courses to get you started.
        </p>
      </div>

      <div className="max-w-md mx-auto space-y-4">
        <h3 className="text-lg font-medium">Recommended for You</h3>
        {recommendations.map((course, index) => (
          <Card key={index} className="p-4 text-left">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium">{course.title}</h4>
              <Badge variant="outline" size="sm">
                {course.level}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{course.duration}</p>
          </Card>
        ))}
      </div>

      <div className="flex gap-4 justify-center">
        <Button size="lg">Start Learning</Button>
        <Button variant="outline" size="lg">
          Explore Courses
        </Button>
      </div>
    </div>
  );
}
