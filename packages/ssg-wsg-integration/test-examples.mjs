#!/usr/bin/env node

/**
 * Test script for SSG-WSG Funding Examples
 */

import { getSystemInformation } from './dist/index.mjs';

console.log('🧪 Testing SSG-WSG Funding Examples...\n');

try {
  // Test system information function
  getSystemInformation();
  
  console.log('\n✅ Examples test completed successfully!');
} catch (error) {
  console.error('\n❌ Test failed:', error);
  process.exit(1);
}
