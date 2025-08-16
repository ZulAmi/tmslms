'use client';

import React, { useState, createContext, useContext } from 'react';
import { Button } from './button';
import { Card } from './card';
import { Badge } from './badge';
import { Input } from './input';
import { Flex, Stack, Container } from './layout';
import { cn } from '../lib/utils';

// Workflow Context for managing complex user journeys
interface WorkflowContextType {
  currentWorkflow: string | null;
  workflowData: Record<string, any>;
  currentStep: number;
  totalSteps: number;
  canProceed: boolean;
  canGoBack: boolean;
  startWorkflow: (workflowId: string, initialData?: any) => void;
  nextStep: (data?: any) => void;
  previousStep: () => void;
  completeWorkflow: () => void;
  setStepData: (stepIndex: number, data: any) => void;
  getStepData: (stepIndex: number) => any;
}

const WorkflowContext = createContext<WorkflowContextType | undefined>(
  undefined
);

export function useWorkflow() {
  const context = useContext(WorkflowContext);
  if (!context) {
    throw new Error('useWorkflow must be used within WorkflowProvider');
  }
  return context;
}

// Workflow Provider
export function WorkflowProvider({ children }: { children: React.ReactNode }) {
  const [currentWorkflow, setCurrentWorkflow] = useState<string | null>(null);
  const [workflowData, setWorkflowData] = useState<Record<string, any>>({});
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);

  const startWorkflow = (workflowId: string, initialData = {}) => {
    setCurrentWorkflow(workflowId);
    setWorkflowData(initialData);
    setCurrentStep(0);
  };

  const nextStep = (data?: any) => {
    if (data) {
      setWorkflowData((prev) => ({
        ...prev,
        [`step_${currentStep}`]: data,
      }));
    }
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps - 1));
  };

  const previousStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const completeWorkflow = () => {
    setCurrentWorkflow(null);
    setWorkflowData({});
    setCurrentStep(0);
  };

  const setStepData = (stepIndex: number, data: any) => {
    setWorkflowData((prev) => ({
      ...prev,
      [`step_${stepIndex}`]: data,
    }));
  };

  const getStepData = (stepIndex: number) => {
    return workflowData[`step_${stepIndex}`] || {};
  };

  return (
    <WorkflowContext.Provider
      value={{
        currentWorkflow,
        workflowData,
        currentStep,
        totalSteps,
        canProceed: currentStep < totalSteps - 1,
        canGoBack: currentStep > 0,
        startWorkflow,
        nextStep,
        previousStep,
        completeWorkflow,
        setStepData,
        getStepData,
      }}
    >
      {children}
    </WorkflowContext.Provider>
  );
}

// Course Enrollment Workflow
export function CourseEnrollmentFlow() {
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [enrollmentData, setEnrollmentData] = useState({
    paymentMethod: '',
    schedule: '',
    notifications: true,
  });

  const courses = [
    {
      id: '1',
      title: 'Advanced React Development',
      instructor: 'Sarah Johnson',
      duration: '8 weeks',
      price: 299,
      rating: 4.8,
      students: 1247,
      description:
        'Master advanced React patterns, hooks, and performance optimization',
      skills: ['React Hooks', 'Context API', 'Performance', 'Testing'],
      image: '🚀',
    },
    {
      id: '2',
      title: 'Full-Stack TypeScript',
      instructor: 'Mike Chen',
      duration: '12 weeks',
      price: 399,
      rating: 4.9,
      students: 892,
      description:
        'Build complete applications with TypeScript, Node.js, and databases',
      skills: ['TypeScript', 'Node.js', 'Prisma', 'API Design'],
      image: '⚡',
    },
    {
      id: '3',
      title: 'UI/UX Design Fundamentals',
      instructor: 'Emma Wilson',
      duration: '6 weeks',
      price: 199,
      rating: 4.7,
      students: 2103,
      description: 'Learn design principles, user research, and prototyping',
      skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
      image: '🎨',
    },
  ];

  if (!selectedCourse) {
    return (
      <Container size="xl" className="py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Choose Your Learning Path</h1>
          <p className="text-muted-foreground text-lg">
            Select a course to begin your learning journey
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="text-4xl mb-4">{course.image}</div>
                <h3 className="text-xl font-bold mb-2">{course.title}</h3>
                <p className="text-muted-foreground mb-4">
                  {course.description}
                </p>

                <div className="space-y-3 mb-4">
                  <Flex align="center" justify="between">
                    <span className="text-sm text-muted-foreground">
                      Instructor
                    </span>
                    <span className="font-medium">{course.instructor}</span>
                  </Flex>
                  <Flex align="center" justify="between">
                    <span className="text-sm text-muted-foreground">
                      Duration
                    </span>
                    <span className="font-medium">{course.duration}</span>
                  </Flex>
                  <Flex align="center" justify="between">
                    <span className="text-sm text-muted-foreground">
                      Students
                    </span>
                    <span className="font-medium">
                      {course.students.toLocaleString()}
                    </span>
                  </Flex>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {course.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" size="sm">
                      {skill}
                    </Badge>
                  ))}
                </div>

                <Flex align="center" justify="between" className="mb-4">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="font-medium">{course.rating}</span>
                  </div>
                  <div className="text-2xl font-bold">${course.price}</div>
                </Flex>

                <Button
                  className="w-full"
                  onClick={() => setSelectedCourse(course)}
                >
                  Enroll Now
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    );
  }

  return (
    <Container size="lg" className="py-8">
      <Card className="p-8">
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setSelectedCourse(null)}
            className="mb-4"
          >
            ← Back to Courses
          </Button>
          <h1 className="text-2xl font-bold mb-2">Complete Your Enrollment</h1>
          <p className="text-muted-foreground">
            You're enrolling in: <strong>{selectedCourse.title}</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Course Summary */}
          <Card variant="outlined" className="p-6">
            <h2 className="text-lg font-semibold mb-4">Course Summary</h2>
            <div className="space-y-3">
              <Flex justify="between">
                <span>Course</span>
                <span className="font-medium">{selectedCourse.title}</span>
              </Flex>
              <Flex justify="between">
                <span>Instructor</span>
                <span>{selectedCourse.instructor}</span>
              </Flex>
              <Flex justify="between">
                <span>Duration</span>
                <span>{selectedCourse.duration}</span>
              </Flex>
              <Flex justify="between">
                <span>Price</span>
                <span className="text-xl font-bold">
                  ${selectedCourse.price}
                </span>
              </Flex>
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-2">
                What you'll learn:
              </p>
              <div className="flex flex-wrap gap-1">
                {selectedCourse.skills.map((skill: string) => (
                  <Badge key={skill} variant="outline" size="sm">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>

          {/* Enrollment Form */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-3">Learning Schedule</h3>
              <div className="grid grid-cols-1 gap-2">
                {['Weekday Evenings', 'Weekend Intensive', 'Self-Paced'].map(
                  (option) => (
                    <label
                      key={option}
                      className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/20"
                    >
                      <input
                        type="radio"
                        name="schedule"
                        value={option}
                        checked={enrollmentData.schedule === option}
                        onChange={(e) =>
                          setEnrollmentData((prev) => ({
                            ...prev,
                            schedule: e.target.value,
                          }))
                        }
                      />
                      <span>{option}</span>
                    </label>
                  )
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-3">Payment Method</h3>
              <div className="grid grid-cols-1 gap-2">
                {['Credit Card', 'PayPal', 'Bank Transfer'].map((method) => (
                  <label
                    key={method}
                    className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/20"
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method}
                      checked={enrollmentData.paymentMethod === method}
                      onChange={(e) =>
                        setEnrollmentData((prev) => ({
                          ...prev,
                          paymentMethod: e.target.value,
                        }))
                      }
                    />
                    <span>{method}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 p-3">
                <input
                  type="checkbox"
                  checked={enrollmentData.notifications}
                  onChange={(e) =>
                    setEnrollmentData((prev) => ({
                      ...prev,
                      notifications: e.target.checked,
                    }))
                  }
                />
                <span>Send me course updates and notifications</span>
              </label>
            </div>

            <Button
              className="w-full"
              size="lg"
              disabled={
                !enrollmentData.schedule || !enrollmentData.paymentMethod
              }
            >
              Complete Enrollment - ${selectedCourse.price}
            </Button>
          </div>
        </div>
      </Card>
    </Container>
  );
}

// Training Program Creation Workflow
export function TrainingProgramCreationFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [programData, setProgramData] = useState({
    basicInfo: {
      title: '',
      description: '',
      category: '',
      duration: '',
      difficulty: '',
    },
    content: {
      modules: [],
      assessments: [],
      resources: [],
    },
    settings: {
      maxParticipants: 50,
      prerequisites: [],
      certificate: true,
      price: 0,
    },
  });

  const steps = [
    {
      title: 'Basic Information',
      description: 'Set up your program details',
      component: (
        <BasicInfoStep
          data={programData.basicInfo}
          onChange={(data) =>
            setProgramData((prev) => ({
              ...prev,
              basicInfo: { ...prev.basicInfo, ...data },
            }))
          }
        />
      ),
    },
    {
      title: 'Content Structure',
      description: 'Add modules and learning materials',
      component: (
        <ContentStep
          data={programData.content}
          onChange={(data) =>
            setProgramData((prev) => ({
              ...prev,
              content: { ...prev.content, ...data },
            }))
          }
        />
      ),
    },
    {
      title: 'Program Settings',
      description: 'Configure enrollment and completion settings',
      component: (
        <SettingsStep
          data={programData.settings}
          onChange={(data) =>
            setProgramData((prev) => ({
              ...prev,
              settings: { ...prev.settings, ...data },
            }))
          }
        />
      ),
    },
    {
      title: 'Review & Publish',
      description: 'Review your program and make it available',
      component: <ReviewStep data={programData} />,
    },
  ];

  return (
    <Container size="xl" className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Create Training Program</h1>
        <p className="text-muted-foreground">
          Follow these steps to create a comprehensive training program
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex items-center">
              <div
                className={cn(
                  'h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium',
                  index < currentStep
                    ? 'bg-success text-white'
                    : index === currentStep
                      ? 'bg-primary text-white'
                      : 'bg-muted text-muted-foreground'
                )}
              >
                {index < currentStep ? '✓' : index + 1}
              </div>
              <div className="ml-2 text-sm">
                <div
                  className={cn(
                    'font-medium',
                    index === currentStep
                      ? 'text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {step.title}
                </div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className="h-px bg-border flex-1 mx-4" />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <Card className="p-8 mb-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">
            {steps[currentStep].title}
          </h2>
          <p className="text-muted-foreground">
            {steps[currentStep].description}
          </p>
        </div>
        {steps[currentStep].component}
      </Card>

      {/* Navigation */}
      <Flex justify="between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
          disabled={currentStep === 0}
        >
          Previous
        </Button>
        <div className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {steps.length}
        </div>
        <Button
          onClick={() =>
            setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))
          }
          disabled={currentStep === steps.length - 1}
        >
          {currentStep === steps.length - 2 ? 'Review' : 'Next'}
        </Button>
      </Flex>
    </Container>
  );
}

// Step Components for Training Program Creation
function BasicInfoStep({
  data,
  onChange,
}: {
  data: any;
  onChange: (data: any) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Program Title
          </label>
          <Input
            placeholder="Enter program title"
            value={data.title}
            onChange={(e) => onChange({ title: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Category</label>
          <select
            className="w-full px-3 py-2 border border-input bg-background rounded-md"
            value={data.category}
            onChange={(e) => onChange({ category: e.target.value })}
          >
            <option value="">Select category</option>
            <option value="technical">Technical Skills</option>
            <option value="leadership">Leadership</option>
            <option value="compliance">Compliance</option>
            <option value="soft-skills">Soft Skills</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Description</label>
        <textarea
          className="w-full px-3 py-2 border border-input bg-background rounded-md"
          rows={4}
          placeholder="Describe what participants will learn..."
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">Duration</label>
          <select
            className="w-full px-3 py-2 border border-input bg-background rounded-md"
            value={data.duration}
            onChange={(e) => onChange({ duration: e.target.value })}
          >
            <option value="">Select duration</option>
            <option value="1-week">1 Week</option>
            <option value="2-weeks">2 Weeks</option>
            <option value="1-month">1 Month</option>
            <option value="3-months">3 Months</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Difficulty Level
          </label>
          <select
            className="w-full px-3 py-2 border border-input bg-background rounded-md"
            value={data.difficulty}
            onChange={(e) => onChange({ difficulty: e.target.value })}
          >
            <option value="">Select difficulty</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function ContentStep({
  data,
  onChange,
}: {
  data: any;
  onChange: (data: any) => void;
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">Content Modules</h3>
        <div className="border border-dashed border-border rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">📚</div>
          <h4 className="font-medium mb-2">Add Learning Modules</h4>
          <p className="text-muted-foreground mb-4">
            Create structured learning content for your program
          </p>
          <Button>Add Module</Button>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-4">Assessments</h3>
        <div className="border border-dashed border-border rounded-lg p-8 text-center">
          <div className="text-4xl mb-4">✅</div>
          <h4 className="font-medium mb-2">Add Assessments</h4>
          <p className="text-muted-foreground mb-4">
            Create quizzes and assignments to test understanding
          </p>
          <Button variant="outline">Add Assessment</Button>
        </div>
      </div>
    </div>
  );
}

function SettingsStep({
  data,
  onChange,
}: {
  data: any;
  onChange: (data: any) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Maximum Participants
          </label>
          <Input
            type="number"
            value={data.maxParticipants}
            onChange={(e) =>
              onChange({ maxParticipants: parseInt(e.target.value) })
            }
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">
            Program Price ($)
          </label>
          <Input
            type="number"
            value={data.price}
            onChange={(e) => onChange({ price: parseFloat(e.target.value) })}
          />
        </div>
      </div>

      <div>
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={data.certificate}
            onChange={(e) => onChange({ certificate: e.target.checked })}
          />
          <span>Award completion certificate</span>
        </label>
      </div>
    </div>
  );
}

function ReviewStep({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      <div className="bg-success/5 border border-success/20 rounded-lg p-6">
        <h3 className="font-semibold text-success mb-2">Ready to Publish!</h3>
        <p className="text-success/80">
          Your training program is configured and ready to be made available to
          participants.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card variant="outlined" className="p-4">
          <h4 className="font-medium mb-3">Program Overview</h4>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Title:</strong>{' '}
              {data.basicInfo.title || 'Untitled Program'}
            </div>
            <div>
              <strong>Category:</strong>{' '}
              {data.basicInfo.category || 'Not specified'}
            </div>
            <div>
              <strong>Duration:</strong>{' '}
              {data.basicInfo.duration || 'Not specified'}
            </div>
            <div>
              <strong>Difficulty:</strong>{' '}
              {data.basicInfo.difficulty || 'Not specified'}
            </div>
          </div>
        </Card>

        <Card variant="outlined" className="p-4">
          <h4 className="font-medium mb-3">Settings</h4>
          <div className="space-y-2 text-sm">
            <div>
              <strong>Max Participants:</strong> {data.settings.maxParticipants}
            </div>
            <div>
              <strong>Price:</strong> ${data.settings.price}
            </div>
            <div>
              <strong>Certificate:</strong>{' '}
              {data.settings.certificate ? 'Yes' : 'No'}
            </div>
          </div>
        </Card>
      </div>

      <div className="text-center pt-4">
        <Button size="lg" className="mr-4">
          Publish Program
        </Button>
        <Button variant="outline" size="lg">
          Save as Draft
        </Button>
      </div>
    </div>
  );
}
