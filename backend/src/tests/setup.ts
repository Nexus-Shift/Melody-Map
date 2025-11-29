import { beforeAll, afterAll, afterEach } from 'vitest';

// Global test setup
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.SESSION_SECRET = 'test-session-secret';
});

// Clean up after each test
afterEach(() => {
  // Clear any mocks
});

// Global teardown
afterAll(() => {
  // Clean up resources
});

// Mock database connection if needed
export const mockDb = {
  query: () => Promise.resolve([]),
  insert: () => Promise.resolve({ id: 1 }),
  update: () => Promise.resolve({ affected: 1 }),
  delete: () => Promise.resolve({ affected: 1 })
};
