# Installation Guide for Course Authoring Package

## Dependencies Installation

This package requires several dependencies to be installed. If you encounter module resolution issues, follow these steps:

### Method 1: Install from Root (Recommended)

```bash
# From the project root directory
npm install

# If using yarn workspaces
yarn install

# If using pnpm workspaces
pnpm install
```

### Method 2: Manual Dependency Installation

If workspace installation fails, you can install dependencies manually:

```bash
cd packages/course-authoring
npm install --no-workspaces

# Install specific packages that might be missing
npm install xlsx@^0.18.5
npm install @types/xlsx@^0.0.36
```

### Method 3: Alternative Package Manager

If npm workspaces are not working, try using yarn or pnpm:

```bash
# Using yarn
yarn install

# Using pnpm
pnpm install
```

## Common Issues

### 1. "Cannot find module 'xlsx'" Error

This error occurs when the xlsx package is not properly installed. Solutions:

1. **Check if node_modules exists**: Ensure the xlsx package is in `node_modules/xlsx`
2. **Reinstall dependencies**: Delete `node_modules` and `package-lock.json`, then run `npm install`
3. **Use alternative import**: The code includes a fallback import mechanism

### 2. Workspace Protocol Errors

If you see errors like "Unsupported URL Type 'workspace:'":

1. **Update npm**: Ensure you're using npm version 7 or higher
2. **Use yarn**: Switch to yarn which has better workspace support
3. **Manual installation**: Install packages individually without workspace protocol

### 3. TypeScript Module Resolution

If TypeScript can't find modules:

1. **Check tsconfig.json**: Ensure proper module resolution settings
2. **Install types**: Make sure `@types/xlsx` is installed
3. **Restart TypeScript server**: In VS Code, press Ctrl+Shift+P and run "TypeScript: Restart TS Server"

## Production Deployment

For production environments, ensure all dependencies are installed:

```bash
# Install production dependencies
npm ci --only=production

# Or include dev dependencies if needed for build
npm ci
```

## Development Setup

For development with hot reloading:

```bash
# Install all dependencies including dev dependencies
npm install

# Run in development mode
npm run dev
```

## Troubleshooting

If you continue to experience issues:

1. Clear npm cache: `npm cache clean --force`
2. Delete node_modules: `rm -rf node_modules package-lock.json`
3. Reinstall: `npm install`
4. Check Node.js version: Ensure you're using Node.js 16 or higher

For additional support, check the main project README or create an issue in the repository.
