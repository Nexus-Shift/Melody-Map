# Test Suite Documentation

This document describes the comprehensive test suite for Melody Map.

## Frontend Tests (Vitest)

### Setup

The frontend uses Vitest with React Testing Library for component and integration testing.

**Configuration:**
- `vitest.config.ts` - Vitest configuration with React plugin and jsdom environment
- `src/tests/setup.ts` - Global test setup with cleanup and mocks

### Test Structure

```
src/tests/
├── setup.ts                         # Global test configuration
├── lib/
│   ├── mockData.test.ts            # Mock data validation tests
│   └── apiClient.test.ts           # API client utility tests
├── components/
│   ├── ComparisonPanel.test.tsx    # Multi-platform comparison panel tests
│   └── PlatformSelector.test.tsx   # Platform selection component tests
└── pages/
    └── Dashboard.test.tsx           # Dashboard integration tests
```

### Running Frontend Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:ui

# Run with coverage report
npm run test:coverage
```

### Test Coverage

#### 1. Mock Data Tests (`mockData.test.ts`)
- ✅ Feature detection for Deezer and Apple Music mock data
- ✅ Profile structure validation
- ✅ Track data validation (12 Deezer tracks, 5 Apple Music tracks)
- ✅ Artist data validation
- ✅ Statistics structure validation
- ✅ Data consistency (durations, IDs, required fields)
- ✅ Unique ID validation
- ✅ Required field presence checks

**Test Count:** 15 tests

#### 2. ComparisonPanel Tests (`ComparisonPanel.test.tsx`)
- ✅ Component rendering with multiple platforms
- ✅ Single platform display
- ✅ No platforms connected state
- ✅ Insights card rendering (3 insights)
- ✅ Advantages section display
- ✅ Platform badge rendering

**Test Count:** 6 tests

#### 3. PlatformSelector Tests (`PlatformSelector.test.tsx`)
- ✅ All three platform options rendering
- ✅ "Not connected" status display
- ✅ "Selected" status for active platform
- ✅ "Click to view" for connected but not selected platforms
- ✅ Connected platform styling
- ✅ Aggregated "all" platform selection

**Test Count:** 6 tests

#### 4. API Client Tests (`apiClient.test.ts`)
- ✅ Network error handling
- ✅ 401 unauthorized error handling
- ✅ 429 rate limit error handling
- ✅ Mock data feature detection
- ✅ Data transformation for Spotify, Deezer, Apple Music
- ✅ Token expiration detection
- ✅ Valid token validation
- ✅ Missing token handling

**Test Count:** 9 tests

#### 5. Dashboard Integration Tests (`Dashboard.test.tsx`)
- ✅ Loading state display
- ✅ Default aggregated view rendering
- ✅ Data fetching for authenticated platforms
- ✅ Tab navigation (Platform View, Stats, Insights)
- ✅ Default tab content
- ✅ Platform card display (Spotify, Deezer, Apple Music)
- ✅ Connected status indicators
- ✅ Top tracks display
- ✅ Top artists display
- ✅ Empty data handling
- ✅ API error handling
- ✅ Authentication failure handling
- ✅ Mock data integration for Deezer
- ✅ Mock data integration for Apple Music

**Test Count:** 14 tests

---

## Backend Tests (Jest)

### Setup

The backend uses Jest with Supertest for API endpoint testing.

**Configuration:**
- `jest.config.json` - Jest configuration
- `backend/src/tests/setup.ts` - Global test setup

### Test Structure

```
backend/src/tests/
├── setup.ts                                    # Global test configuration
└── services/
    ├── deezerTokenRefresh.test.ts             # Token refresh logic tests
    └── deezerApiService.test.ts               # Deezer API service tests
```

### Running Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage
```

### Test Coverage

#### 1. Deezer Token Refresh Tests (`deezerTokenRefresh.test.ts`)
- ✅ Expired token detection
- ✅ Valid token validation
- ✅ Token expiring soon detection (within 5 minutes)
- ✅ Token refresh with valid refresh token
- ✅ Invalid refresh token handling
- ✅ Network error handling during refresh
- ✅ Expiration time calculation from expires_in
- ✅ Zero expires_in handling
- ✅ Very long expiration times (30 days)
- ✅ Token storage with all required fields
- ✅ Token structure validation
- ✅ Concurrent refresh prevention
- ✅ Transient error retry logic
- ✅ Max retries failure handling

**Test Count:** 14 tests

#### 2. Deezer API Service Tests (`deezerApiService.test.ts`)
- ✅ User profile URL construction
- ✅ Top tracks URL construction
- ✅ Top artists URL construction
- ✅ Query parameter addition
- ✅ User profile data transformation
- ✅ Track data transformation
- ✅ Artist data transformation
- ✅ 401 unauthorized error handling
- ✅ 403 forbidden error handling
- ✅ 429 rate limit error handling
- ✅ Network error handling
- ✅ Timeout error handling
- ✅ Paginated response handling
- ✅ Last page detection
- ✅ Authorization header inclusion
- ✅ User-Agent header inclusion
- ✅ Track response structure validation
- ✅ Artist response structure validation
- ✅ Missing optional fields handling

**Test Count:** 19 tests

---

## Total Test Coverage Summary

### Frontend
- **Total Tests:** 50 tests
- **Test Files:** 5
- **Coverage Areas:**
  - Mock data validation and consistency
  - Component rendering and interaction
  - API error handling and data transformation
  - Dashboard integration and user flows
  - Multi-platform support (Spotify, Deezer, Apple Music)

### Backend
- **Total Tests:** 33 tests
- **Test Files:** 2
- **Coverage Areas:**
  - Token management and refresh logic
  - API service integration
  - Error handling and recovery
  - Data transformation
  - Request/response validation

### Grand Total: 83 Tests

---

## Key Testing Features

### 1. **Mock Data Integration**
- Comprehensive mock data for Deezer (12 tracks, 5 artists)
- Complete mock data for Apple Music (5 tracks, 5 artists)
- Feature detection functions tested
- Data consistency validation

### 2. **Error Handling**
- Network errors
- Authentication failures (401)
- Authorization errors (403)
- Rate limiting (429)
- Token expiration and refresh

### 3. **Multi-Platform Support**
- Spotify (real API)
- Deezer (real + mock)
- Apple Music (mock only)
- Aggregated "all platforms" view

### 4. **Component Testing**
- React component rendering
- User interaction simulation
- State management
- Conditional rendering
- Error boundaries

### 5. **Integration Testing**
- Full dashboard flow
- API client integration
- Mock data switching
- Platform selection and switching
- Tab navigation

---

## Test Conventions

### Naming
- Test files: `*.test.ts` or `*.test.tsx`
- Describe blocks: Feature or component name
- Test cases: "should [expected behavior]"

### Structure
```typescript
describe('ComponentName', () => {
  describe('Feature Category', () => {
    it('should do something specific', () => {
      // Arrange
      const input = setupTestData();
      
      // Act
      const result = performAction(input);
      
      // Assert
      expect(result).toBe(expectedValue);
    });
  });
});
```

### Best Practices
1. **Isolation:** Each test should be independent
2. **Clarity:** Test names describe what they verify
3. **Coverage:** Test happy paths AND error cases
4. **Mocking:** Mock external dependencies (APIs, database)
5. **Cleanup:** Clean up after each test (beforeEach/afterEach)

---

## Continuous Integration

### GitHub Actions (Recommended)

```yaml
name: Tests

on: [push, pull_request]

jobs:
  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm test

  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: cd backend && npm install
      - run: cd backend && npm test
```

---

## Future Test Additions

### Frontend
- [ ] User profile component tests
- [ ] Settings page tests
- [ ] Chart rendering tests (recharts integration)
- [ ] Theme toggle tests
- [ ] Avatar upload tests
- [ ] Authentication flow tests

### Backend
- [ ] Spotify API service tests
- [ ] Authentication middleware tests
- [ ] Database integration tests
- [ ] Rate limiting middleware tests
- [ ] File upload tests (Cloudinary)
- [ ] Session management tests

### End-to-End
- [ ] Full user journey tests (Playwright/Cypress)
- [ ] Multi-platform connection flow
- [ ] Dashboard data loading and display
- [ ] Platform switching
- [ ] Error state handling

---

## Troubleshooting

### Common Issues

1. **Import errors:**
   - Ensure all dependencies are installed: `npm install`
   - Check `tsconfig.json` path aliases

2. **Mock data not loading:**
   - Verify feature detection functions
   - Check environment setup

3. **Tests timing out:**
   - Increase timeout in vitest/jest config
   - Check for unresolved promises

4. **React rendering errors:**
   - Ensure `@testing-library/react` is installed
   - Wrap components in necessary providers (Router, Theme)

---

## Contributing

When adding new features:

1. **Write tests first** (TDD approach)
2. **Test both success and failure cases**
3. **Update this documentation**
4. **Ensure >80% code coverage**
5. **Run full test suite before committing**

---

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Jest Documentation](https://jestjs.io/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
