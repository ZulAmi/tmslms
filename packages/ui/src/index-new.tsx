// ============================================================================
// TMSLMS Comprehensive UI/UX System
// Professional, accessible, and complete user experience components
// ============================================================================

// Core Design System Components
export { Button, LoadingSpinner, buttonVariants } from './components/button';
export {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
  cardVariants,
} from './components/card';
export { Input, inputVariants } from './components/input';
export {
  Badge,
  StatusBadge,
  PriorityBadge,
  badgeVariants,
} from './components/badge';

// Layout System
export {
  Layout,
  Container,
  Header,
  Footer,
  Section,
  Grid,
  Flex,
  Stack,
  Divider,
} from './components/layout';

// Form System
export {
  Form,
  FormField,
  FormLabel,
  FormDescription,
  FormMessage,
} from './components/form';

// Data Display
export {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  DataTable,
} from './components/table';

// Complete Authentication System
export {
  AuthLayout,
  LoginForm,
  RegisterForm,
  ForgotPasswordForm,
  AuthProvider,
  useAuth,
} from './components/auth';

// Comprehensive Navigation System
export {
  Navigation,
  NavigationItem,
  NavigationGroup,
  Sidebar,
  SidebarItem,
  Breadcrumb,
  TopNav,
} from './components/navigation';

// User Workflow System
export {
  CourseEnrollmentFlow,
  TrainingProgramCreationFlow,
  WorkflowProvider,
  useWorkflow,
} from './components/workflows';

// Professional Dashboards
export {
  StudentDashboard,
  InstructorDashboard,
  AdminDashboard,
} from './components/dashboards';

// Advanced User Experience Components
export {
  UXProvider,
  useUX,
  LearningProgressTracker,
  SkillDevelopmentPath,
  InteractiveCoursePlayer,
} from './components/user-experience';

// Onboarding & User Journey System
export { OnboardingFlow } from './components/onboarding';

// Utilities
export { cn } from './lib/utils';
export * from './utils';
