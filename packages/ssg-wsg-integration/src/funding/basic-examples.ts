/**
 * SSG-WSG Funding System - Basic Usage Examples
 * Simple examples demonstrating core functionality
 */

import { FundingManagementSystem, getFundingSystemInfo } from './index';

/**
 * Example 1: System Information
 */
export function showSystemInformation(): void {
  console.log('🚀 SSG-WSG Funding Management System');
  console.log('====================================\n');

  // Get system information
  const systemInfo = getFundingSystemInfo();

  console.log(`📋 System Version: ${systemInfo.version}`);
  console.log(`🔧 Available Services (${systemInfo.services.length}):`);
  systemInfo.services.forEach((service, index) => {
    console.log(`   ${index + 1}. ${service}`);
  });

  console.log(`\n💡 Key Features (${systemInfo.features.length}):`);
  systemInfo.features.forEach((feature, index) => {
    console.log(`   ${index + 1}. ${feature}`);
  });

  console.log(
    `\n🎯 Supported Schemes (${systemInfo.supportedSchemes.length}):`
  );
  systemInfo.supportedSchemes.forEach((scheme, index) => {
    console.log(`   ${index + 1}. ${scheme}`);
  });

  console.log(
    `\n🔗 Available Integrations (${systemInfo.integrationsAvailable.length}):`
  );
  systemInfo.integrationsAvailable.forEach((integration, index) => {
    console.log(`   ${index + 1}. ${integration}`);
  });
}

/**
 * Example 2: Quick Start Guide
 */
export function showQuickStartGuide(): void {
  console.log('\n🚀 Quick Start Guide');
  console.log('===================');

  console.log(`
📋 Step 1: Install the package
   npm install @tmslms/ssg-wsg-integration

📋 Step 2: Import the main components
   import { FundingManagementSystem } from '@tmslms/ssg-wsg-integration/funding';

📋 Step 3: Create required services
   const cacheService = new CacheService();
   const queueService = new QueueService();

📋 Step 4: Create a system instance
   const fundingSystem = new FundingManagementSystem(
     cacheService,                    // cache service
     queueService,                    // queue service
     ['claims', 'eligibility'],       // enabled services
     {}                              // system options
   );

📋 Step 5: Use the services
   const claimsService = fundingSystem.getClaimsService();
   const eligibilityService = fundingSystem.getEligibilityService();

🎯 You're ready to start processing SSG-WSG funding operations!
  `);
}

/**
 * Main Demo Function
 */
export async function runExamples(): Promise<void> {
  console.log('🎯 SSG-WSG Funding Management System - Basic Examples');
  console.log('=====================================================');

  try {
    // Show system information
    showSystemInformation();

    // Show quick start guide
    showQuickStartGuide();

    console.log('\n🎉 Examples completed successfully!');
    console.log('💡 System information and quick start guide displayed');
  } catch (error) {
    console.error('\n❌ Example execution failed:', error);
  }
}

// Default export
export default {
  showSystemInformation,
  showQuickStartGuide,
  runExamples,
};
