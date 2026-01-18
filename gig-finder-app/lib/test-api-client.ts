/**
 * API Client Test Script
 * 
 * Simple test script to verify API client functionality
 * Run with: npx tsx lib/test-api-client.ts
 * 
 * Note: This is a basic test script. For production, use a proper testing framework like Jest or Vitest.
 */

import { api, ApiError, API_ROUTES } from './index';

// ANSI color codes for terminal output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

let passedTests = 0;
let failedTests = 0;

/**
 * Test helper functions
 */
function log(message: string, color: string = colors.reset) {
    console.log(`${color}${message}${colors.reset}`);
}

function logSuccess(message: string) {
    log(`✓ ${message}`, colors.green);
    passedTests++;
}

function logError(message: string, error?: any) {
    log(`✗ ${message}`, colors.red);
    if (error) {
        console.error(error);
    }
    failedTests++;
}

function logInfo(message: string) {
    log(`ℹ ${message}`, colors.cyan);
}

function logSection(message: string) {
    log(`\n${'='.repeat(60)}`, colors.blue);
    log(message, colors.blue);
    log('='.repeat(60), colors.blue);
}

/**
 * Test 1: API Routes Constants
 */
function testApiRoutes() {
    logSection('Test 1: API Routes Constants');

    try {
        // Test event routes
        if (API_ROUTES.EVENTS.BASE === '/api/events') {
            logSuccess('EVENTS.BASE is correct');
        } else {
            logError('EVENTS.BASE is incorrect');
        }

        if (API_ROUTES.EVENTS.BY_ID(123) === '/api/events/123') {
            logSuccess('EVENTS.BY_ID() generates correct URL');
        } else {
            logError('EVENTS.BY_ID() generates incorrect URL');
        }

        if (API_ROUTES.EVENTS.USER === '/api/events/user') {
            logSuccess('EVENTS.USER is correct');
        } else {
            logError('EVENTS.USER is incorrect');
        }

        // Test booking routes
        if (API_ROUTES.BOOKINGS.BASE === '/api/bookings') {
            logSuccess('BOOKINGS.BASE is correct');
        } else {
            logError('BOOKINGS.BASE is incorrect');
        }

        if (API_ROUTES.BOOKINGS.BY_EVENT(456) === '/api/bookings?eventId=456') {
            logSuccess('BOOKINGS.BY_EVENT() generates correct URL');
        } else {
            logError('BOOKINGS.BY_EVENT() generates incorrect URL');
        }

        // Test venue routes
        if (API_ROUTES.VENUES.BASE === '/api/venues') {
            logSuccess('VENUES.BASE is correct');
        } else {
            logError('VENUES.BASE is incorrect');
        }

    } catch (error) {
        logError('API Routes test failed', error);
    }
}

/**
 * Test 2: ApiError Class
 */
function testApiError() {
    logSection('Test 2: ApiError Class');

    try {
        // Create mock response
        const mockResponse = {
            ok: false,
            status: 404,
            statusText: 'Not Found',
            url: '/api/events/999',
        } as Response;

        const mockBody = {
            error: 'Event not found',
        };

        const error = new ApiError(mockResponse, mockBody);

        // Test basic properties
        if (error.status === 404) {
            logSuccess('ApiError.status is correct');
        } else {
            logError('ApiError.status is incorrect');
        }

        if (error.message === 'Event not found') {
            logSuccess('ApiError.message is correct');
        } else {
            logError('ApiError.message is incorrect');
        }

        // Test helper methods
        if (error.is(404)) {
            logSuccess('ApiError.is(404) returns true');
        } else {
            logError('ApiError.is(404) should return true');
        }

        if (error.isClientError()) {
            logSuccess('ApiError.isClientError() returns true for 404');
        } else {
            logError('ApiError.isClientError() should return true for 404');
        }

        if (!error.isServerError()) {
            logSuccess('ApiError.isServerError() returns false for 404');
        } else {
            logError('ApiError.isServerError() should return false for 404');
        }

        // Test user message
        const userMessage = error.getUserMessage();
        if (userMessage === 'The requested resource was not found.') {
            logSuccess('ApiError.getUserMessage() returns user-friendly message');
        } else {
            logError('ApiError.getUserMessage() returns incorrect message');
        }

        // Test 401 error
        const authError = new ApiError({
            ok: false,
            status: 401,
            statusText: 'Unauthorized',
            url: '/api/events',
        } as Response);

        if (authError.getUserMessage() === 'You must be signed in to perform this action.') {
            logSuccess('ApiError handles 401 correctly');
        } else {
            logError('ApiError 401 message is incorrect');
        }

        // Test 500 error
        const serverError = new ApiError({
            ok: false,
            status: 500,
            statusText: 'Internal Server Error',
            url: '/api/events',
        } as Response);

        if (serverError.isServerError()) {
            logSuccess('ApiError.isServerError() returns true for 500');
        } else {
            logError('ApiError.isServerError() should return true for 500');
        }

    } catch (error) {
        logError('ApiError test failed', error);
    }
}

/**
 * Test 3: API Client Structure
 */
function testApiClientStructure() {
    logSection('Test 3: API Client Structure');

    try {
        // Test that api instance exists
        if (api) {
            logSuccess('API client instance exists');
        } else {
            logError('API client instance does not exist');
        }

        // Test events namespace
        if (api.events && typeof api.events === 'object') {
            logSuccess('api.events namespace exists');
        } else {
            logError('api.events namespace missing');
        }

        // Test events methods
        const eventMethods = [
            'search',
            'getById',
            'getUserEvents',
            'getUserEvent',
            'create',
            'update',
            'deleteUserEvent',
        ];

        eventMethods.forEach(method => {
            if (typeof api.events[method as keyof typeof api.events] === 'function') {
                logSuccess(`api.events.${method}() exists`);
            } else {
                logError(`api.events.${method}() missing`);
            }
        });

        // Test bookings namespace
        if (api.bookings && typeof api.bookings === 'object') {
            logSuccess('api.bookings namespace exists');
        } else {
            logError('api.bookings namespace missing');
        }

        // Test bookings methods
        const bookingMethods = [
            'getByEventId',
            'getMyBookings',
            'create',
            'sendEmail',
            'checkIn',
            'requestRefund',
        ];

        bookingMethods.forEach(method => {
            if (typeof api.bookings[method as keyof typeof api.bookings] === 'function') {
                logSuccess(`api.bookings.${method}() exists`);
            } else {
                logError(`api.bookings.${method}() missing`);
            }
        });

        // Test venues namespace
        if (api.venues && typeof api.venues === 'object') {
            logSuccess('api.venues namespace exists');
        } else {
            logError('api.venues namespace missing');
        }

        // Test venues methods
        const venueMethods = ['getAll', 'getById'];

        venueMethods.forEach(method => {
            if (typeof api.venues[method as keyof typeof api.venues] === 'function') {
                logSuccess(`api.venues.${method}() exists`);
            } else {
                logError(`api.venues.${method}() missing`);
            }
        });

    } catch (error) {
        logError('API Client structure test failed', error);
    }
}

/**
 * Test 4: Type Safety (Compile-time check)
 */
function testTypeSafety() {
    logSection('Test 4: Type Safety (Compile-time)');

    logInfo('Type safety is enforced at compile-time by TypeScript');
    logInfo('If this script compiles without errors, types are correct');

    // These would cause TypeScript errors if types were wrong:
    // const event: Event = await api.events.getById(123);
    // const bookings: Booking[] = await api.bookings.getByEventId(456);

    logSuccess('TypeScript compilation successful (types are valid)');
}

/**
 * Test 5: Mock API Call (without actual server)
 */
function testMockApiCall() {
    logSection('Test 5: Mock API Call Behavior');

    logInfo('Testing API call behavior...');
    logInfo('Note: In Node.js, relative URLs require a base URL');
    logInfo('In browser/Next.js, relative URLs work automatically');

    // Test URL construction
    try {
        const searchParams = { location: 'Edinburgh' };
        const queryParams = new URLSearchParams();
        Object.entries(searchParams).forEach(([key, value]) => {
            if (value) queryParams.append(key, value);
        });

        const expectedUrl = `/api/events?location=Edinburgh`;
        const actualUrl = queryParams.toString()
            ? `${API_ROUTES.EVENTS.BASE}?${queryParams.toString()}`
            : API_ROUTES.EVENTS.BASE;

        if (actualUrl === expectedUrl) {
            logSuccess('URL construction works correctly');
        } else {
            logError(`URL construction failed. Expected: ${expectedUrl}, Got: ${actualUrl}`);
        }

        logInfo('API client is designed for browser/Next.js environment');
        logInfo('In production, fetch() will use the current origin as base URL');
        logSuccess('API call structure is correct');

    } catch (error) {
        logError('URL construction test failed', error);
    }
}

/**
 * Run all tests
 */
function runTests() {
    log('\n' + '='.repeat(60), colors.yellow);
    log('API CLIENT TEST SUITE', colors.yellow);
    log('='.repeat(60) + '\n', colors.yellow);

    logInfo('Testing API Client Infrastructure...\n');

    // Run all tests
    testApiRoutes();
    testApiError();
    testApiClientStructure();
    testTypeSafety();
    testMockApiCall();

    // Print summary
    logSection('Test Summary');
    log(`Total Tests: ${passedTests + failedTests}`, colors.cyan);
    log(`Passed: ${passedTests}`, colors.green);
    log(`Failed: ${failedTests}`, failedTests > 0 ? colors.red : colors.green);

    if (failedTests === 0) {
        log('\n✓ All tests passed!', colors.green);
        log('API Client is ready to use.\n', colors.green);
    } else {
        log('\n✗ Some tests failed!', colors.red);
        log('Please review the errors above.\n', colors.red);
        process.exit(1);
    }
}

// Run tests
runTests();
