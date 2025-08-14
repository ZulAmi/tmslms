# TMS/LMS Enterprise Monorepo

A comprehensive enterprise-grade monorepo for Learning Management System (LMS) and Training Management System (TMS) built with modern technologies.

## 🏗️ Architecture

This monorepo contains:

### Applications

- **LMS** (`apps/lms`) - Learning Management System (Port 3001)
- **TMS** (`apps/tms`) - Training Management System (Port 3002)
- **Admin** (`apps/admin`) - Administrative Dashboard (Port 3003)

### Packages

- **@repo/ui** - Shared UI components built with Radix UI and Tailwind CSS
- **@repo/shared** - Shared utilities, types, and business logic
- **@repo/database** - Prisma ORM setup with PostgreSQL
- **@repo/auth** - NextAuth.js authentication configuration
- **@repo/config** - Environment validation and configuration
- **@repo/eslint-config** - Shared ESLint configurations
- **@repo/prettier-config** - Shared Prettier configuration
- **@repo/typescript-config** - Shared TypeScript configurations

## 🚀 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Monorepo**: Turborepo
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5
- **UI Components**: Radix UI + Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Code Quality**: ESLint, Prettier, Husky

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- PostgreSQL (if running locally)

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd tmslms-monorepo
npm install
```

### 2. Environment Setup

```bash
# Copy environment template
cp .env.example .env

# Update the .env file with your database URL and secrets
```

### 3. Database Setup

```bash
# Start PostgreSQL with Docker
docker-compose up postgres -d

# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed the database
npm run db:seed
```

### 4. Development Mode

```bash
# Start all applications in development mode
npm run dev

# Or start individual apps
npm run dev --workspace=apps/lms     # LMS on port 3001
npm run dev --workspace=apps/tms     # TMS on port 3002
npm run dev --workspace=apps/admin   # Admin on port 3003
```

## 🏃‍♂️ Available Scripts

### Root Level

- `npm run dev` - Start all apps in development mode
- `npm run build` - Build all applications
- `npm run lint` - Lint all packages
- `npm run type-check` - Type check all packages
- `npm run test` - Run tests across all packages
- `npm run clean` - Clean build artifacts

### Database

- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio

### Docker

- `npm run docker:build` - Build Docker images
- `npm run docker:up` - Start all services with Docker Compose
- `npm run docker:down` - Stop all Docker services

## 🐳 Docker Setup

### Development with Docker

```bash
# Start all services
docker-compose up

# Start specific services
docker-compose up postgres redis
```

### Production Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

## 🔐 Authentication

Default development credentials:

- **Admin**: admin@tmslms.com / admin123
- **Instructor**: instructor@tmslms.com / instructor123
- **Student**: student@tmslms.com / student123

## 🌍 Multi-Environment Support

### Development

```bash
cp .env.example .env
npm run dev
```

### Staging

```bash
cp .env.staging .env
npm run build
npm run start
```

### Production

```bash
cp .env.production .env
npm run build
npm run start
```

## 📁 Project Structure

```
tmslms-monorepo/
├── apps/
│   ├── lms/                 # Learning Management System
│   ├── tms/                 # Training Management System
│   └── admin/               # Admin Dashboard
├── packages/
│   ├── ui/                  # Shared UI components
│   ├── shared/              # Shared utilities and types
│   ├── database/            # Prisma database setup
│   ├── auth/                # Authentication configuration
│   ├── config/              # Environment configuration
│   ├── eslint-config/       # ESLint configurations
│   ├── prettier-config/     # Prettier configuration
│   └── typescript-config/   # TypeScript configurations
├── .github/
│   └── workflows/           # GitHub Actions CI/CD
├── docker-compose.yml       # Docker services
├── turbo.json              # Turborepo configuration
└── package.json            # Root package configuration
```

## 🚀 CI/CD Pipeline

The project includes comprehensive GitHub Actions workflows:

- **Continuous Integration**: Lint, test, and build on every PR
- **Security Scanning**: Automated vulnerability scanning
- **Docker Build**: Multi-stage Docker builds for production
- **Deployment**: Automated deployment to staging and production
- **Database Migrations**: Controlled database schema updates

## 📊 Monitoring and Logging

- **Environment Validation**: Type-safe environment variable validation
- **Error Tracking**: Sentry integration (optional)
- **Performance Monitoring**: Built-in Next.js analytics
- **Health Checks**: Application health monitoring endpoints

## 🛡️ Security Features

- **Environment Variable Validation**: Type-safe configuration
- **Authentication**: Secure NextAuth.js setup
- **Rate Limiting**: Nginx-based rate limiting
- **Security Headers**: Comprehensive security headers
- **Input Validation**: Zod schema validation throughout

## 🔧 Development Tools

- **Hot Module Replacement**: Instant feedback during development
- **Type Safety**: Full TypeScript coverage
- **Code Quality**: ESLint, Prettier, and Husky pre-commit hooks
- **Database Tools**: Prisma Studio for database management

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes and add tests
4. Run the test suite: `npm run test`
5. Commit your changes: `git commit -m 'Add new feature'`
6. Push to the branch: `git push origin feature/new-feature`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation in each package
- Review the troubleshooting guide below

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Issues**

   ```bash
   # Check if PostgreSQL is running
   docker-compose ps postgres

   # Restart database
   docker-compose restart postgres
   ```

2. **Build Errors**

   ```bash
   # Clean and reinstall dependencies
   npm run clean
   rm -rf node_modules
   npm install
   ```

3. **Port Conflicts**

   ```bash
   # Check what's running on ports
   lsof -i :3001
   lsof -i :3002
   lsof -i :3003
   ```

4. **Prisma Issues**
   ```bash
   # Reset and regenerate Prisma client
   npm run db:generate
   ```
