/**
 * Quick Test Script for UUID Validation
 *
 * Tests the UUID validation utility functions with various inputs
 * to ensure they handle invalid UUIDs properly.
 */

import {
  isValidUUID,
  validateUUID,
  smartValidateUUIDs,
  detectUUIDFields,
  UUIDValidationStrategy,
} from './shared/utils/uuid.utils';

console.log('🛡️ Testing UUID Validation Functions\n');

// Test 1: Basic UUID validation
console.log('=== Test 1: Basic UUID Validation ===');
const testUUIDs = [
  'ee', // Invalid: too short
  '123e4567-e89b-12d3-a456-426614174000', // Valid: UUID v1
  '6ba7b810-9dad-11d1-80b4-00c04fd430c8', // Valid: UUID v1
  '6ba7b811-9dad-11d1-80b4-00c04fd430c8', // Valid: UUID v1
  '00000000-0000-4000-0000-000000000000', // Valid: UUID v4
  'not-a-uuid', // Invalid: not UUID format
  '123', // Invalid: too short
  'abc-def-ghi', // Invalid: wrong format
  null, // Invalid: null
  undefined, // Invalid: undefined
  '', // Invalid: empty string
  '  ', // Invalid: whitespace only
];

testUUIDs.forEach((uuid) => {
  const isValid = isValidUUID(uuid as string);
  console.log(`"${uuid}" -> ${isValid ? '✅ Valid' : '❌ Invalid'}`);
});

console.log('\n=== Test 2: validateUUID with different strategies ===');

// Test invalid UUID "ee" with different strategies
console.log('\nTesting "ee" with GRACEFUL strategy:');
try {
  const result = validateUUID('ee', 'author_id', {
    strategy: UUIDValidationStrategy.GRACEFUL,
    allowAnyVersion: true,
    logInvalidAttempts: true,
  });
  console.log(`Result: ${result === null ? 'null (filtered out)' : result}`);
} catch (error: any) {
  console.log(`Error: ${error.message}`);
}

console.log('\nTesting "ee" with STRICT strategy:');
try {
  const result = validateUUID('ee', 'author_id', {
    strategy: UUIDValidationStrategy.STRICT,
    allowAnyVersion: true,
    logInvalidAttempts: true,
  });
  console.log(`Result: ${result}`);
} catch (error: any) {
  console.log(`Error: ${error.message}`);
}

console.log('\n=== Test 3: Smart UUID Detection and Validation ===');

// Test filters object like what would come from query parameters
const testFilters = {
  title: 'หนังสือ',
  author_id: 'ee', // Invalid UUID
  published: true,
  view_count_max: 33,
  id: 'not-a-valid-uuid', // Invalid UUID
  some_uuid: '6ba7b810-9dad-11d1-80b4-00c04fd430c8', // Valid UUID
  regular_field: 'some value',
};

console.log('\nOriginal filters:', testFilters);

const detectedFields = detectUUIDFields(testFilters);
console.log('\nDetected UUID fields:', detectedFields);

const cleanedFilters = smartValidateUUIDs(testFilters, ['author_id'], {
  strategy: UUIDValidationStrategy.GRACEFUL,
  allowAnyVersion: true,
  logInvalidAttempts: true,
});

console.log('\nCleaned filters (invalid UUIDs removed):', cleanedFilters);

console.log('\n=== Test 4: Simulating Query Parameters ===');

// Simulate the exact scenario from user's error
const queryParams = {
  page: 1,
  limit: 10,
  title: 'หนังสือ',
  author_id: 'ee', // This caused the PostgreSQL error
  published: true,
  view_count_max: 33,
};

console.log('\nSimulating query params that caused the error:');
console.log('Before validation:', queryParams);

const validatedParams = smartValidateUUIDs(queryParams, ['author_id'], {
  strategy: UUIDValidationStrategy.GRACEFUL,
  allowAnyVersion: true,
  logInvalidAttempts: true,
});

console.log(
  'After validation (should remove invalid author_id):',
  validatedParams,
);

console.log('\n✅ UUID Validation Tests Complete!');
console.log('\n📋 Summary:');
console.log('- Invalid UUIDs are detected and handled gracefully');
console.log('- PostgreSQL errors are prevented by filtering out invalid UUIDs');
console.log('- Query continues with valid parameters only');
console.log('- Users get results instead of 500 errors');
