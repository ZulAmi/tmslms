import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@tmslms.com" },
    update: {},
    create: {
      email: "admin@tmslms.com",
      name: "System Administrator",
      password: adminPassword,
      role: "ADMIN",
    },
  });

  // Create instructor
  const instructorPassword = await bcrypt.hash("instructor123", 12);
  const instructor = await prisma.user.upsert({
    where: { email: "instructor@tmslms.com" },
    update: {},
    create: {
      email: "instructor@tmslms.com",
      name: "John Instructor",
      password: instructorPassword,
      role: "INSTRUCTOR",
    },
  });

  // Create student
  const studentPassword = await bcrypt.hash("student123", 12);
  const student = await prisma.user.upsert({
    where: { email: "student@tmslms.com" },
    update: {},
    create: {
      email: "student@tmslms.com",
      name: "Jane Student",
      password: studentPassword,
      role: "STUDENT",
    },
  });

  // Create categories
  const webDevCategory = await prisma.category.upsert({
    where: { name: "Web Development" },
    update: {},
    create: {
      name: "Web Development",
      description: "Courses related to web development",
      color: "#3B82F6",
    },
  });

  const dataCategory = await prisma.category.upsert({
    where: { name: "Data Science" },
    update: {},
    create: {
      name: "Data Science",
      description: "Courses related to data science and analytics",
      color: "#10B981",
    },
  });

  // Create sample course
  const course = await prisma.course.upsert({
    where: { id: "sample-course-1" },
    update: {},
    create: {
      id: "sample-course-1",
      title: "Introduction to React Development",
      description: "Learn the fundamentals of React.js development",
      status: "PUBLISHED",
      instructorId: instructor.id,
    },
  });

  // Link course to category
  await prisma.courseCategory.upsert({
    where: { courseId_categoryId: { courseId: course.id, categoryId: webDevCategory.id } },
    update: {},
    create: {
      courseId: course.id,
      categoryId: webDevCategory.id,
    },
  });

  // Create module
  const module = await prisma.module.create({
    data: {
      title: "Getting Started",
      description: "Introduction to React basics",
      order: 1,
      courseId: course.id,
    },
  });

  // Create lesson
  const lesson = await prisma.lesson.create({
    data: {
      title: "What is React?",
      content: "React is a JavaScript library for building user interfaces...",
      type: "TEXT",
      order: 1,
      duration: 15,
      moduleId: module.id,
    },
  });

  // Enroll student in course
  await prisma.enrollment.create({
    data: {
      userId: student.id,
      courseId: course.id,
      status: "ACTIVE",
      progress: 25,
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log(`👤 Admin: ${admin.email} / admin123`);
  console.log(`👨‍🏫 Instructor: ${instructor.email} / instructor123`);
  console.log(`👨‍🎓 Student: ${student.email} / student123`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
