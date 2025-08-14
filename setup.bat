@echo off
REM TMSLMS Development Setup Script for Windows

echo 🚀 Setting up TMSLMS Development Environment...

REM Check if .env exists
if not exist .env (
    echo 📝 Creating .env file from template...
    copy .env.example .env
    echo ✅ .env file created. Please update it with your database credentials.
)

REM Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo 📦 Installing dependencies...
    npm install
)

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Docker is not running. Please start Docker to use the database.
    exit /b 1
)

REM Start PostgreSQL and Redis with Docker Compose
echo 🐳 Starting database and Redis...
docker-compose up postgres redis -d

REM Wait for database to be ready
echo ⏳ Waiting for database to be ready...
timeout /t 10 /nobreak >nul

REM Generate Prisma client
echo 🔧 Generating Prisma client...
npm run db:generate

REM Check if database is migrated
echo 📊 Setting up database schema...
npm run db:push

REM Seed the database
echo 🌱 Seeding database with initial data...
npm run db:seed

echo.
echo ✅ Setup complete! 🎉
echo.
echo Development URLs:
echo 🎓 LMS:   http://localhost:3001
echo 📚 TMS:   http://localhost:3002
echo ⚙️  Admin: http://localhost:3003
echo.
echo Default login credentials:
echo 👤 Admin:      admin@tmslms.com / admin123
echo 👨‍🏫 Instructor: instructor@tmslms.com / instructor123
echo 👨‍🎓 Student:    student@tmslms.com / student123
echo.
echo To start development servers:
echo npm run dev
echo.
