import { z } from "zod";

// User types
export const UserRole = z.enum(["ADMIN", "INSTRUCTOR", "STUDENT", "MANAGER"]);
export type UserRole = z.infer<typeof UserRole>;

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: UserRole,
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type User = z.infer<typeof UserSchema>;

// Course types
export const CourseStatus = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);
export type CourseStatus = z.infer<typeof CourseStatus>;

export const CourseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().optional(),
  status: CourseStatus,
  instructorId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Course = z.infer<typeof CourseSchema>;

// Enrollment types
export const EnrollmentStatus = z.enum(["ACTIVE", "COMPLETED", "DROPPED"]);
export type EnrollmentStatus = z.infer<typeof EnrollmentStatus>;

export const EnrollmentSchema = z.object({
  id: z.string(),
  userId: z.string(),
  courseId: z.string(),
  status: EnrollmentStatus,
  enrolledAt: z.date(),
  completedAt: z.date().optional(),
});
export type Enrollment = z.infer<typeof EnrollmentSchema>;

// API Response types
export const ApiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.any().optional(),
  error: z.string().optional(),
});
export type ApiResponse<T = any> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
};
