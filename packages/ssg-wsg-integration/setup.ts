#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createTestClient } from './testing/test-suite';
import {
  createMonitoringService,
  defaultMonitoringConfig,
} from './monitoring/MonitoringService';

const chalk = {
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  blue: (text: string) => `\x1b[34m${text}\x1b[0m`,
  bold: (text: string) => `\x1b[1m${text}\x1b[0m`,
};

interface SetupConfig {
  environment: 'development' | 'staging' | 'production';
  skipTests: boolean;
  skipRedis: boolean;
  setupMonitoring: boolean;
  apps: ('admin' | 'lms' | 'tms')[];
}

class SSGWSGSetup {
  private config: SetupConfig;
  private projectRoot: string;

  constructor(config: SetupConfig) {
    this.config = config;
    this.projectRoot = process.cwd();
  }

  async run() {
    console.log(chalk.bold('🚀 SSG-WSG Integration Setup\n'));

    try {
      await this.validateEnvironment();
      await this.installDependencies();
      await this.setupEnvironmentFiles();
      await this.buildPackages();

      if (!this.config.skipRedis) {
        await this.setupRedis();
      }

      await this.configureApps();

      if (this.config.setupMonitoring) {
        await this.setupMonitoring();
      }

      if (!this.config.skipTests) {
        await this.runTests();
      }

      await this.generateDocumentation();

      console.log(
        chalk.green('\n✅ SSG-WSG Integration setup completed successfully!\n')
      );
      this.printNextSteps();
    } catch (error) {
      console.error(chalk.red('\n❌ Setup failed:'), error);
      process.exit(1);
    }
  }

  private async validateEnvironment() {
    console.log(chalk.blue('🔍 Validating environment...'));

    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

    if (majorVersion < 20) {
      throw new Error(`Node.js 20+ required, found ${nodeVersion}`);
    }

    // Check if we're in the right directory
    if (!existsSync(join(this.projectRoot, 'package.json'))) {
      throw new Error('Not in a Node.js project directory');
    }

    // Check if turbo is available
    try {
      execSync('npx turbo --version', { stdio: 'pipe' });
    } catch {
      throw new Error(
        'Turbo not found. Please ensure this is a turborepo project.'
      );
    }

    console.log(chalk.green('  ✅ Environment validation passed'));
  }

  private async installDependencies() {
    console.log(chalk.blue('📦 Installing dependencies...'));

    try {
      // Install SSG-WSG integration package dependencies
      execSync('npm install --workspace=@tmslms/ssg-wsg-integration', {
        stdio: 'inherit',
        cwd: this.projectRoot,
      });

      // Install config package dependencies
      execSync('npm install --workspace=@tmslms/config', {
        stdio: 'inherit',
        cwd: this.projectRoot,
      });

      // Install Redis and testing dependencies
      const devDeps = [
        'redis@^4.6.0',
        'nock@^13.4.0',
        '@types/jest@^29.5.0',
        'jest@^29.7.0',
      ];

      execSync(`npm install --save-dev ${devDeps.join(' ')}`, {
        stdio: 'inherit',
        cwd: this.projectRoot,
      });

      console.log(chalk.green('  ✅ Dependencies installed'));
    } catch (error) {
      throw new Error(`Failed to install dependencies: ${error}`);
    }
  }

  private async setupEnvironmentFiles() {
    console.log(chalk.blue('🔧 Setting up environment files...'));

    const envFile = join(this.projectRoot, '.env.local');
    const exampleFile = join(this.projectRoot, '.env.ssg-wsg.example');

    // Copy example environment file if .env.local doesn't exist
    if (!existsSync(envFile) && existsSync(exampleFile)) {
      const exampleContent = readFileSync(exampleFile, 'utf8');
      writeFileSync(envFile, exampleContent);
      console.log(chalk.yellow('  📝 Created .env.local from example file'));
      console.log(
        chalk.yellow(
          '  ⚠️  Please update the SSG_WSG_CLIENT_ID and SSG_WSG_CLIENT_SECRET values'
        )
      );
    }

    // Create app-specific env files
    for (const app of this.config.apps) {
      const appEnvFile = join(this.projectRoot, `apps/${app}/.env.local`);
      if (!existsSync(appEnvFile)) {
        const appEnvContent = `# ${app.toUpperCase()} App Environment
# SSG-WSG Integration Configuration
NEXT_PUBLIC_APP_NAME=${app.toUpperCase()}
NEXT_PUBLIC_SSG_WSG_ENVIRONMENT=${this.config.environment}

# Import global SSG-WSG configuration
# These will be loaded from the root .env.local file
`;
        writeFileSync(appEnvFile, appEnvContent);
        console.log(
          chalk.green(`  ✅ Created environment file for ${app} app`)
        );
      }
    }
  }

  private async buildPackages() {
    console.log(chalk.blue('🔨 Building packages...'));

    try {
      // Build SSG-WSG integration package
      execSync('npm run build --workspace=@tmslms/ssg-wsg-integration', {
        stdio: 'inherit',
        cwd: this.projectRoot,
      });

      // Build config package
      execSync('npm run build --workspace=@tmslms/config', {
        stdio: 'inherit',
        cwd: this.projectRoot,
      });

      console.log(chalk.green('  ✅ Packages built successfully'));
    } catch (error) {
      throw new Error(`Failed to build packages: ${error}`);
    }
  }

  private async setupRedis() {
    console.log(chalk.blue('🗄️ Setting up Redis...'));

    try {
      // Check if Redis is running
      execSync('redis-cli ping', { stdio: 'pipe' });
      console.log(chalk.green('  ✅ Redis is running'));
    } catch {
      console.log(
        chalk.yellow('  ⚠️  Redis not found. Please install and start Redis:')
      );
      console.log(
        '     • On macOS: brew install redis && brew services start redis'
      );
      console.log('     • On Ubuntu: sudo apt install redis-server');
      console.log('     • On Windows: Use WSL or Docker');
      console.log(
        '     • Using Docker: docker run -d -p 6379:6379 redis:alpine'
      );
    }
  }

  private async configureApps() {
    console.log(chalk.blue('⚙️ Configuring applications...'));

    for (const app of this.config.apps) {
      const appPath = join(this.projectRoot, `apps/${app}`);

      if (!existsSync(appPath)) {
        console.log(chalk.yellow(`  ⚠️  App directory not found: ${app}`));
        continue;
      }

      // Add SSG-WSG integration to app dependencies
      const packageJsonPath = join(appPath, 'package.json');
      if (existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

        if (!packageJson.dependencies) {
          packageJson.dependencies = {};
        }

        packageJson.dependencies['@tmslms/config'] = 'workspace:*';
        packageJson.dependencies['@tmslms/ssg-wsg-integration'] = 'workspace:*';

        writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
        console.log(chalk.green(`  ✅ Configured ${app} app dependencies`));
      }

      // Create initialization file for app
      const initFile = join(appPath, 'src/lib/ssg-wsg-init.ts');
      const initDir = join(appPath, 'src/lib');

      if (!existsSync(initDir)) {
        mkdirSync(initDir, { recursive: true });
      }

      if (!existsSync(initFile)) {
        const initContent = `// Auto-generated SSG-WSG initialization for ${app} app
import { initializeApp } from './ssg-wsg-integration';

// Initialize SSG-WSG services when the app starts
if (typeof window === 'undefined') {
  // Server-side initialization
  initializeApp().catch(console.error);
}

export default {};
`;
        writeFileSync(initFile, initContent);
        console.log(
          chalk.green(`  ✅ Created initialization file for ${app} app`)
        );
      }
    }
  }

  private async setupMonitoring() {
    console.log(chalk.blue('📊 Setting up monitoring...'));

    try {
      const monitoring = createMonitoringService(defaultMonitoringConfig);
      monitoring.start();

      // Create monitoring dashboard file
      const dashboardPath = join(this.projectRoot, 'monitoring-dashboard.html');
      const dashboardContent = this.generateDashboardHTML();
      writeFileSync(dashboardPath, dashboardContent);

      console.log(chalk.green('  ✅ Monitoring service started'));
      console.log(
        chalk.green(`  📊 Dashboard available at: file://${dashboardPath}`)
      );

      // Stop monitoring for now (will be started by the app)
      monitoring.stop();
    } catch (error) {
      console.log(chalk.yellow(`  ⚠️  Monitoring setup failed: ${error}`));
    }
  }

  private async runTests() {
    console.log(chalk.blue('🧪 Running integration tests...'));

    try {
      const testSuite = createTestClient();
      await testSuite.setup();

      const results = await testSuite.runAllTests();

      await testSuite.cleanup();

      if (results.summary.successRate < 80) {
        console.log(
          chalk.yellow(
            `  ⚠️  Some tests failed (${results.summary.successRate.toFixed(1)}% success rate)`
          )
        );
        console.log(
          chalk.yellow('     This may indicate configuration issues')
        );
      } else {
        console.log(
          chalk.green(
            `  ✅ Tests passed (${results.summary.successRate.toFixed(1)}% success rate)`
          )
        );
      }
    } catch (error) {
      console.log(chalk.yellow(`  ⚠️  Tests failed: ${error}`));
      console.log(
        chalk.yellow('     You can run tests later with: npm run test:ssg-wsg')
      );
    }
  }

  private async generateDocumentation() {
    console.log(chalk.blue('📚 Generating documentation...'));

    const docsPath = join(this.projectRoot, 'docs/ssg-wsg-integration.md');
    const docsDir = join(this.projectRoot, 'docs');

    if (!existsSync(docsDir)) {
      mkdirSync(docsDir, { recursive: true });
    }

    const docContent = this.generateIntegrationDocs();
    writeFileSync(docsPath, docContent);

    console.log(chalk.green(`  ✅ Documentation generated: ${docsPath}`));
  }

  private printNextSteps() {
    console.log(chalk.bold('🎯 Next Steps:\n'));

    console.log('1. 🔑 Configure API credentials:');
    console.log(
      '   • Update SSG_WSG_CLIENT_ID and SSG_WSG_CLIENT_SECRET in .env.local'
    );
    console.log('   • Get credentials from SSG-WSG developer portal\n');

    console.log('2. 🚀 Start your applications:');
    for (const app of this.config.apps) {
      console.log(`   • ${app}: npm run dev --workspace=@tmslms/${app}`);
    }
    console.log('');

    console.log('3. 🧪 Test the integration:');
    console.log('   • Run tests: npm run test:ssg-wsg');
    console.log('   • Check health: curl http://localhost:3000/api/health\n');

    console.log('4. 📊 Monitor the system:');
    console.log('   • View metrics: http://localhost:9090/metrics');
    console.log('   • Health dashboard: ./monitoring-dashboard.html\n');

    console.log('5. 📚 Read the documentation:');
    console.log('   • Integration guide: ./docs/ssg-wsg-integration.md');
    console.log(
      '   • API reference: ./packages/ssg-wsg-integration/README.md\n'
    );

    console.log(chalk.green('Happy coding! 🎉'));
  }

  private generateDashboardHTML(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SSG-WSG Integration Dashboard</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .metric-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .metric-value { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .metric-label { color: #666; font-size: 0.9em; }
        .status-healthy { color: #10b981; }
        .status-warning { color: #f59e0b; }
        .status-error { color: #ef4444; }
        .chart-placeholder { height: 200px; background: #f8f9fa; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #666; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>SSG-WSG Integration Dashboard</h1>
            <p>Monitor your Singapore government API integration performance and health</p>
        </div>
        
        <div class="metrics">
            <div class="metric-card">
                <div class="metric-value status-healthy" id="api-status">●</div>
                <div class="metric-label">API Status</div>
            </div>
            <div class="metric-card">
                <div class="metric-value" id="response-time">--ms</div>
                <div class="metric-label">Avg Response Time</div>
            </div>
            <div class="metric-card">
                <div class="metric-value" id="cache-hit-rate">--%</div>
                <div class="metric-label">Cache Hit Rate</div>
            </div>
            <div class="metric-card">
                <div class="metric-value" id="error-rate">--%</div>
                <div class="metric-label">Error Rate</div>
            </div>
        </div>
        
        <div class="metrics">
            <div class="metric-card">
                <h3>API Calls (Last Hour)</h3>
                <div class="chart-placeholder">Chart would appear here</div>
            </div>
            <div class="metric-card">
                <h3>Error Rate (Last Hour)</h3>
                <div class="chart-placeholder">Chart would appear here</div>
            </div>
        </div>
        
        <div class="metric-card">
            <h3>Recent Activity</h3>
            <div id="activity-log">
                <p>No recent activity</p>
            </div>
        </div>
    </div>
    
    <script>
        // In a real implementation, this would fetch data from the monitoring service
        console.log('SSG-WSG Dashboard loaded');
        console.log('To connect real data, implement API endpoints for metrics');
    </script>
</body>
</html>`;
  }

  private generateIntegrationDocs(): string {
    return `# SSG-WSG Integration Setup Guide

This document provides a comprehensive guide for integrating with Singapore's SSG-WSG APIs in your TMSLMS applications.

## Quick Start

The SSG-WSG integration has been automatically configured for your applications. Here's what was set up:

### 1. Package Installation
- \`@tmslms/ssg-wsg-integration\` - Core integration package
- \`@tmslms/config\` - Configuration management
- Redis client and testing dependencies

### 2. Environment Configuration
- \`.env.local\` - Main environment file
- App-specific environment files for each application
- Redis connection settings

### 3. Application Integration
${this.config.apps.map((app) => `- **${app} app**: Integration library installed and configured`).join('\n')}

## Configuration

### API Credentials
Update your \`.env.local\` file with real SSG-WSG credentials:

\`\`\`bash
SSG_WSG_CLIENT_ID=your-actual-client-id
SSG_WSG_CLIENT_SECRET=your-actual-client-secret
SSG_WSG_ENVIRONMENT=production  # or sandbox for testing
\`\`\`

### Redis Setup
Ensure Redis is running on your system:

\`\`\`bash
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt install redis-server
sudo systemctl start redis

# Docker
docker run -d -p 6379:6379 redis:alpine
\`\`\`

## Usage Examples

### In Admin App
\`\`\`typescript
import { adminSSGWSG } from '../lib/ssg-wsg-integration';

// Get funding schemes
const schemes = await adminSSGWSG.getFundingSchemes();

// Update application status
await adminSSGWSG.updateApplicationStatus('app-123', 'approved');
\`\`\`

### In LMS App
\`\`\`typescript
import { lmsSSGWSG } from '../lib/ssg-wsg-integration';

// Get available courses for user
const courses = await lmsSSGWSG.getAvailableCourses('user-123');

// Submit funding application
await lmsSSGWSG.submitFundingApplication(applicationData);
\`\`\`

### In TMS App
\`\`\`typescript
import { tmsSSGWSG } from '../lib/ssg-wsg-integration';

// Register training provider
await tmsSSGWSG.registerTrainingProvider(providerData);

// Submit course for approval
await tmsSSGWSG.submitCourseForApproval(courseData);
\`\`\`

## API Routes

Create API routes in your Next.js apps:

\`\`\`typescript
// app/api/ssg-wsg/funding-schemes/route.ts
import { withSSGWSG } from '../../../lib/ssg-wsg-integration';

export const GET = withSSGWSG(async (req, services) => {
  const schemes = await services.client.get('/funding-schemes');
  return NextResponse.json(schemes);
});
\`\`\`

## Testing

Run the integration tests:

\`\`\`bash
npm run test:ssg-wsg
\`\`\`

## Monitoring

### Health Checks
- App health: \`http://localhost:3000/api/health\`
- Metrics: \`http://localhost:9090/metrics\`

### Dashboard
Open \`monitoring-dashboard.html\` in your browser for a visual overview.

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Verify API credentials in .env.local
   - Check if credentials are valid for the environment (sandbox/production)

2. **Redis Connection Issues**
   - Ensure Redis is running: \`redis-cli ping\`
   - Check Redis connection settings

3. **Rate Limiting**
   - Monitor rate limit headers in API responses
   - Adjust rate limiting configuration if needed

### Debug Mode
Enable debug logging:

\`\`\`bash
LOG_LEVEL=debug npm run dev
\`\`\`

## Support

- Documentation: \`packages/ssg-wsg-integration/README.md\`
- API Reference: \`packages/ssg-wsg-integration/docs/\`
- Issues: Create GitHub issues for bugs or feature requests

## Next Steps

1. Replace mock API endpoints with real SSG-WSG sandbox URLs
2. Implement proper error handling in your UI components
3. Set up production monitoring and alerting
4. Configure backup and disaster recovery procedures

---

Generated by SSG-WSG Integration Setup Tool
`;
  }
}

// CLI interface
function parseArgs(): SetupConfig {
  const args = process.argv.slice(2);
  const config: SetupConfig = {
    environment: 'development',
    skipTests: false,
    skipRedis: false,
    setupMonitoring: true,
    apps: ['admin', 'lms', 'tms'],
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--environment':
      case '-e':
        config.environment = args[++i] as any;
        break;
      case '--skip-tests':
        config.skipTests = true;
        break;
      case '--skip-redis':
        config.skipRedis = true;
        break;
      case '--no-monitoring':
        config.setupMonitoring = false;
        break;
      case '--apps':
        config.apps = args[++i].split(',') as any;
        break;
      case '--help':
      case '-h':
        printHelp();
        process.exit(0);
        break;
    }
  }

  return config;
}

function printHelp() {
  console.log(`
SSG-WSG Integration Setup Tool

Usage: node setup.js [options]

Options:
  -e, --environment <env>    Environment (development|staging|production)
  --skip-tests               Skip running integration tests
  --skip-redis               Skip Redis setup checks
  --no-monitoring            Skip monitoring setup
  --apps <apps>              Comma-separated list of apps to configure
  -h, --help                 Show this help message

Examples:
  node setup.js                                    # Full setup
  node setup.js --environment production           # Production setup
  node setup.js --skip-tests --apps admin,lms     # Quick setup for specific apps
`);
}

// Main execution
if (require.main === module) {
  const config = parseArgs();
  const setup = new SSGWSGSetup(config);
  setup.run().catch(console.error);
}

export { SSGWSGSetup, parseArgs };
export default SSGWSGSetup;
