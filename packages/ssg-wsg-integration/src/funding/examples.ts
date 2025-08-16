/**
 * SSG-WSG Funding System - Basic Usage Examples
 * Simple examples demonstrating core functionality
 */

import { getFundingSystemInfo } from './index';

// Utility functions
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-SG');
};

/**
 * Example 1: System Information
 */
export function showSystemInformation(): void {
  console.log('🚀 SSG-WSG Funding Management System');
  console.log('====================================\n');

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

📋 Step 2: Import the components
   import { FundingManagementSystem } from '@tmslms/ssg-wsg-integration/funding';

📋 Step 3: Create a system instance
   const fundingSystem = new FundingManagementSystem(
     cacheService,
     queueService,
     ['claims', 'eligibility'],
     {}
   );

🎯 You're ready to start processing SSG-WSG funding operations!
  `);
}

/**
 * Example 3: Simple Demo
 */
export async function runSimpleDemo(): Promise<void> {
  console.log('🎯 SSG-WSG Funding Management System - Demo');
  console.log('===========================================');

  try {
    // Show system information
    showSystemInformation();

    // Show quick start guide
    showQuickStartGuide();

    console.log('\n🎉 Demo completed successfully!');
    console.log('📘 For full examples, check the documentation.');
  } catch (error) {
    console.error('\n❌ Demo execution failed:', error);
  }
}

/**
 * Named exports for individual use
 */
export { showSystemInformation as getSystemInformation };
export { showQuickStartGuide as quickStartGuide };
export { runSimpleDemo as runBasicExamples };
