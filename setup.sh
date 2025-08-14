#!/bin/bash

# TMSLMS Development Setup Script

echo "🚀 Setting up TMSLMS Development Environment..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created. Please update it with your database credentials."
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "⚠️  Docker is not running. Please start Docker to use the database."
    exit 1
fi

# Start PostgreSQL and Redis with Docker Compose
echo "🐳 Starting database and Redis..."
docker-compose up postgres redis -d

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
sleep 10

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npm run db:generate

# Check if database is migrated
echo "📊 Setting up database schema..."
npm run db:push

# Seed the database
echo "🌱 Seeding database with initial data..."
npm run db:seed

echo ""
echo "✅ Setup complete! 🎉"
echo ""
echo "Development URLs:"
echo "🎓 LMS:   http://localhost:3001"
echo "📚 TMS:   http://localhost:3002"
echo "⚙️  Admin: http://localhost:3003"
echo ""
echo "Default login credentials:"
echo "👤 Admin:      admin@tmslms.com / admin123"
echo "👨‍🏫 Instructor: instructor@tmslms.com / instructor123"
echo "👨‍🎓 Student:    student@tmslms.com / student123"
echo ""
echo "To start development servers:"
echo "npm run dev"
echo ""
