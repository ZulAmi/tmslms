/**
 * Simple test to verify examples work
 */

const exampleModule = require('../src/funding/examples');

console.log('✅ Testing getSystemInformation function...\n');

try {
  // Test if the function exists
  if (typeof exampleModule.getSystemInformation === 'function') {
    console.log('✅ getSystemInformation function is available');

    // Call the function
    exampleModule.getSystemInformation();
    console.log('\n🎉 Function executed successfully!');
  } else {
    console.log('❌ getSystemInformation function not found');
    console.log('Available exports:', Object.keys(exampleModule));
  }
} catch (error) {
  console.error('❌ Error:', error);
  process.exit(1);
}
